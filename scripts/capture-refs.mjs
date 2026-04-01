#!/usr/bin/env node
/**
 * General Observer v4.0 (formerly Reference Capture Script)
 * Complete 4-pass analysis: Scroll → Hover → Click → Responsive
 * Auto-discovers internal pages from navigation links.
 * Also works as a local project observer (--local flag).
 *
 * Captures desktop + mobile screenshots per section boundary,
 * extracts design tokens, tech stack, CSS custom properties,
 * runs interaction sweeps (hover states, click states, scroll behaviors),
 * detects spacing systems, and writes a rich manifest.
 * Now also scores against the Excellence Standard and writes analysis.md.
 *
 * Usage:
 *   Single URL:           node capture-refs.mjs <url> [output-dir]
 *   Batch mode:           node capture-refs.mjs --batch <url1> <url2> ... [--out <dir>]
 *   Disable discovery:    node capture-refs.mjs --no-discover <url> [output-dir]
 *   Set max pages:        node capture-refs.mjs --max-pages 3 <url> [output-dir]
 *   Local project:        node capture-refs.mjs --local --port 5173 <output-dir>
 *
 * Auto-discovery: when given a homepage URL, extracts nav links and captures
 * internal pages automatically. Each page gets its own directory:
 *   _ref-captures/{domain}/          — homepage
 *   _ref-captures/{domain}--about/   — /about
 *   _ref-captures/{domain}--work/    — /work
 *
 * Output per page:
 *   desktop/frame-NNN.png        — per-section desktop screenshots
 *   mobile/frame-NNN.png         — per-section mobile screenshots
 *   interactions/hover-NNN.png   — hover state captures
 *   interactions/click-NNN.png   — click state captures
 *   interactions/scroll-NNN.png  — scroll behavior captures
 *   full-page-desktop.png
 *   full-page-mobile.png
 *   manifest.json                — rich metadata with interaction data
 *   analysis.md                  — Excellence Standard scoring + human-readable summary
 */

import puppeteer from 'puppeteer'
import { mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'

// ── CLI parsing ──────────────────────────────────────────────
const args = process.argv.slice(2)

if (args.length === 0) {
  console.error(`Usage:
  Single:    node capture-refs.mjs <url> [output-dir]
  Batch:     node capture-refs.mjs --batch <url1> <url2> ... [--out <dir>]
  No crawl:  node capture-refs.mjs --no-discover <url> [output-dir]
  Max pages: node capture-refs.mjs --max-pages 3 <url> [output-dir]
  Local:     node capture-refs.mjs --local [--port 5173] [output-dir]`)
  process.exit(1)
}

let urls = []
let outputBase = '_ref-captures'
let autoDiscover = true
let maxInternalPages = 5
let isLocal = false
let localPort = 5173

// Extract flags
const flagArgs = []
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--no-discover') {
    autoDiscover = false
  } else if (args[i] === '--max-pages' && args[i + 1]) {
    maxInternalPages = parseInt(args[i + 1]) || 5
    i++
  } else if (args[i] === '--local') {
    isLocal = true
    autoDiscover = false // no crawling for local projects
  } else if (args[i] === '--port' && args[i + 1]) {
    localPort = parseInt(args[i + 1]) || 5173
    i++
  } else {
    flagArgs.push(args[i])
  }
}

if (isLocal) {
  // Local mode: URL is localhost, output dir is the first positional arg
  urls = [`http://localhost:${localPort}`]
  if (flagArgs[0]) outputBase = flagArgs[0]
} else if (flagArgs[0] === '--batch') {
  const outIdx = flagArgs.indexOf('--out')
  if (outIdx !== -1) {
    outputBase = flagArgs[outIdx + 1]
    urls = flagArgs.slice(1, outIdx)
  } else {
    urls = flagArgs.slice(1)
  }
} else {
  urls = [flagArgs[0]]
  if (flagArgs[1]) outputBase = flagArgs[1]
}

// ── Viewport configs ─────────────────────────────────────────
const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  mobile: { width: 375, height: 812 }
}

// ── Cookie banner selectors (common patterns) ───────────────
const COOKIE_SELECTORS = [
  '[class*="cookie"] button[class*="accept"]',
  '[class*="cookie"] button[class*="agree"]',
  '[class*="cookie"] button[class*="allow"]',
  '[class*="consent"] button[class*="accept"]',
  '[class*="consent"] button[class*="agree"]',
  '[class*="consent"] button[class*="allow"]',
  '[id*="cookie"] button',
  '[id*="consent"] button',
  '.cc-btn.cc-dismiss',
  '#onetrust-accept-btn-handler',
  '.js-cookie-consent-agree',
  '[data-testid="cookie-policy-dialog-accept-button"]',
  'button[aria-label*="cookie" i]',
  'button[aria-label*="accept" i]'
]

// ── Color utilities ──────────────────────────────────────────
function rgbaToHex(rgba) {
  const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
  if (!match) return rgba
  const [, r, g, b] = match.map(Number)
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')
}

function colorDistance(hex1, hex2) {
  const r1 = parseInt(hex1.slice(1, 3), 16)
  const g1 = parseInt(hex1.slice(3, 5), 16)
  const b1 = parseInt(hex1.slice(5, 7), 16)
  const r2 = parseInt(hex2.slice(1, 3), 16)
  const g2 = parseInt(hex2.slice(3, 5), 16)
  const b2 = parseInt(hex2.slice(5, 7), 16)
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2)
}

function clusterColors(hexColors, threshold = 30) {
  const clusters = []
  for (const hex of hexColors) {
    const existing = clusters.find(c => colorDistance(c.representative, hex) < threshold)
    if (existing) {
      existing.members.push(hex)
      existing.count++
    } else {
      clusters.push({ representative: hex, members: [hex], count: 1 })
    }
  }
  return clusters
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)
    .map(c => ({ hex: c.representative, frequency: c.count }))
}

// ═══════════════════════════════════════════════════════════════
// MAIN CAPTURE FUNCTION
// ═══════════════════════════════════════════════════════════════
async function captureReference(url, outputBase, options = {}) {
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
  console.log(`\n[capture] ═══ ${url} [${pageLabel}] ═══`)

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })

  try {
    const page = await browser.newPage()

    // ─────────────────────────────────────────────────────────
    // PASS 1: SCROLL SWEEP (desktop)
    // Captures per-section screenshots + scroll-triggered behaviors
    // ─────────────────────────────────────────────────────────
    console.log('[capture] ── Pass 1: Scroll sweep (desktop 1440px) ──')
    await page.setViewport(VIEWPORTS.desktop)
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 })
    await new Promise(r => setTimeout(r, 2000))

    if (!local) await dismissCookieBanner(page)
    if (!local) await waitForPreloader(page)

    // Capture header state at top (before any scroll)
    const headerStateTop = await captureHeaderState(page)

    // Detect section boundaries
    const sections = await detectSections(page)
    console.log(`[capture] Found ${sections.length} sections`)

    // Screenshot per section with scroll-diff detection
    const { frames: desktopFrames, scrollDiffs } = await captureWithScrollDiff(
      page, sections, desktopDir, interactionsDir, 'desktop'
    )

    // Capture header state after scrolling past hero
    await page.evaluate(() => window.scrollTo({ top: 800, behavior: 'instant' }))
    await new Promise(r => setTimeout(r, 600))
    const headerStateScrolled = await captureHeaderState(page)

    // Detect header behavior
    const headerBehavior = diffHeaderBehavior(headerStateTop, headerStateScrolled)

    // Full-page desktop
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
    await new Promise(r => setTimeout(r, 300))
    console.log('[capture] Full-page desktop screenshot...')
    await page.screenshot({
      path: join(dir, 'full-page-desktop.png'),
      fullPage: true,
      type: 'png'
    })

    // ─────────────────────────────────────────────────────────
    // EXTRACT METADATA (while on desktop)
    // ─────────────────────────────────────────────────────────
    console.log('[capture] Extracting metadata...')
    const meta = await extractMetadata(page)
    const techStack = await detectTechStack(page)
    const cssCustomProps = await extractCSSCustomProperties(page)
    const spacingSystem = await extractSpacingSystem(page)
    const layoutPatterns = await extractLayoutPatterns(page, sections)

    // ─────────────────────────────────────────────────────────
    // EXCELLENCE STANDARD METRICS (v4 — new)
    // ─────────────────────────────────────────────────────────
    console.log('[capture] Extracting Excellence Standard metrics...')
    const depthMetrics = await extractDepthMetrics(page)
    const typographyMetrics = await extractTypographyMetrics(page)
    const motionProfile = await extractMotionProfile(page)
    const compositionMetrics = await extractCompositionMetrics(page)
    const sectionClassifications = await classifySections(page)

    console.log('[capture] Running quality gates...')
    const contrastAudit      = await extractContrastRatios(page)
    const animationAudit     = await detectAnimationAntiPatterns(page)
    const imageAudit         = await auditImageOptimization(page)
    const headingAudit       = await validateHeadingHierarchy(page)
    const metaTags           = await extractMetaTags(page)
    const sectionColors      = await extractSectionColors(page)

    // ─────────────────────────────────────────────────────────
    // PASS 2: HOVER SWEEP (desktop only — hover doesn't exist on mobile)
    // Detects hover states on interactive elements
    // ─────────────────────────────────────────────────────────
    console.log('[capture] ── Pass 2: Hover sweep ──')
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
    await new Promise(r => setTimeout(r, 500))
    const hoverStates = await runHoverSweep(page, interactionsDir)

    // ─────────────────────────────────────────────────────────
    // PASS 3: CLICK SWEEP (desktop)
    // Detects tabs, accordions, modals, toggles
    // ─────────────────────────────────────────────────────────
    console.log('[capture] ── Pass 3: Click sweep ──')
    // Reload to reset state after hover sweep may have changed things
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 })
    await new Promise(r => setTimeout(r, 2000))
    if (!local) await dismissCookieBanner(page)
    if (!local) await waitForPreloader(page)
    const clickStates = await runClickSweep(page, interactionsDir)

    // ─────────────────────────────────────────────────────────
    // PASS 4: RESPONSIVE SWEEP (mobile)
    // ─────────────────────────────────────────────────────────
    console.log('[capture] ── Pass 4: Responsive sweep (mobile 375px) ──')
    await page.setViewport(VIEWPORTS.mobile)
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 })
    await new Promise(r => setTimeout(r, 2000))
    if (!local) await dismissCookieBanner(page)
    if (!local) await waitForPreloader(page)

    const mobileSections = await detectSections(page)
    const { frames: mobileFrames } = await captureWithScrollDiff(
      page, mobileSections, mobileDir, interactionsDir, 'mobile'
    )

    // Mobile navigation detection
    const mobileNav = await detectMobileNavigation(page)

    // Full-page mobile
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
    await new Promise(r => setTimeout(r, 300))
    console.log('[capture] Full-page mobile screenshot...')
    await page.screenshot({
      path: join(dir, 'full-page-mobile.png'),
      fullPage: true,
      type: 'png'
    })

    // ─────────────────────────────────────────────────────────
    // PROCESS & BUILD MANIFEST
    // ─────────────────────────────────────────────────────────
    const allTextHex = meta.rawTextColors.map(rgbaToHex).filter(h => h.startsWith('#'))
    const allBgHex = meta.rawBgColors.map(rgbaToHex).filter(h => h.startsWith('#'))

    const palette = {
      textColors: clusterColors(allTextHex),
      bgColors: clusterColors(allBgHex),
      allUniqueText: [...new Set(allTextHex)],
      allUniqueBg: [...new Set(allBgHex)]
    }

    const manifest = {
      version: 4.0,
      url,
      domain,
      pagePath: new URL(url).pathname,
      dirName: dirName,
      capturedAt: new Date().toISOString(),
      isLocal: local,

      viewports: VIEWPORTS,

      desktop: {
        frames: desktopFrames.length,
        frameFiles: desktopFrames.map(f => f.file),
        sections: desktopFrames.map(f => ({
          file: f.file,
          sectionTag: f.tag,
          sectionClass: f.className,
          scrollY: f.scrollY,
          height: f.height
        })),
        fullPage: 'full-page-desktop.png'
      },

      mobile: {
        frames: mobileFrames.length,
        frameFiles: mobileFrames.map(f => f.file),
        sections: mobileFrames.map(f => ({
          file: f.file,
          sectionTag: f.tag,
          sectionClass: f.className,
          scrollY: f.scrollY,
          height: f.height
        })),
        fullPage: 'full-page-mobile.png',
        navigation: mobileNav
      },

      palette,
      fonts: meta.fonts,
      fontSizes: meta.fontSizes,
      headings: meta.headings,
      sectionCount: sections.length,
      pageHeight: meta.pageHeight,
      title: meta.title,
      techStack,
      cssCustomProperties: cssCustomProps,
      media: meta.media,

      // ── v3: Interaction sweep data ──
      interactions: {
        scrollDiffs,
        headerBehavior,
        hoverStates,
        clickStates
      },

      // ── v3: Layout & spacing analysis ──
      spacingSystem,
      layoutPatterns,

      navigation: {
        ...meta.navigation,
        mobile: mobileNav
      },

      // ── v4: Excellence Standard metrics ──
      depthMetrics,
      typographyMetrics,
      motionProfile,
      compositionMetrics,
      sectionClassifications,

      // ── v4.2: Quality gates ──
      metaTags,
      sectionColors,
      qualityGates: {
        contrast:   contrastAudit,
        animations: animationAudit,
        images:     imageAudit,
        headings:   headingAudit,
        meta:       { signal: metaTags.signal, score: metaTags.score },
        // Overall: PASS only if all gates pass
        overall: (() => {
          const signals = [
            contrastAudit.signal,
            animationAudit.clean ? 'PASS' : 'FAIL',
            imageAudit.signal,
            headingAudit.signal,
            metaTags.signal
          ]
          return signals.every(s => s === 'PASS') ? 'PASS'
               : signals.includes('FAIL')         ? 'FAIL'
               :                                    'WARN'
        })()
      },

      excellenceSignals: computeExcellenceSignals({
        depthMetrics, typographyMetrics, motionProfile, compositionMetrics,
        interactions: { hoverStates, clickStates, scrollDiffs },
        techStack, layoutPatterns
      })
    }

    writeFileSync(join(dir, 'manifest.json'), JSON.stringify(manifest, null, 2))
    generateAnalysisReport(manifest, dir)

    const interactionCount = hoverStates.length + clickStates.length + scrollDiffs.length
    const signals = manifest.excellenceSignals
    console.log(`[capture] ✓ Done!`)
    console.log(`[capture]   Desktop: ${desktopFrames.length} frames | Mobile: ${mobileFrames.length} frames`)
    console.log(`[capture]   Interactions: ${hoverStates.length} hover + ${clickStates.length} click + ${scrollDiffs.length} scroll diffs`)
    console.log(`[capture]   Header: ${headerBehavior.type}`)
    console.log(`[capture]   Palette: ${palette.textColors.length} text + ${palette.bgColors.length} bg clusters`)
    console.log(`[capture]   Spacing: ${spacingSystem.scale.length} values detected`)
    console.log(`[capture]   Tech: ${techStack.libraries.join(', ') || 'none detected'}`)
    console.log(`[capture]   Excellence → Composition:${signals.composition} Depth:${signals.depth} Typo:${signals.typography} Motion:${signals.motion} Craft:${signals.craft}`)
    console.log(`[capture]   Quality   → Contrast:${manifest.qualityGates.contrast.signal} Animations:${manifest.qualityGates.animations.clean ? 'PASS' : 'FAIL'} Images:${manifest.qualityGates.images.signal} Headings:${manifest.qualityGates.headings.signal} Meta:${manifest.qualityGates.meta.signal} Overall:${manifest.qualityGates.overall}`)
    console.log(`[capture]   Color rhythm: ${manifest.sectionColors?.rhythm || 'unknown'} (${manifest.sectionColors?.transitions || 0} transitions)`)
    console.log(`[capture]   Saved to ${dir}/\n`)

    return manifest
  } finally {
    await browser.close()
  }
}

