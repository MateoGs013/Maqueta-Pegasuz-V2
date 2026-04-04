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
} from './eros-utils.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const MEMORY_DIR = path.resolve(__dirname, '..', '.claude', 'memory', 'design-intelligence')
const PRACTICE_DIR = path.join(MEMORY_DIR, 'practice')

// ---------------------------------------------------------------------------
// Helper: call script
// ---------------------------------------------------------------------------

const callScript = (script, args) => {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, script)
    execFile('node', [scriptPath, ...args], { cwd: __dirname, timeout: 30000 }, (err, stdout, stderr) => {
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
  const gaps = await callScript('eros-meta.mjs', ['gaps'])

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
  const weakTypes = gaps.weakSectionTypes || []
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
  const techniqueChallenge = gaps.untouchedTechniques?.[0] || 'Stagger cascade'

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
// Subcommand: run — execute full pipeline on practice project
// ---------------------------------------------------------------------------

const cmdRun = async (briefPath) => {
  if (!briefPath) fail('Missing --brief argument (path to practice brief JSON).')

  const brief = await readJson(briefPath)
  if (!brief) fail(`Could not read brief at ${briefPath}`)

  // This would create a temp project, run the full next/done loop,
  // reflect, correct, and store results. For safety, we only generate
  // the execution plan here — actual execution requires Claude's loop.
  //
  // In practice, the user triggers this via: /project (with practice brief)
  // and Eros runs the pipeline. The practice script just tracks results.

  out({
    status: 'ready',
    brief,
    instructions: [
      `1. Create project: node init-project.mjs --brief-file "${briefPath}" --project "$DESKTOP/${brief.id}"`,
      `2. Run the pipeline: loop next → execute → done until complete`,
      `3. After completion: node eros-meta.mjs reflect --project "$DESKTOP/${brief.id}"`,
      `4. Auto-correct: node eros-train.mjs correct --project "$DESKTOP/${brief.id}"`,
      `5. Record result: node eros-practice.mjs record --brief "${briefPath}" --result '{...}'`,
    ],
    note: 'Practice run orchestration happens through the normal next/done loop. This script generates the brief and tracks results.',
  })
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
