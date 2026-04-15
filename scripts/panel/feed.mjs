#!/usr/bin/env node
/**
 * panel/feed.mjs — Activity feed for Eros.
 *
 * Stores a chronological log of events (project completions, study events,
 * rule promotions, personality updates, reflections) so the panel can show
 * a living timeline of what Eros is doing.
 *
 * Schema (`.eros/memory/design-intelligence/activity-feed.json`):
 *   {
 *     updatedAt: ISO timestamp,
 *     count: number,
 *     events: [
 *       { id, timestamp, type, title, detail?, mood?, metadata? }
 *     ]
 *   }
 *
 * Usage (as CLI, for scripts to hook into):
 *   node panel/feed.mjs append --type project-completed --title "IYO" \
 *        --detail "Audit 50% · 4 secciones · 8m" --mood reflective
 *   node panel/feed.mjs list [--limit 20]
 *   node panel/feed.mjs clear
 *
 * Usage (as import, from other .mjs scripts in category subdirs):
 *   import { appendEvent } from '../panel/feed.mjs'
 *   await appendEvent({ type: 'project-completed', title: '...', detail: '...' })
 */

import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs, out, fail, readJson, writeJson, today } from '../lib/utils.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const maquetaDir = path.resolve(__dirname, '..', '..')
const feedPath = path.join(
  maquetaDir,
  '.eros',
  'memory',
  'design-intelligence',
  'activity-feed.json',
)

const MAX_EVENTS = 200

// Default mood inference from event type — Eros colors each event with
// a mood that fits. The panel can use this to show a small colored dot
// next to each feed item.
const moodByType = {
  'project-completed': 'reflective',
  'project-started': 'determined',
  'project-failed': 'frustrated',
  'study-reference': 'curious',
  'rule-promoted': 'confident',
  'rule-candidate': 'cautious',
  'personality-update': 'reflective',
  'gap-discovered': 'curious',
  'bug-fixed': 'satisfied',
  'observation': 'reflective',
  'experiment': 'curious',
  'milestone': 'proud',
}

/**
 * Append an event to the activity feed.
 * Auto-fills id, timestamp, and mood (from type) if not provided.
 * Trims to the most recent MAX_EVENTS.
 */
export const appendEvent = async (event) => {
  const now = new Date()
  const feed = (await readJson(feedPath)) || { updatedAt: null, count: 0, events: [] }

  const enriched = {
    id: event.id || `evt-${now.getTime()}`,
    timestamp: event.timestamp || now.toISOString(),
    type: event.type || 'observation',
    title: event.title || 'Untitled event',
    detail: event.detail || null,
    mood: event.mood || moodByType[event.type] || 'neutral',
    metadata: event.metadata || null,
  }

  feed.events.push(enriched)
  if (feed.events.length > MAX_EVENTS) {
    feed.events = feed.events.slice(-MAX_EVENTS)
  }
  feed.count = feed.events.length
  feed.updatedAt = now.toISOString()

  await writeJson(feedPath, feed)
  return enriched
}

/**
 * Read the feed, optionally limited to the N most recent events.
 */
export const readFeed = async (limit = MAX_EVENTS) => {
  const feed = (await readJson(feedPath)) || { updatedAt: null, count: 0, events: [] }
  if (limit && feed.events.length > limit) {
    return { ...feed, events: feed.events.slice(-limit) }
  }
  return feed
}

// ─── CLI entrypoint ────────────────────────────────────────────────────────

const cmdAppend = async (args) => {
  if (!args.type || !args.title) fail('--type and --title required')
  const event = await appendEvent({
    type: args.type,
    title: args.title,
    detail: args.detail || null,
    mood: args.mood || null,
    metadata: args.metadata ? JSON.parse(args.metadata) : null,
  })
  out({ ok: true, event })
}

const cmdList = async (args) => {
  const limit = parseInt(args.limit || '20', 10)
  const feed = await readFeed(limit)
  out(feed)
}

const cmdClear = async () => {
  await writeJson(feedPath, { updatedAt: new Date().toISOString(), count: 0, events: [] })
  out({ ok: true, cleared: true })
}

const main = async () => {
  const args = parseArgs(process.argv.slice(2))
  const sub = args._command

  if (sub === 'append') await cmdAppend(args)
  else if (sub === 'list') await cmdList(args)
  else if (sub === 'clear') await cmdClear()
  else {
    process.stderr.write(`eros-feed.mjs — Eros activity feed

Usage:
  node eros-feed.mjs append --type <type> --title <title> [--detail <text>] [--mood <mood>]
  node eros-feed.mjs list [--limit 20]
  node eros-feed.mjs clear

Event types: ${Object.keys(moodByType).join(', ')}
`)
    process.exit(1)
  }
}

// Only run CLI logic when this file is invoked directly, not when imported.
const invokedDirectly = process.argv[1] && path.basename(process.argv[1]) === 'eros-feed.mjs'
if (invokedDirectly) {
  main().catch((err) => { process.stderr.write(`[eros-feed] Fatal: ${err.message}\n`); process.exit(1) })
}