// ═══════════════════════════════════════════════════════════════
// COOKIE BANNER DISMISSAL
// ═══════════════════════════════════════════════════════════════
async function dismissCookieBanner(page) {
  for (const selector of COOKIE_SELECTORS) {
    try {
      const btn = await page.$(selector)
      if (btn) {
        await btn.click()
        console.log('[capture] Dismissed cookie banner')
        await new Promise(r => setTimeout(r, 500))
        return
      }
    } catch { /* ignore */ }
  }
}

// ═══════════════════════════════════════════════════════════════
// PRELOADER WAIT
// ═══════════════════════════════════════════════════════════════
async function waitForPreloader(page) {
  try {
    await page.evaluate(() => {
      return new Promise(resolve => {
        const preloader = document.querySelector(
          '[class*="preload"], [class*="loader"], [class*="loading"], [id*="preload"], [id*="loader"]'
        )
        if (!preloader || getComputedStyle(preloader).display === 'none') {
          return resolve()
        }
        const observer = new MutationObserver(() => {
          const s = getComputedStyle(preloader)
          if (s.display === 'none' || s.opacity === '0' || s.visibility === 'hidden') {
            observer.disconnect()
            resolve()
          }
        })
        observer.observe(preloader, { attributes: true, attributeFilter: ['class', 'style'] })
        setTimeout(() => { observer.disconnect(); resolve() }, 8000)
      })
    })
  } catch { /* proceed anyway */ }
}

// ═══════════════════════════════════════════════════════════════
// SECTION BOUNDARY DETECTION
// ═══════════════════════════════════════════════════════════════
async function detectSections(page) {
  return page.evaluate(() => {
    const candidates = [
      ...document.querySelectorAll('section'),
      ...document.querySelectorAll('main > div'),
      ...document.querySelectorAll('main > section'),
      ...document.querySelectorAll('[class*="section"]'),
      ...document.querySelectorAll('[class*="Section"]'),
      ...document.querySelectorAll('[data-section]'),
      ...document.querySelectorAll('header'),
      ...document.querySelectorAll('footer')
    ]

    const seen = new Set()
    const sections = []

    for (const el of candidates) {
      if (seen.has(el)) continue
      seen.add(el)
      const rect = el.getBoundingClientRect()
      if (rect.height > 100 && rect.width > window.innerWidth * 0.5) {
        sections.push({
          tag: el.tagName.toLowerCase(),
          className: (el.className?.toString?.() || '').split(' ').slice(0, 3).join(' '),
          id: el.id || '',
          top: rect.top + window.scrollY,
          height: rect.height
        })
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
        fallback.push({
          tag: 'viewport-chunk',
          className: '',
          id: '',
          top: y,
          height: Math.min(vh, totalHeight - y)
        })
      }
      return fallback
    }

    return deduped
  })
}

// ═══════════════════════════════════════════════════════════════
// PASS 1: SCROLL SWEEP — Section capture + scroll-triggered diffs
// ═══════════════════════════════════════════════════════════════
async function captureWithScrollDiff(page, sections, outDir, interactionsDir, label) {
  const frames = []
  const scrollDiffs = []
  const vp = label === 'desktop' ? VIEWPORTS.desktop : VIEWPORTS.mobile

  for (let i = 0; i < sections.length; i++) {
    const sec = sections[i]
    const scrollTarget = Math.max(0, sec.top - 40)

    // ── BEFORE: Scroll just above the section, capture element states
    await page.evaluate(y => window.scrollTo({ top: Math.max(0, y - 200), behavior: 'instant' }), sec.top)
    await new Promise(r => setTimeout(r, 300))

    const statesBefore = await captureElementStates(page, sec.top, sec.height)

    // ── SCROLL INTO: Scroll to section top, wait for animations
    await page.evaluate(y => window.scrollTo({ top: y, behavior: 'instant' }), scrollTarget)
    await new Promise(r => setTimeout(r, 1500)) // longer wait for scroll-triggered anims

    const statesAfter = await captureElementStates(page, sec.top, sec.height)

    // ── DIFF: Compare before/after to detect scroll-triggered changes
    const diffs = diffElementStates(statesBefore, statesAfter)
    if (diffs.length > 0) {
      const scrollFile = `scroll-${label}-${String(i).padStart(3, '0')}.png`
      await page.screenshot({
        path: join(interactionsDir, scrollFile),
        type: 'png',
        clip: { x: 0, y: 0, width: vp.width, height: vp.height }
      })

      scrollDiffs.push({
        section: i,
        sectionClass: sec.className,
        file: `interactions/${scrollFile}`,
        changes: diffs
      })
      console.log(`[capture] Scroll diff: section ${i} — ${diffs.length} element(s) changed`)
    }

    // ── SCREENSHOT: Normal section frame
    const filename = `frame-${String(i).padStart(3, '0')}.png`
    await page.screenshot({
      path: join(outDir, filename),
      type: 'png',
      clip: { x: 0, y: 0, width: vp.width, height: vp.height }
    })

    frames.push({
      file: `${label}/${filename}`,
      tag: sec.tag,
      className: sec.className,
      id: sec.id,
      scrollY: sec.top,
      height: sec.height
    })

    console.log(`[capture] ${label} frame ${i + 1}/${sections.length} — ${sec.tag}${sec.className ? '.' + sec.className.split(' ')[0] : ''} at ${Math.round(sec.top)}px`)
  }

  return { frames, scrollDiffs }
}

/** Capture computed styles of key elements within a viewport region */
async function captureElementStates(page, sectionTop, sectionHeight) {
  return page.evaluate((top, height) => {
    const results = []
    // Target elements likely to have scroll-triggered animations
    const selectors = 'h1, h2, h3, h4, p, img, [class*="card"], [class*="item"], [class*="feature"], [class*="anim"], [class*="reveal"], [data-scroll], [data-aos], [data-gsap]'
    const elements = document.querySelectorAll(selectors)

    for (const el of elements) {
      const rect = el.getBoundingClientRect()
      const absTop = rect.top + window.scrollY
      // Only elements within this section's vertical range
      if (absTop < top - 50 || absTop > top + height + 50) continue

      const s = getComputedStyle(el)
      results.push({
        tag: el.tagName.toLowerCase(),
        className: (el.className?.toString?.() || '').split(' ').slice(0, 2).join(' '),
        opacity: s.opacity,
        transform: s.transform,
        visibility: s.visibility,
        clipPath: s.clipPath,
        top: Math.round(rect.top),
        willChange: s.willChange
      })
      if (results.length >= 30) break
    }
    return results
  }, sectionTop, sectionHeight)
}

/** Diff two element state snapshots to find scroll-triggered changes */
function diffElementStates(before, after) {
  const diffs = []
  const len = Math.min(before.length, after.length)

  for (let i = 0; i < len; i++) {
    const b = before[i]
    const a = after[i]
    if (b.className !== a.className) continue // different elements, skip

    const changes = {}
    if (b.opacity !== a.opacity) changes.opacity = { from: b.opacity, to: a.opacity }
    if (b.transform !== a.transform) changes.transform = { from: b.transform, to: a.transform }
    if (b.visibility !== a.visibility) changes.visibility = { from: b.visibility, to: a.visibility }
    if (b.clipPath !== a.clipPath) changes.clipPath = { from: b.clipPath, to: a.clipPath }

    if (Object.keys(changes).length > 0) {
      diffs.push({
        element: `${a.tag}.${a.className}`,
        changes
      })
    }
  }
  return diffs
}

// ═══════════════════════════════════════════════════════════════
// HEADER BEHAVIOR DETECTION
// ═══════════════════════════════════════════════════════════════
async function captureHeaderState(page) {
  return page.evaluate(() => {
    const header = document.querySelector('header, nav, [role="banner"]')
    if (!header) return null
    const s = getComputedStyle(header)
    const rect = header.getBoundingClientRect()
    return {
      position: s.position,
      top: rect.top,
      backgroundColor: s.backgroundColor,
      backdropFilter: s.backdropFilter,
      boxShadow: s.boxShadow,
      opacity: s.opacity,
      transform: s.transform,
      height: rect.height,
      classes: header.className?.toString?.() || ''
    }
  })
}

function diffHeaderBehavior(atTop, afterScroll) {
  if (!atTop || !afterScroll) return { type: 'none', details: {} }

  const changes = {}
  let type = 'static'

  if (atTop.position === 'fixed' || atTop.position === 'sticky' ||
      afterScroll.position === 'fixed' || afterScroll.position === 'sticky') {
    type = 'sticky'
  }

  if (atTop.backgroundColor !== afterScroll.backgroundColor) {
    changes.backgroundColor = { from: atTop.backgroundColor, to: afterScroll.backgroundColor }
    if (type === 'sticky') type = 'transparent-to-solid'
  }

  if (atTop.backdropFilter !== afterScroll.backdropFilter) {
    changes.backdropFilter = { from: atTop.backdropFilter, to: afterScroll.backdropFilter }
  }

  if (atTop.boxShadow !== afterScroll.boxShadow) {
    changes.boxShadow = { from: atTop.boxShadow, to: afterScroll.boxShadow }
  }

  if (afterScroll.top < -10) {
    type = 'hide-on-scroll'
  }

  if (atTop.classes !== afterScroll.classes) {
    changes.classChange = { from: atTop.classes, to: afterScroll.classes }
  }

  return { type, height: atTop.height, position: afterScroll.position, changes }
}

