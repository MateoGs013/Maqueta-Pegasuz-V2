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
    <!-- Table header -->
    <div class="list-head">
      <span class="col-name">Proyecto</span>
      <span class="col-score">Score</span>
      <span class="col-status">Estado</span>
      <span class="col-progress">Progreso</span>
      <span class="col-meta">Info</span>
    </div>

    <!-- Project rows -->
    <div class="list-body">
      <router-link
        v-for="r in runs" :key="r.id"
        :to="`/projects/${r.id}`"
        class="row"
      >
        <!-- Accent -->
        <div class="row-accent" :class="`accent-${tone(r.score)}`"></div>

        <!-- Name -->
        <div class="col-name">
          <span class="row-name">{{ r.name || r.label }}</span>
          <span class="row-type">{{ r.type }}</span>
        </div>

        <!-- Score -->
        <div class="col-score">
          <span class="row-score" :class="`sc-${tone(r.score)}`">{{ (r.score || 0).toFixed(1) }}</span>
        </div>

        <!-- Status tags -->
        <div class="col-status">
          <span class="tag" :class="`tag-${tone(r.score)}`">{{ dec[r.decision] || r.decision }}</span>
          <span class="tag">{{ ph[r.phase] || r.phase }}</span>
        </div>

        <!-- Progress -->
        <div class="col-progress">
          <div class="prog-bar">
            <div class="prog-fill" :style="{ width: pct(r.queueDone, r.queueTotal) + '%' }"></div>
          </div>
          <span class="prog-text">{{ pct(r.queueDone, r.queueTotal) }}%</span>
          <span class="prog-count">{{ r.queueDone }}/{{ r.queueTotal }}</span>
        </div>

        <!-- Meta -->
        <div class="col-meta">
          <span v-if="r.debtOpen > 0" class="debt">{{ r.debtOpen }} deuda{{ r.debtOpen > 1 ? 's' : '' }}</span>
          <span class="mode">{{ r.mode }}</span>
        </div>
      </router-link>
    </div>

    <div v-if="!runs.length" class="empty">
      <p>Sin proyectos. Usa <code>/project</code> para crear uno.</p>
    </div>
  </div>
</template>

<style scoped>
.list-page { flex: 1; display: flex; flex-direction: column; overflow: hidden; }

/* Header */
.list-head {
  display: grid;
  grid-template-columns: 220px 70px 200px 1fr 160px;
  gap: 16px; padding: 12px 24px 12px 28px;
  border-bottom: 1px solid var(--line);
  background: var(--bg); flex-shrink: 0;
}
.list-head span {
  font: 600 8px var(--font-mono); color: var(--text-dim);
  letter-spacing: 0.14em; text-transform: uppercase;
}

/* Body */
.list-body { flex: 1; overflow-y: auto; }

/* Row */
.row {
  display: grid;
  grid-template-columns: 3px 220px 70px 200px 1fr 160px;
  gap: 16px; align-items: center;
  padding: 16px 24px 16px 0;
  text-decoration: none; color: inherit;
  border-bottom: 1px solid var(--line);
  transition: background 120ms;
}
.row:hover { background: var(--surface); }
.row:hover .row-name { color: var(--accent); }
.row:last-child { border-bottom: 0; }

/* Accent bar */
.row-accent { width: 3px; height: 100%; align-self: stretch; }
.accent-strong { background: var(--success); }
.accent-medium { background: var(--accent); }
.accent-weak { background: var(--error); }

/* Name */
.col-name { display: grid; gap: 1px; }
.row-name {
  font: 600 14px/1.2 var(--font-display); color: var(--text);
  letter-spacing: -0.01em; transition: color 120ms;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.row-type { font: 400 10px var(--font-body); color: var(--text-muted); text-transform: capitalize; }

/* Score */
.col-score { text-align: right; }
.row-score { font: 700 20px var(--font-display); letter-spacing: -0.04em; line-height: 1; }
.sc-strong { color: var(--success); }
.sc-medium { color: var(--accent); }
.sc-weak { color: var(--error); }

/* Status */
.col-status { display: flex; gap: 4px; }
.tag {
  font: 600 8px var(--font-mono); letter-spacing: 0.06em; text-transform: uppercase;
  padding: 3px 7px; border: 1px solid var(--line-strong); color: var(--text-muted);
}
.tag-strong { border-color: rgba(62, 232, 181, 0.3); color: var(--success); background: var(--success-soft); }
.tag-medium { border-color: var(--line-accent); color: var(--accent); background: var(--accent-ember); }
.tag-weak { border-color: rgba(255, 64, 64, 0.3); color: var(--error); background: var(--error-soft); }

/* Progress */
.col-progress { display: flex; align-items: center; gap: 8px; }
.prog-bar { flex: 1; height: 2px; background: var(--surface); overflow: hidden; max-width: 120px; }
.prog-fill { height: 100%; background: var(--accent); }
.prog-text { font: 700 10px var(--font-mono); color: var(--text-muted); min-width: 28px; text-align: right; }
.prog-count { font: 400 9px var(--font-mono); color: var(--text-dim); }

/* Meta */
.col-meta { display: flex; align-items: center; gap: 8px; justify-content: flex-end; }
.debt { font: 500 9px var(--font-mono); color: var(--warn); }
.mode { font: 400 9px var(--font-mono); color: var(--text-dim); }

/* Empty */
.empty {
  flex: 1; display: flex; align-items: center; justify-content: center;
  font: 400 13px var(--font-body); color: var(--text-dim);
}
.empty code { padding: 1px 4px; background: var(--surface); color: var(--accent); font: 500 11px var(--font-mono); }

/* Responsive */
@media (max-width: 900px) {
  .list-head { display: none; }
  .row {
    grid-template-columns: 3px 1fr auto;
    gap: 8px; padding: 14px 16px 14px 0;
  }
  .col-status, .col-progress, .col-meta { display: none; }
}
</style>
