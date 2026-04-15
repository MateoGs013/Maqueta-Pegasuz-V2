#!/usr/bin/env node
/**
 * dev/mood.mjs — Derived emotional state for Eros.
 *
 * Reads recent training sessions + feed events + personality to compute
 * a current mood. The mood is NOT a random pick — it's a summary of
 * what just happened to Eros, expressed as a single word + color.
 *
 * Output shape:
 *   {
 *     mood: "Confiado" | "Reflexivo" | "Curioso" | "Determinado"
 *         | "Frustrado" | "Latente",
 *     emoji: "◆",
 *     color: "#4ade80",
 *     reason: "3 audits >= 7.5 last session + 2 rules validated",
 *     signals: { ... },     // raw inputs, for debugging
 *     computedAt: ISO timestamp,
 *     staleAfterMs: 300000,  // 5 min TTL hint for the caller
 *   }
 *
 * Usage:
 *   node dev/mood.mjs                # prints JSON
 *   node dev/mood.mjs --explain      # prints JSON with signal breakdown
 */

import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs, out, readJson } from '../lib/utils.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const maquetaDir = path.resolve(__dirname, '..', '..')
const memDir = path.join(maquetaDir, '.eros', 'memory', 'design-intelligence')

// ─── Mood catalog ─────────────────────────────────────────────────────────
// Each mood has a visual signature + a rough semantic fingerprint. The
// scoring function picks the mood whose fingerprint best matches the
// current signals.

const MOODS = {
  Confiado: {
    emoji: '◆',
    color: '#4ade80',
    // Confident: recent runs succeeded, audit scores high, rules validated
    wants: { highAudit: 2, rulesValidated: 1, completedRecent: 1 },
    avoids: { failedRecent: 2 },
  },
  Reflexivo: {
    emoji: '⬢',
    color: '#a78bfa',
    // Reflective: just finished something, not necessarily great, but processing
    wants: { completedRecent: 1, personalityUpdates: 1 },
    avoids: { studyEvents: 0.5 },
  },
  Curioso: {
    emoji: '◉',
    color: '#22d3ee',
    // Curious: lots of new references studied, new techniques explored
    wants: { studyEvents: 2, newTechniques: 1, gapsDiscovered: 1 },
    avoids: { failedRecent: 1 },
  },
  Determinado: {
    emoji: '▸',
    color: '#f59e0b',
    // Determined: many actions in a row, no reflection pauses
    wants: { eventsLast24h: 2, completedRecent: 1 },
    avoids: { personalityUpdates: 1 },
  },
  Frustrado: {
    emoji: '⨯',
    color: '#f87171',
    // Frustrated: recent failures, low audits, bug-fix events
    wants: { failedRecent: 3, lowAudit: 2 },
    avoids: { highAudit: 1 },
  },
  Latente: {
    emoji: '·',
    color: '#6b7280',
    // Dormant: nothing happened in a while
    wants: { nothingRecent: 3 },
    avoids: { eventsLast24h: 1 },
  },
}

// ─── Signal extraction ────────────────────────────────────────────────────

const extractSignals = async () => {
  const now = Date.now()
  const h24 = 24 * 60 * 60 * 1000

  const feed = (await readJson(path.join(memDir, 'activity-feed.json'))) || { events: [] }
  const history = (await readJson(path.join(memDir, 'training-history.json'))) || { sessions: [] }
  const personality = (await readJson(path.join(memDir, 'personality.json'))) || {}

  // Events in the last 24h
  const recentEvents = (feed.events || []).filter((e) => {
    if (!e.timestamp) return false
    return now - new Date(e.timestamp).getTime() < h24
  })

  // Last 5 training sessions
  const recentSessions = (history.sessions || []).slice(-5)

  // Audit score signals
  let highAudit = 0
  let lowAudit = 0
  let failedRecent = 0
  let completedRecent = 0
  for (const s of recentSessions) {
    const pct = s.audit?.pct ?? s.audit?.score
    if (pct != null) {
      if (pct >= 75) highAudit++
      else if (pct < 50) lowAudit++
    }
    if (s.error) failedRecent++
    else if (s.duration) completedRecent++
  }

  // Feed signal counts
  const byType = {}
  for (const e of recentEvents) {
    byType[e.type] = (byType[e.type] || 0) + 1
  }

  // Rule validation signal
  const rules = (await readJson(path.join(memDir, 'rules.json'))) || { rules: [] }
  const validatedRulesLastSession = (rules.rules || []).filter(
    (r) => r.lastValidatedAt && now - new Date(r.lastValidatedAt).getTime() < h24,
  ).length

  // Personality update events
  const personalityUpdates = byType['personality-update'] || 0

  // Study events
  const studyEvents = byType['study-reference'] || 0

  // New technique signal — count techniques in personality with evidence == 1
  const newTechniques = Object.entries(personality.aesthetic?.motionPreferences || {})
    .filter(([, v]) => v.evidence <= 2).length

  // Gaps discovered
  const gapsDiscovered = byType['gap-discovered'] || 0

  // Nothing happened: no events AND no sessions in last 24h
  const nothingRecent = recentEvents.length === 0 && recentSessions.length === 0 ? 3 : 0

  return {
    highAudit,
    lowAudit,
    failedRecent,
    completedRecent,
    rulesValidated: validatedRulesLastSession,
    eventsLast24h: recentEvents.length,
    personalityUpdates,
    studyEvents,
    newTechniques,
    gapsDiscovered,
    nothingRecent,
    // For explain:
    recentSessionCount: recentSessions.length,
    recentEventCount: recentEvents.length,
  }
}

