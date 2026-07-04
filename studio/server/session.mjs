/**
 * session.mjs — Claude Code session host (the reasoning stays on the subscription).
 *
 * Uses @anthropic-ai/claude-agent-sdk query() in streaming-input mode: the SDK
 * spawns the locally installed, already-logged-in `claude` CLI, so this app
 * inherits subscription OAuth — zero API keys, per the hard constraint.
 * (Confirmed 2026-06: SDK/headless usage still draws from the Pro/Max plan;
 * see docs/research/raw/2026-07-04-collab-interface.md §(b).)
 *
 * Session -> UI: custom in-process MCP tools (NOT AskUserQuestion, which
 * auto-resolves empty in programmatic mode — issue #30983):
 *   - propose_decision : blocks until the human answers the card in the dock
 *   - report_critique  : structured self-critique pins on a capture
 *   - get_pending_feedback : drains the human's pins at natural checkpoints
 *   - capture_now      : asks the eyes for a fresh screenshot
 *
 * UI -> Session: pushMessage() feeds the streaming input generator.
 */

import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { state, nextId, persist, logActivity, unresolvedAdjustPins, pendingFeedback, CAPTURES_DIR } from './state.mjs'
import * as eyes from './eyes.mjs'
import * as assets from './assets.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const MAQUETA_DIR = path.resolve(__dirname, '..', '..')

let broadcast = () => {}
export function onBroadcast(fn) { broadcast = fn }

// --- streaming input -------------------------------------------------------

const inputQueue = []
let wakeInput = null
let sessionRunning = false
let currentQuery = null

export function pushMessage(text) {
  inputQueue.push({
    type: 'user',
    message: { role: 'user', content: [{ type: 'text', text }] },
    parent_tool_use_id: null,
    session_id: '',
  })
  if (wakeInput) { wakeInput(); wakeInput = null }
}

async function* inputStream() {
  while (sessionRunning) {
    while (inputQueue.length) yield inputQueue.shift()
    await new Promise((resolve) => { wakeInput = resolve })
  }
}

// --- decision cards --------------------------------------------------------

const decisionWaiters = new Map()

export function answerDecision(id, answer, notes = '') {
  const card = state.decisions.find((d) => d.id === id)
  if (!card || card.status !== 'open') return false
  card.status = 'answered'
  card.answer = answer
  card.notes = notes
  card.answeredAt = new Date().toISOString()
  persist()
  broadcast({ type: 'decision', card })
  const waiter = decisionWaiters.get(id)
  if (waiter) { waiter({ answer, notes }); decisionWaiters.delete(id) }
  state.sessionStatus = sessionRunning ? 'working' : 'idle'
  broadcast({ type: 'status', status: state.sessionStatus })
  return true
}

export function resolveCritique(id) {
  const c = state.critiques.find((x) => x.id === id)
  if (c) { c.resolved = true; persist(); broadcast({ type: 'critique', critique: c }) }
}

export function addFeedback(pin) {
  const entry = { id: nextId('pin'), ...pin, ts: new Date().toISOString(), drainedAt: null }
  state.feedback.unshift(entry)
  persist()
  broadcast({ type: 'feedback', pin: entry })
  // If the session is idle at a prompt, nudge it immediately (CHI 2025: timing).
  if (sessionRunning && state.sessionStatus !== 'waiting-decision') {
    pushMessage(`[studio] Mateo dejó feedback nuevo anclado en el preview. Llamá get_pending_feedback cuando cierres la unidad de trabajo actual.`)
  }
  return entry
}

// --- MCP tools exposed INTO the session -------------------------------------

