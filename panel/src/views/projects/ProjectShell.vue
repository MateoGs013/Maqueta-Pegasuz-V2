<script setup>
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getRunById } from '@/composables/useRuns.js'
import { fetchObserver } from '@/composables/useObserver.js'

const route = useRoute()
const router = useRouter()
const slug = computed(() => route.params.slug)
const run = computed(() => getRunById(slug.value))

// Fetch observer V2 data when project changes
watch(slug, (s) => { if (s) fetchObserver(s) }, { immediate: true })

const nav = computed(() => [
  { to: `/projects/${slug.value}`, label: 'Resumen', exact: true },
  { to: `/projects/${slug.value}/calidad`, label: 'Calidad' },
  { to: `/projects/${slug.value}/observer`, label: 'Observer' },
])

const isActive = (item) => {
  if (item.exact) return route.path === item.to
  return route.path.startsWith(item.to)
}
</script>

<template>
  <div class="pshell">
    <header class="pshell-header">
      <button class="pshell-back" @click="router.push('/projects')">← Proyectos</button>
      <div class="pshell-meta">
        <span class="pshell-score" :class="(run?.scorecard?.finalScore || 0) >= 8 ? 'c-ok' : (run?.scorecard?.finalScore || 0) >= 5 ? 'c-mid' : 'c-low'">
          {{ (run?.scorecard?.finalScore || 0).toFixed(1) }}
        </span>
        <div>
          <h1 class="pshell-name">{{ run?.project?.name || slug }}</h1>
          <p class="pshell-type">{{ run?.project?.type || '—' }}</p>
        </div>
      </div>
      <nav class="pshell-nav">
        <router-link
          v-for="item in nav" :key="item.to"
          :to="item.to"
          class="pshell-link"
          :class="{ active: isActive(item) }"
        >{{ item.label }}</router-link>
      </nav>
    </header>
    <main class="pshell-main">
      <RouterView :run="run" :slug="slug" />
    </main>
  </div>
</template>

<style scoped>
.pshell { display: flex; flex-direction: column; height: 100vh; overflow: hidden; }

.pshell-header {
  display: flex; align-items: center; gap: 24px;
  padding: 12px 32px; border-bottom: 1px solid var(--line);
  background: var(--bg); flex-shrink: 0;
}

.pshell-back {
  background: none; border: 1px solid var(--line); padding: 6px 12px;
  color: var(--text-muted); font: 500 10px var(--font-mono);
  letter-spacing: 0.06em; text-transform: uppercase; cursor: pointer;
  transition: all 0.15s;
}
.pshell-back:hover { color: var(--text); border-color: var(--accent); }

.pshell-meta { display: flex; align-items: center; gap: 12px; flex: 1; }
.pshell-score {
  font: 700 28px var(--font-display); letter-spacing: -0.04em; line-height: 1;
}
.c-ok { color: var(--success); }
.c-mid { color: var(--accent); }
.c-low { color: var(--error); }
.pshell-name { font: 600 14px/1.2 var(--font-display); color: var(--text); }
.pshell-type { font: 400 10px var(--font-body); color: var(--text-muted); margin-top: 2px; }

.pshell-nav { display: flex; gap: 0; }
.pshell-link {
  padding: 8px 16px; border: 1px solid var(--line); margin-left: -1px;
  color: var(--text-muted); font: 600 10px var(--font-mono);
  letter-spacing: 0.06em; text-transform: uppercase; text-decoration: none;
  transition: all 0.15s;
}
.pshell-link:first-child { margin-left: 0; }
.pshell-link:hover { color: var(--text); }
.pshell-link.active {
  color: var(--accent); border-color: var(--line-accent);
  background: var(--accent-ember); z-index: 1; position: relative;
}

.pshell-main { flex: 1; overflow: hidden; display: flex; flex-direction: column; }

@media (max-width: 768px) {
  .pshell-header { flex-wrap: wrap; padding: 12px 16px; gap: 12px; }
  .pshell-nav { width: 100%; }
  .pshell-link { flex: 1; text-align: center; }
}
</style>
