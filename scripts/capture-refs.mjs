#!/usr/bin/env node
/**
 * Reference Capture Script
 * Scrolls through a URL, takes viewport screenshots every scroll-step,
 * extracts visual metadata, and saves everything for analysis.
 *
 * Usage: node capture-refs.mjs <url> [output-dir]
 * Output: screenshots + manifest.json in output-dir/{domain}/
 *
 * The CEO console runs this before spawning the Reference Analyst.
 * Screenshots are temporary — deleted after development completes.
 */

import puppeteer from 'puppeteer'
import { mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'

const url = process.argv[2]
const outputBase = process.argv[3] || '_ref-captures'

if (!url) {
  console.error('Usage: node capture-refs.mjs <url> [output-dir]')
  process.exit(1)
}

async function captureReference(url, outputBase) {
  const domain = new URL(url).hostname.replace(/\./g, '-')
  const dir = join(outputBase, domain)
  mkdirSync(dir, { recursive: true })

  console.log(`[capture] Opening ${url}...`)
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })

  const page = await browser.newPage()
  await page.setViewport({ width: 1440, height: 900 })

  // Navigate and wait for everything to load
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 })
  // Extra wait for lazy-loaded content and animations
  await new Promise(r => setTimeout(r, 2000))

  // Get page dimensions
  const pageHeight = await page.evaluate(() => document.body.scrollHeight)
  const viewportHeight = 900
  const totalFrames = Math.ceil(pageHeight / viewportHeight)

  console.log(`[capture] Page height: ${pageHeight}px, capturing ${totalFrames} frames...`)

  // Frame-by-frame scroll capture (1 frame per viewport height)
  for (let i = 0; i < totalFrames; i++) {
    const scrollY = i * viewportHeight
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), scrollY)
    // Wait for scroll-triggered animations and lazy content
    await new Promise(r => setTimeout(r, 1000))

    const filename = `frame-${String(i).padStart(3, '0')}.png`
    await page.screenshot({
      path: join(dir, filename),
      type: 'png'
    })
    console.log(`[capture] Frame ${i + 1}/${totalFrames} at scroll ${scrollY}px`)
  }

  // Full-page screenshot (bird's eye view)
  console.log('[capture] Taking full-page screenshot...')
  await page.screenshot({
    path: join(dir, 'full-page.png'),
    fullPage: true,
    type: 'png'
  })

  // Extract visual metadata from the page
  console.log('[capture] Extracting visual metadata...')
  const meta = await page.evaluate(() => {
    const all = document.querySelectorAll('*')
    const colorSet = new Set()
    const bgSet = new Set()
    const fontSet = new Set()
    const fontSizes = new Set()

    all.forEach(el => {
      const s = getComputedStyle(el)
      const color = s.color
      const bg = s.backgroundColor

      // Only collect non-transparent, non-default values
      if (color && color !== 'rgba(0, 0, 0, 0)') colorSet.add(color)
      if (bg && bg !== 'rgba(0, 0, 0, 0)') bgSet.add(bg)
      if (s.fontFamily) fontSet.add(s.fontFamily.split(',')[0].trim().replace(/['"]/g, ''))
      if (s.fontSize) fontSizes.add(s.fontSize)
    })

    // Count section-like elements
    const sectionSelectors = 'section, [class*="section"], [class*="Section"], main > div, main > section'
    const sections = document.querySelectorAll(sectionSelectors)

    // Detect headings
    const headings = []
    document.querySelectorAll('h1, h2, h3').forEach(h => {
      headings.push({
        tag: h.tagName,
        text: h.textContent.trim().substring(0, 100),
        fontSize: getComputedStyle(h).fontSize,
        fontFamily: getComputedStyle(h).fontFamily.split(',')[0].trim().replace(/['"]/g, '')
      })
    })

    return {
      title: document.title,
      textColors: [...colorSet].slice(0, 20),
      bgColors: [...bgSet].slice(0, 20),
      fonts: [...fontSet].slice(0, 10),
      fontSizes: [...fontSizes].sort().slice(0, 15),
      sectionCount: sections.length,
      headings: headings.slice(0, 20),
      pageHeight: document.body.scrollHeight,
      hasVideo: document.querySelectorAll('video').length > 0,
      hasCanvas: document.querySelectorAll('canvas').length > 0,
      hasSVG: document.querySelectorAll('svg').length > 0
    }
  })

  // Write manifest
  const manifest = {
    url,
    domain,
    capturedAt: new Date().toISOString(),
    viewport: { width: 1440, height: 900 },
    frames: totalFrames,
    fullPage: 'full-page.png',
    frameFiles: Array.from({ length: totalFrames }, (_, i) =>
      `frame-${String(i).padStart(3, '0')}.png`
    ),
    ...meta
  }

  writeFileSync(join(dir, 'manifest.json'), JSON.stringify(manifest, null, 2))
  console.log(`[capture] Done! ${totalFrames} frames + full-page + manifest saved to ${dir}/`)

  await browser.close()
  return manifest
}

try {
  const result = await captureReference(url, outputBase)
  console.log(JSON.stringify(result, null, 2))
} catch (err) {
  console.error(`[capture] Error: ${err.message}`)
  process.exit(1)
}
