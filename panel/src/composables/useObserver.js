import { shallowRef, computed } from 'vue'

const manifest = shallowRef(null)
const currentSlug = shallowRef(null)

export const fetchObserver = async (slug) => {
  if (!slug) return
  if (slug === currentSlug.value && manifest.value) return // already loaded
  currentSlug.value = slug
  try {
    const res = await fetch(`/__eros/observer?project=${slug}`)
    if (res.ok) manifest.value = await res.json()
    else manifest.value = null
  } catch { manifest.value = null }
}

export const hasV2 = computed(() => manifest.value?.geometry != null)

export const geometry = computed(() => manifest.value?.geometry || null)
export const aesthetics = computed(() => manifest.value?.aesthetics || null)
export const semantic = computed(() => manifest.value?.semantic || null)
export const antiTemplate = computed(() => manifest.value?.antiTemplate || null)
export const structural = computed(() => manifest.value?.depthMetrics || null)
export const motion = computed(() => manifest.value?.motionProfile || null)
export const wheelStates = computed(() => manifest.value?.wheelStates || null)

export const excellence = computed(() => {
  const s = manifest.value?.excellenceSignals
  if (!s?._scores) return null
  const scores = s._scores
  const signals = scores.signals || s
  return {
    composition: { score: scores.composition, signal: signals.composition || s.composition },
    depth: { score: scores.depth, signal: signals.depth || s.depth },
    typography: { score: scores.typography, signal: signals.typography || s.typography },
    motion: { score: scores.motion, signal: signals.motion || s.motion },
    craft: { score: scores.craft, signal: signals.craft || s.craft },
  }
})

export const qualityGates = computed(() => manifest.value?.qualityGates || null)

export const gateList = computed(() => {
  const g = qualityGates.value
  if (!g) return []
  return [
    { key: 'contrast', label: 'Contraste', signal: g.contrast?.signal || '—' },
    { key: 'animations', label: 'Animaciones', signal: g.animations?.clean ? 'PASS' : (g.animations?.signal || 'FAIL') },
    { key: 'images', label: 'Imagenes', signal: g.images?.signal || '—' },
    { key: 'headings', label: 'Headings', signal: g.headings?.signal || '—' },
    { key: 'meta', label: 'Meta', signal: g.meta?.signal || '—' },
  ]
})
