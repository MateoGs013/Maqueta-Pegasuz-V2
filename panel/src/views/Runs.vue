<script setup>
import {
  designMetrics,
  directionCandidates,
  healthCards,
  observerSignals,
  queueColumns,
  rules,
  runOverview,
  scoreSummary,
  thresholds,
} from '@/data/frontBrain.js'

const queueTone = {
  active: 'strong',
  pending: 'medium',
  done: 'accent',
}
</script>

<template>
  <div class="panel-page">
    <header class="page-header">
      <p class="page-eyebrow">Run orchestration</p>
      <h1 class="page-title">Autonomous run control for {{ runOverview.project.name }}</h1>
      <p class="page-copy">
        This panel now reads the hybrid front-brain contract directly: live state, queue, rules,
        quality signals, and the next action the brain should take without waiting for a human.
      </p>
    </header>

    <section class="metric-grid metric-grid--four">
      <article v-for="card in healthCards" :key="card.label" class="metric-card">
        <p class="metric-label">{{ card.label }}</p>
        <p class="metric-value">
          {{ card.value }}<span class="metric-suffix">{{ card.suffix }}</span>
        </p>
        <p class="metric-foot">{{ card.note }}</p>
      </article>
    </section>

    <section class="page-grid page-grid--two">
      <article class="surface-card">
        <header class="surface-header">
          <div>
            <p class="surface-eyebrow">Live state</p>
            <h2 class="surface-title">{{ runOverview.currentTask }}</h2>
          </div>
          <span class="pill pill--medium">{{ runOverview.mode }}</span>
        </header>

        <div class="pill-row">
          <span class="pill pill--accent">{{ runOverview.sourceType }}</span>
          <span v-if="runOverview.legacyBridge" class="pill pill--weak">legacy bridge</span>
        </div>

        <div class="detail-grid">
          <div>
            <p class="detail-label">Active page</p>
            <p class="detail-value">{{ runOverview.activePage }}</p>
          </div>
          <div>
            <p class="detail-label">Active section</p>
            <p class="detail-value">{{ runOverview.activeSection }}</p>
          </div>
          <div>
            <p class="detail-label">Current focus</p>
            <p class="detail-value">{{ runOverview.currentFocus }}</p>
          </div>
          <div>
            <p class="detail-label">Last review</p>
            <p class="detail-value">{{ runOverview.lastReviewAt.slice(0, 10) }}</p>
          </div>
        </div>

        <div class="notice-card">
          <p class="detail-label">Next autonomous action</p>
          <p class="detail-copy">{{ runOverview.nextAction }}</p>
          <p class="detail-copy">Source: {{ runOverview.sourcePath }}</p>
        </div>

        <div class="queue-board">
          <article
            v-for="column in queueColumns"
            :key="column.key"
            class="queue-column"
          >
            <header class="queue-header">
              <span class="pill" :class="`pill--${queueTone[column.key]}`">{{ column.label }}</span>
              <span class="queue-count">{{ column.items.length }}</span>
            </header>
            <ul class="queue-list">
              <li v-for="item in column.items" :key="item.id" class="queue-item">
                <p class="queue-item-title">{{ item.id }}</p>
                <p class="queue-item-meta">{{ item.agent }} · {{ item.status }}</p>
                <p v-if="item.dependsOn?.length" class="queue-item-deps">
                  depends on {{ item.dependsOn.join(', ') }}
                </p>
              </li>
            </ul>
          </article>
        </div>
      </article>

      <article class="surface-card">
        <header class="surface-header">
          <div>
            <p class="surface-eyebrow">Approval engine</p>
            <h2 class="surface-title">Observer + critic + memory alignment</h2>
          </div>
        </header>

        <div class="score-stack">
          <div v-for="score in scoreSummary" :key="score.label" class="score-row">
            <div>
              <p class="detail-label">{{ score.label }}</p>
              <p class="detail-copy">{{ score.detail }}</p>
            </div>
            <span class="pill" :class="`pill--${score.tone}`">{{ score.value.toFixed(1) }}</span>
          </div>
        </div>

        <div class="surface-subsection">
          <p class="surface-kicker">Thresholds</p>
          <div class="pill-row">
            <span v-for="threshold in thresholds" :key="threshold.label" class="pill pill--accent">
              {{ threshold.label }}: {{ threshold.value }}
            </span>
          </div>
        </div>

        <div class="surface-subsection">
          <p class="surface-kicker">Hard rules and biases</p>
          <ul class="text-list">
            <li v-for="rule in rules" :key="rule.id">
              <span class="pill" :class="`pill--${rule.tone}`">{{ rule.type }}</span>
              <span>{{ rule.text }}</span>
            </li>
          </ul>
        </div>
      </article>
    </section>

    <section class="page-grid page-grid--two">
      <article class="surface-card">
        <header class="surface-header">
          <div>
            <p class="surface-eyebrow">Direction selector</p>
            <h2 class="surface-title">Three non-generic seed directions</h2>
          </div>
        </header>

        <div class="direction-stack">
          <article v-for="direction in directionCandidates" :key="direction.id" class="direction-card">
            <div class="direction-copy">
              <p class="direction-label">{{ direction.id }} · {{ direction.label }}</p>
              <p class="direction-detail">
                {{ direction.hero.label }} + {{ direction.nav.label }}
              </p>
              <p class="detail-copy">{{ direction.rationale }}</p>
            </div>
            <div class="pill-row pill-row--compact">
              <span class="pill pill--accent">{{ direction.hero.compositionFamily }}</span>
              <span class="pill pill--medium">{{ direction.nav.motionFamily }}</span>
            </div>
          </article>
        </div>
      </article>

      <article class="surface-card">
        <header class="surface-header">
          <div>
            <p class="surface-eyebrow">Quality signals</p>
            <h2 class="surface-title">Deterministic run snapshot</h2>
          </div>
        </header>

        <div class="metric-stack">
          <div v-for="metric in designMetrics" :key="metric.label" class="score-row">
            <div>
              <p class="detail-label">{{ metric.label }}</p>
              <p class="detail-copy">{{ metric.note }}</p>
            </div>
            <span class="pill pill--accent">{{ metric.value }}</span>
          </div>
        </div>

        <div class="surface-subsection">
          <p class="surface-kicker">Observer dimensions</p>
          <div class="pill-row">
            <span
              v-for="signal in observerSignals"
              :key="signal.id"
              class="pill"
              :class="`pill--${signal.tone}`"
            >
              {{ signal.label }}: {{ signal.value }}
            </span>
          </div>
        </div>
      </article>
    </section>
  </div>
