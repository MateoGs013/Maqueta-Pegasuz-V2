import { promises as fs } from 'node:fs'
import path from 'node:path'

const DEFAULT_MODEL = process.env.OPENAI_QUALITY_MODEL || 'gpt-5-mini'
const DEFAULT_MODE = 'auto'
const DEFAULT_MAX_IMAGES = 6
const DEFAULT_MAX_TOTAL_BYTES = 14 * 1024 * 1024
const DEFAULT_MAX_IMAGE_BYTES = 4 * 1024 * 1024

const CRITIC_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['score', 'brandAlignment', 'verdict', 'notes', 'issues'],
  properties: {
    score: { type: 'number', minimum: 0, maximum: 10 },
    brandAlignment: { type: 'string', enum: ['high', 'medium', 'low'] },
    verdict: { type: 'string', enum: ['approve', 'retry', 'flag'] },
    notes: {
      type: 'array',
      maxItems: 4,
      items: { type: 'string' },
    },
    issues: {
      type: 'array',
      maxItems: 5,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['type', 'severity', 'message'],
        properties: {
          type: { type: 'string' },
          severity: { type: 'string', enum: ['low', 'medium', 'high'] },
          message: { type: 'string' },
        },
      },
    },
  },
}

const readDirSafe = async (targetPath) => {
  try {
    return await fs.readdir(targetPath, { withFileTypes: true })
  } catch {
    return []
  }
}

const titleCase = (value = '') =>
  value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim()

const normalizeBrandAlignment = (value = 'medium') => {
  const raw = String(value || 'medium').trim().toLowerCase()
  if (raw === 'high' || raw === 'medium' || raw === 'low') return raw
  return 'medium'
}

const normalizeVerdict = (value = 'retry') => {
  const raw = String(value || 'retry').trim().toLowerCase()
  if (raw === 'approve' || raw === 'retry' || raw === 'flag') return raw
  return 'retry'
}

const normalizeIssueSeverity = (value = 'medium') => {
  const raw = String(value || 'medium').trim().toLowerCase()
  if (raw === 'low' || raw === 'medium' || raw === 'high') return raw
  return 'medium'
}

const normalizeCriticShape = (critic, overrides = {}) => {
  const normalized = {
    runId: overrides.runId || critic.runId || `critic-${Date.now()}`,
    generatedAt: overrides.generatedAt || critic.generatedAt || new Date().toISOString(),
    target: overrides.target || critic.target || 'home/overview',
    score: Number(Number(critic.score ?? 0).toFixed(2)),
    brandAlignment: normalizeBrandAlignment(critic.brandAlignment),
    verdict: normalizeVerdict(critic.verdict),
    notes: Array.isArray(critic.notes) ? critic.notes.slice(0, 4).map((item) => String(item).trim()).filter(Boolean) : [],
    issues: Array.isArray(critic.issues)
      ? critic.issues
          .slice(0, 5)
          .map((item) => ({
            type: String(item?.type || 'quality').trim() || 'quality',
            severity: normalizeIssueSeverity(item?.severity),
            message: String(item?.message || '').trim(),
          }))
          .filter((item) => item.message)
      : [],
    source: overrides.source || critic.source || 'heuristic',
    model: overrides.model || critic.model || null,
    imageCount: Number(overrides.imageCount ?? critic.imageCount ?? 0),
  }

  if (overrides.fallbackReason || critic.fallbackReason) {
    normalized.fallbackReason = overrides.fallbackReason || critic.fallbackReason
  }

  return normalized
}

