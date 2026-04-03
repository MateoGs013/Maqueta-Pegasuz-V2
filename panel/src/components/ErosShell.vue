<script setup>
import { nextTick, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  activeRunId,
  panelMeta,
  runCatalog,
} from '@/data/frontBrain.js'
import { useEros } from '@/composables/useEros.js'

const route = useRoute()
const router = useRouter()
const selectedRunId = ref(activeRunId.value)
const { logs, watchActive, startWatch, stopWatch, generateProjectCommand } = useEros()

const nav = [
  { to: '/eros', label: 'Resumen', exact: true },
  { to: '/eros/calidad', label: 'Calidad' },
  { to: '/eros/componentes', label: 'Componentes' },
  { to: '/eros/system', label: 'Sistema' },
  { to: '/eros/training', label: 'Training' },
]

const isActive = (item) => {
  if (item.exact) return route.path === item.to
  return route.path.startsWith(item.to)
}
const navTarget = (to) => ({ path: to, query: { run: activeRunId.value } })
const switchRun = () => {
  const url = new URL(window.location.href)
  url.searchParams.set('run', selectedRunId.value)
  window.location.assign(url.toString())
}

// ── Drawer: terminal + brief modal ──
const drawerOpen = ref(false)
const drawerTab = ref('terminal')
const logBox = ref(null)

const scrollLogs = () => {
  nextTick(() => { if (logBox.value) logBox.value.scrollTop = logBox.value.scrollHeight })
}

// Brief form
const brief = ref({ name: '', type: 'creative-studio', mood: '', scheme: 'dark', references: '' })
const briefCopied = ref(false)
const copyBrief = () => {
  const cmd = generateProjectCommand(brief.value)
  navigator.clipboard.writeText(cmd).then(() => {
    briefCopied.value = true
    setTimeout(() => { briefCopied.value = false }, 2000)
  })
}

