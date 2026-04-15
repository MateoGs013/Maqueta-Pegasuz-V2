<script setup>
import { computed } from 'vue'
import {
  healthCards,
  observerSignals,
  observerExcellence,
  observerGeometry,
  observerAesthetics,
  runOverview,
  queueColumns,
  timeline,
} from '@/data/erosFeed.js'

const hasV2 = computed(() => observerExcellence.value !== null)
const v2Dims = computed(() => {
  const e = observerExcellence.value
  if (!e) return []
  return ['composition', 'depth', 'typography', 'motion', 'craft'].map(k => ({
    key: k, score: e[k]?.score, signal: e[k]?.signal,
  }))
})

const phase = {
  discovery: 'Descubrimiento', creative: 'Creativo', scaffold: 'Estructura',
  building: 'Construccion', sections: 'Secciones', motion: 'Motion', quality: 'Calidad',
  'quality-approved': 'Aprobado', integration: 'Integracion', retrospective: 'Retrospectiva',
  stopped: 'Detenido',
}
const dec = { approve: 'Aprobado', retry: 'Reintentar', flag: 'Requiere revision' }
const hl = { 'Health Index': 'Salud', Maturity: 'Madurez', 'Visual Debt': 'Deuda visual', 'Retry Budget': 'Reintentos' }
</script>

<template>
  <div class="panel-page">
    <!-- HERO -->
    <div class="grid-row grid-row--hero">
      <div class="cell hero-left">
        <p class="label">Score</p>
        <p class="hero-num">{{ (runOverview.finalScore ?? 0).toFixed(1) }}</p>
        <div class="pills" style="margin-top:8px">
          <span class="pill pill--accent">{{ phase[runOverview.currentPhase] || runOverview.currentPhase }}</span>
          <span class="pill" :class="runOverview.decision === 'flag' ? 'pill--weak' : runOverview.decision === 'approve' ? 'pill--strong' : 'pill--medium'">
            {{ dec[runOverview.decision] || runOverview.decision }}
          </span>
        </div>
      </div>
      <div class="cell hero-right">
        <h1 class="hero-name">{{ runOverview.project.name }}</h1>
        <p class="body">{{ runOverview.nextAction }}</p>
        <p class="body-sm" style="margin-top:4px">{{ runOverview.mode }} · {{ runOverview.sourceType }}</p>
      </div>
    </div>

    <!-- METRICS -->
    <div class="grid-row grid-row--3">
      <div v-for="card in healthCards.slice(0, 3)" :key="card.label" class="cell metric-cell">
        <p class="label">{{ hl[card.label] || card.label }}</p>
        <p class="value">{{ card.value }}<span class="suffix">{{ card.suffix }}</span></p>
        <p class="body-sm">{{ card.note }}</p>
      </div>
    </div>

    <!-- SIGNALS: V2 continuous or V1 binary -->
    <div class="cell signals-cell">
      <p class="label">Observer{{ hasV2 ? ' V2' : '' }}</p>
      <div v-if="hasV2" class="pills">
        <span v-for="d in v2Dims" :key="d.key" class="pill" :class="`pill--${d.score >= 8 ? 'strong' : d.score >= 5 ? 'medium' : 'weak'}`">
          {{ d.key }}: {{ d.score?.toFixed(1) }}
        </span>
      </div>
      <div v-else class="pills">
        <span v-for="s in observerSignals" :key="s.id" class="pill" :class="`pill--${s.tone}`">
          {{ s.label }}: {{ s.value }}
        </span>
      </div>
    </div>

    <!-- QUEUE + TIMELINE -->
    <div class="grid-row grid-row--2">
      <div class="cell">
        <p class="label">Cola de tareas</p>
        <div class="queue-row">
          <div v-for="col in queueColumns" :key="col.key" class="queue-stat">
            <span class="value-sm">{{ col.items.length }}</span>
            <span class="body-sm">{{ col.key === 'active' ? 'activas' : col.key === 'pending' ? 'pendientes' : 'completas' }}</span>
          </div>
        </div>
        <p class="body-sm" style="margin-top:8px">Reintentos: {{ runOverview.retriesUsed }}/{{ runOverview.retryBudget }}</p>
      </div>
      <div class="cell">
        <p class="label">Actividad reciente</p>
        <ul class="timeline">
          <li v-for="e in timeline" :key="e.id" class="tl-item">
            <span class="tl-icon" :class="e.type === 'decision' ? 'tl-icon--dec' : ''"></span>
            <span class="tl-id">{{ e.id }}</span>
            <span class="tl-text">{{ e.label }}</span>
          </li>
          <li v-if="!timeline.length" class="body-sm dim">Sin actividad registrada</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.grid-row--hero { grid-template-columns: auto 1fr; }
.hero-left { display: flex; flex-direction: column; justify-content: flex-end; min-width: 200px; }
.hero-num { font: 700 clamp(72px, 10vw, 110px)/0.82 var(--font-display); color: var(--text); letter-spacing: -0.05em; }
.hero-right { display: flex; flex-direction: column; justify-content: flex-end; gap: 8px; }
.hero-name { font: 700 clamp(28px, 4vw, 44px)/1 var(--font-display); color: var(--text); letter-spacing: -0.03em; }

.metric-cell { display: grid; gap: 6px; align-content: end; min-height: 140px; }

.signals-cell { display: flex; align-items: center; gap: 20px; }
.signals-cell .label { flex-shrink: 0; margin-bottom: 0; }

.queue-row { display: flex; gap: 32px; margin-top: 12px; }
.queue-stat { display: flex; align-items: baseline; gap: 6px; }

/* ── Timeline ── */
.timeline { list-style: none; display: grid; gap: 0; max-height: 280px; overflow-y: auto; }
.tl-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 0;
  border-bottom: 1px solid var(--line);
}
.tl-item:last-child { border-bottom: 0; }
.tl-icon {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
  background: var(--text-dim);
}
.tl-icon--dec { background: var(--accent); box-shadow: 0 0 6px var(--accent-glow); }
.tl-id { font: 600 9px var(--font-mono); color: var(--text-muted); letter-spacing: 0.06em; min-width: 100px; flex-shrink: 0; }
.tl-text { font: 400 11px/1.4 var(--font-body); color: var(--text-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dim { color: var(--text-dim); font-style: italic; }

@media (max-width: 980px) {
  .grid-row--hero { grid-template-columns: 1fr; }
  .hero-left { min-width: 0; }
  .metric-cell { min-height: 100px; }
  .queue-row { gap: 20px; }
}
</style>
