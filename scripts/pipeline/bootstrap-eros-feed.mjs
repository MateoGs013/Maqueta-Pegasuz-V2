import { promises as fs } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { selectBlueprintDirections } from './select-blueprints.mjs'

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

const titleCase = (value = '') =>
  value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase())

const slugify = (value = '') =>
  value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const toArray = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean)
  }

  if (typeof value === 'string') {
    return value
      .split(/[,\n]/)
      .map((item) => item.trim())
      .filter(Boolean)
  }

  return []
}

const exists = async (targetPath) => {
  try {
    await fs.access(targetPath)
    return true
  } catch {
    return false
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

const ensureDir = async (targetPath) => {
  await fs.mkdir(targetPath, { recursive: true })
}

const writeText = async (targetPath, content) => {
  await ensureDir(path.dirname(targetPath))
  await fs.writeFile(targetPath, content.trimEnd() + '\n', 'utf8')
}

const writeJson = async (targetPath, value) => {
  await ensureDir(path.dirname(targetPath))
  await fs.writeFile(targetPath, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

const moodProfiles = [
  {
    test: /cinematic|film|editorial|atmospheric/i,
    families: ['cinematic', 'ambient', 'editorial'],
    layoutBias: 'Asymmetric editorial framing with visible foreground and atmospheric depth.',
    sectionRhythm: 'Start with tension, relax into denser editorial content, then compress again near the close.',
    spatialSurprise: 'Break one container edge on the hero and keep one offset mid-plane element alive through scroll.',
    displayRole: 'High-contrast display voice with sharp letter-spacing control.',
    bodyRole: 'Quiet supporting sans that stays readable inside layered backgrounds.',
    scaleStrategy: 'Aggressive display-to-body contrast with at least one oversized lockup.',
    densityRule: 'Hero stays sparse; detail density grows only after the first proof section.',
    canvas: 'Near-black canvas with warm undertones and occasional luminous fog.',
    text: 'Warm white text with selective muted gray support.',
    accent: 'Use accent sparingly for motion cues and craft details, not for whole surfaces.',
    atmosphere: 'Layer grain, glows, blur fields, and shadow gradients instead of flat fills.',
    revealBias: 'Use curtain-style reveals and staggered layered entrances.',
    scrollBehavior: 'Allow scrubbed parallax on background planes, never on every element.',
    hoverLanguage: 'Hover states should feel magnetic and intentional, not UI-generic.',
    motionAvoid: 'Avoid repeated fade-only reveals and avoid turning sections into dashboards.',
    mobilePriority: 'Preserve headline tension first; collapse decoration before typography.',
    tabletBehavior: 'Keep one depth plane alive on tablet while simplifying overlap counts.',
    desktopBehavior: 'Preserve asymmetry and one composition break per major section.',
  },
  {
    test: /brutalist|bold|poster|graphic/i,
    families: ['brutalist', 'typography-led', 'modular'],
    layoutBias: 'Poster-like structural blocks with hard alignment shifts.',
    sectionRhythm: 'Alternate dense and sparse sections in sharp contrast.',
    spatialSurprise: 'Use one deliberate collision between copy and supporting media.',
    displayRole: 'Typography behaves like structure, not decoration.',
    bodyRole: 'Functional supporting text with controlled compression.',
    scaleStrategy: 'Very large headlines balanced by compact utility copy.',
    densityRule: 'Never allow every section to be equally dense.',
    canvas: 'High-contrast fields with one dominant surface tone.',
    text: 'Strong contrast text with one utility neutral.',
    accent: 'Use accent as a punch, not as a blanket theme.',
    atmosphere: 'Texture should come from blocks, borders, and cut lines rather than blur.',
    revealBias: 'Favor directional reveals and hard transitions.',
    scrollBehavior: 'Keep motion structural and snappy rather than floaty.',
    hoverLanguage: 'Hover should feel tactile and slightly confrontational.',
    motionAvoid: 'Avoid soft luxury glows and generic SaaS microinteractions.',
    mobilePriority: 'Protect hierarchy first; collapse decorative collisions if needed.',
    tabletBehavior: 'Reduce overlap count but preserve the main typographic interruption.',
    desktopBehavior: 'Keep structural tension through offset grids and hard rhythm changes.',
  },
  {
    test: /luxury|premium|elegant|fashion/i,
    families: ['luxury', 'editorial', 'ambient'],
    layoutBias: 'Refined editorial composition with long sightlines and generous negative space.',
    sectionRhythm: 'Slow reveal into denser storytelling, then return to restraint.',
    spatialSurprise: 'Introduce one subtle but memorable plane shift rather than loud overlap.',
    displayRole: 'Elegant display style with controlled rhythm and authority.',
    bodyRole: 'Measured supporting type with strong whitespace discipline.',
    scaleStrategy: 'Large display moments anchored by restrained body sizing.',
    densityRule: 'Let whitespace do part of the persuasion work.',
    canvas: 'Warm light or rich dark surfaces with restrained contrast extremes.',
    text: 'High-legibility neutral text with one softer support tone.',
    accent: 'Use accent as a luxury signal, never as a default highlight.',
    atmosphere: 'Subtle glow, film grain, and deep shadow transitions.',
    revealBias: 'Use elegant staged reveals with long easing tails.',
    scrollBehavior: 'Motion should feel expensive and deliberate, never twitchy.',
    hoverLanguage: 'Interactive details should feel polished and precise.',
    motionAvoid: 'Avoid novelty gimmicks and aggressive UI behavior.',
    mobilePriority: 'Maintain elegance by simplifying density before shrinking typography.',
    tabletBehavior: 'Keep generous whitespace and reduce decorative layers carefully.',
    desktopBehavior: 'Use widescreen breathing room to maintain premium pacing.',
  },
  {
    test: /product|saas|app|platform|dashboard/i,
    families: ['product UI', 'modular', 'interaction-led'],
    layoutBias: 'Show product structure through modular frames with one expressive break.',
    sectionRhythm: 'Alternate proof, explanation, and relief sections to avoid monotony.',
    spatialSurprise: 'One controlled breakout element should interrupt otherwise disciplined framing.',
    displayRole: 'Sharp display treatment that still reads product-first.',
    bodyRole: 'Utility-forward body system with disciplined hierarchy.',
    scaleStrategy: 'Large headline contrast supported by modular content blocks.',
    densityRule: 'Avoid letting every section become a card grid.',
    canvas: 'Neutral canvas with layered product surfaces and restrained glow.',
    text: 'Clear product contrast with secondary support tones.',
    accent: 'Accent exists to signal product value and interaction states.',
    atmosphere: 'Use shadows, glass layers, and subtle grid textures for depth.',
    revealBias: 'Combine content reveals with product-plane motion.',
    scrollBehavior: 'Use scrub on background/product planes only when it adds clarity.',
    hoverLanguage: 'Interactions should feel precise and product-grade, not playful by default.',
    motionAvoid: 'Avoid generic centered SaaS hero patterns and repetitive feature rows.',
    mobilePriority: 'Preserve clarity over spectacle when space collapses.',
    tabletBehavior: 'Stack modular surfaces without flattening all hierarchy.',
    desktopBehavior: 'Keep one expressive composition move alive beyond the hero.',
  },
]

const defaultProfile = {
  families: ['editorial', 'ambient', 'typography-led'],
  layoutBias: 'Asymmetric framing with one clear compositional break per key section.',
  sectionRhythm: 'Vary density and tempo instead of repeating a single safe layout.',
  spatialSurprise: 'Keep one visible compositional twist alive in the hero.',
  displayRole: 'Distinctive display typography drives hierarchy.',
  bodyRole: 'Supporting typography should stay quiet and readable.',
  scaleStrategy: 'Maintain strong size contrast between display and body roles.',
  densityRule: 'Do not let every section carry the same content weight.',
  canvas: 'Rich, non-flat surfaces with subtle atmospheric variation.',
  text: 'High-contrast text with one secondary support tone.',
  accent: 'Use accent sparingly and intentionally.',
  atmosphere: 'Layer depth with gradients, grain, shadow, and blur where appropriate.',
  revealBias: 'Use staged reveals with differentiated timing.',
  scrollBehavior: 'Reserve scrubbed motion for planes that benefit from depth.',
  hoverLanguage: 'Interactive details should feel considered, not default.',
  motionAvoid: 'Avoid repetitive fade-only motion and generic centered layouts.',
  mobilePriority: 'Preserve hierarchy first, decoration second.',
  tabletBehavior: 'Simplify overlap count without flattening hierarchy.',
  desktopBehavior: 'Preserve asymmetry and rhythm at large widths.',
}

const pickMoodProfile = (brief) => {
  const source = [brief.mood, brief.type, brief.description, brief.promptSummary].filter(Boolean).join(' ')
  return moodProfiles.find((profile) => profile.test.test(source)) ?? defaultProfile
}

const normalizeMode = (value = 'autonomous') => {
  const raw = String(value || 'autonomous').trim().toLowerCase()
  if (raw.includes('autonomous')) {
    return 'design-autonomous'
  }
  if (raw.includes('interactive')) {
    return 'interactive'
  }
  if (raw.includes('supervised')) {
    return 'supervised'
  }
  return raw || 'design-autonomous'
}

const normalizeBrief = ({ brief, projectDir }) => {
  const projectName = String(brief.name || path.basename(projectDir) || 'Untitled Project').trim()
  const slug = slugify(brief.slug || projectName)
  const type = String(brief.type || 'creative-studio').trim()
  const description = String(brief.description || 'A modern frontend project bootstrapped through the hybrid eros-feed contract.').trim()
  const audience = String(brief.audience || 'Design-conscious customers looking for a premium digital experience.').trim()
  const pages = toArray(brief.pages)
  const pageList = pages.length > 0 ? pages : ['home']
  const mood = String(brief.mood || 'Dark cinematic editorial').trim()
  const scheme = String(brief.scheme || 'dark').trim().toLowerCase()
  const references = toArray(brief.references)
  const constraints = toArray(brief.constraints)
  const mode = normalizeMode(brief.mode || 'autonomous')
  const brand = String(brief.brand || 'scratch').trim()
  const backend = String(brief.backend || 'none').trim()
  const promptSummary = String(brief.promptSummary || description).trim()
  const profile = pickMoodProfile({ mood, type, description, promptSummary })
  const allowedFamilies = toArray(brief.seedFamilies)
  const bannedSeeds = toArray(brief.bannedSeeds)

  return {
    name: projectName,
    slug,
    type,
    description,
    audience,
    pages: pageList,
    mood,
    scheme,
    references,
    constraints,
    mode,
    brand,
    backend,
    promptSummary,
    profile,
    allowedFamilies: allowedFamilies.length > 0 ? allowedFamilies : profile.families,
    bannedSeeds,
  }
}

const buildDesignMarkdown = (brief) => {
  const schemeCanvas =
    brief.scheme === 'light'
      ? 'Warm light canvas with subtle shadowed planes and no pure white fields.'
      : brief.profile.canvas

  const schemeText =
    brief.scheme === 'light'
      ? 'Deep near-black text with softened secondary grays.'
      : brief.profile.text

  const bannedSeedsLine = brief.bannedSeeds.length > 0 ? brief.bannedSeeds.join(', ') : 'None locked yet.'
  const constraintsLine = brief.constraints.length > 0 ? brief.constraints.map((item) => `- ${item}`).join('\n') : '- No extra constraints were supplied during intake.'

  return `# DESIGN.md

## Project

- Name: ${brief.name}
- Mode: ${brief.mode}
- Prompt summary: ${brief.promptSummary}

## Brand Intent

- Core promise: ${brief.description}
- Audience: ${brief.audience}
- Tone: ${brief.mood}

## Design Principles

- Principle 1: ${brief.profile.layoutBias}
- Principle 2: ${brief.profile.hoverLanguage}
- Principle 3: Use curated seed families as creative anchors, then mutate them without losing their distinctive bias.

## Composition Constraints

- Layout bias: ${brief.profile.layoutBias}
- Section rhythm: ${brief.profile.sectionRhythm}
- Spatial surprise: ${brief.profile.spatialSurprise}
- Banned repetition: Do not repeat the same hero-safe grid or motion recipe across consecutive sections.

## Typography Rules

- Display role: ${brief.profile.displayRole}
- Body role: ${brief.profile.bodyRole}
- Scale strategy: ${brief.profile.scaleStrategy}
- Density rule: ${brief.profile.densityRule}

## Palette Intent

- Canvas: ${schemeCanvas}
- Text: ${schemeText}
- Accent: ${brief.profile.accent}
- Atmospheric layers: ${brief.profile.atmosphere}

## Motion Rules

- Reveal bias: ${brief.profile.revealBias}
- Scroll behavior: ${brief.profile.scrollBehavior}
- Hover language: ${brief.profile.hoverLanguage}
- Avoid: ${brief.profile.motionAvoid}

## Responsive Rules

- Mobile priority: ${brief.profile.mobilePriority}
- Tablet behavior: ${brief.profile.tabletBehavior}
- Desktop behavior: ${brief.profile.desktopBehavior}

## Seed Policy

- Allowed families: ${brief.allowedFamilies.join(', ')}
- Banned seeds: ${bannedSeedsLine}
- Mutation budget: Medium-high. Preserve the structural identity of the selected seed family while adapting copy, density, and atmospheric craft to the brief.

## Anti-Patterns

- No centered generic SaaS hero.
- No repeated grid rhythm across consecutive sections.
- No default font stacks.
- No low-contrast atmospheric overlays.

## Planning Notes

- Pages requested: ${brief.pages.join(', ')}
- Brand starting point: ${brief.brand}
- Backend: ${brief.backend}
- References: ${brief.references.length > 0 ? brief.references.join(', ') : 'none'}

## Constraints

${constraintsLine}
`
}

const buildIdentityMarkdown = (brief) => `# Identity: ${brief.name}
- **Type:** ${brief.type}
- **Does:** ${brief.description}
- **Audience:** ${brief.audience}
- **Pages:** ${brief.pages.join(', ')}
- **Mood:** ${brief.mood}
- **Scheme:** ${brief.scheme}
- **References:** ${brief.references.length > 0 ? brief.references.join(', ') : 'none'}
- **Brand:** ${brief.brand}
- **Backend:** ${brief.backend}
- **Mode:** ${brief.mode}
- **Constraints:** ${brief.constraints.length > 0 ? brief.constraints.join('; ') : 'none'}
`

const buildStateMarkdown = ({ brief, activeTask, phaseLabel, nextAction }) => `# Brain State
- **Project:** ${brief.name} (${brief.slug})
- **Phase:** ${phaseLabel}
- **Task:** ${activeTask}
- **Blocker:** none
- **Next:** ${nextAction}
- **Mode:** ${brief.mode}
- **Files created:** 0
- **Sections:** 0/0
`

const createTask = (id, agent, status, detail = '') => {
  const task = { id, agent, status }
  if (detail) {
    task.detail = detail
  }
  return task
}

const buildQueueJson = ({ hasReferences }) => {
  const active = hasReferences
    ? [createTask('setup/capture-refs', 'ceo', 'in_progress')]
    : [createTask('design/brief', 'ceo', 'in_progress')]

  const pending = []

  if (hasReferences) {
    pending.push(
      createTask('setup/analyze-refs', 'reference-analyst', 'pending'),
      createTask('setup/observatory', 'ceo', 'pending'),
      createTask('design/brief', 'ceo', 'pending'),
    )
  }

  pending.push(
    createTask('design/tokens', 'designer', 'pending'),
    createTask('design/pages', 'designer', 'pending'),
    createTask('review/creative', 'ceo', 'pending'),
    createTask('setup/scaffold', 'ceo', 'pending'),
    createTask('setup/gen-tokens', 'ceo', 'pending'),
    createTask('context/atmosphere', 'ceo', 'pending'),
    createTask('build/atmosphere', 'builder', 'pending'),
    createTask('review/final', 'ceo', 'pending'),
  )

  return {
    active,
    pending,
    done: [
      createTask('setup/identity', 'ceo', 'done'),
      createTask('setup/create-dir', 'ceo', 'done'),
      createTask('setup/eros-feed-bootstrap', 'ceo', 'done'),
    ],
  }
}

const buildQueueMarkdown = ({ brief, queueJson }) => {
  const renderGroup = (items, emptyLabel) => {
    if (items.length === 0) {
      return emptyLabel
    }

    return items
      .map((item) => {
        const statusMap = {
          in_progress: 'IN_PROGRESS',
          pending: 'PENDING',
          done: 'DONE',
        }

        const detail = item.detail ? ` | ${item.detail}` : ''
        return `- [${statusMap[item.status] ?? item.status.toUpperCase()}] ${item.id} | ${item.agent}${detail}`
      })
      .join('\n')
  }

  return `# Task Queue — ${brief.name}

## Active
${renderGroup(queueJson.active, '- [NONE] No active tasks')}

## Done
${renderGroup(queueJson.done, '- [NONE] No completed tasks')}

## Pending
${renderGroup(queueJson.pending, '- [NONE] No pending tasks')}
`
}

const buildStateJson = ({ brief, hasReferences, nextAction }) => ({
  project: {
    name: brief.name,
    slug: brief.slug,
    type: brief.type,
  },
  mode: brief.mode,
  currentPhase: hasReferences ? 'setup' : 'design',
  currentTask: hasReferences ? 'setup/capture-refs' : 'design/brief',
  currentFocus: hasReferences ? 'reference-observatory' : 'brief-alignment',
  healthIndex: hasReferences ? 61 : 66,
  maturityScore: hasReferences ? 8 : 12,
  activePage: brief.pages[0] || 'home',
  activeSection: hasReferences ? 'references' : 'creative-direction',
  retriesUsed: 0,
  retryBudget: 3,
  lastReviewAt: null,
  nextAction,
})

const buildMetricsJson = () => ({
  designConsistencyScore: 0,
  motionConsistencyScore: 0,
  responsiveScore: 0,
  a11yRisk: 'unknown',
  visualDebtOpen: 0,
  observerSignals: {
    composition: 'PENDING',
    depth: 'PENDING',
    typography: 'PENDING',
    motion: 'PENDING',
    craft: 'PENDING',
  },
  scorecard: {
    observer: 0,
    critic: 0,
    memoryAlignment: 0,
    final: 0,
  },
})

const buildRulesJson = (brief) => ({
  rules: [
    {
      id: 'FRONT-001',
      type: 'constraint',
      enabled: true,
      text: 'No aprobar heroes centrados o genéricos cuando el brief pide identidad visible.',
    },
    {
      id: 'FRONT-002',
      type: 'constraint',
      enabled: true,
      text: 'Cada sección debe exponer una decisión compositiva y una señal de craft reconocible en screenshot.',
    },
    {
      id: 'FRONT-003',
      type: 'bias',
      enabled: true,
      text: `Priorizar seeds de estas familias: ${brief.allowedFamilies.join(', ')}.`,
    },
    {
      id: 'FRONT-004',
      type: 'override',
      enabled: true,
      text: brief.bannedSeeds.length > 0
        ? `Seeds bloqueados para este run: ${brief.bannedSeeds.join(', ')}.`
        : 'No bloquear por score creativo si contraste o jerarquía fallan.',
    },
  ],
  thresholds: {
    observerMinimum: 'MEDIUM',
    criticMinimum: 7,
    finalMinimum: 7.5,
  },
})

const buildObserverJson = (brief) => ({
  runId: `observer-${brief.slug}`,
  target: `${brief.pages[0] || 'home'}/overview`,
  viewports: [375, 768, 1280, 1440],
  signals: {
    composition: 'PENDING',
    depth: 'PENDING',
    typography: 'PENDING',
    motion: 'PENDING',
    craft: 'PENDING',
  },
  gates: {
    contrast: 'PENDING',
    animations: 'PENDING',
    images: 'PENDING',
    headingHierarchy: 'PENDING',
    meta: 'PENDING',
  },
  visualDebt: [],
})

const buildCriticJson = (brief) => ({
  runId: `critic-${brief.slug}`,
  target: `${brief.pages[0] || 'home'}/overview`,
  score: 0,
  brandAlignment: 'pending',
  verdict: 'pending',
  notes: [
    'Front-brain bootstrap completed.',
    'Generate DESIGN.md-driven creative direction before trusting critic output.',
  ],
  issues: [],
})

const buildScorecardJson = (brief) => ({
  target: `${brief.pages[0] || 'home'}/overview`,
  observerScore: 0,
  criticScore: 0,
  memoryAlignmentScore: 0,
  finalScore: 0,
  decision: 'pending',
  retryInstructions: [
    'Generate the initial creative direction and seed selection.',
    'Run observer and critic once the first homepage pass exists.',
  ],
})

const buildVisualDebtJson = () => ({
  summary: {
    open: 0,
    critical: 0,
    medium: 0,
    low: 0,
  },
  items: [],
})

const buildReviewSummary = (brief, nextAction) => `# Review Summary — ${brief.name}

## Current State

- Front-brain bootstrap completed
- Hybrid Markdown + JSON runtime contract emitted
- No observer or critic pass has run yet

## Next Action

- ${nextAction}
`

const buildApprovalsLog = () => `# Approvals — pending

<!-- Brain writes automatic approvals and flags here. -->
`

const buildDecisionsLog = (brief, blueprintSelection) => `# Decisions — ${brief.name}

## D-001 | Eros-feed bootstrap | setup
- **Choice:** Emit native hybrid runtime artifacts before the first design task.
- **Path:** bootstrap/eros-feed
- **User:** pending
- **Learn:** New projects should begin with machine-readable state, not rely on later bridge migration.

## D-002 | Hero Seed Selection | design
- **Choice:** \`${blueprintSelection?.selection?.heroName ?? 'pending'}\` as the primary hero seed.
- **Path:** blueprint-selector/hero
- **User:** pending
- **Learn:** Initial direction should be explicit and structured before section generation starts.

## D-003 | Navigation Direction | design
- **Choice:** \`${blueprintSelection?.selection?.navName ?? 'pending'}\` as the primary navigation seed.
- **Path:** blueprint-selector/nav
- **User:** pending
- **Learn:** Navigation should be selected as part of the visual direction, not pasted on later.

## D-004 | Direction Choice | design
- **Choice:** ${blueprintSelection?.selection?.chosenDirectionId ?? 'pending'}${blueprintSelection?.selection?.rationale ? ` — ${blueprintSelection.selection.rationale}` : ''}
- **Path:** blueprint-selector/direction
- **User:** pending
- **Learn:** The selected direction should explain why the hero and nav belong together.
`

const buildLearningsLog = () => `# Learnings

<!-- Brain appends project-specific learnings here as the run advances. -->
`

const buildIntakeMarkdown = (brief) => `# Intake Summary

## Project

- Name: ${brief.name}
- Type: ${brief.type}
- Audience: ${brief.audience}
- Pages: ${brief.pages.join(', ')}
- Mode: ${brief.mode}

## Prompt Summary

${brief.promptSummary}

## Constraints

${brief.constraints.length > 0 ? brief.constraints.map((item) => `- ${item}`).join('\n') : '- none'}

## References

${brief.references.length > 0 ? brief.references.map((item) => `- ${item}`).join('\n') : '- none'}
`

const resolveBrief = async ({ args, projectDir }) => {
  if (typeof args.brief === 'string') {
    return JSON.parse(args.brief)
  }

  if (typeof args['brief-file'] === 'string') {
    const targetPath = path.resolve(args['brief-file'])
    return readJson(targetPath, {})
  }

  const fallbackPath = path.join(projectDir, '.brain', 'context', 'intake.json')
  if (await exists(fallbackPath)) {
    return readJson(fallbackPath, {})
  }

  return {}
}

const bootstrapProject = async ({ projectDir, briefInput = {} }) => {
  const brief = normalizeBrief({ brief: briefInput, projectDir })
  const hasReferences = brief.references.length > 0
  const nextAction = hasReferences
    ? 'Capture references, write reference-observatory, and then enrich design-brief context with memory insights.'
    : 'Write .brain/context/design-brief.md with memory insights and spawn the designer for tokens and page planning.'
  const phaseLabel = hasReferences ? 'Phase 0.5: References' : 'Phase 1: Creative Direction'
  const activeTask = hasReferences ? 'setup/capture-refs' : 'design/brief'
  const queueJson = buildQueueJson({ hasReferences })
  const designMarkdown = buildDesignMarkdown(brief)

  await ensureDir(projectDir)
  await ensureDir(path.join(projectDir, '.brain', 'context'))
  await ensureDir(path.join(projectDir, '.brain', 'control'))
  await ensureDir(path.join(projectDir, '.brain', 'blueprints'))
  await ensureDir(path.join(projectDir, '.brain', 'reports', 'quality'))
  await ensureDir(path.join(projectDir, '.brain', 'reviews'))

  await writeJson(path.join(projectDir, '.brain', 'context', 'intake.json'), {
    ...briefInput,
    normalized: {
      name: brief.name,
      slug: brief.slug,
      mode: brief.mode,
      pages: brief.pages,
      references: brief.references,
      allowedFamilies: brief.allowedFamilies,
      bannedSeeds: brief.bannedSeeds,
    },
  })
  await writeText(path.join(projectDir, '.brain', 'context', 'intake.md'), buildIntakeMarkdown(brief))
  await writeText(path.join(projectDir, 'DESIGN.md'), designMarkdown)
  const blueprintSelection = await selectBlueprintDirections({
    projectDir,
    briefInput: brief,
    designMarkdown,
    persist: true,
  })
  await writeText(path.join(projectDir, '.brain', 'identity.md'), buildIdentityMarkdown(brief))
  await writeText(path.join(projectDir, '.brain', 'state.md'), buildStateMarkdown({ brief, activeTask, phaseLabel, nextAction }))
  await writeJson(path.join(projectDir, '.brain', 'state.json'), buildStateJson({ brief, hasReferences, nextAction }))
  await writeText(path.join(projectDir, '.brain', 'queue.md'), buildQueueMarkdown({ brief, queueJson }))
  await writeJson(path.join(projectDir, '.brain', 'queue.json'), queueJson)
  await writeJson(path.join(projectDir, '.brain', 'metrics.json'), buildMetricsJson())
  await writeJson(path.join(projectDir, '.brain', 'control', 'rules.json'), buildRulesJson(brief))
  await writeText(path.join(projectDir, '.brain', 'approvals.md'), buildApprovalsLog())
  await writeText(path.join(projectDir, '.brain', 'decisions.md'), buildDecisionsLog(brief, blueprintSelection))
  await writeText(path.join(projectDir, '.brain', 'learnings.md'), buildLearningsLog())
  await writeJson(path.join(projectDir, '.brain', 'reports', 'quality', 'observer.json'), buildObserverJson(brief))
  await writeJson(path.join(projectDir, '.brain', 'reports', 'quality', 'critic.json'), buildCriticJson(brief))
  await writeJson(path.join(projectDir, '.brain', 'reports', 'quality', 'scorecard.json'), buildScorecardJson(brief))
  await writeJson(path.join(projectDir, '.brain', 'reports', 'visual-debt.json'), buildVisualDebtJson())
  await writeText(path.join(projectDir, '.brain', 'reviews', 'REVIEW-SUMMARY.md'), buildReviewSummary(brief, nextAction))

  return {
    brief,
    blueprintSelection,
    projectDir,
    nextAction,
  }
}

const main = async () => {
  const args = parseArgs(process.argv.slice(2))
  const projectArg = args.project

  if (!projectArg) {
    throw new Error('Missing required argument: --project <path>')
  }

  const projectDir = path.resolve(projectArg)
  const briefInput = await resolveBrief({ args, projectDir })
  const result = await bootstrapProject({ projectDir, briefInput })
  console.log(`Bootstrapped eros-feed artifacts for ${result.brief.name} at ${projectDir}`)
}

const isEntrypoint =
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href

if (isEntrypoint) {
  main().catch((error) => {
    console.error(error.message)
    process.exitCode = 1
  })
}

export {
  bootstrapProject,
  normalizeBrief,
  parseArgs,
  readJson,
  slugify,
}
