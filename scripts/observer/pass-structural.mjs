/**
 * Observer V3 — Pass 1: Structural Analysis
 * Runs on an already-navigated Playwright page object.
 *
 * @param {import('playwright').Page} page
 * @param {object} config
 * @param {object} [config._cssCoverage] — pre-collected CSS coverage data
 * @returns {Promise<StructuralResult>}
 */

import { calculate } from '@projectwallace/css-code-quality'

// ── helpers ──────────────────────────────────────────────────

function weightedScore(scores, weights) {
  let total = 0
  let wSum = 0
  for (const [key, weight] of Object.entries(weights)) {
    if (scores[key] != null) {
      total += scores[key] * weight
      wSum += weight
    }
  }
  return wSum === 0 ? null : total / wSum
}

// ── sub-analyses ─────────────────────────────────────────────

async function analyzeAria(page) {
  let snapshot = null

  try {
    const body = page.locator('body')
    if (typeof body.ariaSnapshot === 'function') {
      snapshot = await body.ariaSnapshot()
    } else {
      snapshot = await page.accessibility.snapshot()
      snapshot = JSON.stringify(snapshot)
    }
  } catch {
    snapshot = null
  }

  // Heading hierarchy from DOM
  const headingData = await page.evaluate(() => {
    const tags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']
    const counts = {}
    for (const tag of tags) {
      counts[tag] = document.querySelectorAll(tag).length
    }
    return counts
  })

  const h1Count = headingData.h1 || 0
  const levels = [1, 2, 3, 4, 5, 6].filter(l => headingData[`h${l}`] > 0)
  const maxLevel = levels.length ? Math.max(...levels) : 0

  let hasSkips = false
  for (let i = 1; i < levels.length; i++) {
    if (levels[i] - levels[i - 1] > 1) { hasSkips = true; break }
  }

  const structure = levels.length === 0
    ? 'flat'
    : hasSkips
      ? 'has-skips'
      : 'correct'

  const headingHierarchy = { h1Count, hasSkips, maxLevel, structure }

  // Landmarks
  const landmarks = await page.evaluate(() => {
    return {
      hasMain: !!document.querySelector('main, [role="main"]'),
      hasNav: !!document.querySelector('nav, [role="navigation"]'),
      hasFooter: !!document.querySelector('footer, [role="contentinfo"]'),
      count: document.querySelectorAll(
        'main, nav, footer, header, aside, section[aria-label], [role="main"], [role="navigation"], [role="contentinfo"], [role="banner"], [role="complementary"]'
      ).length
    }
  })

  // Interactive naming
  const interactiveNaming = await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll(
      'a, button, input, select, textarea, [role="button"], [role="link"], [tabindex]'
    ))
    const named = els.filter(el => {
      return el.getAttribute('aria-label') ||
        el.getAttribute('aria-labelledby') ||
        el.getAttribute('title') ||
        el.textContent.trim().length > 0
    })
    return { total: els.length, named: named.length, coverage: els.length ? named.length / els.length : 1 }
  })

  // Score 0-10
  let score = 0
  if (structure === 'correct') score += 3
  else if (structure === 'has-skips') score += 1
  if (landmarks.hasMain) score += 1
  if (landmarks.hasNav) score += 1
  if (landmarks.hasFooter) score += 1
  if (interactiveNaming.coverage >= 0.8) score += 2
  if (!hasSkips && h1Count >= 1) score += 2

  return { headingHierarchy, landmarks, interactiveNaming, score }
}

async function analyzeCssCoverage(page, config) {
  // Coverage must be started before navigation — use pre-collected data if available
  const coverageData = config?._cssCoverage

  if (!coverageData) {
    // Try page.coverage if Playwright exposes it (Chromium only)
    if (!page.coverage) return null

    // Coverage not started before nav — we can't collect it now
    return null
  }

  const entries = Array.isArray(coverageData) ? coverageData : []
  if (entries.length === 0) return null

  let totalBytes = 0
  let usedBytes = 0
  const perStylesheet = []

  for (const entry of entries) {
    const total = entry.text?.length || 0
    let used = 0
    for (const range of (entry.ranges || [])) {
      used += range.end - range.start
    }
    totalBytes += total
    usedBytes += used
    if (total > 0) {
      perStylesheet.push({ url: entry.url, unusedPct: Math.round((1 - used / total) * 100) })
    }
  }

  const unusedPercent = totalBytes > 0 ? Math.round((1 - usedBytes / totalBytes) * 100) : 0

  let score
  if (unusedPercent < 20) score = 10
  else if (unusedPercent < 40) score = 7
  else if (unusedPercent < 60) score = 4
  else score = 2

  return { totalBytes, usedBytes, unusedPercent, perStylesheet, score }
}

