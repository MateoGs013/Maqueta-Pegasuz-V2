#!/usr/bin/env node

/**
 * eros-meta.mjs — Metacognition engine for Eros V8.
 *
 * Eros knows what it doesn't know, reflects on completed projects,
 * and computes an evolving personality from accumulated experience.
 *
 * Subcommands:
 *   gaps        — analyze memory weaknesses and blind spots
 *   reflect     — post-project analysis (what worked, failed, was new)
 *   personality — compute aesthetic profile from all memory data
 */

import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  parseArgs,
  readJson,
  writeJson,
  readText,
  out,
  fail,
  today,
} from './eros-utils.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const MEMORY_DIR = path.resolve(__dirname, '..', '.claude', 'memory', 'design-intelligence')

// ---------------------------------------------------------------------------
// Memory loaders
// ---------------------------------------------------------------------------

const loadMemory = async () => ({
  sectionPatterns: (await readJson(path.join(MEMORY_DIR, 'section-patterns.json'))) ?? { patterns: [] },
  techniqueScores: (await readJson(path.join(MEMORY_DIR, 'technique-scores.json'))) ?? { techniques: [] },
  fontPairings: (await readJson(path.join(MEMORY_DIR, 'font-pairings.json'))) ?? { works: [], failures: [] },
  colorPalettes: (await readJson(path.join(MEMORY_DIR, 'color-palettes.json'))) ?? { works: [], failures: [] },
  signatures: (await readJson(path.join(MEMORY_DIR, 'signatures.json'))) ?? { approved: [], rejected: [] },
  revisionPatterns: (await readJson(path.join(MEMORY_DIR, 'revision-patterns.json'))) ?? { patterns: [] },
  pipelineLessons: (await readJson(path.join(MEMORY_DIR, 'pipeline-lessons.json'))) ?? { lessons: [] },
  rules: (await readJson(path.join(MEMORY_DIR, 'rules.json'))) ?? { rules: [], nextId: 1 },
  calibration: (await readJson(path.join(MEMORY_DIR, 'training-calibration.json'))) ?? { projects: [], globalBias: 0, thresholdAdjustment: 0 },
})

// ---------------------------------------------------------------------------
// Subcommand: gaps — analyze memory weaknesses
// ---------------------------------------------------------------------------

const cmdGaps = async () => {
  const mem = await loadMemory()

  // 1. Weak section types (< 3 data points)
  const sectionTypeCounts = {}
  for (const p of mem.sectionPatterns.patterns) {
    const t = p.sectionType || 'unknown'
    sectionTypeCounts[t] = (sectionTypeCounts[t] || 0) + 1
  }
  const allKnownTypes = ['hero', 'features', 'portfolio', 'about', 'pricing', 'testimonials', 'contact', 'cta', 'faq', 'team', 'services', 'process', 'stats']
  const weakSectionTypes = allKnownTypes.filter(t => (sectionTypeCounts[t] || 0) < 3)

  // 2. Untouched techniques (0 usages)
  const knownTechniques = [
    'SplitText char reveal', 'Clip-path image reveal', 'Stagger cascade', 'Pin + morph',
    'Parallax depth layers', 'ScrollTrigger scrub timeline', 'Spline 3D embed',
    'Horizontal scroll', 'Curtain/wipe reveal', 'Counter/number animation',
    'SVG path draw', 'Lottie animation', 'CSS scroll-driven animation',
    'Magnetic button', 'Text gradient animation', 'Noise/grain overlay animation',
  ]
  const usedTechniques = new Set(mem.techniqueScores.techniques.map(t => t.name))
  const untouchedTechniques = knownTechniques.filter(t => !usedTechniques.has(t))

  // 3. Low-confidence rules (< 3 validations)
  const lowConfidenceRules = mem.rules.rules
    .filter(r => r.status !== 'PROMOTED' && (r.validations || 0) < 3)
    .map(r => `${r.text} (${r.validations || 0}/3)`)

  // 4. Aesthetic bias (dark vs light canvas ratio)
  let darkCount = 0
  let lightCount = 0
  for (const p of mem.colorPalettes.works) {
    const canvas = (p.canvas || '').toLowerCase()
    if (canvas.includes('#0') || canvas.includes('#1') || canvas.includes('#2') || canvas.includes('dark') || canvas.includes('black')) {
      darkCount++
    } else {
      lightCount++
    }
  }
  const totalPalettes = darkCount + lightCount
  const aestheticBias = totalPalettes > 0
    ? `${Math.round(darkCount / totalPalettes * 100)}% dark themes, ${Math.round(lightCount / totalPalettes * 100)}% light themes`
    : 'No palette data'

  // 5. Mood blind spots
  const usedMoods = new Set()
  for (const p of mem.colorPalettes.works) if (p.mood) usedMoods.add(p.mood.split(/\s+/)[0])
  for (const p of mem.fontPairings.works) if (p.mood) usedMoods.add(p.mood.split(/\s+/)[0])
  const allMoods = ['dark', 'light', 'minimal', 'playful', 'editorial', 'brutalist', 'organic', 'corporate', 'luxury', 'retro', 'futuristic']
  const moodBlindSpots = allMoods.filter(m => !usedMoods.has(m))

  // 6. Suggestion
  const suggestions = []
  if (weakSectionTypes.length > 0) suggestions.push(`Practice ${weakSectionTypes[0]} sections`)
  if (untouchedTechniques.length > 0) suggestions.push(`Try ${untouchedTechniques[0]}`)
  if (moodBlindSpots.length > 0) suggestions.push(`Explore ${moodBlindSpots[0]} mood`)
  if (darkCount > lightCount * 3) suggestions.push('Build a light theme project')
  const suggestion = suggestions.length > 0
    ? suggestions.slice(0, 3).join('. ') + ' — fills multiple gaps at once.'
    : 'Memory is well-rounded. Continue building variety.'

  out({
    weakSectionTypes,
    untouchedTechniques,
    lowConfidenceRules,
    aestheticBias,
    moodBlindSpots,
    sectionTypeCounts,
    techniqueCount: mem.techniqueScores.techniques.length,
    totalDataPoints: mem.sectionPatterns.patterns.length + mem.techniqueScores.techniques.length +
      mem.fontPairings.works.length + mem.colorPalettes.works.length + mem.signatures.approved.length +
      mem.revisionPatterns.patterns.length + mem.rules.rules.length,
    suggestion,
  })
}

