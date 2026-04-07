#!/usr/bin/env node
/**
 * eros-auto-train.mjs V2 — Real pipeline training
 *
 * Same workflow as a manual project:
 *   1. Discover reference on Awwwards
 *   2. Study reference (observer V2 → learn)
 *   3. Generate brief BASED on the reference
 *   4. Build with /project (Claude Agent SDK)
 *   5. Start dev server
 *   6. Run observer V2 → real 6-layer scores
 *   7. Run eros-audit.mjs → quality chain
 *   8. Run gates → approve/retry/flag per section
 *   9. Retry failing sections (new SDK session)
 *  10. Validate rules with observer scores
 *  11. Learn → memory + personality
 *  12. Cleanup
 *
 * Usage:
 *   node eros-auto-train.mjs                    # 1 session
 *   node eros-auto-train.mjs --count 3          # 3 sessions
 *   node eros-auto-train.mjs --dry-run          # preview without building
 *   node eros-auto-train.mjs --skip-discover    # skip Awwwards (use random brief)
 *   node eros-auto-train.mjs --max-retries 2    # retry limit per section (default 1)
 */

import { query } from '@anthropic-ai/claude-agent-sdk'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFile, spawn } from 'node:child_process'
import { promises as fs } from 'node:fs'
import net from 'node:net'
import { parseArgs, readJson, writeJson, readText, ensureDir, out, fail, today } from './eros-utils.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const maquetaDir = path.resolve(__dirname, '..')
const desktopDir = path.join(process.env.HOME || process.env.USERPROFILE, 'Desktop')
const memDir = path.join(maquetaDir, '.claude', 'memory', 'design-intelligence')

const log = (msg) => process.stderr.write(`[eros-train] ${msg}\n`)

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const callScript = (script, args, timeoutMs = 300000) => new Promise((resolve, reject) => {
  execFile('node', [path.join(__dirname, script), ...args], {
    cwd: __dirname,
    timeout: timeoutMs,
    maxBuffer: 10 * 1024 * 1024,
  }, (err, stdout) => {
    if (err) { reject(err); return }
    try { resolve(JSON.parse(stdout)) } catch { resolve({ raw: stdout }) }
  })
})

// ---------------------------------------------------------------------------
// Phase 0: Discover + Study Reference
// ---------------------------------------------------------------------------

const discoverAndStudyReference = async () => {
  log('Phase 0: Discovering Awwwards reference...')

  // Discover
  let discovery
  try {
    discovery = await callScript('eros-discover.mjs', ['--study', '--count', '1'], 600000)
    log(`Discovered ${discovery.discovered || 0} sites, studied ${discovery.studied || 0}`)
  } catch (err) {
    log(`Discovery failed: ${err.message?.slice(0, 80)}`)
    return null
  }

  // Load the most recent studied reference
  const discoveredFile = path.join(memDir, 'discovered-references.json')
  const discovered = await readJson(discoveredFile)
  if (!discovered?.sites?.length) return null

  // Find the most recently studied site
  const studied = discovered.sites
    .filter(s => s.studied)
    .sort((a, b) => (b.studiedAt || '').localeCompare(a.studiedAt || ''))

  if (studied.length === 0) return null

  const ref = studied[0]
  log(`Reference: ${ref.title || ref.url} (${ref.url})`)

  // Try to load the observer analysis from the study
  let analysis = null
  const trainingRefsDir = path.join(maquetaDir, '_training-refs')
  if (ref.slug) {
    analysis = await readJson(path.join(trainingRefsDir, ref.slug, 'analysis.json'))
      || await readJson(path.join(trainingRefsDir, ref.slug.replace(/\./g, '-'), 'analysis.json'))
  }

  return { url: ref.url, title: ref.title, slug: ref.slug, analysis }
}

// ---------------------------------------------------------------------------
// Phase 1: Generate brief from reference
// ---------------------------------------------------------------------------

