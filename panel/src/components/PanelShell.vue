<script setup>
import { useRoute } from 'vue-router'
import { panelMeta, runOverview } from '@/data/frontBrain.js'

const route = useRoute()

const nav = [
  { to: '/', label: 'Runs', badge: `${panelMeta.queueOpen}` },
  { to: '/blueprints', label: 'Blueprints', badge: `${panelMeta.blueprintCount}` },
  { to: '/design-dna', label: 'Design DNA' },
  { to: '/observer', label: 'Observer' },
  { to: '/visual-debt', label: 'Visual Debt', badge: `${panelMeta.visualDebtOpen}` },
  { to: '/decisions', label: 'Decisions' },
]

const isActive = (to) => {
  if (to === '/') return route.path === '/'
  return route.path.startsWith(to)
}
</script>

<template>
  <div class="shell">
    <aside class="sidebar">
      <div class="brand-block">
        <p class="brand-kicker">Maqueta</p>
        <h1 class="brand-title">Front-Brain Console</h1>
        <p class="brand-copy">Claude-first backoffice for runs, seeds, quality signals, and decisions.</p>
      </div>

      <div class="run-card">
        <p class="run-label">Active run</p>
        <h2 class="run-title">{{ panelMeta.projectName }}</h2>
        <p class="run-type">{{ panelMeta.projectType }}</p>
        <div class="run-score-row">
          <div>
            <p class="run-score">{{ panelMeta.finalScore.toFixed(1) }}</p>
            <p class="run-score-label">combined score</p>
          </div>
          <div class="run-score-meta">
            <span class="run-chip">{{ runOverview.currentPhase }}</span>
            <span class="run-chip">{{ runOverview.decision }}</span>
          </div>
        </div>
      </div>

      <nav class="sidenav" aria-label="Panel navigation">
        <RouterLink
          v-for="item in nav"
          :key="item.to"
          :to="item.to"
          class="nav-item"
          :class="{ active: isActive(item.to) }"
        >
          <span class="nav-index" aria-hidden="true">{{ String(nav.indexOf(item) + 1).padStart(2, '0') }}</span>
          <span class="nav-label">{{ item.label }}</span>
          <span v-if="item.badge" class="nav-badge">{{ item.badge }}</span>
        </RouterLink>
      </nav>

      <div class="sidebar-footer">
        <span class="footer-text">Canonical namespace: `.claude/`</span>
      </div>
    </aside>

    <main class="content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.shell {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.sidebar {
  width: var(--sidebar-w, 280px);
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  background: var(--p-sidebar);
  border-right: 1px solid var(--p-border-light);
  overflow: hidden;
  padding: 22px 18px 18px;
  gap: 18px;
}

.brand-block {
  display: grid;
  gap: 8px;
}

.brand-kicker {
  font: 500 10px var(--p-mono);
  color: var(--p-accent);
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.brand-title {
  font: 500 26px/1 var(--p-display);
  color: var(--p-text-strong);
  letter-spacing: -0.04em;
}

.brand-copy {
  color: var(--p-muted);
  font: 400 13px/1.5 var(--p-body);
}

.run-card {
  display: grid;
  gap: 10px;
  padding: 16px;
  border: 1px solid var(--p-border-light);
  border-radius: 22px;
  background:
    radial-gradient(circle at top right, rgba(196, 132, 62, 0.16), transparent 50%),
    rgba(255, 255, 255, 0.02);
}

.run-label,
.run-score-label {
  font: 500 10px var(--p-mono);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--p-subtle);
}

.run-title {
  font: 500 22px/1 var(--p-display);
  color: var(--p-text-strong);
  letter-spacing: -0.04em;
}

.run-type {
  color: var(--p-muted);
  font: 400 12px/1.4 var(--p-body);
}

.run-score-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
}

.run-score {
  font: 500 34px/1 var(--p-display);
  color: var(--p-text-strong);
}

.run-score-meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.run-chip {
  padding: 5px 8px;
  border-radius: 999px;
  border: 1px solid var(--p-accent-bdr);
  background: rgba(196, 132, 62, 0.08);
  color: var(--p-accent-soft);
  font: 500 10px var(--p-mono);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.sidenav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  overflow-y: auto;
  padding-right: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 14px;
  text-decoration: none;
  color: var(--p-muted);
  transition: background 0.18s, color 0.18s, border-color 0.18s;
  cursor: pointer;
  border: 1px solid transparent;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.03);
  color: var(--p-text-strong);
}

.nav-item.active {
  background: rgba(196, 132, 62, 0.08);
  color: var(--p-text-strong);
  border-color: var(--p-accent-bdr);
}

.nav-item.active .nav-index {
  color: var(--p-accent);
}

.nav-index {
  font: 500 10px var(--p-mono);
  color: var(--p-subtle);
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.nav-label {
  font: 400 13px var(--p-body);
  flex: 1;
}

.nav-badge {
  min-width: 22px;
  height: 22px;
  padding: 0 8px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.04);
  font: 500 10px var(--p-mono);
  color: var(--p-text);
}

.sidebar-footer {
  border-top: 1px solid var(--p-border-light);
  padding-top: 14px;
}

.footer-text {
  font: 400 10px/1.5 var(--p-mono);
  color: var(--p-subtle);
  letter-spacing: 0.06em;
}

.content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

@media (max-width: 1100px) {
  .sidebar {
    width: 248px;
  }
}

@media (max-width: 960px) {
  .shell {
    flex-direction: column;
    height: auto;
    min-height: 100vh;
  }

  .sidebar {
    width: 100%;
    border-right: 0;
    border-bottom: 1px solid var(--p-border-light);
  }

  .content {
    min-height: 0;
  }
}
</style>
