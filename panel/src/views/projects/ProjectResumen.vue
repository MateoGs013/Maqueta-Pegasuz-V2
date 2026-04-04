<script setup>
import { computed } from 'vue'
import { excellence, hasV2 } from '@/composables/useObserver.js'

const props = defineProps({ run: Object, slug: String })

const scorecard = computed(() => props.run?.scorecard || {})
const queue = computed(() => props.run?.queue || { active: [], pending: [], done: [] })
const health = computed(() => [
  { label: 'Salud', value: props.run?.healthIndex ?? 0, suffix: '/100' },
  { label: 'Madurez', value: props.run?.maturityScore ?? 0, suffix: '/100' },
  { label: 'Deuda', value: props.run?.visualDebt?.summary?.open ?? 0, suffix: ' open' },
  { label: 'Reintentos', value: `${props.run?.retriesUsed ?? 0}/${props.run?.retryBudget ?? 3}`, suffix: '' },
])

const dims = computed(() => {
  const e = excellence.value
  if (!e) return []
  return ['composition', 'depth', 'typography', 'motion', 'craft'].map(k => ({
    key: k, score: e[k]?.score, signal: e[k]?.signal,
  }))
})

const tone = (v) => v >= 8 ? 'strong' : v >= 5 ? 'medium' : 'weak'
const decLabel = { approve: 'Aprobado', retry: 'Reintentar', flag: 'Revisar', pending: 'Pendiente' }
</script>

<template>
  <div class="panel-page">
    <!-- Hero score -->
    <div class="grid-row" style="grid-template-columns: auto 1fr">
      <div class="cell" style="min-width:200px">
        <p class="label">Score</p>
        <p class="hero-num" :class="`c-${tone(scorecard.finalScore)}`">{{ (scorecard.finalScore ?? 0).toFixed(1) }}</p>
        <span class="pill" :class="`pill--${tone(scorecard.finalScore)}`">{{ decLabel[scorecard.decision] || scorecard.decision }}</span>
      </div>
      <div class="cell" style="display:grid;gap:8px;align-content:end">
        <p class="body">{{ props.run?.nextAction || 'Sin accion pendiente' }}</p>
        <p class="body-sm">{{ props.run?.mode }} · {{ props.run?.currentPhase }}</p>
      </div>
    </div>

    <!-- Health -->
    <div class="grid-row grid-row--4">
      <div v-for="h in health" :key="h.label" class="cell metric-cell">
        <p class="label">{{ h.label }}</p>
        <p class="value-sm">{{ h.value }}<span class="suffix">{{ h.suffix }}</span></p>
      </div>
    </div>

    <!-- Excellence V2 or V1 signals -->
    <div class="cell">
      <p class="label">Observer{{ hasV2 ? ' V2' : '' }}</p>
      <div v-if="dims.length" class="pills" style="margin-top:8px">
        <span v-for="d in dims" :key="d.key" class="pill" :class="`pill--${tone(d.score)}`">
          {{ d.key }}: {{ d.score?.toFixed(1) }}
        </span>
      </div>
      <div v-else class="pills" style="margin-top:8px">
        <span class="pill">Observer: {{ scorecard.observerScore?.toFixed(1) || '—' }}</span>
        <span class="pill">Critic: {{ scorecard.criticScore?.toFixed(1) || '—' }}</span>
      </div>
    </div>

    <!-- Queue -->
    <div class="cell">
      <p class="label">Cola de tareas</p>
      <div class="queue-row">
        <div class="queue-stat">
          <span class="value-sm">{{ queue.done?.length || 0 }}</span>
          <span class="body-sm">completas</span>
        </div>
        <div class="queue-stat">
          <span class="value-sm">{{ queue.active?.length || 0 }}</span>
          <span class="body-sm">activas</span>
        </div>
        <div class="queue-stat">
          <span class="value-sm">{{ queue.pending?.length || 0 }}</span>
          <span class="body-sm">pendientes</span>
        </div>
      </div>
    </div>

    <!-- Retry instructions -->
    <div v-if="scorecard.retryInstructions?.length" class="cell">
      <p class="label">Instrucciones de reintento</p>
      <ol class="ol">
        <li v-for="(inst, i) in scorecard.retryInstructions" :key="i">{{ inst }}</li>
      </ol>
    </div>
  </div>
</template>

<style scoped>
.hero-num { font: 700 clamp(64px, 10vw, 96px)/0.82 var(--font-display); letter-spacing: -0.05em; }
.c-strong { color: var(--success); }
.c-medium { color: var(--accent); }
.c-weak { color: var(--error); }
.metric-cell { display: grid; gap: 6px; align-content: end; min-height: 120px; }
.queue-row { display: flex; gap: 32px; margin-top: 12px; }
.queue-stat { display: flex; align-items: baseline; gap: 6px; }
.ol { list-style: decimal; padding-left: 16px; display: grid; gap: 6px; }
.ol li { font: 400 13px/1.6 var(--font-body); color: var(--text-muted); }
</style>
