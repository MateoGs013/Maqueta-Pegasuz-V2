<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useWorkshopStaging } from '@/composables/useWorkshopStaging.js'
import { parseTokens, applyTokenChanges, buildOverrideCSS } from '@/composables/useTokenParser.js'

const FILE_PATH = 'tokens.css'
const staging = useWorkshopStaging()

// ── State ──
const groups = ref([])
const changes = ref(new Map())       // tokenName → newValue
const previewComponent = ref('S-AmbientAtmosphere')
const previewIframe = ref(null)
const loading = ref(true)
const collapsedGroups = ref(new Set())
const search = ref('')

// ── Component list for preview selector ──
const componentList = ref([])

// ── Load tokens ──
onMounted(async () => {
  try {
    const entry = await staging.stageFile(FILE_PATH, 'tokens')
    groups.value = parseTokens(entry.draftContent)

    const res = await fetch('/__workshop/list')
    if (res.ok) componentList.value = await res.json()
  } catch (e) {
    console.error('Failed to load tokens:', e)
  } finally {
    loading.value = false
  }
})

// ── Filtered groups ──
const filteredGroups = computed(() => {
  const q = search.value.toLowerCase()
  if (!q) return groups.value
  return groups.value
    .map((g) => ({
      ...g,
      tokens: g.tokens.filter((t) =>
        t.name.toLowerCase().includes(q) ||
        t.comment.toLowerCase().includes(q) ||
        t.value.toLowerCase().includes(q)
      ),
    }))
    .filter((g) => g.tokens.length > 0)
})

// ── Token editing ──
function currentValue(token) {
  return changes.value.get(token.name) ?? token.value
}

function updateToken(token, newValue) {
  const fresh = new Map(changes.value)
  if (newValue === token.value) {
    fresh.delete(token.name)
  } else {
    fresh.set(token.name, newValue)
  }
  changes.value = fresh
}

// ── Sync changes to staging layer ──
watch(changes, (ch) => {
  const entry = staging.getStaged(FILE_PATH)
  if (!entry) return
  if (ch.size === 0) {
    staging.updateDraft(FILE_PATH, entry.originalContent)
  } else {
    staging.updateDraft(FILE_PATH, applyTokenChanges(entry.originalContent, ch))
  }
}, { deep: true })

// ── Inject CSS overrides into iframe ──
watch(changes, () => {
  nextTick(injectOverrides)
}, { deep: true })

function injectOverrides() {
  const iframe = previewIframe.value
  if (!iframe?.contentDocument) return
  try {
    let styleEl = iframe.contentDocument.getElementById('workshop-overrides')
    if (!styleEl) {
      styleEl = iframe.contentDocument.createElement('style')
      styleEl.id = 'workshop-overrides'
      iframe.contentDocument.head.appendChild(styleEl)
    }
    styleEl.textContent = buildOverrideCSS(changes.value)
  } catch { /* cross-origin guard */ }
}

function onIframeLoad() {
  injectOverrides()
}

// ── Group toggle ──
function toggleGroup(id) {
  const s = new Set(collapsedGroups.value)
  s.has(id) ? s.delete(id) : s.add(id)
  collapsedGroups.value = s
}

// ── Counts ──
const changeCount = computed(() => changes.value.size)
const previewSrc = computed(() => `/?preview=${previewComponent.value}`)

// ── Reset all changes ──
function resetAll() {
  changes.value = new Map()
}

// ── Import / Export ──
function exportTokens() {
  const data = {}
  for (const group of groups.value) {
    for (const token of group.tokens) {
      data[token.name] = currentValue(token)
    }
  }
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'tokens.json'
  a.click()
  URL.revokeObjectURL(url)
}

function importTokens() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      const fresh = new Map(changes.value)
      let count = 0
      for (const group of groups.value) {
        for (const token of group.tokens) {
          if (token.name in data && data[token.name] !== token.value) {
            fresh.set(token.name, data[token.name])
            count++
          }
        }
      }
      changes.value = fresh
      if (count) alert(`Importados ${count} tokens.`)
      else alert('No se encontraron cambios en el archivo.')
    } catch {
      alert('Error al leer el archivo JSON.')
    }
  }
  input.click()
}

