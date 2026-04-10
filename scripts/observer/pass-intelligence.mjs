/**
 * Observer V3 — Pass 3: Intelligence
 * ML-based aesthetic scoring, saliency prediction, template uniqueness, section repetition.
 *
 * Requires Python + pyiqa + deepgaze for full functionality.
 * Returns null for unavailable sub-analyses (graceful degradation).
 */

import { execFile } from 'child_process'
import { promisify } from 'util'
import { existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const execFileAsync = promisify(execFile)

// ── Helpers ──────────────────────────────────────────────────

async function runPython(scriptName, args, timeoutMs = 30000) {
  const scriptPath = join(__dirname, '..', scriptName)
  if (!existsSync(scriptPath)) return null

  try {
    const { stdout } = await execFileAsync('python', [scriptPath, ...args], {
      timeout: timeoutMs,
      maxBuffer: 5 * 1024 * 1024,
    })
    return JSON.parse(stdout.trim())
  } catch {
    // Python not available or script failed — graceful degradation
    return null
  }
}

/**
 * Simple pixel buffer comparison for section repetition.
 * Returns ratio of differing pixels (0 = identical, 1 = totally different).
 */
function bufferDiffRatio(bufA, bufB) {
  if (bufA.length !== bufB.length) return 1
  let diff = 0
  // Sample every 4th byte (skip alpha in RGBA) for speed
  const step = 4
  const total = Math.floor(bufA.length / step)
  for (let i = 0; i < bufA.length; i += step) {
    if (Math.abs(bufA[i] - bufB[i]) > 25) diff++
  }
  return diff / total
}

// ── Main Pass ────────────────────────────────────────────────

export async function runIntelligencePass(page, screenshotPaths, config) {
  const results = {
    aesthetic: null,
    saliency: null,
    uniqueness: null,
    sectionRepetition: null,
    score: null,
  }

  const tasks = []

  // 1. Aesthetic scoring (Python: pyiqa MUSIQ + CLIPIQA)
  if (config.passes?.intelligence !== false && screenshotPaths?.fullPage) {
    tasks.push(
      runPython('eros-aesthetic.py', [screenshotPaths.fullPage])
        .then(r => { results.aesthetic = r })
    )
  }

  // 2. Saliency prediction (Python: DeepGaze)
  if (config.passes?.intelligence !== false && screenshotPaths?.hero) {
    tasks.push(
      runPython('eros-saliency.py', [screenshotPaths.hero], 60000)
        .then(r => { results.saliency = r })
    )
  }

  // 3. Template uniqueness via perceptual hash
  // Stub — requires sharp-phash. Interface defined, implementation TODO.
  if (screenshotPaths?.fullPage) {
    tasks.push((async () => {
      try {
        // Dynamic import — fails gracefully if sharp not installed
        const { default: sharp } = await import('sharp')
        const sharpPhash = (await import('sharp-phash')).default

        const hash = await sharpPhash(sharp(screenshotPaths.fullPage))

        // TODO: Compare against template-corpus.json
        // For now, return the hash for future comparison
        results.uniqueness = {
          hash,
          score: null, // Will be computed when corpus exists
          nearestTemplate: null,
        }
      } catch {
        results.uniqueness = null
      }
    })())
  }

  // 4. Section repetition — compare section screenshots pairwise
  if (screenshotPaths?.sections?.length >= 2) {
    tasks.push((async () => {
      try {
        const { default: sharp } = await import('sharp')
        const sectionBuffers = []

        for (const sp of screenshotPaths.sections.slice(0, 10)) {
          const buf = await sharp(sp).resize(200, 200, { fit: 'fill' }).raw().toBuffer()
          sectionBuffers.push({ path: sp, buf })
        }

        const repetitions = []
        for (let i = 0; i < sectionBuffers.length; i++) {
          for (let j = i + 1; j < sectionBuffers.length; j++) {
            const diff = bufferDiffRatio(sectionBuffers[i].buf, sectionBuffers[j].buf)
            const similarity = 1 - diff
            if (similarity > 0.85) {
              repetitions.push({
                a: sectionBuffers[i].path,
                b: sectionBuffers[j].path,
                similarity: Number(similarity.toFixed(3)),
              })
            }
          }
        }

        results.sectionRepetition = {
          pairsChecked: (sectionBuffers.length * (sectionBuffers.length - 1)) / 2,
          repetitions,
          count: repetitions.length,
        }
      } catch {
        results.sectionRepetition = null
      }
    })())
  }

  await Promise.allSettled(tasks)

  // Compute pass score from available sub-scores
  const subScores = []
  if (results.aesthetic?.musiq != null) {
    // MUSIQ is 0-100, normalize to 0-10
    subScores.push({ value: Math.min(10, results.aesthetic.musiq / 10), weight: 0.4 })
  }
  if (results.aesthetic?.clipiqa != null) {
    // CLIPIQA is 0-1, normalize to 0-10
    subScores.push({ value: results.aesthetic.clipiqa * 10, weight: 0.3 })
  }
  if (results.sectionRepetition != null) {
    // Fewer repetitions = higher score
    const repPenalty = Math.min(results.sectionRepetition.count * 2, 8)
    subScores.push({ value: 10 - repPenalty, weight: 0.3 })
  }

  if (subScores.length > 0) {
    const totalWeight = subScores.reduce((s, i) => s + i.weight, 0)
    results.score = Number(
      (subScores.reduce((s, i) => s + i.value * i.weight, 0) / totalWeight).toFixed(2)
    )
  }

  return results
}