const generateBriefFromReference = async (ref) => {
  // Get gap analysis to also target weaknesses
  const gaps = await callScript('eros-meta.mjs', ['gaps'])

  // Extract mood from reference analysis
  let mood = 'dark cinematic'
  let techniques = []
  let refPalette = []

  if (ref?.analysis) {
    const a = ref.analysis
    // Derive mood from color temperature + layout
    if (a.palette?.length > 0) {
      refPalette = a.palette.slice(0, 5)
      const darkColors = a.palette.filter(c => {
        if (!c.hex) return false
        const hex = c.hex.replace('#', '')
        const lum = (0.299 * parseInt(hex.slice(0, 2), 16) +
                     0.587 * parseInt(hex.slice(2, 4), 16) +
                     0.114 * parseInt(hex.slice(4, 6), 16)) / 255
        return lum < 0.35
      })
      mood = darkColors.length > refPalette.length / 2 ? 'dark cinematic' : 'light minimal'
    }
    if (a.excellence?.composition === 'STRONG' && a.excellence?.depth === 'STRONG') {
      mood = mood.includes('dark') ? 'dark cinematic' : 'editorial'
    }
    techniques = (a.techniques || []).slice(0, 3)
  }

  // Override mood with gap if available
  const blindSpot = gaps.moodBlindSpots?.[0]
  if (blindSpot) mood = blindSpot

  // Pick sections targeting weaknesses
  const weakTypes = (gaps.weakSectionTypes || []).map(t => typeof t === 'string' ? t : t.type)
  const selectedSections = ['hero']
  for (const type of weakTypes) {
    if (type !== 'hero' && selectedSections.length < 4) selectedSections.push(type)
  }
  const fallbacks = ['features', 'about', 'cta', 'testimonials']
  for (const t of fallbacks) {
    if (selectedSections.length >= 3) break
    if (!selectedSections.includes(t)) selectedSections.push(t)
  }

  // Technique challenge from gap or reference
  const rawTech = gaps.untouchedTechniques?.[0]
  const techniqueChallenge = (typeof rawTech === 'string' ? rawTech : rawTech?.name)
    || (techniques[0]?.name || techniques[0])
    || 'Stagger cascade'

  // Load rules to inject
  let rulesBlock = ''
  try {
    const rulesData = await readJson(path.join(memDir, 'rules.json'))
    const allRules = rulesData?.rules || []
    const promoted = allRules.filter(r => r.status === 'PROMOTED').map(r => r.text)
    const candidates = allRules.filter(r => r.status === 'CANDIDATE').map(r => r.text)
    const unique = [...new Set([...promoted, ...candidates])]
    if (unique.length > 0) {
      rulesBlock = `\n\n## Reglas a aplicar (OBLIGATORIAS)\n${unique.map(r => `- ${r}`).join('\n')}`
    }
  } catch {}

  const id = `practice-${Date.now()}`
  const brief = {
    id,
    name: `Practice V2 — ${ref?.title || 'autonomous'}`,
    type: 'practice',
    mood,
    sections: selectedSections.map(t => `S-${t.charAt(0).toUpperCase() + t.slice(1)}`),
    techniqueChallenge,
    objective: ref
      ? `Imitate ${ref.title || ref.url}: ${mood} + ${techniques.map(t => t.name || t).join(', ') || 'reference techniques'}`
      : `Fill gaps: ${mood} + ${selectedSections.filter(s => s !== 'hero').join(' + ')}`,
    reference: ref ? { url: ref.url, title: ref.title, palette: refPalette, techniques } : null,
    targetGaps: {
      mood: gaps.moodBlindSpots?.includes(mood.split(' ')[0]),
      sectionTypes: selectedSections.filter(s => weakTypes.includes(s)),
      technique: true,
    },
    createdAt: new Date().toISOString(),
  }

  // Save brief
  const practiceDir = path.join(memDir, 'practice')
  await ensureDir(practiceDir)
  await writeJson(path.join(practiceDir, `${id}.json`), brief)

  return { brief, rulesBlock, gaps }
}

// ---------------------------------------------------------------------------
// Phase 2: Build project with SDK
// ---------------------------------------------------------------------------

