<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { categories, all } from '@/registry.js'
import { directionCandidates, selectedBlueprints } from '@/data/frontBrain.js'

const route = useRoute()
const router = useRouter()

const activeCategory = ref(route.query.type || 'all')
const activeTag = ref(route.query.tag || 'all')
const active = ref(route.query.active || selectedBlueprints.hero.name)
const search = ref(route.query.search || '')
const iframeKey = ref(0)

const syncQuery = () => {
  router.replace({
    query: {
      active: active.value,
      type: activeCategory.value !== 'all' ? activeCategory.value : undefined,
      tag: activeTag.value !== 'all' ? activeTag.value : undefined,
      search: search.value || undefined,
    },
  })
  iframeKey.value += 1
}

watch([active, activeCategory, activeTag, search], syncQuery)

watch(() => route.query.active, (name) => {
  if (name && name !== active.value) {
    active.value = name
  }
})

const tags = computed(() => [...new Set(all.flatMap((component) => component.trendTags))].sort())

const filtered = computed(() =>
  categories
    .map((category) => ({
      ...category,
      items: category.items.filter((component) => {
        const matchesSearch =
          component.label.toLowerCase().includes(search.value.toLowerCase()) ||
          component.signature.toLowerCase().includes(search.value.toLowerCase())
        const matchesType = activeCategory.value === 'all' || category.id === activeCategory.value
        const matchesTag = activeTag.value === 'all' || component.trendTags.includes(activeTag.value)
        return matchesSearch && matchesType && matchesTag
      }),
    }))
    .filter((category) => category.items.length > 0)
)

const activeComp = computed(() => all.find((component) => component.name === active.value))
const previewSrc = computed(() => `/?preview=${active.value}`)
const featuredDirections = computed(() =>
  directionCandidates.filter(
    (direction) =>
      direction.hero.name === active.value || direction.nav.name === active.value
  )
)

function select(name) {
  active.value = name
}

const loading = ref(true)
function onIframeLoad() { loading.value = false }
watch(active, () => { loading.value = true })
</script>

