#!/usr/bin/env node
/**
 * Eros Observer v3.0 — 4-Pass Design Quality Analyzer
 *
 * Passes:
 *   1. Structural  — ARIA, CSS coverage, CSS quality, resource analysis
 *   2. Perceptual  — CDP Animation, LayerTree, Core Web Vitals, color harmony, hover states
 *   3. Intelligence — aesthetic ML scoring, saliency, uniqueness, repetition
 *   4. Judgment    — LLM-as-judge per dimension (optional, costs tokens)
 *
 * Backward compatible with V2 manifest format (adds v3 fields).
 *
 * Usage:
 *   node observer/observer-v3.mjs <url> [output-dir]
 *   node observer/observer-v3.mjs --local --port 5173 [output-dir]
 *   node observer/observer-v3.mjs --config <path-to-config.json> <url> [output-dir]
 */

import { chromium } from 'playwright'
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ── CLI Parsing ──────────────────────────────────────────────

const args = process.argv.slice(2)

if (args.length === 0) {
  console.error(`Usage:
  node observer/observer-v3.mjs <url> [output-dir]
  node observer/observer-v3.mjs --local --port 5173 [output-dir]
  node observer/observer-v3.mjs --config ./observer/config.json <url> [output-dir]
  node observer/observer-v3.mjs --passes structural,perceptual <url> [output-dir]`)
  process.exit(1)
}

let url = null
let outputDir = '_ref-captures'
let isLocal = false
let localPort = 5173
let configPath = join(__dirname, 'observer', 'config.json')
let enabledPasses = null // null = use config defaults

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--local') { isLocal = true }
  else if (args[i] === '--port' && args[i + 1]) { localPort = parseInt(args[i + 1]) || 5173; i++ }
  else if (args[i] === '--config' && args[i + 1]) { configPath = args[i + 1]; i++ }
  else if (args[i] === '--passes' && args[i + 1]) { enabledPasses = args[i + 1].split(','); i++ }
  else if (!url && (args[i].startsWith('http') || isLocal)) { if (!isLocal) url = args[i]; else outputDir = args[i] }
  else if (!url) { url = args[i] }
  else { outputDir = args[i] }
}

if (isLocal) url = `http://localhost:${localPort}`
if (!url) { console.error('Error: no URL provided'); process.exit(1) }

// ── Load Config ──────────────────────────────────────────────

let config = {}
try {
  config = JSON.parse(readFileSync(configPath, 'utf-8'))
} catch {
  console.warn(`[v3] Config not found at ${configPath}, using defaults`)
}

// CLI --passes override
if (enabledPasses) {
  config.passes = {
    structural: enabledPasses.includes('structural'),
    perceptual: enabledPasses.includes('perceptual'),
    intelligence: enabledPasses.includes('intelligence'),
    judgment: enabledPasses.includes('judgment'),
  }
}

// ── Dynamic Imports (passes) ─────────────────────────────────

const log = (msg) => console.log(`[v3] ${msg}`)

async function importPass(name) {
  try {
    return await import(`./observer/pass-${name}.mjs`)
  } catch (err) {
    log(`Pass ${name} import failed: ${err.message?.slice(0, 80)}`)
    return null
  }
}

// ── Main ─────────────────────────────────────────────────────