const deriveHeuristicCritic = ({ observer, observerScore, rulesConfig, blueprintSelection, designMarkdown }) => {
  const selectionConfidence = blueprintSelection?.selection?.confidence ?? 0.4
  const allowedTags =
    blueprintSelection?.input?.allowedTags?.hero?.length || blueprintSelection?.input?.allowedTags?.nav?.length
      ? 1
      : 0.75

  let score = observerScore * 0.72 + selectionConfidence * 2.1 + allowedTags
  const notes = []
  const issues = []

  if (observer.gates.contrast === 'FAIL') {
    score -= 1.3
    issues.push({
      type: 'contrast',
      severity: 'high',
      message: 'Contrast failure overrides creative confidence and forces the critic into a blocking posture.',
    })
  }

  if (observer.signals.typography === 'STRONG') {
    notes.push('Typography is carrying identity strongly enough to support the selected direction.')
  } else {
    notes.push('Typography has not fully landed yet, which weakens perceived authorship.')
  }

  if (observer.signals.depth === 'WEAK') {
    issues.push({
      type: 'depth',
      severity: 'medium',
      message: 'Depth is not reading clearly enough in screenshots, so the selected direction is underperforming visually.',
    })
  }

  if (designMarkdown.includes('No centered generic SaaS hero')) {
    notes.push('Design DNA still bans generic centered hero patterns, which is consistent with the current selection policy.')
  }

  if (blueprintSelection?.selection?.heroName) {
    notes.push(`Current direction is ${blueprintSelection.selection.heroName} + ${blueprintSelection.selection.navName}.`)
  }

  const brandAlignment = score >= 8 ? 'high' : score >= 6.8 ? 'medium' : 'low'
  const thresholds = rulesConfig?.thresholds ?? {
    observerMinimum: 'MEDIUM',
    criticMinimum: 7,
    finalMinimum: 7.5,
  }
  const verdict =
    observer.gates.contrast === 'FAIL'
      ? 'flag'
      : score >= Number(thresholds.criticMinimum ?? 7)
        ? 'approve'
        : 'retry'

  return {
    critic: normalizeCriticShape(
      {
        score,
        brandAlignment,
        verdict,
        notes,
        issues,
      },
      {
        target: observer.target,
        source: 'heuristic',
      },
    ),
    criticScore: Number(Math.max(0, Math.min(10, score)).toFixed(2)),
  }
}

const imageRolePriority = [
  'full-desktop',
  'full-mobile',
  'desktop-frame',
  'mobile-frame',
  'scroll-state',
  'hover-state',
  'click-state',
]

const imageRoleWeight = new Map(imageRolePriority.map((role, index) => [role, imageRolePriority.length - index]))

const candidateImageSpecs = async (sourceDir) => {
  const specs = []
  const fullDesktop = path.join(sourceDir, 'full-page-desktop.png')
  const fullMobile = path.join(sourceDir, 'full-page-mobile.png')

  for (const [role, filePath] of [
    ['full-desktop', fullDesktop],
    ['full-mobile', fullMobile],
  ]) {
    try {
      const stats = await fs.stat(filePath)
      if (stats.isFile()) {
        specs.push({ role, filePath, size: stats.size, label: path.basename(filePath) })
      }
    } catch {
      // ignore
    }
  }

  const desktopFrames = (await readDirSafe(path.join(sourceDir, 'desktop')))
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.png'))
    .sort((left, right) => left.name.localeCompare(right.name))
    .slice(0, 3)

  const mobileFrames = (await readDirSafe(path.join(sourceDir, 'mobile')))
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.png'))
    .sort((left, right) => left.name.localeCompare(right.name))
    .slice(0, 2)

  const interactionEntries = (await readDirSafe(path.join(sourceDir, 'interactions')))
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.png'))
    .sort((left, right) => left.name.localeCompare(right.name))

  for (const entry of desktopFrames) {
    const filePath = path.join(sourceDir, 'desktop', entry.name)
    const stats = await fs.stat(filePath)
    specs.push({ role: 'desktop-frame', filePath, size: stats.size, label: entry.name })
  }

  for (const entry of mobileFrames) {
    const filePath = path.join(sourceDir, 'mobile', entry.name)
    const stats = await fs.stat(filePath)
    specs.push({ role: 'mobile-frame', filePath, size: stats.size, label: entry.name })
  }

  for (const entry of interactionEntries) {
    const filePath = path.join(sourceDir, 'interactions', entry.name)
    const stats = await fs.stat(filePath)
    const lower = entry.name.toLowerCase()
    const role = lower.startsWith('scroll') ? 'scroll-state' : lower.startsWith('hover') ? 'hover-state' : 'click-state'
    specs.push({ role, filePath, size: stats.size, label: entry.name })
  }

  return specs.sort((left, right) => {
    const priorityDelta = (imageRoleWeight.get(right.role) || 0) - (imageRoleWeight.get(left.role) || 0)
    if (priorityDelta !== 0) return priorityDelta
    return left.label.localeCompare(right.label)
  })
}

