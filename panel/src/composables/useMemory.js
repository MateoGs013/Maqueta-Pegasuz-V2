import { shallowRef, computed } from 'vue'

const memoryData = shallowRef(null)

export const fetchMemory = async () => {
  try {
    const res = await fetch('/__eros/memory-data')
    if (res.ok) memoryData.value = await res.json()
  } catch {}
}

export const techniques = computed(() =>
  (memoryData.value?.techniqueScores?.techniques || []).map(t => ({
    name: t.name, uses: t.timesUsed ?? 0, score: t.avgScore ?? 0,
  }))
)

export const fonts = computed(() => [
  ...(memoryData.value?.fontPairings?.works || []).map(f => ({
    display: f.display ?? '—', body: f.body ?? '—', mood: f.mood ?? '—', status: 'ok',
  })),
  ...(memoryData.value?.fontPairings?.failures || []).map(f => ({
    display: f.display ?? '—', body: f.body ?? '—', mood: f.reason ?? '—', status: 'fail',
  })),
])

export const palettes = computed(() => [
  ...(memoryData.value?.colorPalettes?.works || []).map(p => ({ ...p, status: 'ok' })),
  ...(memoryData.value?.colorPalettes?.failures || []).map(p => ({ ...p, status: 'fail' })),
])

export const rules = computed(() =>
  (memoryData.value?.rules?.rules || []).map(r => ({
    id: r.id, text: r.text, status: (r.status || 'candidate').toLowerCase(),
    validations: r.validations ?? 0, source: r.source,
  }))
)

export const signatures = computed(() => ({
  approved: memoryData.value?.signatures?.approved || [],
  rejected: memoryData.value?.signatures?.rejected || [],
}))

export const patterns = computed(() => memoryData.value?.sectionPatterns?.patterns || [])
export const revisions = computed(() => memoryData.value?.revisionPatterns?.patterns || [])
export const calibration = computed(() => memoryData.value?.trainingCalibration || { projects: [], globalBias: 0 })

export const stats = computed(() => {
  const m = memoryData.value
  if (!m) return null
  return {
    totalDataPoints:
      (m.fontPairings?.works?.length ?? 0) + (m.fontPairings?.failures?.length ?? 0) +
      (m.colorPalettes?.works?.length ?? 0) +
      (m.signatures?.approved?.length ?? 0) + (m.signatures?.rejected?.length ?? 0) +
      (m.sectionPatterns?.patterns?.length ?? 0) +
      (m.techniqueScores?.techniques?.length ?? 0) +
      (m.revisionPatterns?.patterns?.length ?? 0) +
      (m.pipelineLessons?.lessons?.length ?? 0) +
      (m.rules?.rules?.length ?? 0),
    fonts: m.fontPairings?.works?.length ?? 0,
    palettes: m.colorPalettes?.works?.length ?? 0,
    signatures: m.signatures?.approved?.length ?? 0,
    patterns: m.sectionPatterns?.patterns?.length ?? 0,
    techniques: m.techniqueScores?.techniques?.length ?? 0,
    revisions: m.revisionPatterns?.patterns?.length ?? 0,
    rules: { promoted: (m.rules?.rules || []).filter(r => r.status === 'PROMOTED').length, total: m.rules?.rules?.length ?? 0 },
    bias: m.trainingCalibration?.globalBias ?? 0,
  }
})

// Auto-fetch + periodic refresh
fetchMemory()
let interval = null
if (!interval) interval = setInterval(fetchMemory, 30000)
if (import.meta.hot) {
  import.meta.hot.dispose(() => { if (interval) { clearInterval(interval); interval = null } })
}
