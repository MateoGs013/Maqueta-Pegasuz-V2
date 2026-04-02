import designMarkdown from '@front-brain-example/DESIGN.md?raw'
import decisionsMarkdown from '@front-brain-example/.brain/decisions.md?raw'
import reviewMarkdown from '@front-brain-example/.brain/reviews/REVIEW-SUMMARY.md?raw'
import state from '@front-brain-example/.brain/state.json'
import metrics from '@front-brain-example/.brain/metrics.json'
import queue from '@front-brain-example/.brain/queue.json'
import rulesConfig from '@front-brain-example/.brain/control/rules.json'
import observer from '@front-brain-example/.brain/reports/quality/observer.json'
import critic from '@front-brain-example/.brain/reports/quality/critic.json'
import scorecard from '@front-brain-example/.brain/reports/quality/scorecard.json'
import visualDebt from '@front-brain-example/.brain/reports/visual-debt.json'
import {
  allBlueprints,
  blueprintManifest,
} from '@components/blueprints.manifest.js'

const titleCase = (value) =>
  value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())

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

const heroMatch = decisionsMarkdown.match(/`(S-[^`]+)`/)
const navMatch = decisionsMarkdown.match(/`(N-[^`]+)`/)

export const selectedBlueprints = {
  hero: blueprintIndex.get(heroMatch?.[1] ?? 'S-AmbientAtmosphere'),
  nav: blueprintIndex.get(navMatch?.[1] ?? 'N-Contextual'),
}

const directionSpecs = [
  {
    label: 'Atmospheric Editorial',
    heroName: 'S-AmbientAtmosphere',
    navName: 'N-Contextual',
    rationale: 'Closest to the active Design DNA: warm-black, cinematic, strong typographic identity.',
  },
  {
    label: 'Cinematic Frame',
    heroName: 'S-FullBleedOverlay',
    navName: 'N-FullscreenOverlay',
    rationale: 'More overt launch energy with stronger scene-setting and a high-ceremony menu system.',
  },
  {
    label: 'Type-First Tension',
    heroName: 'S-TypeMonument',
    navName: 'N-MinimalHamburger',
    rationale: 'Pushes the brand toward a sharper editorial stance while staying premium and non-generic.',
  },
]

export const runOverview = {
  ...state,
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

export const directionCandidates = directionSpecs.map((direction, index) => ({
  id: `DIR-0${index + 1}`,
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
    detail: 'cross-project',
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
    note: runOverview.decision === 'retry' ? 'Autonomous retry still allowed' : 'Awaiting escalation',
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
    note: 'system coherence',
  },
  {
    label: 'Motion consistency',
    value: metrics.motionConsistencyScore,
    note: 'motion family alignment',
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
  designMarkdown,
  decisionsMarkdown,
  reviewMarkdown,
  observer,
  critic,
  scorecard,
  visualDebt,
  rulesConfig,
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