const detectMimeType = (filePath) => {
  const extension = path.extname(filePath).toLowerCase()
  if (extension === '.jpg' || extension === '.jpeg') return 'image/jpeg'
  if (extension === '.webp') return 'image/webp'
  return 'image/png'
}

const selectCriticImages = async (sourceDir) => {
  const candidates = await candidateImageSpecs(sourceDir)
  const selected = []
  let totalBytes = 0

  for (const candidate of candidates) {
    if (selected.length >= DEFAULT_MAX_IMAGES) break
    if (candidate.size > DEFAULT_MAX_IMAGE_BYTES) continue
    if (totalBytes + candidate.size > DEFAULT_MAX_TOTAL_BYTES) continue

    const mimeType = detectMimeType(candidate.filePath)
    const bytes = await fs.readFile(candidate.filePath)
    selected.push({
      role: candidate.role,
      label: candidate.label,
      filePath: candidate.filePath,
      mimeType,
      dataUrl: `data:${mimeType};base64,${bytes.toString('base64')}`,
      size: candidate.size,
    })
    totalBytes += candidate.size
  }

  return selected
}

const summarizeDesignDNA = (designMarkdown = '') => {
  const lines = designMarkdown
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  if (lines.length <= 24) {
    return lines.join('\n')
  }

  return lines.slice(0, 24).join('\n')
}

const summarizeObserver = (observer, blueprintSelection) => {
  const summary = {
    target: observer.target,
    signals: observer.signals,
    gates: observer.gates,
    evidence: observer.evidence,
    selectedDirection: blueprintSelection?.selection
      ? {
          heroName: blueprintSelection.selection.heroName,
          navName: blueprintSelection.selection.navName,
          direction: blueprintSelection.selection.direction,
          confidence: blueprintSelection.selection.confidence,
        }
      : null,
  }

  return JSON.stringify(summary, null, 2)
}

const buildCriticPrompt = ({ observer, blueprintSelection, designMarkdown, rulesConfig, imageLabels }) => `
You are the multimodal visual critic for Maqueta's eros-feed quality loop.
Evaluate the supplied screenshots and produce a structured critic response for a modern frontend build.

Hard constraints:
- Respect the observer gates. If contrast visibly fails, verdict must be "flag".
- Penalize generic layouts, flat depth, weak motion hierarchy, and brand drift.
- Use the selected direction as the intended creative target, not as proof that the build succeeded.
- Prefer concrete visual criticism over generic praise.
- Do not mention missing screenshots. Judge only what is visible plus the observer summary.

Output rules:
- Return only JSON that matches the provided schema.
- Score is 0-10.
- brandAlignment is one of: high, medium, low.
- verdict is one of: approve, retry, flag.
- notes should be concise, high-signal observations.
- issues should identify the most important visual or craft problems.

Observer summary:
${summarizeObserver(observer, blueprintSelection)}

Design DNA excerpt:
${summarizeDesignDNA(designMarkdown)}

Quality thresholds:
${JSON.stringify(rulesConfig?.thresholds ?? {}, null, 2)}

Images in order:
${imageLabels.map((label, index) => `${index + 1}. ${label}`).join('\n')}
`.trim()

const extractJsonObject = (value = '') => {
  const trimmed = value.trim()
  if (!trimmed) {
    throw new Error('OpenAI response did not include critic JSON.')
  }

  try {
    return JSON.parse(trimmed)
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/)
    if (!match) {
      throw new Error('Could not parse critic JSON from OpenAI response.')
    }

    return JSON.parse(match[0])
  }
}

const readCompletionText = (payload) => {
  const directContent = payload?.choices?.[0]?.message?.content

  if (typeof directContent === 'string') {
    return directContent
  }

  if (Array.isArray(directContent)) {
    return directContent
      .map((entry) => {
        if (typeof entry?.text === 'string') return entry.text
        if (typeof entry?.content === 'string') return entry.content
        return ''
      })
      .join('\n')
      .trim()
  }

  return ''
}

