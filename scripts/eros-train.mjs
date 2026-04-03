import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFile } from 'node:child_process'

// ---------------------------------------------------------------------------
// eros-train.mjs — Training System
//
// Handles the complete training loop:
//   init      — generate review session from a completed project
//   ingest    — process user feedback → propagate to memory
//   rate      — quick single-section rating
//   calibrate — compare brain scores vs user ratings
//
// Training is how the user teaches Eros their quality standard.
// ---------------------------------------------------------------------------

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const parseArgs = (argv) => {
  const args = { _: [] }
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i]
    if (!token.startsWith('--')) {
      args._.push(token)
      continue
    }
    const key = token.slice(2)
    const next = argv[i + 1]
    if (!next || next.startsWith('--')) {
      args[key] = true
      continue
    }
    args[key] = next
    i++
  }
  return args
}

const readJson = async (filePath) => {
  try {
    const raw = await fs.readFile(filePath, 'utf8')
    return JSON.parse(raw)
  } catch {
    return null
  }
}

const readText = async (filePath) => {
  try {
    return await fs.readFile(filePath, 'utf8')
  } catch {
    return null
  }
}

const ensureDir = async (dirPath) => {
  await fs.mkdir(dirPath, { recursive: true })
}

const writeJson = async (filePath, data) => {
  await ensureDir(path.dirname(filePath))
  await fs.writeFile(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8')
}

const out = (obj) => {
  process.stdout.write(JSON.stringify(obj, null, 2) + '\n')
}

const fail = (msg) => {
  process.stderr.write(`Error: ${msg}\n`)
  process.exit(1)
}

const today = () => new Date().toISOString().slice(0, 10)

// Run eros-memory.mjs as a child process
const callMemory = (subArgs) => {
  return new Promise((resolve, reject) => {
    const memoryScript = path.join(__dirname, 'eros-memory.mjs')
    execFile('node', [memoryScript, ...subArgs], { cwd: __dirname }, (err, stdout, stderr) => {
      if (err) {
        reject(new Error(stderr || err.message))
        return
      }
      try {
        resolve(JSON.parse(stdout))
      } catch {
        resolve({ raw: stdout })
      }
    })
  })
}

// ---------------------------------------------------------------------------
// Subcommands
// ---------------------------------------------------------------------------

/**
 * init — Generate a training session from a completed project.
 * Reads .brain/decisions.md, .brain/approvals.md, .brain/evaluations/,
 * .brain/reports/, queue.json
 */
const cmdInit = async (args) => {
  const project = args.project
  if (!project) fail('--project is required')

  const brainDir = path.join(project, '.brain')
  const slug = path.basename(project)

  // Read queue to find all build tasks and their scores
  const queue = await readJson(path.join(brainDir, 'queue.json'))
  if (!queue) fail('.brain/queue.json not found — is this a completed project?')

  const allTasks = [...(queue.done || []), ...(queue.active || []), ...(queue.pending || [])]

  // Extract build/S-* tasks for section review
  const buildTasks = allTasks.filter((t) => t.id.startsWith('build/S-'))

  const sections = []
  for (const task of buildTasks) {
    const sectionName = task.id.replace('build/', '')

    // Try to read evaluation
    const evalPath = path.join(brainDir, 'evaluations', `${sectionName}.md`)
    const evalContent = await readText(evalPath)

    // Try to read builder report
    const reportPath = path.join(brainDir, 'reports', `${sectionName}.md`)
    const reportContent = await readText(reportPath)

    // Extract score and signature from report
    let brainScore = task.score || null
    let signature = null
    let verdict = task.decision || (task.status === 'done' ? 'approved' : task.status)
    let techniques = []

    if (reportContent) {
      const scoreMatch = reportContent.match(/Score:\s*([\d.]+)/i)
      if (scoreMatch) brainScore = parseFloat(scoreMatch[1])

      const sigMatch = reportContent.match(/Signature[^:]*:\s*(.+)/i)
      if (sigMatch) signature = sigMatch[1].trim()

      const techMatch = reportContent.match(/Key Technique[^:]*:\s*(.+)/i)
      if (techMatch) techniques = techMatch[1].split(/[+,]/).map((t) => t.trim())
    }

    sections.push({
      name: sectionName,
      type: null, // User can fill in or we derive from context
      brainScore,
      verdict,
      signature,
      techniques,
      userRating: null,
      feedback: null,
      keepSignature: null,
    })
  }

  // Extract decisions from decisions.md
  const decisionsContent = await readText(path.join(brainDir, 'decisions.md'))
  const decisions = []

  if (decisionsContent) {
    const decisionBlocks = decisionsContent.split(/^## /m).slice(1)
    for (const block of decisionBlocks) {
      const headerMatch = block.match(/^(D-\d+)\s*\|\s*(.+?)\s*\|/)
      if (!headerMatch) continue

      const choiceMatch = block.match(/\*\*Choice:\*\*\s*(.+)/i)

      decisions.push({
        id: headerMatch[1],
        topic: headerMatch[2].trim(),
        choice: choiceMatch ? choiceMatch[1].trim() : '—',
        agree: null,
        note: null,
      })
    }
  }

  // Build session
  const session = {
    generatedAt: new Date().toISOString(),
    projectSlug: slug,
    projectName: slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    sections,
    decisions,
    newRules: [],
  }

  // Write session file
  const trainingDir = path.join(brainDir, 'training')
  const sessionPath = path.join(trainingDir, 'session.json')
  await writeJson(sessionPath, session)

  // Also write an empty feedback template
  const feedbackPath = path.join(trainingDir, 'feedback.json')
  const existingFeedback = await readJson(feedbackPath)
  if (!existingFeedback) {
    const feedbackTemplate = {
      projectSlug: slug,
      overallRating: null,
      overallFeedback: null,
      sections: sections.map((s) => ({
        name: s.name,
        brainScore: s.brainScore,
        userRating: null,
        feedback: null,
        keepSignature: null,
      })),
      decisions: decisions.map((d) => ({
        id: d.id,
        agree: null,
        note: null,
      })),
      newRules: [],
    }
    await writeJson(feedbackPath, feedbackTemplate)
  }

  out({
    sessionFile: path.relative(project, sessionPath),
    feedbackFile: path.relative(project, feedbackPath),
    sectionsToReview: sections.length,
    decisionsToReview: decisions.length,
  })
}

/**
 * ingest — Process completed feedback.json → propagate to memory.
 */
const cmdIngest = async (args) => {
  const project = args.project
  if (!project) fail('--project is required')

  const feedbackPath = path.join(project, '.brain', 'training', 'feedback.json')
  const feedback = await readJson(feedbackPath)
  if (!feedback) fail('.brain/training/feedback.json not found')

  const slug = feedback.projectSlug || path.basename(project)
  let memoryUpdates = 0
  const errors = []

  // Process section ratings
  for (const section of feedback.sections || []) {
    if (section.userRating === null) continue

    // Learn section with user rating
    try {
      await callMemory([
        'learn',
        '--event',
        'section_approved',
        '--data',
        JSON.stringify({
          project: slug,
          section: section.name,
          sectionType: section.type || 'unknown',
          score: section.brainScore,
          userRating: section.userRating,
          layout: '',
          motion: '',
          technique: '',
          signature: '',
          feedback: section.feedback || '',
        }),
      ])
      memoryUpdates++
    } catch (err) {
      errors.push({ section: section.name, error: err.message })
    }
  }

  // Process new rules from user
  for (const rule of feedback.newRules || []) {
    if (!rule) continue
    try {
      await callMemory([
        'learn',
        '--event',
        'rule_discovered',
        '--data',
        JSON.stringify({
          text: rule,
          source: `user-training/${slug}`,
        }),
      ])
      memoryUpdates++
    } catch (err) {
      errors.push({ rule, error: err.message })
    }
  }

  // Process disagreed decisions → revision patterns
  for (const decision of feedback.decisions || []) {
    if (decision.agree !== false || !decision.note) continue
    try {
      await callMemory([
        'learn',
        '--event',
        'user_change',
        '--data',
        JSON.stringify({
          project: slug,
          phase: 'Training review',
          whatChanged: `Decision ${decision.id} disagreed`,
          original: 'Brain decision',
          revised: decision.note,
          pattern: decision.note,
        }),
      ])
      memoryUpdates++
    } catch (err) {
      errors.push({ decision: decision.id, error: err.message })
    }
  }

  // Update calibration data
  await updateCalibration(project, feedback)

  // Try to promote rules
  let promotions = []
  try {
    const promoteResult = await callMemory(['promote'])
    promotions = promoteResult.promoted || []
  } catch {
    // Non-fatal
  }

  // Write report
  const report = {
    processed: (feedback.sections || []).filter((s) => s.userRating !== null).length,
    memoryUpdates,
    rulesPromoted: promotions.length,
    promotions,
    errors: errors.length > 0 ? errors : undefined,
  }

  const reportPath = path.join(project, '.brain', 'training', 'report.json')
  await writeJson(reportPath, report)

  out(report)
}

/**
 * rate — Quick single-section rating.
 */
const cmdRate = async (args) => {
  const project = args.project
  if (!project) fail('--project is required')
  const section = args.section
  if (!section) fail('--section is required')
  const rating = parseFloat(args.rating)
  if (isNaN(rating)) fail('--rating must be a number')

  const feedback = args.feedback || ''
  const slug = path.basename(project)

  // Read existing queue to find brain score
  const queue = await readJson(path.join(project, '.brain', 'queue.json'))
  let brainScore = null
  if (queue) {
    const allTasks = [...(queue.done || []), ...(queue.active || [])]
    const task = allTasks.find((t) => t.id === `build/${section}`)
    if (task) brainScore = task.score || null
  }

  // Update feedback.json if it exists
  const feedbackPath = path.join(project, '.brain', 'training', 'feedback.json')
  const existingFeedback = await readJson(feedbackPath)
  if (existingFeedback) {
    const sectionEntry = existingFeedback.sections.find((s) => s.name === section)
    if (sectionEntry) {
      sectionEntry.userRating = rating
      sectionEntry.feedback = feedback
    } else {
      existingFeedback.sections.push({
        name: section,
        brainScore,
        userRating: rating,
        feedback,
        keepSignature: null,
      })
    }
    await writeJson(feedbackPath, existingFeedback)
  }

  const delta = brainScore !== null ? rating - brainScore : null

  out({
    section,
    brainScore,
    userRating: rating,
    delta,
    feedback,
  })
}

/**
 * calibrate — Compare brain scores vs user ratings across the project.
 */
const cmdCalibrate = async (args) => {
  const project = args.project
  if (!project) fail('--project is required')

  const feedbackPath = path.join(project, '.brain', 'training', 'feedback.json')
  const feedback = await readJson(feedbackPath)
  if (!feedback) fail('.brain/training/feedback.json not found')

  const scored = (feedback.sections || []).filter(
    (s) => s.userRating !== null && s.brainScore !== null
  )

  if (scored.length === 0) {
    out({ calibration: { avgDelta: 0, bias: 'no rated sections', sections: [] } })
    return
  }

  const sections = scored.map((s) => ({
    name: s.name,
    brainScore: s.brainScore,
    userRating: s.userRating,
    delta: s.userRating - s.brainScore,
  }))

  const avgDelta = sections.reduce((sum, s) => sum + s.delta, 0) / sections.length
  const biasDirection =
    avgDelta > 0.3
      ? `brain underscores by ${avgDelta.toFixed(1)}`
      : avgDelta < -0.3
        ? `brain overscores by ${Math.abs(avgDelta).toFixed(1)}`
        : 'brain is calibrated'

  const calibration = {
    avgDelta: parseFloat(avgDelta.toFixed(2)),
    bias: biasDirection,
    sections,
    sampleSize: sections.length,
  }

  // Update calibration file
  await updateCalibration(project, feedback)

  out({ calibration })
}

// ---------------------------------------------------------------------------
// Calibration tracking
// ---------------------------------------------------------------------------

const updateCalibration = async (project, feedback) => {
  const memDir = path.join(__dirname, '..', '.claude', 'memory', 'design-intelligence')
  const calPath = path.join(memDir, 'training-calibration.json')
  const cal = (await readJson(calPath)) || {
    projects: [],
    globalBias: 0.0,
    thresholdAdjustment: 0.0,
  }

  const slug = feedback.projectSlug || path.basename(project)

  const scored = (feedback.sections || []).filter(
    (s) => s.userRating !== null && s.brainScore !== null
  )

  if (scored.length === 0) return

  const sections = scored.map((s) => ({
    name: s.name,
    brainScore: s.brainScore,
    userRating: s.userRating,
    delta: parseFloat((s.userRating - s.brainScore).toFixed(2)),
  }))

  const avgDelta = sections.reduce((sum, s) => sum + s.delta, 0) / sections.length

  // Remove existing entry for this project (update mode)
  cal.projects = cal.projects.filter((p) => p.slug !== slug)
  cal.projects.push({
    slug,
    date: today(),
    sections,
    avgDelta: parseFloat(avgDelta.toFixed(2)),
    bias:
      avgDelta > 0.3
        ? `brain underscores by ${avgDelta.toFixed(1)}`
        : avgDelta < -0.3
          ? `brain overscores by ${Math.abs(avgDelta).toFixed(1)}`
          : 'calibrated',
  })

  // Recompute global bias across all projects
  if (cal.projects.length > 0) {
    const allDeltas = cal.projects.map((p) => p.avgDelta)
    cal.globalBias = parseFloat(
      (allDeltas.reduce((a, b) => a + b, 0) / allDeltas.length).toFixed(2)
    )
    // Damped adjustment: 50% of bias to avoid oscillation
    cal.thresholdAdjustment = parseFloat((cal.globalBias * 0.5).toFixed(2))
  }

  await writeJson(calPath, cal)
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const main = async () => {
  const rawArgs = process.argv.slice(2)
  const subcommand = rawArgs[0]
  const args = parseArgs(rawArgs.slice(1))

  const commands = {
    init: cmdInit,
    ingest: cmdIngest,
    rate: cmdRate,
    calibrate: cmdCalibrate,
  }

  const handler = commands[subcommand]
  if (!handler) {
    fail(
      `Unknown subcommand: ${subcommand}\nUsage: node eros-train.mjs <init|ingest|rate|calibrate> [options]`
    )
  }

  await handler(args)
}

main().catch((err) => {
  process.stderr.write(`Fatal: ${err.message}\n`)
  process.exit(1)
})