<template>
  <div class="panel-page blueprints-page">
    <header class="page-header">
      <p class="page-eyebrow">Curated seeds</p>
      <h1 class="page-title">Blueprint manifest with integrated preview</h1>
      <p class="page-copy">
        Seeds are creative anchors, not finished components. This view reads the actual manifest
        contract and keeps preview inside the backoffice instead of a separate app.
      </p>
    </header>

    <div class="blueprints">
      <aside class="list-panel">
        <div class="surface-card filter-card">
          <header class="surface-header">
            <div>
              <p class="surface-eyebrow">Filters</p>
              <h2 class="surface-title">Manifest controls</h2>
            </div>
          </header>

          <div class="search-wrap">
            <input
              v-model="search"
              class="search-input"
              type="search"
              placeholder="Filter by name or signature"
              aria-label="Filter components"
            />
          </div>

          <div class="pill-row pill-row--wrap">
            <button
              class="filter-pill"
              :class="{ active: activeCategory === 'all' }"
              @click="activeCategory = 'all'"
            >
              All
            </button>
            <button
              v-for="category in categories"
              :key="category.id"
              class="filter-pill"
              :class="{ active: activeCategory === category.id }"
              @click="activeCategory = category.id"
            >
              {{ category.label }}
            </button>
          </div>

          <div class="pill-row pill-row--wrap">
            <button
              class="filter-pill filter-pill--tag"
              :class="{ active: activeTag === 'all' }"
              @click="activeTag = 'all'"
            >
              All trends
            </button>
            <button
              v-for="tag in tags"
              :key="tag"
              class="filter-pill filter-pill--tag"
              :class="{ active: activeTag === tag }"
              @click="activeTag = tag"
            >
              {{ tag }}
            </button>
          </div>
        </div>

        <div class="list-scroll">
          <div v-for="cat in filtered" :key="cat.id" class="category">
            <div class="cat-header">
              <span class="cat-label">{{ cat.label }}</span>
              <span class="cat-count">{{ cat.items.length }}</span>
            </div>
            <ul class="cat-list" role="listbox" :aria-label="`${cat.label} components`">
              <li
                v-for="comp in cat.items"
                :key="comp.name"
                class="comp-item"
                :class="{ active: active === comp.name }"
                role="option"
                :aria-selected="active === comp.name"
                :title="comp.signature"
                @click="select(comp.name)"
                @keydown.enter="select(comp.name)"
                tabindex="0"
              >
                <span class="comp-dot" aria-hidden="true"></span>
                <div class="comp-copy">
                  <span class="comp-label">{{ comp.label }}</span>
                  <span class="comp-signature">{{ comp.signature }}</span>
                </div>
              </li>
            </ul>
          </div>

          <div v-if="filtered.length === 0" class="empty">
            No components match "{{ search }}"
          </div>
        </div>
      </aside>

      <div class="preview-panel">
        <div class="surface-card preview-card">
          <div class="preview-bar">
            <div class="preview-info">
              <span class="preview-name">{{ activeComp?.label }}</span>
              <span class="preview-sig">{{ activeComp?.signature }}</span>
            </div>
            <div class="preview-actions">
              <span
                v-if="active === selectedBlueprints.hero.name || active === selectedBlueprints.nav.name"
                class="pill pill--accent"
              >
                Active run seed
              </span>
              <a
                :href="previewSrc"
                target="_blank"
                rel="noopener"
                class="action-btn"
                title="Open in new tab"
              >
                Open fullscreen
              </a>
            </div>
          </div>

          <div class="iframe-wrap">
            <Transition name="fade">
              <div v-if="loading" class="iframe-loading" aria-hidden="true">
                <span class="loading-dot"></span>
              </div>
            </Transition>
            <iframe
              class="preview-iframe"
              :src="previewSrc"
              :key="`${active}-${iframeKey}`"
              :title="`Preview of ${active}`"
              @load="onIframeLoad"
            />
          </div>
        </div>

        <div class="metadata-grid">
          <article class="surface-card">
            <header class="surface-header">
              <div>
                <p class="surface-eyebrow">Seed contract</p>
                <h2 class="surface-title">{{ activeComp?.name }}</h2>
              </div>
            </header>

            <div class="pill-row">
              <span class="pill pill--accent">{{ activeComp?.sectionType }}</span>
              <span class="pill pill--medium">{{ activeComp?.compositionFamily }}</span>
              <span class="pill pill--medium">{{ activeComp?.motionFamily }}</span>
            </div>

            <ul class="text-list">
              <li><span>Problem:</span> <span>{{ activeComp?.problemSolved }}</span></li>
              <li><span>Distinctive leverage:</span> <span>{{ activeComp?.distinctiveLeverage }}</span></li>
              <li><span>Density score:</span> <span>{{ activeComp?.densityScore }}</span></li>
              <li><span>Theme compatibility:</span> <span>{{ activeComp?.themeCompatibility.join(', ') }}</span></li>
            </ul>
          </article>

          <article class="surface-card">
            <header class="surface-header">
              <div>
                <p class="surface-eyebrow">Mutation budget</p>
                <h2 class="surface-title">What the builder may change</h2>
              </div>
            </header>

            <div class="pill-row pill-row--wrap">
              <span class="pill pill--accent">layout: {{ activeComp?.mutationBudget.layout }}</span>
              <span class="pill pill--medium">copy: {{ activeComp?.mutationBudget.copy }}</span>
              <span class="pill pill--medium">motion: {{ activeComp?.mutationBudget.motion }}</span>
            </div>

            <div class="surface-subsection">
              <p class="surface-kicker">Preserve</p>
              <ul class="text-list">
                <li v-for="zone in activeComp?.lockedZones" :key="zone">{{ zone }}</li>
              </ul>
            </div>

            <div class="surface-subsection">
              <p class="surface-kicker">Mutable</p>
              <ul class="text-list">
                <li v-for="zone in activeComp?.mutableZones" :key="zone">{{ zone }}</li>
              </ul>
            </div>
          </article>

          <article class="surface-card">
            <header class="surface-header">
              <div>
                <p class="surface-eyebrow">Trend DNA</p>
                <h2 class="surface-title">Coverage and constraints</h2>
              </div>
            </header>
            <div class="pill-row pill-row--wrap">
              <span v-for="tag in activeComp?.trendTags" :key="tag" class="pill pill--accent">{{ tag }}</span>
            </div>
            <div class="surface-subsection">
              <p class="surface-kicker">Anti-pattern coverage</p>
              <ul class="text-list">
                <li v-for="pattern in activeComp?.antiPatternCoverage" :key="pattern">{{ pattern }}</li>
              </ul>
            </div>
            <div class="surface-subsection">
              <p class="surface-kicker">Required assets</p>
              <ul class="text-list">
                <li v-for="asset in activeComp?.requiredAssets" :key="asset">{{ asset }}</li>
                <li v-if="!activeComp?.requiredAssets.length">No required assets</li>
              </ul>
            </div>
            <div class="surface-subsection">
              <p class="surface-kicker">Forbidden pairings</p>
              <ul class="text-list">
                <li v-for="item in activeComp?.forbiddenPairings" :key="item">{{ item }}</li>
                <li v-if="!activeComp?.forbiddenPairings.length">No blocked combos</li>
              </ul>
            </div>
          </article>

          <article class="surface-card">
            <header class="surface-header">
              <div>
                <p class="surface-eyebrow">Direction usage</p>
                <h2 class="surface-title">Where this seed appears</h2>
              </div>
            </header>

            <ul class="text-list" v-if="featuredDirections.length">
              <li v-for="direction in featuredDirections" :key="direction.id">
                <span class="pill pill--medium">{{ direction.id }}</span>
                <span>{{ direction.label }} · {{ direction.rationale }}</span>
              </li>
            </ul>
            <p v-else class="detail-copy">
              This seed is currently outside the three default candidate directions.
            </p>
          </article>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.blueprints-page {
  gap: 18px;
}

