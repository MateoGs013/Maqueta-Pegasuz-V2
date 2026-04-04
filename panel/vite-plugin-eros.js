import { spawn, execFile as execFileCp } from 'node:child_process'
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
      // SSE heartbeat — prevents zombie connections
      const heartbeat = setInterval(() => {
        const comment = `: heartbeat ${Date.now()}\n\n`
        for (const res of logClients) {
          try { res.write(comment) } catch { logClients.delete(res) }
        }
        for (const res of dataClients) {
          try { res.write(comment) } catch { dataClients.delete(res) }
        }
      }, 15000)

      // Cleanup on server close
      server.httpServer?.on('close', () => {
        clearInterval(heartbeat)
        for (const res of logClients) { try { res.end() } catch {} }
        for (const res of dataClients) { try { res.end() } catch {} }
        logClients.clear()
        dataClients.clear()
      })

      // SSE: terminal logs
      server.middlewares.use('/__eros/logs', (req, res) => {
        res.writeHead(200, sseHeaders)
        for (const entry of logs.slice(-50)) {
          res.write(`data: ${JSON.stringify(entry)}\n\n`)
        }
        logClients.add(res)
        req.on('close', () => logClients.delete(res))
        req.on('error', () => logClients.delete(res))
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
        req.on('error', () => dataClients.delete(res))
      })

      // REST: status
      server.middlewares.use('/__eros/status', (req, res) => {
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ watchActive: !!watchProcess, logCount: logs.length }))
      })

      // REST: observer V2 manifest for a project
      server.middlewares.use('/__eros/observer', async (req, res) => {
        const url = new URL(req.url, `http://${req.headers.host}`)
        const slug = url.searchParams.get('project')
        if (!slug) { res.writeHead(400); res.end('{"error":"?project= required"}'); return }
        try {
          const os = await import('node:os')
          const manifestPath = path.join(os.default.homedir(), 'Desktop', slug, '.brain', 'observer', 'localhost', 'manifest.json')
          const raw = await fsP.readFile(manifestPath, 'utf8')
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(raw)
        } catch (e) {
          res.writeHead(404, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: e.message }))
        }
      })

      // REST: full memory data (all design-intelligence JSON files)
      server.middlewares.use('/__eros/memory-data', async (req, res) => {
        const memDir = path.resolve(__dirname, '..', '.claude', 'memory', 'design-intelligence')
        const files = ['font-pairings', 'color-palettes', 'signatures', 'section-patterns', 'technique-scores', 'revision-patterns', 'pipeline-lessons', 'rules', 'training-calibration']
        const data = {}
        for (const f of files) {
          try {
            const raw = await fsP.readFile(path.join(memDir, `${f}.json`), 'utf8')
            data[f.replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = JSON.parse(raw)
          } catch { data[f.replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = null }
        }
        res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' })
        res.end(JSON.stringify(data))
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

      // REST: memory stats
      server.middlewares.use('/__eros/memory-stats', async (req, res) => {
        try {
          const { execFile: execFileCb } = await import('node:child_process')
          execFileCb('node', [path.join(scriptsDir, 'eros-memory.mjs'), 'stats'], { cwd: scriptsDir }, (err, stdout) => {
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(err ? JSON.stringify({ error: err.message }) : stdout)
          })
        } catch (e) {
          res.writeHead(500, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: e.message }))
        }
      })

      // Helper: run an eros-train.mjs subcommand and return JSON
      const runTrain = (trainArgs) => new Promise((resolve, reject) => {
        execFileCp('node', [path.join(scriptsDir, 'eros-train.mjs'), ...trainArgs], { cwd: scriptsDir, timeout: 120000 }, (err, stdout, stderr) => {
          if (err) { reject(new Error(stderr || err.message)); return }
          try { resolve(JSON.parse(stdout)) } catch { resolve({ raw: stdout }) }
        })
      })

      // REST: list projects with .brain/ (any project on Desktop)
      server.middlewares.use('/__eros/training/projects', async (req, res) => {
        try {
          const os = await import('node:os')
          const desktopDir = path.join(os.default.homedir(), 'Desktop')
          const entries = await fsP.readdir(desktopDir, { withFileTypes: true })
          const projects = []
          for (const e of entries) {
            if (!e.isDirectory() || e.name === 'maqueta') continue
            const brainDir = path.join(desktopDir, e.name, '.brain')
            try {
              await fsP.access(brainDir)
              const state = JSON.parse(await fsP.readFile(path.join(brainDir, 'state.json'), 'utf8').catch(() => '{}'))
              const scorecard = JSON.parse(await fsP.readFile(path.join(brainDir, 'reports', 'quality', 'scorecard.json'), 'utf8').catch(() => '{}'))
              const sections = await fsP.readdir(path.join(desktopDir, e.name, 'src', 'components', 'sections')).catch(() => [])
              projects.push({
                slug: e.name,
                projectName: state.project?.name || e.name,
                score: scorecard.finalScore || null,
                sections: sections.filter(f => f.endsWith('.vue')),
              })
            } catch { /* no .brain */ }
          }
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify(projects))
        } catch (e) {
          res.writeHead(500, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: e.message }))
        }
      })

      // REST: smart review for a project
      server.middlewares.use('/__eros/training/review', async (req, res) => {
        const url = new URL(req.url, `http://${req.headers.host}`)
        const slug = url.searchParams.get('project')
        if (!slug) { res.writeHead(400); res.end('{"error":"?project= required"}'); return }
        try {
          const os = await import('node:os')
          const projectDir = path.join(os.default.homedir(), 'Desktop', slug)
          const result = await runTrain(['review', '--project', projectDir])
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify(result))
        } catch (e) {
          res.writeHead(500, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: e.message }))
        }
      })

      // REST: submit review feedback
      server.middlewares.use('/__eros/training/review-feedback', async (req, res) => {
        if (req.method !== 'POST') { res.writeHead(405); res.end(); return }
        let body = ''
        req.on('data', c => { body += c })
        req.on('end', async () => {
          try {
            const { slug, feedback } = JSON.parse(body)
            const os = await import('node:os')
            const projectDir = path.join(os.default.homedir(), 'Desktop', slug)
            const result = await runTrain(['review', '--project', projectDir, '--feedback', JSON.stringify(feedback)])
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify(result))
          } catch (e) {
            res.writeHead(500, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: e.message }))
          }
        })
      })

      // REST: auto-correct from git diffs
      server.middlewares.use('/__eros/training/correct', async (req, res) => {
        if (req.method !== 'POST') { res.writeHead(405); res.end(); return }
        let body = ''
        req.on('data', c => { body += c })
        req.on('end', async () => {
          try {
            const { slug } = JSON.parse(body)
            const os = await import('node:os')
            const projectDir = path.join(os.default.homedir(), 'Desktop', slug)
            const result = await runTrain(['correct', '--project', projectDir])
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify(result))
          } catch (e) {
            res.writeHead(500, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: e.message }))
          }
        })
      })

      // REST: study a reference URL
      server.middlewares.use('/__eros/training/study', async (req, res) => {
        if (req.method !== 'POST') { res.writeHead(405); res.end(); return }
        let body = ''
        req.on('data', c => { body += c })
        req.on('end', async () => {
          try {
            const { url: refUrl } = JSON.parse(body)
            const result = await runTrain(['study', '--url', refUrl])
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify(result))
          } catch (e) {
            res.writeHead(500, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: e.message }))
          }
        })
      })

      // REST: training impact
      server.middlewares.use('/__eros/training/impact', async (req, res) => {
        try {
          const result = await runTrain(['impact'])
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify(result))
        } catch (e) {
          res.writeHead(500, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: e.message }))
        }
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