// ---------------------------------------------------------------------------
// Subcommand: reflect — post-project analysis
// ---------------------------------------------------------------------------

const cmdReflect = async (projectDir) => {
  if (!projectDir) fail('Missing --project argument.')

  const queueJson = await readJson(path.join(projectDir, '.brain', 'queue.json'))
  if (!queueJson) fail('No queue.json found — project may not be initialized.')

  const doneTasks = queueJson.done || []

  // What worked (high scores)
  const whatWorked = []
  for (const task of doneTasks) {
    if (task.score != null && task.score >= 8.0 && task.decision === 'approved') {
      whatWorked.push({ task: task.id, score: task.score })
    }
  }

  // What failed (retries/flags)
  const whatFailed = []
  for (const task of doneTasks) {
    if (task.status === 'flagged') {
      whatFailed.push({ task: task.id, reason: task.reason || 'unknown' })
    }
  }
  // Also check for tasks with attempt > 1 (had retries)
  for (const task of doneTasks) {
    if (task.attempt && task.attempt > 1 && task.decision === 'approved') {
      whatFailed.push({ task: task.id, reason: `Needed ${task.attempt} attempts` })
    }
  }

  // What was new (first use of technique/section type)
  const mem = await loadMemory()
  const existingSectionTypes = new Set(mem.sectionPatterns.patterns.map(p => p.sectionType))
  const whatWasNew = []
  for (const task of doneTasks) {
    if (/^build\/S-/.test(task.id)) {
      const name = task.id.replace('build/', '')
      const type = name.replace(/^S-/, '').replace(/([A-Z])/g, (_, c, i) => (i ? '-' : '') + c.toLowerCase())
      if (!existingSectionTypes.has(type)) {
        whatWasNew.push({ section: name, type, note: 'First time building this section type' })
      }
    }
  }

  // Confidence gains
  const confidenceGains = {}
  for (const task of doneTasks) {
    if (/^build\/S-/.test(task.id) && task.score != null) {
      const type = task.id.replace('build/S-', '').replace(/([A-Z])/g, (_, c, i) => (i ? '-' : '') + c.toLowerCase())
      const existing = mem.sectionPatterns.patterns.filter(p => p.sectionType === type)
      const prevAvg = existing.length > 0 ? existing.reduce((s, p) => s + (p.score || 0), 0) / existing.length : null
      if (prevAvg != null) {
        const delta = task.score - prevAvg
        if (Math.abs(delta) > 0.3) {
          confidenceGains[type] = `${prevAvg.toFixed(1)} → ${task.score} (${delta > 0 ? '+' : ''}${delta.toFixed(1)})`
        }
      } else {
        confidenceGains[type] = `NEW → ${task.score}`
      }
    }
  }

  // Summary stats
  const buildTasks = doneTasks.filter(t => /^build\/S-/.test(t.id) && t.score != null)
  const avgScore = buildTasks.length > 0
    ? (buildTasks.reduce((s, t) => s + t.score, 0) / buildTasks.length).toFixed(1)
    : null

  // Next experiment suggestion
  const gaps = []
  if (whatFailed.length > 0) gaps.push(`Retry the approach that failed on ${whatFailed[0].task}`)
  if (whatWasNew.length > 0) gaps.push(`Practice more ${whatWasNew[0].type} sections to build confidence`)

  out({
    project: path.basename(projectDir),
    tasksCompleted: doneTasks.length,
    avgScore,
    whatWorked,
    whatFailed,
    whatWasNew,
    confidenceGains,
    nextExperiment: gaps.length > 0 ? gaps[0] : 'Continue building variety across section types.',
  })
}

