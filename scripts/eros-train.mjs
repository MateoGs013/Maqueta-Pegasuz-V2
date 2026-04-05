import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFile } from 'node:child_process'
import {
  parseArgs,
  readJson,
  readText,
  ensureDir,
  writeJson,
  out,
  fail,
  today,
} from './eros-utils.mjs'

// ---------------------------------------------------------------------------
// eros-train.mjs — Training System V2
//
// Three modes, minimal friction:
//
//   correct  — automatic: detect manual edits via git diff → learn
//   review   — post-project: smart highlight of 3-5 sections, bulk approve rest
//   study    — reference: analyze a URL → learn from it
//   impact   — show what training has changed
//
// The old init/ingest/rate/calibrate/auto are gone.
// ---------------------------------------------------------------------------

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const callScript = (script, args) => new Promise((resolve, reject) => {
  const p = path.join(__dirname, script)
  execFile('node', [p, ...args], { cwd: __dirname, timeout: 60000 }, (err, stdout, stderr) => {
    if (err) { reject(new Error(stderr || err.message)); return }
    try { resolve(JSON.parse(stdout)) } catch { resolve({ raw: stdout }) }
  })
})

const callMemory = (args) => callScript('eros-memory.mjs', args)

const inferSectionType = (name) => {
  const n = name.toLowerCase()
  if (n.includes('hero')) return 'hero'
  if (n.includes('cta')) return 'cta'
  if (n.includes('footer')) return 'footer'
  if (n.includes('pricing')) return 'pricing'
  if (n.includes('testimonial')) return 'testimonial'
  if (n.includes('contact')) return 'contact'
  if (n.includes('work') || n.includes('project')) return 'portfolio'
  if (n.includes('about')) return 'about'
  if (n.includes('stat')) return 'stats'
  if (n.includes('service')) return 'services'
  return 'feature'
}

const findSections = async (project) => {
  const results = []
  const walk = async (dir, prefix = '') => {
    let entries
    try { entries = await fs.readdir(dir, { withFileTypes: true }) } catch { return }
    for (const e of entries) {
      if (e.isFile() && e.name.endsWith('.vue')) {
        results.push(prefix + e.name.replace('.vue', ''))
      } else if (e.isDirectory()) {
        await walk(path.join(dir, e.name), e.name + '/')
      }
    }
  }
  // Search multiple possible locations
  const searchDirs = [
    path.join(project, 'src', 'components', 'sections'),
    path.join(project, 'src', 'pages'),
  ]
  for (const dir of searchDirs) {
    await walk(dir)
  }
  // If still empty, try src/components/ (broader search)
  if (results.length === 0) {
    await walk(path.join(project, 'src', 'components'))
  }
  return results
}

// ---------------------------------------------------------------------------
// Calibration (shared)
// ---------------------------------------------------------------------------

const updateCalibration = async (slug, sections) => {
  const memDir = path.join(__dirname, '..', '.claude', 'memory', 'design-intelligence')
  const calPath = path.join(memDir, 'training-calibration.json')
  const cal = (await readJson(calPath)) || { projects: [], globalBias: 0, thresholdAdjustment: 0 }

  const scored = sections.filter(s => s.brainScore != null && s.userRating != null)
  if (scored.length === 0) return

  const mapped = scored.map(s => ({
    name: s.name,
    brainScore: s.brainScore,
    userRating: s.userRating,
    delta: parseFloat((s.userRating - s.brainScore).toFixed(2)),
  }))

  const avgDelta = mapped.reduce((sum, s) => sum + s.delta, 0) / mapped.length

  cal.projects = cal.projects.filter(p => p.slug !== slug)
  cal.projects.push({
    slug,
    date: today(),
    sections: mapped,
    avgDelta: parseFloat(avgDelta.toFixed(2)),
    bias: avgDelta > 0.3 ? `underscores by ${avgDelta.toFixed(1)}` :
          avgDelta < -0.3 ? `overscores by ${Math.abs(avgDelta).toFixed(1)}` : 'calibrated',
  })

  if (cal.projects.length > 0) {
    const allDeltas = cal.projects.map(p => p.avgDelta)
    cal.globalBias = parseFloat((allDeltas.reduce((a, b) => a + b, 0) / allDeltas.length).toFixed(2))
    cal.thresholdAdjustment = parseFloat((cal.globalBias * 0.5).toFixed(2))
  }

  await writeJson(calPath, cal)
  return cal
}

// ---------------------------------------------------------------------------
// correct — Automatic learning from git diffs
// ---------------------------------------------------------------------------

