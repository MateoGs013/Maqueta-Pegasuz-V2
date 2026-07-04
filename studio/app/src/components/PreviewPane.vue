<script setup>
import { computed, ref } from 'vue'
import { store, api } from '../store.js'

/**
 * Live iframe of the project's dev server, plus PIN MODE: annotation happens on
 * the latest capture (own-origin image), not the cross-origin iframe — the
 * tldraw "draw on top" pattern. Eros's critique pins render on the same layer.
 */

const selectedCapture = computed(() =>
  store.captures.find((c) => c.id === store.selectedCaptureId) || store.captures[0] || null)

const critiquesForCapture = computed(() =>
  store.critiques.filter((c) => c.captureId === selectedCapture.value?.id || c.capture_id === selectedCapture.value?.id))

const pinDraft = ref(null) // {x, y} fractions
const pinNote = ref('')
const imgEl = ref(null)

function clickImage(ev) {
  if (!store.pinMode) return
  const rect = ev.target.getBoundingClientRect()
  pinDraft.value = {
    x: +((ev.clientX - rect.left) / rect.width).toFixed(4),
    y: +((ev.clientY - rect.top) / rect.height).toFixed(4),
  }
  pinNote.value = ''
}

async function submitPin() {
  if (!pinDraft.value || !pinNote.value.trim()) return
  await api('feedback', {
    captureId: selectedCapture.value?.id || null,
    x: pinDraft.value.x, y: pinDraft.value.y,
    note: pinNote.value.trim(),
  })
  pinDraft.value = null
  pinNote.value = ''
}

const myPins = computed(() =>
  store.feedback.filter((f) => f.captureId === selectedCapture.value?.id))

async function refreshCapture(bp) {
  await api('capture', { breakpoint: bp })
}
</script>

<template>
  <div class="preview">
    <div class="preview-head">
      <span class="k-label">{{ store.pinMode ? 'pin mode — click sobre la captura' : 'preview vivo' }}</span>
      <div class="head-actions">
        <button v-for="bp in ['mobile', 'tablet', 'desktop']" :key="bp" class="mono" @click="refreshCapture(bp)">
          📷 {{ bp }}
        </button>
        <button :class="{ primary: store.pinMode }" @click="store.pinMode = !store.pinMode">
          {{ store.pinMode ? '✕ salir de pin mode' : '📌 pin mode' }}
        </button>
      </div>
    </div>

    <!-- Live iframe -->
    <div v-if="!store.pinMode" class="frame-wrap">
      <iframe v-if="store.project?.previewUrl" :src="store.project.previewUrl" class="frame" />
      <div v-else class="empty dim">Sin proyecto activo. Abrí uno arriba.</div>
    </div>

    <!-- Pin mode: annotate the latest capture -->
    <div v-else class="frame-wrap annotate">
      <div v-if="selectedCapture" class="capture-stage">
        <img ref="imgEl" :src="`/captures/${selectedCapture.file}`" @click="clickImage" draggable="false" />
        <!-- Eros critique pins -->
        <template v-for="crit in critiquesForCapture" :key="crit.id">
          <div v-for="(pin, i) in crit.pins" :key="i"
               class="pin eros" :class="pin.severity"
               :style="{ left: `${pin.x * 100}%`, top: `${pin.y * 100}%` }"
               :title="`[Eros · ${pin.severity}] ${pin.note}`">◆</div>
        </template>
        <!-- Mateo pins -->
        <div v-for="pin in myPins" :key="pin.id"
             class="pin mine" :class="{ drained: pin.drainedAt }"
             :style="{ left: `${pin.x * 100}%`, top: `${pin.y * 100}%` }"
             :title="pin.note">●</div>
        <!-- Draft -->
        <div v-if="pinDraft" class="pin draft" :style="{ left: `${pinDraft.x * 100}%`, top: `${pinDraft.y * 100}%` }">●</div>
      </div>
      <div v-else class="empty dim">Todavía no hay capturas. Sacá una con 📷.</div>

      <div v-if="pinDraft" class="pin-form">
        <input v-model="pinNote" placeholder="Qué querés que Eros cambie acá…" @keyup.enter="submitPin" autofocus />
        <button class="primary" @click="submitPin">Anclar</button>
        <button @click="pinDraft = null">Cancelar</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.preview { display: flex; flex-direction: column; height: 100%; }
.preview-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 14px; border-bottom: 1px solid var(--line);
}
.head-actions { display: flex; gap: 8px; }

.frame-wrap { flex: 1; position: relative; min-height: 0; background: #060708; }
.frame { width: 100%; height: 100%; border: 0; background: #fff; }
.empty { display: grid; place-items: center; height: 100%; }

.annotate { overflow: auto; }
.capture-stage { position: relative; display: inline-block; min-width: 100%; }
.capture-stage img { width: 100%; display: block; cursor: crosshair; }

.pin {
  position: absolute; transform: translate(-50%, -50%);
  font-size: 15px; line-height: 1; cursor: help; user-select: none;
  text-shadow: 0 1px 4px rgba(0,0,0,0.9);
}
.pin.mine { color: var(--accent); }
.pin.mine.drained { opacity: 0.35; }
.pin.draft { color: var(--accent); animation: pulse 1s infinite; }
.pin.eros.low { color: var(--ok); }
.pin.eros.medium { color: var(--warn); }
.pin.eros.high { color: var(--danger); }

@keyframes pulse { 50% { opacity: 0.4; } }

.pin-form {
  position: absolute; bottom: 14px; left: 14px; right: 14px;
  display: flex; gap: 8px;
  background: var(--bg-raise); border: 1px solid var(--line);
  border-radius: var(--r); padding: 10px;
}
</style>
