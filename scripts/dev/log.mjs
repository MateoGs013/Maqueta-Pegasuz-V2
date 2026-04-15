import { promises as fs } from 'node:fs'
import path from 'node:path'
import {
  parseArgs,
  ensureDir,
  readText,
  out,
  fail,
} from '../lib/utils.mjs'

// ---------------------------------------------------------------------------
// eros-log.mjs — Decision & Approval Logger
//
// Single authority for writing to approvals.md and decisions.md.
// Claude never writes to these files directly.
//
// Subcommands:
//   approve   — log an auto-approval
//   flag      — log a needs-review flag
//   decision  — log a creative/strategic decision
//   quality-gate — log Phase 5 completion gate result
// ---------------------------------------------------------------------------

const appendLine = async (filePath, line) => {
  await ensureDir(path.dirname(filePath))
  const existing = await readText(filePath)
  if (existing === null) {
    await fs.writeFile(filePath, line.trimEnd() + '\n', 'utf8')
  } else {
    await fs.writeFile(filePath, existing.trimEnd() + '\n' + line.trimEnd() + '\n', 'utf8')
  }
}

const timestamp = () => new Date().toISOString().slice(0, 19).replace('T', ' ')
const dateStamp = () => new Date().toISOString().slice(0, 10)

// ---------------------------------------------------------------------------
// Subcommands
// ---------------------------------------------------------------------------

const cmdApprove = async (args) => {
  const project = args.project
  if (!project) fail('--project is required')
  const task = args.task
  if (!task) fail('--task is required')

  const score = args.score || '—'
  const signature = args.signature || '—'
  const verdict = args.verdict || 'approved'
  const ts = timestamp()

  const approvalsPath = path.join(project, '.brain', 'approvals.md')
  const existing = await readText(approvalsPath)

  // Create header if file is new
  const projectName = path.basename(project)
  if (!existing) {
    const header = `# Auto-Approvals — ${projectName}\n`
    await fs.mkdir(path.dirname(approvalsPath), { recursive: true })
    await fs.writeFile(approvalsPath, header, 'utf8')
  }

  const entry = `## [AUTO-APPROVED] ${task} | score: ${score} | signature: ${signature} | ${ts}`
  await appendLine(approvalsPath, entry)

  out({ logged: 'approve', task, score, signature, verdict, timestamp: ts })
}

const cmdFlag = async (args) => {
  const project = args.project
  if (!project) fail('--project is required')
  const task = args.task
  if (!task) fail('--task is required')

  const reason = args.reason || 'unknown'
  const attempts = args.attempts || '?'
  const score = args.score || '—'
  const ts = timestamp()

  const approvalsPath = path.join(project, '.brain', 'approvals.md')
  const existing = await readText(approvalsPath)

  const projectName = path.basename(project)
  if (!existing) {
    const header = `# Auto-Approvals — ${projectName}\n`
    await fs.mkdir(path.dirname(approvalsPath), { recursive: true })
    await fs.writeFile(approvalsPath, header, 'utf8')
  }

  const entry = `## [NEEDS-REVIEW] ${task} | failed: ${reason} | ${attempts} retries | score: ${score} | ${ts}`
  await appendLine(approvalsPath, entry)

  out({ logged: 'flag', task, reason, attempts, score, timestamp: ts })
}

const cmdDecision = async (args) => {
  const project = args.project
  if (!project) fail('--project is required')
  const id = args.id
  if (!id) fail('--id is required (e.g., D-001)')

  const topic = args.topic || 'unknown'
  const phase = args.phase || '—'
  const choice = args.choice || '—'
  const decisionPath = args.path || '—'
  const lesson = args.lesson || '—'
  const user = args.user || 'pending'

  const decisionsPath = path.join(project, '.brain', 'decisions.md')
  const existing = await readText(decisionsPath)

  const projectName = path.basename(project)
  if (!existing) {
    const header = `# Decisions — ${projectName}\n`
    await fs.mkdir(path.dirname(decisionsPath), { recursive: true })
    await fs.writeFile(decisionsPath, header, 'utf8')
  }

  const entry = [
    ``,
    `## ${id} | ${topic} | ${phase}`,
    `- **Choice:** ${choice}`,
    `- **Path:** ${decisionPath}`,
    `- **User:** ${user}`,
    `- **Learn:** ${lesson}`,
  ].join('\n')

  await appendLine(decisionsPath, entry)

  out({ logged: 'decision', id, topic, phase, choice, lesson })
}

const cmdQualityGate = async (args) => {
  const project = args.project
  if (!project) fail('--project is required')

  const score = args.score || '—'
  const passed = args.passed !== 'false'
  const ts = timestamp()

  const approvalsPath = path.join(project, '.brain', 'approvals.md')
  const existing = await readText(approvalsPath)

  const projectName = path.basename(project)
  if (!existing) {
    const header = `# Auto-Approvals — ${projectName}\n`
    await fs.mkdir(path.dirname(approvalsPath), { recursive: true })
    await fs.writeFile(approvalsPath, header, 'utf8')
  }

  const status = passed ? 'PASSED' : 'BLOCKED'
  const entry = `## [QUALITY-GATE] Phase 5 completion | ${status} | score: ${score}/10 | ${ts}`
  await appendLine(approvalsPath, entry)

  out({ logged: 'quality-gate', passed, score, timestamp: ts })
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const main = async () => {
  const rawArgs = process.argv.slice(2)
  const subcommand = rawArgs[0]
  const args = parseArgs(rawArgs.slice(1))

  const commands = {
    approve: cmdApprove,
    flag: cmdFlag,
    decision: cmdDecision,
    'quality-gate': cmdQualityGate,
  }

  const handler = commands[subcommand]
  if (!handler) {
    fail(
      `Unknown subcommand: ${subcommand}\nUsage: node eros-log.mjs <approve|flag|decision|quality-gate> [options]`
    )
  }

  await handler(args)
}

main().catch((err) => {
  process.stderr.write(`Fatal: ${err.message}\n`)
  process.exit(1)
})