</template>

<style scoped>
.queue-board {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.queue-column {
  display: grid;
  gap: 12px;
  padding: 14px;
  border-radius: 18px;
  border: 1px solid var(--p-border-light);
  background: rgba(255, 255, 255, 0.02);
}

.queue-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.queue-count {
  color: var(--p-subtle);
  font: 500 10px var(--p-mono);
  letter-spacing: 0.1em;
}

.queue-list {
  display: grid;
  gap: 10px;
  list-style: none;
}

.queue-item {
  display: grid;
  gap: 4px;
}

.queue-item-title {
  color: var(--p-text-strong);
  font: 500 13px/1.4 var(--p-body);
}

.queue-item-meta,
.queue-item-deps,
.direction-label,
.direction-detail {
  color: var(--p-muted);
  font: 400 12px/1.5 var(--p-body);
}

.score-stack,
.metric-stack,
.direction-stack {
  display: grid;
  gap: 12px;
}

.direction-card {
  display: grid;
  gap: 12px;
  padding: 16px;
  border-radius: 18px;
  border: 1px solid var(--p-border-light);
  background: rgba(255, 255, 255, 0.02);
}

.direction-copy {
  display: grid;
  gap: 4px;
}

@media (max-width: 1120px) {
  .queue-board {
    grid-template-columns: 1fr;
  }
}
</style>