// ── Color helpers ──
function rgbaToHex(rgba) {
  const m = rgba.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/)
  if (!m) return '#000000'
  const r = Number(m[1]).toString(16).padStart(2, '0')
  const g = Number(m[2]).toString(16).padStart(2, '0')
  const b = Number(m[3]).toString(16).padStart(2, '0')
  return `#${r}${g}${b}`
}

function colorPickerValue(val) {
  if (val.startsWith('#')) return val.length <= 7 ? val : val.slice(0, 7)
  if (val.startsWith('rgb')) return rgbaToHex(val)
  return '#000000'
}

function updateColorFromPicker(token, hex) {
  const val = currentValue(token)
  // If original was rgba, keep rgba format and replace the color
  const rgbaMatch = val.match(/^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*([\d.]+)\s*\)$/)
  if (rgbaMatch) {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    updateToken(token, `rgba(${r}, ${g}, ${b}, ${rgbaMatch[1]})`)
  } else {
    updateToken(token, hex)
  }
}

// ── Clamp helpers ──
function parseClamp(val) {
  const m = val.match(/^clamp\(\s*(.+?)\s*,\s*(.+?)\s*,\s*(.+?)\s*\)$/)
  if (!m) return null
  return { min: m[1].trim(), preferred: m[2].trim(), max: m[3].trim() }
}

function updateClampPart(token, part, newVal) {
  const c = parseClamp(currentValue(token))
  if (!c) return
  c[part] = newVal
  updateToken(token, `clamp(${c.min}, ${c.preferred}, ${c.max})`)
}

// ── Dimension helpers ──
function parseDimension(val) {
  const m = val.match(/^(-?\d+(?:\.\d+)?)(px|em|rem|vw|vh|%|s|ms|deg)?$/)
  if (!m) return null
  return { num: parseFloat(m[1]), unit: m[2] || '' }
}

function dimSliderMax(token) {
  const d = parseDimension(token.value)
  if (!d) return 100
  if (d.unit === 'px') return Math.max(d.num * 3, 200)
  if (d.unit === 's' || d.unit === 'ms') return d.unit === 's' ? 5 : 3000
  if (d.unit === 'em' || d.unit === 'rem') return 10
  return Math.max(d.num * 3, 100)
}

function dimSliderStep(token) {
  const d = parseDimension(token.value)
  if (!d) return 1
  if (d.unit === 'px') return 1
  if (d.unit === 'em' || d.unit === 'rem') return 0.05
  if (d.unit === 's') return 0.05
  if (d.unit === 'ms') return 10
  return 1
}

function updateDimFromSlider(token, numVal) {
  const d = parseDimension(currentValue(token))
  if (!d) return
  updateToken(token, `${numVal}${d.unit}`)
}

// ── Palette overview ──
const paletteTokens = computed(() => {
  const colors = []
  for (const group of groups.value) {
    for (const token of group.tokens) {
      if (token.type === 'color') {
        colors.push({ ...token, currentVal: currentValue(token), modified: changes.value.has(token.name) })
      }
    }
  }
  return colors
})
const showPalette = ref(true)

function scrollToToken(name) {
  const el = document.querySelector(`[data-token="${name}"]`)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    el.classList.add('flash')
    setTimeout(() => el.classList.remove('flash'), 800)
  }
}
</script>

