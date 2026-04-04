import { ref, computed, shallowRef } from 'vue'
import initialCache from '@front-brain-runtime/runs.generated.json'
import {
  allBlueprints,
  blueprintManifest,
} from '@components/blueprints.manifest.js'

// ── Helpers (pure, no state) ──

const titleCase = (v = '') =>
  v.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()).trim()

const scoreTone = (v) => (v >= 8 ? 'strong' : v >= 7 ? 'medium' : 'weak')

const scaleTone = (v) => {
  if (v === 'STRONG' || v === 'PASS') return 'strong'
  if (v === 'MEDIUM' || v === 'WARN' || v === 'retry') return 'medium'
  return 'weak'
}

const ruleTone = (t) => (t === 'override' ? 'weak' : t === 'bias' ? 'accent' : 'medium')

const parseDecisionEntries = (md = '') => {
  const entries = []
  const pat = /^## (D-\d+)\s*\|\s*(.+?)\s*\|\s*(.+?)$/gm
  let m
  while ((m = pat.exec(md)) !== null) {
    entries.push({ id: m[1], type: 'decision', label: m[2].trim(), phase: m[3].trim() })
  }
  return entries
}

// ── Blueprint index (static, never changes) ──

const blueprintIndex = new Map(allBlueprints.map((b) => [b.name, b]))

// ── Safe run normalizer ──
// Runs can arrive incomplete (build in progress, SSE partial payload, legacy bridge).
// This function guarantees every field the UI touches exists with a sane default.
// It never mutates the source — returns a new object.

const EMPTY_SCORECARD = { observerScore: 0, criticScore: 0, memoryAlignmentScore: 0, finalScore: 0, decision: 'pending', retryInstructions: [], status: null }
const EMPTY_OBSERVER = { target: 'n/a', gates: {}, visualDebt: [], signals: {} }
const EMPTY_CRITIC = { brandAlignment: 'pending', issues: [], notes: [] }
const EMPTY_METRICS = { observerSignals: {} }
const EMPTY_QUEUE = { active: [], pending: [], done: [] }
const EMPTY_DEBT = { summary: { open: 0, critical: 0, medium: 0, low: 0, resolved: 0 }, items: [] }
const EMPTY_RULES = { rules: [], thresholds: { observerMinimum: 'MEDIUM', criticMinimum: 7, finalMinimum: 7.5 } }
const EMPTY_DOCS = { designMarkdown: '', decisionsMarkdown: '', reviewMarkdown: '' }

// Merge that treats null values as missing (so defaults survive)
function defaults(base, override) {
  const out = { ...base }
  if (!override) return out
  for (const [k, v] of Object.entries(override)) {
    if (v != null) out[k] = v
  }
  return out
}

function safeRun(r) {
  if (!r) return null
  const sc = defaults(EMPTY_SCORECARD, r.scorecard)
  const obs = defaults(EMPTY_OBSERVER, r.observer)
  const crt = defaults(EMPTY_CRITIC, r.critic)
  const met = defaults(EMPTY_METRICS, r.metrics)
  const q = defaults(EMPTY_QUEUE, r.queue)
  const vd = {
    summary: defaults(EMPTY_DEBT.summary, r.visualDebt?.summary),
    items: r.visualDebt?.items ?? [],
  }
  const rc = defaults(EMPTY_RULES, r.rulesConfig)
  rc.thresholds = defaults(EMPTY_RULES.thresholds, r.rulesConfig?.thresholds)
  return {
    ...r,
    project: r.project ?? { name: '—', type: 'unknown' },
    scorecard: sc,
    observer: obs,
    critic: crt,
    metrics: met,
    queue: q,
    visualDebt: vd,
    rulesConfig: rc,
    documents: defaults(EMPTY_DOCS, r.documents),
    blueprintSelection: r.blueprintSelection ?? { directions: [], selection: null },
    healthIndex: r.healthIndex ?? 0,
    maturityScore: r.maturityScore ?? 0,
    retriesUsed: r.retriesUsed ?? 0,
    retryBudget: r.retryBudget ?? 3,
    currentPhase: r.currentPhase ?? 'pending',
    currentTask: r.currentTask ?? null,
    currentFocus: r.currentFocus ?? '',
    nextAction: r.nextAction ?? '',
    mode: r.mode ?? 'autonomous',
  }
}

// ── Reactive core: runtimeCache ref ──

const runtimeCache = shallowRef(initialCache)

const query = new URLSearchParams(window.location.search)
const requestedRunId = query.get('run')

const activeRun = computed(() => {
  const runs = runtimeCache.value.runs
  const raw = runs.find((r) => r.id === requestedRunId) ?? runs.find((r) => r.id === runtimeCache.value.defaultRunId) ?? runs[0]
  return safeRun(raw)
})

