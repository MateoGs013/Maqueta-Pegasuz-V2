import { promises as fs } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoDir = path.resolve(__dirname, '..')
const desktopDir = path.join(os.homedir(), 'Desktop')
const exampleDir = path.join(repoDir, '.claude', 'front-brain', 'examples', 'demo-run')
const runtimeDir = path.join(repoDir, '.claude', 'front-brain', 'runtime')
const outputFile = path.join(runtimeDir, 'runs.generated.json')

const defaultThresholds = {
  observerMinimum: 'MEDIUM',
  criticMinimum: 7,
  finalMinimum: 7.5,
}

const defaultRules = [
  {
    id: 'LEGACY-001',
    type: 'constraint',
    enabled: true,
    text: 'Legacy run imported through markdown bridge. Validate generated metrics before trusting automation.',
  },
]

const fallbackObserverSignals = {
  composition: 'MEDIUM',
  depth: 'MEDIUM',
  typography: 'MEDIUM',
  motion: 'MEDIUM',
  craft: 'MEDIUM',
}

const titleCase = (value = '') =>
  value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim()

const exists = async (targetPath) => {
  try {
    await fs.access(targetPath)
    return true
  } catch {
    return false
  }
}

const readText = async (targetPath, fallback = '') => {
  try {
    return await fs.readFile(targetPath, 'utf8')
  } catch {
    return fallback
  }
}

const readJson = async (targetPath, fallback = null) => {
  try {
    const content = await fs.readFile(targetPath, 'utf8')
    return JSON.parse(content)
  } catch {
    return fallback
  }
}

const markdownFieldMap = (content) => {
  const map = {}
  for (const match of content.matchAll(/^- \*\*(.+?):\*\*\s*(.*)$/gm)) {
    map[match[1].trim()] = match[2].trim()
  }
  return map
}

const cleanProjectName = (value = '') =>
  value.replace(/\s*\([^)]+\)\s*$/, '').trim()

const extractDecisionChoice = (content, decisionId) => {
  const pattern = new RegExp(`##\\s+${decisionId}[\\s\\S]*?-\\s+\\*\\*Choice:\\*\\*\\s+(.+)`)
  const match = content.match(pattern)
  return match?.[1]?.split('\n')[0]?.trim() ?? ''
}

const parseQueueMarkdown = (content) => {
  const result = {
    active: [],
    pending: [],
    done: [],
  }

  for (const match of content.matchAll(/^- \[(.+?)\]\s+([^|]+?)\s+\|\s+([^|]+?)\s+\|\s+(.+)$/gm)) {
    const rawStatus = match[1].trim().toUpperCase()
    const item = {
      id: match[2].trim(),
      agent: match[3].trim(),
      status: rawStatus.toLowerCase(),
      detail: match[4].trim(),
    }

    if (rawStatus === 'IN_PROGRESS') {
      result.active.push(item)
      continue
    }

    if (rawStatus === 'DONE') {
      result.done.push(item)
      continue
    }

    result.pending.push(item)
  }

  return result
}

const pickSectionsLine = (value = '') => {
  const match = value.match(/(\d+)\s*\/\s*(\d+)/)
  if (!match) {
    return { complete: 0, total: 0 }
  }

  return {
    complete: Number(match[1]),
    total: Number(match[2]),
  }
}

const inferRetryCount = (blocker = '') => {
  const directMatch = blocker.match(/(\d+)\s*(?:x|iterations?)/i)
  if (directMatch) {
    return Number(directMatch[1])
  }

  return 0
}

