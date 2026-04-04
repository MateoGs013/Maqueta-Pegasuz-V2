<script setup>
import { computed } from 'vue'
import { stats, techniques, rules, fonts, patterns, revisions, calibration } from '@/composables/useMemory.js'
import { runs } from '@/composables/useRuns.js'

const maxScore = computed(() => {
  const scores = techniques.value.map(t => t.score)
  return scores.length > 0 ? Math.max(...scores, 10) : 10
})

const promoted = computed(() => rules.value.filter(r => r.status === 'promoted'))
const candidates = computed(() => rules.value.filter(r => r.status !== 'promoted'))
</script>

<template>
  <div class="panel-page">
    <!-- Hero -->
    <div class="cell eros-hero">
      <p class="label">Sistema</p>
      <h1 class="eros-title">Eros <span class="eros-ver">v8</span></h1>
      <p class="body">Motor autonomo de generacion de frontends. Aprende de cada proyecto, acumula reglas, y evoluciona su criterio.</p>
    </div>

    <!-- Stats -->
    <div class="grid-row grid-row--stats" v-if="stats">
      <div class="cell metric-cell">
        <p class="label">Data points</p>
        <p class="value-sm">{{ stats.totalDataPoints }}</p>
      </div>
      <div class="cell metric-cell">
        <p class="label">Proyectos</p>
        <p class="value-sm">{{ runs.length }}</p>
      </div>
      <div class="cell metric-cell">
        <p class="label">Tecnicas</p>
        <p class="value-sm">{{ stats.techniques }}</p>
      </div>
      <div class="cell metric-cell">
        <p class="label">Patterns</p>
        <p class="value-sm">{{ stats.patterns }}</p>
      </div>
      <div class="cell metric-cell">
        <p class="label">Reglas</p>
        <p class="value-sm">{{ stats.rules?.total || 0 }}</p>
        <p class="body-sm">{{ stats.rules?.promoted || 0 }} promoted</p>
      </div>
      <div class="cell metric-cell">
        <p class="label">Bias</p>
        <p class="value-sm">{{ calibration.globalBias?.toFixed(2) || '0' }}</p>
      </div>
    </div>

    <!-- Techniques + Rules -->
    <div class="grid-row grid-row--2">
      <div class="cell">
        <p class="label">Tecnicas</p>
        <div class="tech-list">
          <div v-for="t in techniques" :key="t.name" class="tech-row">
            <span class="tech-name">{{ t.name }}</span>
            <div class="tech-bar-wrap"><div class="tech-bar" :style="{ width: (t.score / maxScore * 100) + '%' }" :class="t.score >= 7.5 ? 'tech-bar--ok' : ''"></div></div>
            <span class="tech-score">{{ t.score }}</span>
            <span class="tech-uses">{{ t.uses }}x</span>
          </div>
        </div>
      </div>
      <div class="cell">
        <p class="label">Reglas promovidas</p>
        <div class="rules-list">
          <div v-for="r in promoted" :key="r.id" class="rule-row">
            <span class="pill pill--strong">{{ r.validations }}x</span>
            <span class="rule-text">{{ r.text }}</span>
          </div>
          <p v-if="!promoted.length" class="body-sm dim">Sin reglas promovidas</p>
        </div>
        <p class="label" style="margin-top:24px">Candidatas</p>
        <div class="rules-list">
          <div v-for="r in candidates" :key="r.id" class="rule-row">
            <span class="pill pill--accent">{{ r.validations }}/3</span>
            <span class="rule-text">{{ r.text }}</span>
          </div>
          <p v-if="!candidates.length" class="body-sm dim">Sin candidatas</p>
        </div>
      </div>
    </div>

    <!-- Fonts + Revisions -->
    <div class="grid-row grid-row--2">
      <div class="cell">
        <p class="label">Font pairings</p>
        <div class="font-list">
          <div v-for="f in fonts" :key="f.display" class="font-row">
            <span class="font-name">{{ f.display }}</span>
            <span class="body-sm">{{ f.body }}</span>
            <span class="pill" :class="f.status === 'ok' ? '' : 'pill--weak'">{{ f.status }}</span>
          </div>
        </div>
      </div>
      <div class="cell">
        <p class="label">Revision patterns</p>
        <div class="rev-list">
          <div v-for="r in revisions" :key="r.whatChanged" class="rev-row">
            <span class="body-sm">{{ r.project }}/{{ r.phase }}</span>
            <p class="body-sm" style="color:var(--text)">{{ r.pattern || r.whatChanged }}</p>
          </div>
          <p v-if="!revisions.length" class="body-sm dim">Sin revisiones</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.eros-hero { display: grid; gap: 12px; }
.eros-title { font: 700 clamp(40px, 6vw, 64px)/0.9 var(--font-display); color: var(--text); letter-spacing: -0.04em; }
.eros-ver { color: var(--accent); font-size: 0.5em; vertical-align: super; }
.grid-row--stats { grid-template-columns: repeat(6, 1fr); }
.metric-cell { display: grid; gap: 6px; align-content: end; min-height: 100px; }
.dim { color: var(--text-dim); font-style: italic; }

.tech-list { display: grid; gap: 4px; margin-top: 8px; }
.tech-row { display: grid; grid-template-columns: 140px 1fr 32px 24px; align-items: center; gap: 8px; }
.tech-name { font: 500 11px var(--font-body); color: var(--text-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tech-bar-wrap { height: 5px; background: var(--surface); }
.tech-bar { height: 100%; background: var(--accent); }
.tech-bar--ok { background: var(--success); }
.tech-score { font: 700 11px var(--font-mono); color: var(--text); text-align: right; }
.tech-uses { font: 400 10px var(--font-mono); color: var(--text-dim); }

.rules-list { display: grid; gap: 0; margin-top: 8px; }
.rule-row { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid var(--line); }
.rule-row:last-child { border-bottom: 0; }
.rule-text { font: 400 12px/1.4 var(--font-body); color: var(--text-muted); flex: 1; }

.font-list { display: grid; gap: 0; margin-top: 8px; }
.font-row { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid var(--line); }
.font-row:last-child { border-bottom: 0; }
.font-name { font: 600 12px var(--font-display); color: var(--text); min-width: 120px; }

.rev-list { display: grid; gap: 0; margin-top: 8px; }
.rev-row { padding: 8px 0; border-bottom: 1px solid var(--line); display: grid; gap: 2px; }
.rev-row:last-child { border-bottom: 0; }

@media (max-width: 1200px) { .grid-row--stats { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 768px) { .grid-row--stats { grid-template-columns: repeat(2, 1fr); } }
</style>
