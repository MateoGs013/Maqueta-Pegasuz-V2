#!/usr/bin/env node
/**
 * Reference Capture Script v2
 * Captures desktop + mobile screenshots per section boundary,
 * extracts design tokens, tech stack, CSS custom properties,
 * and writes a rich manifest for the Reference Analyst.
 *
 * Usage:
 *   Single URL:  node capture-refs.mjs <url> [output-dir]
 *   Batch mode:  node capture-refs.mjs --batch <url1> <url2> ... [--out <dir>]
 *
 * Output: _ref-captures/{domain}/
 *   desktop/frame-NNN.png  — per-section desktop screenshots
 *   mobile/frame-NNN.png   — per-section mobile screenshots
 *   full-page-desktop.png  — bird's eye desktop
 *   full-page-mobile.png   — bird's eye mobile
 *   manifest.json          — rich metadata
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

// ── Main capture function ────────────────────────────────────
async function captureReference(url, outputBase) {
  const domain = new URL(url).hostname.replace(/\./g, '-')
  const dir = join(outputBase, domain)
  const desktopDir = join(dir, 'desktop')
  const mobileDir = join(dir, 'mobile')
  mkdirSync(desktopDir, { recursive: true })
  mkdirSync(mobileDir, { recursive: true })

  console.log(`\n[capture] ═══ ${url} ═══`)

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })

  try {
    const page = await browser.newPage()

    // ── Desktop capture ────────────────────────────────────
    console.log('[capture] Desktop pass (1440px)...')
    await page.setViewport(VIEWPORTS.desktop)
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 })
    await new Promise(r => setTimeout(r, 2000))

    // Dismiss cookie banners
    await dismissCookieBanner(page)

    // Wait for preloaders to finish
    await waitForPreloader(page)

    // Detect section boundaries
    const sections = await detectSections(page)
    console.log(`[capture] Found ${sections.length} sections`)

    // Screenshot per section (desktop)
    const desktopFrames = await captureBySection(page, sections, desktopDir, 'desktop')

    // Full-page desktop
    console.log('[capture] Full-page desktop screenshot...')
    await page.screenshot({
      path: join(dir, 'full-page-desktop.png'),
      fullPage: true,
      type: 'png'
    })

    // ── Extract metadata (desktop DOM) ─────────────────────
    console.log('[capture] Extracting metadata...')
    const meta = await extractMetadata(page)
    const techStack = await detectTechStack(page)
    const cssCustomProps = await extractCSSCustomProperties(page)

    // ── Mobile capture ─────────────────────────────────────
    console.log('[capture] Mobile pass (375px)...')
    await page.setViewport(VIEWPORTS.mobile)
    await new Promise(r => setTimeout(r, 1500))

    const mobileSections = await detectSections(page)
    const mobileFrames = await captureBySection(page, mobileSections, mobileDir, 'mobile')

    // Full-page mobile
    console.log('[capture] Full-page mobile screenshot...')
    await page.screenshot({
      path: join(dir, 'full-page-mobile.png'),
      fullPage: true,
      type: 'png'
    })

    // ── Process colors ─────────────────────────────────────
    const allTextHex = meta.rawTextColors.map(rgbaToHex).filter(h => h.startsWith('#'))
    const allBgHex = meta.rawBgColors.map(rgbaToHex).filter(h => h.startsWith('#'))

    const palette = {
      textColors: clusterColors(allTextHex),
      bgColors: clusterColors(allBgHex),
      allUniqueText: [...new Set(allTextHex)],
      allUniqueBg: [...new Set(allBgHex)]
    }

    // ── Build manifest ─────────────────────────────────────
    const manifest = {
      version: 2,
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
        fullPage: 'full-page-mobile.png'
      },

      // Processed palette (clustered hex)
      palette,

      // Typography
      fonts: meta.fonts,
      fontSizes: meta.fontSizes,
      headings: meta.headings,

      // Structural
      sectionCount: sections.length,
      pageHeight: meta.pageHeight,
      title: meta.title,

      // Technology detection
      techStack,

      // CSS Custom Properties from :root
      cssCustomProperties: cssCustomProps,

      // Rich element detection
      media: meta.media,

      // Navigation pattern
      navigation: meta.navigation
    }

    writeFileSync(join(dir, 'manifest.json'), JSON.stringify(manifest, null, 2))
    console.log(`[capture] ✓ Done! Desktop: ${desktopFrames.length} frames, Mobile: ${mobileFrames.length} frames`)
    console.log(`[capture]   Palette: ${palette.textColors.length} text + ${palette.bgColors.length} bg clusters`)
    console.log(`[capture]   Tech: ${techStack.libraries.join(', ') || 'none detected'}`)
    console.log(`[capture]   Saved to ${dir}/\n`)

    return manifest
  } finally {
    await browser.close()
  }
}

// ── Cookie banner dismissal ──────────────────────────────────
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

// ── Wait for preloaders ──────────────────────────────────────
async function waitForPreloader(page) {
  try {
    await page.evaluate(() => {
      return new Promise(resolve => {
        // Check for common preloader patterns
        const preloader = document.querySelector(
          '[class*="preload"], [class*="loader"], [class*="loading"], [id*="preload"], [id*="loader"]'
        )
        if (!preloader || getComputedStyle(preloader).display === 'none') {
          return resolve()
        }
        // Wait for it to disappear (max 8s)
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

// ── Section boundary detection ───────────────────────────────
async function detectSections(page) {
  return page.evaluate(() => {
    // Strategy: find semantic sections, then fall back to direct children of main/body
    const candidates = [
      ...document.querySelectorAll('section'),
      ...document.querySelectorAll('main > div'),
      ...document.querySelectorAll('main > section'),
      ...document.querySelectorAll('[class*="section"]'),
      ...document.querySelectorAll('[class*="Section"]'),
      ...document.querySelectorAll('[data-section]')
    ]

    // Dedupe by element reference and filter tiny elements
    const seen = new Set()
    const sections = []

    for (const el of candidates) {
      if (seen.has(el)) continue
      seen.add(el)
      const rect = el.getBoundingClientRect()
      // Only count elements taller than 100px and wider than half the viewport
      if (rect.height > 100 && rect.width > window.innerWidth * 0.5) {
        sections.push({
          tag: el.tagName.toLowerCase(),
          className: (el.className?.toString?.() || '').split(' ').slice(0, 3).join(' '),
          top: rect.top + window.scrollY,
          height: rect.height
        })
      }
    }

    // Sort by vertical position, deduplicate overlapping ranges
    sections.sort((a, b) => a.top - b.top)

    const deduped = []
    for (const sec of sections) {
      const last = deduped[deduped.length - 1]
      if (last && Math.abs(sec.top - last.top) < 50) continue // skip near-duplicates
      deduped.push(sec)
    }

    // Fallback: if fewer than 3 sections detected, use viewport-height chunks
    if (deduped.length < 3) {
      const totalHeight = document.body.scrollHeight
      const vh = window.innerHeight
      const fallback = []
      for (let y = 0; y < totalHeight; y += vh) {
        fallback.push({
          tag: 'viewport-chunk',
          className: '',
          top: y,
          height: Math.min(vh, totalHeight - y)
        })
      }
      return fallback
    }

    return deduped
  })
}

// ── Screenshot per section ───────────────────────────────────
async function captureBySection(page, sections, outDir, label) {
  const frames = []
  const viewportHeight = label === 'desktop' ? VIEWPORTS.desktop.height : VIEWPORTS.mobile.height

  for (let i = 0; i < sections.length; i++) {
    const sec = sections[i]
    // Scroll so the section top is near the viewport top
    await page.evaluate(y => window.scrollTo({ top: y, behavior: 'instant' }), Math.max(0, sec.top - 40))
    // Wait for scroll-triggered animations
    await new Promise(r => setTimeout(r, 1200))

    const filename = `frame-${String(i).padStart(3, '0')}.png`
    await page.screenshot({
      path: join(outDir, filename),
      type: 'png',
      clip: {
        x: 0,
        y: 0,
        width: label === 'desktop' ? VIEWPORTS.desktop.width : VIEWPORTS.mobile.width,
        height: viewportHeight
      }
    })

    frames.push({
      file: `${label}/${filename}`,
      tag: sec.tag,
      className: sec.className,
      scrollY: sec.top,
      height: sec.height
    })

    console.log(`[capture] ${label} frame ${i + 1}/${sections.length} — ${sec.tag}${sec.className ? '.' + sec.className.split(' ')[0] : ''} at ${Math.round(sec.top)}px`)
  }

  return frames
}

// ── Metadata extraction ──────────────────────────────────────
async function extractMetadata(page) {
  return page.evaluate(() => {
    const all = document.querySelectorAll('*')
    const colorSet = new Set()
    const bgSet = new Set()
    const fontSet = new Set()
    const fontSizes = new Set()

    const limit = Math.min(all.length, 500) // scan up to 500 elements
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
        textTransform: s.textTransform
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

    // Navigation pattern
    const nav = document.querySelector('nav, header nav, [role="navigation"]')
    const navLinks = nav ? nav.querySelectorAll('a').length : 0
    const headerEl = document.querySelector('header')
    const headerStyle = headerEl ? getComputedStyle(headerEl) : null

    return {
      title: document.title,
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
        lottieCount
      },
      navigation: {
        linkCount: navLinks,
        headerPosition: headerStyle?.position || 'unknown',
        headerBg: headerStyle?.backgroundColor || 'unknown'
      }
    }
  })
}

// ── Technology stack detection ────────────────────────────────
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

    // Check for CSS frameworks
    const links = [...document.querySelectorAll('link[href]')].map(l => l.href).join(' ').toLowerCase()
    if (links.includes('tailwind') || document.querySelector('[class*="tw-"]')) libs.push('Tailwind CSS')
    if (links.includes('bootstrap')) libs.push('Bootstrap')

    // Check for smooth scroll class (Lenis indicator)
    if (document.documentElement.classList.contains('lenis') ||
        document.documentElement.classList.contains('lenis-smooth') ||
        document.body.classList.contains('lenis')) {
      if (!libs.includes('Lenis')) libs.push('Lenis')
    }

    // Check for frameworks via meta or DOM signatures
    if (document.querySelector('[data-reactroot], #__next, #__gatsby')) libs.push('React/Next.js')
    if (document.querySelector('#__nuxt, [data-v-]')) libs.push('Vue/Nuxt')
    if (document.querySelector('[_nghost], [ng-version]')) libs.push('Angular')
    if (document.querySelector('[data-astro-cid]')) libs.push('Astro')
    if (document.querySelector('[data-svelte]')) libs.push('Svelte')

    // Deduplicate
    return {
      libraries: [...new Set(libs)],
      hasSmoothScroll: !!document.querySelector('.lenis, .lenis-smooth, [data-scroll-container]'),
      hasScrollDriven: CSS.supports?.('animation-timeline: scroll()') || false,
      hasViewTransitions: !!document.startViewTransition
    }
  })
}

// ── CSS Custom Properties extraction ─────────────────────────
async function extractCSSCustomProperties(page) {
  return page.evaluate(() => {
    const props = {}
    const root = getComputedStyle(document.documentElement)

    // Get custom properties from all stylesheets
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
        } catch { /* CORS-blocked stylesheet — skip */ }
      }
    } catch { /* no stylesheets accessible */ }

    return props
  })
}

// ── Entry point ──────────────────────────────────────────────
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
    console.log(`  ✓ ${r.url} — ${r.manifest.desktop.frames} desktop + ${r.manifest.mobile.frames} mobile frames`)
  } else {
    console.log(`  ✗ ${r.url} — ${r.error}`)
  }
}

if (results.some(r => r.status === 'error')) {
  process.exit(1)
}
