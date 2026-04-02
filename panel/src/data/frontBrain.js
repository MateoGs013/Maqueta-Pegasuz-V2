import runtimeCache from '@front-brain-runtime/runs.generated.json'
import {
  allBlueprints,
  blueprintManifest,
} from '@components/blueprints.manifest.js'

const titleCase = (value = '') =>
  value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim()

const scoreTone = (value) => {
  if (value >= 8) return 'strong'
  if (value >= 7) return 'medium'
  return 'weak'
}

const scaleTone = (value) => {
  if (value === 'STRONG' || value === 'PASS') return 'strong'
  if (value === 'MEDIUM' || value === 'WARN' || value === 'retry') return 'medium'
  return 'weak'
}

const ruleTone = (type) => {
  if (type === 'override') return 'weak'
  if (type === 'bias') return 'accent'
  return 'medium'
}

const blueprintIndex = new Map(allBlueprints.map((blueprint) => [blueprint.name, blueprint]))
const query = new URLSearchParams(window.location.search)

const fallbackRun = runtimeCache.runs.find((run) => run.id === runtimeCache.defaultRunId) ?? runtimeCache.runs[0]
const requestedRunId = query.get('run')
const activeRun =
  runtimeCache.runs.find((run) => run.id === requestedRunId) ??
  fallbackRun

const designMarkdown = activeRun.documents.designMarkdown
const decisionsMarkdown = activeRun.documents.decisionsMarkdown
const reviewMarkdown = activeRun.documents.reviewMarkdown
const state = {
  project: activeRun.project,
  mode: activeRun.mode,
  currentPhase: activeRun.currentPhase,
  currentTask: activeRun.currentTask,
  currentFocus: activeRun.currentFocus,
  healthIndex: activeRun.healthIndex,
  maturityScore: activeRun.maturityScore,
  activePage: activeRun.activePage,
  activeSection: activeRun.activeSection,
  retriesUsed: activeRun.retriesUsed,
  retryBudget: activeRun.retryBudget,
  lastReviewAt: activeRun.lastReviewAt,
  nextAction: activeRun.nextAction,
}

const metrics = activeRun.metrics
const queue = activeRun.queue
const rulesConfig = activeRun.rulesConfig
const observer = activeRun.observer
const critic = activeRun.critic
const scorecard = activeRun.scorecard
const visualDebt = activeRun.visualDebt
const blueprintSelection = activeRun.blueprintSelection ?? {
  directions: [],
  selection: null,
}
const selectedHeroName = blueprintSelection.selection?.heroName ?? 'S-AmbientAtmosphere'
const selectedNavName = blueprintSelection.selection?.navName ?? 'N-Contextual'

export const activeRunId = activeRun.id

export const runCatalog = runtimeCache.runs.map((run) => ({
  id: run.id,
  label: run.label,
  sourceType: run.sourceType,
  legacyBridge: run.legacyBridge,
  mode: run.mode,
  currentPhase: run.currentPhase,
  finalScore: run.scorecard.finalScore,
  visualDebtOpen: run.visualDebt.summary.open,
}))

export const selectedBlueprints = {
  hero: blueprintIndex.get(selectedHeroName),
  nav: blueprintIndex.get(selectedNavName),
}

const directionSpecs = blueprintSelection.directions?.length
  ? blueprintSelection.directions
  : [
      {
        id: 'DIR-01',
        label: activeRun.legacyBridge ? 'Bridge fallback direction' : 'Fallback direction',
        heroName: selectedHeroName,
        navName: selectedNavName,
        rationale: activeRun.legacyBridge
          ? 'Legacy run does not expose structured seed selection yet, so the panel falls back to the canonical baseline pair.'
          : 'Structured seed selection is missing, so the panel falls back to the canonical baseline pair.',
      },
    ]

const uniqueDirections = []
for (const direction of directionSpecs) {
  if (uniqueDirections.some((item) => item.heroName === direction.heroName && item.navName === direction.navName)) {
    continue
  }

  uniqueDirections.push(direction)
}

export const runOverview = {
  ...state,
  sourceType: activeRun.sourceType,
  sourcePath: activeRun.sourcePath,
  legacyBridge: activeRun.legacyBridge,
  queueCounts: {
    active: queue.active.length,
    pending: queue.pending.length,
    done: queue.done.length,
  },
  observerScore: scorecard.observerScore,
  criticScore: scorecard.criticScore,
  memoryAlignmentScore: scorecard.memoryAlignmentScore,
  finalScore: scorecard.finalScore,
  decision: scorecard.decision,
}

export const directionCandidates = uniqueDirections.map((direction, index) => ({
  id: direction.id ?? `DIR-0${index + 1}`,
  ...direction,
  hero: blueprintIndex.get(direction.heroName),
  nav: blueprintIndex.get(direction.navName),
}))

