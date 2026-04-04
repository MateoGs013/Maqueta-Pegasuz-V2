<script setup>
import { computed } from 'vue'
import { excellence, hasV2, geometry, aesthetics, semantic, antiTemplate, gateList } from '@/composables/useObserver.js'
import { techniques, fonts } from '@/composables/useMemory.js'

const props = defineProps({ run: Object, slug: String })

const dims = computed(() => {
  const e = excellence.value
  if (!e) return []
  return [
    { key: 'composition', label: 'Composicion', ...e.composition },
    { key: 'depth', label: 'Profundidad', ...e.depth },
    { key: 'typography', label: 'Tipografia', ...e.typography },
    { key: 'motion', label: 'Motion', ...e.motion },
    { key: 'craft', label: 'Craft', ...e.craft },
  ]
})

const tone = (v) => v >= 8 ? 'strong' : v >= 5 ? 'medium' : 'weak'
const gateTone = (s) => s === 'PASS' ? 'strong' : s === 'WARN' ? 'medium' : 'weak'
const pct = (v) => Math.round((v || 0) * 100)

const maxTech = computed(() => {
  const scores = techniques.value.map(t => t.score)
  return scores.length > 0 ? Math.max(...scores, 10) : 10
})
</script>

<template>
  <div class="panel-page">
    <!-- Excellence scores -->
    <div v-if="hasV2" class="grid-row grid-row--5">
      <div v-for="d in dims" :key="d.key" class="cell score-cell">
        <p class="label">{{ d.label }}</p>
        <p class="value" :class="`c-${tone(d.score)}`">{{ (d.score ?? 0).toFixed(1) }}</p>
        <span class="pill" :class="`pill--${tone(d.score)}`">{{ d.signal }}</span>
      </div>
    </div>

    <!-- Layers: 2x2 grid -->
    <div v-if="hasV2" class="grid-row grid-row--2">
      <div class="cell">
        <p class="label">Geometria</p>
        <div class="ld" v-if="geometry">
          <div class="lr"><span class="lk">Balance</span><span class="lv">{{ geometry.visualBalance?.score?.toFixed(1) }}</span><span class="pill" :class="`pill--${tone(geometry.visualBalance?.score)}`">{{ geometry.visualBalance?.type }}</span></div>
          <div class="lr"><span class="lk">Overlaps</span><span class="lv">{{ geometry.overlap?.intentional || 0 }}</span></div>
          <div class="lr"><span class="lk">Sorpresas</span><span class="lv">{{ geometry.surprise?.count || 0 }}</span><span class="body-sm">{{ (geometry.surprise?.types || []).join(', ') }}</span></div>
        </div>
      </div>
      <div class="cell">
        <p class="label">Estetica</p>
        <div class="ld" v-if="aesthetics">
          <div class="lr"><span class="lk">Color</span><span class="lv">{{ aesthetics.colorHarmony?.score?.toFixed(1) }}</span><span class="pill" :class="`pill--${tone(aesthetics.colorHarmony?.score)}`">{{ aesthetics.colorHarmony?.type }}</span></div>
          <div class="lr"><span class="lk">Whitespace</span><span class="lv">{{ pct(aesthetics.whitespace?.globalRatio) }}%</span><span class="pill">{{ aesthetics.whitespace?.verdict }}</span></div>
          <div class="lr"><span class="lk">Tipografia</span><span class="lv">{{ aesthetics.typography?.score?.toFixed(1) }}</span><span class="body-sm">{{ aesthetics.typography?.levels }} niveles · ratio {{ aesthetics.typography?.sizeRatio?.toFixed(1) }}x</span></div>
        </div>
      </div>
    </div>
    <div v-if="hasV2" class="grid-row grid-row--2">
      <div class="cell">
        <p class="label">Semantica</p>
        <div class="ld" v-if="semantic">
          <div class="lr"><span class="lk">Score</span><span class="lv">{{ semantic.score?.toFixed(1) }}</span><span class="pill" :class="`pill--${tone(semantic.score)}`">{{ semantic.headingHierarchy }}</span></div>
          <div class="lr"><span class="lk">Landmarks</span><span class="body-sm">{{ (semantic.landmarks || []).join(', ') || '—' }}</span></div>
          <div class="lr"><span class="lk">Accesibles</span><span class="lv">{{ semantic.interactiveNamed }}%</span></div>
        </div>
      </div>
      <div class="cell">
        <p class="label">Anti-template</p>
        <div class="ld" v-if="antiTemplate">
          <div class="lr"><span class="lk">Score</span><span class="lv">{{ antiTemplate.score?.toFixed(1) }}</span><span class="pill" :class="antiTemplate.isTemplate ? 'pill--weak' : 'pill--strong'">{{ antiTemplate.isTemplate ? 'template' : 'unico' }}</span></div>
          <div class="lr"><span class="lk">Variedad</span><span class="lv">{{ pct(antiTemplate.layoutVariety) }}%</span></div>
          <div v-if="antiTemplate.findings?.length" class="lr" style="flex-wrap:wrap"><span v-for="f in antiTemplate.findings" :key="f" class="pill pill--medium">{{ f }}</span></div>
        </div>
      </div>
    </div>

    <!-- Quality gates -->
    <div v-if="gateList.length" class="cell">
      <p class="label">Quality Gates</p>
      <div class="pills" style="margin-top:8px">
        <span v-for="g in gateList" :key="g.key" class="pill" :class="`pill--${gateTone(g.signal)}`">{{ g.label }}: {{ g.signal }}</span>
      </div>
    </div>

    <!-- Memory: techniques + fonts -->
    <div class="grid-row grid-row--2">
      <div class="cell">
        <p class="label">Tecnicas (memoria)</p>
        <div class="tb">
          <div v-for="t in techniques" :key="t.name" class="tr">
            <span class="tn">{{ t.name }}</span>
            <div class="tw"><div class="tb-bar" :style="{ width: (t.score / maxTech * 100) + '%' }" :class="t.score >= 7.5 ? 'tb-ok' : ''"></div></div>
            <span class="ts">{{ t.score }}</span>
          </div>
        </div>
      </div>
      <div class="cell">
        <p class="label">Fonts (memoria)</p>
        <div class="fl">
          <div v-for="f in fonts" :key="f.display" class="fr">
            <span class="fd">{{ f.display }}</span>
            <span class="body-sm">{{ f.body }}</span>
            <span class="pill" :class="f.status === 'ok' ? 'pill--strong' : 'pill--weak'">{{ f.status === 'ok' ? 'ok' : 'no' }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.grid-row--5 { grid-template-columns: repeat(5, 1fr); }
.score-cell { display: grid; gap: 6px; align-content: end; min-height: 120px; }
.c-strong { color: var(--success); }
.c-medium { color: var(--accent); }
.c-weak { color: var(--error); }

.ld { display: grid; gap: 0; margin-top: 8px; }
.lr { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid var(--line); }
.lr:last-child { border-bottom: 0; }
.lk { font: 500 11px var(--font-body); color: var(--text-muted); min-width: 90px; flex-shrink: 0; }
.lv { font: 700 14px var(--font-mono); color: var(--text); min-width: 36px; }

.tb { display: grid; gap: 4px; margin-top: 8px; }
.tr { display: grid; grid-template-columns: 120px 1fr 32px; align-items: center; gap: 8px; }
.tn { font: 500 10px var(--font-body); color: var(--text-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tw { height: 4px; background: var(--surface); }
.tb-bar { height: 100%; background: var(--accent); }
.tb-ok { background: var(--success); }
.ts { font: 700 11px var(--font-mono); color: var(--text); text-align: right; }

.fl { display: grid; gap: 0; margin-top: 8px; }
.fr { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid var(--line); }
.fr:last-child { border-bottom: 0; }
.fd { font: 600 12px var(--font-display); color: var(--text); min-width: 120px; }

@media (max-width: 1200px) { .grid-row--5 { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 768px) { .grid-row--5 { grid-template-columns: repeat(2, 1fr); } }
</style>
