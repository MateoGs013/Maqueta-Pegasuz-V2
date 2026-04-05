#!/usr/bin/env node
/**
 * Eros Observer v2.0 — Playwright-based 6-layer web page analyzer
 * Replaces capture-refs.mjs (Puppeteer). Same CLI, richer analysis.
 *
 * Layers:
 *   1. Geometry    — visual balance, center of mass, overlaps, spatial surprises
 *   2. Aesthetics  — color harmony, whitespace rhythm, typography scale
 *   3. Semantic    — ARIA tree, heading hierarchy, landmarks, interactive names
 *   4. AntiTemplate — layout fingerprinting, variety scoring, template detection
 *   5. Structural  — z-index, clip-path, backdrop-filter, grain, pseudo-elements
 *   6. Motion      — CSS transitions/animations, GSAP, ScrollTrigger, wheel states
 *
 * Usage:
 *   node eros-observer.mjs <url> [output-dir]
 *   node eros-observer.mjs --local --port 5173 <output-dir>
 *   node eros-observer.mjs --batch <url1> <url2> --out <dir>
 *   node eros-observer.mjs --no-discover <url> [output-dir]
 *   node eros-observer.mjs --max-pages 3 <url> [output-dir]
 */

import { chromium } from 'playwright'
import { mkdirSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'

// ── CLI parsing ──────────────────────────────────────────────
const args = process.argv.slice(2)

if (args.length === 0) {
  console.error(`Usage:
  Single:    node eros-observer.mjs <url> [output-dir]
  Batch:     node eros-observer.mjs --batch <url1> <url2> ... [--out <dir>]
  No crawl:  node eros-observer.mjs --no-discover <url> [output-dir]
  Max pages: node eros-observer.mjs --max-pages 3 <url> [output-dir]
  Local:     node eros-observer.mjs --local [--port 5173] [output-dir]`)
  process.exit(1)
}

let urls = []
let outputBase = '_ref-captures'
let autoDiscover = true
let maxInternalPages = 5
let isLocal = false
let localPort = 5173

const flagArgs = []
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--no-discover') { autoDiscover = false }
  else if (args[i] === '--max-pages' && args[i + 1]) { maxInternalPages = parseInt(args[i + 1]) || 5; i++ }
  else if (args[i] === '--local') { isLocal = true; autoDiscover = false }
  else if (args[i] === '--port' && args[i + 1]) { localPort = parseInt(args[i + 1]) || 5173; i++ }
  else if ((args[i] === '--path' || args[i] === '--out') && args[i + 1]) { outputBase = args[i + 1]; i++ }
  else if (args[i] === '--batch') { /* handled below */ flagArgs.push(args[i]) }
  else if (args[i].startsWith('--')) { console.error(`Unknown flag: ${args[i]}`); process.exit(1) }
  else { flagArgs.push(args[i]) }
}

if (isLocal) {
  urls = [`http://localhost:${localPort}`]
  if (flagArgs[0]) outputBase = flagArgs[0]
} else if (flagArgs[0] === '--batch') {
  const outIdx = flagArgs.indexOf('--out')
  if (outIdx !== -1) { outputBase = flagArgs[outIdx + 1]; urls = flagArgs.slice(1, outIdx) }
  else { urls = flagArgs.slice(1) }
} else {
  urls = [flagArgs[0]]
  if (flagArgs[1]) outputBase = flagArgs[1]
}

// ── Constants ────────────────────────────────────────────────
const VP_DESKTOP = { width: 1440, height: 900 }
const VP_MOBILE = { width: 375, height: 812 }

const COOKIE_SELECTORS = [
  '[class*="cookie"] button[class*="accept"]',
  '[class*="cookie"] button[class*="agree"]',
  '[class*="consent"] button[class*="accept"]',
  '[id*="cookie"] button', '[id*="consent"] button',
  '.cc-btn.cc-dismiss', '#onetrust-accept-btn-handler',
  'button[aria-label*="cookie" i]', 'button[aria-label*="accept" i]'
]

// ── Helpers ──────────────────────────────────────────────────
function rgbaToHex(rgba) {
  const m = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
  if (!m) return rgba
  return '#' + [m[1], m[2], m[3]].map(x => (+x).toString(16).padStart(2, '0')).join('')
}

function clusterColors(hexColors, threshold = 30) {
  const dist = (a, b) => {
    const [r1,g1,b1] = [1,3,5].map(i => parseInt(a.slice(i,i+2),16))
    const [r2,g2,b2] = [1,3,5].map(i => parseInt(b.slice(i,i+2),16))
    return Math.sqrt((r1-r2)**2 + (g1-g2)**2 + (b1-b2)**2)
  }
  const clusters = []
  for (const hex of hexColors) {
    const existing = clusters.find(c => dist(c.rep, hex) < threshold)
    if (existing) { existing.count++ } else { clusters.push({ rep: hex, count: 1 }) }
  }
  return clusters.sort((a,b) => b.count - a.count).slice(0,8).map(c => ({ hex: c.rep, frequency: c.count }))
}

function urlToSlug(url) {
  const p = new URL(url).pathname.replace(/^\//, '').replace(/\/$/, '').replace(/\//g, '-')
  return p ? `--${p}` : ''
}

const delay = ms => new Promise(r => setTimeout(r, ms))

// ═════════════════════════════════════════════════════════════
// LAYER 1: GEOMETRY — Visual Balance
// ═════════════════════════════════════════════════════════════
async function extractGeometry(page) {
  return page.evaluate(() => {
    const vh = window.innerHeight
    const vw = window.innerWidth
    const totalH = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight)
    const chunkCount = Math.max(1, Math.ceil(totalH / vh))

    // Sample visible elements
    const allEls = [...document.querySelectorAll('*')].slice(0, 500)
    const rects = []
    for (const el of allEls) {
      const r = el.getBoundingClientRect()
      const s = getComputedStyle(el)
      if (r.width < 10 || r.height < 10) continue
      if (s.display === 'none' || s.visibility === 'hidden') continue
      const opacity = parseFloat(s.opacity) || 0
      if (opacity < 0.05) continue
      rects.push({
        x: r.left + window.scrollX, y: r.top + window.scrollY,
        w: r.width, h: r.height,
        area: r.width * r.height,
        opacity,
        pos: s.position,
        transform: s.transform,
        marginTop: parseFloat(s.marginTop) || 0,
        marginLeft: parseFloat(s.marginLeft) || 0,
      })
    }

    // Center of mass (page-level, normalized)
    let totalWeight = 0, wx = 0, wy = 0
    for (const r of rects) {
      const w = r.area * r.opacity
      wx += (r.x + r.w / 2) / vw * w
      wy += (r.y + r.h / 2) / totalH * w
      totalWeight += w
    }
    const com = totalWeight > 0
      ? { x: parseFloat((wx / totalWeight).toFixed(3)), y: parseFloat((wy / totalWeight).toFixed(3)) }
      : { x: 0.5, y: 0.5 }

    // Quadrant distribution (first viewport)
    const q = { topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0 }
    for (const r of rects) {
      if (r.y > vh) continue
      const cx = r.x + r.w / 2, cy = r.y + r.h / 2
      const w = r.area * r.opacity
      if (cx < vw / 2 && cy < vh / 2) q.topLeft += w
      else if (cx >= vw / 2 && cy < vh / 2) q.topRight += w
      else if (cx < vw / 2) q.bottomLeft += w
      else q.bottomRight += w
    }
    const qTotal = q.topLeft + q.topRight + q.bottomLeft + q.bottomRight || 1
    for (const k of Object.keys(q)) q[k] = parseFloat((q[k] / qTotal).toFixed(3))

    // Symmetry (horizontal mirror)
    const leftW = q.topLeft + q.bottomLeft
    const rightW = q.topRight + q.bottomRight
    const symmetry = 1 - Math.abs(leftW - rightW)

    // Balance type
    let type = 'asymmetric-unbalanced'
    if (symmetry > 0.85) type = 'symmetric'
    else if (symmetry > 0.55) type = 'asymmetric-balanced'

    const balanceScore = parseFloat((
      (symmetry > 0.85 ? 7 : symmetry > 0.55 ? 9 : symmetry > 0.3 ? 6 : 4) +
      (Math.abs(com.x - 0.5) < 0.15 ? 1 : 0) +
      (chunkCount >= 3 ? 1 : 0)
    ).toFixed(1))

    // Intentional overlaps
    const absEls = rects.filter(r => r.pos === 'absolute' || r.pos === 'fixed')
    let intentionalOverlaps = 0
    const overlapElements = []
    for (let i = 0; i < absEls.length; i++) {
      for (let j = i + 1; j < absEls.length; j++) {
        const a = absEls[i], b = absEls[j]
        if (a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y) {
          intentionalOverlaps++
        }
      }
      if (intentionalOverlaps >= 10) break
    }
    // Also count abs elements overlapping non-abs neighbors
    for (const abs of absEls.slice(0, 20)) {
      for (const r of rects.slice(0, 50)) {
        if (r.pos === 'absolute' || r.pos === 'fixed') continue
        if (abs.x < r.x + r.w && abs.x + abs.w > r.x && abs.y < r.y + r.h && abs.y + abs.h > r.y) {
          intentionalOverlaps++
          break
        }
      }
    }

    // Spatial surprises
    const surpriseTypes = []
    const negMargins = rects.filter(r => r.marginTop < -5 || r.marginLeft < -5).length
    if (negMargins > 0) surpriseTypes.push('negative-margins')
    const rotated = rects.filter(r => r.transform && r.transform !== 'none' && r.transform.includes('matrix') && !r.transform.includes('matrix(1, 0, 0, 1')).length
    if (rotated > 0) surpriseTypes.push('rotated-elements')
    const containerBreaks = rects.filter(r => r.w > vw * 1.01).length
    if (containerBreaks > 0) surpriseTypes.push('container-breaks')

    return {
      visualBalance: {
        score: Math.min(10, balanceScore),
        type,
        centerOfMass: com,
        quadrants: q,
      },
      overlap: {
        intentional: Math.min(intentionalOverlaps, 20),
        elements: overlapElements.slice(0, 10),
      },
      surprise: {
        count: negMargins + rotated + containerBreaks,
        types: surpriseTypes,
      }
    }
  })
}