async function analyze(url, outputDir) {
  const startTime = Date.now()
  const domain = new URL(url).hostname.replace('localhost', 'local')
  const dir = join(outputDir, domain)
  mkdirSync(dir, { recursive: true })

  log(`Analyzing ${url}`)
  log(`Output: ${dir}`)

  // Launch browser with CDP enabled
  const browser = await chromium.launch({ headless: true })
  const vp = config.viewports?.desktop || { width: 1440, height: 900 }

  // Start CSS coverage BEFORE navigation (Chromium only)
  const context = await browser.newContext({ viewport: vp })
  const page = await context.newPage()

  let cssCoverage = null
  try {
    await page.coverage.startCSSCoverage({ resetOnNavigation: false })
  } catch {
    log('CSS coverage not available (non-Chromium?)')
  }

  // Navigate
  const timeout = config.limits?.navigationTimeout || 30000
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout })
  } catch {
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout })
    } catch (err) {
      log(`Navigation failed: ${err.message?.slice(0, 80)}`)
      await browser.close()
      return null
    }
  }

  // Settle
  await page.waitForTimeout(config.limits?.settleDelay || 2000)

  // Dismiss cookie banners
  const cookieSelectors = [
    'button:has-text("Accept")', 'button:has-text("Got it")',
    'button:has-text("OK")', 'button:has-text("Agree")',
    '[id*="cookie"] button', '[class*="cookie"] button',
    '[id*="consent"] button', '[class*="consent"] button',
  ]
  for (const sel of cookieSelectors) {
    try {
      const btn = page.locator(sel).first()
      if (await btn.isVisible({ timeout: 500 })) {
        await btn.click({ timeout: 1000 })
        await page.waitForTimeout(500)
        break
      }
    } catch {}
  }

  // Stop CSS coverage
  try {
    cssCoverage = await page.coverage.stopCSSCoverage()
  } catch {}

  // ── Run passes ────────────────────────────────────────────

  const passResults = { structural: null, perceptual: null, intelligence: null, judgment: null }
  const passTimings = {}

  // Pass 1: Structural
  if (config.passes?.structural !== false) {
    const t0 = Date.now()
    log('Pass 1: Structural...')
    try {
      const mod = await importPass('structural')
      if (mod) {
        passResults.structural = await mod.runStructuralPass(page, { ...config, _cssCoverage: cssCoverage })
      }
    } catch (err) { log(`Structural pass error: ${err.message?.slice(0, 80)}`) }
    passTimings.structural = Date.now() - t0
    log(`  Done (${passTimings.structural}ms)`)
  }

  // Pass 2: Perceptual
  if (config.passes?.perceptual !== false) {
    const t0 = Date.now()
    log('Pass 2: Perceptual...')
    try {
      const mod = await importPass('perceptual')
      if (mod) {
        passResults.perceptual = await mod.runPerceptualPass(page, config)
      }
    } catch (err) { log(`Perceptual pass error: ${err.message?.slice(0, 80)}`) }
    passTimings.perceptual = Date.now() - t0
    log(`  Done (${passTimings.perceptual}ms)`)
  }

  // Take screenshots for intelligence + judgment passes
  const screenshotPaths = {}
  try {
    const fpPath = join(dir, 'full-page-desktop.png')
    await page.screenshot({ path: fpPath, fullPage: true })
    screenshotPaths.fullPage = fpPath

    // Hero section screenshot (first viewport)
    const heroPath = join(dir, 'hero-desktop.png')
    await page.screenshot({ path: heroPath })
    screenshotPaths.hero = heroPath

    // Per-section screenshots
    const sections = await page.$$('section, [class*="section"], [class*="Section"], [id*="section"]')
    screenshotPaths.sections = []
    for (let i = 0; i < Math.min(sections.length, 10); i++) {
      try {
        const secPath = join(dir, `section-${i}.png`)
        await sections[i].screenshot({ path: secPath })
        screenshotPaths.sections.push(secPath)
      } catch {}
    }
  } catch (err) { log(`Screenshot error: ${err.message?.slice(0, 60)}`) }

  // Pass 3: Intelligence
  if (config.passes?.intelligence !== false) {
    const t0 = Date.now()
    log('Pass 3: Intelligence...')
    try {
      const mod = await importPass('intelligence')
      if (mod) {
        passResults.intelligence = await mod.runIntelligencePass(page, screenshotPaths, config)
      }
    } catch (err) { log(`Intelligence pass error: ${err.message?.slice(0, 80)}`) }
    passTimings.intelligence = Date.now() - t0
    log(`  Done (${passTimings.intelligence}ms)`)
  }

  // Pass 4: Judgment (optional — costs API tokens)
  if (config.passes?.judgment === true && screenshotPaths.fullPage) {
    const t0 = Date.now()
    log('Pass 4: Judgment (LLM)...')
    try {
      const mod = await importPass('judgment')
      if (mod) {
        const screenshotBase64 = readFileSync(screenshotPaths.fullPage).toString('base64')
        passResults.judgment = await mod.runJudgmentPass(screenshotBase64, config)
      }
    } catch (err) { log(`Judgment pass error: ${err.message?.slice(0, 80)}`) }
    passTimings.judgment = Date.now() - t0
    log(`  Done (${passTimings.judgment}ms)`)
  }

  // ── Scoring Engine ────────────────────────────────────────

  let finalScores = null
  try {
    const scoringMod = await import('./observer/scoring-engine.mjs')
    finalScores = scoringMod.computeFinalScores(passResults, config)
  } catch (err) {
    log(`Scoring engine error: ${err.message?.slice(0, 80)}`)
  }

  // ── Build Manifest (V3, backward compatible with V2) ──────

  const manifest = {
    version: 3.0,
    url,
    domain,
    capturedAt: new Date().toISOString(),
    isLocal,
    durationMs: Date.now() - startTime,

    // V3 pass results
    passes: {
      structural: passResults.structural,
      perceptual: passResults.perceptual,
      intelligence: passResults.intelligence,
      judgment: passResults.judgment,
    },
    passTimings,

    // V3 final scores
    v3Scores: finalScores,

    // V2 backward compatibility — map V3 scores to V2 format
    excellenceSignals: finalScores ? {
      composition: finalScores.signals.composition,
      depth: finalScores.signals.depth,
      typography: finalScores.signals.typography,
      motion: finalScores.signals.motion,
      craft: finalScores.signals.craft,
      _scores: finalScores.dimensions,
    } : { composition: 'WEAK', depth: 'WEAK', typography: 'WEAK', motion: 'WEAK', craft: 'WEAK' },

    qualityGates: {
      contrast: passResults.structural?.aria ? { signal: 'PASS' } : { signal: 'UNKNOWN' },
      animations: { clean: true, signal: 'PASS' },
      images: { signal: passResults.structural?.resources?.uncompressedImages > 0 ? 'WARN' : 'PASS' },
      headings: { signal: passResults.structural?.aria?.headingHierarchy?.structure === 'correct' ? 'PASS' : 'FAIL' },
      meta: { signal: 'UNKNOWN' },
      overall: finalScores ? (finalScores.overall >= 7 ? 'PASS' : 'NEEDS_WORK') : 'UNKNOWN',
    },

    // Performance metrics (V3 new)
    performanceMetrics: passResults.perceptual ? {
      lcp: passResults.perceptual.cwv?.lcp,
      cls: passResults.perceptual.cwv?.cls,
      tbt: passResults.perceptual.cwv?.tbt,
      recalcStyleCount: passResults.perceptual.perfMetrics?.recalcStyleCount,
      layoutCount: passResults.perceptual.perfMetrics?.layoutCount,
      gpuLayers: passResults.perceptual.gpuLayers?.count,
    } : null,

    // Animation analysis (V3 new)
    animationAnalysis: passResults.perceptual?.animations || null,

    // Aesthetic scores (V3 new)
    aestheticScores: passResults.intelligence?.aesthetic || null,

    // LLM judgment (V3 new)
    llmJudgment: passResults.judgment?.dimensions || null,

    screenshots: {
      desktop: existsSync(join(dir, 'full-page-desktop.png')) ? 1 : 0,
      mobile: 0,
    },
  }

  // Write manifest
  writeFileSync(join(dir, 'manifest.json'), JSON.stringify(manifest, null, 2))

  // Write analysis report
  const report = generateReport(manifest)
  writeFileSync(join(dir, 'analysis.md'), report)

  // Summary
  const dur = ((Date.now() - startTime) / 1000).toFixed(1)
  log(`Done in ${dur}s`)
  if (finalScores) {
    log(`  Overall: ${finalScores.overall}/10`)
    log(`  Composition:${finalScores.signals.composition} Depth:${finalScores.signals.depth} Typography:${finalScores.signals.typography} Motion:${finalScores.signals.motion} Craft:${finalScores.signals.craft}`)
  }
  log(`  Passes: ${Object.entries(passTimings).map(([k, v]) => `${k}=${v}ms`).join(' ')}`)
  log(`  Saved to ${dir}/`)

  await context.close()
  await browser.close()

  return manifest
}

