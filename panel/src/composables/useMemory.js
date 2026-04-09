import { shallowRef, computed } from 'vue'

// Single source of truth for memory data. Also imported by frontBrain.js
// (consumers like Eros.vue, Calidad.vue) — previously both modules kept
// their own local memoryData and polled independently, doubling traffic.
export const memoryData = shallowRef({
  techniqueScores: { techniques: [] },
  fontPairings: { works: [], failures: [] },
  colorPalettes: { works: [], failures: [] },
  signatures: { approved: [], rejected: [] },
  sectionPatterns: { patterns: [] },
  revisionPatterns: { patterns: [] },
  pipelineLessons: { lessons: [] },
  rules: { rules: [], nextId: 1 },
  trainingCalibration: { projects: [], globalBias: 0, thresholdAdjustment: 0 },
})

export const fetchMemory = async () => {
  try {
    const res = await fetch('/__eros/memory-data')
    if (!res.ok) return
    const data = await res.json()
    // Preserve previous values for fields the API returned as null (file
    // missing). Keeps the tree always non-null so downstream computed
    // exports in both useMemory.js and frontBrain.js never crash.
    memoryData.value = {
      techniqueScores: data.techniqueScores ?? memoryData.value.techniqueScores,
      fontPairings: data.fontPairings ?? memoryData.value.fontPairings,
      colorPalettes: data.colorPalettes ?? memoryData.value.colorPalettes,
      signatures: data.signatures ?? memoryData.value.signatures,
      sectionPatterns: data.sectionPatterns ?? memoryData.value.sectionPatterns,
      revisionPatterns: data.revisionPatterns ?? memoryData.value.revisionPatterns,
      pipelineLessons: data.pipelineLessons ?? memoryData.value.pipelineLessons,
      rules: data.rules ?? memoryData.value.rules,
      trainingCalibration: data.trainingCalibration ?? memoryData.value.trainingCalibration,
    }
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