// Keyboard shortcuts
const onKeydown = (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return
  const key = e.key
  if (key === '1') router.push(navTarget('/eros'))
  else if (key === '2') router.push(navTarget('/eros/calidad'))
  else if (key === '3') router.push(navTarget('/eros/componentes'))
  else if (key === '4') router.push(navTarget('/eros/system'))
  else if (key === '5') router.push(navTarget('/eros/training'))
  else if (key === 'r' || key === 'R') window.location.reload()
  else if (key === 't' || key === 'T') { drawerOpen.value = !drawerOpen.value; drawerTab.value = 'terminal' }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div class="shell" :class="{ 'drawer-open': drawerOpen }">
    <aside class="sidebar">
      <div class="sb-head">
        <span class="sb-logo">Pegasuz</span>
        <span class="sb-ver">EROS</span>
      </div>

      <div class="sb-run">
        <div class="sb-run-row">
          <span class="sb-score">{{ (panelMeta.finalScore ?? 0).toFixed(1) }}</span>
          <div class="sb-run-info">
            <h2 class="sb-name">{{ panelMeta.projectName }}</h2>
            <p class="sb-type">{{ panelMeta.projectType }}</p>
          </div>
        </div>
        <select v-model="selectedRunId" class="sb-select" @change="switchRun">
          <option v-for="run in runCatalog" :key="run.id" :value="run.id">{{ run.label }}</option>
        </select>
      </div>

      <nav class="sb-nav">
        <RouterLink v-for="(item, i) in nav" :key="item.to" :to="navTarget(item.to)" class="sb-link" :class="{ active: isActive(item) }">
          <span class="sb-idx">{{ String(i + 1).padStart(2, '0') }}</span>
          <span class="sb-label">{{ item.label }}</span>
        </RouterLink>
      </nav>

      <div class="sb-actions">
        <button class="sb-btn" @click="drawerOpen = !drawerOpen; drawerTab = 'terminal'">
          <span class="sb-btn-dot" :class="{ on: watchActive }"></span>
          Terminal
        </button>
        <button class="sb-btn" @click="drawerOpen = !drawerOpen; drawerTab = 'brief'">
          Nuevo proyecto
        </button>
      </div>

      <div class="sb-foot"><span>.claude/ — v6.1</span></div>
    </aside>

    <div class="main-area">
      <main class="main">
        <RouterView />
      </main>

      <!-- ── DRAWER ── -->
      <div v-if="drawerOpen" class="drawer">
        <div class="drawer-bar">
          <div class="drawer-tabs">
            <button class="dtab" :class="{ on: drawerTab === 'terminal' }" @click="drawerTab = 'terminal'">Terminal</button>
            <button class="dtab" :class="{ on: drawerTab === 'brief' }" @click="drawerTab = 'brief'">Nuevo proyecto</button>
          </div>
          <div class="drawer-controls">
            <button v-if="drawerTab === 'terminal'" class="sb-btn-sm" @click="watchActive ? stopWatch() : startWatch()">
              {{ watchActive ? 'Detener watch' : 'Iniciar watch' }}
            </button>
            <button class="sb-btn-sm" @click="drawerOpen = false">Cerrar</button>
          </div>
        </div>

        <!-- Terminal tab -->
        <div v-if="drawerTab === 'terminal'" ref="logBox" class="terminal" @vue:updated="scrollLogs">
          <div v-for="(log, i) in logs" :key="i" class="log-line" :class="`log--${log.type}`">
            <span class="log-ts">{{ new Date(log.ts).toLocaleTimeString() }}</span>
            <span class="log-text">{{ log.text }}</span>
          </div>
          <div v-if="!logs.length" class="log-empty">
            {{ watchActive ? 'Esperando actividad...' : 'Watch mode inactivo. Presiona "Iniciar watch".' }}
          </div>
        </div>

        <!-- Brief tab -->
        <div v-if="drawerTab === 'brief'" class="brief-form">
          <div class="brief-grid">
            <label class="bf">
              <span class="bf-label">Nombre</span>
              <input v-model="brief.name" class="bf-input" placeholder="Mi Proyecto" />
            </label>
            <label class="bf">
              <span class="bf-label">Tipo</span>
              <select v-model="brief.type" class="bf-input">
                <option value="creative-studio">Estudio creativo</option>
                <option value="saas-product">SaaS / Producto</option>
                <option value="portfolio">Portfolio</option>
                <option value="ecommerce">E-commerce</option>
                <option value="agency">Agencia</option>
                <option value="landing">Landing page</option>
              </select>
            </label>
            <label class="bf">
              <span class="bf-label">Mood</span>
              <input v-model="brief.mood" class="bf-input" placeholder="dark cinematic, brutalist..." />
            </label>
            <label class="bf">
              <span class="bf-label">Esquema</span>
              <select v-model="brief.scheme" class="bf-input">
                <option value="dark">Dark</option>
                <option value="light">Light</option>
                <option value="mixed">Mixed</option>
              </select>
            </label>
            <label class="bf bf--full">
              <span class="bf-label">URLs de referencia</span>
              <input v-model="brief.references" class="bf-input" placeholder="https://sitio1.com, https://sitio2.com" />
            </label>
          </div>
          <div class="brief-preview">
            <p class="bf-label">Comando para Claude Code:</p>
            <pre class="bf-code">{{ generateProjectCommand(brief) }}</pre>
            <button class="sb-btn" @click="copyBrief">{{ briefCopied ? 'Copiado al clipboard' : 'Copiar comando' }}</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.shell { display: flex; height: 100vh; width: 100vw; overflow: hidden; }

.sidebar {
  width: var(--sidebar-w);
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  background: var(--bg);
  border-right: 1px solid var(--line);
}

.sb-head { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid var(--line); }
.sb-logo { font: 700 14px var(--font-display); color: var(--text); letter-spacing: -0.03em; }
.sb-ver  { font: 600 9px var(--font-mono); color: var(--accent); letter-spacing: 0.14em; }

.sb-run { display: grid; gap: 10px; padding: 16px 20px; border-bottom: 1px solid var(--line); }
.sb-run-row { display: flex; align-items: center; gap: 12px; }
.sb-score { font: 700 28px var(--font-display); color: var(--accent); letter-spacing: -0.04em; line-height: 1; }
.sb-name  { font: 600 13px/1.2 var(--font-display); color: var(--text); }
.sb-type  { font: 400 10px var(--font-body); color: var(--text-muted); margin-top: 2px; }
.sb-select { width: 100%; padding: 6px 8px; border: 1px solid var(--line); background: var(--bg); color: var(--text-muted); font: 400 10px var(--font-mono); }

.sb-nav { flex: 1; display: flex; flex-direction: column; padding: 8px 0; }
.sb-link { display: flex; align-items: center; gap: 10px; padding: 11px 20px; text-decoration: none; color: var(--text-muted); border-left: 2px solid transparent; transition: color 120ms, background 120ms; }
.sb-link:hover { color: var(--text); background: var(--surface); }
.sb-link.active { color: var(--text); border-left-color: var(--accent); background: var(--accent-ember); }
.sb-link.active .sb-idx { color: var(--accent); }
.sb-idx { font: 500 9px var(--font-mono); color: var(--text-dim); letter-spacing: 0.1em; min-width: 18px; }
.sb-label { font: 500 13px var(--font-body); }

.sb-actions { display: grid; gap: 4px; padding: 8px 12px; }
.sb-btn {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 12px; border: 1px solid var(--line-strong); background: transparent;
  color: var(--text-muted); font: 600 9px var(--font-mono); letter-spacing: 0.06em; text-transform: uppercase;
  cursor: pointer; transition: color 150ms, border-color 150ms, background 150ms;
}
.sb-btn:hover { color: var(--accent); border-color: var(--line-accent); background: var(--accent-ember); }

.sb-btn-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--text-dim); flex-shrink: 0; }
.sb-btn-dot.on { background: var(--success); box-shadow: 0 0 6px var(--success-soft); }