const createHeaders = () => {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return null

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
  }

  if (process.env.OPENAI_ORGANIZATION_ID) {
    headers['OpenAI-Organization'] = process.env.OPENAI_ORGANIZATION_ID
  }

  if (process.env.OPENAI_PROJECT_ID) {
    headers['OpenAI-Project'] = process.env.OPENAI_PROJECT_ID
  }

  return headers
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const fetchWithRetry = async (url, options, { maxAttempts = 3, timeoutMs = 30000, backoffBase = 2000 } = {}) => {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)

    try {
      const response = await fetch(url, { ...options, signal: controller.signal })
      clearTimeout(timer)

      if (response.status === 429 || response.status >= 500) {
        if (attempt === maxAttempts) return response
        const delay = backoffBase * Math.pow(2, attempt - 1)
        console.log(`[critic] OpenAI returned ${response.status}, retrying in ${delay}ms (attempt ${attempt}/${maxAttempts})`)
        await sleep(delay)
        continue
      }

      return response
    } catch (error) {
      clearTimeout(timer)
      if (attempt === maxAttempts) throw error
      const delay = backoffBase * Math.pow(2, attempt - 1)
      const reason = error.name === 'AbortError' ? 'timeout' : error.message
      console.log(`[critic] Request failed (${reason}), retrying in ${delay}ms (attempt ${attempt}/${maxAttempts})`)
      await sleep(delay)
    }
  }
}

const requestMultimodalCritic = async ({ observer, sourceDir, blueprintSelection, designMarkdown, rulesConfig, model }) => {
  const headers = createHeaders()
  if (!headers) {
    throw new Error('OPENAI_API_KEY is not configured.')
  }

  const images = await selectCriticImages(sourceDir)
  if (images.length === 0) {
    throw new Error(`No observer screenshots found in ${sourceDir}.`)
  }

  const prompt = buildCriticPrompt({
    observer,
    blueprintSelection,
    designMarkdown,
    rulesConfig,
    imageLabels: images.map((image) => `${titleCase(image.role)}: ${image.label}`),
  })

  const payload = {
    model,
    temperature: 0.2,
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'eros_feed_visual_critic',
        strict: true,
        schema: CRITIC_SCHEMA,
      },
    },
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          ...images.map((image) => ({
            type: 'image_url',
            image_url: {
              url: image.dataUrl,
            },
          })),
        ],
      },
    ],
  }

  const response = await fetchWithRetry('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  })

  const responseText = await response.text()
  let jsonPayload = null

  try {
    jsonPayload = JSON.parse(responseText)
  } catch {
    throw new Error(`OpenAI critic returned non-JSON output (${response.status}).`)
  }

  if (!response.ok) {
    const message = jsonPayload?.error?.message || `OpenAI critic request failed with status ${response.status}.`
    throw new Error(message)
  }

  const parsed = extractJsonObject(readCompletionText(jsonPayload))
  const critic = normalizeCriticShape(parsed, {
    target: observer.target,
    source: 'multimodal',
    model,
    imageCount: images.length,
  })

  return {
    critic,
    criticScore: critic.score,
  }
}

export const deriveCritic = async ({
  observer,
  observerScore,
  rulesConfig,
  blueprintSelection,
  designMarkdown,
  sourceDir,
  criticMode = DEFAULT_MODE,
  criticModel = DEFAULT_MODEL,
}) => {
  if (criticMode === 'heuristic') {
    return deriveHeuristicCritic({
      observer,
      observerScore,
      rulesConfig,
      blueprintSelection,
      designMarkdown,
    })
  }

  try {
    return await requestMultimodalCritic({
      observer,
      sourceDir,
      blueprintSelection,
      designMarkdown,
      rulesConfig,
      model: criticModel,
    })
  } catch (error) {
    if (criticMode === 'multimodal') {
      throw error
    }

    const fallback = deriveHeuristicCritic({
      observer,
      observerScore,
      rulesConfig,
      blueprintSelection,
      designMarkdown,
    })

    return {
      critic: normalizeCriticShape(fallback.critic, {
        target: observer.target,
        source: 'heuristic-fallback',
        fallbackReason: error.message,
      }),
      criticScore: fallback.criticScore,
    }
  }
}

export const multimodalCriticDefaults = {
  defaultMode: DEFAULT_MODE,
  defaultModel: DEFAULT_MODEL,
}
