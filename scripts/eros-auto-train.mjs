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

import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFile, spawn } from 'node:child_process'
import { promises as fs, existsSync } from 'node:fs'
import net from 'node:net'
import { parseArgs, readJson, writeJson, readText, ensureDir, out, fail, today } from './lib/utils.mjs'
import { appendEvent } from './eros-feed.mjs'
import { smokePucho } from './eros-pucho.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const maquetaDir = path.resolve(__dirname, '..')
const desktopDir = path.join(process.env.HOME || process.env.USERPROFILE, 'Desktop')
const memDir = path.join(maquetaDir, '.eros', 'memory', 'design-intelligence')

const log = (msg) => process.stderr.write(`[eros-train] ${msg}\n`)

// ---------------------------------------------------------------------------
// Live status file — enables the panel to show real-time training progress
// without polling the log tail. Written on every phase transition.
// ---------------------------------------------------------------------------
const statusPath = path.join(memDir, 'auto-train-status.json')
const TOTAL_PHASES = 10
const phaseLabels = {
  0: 'Discovering reference (Awwwards)',
  1: 'Generating brief',
  2: 'Building project (claude -p)',
  3: 'Starting dev server',
  4: 'Running observer',
  5: 'Running audit',
  6: 'Running gates',
  7: 'Retrying failing sections',
  8: 'Validating rules',
  9: 'Learning from session',
  10: 'Cleanup',
}

let statusCache = null
const updateStatus = async (patch) => {
  try {
    statusCache = { ...(statusCache || {}), ...patch, lastUpdatedAt: new Date().toISOString() }
    const { promises: fsP } = await import('node:fs')
    await fsP.mkdir(path.dirname(statusPath), { recursive: true })
    await fsP.writeFile(statusPath, JSON.stringify(statusCache, null, 2) + '\n', 'utf8')
  } catch { /* status file is best-effort — never fail the pipeline over it */ }
}

const setPhase = async (index, extras = {}) => {
  await updateStatus({
    phaseIndex: index,
    phase: phaseLabels[index] || `Phase ${index}`,
    phaseStartedAt: new Date().toISOString(),
    totalPhases: TOTAL_PHASES,
    ...extras,
  })
}

// ---------------------------------------------------------------------------
// Executable resolution (Windows PATH workaround)
// ---------------------------------------------------------------------------
// Git-bash sets PATH with colons and unix-style dirs (/c/foo/bar), but
// cmd.exe (what spawn+shell:true uses on Windows) expects semicolons and
// Windows dirs (C:\foo\bar). Result: detached spawns can't find
// claude/npm/npx even though bash can. Fix: resolve absolute paths at
// startup and invoke .cmd files via `node <cli-js>` to bypass the shell.

const nodeBinDir = path.dirname(process.execPath)
const homeDir = process.env.USERPROFILE || process.env.HOME || ''
const findFirst = (candidates) => candidates.find(c => c && existsSync(c)) || null

const CLAUDE_EXE = findFirst([
  path.join(homeDir, '.local', 'bin', 'claude.exe'),
  path.join(homeDir, '.local', 'bin', 'claude'),
]) || 'claude'

const NPM_CLI = findFirst([
  path.join(nodeBinDir, 'node_modules', 'npm', 'bin', 'npm-cli.js'),
])

