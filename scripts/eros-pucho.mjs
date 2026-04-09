#!/usr/bin/env node
/**
 * eros-pucho.mjs — Smoking break tracker for Eros reflections.
 *
 * Eros no es una máquina que procesa en silencio. Cuando algo cierra
 * (un proyecto, una reflexión, una decisión grande), se fuma un pucho.
 * Cada pucho tiene su duración — no el wall-clock del script, sino el
 * tiempo que LE CORRESPONDE al tipo de reflexión:
 *
 *   celebration  1-3 min   (un proyecto aprobado, una regla promovida)
 *   decision     2-4 min   (elegir entre 2 técnicas, priorizar gaps)
 *   reflection   3-6 min   (post-proyecto, escribiendo diario)
 *   frustrated   5-10 min  (un run fallido, un gate que no cerró)
 *
 * El contador es real: Eros acumula puchos a lo largo del tiempo. La
 * sidebar muestra "🚬 N · Xh Ym" como un indicador de cuánto ha pensado
 * en su carrera. Es una metáfora humana para la parte más silenciosa
 * del trabajo — la que no es "ejecutar código" sino "pensar antes y
 * después de ejecutarlo".
 *
 * Usage:
 *   node eros-pucho.mjs light --reason "..." [--context reflection|decision|celebration|frustrated]
 *   node eros-pucho.mjs finish
 *   node eros-pucho.mjs stats
 *   node eros-pucho.mjs list [--limit 10]
 *
 * Programmatic (from other .mjs scripts):
 *   import { lightPucho, finishPucho } from './eros-pucho.mjs'
 *   const id = await lightPucho({ reason: '...', context: 'reflection' })
 *   // ... do work ...
 *   await finishPucho(id)
 */

import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs, out, fail, readJson, writeJson } from './eros-utils.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const maquetaDir = path.resolve(__dirname, '..')
const puchosPath = path.join(
  maquetaDir,
  '.claude',
  'memory',
  'design-intelligence',
  'puchos.json',
)

const MAX_HISTORY = 500 // keep last 500 puchos, trim older

// ─── Duration ranges by context (minutes) ─────────────────────────────────
// Chosen deliberately so the running total feels credible. A frustrated
// pucho is longer because frustration needs more silent thinking. A
// celebration pucho is short because it's a quick "done, siguiente."

const DURATIONS = {
  celebration: { min: 1.0, max: 3.0 },
  decision: { min: 2.0, max: 4.0 },
  reflection: { min: 3.0, max: 6.0 },
  frustrated: { min: 5.0, max: 10.0 },
  neutral: { min: 1.5, max: 3.0 },
}

const rand = (min, max) => min + Math.random() * (max - min)

const pickDuration = (context) => {
  const range = DURATIONS[context] || DURATIONS.neutral
  return Math.round(rand(range.min, range.max) * 10) / 10 // 1 decimal
}

// ─── Helpers ──────────────────────────────────────────────────────────────

const loadPuchos = async () => {
  return (
    (await readJson(puchosPath)) || {
      total: { count: 0, totalMinutes: 0, avgDurationMin: 0 },
      active: null,
      history: [],
      updatedAt: null,
    }
  )
}

const savePuchos = async (data) => {
  data.updatedAt = new Date().toISOString()
  await writeJson(puchosPath, data)
}

const computeStats = (history) => {
  const count = history.length
  const totalMinutes = history.reduce((s, p) => s + (p.durationMin || 0), 0)
  const avgDurationMin = count > 0 ? totalMinutes / count : 0
  return {
    count,
    totalMinutes: Math.round(totalMinutes * 10) / 10,
    avgDurationMin: Math.round(avgDurationMin * 100) / 100,
  }
}

const formatTotal = (totalMinutes) => {
  const mins = Math.round(totalMinutes)
  if (mins < 60) return `${mins}m`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return `${h}h ${m}m`
}

// ─── Public API (importable) ──────────────────────────────────────────────