.blueprints {
  display: flex;
  min-height: 0;
  flex: 1;
  overflow: hidden;
  gap: 18px;
}

.list-panel {
  width: 320px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.filter-card {
  gap: 18px;
}

.search-wrap {
  width: 100%;
}

.search-input {
  width: 100%;
  padding: 10px 12px;
  background: rgba(255,255,255,0.03);
  border: 1px solid var(--p-border-light);
  border-radius: 14px;
  color: var(--p-text);
  font: 400 13px var(--p-body);
  outline: none;
  transition: border-color 0.15s, background 0.15s;
}

.search-input:focus {
  border-color: var(--p-accent);
  background: rgba(255,255,255,0.05);
}

.search-input::placeholder { color: var(--p-subtle); }
.search-input::-webkit-search-cancel-button { display: none; }

.list-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 14px;
  border: 1px solid var(--p-border-light);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.02);
}

.category {
  margin-bottom: 14px;
}

.cat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0 8px;
}

.cat-label {
  font: 500 10px var(--p-mono);
  color: var(--p-subtle);
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.cat-count {
  font: 400 9px var(--p-mono);
  color: var(--p-subtle);
}

.cat-list {
  list-style: none;
  display: grid;
  gap: 8px;
}

.comp-item {
  display: flex;
  gap: 10px;
  padding: 10px 12px;
  cursor: pointer;
  user-select: none;
  border-radius: 14px;
  transition: background 0.12s, border-color 0.12s;
  border: 1px solid transparent;
}

.comp-item:hover {
  background: rgba(255, 255, 255, 0.03);
}

.comp-item.active {
  background: rgba(196, 132, 62, 0.08);
  border-color: var(--p-accent-bdr);
}

.comp-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.15);
  transition: background 0.1s;
  margin-top: 7px;
}

.comp-item.active .comp-dot {
  background: var(--p-accent);
  box-shadow: 0 0 5px rgba(196,132,62,0.5);
}

.comp-copy {
  min-width: 0;
  display: grid;
  gap: 2px;
}

.comp-label {
  font: 500 13px var(--p-body);
  color: var(--p-muted);
  transition: color 0.1s, font-weight 0.1s;
}

.comp-signature {
  color: var(--p-subtle);
  font: 400 11px/1.4 var(--p-body);
}

.comp-item:hover .comp-label,
.comp-item.active .comp-label {
  color: var(--p-text);
}

.empty {
  padding: 20px 14px;
  font: 400 11px var(--p-body);
  color: var(--p-subtle);
  font-style: italic;
}

.preview-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  gap: 18px;
}

.preview-card {
  min-height: 420px;
  overflow: hidden;
}

.metadata-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.preview-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 18px;
  border-bottom: 1px solid var(--p-border-light);
  flex-shrink: 0;
  gap: 16px;
}

.preview-info {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.preview-name {
  font: 500 24px/1 var(--p-display);
  color: var(--p-text-strong);
  letter-spacing: 0.06em;
  white-space: nowrap;
}

.preview-sig {
  font: 400 12px var(--p-body);
  color: var(--p-subtle);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.preview-sig::before {
  content: '·';
  margin-right: 10px;
  color: var(--p-accent);
  opacity: 0.5;
}

.preview-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  flex-shrink: 0;
}

.action-btn {
  display: flex;
  align-items: center;
  padding: 9px 12px;
  border: 1px solid var(--p-border-light);
  border-radius: 999px;
  background: transparent;
  color: var(--p-muted);
  font: 500 10px var(--p-mono);
  text-decoration: none;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}

.action-btn:hover {
  border-color: var(--p-accent);
  color: var(--p-accent);
}

.iframe-wrap {
  flex: 1;
  position: relative;
  overflow: hidden;
  min-height: 480px;
  border-radius: 18px;
  background: #0d0b09;
}

.preview-iframe {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
}

.iframe-loading {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0d0b09;
  z-index: 10;
}

.loading-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--p-accent);
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.3; transform: scale(0.8); }
  50%       { opacity: 1;   transform: scale(1.2); }
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to       { opacity: 0; }

.filter-pill {
  padding: 8px 10px;
  border-radius: 999px;
  border: 1px solid var(--p-border-light);
  background: transparent;
  color: var(--p-muted);
  font: 500 10px var(--p-mono);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s, background 0.15s;
}

.filter-pill.active,
.filter-pill:hover {
  border-color: var(--p-accent-bdr);
  background: rgba(196, 132, 62, 0.08);
  color: var(--p-text-strong);
}

.filter-pill--tag {
  text-transform: none;
  letter-spacing: 0.03em;
}

@media (max-width: 1180px) {
  .blueprints {
    flex-direction: column;
  }

  .list-panel {
    width: 100%;
  }

  .metadata-grid {
    grid-template-columns: 1fr;
  }
}
</style>
