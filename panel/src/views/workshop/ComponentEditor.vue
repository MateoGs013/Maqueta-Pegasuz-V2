<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useWorkshopStaging } from '@/composables/useWorkshopStaging.js'
import { parseComponentProps, applyPropChanges } from '@/composables/useComponentProps.js'

const staging = useWorkshopStaging()

// ── State ──
const componentList = ref([])
const activeComponent = ref(null) // { path, name, category }
const props = ref([])
const propChanges = ref(new Map())  // propName → newValue
const previewIframe = ref(null)
const loading = ref(true)
const search = ref('')
const activeViewport = ref('desktop')

const viewports = [
  { key: 'desktop', label: 'Desktop', width: '100%' },
  { key: 'tablet', label: 'Tablet', width: '768px' },
  { key: 'mobile', label: 'Mobile', width: '375px' },
]

// ── Load component list ──
onMounted(async () => {
  try {
    const res = await fetch('/__workshop/list')
    if (res.ok) {
      componentList.value = await res.json()
      if (componentList.value.length) selectComponent(componentList.value[0])
    }
  } catch (e) {
    console.error('Failed to load component list:', e)
  } finally {
    loading.value = false
  }
})

// ── Filtered list ──
const categories = computed(() => {
  const q = search.value.toLowerCase()
  const cats = [
    { id: 'heroes', label: 'Heroes', items: [] },
    { id: 'navs', label: 'Navs', items: [] },
  ]
  for (const c of componentList.value) {
    if (q && !c.name.toLowerCase().includes(q)) continue
    const cat = cats.find((ct) => ct.id === c.category)
    if (cat) cat.items.push(c)
  }
  return cats.filter((c) => c.items.length > 0)
})

// ── Select component ──
async function selectComponent(comp) {
  activeComponent.value = comp
  propChanges.value = new Map()
  props.value = []

  try {
    const entry = await staging.stageFile(comp.path, 'component')
    props.value = parseComponentProps(entry.draftContent)
  } catch (e) {
    console.error('Failed to load component:', e)
  }
}

// ── Prop editing ──
function currentPropValue(prop) {
  return propChanges.value.has(prop.name) ? propChanges.value.get(prop.name) : prop.default
}

function updateProp(prop, newValue) {
  const fresh = new Map(propChanges.value)
  if (newValue === prop.default || JSON.stringify(newValue) === JSON.stringify(prop.default)) {
    fresh.delete(prop.name)
  } else {
    fresh.set(prop.name, newValue)
  }
  propChanges.value = fresh
}

function resetProp(prop) {
  const fresh = new Map(propChanges.value)
  fresh.delete(prop.name)
  propChanges.value = fresh
}

// ── Sync changes to staging + iframe ──
watch(propChanges, (ch) => {
  if (!activeComponent.value) return

  // Update staging draft
  const entry = staging.getStaged(activeComponent.value.path)
  if (entry) {
    if (ch.size === 0) {
      staging.updateDraft(activeComponent.value.path, entry.originalContent)
    } else {
      staging.updateDraft(activeComponent.value.path, applyPropChanges(entry.originalContent, ch))
    }
  }

  // Send prop overrides to iframe
  const iframe = previewIframe.value
  if (!iframe?.contentWindow) return
  const overrides = {}
  for (const [name, value] of ch) {
    overrides[name] = value
  }
  iframe.contentWindow.postMessage({ type: 'prop-override', props: overrides }, '*')
}, { deep: true })

// ── Computed ──
const changeCount = computed(() => propChanges.value.size)
const previewSrc = computed(() =>
  activeComponent.value ? `/?preview=${activeComponent.value.name}` : 'about:blank'
)

function tryUpdateJson(prop, raw) {
  try {
    const parsed = JSON.parse(raw)
    updateProp(prop, parsed)
  } catch { /* invalid JSON, ignore */ }
}

// ── CRUD ──
const showCreateModal = ref(false)
const newCompName = ref('')
const newCompCategory = ref('heroes')
const creating = ref(false)
const deleting = ref(false)

