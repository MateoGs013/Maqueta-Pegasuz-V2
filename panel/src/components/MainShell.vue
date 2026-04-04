<script setup>
import { useRoute } from 'vue-router'
import PanelSwitcher from '@/components/PanelSwitcher.vue'

const route = useRoute()

const nav = [
  { to: '/projects', label: 'Proyectos', icon: '01' },
  { to: '/eros', label: 'Eros', icon: '02' },
  { to: '/eros/training', label: 'Training', icon: '03' },
  { to: '/workshop', label: 'Workshop', icon: '04' },
]

const isActive = (item) => {
  if (item.to === '/projects') return route.path.startsWith('/projects')
  if (item.to === '/eros/training') return route.path === '/eros/training'
  if (item.to === '/eros') return route.path.startsWith('/eros') && !route.path.startsWith('/eros/training')
  return route.path.startsWith(item.to)
}
</script>

<template>
  <div class="shell">
    <aside class="sidebar">
      <div class="sb-head">
        <span class="sb-logo">Pegasuz</span>
        <span class="sb-ver">EROS v8</span>
      </div>

      <nav class="sb-nav">
        <RouterLink
          v-for="item in nav" :key="item.to"
          :to="item.to"
          class="sb-link"
          :class="{ active: isActive(item) }"
        >
          <span class="sb-idx">{{ item.icon }}</span>
          <span class="sb-label">{{ item.label }}</span>
        </RouterLink>
      </nav>

      <div class="sb-foot"><span>.claude/ — v8</span></div>
    </aside>

    <main class="main-area">
      <RouterView />
    </main>

    <PanelSwitcher />
  </div>
</template>

<style scoped>
.shell { display: flex; height: 100vh; width: 100vw; overflow: hidden; }

.sidebar {
  width: 200px; flex-shrink: 0;
  display: flex; flex-direction: column;
  background: var(--bg); border-right: 1px solid var(--line);
}

.sb-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px; border-bottom: 1px solid var(--line);
}
.sb-logo { font: 700 14px var(--font-display); color: var(--text); letter-spacing: -0.03em; }
.sb-ver { font: 600 8px var(--font-mono); color: var(--accent); letter-spacing: 0.14em; }

.sb-nav { flex: 1; display: flex; flex-direction: column; padding: 8px 0; }
.sb-link {
  display: flex; align-items: center; gap: 10px;
  padding: 11px 20px; text-decoration: none;
  color: var(--text-muted); border-left: 2px solid transparent;
  transition: color 120ms, background 120ms;
}
.sb-link:hover { color: var(--text); background: var(--surface); }
.sb-link.active { color: var(--text); border-left-color: var(--accent); background: var(--accent-ember); }
.sb-link.active .sb-idx { color: var(--accent); }
.sb-idx { font: 500 9px var(--font-mono); color: var(--text-dim); letter-spacing: 0.1em; min-width: 18px; }
.sb-label { font: 500 13px var(--font-body); }

.sb-foot { padding: 12px 20px; border-top: 1px solid var(--line); font: 400 9px var(--font-mono); color: var(--text-dim); }

.main-area { flex: 1; overflow: hidden; display: flex; flex-direction: column; }

@media (max-width: 768px) {
  .sidebar { width: 100%; border-right: 0; border-bottom: 1px solid var(--line); }
  .sb-nav { flex-direction: row; overflow-x: auto; }
  .sb-link { border-left: 0; border-bottom: 2px solid transparent; padding: 10px 14px; }
  .sb-link.active { border-bottom-color: var(--accent); border-left: 0; }
  .shell { flex-direction: column; }
}
</style>
