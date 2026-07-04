/**
 * state.mjs — Studio state store.
 *
 * Everything the UI renders and the session consults lives here, persisted to
 * .state/ as JSON after every mutation (the transcript is NEVER the archive —
 * see docs/research/raw/2026-07-04-collab-interface.md §(d)4).
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const STATE_DIR = path.join(__dirname, '.state')
export const CAPTURES_DIR = path.resolve(__dirname, '..', 'captures')

fs.mkdirSync(STATE_DIR, { recursive: true })
fs.mkdirSync(CAPTURES_DIR, { recursive: true })

const persistedFile = path.join(STATE_DIR, 'studio-state.json')

function load() {
  try { return JSON.parse(fs.readFileSync(persistedFile, 'utf8')) } catch { return {} }
}

const saved = load()

export const state = {
  /** Active project being worked on: { dir, name, previewUrl } */
  project: saved.project || null,
  /** Session status: idle | starting | working | waiting-decision | error */
  sessionStatus: 'idle',
  /** Decision cards: { id, question, options[], recommendation, context, status, answer, createdAt } */
  decisions: saved.decisions || [],
  /** Captures filmstrip: { id, file, ts, breakpoint, diffPixels, gitRef } newest first */
  captures: saved.captures || [],
  /** Eros critiques: { id, captureId, verdict, pins:[{x,y,w,h,severity,note}], resolved } */
  critiques: saved.critiques || [],
  /** Mateo's feedback pins waiting for the session: { id, captureId, selector?, x,y, note, drainedAt } */
  feedback: saved.feedback || [],
  /** Activity log lines for the status bar */
  activity: saved.activity || [],
  /** Asset requests (handoff pipeline): { id, slot, kind, prompt, negative, tool, toolUrl,
   *  settings, filename, treatment, status: open|received|treated|failed, outputs, ts } */
  assetRequests: saved.assetRequests || [],
}

export function persist() {
  const { sessionStatus, ...toSave } = state
  fs.writeFileSync(persistedFile, JSON.stringify(toSave, null, 2))
}

let seq = saved._seq || 0
export function nextId(prefix) {
  seq += 1
  saved._seq = seq
  return `${prefix}-${Date.now().toString(36)}-${seq}`
}

export function logActivity(kind, text) {
  state.activity.unshift({ ts: new Date().toISOString(), kind, text })
  state.activity = state.activity.slice(0, 200)
  persist()
}

export function unresolvedAdjustPins() {
  return state.critiques.filter((c) => c.verdict === 'adjust' && !c.resolved).length
}

export function pendingFeedback() {
  return state.feedback.filter((f) => !f.drainedAt)
}