<template>
  <div class="editor-shell">
    <!-- ── LEFT: Token groups ── -->
    <div class="token-col">
      <div class="token-head">
        <input v-model="search" class="token-search" type="search" placeholder="Buscar token..." aria-label="Buscar tokens" />
        <span v-if="changeCount" class="change-badge">{{ changeCount }}</span>
      </div>

      <!-- Palette overview -->
      <div v-if="!loading && paletteTokens.length" class="palette-section">
        <button class="palette-toggle" @click="showPalette = !showPalette">
          <span class="group-arrow" :class="{ collapsed: !showPalette }">&#9662;</span>
          <span class="palette-label">Paleta</span>
          <span class="group-count">{{ paletteTokens.length }}</span>
        </button>
        <div v-if="showPalette" class="palette-grid">
          <button
            v-for="c in paletteTokens"
            :key="c.name"
            class="palette-swatch"
            :class="{ modified: c.modified }"
            :style="{ background: c.currentVal }"
            :title="`${c.name}\n${c.currentVal}`"
            @click="scrollToToken(c.name)"
          >
            <span class="palette-swatch-ring" :class="{ modified: c.modified }"></span>
          </button>
        </div>
      </div>

      <div v-if="loading" class="token-loading">Cargando tokens...</div>

      <div v-else class="token-scroll">
        <div v-for="group in filteredGroups" :key="group.id" class="group">
          <button class="group-head" @click="toggleGroup(group.id)">
            <span class="group-arrow" :class="{ collapsed: collapsedGroups.has(group.id) }">&#9662;</span>
            <span class="group-label">{{ group.label }}</span>
            <span class="group-count">{{ group.tokens.length }}</span>
          </button>

          <div v-if="!collapsedGroups.has(group.id)" class="group-tokens">
            <div v-for="token in group.tokens" :key="token.name" :data-token="token.name" class="token-row" :class="{ modified: changes.has(token.name) }">
              <div class="token-info">
                <span class="token-name">{{ token.name }}</span>
                <span v-if="token.comment" class="token-comment">{{ token.comment }}</span>
              </div>

              <div class="token-control">
                <!-- Color (hex, rgba, hsla) -->
                <template v-if="token.type === 'color'">
                  <input
                    type="color"
                    :value="colorPickerValue(currentValue(token))"
                    class="color-picker"
                    @input="updateColorFromPicker(token, $event.target.value)"
                  />
                  <input
                    type="text"
                    :value="currentValue(token)"
                    class="token-input token-input--color"
                    @change="updateToken(token, $event.target.value)"
                  />
                  <span class="color-swatch" :style="{ background: currentValue(token) }"></span>
                </template>

                <!-- Dimension with slider -->
                <template v-else-if="token.type === 'dimension' || token.type === 'number'">
                  <input
                    v-if="parseDimension(currentValue(token))"
                    type="range"
                    :value="parseDimension(currentValue(token))?.num ?? 0"
                    :min="0"
                    :max="dimSliderMax(token)"
                    :step="dimSliderStep(token)"
                    class="token-slider"
                    @input="updateDimFromSlider(token, $event.target.value)"
                  />
                  <input
                    type="text"
                    :value="currentValue(token)"
                    class="token-input token-input--dim"
                    @change="updateToken(token, $event.target.value)"
                  />
                </template>

                <!-- Clamp — three sub-inputs -->
                <template v-else-if="token.type === 'clamp'">
                  <div v-if="parseClamp(currentValue(token))" class="clamp-row">
                    <input
                      type="text"
                      :value="parseClamp(currentValue(token)).min"
                      class="token-input token-input--clamp"
                      placeholder="min"
                      @change="updateClampPart(token, 'min', $event.target.value)"
                    />
                    <input
                      type="text"
                      :value="parseClamp(currentValue(token)).preferred"
                      class="token-input token-input--clamp"
                      placeholder="pref"
                      @change="updateClampPart(token, 'preferred', $event.target.value)"
                    />
                    <input
                      type="text"
                      :value="parseClamp(currentValue(token)).max"
                      class="token-input token-input--clamp"
                      placeholder="max"
                      @change="updateClampPart(token, 'max', $event.target.value)"
                    />
                  </div>
                  <input
                    v-else
                    type="text"
                    :value="currentValue(token)"
                    class="token-input token-input--wide"
                    @change="updateToken(token, $event.target.value)"
                  />
                </template>

                <!-- Font / Easing / everything else -->
                <template v-else>
                  <input
                    type="text"
                    :value="currentValue(token)"
                    class="token-input token-input--wide"
                    @change="updateToken(token, $event.target.value)"
                  />
                </template>

                <!-- Reset button for modified tokens -->
                <button v-if="changes.has(token.name)" class="token-reset" title="Revertir" @click="updateToken(token, token.value)">&#10005;</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── RIGHT: Preview ── -->
    <div class="preview-col">
      <div class="preview-bar">
        <select v-model="previewComponent" class="preview-select">
          <option v-for="c in componentList" :key="c.name" :value="c.name">{{ c.name }}</option>
        </select>
        <div class="preview-bar-right">
          <span v-if="changeCount" class="body-sm" style="color: var(--warn)">{{ changeCount }} cambio{{ changeCount > 1 ? 's' : '' }}</span>
          <button class="io-btn" @click="importTokens" title="Importar JSON">Import</button>
          <button class="io-btn" @click="exportTokens" title="Exportar JSON">Export</button>
          <button v-if="changeCount" class="reset-btn" @click="resetAll">Reset</button>
        </div>
      </div>
      <div class="preview-frame">
        <iframe
          ref="previewIframe"
          :src="previewSrc"
          :key="previewComponent"
          title="Token preview"
          @load="onIframeLoad"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.editor-shell { display: flex; flex: 1; min-height: 0; overflow: hidden; }

