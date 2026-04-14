/**
 * Observer V3 — Pass 4: Judgment
 * LLM-as-judge using UICrit methodology (Google Research 2024).
 * Evaluates design quality per dimension with structured rubrics.
 *
 * Requires: @anthropic-ai/claude-agent-sdk (already in scripts/package.json)
 * Set config.passes.judgment = true to enable (disabled by default — costs API tokens).
 */

import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ── Dimension Rubrics (UICrit methodology) ───────────────────

const RUBRICS = {
  composition: `Evaluate ONLY the composition and layout quality.
Criteria: grid ratio diversity, asymmetric balance, spatial surprises (overlaps, container breaks),
padding variation between sections, visual weight distribution.
Anchoring: 1=Bootstrap default grid, 5=competent agency work, 10=Awwwards SOTD.`,

  typography: `Evaluate ONLY the typography quality.
Criteria: font size hierarchy (4x+ ratio ideal), font pairing quality, weight variety,
letter-spacing usage, line-height consistency, avoidance of Inter/Roboto/Arial.
Anchoring: 1=system font single size, 5=decent hierarchy, 10=editorial-level typography.`,

  color: `Evaluate ONLY the color palette quality.
Criteria: harmony (monochrome/analogous/complementary), temperature consistency,
avoidance of pure #000/#fff, accent usage, dark/light richness (near-blacks, warm whites).
Anchoring: 1=random colors, 5=coherent palette, 10=masterful color storytelling.`,

  depth: `Evaluate ONLY the visual depth and layering.
Criteria: z-index stacking, shadows/blurs, atmospheric elements, grain/noise textures,
intentional overlaps, backdrop-filter usage, parallax depth perception.
Anchoring: 1=flat single layer, 5=basic card shadows, 10=cinematic depth with atmospheric layers.`,

  motion: `Evaluate the PERCEPTION of motion quality from this static screenshot.
Look for: stagger delays visible in element positions, scroll-linked transforms,
elements mid-animation, dynamic layouts suggesting interaction.
Anchoring: 1=no motion evidence, 5=basic transitions, 10=choreographed motion narrative.`,

  uniqueness: `Evaluate ONLY how distinctive and non-generic this design is.
Criteria: absence of template patterns, original layout choices, signature elements,
creative typography use, unexpected spatial decisions, personality.
Anchoring: 1=Bootstrap/Tailwind template, 5=customized but common patterns, 10=unmistakably original.`,
}

const SYSTEM_PROMPT = `You are a senior creative director with 15 years evaluating web design.
You score ONLY the specified dimension on a 0-10 scale.
Return ONLY valid JSON with this structure:
{ "score": <number 0-10>, "rationale": "<1-2 sentences>", "issues": ["<issue1>", ...] }
No markdown, no explanation outside the JSON.`

// ── Main Pass ────────────────────────────────────────────────

export async function runJudgmentPass(screenshotBase64, config) {
  if (!config.passes?.judgment) {
    return { enabled: false, dimensions: {}, score: null }
  }

  const dimensions = config.llm?.dimensions || Object.keys(RUBRICS)
  const model = config.llm?.model || 'claude-sonnet-4-6'
  const maxTokens = config.llm?.maxTokensPerDimension || 500

  let query
  try {
    const sdk = await import('@anthropic-ai/claude-agent-sdk')
    query = sdk.query
  } catch {
    // SDK not available
    return { enabled: true, error: 'claude-agent-sdk not available', dimensions: {}, score: null }
  }

  const results = { enabled: true, dimensions: {}, score: null }
  const evaluations = []

  // Run all dimension evaluations in parallel
  const tasks = dimensions.map(async (dim) => {
    const rubric = RUBRICS[dim]
    if (!rubric) return

    try {
      const response = []
      for await (const msg of query({
        model,
        maxTokens,
        systemPrompt: SYSTEM_PROMPT,
        prompt: [
          {
            type: 'image',
            source: { type: 'base64', media_type: 'image/png', data: screenshotBase64 },
          },
          {
            type: 'text',
            text: `${rubric}\n\nReturn ONLY JSON.`,
          },
        ],
      })) {
        if (msg.type === 'assistant' && msg.content) {
          response.push(typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content))
        }
      }

      const text = response.join('')
      // Extract JSON from response (may have markdown fences)
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        results.dimensions[dim] = {
          score: Number(parsed.score) || 0,
          rationale: parsed.rationale || '',
          issues: Array.isArray(parsed.issues) ? parsed.issues : [],
        }
        evaluations.push(results.dimensions[dim].score)
      }
    } catch (err) {
      results.dimensions[dim] = { score: null, error: err.message?.slice(0, 80) }
    }
  })

  await Promise.allSettled(tasks)

  // Overall judgment score = average of available dimensions
  if (evaluations.length > 0) {
    results.score = Number((evaluations.reduce((s, v) => s + v, 0) / evaluations.length).toFixed(2))
  }

  return results
}