const NPX_CLI = findFirst([
  path.join(nodeBinDir, 'node_modules', 'npm', 'bin', 'npx-cli.js'),
])

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const callScript = (script, args, timeoutMs = 300000) => new Promise((resolve, reject) => {
  execFile(process.execPath, [path.join(__dirname, script), ...args], {
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
  // Schema drift: discover writes siteUrl, but older code reads ref.url. Normalize.
  const url = ref.url || ref.siteUrl
  log(`Reference: ${ref.title || url} (${url})`)

  // Try to load the observer analysis from the study.
  // Slug drift: discover saves a title-based slug (e.g. "champions-for-good"),
  // but eros-train.mjs study saves under a URL-derived slug
  // (e.g. "champions4good-club"). Try both.
  let analysis = null
  const trainingRefsDir = path.join(maquetaDir, '_training-refs')
  const candidates = []
  if (ref.slug) {
    candidates.push(ref.slug)
    candidates.push(ref.slug.replace(/\./g, '-'))
  }
  if (url) {
    const urlSlug = url
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/$/, '')
      .replace(/[./]/g, '-')
    candidates.push(urlSlug)
  }
  for (const slug of candidates) {
    if (!slug) continue
    const found = await readJson(path.join(trainingRefsDir, slug, 'analysis.json'))
    if (found) { analysis = found; break }
  }

  return { url, title: ref.title, slug: ref.slug, analysis }
}

// ---------------------------------------------------------------------------
// Phase 1: Generate brief from reference
// ---------------------------------------------------------------------------

const generateBriefFromReference = async (ref) => {
  // Get gap analysis to also target weaknesses
  const gaps = await callScript('eros-meta.mjs', ['gaps'])

  // ── Anti-convergencia: load recent sessions to avoid repetition ──
  // Without this, Eros picks the same gap-targeted mood/technique
  // every run, converging to a single pattern. PLAN-EROS-V8 Fase 9.
  const recentHistory = (await readJson(historyPath)) || { sessions: [] }
  const last5 = (recentHistory.sessions || []).slice(-5)
  const recentMoods = new Set(last5.map((s) => s.mood).filter(Boolean))
  const recentTechniques = new Set(last5.map((s) => s.technique).filter(Boolean))
  const recentSectionTypes = new Set(
    last5.flatMap((s) => (s.sections || []).map((name) => String(name).replace(/^S-/, '').toLowerCase())),
  )

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

  // ── Mood selection with anti-convergence ──
  // Prefer blind spots that haven't been used in the last 5 runs. Only
  // fall back to the default "first blind spot" if everything has been
  // used recently (means Eros genuinely has no fresh moods to try).
  const moodBlindSpots = gaps.moodBlindSpots || []
  const freshMood = moodBlindSpots.find((m) => !recentMoods.has(m))
  if (freshMood) mood = freshMood
  else if (moodBlindSpots[0] && !recentMoods.has(mood)) mood = moodBlindSpots[0]
  // If mood IS in recentMoods AND no fresh blind spot exists: keep
  // ref-derived mood (won't force repetition of a recently-used mood).

  // ── Section selection with anti-convergence ──
  // Prefer weak section types that haven't been built in recent runs.
  const weakTypes = (gaps.weakSectionTypes || []).map(t => typeof t === 'string' ? t : t.type)
  const freshWeakTypes = weakTypes.filter((t) => !recentSectionTypes.has(t.toLowerCase()))
  const orderedWeakTypes = [...freshWeakTypes, ...weakTypes.filter((t) => !freshWeakTypes.includes(t))]
  const selectedSections = ['hero']
  for (const type of orderedWeakTypes) {
    if (type !== 'hero' && selectedSections.length < 4) selectedSections.push(type)
  }
  const fallbacks = ['features', 'about', 'cta', 'testimonials', 'pricing', 'faq']
  for (const t of fallbacks) {
    if (selectedSections.length >= 3) break
    if (!selectedSections.includes(t)) selectedSections.push(t)
  }

  // ── Technique challenge with anti-convergence ──
  // Force a technique with < 3 uses AND not used in recent 5 runs.
  const untouchedTechs = (gaps.untouchedTechniques || [])
    .map((t) => (typeof t === 'string' ? t : t?.name))
    .filter(Boolean)
  const freshTech = untouchedTechs.find((t) => !recentTechniques.has(t))
  const techniqueChallenge =
    freshTech ||
    untouchedTechs[0] ||
    (techniques[0]?.name || techniques[0]) ||
    'Stagger cascade'

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
// Phase 2: Build project with Claude Code CLI (claude -p)
// Uses subscription auth + full Claude Code environment (skills, /project,
// hooks, CLAUDE.md discovery). Equivalent to opening a terminal and typing
// `claude` then `/project <brief>` by hand.
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

  log(`Spawning claude CLI: ${brief.id}`)
  log(`Prompt: ${prompt.length} chars`)

  const startTime = Date.now()
  let toolUses = 0

  try {
    await new Promise((resolve, reject) => {
      const proc = spawn(CLAUDE_EXE, [
        '-p', prompt,
        '--permission-mode', 'acceptEdits',
        '--add-dir', desktopDir,
        '--output-format', 'stream-json',
        '--verbose',
        '--name', `eros-train-${brief.id}`,
      ], {
        cwd: maquetaDir,
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: false,
      })

      let stdoutBuf = ''
      proc.stdout.on('data', (d) => {
        stdoutBuf += d.toString()
        const lines = stdoutBuf.split('\n')
        stdoutBuf = lines.pop() || ''
        for (const line of lines) {
          if (!line.trim()) continue
          try {
            const msg = JSON.parse(line)
            if (msg.type === 'assistant' && msg.message?.content) {
              for (const c of msg.message.content) {
                if (c.type === 'tool_use') {
                  toolUses++
                  process.stderr.write('.')
                }
              }
            }
          } catch { /* not JSON — ignore */ }
        }
      })

      proc.stderr.on('data', (d) => {
        const msg = d.toString().trim()
        if (msg) process.stderr.write(`\n  [claude] ${msg.slice(0, 120)}`)
      })

      proc.on('close', (code) => {
        if (code === 0 || code === null) resolve()
        else reject(new Error(`claude exited with code ${code}`))
      })
      proc.on('error', reject)
    })
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

  if (!NPX_CLI) throw new Error('npx-cli.js not found — cannot start dev server')
  const proc = spawn(process.execPath, [NPX_CLI, 'vite', '--port', String(port), '--host', '127.0.0.1'], {
    cwd: projectDir,
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: false,
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
  const manifestPath = path.join(observerDir, 'localhost', 'manifest.json')

  // Clear stale observer data before running fresh analysis.
  // Without this, a failed observer run would leave the old manifest on disk,
  // and subsequent reads would return cached scores from a previous session.
  try {
    await fs.rm(path.join(observerDir, 'localhost'), { recursive: true, force: true })
  } catch {}
  await ensureDir(observerDir)

  const startedAt = Date.now()
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

  // Read results — verify the manifest is fresh (created after we started)
  const manifest = await readJson(manifestPath)
  if (!manifest) {
    log('Observer produced no manifest — scores will be null')
    return null
  }

  // Freshness check: reject manifests older than this run
  const capturedAt = manifest.capturedAt ? new Date(manifest.capturedAt).getTime() : 0
  if (capturedAt < startedAt - 5000) {
    log(`Observer manifest is stale (capturedAt ${manifest.capturedAt || 'missing'}, started ${new Date(startedAt).toISOString()}). Discarding.`)
    return null
  }

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
    await new Promise((resolve, reject) => {
      const proc = spawn(CLAUDE_EXE, [
        '-p', prompt,
        '--permission-mode', 'acceptEdits',
        '--output-format', 'stream-json',
        '--verbose',
        '--name', `eros-retry-${section}`,
      ], {
        cwd: projectDir,
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: false,
      })

      let stdoutBuf = ''
      proc.stdout.on('data', (d) => {
        stdoutBuf += d.toString()
        const lines = stdoutBuf.split('\n')
        stdoutBuf = lines.pop() || ''
        for (const line of lines) {
          if (!line.trim()) continue
          try {
            const msg = JSON.parse(line)
            if (msg.type === 'assistant' && msg.message?.content) {
              for (const c of msg.message.content) {
                if (c.type === 'tool_use') process.stderr.write('r')
              }
            }
          } catch {}
        }
      })
      proc.stderr.on('data', () => {})
      proc.on('close', (code) => {
        if (code === 0 || code === null) resolve()
        else reject(new Error(`claude retry exited with code ${code}`))
      })
      proc.on('error', reject)
    })
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
  await setPhase(0)
  const ref = await discoverAndStudyReference()

  // ── Phase 1: Generate brief ──
  log('\nPhase 1: Generating brief...')
  await setPhase(1)
  const { brief, rulesBlock } = await generateBriefFromReference(ref)
  log(`Brief: ${brief.name}`)
  log(`Mood: ${brief.mood} | Sections: ${(brief.sections || []).join(', ')}`)
  log(`Technique: ${brief.techniqueChallenge}`)
  if (ref) log(`Reference: ${ref.title || ref.url}`)
  await updateStatus({
    sessionId: brief.id,
    briefName: brief.name,
    mood: brief.mood,
    sections: brief.sections || [],
    technique: brief.techniqueChallenge,
    reference: ref ? { title: ref.title || ref.url, url: ref.url || ref.siteUrl } : null,
  })

  // ── Phase 2: Build project ──
  log('\nPhase 2: Building project...')
  await setPhase(2, { currentTask: 'claude -p /project' })
  const buildResult = await buildProject(brief, rulesBlock)

  // ── Find the built project ──
  const projectDir = await findProjectDir(brief.id)
  if (!projectDir) {
    log('ERROR: Could not find built project directory')
    return { brief, error: 'project not found', duration: Math.round((Date.now() - sessionStart) / 1000) }
  }
  log(`Project at: ${projectDir}`)
  await updateStatus({ projectDir })

  // ── Phase 3: Start dev server ──
  let server = null
  let observerData = null
  let auditResult = null

  try {
    log('\nPhase 3: Starting dev server...')
    await setPhase(3, { currentTask: 'npm install' })

    // Install deps first
    log('Installing dependencies...')
    await new Promise((resolve, reject) => {
      if (!NPM_CLI) { reject(new Error('npm-cli.js not found')); return }
      execFile(process.execPath, [NPM_CLI, 'install'], { cwd: projectDir, timeout: 120000 }, (err) => {
        if (err) reject(err); else resolve()
      })
    })

    await updateStatus({ currentTask: 'vite dev server' })
    server = await startDevServer(projectDir)

    // ── Phase 4: Observer V2 ──
    log('\nPhase 4: Running observer...')
    await setPhase(4, { currentTask: `observer on :${server.port}` })
    observerData = await runObserver(projectDir, server.port)

    // ── Phase 5: Audit ──
    log('\nPhase 5: Running audit...')
    await setPhase(5)
    auditResult = await runAudit(projectDir)

  } catch (err) {
    log(`Server/observer phase error: ${err.message}`)
  }

  // Stop server before gates (we don't need it anymore for now)
  stopDevServer(server)
  server = null

  // ── Phase 6: Gates ──
  log('\nPhase 6: Running gates...')
  await setPhase(6)
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

  // Phase 7 branch ends here (retry is conditional, no separate entry)
  if (gateResults.retries.length > 0) {
    await setPhase(7, { currentTask: `retrying ${gateResults.retries.length} sections` })
  }

  // ── Phase 8: Validate rules ──
  log('\nPhase 8: Validating rules...')
  await setPhase(8)
  const rulesValidated = await validateRulesWithObserver(observerData, projectDir)

  // ── Phase 9: Learn ──
  log('\nPhase 9: Learning...')
  await setPhase(9)
  const practiceResult = await learnFromSession(projectDir, observerData, auditResult, gateResults)

  // ── Preserve preview screenshots before cleanup ──
  // Phase 10 nukes the project dir, which would otherwise delete the
  // observer PNGs. Copy the key frames into a persistent location keyed
  // by session id so the panel can show them in the detail modal later.
  try {
    const previewDir = path.join(memDir, 'previews', brief.id)
    await ensureDir(previewDir)
    const observerLocal = path.join(projectDir, '.brain', 'observer', 'localhost')
    const framesToSave = [
      'full-page-desktop.png',
      'full-page-mobile.png',
      'frame-000.png',
      'frame-001.png',
    ]
    let saved = 0
    for (const name of framesToSave) {
      try {
        await fs.copyFile(path.join(observerLocal, name), path.join(previewDir, name))
        saved++
      } catch { /* frame may not exist — skip */ }
    }
    // Also save the desktop/ and mobile/ subdir first frames if present
    for (const sub of ['desktop', 'mobile']) {
      try {
        const entries = await fs.readdir(path.join(observerLocal, sub))
        const firstFrame = entries.find((f) => /^frame-\d+\.png$/.test(f))
        if (firstFrame) {
          await fs.copyFile(
            path.join(observerLocal, sub, firstFrame),
            path.join(previewDir, `${sub}-${firstFrame}`),
          )
          saved++
        }
      } catch {}
    }
    if (saved > 0) log(`Preserved ${saved} preview frame(s) for ${brief.id}`)
  } catch (err) {
    log(`Preview preservation error: ${err.message?.slice(0, 80)}`)
  }

  // ── Phase 10: Cleanup ──
  log('\nPhase 10: Cleanup...')
  await setPhase(10)
  try {
    await fs.rm(projectDir, { recursive: true, force: true })
    log(`Cleaned up ${path.basename(projectDir)}`)
  } catch {}

  const duration = Math.round((Date.now() - sessionStart) / 1000)

  // Extract observer scores from the real manifest paths.
  // The observer writes `manifest.excellenceSignals._scores` (numeric) +
  // `manifest.antiTemplate.score`. Previously we read `manifest.scores`
  // which never existed — every session landed with observer: null.
  let observerScores = null
  const rawScores = observerData?.manifest?.excellenceSignals?._scores
  if (rawScores && typeof rawScores === 'object') {
    observerScores = {
      composition: rawScores.composition ?? null,
      depth: rawScores.depth ?? null,
      typography: rawScores.typography ?? null,
      motion: rawScores.motion ?? null,
      craft: rawScores.craft ?? null,
      antiTemplate: observerData?.manifest?.antiTemplate?.score
        ?? observerData?.manifest?.antiTemplate?._score
        ?? null,
    }
  }

  const sessionResult = {
    brief,
    reference: ref ? { url: ref.url, title: ref.title } : null,
    build: buildResult,
    observer: observerScores,
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

  // Post to activity feed — lets the Eros panel timeline show this event
  try {
    const auditPct = result.audit?.pct
    const gateSummary = result.gates
      ? `${result.gates.approved}✓ ${result.gates.retried}r ${result.gates.flagged}f`
      : null
    const detailParts = [
      auditPct != null ? `audit ${auditPct}%` : null,
      gateSummary,
      result.duration ? `${Math.round(result.duration / 60)}m` : null,
      (result.brief?.sections || []).length ? `${result.brief.sections.length} secciones` : null,
    ].filter(Boolean)

    await appendEvent({
      type: result.error ? 'project-failed' : 'project-completed',
      title: result.brief?.name || 'Practice run',
      detail: detailParts.join(' · ') || 'session finished',
      metadata: {
        briefId: result.brief?.id,
        reference: result.reference?.title || null,
        mood: result.brief?.mood || null,
        audit: auditPct,
        duration: result.duration,
      },
    })
  } catch { /* feed is best-effort */ }

  // Smoke a pucho to mark the moment. Context depends on outcome —
  // celebration for a clean run, frustrated for failures or rough gates.
  try {
    const auditPct = result.audit?.pct
    const gateFlags = result.gates?.flagged || 0
    const gateRetries = result.gates?.retried || 0

    let context = 'celebration'
    let reason = `${result.brief?.name || 'practice'} terminó — audit ${auditPct ?? '?'}%`

    if (result.error) {
      context = 'frustrated'
      reason = `${result.brief?.name || 'practice'} falló: ${String(result.error).slice(0, 80)}`
    } else if (gateFlags > 0 || (auditPct != null && auditPct < 50)) {
      context = 'frustrated'
      reason = `${result.brief?.name || 'practice'}: ${gateFlags} flags · audit ${auditPct ?? '?'}%. Hay algo que no cerró.`
    } else if (gateRetries > 0) {
      context = 'reflection'
      reason = `${result.brief?.name || 'practice'}: ${gateRetries} retries necesarios. Releer qué disparó los fixes.`
    }

    await smokePucho({ reason, context })
  } catch { /* puchos are best-effort */ }
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

  // Initialize live status file — the panel polls this to show progress.
  await updateStatus({
    active: true,
    startedAt: new Date().toISOString(),
    count,
    dryRun,
    maxRetries,
    phaseIndex: -1,
    phase: 'initializing',
    totalPhases: TOTAL_PHASES,
    memoryBefore: statsBefore?.totalDataPoints || 0,
    sessionId: null,
    briefName: null,
    mood: null,
    reference: null,
    projectDir: null,
    lastResult: null,
  })

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

  // Mark run as finished in status file — the panel stops showing "activo"
  await updateStatus({
    active: false,
    finishedAt: new Date().toISOString(),
    phaseIndex: TOTAL_PHASES,
    phase: 'complete',
    currentTask: null,
    memoryAfter: statsAfter?.totalDataPoints || 0,
    lastResult: sessionResults.map((r) => ({
      brief: r.brief?.name,
      duration: r.duration,
      audit: r.audit?.pct || null,
      gates: r.gates || null,
    })),
  })

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

main().catch(async (err) => {
  log(`Fatal: ${err.message}`)
  try { await updateStatus({ active: false, error: err.message, finishedAt: new Date().toISOString() }) } catch {}
  process.exit(1)
})
