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
    </div>

    <div class="project-grid">
      <router-link
        v-for="r in runs" :key="r.id"
        :to="`/projects/${r.id}`"
        class="card"
      >
        <!-- Score bar background -->
        <div class="card-scorebar" :class="`bar-${scoreTone(r.score)}`" :style="{ width: Math.max(8, (r.score || 0) * 10) + '%' }"></div>

        <div class="card-content">
          <div class="card-header">
            <div class="card-identity">
              <h2 class="card-name">{{ r.name || r.label }}</h2>
              <p class="card-type">{{ r.type }}</p>
            </div>
            <span class="card-score" :class="`c-${scoreTone(r.score)}`">{{ (r.score || 0).toFixed(1) }}</span>
          </div>

          <div class="card-meta">
            <span class="pill" :class="`pill--${scoreTone(r.score)}`">{{ decLabel[r.decision] || r.decision }}</span>
            <span class="pill">{{ phaseLabel[r.phase] || r.phase }}</span>
          </div>

          <div class="card-progress">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: (r.queueTotal > 0 ? r.queueDone / r.queueTotal * 100 : 0) + '%' }"></div>
            </div>
            <span class="progress-text">{{ r.queueDone }}/{{ r.queueTotal }}</span>
          </div>
        </div>

        <div class="card-arrow">→</div>
      </router-link>
    </div>

    <div v-if="!runs.length" class="cell empty-state">
      <p class="empty-title">Sin proyectos</p>
      <p class="body-sm">Usa <code>/project</code> en Claude Code para crear tu primer proyecto.</p>
    </div>
  </div>
</template>

<style scoped>
.list-hero { display: grid; gap: 8px; }
.list-title {
  font: 700 clamp(36px, 5vw, 56px)/0.9 var(--font-display);
  color: var(--text); letter-spacing: -0.04em;
}

.project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 1px;
  background: var(--line);
}

.card {
  position: relative; overflow: hidden;
  display: grid; text-decoration: none; color: inherit;
  background: var(--bg);
  transition: background 180ms cubic-bezier(0.16, 1, 0.3, 1);
}
.card:hover { background: var(--surface); }
.card:hover .card-arrow { opacity: 1; transform: translateX(0); }
.card:hover .card-scorebar { opacity: 0.12; }

/* Score bar — subtle background indicator */
.card-scorebar {
  position: absolute; top: 0; left: 0; bottom: 0;
  opacity: 0.06; transition: all 300ms;
}
.bar-strong { background: var(--success); }
.bar-medium { background: var(--accent); }
.bar-weak { background: var(--error); }

.card-content { position: relative; padding: 24px 28px; display: grid; gap: 14px; }

.card-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
.card-identity { display: grid; gap: 2px; }
.card-name { font: 600 15px/1.2 var(--font-display); color: var(--text); letter-spacing: -0.02em; }
.card-type { font: 400 10px var(--font-body); color: var(--text-muted); text-transform: capitalize; }

.card-score {
  font: 700 clamp(28px, 3vw, 36px)/0.9 var(--font-display);
  letter-spacing: -0.04em; flex-shrink: 0;
}
.c-strong { color: var(--success); }
.c-medium { color: var(--accent); }
.c-weak { color: var(--error); }

.card-meta { display: flex; gap: 6px; flex-wrap: wrap; }

.card-progress { display: flex; align-items: center; gap: 8px; }
.progress-bar { flex: 1; height: 2px; background: var(--line-strong); overflow: hidden; }
.progress-fill { height: 100%; background: var(--accent); transition: width 400ms; }
.progress-text { font: 400 9px var(--font-mono); color: var(--text-dim); min-width: 32px; text-align: right; }

.card-arrow {
  position: absolute; right: 20px; top: 50%; transform: translateX(8px) translateY(-50%);
  font: 500 18px var(--font-display); color: var(--accent);
  opacity: 0; transition: all 200ms cubic-bezier(0.16, 1, 0.3, 1);
}

/* Empty state */
.empty-state { display: grid; gap: 12px; justify-items: center; padding: 80px 32px; }
.empty-title { font: 600 18px var(--font-display); color: var(--text-muted); }
.empty-state code {
  padding: 2px 6px; background: var(--surface); color: var(--accent);
  font: 500 12px var(--font-mono);
}

@media (max-width: 768px) {
  .project-grid { grid-template-columns: 1fr; }
  .card-content { padding: 20px 16px; }
}
</style>
