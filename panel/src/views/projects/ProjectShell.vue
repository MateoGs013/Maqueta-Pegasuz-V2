<script setup>
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getRunById } from '@/composables/useRuns.js'
import { fetchObserver } from '@/composables/useObserver.js'

const route = useRoute()
const router = useRouter()
const slug = computed(() => route.params.slug)
const run = computed(() => getRunById(slug.value))

watch(slug, (s) => { if (s) fetchObserver(s) }, { immediate: true })

const nav = computed(() => [
  { to: `/projects/${slug.value}`, label: 'Resumen', exact: true },
  { to: `/projects/${slug.value}/calidad`, label: 'Calidad' },
])

const isActive = (item) => item.exact ? route.path === item.to : route.path.startsWith(item.to)
const scoreTone = (v) => v >= 8 ? 'ok' : v >= 5 ? 'mid' : 'low'
const decLabel = { approve: 'Aprobado', retry: 'Reintentar', flag: 'Revisar', pending: 'Pendiente' }
</script>

<template>
  <div class="ps">
    <!-- Top bar -->
    <header class="ps-bar">
      <button class="ps-back" @click="router.push('/projects')">
        <span class="ps-back-arrow">←</span>
        <span class="ps-back-label">Proyectos</span>
      </button>

      <div class="ps-identity">
        <h1 class="ps-name">{{ run?.project?.name || slug }}</h1>
        <div class="ps-meta-row">
          <span class="ps-type">{{ run?.project?.type || '—' }}</span>
          <span class="ps-dot">·</span>
          <span class="ps-phase">{{ run?.currentPhase || '—' }}</span>
          <span class="ps-dot">·</span>
          <span class="pill" :class="`pill--${scoreTone(run?.scorecard?.finalScore) === 'ok' ? 'strong' : scoreTone(run?.scorecard?.finalScore) === 'mid' ? 'accent' : 'weak'}`">
            {{ decLabel[run?.scorecard?.decision] || run?.scorecard?.decision }}
          </span>
        </div>
      </div>

      <div class="ps-score-block">
        <span class="ps-score" :class="`sc-${scoreTone(run?.scorecard?.finalScore)}`">
          {{ (run?.scorecard?.finalScore || 0).toFixed(1) }}
        </span>
        <span class="ps-score-label">score</span>
      </div>
    </header>

    <!-- Tab nav -->
    <nav class="ps-tabs">
      <router-link
        v-for="item in nav" :key="item.to"
        :to="item.to" class="ps-tab"
        :class="{ active: isActive(item) }"
      >{{ item.label }}</router-link>
    </nav>

    <!-- Content -->
    <main class="ps-main">
      <RouterView :run="run" :slug="slug" />
    </main>
  </div>
</template>

<style scoped>
.ps { display: flex; flex-direction: column; height: 100vh; overflow: hidden; }

.ps-bar {
  display: flex; align-items: center; gap: 20px;
  padding: 16px 32px; background: var(--bg);
  border-bottom: 1px solid var(--line); flex-shrink: 0;
}

.ps-back {
  display: flex; align-items: center; gap: 6px;
  background: none; border: 1px solid var(--line); padding: 6px 12px;
  color: var(--text-muted); cursor: pointer;
  transition: all 150ms cubic-bezier(0.16, 1, 0.3, 1);
}
.ps-back:hover { color: var(--accent); border-color: var(--line-accent); background: var(--accent-ember); }
.ps-back:hover .ps-back-arrow { transform: translateX(-2px); }
.ps-back-arrow { font: 500 14px var(--font-display); transition: transform 150ms; }
.ps-back-label { font: 600 9px var(--font-mono); letter-spacing: 0.06em; text-transform: uppercase; }

.ps-identity { flex: 1; display: grid; gap: 3px; }
.ps-name { font: 600 16px/1.2 var(--font-display); color: var(--text); letter-spacing: -0.02em; }
.ps-meta-row { display: flex; align-items: center; gap: 8px; }
.ps-type { font: 400 10px var(--font-body); color: var(--text-muted); text-transform: capitalize; }
.ps-phase { font: 500 10px var(--font-mono); color: var(--text-muted); letter-spacing: 0.04em; }
.ps-dot { color: var(--text-dim); }

.ps-score-block { display: grid; gap: 1px; text-align: center; }
.ps-score { font: 700 32px var(--font-display); letter-spacing: -0.04em; line-height: 1; }
.ps-score-label { font: 500 8px var(--font-mono); color: var(--text-dim); letter-spacing: 0.12em; text-transform: uppercase; }
.sc-ok { color: var(--success); }
.sc-mid { color: var(--accent); }
.sc-low { color: var(--error); }

.ps-tabs {
  display: flex; gap: 0; padding: 0 32px;
  background: var(--bg); border-bottom: 1px solid var(--line); flex-shrink: 0;
}
.ps-tab {
  padding: 10px 20px; text-decoration: none;
  color: var(--text-dim); font: 600 10px var(--font-mono);
  letter-spacing: 0.08em; text-transform: uppercase;
  border-bottom: 2px solid transparent; margin-bottom: -1px;
  transition: all 150ms;
}
.ps-tab:hover { color: var(--text-muted); }
.ps-tab.active { color: var(--accent); border-bottom-color: var(--accent); }

.ps-main { flex: 1; overflow: hidden; display: flex; flex-direction: column; }

@media (max-width: 768px) {
  .ps-bar { flex-wrap: wrap; padding: 12px 16px; gap: 12px; }
  .ps-score-block { display: flex; align-items: baseline; gap: 6px; }
  .ps-tabs { padding: 0 16px; overflow-x: auto; }
  .ps-tab { flex-shrink: 0; }
}
</style>
