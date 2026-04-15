#!/usr/bin/env node

/**
 * eros-practice.mjs — Auto-training engine for Eros V8.
 *
 * Eros generates practice projects targeting its weaknesses,
 * executes the full pipeline, reflects, and learns — autonomously.
 *
 * Subcommands:
 *   generate            — create a practice brief targeting top weaknesses
 *   run --brief <path>  — execute full pipeline on practice project
 *   history             — list all practice runs with results
 */

import path from 'node:path'
import { promises as fs } from 'node:fs'
import { execFile } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import {
  parseArgs,
  readJson,
  writeJson,
  ensureDir,
  out,
  fail,
  today,
} from '../lib/utils.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const MEMORY_DIR = path.resolve(__dirname, '..', '..', '.eros', 'memory', 'design-intelligence')
const PRACTICE_DIR = path.join(MEMORY_DIR, 'practice')

// ---------------------------------------------------------------------------
// Helper: call script
// ---------------------------------------------------------------------------

const callScript = (script, args) => {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, script)
    execFile(process.execPath, [scriptPath, ...args], { cwd: __dirname, timeout: 30000 }, (err, stdout, stderr) => {
      if (err) {
        reject(new Error(`${script}: ${stderr || err.message}`))
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
// Subcommand: generate — create practice brief from gap analysis
// ---------------------------------------------------------------------------

const cmdGenerate = async () => {
  await ensureDir(PRACTICE_DIR)

  // Get gap analysis
  const gaps = await callScript('./meta.mjs', ['gaps'])

  // Load last practice to enforce anti-convergence
  const history = await loadHistory()
  const lastPractice = history.length > 0 ? history[history.length - 1] : null
  const lastMood = lastPractice?.brief?.mood || ''
  const lastSections = (lastPractice?.brief?.sections || []).map(s => s.toLowerCase())

  // Pick mood (anti-convergence: different from last)
  const allMoods = ['dark cinematic', 'light minimal', 'editorial', 'brutalist', 'playful', 'organic', 'luxury', 'retro futuristic', 'corporate', 'neo-brutalist']
  let mood = gaps.moodBlindSpots?.[0] || allMoods[Math.floor(Math.random() * allMoods.length)]
  if (mood === lastMood.split(' ')[0]) {
    // Rotate to next mood
    const idx = allMoods.findIndex(m => m.startsWith(mood))
    mood = allMoods[(idx + 1) % allMoods.length]
  }

  // Pick sections (target weakest types, at least 3)
  const weakTypes = (gaps.weakSectionTypes || []).map(t => typeof t === 'string' ? t : t.type)
  const selectedSections = ['hero'] // Always include hero
  for (const type of weakTypes) {
    if (type !== 'hero' && selectedSections.length < 4 && !lastSections.includes(type)) {
      selectedSections.push(type)
    }
  }
  // Fill to at least 3
  const fallbackTypes = ['features', 'about', 'cta', 'testimonials', 'portfolio']
  for (const t of fallbackTypes) {
    if (selectedSections.length >= 3) break
    if (!selectedSections.includes(t)) selectedSections.push(t)
  }

  // Pick technique challenge (untouched or low-evidence)
  const rawTech = gaps.untouchedTechniques?.[0]
  const techniqueChallenge = (typeof rawTech === 'string' ? rawTech : rawTech?.name) || 'Stagger cascade'

  // Generate practice ID
  const id = `practice-${Date.now()}`

  // Build brief
  const brief = {
    id,
    name: `Practice ${history.length + 1}`,
    type: 'practice',
    mood,
    sections: selectedSections.map(t => `S-${t.charAt(0).toUpperCase() + t.slice(1)}`),
    techniqueChallenge,
    objective: `Fill gaps: ${mood} theme + ${selectedSections.filter(s => s !== 'hero').join(' + ')} + ${techniqueChallenge}`,
    targetGaps: {
      mood: gaps.moodBlindSpots?.includes(mood.split(' ')[0]),
      sectionTypes: selectedSections.filter(s => weakTypes.includes(s)),
      technique: gaps.untouchedTechniques?.includes(techniqueChallenge),
    },
    createdAt: new Date().toISOString(),
  }

  // Save brief
  const briefPath = path.join(PRACTICE_DIR, `${id}.json`)
  await writeJson(briefPath, brief)

  out({
    brief,
    briefPath,
    gapsCovered: Object.values(brief.targetGaps).filter(Boolean).length,
    totalGaps: 3,
  })
}

// ---------------------------------------------------------------------------
// Subcommand: run — execute full pipeline end-to-end via auto-train
// ---------------------------------------------------------------------------
// Previously this was a stub that printed instructions. Now it actually
// spawns eros-auto-train.mjs --count 1, which runs all 10 phases (discover
// → brief → build → server → observer → audit → gates → retry → learn →
// cleanup). The practice brief (if provided via --brief) is used for
// tracking, but auto-train generates its own brief with anti-convergence
// logic already built in — meaning two practice runs won't repeat the
// same mood/technique. The practice script records the final result
// back into the brief file for history tracking.

const runAutoTrain = (count = 1, maxRetries = 1) => {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, 'eros-auto-train.mjs')
    process.stderr.write(`[eros-practice] spawning auto-train --count ${count} --max-retries ${maxRetries}\n`)
    const child = execFile(
      process.execPath,
      [scriptPath, '--count', String(count), '--max-retries', String(maxRetries)],
      {
        cwd: __dirname,
        timeout: 3600000, // 1h max for a full practice session
        maxBuffer: 20 * 1024 * 1024,
      },
      (err, stdout) => {
        if (err) {
          reject(new Error(`auto-train failed: ${err.message.slice(0, 300)}`))
          return
        }
        try { resolve(JSON.parse(stdout)) } catch { resolve({ raw: stdout }) }
      },
    )
    // Stream stderr so the caller sees live progress from auto-train
    if (child.stderr) {
      child.stderr.on('data', (chunk) => process.stderr.write(chunk))
    }
  })
}

