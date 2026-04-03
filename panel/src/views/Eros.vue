<script setup>
import { computed } from 'vue'
import {
  erosStats,
  erosRunHistory,
  erosMemoryRules,
  memoryTechniques,
  memoryFonts,
} from '@/data/frontBrain.js'

const maxScore = computed(() => {
  const scores = memoryTechniques.value.map((t) => t.score)
  return scores.length > 0 ? Math.max(...scores, 10) : 10
})
const maxUses = computed(() => {
  const uses = memoryTechniques.value.map((t) => t.uses)
  return uses.length > 0 ? Math.max(...uses, 1) : 1
})

const decLabel = { approve: 'Aprobado', retry: 'Reintentar', flag: 'Flag' }
</script>

<template>
  <div class="panel-page">
    <!-- HERO -->
    <div class="cell eros-hero">
      <p class="label">Sistema</p>
      <h1 class="eros-title">Eros <span class="eros-ver">v{{ erosStats.version }}</span></h1>
      <p class="body">Motor autonomo de generacion de frontends. Aprende de cada proyecto, acumula reglas, y mejora sus umbrales con cada iteracion.</p>
    </div>

    <!-- STATS -->
    <div class="grid-row grid-row--4">
      <div class="cell metric-cell">
        <p class="label">Proyectos</p>
        <p class="value">{{ erosStats.totalRuns }}</p>
        <p class="body-sm">runs procesados</p>
      </div>
      <div class="cell metric-cell">
        <p class="label">Blueprints</p>
        <p class="value">{{ erosStats.totalBlueprints }}</p>
        <p class="body-sm">heroes + navs disponibles</p>
      </div>
      <div class="cell metric-cell">
        <p class="label">Tecnicas</p>
        <p class="value">{{ erosStats.totalTechniqueUses }}<span class="suffix">x</span></p>
        <p class="body-sm">usos totales · avg {{ erosStats.avgTechniqueScore }}</p>
      </div>
      <div class="cell metric-cell">
        <p class="label">Reglas</p>
        <p class="value">{{ erosMemoryRules.length }}</p>
        <p class="body-sm">promovidas a produccion</p>
      </div>
    </div>

    <!-- RUN HISTORY TABLE + RULES -->
    <div class="grid-row grid-row--2">
      <div class="cell">
        <p class="label">Historial de runs</p>
        <div class="run-list">
          <div v-for="run in erosRunHistory" :key="run.id" class="run-row">
            <div class="run-bar" :style="{ width: Math.max(5, run.score * 10) + '%' }" :class="run.score >= 7 ? 'run-bar--ok' : run.score > 0 ? 'run-bar--mid' : 'run-bar--zero'"></div>
            <span class="run-label-name">{{ run.label }}</span>
            <span class="run-score-val">{{ (run.score ?? 0).toFixed(1) }}</span>
            <span class="pill" :class="run.decision === 'approve' ? 'pill--strong' : run.decision === 'flag' ? 'pill--weak' : 'pill--medium'">
              {{ decLabel[run.decision] || run.decision }}
            </span>
          </div>
        </div>
      </div>

      <div class="cell">
        <p class="label">Reglas descubiertas</p>
        <div class="rules-list">
          <div v-for="rule in erosMemoryRules" :key="rule.rule" class="rule-row">
            <span class="pill pill--accent">{{ rule.validations }}x</span>
            <span class="rule-text">{{ rule.rule }}</span>
            <span class="pill pill--strong">{{ rule.status }}</span>
          </div>
        </div>

        <p class="label" style="margin-top:24px">Fonts validadas</p>
        <div class="font-grid">
          <div v-for="f in memoryFonts" :key="f.display" class="font-card" :class="f.status === 'fail' ? 'font-card--fail' : ''">
            <span class="font-name">{{ f.display }}</span>
            <span class="body-sm">{{ f.body !== '—' ? f.body : '' }}</span>
            <span class="font-badge" :class="f.status === 'ok' ? '' : 'font-badge--fail'">{{ f.status === 'ok' ? 'OK' : 'NO' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- TECHNIQUES: full-width bar chart -->
    <div class="cell">
      <p class="label">Efectividad de tecnicas</p>
      <div class="tech-chart">
        <div v-for="t in memoryTechniques" :key="t.name" class="tc-row">
          <span class="tc-name">{{ t.name }}</span>
          <div class="tc-bars">
            <div class="tc-bar-wrap">
              <div class="tc-bar tc-bar--score" :style="{ width: (t.score / maxScore * 100) + '%' }" :class="t.score >= 7.5 ? 'tc-bar--ok' : t.score >= 7 ? '' : 'tc-bar--low'"></div>
              <span class="tc-val">{{ t.score }}</span>
            </div>
            <div class="tc-bar-wrap tc-bar-wrap--uses">
              <div class="tc-bar tc-bar--uses" :style="{ width: (t.uses / maxUses * 100) + '%' }"></div>
              <span class="tc-val tc-val--dim">{{ t.uses }}x</span>
            </div>
          </div>
        </div>
      </div>
      <div class="tc-legend">
        <span class="body-sm"><span class="tc-dot tc-dot--score"></span> Score promedio</span>
        <span class="body-sm"><span class="tc-dot tc-dot--uses"></span> Usos</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.eros-hero { display: grid; gap: 12px; }
.eros-title {
  font: 700 clamp(40px, 6vw, 64px)/0.9 var(--font-display);
  color: var(--text);
  letter-spacing: -0.04em;
}
.eros-ver { color: var(--accent); font-size: 0.5em; vertical-align: super; }

.metric-cell { display: grid; gap: 6px; align-content: end; min-height: 140px; }

/* ── Run history ── */
.run-list { display: grid; gap: 0; margin-top: 12px; }
.run-row {
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid var(--line);
  position: relative;
}
.run-row:last-child { border-bottom: 0; }
.run-bar {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  opacity: 0.06;
}
.run-bar--ok { background: var(--success); }
.run-bar--mid { background: var(--accent); }
.run-bar--zero { background: var(--text-dim); }
.run-label-name { font: 500 12px var(--font-body); color: var(--text); position: relative; z-index: 1; }
.run-score-val { font: 700 14px var(--font-mono); color: var(--text); position: relative; z-index: 1; }

/* ── Rules ── */
.rules-list { display: grid; gap: 0; margin-top: 12px; }
.rule-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid var(--line);
}
.rule-row:last-child { border-bottom: 0; }
.rule-text { font: 400 12px/1.4 var(--font-body); color: var(--text-muted); flex: 1; }

/* ── Font grid ── */
.font-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: var(--line); margin-top: 8px; }
.font-card {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: var(--bg);
}
.font-card--fail { opacity: 0.5; }
.font-name { font: 600 12px var(--font-display); color: var(--text); flex: 1; }
.font-badge {
  font: 700 9px var(--font-mono);
  color: var(--success);
  letter-spacing: 0.08em;
}
.font-badge--fail { color: var(--error); }

