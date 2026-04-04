<script setup>
import { useRoute } from 'vue-router'
import { stats } from '@/composables/useMemory.js'
import { runs } from '@/composables/useRuns.js'

const route = useRoute()

const sections = [
  {
    label: 'WORKSPACE',
    items: [
      { to: '/projects', label: 'Proyectos', badge: () => runs.value.length },
      { to: '/workshop', label: 'Workshop' },
    ],
  },
  {
    label: 'BRAIN',
    items: [
      { to: '/eros', label: 'Eros' },
      { to: '/eros/training', label: 'Training' },
    ],
  },
]

const isActive = (to) => {
  if (to === '/projects') return route.path.startsWith('/projects')
  if (to === '/eros/training') return route.path === '/eros/training'
  if (to === '/eros') return route.path.startsWith('/eros') && !route.path.startsWith('/eros/training')
  return route.path.startsWith(to)
}
</script>

<template>
  <div class="shell">
    <aside class="sidebar">
      <div class="sb-head">
        <div class="sb-brand">
          <span class="sb-logo">Eros</span>
          <span class="sb-tagline">Creative Brain</span>
        </div>
        <span class="sb-ver">v8</span>
      </div>

      <!-- Memory pulse -->
      <div class="sb-pulse" v-if="stats">
        <div class="pulse-bar">
          <div class="pulse-fill" :style="{ width: Math.min(100, stats.totalDataPoints / 2) + '%' }"></div>
        </div>
        <span class="pulse-text">{{ stats.totalDataPoints }} data points</span>
      </div>

      <nav class="sb-nav">
        <template v-for="sec in sections" :key="sec.label">
          <span class="sb-section">{{ sec.label }}</span>
          <RouterLink
            v-for="item in sec.items" :key="item.to"
            :to="item.to"
            class="sb-link"
            :class="{ active: isActive(item.to) }"
          >
            <span class="sb-label">{{ item.label }}</span>
            <span v-if="item.badge" class="sb-badge">{{ item.badge() }}</span>
          </RouterLink>
        </template>
      </nav>

      <div class="sb-foot">
        <span class="sb-foot-dot"></span>
        <span>Sistema activo</span>
      </div>
    </aside>

    <main class="main-area">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.shell { display: flex; height: 100vh; width: 100vw; overflow: hidden; }

.sidebar {
  width: 220px; flex-shrink: 0;
  display: flex; flex-direction: column;
  background: var(--bg); border-right: 1px solid var(--line);
}

.sb-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 20px 16px;
}
.sb-brand { display: grid; gap: 1px; }
.sb-logo { font: 700 18px var(--font-display); color: var(--text); letter-spacing: -0.04em; }
.sb-tagline { font: 400 9px var(--font-mono); color: var(--text-dim); letter-spacing: 0.08em; text-transform: uppercase; }
.sb-ver {
  font: 700 9px var(--font-mono); color: var(--accent);
  letter-spacing: 0.12em; padding: 2px 6px;
  border: 1px solid var(--line-accent); background: var(--accent-ember);
}

/* Memory pulse indicator */
.sb-pulse { padding: 0 20px 16px; }
.pulse-bar {
  height: 2px; background: var(--surface); overflow: hidden; margin-bottom: 4px;
}
.pulse-fill {
  height: 100%; background: var(--accent);
  transition: width 1s cubic-bezier(0.16, 1, 0.3, 1);
}
.pulse-text { font: 400 9px var(--font-mono); color: var(--text-dim); letter-spacing: 0.06em; }

.sb-nav {
  flex: 1; display: flex; flex-direction: column; padding: 0;
  border-top: 1px solid var(--line);
}

.sb-section {
  font: 600 8px var(--font-mono); color: var(--text-dim);
  letter-spacing: 0.16em; text-transform: uppercase;
  padding: 16px 20px 6px;
}

.sb-link {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 20px; text-decoration: none;
  color: var(--text-muted); border-left: 2px solid transparent;
  transition: all 150ms cubic-bezier(0.16, 1, 0.3, 1);
}
.sb-link:hover { color: var(--text); background: var(--surface); padding-left: 24px; }
.sb-link.active {
  color: var(--text); border-left-color: var(--accent);
  background: var(--accent-ember); padding-left: 24px;
}
.sb-label { font: 500 13px var(--font-body); }
.sb-badge {
  font: 600 9px var(--font-mono); color: var(--accent);
  background: var(--accent-ember); padding: 1px 6px;
  border: 1px solid var(--line-accent);
}

.sb-foot {
  display: flex; align-items: center; gap: 8px;
  padding: 14px 20px; border-top: 1px solid var(--line);
  font: 400 9px var(--font-mono); color: var(--text-dim);
}
.sb-foot-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--success); box-shadow: 0 0 6px var(--success-soft);
  animation: pulse-dot 3s infinite;
}
@keyframes pulse-dot {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.main-area { flex: 1; overflow: hidden; display: flex; flex-direction: column; }

@media (max-width: 768px) {
  .sidebar { width: 100%; border-right: 0; border-bottom: 1px solid var(--line); }
  .sb-nav { flex-direction: row; overflow-x: auto; border-top: 0; }
  .sb-section { display: none; }
  .sb-pulse { display: none; }
  .sb-link { border-left: 0; border-bottom: 2px solid transparent; padding: 10px 14px; }
  .sb-link:hover { padding-left: 14px; }
  .sb-link.active { border-bottom-color: var(--accent); border-left: 0; padding-left: 14px; }
  .shell { flex-direction: column; }
}
</style>
