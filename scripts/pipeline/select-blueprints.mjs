import { promises as fs } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { heroes, navs } from '../../_components/blueprints.manifest.js'

const keywordTagMap = [
  { test: /cinematic|film|launch|campaign|showcase/i, tags: ['cinematic'] },
  { test: /editorial|studio|magazine|brand|content/i, tags: ['editorial'] },
  { test: /typography|type|headline|copy-first/i, tags: ['typography-led'] },
  { test: /product|saas|app|platform|dashboard|software/i, tags: ['product-ui', 'digital', 'modular'] },
  { test: /luxury|premium|fashion|elegant/i, tags: ['luxury'] },
  { test: /organic|artisan|warm|tactile/i, tags: ['organic'] },
  { test: /glass|hud|transparent/i, tags: ['glass'] },
  { test: /ambient|atmospheric|fog|moody/i, tags: ['ambient'] },
  { test: /interaction|experimental|playful|dynamic/i, tags: ['interaction-led'] },
  { test: /modular|system|grid/i, tags: ['modular'] },
  { test: /brutalist|graphic|poster|bold/i, tags: ['brutalist'] },
  { test: /digital|futur|tech/i, tags: ['digital'] },
]

const genericHeroAntiPatterns = [
  'centered-saas-hero',
  'centered-everything',
  'single-axis-layout',
  'static-gradient-hero',
  'small-headline-big-subcopy',
  'gray-on-white-product-hero',
]

