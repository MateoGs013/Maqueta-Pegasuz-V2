import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const componentsDir = path.resolve(__dirname, '..', '_components')
const backupDir = path.resolve(componentsDir, '.workshop-backup')

const ALLOWED_EXT = new Set(['.css', '.vue', '.js', '.json'])

// Validate that resolved path is inside _components/ and has allowed extension
function safePath(relPath) {
  if (!relPath) return null
  const resolved = path.resolve(componentsDir, relPath)
  if (!resolved.startsWith(componentsDir + path.sep) && resolved !== componentsDir) return null
  if (!ALLOWED_EXT.has(path.extname(resolved))) return null
  return resolved
}

// Read POST body as JSON
function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (c) => chunks.push(c))
    req.on('end', () => {
      try { resolve(JSON.parse(Buffer.concat(chunks).toString())) }
      catch (e) { reject(e) }
    })
    req.on('error', reject)
  })
}

export default function workshopPlugin() {
  return {
    name: 'vite-plugin-workshop',

    configureServer(server) {
      // GET /__workshop/read?path=tokens.css
      server.middlewares.use('/__workshop/read', async (req, res, next) => {
        if (req.method !== 'GET') return next()
        const url = new URL(req.url, 'http://localhost')
        const relPath = url.searchParams.get('path')
        const absPath = safePath(relPath)
        if (!absPath) {
          res.writeHead(400, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Invalid path' }))
          return
        }
        try {
          const content = await fs.readFile(absPath, 'utf8')
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ path: relPath, content }))
        } catch (e) {
          res.writeHead(404, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'File not found', detail: e.message }))
        }
      })

      // POST /__workshop/write  { path, content }
      server.middlewares.use('/__workshop/write', async (req, res, next) => {
        if (req.method !== 'POST') return next()
        let body
        try { body = await readBody(req) } catch {
          res.writeHead(400, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Invalid JSON body' }))
          return
        }
        const absPath = safePath(body.path)
        if (!absPath || typeof body.content !== 'string') {
          res.writeHead(400, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Invalid path or content' }))
          return
        }
        try {
          // Backup before overwriting
          await fs.mkdir(backupDir, { recursive: true })
          try {
            const original = await fs.readFile(absPath, 'utf8')
            const ts = new Date().toISOString().replace(/[:.]/g, '-')
            const backupName = `${body.path.replace(/[\\/]/g, '__')}.${ts}.bak`
            await fs.writeFile(path.join(backupDir, backupName), original)
          } catch { /* file didn't exist yet — no backup needed */ }

          // Write new content
          await fs.mkdir(path.dirname(absPath), { recursive: true })
          await fs.writeFile(absPath, body.content, 'utf8')
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ ok: true, path: body.path }))
        } catch (e) {
          res.writeHead(500, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Write failed', detail: e.message }))
        }
      })

      // GET /__workshop/list — list all .vue files in heroes/ and navs/
      server.middlewares.use('/__workshop/list', async (req, res, next) => {
        if (req.method !== 'GET') return next()
        try {
          const results = []
          for (const category of ['heroes', 'navs']) {
            const dir = path.join(componentsDir, category)
            let entries
            try { entries = await fs.readdir(dir) } catch { continue }
            for (const file of entries) {
              if (!file.endsWith('.vue')) continue
              results.push({
                path: `${category}/${file}`,
                name: file.replace('.vue', ''),
                category,
              })
            }
          }
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify(results))
        } catch (e) {
          res.writeHead(500, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'List failed', detail: e.message }))
        }
      })

      // GET /__workshop/backups — list backup files
      server.middlewares.use('/__workshop/backups', async (req, res, next) => {
        if (req.method !== 'GET') return next()
        try {
          await fs.mkdir(backupDir, { recursive: true })
          const files = await fs.readdir(backupDir)
          const backups = files
            .filter((f) => f.endsWith('.bak'))
            .map((f) => {
              const parts = f.replace('.bak', '').split('.')
              const ts = parts.pop()
              const filePath = parts.join('.').replace(/__/g, '/')
              return { file: f, originalPath: filePath, timestamp: ts }
            })
            .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
            .slice(0, 50)
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify(backups))
        } catch (e) {
          res.writeHead(500, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Backup list failed', detail: e.message }))
        }
      })

      // POST /__workshop/create  { category: 'heroes'|'navs', name: 'S-MyComponent' }
      server.middlewares.use('/__workshop/create', async (req, res, next) => {
        if (req.method !== 'POST') return next()
        let body
        try { body = await readBody(req) } catch {
          res.writeHead(400, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Invalid JSON body' }))
          return
        }
        const { category, name } = body
        if (!['heroes', 'navs'].includes(category) || !name || !/^[SN]-[\w-]+$/.test(name)) {
          res.writeHead(400, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Invalid category or name. Name must match S-Name or N-Name.' }))
          return
        }
        const filePath = path.join(componentsDir, category, `${name}.vue`)
        try {
          await fs.access(filePath)
          res.writeHead(409, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Component already exists' }))
          return
        } catch { /* does not exist — good */ }

        const prefix = category === 'heroes' ? 'S' : 'N'
        const optionsName = name.replace(/^[SN]-/, '').replace(/-/g, '')
        const template = `<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { gsap } from 'gsap'

defineOptions({ name: '${prefix}${optionsName}' })

const props = defineProps({
  headline: { type: String, default: '${name}' },
  description: { type: String, default: 'New component description.' },
})

const sectionRef = ref(null)
let ctx = null

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  ctx = gsap.context(() => {
    gsap.from('.content', { autoAlpha: 0, y: 40, duration: 0.8, ease: 'power3.out' })
  }, sectionRef.value)
})

onBeforeUnmount(() => ctx?.revert())
</script>

<template>
  <section ref="sectionRef" class="section">
    <div class="content">
      <h1 class="headline">{{ headline }}</h1>
      <p class="description">{{ description }}</p>
    </div>
  </section>
</template>

<style scoped>
.section {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-section-y) var(--space-section-x);
  background: var(--color-canvas);
}

.content {
  max-width: 640px;
  display: grid;
  gap: var(--space-gap);
  text-align: center;
}

.headline {
  font: 700 var(--text-display)/1.05 var(--font-display);
  color: var(--color-text);
  letter-spacing: var(--tracking-tight);
}

.description {
  font: 400 var(--text-body-lg)/1.6 var(--font-body);
  color: var(--color-text-muted);
}
</style>
`
        try {
          await fs.writeFile(filePath, template, 'utf8')
          res.writeHead(201, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ ok: true, path: `${category}/${name}.vue`, name }))
        } catch (e) {
          res.writeHead(500, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Create failed', detail: e.message }))
        }
      })

      // POST /__workshop/delete  { path: 'heroes/S-MyComponent.vue' }
      server.middlewares.use('/__workshop/delete', async (req, res, next) => {
        if (req.method !== 'POST') return next()
        let body
        try { body = await readBody(req) } catch {
          res.writeHead(400, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Invalid JSON body' }))
          return
        }
        const absPath = safePath(body.path)
        if (!absPath) {
          res.writeHead(400, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Invalid path' }))
          return
        }
        try {
          // Backup before deleting
          await fs.mkdir(backupDir, { recursive: true })
          const content = await fs.readFile(absPath, 'utf8')
          const ts = new Date().toISOString().replace(/[:.]/g, '-')
          const backupName = `${body.path.replace(/[\\/]/g, '__')}.${ts}.deleted.bak`
          await fs.writeFile(path.join(backupDir, backupName), content)

          await fs.unlink(absPath)
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ ok: true, path: body.path }))
        } catch (e) {
          res.writeHead(500, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Delete failed', detail: e.message }))
        }
      })
    },
  }
}
