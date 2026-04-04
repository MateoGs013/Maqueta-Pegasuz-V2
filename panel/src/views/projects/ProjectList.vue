<script setup>
import { runs } from '@/composables/useRuns.js'

const scoreTone = (v) => v >= 8 ? 'strong' : v >= 5 ? 'medium' : 'weak'
const decLabel = { approve: 'Aprobado', retry: 'Reintentar', flag: 'Revisar', pending: 'Pendiente' }
const phaseLabel = {
  discovery: 'Descubrimiento', creative: 'Creativo', scaffold: 'Estructura',
  sections: 'Secciones', motion: 'Motion', integration: 'Integracion',
  retrospective: 'Retrospectiva', complete: 'Completo', pending: 'Pendiente',
}
</script>

<template>
  <div class="panel-page">
    <div class="cell list-hero">
      <p class="label">Proyectos</p>
      <h1 class="list-title">{{ runs.length }} proyectos</h1>
      <p class="body">Selecciona un proyecto para ver su calidad, observer y métricas.</p>
    </div>

    <div class="project-grid">
      <router-link
        v-for="r in runs"
        :key="r.id"
        :to="`/projects/${r.id}`"
        class="project-card"
      >
        <div class="card-top">
          <span class="card-score" :class="`c-${scoreTone(r.score)}`">{{ (r.score || 0).toFixed(1) }}</span>
          <div class="card-info">
            <h2 class="card-name">{{ r.name || r.label }}</h2>
            <p class="card-type">{{ r.type }}</p>
          </div>
        </div>
        <div class="card-bottom">
          <span class="pill" :class="`pill--${scoreTone(r.score)}`">{{ decLabel[r.decision] || r.decision }}</span>
          <span class="pill">{{ phaseLabel[r.phase] || r.phase }}</span>
          <span class="pill">{{ r.queueDone }}/{{ r.queueTotal }} tareas</span>
        </div>
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.list-hero { display: grid; gap: 12px; }
.list-title {
  font: 700 clamp(40px, 6vw, 64px)/0.9 var(--font-display);
  color: var(--text); letter-spacing: -0.04em;
}

.project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1px;
  background: var(--line);
}

.project-card {
  display: grid; gap: 16px; padding: var(--cell-pad);
  background: var(--bg); text-decoration: none; color: inherit;
  transition: background 0.15s;
}
.project-card:hover { background: var(--surface); }

.card-top { display: flex; align-items: center; gap: 16px; }
.card-score {
  font: 700 clamp(32px, 4vw, 48px)/0.9 var(--font-display);
  letter-spacing: -0.04em; min-width: 60px;
}
.c-strong { color: var(--success); }
.c-medium { color: var(--accent); }
.c-weak { color: var(--error); }

.card-name { font: 600 16px/1.2 var(--font-display); color: var(--text); letter-spacing: -0.02em; }
.card-type { font: 400 11px var(--font-body); color: var(--text-muted); margin-top: 2px; }

.card-bottom { display: flex; gap: 6px; flex-wrap: wrap; }

@media (max-width: 768px) {
  .project-grid { grid-template-columns: 1fr; }
}
</style>