// ── Observer V2 data (6 layers) ──

const observerV2 = shallowRef(null)

const fetchObserverV2 = async (slug) => {
  if (!slug) return
  try {
    const res = await fetch(`/__eros/observer?project=${slug}`)
    if (res.ok) observerV2.value = await res.json()
  } catch { /* not available */ }
}

export const observerManifest = computed(() => observerV2.value)
export const observerGeometry = computed(() => observerV2.value?.geometry || null)
export const observerAesthetics = computed(() => observerV2.value?.aesthetics || null)
export const observerSemantic = computed(() => observerV2.value?.semantic || null)
export const observerAntiTemplate = computed(() => observerV2.value?.antiTemplate || null)
export const observerExcellence = computed(() => {
  const s = observerV2.value?.excellenceSignals
  if (!s || !s._scores) return null
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
export const observerQualityGates = computed(() => observerV2.value?.qualityGates || null)
export const refreshObserverV2 = fetchObserverV2

// Auto-fetch observer V2 for the active run
// Try all projects until one has V2 data
const activeSlug = requestedRunId || runtimeCache.value?.defaultRunId || runtimeCache.value?.runs?.[0]?.id
fetchObserverV2(activeSlug)

// ── Derived reactive state ──

export const activeRunId = computed(() => activeRun.value.id)

export const runCatalog = computed(() =>
  runtimeCache.value.runs.map((r) => {
    const s = safeRun(r)
    return {
      id: s.id, label: s.label, sourceType: s.sourceType, legacyBridge: s.legacyBridge,
      mode: s.mode, currentPhase: s.currentPhase, finalScore: s.scorecard.finalScore,
      visualDebtOpen: s.visualDebt.summary.open,
    }
  })
)

const state = computed(() => {
  const r = activeRun.value
  return {
    project: r.project, mode: r.mode, currentPhase: r.currentPhase, currentTask: r.currentTask,
    currentFocus: r.currentFocus, healthIndex: r.healthIndex, maturityScore: r.maturityScore,
    activePage: r.activePage, activeSection: r.activeSection, retriesUsed: r.retriesUsed,
    retryBudget: r.retryBudget, lastReviewAt: r.lastReviewAt, nextAction: r.nextAction,
  }
})

const scorecard = computed(() => activeRun.value.scorecard)
const observer = computed(() => activeRun.value.observer)
const critic = computed(() => activeRun.value.critic)
const metrics = computed(() => activeRun.value.metrics)
const queue = computed(() => activeRun.value.queue)
const visualDebt = computed(() => activeRun.value.visualDebt)
const rulesConfig = computed(() => activeRun.value.rulesConfig)
const designMarkdown = computed(() => activeRun.value.documents.designMarkdown)
const decisionsMarkdown = computed(() => activeRun.value.documents.decisionsMarkdown)
const reviewMarkdown = computed(() => activeRun.value.documents.reviewMarkdown)

const blueprintSelection = computed(() => activeRun.value.blueprintSelection)
const selectedHeroName = computed(() => blueprintSelection.value.selection?.heroName ?? 'S-AmbientAtmosphere')
const selectedNavName = computed(() => blueprintSelection.value.selection?.navName ?? 'N-Contextual')

export const selectedBlueprints = computed(() => ({
  hero: blueprintIndex.get(selectedHeroName.value),
  nav: blueprintIndex.get(selectedNavName.value),
}))

export const runOverview = computed(() => ({
  ...state.value,
  sourceType: activeRun.value.sourceType,
  sourcePath: activeRun.value.sourcePath,
  legacyBridge: activeRun.value.legacyBridge,
  queueCounts: { active: queue.value.active.length, pending: queue.value.pending.length, done: queue.value.done.length },
  observerScore: scorecard.value.observerScore,
  criticScore: scorecard.value.criticScore,
  memoryAlignmentScore: scorecard.value.memoryAlignmentScore,
  finalScore: scorecard.value.finalScore,
  decision: scorecard.value.decision,
}))

export const scoreSummary = computed(() => [
  { label: 'Observer', value: scorecard.value.observerScore, detail: observer.value.target, tone: scoreTone(scorecard.value.observerScore) },
  { label: 'Critic', value: scorecard.value.criticScore, detail: critic.value.brandAlignment, tone: scoreTone(scorecard.value.criticScore) },
  { label: 'Memory Alignment', value: scorecard.value.memoryAlignmentScore, detail: activeRun.value.legacyBridge ? 'bridge heuristic' : 'cross-project', tone: scoreTone(scorecard.value.memoryAlignmentScore) },
  { label: 'Final', value: scorecard.value.finalScore, detail: scorecard.value.decision, tone: scoreTone(scorecard.value.finalScore) },
])

export const healthCards = computed(() => [
  { label: 'Health Index', value: state.value.healthIndex, suffix: '/100', note: `Current focus: ${titleCase(state.value.currentFocus)}` },
  { label: 'Maturity', value: state.value.maturityScore, suffix: '/100', note: `Phase: ${titleCase(state.value.currentPhase)}` },
  { label: 'Visual Debt', value: visualDebt.value.summary.open, suffix: ' open', note: `${visualDebt.value.summary.medium} medium · ${visualDebt.value.summary.low} low` },
  { label: 'Retry Budget', value: `${state.value.retriesUsed}/${state.value.retryBudget}`, suffix: '', note: scorecard.value.decision === 'retry' ? 'Autonomous retry still allowed' : 'Escalation required' },
])

export const queueColumns = computed(() => [
  { key: 'active', label: 'Active', items: queue.value.active },
  { key: 'pending', label: 'Pending', items: queue.value.pending },
  { key: 'done', label: 'Done', items: queue.value.done },
])

export const observerSignals = computed(() =>
  Object.entries(metrics.value.observerSignals).map(([k, v]) => ({ id: k, label: titleCase(k), value: v, tone: scaleTone(v) }))
)

export const observerGates = computed(() =>
  Object.entries(observer.value.gates).map(([k, v]) => ({ id: k, label: titleCase(k), value: v, tone: scaleTone(v) }))
)

export const rules = computed(() => rulesConfig.value.rules.map((r) => ({ ...r, tone: ruleTone(r.type) })))

export const thresholds = computed(() => [
  { label: 'Observer minimum', value: rulesConfig.value.thresholds.observerMinimum },
  { label: 'Critic minimum', value: rulesConfig.value.thresholds.criticMinimum },
  { label: 'Final minimum', value: rulesConfig.value.thresholds.finalMinimum },
])

export const criticNotes = computed(() => critic.value.notes)
export const retryInstructions = computed(() => scorecard.value.retryInstructions)

export const qualityIssues = computed(() => [
  ...observer.value.visualDebt.map((i) => ({ source: 'observer', label: i.id, severity: i.severity, title: `${titleCase(i.section)} signal`, message: i.issue })),
  ...critic.value.issues.map((i, idx) => ({ source: 'critic', label: `CR-${idx + 1}`, severity: i.severity, title: titleCase(i.type), message: i.message })),
])

export const debtItems = computed(() => visualDebt.value.items)
export const debtSummary = computed(() => visualDebt.value.summary)

export const directionCandidates = computed(() => {
  const specs = blueprintSelection.value.directions?.length
    ? blueprintSelection.value.directions
    : [{ id: 'DIR-01', label: 'Fallback direction', heroName: selectedHeroName.value, navName: selectedNavName.value, rationale: 'Fallback.' }]
  return specs.map((d, i) => ({ id: d.id ?? `DIR-0${i + 1}`, ...d, hero: blueprintIndex.get(d.heroName), nav: blueprintIndex.get(d.navName) }))
})

export const blueprintStats = {
  total: allBlueprints.length,
  heroes: blueprintManifest.heroes.length,
  navs: blueprintManifest.navs.length,
  trendTags: [...new Set(allBlueprints.flatMap((i) => i.trendTags))].sort(),
}

export const frontBrainSnapshot = computed(() => ({
  id: activeRun.value.id, sourceType: activeRun.value.sourceType, sourcePath: activeRun.value.sourcePath,
  legacyBridge: activeRun.value.legacyBridge, designMarkdown: designMarkdown.value,
  decisionsMarkdown: decisionsMarkdown.value, reviewMarkdown: reviewMarkdown.value,
  observer: observer.value, critic: critic.value, scorecard: scorecard.value,
  visualDebt: visualDebt.value, rulesConfig: rulesConfig.value,
  blueprintSelection: blueprintSelection.value, selectedBlueprints: selectedBlueprints.value,
}))

export const panelMeta = computed(() => ({
  projectName: state.value.project.name,
  projectType: titleCase(state.value.project.type),
  blueprintCount: blueprintStats.total,
  visualDebtOpen: visualDebt.value.summary.open,
  finalScore: scorecard.value.finalScore,
  queueOpen: queue.value.active.length + queue.value.pending.length,
}))

// ── Timeline ──

export const timeline = computed(() => [
  ...queue.value.done.map((i) => ({ id: i.id, type: 'task', label: i.detail || i.id, agent: i.agent, status: 'done' })),
  ...parseDecisionEntries(decisionsMarkdown.value),
].slice(0, 12))

// ── Section breakdown ──

export const sectionBreakdown = computed(() => {
  const map = {}
  for (const item of observer.value.visualDebt) {
    if (!map[item.section]) map[item.section] = { section: item.section, issues: [], worstSeverity: 'low' }
    map[item.section].issues.push(item)
    if (item.severity === 'critical' || (item.severity === 'medium' && map[item.section].worstSeverity === 'low')) {
      map[item.section].worstSeverity = item.severity
    }
  }
  return Object.values(map)
})

// ── Memory (live from design-intelligence JSON via /__eros/memory-data) ──

const memoryData = shallowRef({
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

const fetchMemoryData = async () => {
  try {
    const res = await fetch('/__eros/memory-data')
    const data = await res.json()
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
  } catch { /* endpoint not available */ }
}

// Fetch on load + refresh every 30s (guarded against HMR accumulation)
fetchMemoryData()
let memoryInterval = null
if (!memoryInterval) {
  memoryInterval = setInterval(fetchMemoryData, 30000)
}
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    if (memoryInterval) { clearInterval(memoryInterval); memoryInterval = null }
  })
}

export const refreshMemory = fetchMemoryData

export const memoryTechniques = computed(() =>
  (memoryData.value.techniqueScores.techniques || []).map(t => ({
    name: t.name,
    uses: t.timesUsed ?? 0,
    score: t.avgScore ?? 0,
  }))
)

export const memoryFonts = computed(() => [
  ...(memoryData.value.fontPairings.works || []).map(f => ({
    display: f.display ?? '—', body: f.body ?? '—', mood: f.mood ?? '—', status: 'ok',
  })),
  ...(memoryData.value.fontPairings.failures || []).map(f => ({
    display: f.display ?? '—', body: f.body ?? '—', mood: f.reason ?? '—', status: 'fail',
  })),
])

// ── Eros system stats ──

export const erosStats = computed(() => {
  const techs = memoryTechniques.value
  const fonts = memoryFonts.value
  const totalUses = techs.reduce((s, t) => s + t.uses, 0)
  const avgScore = techs.length > 0 ? Number((techs.reduce((s, t) => s + t.score, 0) / techs.length).toFixed(1)) : 0
  return {
    version: '7',
    totalRuns: runtimeCache.value.runs.length,
    totalBlueprints: allBlueprints.length,
    totalTechniques: techs.length,
    totalTechniqueUses: totalUses,
    avgTechniqueScore: avgScore,
    bestTechnique: [...techs].sort((a, b) => b.score - a.score)[0] ?? null,
    fontsApproved: fonts.filter((f) => f.status === 'ok').length,
    fontsRejected: fonts.filter((f) => f.status === 'fail').length,
    rulesCount: memoryData.value.rules.rules.length,
    dataPoints: (memoryData.value.fontPairings.works?.length ?? 0) +
      (memoryData.value.signatures.approved?.length ?? 0) +
      (memoryData.value.sectionPatterns.patterns?.length ?? 0) +
      techs.length +
      (memoryData.value.revisionPatterns.patterns?.length ?? 0),
    calibrationBias: memoryData.value.trainingCalibration.globalBias ?? 0,
  }
})

export const erosRunHistory = computed(() =>
  runtimeCache.value.runs.map((r) => {
    const s = safeRun(r)
    return {
      id: s.id, label: s.label, phase: s.currentPhase, score: s.scorecard.finalScore,
      observerScore: s.scorecard.observerScore, criticScore: s.scorecard.criticScore,
      decision: s.scorecard.decision, debtOpen: s.visualDebt.summary.open, mode: s.mode, legacy: s.legacyBridge,
    }
  })
)

export const erosMemoryRules = computed(() =>
  (memoryData.value.rules.rules || []).map(r => ({
    rule: r.text,
    status: (r.status || 'candidate').toLowerCase(),
    validations: r.validations ?? 0,
    id: r.id,
    source: r.source,
  }))
)

// ── SSE: live data subscription ──

let dataSource = null

export const startLiveSync = () => {
  if (dataSource) return
  try {
    dataSource = new EventSource('/__eros/data')
    dataSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data)
        if (payload.runs) {
          runtimeCache.value = payload.runs
        }
      } catch { /* ignore */ }
    }
    dataSource.onerror = () => { /* reconnects automatically */ }
  } catch { /* SSE not available */ }
}

export const stopLiveSync = () => {
  if (dataSource) {
    dataSource.close()
    dataSource = null
  }
}

// Defer SSE connection until after page load — prevents browser spinner from
// staying active indefinitely (EventSource opened during load = "still loading")
if (document.readyState === 'complete') {
  startLiveSync()
} else {
  window.addEventListener('load', () => startLiveSync(), { once: true })
}
if (import.meta.hot) {
  import.meta.hot.dispose(() => { stopLiveSync() })
}
