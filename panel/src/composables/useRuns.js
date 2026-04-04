import { shallowRef, computed } from 'vue'
import initialCache from '@front-brain-runtime/runs.generated.json'

const runtimeCache = shallowRef(initialCache)
let dataSource = null

const safeRun = (r) => {
  if (!r) return null
  return {
    id: r.id ?? 'unknown',
    label: r.label ?? r.id ?? '—',
    project: r.project ?? { name: '—', type: 'unknown' },
    mode: r.mode ?? 'autonomous',
    currentPhase: r.currentPhase ?? 'pending',
    currentTask: r.currentTask ?? null,
    currentFocus: r.currentFocus ?? '',
    nextAction: r.nextAction ?? '',
    healthIndex: r.healthIndex ?? 0,
    maturityScore: r.maturityScore ?? 0,
    retriesUsed: r.retriesUsed ?? 0,
    retryBudget: r.retryBudget ?? 3,
    sourceType: r.sourceType ?? 'unknown',
    scorecard: {
      observerScore: r.scorecard?.observerScore ?? 0,
      criticScore: r.scorecard?.criticScore ?? 0,
      finalScore: r.scorecard?.finalScore ?? 0,
      decision: r.scorecard?.decision ?? 'pending',
      retryInstructions: r.scorecard?.retryInstructions ?? [],
    },
    queue: r.queue ?? { active: [], pending: [], done: [] },
    visualDebt: r.visualDebt ?? { summary: { open: 0, critical: 0, medium: 0, low: 0 }, items: [] },
    documents: r.documents ?? { designMarkdown: '', decisionsMarkdown: '', reviewMarkdown: '' },
    observer: r.observer ?? { gates: {}, visualDebt: [], signals: {} },
    critic: r.critic ?? { brandAlignment: 'pending', issues: [], notes: [] },
    metrics: r.metrics ?? { observerSignals: {} },
  }
}

export const runs = computed(() =>
  runtimeCache.value.runs.map(r => {
    const s = safeRun(r)
    return {
      id: s.id,
      label: s.label,
      name: s.project.name,
      type: s.project.type,
      phase: s.currentPhase,
      score: s.scorecard.finalScore,
      decision: s.scorecard.decision,
      mode: s.mode,
      debtOpen: s.visualDebt.summary.open,
      queueDone: s.queue.done?.length ?? 0,
      queueTotal: (s.queue.done?.length ?? 0) + (s.queue.active?.length ?? 0) + (s.queue.pending?.length ?? 0),
    }
  })
)

export const getRunById = (id) => {
  const raw = runtimeCache.value.runs.find(r => r.id === id)
  return safeRun(raw)
}

export const defaultRunId = computed(() =>
  runtimeCache.value.defaultRunId || runtimeCache.value.runs?.[0]?.id
)

export const startLiveSync = () => {
  if (dataSource) return
  try {
    dataSource = new EventSource('/__eros/data')
    dataSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data)
        if (payload.runs) runtimeCache.value = payload.runs
      } catch {}
    }
  } catch {}
}

export const stopLiveSync = () => {
  if (dataSource) { dataSource.close(); dataSource = null }
}

// Defer SSE to after page load
if (document.readyState === 'complete') startLiveSync()
else window.addEventListener('load', () => startLiveSync(), { once: true })

if (import.meta.hot) {
  import.meta.hot.dispose(() => stopLiveSync())
}