// ═════════════════════════════════════════════════════════════
// LAYER 2: AESTHETICS — Color, Whitespace, Typography
// ═════════════════════════════════════════════════════════════
async function extractAesthetics(page) {
  return page.evaluate(() => {
    const allEls = [...document.querySelectorAll('*')].slice(0, 500)
    const vw = window.innerWidth
    const vh = window.innerHeight
    const totalH = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight)

    // ── COLOR HARMONY ──
    function parseRGB(str) {
      const m = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
      return m ? [+m[1], +m[2], +m[3]] : null
    }
    function rgbToHSL(r, g, b) {
      r /= 255; g /= 255; b /= 255
      const max = Math.max(r, g, b), min = Math.min(r, g, b)
      let h = 0, s = 0, l = (max + min) / 2
      if (max !== min) {
        const d = max - min
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
        if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        else if (max === g) h = ((b - r) / d + 2) / 6
        else h = ((r - g) / d + 4) / 6
      }
      return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
    }

    const colorSet = new Set()
    const bgColorSet = new Set()
    const hues = []
    const saturations = []

    for (const el of allEls) {
      const s = getComputedStyle(el)
      for (const prop of [s.color, s.backgroundColor, s.borderColor]) {
        if (!prop || prop === 'rgba(0, 0, 0, 0)' || prop === 'transparent') continue
        const rgb = parseRGB(prop)
        if (!rgb) continue
        const hex = '#' + rgb.map(v => v.toString(16).padStart(2, '0')).join('')
        colorSet.add(hex)
        const hsl = rgbToHSL(...rgb)
        if (hsl.s > 5) { hues.push(hsl.h); saturations.push(hsl.s) }
      }
      if (s.backgroundColor && s.backgroundColor !== 'rgba(0, 0, 0, 0)') {
        const rgb = parseRGB(s.backgroundColor)
        if (rgb) bgColorSet.add('#' + rgb.map(v => v.toString(16).padStart(2, '0')).join(''))
      }
    }

    // Hue distribution analysis
    let harmonyType = 'mixed'
    if (hues.length > 0) {
      const uniqueHues = [...new Set(hues.map(h => Math.round(h / 30) * 30))]
      const hueRange = Math.max(...hues) - Math.min(...hues)
      if (uniqueHues.length <= 2 && hueRange <= 30) harmonyType = 'monochrome'
      else if (hueRange <= 60) harmonyType = 'analogous'
      else if (uniqueHues.length === 2) {
        const diff = Math.abs(uniqueHues[0] - uniqueHues[1])
        if (diff > 150 && diff < 210) harmonyType = 'complementary'
      }
      else if (uniqueHues.length === 3) {
        const sorted = uniqueHues.sort((a, b) => a - b)
        const d1 = sorted[1] - sorted[0], d2 = sorted[2] - sorted[1]
        if (Math.abs(d1 - 120) < 30 && Math.abs(d2 - 120) < 30) harmonyType = 'triadic'
      }
    }

    const avgHue = hues.length ? hues.reduce((a, b) => a + b, 0) / hues.length : 0
    const temperature = (avgHue <= 60 || avgHue >= 300) ? 'warm' : (avgHue >= 120 && avgHue <= 240) ? 'cool' : 'neutral'

    const satRange = saturations.length
      ? [Math.min(...saturations), Math.max(...saturations)]
      : [0, 0]

    // AI fingerprint: purple gradients without purpose, neon-on-black
    let aiFingerprint = false
    const hexArr = [...colorSet]
    const hasPurpleGradient = hexArr.some(h => {
      const rgb = [1,3,5].map(i => parseInt(h.slice(i,i+2),16))
      const hsl = rgbToHSL(...rgb)
      return hsl.h >= 250 && hsl.h <= 290 && hsl.s > 50
    })
    const hasNeon = hexArr.some(h => {
      const rgb = [1,3,5].map(i => parseInt(h.slice(i,i+2),16))
      return Math.max(...rgb) > 200 && rgbToHSL(...rgb).s > 80
    })
    const hasDarkBg = [...bgColorSet].some(h => {
      const rgb = [1,3,5].map(i => parseInt(h.slice(i,i+2),16))
      return rgbToHSL(...rgb).l < 15
    })
    if (hasPurpleGradient && hasNeon && hasDarkBg) aiFingerprint = true

    const colorScore = harmonyType === 'monochrome' || harmonyType === 'analogous' ? 8
      : harmonyType === 'complementary' || harmonyType === 'triadic' ? 7
      : aiFingerprint ? 3 : 5

    // ── WHITESPACE ──
    let occupiedArea = 0
    const sectionEls = [...document.querySelectorAll('section, main > div, article, header, footer')]
    const sectionWS = []

    for (const el of sectionEls.slice(0, 15)) {
      const rect = el.getBoundingClientRect()
      const sectionArea = rect.width * rect.height
      if (sectionArea < 100) continue
      let childArea = 0
      for (const child of [...el.querySelectorAll(':scope > *')].slice(0, 20)) {
        const cr = child.getBoundingClientRect()
        childArea += cr.width * cr.height
      }
      const ratio = sectionArea > 0 ? parseFloat((1 - Math.min(1, childArea / sectionArea)).toFixed(2)) : 0
      sectionWS.push(ratio)
      occupiedArea += childArea
    }

    const totalArea = vw * totalH || 1
    const globalRatio = parseFloat((1 - Math.min(1, occupiedArea / totalArea)).toFixed(2))

    // Rhythm: variance in whitespace between sections
    const wsVariance = sectionWS.length > 1
      ? parseFloat((sectionWS.reduce((s, v) => s + Math.pow(v - globalRatio, 2), 0) / sectionWS.length).toFixed(4))
      : 0
    const wsVerdict = globalRatio >= 0.35 && globalRatio <= 0.65 ? 'balanced'
      : globalRatio < 0.35 ? 'crowded' : 'sparse'

    // ── TYPOGRAPHY ──
    const textEls = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6,p,span,a,li,button,label')]
    const sizesSet = new Set()
    const weightsSet = new Set()
    let hasCustomSpacing = false
    const lineHeights = []

    for (const el of textEls.slice(0, 300)) {
      const s = getComputedStyle(el)
      const size = Math.round(parseFloat(s.fontSize))
      if (size >= 10) sizesSet.add(size)
      const weight = parseInt(s.fontWeight)
      if (!isNaN(weight)) weightsSet.add(weight)
      if (s.letterSpacing && s.letterSpacing !== 'normal' && s.letterSpacing !== '0px') hasCustomSpacing = true
      const lh = parseFloat(s.lineHeight) / parseFloat(s.fontSize)
      if (!isNaN(lh) && lh > 0) lineHeights.push(parseFloat(lh.toFixed(2)))
    }

    const sizes = [...sizesSet].sort((a, b) => a - b)
    const minSize = sizes[0] || 14
    const maxSize = sizes[sizes.length - 1] || 14
    const sizeRatio = parseFloat((maxSize / Math.max(1, minSize)).toFixed(1))

    // Modular scale detection
    let modularScale = null
    const scales = [1.125, 1.2, 1.25, 1.333, 1.414, 1.5, 1.618]
    if (sizes.length >= 3) {
      for (const s of scales) {
        let matches = 0
        for (let i = 1; i < sizes.length; i++) {
          const ratio = sizes[i] / sizes[i - 1]
          if (Math.abs(ratio - s) < 0.08) matches++
        }
        if (matches >= Math.floor(sizes.length / 2)) { modularScale = s; break }
      }
    }

    // Line-height consistency
    const avgLH = lineHeights.length ? lineHeights.reduce((a, b) => a + b, 0) / lineHeights.length : 0
    const lhVariance = lineHeights.length > 1
      ? lineHeights.reduce((s, v) => s + Math.pow(v - avgLH, 2), 0) / lineHeights.length
      : 0
    const lineHeightConsistency = lhVariance < 0.05

    const typoScore = parseFloat((
      (sizeRatio >= 4 ? 2 : sizeRatio >= 2.5 ? 1.5 : 1) +
      (sizes.length >= 5 ? 2 : sizes.length >= 3 ? 1 : 0) +
      (weightsSet.size >= 3 ? 2 : weightsSet.size >= 2 ? 1 : 0) +
      (hasCustomSpacing ? 1.5 : 0) +
      (modularScale ? 1 : 0) +
      (lineHeightConsistency ? 1.5 : 0)
    ).toFixed(1))

    return {
      colorHarmony: {
        score: Math.min(10, colorScore),
        type: harmonyType,
        temperature,
        saturationRange: satRange,
        aiFingerprint,
        uniqueColors: colorSet.size,
      },
      whitespace: {
        globalRatio,
        perSection: sectionWS,
        rhythm: wsVariance,
        verdict: wsVerdict,
      },
      typography: {
        score: Math.min(10, typoScore),
        sizeRatio,
        modularScale,
        levels: sizes.length,
        weights: [...weightsSet].sort((a, b) => a - b),
        hasCustomSpacing,
        lineHeightConsistency,
      }
    }
  })
}

// ═════════════════════════════════════════════════════════════
// LAYER 3: SEMANTIC — ARIA & Accessibility
// ═════════════════════════════════════════════════════════════
async function extractSemantic(page) {
  let snapshot = null
  try { snapshot = await page.accessibility.snapshot() } catch { /* some pages block */ }

  const domData = await page.evaluate(() => {
    // Heading hierarchy
    const headings = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')]
    const levels = headings.map(h => parseInt(h.tagName[1]))
    const h1Count = levels.filter(l => l === 1).length
    let hasSkips = false
    for (let i = 1; i < levels.length; i++) {
      if (levels[i] > levels[i - 1] + 1) { hasSkips = true; break }
    }
    const headingHierarchy = levels.length === 0 ? 'missing-h1'
      : h1Count === 0 ? 'missing-h1'
      : hasSkips ? 'has-skips'
      : 'correct'

    // Landmarks
    const landmarks = []
    if (document.querySelector('nav, [role="navigation"]')) landmarks.push('navigation')
    if (document.querySelector('main, [role="main"]')) landmarks.push('main')
    if (document.querySelector('footer, [role="contentinfo"]')) landmarks.push('contentinfo')
    if (document.querySelector('header, [role="banner"]')) landmarks.push('banner')
    if (document.querySelector('[role="search"]')) landmarks.push('search')

    // Interactive elements with accessible names
    const interactive = [...document.querySelectorAll('a, button, input, select, textarea, [role="button"], [role="link"]')]
    let namedCount = 0
    for (const el of interactive) {
      const name = el.getAttribute('aria-label') || el.getAttribute('aria-labelledby') ||
        el.getAttribute('title') || el.textContent?.trim()
      if (name && name.length > 0) namedCount++
    }
    const interactiveNamed = interactive.length > 0
      ? Math.round(namedCount / interactive.length * 100)
      : 100

    // Skip link
    const firstFocusable = document.querySelector('a, button, input, [tabindex]')
    const hasSkipLink = firstFocusable && firstFocusable.getAttribute('href')?.includes('#main')

    // Issues
    const issues = []
    if (headingHierarchy !== 'correct') issues.push(`heading-hierarchy: ${headingHierarchy}`)
    if (!landmarks.includes('main')) issues.push('missing-main-landmark')
    if (!landmarks.includes('navigation')) issues.push('missing-nav-landmark')
    if (interactiveNamed < 80) issues.push(`low-interactive-naming: ${interactiveNamed}%`)
    if (!hasSkipLink) issues.push('missing-skip-link')

    return { headingHierarchy, landmarks, interactiveNamed, issues, hasSkipLink }
  })

  // Score
  let score = 10
  if (domData.headingHierarchy !== 'correct') score -= 2
  if (!domData.landmarks.includes('main')) score -= 1.5
  if (!domData.landmarks.includes('navigation')) score -= 1
  if (domData.interactiveNamed < 80) score -= 2
  if (!domData.hasSkipLink) score -= 0.5
  if (domData.issues.length > 3) score -= 1

  // Parse ARIA tree for depth (if available)
  let ariaTreeDepth = 0
  if (snapshot) {
    const walk = (node, depth) => {
      ariaTreeDepth = Math.max(ariaTreeDepth, depth)
      for (const child of node.children || []) walk(child, depth + 1)
    }
    walk(snapshot, 0)
  }

  return {
    score: parseFloat(Math.max(0, Math.min(10, score)).toFixed(1)),
    headingHierarchy: domData.headingHierarchy,
    landmarks: domData.landmarks,
    interactiveNamed: domData.interactiveNamed,
    issues: domData.issues,
  }
}

