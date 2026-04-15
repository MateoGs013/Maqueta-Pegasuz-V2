#!/usr/bin/env node
/**
 * vite-watchdog.mjs — Wraps `npm run dev` (Vite), captures exit reasons,
 * auto-restarts. Use this when Vite dies silently and you want to know
 * what killed it.
 *
 * Captures:
 *   - exact exit code + signal (signal=SIGTERM => killed externally,
 *     code=null => process killed without graceful exit, code=0 =>
 *     graceful exit which means something inside Vite called process.exit)
 *   - timestamps for every spawn / heartbeat / death
 *   - all stdout/stderr from the wrapped Vite
 *
 * Usage:
 *   node scripts/vite-watchdog.mjs            # runs panel/ npm run dev
 *   node scripts/vite-watchdog.mjs panel      # same
 *   node scripts/vite-watchdog.mjs root       # runs current dir npm run dev
 *   node scripts/vite-watchdog.mjs <path>     # custom dir
 *
 * Stop with Ctrl+C. Log is at <maqueta>/vite-watchdog.log (appended).
 */

import { spawn, execFileSync } from 'node:child_process'
import { existsSync, createWriteStream } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import os from 'node:os'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const maquetaDir = path.resolve(__dirname, '..', '..')

// ---- Resolve target dir ---------------------------------------------------
const arg = process.argv[2] || 'panel'
let cwd
if (arg === 'panel') cwd = path.join(maquetaDir, 'panel')
else if (arg === 'root') cwd = process.cwd()
else cwd = path.isAbsolute(arg) ? arg : path.resolve(process.cwd(), arg)

if (!existsSync(path.join(cwd, 'package.json'))) {
  console.error(`FATAL: no package.json at ${cwd}`)
  process.exit(1)
}

// ---- Resolve npm-cli (avoid Windows PATH/cmd.exe nonsense) ---------------
const nodeBinDir = path.dirname(process.execPath)
const NPM_CLI = path.join(nodeBinDir, 'node_modules', 'npm', 'bin', 'npm-cli.js')
if (!existsSync(NPM_CLI)) {
  console.error(`FATAL: npm-cli.js not found at ${NPM_CLI}`)
  process.exit(1)
}

// ---- Read Windows PATH from registry (bypass corrupted bash env) --------
// On this box, $PATH in bash starts with ANSI escape codes from a custom
// .bashrc banner, which corrupts process.env.PATH and breaks every spawn
// that depends on PATH lookup. We read the REAL Windows PATH straight from
// the registry (HKCU + HKLM Environment keys) — same source cmd.exe uses.
// Use absolute reg.exe so we don't depend on PATH (which is corrupted)
const REG_EXE = 'C:\\Windows\\System32\\reg.exe'
const readRegPath = (hive) => {
  try {
    const out = execFileSync(REG_EXE, ['query', hive, '/v', 'PATH'], {
      encoding: 'utf8', windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'],
    })
    const m = out.match(/PATH\s+REG_(?:EXPAND_)?SZ\s+(.+)/i)
    return m ? m[1].trim() : null
  } catch { return null }
}
const expandEnvVars = (s) => s.replace(/%([^%]+)%/g, (_, k) => process.env[k] || `%${k}%`)
const buildWindowsPath = () => {
  const sys = readRegPath('HKLM\\SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Environment')
  const usr = readRegPath('HKCU\\Environment')
  const parts = []
  if (sys) parts.push(...sys.split(';'))
  if (usr) parts.push(...usr.split(';'))
  // Fallback: if registry failed, try process.env.PATH (probably corrupted)
  if (parts.length === 0 && process.env.PATH) parts.push(...process.env.PATH.split(/[;:]/))
  // Expand %SystemRoot% etc. and dedup
  const seen = new Set()
  const out = []
  for (const raw of parts) {
    const expanded = expandEnvVars(raw).trim()
    if (!expanded) continue
    const key = expanded.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(expanded)
  }
  // Belt and suspenders: ensure System32 + nodejs are present
  const must = ['C:\\Windows\\System32', 'C:\\Program Files\\nodejs']
  for (const m of must) {
    if (!out.some(p => p.toLowerCase() === m.toLowerCase())) out.unshift(m)
  }
  return out.join(';')
}
const WIN_PATH = buildWindowsPath()

