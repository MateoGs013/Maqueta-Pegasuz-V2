#!/usr/bin/env node
/**
 * eros-server.mjs — Declarative dev server management for project pipelines.
 *
 * Previously, dev-server lifecycle was embedded inside eros-auto-train.mjs
 * (startDevServer / stopDevServer). That tied server management to the
 * auto-train flow — the main /project pipeline (orchestrator → SKILL.md →
 * Claude loop) had no way to start/stop servers declaratively.
 *
 * This script is a generic utility callable from:
 *   - the orchestrator's ACTION_MAP (server/start, server/stop task IDs)
 *   - auto-train (via the existing callScript helper)
 *   - a human at the terminal
 *
 * State lives in `<project>/.brain/server.json`:
 *   { pid, port, startedAt, cwd }
 *
 * Usage:
 *   node eros-server.mjs start  --project /path/to/project [--port 5173]
 *   node eros-server.mjs stop   --project /path/to/project
 *   node eros-server.mjs status --project /path/to/project
 */

import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import net from 'node:net'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs, out, fail, readJson, writeJson, ensureDir } from './lib/utils.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// ─── Executable resolution (same pattern as eros-auto-train.mjs) ──────────
const nodeBinDir = path.dirname(process.execPath)
const findFirst = (candidates) => candidates.find((c) => c && existsSync(c)) || null
const NPX_CLI = findFirst([
  path.join(nodeBinDir, 'node_modules', 'npm', 'bin', 'npx-cli.js'),
])

const log = (msg) => process.stderr.write(`[eros-server] ${msg}\n`)

const serverStatePath = (projectDir) => path.join(projectDir, '.brain', 'server.json')

// ─── Helpers ───────────────────────────────────────────────────────────────

const findFreePort = (start = 5173, end = 5300) =>
  new Promise((resolve, reject) => {
    const tryPort = (port) => {
      if (port > end) { reject(new Error(`No free port in ${start}-${end}`)); return }
      const srv = net.createServer()
      srv.once('error', () => tryPort(port + 1))
      srv.once('listening', () => {
        srv.close(() => resolve(port))
      })
      srv.listen(port, '127.0.0.1')
    }
    tryPort(start)
  })

const waitForPort = (port, timeoutMs = 20000) =>
  new Promise((resolve, reject) => {
    const deadline = Date.now() + timeoutMs
    const tick = () => {
      const sock = new net.Socket()
      sock.once('connect', () => { sock.destroy(); resolve() })
      sock.once('error', () => {
        sock.destroy()
        if (Date.now() > deadline) { reject(new Error(`Server did not start on ${port} within ${timeoutMs}ms`)); return }
        setTimeout(tick, 400)
      })
      sock.connect(port, '127.0.0.1')
    }
    tick()
  })

const isPidAlive = (pid) => {
  if (!pid) return false
  try { process.kill(pid, 0); return true } catch { return false }
}

// ─── Commands ──────────────────────────────────────────────────────────────

const cmdStart = async (args) => {
  const projectDir = args.project ? path.resolve(args.project) : null
  if (!projectDir) fail('--project <path> required')
  if (!existsSync(projectDir)) fail(`Project not found: ${projectDir}`)
  if (!existsSync(path.join(projectDir, 'package.json'))) {
    fail(`Not a Node project (missing package.json): ${projectDir}`)
  }
  if (!NPX_CLI) fail('npx-cli.js not found in node_modules')

  // Check if a server is already running for this project
  const existing = await readJson(serverStatePath(projectDir))
  if (existing && isPidAlive(existing.pid)) {
    log(`Server already running: pid=${existing.pid} port=${existing.port}`)
    out({ ok: true, alreadyRunning: true, ...existing })
    return
  }

  const startPort = parseInt(args.port || '5173', 10)
  const port = await findFreePort(startPort)
  log(`Starting vite on port ${port}...`)

  const proc = spawn(
    process.execPath,
    [NPX_CLI, 'vite', '--port', String(port), '--host', '127.0.0.1'],
    {
      cwd: projectDir,
      stdio: ['ignore', 'ignore', 'ignore'],
      detached: true,
    },
  )
  proc.unref()

  try {
    await waitForPort(port, 30000)
  } catch (err) {
    try { process.kill(proc.pid, 'SIGTERM') } catch {}
    fail(`Server failed to start: ${err.message}`)
  }

  const state = {
    pid: proc.pid,
    port,
    startedAt: new Date().toISOString(),
    cwd: projectDir,
  }

  await ensureDir(path.dirname(serverStatePath(projectDir)))
  await writeJson(serverStatePath(projectDir), state)

  log(`Server ready: pid=${proc.pid} port=${port}`)
  out({ ok: true, ...state })
}

const cmdStop = async (args) => {
  const projectDir = args.project ? path.resolve(args.project) : null
  if (!projectDir) fail('--project <path> required')

  const state = await readJson(serverStatePath(projectDir))
  if (!state) {
    log('No server state file — nothing to stop')
    out({ ok: true, wasRunning: false })
    return
  }

  if (!isPidAlive(state.pid)) {
    log(`Server pid=${state.pid} was already dead`)
    await writeJson(serverStatePath(projectDir), null)
    out({ ok: true, wasRunning: false, cleanedStale: true })
    return
  }

  log(`Killing pid=${state.pid}...`)
  try {
    process.kill(state.pid, 'SIGTERM')
    // Give it 3s to die gracefully, then SIGKILL
    await new Promise((r) => setTimeout(r, 3000))
    if (isPidAlive(state.pid)) {
      try { process.kill(state.pid, 'SIGKILL') } catch {}
    }
  } catch (err) {
    log(`Kill warning: ${err.message}`)
  }

  // Clear state file
  try {
    const { unlink } = await import('node:fs/promises')
    await unlink(serverStatePath(projectDir))
  } catch {}

  out({ ok: true, wasRunning: true, pid: state.pid, port: state.port })
}

const cmdStatus = async (args) => {
  const projectDir = args.project ? path.resolve(args.project) : null
  if (!projectDir) fail('--project <path> required')

  const state = await readJson(serverStatePath(projectDir))
  if (!state) {
    out({ running: false, reason: 'no state file' })
    return
  }
  const alive = isPidAlive(state.pid)
  if (!alive) {
    out({ running: false, reason: 'pid dead', state })
    return
  }
  out({ running: true, ...state })
}

// ─── Main ──────────────────────────────────────────────────────────────────

const main = async () => {
  const args = parseArgs(process.argv.slice(2))
  const sub = args._command

  if (sub === 'start') await cmdStart(args)
  else if (sub === 'stop') await cmdStop(args)
  else if (sub === 'status') await cmdStatus(args)
  else {
    process.stderr.write(`eros-server.mjs — dev server lifecycle

Usage:
  node eros-server.mjs start  --project <path> [--port 5173]
  node eros-server.mjs stop   --project <path>
  node eros-server.mjs status --project <path>

State file: <project>/.brain/server.json
`)
    process.exit(1)
  }
}

main().catch((err) => { log(`Fatal: ${err.message}`); process.exit(1) })