const cmdRun = async (briefPath) => {
  // A --brief argument is optional. When provided, we record the result
  // back into that specific brief file. Without one, we still run and
  // log the result but don't persist against a named practice entry.
  let brief = null
  if (briefPath) {
    brief = await readJson(briefPath)
    if (!brief) fail(`Could not read brief at ${briefPath}`)
    process.stderr.write(`[eros-practice] recording against brief: ${brief.id || briefPath}\n`)
  }

  const startedAt = new Date().toISOString()
  let result
  try {
    result = await runAutoTrain(1, 1)
  } catch (err) {
    fail(err.message)
  }

  const finishedAt = new Date().toISOString()

  // Extract practical result summary from auto-train output
  const sessionResult = (result.results && result.results[0]) || {}
  const summary = {
    startedAt,
    finishedAt,
    briefId: sessionResult.brief || brief?.id || null,
    duration: sessionResult.duration || null,
    audit: sessionResult.audit || null,
    gates: sessionResult.gates || null,
    rulesValidated: sessionResult.rulesValidated || null,
    memoryGrowth: result.growth || 0,
  }

  // If we had a specific practice brief, update it with the run result
  if (brief && briefPath) {
    brief.completedAt = finishedAt
    brief.result = {
      avgScore: null, // auto-train returns audit, not per-section avg
      sectionsCompleted: summary.gates?.approved || 0,
      sectionsFlagged: summary.gates?.flagged || 0,
      gapsFilled: brief.targetGaps ? Object.keys(brief.targetGaps).filter((k) => brief.targetGaps[k]) : [],
      notes: `audit ${summary.audit?.pct ?? '?'}% · ${summary.duration ?? '?'}s`,
      autoTrainResult: summary,
    }
    try {
      await writeJson(path.join(PRACTICE_DIR, `${brief.id}.json`), brief)
    } catch { /* don't fail on record write */ }
  }

  out({ status: 'complete', summary, briefUpdated: !!brief })
}

// ---------------------------------------------------------------------------
// Subcommand: record — save practice run result
// ---------------------------------------------------------------------------

const cmdRecord = async (briefPath, resultArg) => {
  if (!briefPath) fail('Missing --brief argument.')

  const brief = await readJson(briefPath)
  if (!brief) fail(`Could not read brief at ${briefPath}`)

  let result = {}
  if (resultArg && resultArg !== true) {
    try { result = JSON.parse(resultArg) } catch { result = { note: resultArg } }
  }

  // Update brief with results
  brief.completedAt = new Date().toISOString()
  brief.result = {
    avgScore: result.avgScore || null,
    sectionsCompleted: result.sectionsCompleted || 0,
    sectionsFlagged: result.sectionsFlagged || 0,
    gapsFilled: result.gapsFilled || [],
    notes: result.notes || '',
  }

  await writeJson(path.join(PRACTICE_DIR, `${brief.id}.json`), brief)

  out({ recorded: true, brief })
}

// ---------------------------------------------------------------------------
// Subcommand: history — list all practice runs
// ---------------------------------------------------------------------------

const loadHistory = async () => {
  await ensureDir(PRACTICE_DIR)
  try {
    const files = await fs.readdir(PRACTICE_DIR)
    const briefs = []
    for (const f of files.filter(f => f.startsWith('practice-') && f.endsWith('.json'))) {
      const data = await readJson(path.join(PRACTICE_DIR, f))
      if (data) briefs.push(data)
    }
    return briefs.sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''))
  } catch {
    return []
  }
}

const cmdHistory = async () => {
  const history = await loadHistory()

  const summary = history.map(b => ({
    id: b.id,
    name: b.name,
    mood: b.mood,
    sections: b.sections,
    technique: b.techniqueChallenge,
    objective: b.objective,
    completed: !!b.completedAt,
    avgScore: b.result?.avgScore || null,
    createdAt: b.createdAt,
  }))

  out({
    totalRuns: history.length,
    completed: history.filter(b => b.completedAt).length,
    history: summary,
  })
}

// ---------------------------------------------------------------------------
// Main dispatcher
// ---------------------------------------------------------------------------

const COMMANDS = {
  generate: async () => await cmdGenerate(),
  run: async (args) => await cmdRun(args.brief),
  record: async (args) => await cmdRecord(args.brief, args.result),
  history: async () => await cmdHistory(),
}

const main = async () => {
  const args = parseArgs(process.argv.slice(2))
  const command = args._command

  if (!command) {
    fail(`Usage: eros-practice.mjs <command> [options]\nCommands: ${Object.keys(COMMANDS).join(', ')}`)
  }

  const handler = COMMANDS[command]
  if (!handler) {
    fail(`Unknown command: "${command}". Valid: ${Object.keys(COMMANDS).join(', ')}`)
  }

  await handler(args)
}

main().catch((error) => {
  process.stderr.write(`Error: ${error.message}\n`)
  process.exit(1)
})
