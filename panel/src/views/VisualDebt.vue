<script setup>
import {
  debtItems,
  debtSummary,
  qualityIssues,
  runOverview,
} from '@/data/frontBrain.js'
</script>

<template>
  <div class="panel-page">
    <header class="page-header">
      <p class="page-eyebrow">Visual debt</p>
      <h1 class="page-title">Debt queue before autonomous approval</h1>
      <p class="page-copy">
        Visual debt is now a first-class output of the front-brain. It tracks unresolved craft,
        contrast, composition, and rhythm issues across sections and feeds the retry decision.
      </p>
    </header>

    <section class="metric-grid metric-grid--four">
      <article class="metric-card">
        <p class="metric-label">Open</p>
        <p class="metric-value">{{ debtSummary.open }}</p>
        <p class="metric-foot">issues still unresolved</p>
      </article>
      <article class="metric-card">
        <p class="metric-label">Critical</p>
        <p class="metric-value">{{ debtSummary.critical }}</p>
        <p class="metric-foot">must block approval</p>
      </article>
      <article class="metric-card">
        <p class="metric-label">Medium</p>
        <p class="metric-value">{{ debtSummary.medium }}</p>
        <p class="metric-foot">should auto-retry</p>
      </article>
      <article class="metric-card">
        <p class="metric-label">Retry state</p>
        <p class="metric-value">{{ runOverview.retriesUsed }}/{{ runOverview.retryBudget }}</p>
        <p class="metric-foot">budget currently in use</p>
      </article>
    </section>

    <section class="page-grid page-grid--two">
      <article class="surface-card">
        <header class="surface-header">
          <div>
            <p class="surface-eyebrow">Debt register</p>
            <h2 class="surface-title">Structured backlog by section</h2>
          </div>
        </header>

        <div class="table-shell">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Section</th>
                <th>Severity</th>
                <th>Owner</th>
                <th>Status</th>
                <th>Message</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in debtItems" :key="item.id">
                <td>{{ item.id }}</td>
                <td>{{ item.section }}</td>
                <td>{{ item.severity }}</td>
                <td>{{ item.owner }}</td>
                <td>{{ item.status }}</td>
                <td>{{ item.message }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>

      <article class="surface-card">
        <header class="surface-header">
          <div>
            <p class="surface-eyebrow">Composite backlog</p>
            <h2 class="surface-title">Observer and critic issues together</h2>
          </div>
        </header>

        <ul class="text-list">
          <li v-for="issue in qualityIssues" :key="issue.label">
            <span class="pill" :class="issue.severity === 'medium' ? 'pill--medium' : 'pill--accent'">
              {{ issue.label }}
            </span>
            <span>{{ issue.message }}</span>
          </li>
        </ul>
      </article>
    </section>
  </div>
</template>
