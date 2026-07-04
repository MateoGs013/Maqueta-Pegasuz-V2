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
const capturing = ref('')

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
  capturing.value = bp
  try { await api('capture', { breakpoint: bp }) } finally { capturing.value = '' }
}
</script>

<template>
  <div class="preview">
    <div class="preview-head">
      <span class="k-label bare">{{ store.pinMode ? 'pin mode · click sobre la captura' : 'preview vivo' }}</span>

      <div class="head-actions">
        <div class="seg">
          <button v-for="bp in ['mobile', 'tablet', 'desktop']" :key="bp"
                  class="seg-btn mono" :class="{ busy: capturing === bp }"
                  :title="`capturar ${bp}`" @click="refreshCapture(bp)">
            {{ bp === 'mobile' ? '◾ 375' : bp === 'tablet' ? '◾ 768' : '◾ 1440' }}
          </button>
        </div>
        <button :class="store.pinMode ? 'primary' : ''" @click="store.pinMode = !store.pinMode">
          {{ store.pinMode ? '✕  cerrar pins' : '⊕  pin mode' }}
        </button>
      </div>
    </div>

    <!-- Live iframe -->
    <div v-if="!store.pinMode" class="frame-wrap">
      <iframe v-if="store.project?.previewUrl" :src="store.project.previewUrl" class="frame" />
      <div v-else class="empty">
        <span class="empty-mark">E</span>
        <p class="dim">Sin proyecto activo.</p>
        <p class="mono empty-hint">abrí uno desde la barra superior — el preview vive acá</p>
      </div>
    </div>

    <!-- Pin mode: annotate the latest capture -->
    <div v-else class="frame-wrap annotate">
      <div v-if="selectedCapture" class="capture-stage">
        <img :src="`/captures/${selectedCapture.file}`" @click="clickImage" draggable="false" />
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
      <div v-else class="empty">
        <span class="empty-mark">◎</span>
        <p class="dim">Todavía no hay capturas.</p>
        <p class="mono empty-hint">sacá una con los botones de arriba — o esperá a que los ojos capturen solos</p>
      </div>

      <transition name="rise">
        <div v-if="pinDraft" class="pin-form">
          <input v-model="pinNote" placeholder="Qué querés que Eros cambie acá…" @keyup.enter="submitPin" @keyup.esc="pinDraft = null" autofocus />
          <button class="primary" @click="submitPin">Anclar</button>
          <button class="ghost" @click="pinDraft = null">✕</button>
        </div>
      </transition>
    </div>
  </div>
</template>

<style scoped>
.preview { display: flex; flex-direction: column; height: 100%; background: var(--bg-well); }
.preview-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 9px 16px;
  border-bottom: 1px solid var(--line);
  background: var(--bg-panel);
  flex-shrink: 0;
}
.head-actions { display: flex; gap: 10px; align-items: center; }

.seg { display: flex; border: 1px solid var(--line); border-radius: var(--r); overflow: hidden; }
.seg-btn {
  border: 0; border-radius: 0; padding: 5px 11px; font-size: 10px;
  border-right: 1px solid var(--line);
}
.seg-btn:last-child { border-right: 0; }
.seg-btn.busy { color: var(--accent); animation: dot-pulse 0.9s infinite; }

.frame-wrap { flex: 1; position: relative; min-height: 0; }
.frame { width: 100%; height: 100%; border: 0; background: #fff; display: block; }

.empty {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 8px; height: 100%; animation: fade-in 600ms var(--ease);
}
.empty-mark {
  font-size: 44px; font-weight: 850; font-stretch: 122%;
  color: var(--line); line-height: 1; margin-bottom: 8px;
}
.empty-hint { font-size: 10px; color: var(--text-faint); }

.annotate { overflow: auto; }
.capture-stage { position: relative; display: inline-block; min-width: 100%; }
.capture-stage img { width: 100%; display: block; cursor: crosshair; }

.pin {
  position: absolute; transform: translate(-50%, -50%);
  font-size: 16px; line-height: 1; cursor: help; user-select: none;
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.95);
  transition: transform 220ms var(--ease);
}
.pin:hover { transform: translate(-50%, -50%) scale(1.35); }
.pin.mine { color: var(--accent); }
.pin.mine.drained { opacity: 0.3; }
.pin.draft { color: var(--accent-bright); animation: dot-pulse 1s infinite; }
.pin.eros.low { color: var(--ok); }
.pin.eros.medium { color: var(--warn); }
.pin.eros.high { color: var(--danger); }

.pin-form {
  position: absolute; bottom: 16px; left: 16px; right: 16px;
  display: flex; gap: 8px;
  background: var(--bg-raise); border: 1px solid var(--accent-dim);
  border-radius: var(--r); padding: 10px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
}
.rise-enter-active { transition: all 300ms var(--ease); }
.rise-enter-from { opacity: 0; transform: translateY(10px); }
</style>