// ═════════════════════════════════════════════════════════════
// LAYER 4: ANTI-TEMPLATE — Template Detection
// ═════════════════════════════════════════════════════════════
async function detectAntiTemplate(page, sections) {
  return page.evaluate((sectionData) => {
    // Build fingerprint per section
    const fingerprints = []

    for (const sec of sectionData) {
      // Find element at section's scroll position
      const els = document.elementsFromPoint(window.innerWidth / 2, 100) || []
      let container = null
      for (const el of els) {
        if (['SECTION', 'HEADER', 'FOOTER', 'ARTICLE', 'DIV'].includes(el.tagName)) {
          container = el; break
        }
      }
      if (!container) {
        fingerprints.push({ layout: 'unknown', align: 'unknown', pt: 0, pb: 0, children: 0, hasImage: false, hasCardGrid: false })
        continue
      }

      const s = getComputedStyle(container)
      const children = [...container.children]
      const hasImage = container.querySelector('img, video, canvas, svg[width]') !== null
      const hasCardGrid = children.length >= 3 && children.every(c => {
        const cs = getComputedStyle(c)
        return Math.abs(c.getBoundingClientRect().width - children[0].getBoundingClientRect().width) < 20
      })

      // Heading alignment
      const heading = container.querySelector('h1,h2,h3')
      const headAlign = heading ? getComputedStyle(heading).textAlign : 'unknown'

      fingerprints.push({
        layout: s.display === 'grid' ? s.gridTemplateColumns : s.display === 'flex' ? s.flexDirection : 'block',
        align: headAlign,
        pt: Math.round(parseFloat(s.paddingTop) || 0),
        pb: Math.round(parseFloat(s.paddingBottom) || 0),
        children: children.length,
        hasImage,
        hasCardGrid,
      })
    }

    // Layout variety: unique fingerprint keys / total
    const fpKeys = fingerprints.map(f => `${f.layout}|${f.align}|${f.children > 3 ? 'multi' : 'few'}|${f.hasImage}`)
    const uniqueFP = new Set(fpKeys)
    const layoutVariety = fingerprints.length > 0
      ? parseFloat((uniqueFP.size / fingerprints.length).toFixed(2))
      : 0

    // Specific checks
    const allText = [...document.querySelectorAll('h1,h2,h3,p')]
    const centeredCount = allText.filter(el => getComputedStyle(el).textAlign === 'center').length
    const centeredEverything = allText.length > 0 && centeredCount / allText.length > 0.8

    const paddings = fingerprints.map(f => f.pt).filter(v => v > 0)
    const avgPad = paddings.length ? paddings.reduce((a, b) => a + b, 0) / paddings.length : 0
    const uniformPadding = paddings.length > 1 &&
      paddings.every(p => Math.abs(p - avgPad) / Math.max(1, avgPad) < 0.1)

    // Stock hero: first section with only centered text + button, no visual element
    const firstSection = document.querySelector('section, [class*="hero"]')
    let stockHero = false
    if (firstSection) {
      const hasVisual = firstSection.querySelector('img, video, canvas, svg[width]')
      const hasClip = getComputedStyle(firstSection).clipPath !== 'none'
      const hasBgImage = getComputedStyle(firstSection).backgroundImage !== 'none'
      if (!hasVisual && !hasClip && !hasBgImage) {
        const heading = firstSection.querySelector('h1')
        if (heading && getComputedStyle(heading).textAlign === 'center') stockHero = true
      }
    }

    // Missing surprise: no overlap, no rotation, no clip-path, no negative margin in any section
    let hasSurprise = false
    for (const el of [...document.querySelectorAll('section, main > div')].slice(0, 15)) {
      const children = [...el.querySelectorAll('*')].slice(0, 30)
      for (const c of children) {
        const cs = getComputedStyle(c)
        if (cs.position === 'absolute' || cs.position === 'fixed') { hasSurprise = true; break }
        if (cs.clipPath && cs.clipPath !== 'none') { hasSurprise = true; break }
        if (cs.transform && cs.transform !== 'none' && !cs.transform.includes('matrix(1, 0, 0, 1')) { hasSurprise = true; break }
        if (parseFloat(cs.marginTop) < -5) { hasSurprise = true; break }
      }
      if (hasSurprise) break
    }

    const findings = []
    if (centeredEverything) findings.push('centered-everything')
    if (uniformPadding) findings.push('uniform-padding')
    if (stockHero) findings.push('stock-hero')
    if (!hasSurprise) findings.push('missing-surprise')
    if (layoutVariety < 0.4) findings.push('low-layout-variety')

    const isTemplate = findings.length >= 3

    // Score: 10 = highly unique, 0 = total template
    let score = 10
    if (centeredEverything) score -= 2
    if (uniformPadding) score -= 2
    if (stockHero) score -= 1.5
    if (!hasSurprise) score -= 2
    if (layoutVariety < 0.4) score -= 1.5
    if (layoutVariety < 0.2) score -= 1

    // Signatures: unique elements per section
    const signatures = []
    for (let i = 0; i < Math.min(sectionData.length, 10); i++) {
      const fp = fingerprints[i]
      if (!fp) continue
      const unique = []
      if (fp.hasImage) unique.push('has-visual')
      if (fp.hasCardGrid) unique.push('card-grid')
      if (fp.layout.includes('grid')) unique.push('css-grid')
      signatures.push({ section: i, features: unique })
    }

    return {
      score: parseFloat(Math.max(0, Math.min(10, score)).toFixed(1)),
      isTemplate,
      layoutVariety,
      signatures,
      findings,
    }
  }, sections)
}

// ═════════════════════════════════════════════════════════════
// LAYER 5: STRUCTURAL — Depth metrics (ported from V1)
// ═════════════════════════════════════════════════════════════
async function extractStructural(page) {
  return page.evaluate(() => {
    const allEls = [...document.querySelectorAll('*')]
    const zIndexSet = new Set()
    let clipPathCount = 0
    let backdropFilterCount = 0
    let shadowCount = 0
    let overlapElements = 0
    let shadowVariety = new Set()

    for (const el of allEls) {
      const s = getComputedStyle(el)
      const z = parseInt(s.zIndex)
      if (!isNaN(z) && s.position !== 'static') zIndexSet.add(z)
      if (s.clipPath && s.clipPath !== 'none') clipPathCount++
      if (s.backdropFilter && s.backdropFilter !== 'none') backdropFilterCount++
      if (s.boxShadow && s.boxShadow !== 'none') { shadowCount++; shadowVariety.add(s.boxShadow) }
      if (s.filter && s.filter.includes('drop-shadow')) { shadowCount++; shadowVariety.add(s.filter) }
      if (s.position === 'absolute' || s.position === 'fixed') overlapElements++
    }

    // Pseudo-elements
    let hasPseudoElements = false
    try {
      for (const sheet of document.styleSheets) {
        try {
          for (const rule of sheet.cssRules) {
            if (rule.selectorText &&
                (rule.selectorText.includes('::before') || rule.selectorText.includes('::after'))) {
              const rs = rule.style
              if (rs.content || rs.position || rs.background || rs.backgroundImage) {
                hasPseudoElements = true; break
              }
            }
          }
        } catch {}
        if (hasPseudoElements) break
      }
    } catch {}

    // Grain detection
    let hasGrain = false
    const grainEl = document.querySelector('[class*="grain"], [class*="noise"], [id*="grain"], [id*="noise"]')
    if (grainEl) hasGrain = true
    if (!hasGrain) {
      try {
        for (const sheet of document.styleSheets) {
          try {
            for (const rule of sheet.cssRules) {
              const text = rule.cssText || ''
              if ((text.includes('noise') || text.includes('grain')) && text.includes('url(')) {
                hasGrain = true; break
              }
            }
          } catch {}
          if (hasGrain) break
        }
      } catch {}
    }
    if (!hasGrain) {
      for (const el of allEls.slice(0, 200)) {
        const bg = getComputedStyle(el).backgroundImage || ''
        if (bg.includes('noise') || bg.includes('grain')) { hasGrain = true; break }
      }
    }

    // Canvas layers
    let canvasLayerCount = 0
    document.querySelectorAll('canvas').forEach(c => {
      const rect = c.getBoundingClientRect()
      if (rect.width > 50 && rect.height > 50) canvasLayerCount++
    })
    if (canvasLayerCount > 0) {
      for (let i = 0; i < canvasLayerCount; i++) zIndexSet.add(1000 + i)
    }

    return {
      zIndexLayers: [...zIndexSet].sort((a, b) => a - b),
      zIndexCount: zIndexSet.size,
      clipPathCount: Math.min(clipPathCount, 50),
      backdropFilterCount,
      shadowCount: Math.min(shadowCount, 100),
      shadowVariety: shadowVariety.size,
      overlapElements: Math.min(overlapElements, 50),
      hasPseudoElements,
      hasGrain,
      canvasLayerCount,
    }
  })
}