const buildProject = async (brief, rulesBlock) => {
  const refBlock = brief.reference
    ? `\n\n## Referencia\n**URL:** ${brief.reference.url}\n**Paleta:** ${brief.reference.palette?.map(c => c.hex).join(', ') || 'extraer de la referencia'}\n**Técnicas observadas:** ${brief.reference.techniques?.map(t => t.name || t).join(', ') || 'analizar referencia'}`
    : ''

  const prompt = `/project

## Brief
**Nombre:** ${brief.name}
**Tipo:** ${brief.type}
**Mood:** ${brief.mood}
**Esquema:** ${brief.mood?.includes('light') || brief.mood?.includes('pastel') ? 'light' : 'dark'}
**Modo:** autonomous
**Secciones:** ${(brief.sections || []).join(', ')}
**Desafío técnico:** ${brief.techniqueChallenge}
**Objetivo:** ${brief.objective}${refBlock}

Este es un proyecto de práctica para entrenar. Priorizar las secciones listadas.
${brief.reference ? `Usar la referencia como inspiración directa — imitar mood, composición y técnicas.` : 'Creatividad libre.'}
Construir rápido.${rulesBlock}`

  log(`Starting SDK session: ${brief.id}`)
  log(`Prompt: ${prompt.length} chars`)

  const startTime = Date.now()
  let toolUses = 0

  try {
    for await (const message of query({
      prompt,
      options: {
        cwd: maquetaDir,
        allowedTools: [
          'Read', 'Write', 'Edit', 'Bash', 'Glob', 'Grep',
          'Agent', 'Skill',
        ],
        permissionMode: 'acceptEdits',
        maxTurns: 200,
      },
    })) {
      if (message.type === 'assistant') {
        process.stderr.write('.')
      }
      if (message.type === 'tool_use') {
        toolUses++
      }
    }
  } catch (err) {
    log(`\nBuild error: ${err.message}`)
  }

  const duration = Math.round((Date.now() - startTime) / 1000)
  log(`\nBuild finished in ${duration}s (${toolUses} tool uses)`)

  return { duration, toolUses }
}

// ---------------------------------------------------------------------------
// Phase 3: Dev Server Management
// ---------------------------------------------------------------------------

const findFreePort = (start = 5200, end = 5300) => new Promise((resolve, reject) => {
  const tryPort = (port) => {
    if (port > end) { reject(new Error('No free port found')); return }
    const server = net.createServer()
    server.once('error', () => tryPort(port + 1))
    server.once('listening', () => { server.close(() => resolve(port)) })
    server.listen(port, '127.0.0.1')
  }
  tryPort(start)
})

const waitForServer = (port, timeoutMs = 20000) => new Promise((resolve, reject) => {
  const start = Date.now()
  const check = () => {
    const socket = new net.Socket()
    socket.once('connect', () => { socket.destroy(); resolve() })
    socket.once('error', () => {
      socket.destroy()
      if (Date.now() - start > timeoutMs) { reject(new Error(`Server timeout on port ${port}`)); return }
      setTimeout(check, 500)
    })
    socket.connect(port, '127.0.0.1')
  }
  check()
})

const startDevServer = async (projectDir) => {
  const port = await findFreePort()
  log(`Starting dev server on port ${port}...`)

  const proc = spawn('npx', ['vite', '--port', String(port), '--host', '127.0.0.1'], {
    cwd: projectDir,
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: true,
  })

  // Log stderr for debugging
  proc.stderr?.on('data', (d) => {
    const msg = d.toString().trim()
    if (msg) process.stderr.write(`  [vite] ${msg.slice(0, 100)}\n`)
  })

  try {
    await waitForServer(port, 30000)
    log(`Dev server ready on port ${port}`)
    return { proc, port }
  } catch (err) {
    proc.kill()
    throw err
  }
}

const stopDevServer = (server) => {
  if (!server?.proc) return
  try {
    server.proc.kill('SIGTERM')
    // Force kill after 3s
    setTimeout(() => { try { server.proc.kill('SIGKILL') } catch {} }, 3000)
  } catch {}
  log('Dev server stopped')
}

// ---------------------------------------------------------------------------
// Phase 4: Observer V2
// ---------------------------------------------------------------------------

const runObserver = async (projectDir, port) => {
  const observerDir = path.join(projectDir, '.brain', 'observer')
  await ensureDir(observerDir)

  log(`Running observer on localhost:${port}...`)

  try {
    await callScript('eros-observer.mjs', [
      '--local', '--port', String(port), '--no-discover', observerDir,
    ], 180000)
    log('Observer complete')
  } catch (err) {
    log(`Observer error: ${err.message?.slice(0, 80)}`)
    return null
  }

  // Read results
  const manifest = await readJson(path.join(observerDir, 'localhost', 'manifest.json'))
  const analysisMd = await readText(path.join(observerDir, 'localhost', 'analysis.md'))

  return { manifest, analysisMd }
}