/* ── TOKEN COLUMN ── */
.token-col {
  width: 420px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--line);
  background: var(--bg);
}

.token-head {
  display: flex; align-items: center; gap: 8px;
  padding: 12px; border-bottom: 1px solid var(--line); flex-shrink: 0;
}
.token-search {
  flex: 1; padding: 7px 10px; border: 1px solid var(--line); background: var(--bg);
  color: var(--text); font: 400 12px var(--font-body);
}
.token-search:focus { outline: none; border-color: var(--info); }
.token-search::-webkit-search-cancel-button { display: none; }

.change-badge {
  padding: 2px 8px; background: var(--warn-soft); color: var(--warn);
  font: 700 10px var(--font-mono); border-radius: 99px;
}

/* ── Palette overview ── */
.palette-section { border-bottom: 1px solid var(--line); }
.palette-toggle {
  display: flex; align-items: center; gap: 8px; width: 100%;
  padding: 8px 12px; background: transparent; border: 0;
  color: var(--text-muted); cursor: pointer;
}
.palette-toggle:hover { background: var(--surface); }
.palette-label {
  font: 500 10px var(--font-mono); letter-spacing: 0.08em; text-transform: uppercase;
  flex: 1; text-align: left;
}
.palette-grid {
  display: flex; flex-wrap: wrap; gap: 3px;
  padding: 4px 12px 10px;
}
.palette-swatch {
  width: 24px; height: 24px; border: 1px solid var(--line-strong);
  cursor: pointer; position: relative; transition: transform 100ms;
  padding: 0;
}
.palette-swatch:hover { transform: scale(1.3); z-index: 2; }
.palette-swatch.modified { border-color: var(--warn); }
.palette-swatch-ring {
  display: none; position: absolute; inset: -3px;
  border: 2px solid var(--warn); pointer-events: none;
}
.palette-swatch.modified .palette-swatch-ring { display: block; }

/* ── Flash animation for scrollToToken ── */
@keyframes token-flash {
  0% { background: var(--info-soft); }
  100% { background: transparent; }
}
.token-row.flash { animation: token-flash 0.8s ease; }

.token-loading {
  padding: 40px 16px; color: var(--text-dim);
  font: 400 11px var(--font-mono); text-align: center;
}

.token-scroll { flex: 1; overflow-y: auto; }

/* ── Groups ── */
.group { border-bottom: 1px solid var(--line); }

.group-head {
  display: flex; align-items: center; gap: 8px; width: 100%;
  padding: 10px 12px; background: transparent; border: 0;
  color: var(--text-muted); cursor: pointer; transition: background 100ms;
}
.group-head:hover { background: var(--surface); }

.group-arrow {
  font-size: 10px; color: var(--text-dim); transition: transform 200ms;
  width: 14px; text-align: center;
}
.group-arrow.collapsed { transform: rotate(-90deg); }