// ═════════════════════════════════════════════════════════════
// LAYER 6: MOTION — CSS transitions, GSAP, ScrollTrigger
// ═════════════════════════════════════════════════════════════
async function extractMotion(page, networkLibs) {
  // Pre-warm: snapshot GSAP before scroll kills once:true triggers
  const gsapPreWarm = await page.evaluate(() => {
    const triggers = window.ScrollTrigger?.getAll?.() || []
    return {
      gsapActive: !!(window.gsap || window.GreenSockGlobals),
      scrollTriggerActive: !!window.ScrollTrigger,
      scrollTriggerCount: triggers.length,
      scrollTriggerScrubCount: triggers.filter(t => t.scrub).length,
      tweenCount: window.gsap?.globalTimeline?.getChildren?.(true, true, true)?.length || 0,
    }
  })

  // Scroll warm-up to trigger animations (use scroll container if detected)
  await page.evaluate(async () => {
    // Find the scroll container (Lenis wrapper or body)
    const container = document.querySelector('[data-eros-scroll]')
    const scrollEl = container || document.documentElement
    const totalH = container ? container.scrollHeight : Math.max(document.body.scrollHeight, document.documentElement.scrollHeight)

    if (totalH <= window.innerHeight * 1.2) return // single viewport, skip

    const steps = Math.min(25, Math.ceil(totalH / 300))
    const stepPx = Math.ceil(totalH / steps)
    for (let i = 0; i <= steps; i++) {
      if (container) {
        container.scrollTop = i * stepPx
      } else {
        window.scrollTo({ top: i * stepPx, behavior: 'instant' })
      }
      await new Promise(r => setTimeout(r, 120))
    }
    await new Promise(r => setTimeout(r, 600))

    // Return to top
    if (container) container.scrollTop = 0
    else window.scrollTo({ top: 0, behavior: 'instant' })
    await new Promise(r => setTimeout(r, 300))

    if (window.ScrollTrigger?.refresh) {
      window.ScrollTrigger.refresh()
      await new Promise(r => setTimeout(r, 400))
    }
  })

  // Post-warm GSAP snapshot — catches once:true triggers that were registered
  // during onMounted and triggered during the scroll warm-up
  const postWarmGSAP = await page.evaluate(() => {
    return {
      gsapActive: !!(window.gsap || window.GreenSockGlobals),
      scrollTriggerActive: !!window.ScrollTrigger,
      scrollTriggerCount: window.ScrollTrigger?.getAll?.()?.length || 0,
      scrollTriggerScrubCount: (window.ScrollTrigger?.getAll?.() || []).filter(t => t.scrub).length,
      tweenCount: window.gsap?.globalTimeline?.getChildren?.(true, true, true)?.length || 0,
      // Count killed triggers (once:true that already fired)
      totalEverRegistered: window.ScrollTrigger?.getAll?.()?.length || 0,
    }
  })
  // Merge: take MAX between pre-warm (registered before scroll) and post-warm (may have new ones)
  gsapPreWarm.gsapActive = gsapPreWarm.gsapActive || postWarmGSAP.gsapActive
  gsapPreWarm.scrollTriggerActive = gsapPreWarm.scrollTriggerActive || postWarmGSAP.scrollTriggerActive
  gsapPreWarm.scrollTriggerCount = Math.max(gsapPreWarm.scrollTriggerCount, postWarmGSAP.scrollTriggerCount)
  gsapPreWarm.scrollTriggerScrubCount = Math.max(gsapPreWarm.scrollTriggerScrubCount, postWarmGSAP.scrollTriggerScrubCount)
  gsapPreWarm.tweenCount = Math.max(gsapPreWarm.tweenCount, postWarmGSAP.tweenCount)

  // CSS data
  const css = await page.evaluate(() => {
    const allEls = [...document.querySelectorAll('*')].slice(0, 300)
    const cubicBeziers = new Set()
    const durations = []
    let transitionCount = 0, animationCount = 0, staggerDelayCount = 0

    for (const el of allEls) {
      const s = getComputedStyle(el)
      const td = parseFloat(s.transitionDuration)
      if (td > 0) {
        transitionCount++
        durations.push(td)
        const tf = s.transitionTimingFunction
        if (tf && tf.includes('cubic-bezier')) cubicBeziers.add(tf)
      }
      const ad = parseFloat(s.animationDuration)
      if (ad > 0) {
        animationCount++
        const at = s.animationTimingFunction
        if (at && at.includes('cubic-bezier')) cubicBeziers.add(at)
        if (parseFloat(s.animationDelay) > 0) staggerDelayCount++
      }
    }

    const root = getComputedStyle(document.documentElement)
    const easeProp = root.getPropertyValue('--ease-out') || root.getPropertyValue('--ease') || ''
    if (easeProp.includes('cubic-bezier')) cubicBeziers.add(easeProp.trim())

    const runtimeAnimations = document.getAnimations?.()?.length || 0

    // Count elements with scroll-reveal attributes (evidence of motion intent even if triggers fired)
    const revealElements = document.querySelectorAll('[data-reveal], [data-scroll], [data-aos], [data-gsap], [data-animate]').length
    // Count elements with GSAP-set inline styles (visibility, opacity transforms)
    const gsapStyledElements = [...document.querySelectorAll('*')].slice(0, 500).filter(el => {
      const s = el.style
      return s.visibility === 'inherit' || s.opacity === '1' || (s.transform && s.transform !== 'none')
    }).length

    return {
      transitionCount, animationCount, staggerDelayCount, runtimeAnimations,
      revealElements, gsapStyledElements,
      cubicBeziers: [...cubicBeziers].slice(0, 10),
      cubicBezierCount: cubicBeziers.size,
      avgDuration: durations.length
        ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length * 100) / 100 : 0,
    }
  })

  // Live GSAP + merge with pre-warm
  const liveGSAP = await page.evaluate(() => {
    const triggers = window.ScrollTrigger?.getAll?.() || []
    return {
      gsapActive: !!(window.gsap || window.GreenSockGlobals),
      scrollTriggerActive: !!window.ScrollTrigger,
      scrollTriggerCount: triggers.length,
      scrollTriggerScrubCount: triggers.filter(t => t.scrub).length,
      tweenCount: window.gsap?.globalTimeline?.getChildren?.(true, true, true)?.length || 0,
    }
  })

  const gsapActive = gsapPreWarm.gsapActive || liveGSAP.gsapActive || networkLibs.has('GSAP')
  const stActive = gsapPreWarm.scrollTriggerActive || liveGSAP.scrollTriggerActive || networkLibs.has('ScrollTrigger')
  const stCount = Math.max(gsapPreWarm.scrollTriggerCount, liveGSAP.scrollTriggerCount)
  const stScrub = Math.max(gsapPreWarm.scrollTriggerScrubCount, liveGSAP.scrollTriggerScrubCount)
  const tweenCount = Math.max(gsapPreWarm.tweenCount, liveGSAP.tweenCount)

  // Wheel state detection
  const wheelStates = await page.evaluate(async () => {
    const totalH = document.body.scrollHeight
    const vh = window.innerHeight
    const isWheelDriven = totalH <= vh * 1.3
    if (!isWheelDriven) return { isWheelDriven: false, statesCaptured: 0 }

    const maxStates = 8
    const stateHashes = new Set()
    let statesCaptured = 0

    const hashState = () => {
      return [...document.querySelectorAll('*')].slice(0, 80).map(el => {
        const r = el.getBoundingClientRect()
        return `${Math.round(r.left)},${Math.round(r.top)},${Math.round(r.width)}`
      }).join('|')
    }

    stateHashes.add(hashState())
    for (let i = 0; i < maxStates; i++) {
      window.dispatchEvent(new WheelEvent('wheel', { deltaY: 120, bubbles: true, cancelable: true }))
      document.dispatchEvent(new WheelEvent('wheel', { deltaY: 120, bubbles: true, cancelable: true }))
      await new Promise(r => setTimeout(r, 1200))
      const hash = hashState()
      if (!stateHashes.has(hash)) { stateHashes.add(hash); statesCaptured++ }
    }
    return { isWheelDriven: true, statesCaptured }
  })

  return {
    cssTransitions: {
      count: css.transitionCount,
      cubicBeziers: css.cubicBeziers,
      cubicBezierCount: css.cubicBezierCount,
      avgDuration: css.avgDuration,
    },
    cssAnimations: {
      count: css.animationCount,
      hasStagger: css.staggerDelayCount > 2,
      runtimeAnimations: css.runtimeAnimations,
      revealElements: css.revealElements || 0,
      gsapStyledElements: css.gsapStyledElements || 0,
    },
    gsap: {
      active: gsapActive,
      tweenCount,
      scrollTrigger: stActive,
      scrollTriggerCount: stCount,
      scrollTriggerScrub: stScrub > 0,
      scrollTriggerScrubCount: stScrub,
    },
    wheelStates,
  }
}

// ═════════════════════════════════════════════════════════════
// SECTION DETECTION (ported from V1)
// ═════════════════════════════════════════════════════════════
async function detectSections(page) {
  return page.evaluate(() => {
    const candidates = [
      ...document.querySelectorAll('section'),
      ...document.querySelectorAll('header'),
      ...document.querySelectorAll('footer'),
      ...document.querySelectorAll('[data-section]'),
      ...document.querySelectorAll('[class*="section"]'),
      ...document.querySelectorAll('[class*="Section"]'),
      ...document.querySelectorAll('main > div'),
      ...document.querySelectorAll('article'),
    ]

    const seen = new Set()
    const sections = []

    for (const el of candidates) {
      if (seen.has(el)) continue
      seen.add(el)
      const rect = el.getBoundingClientRect()
      const isSemantic = ['SECTION', 'HEADER', 'FOOTER'].includes(el.tagName) || el.hasAttribute('data-section')
      const minH = isSemantic ? 100 : 200
      if (rect.height > minH && rect.width > window.innerWidth * 0.5) {
        const hasContent = el.querySelector('h1,h2,h3,p,img,video,canvas,svg') !== null
        if (hasContent || isSemantic) {
          sections.push({
            tag: el.tagName.toLowerCase(),
            className: (el.className?.toString?.() || '').split(' ').slice(0, 3).join(' '),
            id: el.id || '',
            top: rect.top + window.scrollY,
            height: rect.height,
          })
        }
      }
    }

    sections.sort((a, b) => a.top - b.top)

    const deduped = []
    for (const sec of sections) {
      const last = deduped[deduped.length - 1]
      if (last && Math.abs(sec.top - last.top) < 50) continue
      deduped.push(sec)
    }

    if (deduped.length < 3) {
      const totalHeight = document.body.scrollHeight
      const vh = window.innerHeight
      const fallback = []
      for (let y = 0; y < totalHeight; y += vh) {
        fallback.push({ tag: 'viewport-chunk', className: '', id: '', top: y, height: Math.min(vh, totalHeight - y) })
      }
      return fallback
    }
    return deduped
  })
}

