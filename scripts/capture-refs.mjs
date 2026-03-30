#!/usr/bin/env node
/**
 * Reference Capture Script v3
 * Complete 4-pass analysis: Scroll → Hover → Click → Responsive
 *
 * Captures desktop + mobile screenshots per section boundary,
 * extracts design tokens, tech stack, CSS custom properties,
 * runs interaction sweeps (hover states, click states, scroll behaviors),
 * detects spacing systems, and writes a rich manifest.
 *
 * Usage:
 *   Single URL:  node capture-refs.mjs <url> [output-dir]
 *   Batch mode:  node capture-refs.mjs --batch <url1> <url2> ... [--out <dir>]
 *
 * Output: _ref-captures/{domain}/
 *   desktop/frame-NNN.png        — per-section desktop screenshots
 *   mobile/frame-NNN.png         — per-section mobile screenshots
 *   interactions/hover-NNN.png   — hover state captures
 *   interactions/click-NNN.png   — click state captures
 *   interactions/scroll-NNN.png  — scroll behavior captures
 *   full-page-desktop.png
 *   full-page-mobile.png
 *   manifest.json                — rich metadata with interaction data
 */

import puppeteer from 'puppeteer'
import { mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'

// ── CLI parsing ──────────────────────────────────────────────
const args = process.argv.slice(2)

if (args.length === 0) {
  console.error(`Usage:
  Single:  node capture-refs.mjs <url> [output-dir]
  Batch:   node capture-refs.mjs --batch <url1> <url2> ... [--out <dir>]`)
  process.exit(1)
}

let urls = []
let outputBase = '_ref-captures'

if (args[0] === '--batch') {
  const outIdx = args.indexOf('--out')
  if (outIdx !== -1) {
    outputBase = args[outIdx + 1]
    urls = args.slice(1, outIdx)
  } else {
    urls = args.slice(1)
  }
} else {
  urls = [args[0]]
  if (args[1]) outputBase = args[1]
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
async function captureReference(url, outputBase) {
  const domain = new URL(url).hostname.replace(/\./g, '-')
  const dir = join(outputBase, domain)
  const desktopDir = join(dir, 'desktop')
  const mobileDir = join(dir, 'mobile')
  const interactionsDir = join(dir, 'interactions')
  mkdirSync(desktopDir, { recursive: true })
  mkdirSync(mobileDir, { recursive: true })
  mkdirSync(interactionsDir, { recursive: true })

  console.log(`\n[capture] ═══ ${url} ═══`)

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

    await dismissCookieBanner(page)
    await waitForPreloader(page)

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
    await dismissCookieBanner(page)
    await waitForPreloader(page)
    const clickStates = await runClickSweep(page, interactionsDir)

    // ─────────────────────────────────────────────────────────
    // PASS 4: RESPONSIVE SWEEP (mobile)
    // ─────────────────────────────────────────────────────────
    console.log('[capture] ── Pass 4: Responsive sweep (mobile 375px) ──')
    await page.setViewport(VIEWPORTS.mobile)
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 })
    await new Promise(r => setTimeout(r, 2000))
    await dismissCookieBanner(page)
    await waitForPreloader(page)

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
      version: 3,
      url,
      domain,
      capturedAt: new Date().toISOString(),

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

      // ── NEW in v3: Interaction sweep data ──
      interactions: {
        scrollDiffs,
        headerBehavior,
        hoverStates,
        clickStates
      },

      // ── NEW in v3: Layout & spacing analysis ──
      spacingSystem,
      layoutPatterns,

      navigation: {
        ...meta.navigation,
        mobile: mobileNav
      }
    }

    writeFileSync(join(dir, 'manifest.json'), JSON.stringify(manifest, null, 2))

    const interactionCount = hoverStates.length + clickStates.length + scrollDiffs.length
    console.log(`[capture] ✓ Done!`)
    console.log(`[capture]   Desktop: ${desktopFrames.length} frames | Mobile: ${mobileFrames.length} frames`)
    console.log(`[capture]   Interactions: ${hoverStates.length} hover + ${clickStates.length} click + ${scrollDiffs.length} scroll diffs`)
    console.log(`[capture]   Header: ${headerBehavior.type}`)
    console.log(`[capture]   Palette: ${palette.textColors.length} text + ${palette.bgColors.length} bg clusters`)
    console.log(`[capture]   Spacing: ${spacingSystem.scale.length} values detected`)
    console.log(`[capture]   Tech: ${techStack.libraries.join(', ') || 'none detected'}`)
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
// ENTRY POINT
// ═══════════════════════════════════════════════════════════════
const results = []

for (const u of urls) {
  try {
    const result = await captureReference(u, outputBase)
    results.push({ url: u, status: 'ok', manifest: result })
  } catch (err) {
    console.error(`[capture] ✗ Failed: ${u} — ${err.message}`)
    results.push({ url: u, status: 'error', error: err.message })
  }
}

// Summary
console.log('\n[capture] ═══ Summary ═══')
for (const r of results) {
  if (r.status === 'ok') {
    const m = r.manifest
    const intCount = m.interactions.hoverStates.length + m.interactions.clickStates.length + m.interactions.scrollDiffs.length
    console.log(`  ✓ ${r.url}`)
    console.log(`    ${m.desktop.frames} desktop + ${m.mobile.frames} mobile frames | ${intCount} interactions captured`)
  } else {
    console.log(`  ✗ ${r.url} — ${r.error}`)
  }
}

if (results.some(r => r.status === 'error')) {
  process.exit(1)
}