// ═══════════════════════════════════════════════════════════════
// PASS 2: HOVER SWEEP — Detect hover states on interactive elements
// ═══════════════════════════════════════════════════════════════
async function runHoverSweep(page, interactionsDir) {
  const hoverStates = []

  // Find hoverable elements
  const hoverTargets = await page.evaluate(() => {
    const targets = []
    const selectors = [
      'a:not([href^="#"]):not([href^="javascript"])',
      'button',
      '[class*="card"]',
      '[class*="Card"]',
      '[class*="item"]',
      '[class*="project"]',
      '[class*="work"]',
      '[role="button"]',
      '[class*="link"]',
      '[class*="btn"]',
      '[class*="cta"]'
    ]

    for (const sel of selectors) {
      const elements = document.querySelectorAll(sel)
      for (const el of elements) {
        const rect = el.getBoundingClientRect()
        // Skip tiny, off-screen, or invisible elements
        if (rect.width < 40 || rect.height < 20) continue
        if (rect.top < -100 || rect.top > window.innerHeight * 3) continue
        if (getComputedStyle(el).display === 'none') continue

        targets.push({
          selector: el.id ? `#${el.id}` :
                    el.className ? `.${(el.className.toString?.() || '').split(' ')[0]}` :
                    el.tagName.toLowerCase(),
          tag: el.tagName.toLowerCase(),
          text: el.textContent?.trim().substring(0, 50) || '',
          x: Math.round(rect.x + rect.width / 2),
          y: Math.round(rect.y + rect.height / 2),
          scrollY: Math.round(rect.top + window.scrollY),
          width: Math.round(rect.width),
          height: Math.round(rect.height)
        })

        if (targets.length >= 15) break
      }
      if (targets.length >= 15) break
    }
    return targets
  })

  console.log(`[capture] Found ${hoverTargets.length} hoverable elements`)

  for (let i = 0; i < hoverTargets.length; i++) {
    const target = hoverTargets[i]

    try {
      // Scroll to element
      await page.evaluate(y => window.scrollTo({ top: Math.max(0, y - 300), behavior: 'instant' }), target.scrollY)
      await new Promise(r => setTimeout(r, 400))

      // Capture BEFORE state
      const beforeStyles = await page.evaluate((x, y) => {
        const el = document.elementFromPoint(x, y)
        if (!el) return null
        const s = getComputedStyle(el)
        return {
          transform: s.transform,
          boxShadow: s.boxShadow,
          backgroundColor: s.backgroundColor,
          color: s.color,
          borderColor: s.borderColor,
          opacity: s.opacity,
          scale: s.scale,
          outline: s.outline,
          textDecoration: s.textDecoration,
          cursor: s.cursor
        }
      }, target.x, target.y - (target.scrollY - Math.max(0, target.scrollY - 300)))

      if (!beforeStyles) continue

      // HOVER: Move mouse to element
      const viewY = target.y - (target.scrollY - Math.max(0, target.scrollY - 300))
      await page.mouse.move(target.x, viewY, { steps: 5 })
      await new Promise(r => setTimeout(r, 600)) // wait for transition

      // Capture AFTER state
      const afterStyles = await page.evaluate((x, y) => {
        const el = document.elementFromPoint(x, y)
        if (!el) return null
        const s = getComputedStyle(el)
        return {
          transform: s.transform,
          boxShadow: s.boxShadow,
          backgroundColor: s.backgroundColor,
          color: s.color,
          borderColor: s.borderColor,
          opacity: s.opacity,
          scale: s.scale,
          outline: s.outline,
          textDecoration: s.textDecoration,
          cursor: s.cursor
        }
      }, target.x, viewY)

      if (!afterStyles) continue

      // Diff the states
      const changes = {}
      for (const prop of Object.keys(beforeStyles)) {
        if (beforeStyles[prop] !== afterStyles[prop]) {
          changes[prop] = { from: beforeStyles[prop], to: afterStyles[prop] }
        }
      }

      if (Object.keys(changes).length > 0) {
        // Screenshot the hover state
        const hoverFile = `hover-${String(i).padStart(3, '0')}.png`
        await page.screenshot({
          path: join(interactionsDir, hoverFile),
          type: 'png',
          clip: {
            x: Math.max(0, target.x - 200),
            y: Math.max(0, viewY - 100),
            width: 400,
            height: 200
          }
        })

        hoverStates.push({
          element: target.selector,
          tag: target.tag,
          text: target.text,
          file: `interactions/${hoverFile}`,
          changes
        })
        console.log(`[capture] Hover: ${target.tag}${target.selector} — ${Object.keys(changes).join(', ')}`)
      }

      // Move mouse away to reset
      await page.mouse.move(0, 0)
      await new Promise(r => setTimeout(r, 200))

    } catch { /* element may have moved, skip */ }
  }

  return hoverStates
}

// ═══════════════════════════════════════════════════════════════
// PASS 3: CLICK SWEEP — Detect tabs, accordions, modals, toggles
// ═══════════════════════════════════════════════════════════════
async function runClickSweep(page, interactionsDir) {
  const clickStates = []

  // Find interactive click targets (tabs, accordions, toggles)
  const clickTargets = await page.evaluate(() => {
    const targets = []

    // Tab-like elements
    const tabSelectors = [
      '[role="tab"]',
      '[class*="tab"]:not([class*="table"])',
      '[class*="Tab"]:not([class*="Table"])',
      '[data-tab]',
      '[data-toggle]'
    ]

    // Accordion-like elements
    const accordionSelectors = [
      '[class*="accordion"] button',
      '[class*="Accordion"] button',
      '[class*="faq"] button',
      '[class*="FAQ"] button',
      '[class*="collapse"] > *:first-child',
      'details > summary',
      '[role="button"][aria-expanded]',
      '[aria-controls][aria-expanded]'
    ]

    // Modal triggers
    const modalSelectors = [
      '[data-modal]',
      '[class*="modal-trigger"]',
      '[class*="open-modal"]'
    ]

    // Menu toggles (hamburger)
    const menuSelectors = [
      '[class*="hamburger"]',
      '[class*="menu-toggle"]',
      '[class*="burger"]',
      '[aria-label*="menu" i]',
      'button[class*="nav"]'
    ]

    const allSelectors = [...tabSelectors, ...accordionSelectors, ...modalSelectors, ...menuSelectors]

    for (const sel of allSelectors) {
      try {
        const elements = document.querySelectorAll(sel)
        for (const el of elements) {
          const rect = el.getBoundingClientRect()
          if (rect.width < 20 || rect.height < 15) continue
          if (getComputedStyle(el).display === 'none') continue

          const type = sel.includes('tab') || sel.includes('Tab') ? 'tab' :
                       sel.includes('accordion') || sel.includes('faq') || sel.includes('FAQ') ||
                       sel.includes('collapse') || sel.includes('details') || sel.includes('aria-expanded') ? 'accordion' :
                       sel.includes('modal') ? 'modal' :
                       sel.includes('hamburger') || sel.includes('menu') || sel.includes('burger') || sel.includes('nav') ? 'menu' :
                       'toggle'

          targets.push({
            type,
            tag: el.tagName.toLowerCase(),
            text: el.textContent?.trim().substring(0, 60) || '',
            x: Math.round(rect.x + rect.width / 2),
            y: Math.round(rect.y + rect.height / 2),
            scrollY: Math.round(rect.top + window.scrollY),
            ariaExpanded: el.getAttribute('aria-expanded'),
            selector: el.id ? `#${el.id}` :
                      el.className ? `.${(el.className.toString?.() || '').split(' ')[0]}` :
                      el.tagName.toLowerCase()
          })

          if (targets.length >= 12) break
        }
      } catch { /* selector parse error, skip */ }
      if (targets.length >= 12) break
    }
    return targets
  })

  console.log(`[capture] Found ${clickTargets.length} clickable interactive elements`)

  for (let i = 0; i < clickTargets.length; i++) {
    const target = clickTargets[i]

    try {
      // Scroll to element
      await page.evaluate(y => window.scrollTo({ top: Math.max(0, y - 300), behavior: 'instant' }), target.scrollY)
      await new Promise(r => setTimeout(r, 400))

      const viewY = target.y - (target.scrollY - Math.max(0, target.scrollY - 300))

      // Screenshot BEFORE click
      const beforeFile = `click-${String(i).padStart(3, '0')}-before.png`
      await page.screenshot({
        path: join(interactionsDir, beforeFile),
        type: 'png',
        clip: { x: 0, y: 0, width: VIEWPORTS.desktop.width, height: VIEWPORTS.desktop.height }
      })

      // CLICK
      await page.mouse.click(target.x, viewY)
      await new Promise(r => setTimeout(r, 800)) // wait for animation/transition

      // Capture expanded/aria state
      const afterState = await page.evaluate((x, y) => {
        const el = document.elementFromPoint(x, y)
        if (!el) return null
        return {
          ariaExpanded: el.getAttribute('aria-expanded'),
          classList: (el.className?.toString?.() || '').split(' ').slice(0, 5),
          innerText: el.textContent?.trim().substring(0, 60)
        }
      }, target.x, viewY)

      // Screenshot AFTER click
      const afterFile = `click-${String(i).padStart(3, '0')}-after.png`
      await page.screenshot({
        path: join(interactionsDir, afterFile),
        type: 'png',
        clip: { x: 0, y: 0, width: VIEWPORTS.desktop.width, height: VIEWPORTS.desktop.height }
      })

      clickStates.push({
        type: target.type,
        element: target.selector,
        text: target.text,
        beforeFile: `interactions/${beforeFile}`,
        afterFile: `interactions/${afterFile}`,
        ariaExpanded: { before: target.ariaExpanded, after: afterState?.ariaExpanded },
        stateChange: target.ariaExpanded !== afterState?.ariaExpanded ? 'toggled' : 'unknown'
      })

      console.log(`[capture] Click: ${target.type} "${target.text.substring(0, 30)}" — ${target.ariaExpanded !== afterState?.ariaExpanded ? 'toggled' : 'visual change'}`)

      // For modals/menus, click again or press Escape to close
      if (target.type === 'modal' || target.type === 'menu') {
        await page.keyboard.press('Escape')
        await new Promise(r => setTimeout(r, 500))
      }

    } catch { /* element may have changed, skip */ }
  }

  return clickStates
}

// ═══════════════════════════════════════════════════════════════
// MOBILE NAVIGATION DETECTION
// ═══════════════════════════════════════════════════════════════
async function detectMobileNavigation(page) {
  return page.evaluate(() => {
    // Check for hamburger / menu toggle
    const hamburger = document.querySelector(
      '[class*="hamburger"], [class*="burger"], [class*="menu-toggle"], ' +
      '[class*="mobile-menu"], [aria-label*="menu" i], button[class*="nav"]'
    )

    // Check for bottom navigation
    const bottomNav = document.querySelector(
      '[class*="bottom-nav"], [class*="tab-bar"], nav[style*="bottom"]'
    )
    const bottomNavEl = bottomNav || [...document.querySelectorAll('nav')].find(n => {
      const s = getComputedStyle(n)
      return s.position === 'fixed' && parseInt(s.bottom) <= 10
    })

    // Check for visible nav links
    const navLinks = document.querySelectorAll('nav a, header a')
    const visibleLinks = [...navLinks].filter(a => {
      const s = getComputedStyle(a)
      return s.display !== 'none' && s.visibility !== 'hidden'
    })

    return {
      hasHamburger: !!hamburger,
      hasBottomNav: !!bottomNavEl,
      visibleLinkCount: visibleLinks.length,
      type: bottomNavEl ? 'bottom-nav' :
            hamburger ? 'hamburger' :
            visibleLinks.length > 0 ? 'visible-links' : 'hidden'
    }
  })
}

// ═══════════════════════════════════════════════════════════════
// SPACING SYSTEM EXTRACTION
// ═══════════════════════════════════════════════════════════════
async function extractSpacingSystem(page) {
  return page.evaluate(() => {
    const spacingValues = []

    // Sample sections for padding/margin/gap patterns
    const sections = document.querySelectorAll('section, main > div, [class*="section"]')
    const sampled = [...sections].slice(0, 15)

    for (const sec of sampled) {
      const s = getComputedStyle(sec)
      spacingValues.push(parseInt(s.paddingTop) || 0)
      spacingValues.push(parseInt(s.paddingBottom) || 0)
      spacingValues.push(parseInt(s.paddingLeft) || 0)
      spacingValues.push(parseInt(s.paddingRight) || 0)
    }

    // Sample common content elements for gaps
    const containers = document.querySelectorAll('[class*="grid"], [class*="flex"], [class*="container"]')
    for (const el of [...containers].slice(0, 10)) {
      const s = getComputedStyle(el)
      if (s.gap && s.gap !== 'normal') {
        const gapVal = parseInt(s.gap)
        if (gapVal > 0) spacingValues.push(gapVal)
      }
      if (s.rowGap && s.rowGap !== 'normal') {
        const val = parseInt(s.rowGap)
        if (val > 0) spacingValues.push(val)
      }
      if (s.columnGap && s.columnGap !== 'normal') {
        const val = parseInt(s.columnGap)
        if (val > 0) spacingValues.push(val)
      }
    }

    // Find the spacing scale (common values rounded to 4px grid)
    const rounded = spacingValues
      .filter(v => v > 0)
      .map(v => Math.round(v / 4) * 4)

    const frequency = {}
    for (const v of rounded) {
      frequency[v] = (frequency[v] || 0) + 1
    }

    const scale = Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([value, count]) => ({ px: parseInt(value), frequency: count }))
      .sort((a, b) => a.px - b.px)

    // Detect base unit (most common small spacing value)
    const smallValues = scale.filter(s => s.px >= 4 && s.px <= 24)
    const baseUnit = smallValues.length > 0 ? smallValues[0].px : 8

    // Section vertical padding (consistent or varied?)
    const sectionPaddings = sampled.map(sec => {
      const s = getComputedStyle(sec)
      return parseInt(s.paddingTop) || 0
    }).filter(v => v > 0)

    const avgSectionPadding = sectionPaddings.length > 0
      ? Math.round(sectionPaddings.reduce((a, b) => a + b, 0) / sectionPaddings.length)
      : 0

    return {
      scale,
      baseUnit,
      sectionVerticalPadding: {
        average: avgSectionPadding,
        values: [...new Set(sectionPaddings)].sort((a, b) => a - b),
        consistent: new Set(sectionPaddings.map(v => Math.round(v / 8) * 8)).size <= 2
      }
    }
  })
}

