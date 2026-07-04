<script setup>
import { computed, ref } from 'vue'
import { store, api } from './store.js'
import PreviewPane from './components/PreviewPane.vue'
import DecisionDock from './components/DecisionDock.vue'
import EyesStrip from './components/EyesStrip.vue'
import StatusBar from './components/StatusBar.vue'

const setupOpen = ref(false)
const projDir = ref('')
const previewUrl = ref('http://localhost:5173/')
const brief = ref('')
const busy = ref(false)
const setupError = ref('')

const sessionLabel = computed(() => ({
  idle: 'sesión inactiva',
  starting: 'arrancando…',
  working: 'trabajando',
  'waiting-decision': 'esperando tu decisión',
  error: 'error',
}[store.sessionStatus] || store.sessionStatus))

async function activateProject() {
  busy.value = true
  setupError.value = ''
  try {
    await api('project', { dir: projDir.value, previewUrl: previewUrl.value })
    setupOpen.value = false
  } catch (e) { setupError.value = e.message } finally { busy.value = false }
}

async function toggleSession() {
  busy.value = true
  setupError.value = ''
  try {
    if (store.sessionStatus === 'idle') await api('session/start', { brief: brief.value })
    else await api('session/stop', {})
  } catch (e) { setupError.value = e.message } finally { busy.value = false }
}
</script>

<template>
  <div class="shell">
    <header class="topbar">
      <div class="brand">
        <span class="brand-name">EROS</span>
        <span class="brand-sub mono">studio</span>
      </div>

      <div class="session-chip" :class="store.sessionStatus">
        <span class="dot" :class="{ on: store.sessionStatus === 'working', pulse: store.sessionStatus === 'waiting-decision' || store.sessionStatus === 'starting' }" />
        <span class="mono">{{ sessionLabel }}</span>
      </div>

      <div class="proj" v-if="store.project">
        <span class="proj-name">{{ store.project.name }}</span>
        <a class="mono dim proj-url" :href="store.project.previewUrl" target="_blank" rel="noopener">{{ store.project.previewUrl?.replace(/^https?:\/\//, '').replace(/\/$/, '') }}</a>
      </div>

      <div class="top-actions">
        <button class="ghost" @click="setupOpen = !setupOpen">{{ store.project ? 'proyecto' : 'abrir proyecto' }}</button>
        <button class="primary" :disabled="!store.project || busy" @click="toggleSession">
          {{ store.sessionStatus === 'idle' ? '▶  Iniciar sesión' : '■  Detener' }}
        </button>
      </div>
    </header>

    <transition name="drawer">
      <div v-if="setupOpen" class="setup">
        <div class="setup-grid">
          <div class="setup-row">
            <label class="k-label bare">directorio del proyecto</label>
            <input v-model="projDir" placeholder="C:\Users\mateo\Desktop\mi-proyecto" spellcheck="false" />
          </div>
          <div class="setup-row">
            <label class="k-label bare">dev server</label>
            <input v-model="previewUrl" spellcheck="false" />
          </div>
          <div class="setup-row wide">
            <label class="k-label bare">brief para la próxima sesión (opcional)</label>
            <textarea v-model="brief" rows="2" placeholder="Nuevo proyecto: … / instrucciones de arranque para Eros" />
          </div>
        </div>
        <div class="setup-actions">
          <button class="primary" :disabled="busy" @click="activateProject">Activar proyecto</button>
          <button class="ghost" @click="setupOpen = false">Cerrar</button>
          <span v-if="setupError" class="mono setup-err">{{ setupError }}</span>
        </div>
      </div>
    </transition>

    <main class="panels">
      <PreviewPane class="panel-preview" />
      <DecisionDock class="panel-dock" />
    </main>

    <EyesStrip class="strip" />
    <StatusBar class="status" />
  </div>
</template>

<style scoped>
.shell { display: flex; flex-direction: column; height: 100%; }

/* ------------------------------------------------------------ topbar */
.topbar {
  display: flex; align-items: center; gap: 22px;
  padding: 0 20px;
  height: 52px;
  border-bottom: 1px solid var(--line);
  background: var(--bg-panel);
  flex-shrink: 0;
}
.brand { display: flex; align-items: baseline; gap: 7px; }
.brand-name {
  font-weight: 850;
  font-stretch: 122%;
  letter-spacing: 0.26em;
  font-size: 16px;
  background: linear-gradient(100deg, var(--text) 55%, var(--accent) 130%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.brand-sub { font-size: 10px; color: var(--accent); letter-spacing: 0.18em; }

.session-chip {
  display: flex; align-items: center; gap: 8px;
  padding: 5px 12px;
  border: 1px solid var(--line-soft);
  border-radius: 999px;
  font-size: 10px;
  color: var(--text-dim);
  transition: border-color 400ms var(--ease);
}
.session-chip.working { border-color: var(--ok); }
.session-chip.waiting-decision { border-color: var(--accent); color: var(--accent); }
.session-chip.starting { border-color: var(--warn); }

.proj { display: flex; flex-direction: column; line-height: 1.25; min-width: 0; }
.proj-name { font-weight: 650; font-size: 13.5px; letter-spacing: 0.01em; }
.proj-url { font-size: 9.5px; text-decoration: none; }
.proj-url:hover { color: var(--accent); }

.top-actions { margin-left: auto; display: flex; gap: 10px; align-items: center; }

/* ------------------------------------------------------------ setup drawer */
.setup {
  padding: 18px 20px 16px;
  border-bottom: 1px solid var(--line);
  background: var(--bg-raise);
  overflow: hidden;
}
.setup-grid { display: grid; grid-template-columns: 1.6fr 1fr; gap: 14px 22px; }
.setup-row { display: flex; flex-direction: column; gap: 7px; }
.setup-row.wide { grid-column: span 2; }
.setup-actions { display: flex; align-items: center; gap: 12px; margin-top: 14px; }
.setup-err { color: var(--danger); font-size: 11px; }

.drawer-enter-active, .drawer-leave-active { transition: all 320ms var(--ease); }
.drawer-enter-from, .drawer-leave-to { opacity: 0; transform: translateY(-8px); }

/* ------------------------------------------------------------ layout */
.panels {
  flex: 1; display: grid; grid-template-columns: 1fr 404px;
  min-height: 0;
}
/* min-height: 0 on grid children — otherwise content forces the track taller
   than the viewport and inner overflow-y:auto never engages */
.panel-preview { border-right: 1px solid var(--line); min-width: 0; min-height: 0; }
.panel-dock { min-width: 0; min-height: 0; }

.strip { border-top: 1px solid var(--line); flex-shrink: 0; }
.status { border-top: 1px solid var(--line); flex-shrink: 0; }
</style>
