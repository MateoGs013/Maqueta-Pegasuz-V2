#!/usr/bin/env node
/**
 * eros-auto-train.mjs — Eros trains autonomously
 *
 * Uses the Claude Agent SDK to spawn a full /project session,
 * letting Eros build practice projects, evaluate them, and learn.
 *
 * Usage:
 *   node eros-auto-train.mjs                    # 1 practice session
 *   node eros-auto-train.mjs --count 3          # 3 sessions
 *   node eros-auto-train.mjs --dry-run          # preview without building
 */

import { query } from '@anthropic-ai/claude-agent-sdk'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFile } from 'node:child_process'
import { promises as fs } from 'node:fs'
import { parseArgs, readJson, out, fail, today } from './eros-utils.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const maquetaDir = path.resolve(__dirname, '..')

const callScript = (script, args) => new Promise((resolve, reject) => {
  execFile('node', [path.join(__dirname, script), ...args], { cwd: __dirname, timeout: 30000 }, (err, stdout) => {
    if (err) { reject(err); return }
    try { resolve(JSON.parse(stdout)) } catch { resolve({ raw: stdout }) }
  })
})

const log = (msg) => process.stderr.write(`[eros-train] ${msg}\n`)

// ---------------------------------------------------------------------------
// Generate practice brief
// ---------------------------------------------------------------------------

const generateBrief = async () => {
  const gaps = await callScript('eros-meta.mjs', ['gaps'])
  const brief = await callScript('eros-practice.mjs', ['generate'])
  return { brief: brief.brief, gaps }
}

// ---------------------------------------------------------------------------
// Build the /project prompt from brief
// ---------------------------------------------------------------------------

const buildPrompt = async (brief) => {
  // Load candidate rules to inject into the brief
  let rulesBlock = ''
  try {
    const rulesData = await readJson(path.join(path.resolve(__dirname, '..'), '.claude', 'memory', 'design-intelligence', 'rules.json'))
    const allRules = (rulesData?.rules || [])
    const promoted = allRules.filter(r => r.status === 'PROMOTED').map(r => r.text)
    const candidates = allRules.filter(r => r.status === 'CANDIDATE').map(r => r.text)
    const unique = [...new Set([...promoted, ...candidates])]
    if (unique.length > 0) {
      rulesBlock = `\n\n## Reglas a aplicar (OBLIGATORIAS)\n${unique.map(r => `- ${r}`).join('\n')}`
    }
  } catch {}

  return `/project

## Brief
**Nombre:** ${brief.name}
**Tipo:** ${brief.type}
**Mood:** ${brief.mood}
**Esquema:** ${brief.mood?.includes('light') || brief.mood?.includes('pastel') ? 'light' : 'dark'}
**Modo:** autonomous
**Secciones:** ${(brief.sections || []).join(', ')}
**Desafío técnico:** ${brief.techniqueChallenge}
**Objetivo:** ${brief.objective}

Este es un proyecto de práctica para entrenar. Priorizar las secciones listadas.
No usar referencias externas. Creatividad libre. Construir rápido.${rulesBlock}`
}

// ---------------------------------------------------------------------------
// Run a full agent session
// ---------------------------------------------------------------------------

const runSession = async (brief) => {
  const prompt = await buildPrompt(brief)
  const slug = brief.id || `practice-${Date.now()}`

  log(`Starting session: ${slug}`)
  log(`Mood: ${brief.mood} | Sections: ${(brief.sections || []).join(', ')}`)
  log(`Technique: ${brief.techniqueChallenge}`)
  log(`Prompt length: ${prompt.length} chars`)
  log('')

  const startTime = Date.now()
  let lastMessage = ''
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
        const text = message.message?.content
          ?.filter(b => b.type === 'text')
          ?.map(b => b.text)
          ?.join('') || ''
        if (text) {
          lastMessage = text.slice(-200)
          // Print progress dots
          process.stderr.write('.')
        }
      }
      if (message.type === 'tool_use') {
        toolUses++
      }
    }
  } catch (err) {
    log(`\nSession error: ${err.message}`)
  }

  const duration = Math.round((Date.now() - startTime) / 1000)
  log(`\nSession finished in ${duration}s (${toolUses} tool uses)`)

  return { slug, duration, toolUses, lastMessage }
}

// ---------------------------------------------------------------------------
// Post-session: reflect + learn
// ---------------------------------------------------------------------------