const directionLabelMap = {
  cinematic: 'Cinematic Frame',
  editorial: 'Editorial Tension',
  'typography-led': 'Type-First Tension',
  'product-ui': 'Product System Pulse',
  luxury: 'Luxury Atmosphere',
  brutalist: 'Graphic Brutalism',
  ambient: 'Ambient Signal',
  digital: 'Digital Pulse',
  glass: 'Glass Interface',
  organic: 'Organic Warmth',
  'interaction-led': 'Interaction Sweep',
  modular: 'Modular Structure',
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

const unique = (values) => [...new Set(values.filter(Boolean))]

const lowerList = (values) => values.map((value) => String(value).trim().toLowerCase())

const intersect = (left = [], right = []) => {
  const rightSet = new Set(right)
  return left.filter((item) => rightSet.has(item))
}

const extractLineList = (content, label) => {
  const pattern = new RegExp(`-\\s+${label}:\\s*(.+)`, 'i')
  const match = content.match(pattern)
  if (!match) {
    return []
  }

  return match[1]
    .split(/[;,]/)
    .map((item) => item.replace(/`/g, '').trim())
    .filter(Boolean)
}

const inferPreferredTags = ({ brief = {}, designMarkdown = '' }) => {
  const text = [
    brief.type,
    brief.description,
    brief.audience,
    brief.mood,
    brief.promptSummary,
    designMarkdown,
  ]
    .filter(Boolean)
    .join(' ')

  const tags = []

  for (const mapping of keywordTagMap) {
    if (mapping.test.test(text)) {
      tags.push(...mapping.tags)
    }
  }

  return unique(tags)
}

const inferDensityTarget = (preferredTags) => {
  if (preferredTags.includes('typography-led')) return 2
  if (preferredTags.includes('product-ui') || preferredTags.includes('modular')) return 4
  if (preferredTags.includes('cinematic') || preferredTags.includes('ambient')) return 3
  if (preferredTags.includes('luxury')) return 3
  return 4
}

const inferProjectKinds = (brief) => {
  const text = [brief.type, brief.description, brief.promptSummary, brief.audience].filter(Boolean).join(' ')
  return {
    studio: /studio|agency|creative|brand/i.test(text),
    product: /product|saas|app|platform|software|dashboard/i.test(text),
    luxury: /luxury|premium|fashion|elegant/i.test(text),
    experimental: /experimental|interactive|playful|immersive/i.test(text),
  }
}

const buildSelectionContext = ({ brief = {}, designMarkdown = '' }) => {
  const designAllowedGeneral = lowerList(extractLineList(designMarkdown, 'Allowed families'))
  const designAllowedHero = lowerList(extractLineList(designMarkdown, 'Allowed hero families'))
  const designAllowedNav = lowerList(extractLineList(designMarkdown, 'Allowed nav families'))
  const designBannedSeeds = extractLineList(designMarkdown, 'Banned seeds')
  const preferredTags = unique([
    ...lowerList(brief.allowedFamilies ?? []),
    ...inferPreferredTags({ brief, designMarkdown }),
    ...designAllowedGeneral,
    ...designAllowedHero,
    ...designAllowedNav,
  ])

  return {
    scheme: String(brief.scheme || 'dark').trim().toLowerCase(),
    references: toArray(brief.references),
    projectKinds: inferProjectKinds(brief),
    preferredTags,
    allowedTags: {
      hero: unique(lowerList(designAllowedHero.length > 0 ? designAllowedHero : (brief.allowedFamilies ?? designAllowedGeneral))),
      nav: unique(lowerList(designAllowedNav.length > 0 ? designAllowedNav : (brief.allowedFamilies ?? designAllowedGeneral))),
    },
    bannedSeeds: unique([...(brief.bannedSeeds ?? []), ...designBannedSeeds]).map((value) => value.trim()),
    avoidGeneric: /generic|saas|centered|template/i.test(
      [brief.promptSummary, brief.description, designMarkdown].filter(Boolean).join(' '),
    ),
    densityTarget: inferDensityTarget(preferredTags),
    assetReady: toArray(brief.references).length > 0 || /product|dashboard|portfolio|gallery|showcase/i.test([brief.type, brief.description].filter(Boolean).join(' ')),
  }
}

const scoreBlueprint = (blueprint, category, context) => {
  if (context.bannedSeeds.includes(blueprint.name)) {
    return null
  }

  const trendTags = lowerList(blueprint.trendTags ?? blueprint.creativityTags ?? [])
  const scoreReasons = []
  let score = 10

  if (blueprint.themeCompatibility?.includes(context.scheme) || blueprint.themeCompatibility?.includes('mixed')) {
    score += 4
    scoreReasons.push(`${context.scheme} theme compatible`)
  } else {
    score -= 8
    scoreReasons.push(`${context.scheme} theme mismatch`)
  }

  const allowedMatches = intersect(trendTags, context.allowedTags[category])
  if (allowedMatches.length > 0) {
    score += allowedMatches.length * 3.5
    scoreReasons.push(`allowed tags: ${allowedMatches.join(', ')}`)
  } else if (context.allowedTags[category].length > 0) {
    score -= 2
  }

  const preferredMatches = intersect(trendTags, context.preferredTags)
  if (preferredMatches.length > 0) {
    score += preferredMatches.length * 2.25
    scoreReasons.push(`preferred tags: ${preferredMatches.join(', ')}`)
  }

  const effectiveDensity = Number(blueprint.densityScore) || context.densityTarget
  const densityDelta = Math.abs(effectiveDensity - context.densityTarget)
  score += Math.max(0, 3 - densityDelta)
  if (densityDelta <= 1) {
    scoreReasons.push(`density fits target ${context.densityTarget}`)
  }

  if (category === 'hero' && context.avoidGeneric) {
    const antiMatches = intersect(blueprint.antiPatternCoverage ?? [], genericHeroAntiPatterns)
    if (antiMatches.length > 0) {
      score += antiMatches.length * 1.5
      scoreReasons.push(`avoids ${antiMatches.slice(0, 2).join(', ')}`)
    }
  }

  if (category === 'hero' && (blueprint.requiredAssets?.length ?? 0) > 0 && !context.assetReady) {
    score -= Math.min(2.5, blueprint.requiredAssets.length)
  }

  if (context.projectKinds.product && intersect(trendTags, ['product-ui', 'digital', 'modular']).length > 0) {
    score += 2
    scoreReasons.push('fits product posture')
  }

  if (context.projectKinds.studio && intersect(trendTags, ['editorial', 'typography-led', 'luxury', 'ambient']).length > 0) {
    score += 1.75
    scoreReasons.push('fits studio/editorial posture')
  }

  if (context.projectKinds.luxury && intersect(trendTags, ['luxury', 'ambient', 'editorial']).length > 0) {
    score += 1.5
  }

  if (context.projectKinds.experimental && intersect(trendTags, ['interaction-led', 'glass', 'cinematic']).length > 0) {
    score += 1.5
  }

  return {
    name: blueprint.name,
    label: blueprint.label,
    score: Number(Math.max(0, score).toFixed(2)),
    reasons: unique(scoreReasons),
    trendTags,
    compositionFamily: blueprint.compositionFamily,
    motionFamily: blueprint.motionFamily,
    densityScore: blueprint.densityScore,
    requiredAssets: blueprint.requiredAssets ?? [],
  }
}

const buildDirectionLabel = (heroCandidate, navCandidate, sharedTags) => {
  const orderedTags = unique([...sharedTags, ...heroCandidate.trendTags, ...navCandidate.trendTags])
  const primaryTag = orderedTags.find((tag) => directionLabelMap[tag])
  if (primaryTag) {
    return directionLabelMap[primaryTag]
  }

  return `${heroCandidate.label} × ${navCandidate.label}`
}

const buildDirectionRationale = (heroCandidate, navCandidate, context, sharedTags) => {
  const emphasis = sharedTags.length > 0
    ? `Shared tags ${sharedTags.join(', ')} keep hero and nav moving in the same visual language.`
    : 'Hero and nav stay complementary without collapsing into the same pattern family.'

  const heroReason = heroCandidate.reasons[0] ?? 'Hero candidate scored strongly against the current design DNA.'
  const navReason = navCandidate.reasons[0] ?? 'Nav candidate scored strongly against the current design DNA.'
  const themeNote = `Both stay viable on the ${context.scheme} scheme.`

  return `${heroReason}. ${navReason}. ${emphasis} ${themeNote}`
}

const chooseDirections = ({ heroCandidates, navCandidates, context }) => {
  const combos = []

  for (const heroCandidate of heroCandidates.slice(0, 7)) {
    for (const navCandidate of navCandidates.slice(0, 7)) {
      const heroBlueprint = heroes.find((item) => item.name === heroCandidate.name)
      const navBlueprint = navs.find((item) => item.name === navCandidate.name)

      if (heroBlueprint?.forbiddenPairings?.includes(navCandidate.name) || navBlueprint?.forbiddenPairings?.includes(heroCandidate.name)) {
        continue
      }

      const sharedTags = intersect(heroCandidate.trendTags, navCandidate.trendTags)
      let score = heroCandidate.score + navCandidate.score + sharedTags.length * 1.5

      if (context.projectKinds.product && sharedTags.includes('product-ui')) {
        score += 1
      }

      if (context.projectKinds.studio && sharedTags.includes('editorial')) {
        score += 1
      }

      combos.push({
        id: '',
        label: buildDirectionLabel(heroCandidate, navCandidate, sharedTags),
        heroName: heroCandidate.name,
        navName: navCandidate.name,
        heroScore: heroCandidate.score,
        navScore: navCandidate.score,
        score: Number(score.toFixed(2)),
        sharedTags,
        rationale: buildDirectionRationale(heroCandidate, navCandidate, context, sharedTags),
        reasons: unique([...heroCandidate.reasons.slice(0, 2), ...navCandidate.reasons.slice(0, 2)]),
      })
    }
  }

  combos.sort((left, right) => right.score - left.score)

  const directions = []
  for (const combo of combos) {
    const clashes = directions.some(
      (direction) => direction.heroName === combo.heroName || direction.navName === combo.navName || direction.label === combo.label,
    )

    if (clashes) {
      continue
    }

    directions.push({
      ...combo,
      id: `DIR-0${directions.length + 1}`,
    })

    if (directions.length === 3) {
      break
    }
  }

  if (directions.length < 3) {
    for (const combo of combos) {
      if (directions.some((direction) => direction.heroName === combo.heroName && direction.navName === combo.navName)) {
        continue
      }

      directions.push({
        ...combo,
        id: `DIR-0${directions.length + 1}`,
      })

      if (directions.length === 3) {
        break
      }
    }
  }

  return directions
}

const confidenceFromDirections = (directions) => {
  if (directions.length === 0) {
    return 0.4
  }

  if (directions.length === 1) {
    return 0.82
  }

  const gap = directions[0].score - directions[1].score
  return Number(Math.max(0.55, Math.min(0.92, 0.68 + gap / 18)).toFixed(2))
}

const buildSelectionPayload = ({ brief, designMarkdown, context }) => {
  const scoredHeroes = heroes
    .map((blueprint) => scoreBlueprint(blueprint, 'hero', context))
    .filter(Boolean)
    .sort((left, right) => right.score - left.score)

  const scoredNavs = navs
    .map((blueprint) => scoreBlueprint(blueprint, 'nav', context))
    .filter(Boolean)
    .sort((left, right) => right.score - left.score)

  const directions = chooseDirections({
    heroCandidates: scoredHeroes,
    navCandidates: scoredNavs,
    context,
  })

  const chosenDirection = directions[0] ?? null

  return {
    generatedAt: new Date().toISOString(),
    input: {
      projectName: brief.name,
      projectSlug: brief.slug,
      scheme: context.scheme,
      preferredTags: context.preferredTags,
      allowedTags: context.allowedTags,
      bannedSeeds: context.bannedSeeds,
      densityTarget: context.densityTarget,
      assetReady: context.assetReady,
    },
    heroCandidates: scoredHeroes.slice(0, 5),
    navCandidates: scoredNavs.slice(0, 5),
    directions,
    selection: chosenDirection
      ? {
          chosenDirectionId: chosenDirection.id,
          heroName: chosenDirection.heroName,
          navName: chosenDirection.navName,
          score: chosenDirection.score,
          rationale: chosenDirection.rationale,
          confidence: confidenceFromDirections(directions),
        }
      : null,
  }
}

const normalizeBrief = (brief = {}, projectDir = '') => ({
  name: String(brief.name || path.basename(projectDir) || 'Untitled Project').trim(),
  slug: String(brief.slug || path.basename(projectDir) || 'untitled-project').trim(),
  type: String(brief.type || 'creative-studio').trim(),
  description: String(brief.description || '').trim(),
  audience: String(brief.audience || '').trim(),
  mood: String(brief.mood || '').trim(),
  scheme: String(brief.scheme || 'dark').trim().toLowerCase(),
  references: toArray(brief.references),
  promptSummary: String(brief.promptSummary || brief.description || '').trim(),
  allowedFamilies: toArray(brief.allowedFamilies ?? brief.seedFamilies).map((item) => item.toLowerCase()),
  bannedSeeds: toArray(brief.bannedSeeds),
})

const resolveBrief = async ({ projectDir, briefInput }) => {
  if (briefInput) {
    return normalizeBrief(briefInput, projectDir)
  }

  const intake = await readJson(path.join(projectDir, '.brain', 'context', 'intake.json'), {})
  return normalizeBrief(intake.normalized ? { ...intake, ...intake.normalized } : intake, projectDir)
}

const selectBlueprintDirections = async ({
  projectDir,
  briefInput = null,
  designMarkdown = '',
  persist = true,
}) => {
  if (!projectDir) {
    throw new Error('selectBlueprintDirections requires projectDir')
  }

  const brief = await resolveBrief({ projectDir, briefInput })
  const effectiveDesignMarkdown = designMarkdown || await readText(path.join(projectDir, 'DESIGN.md'))
  const context = buildSelectionContext({ brief, designMarkdown: effectiveDesignMarkdown })
  const payload = buildSelectionPayload({ brief, designMarkdown: effectiveDesignMarkdown, context })

  if (persist) {
    await writeJson(path.join(projectDir, '.brain', 'blueprints', 'selection.json'), payload)
  }

  return payload
}

const main = async () => {
  const args = parseArgs(process.argv.slice(2))
  if (typeof args.project !== 'string') {
    throw new Error('Missing required argument: --project <path>')
  }

  const projectDir = path.resolve(args.project)
  const briefInput = typeof args['brief-file'] === 'string'
    ? await readJson(path.resolve(args['brief-file']), {})
    : (typeof args.brief === 'string' ? JSON.parse(args.brief) : null)

  const result = await selectBlueprintDirections({ projectDir, briefInput, persist: true })
  const chosen = result.selection
  if (!chosen) {
    throw new Error(`No viable blueprint directions found for ${projectDir}`)
  }

  console.log(`Selected ${chosen.heroName} + ${chosen.navName} for ${result.input.projectName}`)
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
  selectBlueprintDirections,
}