async function createComponent() {
  if (!newCompName.value.trim()) return
  creating.value = true
  const prefix = newCompCategory.value === 'heroes' ? 'S' : 'N'
  const name = newCompName.value.startsWith(prefix + '-')
    ? newCompName.value
    : `${prefix}-${newCompName.value}`

  try {
    const res = await fetch('/__workshop/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category: newCompCategory.value, name }),
    })
    if (res.ok) {
      const data = await res.json()
      const comp = { path: data.path, name: data.name, category: newCompCategory.value }
      componentList.value.push(comp)
      selectComponent(comp)
      showCreateModal.value = false
      newCompName.value = ''
    } else {
      const err = await res.json()
      alert(err.error || 'Error al crear')
    }
  } catch (e) {
    console.error('Create failed:', e)
  } finally {
    creating.value = false
  }
}

async function duplicateComponent() {
  if (!activeComponent.value) return
  const src = activeComponent.value
  const newName = prompt(`Nombre para la copia de ${src.name}:`, `${src.name}-Copy`)
  if (!newName?.trim()) return

  try {
    // Read the original source
    const readRes = await fetch(`/__workshop/read?path=${encodeURIComponent(src.path)}`)
    if (!readRes.ok) return
    const { content } = await readRes.json()

    // Update defineOptions name
    const optionsName = newName.replace(/^[SN]-/, '').replace(/-/g, '')
    const prefix = src.category === 'heroes' ? 'S' : 'N'
    const finalName = newName.startsWith(prefix + '-') ? newName : `${prefix}-${newName}`
    let newContent = content.replace(
      /defineOptions\(\s*\{\s*name:\s*'[^']+'\s*\}\s*\)/,
      `defineOptions({ name: '${prefix}${optionsName}' })`
    )

    // Write the copy
    const newPath = `${src.category}/${finalName}.vue`
    const writeRes = await fetch('/__workshop/write', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: newPath, content: newContent }),
    })
    if (writeRes.ok) {
      const comp = { path: newPath, name: finalName, category: src.category }
      componentList.value.push(comp)
      selectComponent(comp)
    }
  } catch (e) {
    console.error('Duplicate failed:', e)
  }
}