// ═══════════════════════════════════════════════════════════════
// LAYOUT PATTERNS EXTRACTION
// ═══════════════════════════════════════════════════════════════
async function extractLayoutPatterns(page, sections) {
  return page.evaluate((sectionData) => {
    const patterns = []

    for (let i = 0; i < Math.min(sectionData.length, 12); i++) {
      const sec = sectionData[i]
      // Find the actual DOM element at this scroll position
      const el = document.elementFromPoint(window.innerWidth / 2, 100)
      if (!el) continue

      // Walk up to find the section container
      let container = el
      for (let j = 0; j < 5; j++) {
        if (!container.parentElement) break
        if (container.parentElement.tagName === 'MAIN' || container.parentElement.tagName === 'BODY') break
        container = container.parentElement
      }

      const s = getComputedStyle(container)
      const children = container.children
      const childCount = children.length

      // Detect layout type
      let layoutType = 'block'
      if (s.display === 'grid') layoutType = 'grid'
      else if (s.display === 'flex') layoutType = 'flex'

      // Grid analysis
      let gridInfo = null
      if (layoutType === 'grid') {
        gridInfo = {
          columns: s.gridTemplateColumns,
          rows: s.gridTemplateRows,
          gap: s.gap
        }
      }

      // Flex analysis
      let flexInfo = null
      if (layoutType === 'flex') {
        flexInfo = {
          direction: s.flexDirection,
          wrap: s.flexWrap,
          justify: s.justifyContent,
          align: s.alignItems,
          gap: s.gap
        }
      }

      // Content width analysis
      const contentWidth = container.getBoundingClientRect().width
      const isFullBleed = contentWidth >= window.innerWidth * 0.98
      const isConstrained = contentWidth < window.innerWidth * 0.85

      patterns.push({
        section: i,
        tag: container.tagName.toLowerCase(),
        layoutType,
        gridInfo,
        flexInfo,
        childCount,
        isFullBleed,
        isConstrained,
        maxWidth: s.maxWidth,
        textAlign: s.textAlign
      })
    }

    return patterns
  }, sections)
}

// ═══════════════════════════════════════════════════════════════
// METADATA EXTRACTION
// ═══════════════════════════════════════════════════════════════
async function extractMetadata(page) {
  return page.evaluate(() => {
    const all = document.querySelectorAll('*')
    const colorSet = new Set()
    const bgSet = new Set()
    const fontSet = new Set()
    const fontSizes = new Set()

    const limit = Math.min(all.length, 500)
    for (let i = 0; i < limit; i++) {
      const s = getComputedStyle(all[i])
      const color = s.color
      const bg = s.backgroundColor
      if (color && color !== 'rgba(0, 0, 0, 0)') colorSet.add(color)
      if (bg && bg !== 'rgba(0, 0, 0, 0)') bgSet.add(bg)
      if (s.fontFamily) fontSet.add(s.fontFamily.split(',')[0].trim().replace(/['"]/g, ''))
      if (s.fontSize) fontSizes.add(s.fontSize)
    }

    // Headings with full typography info
    const headings = []
    document.querySelectorAll('h1, h2, h3, h4').forEach(h => {
      const s = getComputedStyle(h)
      headings.push({
        tag: h.tagName,
        text: h.textContent.trim().substring(0, 100),
        fontSize: s.fontSize,
        fontWeight: s.fontWeight,
        fontFamily: s.fontFamily.split(',')[0].trim().replace(/['"]/g, ''),
        letterSpacing: s.letterSpacing,
        lineHeight: s.lineHeight,
        textTransform: s.textTransform,
        color: s.color
      })
    })

    // Rich media detection
    const videos = []
    document.querySelectorAll('video').forEach(v => {
      const rect = v.getBoundingClientRect()
      videos.push({
        src: v.src || v.querySelector('source')?.src || '',
        autoplay: v.autoplay,
        loop: v.loop,
        muted: v.muted,
        width: rect.width,
        height: rect.height,
        isBackground: rect.width > window.innerWidth * 0.8 && rect.height > window.innerHeight * 0.5
      })
    })

    const canvases = []
    document.querySelectorAll('canvas').forEach(c => {
      const rect = c.getBoundingClientRect()
      canvases.push({
        width: rect.width,
        height: rect.height,
        isFullscreen: rect.width > window.innerWidth * 0.9 && rect.height > window.innerHeight * 0.8,
        hasWebGL: !!(c.getContext('webgl2') || c.getContext('webgl'))
      })
    })

    const svgCount = document.querySelectorAll('svg').length
    const iframeCount = document.querySelectorAll('iframe').length
    const lottieCount = document.querySelectorAll('lottie-player, [class*="lottie"]').length

    // Layered images (multiple images stacked in same container)
    const layeredImages = []
    document.querySelectorAll('div, section, figure').forEach(container => {
      const imgs = container.querySelectorAll(':scope > img, :scope > picture > img')
      if (imgs.length >= 2) {
        const rects = [...imgs].map(img => {
          const r = img.getBoundingClientRect()
          return { src: img.src, width: r.width, height: r.height, zIndex: getComputedStyle(img).zIndex }
        })
        layeredImages.push({ container: container.className?.toString?.().split(' ')[0] || container.tagName, images: rects })
      }
    })

    // Background images
    const bgImages = []
    const bgElements = document.querySelectorAll('[style*="background-image"], [style*="background"]')
    bgElements.forEach(el => {
      const bg = getComputedStyle(el).backgroundImage
      if (bg && bg !== 'none') {
        const rect = el.getBoundingClientRect()
        bgImages.push({
          value: bg.substring(0, 200),
          width: rect.width,
          height: rect.height,
          isHero: rect.height > window.innerHeight * 0.6
        })
      }
    })

    // Navigation
    const nav = document.querySelector('nav, header nav, [role="navigation"]')
    const navLinks = nav ? [...nav.querySelectorAll('a')].map(a => ({
      text: a.textContent.trim().substring(0, 30),
      href: a.getAttribute('href')
    })) : []
    const headerEl = document.querySelector('header')
    const headerStyle = headerEl ? getComputedStyle(headerEl) : null

    // Footer structure
    const footer = document.querySelector('footer')
    const footerInfo = footer ? {
      hasColumns: getComputedStyle(footer).display === 'grid' || getComputedStyle(footer).display === 'flex',
      linkCount: footer.querySelectorAll('a').length,
      hasSocial: !!footer.querySelector('[class*="social"], [class*="Social"], [aria-label*="social" i]'),
      hasNewsletter: !!footer.querySelector('input[type="email"], [class*="newsletter"], [class*="subscribe"]')
    } : null

    return {
      title: document.title,
      metaDescription: document.querySelector('meta[name="description"]')?.content || '',
      themeColor: document.querySelector('meta[name="theme-color"]')?.content || '',
      rawTextColors: [...colorSet],
      rawBgColors: [...bgSet],
      fonts: [...fontSet],
      fontSizes: [...fontSizes].sort(),
      headings: headings.slice(0, 20),
      pageHeight: document.body.scrollHeight,
      media: {
        videos,
        canvases,
        svgCount,
        iframeCount,
        lottieCount,
        layeredImages,
        bgImages
      },
      navigation: {
        links: navLinks.slice(0, 15),
        linkCount: navLinks.length,
        headerPosition: headerStyle?.position || 'unknown',
        headerBg: headerStyle?.backgroundColor || 'unknown'
      },
      footer: footerInfo
    }
  })
}

// ═══════════════════════════════════════════════════════════════
// TECHNOLOGY STACK DETECTION
// ═══════════════════════════════════════════════════════════════
async function detectTechStack(page) {
  return page.evaluate(() => {
    const libs = []
    const scripts = [...document.querySelectorAll('script[src]')].map(s => s.src)
    const allScriptText = scripts.join(' ').toLowerCase()

    // Check global objects
    if (window.gsap || window.GreenSockGlobals) libs.push('GSAP')
    if (window.ScrollTrigger) libs.push('ScrollTrigger')
    if (window.THREE) libs.push('Three.js')
    if (window.Lenis) libs.push('Lenis')
    if (window.LocomotiveScroll) libs.push('Locomotive Scroll')
    if (window.barba) libs.push('Barba.js')
    if (window.Swiper) libs.push('Swiper')
    if (window.anime) libs.push('anime.js')
    if (window.ScrollMagic) libs.push('ScrollMagic')
    if (window.Splitting) libs.push('Splitting')
    if (window.Typed) libs.push('Typed.js')
    if (window.lottie) libs.push('Lottie')
    if (window.PixiJS || window.PIXI) libs.push('PixiJS')

    // Check script sources
    if (allScriptText.includes('gsap')) libs.push('GSAP')
    if (allScriptText.includes('three')) libs.push('Three.js')
    if (allScriptText.includes('lenis')) libs.push('Lenis')
    if (allScriptText.includes('locomotive')) libs.push('Locomotive Scroll')
    if (allScriptText.includes('spline')) libs.push('Spline')
    if (allScriptText.includes('framer-motion') || allScriptText.includes('motion')) libs.push('Framer Motion')
    if (allScriptText.includes('swiper')) libs.push('Swiper')

    // CSS frameworks
    const links = [...document.querySelectorAll('link[href]')].map(l => l.href).join(' ').toLowerCase()
    if (links.includes('tailwind') || document.querySelector('[class*="tw-"]')) libs.push('Tailwind CSS')
    if (links.includes('bootstrap')) libs.push('Bootstrap')

    // Smooth scroll indicators
    if (document.documentElement.classList.contains('lenis') ||
        document.documentElement.classList.contains('lenis-smooth') ||
        document.body.classList.contains('lenis')) {
      if (!libs.includes('Lenis')) libs.push('Lenis')
    }

    // Framework signatures
    if (document.querySelector('[data-reactroot], #__next, #__gatsby')) libs.push('React/Next.js')
    if (document.querySelector('#__nuxt, [data-v-]')) libs.push('Vue/Nuxt')
    if (document.querySelector('[_nghost], [ng-version]')) libs.push('Angular')
    if (document.querySelector('[data-astro-cid]')) libs.push('Astro')
    if (document.querySelector('[data-svelte]')) libs.push('Svelte')

    // Font loading
    const fontLinks = [...document.querySelectorAll('link[href*="fonts.googleapis.com"], link[href*="fonts.gstatic.com"], link[href*="use.typekit.net"]')]
    const fontSources = fontLinks.map(l => l.href)

    return {
      libraries: [...new Set(libs)],
      hasSmoothScroll: !!document.querySelector('.lenis, .lenis-smooth, [data-scroll-container]'),
      hasScrollDriven: CSS.supports?.('animation-timeline: scroll()') || false,
      hasViewTransitions: !!document.startViewTransition,
      fontSources,
      hasCustomCursor: !!document.querySelector('[class*="cursor"], [class*="Cursor"], [id*="cursor"]')
    }
  })
}

// ═══════════════════════════════════════════════════════════════
// CSS CUSTOM PROPERTIES EXTRACTION
// ═══════════════════════════════════════════════════════════════
async function extractCSSCustomProperties(page) {
  return page.evaluate(() => {
    const props = {}
    try {
      for (const sheet of document.styleSheets) {
        try {
          for (const rule of sheet.cssRules) {
            if (rule.selectorText === ':root' || rule.selectorText === 'html') {
              const style = rule.style
              for (let i = 0; i < style.length; i++) {
                const prop = style[i]
                if (prop.startsWith('--')) {
                  props[prop] = style.getPropertyValue(prop).trim()
                }
              }
            }
          }
        } catch { /* CORS-blocked stylesheet */ }
      }
    } catch { /* no accessible stylesheets */ }
    return props
  })
}

// ═══════════════════════════════════════════════════════════════
// DEPTH METRICS — z-index layers, clip-paths, backdrop, grain
// ═══════════════════════════════════════════════════════════════
async function extractDepthMetrics(page) {
  return page.evaluate(() => {
    const allEls = [...document.querySelectorAll('*')]
    const zIndexSet = new Set()
    let clipPathCount = 0
    let backdropFilterCount = 0
    let shadowCount = 0
    let overlapElements = 0

    for (const el of allEls) {
      const style = getComputedStyle(el)
      const z = parseInt(style.zIndex)
      if (!isNaN(z) && style.position !== 'static') zIndexSet.add(z)
      if (style.clipPath && style.clipPath !== 'none') clipPathCount++
      if (style.backdropFilter && style.backdropFilter !== 'none') backdropFilterCount++
      if ((style.boxShadow && style.boxShadow !== 'none') ||
          (style.filter && style.filter.includes('drop-shadow'))) shadowCount++
      if (style.position === 'absolute' || style.position === 'fixed') overlapElements++
    }

    // Pseudo-element detection via stylesheet inspection
    let hasPseudoElements = false
    try {
      for (const sheet of document.styleSheets) {
        try {
          for (const rule of sheet.cssRules) {
            if (rule.selectorText &&
                (rule.selectorText.includes('::before') || rule.selectorText.includes('::after'))) {
              const s = rule.style
              if (s.content || s.position || s.background || s.backgroundImage) {
                hasPseudoElements = true
                break
              }
            }
          }
        } catch { }
        if (hasPseudoElements) break
      }
    } catch { }

    // Grain / noise detection
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
                hasGrain = true
                break
              }
            }
          } catch { }
          if (hasGrain) break
        }
      } catch { }
    }
    // Also check inline background-image for noise URLs
    if (!hasGrain) {
      for (const el of allEls.slice(0, 200)) {
        const bg = getComputedStyle(el).backgroundImage || ''
        if (bg.includes('noise') || bg.includes('grain')) { hasGrain = true; break }
      }
    }

    return {
      zIndexLayers: [...zIndexSet].sort((a, b) => a - b),
      zIndexCount: zIndexSet.size,
      clipPathCount: Math.min(clipPathCount, 50),
      backdropFilterCount,
      shadowCount: Math.min(shadowCount, 100),
      overlapElements: Math.min(overlapElements, 50),
      hasPseudoElements,
      hasGrain
    }
  })
}

