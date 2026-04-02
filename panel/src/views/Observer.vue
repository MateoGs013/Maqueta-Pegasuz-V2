<script setup>
import {
  criticNotes,
  frontBrainSnapshot,
  observerGates,
  observerSignals,
  qualityIssues,
  retryInstructions,
  scoreSummary,
} from '@/data/frontBrain.js'
</script>

<template>
  <div class="panel-page">
    <header class="page-header">
      <p class="page-eyebrow">Observer and critic</p>
      <h1 class="page-title">Deterministic QA plus multimodal judgment</h1>
      <p class="page-copy">
        The observer layer enforces hard visual gates while the critic evaluates tension, brand
        drift, and genericity. Approval emerges from the composite score, not from a single pass.
      </p>
    </header>

    <section class="metric-grid metric-grid--four">
      <article v-for="score in scoreSummary" :key="score.label" class="metric-card">
        <p class="metric-label">{{ score.label }}</p>
        <p class="metric-value">{{ score.value.toFixed(1) }}</p>
        <p class="metric-foot">{{ score.detail }}</p>
      </article>
    </section>

    <section class="page-grid page-grid--two">
      <article class="surface-card">
        <header class="surface-header">
          <div>
            <p class="surface-eyebrow">Observer report</p>
            <h2 class="surface-title">{{ frontBrainSnapshot.observer.runId }}</h2>
          </div>
          <span class="pill pill--accent">{{ frontBrainSnapshot.observer.target }}</span>
        </header>

        <div class="surface-subsection">
          <p class="surface-kicker">Signals</p>
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

        <div class="surface-subsection">
          <p class="surface-kicker">Hard gates</p>
          <div class="pill-row">
            <span
              v-for="gate in observerGates"
              :key="gate.id"
              class="pill"
              :class="`pill--${gate.tone}`"
            >
              {{ gate.label }}: {{ gate.value }}
            </span>
          </div>
        </div>

        <div class="surface-subsection">
          <p class="surface-kicker">Viewport coverage</p>
          <div class="pill-row">
            <span v-for="viewport in frontBrainSnapshot.observer.viewports" :key="viewport" class="pill pill--accent">
              {{ viewport }}px
            </span>
          </div>
        </div>
      </article>

      <article class="surface-card">
        <header class="surface-header">
          <div>
            <p class="surface-eyebrow">Critic report</p>
            <h2 class="surface-title">{{ frontBrainSnapshot.critic.runId }}</h2>
          </div>
          <span class="pill pill--medium">{{ frontBrainSnapshot.critic.verdict }}</span>
        </header>

        <div class="surface-subsection">
          <p class="surface-kicker">Critic notes</p>
          <ul class="text-list">
            <li v-for="note in criticNotes" :key="note">{{ note }}</li>
          </ul>
        </div>

        <div class="surface-subsection">
          <p class="surface-kicker">Retry instructions</p>
          <ul class="text-list">
            <li v-for="instruction in retryInstructions" :key="instruction">{{ instruction }}</li>
          </ul>
        </div>
      </article>
    </section>

    <section class="surface-card">
      <header class="surface-header">
        <div>
          <p class="surface-eyebrow">Open issues</p>
          <h2 class="surface-title">Signals still blocking approval</h2>
        </div>
      </header>
      <div class="issue-grid">
        <article v-for="issue in qualityIssues" :key="issue.label" class="issue-card">
          <div class="issue-head">
            <span class="pill" :class="issue.severity === 'medium' ? 'pill--medium' : 'pill--accent'">
              {{ issue.source }}
            </span>
            <span class="issue-label">{{ issue.label }}</span>
          </div>
          <h3 class="issue-title">{{ issue.title }}</h3>
          <p class="detail-copy">{{ issue.message }}</p>
        </article>
      </div>
    </section>
  </div>
</template>

<style scoped>
.issue-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.issue-card {
  display: grid;
  gap: 10px;
  padding: 16px;
  border-radius: 18px;
  border: 1px solid var(--p-border-light);
  background: rgba(255, 255, 255, 0.02);
}

.issue-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.issue-label {
  color: var(--p-subtle);
  font: 500 10px var(--p-mono);
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.issue-title {
  color: var(--p-text-strong);
  font: 500 16px/1.2 var(--p-display);
}

@media (max-width: 980px) {
  .issue-grid {
    grid-template-columns: 1fr;
  }
}
</style>