const cmdCorrect = async (args) => {
  const project = args.project
  if (!project) fail('--project is required')

  const slug = path.basename(project)
  let detectResult = null

  // Run eros-detect-changes.mjs
  try {
    detectResult = await callScript('eros-detect-changes.mjs', [
      '--project', project,
      ...(args['dry-run'] ? ['--dry-run'] : []),
    ])
  } catch (err) {
    // Not a git repo or no changes — that's fine
    detectResult = { changes: [], error: err.message }
  }

  const changes = detectResult?.changes || []

  // Get memory stats before and after
  const statsBefore = await callMemory(['stats'])

  out({
    project: slug,
    mode: 'correct',
    changesDetected: changes.length,
    memoryWritten: detectResult?.memoryWrites || 0,
    dryRun: !!args['dry-run'],
    changes: changes.slice(0, 10),
    dataPointsBefore: statsBefore?.totalDataPoints || 0,
  })
}

// ---------------------------------------------------------------------------
// review — Smart post-project review
// ---------------------------------------------------------------------------

const cmdReview = async (args) => {
  const project = args.project
  if (!project) fail('--project is required')

  const slug = path.basename(project)
  const brainDir = path.join(project, '.brain')

  // Read scorecard
  const scorecard = await readJson(path.join(brainDir, 'reports', 'quality', 'scorecard.json'))
  const manifest = await readJson(path.join(brainDir, 'observer', 'localhost', 'manifest.json'))
  const observerScore = scorecard?.observerScore || scorecard?.finalScore || 0
  const finalScore = scorecard?.finalScore || 0
  const excellence = manifest?.excellenceSignals || {}

  // Find all sections
  const allSections = await findSections(project)
  if (allSections.length === 0) fail('No sections found in src/components/sections/')

  // If --feedback provided, process it
  if (args.feedback) {
    return processReviewFeedback(project, slug, allSections, observerScore, args.feedback)
  }

  // Otherwise, generate the smart review

  // Detect which sections the user edited (git diff)
  let editedSections = []
  try {
    const detectResult = await callScript('eros-detect-changes.mjs', ['--project', project, '--dry-run'])
    editedSections = (detectResult?.changes || []).map(c => c.section).filter(Boolean)
  } catch { /* no git or no changes */ }

  // Build section list with metadata
  const sections = allSections.map(name => {
    const sectionName = name.includes('/') ? name.split('/').pop() : name
    return {
      name: sectionName,
      fullPath: name,
      type: inferSectionType(sectionName),
      brainScore: observerScore,
      edited: editedSections.includes(sectionName),
    }
  })

  // Smart selection: pick 3-5 sections that need attention
  const highlights = []
  const bulk = []

  // 1. Sections the user edited — most valuable feedback
  const edited = sections.filter(s => s.edited)
  highlights.push(...edited.map(s => ({ ...s, reason: 'You edited this section' })))

  // 2. New section types (types with < 3 entries in memory)
  const memStats = await callMemory(['stats'])
  const knownPatterns = memStats?.sectionPatterns || 0
  if (knownPatterns < 30) {
    // If memory is small, highlight novel types
    const typeCounts = {}
    sections.forEach(s => { typeCounts[s.type] = (typeCounts[s.type] || 0) + 1 })
    const novelTypes = Object.entries(typeCounts).filter(([, c]) => c <= 1).map(([t]) => t)
    const novel = sections.filter(s => novelTypes.includes(s.type) && !s.edited).slice(0, 2)
    highlights.push(...novel.map(s => ({ ...s, reason: `New section type: ${s.type}` })))
  }

  // Cap highlights at 5
  const highlightNames = new Set(highlights.slice(0, 5).map(h => h.name))
  sections.forEach(s => {
    if (!highlightNames.has(s.name)) bulk.push(s)
  })

  // Questions the brain wants answered
  const questions = []
  if (excellence.motion === 'WEAK') questions.push('Motion scored WEAK — do you think the animations are sufficient?')
  if (excellence.composition === 'WEAK' || excellence.composition === 'MEDIUM') {
    questions.push('Composition is ' + excellence.composition + ' — is the layout variety acceptable?')
  }

  out({
    project: slug,
    mode: 'review',
    observerScore,
    finalScore,
    excellence,
    highlights: highlights.slice(0, 5),
    bulkCount: bulk.length,
    bulkAvgScore: observerScore,
    questions,
    totalSections: allSections.length,
    instruction: 'Respond with --feedback JSON or let the CEO translate your natural language to feedback.',
  })
}