// ═══════════════════════════════════════════════════════════════
// TYPOGRAPHY METRICS — size ratio, weights, letter-spacing, clamp
// ═══════════════════════════════════════════════════════════════
async function extractTypographyMetrics(page) {
  return page.evaluate(() => {
    const textEls = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6,p,span,a,li,button,label')]
    const sizesSet = new Set()
    const weightsSet = new Set()
    const letterSpacingSet = new Set()

    for (const el of textEls) {
      const style = getComputedStyle(el)
      const size = parseFloat(style.fontSize)
      if (size >= 10) sizesSet.add(Math.round(size))
      const weight = parseInt(style.fontWeight)
      if (!isNaN(weight)) weightsSet.add(weight)
      const ls = style.letterSpacing
      if (ls && ls !== 'normal' && ls !== '0px') letterSpacingSet.add(ls)
    }

    // Check stylesheet rules for clamp()
    let hasClamp = false
    let hasCSSAnimations = false
    try {
      for (const sheet of document.styleSheets) {
        try {
          for (const rule of sheet.cssRules) {
            const text = rule.cssText || ''
            if (!hasClamp && text.includes('clamp(')) hasClamp = true
            if (!hasCSSAnimations && rule.type === CSSRule.KEYFRAMES_RULE) hasCSSAnimations = true
          }
        } catch { }
        if (hasClamp && hasCSSAnimations) break
      }
    } catch { }

    const sizes = [...sizesSet].sort((a, b) => a - b)
    const minSize = sizes[0] || 14
    const maxSize = sizes[sizes.length - 1] || 14
    const sizeRatio = Math.round((maxSize / minSize) * 10) / 10

    return {
      sizes,
      sizeCount: sizes.length,
      minSize,
      maxSize,
      sizeRatio,
      weights: [...weightsSet].sort((a, b) => a - b),
      weightCount: weightsSet.size,
      hasLetterSpacing: letterSpacingSet.size > 0,
      letterSpacingValues: [...letterSpacingSet].slice(0, 8),
      hasClamp,
      hasCSSAnimations
    }
  })
}

// ═══════════════════════════════════════════════════════════════
// MOTION PROFILE — CSS transitions, GSAP state, ScrollTrigger
// ═══════════════════════════════════════════════════════════════
async function extractMotionProfile(page) {
  return page.evaluate(() => {
    const allEls = [...document.querySelectorAll('*')]
    const cubicBeziers = new Set()
    const durations = []
    let transitionCount = 0
    let animationCount = 0
    let staggerDelayCount = 0

    for (const el of allEls.slice(0, 300)) {
      const style = getComputedStyle(el)

      const transitionDuration = parseFloat(style.transitionDuration)
      if (transitionDuration > 0) {
        transitionCount++
        durations.push(transitionDuration)
        const tf = style.transitionTimingFunction
        if (tf && tf.includes('cubic-bezier')) cubicBeziers.add(tf)
      }

      const animDuration = parseFloat(style.animationDuration)
      if (animDuration > 0) {
        animationCount++
        const at = style.animationTimingFunction
        if (at && at.includes('cubic-bezier')) cubicBeziers.add(at)
        const delay = parseFloat(style.animationDelay)
        if (delay > 0) staggerDelayCount++
      }
    }

    // GSAP state
    const gsapActive = !!(window.gsap || window.GreenSockGlobals)
    const scrollTriggerActive = !!window.ScrollTrigger
    let scrollTriggerScrubCount = 0
    let scrollTriggerCount = 0
    if (window.ScrollTrigger) {
      const triggers = window.ScrollTrigger.getAll?.() || []
      scrollTriggerCount = triggers.length
      scrollTriggerScrubCount = triggers.filter(t => t.scrub).length
    }

    const gsapTweenCount = window.gsap?.globalTimeline?.getChildren?.(true, true, true)?.length || 0

    return {
      cssTransitions: {
        count: transitionCount,
        cubicBeziers: [...cubicBeziers].slice(0, 10),
        cubicBezierCount: cubicBeziers.size,
        avgDuration: durations.length
          ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length * 100) / 100
          : 0
      },
      cssAnimations: {
        count: animationCount,
        hasStagger: staggerDelayCount > 2
      },
      gsap: {
        active: gsapActive,
        tweenCount: gsapTweenCount,
        scrollTrigger: scrollTriggerActive,
        scrollTriggerCount,
        scrollTriggerScrub: scrollTriggerScrubCount > 0,
        scrollTriggerScrubCount
      }
    }
  })
}

// ═══════════════════════════════════════════════════════════════
// COMPOSITION METRICS — padding asymmetry, text alignment, overlaps
// ═══════════════════════════════════════════════════════════════
async function extractCompositionMetrics(page) {
  return page.evaluate(() => {
    const sectionEls = [...document.querySelectorAll('section, main > div, article, [class*="section"]')]
    const sectionData = []

    for (const el of sectionEls.slice(0, 20)) {
      const style = getComputedStyle(el)
      const pt = parseFloat(style.paddingTop)
      const pb = parseFloat(style.paddingBottom)
      const paddingAsymmetry = (pt > 4 && pb > 4)
        ? Math.round(Math.abs(pt - pb) / Math.max(pt, pb) * 100)
        : 0

      const textEls = [...el.querySelectorAll('h1,h2,h3,p')]
      const alignments = new Set(textEls.map(t => getComputedStyle(t).textAlign))

      const children = [...el.children]
      const hasAbsoluteChild = children.some(c => {
        const cs = getComputedStyle(c)
        return cs.position === 'absolute' || cs.position === 'fixed'
      })
      const hasNegativeMargin = children.some(c => {
        const cs = getComputedStyle(c)
        return parseFloat(cs.marginTop) < 0 || parseFloat(cs.marginLeft) < 0
      })

      const rect = el.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const isFullBleed = rect.left <= 2 && rect.right >= viewportWidth - 2

      sectionData.push({
        tag: el.tagName.toLowerCase(),
        class: (el.className || '').toString().slice(0, 60),
        paddingTop: Math.round(pt),
        paddingBottom: Math.round(pb),
        paddingAsymmetry,
        textAlignments: [...alignments],
        hasAbsoluteChild,
        hasNegativeMargin,
        isFullBleed
      })
    }

    // Page-wide text alignment variety
    const allAlignments = new Set()
    document.querySelectorAll('h1,h2,h3,p').forEach(el => {
      allAlignments.add(getComputedStyle(el).textAlign)
    })

    // Container break: elements wider than viewport (full bleed)
    const containerBreaks = [...document.querySelectorAll('*')].filter(el => {
      const rect = el.getBoundingClientRect()
      return rect.width > window.innerWidth * 1.01 && rect.width < window.innerWidth * 2
    }).length

    const avgPaddingAsymmetry = sectionData.length
      ? Math.round(sectionData.reduce((s, d) => s + d.paddingAsymmetry, 0) / sectionData.length)
      : 0

    return {
      sections: sectionData,
      textAlignmentVariety: allAlignments.size,
      textAlignments: [...allAlignments],
      avgPaddingAsymmetry,
      containerBreaks: Math.min(containerBreaks, 20)
    }
  })
}

// ═══════════════════════════════════════════════════════════════
// PER-SECTION DOMINANT COLOR — dark / mid / light rhythm
// Walks each section's DOM tree to find its effective background,
// then classifies as dark (<18% luminance) / mid / light.
// ═══════════════════════════════════════════════════════════════
async function extractSectionColors(page) {
  return page.evaluate(() => {
    function isTransparent(c) {
      return !c || c === 'transparent' || c === 'rgba(0, 0, 0, 0)'
    }
    function effectiveBg(el) {
      let cur = el
      while (cur && cur !== document.documentElement) {
        const bg = getComputedStyle(cur).backgroundColor
        if (!isTransparent(bg)) return bg
        cur = cur.parentElement
      }
      return null
    }
    function rgbToHex(rgb) {
      const m = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
      if (!m) return null
      return '#' + [m[1], m[2], m[3]].map(x => (+x).toString(16).padStart(2, '0')).join('')
    }
    function hexLuminance(hex) {
      if (!hex || hex.length < 7) return 0.5
      const r = parseInt(hex.slice(1, 3), 16) / 255
      const g = parseInt(hex.slice(3, 5), 16) / 255
      const b = parseInt(hex.slice(5, 7), 16) / 255
      return 0.2126 * r + 0.7152 * g + 0.0722 * b
    }
    function theme(hex) {
      const l = hexLuminance(hex)
      return l < 0.18 ? 'dark' : l < 0.50 ? 'mid' : 'light'
    }

    const sectionEls = [
      ...document.querySelectorAll('header, section, footer, main > div, article, [class*="section"]')
    ].filter(el => !el.closest('nav'))

    // Deduplicate (keep outermost)
    const unique = sectionEls.filter(el =>
      !sectionEls.some(other => other !== el && other.contains(el))
    )

    const results = []

    for (const el of unique.slice(0, 25)) {
      // Collect all background colors in this section, weighted by element size
      const counts = {}

      const add = (hex, weight) => {
        if (!hex) return
        counts[hex] = (counts[hex] || 0) + weight
      }

      // The section itself gets heavy weight
      const ownBg = effectiveBg(el)
      add(rgbToHex(ownBg || ''), 8)

      // Sample direct children (large blocks)
      for (const child of [...el.children].slice(0, 10)) {
        const bg = getComputedStyle(child).backgroundColor
        if (!isTransparent(bg)) add(rgbToHex(bg), 2)
      }

      // Also check ::before via background-image / gradient
      // (limited — we pick the most common non-white non-transparent)
      const dominant = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .find(([hex]) => hex && hex !== '#000000' && hex !== '#ffffff')?.[0]
        || Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0]
        || null

      results.push({
        index: results.length,
        tag:   el.tagName.toLowerCase(),
        class: (el.className || '').toString().split(' ')[0].slice(0, 50),
        bg:    dominant || null,
        theme: dominant ? theme(dominant) : 'unknown'
      })
    }

    // Color rhythm string: "dark → light → dark → dark → light"
    const rhythm = results
      .filter(s => s.theme !== 'unknown')
      .map(s => s.theme)
      .join(' → ')

    // Count theme transitions (dark→light or light→dark = intentional contrast)
    let transitions = 0
    for (let i = 1; i < results.length; i++) {
      if (results[i].theme !== results[i - 1].theme &&
          results[i].theme !== 'unknown' &&
          results[i - 1].theme !== 'unknown') transitions++
    }

    return { sections: results, rhythm, transitions }
  })
}

// ═══════════════════════════════════════════════════════════════
// QUALITY GATE 1 — COLOR CONTRAST (WCAG 2.1 AA)
// Traverses the tree to find effective bg color, computes ratio
// for each text element, and classifies overall pass/warn/fail.
// ═══════════════════════════════════════════════════════════════
async function extractContrastRatios(page) {
  return page.evaluate(() => {
    // ── WCAG helpers ──────────────────────────────────────────
    function toLinear(c) {
      c /= 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    }
    function luminance(r, g, b) {
      return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
    }
    function contrastRatio(L1, L2) {
      const hi = Math.max(L1, L2), lo = Math.min(L1, L2)
      return Math.round(((hi + 0.05) / (lo + 0.05)) * 100) / 100
    }
    function parseRGB(str) {
      const m = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
      return m ? [+m[1], +m[2], +m[3]] : null
    }
    function isTransparent(str) {
      return !str || str === 'transparent' ||
             str === 'rgba(0, 0, 0, 0)' || str.includes(', 0)')
    }

    // Walk up until we find a non-transparent background
    function effectiveBg(el) {
      let cur = el
      while (cur && cur !== document.documentElement) {
        const bg = getComputedStyle(cur).backgroundColor
        if (!isTransparent(bg)) return bg
        cur = cur.parentElement
      }
      return 'rgb(255, 255, 255)' // default white canvas
    }

    // ── Sample prominent text elements ────────────────────────
    const targets = [...document.querySelectorAll('h1,h2,h3,p,a,button,li,label')]
    const pairs   = []
    const seen    = new Set()

    for (const el of targets.slice(0, 80)) {
      const style = getComputedStyle(el)
      const fg    = style.color
      const bg    = effectiveBg(el)

      const fgRGB = parseRGB(fg)
      const bgRGB = parseRGB(bg)
      if (!fgRGB || !bgRGB) continue

      const key = `${fg}|${bg}`
      if (seen.has(key)) continue
      seen.add(key)

      const ratio  = contrastRatio(luminance(...fgRGB), luminance(...bgRGB))
      const size   = parseFloat(style.fontSize)
      const weight = parseInt(style.fontWeight)
      const large  = size >= 18 || (size >= 14 && weight >= 700)
      const aaMin  = large ? 3 : 4.5
      const aaaMin = large ? 4.5 : 7

      pairs.push({
        tag:       el.tagName.toLowerCase(),
        fg,
        bg,
        ratio,
        large,
        wcagAA:    ratio >= aaMin,
        wcagAAA:   ratio >= aaaMin,
      })
    }

    const total    = pairs.length
    const failAA   = pairs.filter(p => !p.wcagAA)
    const passAA   = pairs.filter(p =>  p.wcagAA)
    const passRate = total ? Math.round(passAA.length / total * 100) : 100
    const minRatio = total ? Math.min(...pairs.map(p => p.ratio)) : 0
    const avgRatio = total ? Math.round(pairs.reduce((s,p) => s + p.ratio, 0) / total * 10) / 10 : 0

    const signal = passRate >= 95 ? 'PASS' : passRate >= 80 ? 'WARN' : 'FAIL'

    return {
      signal,
      passRate,
      failingAA:  failAA.length,
      passingAA:  passAA.length,
      totalPairs: total,
      minRatio,
      avgRatio,
      // Only return failing pairs — they're the actionable ones
      failingSamples: failAA.slice(0, 10).map(p => ({
        tag: p.tag, fg: p.fg, bg: p.bg, ratio: p.ratio, large: p.large
      }))
    }
  })
}