const inferLegacyDesignMarkdown = ({ identityContent, decisionsContent, stateFields, folderName }) => {
  const identity = markdownFieldMap(identityContent)
  const mood = identity.Mood || 'Dark, cinematic, editorial'
  const brandType = identity.Type || 'Creative project'
  const audience = identity.Audience || 'General audience'
  const references = identity.References || 'No external references registered'
  const mode = identity.Mode || stateFields.Mode || 'supervised'
  const fontChoice = extractDecisionChoice(decisionsContent, 'D-001') || 'Legacy run does not expose a canonical font pairing yet.'
  const paletteChoice = extractDecisionChoice(decisionsContent, 'D-002') || 'Legacy run does not expose a canonical palette artifact yet.'
  const sectionPlan = extractDecisionChoice(decisionsContent, 'D-003') || identity.Sections || 'Section plan unavailable.'

  return `# DESIGN.md — ${titleCase(folderName)}

## Project Framing

- Project: ${identity.Type ? titleCase(folderName) : titleCase(folderName)}
- Type: ${brandType}
- Mode: ${mode}
- Goal: Legacy markdown run imported into the front-brain bridge so the panel can inspect it alongside modern hybrid runs

## Brand Intent

- Serve ${audience}
- Preserve the original project posture: ${mood}
- Keep the bridge readable even when the run predates \`DESIGN.md\`

## Design Principles

1. Convert legacy intent into explicit design DNA
2. Preserve the strongest decisions already approved in the markdown log
3. Make debt and blockers visible to the backoffice

## Tone And Atmosphere

- ${mood}
- Reference source: ${references}
- Legacy bridge mode: markdown-first

## Composition Constraints

- Preserve the approved section structure when available
- Surface blockers instead of fabricating progress
- Keep composition decisions explicit in panel output

## Typography Rules

- ${fontChoice}
- Promote approved pairings into future structured runs

## Palette And Token Intent

- ${paletteChoice}
- Backfill missing token intent during migration to the hybrid schema

## Motion Rules

- Maintain distinct motion categories across sections where already planned
- Mark missing observer data as bridge-generated, not authoritative

## Responsive Rules

- Legacy runs without JSON observer output must still target 375, 768, 1280, and 1440
- Preserve the documented section rhythm during migration

## Accessibility Rules

- Treat missing structured QA as risk, not as pass
- Require manual verification until observer JSON exists

## Anti-Patterns

- Silent migration that hides blockers
- Assuming a run is healthy because it has screenshots
- Treating markdown-only state as fully authoritative automation data

## Seed Policy

- No explicit seed pair recorded in legacy run
- Preserve approved section plan: ${sectionPlan}
- Migrate future retries to structured seed selection once the hybrid contract is emitted
`
}

