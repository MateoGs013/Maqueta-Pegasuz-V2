<script setup>
import { ref } from 'vue'
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
        <span class="brand-name">EROS</span><span class="brand-sub">studio</span>
      </div>
      <div class="proj" v-if="store.project">
        <span class="k-label">proyecto</span>
        <span class="mono">{{ store.project.name }}</span>
      </div>
      <div class="top-actions">
        <button @click="setupOpen = !setupOpen">{{ store.project ? 'Cambiar proyecto' : 'Abrir proyecto' }}</button>
        <button class="primary" :disabled="!store.project || busy" @click="toggleSession">
          {{ store.sessionStatus === 'idle' ? '▶ Iniciar sesión Eros' : '■ Detener sesión' }}
        </button>
      </div>
    </header>

    <div v-if="setupOpen" class="setup">
      <div class="setup-row">
        <label class="k-label">Directorio del proyecto</label>
        <input v-model="projDir" placeholder="C:\Users\mateo\Desktop\extra" />
      </div>
      <div class="setup-row">
        <label class="k-label">URL del dev server</label>
        <input v-model="previewUrl" />
      </div>
      <div class="setup-row">
        <label class="k-label">Brief (opcional, para sesión nueva)</label>
        <textarea v-model="brief" rows="2" placeholder="Nuevo proyecto: ..." />
      </div>
      <div class="setup-row actions">
        <button class="primary" :disabled="busy" @click="activateProject">Activar</button>
        <span v-if="setupError" class="mono" style="color: var(--danger)">{{ setupError }}</span>
      </div>
    </div>

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

.topbar {
  display: flex; align-items: center; gap: 24px;
  padding: 10px 18px;
  border-bottom: 1px solid var(--line);
  background: var(--bg-panel);
}
.brand { display: flex; align-items: baseline; gap: 6px; }
.brand-name {
  font-weight: 800; letter-spacing: 0.22em; font-size: 15px;
  font-stretch: 125%;
}
.brand-sub { font-family: var(--font-mono); font-size: 11px; color: var(--accent); }
.proj { display: flex; align-items: baseline; gap: 10px; }
.top-actions { margin-left: auto; display: flex; gap: 10px; }

.setup {
  padding: 14px 18px; border-bottom: 1px solid var(--line);
  display: grid; grid-template-columns: 2fr 1.2fr; gap: 12px 20px;
  background: var(--bg-raise);
}
.setup-row { display: flex; flex-direction: column; gap: 5px; }
.setup-row.actions { flex-direction: row; align-items: center; gap: 12px; grid-column: span 2; }

.panels {
  flex: 1; display: grid; grid-template-columns: 1fr 380px;
  min-height: 0;
}
.panel-preview { border-right: 1px solid var(--line); min-width: 0; }
.panel-dock { min-width: 0; }

.strip { border-top: 1px solid var(--line); }
.status { border-top: 1px solid var(--line); }
</style>