async function analyzeCssQuality(page) {
  const allCSS = await page.evaluate(() => {
    const sheets = Array.from(document.styleSheets)
    let css = ''
    for (const sheet of sheets) {
      try {
        // Same-origin only
        if (sheet.href && !sheet.href.startsWith(location.origin)) continue
        const rules = Array.from(sheet.cssRules || [])
        css += rules.map(r => r.cssText).join('\n')
      } catch {
        // Cross-origin sheet — skip
      }
    }
    return css
  })

  if (!allCSS || allCSS.trim().length < 10) return null

  const result = calculate(allCSS)

  // Normalize 0-100 scores to 0-10
  const performance = result.performance?.score != null ? result.performance.score / 10 : null
  const maintainability = result.maintainability?.score != null ? result.maintainability.score / 10 : null
  const complexity = result.complexity?.score != null ? result.complexity.score / 10 : null

  return { performance, maintainability, complexity }
}

async function analyzeResources(page) {
  const entries = await page.evaluate(() => {
    return JSON.stringify(performance.getEntriesByType('resource'))
  })

  const resources = JSON.parse(entries)

  let totalTransferKB = 0
  let imageCount = 0
  let uncompressedImages = 0
  let fontCount = 0
  let slowFonts = 0
  let scriptCount = 0
  let stylesheetCount = 0

  for (const r of resources) {
    totalTransferKB += (r.transferSize || 0) / 1024

    if (r.initiatorType === 'img' || r.initiatorType === 'image') {
      imageCount++
      if (r.encodedBodySize === r.decodedBodySize && r.transferSize > 10000) {
        uncompressedImages++
      }
    } else if (r.initiatorType === 'css' || (r.name && r.name.match(/\.css(\?|$)/i))) {
      stylesheetCount++
    } else if (r.initiatorType === 'script' || (r.name && r.name.match(/\.js(\?|$)/i))) {
      scriptCount++
    }

    if (r.initiatorType === 'css' && r.name && r.name.match(/\.(woff2?|ttf|otf|eot)(\?|$)/i)) {
      fontCount++
      if (r.duration > 2000) slowFonts++
    }
    // Fonts can also come as font initiatorType
    if (r.initiatorType === 'font') {
      fontCount++
      if (r.duration > 2000) slowFonts++
    }
  }

  totalTransferKB = Math.round(totalTransferKB * 10) / 10

  // Score: penalize heavy pages, uncompressed images, slow fonts
  let score = 10
  if (totalTransferKB > 5000) score -= 3
  else if (totalTransferKB > 2000) score -= 1
  if (uncompressedImages > 2) score -= 2
  else if (uncompressedImages > 0) score -= 1
  if (slowFonts > 0) score -= 2
  score = Math.max(0, score)

  return { totalTransferKB, imageCount, uncompressedImages, fontCount, slowFonts, scriptCount, stylesheetCount, score }
}

// ── main export ──────────────────────────────────────────────

export async function runStructuralPass(page, config = {}) {
  const WEIGHTS = { aria: 0.4, cssQuality: 0.3, resources: 0.3 }

  const [ariaResult, cssCoverageResult, cssQualityResult, resourcesResult] = await Promise.all([
    analyzeAria(page).catch(() => null),
    analyzeCssCoverage(page, config).catch(() => null),
    analyzeCssQuality(page).catch(() => null),
    analyzeResources(page).catch(() => null)
  ])

  // Build sub-scores map (only non-null sub-analyses contribute)
  const subScores = {}
  if (ariaResult != null) subScores.aria = ariaResult.score
  if (cssQualityResult != null) {
    const scores = [cssQualityResult.performance, cssQualityResult.maintainability, cssQualityResult.complexity]
      .filter(s => s != null)
    subScores.cssQuality = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null
  }
  if (resourcesResult != null) subScores.resources = resourcesResult.score

  const score = weightedScore(subScores, WEIGHTS) ?? 0

  return {
    aria: ariaResult,
    cssCoverage: cssCoverageResult,
    cssQuality: cssQualityResult,
    resources: resourcesResult
      ? (() => { const { score: _s, ...rest } = resourcesResult; return rest })()
      : null,
    score: Math.round(score * 10) / 10
  }
}
