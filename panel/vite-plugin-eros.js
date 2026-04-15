import { spawn, execFile as execFileCp } from 'node:child_process'
import { promises as fsP, watch as fsWatch, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const scriptsDir = path.resolve(__dirname, '..', 'scripts')
const runtimeFile = path.resolve(__dirname, '..', '.eros', 'eros-feed', 'runtime', 'runs.generated.json')

export default function erosPlugin() {
  let watchProcess = null
  let runtimeWatcher = null
  let dataDebounce = null
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
    const script = path.join(scriptsDir, 'pipeline', 'sync-eros-feed-runs.mjs')
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
          const manifestPath = path.join(os.default.homedir(), 'Desktop', slug, '.eros', 'observer', 'localhost', 'manifest.json')
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
          execFileCb(process.execPath, [path.join(scriptsDir, 'eros-memory.mjs'), 'stats'], { cwd: scriptsDir }, (err, stdout) => {
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(err ? JSON.stringify({ error: err.message }) : stdout)
          })
        } catch (e) {
          res.writeHead(500, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: e.message }))
        }
      })

      // Helper: run an eros-train.mjs subcommand and return JSON.
      // Queued (concurrency=1) so parallel panel requests don't spawn
      // multiple node processes that compete for the same files/locks.
      // Without the queue, clicking "study" 5 times would spawn 5 Playwright
      // instances and consume ~1-2GB RAM in seconds.
      let trainQueue = Promise.resolve()
      const runTrain = (trainArgs) => {
        const exec = () => new Promise((resolve, reject) => {
          execFileCp(process.execPath, [path.join(scriptsDir, 'eros-train.mjs'), ...trainArgs], { cwd: scriptsDir, timeout: 300000 }, (err, stdout, stderr) => {
            if (err) { reject(new Error(stderr || err.message)); return }
            try { resolve(JSON.parse(stdout)) } catch { resolve({ raw: stdout }) }
          })
        })
        const next = trainQueue.then(exec, exec)
        trainQueue = next.catch(() => {}) // absorb errors so the chain survives
        return next
      }

      // REST: list projects with .eros/ (any project on Desktop)
      // Cached for 10s — scanning Desktop + reading 5 files per project is
      // expensive when there are 20+ practice projects, and the panel hits
      // this endpoint on every navigation.
      // NOTE: 'Eros' is excluded from the scan — it is the master repo, not a practice project.
      let projectsCache = null
      let projectsCacheAt = 0
      const PROJECTS_TTL = 10000
      server.middlewares.use('/__eros/training/projects', async (req, res) => {
        try {
          // Serve from cache if fresh
          if (projectsCache && Date.now() - projectsCacheAt < PROJECTS_TTL) {
            res.writeHead(200, { 'Content-Type': 'application/json', 'X-Cache': 'HIT' })
            res.end(projectsCache)
            return
          }
          const os = await import('node:os')
          const desktopDir = path.join(os.default.homedir(), 'Desktop')
          const entries = await fsP.readdir(desktopDir, { withFileTypes: true })
          const projects = []
          for (const e of entries) {
            if (!e.isDirectory() || e.name === 'maqueta' || e.name === 'Eros') continue
            const erosDir = path.join(desktopDir, e.name, '.eros')
            try {
              await fsP.access(erosDir)
              const state = JSON.parse(await fsP.readFile(path.join(erosDir, 'state.json'), 'utf8').catch(() => '{}'))
              const scorecard = JSON.parse(await fsP.readFile(path.join(erosDir, 'reports', 'quality', 'scorecard.json'), 'utf8').catch(() => '{}'))
              const sections = await fsP.readdir(path.join(desktopDir, e.name, 'src', 'components', 'sections')).catch(() => [])
              // Find preview thumbnail (observer frame-000.png or preview.png)
              let preview = null
              const previewCandidates = [
                path.join(desktopDir, e.name, 'preview.png'),
                path.join(erosDir, 'observer', 'localhost', 'frame-000.png'),
                path.join(erosDir, 'observer', 'localhost', 'full-page-desktop.png'),
              ]
              for (const p of previewCandidates) {
                try { await fsP.access(p); preview = `/__eros/preview/${e.name}/${path.basename(p)}`; break } catch {}
              }

              projects.push({
                slug: e.name,
                projectName: state.project?.name || e.name,
                score: scorecard.finalScore || null,
                sections: sections.filter(f => f.endsWith('.vue')),
                preview,
              })
            } catch { /* no .eros */ }
          }
          projectsCache = JSON.stringify(projects)
          projectsCacheAt = Date.now()
          res.writeHead(200, { 'Content-Type': 'application/json', 'X-Cache': 'MISS' })
          res.end(projectsCache)
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

      // REST: Eros chat
      server.middlewares.use('/__eros/chat', async (req, res) => {
        if (req.method !== 'POST') { res.writeHead(405); res.end(); return }
        let body = ''
        req.on('data', c => { body += c })
        req.on('end', async () => {
          try {
            const { message } = JSON.parse(body)
            execFileCp(process.execPath, [path.join(scriptsDir, 'eros-chat.mjs'), '--message', message], { cwd: scriptsDir, timeout: 120000 }, (err, stdout) => {
              res.writeHead(200, { 'Content-Type': 'application/json' })
              res.end(err ? JSON.stringify({ response: 'No pude procesar eso. Probá preguntándome sobre mis técnicas, debilidades, o filosofía.', mood: 'confused' }) : stdout)
            })
          } catch (e) {
            res.writeHead(500, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: e.message }))
          }
        })
      })

      // REST: serve preserved training session preview screenshots.
      // URL: /__eros/training/preview/{sessionId}/{filename}
      // Sources from memory/design-intelligence/previews/<sessionId>/
      server.middlewares.use('/__eros/training/preview', async (req, res) => {
        try {
          const parts = req.url.replace(/^\//, '').split('/').filter(Boolean)
          const sessionId = parts[0]
          const filename = parts[1]
          if (!sessionId || !filename || !/\.(png|jpg|jpeg|webp)$/i.test(filename)) {
            res.writeHead(400); res.end(); return
          }
          const previewPath = path.resolve(
            scriptsDir, '..', '.claude', 'memory', 'design-intelligence',
            'previews', sessionId, filename,
          )
          const data = await fsP.readFile(previewPath)
          const ext = path.extname(filename).slice(1).toLowerCase()
          const mime = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp' }[ext] || 'image/png'
          res.writeHead(200, { 'Content-Type': mime, 'Cache-Control': 'public, max-age=3600' })
          res.end(data)
        } catch { res.writeHead(404); res.end() }
      })

      // REST: list available preview frames for a session
      server.middlewares.use('/__eros/training/preview-list', async (req, res) => {
        try {
          const url = new URL(req.url, `http://${req.headers.host}`)
          const sessionId = url.searchParams.get('session')
          if (!sessionId) { res.writeHead(400); res.end('{"frames":[]}'); return }
          const dir = path.resolve(
            scriptsDir, '..', '.claude', 'memory', 'design-intelligence',
            'previews', sessionId,
          )
          const entries = await fsP.readdir(dir).catch(() => [])
          const frames = entries.filter((f) => /\.(png|jpg|webp)$/i.test(f)).sort()
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ sessionId, frames }))
        } catch {
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end('{"frames":[]}')
        }
      })

      // REST: serve project preview images
      server.middlewares.use('/__eros/preview', async (req, res) => {
        try {
          const os = await import('node:os')
          // URL: /__eros/preview/{slug}/{filename}
          const parts = req.url.replace(/^\//, '').split('/')
          const slug = parts[0]
          const filename = parts[1]
          if (!slug || !filename || !/\.(png|jpg|jpeg|webp)$/i.test(filename)) {
            res.writeHead(400); res.end(); return
          }
          const desktopDir = path.join(os.default.homedir(), 'Desktop')
          const candidates = [
            path.join(desktopDir, slug, filename),
            path.join(desktopDir, slug, '.eros', 'observer', 'localhost', filename),
          ]
          for (const p of candidates) {
            try {
              const data = await fsP.readFile(p)
              const ext = path.extname(p).slice(1)
              const mime = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp' }[ext] || 'image/png'
              res.writeHead(200, { 'Content-Type': mime, 'Cache-Control': 'public, max-age=300' })
              res.end(data)
              return
            } catch {}
          }
          res.writeHead(404); res.end()
        } catch { res.writeHead(500); res.end() }
      })

      // REST: Awwwards discovery
      server.middlewares.use('/__eros/discover', async (req, res) => {
        try {
          execFileCp(process.execPath, [path.join(scriptsDir, 'eros-discover.mjs'), '--list'], { cwd: scriptsDir, timeout: 180000 }, (err, stdout) => {
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(err ? JSON.stringify({ sites: [], error: err.message }) : stdout)
          })
        } catch (e) {
          res.writeHead(500, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: e.message }))
        }
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

      // REST: Eros diary — prose reflections appended by eros-meta reflect
      server.middlewares.use('/__eros/diary', async (req, res) => {
        try {
          const url = new URL(req.url, `http://${req.headers.host}`)
          const limit = url.searchParams.get('limit') || '20'
          execFileCp(
            process.execPath,
            [path.join(scriptsDir, 'eros-meta.mjs'), 'diary', '--limit', limit],
            { cwd: scriptsDir, timeout: 10000 },
            (err, stdout) => {
              res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' })
              res.end(err ? '{"count":0,"entries":[]}' : stdout)
            },
          )
        } catch (e) {
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end('{"count":0,"entries":[]}')
        }
      })

      // REST: Eros pucho stats (total count + minutes + last pucho)
      server.middlewares.use('/__eros/puchos', async (req, res) => {
        try {
          execFileCp(
            process.execPath,
            [path.join(scriptsDir, 'eros-pucho.mjs'), 'stats'],
            { cwd: scriptsDir, timeout: 5000 },
            (err, stdout) => {
              res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' })
              res.end(err ? '{"count":0,"totalMinutes":0,"totalFormatted":"0m"}' : stdout)
            },
          )
        } catch (e) {
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end('{"count":0,"totalMinutes":0,"totalFormatted":"0m"}')
        }
      })

      // REST: Eros current mood (derived from recent events + sessions)
      server.middlewares.use('/__eros/mood', async (req, res) => {
        try {
          execFileCp(
            process.execPath,
            [path.join(scriptsDir, 'eros-mood.mjs')],
            { cwd: scriptsDir, timeout: 10000 },
            (err, stdout) => {
              res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' })
              res.end(err ? '{"mood":"Latente","emoji":"·","color":"#6b7280","reason":"mood engine error"}' : stdout)
            },
          )
        } catch (e) {
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end('{"mood":"Latente","emoji":"·","color":"#6b7280"}')
        }
      })

      // REST: Eros activity feed (recent timeline events)
      server.middlewares.use('/__eros/feed', async (req, res) => {
        try {
          const url = new URL(req.url, `http://${req.headers.host}`)
          const limit = parseInt(url.searchParams.get('limit') || '50', 10)
          const feedPath = path.resolve(scriptsDir, '..', '.claude', 'memory', 'design-intelligence', 'activity-feed.json')
          const raw = await fsP.readFile(feedPath, 'utf8').catch(() => '{"count":0,"events":[]}')
          const data = JSON.parse(raw)
          if (data.events && data.events.length > limit) {
            data.events = data.events.slice(-limit)
          }
          res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' })
          res.end(JSON.stringify(data))
        } catch (e) {
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end('{"count":0,"events":[]}')
        }
      })

      // REST: list all Vercel preview deploys (from registry)
      server.middlewares.use('/__eros/training/deploys', async (req, res) => {
        try {
          const registryPath = path.resolve(scriptsDir, '..', '.claude', 'memory', 'design-intelligence', 'deploy-registry.json')
          const data = await fsP.readFile(registryPath, 'utf8').catch(() => '{"deploys":{}}')
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(data)
        } catch (e) {
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end('{"deploys":{}}')
        }
      })

      // REST: deploy a project to Vercel preview.
      // Body: { slug: "practice-v2" } → spawns eros-deploy.mjs deploy
      // Blocks until the deploy completes (~30-90s typically). Consider
      // moving to detached+status-file pattern if this blocks the UI too long.
      server.middlewares.use('/__eros/training/deploy', async (req, res) => {
        if (req.method !== 'POST') { res.writeHead(405); res.end(); return }
        try {
          const body = await new Promise((resolve) => {
            let d = ''; req.on('data', c => d += c); req.on('end', () => {
              try { resolve(JSON.parse(d)) } catch { resolve({}) }
            })
          })
          const slug = body.slug
          if (!slug) { res.writeHead(400); res.end('{"error":"slug required"}'); return }

          const os = await import('node:os')
          const projectDir = path.join(os.default.homedir(), 'Desktop', slug)

          execFileCp(
            process.execPath,
            [path.join(scriptsDir, 'eros-deploy.mjs'), 'deploy', '--project', projectDir],
            { cwd: scriptsDir, timeout: 600000, maxBuffer: 10 * 1024 * 1024 },
            (err, stdout, stderr) => {
              if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' })
                res.end(JSON.stringify({ error: (stderr || err.message).slice(0, 500) }))
                return
              }
              res.writeHead(200, { 'Content-Type': 'application/json' })
              try { res.end(stdout) } catch {}
            },
          )
        } catch (e) {
          res.writeHead(500, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: e.message }))
        }
      })

      // REST: auto-training config GET/POST
      // Persists user preferences (count, maxRetries, skipDiscover) to
      // training-config.json so they survive page reloads.
      server.middlewares.use('/__eros/training/config', async (req, res) => {
        const configPath = path.resolve(scriptsDir, '..', '.claude', 'memory', 'design-intelligence', 'training-config.json')
        if (req.method === 'GET') {
          try {
            const raw = await fsP.readFile(configPath, 'utf8').catch(() => '{"count":1,"maxRetries":1,"skipDiscover":false}')
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(raw)
          } catch {
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end('{"count":1,"maxRetries":1,"skipDiscover":false}')
          }
          return
        }
        if (req.method === 'POST') {
          try {
            const body = await new Promise((resolve) => {
              let d = ''; req.on('data', (c) => d += c); req.on('end', () => {
                try { resolve(JSON.parse(d)) } catch { resolve({}) }
              })
            })
            // Sanitize: only keep known fields with sane bounds
            const sanitized = {
              count: Math.max(1, Math.min(10, parseInt(body.count || 1, 10))),
              maxRetries: Math.max(0, Math.min(5, parseInt(body.maxRetries || 1, 10))),
              skipDiscover: Boolean(body.skipDiscover),
              updatedAt: new Date().toISOString(),
            }
            await fsP.mkdir(path.dirname(configPath), { recursive: true })
            await fsP.writeFile(configPath, JSON.stringify(sanitized, null, 2) + '\n', 'utf8')
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify(sanitized))
          } catch (e) {
            res.writeHead(500, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: e.message }))
          }
          return
        }
        res.writeHead(405); res.end()
      })

      // REST: auto-training LIVE status (phase, task, progress)
      // Written by eros-auto-train.mjs on every phase transition.
      // Panel polls this to render the live progress bar.
      server.middlewares.use('/__eros/training/auto-train-status', async (req, res) => {
        try {
          const statusFilePath = path.resolve(scriptsDir, '..', '.claude', 'memory', 'design-intelligence', 'auto-train-status.json')
          const data = await fsP.readFile(statusFilePath, 'utf8').catch(() => '{"active":false}')
          res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' })
          res.end(data)
        } catch (e) {
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end('{"active":false}')
        }
      })

      // REST: auto-training history
      server.middlewares.use('/__eros/training/auto-train-history', async (req, res) => {
        try {
          const os = await import('node:os')
          const historyPath = path.resolve(scriptsDir, '..', '.claude', 'memory', 'design-intelligence', 'training-history.json')
          const data = await fsP.readFile(historyPath, 'utf8').catch(() => '{"sessions":[]}')
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(data)
        } catch (e) {
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end('{"sessions":[]}')
        }
      })

      // REST: launch auto-training session
      server.middlewares.use('/__eros/training/auto-train-start', async (req, res) => {
        if (req.method !== 'POST') { res.writeHead(405); res.end(); return }
        try {
          const body = await new Promise((resolve) => {
            let d = ''; req.on('data', c => d += c); req.on('end', () => {
              try { resolve(JSON.parse(d)) } catch { resolve({}) }
            })
          })
          const count = String(body.count || 1)
          const maxRetries = String(body.maxRetries || 1)
          const args = [path.join(scriptsDir, 'eros-auto-train.mjs'), '--count', count, '--max-retries', maxRetries]
          if (body.skipDiscover) args.push('--skip-discover')

          const { spawn: spawnProc } = await import('node:child_process')
          const child = spawnProc(process.execPath, args, {
            cwd: scriptsDir, stdio: 'ignore', detached: true,
          })
          child.unref()

          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ started: true, pid: child.pid, count: parseInt(count) }))
        } catch (e) {
          res.writeHead(500, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: e.message }))
        }
      })

      // Watch runs.generated.json for changes → push to data SSE clients.
      // The watcher reference is kept at closure level so closeBundle() can
      // close it (it was leaking before — one fs.watch handle per vite restart).
      try {
        runtimeWatcher = fsWatch(runtimeFile, () => {
          if (dataDebounce) clearTimeout(dataDebounce)
          dataDebounce = setTimeout(pushData, 500)
        })
      } catch { /* file doesn't exist yet */ }

      // NOTE: startWatch() removed from auto-start.
      // It was spawning sync-eros-feed-runs.mjs --watch, which opened a
      // recursive fs.watch handle on EVERY .eros/ dir on the Desktop (20+
      // watchers). On Windows that exhausts the per-process handle limit
      // after a few hours of use, killing vite silently with no Event Viewer
      // entry. The watch script can still be invoked manually if needed:
      //   node ../scripts/pipeline/sync-eros-feed-runs.mjs --watch
      // Re-enable here only if you understand the file-handle implications.
    },

    closeBundle() {
      if (watchProcess) {
        watchProcess.kill('SIGTERM')
        watchProcess = null
      }
      if (runtimeWatcher) {
        try { runtimeWatcher.close() } catch {}
        runtimeWatcher = null
      }
      if (dataDebounce) {
        clearTimeout(dataDebounce)
        dataDebounce = null
      }
      // Close all SSE clients to release sockets
      for (const res of logClients) { try { res.end() } catch {} }
      for (const res of dataClients) { try { res.end() } catch {} }
      logClients.clear()
      dataClients.clear()
    },
  }
}