const inferLegacySnapshot = ({ folderName, sourceDir, stateContent, identityContent, queueContent, decisionsContent, reviewContent }) => {
  const stateFields = markdownFieldMap(stateContent)
  const identity = markdownFieldMap(identityContent)
  const queue = parseQueueMarkdown(queueContent)
  const sections = pickSectionsLine(stateFields.Sections || '')
  const retriesUsed = inferRetryCount(stateFields.Blocker || '')
  const retryBudget = Math.max(retriesUsed, 3)
  const completion = sections.total > 0 ? Math.round((sections.complete / sections.total) * 100) : 0
  const stopped = /stopped/i.test(stateFields.Phase || '')
  const finalScore = stopped ? 5.1 : 6.4
  const visualDebtOpen = Math.max(sections.total - sections.complete, 1) + retriesUsed
  const observerScore = stopped ? 5.4 : 6.2
  const criticScore = stopped ? 4.8 : 6.1
  const memoryAlignmentScore = stopped ? 6 : 6.8
  const decision = stopped ? 'flag' : 'retry'
  const projectName = cleanProjectName(stateFields.Project || titleCase(folderName))
  const projectType = identity.Type || 'Legacy project'
  const nextAction = stopped
    ? 'Migrate this project to the hybrid front-brain contract before resuming autonomous delivery.'
    : 'Complete hybrid state emission so observer and critic can take over.'

  const reviewMarkdown = reviewContent || `# Review Summary — ${projectName}

## Current State

- Imported through the legacy markdown bridge
- Structured observer and critic output are not available yet
- Human review is still required before trusting this run

## Next Action

${nextAction}
`

  const observer = {
    runId: `legacy-observer-${folderName}`,
    target: 'legacy/import',
    viewports: [375, 768, 1280, 1440],
    signals: fallbackObserverSignals,
    gates: {
      contrast: 'WARN',
      animations: 'WARN',
      images: 'WARN',
      headingHierarchy: 'WARN',
      meta: 'WARN',
    },
    visualDebt: [
      {
        id: `LEGACY-${folderName}-001`,
        severity: stopped ? 'medium' : 'low',
        section: 'project',
        issue: stateFields.Blocker || 'Legacy run does not expose structured section debt.',
      },
    ],
  }

  const critic = {
    runId: `legacy-critic-${folderName}`,
    target: 'legacy/import',
    score: criticScore,
    brandAlignment: 'medium',
    verdict: decision,
    notes: [
      'This run was imported from markdown-only memory.',
      'Observer and critic scores are bridge-generated heuristics until the project emits structured quality JSON.',
      nextAction,
    ],
    issues: [
      {
        type: 'migration',
        severity: 'medium',
        message: 'Hybrid front-brain artifacts are missing; automation confidence is intentionally reduced.',
      },
    ],
  }

  const visualDebt = {
    summary: {
      open: visualDebtOpen,
      critical: stopped ? 1 : 0,
      medium: Math.max(retriesUsed, 1),
      low: Math.max(visualDebtOpen - Math.max(retriesUsed, 1), 0),
    },
    items: [
      {
        id: `LEGACY-${folderName}-STATE`,
        section: 'project',
        severity: stopped ? 'medium' : 'low',
        owner: 'ceo',
        status: 'open',
        message: stateFields.Blocker || 'Structured state migration is still pending.',
      },
    ],
  }

  const scorecard = {
    target: 'legacy/import',
    observerScore,
    criticScore,
    memoryAlignmentScore,
    finalScore,
    decision,
    retryInstructions: [
      nextAction,
      'Generate DESIGN.md and .brain/*.json so the panel can stop relying on markdown heuristics.',
    ],
  }

  return {
    id: folderName,
    label: projectName,
    sourceType: 'legacy-project',
    sourcePath: sourceDir,
    legacyBridge: true,
    project: {
      name: projectName,
      slug: folderName,
      type: projectType,
    },
    mode: (identity.Mode || stateFields.Mode || 'supervised').toLowerCase(),
    currentPhase: (stateFields.Phase || 'legacy').toLowerCase(),
    currentTask: stateFields.Task === '—' ? 'legacy/import' : (stateFields.Task || 'legacy/import'),
    currentFocus: stateFields.Blocker || 'migration',
    healthIndex: stopped ? 32 : 58,
    maturityScore: completion,
    activePage: 'home',
    activeSection: sections.complete > 0 ? 'review' : 'project',
    retriesUsed,
    retryBudget,
    lastReviewAt: new Date().toISOString(),
    nextAction,
    documents: {
      designMarkdown: inferLegacyDesignMarkdown({
        identityContent,
        decisionsContent,
        stateFields,
        folderName,
      }),
      decisionsMarkdown: decisionsContent || `# Decisions — ${projectName}\n\nLegacy run has no structured decision log.`,
      reviewMarkdown,
    },
    queue,
    metrics: {
      designConsistencyScore: stopped ? 52 : 61,
      motionConsistencyScore: stopped ? 40 : 55,
      responsiveScore: stopped ? 44 : 58,
      a11yRisk: 'medium',
      visualDebtOpen,
      observerSignals: fallbackObserverSignals,
      scorecard: {
        observer: observerScore,
        critic: criticScore,
        memoryAlignment: memoryAlignmentScore,
        final: finalScore,
      },
    },
    rulesConfig: {
      rules: defaultRules,
      thresholds: defaultThresholds,
    },
    observer,
    critic,
    scorecard,
    visualDebt,
  }
}