const processReviewFeedback = async (project, slug, allSections, observerScore, feedbackRaw) => {
  let feedback
  try { feedback = JSON.parse(feedbackRaw) } catch { fail('--feedback must be valid JSON') }

  const approved = feedback.approve || []
  const corrections = feedback.corrections || []
  const rules = feedback.rules || []
  const bulkApprove = feedback.bulkApprove !== false // default true
  const overall = feedback.overall || 'good'

  const statsBefore = await callMemory(['stats'])
  let memoryUpdates = 0

  // Process approved sections — confirm brain score as user rating
  const approvedSet = new Set(approved)
  const correctedSet = new Set(corrections.map(c => c.section))

  for (const name of allSections) {
    const sectionName = name.includes('/') ? name.split('/').pop() : name
    const isApproved = approvedSet.has(sectionName)
    const correction = corrections.find(c => c.section === sectionName)
    const isBulk = !isApproved && !correction && bulkApprove

    // Approved/bulk sections: only update calibration (no empty patterns).
    // Patterns are learned during project BUILD (with real layout/motion/technique),
    // not during review. Writing empty entries here was polluting memory.

    if (correction) {
      // Corrections: write as revision pattern (this IS useful learning)
      if (correction.feedback) {
        try {
          await callMemory(['learn', '--event', 'user_change', '--data', JSON.stringify({
            project: slug,
            phase: 'Training review',
            whatChanged: `${sectionName}: ${correction.feedback}`,
            original: `Brain score ${observerScore}`,
            revised: correction.feedback,
            pattern: correction.feedback,
          })])
          memoryUpdates++
        } catch { /* non-fatal */ }
      }
    }
  }

  // Process new rules
  for (const rule of rules) {
    if (!rule || rule.length < 5) continue
    try {
      await callMemory(['learn', '--event', 'rule_discovered', '--data', JSON.stringify({
        text: rule,
        source: `review/${slug}`,
      })])
      memoryUpdates++
    } catch { /* non-fatal */ }
  }

  // Calibrate — ONLY sections with explicit user feedback (corrections).
  // Bulk-approved sections have no real user signal — writing fake +0.3 delta
  // for all of them produces meaningless calibration data.
  const calSections = corrections
    .filter(c => c.feedback || c.severity)
    .map(c => ({
      name: c.section,
      brainScore: observerScore,
      userRating: Math.max(1, observerScore + (c.severity === 'bad' ? -2 : c.severity === 'needs-work' ? -0.5 : 0)),
    }))
  const cal = calSections.length > 0 ? await updateCalibration(slug, calSections) : null

  // Promote rules
  let promotions = []
  try { promotions = (await callMemory(['promote'])).promoted || [] } catch {}

  // Get stats after
  const statsAfter = await callMemory(['stats'])

  out({
    project: slug,
    mode: 'review-processed',
    sectionsApproved: approved.length + (bulkApprove ? allSections.length - approved.length - corrections.length : 0),
    sectionsCorrected: corrections.length,
    rulesAdded: rules.length,
    memoryUpdates,
    rulesPromoted: promotions.length,
    calibration: {
      before: statsBefore?.calibration?.globalBias || 0,
      after: cal?.globalBias || 0,
    },
    memory: {
      before: statsBefore?.totalDataPoints || 0,
      after: statsAfter?.totalDataPoints || 0,
      growth: (statsAfter?.totalDataPoints || 0) - (statsBefore?.totalDataPoints || 0),
    },
  })
}

// ---------------------------------------------------------------------------
// study — Learn from a reference URL
// ---------------------------------------------------------------------------