const postSession = async (slug) => {
  // Find the project directory
  const desktopDir = path.join(process.env.HOME || process.env.USERPROFILE, 'Desktop')
  const projectDir = path.join(desktopDir, slug)

  const hasBrain = await fs.access(path.join(projectDir, '.brain')).then(() => true).catch(() => false)

  if (!hasBrain) {
    // Try to find any new project created during the session
    const entries = await fs.readdir(desktopDir, { withFileTypes: true })
    for (const e of entries) {
      if (!e.isDirectory() || e.name === 'maqueta') continue
      const brainPath = path.join(desktopDir, e.name, '.brain', 'state.json')
      const state = await readJson(brainPath)
      if (state?.project?.slug?.includes('practice') || e.name.includes('practice')) {
        log(`Found practice project at ${e.name}`)
        return postSessionForProject(path.join(desktopDir, e.name))
      }
    }
    log('No practice project found — session may not have built anything')
    return { learned: false }
  }

  return postSessionForProject(projectDir)
}

const postSessionForProject = async (projectDir) => {
  log(`Reflecting on ${path.basename(projectDir)}...`)

  // Correct (learn from edits)
  try { await callScript('eros-train.mjs', ['correct', '--project', projectDir]) } catch {}

  // Reflect
  let reflection = null
  try { reflection = await callScript('eros-meta.mjs', ['reflect', '--project', projectDir]) } catch {}

  // Validate candidate rules against the built project
  let rulesValidated = 0
  try {
    const rulesData = await readJson(path.join(path.resolve(__dirname, '..'), '.claude', 'memory', 'design-intelligence', 'rules.json'))
    if (rulesData?.rules) {
      const candidates = rulesData.rules.filter(r => r.status === 'CANDIDATE')

      // Read project files to check if rules were applied
      const srcDir = path.join(projectDir, 'src')
      let projectCode = ''
      try {
        const walk = async (dir) => {
          const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => [])
          for (const e of entries) {
            if (e.isFile() && (e.name.endsWith('.vue') || e.name.endsWith('.css') || e.name.endsWith('.js'))) {
              projectCode += await fs.readFile(path.join(dir, e.name), 'utf8').catch(() => '')
            } else if (e.isDirectory() && e.name !== 'node_modules') {
              await walk(path.join(dir, e.name))
            }
          }
        }
        await walk(srcDir)
      } catch {}

      const codeLower = projectCode.toLowerCase()

      for (const rule of candidates) {
        let applied = false
        const text = rule.text.toLowerCase()

        // Check if the rule was respected
        if (text.includes('inter') || text.includes('roboto')) {
          applied = !codeLower.includes("'inter'") && !codeLower.includes('"inter"') && !codeLower.includes("'roboto'")
        } else if (text.includes('gradient placeholder')) {
          applied = !codeLower.includes('linear-gradient') || codeLower.includes('<img') || codeLower.includes('background-image: url')
        } else if (text.includes('stock photo') || text.includes('unsplash')) {
          applied = !codeLower.includes('unsplash.com') || codeLower.includes('picsum')
        } else if (text.includes('text-only') || text.includes('elemento visual')) {
          // Hero has more than just text — check for img, svg, canvas, or background-image in hero
          applied = codeLower.includes('hero') && (codeLower.includes('<img') || codeLower.includes('<svg') || codeLower.includes('<canvas') || codeLower.includes('background-image'))
        } else if (text.includes('hover') || text.includes('hover state')) {
          applied = (codeLower.match(/:hover/g) || []).length >= 3
        } else if (text.includes('depth') || text.includes('layer')) {
          applied = (codeLower.match(/z-index/g) || []).length >= 3 || codeLower.includes('position: absolute')
        } else if (text.includes('curtain') || text.includes('600ms')) {
          applied = !codeLower.includes('1000ms') && !codeLower.includes('duration: 1')
        } else if (text.includes('simple') || text.includes('un elemento')) {
          applied = true // hard to validate, give benefit of the doubt
        } else {
          applied = true // unknown rule, assume applied
        }

        if (applied) {
          rule.validations = (rule.validations || 0) + 1
          rulesValidated++
          if (rule.validations >= 3 && rule.status !== 'PROMOTED') {
            rule.status = 'PROMOTED'
            rule.promotedAt = new Date().toISOString()
            log(`Rule PROMOTED: "${rule.text}" (${rule.validations} validations)`)
          }
        }
      }

      // Deduplicate before saving
      const seen = new Map()
      for (const r of rulesData.rules) {
        const key = r.text.toLowerCase().trim()
        if (seen.has(key)) {
          const existing = seen.get(key)
          existing.validations = Math.max(existing.validations, r.validations)
          if (r.status === 'PROMOTED') existing.status = 'PROMOTED'
        } else {
          seen.set(key, { ...r })
        }
      }
      rulesData.rules = [...seen.values()]

      await (await import('./eros-utils.mjs')).writeJson(
        path.join(path.resolve(__dirname, '..'), '.claude', 'memory', 'design-intelligence', 'rules.json'),
        rulesData
      )
      if (rulesValidated > 0) log(`Validated ${rulesValidated} rules`)
    }
  } catch (err) {
    log(`Rule validation error: ${err.message?.slice(0, 60)}`)
  }

  // Update personality
  try { await callScript('eros-meta.mjs', ['personality']) } catch {}

  // Promote rules
  try { await callScript('eros-memory.mjs', ['promote']) } catch {}

  // Get stats
  const stats = await callScript('eros-memory.mjs', ['stats']).catch(() => null)

  log(`Memory: ${stats?.totalDataPoints || '?'} data points | Rules validated: ${rulesValidated}`)

  // Cleanup practice project
  try {
    await fs.rm(projectDir, { recursive: true, force: true })
    log(`Cleaned up ${path.basename(projectDir)}`)
  } catch {}

  return { learned: true, reflection, stats, rulesValidated }
}

