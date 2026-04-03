import { spawn } from 'node:child_process'
import { promises as fsP, watch as fsWatch, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const scriptsDir = path.resolve(__dirname, '..', 'scripts')
const runtimeFile = path.resolve(__dirname, '..', '.claude', 'front-brain', 'runtime', 'runs.generated.json')

export default function erosPlugin() {
  let watchProcess = null
  const logs = []
  const MAX_LOGS = 200
  const logClients = new Set()
  const dataClients = new Set()

  const pushLog = (type, text) => {
    const entry = { ts: Date.now(), type, text: text.trim() }
    if (!entry.text) return
    logs.push(entry)
    if (logs.length > MAX_LOGS) logs.shift()
    const data = JSON.stringify(entry)
    for (const res of logClients) {
      try { res.write(`data: ${data}\n\n`) } catch { logClients.delete(res) }
    }
  }

  const pushData = () => {
    try {
      const raw = readFileSync(runtimeFile, 'utf8')
      const payload = JSON.stringify({ ts: Date.now(), runs: JSON.parse(raw) })
      for (const res of dataClients) {
        try { res.write(`data: ${payload}\n\n`) } catch { dataClients.delete(res) }
      }
    } catch { /* file not ready */ }
  }

  const startWatch = () => {
    if (watchProcess) return
    const script = path.join(scriptsDir, 'sync-front-brain-runs.mjs')
    watchProcess = spawn(process.execPath, [script, '--watch'], {
      cwd: scriptsDir,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env },
    })
    watchProcess.stdout.on('data', (chunk) => pushLog('info', chunk.toString()))
    watchProcess.stderr.on('data', (chunk) => pushLog('error', chunk.toString()))
    watchProcess.on('exit', (code) => {
      pushLog('system', `Watch process exited (code ${code})`)
      watchProcess = null
    })
    pushLog('system', 'Watch mode iniciado')
  }

  const sseHeaders = {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'Access-Control-Allow-Origin': '*',
  }

  return {
    name: 'vite-plugin-eros',

    configureServer(server) {
      // SSE: terminal logs
      server.middlewares.use('/__eros/logs', (req, res) => {
        res.writeHead(200, sseHeaders)
        for (const entry of logs.slice(-50)) {
          res.write(`data: ${JSON.stringify(entry)}\n\n`)
        }
        logClients.add(res)
        req.on('close', () => logClients.delete(res))
      })

      // SSE: live data — pushes full runs.generated.json on every change
      server.middlewares.use('/__eros/data', (req, res) => {
        res.writeHead(200, sseHeaders)
        // Send current data immediately
        try {
          const raw = readFileSync(runtimeFile, 'utf8')
          res.write(`data: ${JSON.stringify({ ts: Date.now(), runs: JSON.parse(raw) })}\n\n`)
        } catch { /* no data yet */ }
        dataClients.add(res)
        req.on('close', () => dataClients.delete(res))
      })

      // REST: status
      server.middlewares.use('/__eros/status', (req, res) => {
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ watchActive: !!watchProcess, logCount: logs.length }))
      })

      // REST: start/stop watch
      server.middlewares.use('/__eros/start-watch', (req, res) => {
        if (req.method !== 'POST') { res.writeHead(405); res.end(); return }
        startWatch()
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ ok: true }))
      })

      server.middlewares.use('/__eros/stop-watch', (req, res) => {
        if (req.method !== 'POST') { res.writeHead(405); res.end(); return }
        if (watchProcess) {
          watchProcess.kill('SIGTERM')
          watchProcess = null
          pushLog('system', 'Watch mode detenido')
        }
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ ok: true }))
      })

      // Watch runs.generated.json for changes → push to data SSE clients
      let dataDebounce = null
      try {
        fsWatch(runtimeFile, () => {
          if (dataDebounce) clearTimeout(dataDebounce)
          dataDebounce = setTimeout(pushData, 500)
        })
      } catch { /* file doesn't exist yet */ }

      startWatch()
    },

    closeBundle() {
      if (watchProcess) {
        watchProcess.kill('SIGTERM')
        watchProcess = null
      }
    },
  }
}