async function deleteComponent() {
  if (!activeComponent.value) return
  const name = activeComponent.value.name
  if (!confirm(`Eliminar ${name}? Se creara un backup.`)) return
  deleting.value = true
  try {
    const res = await fetch('/__workshop/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: activeComponent.value.path }),
    })
    if (res.ok) {
      componentList.value = componentList.value.filter((c) => c.name !== name)
      activeComponent.value = componentList.value[0] ?? null
      if (activeComponent.value) selectComponent(activeComponent.value)
      else { props.value = []; propChanges.value = new Map() }
    }
  } catch (e) {
    console.error('Delete failed:', e)
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <div class="comp-editor">
    <h1 class="sr-only">Editor de componentes</h1>
    <!-- ── LIST ── -->
    <aside class="list-col">
      <div class="list-head">
        <input v-model="search" class="search" type="search" placeholder="Buscar..." aria-label="Buscar componentes" />
        <button class="crud-btn crud-btn--add" title="Nuevo componente" @click="showCreateModal = true">+</button>
      </div>
      <div class="list-scroll">
        <div v-for="cat in categories" :key="cat.id" class="cat-group">
          <p class="cat-title">{{ cat.label }} <span class="cat-count">{{ cat.items.length }}</span></p>
          <ul class="cat-list">
            <li
              v-for="c in cat.items"
              :key="c.name"
              class="item"
              :class="{ active: activeComponent?.name === c.name, dirty: staging.isDirty(c.path) }"
              tabindex="0"
              @click="selectComponent(c)"
              @keydown.enter="selectComponent(c)"
            >
              <span class="item-name">{{ c.name }}</span>
              <span v-if="staging.isDirty(c.path)" class="item-dot"></span>
            </li>
          </ul>
        </div>
        <p v-if="!categories.length && !loading" class="empty">Sin resultados</p>
        <p v-if="loading" class="empty">Cargando...</p>
      </div>
    </aside>

    <!-- ── PREVIEW ── -->
    <div class="preview-col">
      <div class="preview-bar">
        <div class="preview-bar-left">
          <p class="title-sm">{{ activeComponent?.name ?? '—' }}</p>
          <button v-if="activeComponent" class="crud-btn crud-btn--dup" title="Duplicar componente" @click="duplicateComponent">&#128203;</button>
          <button v-if="activeComponent" class="crud-btn crud-btn--del" title="Eliminar componente" :disabled="deleting" @click="deleteComponent">&#128465;</button>
        </div>
        <div class="preview-controls">
          <div class="vp-toggle">
            <button
              v-for="vp in viewports"
              :key="vp.key"
              class="vp-btn"
              :class="{ on: activeViewport === vp.key }"
              @click="activeViewport = vp.key"
            >{{ vp.label }}</button>
          </div>
        </div>
      </div>
      <div class="preview-frame" :class="`vp--${activeViewport}`">
        <iframe
          ref="previewIframe"
          :src="previewSrc"
          :key="activeComponent?.name"
          :title="activeComponent?.name ?? 'preview'"
        />
      </div>
    </div>

    <!-- ── PROPS PANEL ── -->
    <aside class="props-col">
      <div class="props-head">
        <span class="props-title">Props</span>
        <span v-if="changeCount" class="change-badge">{{ changeCount }}</span>
      </div>

      <div v-if="!activeComponent" class="props-empty">Selecciona un componente</div>
      <div v-else-if="!props.length" class="props-empty">Sin props editables</div>

      <div v-else class="props-scroll">
        <div v-for="prop in props" :key="prop.name" class="prop-row" :class="{ modified: propChanges.has(prop.name) }">
          <div class="prop-header">
            <span class="prop-name">{{ prop.name }}</span>
            <span class="prop-type">{{ prop.type }}</span>
            <button v-if="propChanges.has(prop.name)" class="prop-reset" title="Revertir" @click="resetProp(prop)">&#10005;</button>
          </div>

          <!-- String / text -->
          <template v-if="prop.editorType === 'text'">
            <input
              type="text"
              :value="currentPropValue(prop)"
              class="prop-input"
              @change="updateProp(prop, $event.target.value)"
            />
          </template>

          <!-- Textarea -->
          <template v-else-if="prop.editorType === 'textarea'">
            <textarea
              :value="currentPropValue(prop)"
              class="prop-input prop-textarea"
              rows="3"
              @change="updateProp(prop, $event.target.value)"
            />
          </template>

          <!-- Number -->
          <template v-else-if="prop.editorType === 'number'">
            <input
              type="number"
              :value="currentPropValue(prop)"
              class="prop-input"
              @change="updateProp(prop, Number($event.target.value))"
            />
          </template>

          <!-- Boolean toggle -->
          <template v-else-if="prop.editorType === 'toggle'">
            <button
              class="prop-toggle"
              :class="{ on: currentPropValue(prop) }"
              @click="updateProp(prop, !currentPropValue(prop))"
            >{{ currentPropValue(prop) ? 'true' : 'false' }}</button>
          </template>

          <!-- Color -->
          <template v-else-if="prop.editorType === 'color'">
            <div class="prop-color-row">
              <input type="color" :value="currentPropValue(prop)" class="color-picker" @input="updateProp(prop, $event.target.value)" />
              <input type="text" :value="currentPropValue(prop)" class="prop-input" @change="updateProp(prop, $event.target.value)" />
            </div>
          </template>

          <!-- JSON (arrays, objects) -->
          <template v-else-if="prop.editorType === 'json'">
            <textarea
              :value="typeof currentPropValue(prop) === 'string' ? currentPropValue(prop) : JSON.stringify(currentPropValue(prop), null, 2)"
              class="prop-input prop-textarea prop-json"
              rows="4"
              @change="tryUpdateJson(prop, $event.target.value)"
            />
          </template>
        </div>
      </div>
    </aside>

    <!-- ── CREATE MODAL ── -->
    <Teleport to="body">
      <div v-if="showCreateModal" class="create-backdrop" @click.self="showCreateModal = false">
        <div class="create-modal">
          <h3 class="create-title">Nuevo componente</h3>
          <div class="create-form">
            <label class="create-field">
              <span class="label">Categoria</span>
              <select v-model="newCompCategory" class="create-input">
                <option value="heroes">Hero (S-)</option>
                <option value="navs">Nav (N-)</option>
              </select>
            </label>
            <label class="create-field">
              <span class="label">Nombre</span>
              <input
                v-model="newCompName"
                class="create-input"
                placeholder="MiComponente"
                @keydown.enter="createComponent"
              />
              <span class="body-sm">Se creara como {{ newCompCategory === 'heroes' ? 'S' : 'N' }}-{{ newCompName || 'Nombre' }}.vue</span>
            </label>
          </div>
          <div class="create-actions">
            <button class="create-btn" @click="showCreateModal = false">Cancelar</button>
            <button class="create-btn create-btn--ok" :disabled="!newCompName.trim() || creating" @click="createComponent">
              {{ creating ? 'Creando...' : 'Crear' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.comp-editor { display: flex; flex: 1; min-height: 0; overflow: hidden; }

/* ── LIST ── */
.list-col {
  width: 220px; flex-shrink: 0; display: flex; flex-direction: column;
  border-right: 1px solid var(--line); background: var(--bg);
}
.list-head { display: flex; gap: 6px; padding: 12px; border-bottom: 1px solid var(--line); }
.search {
  width: 100%; padding: 7px 10px; border: 1px solid var(--line); background: var(--bg);
  color: var(--text); font: 400 12px var(--font-body);
}
.search:focus { outline: none; border-color: var(--info); }
.search::-webkit-search-cancel-button { display: none; }

.list-scroll { flex: 1; overflow-y: auto; }
.cat-group { padding-top: 8px; }
.cat-title {
  font: 500 9px var(--font-mono); color: var(--text-muted);
  letter-spacing: 0.1em; text-transform: uppercase; padding: 4px 12px;
}
.cat-count { color: var(--text-dim); }
.cat-list { list-style: none; }

.item {
  display: flex; align-items: center; justify-content: space-between;
  padding: 7px 12px; cursor: pointer;
  border-left: 2px solid transparent; transition: background 100ms;
}
.item:hover { background: var(--surface); }
.item.active { border-left-color: var(--info); background: var(--info-soft); }
.item-name { font: 500 11px var(--font-body); color: var(--text-muted); }
.item.active .item-name { color: var(--text); }
.item-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--warn); flex-shrink: 0; }
.empty { padding: 20px 12px; font: 400 11px var(--font-body); color: var(--text-dim); }

/* ── PREVIEW ── */
.preview-col { flex: 1; display: flex; flex-direction: column; min-width: 0; background: var(--bg-raised); }

.preview-bar {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  padding: 10px 16px; border-bottom: 1px solid var(--line); flex-shrink: 0; background: var(--bg);
}
.preview-controls { display: flex; align-items: center; gap: 8px; }

.vp-toggle { display: flex; gap: 0; }
.vp-btn {
  padding: 4px 10px; border: 1px solid var(--line); background: transparent;
  color: var(--text-dim); font: 600 9px var(--font-mono); letter-spacing: 0.06em;
  text-transform: uppercase; cursor: pointer; transition: color 120ms; margin-left: -1px;
}
.vp-btn:first-child { margin-left: 0; }
.vp-btn:hover { color: var(--text-muted); }
.vp-btn.on { border-color: var(--line-accent); color: var(--info); background: var(--info-soft); z-index: 1; position: relative; }

.preview-frame { flex: 1; position: relative; min-height: 0; }
.preview-frame iframe { width: 100%; height: 100%; border: 0; display: block; background: var(--bg); }
.vp--tablet iframe { width: 768px; margin: 0 auto; }
.vp--mobile iframe { width: 375px; margin: 0 auto; }
.vp--tablet, .vp--mobile { background: var(--bg-raised); }

/* ── PROPS PANEL ── */
.props-col {
  width: 300px; flex-shrink: 0; display: flex; flex-direction: column;
  border-left: 1px solid var(--line); background: var(--bg);
}
.props-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 16px; border-bottom: 1px solid var(--line);
}
.props-title { font: 500 10px var(--font-mono); color: var(--text-muted); letter-spacing: 0.1em; text-transform: uppercase; }
.change-badge { padding: 2px 8px; background: var(--warn-soft); color: var(--warn); font: 700 10px var(--font-mono); border-radius: 99px; }
.props-empty { padding: 40px 16px; color: var(--text-dim); font: 400 11px var(--font-mono); text-align: center; }
.props-scroll { flex: 1; overflow-y: auto; }