/* ── Technique chart ── */
.tech-chart { display: grid; gap: 8px; margin-top: 12px; }
.tc-row { display: grid; grid-template-columns: 160px 1fr; gap: 16px; align-items: center; }
.tc-name { font: 500 11px var(--font-body); color: var(--text-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tc-bars { display: grid; gap: 4px; }
.tc-bar-wrap { display: flex; align-items: center; gap: 8px; height: 12px; }
.tc-bar-wrap--uses { height: 6px; }
.tc-bar { height: 100%; transition: width 400ms ease; }
.tc-bar--score { background: var(--accent); }
.tc-bar--ok { background: var(--success); }
.tc-bar--low { background: var(--error); opacity: 0.7; }
.tc-bar--uses { background: var(--text-dim); }
.tc-val { font: 700 11px var(--font-mono); color: var(--text); flex-shrink: 0; min-width: 28px; }
.tc-val--dim { color: var(--text-dim); font-weight: 400; }

.tc-legend { display: flex; gap: 20px; margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--line); }
.tc-dot { display: inline-block; width: 8px; height: 8px; margin-right: 6px; vertical-align: middle; }
.tc-dot--score { background: var(--accent); }
.tc-dot--uses { background: var(--text-dim); }

@media (max-width: 1200px) {
  .grid-row--4 { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 980px) {
  .tc-row { grid-template-columns: 100px 1fr; }
  .font-grid { grid-template-columns: 1fr; }
}
</style>
