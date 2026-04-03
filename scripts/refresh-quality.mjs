import { promises as fs } from 'node:fs'
import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { deriveCritic, multimodalCriticDefaults } from './multimodal-critic.mjs'

const signalRank = {
  WEAK: 1,
  MEDIUM: 2,
  STRONG: 3,
}

const parseArgs = (argv) => {
  const args = {}

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index]

    if (!token.startsWith('--')) {
      continue
    }

    const key = token.slice(2)
    const next = argv[index + 1]

    if (!next || next.startsWith('--')) {
      args[key] = true
      continue
    }

    args[key] = next
    index += 1
  }

  return args
}

const exists = async (targetPath) => {
  try {
    await fs.access(targetPath)
    return true
  } catch {
    return false
  }
}

const ensureDir = async (targetPath) => {
  await fs.mkdir(targetPath, { recursive: true })
}

const readJson = async (targetPath, fallback = null) => {
  try {
    const content = await fs.readFile(targetPath, 'utf8')
    return JSON.parse(content)
  } catch {
    return fallback
  }
}

const readText = async (targetPath, fallback = '') => {
  try {
    return await fs.readFile(targetPath, 'utf8')
  } catch {
    return fallback
  }
}

const writeJson = async (targetPath, value) => {
  await ensureDir(path.dirname(targetPath))
  await fs.writeFile(targetPath, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

const writeText = async (targetPath, value) => {
  await ensureDir(path.dirname(targetPath))
  await fs.writeFile(targetPath, value.trimEnd() + '\n', 'utf8')
}

const archiveReports = async (reportsDir, maxVersions = 5) => {
  const historyDir = path.join(reportsDir, 'history')
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  const versionDir = path.join(historyDir, timestamp)
  const filesToArchive = ['quality/observer.json', 'quality/critic.json', 'quality/scorecard.json']
  let hasAny = false

  for (const file of filesToArchive) {
    const src = path.join(reportsDir, file)
    if (await exists(src)) {
      hasAny = true
      const dest = path.join(versionDir, file)
      await ensureDir(path.dirname(dest))
      await fs.copyFile(src, dest)
    }
  }

  if (!hasAny) return

  try {
    const entries = await fs.readdir(historyDir, { withFileTypes: true })
    const dirs = entries.filter((e) => e.isDirectory()).map((e) => e.name).sort()
    const excess = dirs.slice(0, Math.max(0, dirs.length - maxVersions))
    for (const dir of excess) {
      await fs.rm(path.join(historyDir, dir), { recursive: true, force: true })
    }
  } catch { /* history dir might not exist yet */ }
}

const titleCase = (value = '') =>
  value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim()

const markdownFieldMap = (content = '') => {
  const map = {}

  for (const match of content.matchAll(/^- \*\*(.+?):\*\*\s*(.*)$/gm)) {
    map[match[1].trim()] = match[2].trim()
  }

  return map
}

const scoreFromSignal = (value = 'MEDIUM') => {
  if (value === 'STRONG') return 4.5
  if (value === 'MEDIUM') return 3.5
  return 2.2
}

const normalizeDimensionSignal = (value = 'MEDIUM') => {
  const raw = String(value || 'MEDIUM').trim().toUpperCase()
  if (raw === 'PASS') return 'STRONG'
  if (raw === 'WARN') return 'MEDIUM'
  if (raw === 'FAIL') return 'WEAK'
  if (raw === 'STRONG' || raw === 'MEDIUM' || raw === 'WEAK') return raw
  return 'MEDIUM'
}

const normalizeGateSignal = (value = 'WARN') => {
  const raw = String(value || 'WARN').trim().toUpperCase()
  if (raw === 'STRONG') return 'PASS'
  if (raw === 'WEAK') return 'FAIL'
  if (raw === 'MEDIUM') return 'WARN'
  if (raw === 'PASS' || raw === 'WARN' || raw === 'FAIL') return raw
  return 'WARN'
}

const detectA11yRisk = (gates) => {
  if (gates.contrast === 'FAIL' || gates.headingHierarchy === 'FAIL') return 'high'
  if (gates.contrast === 'WARN' || gates.headingHierarchy === 'WARN' || gates.images === 'WARN') return 'medium'
  return 'low'
}

const computeResponsiveScore = ({ sectionCount, hasMobileCapture, hasDesktopCapture, gates }) => {
  let score = 35
  if (hasDesktopCapture) score += 20
  if (hasMobileCapture) score += 20
  if (sectionCount >= 3) score += 10
  if (gates.images !== 'FAIL') score += 5
  if (gates.headingHierarchy !== 'FAIL') score += 5
  if (gates.contrast !== 'FAIL') score += 5
  return Math.max(0, Math.min(100, score))
}

const computeDesignConsistencyScore = (signals) => {
  const values = ['composition', 'depth', 'typography', 'craft'].map((key) => scoreFromSignal(signals[key]))
  return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 20)
}

const computeMotionConsistencyScore = (signals, manifest = {}) => {
  const base = scoreFromSignal(signals.motion) * 20
  const triggerBonus = Math.min(10, (manifest.motionProfile?.gsap?.scrollTriggerCount || 0) * 1.25)
  return Math.round(Math.max(0, Math.min(100, base + triggerBonus)))
}

const highestPriorityFocus = ({ signals, gates, debtItems }) => {
  if (gates.contrast === 'FAIL') return 'contrast'
  if (signals.depth === 'WEAK') return 'depth'
  if (signals.composition === 'WEAK') return 'composition'
  if (signals.motion === 'WEAK') return 'motion'
  if (debtItems[0]?.section) return debtItems[0].section
  return 'quality-loop'
}

const deriveRetryInstructions = ({ signals, gates, debtItems, selection }) => {
  const instructions = []

  if (gates.contrast === 'FAIL') {
    instructions.push('Increase contrast on the primary text/background pairs before any further polish or motion iteration.')
  }

  if (signals.depth === 'WEAK') {
    instructions.push('Increase visible depth separation with clearer z-index contrast, stronger layering, or a more legible atmospheric field.')
  }

  if (signals.composition === 'WEAK') {
    instructions.push('Introduce one sharper compositional break or overlap so the section reads as designed, not merely arranged.')
  }

  if (signals.motion === 'WEAK') {
    instructions.push('Add motion hierarchy with differentiated timing or scroll-linked behavior instead of relying on flat reveal patterns.')
  }

  if (instructions.length === 0 && debtItems.length > 0) {
    instructions.push(debtItems[0].message)
  }

  if (instructions.length === 0 && selection?.selection?.heroName) {
    instructions.push(`Keep building against ${selection.selection.heroName} + ${selection.selection.navName} and rerun the observer after the next section pass.`)
  }

  return instructions.slice(0, 3)
}

const parseAnalysisFallback = (analysisMarkdown = '') => {
  const dimensionMatch = (label) => {
    const match = analysisMarkdown.match(new RegExp(`\\|\\s+${label}\\s+\\|\\s+[^A-Za-z]*\\s*(STRONG|MEDIUM|WEAK)\\s+\\|\\s+([0-9.]+)\\/5\\s+\\|\\s+(.+?)\\s+\\|`, 'i'))
    return {
      signal: normalizeDimensionSignal(match?.[1] ?? 'MEDIUM'),
      score: Number(match?.[2] ?? 3.5),
      evidence: match?.[3]?.trim() ?? '',
    }
  }

  const gateMatch = (label, fallback = 'WARN') => {
    const match = analysisMarkdown.match(new RegExp(`\\|\\s+${label.replace(/[()]/g, '\\$&')}\\s+\\|\\s+(PASS|WARN|FAIL|STRONG|MEDIUM|WEAK)\\s+\\|\\s+(.+?)\\s+\\|`, 'i'))
    return {
      signal: normalizeGateSignal(match?.[1] ?? fallback),
      detail: match?.[2]?.trim() ?? '',
    }
  }

  return {
    dimensions: {
      composition: dimensionMatch('Composition'),
      depth: dimensionMatch('Depth'),
      typography: dimensionMatch('Typography'),
      motion: dimensionMatch('Motion'),
      craft: dimensionMatch('Craft'),
    },
    gates: {
      contrast: gateMatch('Contrast \\(WCAG AA\\)', 'WARN'),
      animations: gateMatch('Animation rules', 'WARN'),
      images: gateMatch('Images', 'WARN'),
      headingHierarchy: gateMatch('Heading hierarchy', 'WARN'),
      meta: gateMatch('Meta / SEO', 'WARN'),
    },
  }
}

const deriveObserverFromManifest = ({ manifest = null, analysisMarkdown = '', state = {} }) => {
  const fallback = parseAnalysisFallback(analysisMarkdown)
  const excellenceSignals = manifest?.excellenceSignals ?? {}
  const rawScores = excellenceSignals._scores ?? {}
  const manifestGates = manifest?.qualityGates ?? {}
  const metaTags = manifest?.metaTags ?? {}
  const interactions = manifest?.interactions ?? {}
  const sectionMap = manifest?.sectionClassifications ?? []

  const signals = {
    composition: normalizeDimensionSignal(excellenceSignals.composition ?? fallback.dimensions.composition.signal),
    depth: normalizeDimensionSignal(excellenceSignals.depth ?? fallback.dimensions.depth.signal),
    typography: normalizeDimensionSignal(excellenceSignals.typography ?? fallback.dimensions.typography.signal),
    motion: normalizeDimensionSignal(excellenceSignals.motion ?? fallback.dimensions.motion.signal),
    craft: normalizeDimensionSignal(excellenceSignals.craft ?? fallback.dimensions.craft.signal),
  }

  const dimensionScores = {
    composition: Number(rawScores.composition ?? fallback.dimensions.composition.score ?? scoreFromSignal(signals.composition)),
    depth: Number(rawScores.depth ?? fallback.dimensions.depth.score ?? scoreFromSignal(signals.depth)),
    typography: Number(rawScores.typography ?? fallback.dimensions.typography.score ?? scoreFromSignal(signals.typography)),
    motion: Number(rawScores.motion ?? fallback.dimensions.motion.score ?? scoreFromSignal(signals.motion)),
    craft: Number(rawScores.craft ?? fallback.dimensions.craft.score ?? scoreFromSignal(signals.craft)),
  }

  const gates = {
    contrast: normalizeGateSignal(manifestGates.contrast?.signal ?? fallback.gates.contrast.signal),
    animations: normalizeGateSignal(
      manifestGates.animations?.clean === true
        ? 'PASS'
        : manifestGates.animations?.clean === false
          ? 'FAIL'
          : fallback.gates.animations.signal,
    ),
    images: normalizeGateSignal(manifestGates.images?.signal ?? fallback.gates.images.signal),
    headingHierarchy: normalizeGateSignal(manifestGates.headings?.signal ?? fallback.gates.headingHierarchy.signal),
    meta: normalizeGateSignal(metaTags.signal ?? fallback.gates.meta.signal),
  }

  const debtItems = []

  for (const [dimension, signal] of Object.entries(signals)) {
    if (signal === 'STRONG') {
      continue
    }

    debtItems.push({
      id: `OBS-${dimension.toUpperCase()}`,
      section: state.activeSection || 'overview',
      severity: signal === 'WEAK' ? 'medium' : 'low',
      issue: signal === 'WEAK'
        ? `${titleCase(dimension)} is below target and needs a visible upgrade before approval.`
        : `${titleCase(dimension)} is only medium and likely needs another polish pass.`,
    })
  }

  if (gates.contrast === 'FAIL') {
    debtItems.push({
      id: 'GATE-CONTRAST',
      section: state.activeSection || 'overview',
      severity: 'critical',
      issue: 'Contrast gate failed. This run cannot be auto-approved until text/background pairs are corrected.',
    })
  }

  if (gates.headingHierarchy === 'FAIL') {
    debtItems.push({
      id: 'GATE-HEADINGS',
      section: state.activeSection || 'overview',
      severity: 'medium',
      issue: 'Heading hierarchy failed and must be repaired before the run can be considered stable.',
    })
  }

  if (gates.animations === 'FAIL') {
    debtItems.push({
      id: 'GATE-ANIMATIONS',
      section: state.activeSection || 'overview',
      severity: 'medium',
      issue: 'Animation rules failed. The motion system likely violates anti-pattern constraints or lacks hierarchy.',
    })
  }

  const observerScore = Number(
    (
      (dimensionScores.composition +
        dimensionScores.depth +
        dimensionScores.typography +
        dimensionScores.motion +
        dimensionScores.craft) /
      5 *
      2
    ).toFixed(2),
  )

  return {
    observer: {
      runId: `observer-${state.project?.slug || 'project'}`,
      generatedAt: new Date().toISOString(),
      sourceDir: manifest ? 'manifest.json' : 'analysis.md',
      target: `${state.activePage || 'home'}/${state.activeSection || 'overview'}`,
      viewports: [375, 768, 1280, 1440],
      signals,
      gates,
      evidence: {
        sectionCount: manifest?.sectionCount ?? sectionMap.length ?? 0,
        pageHeight: manifest?.pageHeight ?? null,
        techStack: manifest?.techStack?.libraries ?? [],
        cssCustomPropertyCount: Object.keys(manifest?.cssCustomProperties ?? {}).length,
        hoverStates: interactions.hoverStates?.length ?? 0,
        clickStates: interactions.clickStates?.length ?? 0,
        scrollDiffs: interactions.scrollDiffs?.length ?? 0,
      },
      visualDebt: debtItems,
    },
    observerScore,
    debtItems,
  }
}

const summarizeVisualDebt = (items) => {
  const summary = {
    open: items.length,
    critical: 0,
    medium: 0,
    low: 0,
  }

  for (const item of items) {
    if (item.severity === 'critical') summary.critical += 1
    else if (item.severity === 'medium') summary.medium += 1
    else summary.low += 1
  }

  return summary
}

const updateStateMarkdown = async ({ projectDir, stateJson, blocker }) => {
  const targetPath = path.join(projectDir, '.brain', 'state.md')
  const previousContent = await readText(targetPath)
  const previousFields = markdownFieldMap(previousContent)
  const content = `# Brain State
- **Project:** ${stateJson.project?.name || 'Project'} (${stateJson.project?.slug || 'project'})
- **Phase:** ${titleCase(stateJson.currentPhase || 'quality')}
- **Task:** ${stateJson.currentTask || 'quality/refresh'}
- **Blocker:** ${blocker || 'none'}
- **Next:** ${stateJson.nextAction || 'Run the next quality step.'}
- **Mode:** ${stateJson.mode || 'design-autonomous'}
- **Files created:** ${previousFields['Files created'] || '0'}
- **Sections:** ${previousFields.Sections || '0/0'}
`

  await writeText(targetPath, content)
}

const updateReviewSummary = async ({ projectDir, projectName, scorecard, visualDebt, observer, critic, nextAction }) => {
  const targetPath = path.join(projectDir, '.brain', 'reviews', 'REVIEW-SUMMARY.md')
  const content = `# Review Summary — ${projectName}

## Quality Snapshot

- Observer: ${scorecard.observerScore}/10
- Critic: ${scorecard.criticScore}/10
- Critic mode: ${critic.source}${critic.model ? ` (${critic.model})` : ''}
- Final: ${scorecard.finalScore}/10
- Decision: ${scorecard.decision}
- Visual debt open: ${visualDebt.summary.open}

## Signals

- Composition: ${observer.signals.composition}
- Depth: ${observer.signals.depth}
- Typography: ${observer.signals.typography}
- Motion: ${observer.signals.motion}
- Craft: ${observer.signals.craft}

## Critic Notes

${critic.notes.map((note) => `- ${note}`).join('\n') || '- none'}

## Next Action

- ${nextAction}
`

  await writeText(targetPath, content)
}

const findObserverSourceDir = async (projectDir, explicitSource) => {
  const directCandidates = []

  if (explicitSource) {
    directCandidates.push(path.resolve(explicitSource))
  }

  directCandidates.push(
    path.join(projectDir, '.brain', 'observer', 'localhost'),
    path.join(projectDir, '.brain', 'observer', 'final', 'localhost'),
    path.join(projectDir, '.brain', 'observer', 'final'),
    path.join(projectDir, 'docs', 'review', 'final'),
  )

  for (const candidate of directCandidates) {
    if (await exists(path.join(candidate, 'manifest.json')) || await exists(path.join(candidate, 'analysis.md'))) {
      return candidate
    }
  }

  return null
}

const runObserver = async ({ projectDir, port = 5173 }) => {
  const scriptPath = path.join(path.dirname(fileURLToPath(import.meta.url)), 'capture-refs.mjs')
  const observerDir = path.join(projectDir, '.brain', 'observer')
  await ensureDir(observerDir)

  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [scriptPath, '--local', '--port', String(port), observerDir], {
      stdio: 'inherit',
      shell: false,
    })

    child.on('error', reject)
    child.on('exit', (code) => {
      if (code === 0) {
        resolve()
        return
      }

      reject(new Error(`capture-refs failed with exit code ${code}`))
    })
  })
}