export const scoreSummary = [
  {
    label: 'Observer',
    value: scorecard.observerScore,
    detail: observer.target,
    tone: scoreTone(scorecard.observerScore),
  },
  {
    label: 'Critic',
    value: scorecard.criticScore,
    detail: critic.brandAlignment,
    tone: scoreTone(scorecard.criticScore),
  },
  {
    label: 'Memory Alignment',
    value: scorecard.memoryAlignmentScore,
    detail: activeRun.legacyBridge ? 'bridge heuristic' : 'cross-project',
    tone: scoreTone(scorecard.memoryAlignmentScore),
  },
  {
    label: 'Final',
    value: scorecard.finalScore,
    detail: scorecard.decision,
    tone: scoreTone(scorecard.finalScore),
  },
]

export const healthCards = [
  {
    label: 'Health Index',
    value: runOverview.healthIndex,
    suffix: '/100',
    note: `Current focus: ${titleCase(runOverview.currentFocus)}`,
  },
  {
    label: 'Maturity',
    value: runOverview.maturityScore,
    suffix: '/100',
    note: `Phase: ${titleCase(runOverview.currentPhase)}`,
  },
  {
    label: 'Visual Debt',
    value: visualDebt.summary.open,
    suffix: ' open',
    note: `${visualDebt.summary.medium} medium · ${visualDebt.summary.low} low`,
  },
  {
    label: 'Retry Budget',
    value: `${runOverview.retriesUsed}/${runOverview.retryBudget}`,
    suffix: '',
    note: runOverview.decision === 'retry' ? 'Autonomous retry still allowed' : 'Escalation required',
  },
]

export const queueColumns = [
  {
    key: 'active',
    label: 'Active',
    items: queue.active,
  },
  {
    key: 'pending',
    label: 'Pending',
    items: queue.pending,
  },
  {
    key: 'done',
    label: 'Done',
    items: queue.done,
  },
]

export const designMetrics = [
  {
    label: 'Design consistency',
    value: metrics.designConsistencyScore,
    note: activeRun.legacyBridge ? 'bridge estimate' : 'system coherence',
  },
  {
    label: 'Motion consistency',
    value: metrics.motionConsistencyScore,
    note: activeRun.legacyBridge ? 'bridge estimate' : 'motion family alignment',
  },
  {
    label: 'Responsive score',
    value: metrics.responsiveScore,
    note: '375 / 768 / 1280 / 1440',
  },
]

export const observerSignals = Object.entries(metrics.observerSignals).map(([key, value]) => ({
  id: key,
  label: titleCase(key),
  value,
  tone: scaleTone(value),
}))

export const observerGates = Object.entries(observer.gates).map(([key, value]) => ({
  id: key,
  label: titleCase(key),
  value,
  tone: scaleTone(value),
}))

export const rules = rulesConfig.rules.map((rule) => ({
  ...rule,
  tone: ruleTone(rule.type),
}))

export const thresholds = [
  {
    label: 'Observer minimum',
    value: rulesConfig.thresholds.observerMinimum,
  },
  {
    label: 'Critic minimum',
    value: rulesConfig.thresholds.criticMinimum,
  },
  {
    label: 'Final minimum',
    value: rulesConfig.thresholds.finalMinimum,
  },
]

export const criticNotes = critic.notes
export const retryInstructions = scorecard.retryInstructions

export const qualityIssues = [
  ...observer.visualDebt.map((issue) => ({
    source: 'observer',
    label: issue.id,
    severity: issue.severity,
    title: `${titleCase(issue.section)} signal`,
    message: issue.issue,
  })),
  ...critic.issues.map((issue, index) => ({
    source: 'critic',
    label: `CR-${index + 1}`,
    severity: issue.severity,
    title: titleCase(issue.type),
    message: issue.message,
  })),
]

export const debtItems = visualDebt.items
export const debtSummary = visualDebt.summary

export const blueprintStats = {
  total: allBlueprints.length,
  heroes: blueprintManifest.heroes.length,
  navs: blueprintManifest.navs.length,
  trendTags: [...new Set(allBlueprints.flatMap((item) => item.trendTags))].sort(),
}

export const frontBrainSnapshot = {
  id: activeRun.id,
  sourceType: activeRun.sourceType,
  sourcePath: activeRun.sourcePath,
  legacyBridge: activeRun.legacyBridge,
  designMarkdown,
  decisionsMarkdown,
  reviewMarkdown,
  observer,
  critic,
  scorecard,
  visualDebt,
  rulesConfig,
  blueprintSelection,
  selectedBlueprints,
}

export const panelMeta = {
  projectName: state.project.name,
  projectType: titleCase(state.project.type),
  blueprintCount: blueprintStats.total,
  visualDebtOpen: debtSummary.open,
  finalScore: scorecard.finalScore,
  queueOpen: runOverview.queueCounts.active + runOverview.queueCounts.pending,
}