// ─── Mood scoring ─────────────────────────────────────────────────────────

const scoreMood = (moodConfig, signals) => {
  let score = 0
  for (const [signal, weight] of Object.entries(moodConfig.wants || {})) {
    const value = signals[signal] || 0
    score += value * weight
  }
  for (const [signal, weight] of Object.entries(moodConfig.avoids || {})) {
    const value = signals[signal] || 0
    score -= value * weight
  }
  return score
}

const pickMood = (signals) => {
  const scored = Object.entries(MOODS).map(([name, config]) => ({
    name,
    config,
    score: scoreMood(config, signals),
  }))
  scored.sort((a, b) => b.score - a.score)
  const best = scored[0]
  return { name: best.name, config: best.config, score: best.score, allScores: scored }
}

// ─── Reason builder — human-readable explanation ─────────────────────────

const buildReason = (moodName, signals) => {
  const parts = []
  if (signals.highAudit > 0) parts.push(`${signals.highAudit} audit${signals.highAudit > 1 ? 's' : ''} >=75%`)
  if (signals.lowAudit > 0) parts.push(`${signals.lowAudit} audit${signals.lowAudit > 1 ? 's' : ''} <50%`)
  if (signals.failedRecent > 0) parts.push(`${signals.failedRecent} sesión${signals.failedRecent > 1 ? 'es' : ''} fallida${signals.failedRecent > 1 ? 's' : ''}`)
  if (signals.completedRecent > 0) parts.push(`${signals.completedRecent} completada${signals.completedRecent > 1 ? 's' : ''}`)
  if (signals.studyEvents > 0) parts.push(`${signals.studyEvents} nueva${signals.studyEvents > 1 ? 's' : ''} referencia${signals.studyEvents > 1 ? 's' : ''} estudiada${signals.studyEvents > 1 ? 's' : ''}`)
  if (signals.rulesValidated > 0) parts.push(`${signals.rulesValidated} regla${signals.rulesValidated > 1 ? 's' : ''} validada${signals.rulesValidated > 1 ? 's' : ''}`)
  if (signals.gapsDiscovered > 0) parts.push(`${signals.gapsDiscovered} gap${signals.gapsDiscovered > 1 ? 's' : ''} detectado${signals.gapsDiscovered > 1 ? 's' : ''}`)
  if (signals.nothingRecent > 0) parts.push('sin actividad reciente')

  if (parts.length === 0) return 'calma — esperando la próxima corrida'
  return parts.join(' · ')
}

// ─── Main ─────────────────────────────────────────────────────────────────

const main = async () => {
  const args = parseArgs(process.argv.slice(2))
  const signals = await extractSignals()
  const picked = pickMood(signals)

  const result = {
    mood: picked.name,
    emoji: picked.config.emoji,
    color: picked.config.color,
    reason: buildReason(picked.name, signals),
    computedAt: new Date().toISOString(),
    staleAfterMs: 300000,
  }

  if (args.explain) {
    result.signals = signals
    result.allScores = picked.allScores.map((s) => ({ mood: s.name, score: s.score }))
  }

  out(result)
}

main().catch((err) => { process.stderr.write(`[eros-mood] Fatal: ${err.message}\n`); process.exit(1) })
