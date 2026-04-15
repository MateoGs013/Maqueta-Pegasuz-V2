<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { categories, all } from '@/registry.js'
import { selectedBlueprints } from '@/data/erosFeed.js'

const route = useRoute()
const router = useRouter()

const activeCategory = ref(route.query.type || 'all')
const active = ref(route.query.active || selectedBlueprints.value?.hero?.name || all[0]?.name)
const search = ref(route.query.search || '')
const iframeKey = ref(0)
const loading = ref(true)

const syncQuery = () => {
  router.replace({
    query: {
      run: route.query.run || undefined,
      active: active.value,
      type: activeCategory.value !== 'all' ? activeCategory.value : undefined,
      search: search.value || undefined,
    },
  })
  iframeKey.value += 1
}

watch([active, activeCategory, search], syncQuery)
watch(() => route.query.active, (n) => { if (n && n !== active.value) active.value = n })

const filtered = computed(() =>
  categories
    .map((cat) => ({
      ...cat,
      items: cat.items.filter((c) => {
        const q = search.value.toLowerCase()
        return (!q || c.label.toLowerCase().includes(q) || c.signature.toLowerCase().includes(q))
          && (activeCategory.value === 'all' || cat.id === activeCategory.value)
      }),
    }))
    .filter((cat) => cat.items.length > 0)
)

const comp = computed(() => all.find((c) => c.name === active.value))
const previewSrc = computed(() => `/?preview=${active.value}`)
const isActiveSeed = computed(() => active.value === selectedBlueprints.value?.hero?.name || active.value === selectedBlueprints.value?.nav?.name)

const viewports = [
  { key: 'desktop', label: 'Desktop', width: '100%' },
  { key: 'tablet', label: 'Tablet', width: '768px' },
  { key: 'mobile', label: 'Mobile', width: '375px' },
]
const activeViewport = ref('desktop')

function select(name) { active.value = name }
function onLoad() { loading.value = false }
watch(active, () => { loading.value = true })
</script>

<template>
  <div class="comp-shell">
    <!-- LIST -->
    <aside class="list-col">
      <div class="list-head">
        <input v-model="search" class="search" type="search" placeholder="Buscar..." aria-label="Buscar componentes" />
        <div class="pills">
          <button class="cat-btn" :class="{ on: activeCategory === 'all' }" @click="activeCategory = 'all'">Todo</button>
          <button v-for="c in categories" :key="c.id" class="cat-btn" :class="{ on: activeCategory === c.id }" @click="activeCategory = c.id">{{ c.label }}</button>
        </div>
      </div>
      <div class="list-scroll">
        <div v-for="cat in filtered" :key="cat.id" class="cat-group">
          <p class="cat-title">{{ cat.label }} <span class="cat-count">{{ cat.items.length }}</span></p>
          <ul class="cat-list">
            <li
              v-for="c in cat.items"
              :key="c.name"
              class="item"
              :class="{ active: active === c.name }"
              tabindex="0"
              @click="select(c.name)"
              @keydown.enter="select(c.name)"
            >
              <span class="item-name">{{ c.label }}</span>
              <span class="item-sig">{{ c.signature }}</span>
            </li>
          </ul>
        </div>
        <p v-if="!filtered.length" class="empty">Sin resultados</p>
      </div>
    </aside>

    <!-- DETAIL -->
    <div class="detail-col">
      <!-- preview top bar -->
      <div class="preview-bar">
        <div>
          <h2 class="title-sm">{{ comp?.label }}</h2>
          <p class="body-sm">{{ comp?.signature }}</p>
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
          <span v-if="isActiveSeed" class="pill pill--accent">Seed activo</span>
          <a :href="previewSrc" target="_blank" rel="noopener" class="open-link">Abrir</a>
        </div>
      </div>

      <!-- iframe: fills remaining height -->
      <div class="iframe-area" :class="`vp--${activeViewport}`">
        <Transition name="fade">
          <div v-if="loading" class="iframe-loading"><span class="dot" /></div>
        </Transition>
        <iframe :src="previewSrc" :key="`${active}-${iframeKey}`" :title="active" @load="onLoad" />
      </div>

      <!-- meta strip at bottom -->
      <div v-if="comp" class="meta-strip">
        <div class="meta-cell">
          <p class="label">Contrato</p>
          <div class="pills" style="margin-top:6px">
            <span class="pill pill--accent">{{ comp.compositionFamily }}</span>
            <span class="pill">{{ comp.motionFamily }}</span>
            <span class="pill">densidad: {{ comp.densityScore }}</span>
          </div>
          <p class="body-sm" style="margin-top:6px"><strong>Problema:</strong> {{ comp.problemSolved }}</p>
        </div>
        <div class="meta-cell">
          <p class="label">Mutacion</p>
          <div class="pills" style="margin-top:6px">
            <span class="pill pill--accent">layout: {{ comp.mutationBudget.layout }}</span>
            <span class="pill">copy: {{ comp.mutationBudget.copy }}</span>
            <span class="pill">motion: {{ comp.mutationBudget.motion }}</span>
          </div>
          <p class="body-sm" style="margin-top:6px"><strong>Preservar:</strong> {{ comp.lockedZones.join(', ') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.comp-shell { display: flex; flex: 1; min-height: 0; overflow: hidden; }

/* ── LIST ── */
.list-col {
  width: 260px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--line);
  background: var(--bg);
}
.list-head { padding: 12px; display: grid; gap: 8px; border-bottom: 1px solid var(--line); }
.search {
  width: 100%;
  padding: 7px 10px;
  border: 1px solid var(--line);
  background: var(--bg);
  color: var(--text);
  font: 400 12px var(--font-body);
}
.search::placeholder { color: var(--text-dim); }
.search::-webkit-search-cancel-button { display: none; }
.search:focus { outline: none; border-color: var(--accent); }

.cat-btn {
  padding: 3px 8px;
  border: 1px solid var(--line);
  background: transparent;
  color: var(--text-muted);
  font: 600 9px var(--font-mono);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
}
.cat-btn:hover { color: var(--text); }
.cat-btn.on { border-color: var(--line-accent); color: var(--accent); background: var(--accent-ember); }

.list-scroll { flex: 1; overflow-y: auto; }

.cat-group { padding-top: 8px; }
.cat-title {
  font: 500 9px var(--font-mono);
  color: var(--text-muted);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 4px 12px;
}
.cat-count { color: var(--text-dim); }
.cat-list { list-style: none; }

.item {
  display: grid;
  gap: 2px;
  padding: 7px 12px;
  cursor: pointer;
  border-left: 2px solid transparent;
  transition: background 100ms;
}
.item:hover { background: var(--surface); }
.item.active { border-left-color: var(--accent); background: var(--accent-ember); }
.item-name { font: 500 12px var(--font-body); color: var(--text-muted); }
.item.active .item-name { color: var(--text); }
.item-sig { font: 400 10px var(--font-body); color: var(--text-dim); }
.empty { padding: 20px 12px; font: 400 11px var(--font-body); color: var(--text-dim); }

/* ── DETAIL ── */
.detail-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: var(--bg);
}