async function buildMcpServer() {
  const { tool, createSdkMcpServer } = await import('@anthropic-ai/claude-agent-sdk')
  const { z } = await import('zod')

  const proposeDecision = tool(
    'propose_decision',
    'Present a structured decision card to Mateo in the Studio dock and BLOCK until he answers. Use at real decision points (palette direction, hero concept, motion technique, asset approval). Options should be few and concrete; include your recommendation and why.',
    {
      question: z.string().describe('The decision to make, one sentence, in Spanish'),
      context: z.string().describe('Why this decision matters now — 1-3 sentences'),
      options: z.array(z.object({
        label: z.string(),
        detail: z.string().describe('What choosing this implies'),
        preview: z.string().optional().describe('Optional: capture id or hex swatches like "#0a0a0f #c4843e" to render'),
      })).min(2).max(4),
      recommendation: z.string().describe('Label of the option you recommend, with a short reason'),
    },
    async (args) => {
      const card = {
        id: nextId('dec'), ...args, status: 'open', answer: null,
        createdAt: new Date().toISOString(),
      }
      state.decisions.unshift(card)
      state.sessionStatus = 'waiting-decision'
      persist()
      broadcast({ type: 'decision', card })
      broadcast({ type: 'status', status: 'waiting-decision' })
      logActivity('decision', `card abierta: ${args.question}`)
      const result = await new Promise((resolve) => decisionWaiters.set(card.id, resolve))
      return { content: [{ type: 'text', text: JSON.stringify(result) }] }
    },
  )

  const reportCritique = tool(
    'report_critique',
    'Record your structured self-critique of a capture. Pins render on the screenshot in the Studio. Verdict "adjust" blocks phase completion until resolved. Coordinates are fractions (0-1) of the capture width/height.',
    {
      capture_id: z.string(),
      verdict: z.enum(['ship', 'adjust', 'rethink']),
      summary: z.string().describe('One-paragraph overall judgment, honest, in Spanish'),
      pins: z.array(z.object({
        x: z.number().min(0).max(1), y: z.number().min(0).max(1),
        severity: z.enum(['low', 'medium', 'high']),
        note: z.string(),
      })).max(12),
    },
    async (args) => {
      const critique = { id: nextId('crit'), ...args, resolved: args.verdict === 'ship', ts: new Date().toISOString() }
      state.critiques.unshift(critique)
      persist()
      broadcast({ type: 'critique', critique })
      logActivity('critique', `${args.verdict}: ${args.summary.slice(0, 80)}`)
      return { content: [{ type: 'text', text: `registered ${critique.id} (${args.verdict}, ${args.pins.length} pins)` }] }
    },
  )

  const getPendingFeedback = tool(
    'get_pending_feedback',
    'Drain Mateo\'s pending feedback pins (element-anchored notes on captures). Call at natural checkpoints — after finishing a work unit, before starting the next section.',
    {},
    async () => {
      const pins = pendingFeedback()
      pins.forEach((p) => { p.drainedAt = new Date().toISOString() })
      persist()
      broadcast({ type: 'feedback-drained', ids: pins.map((p) => p.id) })
      return { content: [{ type: 'text', text: pins.length ? JSON.stringify(pins, null, 2) : 'No pending feedback.' }] }
    },
  )

  const captureNow = tool(
    'capture_now',
    'Ask the Studio eyes for a fresh screenshot of the live preview at a breakpoint. Returns the capture id and absolute file path — Read the file to look at it.',
    {
      breakpoint: z.enum(['mobile', 'tablet', 'desktop']).default('desktop'),
    },
    async (args) => {
      eyes.setBreakpoint(args.breakpoint)
      const entry = await eyes.capture({ reason: 'session-request' })
      if (!entry) return { content: [{ type: 'text', text: 'No active project/preview.' }] }
      broadcast({ type: 'capture', capture: entry })
      return { content: [{ type: 'text', text: JSON.stringify({ capture_id: entry.id, file: path.join(CAPTURES_DIR, entry.file), console_errors: entry.consoleErrors }) }] }
    },
  )

  const requestAsset = tool(
    'request_asset',
    'Request a real image asset from Mateo via the Studio Asset Tray (handoff pipeline — no Adobe, no paid APIs). You write the FULL prompt pack: prompt in English following the de-AI-ing rules of .eros/workflows/media.md, which free tool to use, and the treatment (project grade). Mateo generates and drops the file in the inbox; Studio treats it locally and notifies you.',
    {
      slot: z.string().describe('kebab-case slot, e.g. hero-background'),
      kind: z.enum(['photo', 'illustration', 'texture']).default('photo'),
      prompt: z.string().describe('Full generation prompt IN ENGLISH (camera/film named, imperfection explicit, off-center composition)'),
      negative: z.string().optional(),
      tool: z.string().describe('Recommended free tool, e.g. "Google AI Studio (Gemini)"'),
      tool_url: z.string().describe('URL where Mateo generates, e.g. https://aistudio.google.com'),
      settings: z.string().optional().describe('Aspect/mode settings to use in the tool, e.g. "21:9, raw style"'),
      filename: z.string().optional().describe('Expected filename, defaults to {slot}.png'),
      treatment: z.object({
        aspect: z.string().optional(),
        tint: z.string().optional().describe('Palette hex for the soft-light wash'),
        saturation: z.number().optional(),
        contrast: z.number().optional(),
        brightness: z.number().optional(),
        grain: z.number().optional(),
        vignette: z.number().optional(),
      }).optional().describe('Project grade — SAME values for every asset of the project'),
    },
    async (args) => {
      const entry = assets.createRequest(args)
      return {
        content: [{
          type: 'text',
          text: `Asset request ${entry.id} en el tray. Mateo debe guardar "${entry.filename}" en ${assets.inboxDir()}. Recibirás una notificación [studio/assets] cuando esté tratado — seguí con otra cosa mientras tanto.`,
        }],
      }
    },
  )

  return createSdkMcpServer({
    name: 'eros-studio',
    version: '0.1.0',
    tools: [proposeDecision, reportCritique, getPendingFeedback, captureNow, requestAsset],
  })
}

// --- session lifecycle -------------------------------------------------------

export function isRunning() { return sessionRunning }