// ═════════════════════════════════════════════════════════════
// SCREENSHOT CAPTURE
// ═════════════════════════════════════════════════════════════
async function captureScreenshots(page, sections, outDir, label) {
  const vp = label === 'desktop' ? VP_DESKTOP : VP_MOBILE
  const frames = []

  // Find the real scroll container and disable smooth scroll
  const scrollContainerSelector = await page.evaluate(() => {
    // Kill Lenis instance
    if (window.lenis) { try { window.lenis.destroy() } catch {} }
    if (window.locomotiveScroll) { try { window.locomotiveScroll.destroy() } catch {} }

    // Find scroll container: a div with scrollHeight > viewport that scrolls
    const candidates = [...document.querySelectorAll('div, main')]
    const container = candidates.find(el => {
      const s = getComputedStyle(el)
      return el.scrollHeight > window.innerHeight * 1.5 &&
        el.offsetHeight <= window.innerHeight * 1.2 &&
        (s.overflow === 'auto' || s.overflow === 'hidden auto' || s.overflowY === 'auto' || s.overflowY === 'scroll')
    })

    if (container) {
      // Mark it for later
      container.setAttribute('data-eros-scroll', 'true')
      container.style.scrollBehavior = 'auto'

      // Reset html/body to allow the container to be the scroller
      document.documentElement.style.scrollBehavior = 'auto'
      document.body.style.scrollBehavior = 'auto'

      return '[data-eros-scroll]'
    }

    // No special container — use native scroll
    document.documentElement.style.scrollBehavior = 'auto'
    document.body.style.scrollBehavior = 'auto'
    document.documentElement.style.overflow = 'auto'
    document.body.style.overflow = 'auto'
    if (getComputedStyle(document.documentElement).position === 'fixed') document.documentElement.style.position = 'static'
    if (getComputedStyle(document.body).position === 'fixed') document.body.style.position = 'static'
    document.body.style.height = 'auto'
    document.documentElement.style.height = 'auto'

    return null
  })
  await delay(300)

  for (let i = 0; i < sections.length; i++) {
    const sec = sections[i]
    const scrollTarget = Math.max(0, sec.top - 40)

    // Scroll — use the detected container or window
    await page.evaluate(({ y, sel }) => {
      if (sel) {
        const container = document.querySelector(sel)
        if (container) { container.scrollTop = y; return }
      }
      window.scrollTo(0, y)
      document.documentElement.scrollTop = y
      document.body.scrollTop = y
    }, { y: scrollTarget, sel: scrollContainerSelector })
    await delay(500)

    const filename = `frame-${String(i).padStart(3, '0')}.png`
    await page.screenshot({ path: join(outDir, filename), type: 'png', clip: { x: 0, y: 0, width: vp.width, height: vp.height } })

    frames.push({
      file: `${label}/${filename}`,
      tag: sec.tag, className: sec.className, id: sec.id,
      scrollY: sec.top, height: sec.height,
    })
    console.log(`[eros] ${label} frame ${i + 1}/${sections.length} -- ${sec.tag}${sec.className ? '.' + sec.className.split(' ')[0] : ''} at ${Math.round(sec.top)}px`)
  }
  return frames
}

// ═════════════════════════════════════════════════════════════
// SCORING ENGINE
// ═════════════════════════════════════════════════════════════
function computeScores(layers) {
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v))
  const signal = v => v >= 8 ? 'STRONG' : v >= 5 ? 'MEDIUM' : 'WEAK'

  const composition =
    layers.geometry.visualBalance.score * 0.3 +
    layers.antiTemplate.score * 0.3 +
    (layers.aesthetics.whitespace.globalRatio >= 0.35 && layers.aesthetics.whitespace.globalRatio <= 0.65 ? 8 : 5) * 0.2 +
    clamp(layers.geometry.overlap.intentional * 2.5, 0, 10) * 0.2

  const depth =
    clamp(layers.structural.zIndexCount / 4 * 10, 0, 10) * 0.25 +
    clamp(layers.structural.canvasLayerCount * 3, 0, 10) * 0.15 +
    (layers.structural.hasPseudoElements ? 8 : 0) * 0.1 +
    clamp(layers.structural.backdropFilterCount * 4, 0, 10) * 0.15 +
    clamp(layers.geometry.overlap.intentional * 2.5, 0, 10) * 0.2 +
    (layers.structural.hasGrain ? 8 : 0) * 0.05 +
    clamp(layers.structural.clipPathCount * 3, 0, 10) * 0.1

  const typography = layers.aesthetics.typography.score

  // Motion: credit reveal elements and GSAP-styled elements as evidence of motion intent
  const revealCredit = clamp((layers.motion.cssAnimations.revealElements || 0) / 5 * 10, 0, 10)
  const gsapStyleCredit = clamp((layers.motion.cssAnimations.gsapStyledElements || 0) / 10 * 10, 0, 10)
  const transitionCredit = clamp(layers.motion.cssTransitions.count / 20 * 10, 0, 10)

  const motion =
    clamp(layers.motion.cssTransitions.cubicBezierCount * 2.5, 0, 10) * 0.15 +
    (layers.motion.gsap.active ? 8 : 0) * 0.15 +
    (layers.motion.gsap.scrollTrigger ? 8 : 0) * 0.1 +
    (layers.motion.gsap.scrollTriggerScrub ? 8 : 0) * 0.1 +
    (layers.motion.cssAnimations.hasStagger ? 8 : 0) * 0.1 +
    clamp(layers.motion.gsap.tweenCount / 5 * 10, 0, 10) * 0.05 +
    (layers.motion.wheelStates?.statesCaptured >= 2 ? 8 : 0) * 0.05 +
    revealCredit * 0.1 +
    gsapStyleCredit * 0.1 +
    transitionCredit * 0.1

  const craft =
    layers.aesthetics.colorHarmony.score * 0.3 +
    layers.semantic.score * 0.2 +
    layers.antiTemplate.score * 0.2 +
    clamp(layers.aesthetics.typography.levels * 1.5, 0, 10) * 0.15 +
    (layers.structural.clipPathCount > 0 ? 7 : 0) * 0.15

  return {
    composition: parseFloat(composition.toFixed(1)),
    depth: parseFloat(depth.toFixed(1)),
    typography: parseFloat(typography.toFixed(1)),
    motion: parseFloat(motion.toFixed(1)),
    craft: parseFloat(craft.toFixed(1)),
    signals: {
      composition: signal(composition),
      depth: signal(depth),
      typography: signal(typography),
      motion: signal(motion),
      craft: signal(craft),
    }
  }
}

