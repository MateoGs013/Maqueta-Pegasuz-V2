<script setup>
import { runs } from '@/composables/useRuns.js'

const tone = (v) => v >= 8 ? 'strong' : v >= 5 ? 'medium' : 'weak'
const dec = { approve: 'Aprobado', retry: 'Reintentar', flag: 'Revisar', pending: 'Pendiente', 'quality-approved': 'QA Pass', stopped: 'Detenido' }
const ph = {
  discovery: 'Discovery', creative: 'Creative', scaffold: 'Scaffold',
  sections: 'Sections', motion: 'Motion', integration: 'Integration',
  retrospective: 'Retro', complete: 'Complete', pending: 'Pending',
  quality: 'Quality', build: 'Build', stopped: 'Stopped',
  'quality-approved': 'QA Pass',
}
const pct = (done, total) => total > 0 ? Math.round(done / total * 100) : 0
</script>

<template>
  <div class="list-page">
    <div class="cards">
      <router-link
        v-for="r in runs" :key="r.id"
        :to="`/projects/${r.id}`"
        class="card"
      >
        <!-- Score accent bar (left edge) -->
        <div class="card-accent" :class="`accent-${tone(r.score)}`"></div>

        <div class="card-body">
          <!-- Row 1: Name + Score -->
          <div class="card-header">
            <div class="card-identity">
              <span class="card-name">{{ r.name || r.label }}</span>
              <span class="card-type">{{ r.type }}</span>
            </div>
            <span class="card-score" :class="`sc-${tone(r.score)}`">{{ (r.score || 0).toFixed(1) }}</span>
          </div>

          <!-- Row 2: Score breakdown bar -->
          <div class="card-scorebar">
            <div class="scorebar-track">
              <div class="scorebar-fill" :class="`fill-${tone(r.score)}`" :style="{ width: Math.max(4, (r.score || 0) * 10) + '%' }"></div>
            </div>
          </div>

          <!-- Row 3: Status tags -->
          <div class="card-status">
            <span class="tag" :class="`tag-${tone(r.score)}`">{{ dec[r.decision] || r.decision }}</span>
            <span class="tag">{{ ph[r.phase] || r.phase }}</span>
          </div>

          <!-- Row 4: Progress -->
          <div class="card-progress">
            <span class="prog-label">Tareas</span>
            <div class="prog-bar">
              <div class="prog-fill" :style="{ width: pct(r.queueDone, r.queueTotal) + '%' }"></div>
            </div>
            <span class="prog-pct">{{ pct(r.queueDone, r.queueTotal) }}%</span>
            <span class="prog-count">{{ r.queueDone }}/{{ r.queueTotal }}</span>
          </div>

          <!-- Row 5: Debt indicator (if any) -->
          <div class="card-footer">
            <span v-if="r.debtOpen > 0" class="debt-indicator">
              <span class="debt-dot"></span>
              {{ r.debtOpen }} deuda{{ r.debtOpen > 1 ? 's' : '' }}
            </span>
            <span class="card-mode">{{ r.mode }}</span>
          </div>
        </div>
      </router-link>
    </div>

    <div v-if="!runs.length" class="empty">
      <p class="empty-msg">Sin proyectos</p>
      <p class="body-sm">Usa <code>/project</code> en Claude Code para crear uno.</p>
    </div>
  </div>
</template>

<style scoped>
.list-page { flex: 1; overflow-y: auto; }

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  max-width: 1200px;
  gap: 1px;
  background: var(--line);
  margin: 0;
}

.card {
  display: flex;
  background: var(--bg);
  text-decoration: none; color: inherit;
  transition: background 150ms;
  min-height: 160px;
}
.card:hover { background: var(--surface); }
.card:hover .card-name { color: var(--accent); }

/* Left accent bar */
.card-accent { width: 3px; flex-shrink: 0; }
.accent-strong { background: var(--success); }
.accent-medium { background: var(--accent); }
.accent-weak { background: var(--error); }

.card-body {
  flex: 1; padding: 20px 24px;
  display: flex; flex-direction: column; gap: 12px;
}

/* Header: name + score */
.card-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
.card-identity { display: grid; gap: 2px; }
.card-name {
  font: 600 15px/1.2 var(--font-display); color: var(--text);
  letter-spacing: -0.01em; transition: color 150ms;
}
.card-type { font: 400 10px var(--font-body); color: var(--text-muted); text-transform: capitalize; }

.card-score {
  font: 700 28px var(--font-display); letter-spacing: -0.04em; line-height: 1; flex-shrink: 0;
}
.sc-strong { color: var(--success); }
.sc-medium { color: var(--accent); }
.sc-weak { color: var(--error); }

/* Score bar */
.card-scorebar { padding: 0; }
.scorebar-track { height: 3px; background: var(--surface); overflow: hidden; }
.scorebar-fill { height: 100%; transition: width 400ms cubic-bezier(0.16, 1, 0.3, 1); }
.fill-strong { background: var(--success); }
.fill-medium { background: var(--accent); }
.fill-weak { background: var(--error); }

/* Status tags */
.card-status { display: flex; gap: 4px; }
.tag {
  font: 600 8px var(--font-mono); letter-spacing: 0.06em; text-transform: uppercase;
  padding: 3px 7px; border: 1px solid var(--line-strong); color: var(--text-muted);
}
.tag-strong { border-color: rgba(62, 232, 181, 0.3); color: var(--success); background: var(--success-soft); }
.tag-medium { border-color: var(--line-accent); color: var(--accent); background: var(--accent-ember); }
.tag-weak { border-color: rgba(255, 64, 64, 0.3); color: var(--error); background: var(--error-soft); }

/* Progress */
.card-progress {
  display: flex; align-items: center; gap: 8px;
}
.prog-label { font: 500 8px var(--font-mono); color: var(--text-dim); letter-spacing: 0.06em; text-transform: uppercase; min-width: 40px; }
.prog-bar { flex: 1; height: 2px; background: var(--surface); overflow: hidden; }
.prog-fill { height: 100%; background: var(--accent); transition: width 400ms; }
.prog-pct { font: 700 10px var(--font-mono); color: var(--text-muted); min-width: 28px; text-align: right; }
.prog-count { font: 400 9px var(--font-mono); color: var(--text-dim); }

/* Footer */
.card-footer {
  display: flex; align-items: center; justify-content: space-between;
  margin-top: auto;
}
.debt-indicator {
  display: flex; align-items: center; gap: 4px;
  font: 500 9px var(--font-mono); color: var(--warn); letter-spacing: 0.04em;
}
.debt-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--warn); }
.card-mode { font: 400 9px var(--font-mono); color: var(--text-dim); letter-spacing: 0.06em; }

/* Empty state */
.empty { padding: 80px 32px; text-align: center; background: var(--bg); }
.empty-msg { font: 600 16px var(--font-display); color: var(--text-muted); margin-bottom: 8px; }
.empty code { padding: 1px 4px; background: var(--surface); color: var(--accent); font: 500 11px var(--font-mono); }

@media (max-width: 700px) { .cards { grid-template-columns: 1fr; } }
@media (min-width: 1400px) { .cards { grid-template-columns: repeat(3, 1fr); } }
</style>