.preview-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 20px;
  border-bottom: 1px solid var(--line);
  flex-shrink: 0;
}
.open-link {
  font: 600 9px var(--font-mono);
  color: var(--text-muted);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-decoration: none;
  padding: 4px 10px;
  border: 1px solid var(--line);
  transition: color 120ms, border-color 120ms;
}
.open-link:hover { color: var(--accent); border-color: var(--accent); }

.preview-controls { display: flex; align-items: center; gap: 8px; }

.vp-toggle { display: flex; gap: 0; }
.vp-btn {
  padding: 4px 10px;
  border: 1px solid var(--line);
  background: transparent;
  color: var(--text-dim);
  font: 600 9px var(--font-mono);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
  transition: color 120ms, border-color 120ms;
  margin-left: -1px;
}
.vp-btn:first-child { margin-left: 0; }
.vp-btn:hover { color: var(--text-muted); }
.vp-btn.on { border-color: var(--line-accent); color: var(--accent); background: var(--accent-ember); z-index: 1; position: relative; }

.iframe-area {
  flex: 1;
  position: relative;
  min-height: 0;
}
.iframe-area iframe {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
  transition: width 300ms ease, margin 300ms ease;
}
.vp--tablet iframe { width: 768px; margin: 0 auto; }
.vp--mobile iframe { width: 375px; margin: 0 auto; }
.vp--tablet, .vp--mobile { background: var(--bg-raised); }
.iframe-loading {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-raised);
  z-index: 2;
}
.dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); animation: pulse 1s ease infinite; }
@keyframes pulse { 0%, 100% { opacity: .3; } 50% { opacity: 1; } }
.fade-enter-active, .fade-leave-active { transition: opacity 200ms; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.meta-strip {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  background: var(--line);
  border-top: 1px solid var(--line);
  flex-shrink: 0;
}
.meta-cell { background: var(--bg); padding: 16px 20px; }
.meta-cell strong { color: var(--text); font-weight: 500; }

@media (max-width: 980px) {
  .comp-shell { flex-direction: column; }
  .list-col { width: 100%; border-right: 0; border-bottom: 1px solid var(--line); max-height: 260px; }
  .meta-strip { grid-template-columns: 1fr; }
}
</style>
