<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useWorkshopStaging } from '@/composables/useWorkshopStaging.js'
import DiffViewer from '@/components/DiffViewer.vue'

const route = useRoute()
const router = useRouter()
const { dirtyCount, dirtyFiles, discardAll } = useWorkshopStaging()
const showDiff = ref(false)

const nav = [
  { to: '/workshop', label: 'Home', exact: true },
  { to: '/workshop/tokens', label: 'Tokens' },
  { to: '/workshop/components', label: 'Componentes' },
]

const isActive = (item) => {
  if (item.exact) return route.path === item.to
  return route.path.startsWith(item.to)
}

// Keyboard shortcuts
const onKeydown = (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault()
    if (dirtyCount.value) showDiff.value = true
  } else if (e.key === 'Escape' && showDiff.value) {
    showDiff.value = false
  } else if (e.key === '1') router.push('/workshop')
  else if (e.key === '2') router.push('/workshop/tokens')
  else if (e.key === '3') router.push('/workshop/components')
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div class="shell">
    <aside class="sidebar">
      <div class="sb-head">
        <span class="sb-logo">Workshop</span>
        <span class="sb-ver">ABM</span>
      </div>

      <nav class="sb-nav">
        <RouterLink v-for="(item, i) in nav" :key="item.to" :to="item.to" class="sb-link" :class="{ active: isActive(item) }">
          <span class="sb-idx">{{ String(i + 1).padStart(2, '0') }}</span>
          <span class="sb-label">{{ item.label }}</span>
        </RouterLink>
      </nav>

      <!-- Staging indicator -->
      <div class="sb-staging">
        <div class="sb-staging-row">
          <span class="sb-staging-dot" :class="{ dirty: dirtyCount > 0 }"></span>
          <span class="sb-staging-text" :class="{ 'has-changes': dirtyCount > 0 }">
            {{ dirtyCount > 0 ? `${dirtyCount} cambio${dirtyCount > 1 ? 's' : ''}` : 'Sin cambios' }}
          </span>
        </div>
        <div v-if="dirtyCount > 0" class="sb-staging-actions">
          <button class="sb-staging-btn sb-staging-btn--review" @click="showDiff = true">Revisar</button>
          <button class="sb-staging-btn" @click="discardAll">Descartar</button>
        </div>
      </div>

      <div class="sb-foot"><span>Workshop — local</span></div>
    </aside>

    <div class="main-area">
      <main class="main">
        <RouterView />
      </main>
    </div>

    <DiffViewer v-if="showDiff" @close="showDiff = false" @applied="showDiff = false" />
  </div>
</template>

<style scoped>
.shell { display: flex; height: 100vh; width: 100vw; overflow: hidden; }

.sidebar {
  width: var(--sidebar-w);
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  background: var(--bg);
  border-right: 1px solid var(--line);
}

.sb-head { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid var(--line); }
.sb-logo { font: 700 14px var(--font-display); color: var(--text); letter-spacing: -0.03em; }
.sb-ver  { font: 600 9px var(--font-mono); color: var(--info); letter-spacing: 0.14em; }

.sb-nav { flex: 1; display: flex; flex-direction: column; padding: 8px 0; }
.sb-link { display: flex; align-items: center; gap: 10px; padding: 11px 20px; text-decoration: none; color: var(--text-muted); border-left: 2px solid transparent; transition: color 120ms, background 120ms; }
.sb-link:hover { color: var(--text); background: var(--surface); }
.sb-link.active { color: var(--text); border-left-color: var(--info); background: var(--info-soft); }
.sb-link.active .sb-idx { color: var(--info); }
.sb-idx { font: 500 9px var(--font-mono); color: var(--text-dim); letter-spacing: 0.1em; min-width: 18px; }
.sb-label { font: 500 13px var(--font-body); }

.sb-staging { display: grid; gap: 8px; padding: 12px 20px; border-top: 1px solid var(--line); }
.sb-staging-row { display: flex; align-items: center; gap: 8px; }
.sb-staging-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--text-dim); flex-shrink: 0; transition: background 200ms; }
.sb-staging-dot.dirty { background: var(--warn); box-shadow: 0 0 6px var(--warn-soft); }
.sb-staging-text { font: 400 10px var(--font-mono); color: var(--text-dim); transition: color 200ms; }
.sb-staging-text.has-changes { color: var(--warn); }
.sb-staging-actions { display: flex; gap: 4px; }
.sb-staging-btn {
  flex: 1; padding: 5px 8px; border: 1px solid var(--line-strong); background: transparent;
  color: var(--text-muted); font: 600 9px var(--font-mono); letter-spacing: 0.06em; text-transform: uppercase;
  cursor: pointer; transition: color 120ms, border-color 120ms, background 120ms;
}
.sb-staging-btn:hover { color: var(--text); }
.sb-staging-btn--review { border-color: rgba(96, 165, 250, 0.3); color: var(--info); }
.sb-staging-btn--review:hover { background: var(--info-soft); }

.sb-foot { padding: 12px 20px; border-top: 1px solid var(--line); font: 400 9px var(--font-mono); color: var(--text-dim); }

.main-area { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
.main { flex: 1; overflow: hidden; display: flex; flex-direction: column; }

@media (max-width: 960px) {
  .shell { flex-direction: column; height: auto; min-height: 100vh; }
  .sidebar { width: 100%; border-right: 0; border-bottom: 1px solid var(--line); }
}
</style>