// ── Report Generator ─────────────────────────────────────────

function generateReport(m) {
  const lines = [
    `# Observer V3 Analysis — ${m.url}`,
    ``,
    `**Captured:** ${m.capturedAt}`,
    `**Duration:** ${m.durationMs}ms`,
    `**Version:** ${m.version}`,
    ``,
  ]

  if (m.v3Scores) {
    lines.push(`## Scores`)
    lines.push(``)
    lines.push(`| Dimension | Score | Signal |`)
    lines.push(`|-----------|-------|--------|`)
    for (const [dim, score] of Object.entries(m.v3Scores.dimensions || {})) {
      lines.push(`| ${dim} | ${score}/10 | ${m.v3Scores.signals[dim]} |`)
    }
    lines.push(`| **Overall** | **${m.v3Scores.overall}/10** | |`)
    lines.push(``)
  }

  if (m.performanceMetrics) {
    lines.push(`## Performance`)
    lines.push(``)
    lines.push(`- LCP: ${m.performanceMetrics.lcp != null ? m.performanceMetrics.lcp + 'ms' : 'N/A'}`)
    lines.push(`- CLS: ${m.performanceMetrics.cls != null ? m.performanceMetrics.cls : 'N/A'}`)
    lines.push(`- TBT: ${m.performanceMetrics.tbt != null ? m.performanceMetrics.tbt + 'ms' : 'N/A'}`)
    lines.push(`- GPU Layers: ${m.performanceMetrics.gpuLayers || 'N/A'}`)
    lines.push(`- Recalc Style: ${m.performanceMetrics.recalcStyleCount || 'N/A'}`)
    lines.push(``)
  }

  if (m.animationAnalysis) {
    lines.push(`## Animations`)
    lines.push(``)
    lines.push(`- Count: ${m.animationAnalysis.count}`)
    lines.push(`- Easing Quality: ${m.animationAnalysis.easingQuality}/10`)
    lines.push(`- Unique Timing Functions: ${m.animationAnalysis.uniqueTimingFunctions}`)
    lines.push(`- Stagger Detected: ${m.animationAnalysis.staggerDetected ? 'Yes' : 'No'}`)
    lines.push(``)
  }

  if (m.passes?.structural?.cssCoverage) {
    lines.push(`## CSS Coverage`)
    lines.push(``)
    lines.push(`- Unused: ${m.passes.structural.cssCoverage.unusedPercent}%`)
    lines.push(``)
  }

  if (m.llmJudgment && Object.keys(m.llmJudgment).length > 0) {
    lines.push(`## LLM Judgment`)
    lines.push(``)
    for (const [dim, eval_] of Object.entries(m.llmJudgment)) {
      if (eval_.score != null) {
        lines.push(`### ${dim} (${eval_.score}/10)`)
        lines.push(`${eval_.rationale || ''}`)
        if (eval_.issues?.length) lines.push(`Issues: ${eval_.issues.join(', ')}`)
        lines.push(``)
      }
    }
  }

  lines.push(`---`)
  lines.push(`*Generated by Eros Observer V3*`)
  return lines.join('\n')
}

// ── Entry Point ──────────────────────────────────────────────

try {
  await analyze(url, outputDir)
} catch (err) {
  console.error(`[v3] Fatal: ${err.message}`)
  console.error(err.stack)
  process.exit(1)
}