// ═════════════════════════════════════════════════════════════
// QUALITY GATES
// ═════════════════════════════════════════════════════════════
async function runQualityGates(page) {
  // Gate 1: Contrast (WCAG AA)
  const contrast = await page.evaluate(() => {
    function toLinear(c) { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4) }
    function luminance(r, g, b) { return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b) }
    function contrastRatio(L1, L2) { return Math.round((Math.max(L1,L2) + 0.05) / (Math.min(L1,L2) + 0.05) * 100) / 100 }
    function parseRGB(str) { const m = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/); return m ? [+m[1],+m[2],+m[3]] : null }
    function isTransparent(s) { return !s || s === 'transparent' || s === 'rgba(0, 0, 0, 0)' || s.includes(', 0)') }
    function effectiveBg(el) {
      let cur = el
      while (cur && cur !== document.documentElement) {
        const bg = getComputedStyle(cur).backgroundColor
        if (!isTransparent(bg)) return bg
        cur = cur.parentElement
      }
      return 'rgb(255, 255, 255)'
    }

    const targets = [...document.querySelectorAll('h1,h2,h3,p,a,button,li,label')]
    const pairs = [], seen = new Set()
    for (const el of targets.slice(0, 80)) {
      const s = getComputedStyle(el)
      const fg = s.color, bg = effectiveBg(el)
      const fgRGB = parseRGB(fg), bgRGB = parseRGB(bg)
      if (!fgRGB || !bgRGB) continue
      const key = `${fg}|${bg}`
      if (seen.has(key)) continue
      seen.add(key)
      const ratio = contrastRatio(luminance(...fgRGB), luminance(...bgRGB))
      const size = parseFloat(s.fontSize), weight = parseInt(s.fontWeight)
      const large = size >= 18 || (size >= 14 && weight >= 700)
      pairs.push({ tag: el.tagName.toLowerCase(), fg, bg, ratio, large, wcagAA: ratio >= (large ? 3 : 4.5) })
    }
    const total = pairs.length
    const failAA = pairs.filter(p => !p.wcagAA)
    const passRate = total ? Math.round((total - failAA.length) / total * 100) : 100
    return {
      signal: passRate >= 95 ? 'PASS' : passRate >= 80 ? 'WARN' : 'FAIL',
      passRate, failingAA: failAA.length, passingAA: total - failAA.length, totalPairs: total,
      minRatio: total ? Math.min(...pairs.map(p => p.ratio)) : 0,
      avgRatio: total ? Math.round(pairs.reduce((s,p) => s + p.ratio, 0) / total * 10) / 10 : 0,
      failingSamples: failAA.slice(0, 10).map(p => ({ tag: p.tag, fg: p.fg, bg: p.bg, ratio: p.ratio, large: p.large })),
    }
  })

  // Gate 2: Animation anti-patterns
  const animations = await page.evaluate(() => {
    const FORBIDDEN = ['width', 'height', 'top', 'left', 'right', 'bottom', 'margin', 'padding']
    const found = []
    for (const el of [...document.querySelectorAll('*')].slice(0, 600)) {
      const s = getComputedStyle(el)
      const label = el.tagName.toLowerCase() + (el.id ? `#${el.id}` : '') + (el.className ? `.${(el.className.toString()).split(' ')[0]}` : '')

      // Forbidden transitions
      const tp = s.transitionProperty
      if (tp && tp !== 'none') {
        for (const prop of tp.split(',').map(p => p.trim().toLowerCase())) {
          if (FORBIDDEN.some(f => prop === f || prop.startsWith(f + '-'))) {
            found.push({ type: 'forbidden-transition', element: label.slice(0, 80), property: prop, severity: 'HIGH' })
          }
        }
      }

      // Preventive will-change
      const wc = s.willChange
      if (wc && wc !== 'auto' && !(parseFloat(s.transitionDuration) > 0) && !(parseFloat(s.animationDuration) > 0)) {
        found.push({ type: 'preventive-will-change', element: label.slice(0, 80), value: wc, severity: 'MEDIUM' })
      }

      // Infinite loops (with exemptions)
      if (s.animationIterationCount === 'infinite' && s.animationName && s.animationName !== 'none') {
        const cls = (el.className || '').toString().toLowerCase()
        const name = s.animationName
        const isLoader = /\b(spinner|loading|loader|progress|skeleton|pulse)\b/.test(cls)
        const isGrain = (/\b(grain|noise)\b/.test(cls) || /\b(grain|noise)\b/.test(name)) && (s.animationTimingFunction || '').includes('steps')
        const isHidden = el.getAttribute('aria-hidden') === 'true' || el.closest('[aria-hidden="true"]') !== null
        const isFunctional = /\b(marquee|cursor|blink|scroll|track|ticker|dot|status|indicator)\b/.test(cls) || /\b(marquee|cursor|blink|scroll|track|ticker)\b/.test(name)
        if (!isLoader && !isGrain && !isHidden && !isFunctional) {
          found.push({ type: 'infinite-loop', element: label.slice(0, 80), animationName: name, severity: 'MEDIUM' })
        }
      }
    }

    const seen = new Set()
    const unique = found.filter(p => {
      const key = p.type + ':' + (p.property || p.value || p.animationName || '')
      if (seen.has(key)) return false
      seen.add(key); return true
    }).slice(0, 20)

    return { clean: unique.length === 0, total: unique.length, high: unique.filter(p => p.severity === 'HIGH').length, medium: unique.filter(p => p.severity === 'MEDIUM').length, patterns: unique }
  })

  // Gate 3: Images
  const images = await page.evaluate(() => {
    const imgs = [...document.querySelectorAll('img')]
    const results = []
    for (const img of imgs) {
      const src = (img.currentSrc || img.src || '').split('?')[0]
      const ext = src.split('.').pop()?.toLowerCase()
      const hasAlt = img.hasAttribute('alt')
      const hasDims = img.hasAttribute('width') && img.hasAttribute('height')
      const hasLazy = img.loading === 'lazy'
      const inHero = !!img.closest('[class*="hero"], [class*="banner"], header')
      const issues = []
      if (!hasAlt) issues.push('missing-alt')
      if (!hasDims) issues.push('missing-dimensions')
      if (!hasLazy && !inHero) issues.push('missing-lazy')
      results.push({ name: src.split('/').pop()?.slice(0, 60) || '?', issues })
    }
    const total = results.length
    if (!total) return { total: 0, signal: 'PASS', avgScore: 100, issues: [] }
    const avgScore = Math.round(results.reduce((s, r) => s + Math.round((1 - r.issues.length / 4) * 100), 0) / total)
    return {
      total, signal: avgScore >= 85 ? 'PASS' : avgScore >= 60 ? 'WARN' : 'FAIL', avgScore,
      issues: results.filter(r => r.issues.length > 0).slice(0, 15),
    }
  })

  // Gate 4: Headings
  const headings = await page.evaluate(() => {
    const hs = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')]
    const structure = hs.map(h => ({ level: parseInt(h.tagName[1]), text: h.textContent?.trim().slice(0, 80) || '' }))
    const h1Count = structure.filter(h => h.level === 1).length
    const skips = []
    for (let i = 1; i < structure.length; i++) {
      if (structure[i].level > structure[i - 1].level + 1) {
        skips.push({ from: `H${structure[i-1].level}`, to: `H${structure[i].level}`, text: structure[i].text })
      }
    }
    const issues = []
    if (!structure.length) issues.push('no-headings')
    if (h1Count === 0) issues.push('missing-h1')
    if (h1Count > 1) issues.push(`multiple-h1:${h1Count}`)
    if (skips.length) issues.push(`skipped-levels:${skips.length}`)
    return {
      signal: issues.length === 0 ? 'PASS' : issues.includes('missing-h1') ? 'FAIL' : 'WARN',
      h1Count, totalHeadings: structure.length, skippedLevels: skips, issues, structure: structure.slice(0, 20),
    }
  })

  // Gate 5: Meta tags
  const meta = await page.evaluate(() => {
    const get = s => document.querySelector(s)?.getAttribute('content') || null
    const attr = (s, a) => document.querySelector(s)?.getAttribute(a) || null
    const og = { title: get('meta[property="og:title"]'), description: get('meta[property="og:description"]'), image: get('meta[property="og:image"]') }
    const twitter = { card: get('meta[name="twitter:card"]') }
    const hasOG = !!og.title, hasOGImage = !!og.image, hasTwitter = !!twitter.card
    const hasDesc = !!get('meta[name="description"]'), hasCanon = !!attr('link[rel="canonical"]', 'href')
    const score = [hasOG, hasOGImage, hasTwitter, hasDesc, hasCanon].filter(Boolean).length
    return {
      title: document.title || null, description: get('meta[name="description"]'),
      og, twitter, signal: score >= 4 ? 'PASS' : score >= 2 ? 'WARN' : 'FAIL',
      score, hasOG, hasOGImage, hasTwitter, hasDesc, hasCanonical: hasCanon,
    }
  })

  const overall = (() => {
    const sigs = [contrast.signal, animations.clean ? 'PASS' : 'FAIL', images.signal, headings.signal, meta.signal]
    return sigs.every(s => s === 'PASS') ? 'PASS' : sigs.includes('FAIL') ? 'FAIL' : 'WARN'
  })()

  return { contrast, animations, images, headings, meta: { signal: meta.signal, score: meta.score }, metaTags: meta, overall }
}