// ---------------------------------------------------------------------------
// Phase 5: Audit (quality chain)
// ---------------------------------------------------------------------------

const runAudit = async (projectDir) => {
  log('Running quality audit...')
  try {
    const result = await callScript('eros-audit.mjs', ['--project', projectDir], 60000)
    log(`Audit: ${result.overall?.pct || 0}% — ${result.pass ? 'PASS' : 'FAIL'}`)
    return result
  } catch (err) {
    log(`Audit error: ${err.message?.slice(0, 60)}`)
    return null
  }
}

// ---------------------------------------------------------------------------
// Phase 6: Gates per section
// ---------------------------------------------------------------------------

const runGates = async (projectDir) => {
  log('Running gates...')

  // Find built sections
  const sectionsDir = path.join(projectDir, 'src', 'components', 'sections')
  let sectionFiles = []
  try {
    sectionFiles = (await fs.readdir(sectionsDir))
      .filter(f => f.startsWith('S-') && f.endsWith('.vue'))
      .map(f => f.replace('.vue', ''))
  } catch {
    log('No sections directory found')
    return { sections: [], retries: [], flags: [] }
  }

  const results = []
  const retries = []
  const flags = []

  for (const section of sectionFiles) {
    const taskId = `build/${section}`
    try {
      const gate = await callScript('eros-gate.mjs', [
        'post', '--project', projectDir, '--task', taskId,
      ], 30000)

      results.push({ section, ...gate })

      if (gate.verdict === 'RETRY') {
        retries.push({ section, reasons: gate.reasons || [] })
        log(`  ${section}: RETRY — ${(gate.reasons || []).join(', ')}`)
      } else if (gate.verdict === 'FLAG') {
        flags.push({ section, reasons: gate.reasons || [] })
        log(`  ${section}: FLAG — ${(gate.reasons || []).join(', ')}`)
      } else {
        log(`  ${section}: APPROVE (score: ${gate.score ?? '?'})`)
      }
    } catch (err) {
      log(`  ${section}: gate error — ${err.message?.slice(0, 60)}`)
      results.push({ section, verdict: 'ERROR', reason: err.message })
    }
  }

  return { sections: results, retries, flags }
}

// ---------------------------------------------------------------------------
// Phase 7: Retry failing sections
// ---------------------------------------------------------------------------

const retrySection = async (projectDir, section, reasons, maxRetries) => {
  log(`Retrying ${section}...`)

  const prompt = `The section ${section} in project ${path.basename(projectDir)} failed the quality gate.

Reasons:
${reasons.map(r => `- ${r}`).join('\n')}

Fix this section. Read the current code at src/components/sections/${section}.vue, understand the issues, and rewrite it to pass the gate.

Requirements:
- Fix ALL listed issues
- Maintain the existing design intent
- Follow CLAUDE.md rules (tokens, easing, autoAlpha, etc.)
- The section must have a signature element
- All 6 excellence dimensions must be MEDIUM or STRONG

Only modify the single file: src/components/sections/${section}.vue`

  try {
    for await (const message of query({
      prompt,
      options: {
        cwd: projectDir,
        allowedTools: ['Read', 'Write', 'Edit', 'Glob', 'Grep', 'Bash'],
        permissionMode: 'acceptEdits',
        maxTurns: 30,
      },
    })) {
      if (message.type === 'tool_use') process.stderr.write('r')
    }
    log(`\n  ${section} retry complete`)
    return true
  } catch (err) {
    log(`\n  ${section} retry failed: ${err.message?.slice(0, 60)}`)
    return false
  }
}

// ---------------------------------------------------------------------------
// Phase 8: Validate rules with observer scores
// ---------------------------------------------------------------------------

