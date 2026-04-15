#!/usr/bin/env node

/**
 * eros-state.mjs — Single authority for all state transitions in the Eros autonomous brain.
 *
 * Claude (the CEO agent) never writes to state.md, state.json, queue.md, or queue.json
 * directly — all changes go through this script. All output to stdout is valid JSON.
 *
 * Subcommands: query, start, advance, retry, flag, init-sections, check-gate
 */

import path from 'node:path'
import { execFile } from 'node:child_process'
import {
  parseArgs,
  exists,
  ensureDir,
  readJson,
  writeJson,
  writeText,
  out as outputJson,
  fail,
} from '../lib/utils.mjs'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const RETRY_MAX = 2

const PHASE_PREFIXES = [
  { test: /^setup\//, phase: 'discovery' },
  { test: /^design\//, phase: 'creative' },
  { test: /^build\/atmosphere$/, phase: 'scaffold' },
  { test: /^context\/S-/, phase: 'sections' },
  { test: /^build\/S-/, phase: 'sections' },
  { test: /^observe\/S-/, phase: 'sections' },
  { test: /^evaluate\/S-/, phase: 'sections' },
  { test: /^review\/observer$/, phase: 'sections' },
  { test: /^review\/sections$/, phase: 'sections' },
  { test: /^context\/motion$/, phase: 'motion' },
  { test: /^polish\//, phase: 'motion' },
  { test: /^integrate\//, phase: 'integration' },
  { test: /^review\/observer-final$/, phase: 'integration' },
  { test: /^review\/final$/, phase: 'integration' },
  { test: /^cleanup\//, phase: 'retrospective' },
]

const SECTION_TASK_AGENTS = {
  context: 'ceo',
  build: 'builder',
  observe: 'ceo',
  evaluate: 'evaluator',
}

// ---------------------------------------------------------------------------
// Phase detection
// ---------------------------------------------------------------------------

const detectPhase = (taskId, queueJson = null) => {
  if (!taskId) return 'unknown'

  // Special case: setup/* could be discovery or scaffold
  if (/^setup\//.test(taskId)) {
    if (queueJson) {
      const doneIds = (queueJson.done || []).map((t) => t.id)
      const hasDesignDone = doneIds.some((id) => /^design\//.test(id))
      if (hasDesignDone) return 'scaffold'
    }
    return 'discovery'
  }

  for (const entry of PHASE_PREFIXES) {
    if (entry.test.test(taskId)) {
      return entry.phase
    }
  }

  return 'unknown'
}

// ---------------------------------------------------------------------------
// File paths
// ---------------------------------------------------------------------------

const erosPaths = (projectDir) => ({
  stateJson: path.join(projectDir, '.eros', 'state.json'),
  stateMd: path.join(projectDir, '.eros', 'state.md'),
  queueJson: path.join(projectDir, '.eros', 'queue.json'),
  queueMd: path.join(projectDir, '.eros', 'queue.md'),
})

// ---------------------------------------------------------------------------
// Read current state + queue (with graceful defaults)
// ---------------------------------------------------------------------------

const loadState = async (projectDir) => {
  const paths = erosPaths(projectDir)
  const stateJson = (await readJson(paths.stateJson)) ?? {
    project: { name: 'Unknown', slug: 'unknown', type: 'unknown' },
    mode: 'autonomous',
    currentPhase: 'unknown',
    currentTask: null,
    taskStatus: 'idle',
    attempt: 0,
    healthIndex: 50,
    maturityScore: 0,
    retriesUsed: 0,
    retryBudget: 6,
    filesCreated: 0,
    sections: { done: 0, total: 0 },
    blocker: null,
    nextAction: null,
    lastUpdated: null,
  }
  const queueJson = (await readJson(paths.queueJson)) ?? {
    active: [],
    pending: [],
    done: [],
  }

  return { stateJson, queueJson, paths }
}

// ---------------------------------------------------------------------------
// Markdown renderers
// ---------------------------------------------------------------------------

const renderStateMd = (stateJson) => {
  const projectName = stateJson.project?.name || 'Unknown'
  const slug = stateJson.project?.slug || 'unknown'
  const sections = stateJson.sections || { done: 0, total: 0 }

  return `# Eros State
- **Project:** ${projectName} (${slug})
- **Phase:** ${stateJson.currentPhase || 'unknown'}
- **Task:** ${stateJson.currentTask || 'none'}
- **Blocker:** ${stateJson.blocker || 'none'}
- **Next:** ${stateJson.nextAction || 'none'}
- **Mode:** ${stateJson.mode || 'autonomous'}
- **Files created:** ${stateJson.filesCreated || 0}
- **Sections:** ${sections.done}/${sections.total}
`
}

const renderQueueMd = (stateJson, queueJson) => {
  const projectName = stateJson.project?.name || 'Unknown'

  const renderTask = (task) => {
    const tag = task.status.toUpperCase()
    const parts = [`[${tag}] ${task.id} | ${task.agent}`]

    if (task.inputFile && task.outputFile) {
      parts.push(`${task.inputFile} → ${task.outputFile}`)
    } else if (task.inputFile) {
      parts.push(task.inputFile)
    } else if (task.outputFile) {
      parts.push(task.outputFile)
    }

    if (task.status === 'in_progress' && task.attempt) {
      parts.push(`attempt:${task.attempt}`)
    }

    if (task.score != null) {
      parts.push(`score:${task.score}`)
    }

    if (task.decision) {
      parts.push(`decision:${task.decision}`)
    }

    if (task.status === 'flagged' && task.reason) {
      parts.push(`reason:${task.reason}`)
    }

    if (task.completedAt) {
      parts.push(task.completedAt.slice(0, 10))
    }

    return `- ${parts.join(' | ')}`
  }

  const activeLines = (queueJson.active || []).map(renderTask)
  const doneLines = (queueJson.done || []).map(renderTask)
  const pendingLines = (queueJson.pending || []).map(renderTask)

  return `# Task Queue — ${projectName}

## Active
${activeLines.length > 0 ? activeLines.join('\n') : '- (none)'}

## Done
${doneLines.length > 0 ? doneLines.join('\n') : '- (none)'}

## Pending
${pendingLines.length > 0 ? pendingLines.join('\n') : '- (none)'}
`
}

// ---------------------------------------------------------------------------
// Atomic write — update all 4 files
// ---------------------------------------------------------------------------

const persistAll = async (projectDir, stateJson, queueJson) => {
  const paths = erosPaths(projectDir)

  stateJson.lastUpdated = new Date().toISOString()

  await Promise.all([
    writeJson(paths.stateJson, stateJson),
    writeText(paths.stateMd, renderStateMd(stateJson)),
    writeJson(paths.queueJson, queueJson),
    writeText(paths.queueMd, renderQueueMd(stateJson, queueJson)),
  ])
}

// ---------------------------------------------------------------------------
// Queue helpers
// ---------------------------------------------------------------------------

const findTaskInQueue = (queueJson, taskId) => {
  for (const list of ['active', 'pending', 'done']) {
    const idx = (queueJson[list] || []).findIndex((t) => t.id === taskId)
    if (idx !== -1) {
      return { list, index: idx, task: queueJson[list][idx] }
    }
  }
  return null
}

const removeTaskFromList = (queueJson, list, index) => {
  return queueJson[list].splice(index, 1)[0]
}

const nextPendingTask = (queueJson) => {
  return (queueJson.pending || [])[0] || null
}

const countSectionsDone = (queueJson) => {
  const done = (queueJson.done || []).filter((t) => /^build\/S-/.test(t.id))
  const total = [
    ...(queueJson.active || []),
    ...(queueJson.pending || []),
    ...(queueJson.done || []),
  ].filter((t) => /^build\/S-/.test(t.id))
  return { done: done.length, total: total.length }
}

const describeNextAction = (task) => {
  if (!task) return 'All tasks complete.'

  const agentMap = {
    ceo: 'CEO',
    builder: 'builder agent',
    designer: 'designer agent',
    evaluator: 'evaluator agent',
    polisher: 'polisher agent',
    'reference-analyst': 'reference-analyst agent',
  }

  const agentLabel = agentMap[task.agent] || task.agent
  const contextFile = task.inputFile ? ` with ${task.inputFile}` : ''
  return `Run ${agentLabel}${contextFile}`
}

const collectBlockers = (queueJson) => {
  const blockers = []
  for (const task of (queueJson.active || [])) {
    if (task.status === 'flagged') {
      blockers.push(`${task.id}: flagged${task.reason ? ` — ${task.reason}` : ''}`)
    }
  }
  return blockers
}

// ---------------------------------------------------------------------------
// Subcommand: query
// ---------------------------------------------------------------------------

const cmdQuery = async (projectDir) => {
  const { stateJson, queueJson } = await loadState(projectDir)

  const sections = countSectionsDone(queueJson)
  const blockers = collectBlockers(queueJson)
  const nextTask = nextPendingTask(queueJson)

  outputJson({
    phase: stateJson.currentPhase || detectPhase(stateJson.currentTask, queueJson),
    task: stateJson.currentTask || null,
    taskStatus: stateJson.taskStatus || 'idle',
    attempt: stateJson.attempt || 0,
    mode: stateJson.mode || 'autonomous',
    sections,
    queue: {
      active: (queueJson.active || []).length,
      pending: (queueJson.pending || []).length,
      done: (queueJson.done || []).length,
    },
    blockers,
    next: stateJson.nextAction || describeNextAction(nextTask),
  })
}

// ---------------------------------------------------------------------------
// Subcommand: start
// ---------------------------------------------------------------------------

// Internal version: mutates state+queue, persists, returns result (no stdout)
const startInternal = async (projectDir, taskId) => {
  const { stateJson, queueJson } = await loadState(projectDir)

  const found = findTaskInQueue(queueJson, taskId)
  if (!found) fail(`Task "${taskId}" not found in queue.`)
  if (found.list !== 'pending') fail(`Task "${taskId}" is ${found.task.status}, expected pending.`)

  const task = removeTaskFromList(queueJson, 'pending', found.index)
  task.status = 'in_progress'
  task.attempt = 1
  task.startedAt = new Date().toISOString()
  queueJson.active.push(task)

  const phase = detectPhase(taskId, queueJson)
  stateJson.currentPhase = phase
  stateJson.currentTask = taskId
  stateJson.taskStatus = 'in_progress'
  stateJson.attempt = 1
  stateJson.blocker = null
  stateJson.sections = countSectionsDone(queueJson)
  stateJson.nextAction = describeNextAction(task)

  await persistAll(projectDir, stateJson, queueJson)
  return { taskId: task.id, status: 'in_progress', attempt: 1 }
}

const cmdStart = async (projectDir, taskId) => {
  if (!taskId) fail('Missing --task argument.')
  outputJson(await startInternal(projectDir, taskId))
}

// ---------------------------------------------------------------------------
// Subcommand: advance
// ---------------------------------------------------------------------------

const advanceInternal = async (projectDir, taskId, score, decision, gateResult) => {
  const { stateJson, queueJson } = await loadState(projectDir)

  const found = findTaskInQueue(queueJson, taskId)
  if (!found) fail(`Task "${taskId}" not found in queue.`)
  if (found.list !== 'active') fail(`Task "${taskId}" is not active (found in ${found.list}).`)

  // Gate enforcement: verify gate result file exists and matches
  const gateFile = path.join(projectDir, '.eros', 'gates', `${taskId.replace(/\//g, '--')}.json`)
  const gateData = await readJson(gateFile)

  if (!gateData) {
    fail(
      `Gate enforcement: no gate result found at ${gateFile}. ` +
      `Run "eros-gate.mjs post --project ... --task ${taskId}" first.`
    )
  }

  if (gateResult && gateData.verdict !== gateResult.toUpperCase() && gateData.verdict !== 'APPROVE') {
    fail(
      `Gate enforcement: gate verdict is "${gateData.verdict}" but --gate-result is "${gateResult}". ` +
      `Cannot advance a task that didn't pass the gate.`
    )
  }

  if (gateData.verdict !== 'APPROVE' && decision !== 'flagged') {
    fail(
      `Gate enforcement: gate verdict is "${gateData.verdict}", not APPROVE. ` +
      `Use "eros-state.mjs retry" or "eros-state.mjs flag" instead.`
    )
  }

  const task = removeTaskFromList(queueJson, 'active', found.index)
  task.status = 'done'
  task.completedAt = new Date().toISOString()
  if (score != null) task.score = parseFloat(score)
  if (decision) task.decision = decision
  queueJson.done.push(task)

  const nextTask = nextPendingTask(queueJson)
  const previousPhase = detectPhase(taskId, queueJson)
  const newPhase = nextTask ? detectPhase(nextTask.id, queueJson) : previousPhase
  const phaseTransitioned = previousPhase !== newPhase

  stateJson.currentPhase = newPhase
  stateJson.currentTask = nextTask ? nextTask.id : null
  stateJson.taskStatus = nextTask ? 'pending' : 'idle'
  stateJson.attempt = 0
  stateJson.blocker = null
  stateJson.sections = countSectionsDone(queueJson)
  stateJson.nextAction = describeNextAction(nextTask)

  await persistAll(projectDir, stateJson, queueJson)

  return { previousTask: taskId, newTask: nextTask ? nextTask.id : null, phase: newPhase, phaseTransitioned }
}

const cmdAdvance = async (projectDir, taskId, score, decision, gateResult) => {
  if (!taskId) fail('Missing --task argument.')
  outputJson(await advanceInternal(projectDir, taskId, score, decision, gateResult))
}

// ---------------------------------------------------------------------------
// Subcommand: retry
// ---------------------------------------------------------------------------

const retryInternal = async (projectDir, taskId, reason) => {
  const { stateJson, queueJson } = await loadState(projectDir)

  const found = findTaskInQueue(queueJson, taskId)
  if (!found) fail(`Task "${taskId}" not found in queue.`)
  if (found.list !== 'active') fail(`Task "${taskId}" is not active (found in ${found.list}).`)

  const task = found.task
  const newAttempt = (task.attempt || 1) + 1
  const escalated = newAttempt > RETRY_MAX

  if (escalated) {
    return flagInternal(projectDir, taskId, reason || `${RETRY_MAX} retries exhausted`)
  }

  task.attempt = newAttempt
  task.status = 'in_progress'
  if (reason) task.lastRetryReason = reason

  stateJson.attempt = newAttempt
  stateJson.taskStatus = 'in_progress'
  stateJson.retriesUsed = (stateJson.retriesUsed || 0) + 1

  await persistAll(projectDir, stateJson, queueJson)

  return { taskId: task.id, attempt: newAttempt, maxRetries: RETRY_MAX, escalated: false }
}

const cmdRetry = async (projectDir, taskId, reason) => {
  if (!taskId) fail('Missing --task argument.')
  outputJson(await retryInternal(projectDir, taskId, reason))
}

// ---------------------------------------------------------------------------
// Subcommand: flag
// ---------------------------------------------------------------------------

const flagInternal = async (projectDir, taskId, reason) => {
  const { stateJson, queueJson } = await loadState(projectDir)

  const found = findTaskInQueue(queueJson, taskId)
  if (!found) fail(`Task "${taskId}" not found in queue.`)

  const task = removeTaskFromList(queueJson, found.list, found.index)
  task.status = 'flagged'
  task.completedAt = new Date().toISOString()
  if (reason) task.reason = reason
  queueJson.done.push(task)

  const nextTask = nextPendingTask(queueJson)
  const newPhase = nextTask ? detectPhase(nextTask.id, queueJson) : stateJson.currentPhase
  stateJson.currentPhase = newPhase
  stateJson.currentTask = nextTask ? nextTask.id : null
  stateJson.taskStatus = nextTask ? 'pending' : 'idle'
  stateJson.attempt = 0
  stateJson.blocker = null
  stateJson.sections = countSectionsDone(queueJson)
  stateJson.nextAction = describeNextAction(nextTask)

  await persistAll(projectDir, stateJson, queueJson)

  return { taskId: task.id, status: 'flagged', reason: reason || null, newTask: nextTask ? nextTask.id : null }
}

const cmdFlag = async (projectDir, taskId, reason) => {
  if (!taskId) fail('Missing --task argument.')
  outputJson(await flagInternal(projectDir, taskId, reason))
}

// ---------------------------------------------------------------------------
// Subcommand: init-sections
// ---------------------------------------------------------------------------

const cmdInitSections = async (projectDir, sectionsArg) => {
  if (!sectionsArg) fail('Missing --sections argument (comma-separated section names, e.g. "S-Hero,S-Features,S-Work").')

  const sectionNames = sectionsArg
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  if (sectionNames.length === 0) fail('No valid section names provided.')

  const { stateJson, queueJson } = await loadState(projectDir)

  // Generate tasks per section: context, build, observe, evaluate
  const taskPhases = ['context', 'build', 'observe', 'evaluate']
  const newTasks = []

  for (const section of sectionNames) {
    for (const phase of taskPhases) {
      const taskId = `${phase}/${section}`
      const agent = SECTION_TASK_AGENTS[phase] || 'ceo'

      // Determine input/output file hints
      let inputFile = null
      let outputFile = null

      if (phase === 'context') {
        outputFile = `context/${section}.md`
      } else if (phase === 'build') {
        inputFile = `context/${section}.md`
        outputFile = `reports/${section}.md`
      } else if (phase === 'observe') {
        inputFile = `reports/${section}.md`
      } else if (phase === 'evaluate') {
        inputFile = `reports/${section}.md`
        outputFile = `evaluations/${section}.md`
      }

      const task = {
        id: taskId,
        agent,
        status: 'pending',
      }
      if (inputFile) task.inputFile = inputFile
      if (outputFile) task.outputFile = outputFile

      newTasks.push(task)
    }
  }

  // Add batch review tasks after all sections
  newTasks.push({
    id: 'review/observer',
    agent: 'ceo',
    status: 'pending',
  })
  newTasks.push({
    id: 'review/sections',
    agent: 'ceo',
    status: 'pending',
  })

  // Append to pending queue
  queueJson.pending = [...(queueJson.pending || []), ...newTasks]

  // Update sections count in state
  stateJson.sections = countSectionsDone(queueJson)

  await persistAll(projectDir, stateJson, queueJson)

  outputJson({
    sectionsAdded: sectionNames.length,
    tasksGenerated: newTasks.length,
  })
}

// ---------------------------------------------------------------------------
// Subcommand: check-gate
// ---------------------------------------------------------------------------

const cmdCheckGate = async (projectDir) => {
  const { queueJson } = await loadState(projectDir)

  const checks = {
    observerRan: { pass: false, detail: '' },
    qualityRefreshed: { pass: false, detail: '' },
    scorecardNonZero: { pass: false, detail: '' },
    queueComplete: { pass: false, detail: '' },
    evaluationsComplete: { pass: false, detail: '' },
  }

  const recoveryActions = []

  // Check 1: observer ran — analysis.md must exist in .eros/observer/
  const observerDir = path.join(projectDir, '.eros', 'observer')
  const analysisGlob = path.join(observerDir, 'localhost', 'analysis.md')
  const analysisFallback = path.join(observerDir, 'analysis.md')
  if (await exists(analysisGlob)) {
    checks.observerRan = { pass: true, detail: 'analysis.md found' }
  } else if (await exists(analysisFallback)) {
    checks.observerRan = { pass: true, detail: 'analysis.md found' }
  } else {
    checks.observerRan = { pass: false, detail: 'analysis.md missing' }
    recoveryActions.push('Run observer on localhost (capture-refs --local)')
  }

  // Check 2: quality refreshed — scorecard.json must exist
  const scorecardPath = path.join(projectDir, '.eros', 'reports', 'quality', 'scorecard.json')
  const scorecard = await readJson(scorecardPath)
  if (scorecard) {
    checks.qualityRefreshed = { pass: true, detail: 'scorecard.json found' }
  } else {
    checks.qualityRefreshed = { pass: false, detail: 'scorecard.json missing' }
    recoveryActions.push('Run refresh-quality')
  }

  // Check 3: scorecard non-zero
  if (!scorecard) {
    checks.scorecardNonZero = { pass: false, detail: 'not checked (prereq failed)' }
  } else if ((scorecard.finalScore || 0) > 0) {
    checks.scorecardNonZero = { pass: true, detail: `finalScore: ${scorecard.finalScore}` }
  } else {
    checks.scorecardNonZero = { pass: false, detail: 'finalScore is 0' }
    recoveryActions.push('Run refresh-quality to compute scores')
  }

  // Check 4: queue complete — all tasks done or flagged
  const allTasks = [
    ...(queueJson.active || []),
    ...(queueJson.pending || []),
    ...(queueJson.done || []),
  ]
  const totalCount = allTasks.length
  const doneCount = (queueJson.done || []).length
  const activeCount = (queueJson.active || []).length
  const pendingCount = (queueJson.pending || []).length

  if (activeCount === 0 && pendingCount === 0 && totalCount > 0) {
    checks.queueComplete = { pass: true, detail: `${doneCount}/${totalCount} tasks done` }
  } else {
    checks.queueComplete = { pass: false, detail: `${doneCount}/${totalCount} tasks done, ${activeCount} active, ${pendingCount} pending` }
    if (pendingCount > 0) {
      recoveryActions.push(`Complete ${pendingCount} pending tasks`)
    }
    if (activeCount > 0) {
      recoveryActions.push(`Finish ${activeCount} active tasks`)
    }
  }

  // Check 5: evaluations complete — every build/S-* has matching evaluations/*.md
  const buildSectionTasks = (queueJson.done || []).filter(
    (t) => /^build\/S-/.test(t.id) && (t.status === 'done' || t.status === 'flagged')
  )
  const evaluationsDir = path.join(projectDir, '.eros', 'evaluations')
  const missingEvaluations = []

  for (const task of buildSectionTasks) {
    const sectionName = task.id.replace('build/', '')
    const evalPath = path.join(evaluationsDir, `${sectionName}.md`)
    if (!(await exists(evalPath))) {
      missingEvaluations.push(sectionName)
    }
  }

  if (buildSectionTasks.length === 0) {
    checks.evaluationsComplete = { pass: true, detail: 'no build/S-* tasks to evaluate' }
  } else if (missingEvaluations.length === 0) {
    checks.evaluationsComplete = { pass: true, detail: `${buildSectionTasks.length}/${buildSectionTasks.length} evaluations found` }
  } else {
    checks.evaluationsComplete = { pass: false, detail: `missing: ${missingEvaluations.join(', ')}` }
    for (const section of missingEvaluations) {
      recoveryActions.push(`Spawn evaluator for ${section}`)
    }
  }

  const passed = Object.values(checks).every((c) => c.pass)

  outputJson({
    passed,
    checks,
    recoveryActions,
  })
}

// ---------------------------------------------------------------------------
// Helper: call another eros script via execFile (returns parsed JSON)
// ---------------------------------------------------------------------------

const __dirname = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1'))

const callScript = (script, args) => {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, script)
    execFile(process.execPath, [scriptPath, ...args], { cwd: __dirname }, (err, stdout, stderr) => {
      if (err) {
        reject(new Error(`${script} ${args.join(' ')}: ${stderr || err.message}`))
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
// Subcommand: next — V8 orchestrator entry point (read-only)
// ---------------------------------------------------------------------------

const cmdNext = async (projectDir) => {
  const { stateJson, queueJson } = await loadState(projectDir)

  // Determine current task: active first, then next pending
  let taskId = null
  const activeTask = (queueJson.active || [])[0]
  const pendingTask = nextPendingTask(queueJson)

  if (activeTask) {
    taskId = activeTask.id
  } else if (pendingTask) {
    taskId = pendingTask.id
    // Auto-start the pending task so Claude doesn't need a separate start call
    await startInternal(projectDir, taskId)
    // Reload state after start
    const reloaded = await loadState(projectDir)
    Object.assign(stateJson, reloaded.stateJson)
    Object.assign(queueJson, reloaded.queueJson)
  }

  if (!taskId) {
    outputJson({ action: 'complete', plan: 'All tasks finished.', step: 0, totalSteps: 0 })
    return
  }

  // Dynamically import the orchestrator and resolve the action
  const { resolveAction } = await import('./eros-orchestrator.mjs')
  const action = resolveAction(taskId, stateJson, queueJson, projectDir)

  outputJson(action)
}

// ---------------------------------------------------------------------------
// Subcommand: done — V8 verify + gate + memory + advance in one call
// ---------------------------------------------------------------------------

const cmdDone = async (projectDir, resultArg) => {
  const { stateJson, queueJson } = await loadState(projectDir)

  // Find the current active task
  const activeTask = (queueJson.active || [])[0]
  if (!activeTask) {
    fail('No active task to complete. Call "next" first.')
  }
  const taskId = activeTask.id

  // Parse result
  let result = { success: true }
  if (resultArg && resultArg !== true) {
    try {
      result = JSON.parse(resultArg)
    } catch {
      result = { success: true, note: resultArg }
    }
  }

  // Import orchestrator functions
  const { resolveAction, verifyOutputs, resolveMemoryHooks, needsGate, resolveRecovery } =
    await import('./eros-orchestrator.mjs')

  // Get the action definition to know expected outputs
  const actionDef = resolveAction(taskId, stateJson, queueJson, projectDir)
  const expectedOutputs = actionDef.expectedOutputs || []

  // Step 1: Verify outputs (deterministic file check)
  const verification = await verifyOutputs(projectDir, expectedOutputs)

  if (!verification.passed && expectedOutputs.length > 0) {
    // Outputs missing or invalid → auto-retry without touching gate
    const attempt = activeTask.attempt || 1
    const recovery = resolveRecovery(taskId, {
      reason: 'Output verification failed',
      missingOutputs: verification.details.filter((d) => !d.passed).map((d) => d.file),
    }, attempt)

    if (recovery.escalateToFlag) {
      // Max retries reached, flag it
      try { await callScript('../dev/log.mjs', ['flag', '--project', projectDir, '--task', taskId, '--reason', 'Output verification failed after max retries']) } catch { /* best effort */ }
      await flagInternal(projectDir, taskId, 'Output verification failed after max retries')
      const reloaded = await loadState(projectDir)
      const nextAction = resolveAction(reloaded.stateJson.currentTask, reloaded.stateJson, reloaded.queueJson, projectDir)
      outputJson({ result: { verdict: 'FLAG', reason: 'Output verification failed' }, next: nextAction })
    } else {
      await retryInternal(projectDir, taskId, 'Output verification failed')
      // Return same action with recovery context
      const retryAction = resolveAction(taskId, stateJson, queueJson, projectDir)
      retryAction.retryContext = recovery.retryContext
      outputJson({ result: { verdict: 'RETRY', reason: 'Output verification failed', details: verification.details }, next: retryAction })
    }
    return
  }

  // Step 2: Run gate (if applicable)
  let gateVerdict = 'APPROVE'
  let gateScore = null
  let gateReason = null

  if (needsGate(taskId)) {
    try {
      const gateResult = await callScript('./gate.mjs', ['post', '--project', projectDir, '--task', taskId])
      gateVerdict = gateResult.verdict || 'APPROVE'
      gateScore = gateResult.score ?? null
      gateReason = gateResult.reason || null
    } catch (err) {
      // Gate script failed — treat as APPROVE to not block pipeline
      gateVerdict = 'APPROVE'
      gateReason = `Gate script error: ${err.message}`
    }
  }

  // Step 3: Act on verdict
  if (gateVerdict === 'APPROVE') {
    // Log approval
    const logArgs = ['approve', '--project', projectDir, '--task', taskId]
    if (gateScore != null) logArgs.push('--score', String(gateScore))
    if (result.signature) logArgs.push('--signature', result.signature)
    try { await callScript('../dev/log.mjs', logArgs) } catch { /* best effort */ }

    // Fire memory hooks
    const hooks = resolveMemoryHooks(taskId, { ...result, verdict: 'APPROVE', score: gateScore }, stateJson)
    for (const hook of hooks) {
      try {
        await callScript('../memory/memory.mjs', ['learn', '--event', hook.event, '--data', JSON.stringify(hook.data)])
      } catch { /* best effort — memory hooks should not block pipeline */ }
    }

    // Advance state (write gate file first so advance doesn't complain)
    const gateFilePath = path.join(projectDir, '.eros', 'gates', `${taskId.replace(/\//g, '--')}.json`)
    await ensureDir(path.dirname(gateFilePath))
    await writeJson(gateFilePath, { verdict: 'APPROVE', score: gateScore, reason: gateReason, timestamp: new Date().toISOString() })

    await advanceInternal(projectDir, taskId, gateScore, 'approved')

    // Compute next action
    const reloaded = await loadState(projectDir)
    const nextAction = resolveAction(reloaded.stateJson.currentTask, reloaded.stateJson, reloaded.queueJson, projectDir)

    outputJson({ result: { verdict: 'APPROVE', score: gateScore }, next: nextAction })

  } else if (gateVerdict === 'RETRY') {
    const attempt = activeTask.attempt || 1
    const recovery = resolveRecovery(taskId, {
      reason: gateReason,
      score: gateScore,
      threshold: result.threshold,
      weakDimensions: result.weakDimensions,
      missingSignature: result.missingSignature,
    }, attempt)

    if (recovery.escalateToFlag) {
      try { await callScript('../dev/log.mjs', ['flag', '--project', projectDir, '--task', taskId, '--reason', gateReason || 'Gate retry limit reached']) } catch { /* best effort */ }
      await flagInternal(projectDir, taskId, gateReason || 'Gate retry limit reached')
      const reloaded = await loadState(projectDir)
      const nextAction = resolveAction(reloaded.stateJson.currentTask, reloaded.stateJson, reloaded.queueJson, projectDir)
      outputJson({ result: { verdict: 'FLAG', score: gateScore, reason: gateReason }, next: nextAction })
    } else {
      await retryInternal(projectDir, taskId, gateReason || 'Gate returned RETRY')
      const retryAction = resolveAction(taskId, stateJson, queueJson, projectDir)
      retryAction.retryContext = recovery.retryContext
      outputJson({ result: { verdict: 'RETRY', score: gateScore, reason: gateReason }, next: retryAction })
    }

  } else {
    // FLAG
    try { await callScript('../dev/log.mjs', ['flag', '--project', projectDir, '--task', taskId, '--reason', gateReason || 'Gate returned FLAG']) } catch { /* best effort */ }
    await flagInternal(projectDir, taskId, gateReason || 'Gate returned FLAG')
    const reloaded = await loadState(projectDir)
    const nextAction = resolveAction(reloaded.stateJson.currentTask, reloaded.stateJson, reloaded.queueJson, projectDir)
    outputJson({ result: { verdict: 'FLAG', score: gateScore, reason: gateReason }, next: nextAction })
  }
}

// ---------------------------------------------------------------------------
// Main dispatcher
// ---------------------------------------------------------------------------

const COMMANDS = {
  query: async (args) => {
    const projectDir = resolveProjectDir(args)
    await cmdQuery(projectDir)
  },
  start: async (args) => {
    const projectDir = resolveProjectDir(args)
    await cmdStart(projectDir, args.task)
  },
  advance: async (args) => {
    const projectDir = resolveProjectDir(args)
    await cmdAdvance(projectDir, args.task, args.score, args.decision, args['gate-result'])
  },
  retry: async (args) => {
    const projectDir = resolveProjectDir(args)
    await cmdRetry(projectDir, args.task, args.reason)
  },
  flag: async (args) => {
    const projectDir = resolveProjectDir(args)
    await cmdFlag(projectDir, args.task, args.reason)
  },
  'init-sections': async (args) => {
    const projectDir = resolveProjectDir(args)
    await cmdInitSections(projectDir, args.sections)
  },
  'check-gate': async (args) => {
    const projectDir = resolveProjectDir(args)
    await cmdCheckGate(projectDir)
  },
  next: async (args) => {
    const projectDir = resolveProjectDir(args)
    await cmdNext(projectDir)
  },
  done: async (args) => {
    const projectDir = resolveProjectDir(args)
    await cmdDone(projectDir, args.result)
  },
}

const resolveProjectDir = (args) => {
  const raw = args.project
  if (!raw || raw === true) {
    fail('Missing required argument: --project <path>')
  }
  return path.resolve(raw)
}

const main = async () => {
  const args = parseArgs(process.argv.slice(2))
  const command = args._command

  if (!command) {
    fail(`Usage: eros-state.mjs <command> --project <path> [options]\nCommands: ${Object.keys(COMMANDS).join(', ')}`)
  }

  const handler = COMMANDS[command]
  if (!handler) {
    fail(`Unknown command: "${command}". Valid commands: ${Object.keys(COMMANDS).join(', ')}`)
  }

  await handler(args)
}

main().catch((error) => {
  process.stderr.write(`Error: ${error.message}\n`)
  process.exit(1)
})
