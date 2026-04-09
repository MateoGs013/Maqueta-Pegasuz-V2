<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import { excellence, hasV2 } from '@/composables/useObserver.js'

const props = defineProps({ run: Object, slug: String })

const scorecard = computed(() => props.run?.scorecard || {})
const queue = computed(() => props.run?.queue || { active: [], pending: [], done: [] })
const health = computed(() => [
  { label: 'Salud', value: props.run?.healthIndex ?? 0, suffix: '/100' },
  { label: 'Madurez', value: props.run?.maturityScore ?? 0, suffix: '/100' },
  { label: 'Deuda', value: props.run?.visualDebt?.summary?.open ?? 0, suffix: ' open' },
  { label: 'Reintentos', value: `${props.run?.retriesUsed ?? 0}/${props.run?.retryBudget ?? 3}`, suffix: '' },
])

const dims = computed(() => {
  const e = excellence.value
  if (!e) return []
  return ['composition', 'depth', 'typography', 'motion', 'craft'].map(k => ({
    key: k, score: e[k]?.score, signal: e[k]?.signal,
  }))
})

const tone = (v) => v >= 8 ? 'strong' : v >= 5 ? 'medium' : 'weak'
const decLabel = { approve: 'Aprobado', retry: 'Reintentar', flag: 'Revisar', pending: 'Pendiente' }

// ── Vercel deploy state ──
const deployUrl = ref(null)
const deployedAt = ref(null)
const deploying = ref(false)
const deployError = ref(null)

const loadDeployInfo = async () => {
  if (!props.slug) return
  try {
    const res = await fetch('/__eros/training/deploys')
    const data = await res.json()
    const entry = data?.deploys?.[props.slug]
    if (entry) {
      deployUrl.value = entry.url
      deployedAt.value = entry.deployedAt
    } else {
      deployUrl.value = null
      deployedAt.value = null
    }
  } catch {}
}

const deployNow = async () => {
  if (!props.slug || deploying.value) return
  deploying.value = true
  deployError.value = null
  try {
    const res = await fetch('/__eros/training/deploy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: props.slug }),
    })
    const data = await res.json()
    if (data.ok && data.url) {
      deployUrl.value = data.url
      deployedAt.value = new Date().toISOString()
    } else {
      deployError.value = data.error || 'Deploy failed'
    }
  } catch (e) {
    deployError.value = e.message
  } finally {
    deploying.value = false
  }
}

onMounted(loadDeployInfo)
watch(() => props.slug, loadDeployInfo)
</script>