const loadModernRun = async ({ id, sourceDir, sourceType }) => {
  const designMarkdown = await readText(path.join(sourceDir, 'DESIGN.md'))
  const decisionsMarkdown = await readText(path.join(sourceDir, '.brain', 'decisions.md'))
  const reviewMarkdown = await readText(path.join(sourceDir, '.brain', 'reviews', 'REVIEW-SUMMARY.md'))
  const state = await readJson(path.join(sourceDir, '.brain', 'state.json'), {})
  const metrics = await readJson(path.join(sourceDir, '.brain', 'metrics.json'), {})
  const queue = await readJson(path.join(sourceDir, '.brain', 'queue.json'), { active: [], pending: [], done: [] })
  const rulesConfig = await readJson(path.join(sourceDir, '.brain', 'control', 'rules.json'), {
    rules: defaultRules,
    thresholds: defaultThresholds,
  })
  const observer = await readJson(path.join(sourceDir, '.brain', 'reports', 'quality', 'observer.json'), {
    runId: `observer-${id}`,
    target: 'unknown',
    viewports: [375, 768, 1280, 1440],
    signals: fallbackObserverSignals,
    gates: {},
    visualDebt: [],
  })
  const critic = await readJson(path.join(sourceDir, '.brain', 'reports', 'quality', 'critic.json'), {
    runId: `critic-${id}`,
    target: 'unknown',
    score: 7,
    brandAlignment: 'medium',
    verdict: 'retry',
    notes: [],
    issues: [],
  })
  const scorecard = await readJson(path.join(sourceDir, '.brain', 'reports', 'quality', 'scorecard.json'), {
    target: observer.target,
    observerScore: 7,
    criticScore: 7,
    memoryAlignmentScore: 7,
    finalScore: 7,
    decision: 'retry',
    retryInstructions: [],
  })
  const visualDebt = await readJson(path.join(sourceDir, '.brain', 'reports', 'visual-debt.json'), {
    summary: { open: 0, critical: 0, medium: 0, low: 0 },
    items: [],
  })

  return {
    id,
    label: state.project?.name || titleCase(id),
    sourceType,
    sourcePath: sourceDir,
    legacyBridge: false,
    ...state,
    documents: {
      designMarkdown,
      decisionsMarkdown,
      reviewMarkdown,
    },
    queue,
    metrics,
    rulesConfig,
    observer,
    critic,
    scorecard,
    visualDebt,
  }
}

const discoverDesktopRuns = async () => {
  const entries = await fs.readdir(desktopDir, { withFileTypes: true })
  const runs = []

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue
    }

    if (entry.name === 'maqueta') {
      continue
    }

    const sourceDir = path.join(desktopDir, entry.name)
    const hasModernState = await exists(path.join(sourceDir, '.brain', 'state.json'))
    const hasLegacyState = await exists(path.join(sourceDir, '.brain', 'state.md'))

    if (!hasModernState && !hasLegacyState) {
      continue
    }

    if (hasModernState) {
      runs.push(await loadModernRun({ id: entry.name, sourceDir, sourceType: 'project' }))
      continue
    }

    const legacyState = await readText(path.join(sourceDir, '.brain', 'state.md'))
    const identityContent = await readText(path.join(sourceDir, '.brain', 'identity.md'))
    const queueContent = await readText(path.join(sourceDir, '.brain', 'queue.md'))
    const decisionsContent = await readText(path.join(sourceDir, '.brain', 'decisions.md'))
    const reviewContent = await readText(path.join(sourceDir, 'docs', 'review', 'REVIEW-SUMMARY.md'))

    runs.push(
      inferLegacySnapshot({
        folderName: entry.name,
        sourceDir,
        stateContent: legacyState,
        identityContent,
        queueContent,
        decisionsContent,
        reviewContent,
      }),
    )
  }

  return runs
}

const buildOutput = async () => {
  const exampleRun = await loadModernRun({
    id: 'demo-run',
    sourceDir: exampleDir,
    sourceType: 'example',
  })

  const projectRuns = await discoverDesktopRuns()
  projectRuns.sort((left, right) => left.label.localeCompare(right.label))

  const runs = [...projectRuns, exampleRun]
  const defaultRunId = projectRuns[0]?.id ?? exampleRun.id

  return {
    generatedAt: new Date().toISOString(),
    defaultRunId,
    runs,
  }
}

await fs.mkdir(runtimeDir, { recursive: true })
const output = await buildOutput()
await fs.writeFile(outputFile, `${JSON.stringify(output, null, 2)}\n`, 'utf8')

console.log(`Synced ${output.runs.length} front-brain run(s) to ${path.relative(repoDir, outputFile)}`)
