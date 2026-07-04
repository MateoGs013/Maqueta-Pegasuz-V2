/**
 * assets.mjs — Handoff asset pipeline inside Studio (no Adobe, no paid APIs).
 *
 * Eros requests an asset (request_asset MCP tool) -> the Asset Tray shows the
 * prompt pack + WHERE to generate (free tools) -> Mateo drops the file into
 * <project>/src/assets/media/_inbox/ -> this module treats it locally
 * (scripts/media/treat.mjs: crop -> grade -> grain) -> registers a vault note
 * -> notifies the session. Decision Mateo 2026-07-04.
 */

import fs from 'node:fs'
import path from 'node:path'
import { execFile } from 'node:child_process'
import { fileURLToPath, pathToFileURL } from 'node:url'
import chokidar from 'chokidar'
import { state, nextId, persist, logActivity, CAPTURES_DIR } from './state.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const MAQUETA_DIR = path.resolve(__dirname, '..', '..')
const TREAT_MJS = path.join(MAQUETA_DIR, 'scripts', 'media', 'treat.mjs')
const VAULT_MJS = path.join(MAQUETA_DIR, 'scripts', 'memory', 'vault.mjs')

const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.avif'])

let broadcast = () => {}
let notifySession = () => {}
export function wire({ onBroadcast, onNotifySession }) {
  broadcast = onBroadcast
  notifySession = onNotifySession
}

export function inboxDir() {
  return state.project ? path.join(state.project.dir, 'src', 'assets', 'media', '_inbox') : null
}
export function mediaDir() {
  return state.project ? path.join(state.project.dir, 'src', 'assets', 'media') : null
}

export function createRequest(req) {
  const entry = {
    id: nextId('ast'),
    slot: req.slot,
    kind: req.kind || 'photo',
    prompt: req.prompt,
    negative: req.negative || null,
    tool: req.tool,
    toolUrl: req.tool_url || req.toolUrl || null,
    settings: req.settings || null,
    filename: req.filename || `${req.slot}.png`,
    treatment: req.treatment || {},
    status: 'open',
    outputs: null,
    preview: null,
    error: null,
    ts: new Date().toISOString(),
  }
  state.assetRequests.unshift(entry)
  persist()
  const dir = inboxDir()
  if (dir) fs.mkdirSync(dir, { recursive: true })
  broadcast({ type: 'asset-request', request: entry })
  logActivity('asset', `request ${entry.slot} -> ${entry.tool}`)
  return entry
}

function matchRequest(file) {
  const base = path.parse(file).name.toLowerCase()
  // 'failed' included so re-detecting the inbox file (or a server restart)
  // retries the treatment after a fix.
  const open = state.assetRequests.filter((r) => r.status === 'open' || r.status === 'failed')
  return open.find((r) => path.parse(r.filename).name.toLowerCase() === base)
    || open.find((r) => r.slot.toLowerCase() === base)
    || open.filter((r) => r.status === 'open').pop() // oldest open as fallback
    || null
}

function runVaultRegistration(request, treated) {
  if (!state.project) return
  const projectSlug = state.project.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  const noteSlug = `${projectSlug}-${request.slot}`.replace(/[^a-z0-9-]+/g, '-')
  const t = treated.grade
  const body = [
    `Herramienta: ${request.tool} · Grade: tint ${t.tint || '—'} sat ${t.saturation} · Grain: ${t.grain}`,
    '',
    `Prompt: ${request.prompt}`,
    request.negative ? `Negative: ${request.negative}` : '',
    '',
    'Mapa: [[style-map]]',
  ].filter(Boolean).join('\n')
  const args = [VAULT_MJS, 'new', 'asset', noteSlug,
    '--set', `asset-kind=${request.kind}`,
    '--set', 'source-type=handoff',
    '--set', `model=${request.tool}`,
    '--set', 'license=generated',
    '--set', 'review-status=pending',
    '--set', `project=[[${projectSlug}]]`,
    '--set', `slot=${request.slot}`,
    '--body', body, '--force']
  execFile(process.execPath, args, { cwd: MAQUETA_DIR }, (err, out, errOut) => {
    if (err) logActivity('error', `vault registration failed for ${noteSlug}: ${(errOut || err.message).slice(0, 120)}`)
    else logActivity('asset', `vault note: ${noteSlug}`)
  })
}

async function processInboxFile(file) {
  if (!IMAGE_EXTS.has(path.extname(file).toLowerCase())) return
  // Wait for the file to finish copying (size stable)
  let prev = -1
  for (let i = 0; i < 20; i++) {
    const size = fs.statSync(file).size
    if (size === prev && size > 0) break
    prev = size
    await new Promise((r) => setTimeout(r, 300))
  }
  const request = matchRequest(file)
  if (!request) {
    logActivity('asset', `inbox file without request: ${path.basename(file)} (ignored)`)
    return
  }
  request.status = 'received'
  request.error = null
  persist()
  broadcast({ type: 'asset-request', request })

  try {
    const { treat } = await import(pathToFileURL(TREAT_MJS).href)
    const t = request.treatment || {}
    const treated = await treat(file, {
      outDir: mediaDir(),
      slot: request.slot,
      aspect: t.aspect || null,
      gravity: t.gravity || 'attention',
      tint: t.tint || null,
      saturation: t.saturation ?? 0.85,
      contrast: t.contrast ?? 1.05,
      brightness: t.brightness ?? 0.99,
      grain: t.grain ?? 32,
      vignette: t.vignette ?? 0,
      widths: t.widths || [2400, 1200],
    })
    // Preview thumbnail served via /captures/
    const smallest = treated.outputs[treated.outputs.length - 1]
    const previewName = `asset-${request.id}.jpg`
    fs.copyFileSync(smallest.jpg, path.join(CAPTURES_DIR, previewName))
    request.status = 'treated'
    request.outputs = treated.outputs.map((o) => ({ width: o.width, webp: path.basename(o.webp) }))
    request.preview = previewName
    persist()
    broadcast({ type: 'asset-request', request })
    logActivity('asset', `${request.slot} treated (${treated.outputs.length} sizes)`)
    runVaultRegistration(request, treated)
    notifySession(
      `[studio/assets] Asset "${request.slot}" recibido de Mateo (${request.tool}) y tratado con el grade del proyecto. ` +
      `Archivos en src/assets/media/ (${request.outputs.map((o) => o.webp).join(', ')}). ` +
      `Actualizá el manifest .eros/context/assets.md y usalo en la sección correspondiente.`)
  } catch (e) {
    request.status = 'failed'
    request.error = e.message
    persist()
    broadcast({ type: 'asset-request', request })
    logActivity('error', `treat failed for ${request.slot}: ${e.message}`)
  }
}

let watcher = null
export function watchInbox() {
  stopWatching()
  const dir = inboxDir()
  if (!dir) return
  fs.mkdirSync(dir, { recursive: true })
  watcher = chokidar.watch(dir, { ignoreInitial: false, depth: 0 })
  watcher.on('add', (file) => { processInboxFile(file).catch((e) => logActivity('error', e.message)) })
  logActivity('asset', `inbox watching ${dir}`)
}

export function stopWatching() {
  if (watcher) { watcher.close(); watcher = null }
}