// ═════════════════════════════════════════════════════════════
// ANALYSIS REPORT (analysis.md)
// ═════════════════════════════════════════════════════════════
function generateAnalysisReport(data, outputDir) {
  const { url, layers, scores, qualityGates, screenshots } = data
  const si = { STRONG: '[+]', MEDIUM: '[~]', WEAK: '[-]' }

  const L = [
    `# Eros Observer Report: ${url}`,
    `> Captured: ${new Date().toISOString()} | Eros Observer v2.0`,
    ``,
    `## Excellence Signals`,
    ``,
    `| Dimension | Signal | Score | Evidence |`,
    `|-----------|--------|-------|----------|`,
    `| Composition | ${si[scores.signals.composition]} ${scores.signals.composition} | ${scores.composition}/10 | balance:${layers.geometry.visualBalance.type} overlaps:${layers.geometry.overlap.intentional} surprises:${layers.geometry.surprise.count} template-score:${layers.antiTemplate.score} |`,
    `| Depth | ${si[scores.signals.depth]} ${scores.signals.depth} | ${scores.depth}/10 | z-layers:${layers.structural.zIndexCount} clip-paths:${layers.structural.clipPathCount} backdrop-filters:${layers.structural.backdropFilterCount} pseudo:${layers.structural.hasPseudoElements ? 'yes' : 'no'} grain:${layers.structural.hasGrain ? 'yes' : 'no'} canvas:${layers.structural.canvasLayerCount} |`,
    `| Typography | ${si[scores.signals.typography]} ${scores.signals.typography} | ${scores.typography}/10 | ratio:${layers.aesthetics.typography.sizeRatio}x levels:${layers.aesthetics.typography.levels} weights:${layers.aesthetics.typography.weights.join(',')} spacing:${layers.aesthetics.typography.hasCustomSpacing ? 'yes' : 'no'} scale:${layers.aesthetics.typography.modularScale || 'none'} |`,
    `| Motion | ${si[scores.signals.motion]} ${scores.signals.motion} | ${scores.motion}/10 | css-transitions:${layers.motion.cssTransitions.count} beziers:${layers.motion.cssTransitions.cubicBezierCount} gsap:${layers.motion.gsap.active ? 'yes' : 'no'} triggers:${layers.motion.gsap.scrollTriggerCount} scrub:${layers.motion.gsap.scrollTriggerScrub ? 'yes' : 'no'} tweens:${layers.motion.gsap.tweenCount} |`,
    `| Craft | ${si[scores.signals.craft]} ${scores.signals.craft} | ${scores.craft}/10 | color-harmony:${layers.aesthetics.colorHarmony.type} semantic:${layers.semantic.score}/10 anti-template:${layers.antiTemplate.score}/10 clip-path:${layers.structural.clipPathCount > 0 ? 'yes' : 'no'} |`,
    ``,
  ]

  // Geometry
  L.push(
    `## Geometry (Visual Balance)`,
    `- **Balance type:** ${layers.geometry.visualBalance.type} (score: ${layers.geometry.visualBalance.score})`,
    `- **Center of mass:** x=${layers.geometry.visualBalance.centerOfMass.x} y=${layers.geometry.visualBalance.centerOfMass.y}`,
    `- **Quadrants:** TL=${layers.geometry.visualBalance.quadrants.topLeft} TR=${layers.geometry.visualBalance.quadrants.topRight} BL=${layers.geometry.visualBalance.quadrants.bottomLeft} BR=${layers.geometry.visualBalance.quadrants.bottomRight}`,
    `- **Intentional overlaps:** ${layers.geometry.overlap.intentional}`,
    `- **Spatial surprises:** ${layers.geometry.surprise.count} (${layers.geometry.surprise.types.join(', ') || 'none'})`,
    ``,
  )

  // Aesthetics
  const ae = layers.aesthetics
  L.push(
    `## Aesthetics`,
    `### Color Harmony`,
    `- **Type:** ${ae.colorHarmony.type} (score: ${ae.colorHarmony.score})`,
    `- **Temperature:** ${ae.colorHarmony.temperature}`,
    `- **Saturation range:** ${ae.colorHarmony.saturationRange[0]}-${ae.colorHarmony.saturationRange[1]}`,
    `- **Unique colors:** ${ae.colorHarmony.uniqueColors}`,
    `- **AI fingerprint:** ${ae.colorHarmony.aiFingerprint ? 'DETECTED' : 'clean'}`,
    ``,
    `### Whitespace`,
    `- **Global ratio:** ${ae.whitespace.globalRatio} (${ae.whitespace.verdict})`,
    `- **Rhythm variance:** ${ae.whitespace.rhythm}`,
    ``,
    `### Typography`,
    `- **Score:** ${ae.typography.score}/10`,
    `- **Size ratio:** ${ae.typography.sizeRatio}x (${ae.typography.levels} levels)`,
    `- **Modular scale:** ${ae.typography.modularScale || 'none detected'}`,
    `- **Weights:** ${ae.typography.weights.join(', ')}`,
    `- **Custom letter-spacing:** ${ae.typography.hasCustomSpacing ? 'yes' : 'no'}`,
    `- **Line-height consistency:** ${ae.typography.lineHeightConsistency ? 'yes' : 'no'}`,
    ``,
  )

  // Anti-template
  L.push(
    `## Anti-Template Analysis`,
    `- **Score:** ${layers.antiTemplate.score}/10`,
    `- **Is template:** ${layers.antiTemplate.isTemplate ? 'YES' : 'no'}`,
    `- **Layout variety:** ${layers.antiTemplate.layoutVariety}`,
    `- **Findings:** ${layers.antiTemplate.findings.join(', ') || 'none (good)'}`,
    ``,
  )

  // Semantic
  L.push(
    `## Semantic / Accessibility`,
    `- **Score:** ${layers.semantic.score}/10`,
    `- **Heading hierarchy:** ${layers.semantic.headingHierarchy}`,
    `- **Landmarks:** ${layers.semantic.landmarks.join(', ') || 'none'}`,
    `- **Interactive elements named:** ${layers.semantic.interactiveNamed}%`,
    `- **Issues:** ${layers.semantic.issues.join(', ') || 'none'}`,
    ``,
  )

  // Depth
  L.push(
    `## Depth & Layering`,
    `- **Z-index layers:** ${layers.structural.zIndexCount} [${layers.structural.zIndexLayers.join(', ')}]`,
    `- **Clip-paths:** ${layers.structural.clipPathCount}`,
    `- **Backdrop filters:** ${layers.structural.backdropFilterCount}`,
    `- **Shadows:** ${layers.structural.shadowCount} (${layers.structural.shadowVariety} unique)`,
    `- **Overlap elements:** ${layers.structural.overlapElements}`,
    `- **Pseudo-elements:** ${layers.structural.hasPseudoElements ? 'yes' : 'no'}`,
    `- **Grain/noise:** ${layers.structural.hasGrain ? 'yes' : 'no'}`,
    `- **Canvas layers:** ${layers.structural.canvasLayerCount}`,
    ``,
  )

  // Motion
  const mo = layers.motion
  L.push(
    `## Motion Profile`,
    `- **CSS transitions:** ${mo.cssTransitions.count} (avg ${mo.cssTransitions.avgDuration}s)`,
    `- **Custom beziers:** ${mo.cssTransitions.cubicBezierCount}`,
  )
  if (mo.cssTransitions.cubicBeziers.length) {
    mo.cssTransitions.cubicBeziers.slice(0, 5).forEach(cb => L.push(`  - \`${cb}\``))
  }
  L.push(
    `- **CSS animations:** ${mo.cssAnimations.count} (stagger: ${mo.cssAnimations.hasStagger ? 'yes' : 'no'})`,
    `- **GSAP:** ${mo.gsap.active ? `active (${mo.gsap.tweenCount} tweens)` : 'not detected'}`,
    `- **ScrollTrigger:** ${mo.gsap.scrollTrigger ? `${mo.gsap.scrollTriggerCount} triggers (scrub: ${mo.gsap.scrollTriggerScrubCount})` : 'no'}`,
    `- **Wheel-driven:** ${mo.wheelStates.isWheelDriven ? `yes (${mo.wheelStates.statesCaptured} states)` : 'no'}`,
    ``,
  )

  // Quality gates
  const qg = qualityGates
  L.push(`## Quality Gates`, ``, `| Gate | Signal | Detail |`, `|------|--------|--------|`)
  L.push(`| Contrast | ${qg.contrast.signal} | pass:${qg.contrast.passRate}% failing:${qg.contrast.failingAA}/${qg.contrast.totalPairs} min-ratio:${qg.contrast.minRatio} |`)
  L.push(`| Animations | ${qg.animations.clean ? 'PASS' : 'FAIL'} | ${qg.animations.clean ? 'clean' : `${qg.animations.total} issues (HIGH:${qg.animations.high} MEDIUM:${qg.animations.medium})`} |`)
  L.push(`| Images | ${qg.images.signal} | total:${qg.images.total} score:${qg.images.avgScore}/100 |`)
  L.push(`| Headings | ${qg.headings.signal} | h1:${qg.headings.h1Count} total:${qg.headings.totalHeadings} skips:${qg.headings.skippedLevels?.length || 0} |`)
  L.push(`| Meta/SEO | ${qg.meta.signal} | score:${qg.meta.score}/5 |`)
  L.push(`| **Overall** | **${qg.overall}** | |`)
  L.push(``)

  // Screenshots summary
  L.push(
    `## Screenshots`,
    `- Desktop frames: ${screenshots.desktop}`,
    `- Mobile frames: ${screenshots.mobile}`,
    ``,
  )

  const report = L.join('\n')
  writeFileSync(join(outputDir, 'analysis.md'), report)
  console.log(`[eros] -> analysis.md written`)
  return report
}

// ═════════════════════════════════════════════════════════════
// COOKIE DISMISSAL & PRELOADER
// ═════════════════════════════════════════════════════════════
async function dismissCookieBanner(page) {
  for (const sel of COOKIE_SELECTORS) {
    try {
      const btn = await page.$(sel)
      if (btn) { await btn.click(); console.log('[eros] Dismissed cookie banner'); await delay(500); return }
    } catch {}
  }
}

async function waitForPreloader(page) {
  try {
    await page.evaluate(() => {
      return new Promise(resolve => {
        const pre = document.querySelector('[class*="preload"], [class*="loader"], [class*="loading"], [id*="preload"], [id*="loader"]')
        if (!pre || getComputedStyle(pre).display === 'none') return resolve()
        const obs = new MutationObserver(() => {
          const s = getComputedStyle(pre)
          if (s.display === 'none' || s.opacity === '0' || s.visibility === 'hidden') { obs.disconnect(); resolve() }
        })
        obs.observe(pre, { attributes: true, attributeFilter: ['class', 'style'] })
        setTimeout(() => { obs.disconnect(); resolve() }, 8000)
      })
    })
  } catch {}
}

// ═════════════════════════════════════════════════════════════
// AUTO-DISCOVERY — Internal pages
// ═════════════════════════════════════════════════════════════
async function discoverInternalPages(browser, url, maxPages) {
  const origin = new URL(url).origin
  console.log(`[eros:discover] Scanning nav links at ${url}...`)

  const context = await browser.newContext({ viewport: VP_DESKTOP })
  const page = await context.newPage()
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })
    await delay(2000)
    await dismissCookieBanner(page)

    const links = await page.evaluate((originStr) => {
      const navLinks = [], seen = new Set()
      for (const container of document.querySelectorAll('nav, header, [role="navigation"]')) {
        for (const a of container.querySelectorAll('a[href]')) {
          let href = a.getAttribute('href')
          if (!href) continue
          try { href = new URL(href, originStr).href } catch { continue }
          if (!href.startsWith(originStr)) continue
          if (href === originStr || href === originStr + '/') continue
          if (href.includes('#') && href.split('#')[0] === originStr) continue
          if (/\.(pdf|jpg|png|gif|svg|zip|mp4|webm)$/i.test(href)) continue
          const normalized = href.split('?')[0].split('#')[0].replace(/\/$/, '')
          if (seen.has(normalized)) continue
          seen.add(normalized)
          const text = a.textContent?.trim().substring(0, 40) || ''
          if (!text || text.length < 2) continue
          navLinks.push({ url: normalized, text, pathname: new URL(normalized).pathname })
        }
      }
      return navLinks
    }, origin)

    const sorted = links
      .sort((a, b) => a.pathname.split('/').filter(Boolean).length - b.pathname.split('/').filter(Boolean).length)
      .slice(0, maxPages)

    console.log(`[eros:discover] Found ${links.length} links, using ${sorted.length}`)
    for (const l of sorted) console.log(`[eros:discover]   ${l.pathname} -- "${l.text}"`)

    return sorted
  } finally {
    await context.close()
  }
}

