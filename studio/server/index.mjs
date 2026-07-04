#!/usr/bin/env node
/**
 * index.mjs — Eros Studio server (local companion, port 4300).
 *
 * HTTP:  REST for the Vue app + static /captures/*.
 * WS:    live push (captures, decision cards, critiques, status).
 * Never calls an LLM itself — reasoning lives in the Claude Code session
 * hosted by session.mjs on Mateo's subscription (hard constraint).
 */

import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { WebSocketServer } from 'ws'
import { state, persist, logActivity, CAPTURES_DIR } from './state.mjs'
import * as eyes from './eyes.mjs'
import * as session from './session.mjs'
import * as assets from './assets.mjs'

const PORT = Number(process.env.EROS_STUDIO_PORT || 4300)

// --- WebSocket hub -----------------------------------------------------------

let wss = null
function broadcast(payload) {
  if (!wss) return
  const msg = JSON.stringify(payload)
  for (const client of wss.clients) {
    if (client.readyState === 1) client.send(msg)
  }
}
session.onBroadcast(broadcast)
assets.wire({
  onBroadcast: broadcast,
  onNotifySession: (text) => { if (session.isRunning()) session.pushMessage(text) },
})

// --- HTTP helpers --------------------------------------------------------------

const json = (res, code, data) => {
  res.writeHead(code, { 'content-type': 'application/json', 'access-control-allow-origin': '*' })
  res.end(JSON.stringify(data))
}
const readBody = (req) => new Promise((resolve, reject) => {
  let raw = ''
  req.on('data', (c) => { raw += c })
  req.on('end', () => { try { resolve(raw ? JSON.parse(raw) : {}) } catch (e) { reject(e) } })
})

// --- routes --------------------------------------------------------------------

const routes = {
  'GET /api/state': async () => ({
    project: state.project,
    sessionStatus: state.sessionStatus,
    decisions: state.decisions.slice(0, 30),
    captures: state.captures.slice(0, 60),
    critiques: state.critiques.slice(0, 60),
    feedback: state.feedback.slice(0, 60),
    activity: state.activity.slice(0, 60),
    assetRequests: state.assetRequests.slice(0, 40),
    inboxDir: assets.inboxDir(),
  }),

  'POST /api/project': async (body) => {
    const { dir, previewUrl, name } = body
    if (!dir || !fs.existsSync(dir)) throw new Error(`Project dir not found: ${dir}`)
    state.project = { dir, previewUrl: previewUrl || 'http://localhost:5173/', name: name || path.basename(dir) }
    persist()
    eyes.watchProject(session.onMeaningfulCapture)
    assets.watchInbox()
    logActivity('project', `active: ${state.project.name} -> ${state.project.previewUrl}`)
    broadcast({ type: 'project', project: state.project })
    return { ok: true, project: state.project }
  },

  'POST /api/session/start': async (body) => {
    if (!state.project) throw new Error('Set a project first (POST /api/project)')
    await session.startSession({ projectDir: state.project.dir, brief: body.brief || '' })
    return { ok: true }
  },

  'POST /api/session/stop': async () => { await session.stopSession(); return { ok: true } },

  'POST /api/session/message': async (body) => {
    if (!session.isRunning()) throw new Error('No session running')
    session.pushMessage(String(body.text || ''))
    return { ok: true }
  },

  'POST /api/decision/answer': async (body) => {
    const ok = session.answerDecision(body.id, body.answer, body.notes || '')
    if (!ok) throw new Error('Decision not open')
    return { ok: true }
  },

  'POST /api/critique/resolve': async (body) => { session.resolveCritique(body.id); return { ok: true } },

  'POST /api/feedback': async (body) => ({ ok: true, pin: session.addFeedback(body) }),

  // Manual asset request (normally created by the session via request_asset MCP tool)
  'POST /api/asset/request': async (body) => {
    if (!body.slot || !body.prompt || !body.tool) throw new Error('slot, prompt and tool are required')
    return { ok: true, request: assets.createRequest(body) }
  },

  'POST /api/capture': async (body) => {
    if (body.breakpoint) eyes.setBreakpoint(body.breakpoint)
    const entry = await eyes.capture({ reason: 'manual' })
    if (entry) broadcast({ type: 'capture', capture: entry })
    return { ok: true, capture: entry }
  },

  // Reserved for Claude Code HTTP hooks from externally-started sessions.
  'POST /api/hooks': async (body) => {
    logActivity('hook', `${body.hook_event_name || 'event'} from external session`)
    if (body.hook_event_name === 'Stop') {
      const open = state.critiques.filter((c) => c.verdict === 'adjust' && !c.resolved).length
      if (open > 0) return { decision: 'block', reason: `${open} críticas adjust sin resolver en Studio.` }
    }
    return {}
  },
}

// --- server ----------------------------------------------------------------------

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET,POST,OPTIONS',
      'access-control-allow-headers': 'content-type',
    })
    return res.end()
  }

  const url = new URL(req.url, `http://localhost:${PORT}`)

  if (req.method === 'GET' && url.pathname.startsWith('/captures/')) {
    const file = path.join(CAPTURES_DIR, path.basename(url.pathname))
    if (fs.existsSync(file)) {
      res.writeHead(200, { 'content-type': 'image/png', 'access-control-allow-origin': '*', 'cache-control': 'max-age=31536000' })
      return fs.createReadStream(file).pipe(res)
    }
    return json(res, 404, { error: 'not found' })
  }

  const handler = routes[`${req.method} ${url.pathname}`]
  if (!handler) return json(res, 404, { error: `no route ${req.method} ${url.pathname}` })
  try {
    const body = req.method === 'POST' ? await readBody(req) : undefined
    json(res, 200, await handler(body))
  } catch (e) {
    json(res, 400, { error: e.message })
  }
})

wss = new WebSocketServer({ server, path: '/ws' })
wss.on('connection', (socket) => {
  socket.send(JSON.stringify({ type: 'hello', sessionStatus: state.sessionStatus, project: state.project }))
})

server.listen(PORT, () => {
  console.log(`[eros-studio] server on http://localhost:${PORT}  (ws: /ws)`)
  if (state.project) {
    eyes.watchProject(session.onMeaningfulCapture)
    assets.watchInbox()
    console.log(`[eros-studio] resumed project: ${state.project.name}`)
  }
})

process.on('SIGINT', async () => {
  await session.stopSession()
  await eyes.shutdown()
  process.exit(0)
})