// ---------------------------------------------------------------------------
// Subcommand: personality — compute aesthetic profile from all memory
// ---------------------------------------------------------------------------

const cmdPersonality = async () => {
  const mem = await loadMemory()

  // --- Aesthetic preferences ---

  // Composition preferences (from section patterns)
  const compositionCounts = {}
  for (const p of mem.sectionPatterns.patterns) {
    const layout = (p.layout || '').toLowerCase()
    let type = 'other'
    if (layout.includes('asymmetric') || layout.includes('1fr 1.8fr') || layout.includes('unequal')) type = 'asymmetric'
    else if (layout.includes('centered') || layout.includes('center')) type = 'centered'
    else if (layout.includes('bento') || layout.includes('grid')) type = 'bento'
    else if (layout.includes('split') || layout.includes('two-column')) type = 'split'

    if (!compositionCounts[type]) compositionCounts[type] = { count: 0, totalScore: 0 }
    compositionCounts[type].count++
    compositionCounts[type].totalScore += (p.score || 7)
  }

  const compositionPreferences = {}
  const totalPatterns = mem.sectionPatterns.patterns.length || 1
  for (const [type, data] of Object.entries(compositionCounts)) {
    compositionPreferences[type] = {
      weight: Math.round(data.count / totalPatterns * 100) / 100,
      evidence: data.count,
      avgScore: Math.round(data.totalScore / data.count * 10) / 10,
    }
  }

  // Motion preferences (from technique scores)
  const motionPreferences = {}
  for (const t of mem.techniqueScores.techniques) {
    motionPreferences[t.name] = {
      weight: Math.min(1, (t.timesUsed || 0) * (t.avgScore || 7) / 40),
      evidence: t.timesUsed || 0,
      avgScore: t.avgScore || 0,
    }
  }

  // Color temperature
  const colorTemp = { warm: { count: 0 }, cool: { count: 0 }, neutral: { count: 0 } }
  for (const p of mem.colorPalettes.works) {
    const accent = (p.accent || '').toLowerCase()
    const canvas = (p.canvas || '').toLowerCase()
    if (accent.includes('amber') || accent.includes('copper') || accent.includes('gold') || accent.includes('warm') || accent.includes('red') || accent.includes('orange')) {
      colorTemp.warm.count++
    } else if (accent.includes('blue') || accent.includes('cyan') || accent.includes('teal') || accent.includes('cool')) {
      colorTemp.cool.count++
    } else {
      colorTemp.neutral.count++
    }
  }
  const totalColors = colorTemp.warm.count + colorTemp.cool.count + colorTemp.neutral.count || 1
  const colorTemperature = {
    warm: { weight: Math.round(colorTemp.warm.count / totalColors * 100) / 100, usage: colorTemp.warm.count },
    cool: { weight: Math.round(colorTemp.cool.count / totalColors * 100) / 100, usage: colorTemp.cool.count },
    neutral: { weight: Math.round(colorTemp.neutral.count / totalColors * 100) / 100, usage: colorTemp.neutral.count },
  }

  // --- Values (extracted from high-score patterns) ---
  const values = { core: [], learned: [], rejected: [] }

  // Core values: patterns with 3+ instances and avg score >= 8
  const highScorePatterns = mem.sectionPatterns.patterns.filter(p => (p.score || 0) >= 8)
  const layoutThemes = {}
  for (const p of highScorePatterns) {
    const layout = (p.layout || '').toLowerCase()
    if (layout.includes('asymmetric')) layoutThemes['Asymmetric composition'] = (layoutThemes['Asymmetric composition'] || 0) + 1
    if (layout.includes('overlap')) layoutThemes['Depth through overlap'] = (layoutThemes['Depth through overlap'] || 0) + 1
    if (layout.includes('3+') || layout.includes('layers')) layoutThemes['Multi-layer depth'] = (layoutThemes['Multi-layer depth'] || 0) + 1
  }

  for (const [value, count] of Object.entries(layoutThemes)) {
    if (count >= 2) {
      values.core.push({
        value,
        evidence: `${count} high-scoring sections use this pattern`,
        strength: Math.min(0.95, count * 0.15 + 0.5),
        since: today(),
      })
    }
  }

  // Typography is always core if font data exists
  if (mem.fontPairings.works.length >= 2) {
    values.core.push({
      value: 'Typography as architecture',
      evidence: `${mem.fontPairings.works.length} font pairings — typography drives every project`,
      strength: 0.95,
      since: today(),
    })
  }

  // Learned values from revision patterns
  for (const rev of mem.revisionPatterns.patterns.slice(0, 5)) {
    if (rev.pattern) {
      values.learned.push({
        value: rev.pattern,
        evidence: `${rev.project}: ${rev.whatChanged}`,
        source: 'revision-patterns',
        since: rev.date || today(),
      })
    }
  }

  // Rejected values from pipeline lessons
  for (const lesson of mem.pipelineLessons.lessons.slice(0, 3)) {
    if (lesson.prevention) {
      values.rejected.push({
        value: lesson.issue?.slice(0, 80) || 'Unknown anti-pattern',
        reason: lesson.prevention,
        since: lesson.date || today(),
      })
    }
  }

  // --- Voice (opinions from mixed-result techniques) ---
  const opinions = []
  for (const t of mem.techniqueScores.techniques) {
    if (t.timesUsed >= 2 && t.scores && t.scores.length >= 2) {
      const scores = t.scores
      const min = Math.min(...scores)
      const max = Math.max(...scores)
      const variance = max - min
      const conviction = Math.max(0.3, Math.min(0.95, 1 - variance / 4))

      if (variance > 1) {
        opinions.push({
          topic: t.name,
          opinion: `Mixed results (${min.toFixed(1)}–${max.toFixed(1)}). ${t.notes || 'Needs more data.'}`,
          conviction: Math.round(conviction * 100) / 100,
          evidence: `${t.timesUsed} uses, score range ${min.toFixed(1)}–${max.toFixed(1)}`,
        })
      }
    }
  }

  // Add strong opinions from high-confidence rules
  for (const r of mem.rules.rules.filter(r => r.status === 'PROMOTED')) {
    opinions.push({
      topic: r.text?.slice(0, 40) || 'Rule',
      opinion: r.text,
      conviction: 0.95,
      evidence: `PROMOTED rule — ${r.validations || 3}+ validations`,
    })
  }

  // Philosophy — synthesized from values + opinions
  const coreValueNames = values.core.map(v => v.value).join(', ')
  const philosophy = values.core.length > 0
    ? `Quality comes from ${coreValueNames.toLowerCase()} — not from technique stacking. A site well made feels inevitable.`
    : 'Building experience. Philosophy will emerge from accumulated project data.'

  // --- Growth timeline ---
  const growth = []
  const calProjects = mem.calibration.projects || []
  for (const proj of calProjects) {
    growth.push({
      date: proj.date || today(),
      event: 'project-completed',
      milestone: `${proj.slug}: ${proj.sections?.length || 0} sections, avg delta ${proj.avgDelta?.toFixed(1) || '?'}`,
    })
  }

  // --- Build personality.json ---
  const personality = {
    identity: {
      name: 'Eros',
      role: 'Director Creativo Autónomo',
      createdAt: '2026-04-03',
      projectsCompleted: calProjects.length,
      totalDataPoints: mem.sectionPatterns.patterns.length + mem.techniqueScores.techniques.length +
        mem.fontPairings.works.length + mem.colorPalettes.works.length,
    },
    aesthetic: {
      compositionPreferences,
      motionPreferences,
      colorTemperature,
      depthPreference: highScorePatterns.length > 0 ? '3+ layers preferred' : 'Developing',
      experimentBudget: 0.2,
    },
    values,
    voice: {
      tone: opinions.length > 3 ? 'Directo, confiado, técnico pero no frío.' : 'Developing — accumulating experience.',
      opinions,
      philosophy,
    },
    growth,
    lastUpdated: new Date().toISOString(),
  }

  // Write to design-intelligence
  await writeJson(path.join(MEMORY_DIR, 'personality.json'), personality)

  out(personality)
}

// ---------------------------------------------------------------------------
// Main dispatcher
// ---------------------------------------------------------------------------

const COMMANDS = {
  gaps: async () => {
    await cmdGaps()
  },
  reflect: async (args) => {
    const projectDir = args.project
    if (!projectDir || projectDir === true) fail('Missing --project argument.')
    await cmdReflect(path.resolve(projectDir))
  },
  personality: async () => {
    await cmdPersonality()
  },
}

const main = async () => {
  const args = parseArgs(process.argv.slice(2))
  const command = args._command

  if (!command) {
    fail(`Usage: eros-meta.mjs <command> [options]\nCommands: ${Object.keys(COMMANDS).join(', ')}`)
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