.sb-btn-sm {
  padding: 4px 10px; border: 1px solid var(--line); background: transparent;
  color: var(--text-muted); font: 600 9px var(--font-mono); letter-spacing: 0.06em; text-transform: uppercase;
  cursor: pointer; transition: color 120ms;
}
.sb-btn-sm:hover { color: var(--text); }

.sb-foot { padding: 12px 20px; border-top: 1px solid var(--line); font: 400 9px var(--font-mono); color: var(--text-dim); }

.main-area { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
.main { flex: 1; overflow: hidden; display: flex; flex-direction: column; }

/* ── DRAWER ── */
.drawer {
  height: 280px;
  flex-shrink: 0;
  border-top: 1px solid var(--line-strong);
  background: var(--bg);
  display: flex;
  flex-direction: column;
}

.drawer-bar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 16px; border-bottom: 1px solid var(--line); flex-shrink: 0;
}
.drawer-tabs { display: flex; gap: 0; }
.drawer-controls { display: flex; gap: 6px; }

.dtab {
  padding: 5px 14px; border: 1px solid var(--line); background: transparent;
  color: var(--text-dim); font: 600 9px var(--font-mono); letter-spacing: 0.06em; text-transform: uppercase;
  cursor: pointer; margin-left: -1px; transition: color 120ms;
}
.dtab:first-child { margin-left: 0; }
.dtab:hover { color: var(--text-muted); }
.dtab.on { color: var(--accent); border-color: var(--line-accent); background: var(--accent-ember); z-index: 1; position: relative; }

/* ── Terminal ── */
.terminal {
  flex: 1; overflow-y: auto; padding: 12px 16px;
  font: 400 11px/1.6 var(--font-mono); color: var(--text-muted);
}
.log-line { display: flex; gap: 12px; padding: 2px 0; }
.log-ts { color: var(--text-dim); flex-shrink: 0; min-width: 72px; }
.log-text { color: var(--text-muted); word-break: break-all; }
.log--error .log-text { color: var(--error); }
.log--system .log-text { color: var(--accent); }
.log-empty { color: var(--text-dim); font-style: italic; padding: 20px 0; }

/* ── Brief form ── */
.brief-form { flex: 1; overflow-y: auto; padding: 16px; display: grid; gap: 16px; grid-template-columns: 1fr 1fr; align-content: start; }
.brief-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.bf { display: grid; gap: 4px; }
.bf--full { grid-column: 1 / -1; }
.bf-label { font: 500 9px var(--font-mono); color: var(--text-muted); letter-spacing: 0.1em; text-transform: uppercase; }
.bf-input { padding: 7px 10px; border: 1px solid var(--line); background: var(--bg); color: var(--text); font: 400 12px var(--font-body); }
.bf-input:focus { outline: none; border-color: var(--accent); }

.brief-preview { display: grid; gap: 10px; align-content: start; }
.bf-code {
  padding: 12px; border: 1px solid var(--line); background: var(--surface);
  font: 400 11px/1.6 var(--font-mono); color: var(--accent-hot); white-space: pre-wrap; word-break: break-all;
}

@media (max-width: 960px) {
  .shell { flex-direction: column; height: auto; min-height: 100vh; }
  .sidebar { width: 100%; border-right: 0; border-bottom: 1px solid var(--line); }
  .brief-form { grid-template-columns: 1fr; }
}
</style>