// ═══════════════════════════════════════════════════════════════
// QUALITY GATE 2 — ANIMATION ANTI-PATTERNS
// Detects transitions on width/height/top/left, preventive
// will-change, and infinite decorative loops.
// ═══════════════════════════════════════════════════════════════
async function detectAnimationAntiPatterns(page) {
  return page.evaluate(() => {
    const FORBIDDEN = ['width', 'height', 'top', 'left', 'right', 'bottom', 'margin', 'padding']
    const found = []

    const allEls = [...document.querySelectorAll('*')].slice(0, 600)

    for (const el of allEls) {
      const style = getComputedStyle(el)
      const label = el.tagName.toLowerCase() +
                    (el.id ? `#${el.id}` : '') +
                    (el.className ? `.${(el.className.toString()).split(' ')[0]}` : '')

      // ── Forbidden transition properties ──────────────────
      const tp = style.transitionProperty
      if (tp && tp !== 'none') {
        const props = tp.split(',').map(p => p.trim().toLowerCase())
        for (const prop of props) {
          if (FORBIDDEN.some(f => prop === f || prop.startsWith(f + '-'))) {
            found.push({
              type: 'forbidden-transition',
              element: label.slice(0, 80),
              property: prop,
              severity: 'HIGH',
              rule: 'Only transform + opacity — never width/height/top/left'
            })
          }
        }
      }

      // ── Preventive will-change ────────────────────────────
      const wc = style.willChange
      if (wc && wc !== 'auto') {
        const hasTransition = parseFloat(style.transitionDuration) > 0
        const hasAnimation  = parseFloat(style.animationDuration)  > 0
        if (!hasTransition && !hasAnimation) {
          found.push({
            type: 'preventive-will-change',
            element: label.slice(0, 80),
            value: wc,
            severity: 'MEDIUM',
            rule: 'No preventive will-change — only set when animation is already active'
          })
        }
      }

      // ── Infinite decorative loops ─────────────────────────
      const iter = style.animationIterationCount
      const name = style.animationName
      if (iter === 'infinite' && name && name !== 'none') {
        const cls = (el.className || '').toString().toLowerCase()
        const isLoader = /\b(spinner|loading|loader|progress|skeleton|pulse)\b/.test(cls)
        if (!isLoader) {
          found.push({
            type: 'infinite-loop',
            element: label.slice(0, 80),
            animationName: name,
            severity: 'MEDIUM',
            rule: 'No infinite decorative loops'
          })
        }
      }
    }

    // Deduplicate — same type+prop combo from different elements counts once
    const seen = new Set()
    const unique = found.filter(p => {
      const key = p.type + ':' + (p.property || p.value || p.animationName || '')
      if (seen.has(key)) return false
      seen.add(key)
      return true
    }).slice(0, 20)

    return {
      clean:   unique.length === 0,
      total:   unique.length,
      high:    unique.filter(p => p.severity === 'HIGH').length,
      medium:  unique.filter(p => p.severity === 'MEDIUM').length,
      patterns: unique
    }
  })
}

// ═══════════════════════════════════════════════════════════════
// QUALITY GATE 3 — IMAGE OPTIMIZATION
// Checks lazy loading, dimensions, srcset, alt, format, oversize.
// ═══════════════════════════════════════════════════════════════
async function auditImageOptimization(page) {
  return page.evaluate(() => {
    const images = [...document.querySelectorAll('img')]
    const results = []

    for (const img of images) {
      const src  = (img.currentSrc || img.src || '').split('?')[0]
      const ext  = src.split('.').pop()?.toLowerCase()
      const name = src.split('/').pop().slice(0, 60)

      const modern     = ['webp', 'avif'].includes(ext)
      const hasLazy    = img.loading === 'lazy'
      const hasDims    = img.hasAttribute('width') && img.hasAttribute('height')
      const hasSrcset  = img.hasAttribute('srcset') || !!img.closest('picture')
      const hasAlt     = img.hasAttribute('alt')
      const inHero     = !!img.closest('[class*="hero"], [class*="banner"], header')

      // Oversize check (natural width > 2.5× rendered width)
      const natW  = img.naturalWidth
      const dispW = img.clientWidth
      const oversized = natW > 0 && dispW > 20 && natW > dispW * 2.5

      const issues = []
      if (!hasAlt)                    issues.push('missing-alt')
      if (!hasDims)                   issues.push('missing-dimensions')
      if (!hasLazy && !inHero)        issues.push('missing-lazy')
      if (!hasSrcset)                 issues.push('no-srcset')
      if (!modern && ['jpg','jpeg','png','gif'].includes(ext)) issues.push('legacy-format')
      if (oversized)                  issues.push(`oversized:${natW}px→${dispW}px`)

      results.push({ name, format: ext || '?', modern, hasLazy, hasDims, hasSrcset, hasAlt, issues })
    }

    const total = results.length
    if (total === 0) return { total: 0, signal: 'PASS', avgScore: 100, issues: [] }

    const rate = key => total ? Math.round(results.filter(r => r[key]).length / total * 100) : 100

    const avgScore = Math.round(
      results.reduce((s, r) => s + Math.round((1 - r.issues.length / 6) * 100), 0) / total
    )
    const signal = avgScore >= 85 ? 'PASS' : avgScore >= 60 ? 'WARN' : 'FAIL'

    return {
      total,
      signal,
      avgScore,
      lazyRate:         rate('hasLazy'),
      dimensionRate:    rate('hasDims'),
      modernFormatRate: rate('modern'),
      altRate:          rate('hasAlt'),
      srcsetRate:       rate('hasSrcset'),
      issues: results.filter(r => r.issues.length > 0).slice(0, 15)
    }
  })
}

// ═══════════════════════════════════════════════════════════════
// QUALITY GATE 4 — HEADING HIERARCHY (SEO + Accessibility)
// Validates: exactly one H1, no skipped levels, headings present.
// ═══════════════════════════════════════════════════════════════
async function validateHeadingHierarchy(page) {
  return page.evaluate(() => {
    const headings = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')]
    const structure = headings.map(h => ({
      level: parseInt(h.tagName[1]),
      text:  h.textContent?.trim().slice(0, 80) || ''
    }))

    const h1Count = structure.filter(h => h.level === 1).length

    // Detect skipped levels (e.g. H1 → H3 skips H2)
    const skips = []
    for (let i = 1; i < structure.length; i++) {
      const prev = structure[i - 1].level
      const curr = structure[i].level
      if (curr > prev + 1) {
        skips.push({ from: `H${prev}`, to: `H${curr}`, text: structure[i].text })
      }
    }

    const issues = []
    if (structure.length === 0) issues.push('no-headings')
    if (h1Count === 0)          issues.push('missing-h1')
    if (h1Count > 1)            issues.push(`multiple-h1:${h1Count}`)
    if (skips.length > 0)       issues.push(`skipped-levels:${skips.length}`)

    return {
      signal:         issues.length === 0 ? 'PASS' : issues.includes('missing-h1') ? 'FAIL' : 'WARN',
      h1Count,
      totalHeadings:  structure.length,
      skippedLevels:  skips,
      issues,
      structure:      structure.slice(0, 20)
    }
  })
}

// ═══════════════════════════════════════════════════════════════
// META TAGS — OG, Twitter Card, canonical, technical SEO
// ═══════════════════════════════════════════════════════════════
async function extractMetaTags(page) {
  return page.evaluate(() => {
    const get  = s => document.querySelector(s)?.getAttribute('content') || null
    const attr = (s, a) => document.querySelector(s)?.getAttribute(a)  || null

    const og = {
      title:       get('meta[property="og:title"]'),
      description: get('meta[property="og:description"]'),
      image:       get('meta[property="og:image"]'),
      type:        get('meta[property="og:type"]'),
      url:         get('meta[property="og:url"]'),
      siteName:    get('meta[property="og:site_name"]'),
    }
    const twitter = {
      card:        get('meta[name="twitter:card"]'),
      title:       get('meta[name="twitter:title"]'),
      description: get('meta[name="twitter:description"]'),
      image:       get('meta[name="twitter:image"]'),
      site:        get('meta[name="twitter:site"]'),
    }

    const hasOG       = !!og.title
    const hasOGImage  = !!og.image
    const hasTwitter  = !!twitter.card
    const hasDesc     = !!get('meta[name="description"]')
    const hasCanon    = !!attr('link[rel="canonical"]', 'href')

    const score = [hasOG, hasOGImage, hasTwitter, hasDesc, hasCanon]
      .filter(Boolean).length                   // 0-5

    return {
      title:       document.title || null,
      description: get('meta[name="description"]'),
      keywords:    get('meta[name="keywords"]'),
      canonical:   attr('link[rel="canonical"]', 'href'),
      viewport:    get('meta[name="viewport"]'),
      themeColor:  get('meta[name="theme-color"]'),
      robots:      get('meta[name="robots"]'),
      og,
      twitter,
      // Completeness
      signal:      score >= 4 ? 'PASS' : score >= 2 ? 'WARN' : 'FAIL',
      score,       // /5
      hasOG, hasOGImage, hasTwitter, hasDesc, hasCanonical: hasCanon
    }
  })
}

// ═══════════════════════════════════════════════════════════════
// SECTION SEMANTIC CLASSIFICATION
// 5-pass cascade: tag → class/id → heading → DOM structure → position
// Types: nav | hero | about | features | services | work | testimonials |
//        pricing | stats | cta | faq | contact | team | process |
//        clients | blog | footer | unknown
// ═══════════════════════════════════════════════════════════════
async function classifySections(page) {
  return page.evaluate(() => {
    // ── Pass 1 & 2 lookup tables ─────────────────────────────
    const CLASS_PATTERNS = {
      nav:          /\b(nav|navigation|menu|topbar|top-bar)\b/,
      hero:         /\b(hero|banner|splash|jumbotron|intro|landing|above-fold)\b/,
      about:        /\b(about|story|mission|who-we|who-i|biography|bio|values)\b/,
      features:     /\b(feature|capability|solution|what-we|what-i)\b/,
      services:     /\b(service|offering|expertise|specialit)\b/,
      work:         /\b(work|project|portfolio|case-stud|showcase|gallery|selected)\b/,
      testimonials: /\b(testimonial|review|feedback|quote|client-say|social-proof|trust)\b/,
      pricing:      /\b(pricing|plan|tier|subscription|package|cost)\b/,
      stats:        /\b(stat|metric|counter|number|achievement|impact|result|figure)\b/,
      cta:          /\b(cta|call-to-action|get-started|sign-up|signup|ready|start-now)\b/,
      faq:          /\b(faq|accordion|question|answer|help)\b/,
      contact:      /\b(contact|get-in-touch|reach-out|hire|inquiry|form)\b/,
      team:         /\b(team|member|people|staff|founder|crew|about-us)\b/,
      process:      /\b(process|how-it|how-we|step|workflow|approach|methodology)\b/,
      clients:      /\b(client|partner|logo|trust|brand|customer|sponsor)\b/,
      blog:         /\b(blog|news|article|post|insight|update|press|journal)\b/,
      footer:       /\b(footer|foot|bottom)\b/,
    }

    const HEADING_KEYWORDS = {
      about:        /\b(about|who we are|who i am|our story|my story|our mission|values)\b/i,
      features:     /\b(features|what we do|what i do|offerings|capabilities|how we help)\b/i,
      services:     /\b(services|what we offer|our services|expertise|specialties)\b/i,
      work:         /\b(work|projects|portfolio|case studies|selected work|our work|built)\b/i,
      team:         /\b(team|meet the|our people|the founders|who.?s behind)\b/i,
      process:      /\b(process|how it works|how we work|our approach|methodology|the steps)\b/i,
      clients:      /\b(clients|partners|trusted by|companies we.?ve|brands|our clients)\b/i,
      faq:          /\b(faq|frequently asked|questions|common questions)\b/i,
      contact:      /\b(contact|get in touch|reach out|let.?s talk|hire me|work with me)\b/i,
      cta:          /\b(get started|start now|ready to|let.?s build|book a|schedule a)\b/i,
      testimonials: /\b(testimonials|what (clients|people|they|customers) say|reviews|kind words)\b/i,
      blog:         /\b(blog|articles|news|insights|latest|thoughts|writing|journal)\b/i,
      stats:        /\b(by the numbers|our impact|results|achievements|in numbers)\b/i,
      pricing:      /\b(pricing|plans|our plans|choose a plan|how much)\b/i,
    }

    // ── Main classification loop ─────────────────────────────
    const candidates = [
      ...document.querySelectorAll('header, nav, footer, section, article, main > div, main > section, [class*="section"], [id*="section"]')
    ]

    // Deduplicate: remove elements that are children of other candidates
    const unique = candidates.filter(el =>
      !candidates.some(other => other !== el && other.contains(el))
    )

    const results = []

    for (const [index, el] of unique.slice(0, 30).entries()) {
      const tag = el.tagName.toLowerCase()
      const identifiers = ((el.className || '').toString() + ' ' + (el.id || '')).toLowerCase()
      const headingEl = el.querySelector('h1, h2, h3')
      const headingText = headingEl?.textContent?.trim().slice(0, 100) || ''
      const bodyText = el.textContent?.toLowerCase().slice(0, 600) || ''

      let type = null
      let confidence = null
      let method = null

      // ── Pass 1: tag ──────────────────────────────────────
      if (tag === 'header') { type = 'nav';    confidence = 'HIGH';   method = 'tag' }
      if (tag === 'nav')    { type = 'nav';    confidence = 'HIGH';   method = 'tag' }
      if (tag === 'footer') { type = 'footer'; confidence = 'HIGH';   method = 'tag' }

      // ── Pass 2: class / id patterns ──────────────────────
      if (!type) {
        for (const [t, pattern] of Object.entries(CLASS_PATTERNS)) {
          if (pattern.test(identifiers)) {
            type = t; confidence = 'HIGH'; method = 'class/id'
            break
          }
        }
      }

      // ── Pass 3: heading text ─────────────────────────────
      if (!type && headingText) {
        for (const [t, pattern] of Object.entries(HEADING_KEYWORDS)) {
          if (pattern.test(headingText)) {
            type = t; confidence = 'MEDIUM'; method = 'heading'
            break
          }
        }
      }

      // ── Pass 4: DOM structure heuristics ─────────────────
      if (!type) {
        const hasPriceSymbol = /(\$|€|£|\bper month\b|\bper year\b|\/mo\b|\/yr\b)/.test(bodyText)
        const hasFormInput   = el.querySelectorAll('input[type="email"], input[type="text"], textarea').length > 0
        const hasForm        = el.querySelector('form') !== null
        const starEls        = el.querySelectorAll('[class*="star"], [class*="rating"], [class*="review"]').length
        const quoteEls       = el.querySelectorAll('blockquote, [class*="quote"], [class*="testimonial"]').length
        const ariaExpanded   = el.querySelectorAll('[aria-expanded]').length
        const logoImgs       = el.querySelectorAll('img[class*="logo"], img[alt*="logo"], img[class*="client"], img[class*="partner"]').length

        // Count leaf text nodes that look like large numbers
        const bigNumberCount = [...el.querySelectorAll('*')].filter(c => {
          if (c.children.length > 0) return false
          const t = c.textContent?.trim() || ''
          return /^\d[\d,.]*[k+%]?$/.test(t) && t.replace(/[^\d]/g, '').length >= 2
        }).length

        if (hasPriceSymbol)                  { type = 'pricing';      confidence = 'MEDIUM'; method = 'content:price'    }
        else if (starEls >= 2 || quoteEls >= 1) { type = 'testimonials'; confidence = 'MEDIUM'; method = 'content:quotes'   }
        else if (hasForm || hasFormInput)    { type = 'contact';      confidence = 'MEDIUM'; method = 'content:form'     }
        else if (ariaExpanded >= 3)          { type = 'faq';          confidence = 'MEDIUM'; method = 'content:accordion' }
        else if (bigNumberCount >= 3)        { type = 'stats';        confidence = 'MEDIUM'; method = 'content:numbers'  }
        else if (logoImgs >= 3)              { type = 'clients';      confidence = 'LOW';    method = 'content:logos'    }
      }

      // ── Pass 5: position fallback ─────────────────────────
      if (!type) {
        const hasH1 = !!el.querySelector('h1')
        if (index === 0 && hasH1) { type = 'hero';    confidence = 'LOW'; method = 'position:first+h1' }
        else if (index === 0)     { type = 'hero';    confidence = 'LOW'; method = 'position:first'    }
      }

      // ── Extract CTA button text ───────────────────────────
      const ctaEl = el.querySelector(
        'a[class*="btn"], a[class*="cta"], a[class*="button"], button[class*="cta"], button[class*="btn"]'
      )
      const ctaText = ctaEl?.textContent?.trim().slice(0, 60) || null

      // ── Count interactive elements ────────────────────────
      const linkCount   = el.querySelectorAll('a[href]').length
      const buttonCount = el.querySelectorAll('button').length
      const imageCount  = el.querySelectorAll('img').length

      results.push({
        index,
        tag,
        type:        type || 'unknown',
        confidence:  confidence || 'LOW',
        method:      method || 'none',
        headingText: headingText || null,
        ctaText,
        linkCount,
        buttonCount,
        imageCount,
      })
    }

    return results
  })
}