const validateRulesWithObserver = async (observerData, projectDir) => {
  const rulesData = await readJson(path.join(memDir, 'rules.json'))
  if (!rulesData?.rules) return 0

  const manifest = observerData?.manifest
  if (!manifest) {
    log('No observer data — falling back to code-based rule validation')
    return validateRulesFromCode(rulesData, projectDir)
  }

  const excellence = manifest.excellenceSignals || {}
  const scores = manifest.scores || {}
  let validated = 0

  for (const rule of rulesData.rules) {
    if (rule.status !== 'CANDIDATE') continue
    const text = rule.text.toLowerCase()
    let applied = false

    // Map rules to observer dimensions
    if (text.includes('hover') || text.includes('craft') || text.includes('interaction')) {
      applied = excellence.craft === 'STRONG' || excellence.craft === 'MEDIUM'
    } else if (text.includes('depth') || text.includes('layer') || text.includes('z-index') || text.includes('overlap')) {
      applied = excellence.depth === 'STRONG' || excellence.depth === 'MEDIUM'
    } else if (text.includes('composition') || text.includes('grid') || text.includes('layout') || text.includes('asymmetric')) {
      applied = excellence.composition === 'STRONG' || excellence.composition === 'MEDIUM'
    } else if (text.includes('typography') || text.includes('font') || text.includes('type scale')) {
      applied = excellence.typography === 'STRONG' || excellence.typography === 'MEDIUM'
    } else if (text.includes('motion') || text.includes('animation') || text.includes('easing') || text.includes('stagger')) {
      applied = excellence.motion === 'STRONG' || excellence.motion === 'MEDIUM'
    } else if (text.includes('gradient placeholder') || text.includes('stock photo')) {
      // Check from code — observer doesn't cover this directly
      const srcDir = path.join(projectDir, 'src')
      const code = await collectProjectCode(srcDir)
      applied = !code.includes('linear-gradient') || code.includes('<img')
    } else if (text.includes('inter') || text.includes('roboto') || text.includes('arial')) {
      const srcDir = path.join(projectDir, 'src')
      const code = await collectProjectCode(srcDir)
      applied = !/'inter'|"inter"|'roboto'|"roboto"|'arial'|"arial"/i.test(code)
    } else {
      // Default: overall quality signal
      const avgScore = Object.values(scores).reduce((s, v) => s + (v || 0), 0) / Math.max(Object.values(scores).length, 1)
      applied = avgScore >= 6
    }

    if (applied) {
      rule.validations = (rule.validations || 0) + 1
      validated++
      if (rule.validations >= 3 && rule.status !== 'PROMOTED') {
        rule.status = 'PROMOTED'
        rule.promotedAt = new Date().toISOString()
        log(`Rule PROMOTED: "${rule.text.slice(0, 60)}" (${rule.validations} validations)`)
      }
    }
  }

  // Deduplicate
  const seen = new Map()
  for (const r of rulesData.rules) {
    const key = r.text.toLowerCase().trim()
    if (seen.has(key)) {
      const existing = seen.get(key)
      existing.validations = Math.max(existing.validations || 0, r.validations || 0)
      if (r.status === 'PROMOTED') existing.status = 'PROMOTED'
    } else {
      seen.set(key, { ...r })
    }
  }
  rulesData.rules = [...seen.values()]
  await writeJson(path.join(memDir, 'rules.json'), rulesData)

  log(`Validated ${validated} rules with observer scores`)
  return validated
}

const collectProjectCode = async (srcDir) => {
  let code = ''
  const walk = async (dir) => {
    const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => [])
    for (const e of entries) {
      if (e.isFile() && (e.name.endsWith('.vue') || e.name.endsWith('.css') || e.name.endsWith('.js'))) {
        code += await fs.readFile(path.join(dir, e.name), 'utf8').catch(() => '')
      } else if (e.isDirectory() && e.name !== 'node_modules') {
        await walk(path.join(dir, e.name))
      }
    }
  }
  await walk(srcDir)
  return code
}