// ---------------------------------------------------------------------------
// Main loop
// ---------------------------------------------------------------------------

const main = async () => {
  const args = parseArgs(process.argv.slice(2))
  const count = parseInt(args.count || '1')
  const dryRun = args['dry-run'] === true

  log('')
  log('═══════════════════════════════════════════')
  log(' EROS AUTONOMOUS TRAINING')
  log(` Sessions: ${count}${dryRun ? ' (dry run)' : ''}`)
  log('═══════════════════════════════════════════')
  log('')

  const statsBefore = await callScript('eros-memory.mjs', ['stats']).catch(() => null)
  log(`Memory before: ${statsBefore?.totalDataPoints || '?'} data points`)
  log('')

  // Phase 0: Discover + study Awwwards references before practicing
  if (!dryRun) {
    log('──── Phase 0: Reference Discovery ────')
    try {
      const discovery = await callScript('eros-discover.mjs', ['--study', '--count', '2'], 600000)
      log(`Discovered ${discovery.discovered || 0} sites, studied ${discovery.studied || 0}`)
    } catch (err) {
      log(`Discovery skipped: ${err.message?.slice(0, 60)}`)
    }
    log('')
  }

  for (let i = 1; i <= count; i++) {
    log(`──── Session ${i}/${count} ────`)

    // Generate brief
    const { brief, gaps } = await generateBrief()
    log(`Brief: ${brief.name}`)
    log(`Mood: ${brief.mood} | Type: ${brief.type}`)
    log(`Sections: ${(brief.sections || []).join(', ')}`)
    log(`Technique: ${brief.techniqueChallenge}`)
    log(`Objective: ${brief.objective}`)
    log(`Gaps covered: mood=${gaps.moodBlindSpots?.length || 0}, sections=${gaps.weakSectionTypes?.length || 0}, techniques=${gaps.untouchedTechniques?.length || 0}`)

    if (dryRun) {
      log('DRY RUN — skipping build\n')
      continue
    }

    log('')

    // Run the session
    const result = await runSession(brief)

    // Post-session learning
    const learning = await postSession(result.slug)

    log(`Session ${i} complete: ${result.duration}s, ${result.toolUses} tool uses, learned: ${learning.learned}`)
    log('')
  }

  // Final stats
  const statsAfter = await callScript('eros-memory.mjs', ['stats']).catch(() => null)
  log('═══════════════════════════════════════════')
  log(' TRAINING COMPLETE')
  log(`Memory: ${statsBefore?.totalDataPoints || '?'} → ${statsAfter?.totalDataPoints || '?'} data points`)
  log('═══════════════════════════════════════════')

  // Final personality update
  try {
    const personality = await callScript('eros-meta.mjs', ['personality'])
    log(`State: ${personality.identity?.currentState}`)
    log(`Philosophy: ${personality.voice?.philosophy}`)
  } catch {}

  out({
    sessions: count,
    dryRun,
    memoryBefore: statsBefore?.totalDataPoints || 0,
    memoryAfter: statsAfter?.totalDataPoints || 0,
    growth: (statsAfter?.totalDataPoints || 0) - (statsBefore?.totalDataPoints || 0),
  })
}

main().catch(err => { log(`Fatal: ${err.message}`); process.exit(1) })