// ═════════════════════════════════════════════════════════════
// MAIN CAPTURE FUNCTION
// ═════════════════════════════════════════════════════════════
async function observePage(browser, url, outputBase, options = {}) {
  const { local = false } = options
  const domain = new URL(url).hostname.replace(/\./g, '-')
  const slug = urlToSlug(url)
  const dirName = domain + slug
  const dir = join(outputBase, dirName)
  const desktopDir = join(dir, 'desktop')
  const mobileDir = join(dir, 'mobile')
  const interactionsDir = join(dir, 'interactions')
  mkdirSync(desktopDir, { recursive: true })
  mkdirSync(mobileDir, { recursive: true })
  mkdirSync(interactionsDir, { recursive: true })

  const pageLabel = slug ? slug.replace('--', '/') : '(home)'
  console.log(`\n[eros] === ${url} [${pageLabel}] ===`)

  const context = await browser.newContext({ viewport: VP_DESKTOP })
  const page = await context.newPage()

  // Network library detection
  const networkLibs = new Set()
  page.on('response', res => {
    const u = res.url().toLowerCase()
    if (u.includes('/gsap') || u.includes('greensock')) networkLibs.add('GSAP')
    if (u.includes('scrolltrigger')) networkLibs.add('ScrollTrigger')
    if (u.includes('splittext')) networkLibs.add('SplitText')
    if (u.includes('/three') || u.includes('three.module')) networkLibs.add('Three.js')
    if (u.includes('/lenis')) networkLibs.add('Lenis')
    if (u.includes('splinetool') || u.includes('/spline')) networkLibs.add('Spline')
  })

  try {
    console.log('[eros] Loading page...')
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })
    await delay(2000)
    if (!local) await dismissCookieBanner(page)
    if (!local) await waitForPreloader(page)

    // ── Kill smooth scroll BEFORE section detection and screenshots ──
    await page.evaluate(() => {
      if (window.lenis) { try { window.lenis.destroy() } catch {} }
      if (window.locomotiveScroll) { try { window.locomotiveScroll.destroy() } catch {} }
      document.documentElement.style.scrollBehavior = 'auto'
      document.body.style.scrollBehavior = 'auto'
      document.documentElement.style.overflow = 'auto'
      document.body.style.overflow = 'auto'
      const htmlS = getComputedStyle(document.documentElement)
      const bodyS = getComputedStyle(document.body)
      if (htmlS.position === 'fixed' || htmlS.position === 'sticky') document.documentElement.style.position = 'static'
      if (bodyS.position === 'fixed' || bodyS.position === 'sticky') document.body.style.position = 'static'
      document.body.style.height = 'auto'
      document.documentElement.style.height = 'auto'
    })
    await delay(500)

    // ── Full-page desktop — expand any fixed containers first ──
    await page.evaluate(() => {
      // If html/body are fixed with 100vh, expand them so fullPage works
      const container = document.querySelector('[data-eros-scroll]')
      if (container) {
        // Move content out of the scroll container into the body flow
        const h = container.scrollHeight
        document.documentElement.style.position = 'static'
        document.documentElement.style.overflow = 'visible'
        document.documentElement.style.height = 'auto'
        document.body.style.position = 'static'
        document.body.style.overflow = 'visible'
        document.body.style.height = h + 'px'
        container.style.overflow = 'visible'
        container.style.height = h + 'px'
        container.style.position = 'static'
      }
    })
    await delay(300)
    await page.screenshot({ path: join(dir, 'full-page-desktop.png'), fullPage: true, type: 'png' })
    console.log('[eros] Full-page desktop captured')

    // ── Detect sections (after smooth scroll killed) ──
    const sections = await detectSections(page)
    console.log(`[eros] Found ${sections.length} sections`)

    // ── Desktop screenshots ──
    console.log('[eros] -- Desktop screenshots --')
    const desktopFrames = await captureScreenshots(page, sections, desktopDir, 'desktop')

    // ── Run 6 analysis layers ──
    console.log('[eros] -- Layer 1: Geometry --')
    const geometry = await extractGeometry(page)

    console.log('[eros] -- Layer 2: Aesthetics --')
    const aesthetics = await extractAesthetics(page)

    console.log('[eros] -- Layer 3: Semantic --')
    const semantic = await extractSemantic(page)

    console.log('[eros] -- Layer 4: Anti-Template --')
    const antiTemplate = await detectAntiTemplate(page, sections)

    console.log('[eros] -- Layer 5: Structural --')
    const structural = await extractStructural(page)

    console.log('[eros] -- Layer 6: Motion --')
    const motion = await extractMotion(page, networkLibs)

    // ── Wheel state screenshots ──
    if (motion.wheelStates.isWheelDriven && motion.wheelStates.statesCaptured > 0) {
      console.log(`[eros] Wheel-driven: ${motion.wheelStates.statesCaptured} states`)
      const wheelDir = join(dir, 'wheel-states')
      mkdirSync(wheelDir, { recursive: true })
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
      await delay(500)
      await page.screenshot({ path: join(wheelDir, 'state-000.png') })
      for (let i = 0; i < Math.min(motion.wheelStates.statesCaptured, 8); i++) {
        await page.evaluate(() => {
          window.dispatchEvent(new WheelEvent('wheel', { deltaY: 120, bubbles: true, cancelable: true }))
          document.dispatchEvent(new WheelEvent('wheel', { deltaY: 120, bubbles: true, cancelable: true }))
        })
        await delay(1200)
        await page.screenshot({ path: join(wheelDir, `state-${String(i + 1).padStart(3, '0')}.png`) })
      }
    }

    // ── Quality gates ──
    console.log('[eros] -- Quality gates --')
    const qualityGates = await runQualityGates(page)

    // ── Mobile pass ──
    console.log('[eros] -- Mobile screenshots (375px) --')
    await page.setViewportSize(VP_MOBILE)
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })
    await delay(2000)
    if (!local) await dismissCookieBanner(page)
    if (!local) await waitForPreloader(page)

    const mobileSections = await detectSections(page)
    const mobileFrames = await captureScreenshots(page, mobileSections, mobileDir, 'mobile')

    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
    await delay(300)
    await page.screenshot({ path: join(dir, 'full-page-mobile.png'), fullPage: true, type: 'png' })
    console.log('[eros] Full-page mobile captured')

    // ── Compute scores ──
    const layers = { geometry, aesthetics, semantic, antiTemplate, structural, motion }
    const scores = computeScores(layers)

    // ── Palette (from raw color extraction) ──
    const rawColors = await page.evaluate(() => {
      const textC = new Set(), bgC = new Set()
      for (const el of [...document.querySelectorAll('*')].slice(0, 300)) {
        const s = getComputedStyle(el)
        if (s.color && s.color !== 'rgba(0, 0, 0, 0)') textC.add(s.color)
        if (s.backgroundColor && s.backgroundColor !== 'rgba(0, 0, 0, 0)') bgC.add(s.backgroundColor)
      }
      return { text: [...textC], bg: [...bgC] }
    })
    const textHex = rawColors.text.map(rgbaToHex).filter(h => h.startsWith('#'))
    const bgHex = rawColors.bg.map(rgbaToHex).filter(h => h.startsWith('#'))
    const palette = { textColors: clusterColors(textHex), bgColors: clusterColors(bgHex) }

    // ── Build manifest ──
    const manifest = {
      version: 2.0,
      url, domain,
      pagePath: new URL(url).pathname,
      dirName,
      capturedAt: new Date().toISOString(),
      isLocal: local,

      // Full layer data
      geometry,
      aesthetics,
      semantic,
      antiTemplate,

      // Backward-compatible aliases
      depthMetrics: structural,
      motionProfile: motion,
      compositionMetrics: {
        textAlignmentVariety: aesthetics.typography.levels,
        avgPaddingAsymmetry: 0,
        containerBreaks: geometry.surprise.types.includes('container-breaks') ? geometry.surprise.count : 0,
        isSingleViewport: motion.wheelStates.isWheelDriven,
        subCompositions: 0,
      },
      typographyMetrics: {
        sizeRatio: aesthetics.typography.sizeRatio,
        sizeCount: aesthetics.typography.levels,
        weightCount: aesthetics.typography.weights.length,
        hasLetterSpacing: aesthetics.typography.hasCustomSpacing,
        hasClamp: false,
      },

      excellenceSignals: {
        ...scores.signals,
        _scores: scores,
      },

      qualityGates: {
        contrast: qualityGates.contrast,
        animations: qualityGates.animations,
        images: qualityGates.images,
        headings: qualityGates.headings,
        meta: qualityGates.meta,
        overall: qualityGates.overall,
      },

      wheelStates: motion.wheelStates,
      palette,

      screenshots: {
        desktop: desktopFrames.length,
        mobile: mobileFrames.length,
      },

      desktop: {
        frames: desktopFrames.length,
        frameFiles: desktopFrames.map(f => f.file),
        sections: desktopFrames.map(f => ({ file: f.file, sectionTag: f.tag, sectionClass: f.className, scrollY: f.scrollY, height: f.height })),
        fullPage: 'full-page-desktop.png',
      },
      mobile: {
        frames: mobileFrames.length,
        frameFiles: mobileFrames.map(f => f.file),
        sections: mobileFrames.map(f => ({ file: f.file, sectionTag: f.tag, sectionClass: f.className, scrollY: f.scrollY, height: f.height })),
        fullPage: 'full-page-mobile.png',
      },
    }

    // Write manifest
    writeFileSync(join(dir, 'manifest.json'), JSON.stringify(manifest, null, 2))

    // Write analysis report
    generateAnalysisReport({
      url, layers, scores, qualityGates, screenshots: manifest.screenshots,
    }, dir)

    // Summary
    console.log(`[eros] Done!`)
    console.log(`[eros]   Desktop: ${desktopFrames.length} frames | Mobile: ${mobileFrames.length} frames`)
    console.log(`[eros]   Excellence -> Composition:${scores.signals.composition} Depth:${scores.signals.depth} Typography:${scores.signals.typography} Motion:${scores.signals.motion} Craft:${scores.signals.craft}`)
    console.log(`[eros]   Quality   -> Contrast:${qualityGates.contrast.signal} Animations:${qualityGates.animations.clean ? 'PASS' : 'FAIL'} Images:${qualityGates.images.signal} Headings:${qualityGates.headings.signal} Meta:${qualityGates.meta.signal} Overall:${qualityGates.overall}`)
    console.log(`[eros]   Saved to ${dir}/\n`)

    return manifest
  } finally {
    await context.close()
  }
}

// ═════════════════════════════════════════════════════════════
// ENTRY POINT
// ═════════════════════════════════════════════════════════════
const browser = await chromium.launch({ headless: true })

try {
  // Phase 1: Expand URLs via auto-discovery
  let expandedUrls = []
  for (const u of urls) {
    expandedUrls.push(u)
    if (autoDiscover) {
      try {
        const internalPages = await discoverInternalPages(browser, u, maxInternalPages)
        for (const p of internalPages) expandedUrls.push(p.url)
      } catch (err) {
        console.error(`[eros:discover] Failed for ${u}: ${err.message} -- homepage only`)
      }
    }
  }
  expandedUrls = [...new Set(expandedUrls)]
  console.log(`\n[eros] === Observing ${expandedUrls.length} page(s) ===\n`)

  // Phase 2: Observe each page
  const results = []
  for (const u of expandedUrls) {
    try {
      const result = await observePage(browser, u, outputBase, { local: isLocal })
      results.push({ url: u, status: 'ok', manifest: result })
    } catch (err) {
      console.error(`[eros] FAILED: ${u} -- ${err.message}`)
      results.push({ url: u, status: 'error', error: err.message })
    }
  }

  // Phase 3: Site-level index
  const byDomain = {}
  for (const r of results) {
    if (r.status !== 'ok') continue
    const d = r.manifest.domain
    if (!byDomain[d]) byDomain[d] = []
    byDomain[d].push({
      pagePath: r.manifest.pagePath,
      dirName: r.manifest.dirName,
      url: r.url,
      sections: r.manifest.desktop.frames,
    })
  }

  for (const [d, pages] of Object.entries(byDomain)) {
    const indexPath = join(outputBase, `${d}--index.json`)
    writeFileSync(indexPath, JSON.stringify({ domain: d, capturedAt: new Date().toISOString(), totalPages: pages.length, pages }, null, 2))
    console.log(`[eros] Site index: ${indexPath} (${pages.length} pages)`)
  }

  // Summary
  console.log('\n[eros] === Summary ===')
  for (const r of results) {
    if (r.status === 'ok') {
      const m = r.manifest
      console.log(`  OK ${m.pagePath.padEnd(20)} ${m.desktop.frames} desktop + ${m.mobile.frames} mobile`)
    } else {
      console.log(`  FAIL ${r.url} -- ${r.error}`)
    }
  }

  if (results.some(r => r.status === 'error')) process.exit(1)
} finally {
  await browser.close()
}