// ═══════════════════════════════════════════════════════════════
// EXCELLENCE SIGNALS — score all 5 dimensions (STRONG/MEDIUM/WEAK)
// ═══════════════════════════════════════════════════════════════
function computeExcellenceSignals({ depthMetrics, typographyMetrics, motionProfile, compositionMetrics, interactions, techStack, layoutPatterns }) {
  const score = (val) => val >= 4 ? 'STRONG' : val >= 2 ? 'MEDIUM' : 'WEAK'

  // COMPOSITION
  const compPoints =
    (compositionMetrics?.textAlignmentVariety >= 2 ? 1 : 0) +
    (compositionMetrics?.avgPaddingAsymmetry >= 20 ? 1 : 0) +
    (compositionMetrics?.sections?.some(s => s.hasAbsoluteChild || s.hasNegativeMargin) ? 1 : 0) +
    (compositionMetrics?.containerBreaks > 0 ? 1 : 0) +
    ((layoutPatterns || []).length >= 2 ? 1 : 0)

  // DEPTH
  const depthPoints =
    ((depthMetrics?.zIndexCount || 0) >= 3 ? 1 : 0) +
    (depthMetrics?.hasPseudoElements ? 1 : 0) +
    ((depthMetrics?.backdropFilterCount || 0) > 0 ? 1 : 0) +
    ((depthMetrics?.clipPathCount || 0) > 0 ? 1 : 0) +
    ((interactions?.scrollDiffs?.length || 0) > 0 ? 1 : 0)

  // TYPOGRAPHY
  const typoPoints =
    ((typographyMetrics?.sizeRatio || 0) >= 4 ? 1 : 0) +
    ((typographyMetrics?.sizeCount || 0) >= 4 ? 1 : 0) +
    ((typographyMetrics?.weightCount || 0) >= 2 ? 1 : 0) +
    (typographyMetrics?.hasLetterSpacing ? 1 : 0) +
    (typographyMetrics?.hasClamp ? 1 : 0)

  // MOTION
  const motionPoints =
    ((motionProfile?.cssTransitions?.cubicBezierCount || 0) >= 2 ? 1 : 0) +
    (motionProfile?.gsap?.active ? 1 : 0) +
    (motionProfile?.gsap?.scrollTrigger ? 1 : 0) +
    (motionProfile?.gsap?.scrollTriggerScrub ? 1 : 0) +
    (motionProfile?.cssAnimations?.hasStagger ? 1 : 0)

  // CRAFT
  const craftPoints =
    ((interactions?.hoverStates?.length || 0) >= 2 ? 1 : 0) +
    (techStack?.hasCustomCursor ? 1 : 0) +
    ((depthMetrics?.clipPathCount || 0) > 0 ? 1 : 0) +
    (depthMetrics?.hasGrain ? 1 : 0) +
    ((depthMetrics?.backdropFilterCount || 0) > 0 ? 1 : 0)

  return {
    composition: score(compPoints),
    depth: score(depthPoints),
    typography: score(typoPoints),
    motion: score(motionPoints),
    craft: score(craftPoints),
    _scores: { composition: compPoints, depth: depthPoints, typography: typoPoints, motion: motionPoints, craft: craftPoints }
  }
}