const cmdStudy = async (args) => {
  const url = args.url
  if (!url) fail('--url is required')

  const statsBefore = await callMemory(['stats'])

  // If --feedback provided, go straight to learning
  if (args.feedback) {
    // Find existing analysis
    const maquetaDir = path.resolve(__dirname, '..')
    const slug = url.replace(/https?:\/\//, '').replace(/[^a-z0-9]+/gi, '-').replace(/-+$/, '')
    const analysisPath = path.join(maquetaDir, '_training-refs', slug, 'analysis.json')
    const analysis = await readJson(analysisPath)

    if (!analysis) fail(`No analysis found for ${url}. Run without --feedback first to analyze.`)

    // Process feedback
    let feedback
    try { feedback = JSON.parse(args.feedback) } catch { fail('--feedback must be valid JSON') }

    return processStudyFeedback(analysis, feedback, statsBefore)
  }

  // Step 1: Analyze
  process.stderr.write(`Analyzing ${url}...\n`)

  let sessionResult
  try {
    sessionResult = await callScript('eros-train-reference.mjs', ['session', '--url', url])
  } catch (err) {
    fail(`Reference analysis failed: ${err.message}`)
  }

  out({
    mode: 'study',
    url,
    status: 'analyzed',
    analysis: sessionResult.analysis || {},
    analysisPath: sessionResult.analysisPath,
    instruction: 'Tell the CEO what you liked about this site. Or provide --feedback JSON.',
  })
}

const processStudyFeedback = async (analysis, feedback, statsBefore) => {
  let memoryUpdates = 0

  // Learn via eros-train-reference.mjs learn
  try {
    const result = await callScript('eros-train-reference.mjs', [
      'learn',
      '--analysis', analysis.refDir ? path.join(analysis.refDir, 'analysis.json') : '',
      '--ratings', JSON.stringify({
        overall: feedback.overall || feedback.score || 8,
        mood: feedback.mood || 'reference',
        techniques: feedback.techniques || {},
        fontNote: feedback.fontNote || '',
        paletteNote: feedback.paletteNote || '',
        primarySectionType: feedback.primaryType || 'hero',
        ...feedback,
      }),
    ])
    memoryUpdates = result.totalWrites || 0
  } catch (err) {
    process.stderr.write(`Warning: reference learn failed: ${err.message}\n`)
  }

  // Learn liked techniques as high-confidence
  for (const item of (feedback.liked || [])) {
    try {
      await callMemory(['learn', '--event', 'rule_discovered', '--data', JSON.stringify({
        text: `${item} (from ${analysis.url || 'reference'}) works well`,
        source: `study/${analysis.slug || 'ref'}`,
      })])
      memoryUpdates++
    } catch { /* non-fatal */ }
  }

  const statsAfter = await callMemory(['stats'])

  out({
    mode: 'study-processed',
    url: analysis.url,
    memoryUpdates,
    memory: {
      before: statsBefore?.totalDataPoints || 0,
      after: statsAfter?.totalDataPoints || 0,
      growth: (statsAfter?.totalDataPoints || 0) - (statsBefore?.totalDataPoints || 0),
    },
  })
}

// ---------------------------------------------------------------------------
// impact — Show what training has changed
// ---------------------------------------------------------------------------

const cmdImpact = async () => {
  const stats = await callMemory(['stats'])
  const memDir = path.join(__dirname, '..', '.claude', 'memory', 'design-intelligence')
  const cal = await readJson(path.join(memDir, 'training-calibration.json'))
  const rules = await readJson(path.join(memDir, 'rules.json'))

  // Compute threshold examples
  const thresholds = {}
  for (const type of ['hero', 'feature', 'cta', 'portfolio', 'pricing', 'contact']) {
    try {
      const t = await callMemory(['threshold', '--section-type', type])
      thresholds[type] = { min: t.scoreMinimum, avg: t.historicalAvg, data: t.dataPoints }
    } catch { /* skip */ }
  }

  // Recent calibration trend
  const projects = (cal?.projects || []).slice(-5)
  const trend = projects.map(p => ({
    project: p.slug,
    date: p.date,
    bias: p.avgDelta,
    verdict: p.bias,
  }))

  // Rules lifecycle
  const promoted = (rules?.rules || []).filter(r => r.status === 'PROMOTED')
  const candidates = (rules?.rules || []).filter(r => r.status === 'CANDIDATE')

  out({
    mode: 'impact',
    memory: {
      totalDataPoints: stats?.totalDataPoints || 0,
      signatures: stats?.signatures?.approved || 0,
      patterns: stats?.sectionPatterns || 0,
      techniques: stats?.techniqueScores || 0,
      revisions: stats?.revisionPatterns || 0,
      fonts: stats?.fontPairings?.works || 0,
      palettes: stats?.colorPalettes?.works || 0,
    },
    calibration: {
      globalBias: cal?.globalBias || 0,
      thresholdAdjustment: cal?.thresholdAdjustment || 0,
      accuracy: cal?.globalBias != null ? `${Math.max(0, 100 - Math.abs(cal.globalBias) * 10).toFixed(0)}%` : 'unknown',
      trend,
    },
    thresholds,
    rules: {
      promoted: promoted.length,
      candidates: candidates.length,
      promotedList: promoted.map(r => r.text),
      candidateList: candidates.map(r => `${r.text} (${r.validations}/3 validations)`),
    },
  })
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const main = async () => {
  const rawArgs = process.argv.slice(2)
  const subcommand = rawArgs[0]
  const args = parseArgs(rawArgs.slice(1))

  const commands = {
    correct: cmdCorrect,
    review: cmdReview,
    study: cmdStudy,
    impact: cmdImpact,
  }

  const handler = commands[subcommand]
  if (!handler) {
    fail(
      `Unknown subcommand: ${subcommand}\n\n` +
      `Usage: node eros-train.mjs <correct|review|study|impact> [options]\n\n` +
      `  correct  --project <path>              Auto-learn from git diffs\n` +
      `  review   --project <path>              Smart review (highlights 3-5 sections)\n` +
      `  review   --project <path> --feedback '{ "approve": [...], "corrections": [...], "rules": [...] }'\n` +
      `  study    --url <url>                   Learn from a reference site\n` +
      `  study    --url <url> --feedback '{ "liked": [...], "overall": 9 }'\n` +
      `  impact                                 Show training effects\n`
    )
  }

  await handler(args)
}

main().catch((err) => {
  process.stderr.write(`Fatal: ${err.message}\n`)
  process.exit(1)
})