<template>
  <div class="panel-page">
    <!-- Hero score -->
    <div class="grid-row" style="grid-template-columns: auto 1fr">
      <div class="cell" style="min-width:200px">
        <p class="label">Score</p>
        <p class="hero-num" :class="`c-${tone(scorecard.finalScore)}`">{{ (scorecard.finalScore ?? 0).toFixed(1) }}</p>
        <span class="pill" :class="`pill--${tone(scorecard.finalScore)}`">{{ decLabel[scorecard.decision] || scorecard.decision }}</span>
      </div>
      <div class="cell" style="display:grid;gap:8px;align-content:end">
        <p class="body">{{ props.run?.nextAction || 'Sin accion pendiente' }}</p>
        <p class="body-sm">{{ props.run?.mode }} · {{ props.run?.currentPhase }}</p>
      </div>
    </div>

    <!-- Health -->
    <div class="grid-row grid-row--4">
      <div v-for="h in health" :key="h.label" class="cell metric-cell">
        <p class="label">{{ h.label }}</p>
        <p class="value-sm">{{ h.value }}<span class="suffix">{{ h.suffix }}</span></p>
      </div>
    </div>

    <!-- Excellence V2 or V1 signals -->
    <div class="cell">
      <p class="label">Observer{{ hasV2 ? ' V2' : '' }}</p>
      <div v-if="dims.length" class="pills" style="margin-top:8px">
        <span v-for="d in dims" :key="d.key" class="pill" :class="`pill--${tone(d.score)}`">
          {{ d.key }}: {{ d.score?.toFixed(1) }}
        </span>
      </div>
      <div v-else class="pills" style="margin-top:8px">
        <span class="pill">Observer: {{ scorecard.observerScore?.toFixed(1) || '—' }}</span>
        <span class="pill">Critic: {{ scorecard.criticScore?.toFixed(1) || '—' }}</span>
      </div>
    </div>

    <!-- Queue -->
    <div class="cell">
      <p class="label">Cola de tareas</p>
      <div class="queue-row">
        <div class="queue-stat">
          <span class="value-sm">{{ queue.done?.length || 0 }}</span>
          <span class="body-sm">completas</span>
        </div>
        <div class="queue-stat">
          <span class="value-sm">{{ queue.active?.length || 0 }}</span>
          <span class="body-sm">activas</span>
        </div>
        <div class="queue-stat">
          <span class="value-sm">{{ queue.pending?.length || 0 }}</span>
          <span class="body-sm">pendientes</span>
        </div>
      </div>
    </div>

    <!-- Retry instructions -->
    <div v-if="scorecard.retryInstructions?.length" class="cell">
      <p class="label">Instrucciones de reintento</p>
      <ol class="ol">
        <li v-for="(inst, i) in scorecard.retryInstructions" :key="i">{{ inst }}</li>
      </ol>
    </div>

    <!-- Vercel preview deploy -->
    <div class="cell deploy-cell">
      <div class="deploy-row">
        <div class="deploy-info">
          <p class="label">Preview Vercel</p>
          <template v-if="deployUrl">
            <a :href="deployUrl" target="_blank" rel="noopener" class="deploy-url">{{ deployUrl }}</a>
            <p class="body-sm" v-if="deployedAt">Último deploy: {{ new Date(deployedAt).toLocaleString('es-AR') }}</p>
          </template>
          <p v-else-if="!deploying" class="body-sm dim">Sin deploy previo — click para publicar a Vercel</p>
          <p v-else class="body-sm">Deployando... puede tardar 1-2 min (build + upload)</p>
          <p v-if="deployError" class="body-sm deploy-error">{{ deployError }}</p>
        </div>
        <div class="deploy-actions">
          <a v-if="deployUrl" :href="deployUrl" target="_blank" rel="noopener" class="btn-deploy btn-deploy--open" title="Abrir preview">↗</a>
          <button class="btn-deploy" @click="deployNow" :disabled="deploying">
            {{ deploying ? 'Deployando...' : deployUrl ? 'Re-deploy' : 'Deploy ↗' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hero-num { font: 700 clamp(64px, 10vw, 96px)/0.82 var(--font-display); letter-spacing: -0.05em; }
.c-strong { color: var(--success); }
.c-medium { color: var(--accent); }
.c-weak { color: var(--error); }
.metric-cell { display: grid; gap: 6px; align-content: end; min-height: 120px; }
.queue-row { display: flex; gap: 32px; margin-top: 12px; }
.queue-stat { display: flex; align-items: baseline; gap: 6px; }
.ol { list-style: decimal; padding-left: 16px; display: grid; gap: 6px; }
.ol li { font: 400 13px/1.6 var(--font-body); color: var(--text-muted); }

/* ── Deploy cell ── */
.deploy-cell { margin-top: 0; }
.deploy-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.deploy-info { min-width: 0; flex: 1; }
.deploy-url { font: 500 12px var(--font-mono); color: var(--accent); text-decoration: none; word-break: break-all; }
.deploy-url:hover { text-decoration: underline; }
.deploy-error { color: var(--error); }
.deploy-actions { display: flex; gap: 8px; flex-shrink: 0; }
.btn-deploy {
  padding: 6px 14px; border: 1px solid var(--accent); background: transparent;
  color: var(--accent); font: 600 10px var(--font-mono); letter-spacing: 0.06em;
  text-transform: uppercase; cursor: pointer; transition: all 0.15s; text-decoration: none;
  display: inline-flex; align-items: center; justify-content: center;
}
.btn-deploy:hover { background: var(--accent-ember); }
.btn-deploy:disabled { opacity: 0.5; cursor: default; }
.btn-deploy--open { padding: 6px 10px; font-size: 14px; }
.dim { color: var(--text-dim); }
</style>