// ═══════════════════════════════════════════════════════════════
// ANALYSIS REPORT — writes analysis.md alongside manifest.json
// ═══════════════════════════════════════════════════════════════
function generateAnalysisReport(manifest, outputDir) {
  const signals = manifest.excellenceSignals || {}
  const palette = manifest.palette || {}
  const typo = manifest.typographyMetrics || {}
  const depth = manifest.depthMetrics || {}
  const motion = manifest.motionProfile || {}
  const comp = manifest.compositionMetrics || {}
  const tech = manifest.techStack || {}
  const scores = signals._scores || {}

  const signalIcon = { STRONG: '✓', MEDIUM: '~', WEAK: '✗' }

  const lines = [
    `# Observer Report: ${manifest.url}`,
    `> Captured: ${manifest.capturedAt} | Observer v4.0`,
    ``,
    `## Summary`,
    `- **Sections detected:** ${manifest.sectionCount}`,
    `- **Tech stack:** ${tech.libraries?.join(', ') || 'none detected'}`,
    `- **CSS custom properties:** ${Object.keys(manifest.cssCustomProperties || {}).length} tokens`,
    `- **Page height:** ${manifest.pageHeight || '?'}px`,
    `- **Has smooth scroll:** ${tech.hasSmoothScroll ? 'yes' : 'no'}`,
    `- **Has custom cursor:** ${tech.hasCustomCursor ? 'yes' : 'no'}`,
    ``,
    `## Excellence Standard Signals`,
    ``,
    `| Dimension | Signal | Score | Evidence |`,
    `|-----------|--------|-------|----------|`,
    `| Composition | ${signalIcon[signals.composition] || '?'} ${signals.composition || '?'} | ${scores.composition || 0}/5 | text-alignments:${comp.textAlignmentVariety || 0} · padding-asymmetry:${comp.avgPaddingAsymmetry || 0}% · container-breaks:${comp.containerBreaks || 0} |`,
    `| Depth | ${signalIcon[signals.depth] || '?'} ${signals.depth || '?'} | ${scores.depth || 0}/5 | z-index-layers:${depth.zIndexCount || 0} · clip-paths:${depth.clipPathCount || 0} · backdrop-filters:${depth.backdropFilterCount || 0} · pseudo-elements:${depth.hasPseudoElements ? 'yes' : 'no'} · grain:${depth.hasGrain ? 'yes' : 'no'} |`,
    `| Typography | ${signalIcon[signals.typography] || '?'} ${signals.typography || '?'} | ${scores.typography || 0}/5 | ratio:${typo.sizeRatio || 0}x · sizes:${typo.sizeCount || 0} · weights:${typo.weightCount || 0} · letter-spacing:${typo.hasLetterSpacing ? 'yes' : 'no'} · clamp:${typo.hasClamp ? 'yes' : 'no'} |`,
    `| Motion | ${signalIcon[signals.motion] || '?'} ${signals.motion || '?'} | ${scores.motion || 0}/5 | cubic-beziers:${motion.cssTransitions?.cubicBezierCount || 0} · gsap:${motion.gsap?.active ? 'yes' : 'no'} · scroll-triggers:${motion.gsap?.scrollTriggerCount || 0} · scrub:${motion.gsap?.scrollTriggerScrub ? 'yes' : 'no'} · stagger:${motion.cssAnimations?.hasStagger ? 'yes' : 'no'} |`,
    `| Craft | ${signalIcon[signals.craft] || '?'} ${signals.craft || '?'} | ${scores.craft || 0}/5 | hover-states:${manifest.interactions?.hoverStates?.length || 0} · custom-cursor:${tech.hasCustomCursor ? 'yes' : 'no'} · clip-path:${(depth.clipPathCount || 0) > 0 ? 'yes' : 'no'} · grain:${depth.hasGrain ? 'yes' : 'no'} |`,
    ``,
  ]

  // Palette + color rhythm
  const sc = manifest.sectionColors || {}
  lines.push(`## Palette`, ``)
  if (palette.textColors?.length) {
    lines.push(`**Text colors:** ${palette.textColors.slice(0, 8).join(' · ')}`)
  }
  if (palette.bgColors?.length) {
    lines.push(`**Background colors:** ${palette.bgColors.slice(0, 8).join(' · ')}`)
  }
  if (sc.rhythm) {
    lines.push(`**Color rhythm:** ${sc.rhythm} (${sc.transitions} theme transitions)`)
  }
  lines.push(``)

  // Typography detail
  lines.push(
    `## Typography`,
    `- **Fonts:** ${(manifest.fonts || []).join(', ') || 'none detected'}`,
    `- **Font sizes:** ${(typo.sizes || []).join(', ')}px`,
    `- **Size ratio:** ${typo.sizeRatio}x (${typo.minSize}px → ${typo.maxSize}px)`,
    `- **Weights:** ${(typo.weights || []).join(', ')}`,
    `- **Letter-spacing:** ${typo.hasLetterSpacing ? (typo.letterSpacingValues || []).join(', ') : 'none'}`,
    `- **Fluid type (clamp):** ${typo.hasClamp ? 'yes' : 'no'}`,
    ``
  )

  // Motion detail
  lines.push(`## Motion Profile`)
  lines.push(`- **CSS transitions:** ${motion.cssTransitions?.count || 0} elements (avg ${motion.cssTransitions?.avgDuration || 0}s)`)
  if (motion.cssTransitions?.cubicBeziers?.length) {
    lines.push(`- **Custom easing curves:**`)
    motion.cssTransitions.cubicBeziers.slice(0, 5).forEach(cb => lines.push(`  - \`${cb}\``))
  }
  lines.push(`- **GSAP:** ${motion.gsap?.active ? `active (${motion.gsap.tweenCount} tweens)` : 'not detected'}`)
  if (motion.gsap?.scrollTrigger) {
    lines.push(`- **ScrollTrigger:** ${motion.gsap.scrollTriggerCount} triggers, ${motion.gsap.scrollTriggerScrubCount} with scrub`)
  }
  lines.push(`- **CSS animations:** ${motion.cssAnimations?.count || 0} (stagger: ${motion.cssAnimations?.hasStagger ? 'yes' : 'no'})`)
  lines.push(``)

  // Depth detail
  lines.push(
    `## Depth & Layering`,
    `- **Z-index layers:** ${depth.zIndexCount || 0} distinct values — [${(depth.zIndexLayers || []).join(', ')}]`,
    `- **Clip-paths:** ${depth.clipPathCount || 0} elements`,
    `- **Backdrop filters:** ${depth.backdropFilterCount || 0} elements`,
    `- **Shadows:** ${depth.shadowCount || 0} elements`,
    `- **Absolute-positioned elements:** ${depth.overlapElements || 0}`,
    `- **Pseudo-elements (::before/::after):** ${depth.hasPseudoElements ? 'yes' : 'no'}`,
    `- **Grain/noise texture:** ${depth.hasGrain ? 'yes' : 'no'}`,
    ``
  )

  // Composition detail
  lines.push(`## Composition`)
  lines.push(`- **Text alignments:** ${(comp.textAlignments || []).join(', ')}`)
  lines.push(`- **Avg padding asymmetry:** ${comp.avgPaddingAsymmetry || 0}%`)
  lines.push(`- **Container breaks (full-bleed elements):** ${comp.containerBreaks || 0}`)
  if (comp.sections?.length) {
    lines.push(`- **Per-section padding:**`)
    comp.sections.slice(0, 8).forEach(s => {
      lines.push(`  - \`.${s.class.split(' ')[0] || s.tag}\` → top:${s.paddingTop}px bottom:${s.paddingBottom}px asymmetry:${s.paddingAsymmetry}%`)
    })
  }
  lines.push(``)

  // CSS Tokens
  const cssProps = Object.entries(manifest.cssCustomProperties || {})
  if (cssProps.length) {
    lines.push(`## CSS Custom Properties (${cssProps.length} tokens)`, ``)
    cssProps.slice(0, 30).forEach(([k, v]) => lines.push(`- \`${k}: ${v}\``))
    if (cssProps.length > 30) lines.push(`- … and ${cssProps.length - 30} more`)
    lines.push(``)
  }

  // Quality Gates
  const qg = manifest.qualityGates || {}
  lines.push(`## Quality Gates`, ``)
  lines.push(`| Gate | Signal | Detail |`)
  lines.push(`|------|--------|--------|`)

  // Contrast
  const ct = qg.contrast || {}
  lines.push(`| Contrast (WCAG AA) | ${ct.signal || '?'} | Pass rate: ${ct.passRate || 0}% · min ratio: ${ct.minRatio || 0} · failing pairs: ${ct.failingAA || 0}/${ct.totalPairs || 0} |`)
  if (ct.failingSamples?.length) {
    ct.failingSamples.slice(0, 4).forEach(s =>
      lines.push(`|  | ↳ | \`${s.tag}\` fg:\`${s.fg}\` bg:\`${s.bg}\` → ratio **${s.ratio}** ${s.large ? '(large text)' : ''} |`)
    )
  }

  // Animation anti-patterns
  const an = qg.animations || {}
  lines.push(`| Animation rules | ${an.clean ? 'PASS' : 'FAIL'} | ${an.clean ? 'No anti-patterns found' : `${an.total} issues — HIGH:${an.high} MEDIUM:${an.medium}`} |`)
  if (!an.clean && an.patterns?.length) {
    an.patterns.slice(0, 4).forEach(p =>
      lines.push(`|  | ↳ | [${p.severity}] \`${p.type}\` on \`${p.element}\` — ${p.property || p.value || p.animationName || ''} |`)
    )
  }

  // Images
  const im = qg.images || {}
  if (im.total > 0) {
    lines.push(`| Images | ${im.signal || '?'} | Score: ${im.avgScore || 0}/100 · lazy:${im.lazyRate || 0}% · dims:${im.dimensionRate || 0}% · modern-format:${im.modernFormatRate || 0}% · alt:${im.altRate || 0}% |`)
    if (im.issues?.length) {
      im.issues.slice(0, 4).forEach(i =>
        lines.push(`|  | ↳ | \`${i.name}\` → ${i.issues.join(', ')} |`)
      )
    }
  } else {
    lines.push(`| Images | PASS | No img elements found |`)
  }

  // Headings
  const hd = qg.headings || {}
  lines.push(`| Heading hierarchy | ${hd.signal || '?'} | H1 count: ${hd.h1Count ?? '?'} · total headings: ${hd.totalHeadings ?? 0} · skipped levels: ${hd.skippedLevels?.length ?? 0}${hd.issues?.length ? ' · issues: ' + hd.issues.join(', ') : ''} |`)
  if (hd.skippedLevels?.length) {
    hd.skippedLevels.forEach(s =>
      lines.push(`|  | ↳ | ${s.from}→${s.to}: "${s.text}" |`)
    )
  }

  // Meta tags
  const mt = manifest.metaTags || {}
  lines.push(`| Meta / SEO | ${mt.signal || '?'} | Score: ${mt.score ?? 0}/5 · OG:${mt.hasOG ? '✓' : '✗'} OG-image:${mt.hasOGImage ? '✓' : '✗'} Twitter:${mt.hasTwitter ? '✓' : '✗'} description:${mt.hasDesc ? '✓' : '✗'} canonical:${mt.hasCanonical ? '✓' : '✗'} |`)

  lines.push(`| **Overall** | **${qg.overall || '?'}** | All 5 gates must PASS |`)
  lines.push(``)

  // Section Map
  const classifications = manifest.sectionClassifications || []
  if (classifications.length) {
    lines.push(`## Section Map`, ``)
    lines.push(`| # | Type | Theme | Confidence | Heading | CTA |`)
    lines.push(`|---|------|-------|-----------|---------|-----|`)

    // Build a theme lookup from sectionColors by index
    const colorByIndex = {}
    for (const sc of (manifest.sectionColors?.sections || [])) {
      colorByIndex[sc.index] = sc
    }

    for (const s of classifications) {
      const heading   = (s.headingText || '—').replace(/\|/g, '/')
      const cta       = (s.ctaText     || '—').replace(/\|/g, '/')
      const colorInfo = colorByIndex[s.index]
      const themePart = colorInfo ? `${colorInfo.theme}${colorInfo.bg ? ` \`${colorInfo.bg}\`` : ''}` : '—'
      lines.push(`| ${s.index} | **${s.type}** | ${themePart} | ${s.confidence} | ${heading} | ${cta} |`)
    }

    // Content strategy summary (sequence of types, ignoring nav/unknown)
    const sequence = classifications
      .filter(s => s.type !== 'nav' && s.type !== 'unknown')
      .map(s => s.type)
    if (sequence.length) {
      lines.push(``)
      lines.push(`**Content strategy:** ${sequence.join(' → ')}`)
    }

    // Type counts
    const typeCounts = {}
    for (const s of classifications) typeCounts[s.type] = (typeCounts[s.type] || 0) + 1
    const countsStr = Object.entries(typeCounts)
      .filter(([t]) => t !== 'unknown')
      .map(([t, n]) => `${t}×${n}`)
      .join(', ')
    if (countsStr) lines.push(`**Section types:** ${countsStr}`)
    lines.push(``)
  }

  // SEO / Meta Tags
  const seoMeta = manifest.metaTags || {}
  if (seoMeta.title || seoMeta.og?.title) {
    lines.push(`## SEO / Meta Tags`, ``)
    if (seoMeta.title)            lines.push(`- **Title:** ${seoMeta.title}`)
    if (seoMeta.description)      lines.push(`- **Description:** ${seoMeta.description}`)
    if (seoMeta.canonical)        lines.push(`- **Canonical:** ${seoMeta.canonical}`)
    if (seoMeta.og?.image)        lines.push(`- **OG Image:** ${seoMeta.og.image}`)
    if (seoMeta.og?.type)         lines.push(`- **OG Type:** ${seoMeta.og.type}`)
    if (seoMeta.twitter?.card)    lines.push(`- **Twitter Card:** ${seoMeta.twitter.card}`)
    if (seoMeta.themeColor)       lines.push(`- **Theme Color:** ${seoMeta.themeColor}`)
    if (seoMeta.robots)           lines.push(`- **Robots:** ${seoMeta.robots}`)
    lines.push(``)
  }

  // Interactions
  lines.push(
    `## Interactions`,
    `- **Hover states captured:** ${manifest.interactions?.hoverStates?.length || 0}`,
    `- **Click states captured:** ${manifest.interactions?.clickStates?.length || 0}`,
    `- **Scroll diffs detected:** ${manifest.interactions?.scrollDiffs?.length || 0}`,
    `- **Header behavior:** ${manifest.interactions?.headerBehavior?.type || 'unknown'}`,
    ``
  )

  const report = lines.join('\n')
  writeFileSync(join(outputDir, 'analysis.md'), report)
  console.log(`[capture]   → analysis.md written`)
  return report
}

// ═══════════════════════════════════════════════════════════════
// AUTO-DISCOVERY — Extract internal pages from nav links
// ═══════════════════════════════════════════════════════════════
async function discoverInternalPages(url, maxPages) {
  const origin = new URL(url).origin
  console.log(`[discover] Scanning nav links at ${url}...`)

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })

  try {
    const page = await browser.newPage()
    await page.setViewport(VIEWPORTS.desktop)
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 })
    await new Promise(r => setTimeout(r, 2000))
    await dismissCookieBanner(page)

    const links = await page.evaluate((originStr) => {
      const navLinks = []
      // Collect from nav, header, and footer
      const containers = document.querySelectorAll('nav, header, [role="navigation"]')
      const seen = new Set()

      for (const container of containers) {
        const anchors = container.querySelectorAll('a[href]')
        for (const a of anchors) {
          let href = a.getAttribute('href')
          if (!href) continue

          // Resolve relative URLs
          try {
            const resolved = new URL(href, originStr).href
            href = resolved
          } catch { continue }

          // Filter: same origin only, no anchors, no files, no external
          if (!href.startsWith(originStr)) continue
          if (href === originStr || href === originStr + '/') continue // skip homepage
          if (href.includes('#') && href.split('#')[0] === originStr) continue // skip anchor-only
          if (/\.(pdf|jpg|png|gif|svg|zip|mp4|webm)$/i.test(href)) continue // skip files

          // Normalize: remove trailing slash, remove query params for dedup
          const normalized = href.split('?')[0].split('#')[0].replace(/\/$/, '')
          if (seen.has(normalized)) continue
          seen.add(normalized)

          const text = a.textContent?.trim().substring(0, 40) || ''
          // Skip empty text or very generic links
          if (!text || text.length < 2) continue

          navLinks.push({
            url: normalized,
            text,
            pathname: new URL(normalized).pathname
          })
        }
      }

      return navLinks
    }, origin)

    // Sort by pathname depth (shallower first) and cap
    const sorted = links
      .sort((a, b) => {
        const depthA = a.pathname.split('/').filter(Boolean).length
        const depthB = b.pathname.split('/').filter(Boolean).length
        return depthA - depthB
      })
      .slice(0, maxPages)

    console.log(`[discover] Found ${links.length} internal links, using top ${sorted.length}:`)
    for (const link of sorted) {
      console.log(`[discover]   ${link.pathname} — "${link.text}"`)
    }

    return sorted
  } finally {
    await browser.close()
  }
}

/** Convert a URL path into a directory suffix: /about → --about, /work/case-1 → --work-case-1 */
function urlToSlug(url) {
  const pathname = new URL(url).pathname
  const slug = pathname.replace(/^\//, '').replace(/\/$/, '').replace(/\//g, '-')
  return slug ? `--${slug}` : ''
}

// ═══════════════════════════════════════════════════════════════
// ENTRY POINT
// ═══════════════════════════════════════════════════════════════

// Phase 1: Expand URLs via auto-discovery
let expandedUrls = []

for (const u of urls) {
  expandedUrls.push(u) // always include the original URL

  if (autoDiscover) {
    try {
      const internalPages = await discoverInternalPages(u, maxInternalPages)
      for (const page of internalPages) {
        expandedUrls.push(page.url)
      }
    } catch (err) {
      console.error(`[discover] ✗ Discovery failed for ${u}: ${err.message} — capturing homepage only`)
    }
  }
}

// Deduplicate (in case batch URLs overlap with discovered pages)
expandedUrls = [...new Set(expandedUrls)]

console.log(`\n[capture] ═══ Capturing ${expandedUrls.length} page(s) ═══\n`)

// Phase 2: Capture each page
const results = []

for (const u of expandedUrls) {
  try {
    const result = await captureReference(u, outputBase, { local: isLocal })
    results.push({ url: u, status: 'ok', manifest: result })
  } catch (err) {
    console.error(`[capture] ✗ Failed: ${u} — ${err.message}`)
    results.push({ url: u, status: 'error', error: err.message })
  }
}

// Phase 3: Write site-level index (groups pages by domain)
const byDomain = {}
for (const r of results) {
  if (r.status !== 'ok') continue
  const domain = r.manifest.domain
  if (!byDomain[domain]) byDomain[domain] = []
  byDomain[domain].push({
    pagePath: r.manifest.pagePath,
    dirName: r.manifest.dirName,
    url: r.url,
    sections: r.manifest.desktop.frames,
    interactions: r.manifest.interactions.hoverStates.length +
                  r.manifest.interactions.clickStates.length +
                  r.manifest.interactions.scrollDiffs.length
  })
}

for (const [domain, pages] of Object.entries(byDomain)) {
  const indexPath = join(outputBase, `${domain}--index.json`)
  writeFileSync(indexPath, JSON.stringify({
    domain,
    capturedAt: new Date().toISOString(),
    totalPages: pages.length,
    pages
  }, null, 2))
  console.log(`[capture] Site index: ${indexPath} (${pages.length} pages)`)
}

// Summary
console.log('\n[capture] ═══ Summary ═══')
for (const r of results) {
  if (r.status === 'ok') {
    const m = r.manifest
    const intCount = m.interactions.hoverStates.length + m.interactions.clickStates.length + m.interactions.scrollDiffs.length
    console.log(`  ✓ ${m.pagePath.padEnd(20)} ${m.desktop.frames} desktop + ${m.mobile.frames} mobile | ${intCount} interactions`)
  } else {
    console.log(`  ✗ ${r.url} — ${r.error}`)
  }
}

if (results.some(r => r.status === 'error')) {
  process.exit(1)
}
