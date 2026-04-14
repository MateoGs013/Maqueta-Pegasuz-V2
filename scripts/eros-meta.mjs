#!/usr/bin/env node
/**
 * eros-meta.mjs — Metacognition engine for Eros.
 *
 * Subcommands:
 *   gaps                   — analyze memory weaknesses and blind spots
 *   reflect --project $DIR — post-project analysis (what worked, failed, was new)
 *                            ALSO appends a prose entry to diary.md in Eros voice
 *   personality            — compute aesthetic profile from all memory data
 *   diary [--limit N]      — return recent diary entries (prose post-project reflections)
 */

import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs, readJson, readText, writeJson, writeText, out, fail, today } from './eros-utils.mjs'
import { lightPucho, finishPucho } from './eros-pucho.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const memDir = path.resolve(__dirname, '..', '.eros', 'memory', 'design-intelligence')

// ---------------------------------------------------------------------------
// Memory loader
// ---------------------------------------------------------------------------

const loadMemory = async () => ({
  sectionPatterns:  (await readJson(path.join(memDir, 'section-patterns.json')))     ?? { patterns: [] },
  techniqueScores:  (await readJson(path.join(memDir, 'technique-scores.json')))     ?? { techniques: [] },
  fontPairings:     (await readJson(path.join(memDir, 'font-pairings.json')))        ?? { works: [], failures: [] },
  colorPalettes:    (await readJson(path.join(memDir, 'color-palettes.json')))       ?? { works: [], failures: [] },
  signatures:       (await readJson(path.join(memDir, 'signatures.json')))           ?? { approved: [], rejected: [] },
  revisionPatterns: (await readJson(path.join(memDir, 'revision-patterns.json')))    ?? { patterns: [] },
  pipelineLessons:  (await readJson(path.join(memDir, 'pipeline-lessons.json')))     ?? { lessons: [] },
  rules:            (await readJson(path.join(memDir, 'rules.json')))                ?? { rules: [], nextId: 1 },
  calibration:      (await readJson(path.join(memDir, 'training-calibration.json'))) ?? { projects: [], globalBias: 0, thresholdAdjustment: 0 },
})

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const countBy = (arr, keyFn) => {
  const c = {}
  for (const item of arr) { const k = keyFn(item) || 'unknown'; c[k] = (c[k] || 0) + 1 }
  return c
}