.prop-row {
  padding: 10px 16px; border-bottom: 1px solid var(--line);
  display: grid; gap: 6px; transition: background 100ms;
}
.prop-row.modified { background: var(--warn-soft); }

.prop-header { display: flex; align-items: center; gap: 8px; }
.prop-name { font: 500 11px var(--font-mono); color: var(--text); flex: 1; }
.prop-type { font: 400 9px var(--font-mono); color: var(--text-dim); text-transform: lowercase; }
.prop-reset {
  width: 18px; height: 18px; display: flex; align-items: center; justify-content: center;
  border: 0; background: transparent; color: var(--text-dim); cursor: pointer; font-size: 10px;
}
.prop-reset:hover { color: var(--error); }

.prop-input {
  width: 100%; padding: 5px 8px; border: 1px solid var(--line); background: var(--bg);
  color: var(--text-muted); font: 400 11px var(--font-mono);
}
.prop-input:focus { outline: none; border-color: var(--info); color: var(--text); }
.prop-textarea { resize: vertical; font: 400 11px var(--font-mono); }
.prop-json { font-size: 10px; }

.prop-toggle {
  padding: 4px 12px; border: 1px solid var(--line-strong); background: transparent;
  color: var(--text-dim); font: 600 10px var(--font-mono); cursor: pointer; transition: all 120ms;
}
.prop-toggle.on { color: var(--success); border-color: rgba(62, 232, 181, 0.3); background: var(--success-soft); }