const validateRulesFromCode = async (rulesData, projectDir) => {
  // Fallback: same logic as V1 but slightly improved
  const srcDir = path.join(projectDir, 'src')
  const code = (await collectProjectCode(srcDir)).toLowerCase()
  let validated = 0

  for (const rule of rulesData.rules) {
    if (rule.status !== 'CANDIDATE') continue
    const text = rule.text.toLowerCase()
    let applied = false

    if (text.includes('inter') || text.includes('roboto')) {
      applied = !code.includes("'inter'") && !code.includes('"inter"') && !code.includes("'roboto'")
    } else if (text.includes('hover')) {
      applied = (code.match(/:hover/g) || []).length >= 3
    } else if (text.includes('depth') || text.includes('layer')) {
      applied = (code.match(/z-index/g) || []).length >= 3
    } else {
      applied = true
    }

    if (applied) {
      rule.validations = (rule.validations || 0) + 1
      validated++
      if (rule.validations >= 3 && rule.status !== 'PROMOTED') {
        rule.status = 'PROMOTED'
        rule.promotedAt = new Date().toISOString()
      }
    }
  }

  const seen = new Map()
  for (const r of rulesData.rules) {
    const key = r.text.toLowerCase().trim()
    if (seen.has(key)) {
      const existing = seen.get(key)
      existing.validations = Math.max(existing.validations || 0, r.validations || 0)
      if (r.status === 'PROMOTED') existing.status = 'PROMOTED'
    } else {
      seen.set(key, { ...r })
    }
  }
  rulesData.rules = [...seen.values()]
  await writeJson(path.join(memDir, 'rules.json'), rulesData)

  return validated
}

// ---------------------------------------------------------------------------
// Phase 9: Post-session learning
// ---------------------------------------------------------------------------

const learnFromSession = async (projectDir, observerData, auditResult, gateResults) => {
  log('Learning from session...')

  // Correct (learn from edits)
  try { await callScript('eros-train.mjs', ['correct', '--project', projectDir], 60000) } catch {}

  // Reflect
  try { await callScript('eros-meta.mjs', ['reflect', '--project', projectDir], 60000) } catch {}

  // Update personality
  try { await callScript('eros-meta.mjs', ['personality'], 30000) } catch {}

  // Promote rules
  try { await callScript('eros-memory.mjs', ['promote'], 30000) } catch {}

  // Record practice result
  const avgScore = gateResults.sections.length > 0
    ? gateResults.sections.reduce((s, g) => s + (g.score || 0), 0) / gateResults.sections.length
    : null

  const practiceResult = {
    avgScore,
    observerAvg: observerData?.manifest?.scores
      ? Object.values(observerData.manifest.scores).reduce((s, v) => s + (v || 0), 0) /
        Math.max(Object.values(observerData.manifest.scores).length, 1)
      : null,
    auditPct: auditResult?.overall?.pct || null,
    sectionsCompleted: gateResults.sections.filter(s => s.verdict === 'APPROVE').length,
    sectionsFlagged: gateResults.flags.length,
    sectionsRetried: gateResults.retries.length,
  }

  // Save to pipeline-lessons if there were flags
  if (gateResults.flags.length > 0) {
    try {
      const lessonsFile = path.join(memDir, 'pipeline-lessons.json')
      const lessons = await readJson(lessonsFile) || { lessons: [] }
      for (const flag of gateResults.flags) {
        lessons.lessons.push({
          date: today(),
          type: 'auto-train-flag',
          section: flag.section,
          reasons: flag.reasons,
          context: 'auto-training V2',
        })
      }
      // Keep last 50 lessons
      lessons.lessons = lessons.lessons.slice(-50)
      await writeJson(lessonsFile, lessons)
    } catch {}
  }

  return practiceResult
}

// ---------------------------------------------------------------------------
// Find project directory
// ---------------------------------------------------------------------------

const findProjectDir = async (slug) => {
  // Try exact slug
  const direct = path.join(desktopDir, slug)
  if (await fs.access(direct).then(() => true).catch(() => false)) {
    const hasBrain = await fs.access(path.join(direct, '.brain')).then(() => true).catch(() => false)
    if (hasBrain) return direct
  }

  // Search Desktop for practice projects
  const entries = await fs.readdir(desktopDir, { withFileTypes: true })
  for (const e of entries) {
    if (!e.isDirectory() || e.name === 'maqueta' || e.name === 'Maqueta-Pegasuz-V2') continue
    if (e.name.includes('practice') || e.name.includes(slug)) {
      const brainPath = path.join(desktopDir, e.name, '.brain')
      if (await fs.access(brainPath).then(() => true).catch(() => false)) {
        return path.join(desktopDir, e.name)
      }
    }
  }

  return null
}

// ---------------------------------------------------------------------------
// Full session orchestrator
// ---------------------------------------------------------------------------