/**
 * Light a pucho. Returns the pucho id so a later `finishPucho(id)` can
 * close it. Duration is already picked at light time (context-based),
 * not measured.
 */
export const lightPucho = async ({ reason, context = 'neutral' } = {}) => {
  const data = await loadPuchos()
  const id = `pucho-${Date.now()}`
  const now = new Date().toISOString()
  const durationMin = pickDuration(context)
  data.active = {
    id,
    reason: reason || '—',
    context,
    lightedAt: now,
    durationMin,
  }
  await savePuchos(data)
  return id
}

/**
 * Finish an active pucho. Optional id argument — if provided, only
 * finishes if the active pucho matches (for safety). Otherwise
 * finishes whatever is active.
 */
export const finishPucho = async (id = null) => {
  const data = await loadPuchos()
  if (!data.active) return null
  if (id && data.active.id !== id) return null

  const finishedPucho = {
    ...data.active,
    finishedAt: new Date().toISOString(),
  }

  data.history.push(finishedPucho)
  if (data.history.length > MAX_HISTORY) {
    data.history = data.history.slice(-MAX_HISTORY)
  }
  data.active = null
  data.total = computeStats(data.history)

  await savePuchos(data)
  return finishedPucho
}

/**
 * One-shot pucho: light + immediately finish. Useful for quick
 * decisions where a round-trip light/finish would be overkill.
 */
export const smokePucho = async (opts = {}) => {
  const id = await lightPucho(opts)
  return finishPucho(id)
}

export const readPuchos = async (limit = 20) => {
  const data = await loadPuchos()
  return {
    total: data.total,
    active: data.active,
    recent: (data.history || []).slice(-limit).reverse(),
    updatedAt: data.updatedAt,
  }
}

// ─── CLI commands ─────────────────────────────────────────────────────────

const cmdLight = async (args) => {
  const id = await lightPucho({ reason: args.reason, context: args.context })
  const data = await loadPuchos()
  out({ ok: true, id, active: data.active })
}

const cmdFinish = async () => {
  const finished = await finishPucho()
  if (!finished) {
    out({ ok: true, wasActive: false })
    return
  }
  const data = await loadPuchos()
  out({
    ok: true,
    wasActive: true,
    finished,
    total: data.total,
  })
}

const cmdStats = async () => {
  const data = await loadPuchos()
  out({
    count: data.total.count,
    totalMinutes: data.total.totalMinutes,
    totalFormatted: formatTotal(data.total.totalMinutes),
    avgDurationMin: data.total.avgDurationMin,
    active: data.active,
    lastPucho: data.history[data.history.length - 1] || null,
  })
}

const cmdList = async (args) => {
  const limit = parseInt(args.limit || '20', 10)
  const result = await readPuchos(limit)
  out(result)
}

const main = async () => {
  const args = parseArgs(process.argv.slice(2))
  const sub = args._command

  if (sub === 'light') await cmdLight(args)
  else if (sub === 'finish') await cmdFinish()
  else if (sub === 'stats') await cmdStats()
  else if (sub === 'list') await cmdList(args)
  else {
    process.stderr.write(`eros-pucho.mjs — smoking break tracker

Usage:
  node eros-pucho.mjs light --reason "..." [--context celebration|decision|reflection|frustrated|neutral]
  node eros-pucho.mjs finish
  node eros-pucho.mjs stats
  node eros-pucho.mjs list [--limit 10]

Duration by context (minutes):
${Object.entries(DURATIONS).map(([k, v]) => `  ${k.padEnd(12)}  ${v.min}–${v.max}`).join('\n')}
`)
    process.exit(1)
  }
}

// Only run CLI when invoked directly, not when imported
const invokedDirectly = process.argv[1] && path.basename(process.argv[1]) === 'eros-pucho.mjs'
if (invokedDirectly) {
  main().catch((err) => { process.stderr.write(`[eros-pucho] Fatal: ${err.message}\n`); process.exit(1) })
}
