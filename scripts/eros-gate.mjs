import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFile } from 'node:child_process'
import {
  parseArgs,
  exists,
  ensureDir,
  readJson,
  readText,
  writeJson,
  out,
  fail,
} from './lib/utils.mjs'

// ---------------------------------------------------------------------------
// eros-gate.mjs — Gate Engine
//
// Evaluates pre/post conditions for every task.
// post and designer subcommands write a gate result file to .brain/gates/{task}.json
// so that eros-state.mjs advance can verify the gate was run.
//
// Subcommands:
//   pre        — verify preconditions before starting a task
//   post       — evaluate outputs against thresholds after task completes
//   designer   — 12-point validation of designer output
//   completion — Phase 5 hard-stop gate (5 mandatory checks)
// ---------------------------------------------------------------------------

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const isNonEmpty = async (filePath) => {
  const content = await readText(filePath)
  return content !== null && content.trim().length > 0
}

const writeGateResult = async (project, taskId, result) => {
  const gateDir = path.join(project, '.brain', 'gates')
  await ensureDir(gateDir)
  const fileName = taskId.replace(/\//g, '--') + '.json'
  const filePath = path.join(gateDir, fileName)
  await writeJson(filePath, result)
}

// Call eros-memory.mjs to get dynamic threshold
const getThreshold = (sectionType) => {
  return new Promise((resolve) => {
    const script = path.join(__dirname, 'eros-memory.mjs')
    execFile(
      process.execPath,
      [script, 'threshold', '--section-type', sectionType],
      { cwd: __dirname },
      (err, stdout) => {
        if (err) {
          resolve({ scoreMinimum: 7.0, isDefault: true })
          return
        }
        try {
          resolve(JSON.parse(stdout))
        } catch {
          resolve({ scoreMinimum: 7.0, isDefault: true })
        }
      }
    )
  })
}

// ---------------------------------------------------------------------------
// Task prefix → section type mapping
// ---------------------------------------------------------------------------

const extractSectionType = (taskId) => {
  // build/S-Hero → hero, build/S-FeaturedWork → featured-work
  const match = taskId.match(/S-(.+)/)
  if (!match) return null
  return match[1]
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase()
}

// ---------------------------------------------------------------------------
// Pre-condition checks per task prefix
// ---------------------------------------------------------------------------

const preChecks = {
  'setup/identity': async (project) => [
    { name: 'project dir exists', pass: await exists(project) },
  ],

  'setup/create-dir': async (project) => [
    { name: 'identity.md exists', pass: await isNonEmpty(path.join(project, '.brain', 'identity.md')) },
  ],

  'setup/capture-refs': async (project) => [
    { name: 'identity.md exists', pass: await isNonEmpty(path.join(project, '.brain', 'identity.md')) },
  ],

  'setup/analyze-refs': async (project) => [
    { name: '_ref-captures/ exists', pass: await exists(path.join(project, '_ref-captures')) },
  ],

  'setup/observatory': async (project) => [
    { name: 'reference-analysis.md exists', pass: await isNonEmpty(path.join(project, 'docs', 'reference-analysis.md')) },
  ],

  'design/brief': async (project) => [
    { name: 'identity.md exists', pass: await isNonEmpty(path.join(project, '.brain', 'identity.md')) },
  ],

  'design/tokens': async (project) => [
    { name: 'context/design-brief.md exists', pass: await isNonEmpty(path.join(project, '.brain', 'context', 'design-brief.md')) },
  ],

  'design/pages': async (project) => [
    { name: 'DESIGN.md exists', pass: await isNonEmpty(path.join(project, 'DESIGN.md')) },
    { name: 'docs/tokens.md exists', pass: await isNonEmpty(path.join(project, 'docs', 'tokens.md')) },
  ],

  'review/creative': async (project) => [
    { name: 'docs/tokens.md exists', pass: await isNonEmpty(path.join(project, 'docs', 'tokens.md')) },
    { name: 'docs/pages/ has files', pass: await exists(path.join(project, 'docs', 'pages')) },
  ],

  'setup/scaffold': async (project) => [
    { name: 'DESIGN.md exists', pass: await isNonEmpty(path.join(project, 'DESIGN.md')) },
  ],

  'setup/gen-tokens': async (project) => [
    { name: 'docs/tokens.md exists', pass: await isNonEmpty(path.join(project, 'docs', 'tokens.md')) },
  ],

  'build/atmosphere': async (project) => [
    { name: 'context/atmosphere.md exists', pass: await isNonEmpty(path.join(project, '.brain', 'context', 'atmosphere.md')) },
  ],

  'context/motion': async (project) => [
    { name: 'DESIGN.md exists', pass: await isNonEmpty(path.join(project, 'DESIGN.md')) },
    { name: 'docs/tokens.md exists', pass: await isNonEmpty(path.join(project, 'docs', 'tokens.md')) },
  ],

  'polish/motion': async (project) => [
    { name: 'context/motion.md exists', pass: await isNonEmpty(path.join(project, '.brain', 'context', 'motion.md')) },
  ],

  'integrate/router': async (project) => [
    { name: 'src/ exists', pass: await exists(path.join(project, 'src')) },
  ],

  'integrate/views': async (project) => [
    { name: 'src/router exists', pass: await exists(path.join(project, 'src', 'router')) },
  ],

  'integrate/app': async (project) => [
    { name: 'src/App.vue exists', pass: await exists(path.join(project, 'src', 'App.vue')) },
  ],

  'integrate/seo': async (project) => [
    { name: 'identity.md exists', pass: await isNonEmpty(path.join(project, '.brain', 'identity.md')) },
  ],

  'review/observer': async (project) => [
    { name: 'sections components exist', pass: await exists(path.join(project, 'src', 'components', 'sections')) },
  ],

  'review/observer-final': async (project) => [
    { name: 'src/App.vue exists', pass: await exists(path.join(project, 'src', 'App.vue')) },
  ],

  'review/final': async (project) => [
    { name: 'observer final ran', pass: await exists(path.join(project, '.brain', 'observer', 'final')) },
  ],

  'review/sections': async (project) => [
    { name: 'observer analysis exists', pass: await isNonEmpty(path.join(project, '.brain', 'observer', 'localhost', 'analysis.md')) },
  ],

  'cleanup/retrospective': async (project) => [
    { name: 'decisions.md exists', pass: await isNonEmpty(path.join(project, '.brain', 'decisions.md')) },
  ],

  'cleanup/promote-rules': async () => [
    { name: 'always passes', pass: true },
  ],

  'cleanup/delete-temp': async () => [
    { name: 'always passes', pass: true },
  ],
}

// Dynamic pre-checks for section tasks
const getSectionPreChecks = async (project, taskId) => {
  const sectionName = taskId.match(/S-[\w]+/)?.[0]
  if (!sectionName) return [{ name: 'valid section name', pass: false, detail: 'Cannot parse section name' }]

  if (taskId.startsWith('context/')) {
    return [
      { name: 'DESIGN.md exists', pass: await isNonEmpty(path.join(project, 'DESIGN.md')) },
      { name: 'docs/tokens.md exists', pass: await isNonEmpty(path.join(project, 'docs', 'tokens.md')) },
      { name: 'docs/pages/ has files', pass: await exists(path.join(project, 'docs', 'pages')) },
    ]
  }

  if (taskId.startsWith('build/')) {
    return [
      {
        name: `context/${sectionName}.md exists`,
        pass: await isNonEmpty(path.join(project, '.brain', 'context', `${sectionName}.md`)),
      },
    ]
  }

  if (taskId.startsWith('observe/')) {
    return [
      {
        name: `${sectionName}.vue exists`,
        pass: await exists(path.join(project, 'src', 'components', 'sections', `${sectionName}.vue`)),
      },
    ]
  }

  if (taskId.startsWith('evaluate/')) {
    return [
      {
        name: `reports/${sectionName}.md exists`,
        pass: await isNonEmpty(path.join(project, '.brain', 'reports', `${sectionName}.md`)),
      },
      {
        name: 'observer analysis exists',
        pass: await isNonEmpty(path.join(project, '.brain', 'observer', 'localhost', 'analysis.md')),
      },
    ]
  }

  return [{ name: 'unknown task type', pass: false }]
}

// ---------------------------------------------------------------------------
// Subcommands
// ---------------------------------------------------------------------------

const cmdPre = async (args) => {
  const project = args.project
  if (!project) fail('--project is required')
  const taskId = args.task
  if (!taskId) fail('--task is required')

  let conditions

  // Check if it's a section task (contains S-)
  if (taskId.match(/\/S-/)) {
    conditions = await getSectionPreChecks(project, taskId)
  } else {
    const checker = preChecks[taskId]
    if (!checker) {
      // Unknown task — pass by default
      conditions = [{ name: 'no preconditions defined', pass: true }]
    } else {
      conditions = await checker(project)
    }
  }

  const allPassed = conditions.every((c) => c.pass)

  out({ pass: allPassed, task: taskId, conditions })
}

const cmdPost = async (args) => {
  const project = args.project
  if (!project) fail('--project is required')
  const taskId = args.task
  if (!taskId) fail('--task is required')

  const brainDir = path.join(project, '.brain')

  // Helper: output result AND write gate file
  const emitResult = async (result) => {
    await writeGateResult(project, taskId, result)
    out(result)
  }

  // For build/S-* tasks — evaluate against excellence standard
  if (taskId.startsWith('build/S-')) {
    const sectionName = taskId.replace('build/', '')
    const sectionType = extractSectionType(taskId) || 'unknown'

    // Get dynamic threshold
    const thresholdData = await getThreshold(sectionType)
    const scoreMinimum = thresholdData.scoreMinimum

    // Read builder report
    const reportPath = path.join(brainDir, 'reports', `${sectionName}.md`)
    const report = await readText(reportPath)

    if (!report) {
      await emitResult({
        pass: false,
        task: taskId,
        verdict: 'RETRY',
        score: null,
        threshold: scoreMinimum,
        reason: 'Builder report not found',
      })
      return
    }

    // Extract score from report
    const scoreMatch = report.match(/Score:\s*([\d.]+)/i)
    const score = scoreMatch ? parseFloat(scoreMatch[1]) : null

    // Extract excellence dimensions from builder report (self-assessment)
    const builderDimensions = {}
    const dimPattern = /\*\*(Composition|Depth|Typography|Motion|Craft|Signature)\*\*[:\s]+(\w+)/gi
    let dimMatch
    while ((dimMatch = dimPattern.exec(report)) !== null) {
      builderDimensions[dimMatch[1].toLowerCase()] = dimMatch[2].toUpperCase()
    }

    // Try to read observer output — independent quality signal that overrides
    // the builder's self-assessment when available
    const observerManifest = await readJson(path.join(brainDir, 'observer', 'localhost', 'manifest.json'))
    const observerDimensions = observerManifest?.excellenceSignals || {}
    let observerScore = null
    const observerScorecard = await readJson(path.join(brainDir, 'reports', 'quality', 'scorecard.json'))
    if (observerScorecard?.observerScore > 0) {
      observerScore = observerScorecard.observerScore
    }

    // Use observer dimensions when available (trusted), fall back to builder (self-report)
    const hasObserver = Object.keys(observerDimensions).length > 0 &&
      observerDimensions.composition && observerDimensions.composition !== 'undefined'
    const dimensions = {}
    for (const dim of ['composition', 'depth', 'typography', 'motion', 'craft']) {
      if (hasObserver && observerDimensions[dim]) {
        dimensions[dim] = observerDimensions[dim]
      } else if (builderDimensions[dim]) {
        dimensions[dim] = builderDimensions[dim]
      }
    }

    // Use the LOWER of builder score vs observer score (conservative)
    const effectiveScore = (observerScore !== null && score !== null)
      ? Math.min(score, observerScore)
      : score ?? observerScore

    // Check for WEAK dimensions
    const weakDimensions = Object.entries(dimensions)
      .filter(([, v]) => v === 'WEAK')
      .map(([k]) => k)

    // Check signature
    const hasSignature = /Signature[^:]*:.*\S/i.test(report)

    // Determine verdict
    let verdict = 'APPROVE'
    const reasons = []

    if (effectiveScore !== null && effectiveScore < scoreMinimum) {
      verdict = 'RETRY'
      reasons.push(`score ${effectiveScore} < threshold ${scoreMinimum}${observerScore !== null ? ` (observer: ${observerScore}, builder: ${score})` : ''}`)
    }

    if (weakDimensions.length >= 3) {
      verdict = 'FLAG'
      reasons.push(`3+ WEAK dimensions: ${weakDimensions.join(', ')}${hasObserver ? ' (from observer)' : ' (from builder self-report)'}`)
    } else if (weakDimensions.length > 0) {
      if (verdict !== 'FLAG') verdict = 'RETRY'
      reasons.push(`WEAK dimensions: ${weakDimensions.join(', ')}`)
    }

    if (!hasSignature) {
      if (verdict === 'APPROVE') verdict = 'RETRY'
      reasons.push('no signature element named')
    }

    await emitResult({
      pass: verdict === 'APPROVE',
      task: taskId,
      verdict,
      score: effectiveScore,
      builderScore: score,
      observerScore,
      threshold: scoreMinimum,
      thresholdDefault: thresholdData.isDefault,
      dimensions,
      dimensionSource: hasObserver ? 'observer' : 'builder-self-report',
      weakDimensions,
      hasSignature,
      reasons: reasons.length > 0 ? reasons : undefined,
    })
    return
  }

  // For design/tokens — check 12-point gate
  if (taskId === 'design/tokens') {
    const result = await runDesignerGate(project)
    await emitResult({
      pass: result.pass,
      task: taskId,
      verdict: result.pass ? 'APPROVE' : 'RETRY',
      score: `${result.score}/12`,
      details: result,
    })
    return
  }

  // For other tasks — check output exists and is non-empty
  const outputMap = {
    'setup/identity': '.brain/identity.md',
    'setup/create-dir': 'src',
    'design/brief': '.brain/context/design-brief.md',
    'design/pages': 'docs/pages',
    'setup/scaffold': 'src/main.js',
    'setup/gen-tokens': 'src/styles/tokens.css',
    'context/motion': '.brain/context/motion.md',
    'polish/motion': '.brain/reports/motion.md',
    'integrate/router': 'src/router/index.js',
    'integrate/views': 'src/views',
    'integrate/app': 'src/App.vue',
  }

  const outputPath = outputMap[taskId]
  if (outputPath) {
    const fullPath = path.join(project, outputPath)
    const outputExists = await exists(fullPath)
    await emitResult({
      pass: outputExists,
      task: taskId,
      verdict: outputExists ? 'APPROVE' : 'RETRY',
      reason: outputExists ? undefined : `Expected output not found: ${outputPath}`,
    })
    return
  }

  // Default: pass
  await emitResult({ pass: true, task: taskId, verdict: 'APPROVE' })
}

// ---------------------------------------------------------------------------
// Designer Gate — 12-point validation
// ---------------------------------------------------------------------------

const runDesignerGate = async (project) => {
  const checks = []
  let score = 0

  // 1. DESIGN.md exists and non-empty
  const designExists = await isNonEmpty(path.join(project, 'DESIGN.md'))
  checks.push({ name: 'DESIGN.md exists', pass: designExists })
  if (designExists) score++

  // 2. tokens.md exists
  const tokensExists = await isNonEmpty(path.join(project, 'docs', 'tokens.md'))
  checks.push({ name: 'tokens.md exists', pass: tokensExists })
  if (tokensExists) score++

  // 3. tokens.md has color tokens
  const tokensContent = tokensExists ? await readText(path.join(project, 'docs', 'tokens.md')) : ''
  const hasColors = /--color|--bg|--accent|canvas|palette/i.test(tokensContent)
  checks.push({ name: 'color tokens defined', pass: hasColors })
  if (hasColors) score++

  // 4. tokens.md has typography tokens
  const hasTypo = /--font|--fs|--fw|font-family|font-size/i.test(tokensContent)
  checks.push({ name: 'typography tokens defined', pass: hasTypo })
  if (hasTypo) score++

  // 5. tokens.md has spacing tokens
  const hasSpacing = /--space|--gap|--padding|spacing/i.test(tokensContent)
  checks.push({ name: 'spacing tokens defined', pass: hasSpacing })
  if (hasSpacing) score++

  // 6. No AI fingerprint fonts
  const hasAIFonts = /\bInter\b|\bRoboto\b|\bArial\b|\bsystem-ui\b/i.test(tokensContent)
  checks.push({ name: 'no AI fingerprint fonts', pass: !hasAIFonts })
  if (!hasAIFonts) score++

  // 7. No pure black/white
  const designContent = designExists ? await readText(path.join(project, 'DESIGN.md')) : ''
  const hasPureColors = /#000000|#ffffff|#000\b|#fff\b/i.test(tokensContent + designContent)
  checks.push({ name: 'no pure #000/#fff', pass: !hasPureColors })
  if (!hasPureColors) score++

  // 8. Pages directory has at least one file
  let pageCount = 0
  try {
    const pages = await fs.readdir(path.join(project, 'docs', 'pages'))
    pageCount = pages.filter((f) => f.endsWith('.md')).length
  } catch { /* empty */ }
  const hasPages = pageCount > 0
  checks.push({ name: 'pages defined', pass: hasPages, detail: `${pageCount} pages` })
  if (hasPages) score++

  // 9. DESIGN.md has motion rules
  const hasMotion = /motion|easing|animation|duration|transition/i.test(designContent)
  checks.push({ name: 'motion rules in DESIGN.md', pass: hasMotion })
  if (hasMotion) score++

  // 10. DESIGN.md has anti-patterns
  const hasAntiPatterns = /anti.?pattern|avoid|never|forbidden/i.test(designContent)
  checks.push({ name: 'anti-patterns defined', pass: hasAntiPatterns })
  if (hasAntiPatterns) score++

  // 11. DESIGN.md has responsive rules
  const hasResponsive = /responsive|breakpoint|mobile|tablet|375|768|1280/i.test(designContent)
  checks.push({ name: 'responsive rules defined', pass: hasResponsive })
  if (hasResponsive) score++

  // 12. DESIGN.md has brand/tone section
  const hasBrand = /brand|tone|personality|voice|mood|intent/i.test(designContent)
  checks.push({ name: 'brand/tone defined', pass: hasBrand })
  if (hasBrand) score++

  return { pass: score >= 12, score, checks }
}

// ---------------------------------------------------------------------------
// Completion Gate — Phase 5 hard stop
// ---------------------------------------------------------------------------

const cmdCompletion = async (args) => {
  const project = args.project
  if (!project) fail('--project is required')

  const brainDir = path.join(project, '.brain')
  const checks = {}
  const recoveryActions = []

  // 1. Observer ran
  const observerDir = path.join(brainDir, 'observer')
  let observerRan = false
  try {
    const entries = await fs.readdir(observerDir, { recursive: true })
    observerRan = entries.some((e) => e.endsWith('analysis.md'))
  } catch { /* empty */ }
  checks.observerRan = {
    pass: observerRan,
    detail: observerRan ? 'analysis.md found' : 'no analysis.md in observer/',
  }
  if (!observerRan) recoveryActions.push('Run observer: node capture-refs.mjs --local --port 5173 .brain/observer/')

  // 2. Quality refreshed (scorecard.json exists)
  const scorecardPath = path.join(brainDir, 'reports', 'quality', 'scorecard.json')
  const scorecard = await readJson(scorecardPath)
  const qualityRefreshed = scorecard !== null
  checks.qualityRefreshed = {
    pass: qualityRefreshed,
    detail: qualityRefreshed ? 'scorecard.json exists' : 'scorecard.json missing',
  }
  if (!qualityRefreshed) recoveryActions.push('Run: npm run refresh:quality -- --project "$PROJECT_DIR"')

  // 3. Scorecard non-zero
  const scorecardNonZero = scorecard !== null && (scorecard.finalScore || 0) > 0
  checks.scorecardNonZero = {
    pass: scorecardNonZero,
    detail: scorecardNonZero
      ? `finalScore: ${scorecard.finalScore}`
      : qualityRefreshed
        ? `finalScore is ${scorecard?.finalScore ?? 0}`
        : 'not checked (prereq failed)',
  }
  if (qualityRefreshed && !scorecardNonZero) {
    recoveryActions.push('Re-run refresh-quality — scorecard has zero score')
  }

  // 4. Queue complete
  const queue = await readJson(path.join(brainDir, 'queue.json'))
  let queueComplete = false
  let queueDetail = 'queue.json not found'
  if (queue) {
    const total =
      (queue.done?.length || 0) + (queue.active?.length || 0) + (queue.pending?.length || 0)
    const done = queue.done?.length || 0
    queueComplete = (queue.active?.length || 0) === 0 && (queue.pending?.length || 0) === 0
    queueDetail = `${done}/${total} tasks done`
  }
  checks.queueComplete = { pass: queueComplete, detail: queueDetail }
  if (!queueComplete) recoveryActions.push('Complete remaining pending/active tasks')

  // 5. Evaluations complete
  let evalsComplete = true
  let evalDetail = ''
  if (queue) {
    const buildTasks = [...(queue.done || []), ...(queue.active || [])].filter((t) =>
      t.id.startsWith('build/S-')
    )
    const missing = []
    for (const task of buildTasks) {
      const sectionName = task.id.replace('build/', '')
      const evalPath = path.join(brainDir, 'evaluations', `${sectionName}.md`)
      if (!(await exists(evalPath))) {
        missing.push(sectionName)
      }
    }
    evalsComplete = missing.length === 0
    evalDetail = evalsComplete
      ? `${buildTasks.length} evaluations found`
      : `missing: ${missing.join(', ')}`
  }
  checks.evaluationsComplete = { pass: evalsComplete, detail: evalDetail }
  if (!evalsComplete) recoveryActions.push(`Spawn evaluator for missing sections`)

  // 6. Queue sync (md vs json counts)
  const queueMd = await readText(path.join(brainDir, 'queue.md'))
  let queueSynced = true
  let syncDetail = 'verified'
  if (queue && queueMd) {
    const jsonDone = queue.done?.length || 0
    const mdDoneCount = (queueMd.match(/\[DONE\]/g) || []).length +
      (queueMd.match(/\[FLAGGED\]/g) || []).length
    queueSynced = jsonDone === mdDoneCount
    syncDetail = queueSynced
      ? `${jsonDone} done in both`
      : `json: ${jsonDone}, md: ${mdDoneCount} — diverged`
  }
  checks.queueSynced = { pass: queueSynced, detail: syncDetail }
  if (!queueSynced) recoveryActions.push('Run eros-state.mjs to reconcile queue files')

  const allPassed = Object.values(checks).every((c) => c.pass)

  out({
    passed: allPassed,
    checks,
    recoveryActions: recoveryActions.length > 0 ? recoveryActions : undefined,
  })
}

// ---------------------------------------------------------------------------
// Designer gate (standalone subcommand)
// ---------------------------------------------------------------------------

const cmdDesigner = async (args) => {
  const project = args.project
  if (!project) fail('--project is required')

  const result = await runDesignerGate(project)
  out(result)
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const main = async () => {
  const rawArgs = process.argv.slice(2)
  const subcommand = rawArgs[0]
  const args = parseArgs(rawArgs.slice(1))

  const commands = {
    pre: cmdPre,
    post: cmdPost,
    designer: cmdDesigner,
    completion: cmdCompletion,
  }

  const handler = commands[subcommand]
  if (!handler) {
    fail(
      `Unknown subcommand: ${subcommand}\nUsage: node eros-gate.mjs <pre|post|designer|completion> [options]`
    )
  }

  await handler(args)
}

main().catch((err) => {
  process.stderr.write(`Fatal: ${err.message}\n`)
  process.exit(1)
})