const runFullSession = async (sessionNum, maxRetries) => {
  const sessionStart = Date.now()

  // ── Phase 0: Discover reference ──
  const ref = await discoverAndStudyReference()

  // ── Phase 1: Generate brief ──
  log('\nPhase 1: Generating brief...')
  const { brief, rulesBlock } = await generateBriefFromReference(ref)
  log(`Brief: ${brief.name}`)
  log(`Mood: ${brief.mood} | Sections: ${(brief.sections || []).join(', ')}`)
  log(`Technique: ${brief.techniqueChallenge}`)
  if (ref) log(`Reference: ${ref.title || ref.url}`)

  // ── Phase 2: Build project ──
  log('\nPhase 2: Building project...')
  const buildResult = await buildProject(brief, rulesBlock)

  // ── Find the built project ──
  const projectDir = await findProjectDir(brief.id)
  if (!projectDir) {
    log('ERROR: Could not find built project directory')
    return { brief, error: 'project not found', duration: Math.round((Date.now() - sessionStart) / 1000) }
  }
  log(`Project at: ${projectDir}`)

  // ── Phase 3: Start dev server ──
  let server = null
  let observerData = null
  let auditResult = null

  try {
    log('\nPhase 3: Starting dev server...')

    // Install deps first
    log('Installing dependencies...')
    await new Promise((resolve, reject) => {
      execFile('npm', ['install'], { cwd: projectDir, timeout: 120000, shell: true }, (err) => {
        if (err) reject(err); else resolve()
      })
    })

    server = await startDevServer(projectDir)

    // ── Phase 4: Observer V2 ──
    log('\nPhase 4: Running observer...')
    observerData = await runObserver(projectDir, server.port)

    // ── Phase 5: Audit ──
    log('\nPhase 5: Running audit...')
    auditResult = await runAudit(projectDir)

  } catch (err) {
    log(`Server/observer phase error: ${err.message}`)
  }

  // Stop server before gates (we don't need it anymore for now)
  stopDevServer(server)
  server = null

  // ── Phase 6: Gates ──
  log('\nPhase 6: Running gates...')
  let gateResults = await runGates(projectDir)

  // ── Phase 7: Retry failing sections ──
  if (gateResults.retries.length > 0 && maxRetries > 0) {
    log(`\nPhase 7: Retrying ${gateResults.retries.length} sections...`)

    for (const retry of gateResults.retries) {
      await retrySection(projectDir, retry.section, retry.reasons, maxRetries)
    }

    // Re-run observer + gates after retries
    try {
      log('\nRe-running observer after retries...')

      // Restart dev server
      server = await startDevServer(projectDir)
      observerData = await runObserver(projectDir, server.port)
      stopDevServer(server)
      server = null

      // Re-run gates
      gateResults = await runGates(projectDir)
    } catch (err) {
      log(`Post-retry evaluation error: ${err.message?.slice(0, 60)}`)
      stopDevServer(server)
      server = null
    }
  }

  // ── Phase 8: Validate rules ──
  log('\nPhase 8: Validating rules...')
  const rulesValidated = await validateRulesWithObserver(observerData, projectDir)

  // ── Phase 9: Learn ──
  log('\nPhase 9: Learning...')
  const practiceResult = await learnFromSession(projectDir, observerData, auditResult, gateResults)

  // ── Phase 10: Cleanup ──
  log('\nPhase 10: Cleanup...')
  try {
    await fs.rm(projectDir, { recursive: true, force: true })
    log(`Cleaned up ${path.basename(projectDir)}`)
  } catch {}

  const duration = Math.round((Date.now() - sessionStart) / 1000)

  const sessionResult = {
    brief,
    reference: ref ? { url: ref.url, title: ref.title } : null,
    build: buildResult,
    observer: observerData?.manifest?.scores || null,
    audit: auditResult?.overall || null,
    gates: {
      approved: gateResults.sections.filter(s => s.verdict === 'APPROVE').length,
      retried: gateResults.retries.length,
      flagged: gateResults.flags.length,
      total: gateResults.sections.length,
    },
    rulesValidated,
    practiceResult,
    duration,
  }

  // Persist to training history
  await saveToHistory(sessionResult)

  return sessionResult
}

// ---------------------------------------------------------------------------
// Training history persistence
// ---------------------------------------------------------------------------

const historyPath = path.join(memDir, 'training-history.json')