const refreshQuality = async ({
  projectDir,
  observerSourceDir = null,
  runObserverFirst = false,
  port = 5173,
  criticMode = multimodalCriticDefaults.defaultMode,
  criticModel = multimodalCriticDefaults.defaultModel,
}) => {
  const statePath = path.join(projectDir, '.brain', 'state.json')
  const metricsPath = path.join(projectDir, '.brain', 'metrics.json')
  const rulesPath = path.join(projectDir, '.brain', 'control', 'rules.json')
  const designPath = path.join(projectDir, 'DESIGN.md')
  const selectionPath = path.join(projectDir, '.brain', 'blueprints', 'selection.json')

  const state = await readJson(statePath, {})
  const metrics = await readJson(metricsPath, {})
  const rulesConfig = await readJson(rulesPath, { thresholds: { observerMinimum: 'MEDIUM', criticMinimum: 7, finalMinimum: 7.5 } })
  const blueprintSelection = await readJson(selectionPath, null)
  const designMarkdown = await readText(designPath)

  if (runObserverFirst) {
    await runObserver({ projectDir, port })
  }

  const sourceDir = await findObserverSourceDir(projectDir, observerSourceDir)
  if (!sourceDir) {
    throw new Error(`No observer source found for ${projectDir}. Run capture-refs first or pass --observer-source.`)
  }

  const manifest = await readJson(path.join(sourceDir, 'manifest.json'), null)
  const analysisMarkdown = await readText(path.join(sourceDir, 'analysis.md'))
  const { observer, observerScore, debtItems } = deriveObserverFromManifest({ manifest, analysisMarkdown, state })
  const { critic, criticScore } = await deriveCritic({
    observer,
    observerScore,
    rulesConfig,
    blueprintSelection,
    designMarkdown,
    sourceDir,
    criticMode,
    criticModel,
  })

  const rawConfidence = Number(blueprintSelection?.selection?.confidence ?? 0.4)
  const safeConfidence = Number.isFinite(rawConfidence) ? Math.max(0, Math.min(1, rawConfidence)) : 0.4
  const memoryAlignmentScore = Number((safeConfidence * 10).toFixed(2))
  const rawFinal = observerScore * 0.48 + criticScore * 0.34 + memoryAlignmentScore * 0.18
  const finalScore = Number.isFinite(rawFinal) ? Number(Math.max(0, Math.min(10, rawFinal)).toFixed(2)) : 0
  const thresholds = rulesConfig.thresholds ?? { observerMinimum: 'MEDIUM', criticMinimum: 7, finalMinimum: 7.5 }
  const safeSignalRank = (signal) => signalRank[normalizeDimensionSignal(signal)] ?? 0
  const thresholdRank = safeSignalRank(thresholds.observerMinimum || 'MEDIUM')
  const observerPass = ['composition', 'depth', 'typography', 'motion', 'craft']
    .every((dim) => safeSignalRank(observer.signals[dim]) >= thresholdRank)
  const criticPass = Number.isFinite(criticScore) && criticScore >= Number(thresholds.criticMinimum ?? 7)
  const finalPass = Number.isFinite(finalScore) && finalScore >= Number(thresholds.finalMinimum ?? 7.5)
  const decision =
    observer.gates.contrast === 'FAIL'
      ? 'flag'
      : observerPass && criticPass && finalPass
        ? 'approve'
        : 'retry'

  const visualDebtItems = debtItems.map((item) => ({
    id: item.id,
    section: item.section,
    severity: item.severity,
    owner: 'quality-loop',
    status: 'open',
    message: item.issue,
  }))
  const visualDebt = {
    summary: summarizeVisualDebt(visualDebtItems),
    items: visualDebtItems,
  }

  const retryInstructions = deriveRetryInstructions({
    signals: observer.signals,
    gates: observer.gates,
    debtItems: visualDebtItems,
    selection: blueprintSelection,
  })

  const scorecard = {
    target: observer.target,
    observerScore,
    criticScore,
    memoryAlignmentScore,
    finalScore,
    decision,
    retryInstructions,
  }

  const nextAction =
    decision === 'approve'
      ? 'Proceed to the next section or final integration pass.'
      : decision === 'flag'
        ? 'Human review required before the autonomous loop can continue.'
        : retryInstructions[0] || 'Retry the current section and rerun the observer.'

  const currentFocus = highestPriorityFocus({
    signals: observer.signals,
    gates: observer.gates,
    debtItems: visualDebtItems,
  })

  const updatedMetrics = {
    ...metrics,
    designConsistencyScore: computeDesignConsistencyScore(observer.signals),
    motionConsistencyScore: computeMotionConsistencyScore(observer.signals, manifest ?? {}),
    responsiveScore: computeResponsiveScore({
      sectionCount: observer.evidence.sectionCount,
      hasMobileCapture: true,
      hasDesktopCapture: true,
      gates: observer.gates,
    }),
    a11yRisk: detectA11yRisk(observer.gates),
    visualDebtOpen: visualDebt.summary.open,
    observerSignals: observer.signals,
    scorecard: {
      observer: observerScore,
      critic: criticScore,
      memoryAlignment: memoryAlignmentScore,
      final: finalScore,
    },
    criticMode: critic.source,
  }

  const updatedState = {
    ...state,
    currentPhase: decision === 'approve' ? 'quality-approved' : 'quality',
    currentTask: 'quality/refresh',
    currentFocus,
    lastReviewAt: new Date().toISOString(),
    nextAction,
  }

  await archiveReports(path.join(projectDir, '.brain', 'reports'))
  await writeJson(path.join(projectDir, '.brain', 'reports', 'quality', 'observer.json'), observer)
  await writeJson(path.join(projectDir, '.brain', 'reports', 'quality', 'critic.json'), critic)
  await writeJson(path.join(projectDir, '.brain', 'reports', 'quality', 'scorecard.json'), scorecard)
  await writeJson(path.join(projectDir, '.brain', 'reports', 'visual-debt.json'), visualDebt)
  await writeJson(metricsPath, updatedMetrics)
  await writeJson(statePath, updatedState)
  await updateStateMarkdown({
    projectDir,
    stateJson: updatedState,
    blocker: decision === 'flag' ? 'quality gate failure' : 'none',
  })
  await updateReviewSummary({
    projectDir,
    projectName: updatedState.project?.name || path.basename(projectDir),
    scorecard,
    visualDebt,
    observer,
    critic,
    nextAction,
  })

  return {
    observer,
    critic,
    scorecard,
    visualDebt,
    metrics: updatedMetrics,
    state: updatedState,
    sourceDir,
  }
}

const main = async () => {
  const args = parseArgs(process.argv.slice(2))
  if (typeof args.project !== 'string') {
    throw new Error('Missing required argument: --project <path>')
  }

  const projectDir = path.resolve(args.project)
  const result = await refreshQuality({
    projectDir,
    observerSourceDir: typeof args['observer-source'] === 'string' ? args['observer-source'] : null,
    runObserverFirst: Boolean(args['run-observer']),
    port: Number(args.port || 5173),
    criticMode: typeof args['critic-mode'] === 'string' ? args['critic-mode'] : multimodalCriticDefaults.defaultMode,
    criticModel: typeof args['critic-model'] === 'string' ? args['critic-model'] : multimodalCriticDefaults.defaultModel,
  })

  console.log(
    `Refreshed quality for ${result.state.project?.name || path.basename(projectDir)} from ${result.sourceDir} using ${result.critic.source}`,
  )
}

main().catch((error) => {
  console.error(error.message)
  process.exitCode = 1
})