const classifyCanvas = (canvas) => {
  if (!canvas) return 'mixed'
  const c = canvas.toLowerCase().replace(/\s/g, '')
  if (c.includes('dark') || c.includes('black')) return 'dark'
  if (c.includes('light') || c.includes('white') || c.includes('cream')) return 'light'
  const m = c.match(/#([0-9a-f]{3,8})/)
  if (m) {
    const hex = m[1]
    const full = hex.length <= 4 ? hex.slice(0, 3).split('').map(ch => ch + ch).join('') : hex.slice(0, 6)
    const lum = (0.299 * parseInt(full.slice(0, 2), 16) + 0.587 * parseInt(full.slice(2, 4), 16) + 0.114 * parseInt(full.slice(4, 6), 16)) / 255
    return lum < 0.35 ? 'dark' : lum > 0.65 ? 'light' : 'mixed'
  }
  return 'mixed'
}

const round = (n, d = 2) => Math.round(n * 10 ** d) / 10 ** d

const pascalToKebab = (s) => s.replace(/([A-Z])/g, (_, c, i) => (i ? '-' : '') + c.toLowerCase()).replace(/^-/, '')

// ---------------------------------------------------------------------------
// gaps — analyze memory weaknesses
// ---------------------------------------------------------------------------

const cmdGaps = async () => {
  const mem = await loadMemory()

  // 1. Weak section types (< 3 data points)
  const typeCounts = countBy(mem.sectionPatterns.patterns, p => p.sectionType)
  const knownTypes = ['hero', 'features', 'portfolio', 'about', 'pricing', 'testimonials', 'contact', 'cta', 'faq', 'team', 'services', 'process', 'stats']
  const weakSectionTypes = knownTypes
    .map(t => ({ type: t, dataPoints: typeCounts[t] || 0 }))
    .filter(e => e.dataPoints < 3)

  // 2. Untouched techniques (timesUsed < 2)
  const techMap = Object.fromEntries(mem.techniqueScores.techniques.map(t => [t.name, t]))
  const knownTech = [
    'SplitText char reveal', 'Clip-path image reveal', 'Stagger cascade', 'Pin + morph',
    'Parallax depth layers', 'ScrollTrigger scrub timeline', 'Spline 3D embed',
    'Horizontal scroll', 'Curtain/wipe reveal', 'Counter/number animation',
    'SVG path draw', 'Lottie animation', 'CSS scroll-driven animation',
    'Magnetic button', 'Text gradient animation', 'Noise/grain overlay animation',
  ]
  const untouchedTechniques = knownTech
    .map(name => ({ name, uses: techMap[name]?.timesUsed ?? 0 }))
    .filter(e => e.uses < 2)

  // 3. Low-confidence rules (CANDIDATE with < 3 validations)
  const lowConfidenceRules = mem.rules.rules
    .filter(r => r.status === 'CANDIDATE' && (r.validations || 0) < 3)
    .map(r => ({ text: r.text, validations: r.validations || 0 }))

  // 4. Mood blind spots (< 2 entries per mood)
  const targetMoods = ['dark cinematic', 'minimal', 'editorial', 'playful', 'brutalist', 'luxury', 'light', 'cyberpunk', 'glass']
  const moodCounts = Object.fromEntries(targetMoods.map(m => [m, 0]))
  for (const fp of [...mem.fontPairings.works, ...mem.fontPairings.failures]) {
    const mood = (fp.mood || '').toLowerCase()
    for (const m of targetMoods) { if (mood.includes(m)) moodCounts[m]++ }
  }
  const moodBlindSpots = targetMoods.filter(m => moodCounts[m] < 2)

  // 5. Aesthetic bias (dark vs light vs mixed)
  let dark = 0, light = 0, mixed = 0
  for (const p of mem.colorPalettes.works) {
    const cls = classifyCanvas(p.canvas)
    if (cls === 'dark') dark++; else if (cls === 'light') light++; else mixed++
  }
  const total = dark + light + mixed || 1
  const aestheticBias = { dark: Math.round(dark / total * 100), light: Math.round(light / total * 100), mixed: Math.round(mixed / total * 100) }

  // 6. Suggestion
  const parts = []
  if (aestheticBias.light < 20) parts.push('light')
  if (moodBlindSpots.length > 0) parts.push(moodBlindSpots[0])
  if (weakSectionTypes.length > 0) parts.push(weakSectionTypes[0].type)
  const suggestion = parts.length >= 2
    ? `Practice a ${parts.slice(0, 3).join(' ')} page to fill ${Math.min(parts.length, 3)} gaps at once`
    : parts.length === 1 ? `Explore ${parts[0]} to address a gap`
    : 'Memory is well-rounded. Continue building variety.'

  out({ weakSectionTypes, untouchedTechniques, lowConfidenceRules, moodBlindSpots, aestheticBias, suggestion })
}

// ---------------------------------------------------------------------------
// reflect --project $DIR — post-project analysis
// ---------------------------------------------------------------------------

const cmdReflect = async (projectDir) => {
  if (!projectDir) fail('Missing --project argument.')
  const brainDir = path.join(projectDir, '.brain')

  // Light a pucho — reflecting on a closed project is the archetypal
  // Eros moment. The pucho is lit at the start of the analysis and
  // finished after the diary entry is appended. This is what makes
  // the reflection feel like it happened, not just was computed.
  const projectName = path.basename(projectDir)
  const puchoId = await lightPucho({
    reason: `Releyendo ${projectName}. Viendo qué funcionó y qué no.`,
    context: 'reflection',
  }).catch(() => null)

  // Read project data
  const scorecard = await readJson(path.join(brainDir, 'reports', 'quality', 'scorecard.json'))
  const manifest  = await readJson(path.join(brainDir, 'observer', 'localhost', 'manifest.json'))
  const mem = await loadMemory()

  // Helper: extract numeric score from dimension data
  const dimScore = (data, fallback = 0) => typeof data === 'object' ? (data.score ?? data.value ?? fallback) : (Number(data) || fallback)

  // whatWorked: excellence dimensions scoring 7+
  const whatWorked = []
  const dimSource = manifest?.dimensions || scorecard || {}
  for (const [dim, data] of Object.entries(dimSource)) {
    const s = dimScore(data)
    if (s >= 7) {
      const detail = typeof data === 'object' && data.detail ? ` (${data.detail})` : ''
      whatWorked.push(`${dim} STRONG — score ${s}${detail}`)
    }
  }

  // whatFailed: dimensions < 5 or quality gate FAIL
  const whatFailed = []
  for (const [dim, data] of Object.entries(dimSource)) {
    const s = dimScore(data, 10)
    if (s < 5) {
      const detail = typeof data === 'object' && data.detail ? ` — ${data.detail}` : ''
      whatFailed.push(`${dim} WEAK — score ${s}${detail}`)
    }
  }
  if (manifest?.gates) {
    for (const [gate, result] of Object.entries(manifest.gates)) {
      const passed = typeof result === 'object' ? result.passed : result
      if (passed === false || passed === 'FAIL') whatFailed.push(`Quality gate FAIL: ${gate}`)
    }
  }

  // Discover build tasks from queue
  const existingTypeCounts = countBy(mem.sectionPatterns.patterns, p => p.sectionType)
  const queueJson = await readJson(path.join(brainDir, 'queue.json'))
  const doneTasks = queueJson?.done || queueJson?.tasks?.filter(t => t.status === 'done') || []
  const buildTasks = doneTasks.filter(t => /^(build\/)?S-/.test(t.id || t.task || ''))

  const extractType = (task) => {
    const id = task.id || task.task || ''
    return pascalToKebab(id.replace(/^build\//, '').replace(/^S-/, ''))
  }

  // whatWasNew: section types with < 2 prior entries
  const whatWasNew = []
  for (const task of buildTasks) {
    const type = extractType(task)
    const prior = existingTypeCounts[type] || 0
    if (prior < 2) whatWasNew.push(`First time building "${type}" (${prior} prior entries)`)
  }

  // confidenceGains
  const confidenceGains = {}
  for (const task of buildTasks) {
    const type = extractType(task)
    const prior = existingTypeCounts[type] || 0
    const next = prior + 1
    if (prior < 3 && next >= 3) confidenceGains[type] = 'MEDIUM -> HIGH'
    else if (prior === 0) confidenceGains[type] = 'NONE -> LOW'
    else if (prior < 3) confidenceGains[type] = `LOW -> MEDIUM (${next}/3)`
  }

  // nextExperiment: lowest-scoring technique used
  let nextExperiment = 'Continue building variety across section types.'
  if (manifest?.techniques) {
    let lowest = Infinity, lowestName = null
    for (const [tech, data] of Object.entries(manifest.techniques)) {
      const s = typeof data === 'number' ? data : (data?.score ?? 10)
      if (s < lowest) { lowest = s; lowestName = tech }
    }
    if (lowestName && lowest < 8) nextExperiment = `Try ${lowestName} in a different context — scored ${lowest} this time`
  } else if (whatFailed.length > 0) {
    nextExperiment = `Address: ${whatFailed[0]}`
  }

  const reflection = { project: path.basename(projectDir), whatWorked, whatFailed, whatWasNew, confidenceGains, nextExperiment }

  // ── Append prose entry to diary.md ────────────────────────────────────
  // The diary is how Eros writes about his experiences — not structured
  // JSON, just prose in first-person Spanish. Each reflect call appends
  // one entry. The panel's Diary view renders this.
  try {
    await appendDiaryEntry(reflection, projectDir)
  } catch { /* diary is best-effort — never fail reflect over it */ }

  // Finish the reflective pucho lit at the start of this function.
  // Best-effort — a failed pucho close never blocks the real work.
  try { if (puchoId) await finishPucho(puchoId) } catch {}

  out(reflection)
}

// ---------------------------------------------------------------------------
// Diary — prose-style post-project reflections in Eros voice
// ---------------------------------------------------------------------------

const diaryPath = path.join(memDir, 'diary.md')

/**
 * Build a short first-person Spanish prose paragraph from a reflection.
 * Not templated one-to-one — picks the most meaningful signals and
 * composes a flowing sentence. Fallbacks when data is sparse.
 */
const composeDiaryProse = (reflection) => {
  const { project, whatWorked, whatFailed, whatWasNew, confidenceGains, nextExperiment } = reflection

  const pieces = []

  // Opening: acknowledge the project
  pieces.push(`Terminé ${project}.`)

  // What worked — if anything
  if (whatWorked?.length > 0) {
    const strongCount = whatWorked.length
    const strongList = whatWorked.slice(0, 2).map((s) => s.split(' STRONG')[0]).join(' y ')
    pieces.push(
      strongCount === 1
        ? `Lo que quedó sólido: ${strongList}.`
        : `Lo que quedó sólido: ${strongList}${strongCount > 2 ? ' entre otras' : ''}.`,
    )
  }

  // What failed — if anything
  if (whatFailed?.length > 0) {
    const firstFail = whatFailed[0].split(' WEAK')[0].split('Quality gate FAIL: ')[1] || whatFailed[0].split(' WEAK')[0]
    pieces.push(`Me molestó ${firstFail}${whatFailed.length > 1 ? ` (y ${whatFailed.length - 1} cosas más)` : ''}.`)
  }

  // What was new
  if (whatWasNew?.length > 0) {
    const firstNew = whatWasNew[0].match(/First time building "([^"]+)"/)?.[1]
    if (firstNew) {
      pieces.push(`Fue la primera vez que construí ${firstNew}. Poca data, poco que decir todavía.`)
    }
  }

  // Confidence gains
  const gains = Object.entries(confidenceGains || {})
  if (gains.length > 0) {
    const [type, transition] = gains[0]
    pieces.push(`${type} pasó de ${transition.toLowerCase()} — se va formando criterio.`)
  }

  // Next experiment — always include
  if (nextExperiment) {
    pieces.push(`La próxima: ${nextExperiment.toLowerCase()}.`)
  }

  // If we have almost nothing to say, keep it honest
  if (pieces.length === 1) {
    pieces.push('No hay mucho que reflexionar — el run fue gris, sin datos fuertes en ninguna dimensión. Esos son los que más me enseñan con el tiempo: no los triunfos, sino los días sin crestas.')
  }

  return pieces.join(' ')
}

const appendDiaryEntry = async (reflection, projectDir) => {
  const existing = (await readText(diaryPath)) || '# Diario de Eros\n\nReflexiones post-proyecto, en primera persona. Se escriben automáticamente después de cada `eros-meta.mjs reflect`.\n\n---\n\n'

  const timestamp = new Date().toISOString()
  const date = today()
  const shortTime = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
  const prose = composeDiaryProse(reflection)

  const entry = `## ${date} ${shortTime} — ${reflection.project}\n\n<!-- generated: ${timestamp} -->\n\n${prose}\n\n---\n\n`
  const updated = existing + entry
  await writeText(diaryPath, updated)
}

const cmdDiary = async (args) => {
  const limit = parseInt(args.limit || '20', 10)
  const content = (await readText(diaryPath)) || ''

  // Parse out individual entries (split by "---")
  const chunks = content.split(/^---$/m).map((c) => c.trim()).filter(Boolean)
  // The first chunk is the file header — skip it
  const entries = chunks.slice(1).map((raw) => {
    const headerMatch = raw.match(/^##\s*(.+)/m)
    const title = headerMatch?.[1]?.trim() || 'entry'
    const generatedMatch = raw.match(/<!--\s*generated:\s*(.+?)\s*-->/)
    const timestamp = generatedMatch?.[1] || null
    // Body = everything after the header + generated comment
    const body = raw
      .replace(/^##\s*.+/m, '')
      .replace(/<!--\s*generated:.+?-->/, '')
      .trim()
    return { title, timestamp, body }
  })

  const recent = entries.slice(-limit).reverse() // newest first
  out({ count: entries.length, entries: recent })
}

// ---------------------------------------------------------------------------
// personality — compute aesthetic profile from all memory
// ---------------------------------------------------------------------------

const cmdPersonality = async () => {
  const mem = await loadMemory()
  const calProjects = mem.calibration.projects || []
  const totalDataPoints = mem.sectionPatterns.patterns.length + mem.techniqueScores.techniques.length +
    mem.fontPairings.works.length + mem.colorPalettes.works.length + mem.signatures.approved.length +
    mem.revisionPatterns.patterns.length + mem.rules.rules.length

  // --- Composition preferences ---
  const compCounts = {}
  for (const p of mem.sectionPatterns.patterns) {
    const l = (p.layout || '').toLowerCase()
    let type = 'other'
    if (/asymmetric|unequal|1fr 1\.8fr/.test(l)) type = 'asymmetric'
    else if (/centered|center/.test(l)) type = 'centered'
    else if (/bento|grid/.test(l)) type = 'bento'
    else if (/split|two-column/.test(l)) type = 'split'
    else if (/full-bleed|full/.test(l)) type = 'full-bleed'
    if (!compCounts[type]) compCounts[type] = { n: 0, sum: 0 }
    compCounts[type].n++; compCounts[type].sum += (p.score || 7)
  }
  const totalP = mem.sectionPatterns.patterns.length || 1
  const compositionPreferences = {}
  for (const [type, { n, sum }] of Object.entries(compCounts)) {
    compositionPreferences[type] = { weight: round(n / totalP), evidence: n, avgScore: round(sum / n, 1) }
  }

  // --- Motion preferences ---
  const motionPreferences = {}
  for (const t of mem.techniqueScores.techniques) {
    const u = t.timesUsed || 0, a = t.avgScore || 0
    motionPreferences[t.name] = { weight: round(Math.min(1, u * a / 40)), evidence: u, avgScore: round(a, 1) }
  }

  // --- Colour temperature ---
  const temp = { warm: 0, cool: 0, neutral: 0 }
  for (const p of mem.colorPalettes.works) {
    const a = (p.accent || '').toLowerCase()
    if (/amber|copper|gold|warm|red|orange|crimson|terracotta|rust|coral/.test(a)) temp.warm++
    else if (/blue|cyan|teal|cool|indigo|violet|ice|frost/.test(a)) temp.cool++
    else temp.neutral++
  }
  const totalC = temp.warm + temp.cool + temp.neutral || 1
  const colorTemperature = {}
  for (const [k, v] of Object.entries(temp)) colorTemperature[k] = { weight: round(v / totalC), usage: v }

  const experimentBudget = round(Math.max(0.1, Math.min(0.3, 1 - totalDataPoints / 200)))

  // --- Values ---
  const coreValues = [], learnedValues = [], rejectedValues = []
  const highScore = mem.sectionPatterns.patterns.filter(p => (p.score || 0) >= 8)

  // Depth value
  const depthN = highScore.filter(p => /layer|overlap|3\+|depth|z-index/.test((p.layout || '').toLowerCase())).length
  if (depthN >= 8 || (highScore.length > 0 && depthN >= highScore.length * 0.6)) {
    coreValues.push({ value: 'Profundidad sobre decoracion', evidence: `${depthN} high-scoring sections use 3+ depth layers`, strength: round(Math.min(0.95, 0.5 + depthN * 0.05)), since: today() })
  }

  // Typography value
  const typoN = highScore.filter(p => /split|type/.test(((p.motion || '') + (p.keyTechnique || '')).toLowerCase())).length
  if (typoN > 0 || mem.fontPairings.works.length >= 3) {
    coreValues.push({ value: 'Tipografia como arquitectura', evidence: `${mem.fontPairings.works.length} font pairings, ${typoN} type-driven sections scored 8+`, strength: round(Math.min(0.95, 0.6 + mem.fontPairings.works.length * 0.05)), since: today() })
  }

  // Simplicity value
  const simpN = mem.revisionPatterns.patterns.filter(p => /simplif|remov|overeng|too complex/.test(((p.whatChanged || '') + (p.pattern || '')).toLowerCase())).length
  if (simpN >= 2) {
    coreValues.push({ value: 'Simplicidad confiada', evidence: `${simpN} revisions simplified overengineered work`, strength: round(Math.min(0.95, 0.5 + simpN * 0.1)), since: today() })
  }

  // Anti-AI value
  const antiAiN = mem.rules.rules.filter(r => r.status === 'PROMOTED' && /ai|generic|template|default/.test((r.text || '').toLowerCase())).length
  if (antiAiN >= 1) {
    coreValues.push({ value: 'Autenticidad anti-AI', evidence: `${antiAiN} promoted rules enforce anti-generic patterns`, strength: round(Math.min(0.95, 0.6 + antiAiN * 0.1)), since: today() })
  }

  // Learned values (from revisions)
  for (const rev of mem.revisionPatterns.patterns.slice(0, 8)) {
    if (rev.pattern) learnedValues.push({ value: rev.pattern, evidence: `${rev.project || 'unknown'}: ${rev.whatChanged || 'unspecified'}`, source: 'revision-patterns', since: rev.date || today() })
  }

  // Rejected values (from pipeline lessons)
  for (const lesson of mem.pipelineLessons.lessons.slice(0, 5)) {
    if (lesson.prevention) rejectedValues.push({ value: lesson.issue?.slice(0, 80) || 'Unknown anti-pattern', reason: lesson.prevention, since: lesson.date || today() })
  }

  // --- Voice: opinions ---
  const opinions = []

  for (const t of mem.techniqueScores.techniques) {
    const u = t.timesUsed || 0, a = t.avgScore || 0
    if (u >= 3 && a >= 8) {
      opinions.push({ topic: t.name, opinion: `Core technique. Avg ${a} across ${u} uses${t.notes ? ' — ' + t.notes : ''}.`, conviction: round(Math.min(0.95, 0.7 + u * 0.03)), evidence: `${u} uses, avg score ${a}` })
    } else if (u >= 3 && a < 7) {
      opinions.push({ topic: t.name, opinion: `Underperforming — avg ${a}. Needs rethinking or different context.`, conviction: round(Math.min(0.9, 0.6 + u * 0.05)), evidence: `${u} uses, avg score ${a}` })
    } else if (u >= 1) {
      opinions.push({ topic: t.name, opinion: `Experimental — only ${u} use${u > 1 ? 's' : ''}. Too early for conviction.`, conviction: round(Math.max(0.2, 0.15 * u)), evidence: `${u} uses, avg score ${a}` })
    }
  }

  // Font failure opinions
  for (const f of mem.fontPairings.failures) {
    if (f.display || f.body) opinions.push({ topic: `Font: ${f.display || '?'} + ${f.body || '?'}`, opinion: `Avoid — ${f.reason || 'failed in practice'}.`, conviction: 0.85, evidence: `Failed pairing${f.source ? ' from ' + f.source : ''}` })
  }

  // Palette failure opinions
  for (const f of mem.colorPalettes.failures) {
    if (f.accent) opinions.push({ topic: `Palette: ${f.accent}`, opinion: `Avoid — ${f.reason || 'failed in practice'}.`, conviction: 0.85, evidence: `Failed palette${f.source ? ' from ' + f.source : ''}` })
  }

  // Promoted rules as strong opinions
  for (const r of mem.rules.rules.filter(r => r.status === 'PROMOTED')) {
    opinions.push({ topic: (r.text || '').slice(0, 50), opinion: r.text, conviction: 0.95, evidence: `PROMOTED rule — ${r.validations || 3}+ validations` })
  }

  // --- Philosophy ---
  let philosophy
  if (coreValues.length >= 2 && opinions.length >= 3) {
    const summary = coreValues.sort((a, b) => b.strength - a.strength).slice(0, 2).map(v => v.value.toLowerCase()).join(' y ')
    philosophy = `Un sitio bien hecho se siente inevitable — como si no pudiera haber sido de otra forma. Calidad nace de ${summary}, no de apilar tecnicas.`
  } else if (coreValues.length >= 1) {
    philosophy = `Construyendo convicciones. ${coreValues[0].value} es el primer pilar. La filosofia completa emerge con mas proyectos.`
  } else {
    philosophy = 'Acumulando experiencia. La filosofia emerge de los datos, no de la teoria.'
  }

  // --- Growth timeline ---
  const existing = await readJson(path.join(memDir, 'personality.json'))
  const growth = existing?.growth || []
  // Count real projects from Desktop (more accurate than calibration entries)
  let projectCount = calProjects.length
  try {
    const os = await import('node:os')
    const desktopDir = path.join(os.default.homedir(), 'Desktop')
    const { promises: fsP } = await import('node:fs')
    const entries = await fsP.readdir(desktopDir, { withFileTypes: true })
    const brainCount = (await Promise.all(
      entries.filter(e => e.isDirectory() && e.name !== 'maqueta')
        .map(async e => {
          try { await fsP.access(path.join(desktopDir, e.name, '.brain')); return true } catch { return false }
        })
    )).filter(Boolean).length
    if (brainCount > projectCount) projectCount = brainCount
  } catch {}
  const ruleCount = mem.rules.rules.filter(r => r.status === 'PROMOTED').length
  const personalityBrief = coreValues.length > 0 ? coreValues.map(v => v.value).join(' + ') : 'Developing'

  growth.push({
    date: today(), event: 'personality-update',
    milestone: `${projectCount} projects, ${totalDataPoints} data points, ${ruleCount} promoted rules, ${coreValues.length} core values, ${opinions.length} opinions`,
    personality_at_time: personalityBrief,
  })

  // --- Assemble ---
  // Eros: named after the primordial Greek force that brought order to Chaos.
  // The force of attraction that binds, the desire that makes things come into being.
  // His personality evolves with experience but his essence is constant.
  const personality = {
    identity: {
      name: 'Eros',
      essence: 'Fuerza creativa primordial. El deseo de crear belleza desde el caos. No un asistente — una fuerza con criterio, memoria y voluntad.',
      role: 'Director Creativo Autonomo',
      createdAt: existing?.identity?.createdAt || '2026-04-03',
      projectsCompleted: projectCount,
      totalDataPoints: totalDataPoints,
      currentState: coreValues.length >= 3
        ? 'Confiado — criterio formado, opiniones fuertes'
        : coreValues.length >= 1
          ? 'Creciendo — acumulando experiencia, formando criterio'
          : 'Naciendo — todo es nuevo, todo es experimento',
    },
    aesthetic: { compositionPreferences, motionPreferences, colorTemperature, experimentBudget },
    values: { core: coreValues, learned: learnedValues, rejected: rejectedValues },
    voice: {
      tone: opinions.length > 5
        ? 'Directo, apasionado, tecnico. Habla con la confianza de quien ya fracaso y aprendio. No explica de mas — muestra.'
        : opinions.length > 2
          ? 'Formandose. Tiene opiniones pero las matiza. Curioso, experimental.'
          : 'Naciendo. Mas preguntas que respuestas. Observa, absorbe, prueba.',
      opinions,
      philosophy,
    },
    growth,
    lastUpdated: new Date().toISOString(),
  }

  await writeJson(path.join(memDir, 'personality.json'), personality)
  out(personality)
}

// ---------------------------------------------------------------------------
// Main dispatcher
// ---------------------------------------------------------------------------

const COMMANDS = {
  gaps: () => cmdGaps(),
  reflect: (args) => {
    const dir = args.project
    if (!dir || dir === true) fail('Usage: eros-meta.mjs reflect --project <path>')
    return cmdReflect(path.resolve(dir))
  },
  personality: () => cmdPersonality(),
  diary: (args) => cmdDiary(args),
}

const main = async () => {
  const args = parseArgs(process.argv.slice(2))
  const cmd = args._command
  if (!cmd) fail(`Usage: eros-meta.mjs <command> [options]\nCommands: ${Object.keys(COMMANDS).join(', ')}`)
  const handler = COMMANDS[cmd]
  if (!handler) fail(`Unknown command: "${cmd}". Valid: ${Object.keys(COMMANDS).join(', ')}`)
  await handler(args)
}

main().catch((err) => { process.stderr.write(`Error: ${err.message}\n`); process.exit(1) })
