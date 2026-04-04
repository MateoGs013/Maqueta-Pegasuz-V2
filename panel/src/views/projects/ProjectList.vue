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
</script>

<template>
  <div class="list-page">
    <!-- Project cards -->
    <div class="cards">
      <router-link
        v-for="r in runs" :key="r.id"
        :to="`/projects/${r.id}`"
        class="card"
      >
        <div class="card-row-top">
          <div class="card-identity">
            <span class="card-name">{{ r.name || r.label }}</span>
            <span class="card-type">{{ r.type }}</span>
          </div>
          <span class="card-score" :class="`sc-${tone(r.score)}`">{{ (r.score || 0).toFixed(1) }}</span>
        </div>

        <div class="card-row-bottom">
          <div class="card-tags">
            <span class="tag" :class="`tag-${tone(r.score)}`">{{ dec[r.decision] || r.decision }}</span>
            <span class="tag">{{ ph[r.phase] || r.phase }}</span>
          </div>
          <div class="card-bar">
            <div class="bar-track">
              <div class="bar-fill" :style="{ width: (r.queueTotal > 0 ? r.queueDone / r.queueTotal * 100 : 0) + '%' }"></div>
            </div>
            <span class="bar-text">{{ r.queueDone }}/{{ r.queueTotal }}</span>
          </div>
        </div>
      </router-link>
    </div>

    <div v-if="!runs.length" class="empty">
      <p>Sin proyectos. Usa <code>/project</code> para crear uno.</p>
    </div>
  </div>
</template>

<style scoped>
.list-page {
  flex: 1; overflow-y: auto; padding: 0;
}

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1px;
  background: var(--line);
}

.card {
  display: grid; gap: 12px;
  padding: 20px 24px;
  background: var(--bg);
  text-decoration: none; color: inherit;
  transition: background 150ms;
}
.card:hover { background: var(--surface); }

.card-row-top {
  display: flex; align-items: flex-start; justify-content: space-between; gap: 12px;
}

.card-identity { display: grid; gap: 1px; }
.card-name { font: 600 14px/1.2 var(--font-display); color: var(--text); letter-spacing: -0.01em; }
.card-type { font: 400 10px var(--font-body); color: var(--text-muted); text-transform: capitalize; }

.card-score {
  font: 700 24px var(--font-display); letter-spacing: -0.04em; line-height: 1; flex-shrink: 0;
}
.sc-strong { color: var(--success); }
.sc-medium { color: var(--accent); }
.sc-weak { color: var(--error); }

.card-row-bottom {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
}

.card-tags { display: flex; gap: 4px; }
.tag {
  font: 600 8px var(--font-mono); letter-spacing: 0.06em; text-transform: uppercase;
  padding: 2px 6px; border: 1px solid var(--line-strong); color: var(--text-muted);
}
.tag-strong { border-color: rgba(62, 232, 181, 0.3); color: var(--success); }
.tag-medium { border-color: var(--line-accent); color: var(--accent); }
.tag-weak { border-color: rgba(255, 64, 64, 0.3); color: var(--error); }

.card-bar { display: flex; align-items: center; gap: 6px; }
.bar-track { width: 48px; height: 2px; background: var(--line-strong); overflow: hidden; }
.bar-fill { height: 100%; background: var(--accent); }
.bar-text { font: 400 8px var(--font-mono); color: var(--text-dim); }

.empty {
  padding: 80px 32px; text-align: center;
  font: 400 13px var(--font-body); color: var(--text-dim);
}
.empty code { padding: 1px 4px; background: var(--surface); color: var(--accent); font: 500 11px var(--font-mono); }

@media (max-width: 600px) {
  .cards { grid-template-columns: 1fr; }
}
</style>