export async function startSession({ projectDir, brief }) {
  if (sessionRunning) throw new Error('Session already running')
  const { query } = await import('@anthropic-ai/claude-agent-sdk')
  const mcpServer = await buildMcpServer()

  sessionRunning = true
  state.sessionStatus = 'starting'
  broadcast({ type: 'status', status: 'starting' })
  logActivity('session', `starting in ${projectDir}`)

  const systemAppend = [
    `You are Eros running inside Eros Studio — Mateo is watching a live surface, not a chat.`,
    `Identity: read ${path.join(MAQUETA_DIR, 'EROS.md')} and brain/START.md (injected by hooks if configured).`,
    `Studio protocol (MANDATORY):`,
    `- At real decision points (palette, hero direction, motion technique, asset choice) call propose_decision — do NOT ask in prose, do NOT use AskUserQuestion.`,
    `- After finishing each visual work unit call capture_now, Read the capture file, judge it honestly against the brief and your own standards (brain/rules/), then call report_critique. Verdict "adjust" means you keep working; list concrete pins.`,
    `- Call get_pending_feedback at natural checkpoints and honor Mateo's pins before new work.`,
    `- For image assets use request_asset (handoff pipeline, .eros/workflows/media.md V2) — never CSS placeholders, never Adobe, never paid APIs. Keep working on other sections while Mateo generates.`,
    `- The Stop hook will refuse to let the phase end while unresolved "adjust" critiques exist.`,
    brief ? `Project brief: ${brief}` : '',
  ].filter(Boolean).join('\n')

  pushMessage(brief
    ? `Arrancamos. Brief: ${brief}\nEmpezá por leer el estado del proyecto y proponé la primera decisión real vía propose_decision.`
    : `Sesión de Studio iniciada. Leé el estado del proyecto (.eros/state.md si existe) y continuá el trabajo; usá el protocolo de Studio.`)

  currentQuery = query({
    prompt: inputStream(),
    options: {
      cwd: projectDir,
      // The user's CLI default model may not be available to SDK-spawned
      // sessions (e.g. "fable" errors) — pin an explicit model here.
      model: process.env.EROS_STUDIO_MODEL || 'opus',
      mcpServers: { 'eros-studio': mcpServer },
      permissionMode: 'acceptEdits',
      // acceptEdits only auto-approves file edits — MCP tools and shell need
      // explicit pre-approval or they die with "permission not granted" in
      // programmatic mode (no interactive prompt exists to grant them).
      allowedTools: [
        'mcp__eros-studio__propose_decision',
        'mcp__eros-studio__report_critique',
        'mcp__eros-studio__get_pending_feedback',
        'mcp__eros-studio__capture_now',
        'mcp__eros-studio__request_asset',
        'Bash', 'Read', 'Write', 'Edit', 'Glob', 'Grep',
        'WebFetch', 'WebSearch', 'TodoWrite', 'Task', 'Skill', 'NotebookEdit',
      ],
      systemPrompt: { type: 'preset', preset: 'claude_code', append: systemAppend },
      hooks: {
        Stop: [{
          hooks: [async () => {
            const open = unresolvedAdjustPins()
            if (open > 0) {
              return { decision: 'block', reason: `Hay ${open} críticas "adjust" sin resolver — resolvelas (arreglar + report_critique con verdict ship, o marcar resueltas) antes de cerrar.` }
            }
            return {}
          }],
        }],
      },
    },
  })

  ;(async () => {
    try {
      for await (const message of currentQuery) {
        handleSdkMessage(message)
      }
    } catch (e) {
      logActivity('error', `session error: ${e.message}`)
      broadcast({ type: 'session-error', error: e.message })
    } finally {
      sessionRunning = false
      state.sessionStatus = 'idle'
      broadcast({ type: 'status', status: 'idle' })
      logActivity('session', 'ended')
      if (wakeInput) { wakeInput(); wakeInput = null }
    }
  })()
}

function handleSdkMessage(message) {
  switch (message.type) {
    case 'system':
      if (message.subtype === 'init') {
        state.sessionStatus = 'working'
        broadcast({ type: 'status', status: 'working' })
      }
      break
    case 'assistant': {
      const text = (message.message?.content || [])
        .filter((b) => b.type === 'text').map((b) => b.text).join('\n')
      if (text.trim()) broadcast({ type: 'assistant-text', text: text.slice(0, 2000) })
      break
    }
    case 'result':
      broadcast({ type: 'turn-result', subtype: message.subtype, cost: message.total_cost_usd ?? null })
      break
    default:
      break
  }
}

export async function stopSession() {
  if (currentQuery?.interrupt) await currentQuery.interrupt().catch(() => {})
  sessionRunning = false
  if (wakeInput) { wakeInput(); wakeInput = null }
}

/** Eyes -> critique tier gate: called for meaningful captures while working. */
export function onMeaningfulCapture(entry) {
  broadcast({ type: 'capture', capture: entry })
  if (sessionRunning && entry.meaningful && state.sessionStatus === 'working') {
    pushMessage(
      `[studio/eyes] Nueva captura significativa: ${entry.id} (${entry.breakpoint}, diff ${(entry.diffRatio * 100).toFixed(1)}%${entry.consoleErrors.length ? `, ${entry.consoleErrors.length} errores de consola` : ''}). ` +
      `Archivo: ${path.join(CAPTURES_DIR, entry.file)}. Cuando cierres la unidad actual: miralo con Read y llamá report_critique.`)
  }
}