.group-label {
  font: 500 10px var(--font-mono); letter-spacing: 0.08em; text-transform: uppercase;
  flex: 1; text-align: left;
}
.group-count { font: 400 10px var(--font-mono); color: var(--text-dim); }

/* ── Token rows ── */
.group-tokens { padding: 0 0 8px; }

.token-row {
  display: grid; gap: 4px;
  padding: 6px 12px 6px 34px;
  transition: background 100ms;
}
.token-row:hover { background: var(--surface); }
.token-row.modified { background: var(--warn-soft); }

.token-info { display: flex; align-items: baseline; gap: 8px; min-width: 0; }
.token-name {
  font: 500 11px var(--font-mono); color: var(--text);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.token-comment {
  font: 400 10px var(--font-body); color: var(--text-dim);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

.token-control { display: flex; align-items: center; gap: 6px; }

.token-input {
  flex: 1; min-width: 0; padding: 4px 8px;
  border: 1px solid var(--line); background: var(--bg);
  color: var(--text-muted); font: 400 11px var(--font-mono);
}
.token-input:focus { outline: none; border-color: var(--info); color: var(--text); }
.token-input--color { max-width: 140px; }
.token-input--dim { max-width: 100px; }
.token-input--wide { max-width: none; }
.token-input--clamp { max-width: none; min-width: 0; }

.color-swatch {
  width: 16px; height: 16px; flex-shrink: 0;
  border: 1px solid var(--line-strong); border-radius: 2px;
}

.clamp-row { display: flex; gap: 4px; flex: 1; min-width: 0; }

.token-slider {
  flex: 1; min-width: 60px; height: 4px;
  accent-color: var(--info);
  cursor: pointer;
}

.color-picker {
  width: 28px; height: 28px; border: 1px solid var(--line);
  background: transparent; cursor: pointer; padding: 0; flex-shrink: 0;
}
.color-picker::-webkit-color-swatch-wrapper { padding: 2px; }
.color-picker::-webkit-color-swatch { border: 0; border-radius: 2px; }

.token-reset {
  width: 20px; height: 20px; display: flex; align-items: center; justify-content: center;
  border: 0; background: transparent; color: var(--text-dim); cursor: pointer;
  font-size: 10px; flex-shrink: 0; transition: color 100ms;
}
.token-reset:hover { color: var(--error); }

/* ── PREVIEW COLUMN ── */
.preview-col {
  flex: 1; display: flex; flex-direction: column; min-width: 0;
  background: var(--bg-raised);
}

.preview-bar {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  padding: 10px 16px; border-bottom: 1px solid var(--line); flex-shrink: 0;
  background: var(--bg);
}
.preview-bar-right { display: flex; align-items: center; gap: 10px; }

.preview-select {
  padding: 5px 8px; border: 1px solid var(--line); background: var(--bg);
  color: var(--text-muted); font: 400 11px var(--font-mono); max-width: 260px;
}

.io-btn {
  padding: 4px 10px; border: 1px solid var(--line); background: transparent;
  color: var(--text-dim); font: 600 9px var(--font-mono); letter-spacing: 0.06em;
  text-transform: uppercase; cursor: pointer; transition: color 120ms, border-color 120ms;
}
.io-btn:hover { color: var(--info); border-color: rgba(96, 165, 250, 0.3); }

.reset-btn {
  padding: 4px 10px; border: 1px solid var(--line-strong); background: transparent;
  color: var(--text-muted); font: 600 9px var(--font-mono); letter-spacing: 0.06em;
  text-transform: uppercase; cursor: pointer; transition: color 120ms;
}
.reset-btn:hover { color: var(--error); border-color: rgba(255, 64, 64, 0.3); }

.preview-frame { flex: 1; position: relative; min-height: 0; }
.preview-frame iframe {
  width: 100%; height: 100%; border: 0; display: block; background: var(--bg);
}

/* ── Responsive ── */
@media (max-width: 1100px) {
  .editor-shell { flex-direction: column; }
  .token-col { width: 100%; max-height: 50vh; border-right: 0; border-bottom: 1px solid var(--line); }
}
</style>
