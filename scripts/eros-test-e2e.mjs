#!/usr/bin/env node
/**
 * eros-test-e2e.mjs — End-to-end integration test for the Eros brain pipeline.
 *
 * Simulates a project lifecycle through all eros-* scripts:
 *   1. State machine transitions (query → start → advance)
 *   2. Memory operations (learn → interpret → threshold)
 *   3. Gate checks (pre → post)
 *   4. Logging (approve → decision)
 *   5. Training (init → rate → calibrate)
 *
 * Creates a temp project directory, runs through the pipeline, verifies results.
 * Cleans up after itself.
 *
 * Usage: node eros-test-e2e.mjs
 */

import { promises as fs } from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { execFile } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let passed = 0
let failed = 0
const errors = []

const assert = (condition, msg) => {
  if (condition) {
    passed++
    process.stdout.write(`  \x1b[32m✓\x1b[0m ${msg}\n`)
  } else {
    failed++
    errors.push(msg)
    process.stdout.write(`  \x1b[31m✗\x1b[0m ${msg}\n`)
  }
}

const run = (script, args) => {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, script)
    execFile('node', [scriptPath, ...args], { cwd: __dirname }, (err, stdout, stderr) => {
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

const readJson = async (filePath) => {
  try {
    return JSON.parse(await fs.readFile(filePath, 'utf8'))
  } catch {
    return null
  }
}

const exists = async (filePath) => {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

const main = async () => {
  // Create temp project directory
  const tmpDir = path.join(os.tmpdir(), `eros-test-${Date.now()}`)
  const brainDir = path.join(tmpDir, '.brain')

  process.stdout.write(`\n\x1b[1mEros V7 — End-to-End Integration Test\x1b[0m\n`)
  process.stdout.write(`Project: ${tmpDir}\n\n`)

  try {
    // Bootstrap minimal project structure
    await fs.mkdir(path.join(brainDir, 'context'), { recursive: true })
    await fs.mkdir(path.join(brainDir, 'reports'), { recursive: true })
    await fs.mkdir(path.join(brainDir, 'evaluations'), { recursive: true })
    await fs.mkdir(path.join(brainDir, 'observer', 'localhost'), { recursive: true })
    await fs.mkdir(path.join(brainDir, 'reports', 'quality'), { recursive: true })
    await fs.mkdir(path.join(tmpDir, 'src', 'components', 'sections'), { recursive: true })
    await fs.mkdir(path.join(tmpDir, 'src', 'router'), { recursive: true })
    await fs.mkdir(path.join(tmpDir, 'src', 'views'), { recursive: true })
    await fs.mkdir(path.join(tmpDir, 'docs', 'pages'), { recursive: true })

    // Write initial state + queue (as if init-project ran)
    const initialState = {
      project: { name: 'Test Project', slug: 'test-project', type: 'portfolio' },
      mode: 'autonomous',
      currentPhase: 'discovery',
      currentTask: 'setup/identity',
      taskStatus: 'pending',
      attempt: 0,
      healthIndex: 50,
      maturityScore: 0,
      retriesUsed: 0,
      retryBudget: 6,
      filesCreated: 0,
      sections: { done: 0, total: 0 },
      blocker: null,
      nextAction: null,
      lastUpdated: new Date().toISOString(),
    }

    const initialQueue = {
      active: [],
      pending: [
        { id: 'setup/identity', agent: 'ceo', status: 'pending' },
        { id: 'design/brief', agent: 'ceo', status: 'pending' },
        { id: 'design/tokens', agent: 'designer', status: 'pending' },
        { id: 'design/pages', agent: 'designer', status: 'pending' },
      ],
      done: [],
    }

    await fs.writeFile(path.join(brainDir, 'state.json'), JSON.stringify(initialState, null, 2))
    await fs.writeFile(path.join(brainDir, 'state.md'), '# Brain State\n- **Phase:** discovery\n')
    await fs.writeFile(path.join(brainDir, 'queue.json'), JSON.stringify(initialQueue, null, 2))
    await fs.writeFile(path.join(brainDir, 'queue.md'), '# Task Queue\n')
    await fs.writeFile(path.join(brainDir, 'identity.md'), '# Identity: Test Project\n- **Type:** portfolio\n')

    // ─── TEST 1: State Query ───
    process.stdout.write(`\x1b[1m1. State Machine\x1b[0m\n`)

    const queryResult = await run('eros-state.mjs', ['query', '--project', tmpDir])
    assert(queryResult.phase === 'discovery', 'query returns correct phase')
    assert(queryResult.queue.pending === 4, 'query shows 4 pending tasks')

    // ─── TEST 2: Start Task ───
    const startResult = await run('eros-state.mjs', ['start', '--project', tmpDir, '--task', 'setup/identity'])
    assert(startResult.status === 'in_progress', 'start marks task in_progress')
    assert(startResult.attempt === 1, 'start sets attempt to 1')

    // ─── TEST 3: Gate Pre-Check ───
    process.stdout.write(`\n\x1b[1m2. Gate Engine\x1b[0m\n`)

    const preResult = await run('eros-gate.mjs', ['pre', '--project', tmpDir, '--task', 'setup/identity'])
    assert(preResult.pass === true, 'pre-gate passes for setup/identity')

    // ─── TEST 4: Gate Post-Check ───
    const postResult = await run('eros-gate.mjs', ['post', '--project', tmpDir, '--task', 'setup/identity'])
    assert(postResult.verdict === 'APPROVE', 'post-gate approves setup/identity (identity.md exists)')

    // Verify gate file was written
    const gateFile = path.join(brainDir, 'gates', 'setup--identity.json')
    assert(await exists(gateFile), 'gate result file written to .brain/gates/')

    // ─── TEST 5: Advance (with gate enforcement) ───
    const advanceResult = await run('eros-state.mjs', [
      'advance', '--project', tmpDir, '--task', 'setup/identity',
      '--decision', 'approved',
    ])
    assert(advanceResult.previousTask === 'setup/identity', 'advance records previous task')
    assert(advanceResult.newTask === 'design/brief', 'advance finds next pending task')

    // Verify queue state
    const queueAfter = await readJson(path.join(brainDir, 'queue.json'))
    assert(queueAfter.done.length === 1, 'queue.json has 1 done task')
    assert(queueAfter.pending.length === 3, 'queue.json has 3 pending tasks')

    // ─── TEST 6: Memory Interpret ───
    process.stdout.write(`\n\x1b[1m3. Memory Engine\x1b[0m\n`)

    const interpretResult = await run('eros-memory.mjs', ['interpret', '--task-type', 'design', '--mood', 'dark cinematic'])
    assert(interpretResult.insightsMarkdown.includes('## Memory Insights'), 'interpret returns insights markdown')
    assert(interpretResult.relevantRules.length > 0, 'interpret returns relevant rules')

    // ─── TEST 7: Memory Threshold ───
    const thresholdResult = await run('eros-memory.mjs', ['threshold', '--section-type', 'hero'])
    assert(thresholdResult.scoreMinimum > 7.0, 'hero threshold is above default')
    assert(thresholdResult.dataPoints > 0, 'threshold has historical data points')

    // ─── TEST 8: Memory Learn ───
    const learnResult = await run('eros-memory.mjs', [
      'learn', '--event', 'font_selected',
      '--data', JSON.stringify({
        project: 'test-project',
        mood: 'dark cinematic',
        display: 'Test Display Font',
        body: 'Test Body Font',
        reaction: 'test-approved',
        lesson: 'E2E test font pairing',
      }),
    ])
    assert(learnResult.written.includes('font-pairings.json'), 'learn writes to font-pairings.json')

    // ─── TEST 9: Schema Validation ───
    let schemaFailed = false
    try {
      await run('eros-memory.mjs', ['learn', '--event', 'font_selected', '--data', '{}'])
    } catch {
      schemaFailed = true
    }
    assert(schemaFailed, 'learn rejects empty data with schema validation')

    // ─── TEST 10: Memory Stats ───
    const statsResult = await run('eros-memory.mjs', ['stats'])
    assert(statsResult.totalDataPoints > 40, 'stats shows 40+ data points')
    assert(statsResult.fontPairings.works >= 3, 'font pairings has 3+ works')

    // ─── TEST 11: Logging ───
    process.stdout.write(`\n\x1b[1m4. Logging\x1b[0m\n`)

    const approveLog = await run('eros-log.mjs', [
      'approve', '--project', tmpDir, '--task', 'setup/identity',
      '--score', '8.0', '--signature', 'test-signature',
    ])
    assert(approveLog.logged === 'approve', 'approve log recorded')

    const decisionLog = await run('eros-log.mjs', [
      'decision', '--project', tmpDir, '--id', 'D-001',
      '--topic', 'Font Pairing', '--phase', 'Phase 1',
      '--choice', 'Test Display + Test Body', '--lesson', 'E2E test',
    ])
    assert(decisionLog.logged === 'decision', 'decision log recorded')

    // Verify files exist
    assert(await exists(path.join(brainDir, 'approvals.md')), 'approvals.md created')
    assert(await exists(path.join(brainDir, 'decisions.md')), 'decisions.md created')

    // ─── TEST 12: Init Sections ───
    process.stdout.write(`\n\x1b[1m5. Section Pipeline\x1b[0m\n`)

    const initResult = await run('eros-state.mjs', [
      'init-sections', '--project', tmpDir, '--sections', 'S-Hero,S-Features',
    ])
    assert(initResult.sectionsAdded === 2, 'init-sections adds 2 sections')
    assert(initResult.tasksGenerated === 10, 'init-sections generates 10 tasks (4*2 + 2 reviews)')

    // ─── TEST 13: Completion Gate (should fail) ───
    process.stdout.write(`\n\x1b[1m6. Completion Gate\x1b[0m\n`)

    const completionResult = await run('eros-gate.mjs', ['completion', '--project', tmpDir])
    assert(completionResult.passed === false, 'completion gate fails (project not complete)')
    assert(completionResult.recoveryActions.length > 0, 'completion gate suggests recovery actions')

    // ─── TEST 14: Training ───
    process.stdout.write(`\n\x1b[1m7. Training System\x1b[0m\n`)

    // Create fake completed project data for training
    const fakeQueue = {
      active: [],
      pending: [],
      done: [
        { id: 'build/S-Hero', agent: 'builder', status: 'done', score: 8.0, decision: 'approved' },
        { id: 'build/S-Features', agent: 'builder', status: 'done', score: 7.5, decision: 'approved' },
      ],
    }
    await fs.writeFile(path.join(brainDir, 'queue.json'), JSON.stringify(fakeQueue, null, 2))

    const trainInit = await run('eros-train.mjs', ['init', '--project', tmpDir])
    assert(trainInit.sectionsToReview === 2, 'training init finds 2 sections')
    assert(await exists(path.join(brainDir, 'training', 'session.json')), 'session.json created')
    assert(await exists(path.join(brainDir, 'training', 'feedback.json')), 'feedback.json template created')

    // Rate a section
    const rateResult = await run('eros-train.mjs', [
      'rate', '--project', tmpDir, '--section', 'S-Hero',
      '--rating', '9', '--feedback', 'Excellent depth',
    ])
    assert(rateResult.userRating === 9, 'rate records user rating')
    assert(rateResult.delta === 1.0, 'rate computes correct delta (9 - 8 = +1)')

    // Calibrate
    // First update feedback.json to have ratings
    const feedback = await readJson(path.join(brainDir, 'training', 'feedback.json'))
    feedback.sections[0].userRating = 9
    feedback.sections[0].brainScore = 8.0
    feedback.sections[1].userRating = 7
    feedback.sections[1].brainScore = 7.5
    await fs.writeFile(path.join(brainDir, 'training', 'feedback.json'), JSON.stringify(feedback, null, 2))

    const calResult = await run('eros-train.mjs', ['calibrate', '--project', tmpDir])
    assert(calResult.calibration.sampleSize === 2, 'calibrate uses 2 samples')
    assert(typeof calResult.calibration.avgDelta === 'number', 'calibrate computes avg delta')

    // ─── TEST 15: Retry + Flag ───
    process.stdout.write(`\n\x1b[1m8. Retry & Flag\x1b[0m\n`)

    // Reset queue with a task to retry
    const retryQueue = {
      active: [{ id: 'build/S-Test', agent: 'builder', status: 'in_progress', attempt: 1 }],
      pending: [{ id: 'observe/S-Test', agent: 'ceo', status: 'pending' }],
      done: [],
    }
    await fs.writeFile(path.join(brainDir, 'queue.json'), JSON.stringify(retryQueue, null, 2))
    const retryState = { ...initialState, currentTask: 'build/S-Test', taskStatus: 'in_progress', attempt: 1 }
    await fs.writeFile(path.join(brainDir, 'state.json'), JSON.stringify(retryState, null, 2))

    const retryResult = await run('eros-state.mjs', [
      'retry', '--project', tmpDir, '--task', 'build/S-Test', '--reason', 'depth WEAK',
    ])
    assert(retryResult.attempt === 2, 'retry increments attempt to 2')
    assert(retryResult.escalated === false, 'retry does not escalate at attempt 2')

    // Retry again — should auto-escalate to flag
    const retryResult2 = await run('eros-state.mjs', [
      'retry', '--project', tmpDir, '--task', 'build/S-Test', '--reason', 'still WEAK',
    ])
    assert(retryResult2.status === 'flagged', 'retry auto-escalates to flag after max retries')

    // ─── RESULTS ───
    process.stdout.write(`\n${'═'.repeat(50)}\n`)
    process.stdout.write(`\x1b[1mResults: ${passed} passed, ${failed} failed\x1b[0m\n`)

    if (failed > 0) {
      process.stdout.write(`\n\x1b[31mFailed tests:\x1b[0m\n`)
      for (const err of errors) {
        process.stdout.write(`  - ${err}\n`)
      }
    }

    process.stdout.write(`${'═'.repeat(50)}\n\n`)

  } finally {
    // Cleanup temp directory
    try {
      await fs.rm(tmpDir, { recursive: true, force: true })
    } catch { /* ignore cleanup errors */ }

    // Cleanup test font pairing we added
    // (we wrote a test entry to the real memory — remove it)
    try {
      const memDir = path.join(__dirname, '..', '.claude', 'memory', 'design-intelligence')
      const fp = JSON.parse(await fs.readFile(path.join(memDir, 'font-pairings.json'), 'utf8'))
      fp.works = fp.works.filter(w => w.project !== 'test-project')
      await fs.writeFile(path.join(memDir, 'font-pairings.json'), JSON.stringify(fp, null, 2) + '\n')
    } catch { /* ignore */ }
  }

  process.exit(failed > 0 ? 1 : 0)
}

main().catch((err) => {
  process.stderr.write(`Fatal: ${err.message}\n${err.stack}\n`)
  process.exit(1)
})