const saveToHistory = async (result) => {
  const history = (await readJson(historyPath)) || { sessions: [] }
  history.sessions.push({
    id: result.brief?.id || `session-${Date.now()}`,
    date: new Date().toISOString().slice(0, 10),
    timestamp: new Date().toISOString(),
    name: result.brief?.name || 'Unknown',
    mood: result.brief?.mood || null,
    sections: result.brief?.sections || [],
    technique: result.brief?.techniqueChallenge || null,
    reference: result.reference || null,
    duration: result.duration,
    observer: result.observer || null,
    audit: result.audit || null,
    gates: result.gates || null,
    rulesValidated: result.rulesValidated || 0,
  })
  // Keep last 100 sessions
  if (history.sessions.length > 100) {
    history.sessions = history.sessions.slice(-100)
  }
  await writeJson(historyPath, history)
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const main = async () => {
  const args = parseArgs(process.argv.slice(2))
  const count = parseInt(args.count || '1')
  const dryRun = args['dry-run'] === true
  const skipDiscover = args['skip-discover'] === true
  const maxRetries = parseInt(args['max-retries'] || '1')

  log('')
  log('═══════════════════════════════════════════')
  log(' EROS AUTO-TRAINING V2 — Real Pipeline')
  log(` Sessions: ${count}${dryRun ? ' (dry run)' : ''}`)
  log(` Max retries: ${maxRetries}`)
  log('═══════════════════════════════════════════')
  log('')

  const statsBefore = await callScript('eros-memory.mjs', ['stats']).catch(() => null)
  log(`Memory before: ${statsBefore?.totalDataPoints || '?'} data points`)
  log('')

  const sessionResults = []

  for (let i = 1; i <= count; i++) {
    log(`\n╔═══ Session ${i}/${count} ═══════════════════════════╗`)

    if (dryRun) {
      const ref = skipDiscover ? null : await discoverAndStudyReference()
      const { brief } = await generateBriefFromReference(ref)
      log(`Brief: ${brief.name}`)
      log(`Mood: ${brief.mood} | Sections: ${(brief.sections || []).join(', ')}`)
      log(`Technique: ${brief.techniqueChallenge}`)
      log(`Reference: ${ref?.title || 'none'}`)
      log('DRY RUN — skipping build\n')
      sessionResults.push({ brief, dryRun: true })
      continue
    }

    const result = await runFullSession(i, maxRetries)
    sessionResults.push(result)

    log(`\n╚═══ Session ${i} complete ════════════════════╝`)
    log(`  Duration: ${result.duration}s`)
    log(`  Gates: ${result.gates?.approved || 0} approved, ${result.gates?.retried || 0} retried, ${result.gates?.flagged || 0} flagged`)
    log(`  Observer: ${JSON.stringify(result.observer || 'n/a')}`)
    log(`  Audit: ${result.audit?.pct || '?'}%`)
    log(`  Rules validated: ${result.rulesValidated}`)
    log('')
  }

  // Final stats
  const statsAfter = await callScript('eros-memory.mjs', ['stats']).catch(() => null)

  log('═══════════════════════════════════════════')
  log(' TRAINING V2 COMPLETE')
  log(` Sessions: ${count}`)
  log(` Memory: ${statsBefore?.totalDataPoints || '?'} → ${statsAfter?.totalDataPoints || '?'} data points`)
  log('═══════════════════════════════════════════')

  // Final personality
  try {
    const personality = await callScript('eros-meta.mjs', ['personality'])
    log(`State: ${personality.identity?.currentState}`)
    log(`Philosophy: ${personality.voice?.philosophy}`)
  } catch {}

  out({
    version: 2,
    sessions: count,
    dryRun,
    maxRetries,
    memoryBefore: statsBefore?.totalDataPoints || 0,
    memoryAfter: statsAfter?.totalDataPoints || 0,
    growth: (statsAfter?.totalDataPoints || 0) - (statsBefore?.totalDataPoints || 0),
    results: sessionResults.map(r => ({
      brief: r.brief?.name,
      reference: r.reference?.title || null,
      duration: r.duration,
      gates: r.gates,
      audit: r.audit?.pct,
      rulesValidated: r.rulesValidated,
    })),
  })
}

main().catch(err => { log(`Fatal: ${err.message}`); process.exit(1) })