.prop-color-row { display: flex; gap: 6px; align-items: center; }
.color-picker {
  width: 28px; height: 28px; border: 1px solid var(--line); background: transparent;
  cursor: pointer; padding: 0; flex-shrink: 0;
}
.color-picker::-webkit-color-swatch-wrapper { padding: 2px; }
.color-picker::-webkit-color-swatch { border: 0; border-radius: 2px; }

/* ── Responsive ── */
@media (max-width: 1200px) {
  .props-col { width: 240px; }
}
/* ── CRUD buttons ── */
.crud-btn {
  width: 32px; height: 32px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  border: 1px solid var(--line-strong); background: transparent;
  color: var(--text-dim); cursor: pointer; transition: color 120ms, border-color 120ms;
  font-size: 16px;
}
.crud-btn:hover { color: var(--text); }
.crud-btn--add:hover { color: var(--success); border-color: rgba(62, 232, 181, 0.3); }
.crud-btn--dup { width: 28px; height: 28px; font-size: 14px; }
.crud-btn--dup:hover { color: var(--info); border-color: rgba(96, 165, 250, 0.3); }
.crud-btn--del { width: 28px; height: 28px; font-size: 14px; }
.crud-btn--del:hover { color: var(--error); border-color: rgba(255, 64, 64, 0.3); }
.crud-btn--del:disabled { opacity: 0.3; cursor: not-allowed; }

.preview-bar-left { display: flex; align-items: center; gap: 10px; }

/* ── CREATE MODAL ── */
.create-backdrop {
  position: fixed; inset: 0; z-index: 9500;
  background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
}
.create-modal {
  width: 400px; background: var(--bg); border: 1px solid var(--line-strong);
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.5); display: grid; gap: 0;
}
.create-title {
  padding: 16px 20px; border-bottom: 1px solid var(--line);
  font: 600 14px var(--font-display); color: var(--text); letter-spacing: -0.02em;
}
.create-form { padding: 20px; display: grid; gap: 14px; }
.create-field { display: grid; gap: 4px; }
.create-input {
  padding: 7px 10px; border: 1px solid var(--line); background: var(--bg);
  color: var(--text); font: 400 12px var(--font-body);
}
.create-input:focus { outline: none; border-color: var(--info); }
.create-actions {
  display: flex; justify-content: flex-end; gap: 8px;
  padding: 12px 20px; border-top: 1px solid var(--line);
}
.create-btn {
  padding: 7px 16px; border: 1px solid var(--line-strong); background: transparent;
  color: var(--text-muted); font: 600 10px var(--font-mono); letter-spacing: 0.06em;
  text-transform: uppercase; cursor: pointer; transition: color 120ms;
}
.create-btn:hover { color: var(--text); }
.create-btn--ok { color: var(--success); border-color: rgba(62, 232, 181, 0.3); }
.create-btn--ok:hover { background: var(--success-soft); }
.create-btn--ok:disabled { opacity: 0.4; cursor: not-allowed; }

@media (max-width: 980px) {
  .comp-editor { flex-direction: column; }
  .list-col { width: 100%; max-height: 200px; border-right: 0; border-bottom: 1px solid var(--line); }
  .props-col { width: 100%; max-height: 300px; border-left: 0; border-top: 1px solid var(--line); }
}
</style>