// ---- Logging --------------------------------------------------------------
const logPath = path.join(maquetaDir, 'vite-watchdog.log')
const log = createWriteStream(logPath, { flags: 'a' })

const ts = () => new Date().toISOString()
const write = (msg) => {
  const line = `[${ts()}] ${msg}\n`
  process.stderr.write(line)
  log.write(line)
}

// ---- Restart loop ---------------------------------------------------------
let restartCount = 0
let lastRestart = 0
let currentChild = null

const start = () => {
  const now = Date.now()
  const sinceLast = lastRestart ? now - lastRestart : Infinity

  // Backoff if dying quickly
  let delay = 2000
  if (sinceLast < 30000) {
    restartCount++
    delay = Math.min(60000, 2000 * Math.pow(2, restartCount))
    write(`vite died in ${sinceLast}ms — backoff ${delay}ms (restart #${restartCount})`)
    if (restartCount >= 5) {
      write(`too many quick restarts (${restartCount}) — giving up`)
      process.exit(1)
    }
  } else if (lastRestart) {
    write(`vite stayed up ${Math.round(sinceLast / 1000)}s — counter reset`)
    restartCount = 0
  }
  lastRestart = now

  setTimeout(() => {
    write(`spawning: node ${NPM_CLI} run dev  (cwd=${cwd})`)
    const proc = spawn(process.execPath, [NPM_CLI, 'run', 'dev'], {
      cwd,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: false,
      env: { ...process.env, PATH: WIN_PATH, FORCE_COLOR: '1' },
    })
    currentChild = proc
    write(`spawned PID ${proc.pid}`)

    proc.stdout.on('data', (d) => {
      const text = d.toString()
      process.stdout.write(text)
      log.write(text)
    })
    proc.stderr.on('data', (d) => {
      const text = d.toString()
      process.stderr.write(text)
      log.write(text)
    })

    proc.on('exit', (code, signal) => {
      const aliveSec = Math.round((Date.now() - lastRestart) / 1000)
      write(`EXIT pid=${proc.pid} code=${code} signal=${signal} alive=${aliveSec}s`)
      currentChild = null
      // Diagnose
      if (code === 0) write(`  → graceful exit (something inside vite called process.exit(0))`)
      else if (code === 1) write(`  → vite errored — check the stderr above`)
      else if (code === null && signal) write(`  → killed by signal ${signal} (external killer)`)
      else if (code === null) write(`  → killed without code or signal (very abrupt — possible OS kill)`)
      else write(`  → exited with non-zero code ${code}`)
      start()
    })

    proc.on('error', (err) => {
      write(`SPAWN ERROR: ${err.message}`)
    })
  }, delay)
}

// ---- Heartbeat (so we can correlate vite death w/ system idle time) -----
setInterval(() => {
  const mem = process.memoryUsage()
  write(`heartbeat uptime=${Math.round(process.uptime())}s rss=${Math.round(mem.rss / 1024 / 1024)}MB`)
}, 60000)

// ---- Clean shutdown ------------------------------------------------------
const shutdown = (sig) => {
  write(`watchdog received ${sig} — killing child and exiting`)
  if (currentChild && !currentChild.killed) {
    try { currentChild.kill('SIGTERM') } catch {}
  }
  setTimeout(() => process.exit(0), 500)
}
process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))

// ---- Boot ----------------------------------------------------------------
write('───────────────────────────────────────────────────────')
write(`vite-watchdog started`)
write(`  watchdog PID:  ${process.pid}`)
write(`  target:        ${arg}`)
write(`  cwd:           ${cwd}`)
write(`  log:           ${logPath}`)
write(`  os:            ${os.platform()} ${os.release()}`)
write(`  node:          ${process.version}`)
write(`  total mem:     ${Math.round(os.totalmem() / 1024 / 1024 / 1024)}GB`)
write(`  free mem:      ${Math.round(os.freemem() / 1024 / 1024 / 1024)}GB`)
write(`  windows PATH:  ${WIN_PATH.split(';').length} entries (rebuilt from bash PATH)`)
write('───────────────────────────────────────────────────────')

start()
