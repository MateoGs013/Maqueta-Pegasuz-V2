#!/usr/bin/env node
/**
 * eros-audit.mjs — Quality Chain for Auto-Training V2
 *
 * Runs 5 audit layers against a built project, using observer output
 * and source code analysis. Returns a structured scorecard.
 *
 * Layers:
 *   1. a11y       — heading hierarchy, ARIA landmarks, alt text, focus-visible
 *   2. seo        — meta tags, OG tags, canonical, lang attribute
 *   3. responsive — media queries, clamp(), container queries, viewport meta
 *   4. css        — token usage vs magic numbers, no pure #000/#fff, no AI fonts
 *   5. perf       — lazy loading, async/defer scripts, no will-change preventive
 *
 * Usage:
 *   node eros-audit.mjs --project <path>                    # full audit
 *   node eros-audit.mjs --project <path> --layer a11y       # single layer
 *   node eros-audit.mjs --project <path> --observer <path>  # with observer data
 */

import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs, readJson, readText, writeJson, ensureDir, out, fail } from '../lib/utils.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const log = (msg) => process.stderr.write(`[eros-audit] ${msg}\n`)

// ---------------------------------------------------------------------------
// Source code collector
// ---------------------------------------------------------------------------

const collectSource = async (srcDir, projectDir) => {
  const files = { vue: [], css: [], js: [], html: [] }
  const walk = async (dir) => {
    const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => [])
    for (const e of entries) {
      const full = path.join(dir, e.name)
      if (e.isDirectory() && e.name !== 'node_modules' && e.name !== '.git') {
        await walk(full)
      } else if (e.isFile()) {
        const content = await fs.readFile(full, 'utf8').catch(() => '')
        if (!content) continue
        if (e.name.endsWith('.vue')) files.vue.push({ path: full, content })
        else if (e.name.endsWith('.css')) files.css.push({ path: full, content })
        else if (e.name.endsWith('.js') || e.name.endsWith('.mjs')) files.js.push({ path: full, content })
      }
    }
  }
  await walk(srcDir)

  // ── Include index.html at project root (NOT under src/) ──
  // Previously this file was skipped entirely, which made every SEO check
  // fail deterministically (title, meta, lang, viewport, OG all live in
  // index.html in a Vue SPA scaffold). Also include dist/index.html if
  // the project was built, which has the full resolved meta tags.
  if (projectDir) {
    for (const relPath of ['index.html', path.join('dist', 'index.html')]) {
      const full = path.join(projectDir, relPath)
      try {
        const content = await fs.readFile(full, 'utf8')
        if (content) files.html.push({ path: full, content })
      } catch { /* not built or not present — skip */ }
    }
  }

  return files
}

// Parse Vue SFC <template> blocks to get rendered markup. A naive regex
// approach but good enough for regex-based a11y checks that look for h1,
// nav, main, etc. in project source.
const extractVueTemplates = (vueFiles) => {
  return vueFiles
    .map((f) => {
      const match = f.content.match(/<template[^>]*>([\s\S]*?)<\/template>/)
      return match ? match[1] : ''
    })
    .join('\n')
}

const allContent = (files) => [
  ...files.vue.map(f => f.content),
  ...files.css.map(f => f.content),
  ...files.js.map(f => f.content),
  ...(files.html || []).map(f => f.content),
].join('\n')

// HTML-only content — index.html and dist/index.html when present.
// Used by checks that specifically look for <head> metadata (title,
// viewport, lang, OG tags) which only exist in index.html.
const htmlContent = (files) => (files.html || []).map(f => f.content).join('\n')

// ---------------------------------------------------------------------------
// Layer 1: Accessibility
// ---------------------------------------------------------------------------

const auditA11y = (files, observer) => {
  const all = allContent(files)
  const checks = []
  let score = 0
  const total = 7

  // 1. Heading hierarchy — h1 exists, no skipped levels
  const h1Count = (all.match(/<h1[\s>]/g) || []).length
  checks.push({ name: 'h1 exists', pass: h1Count >= 1, detail: `${h1Count} h1 tags` })
  if (h1Count >= 1) score++

  // Check no skipped heading levels (h1→h3 without h2)
  const headings = [...all.matchAll(/<h([1-6])[\s>]/g)].map(m => parseInt(m[1]))
  let skipped = false
  for (let i = 1; i < headings.length; i++) {
    if (headings[i] - headings[i - 1] > 1) { skipped = true; break }
  }
  checks.push({ name: 'no skipped heading levels', pass: !skipped })
  if (!skipped) score++

  // 2. ARIA landmarks — at least main, nav
  const hasMain = /<main[\s>]|role="main"/i.test(all)
  const hasNav = /<nav[\s>]|role="navigation"/i.test(all)
  checks.push({ name: 'landmark: main', pass: hasMain })
  checks.push({ name: 'landmark: nav', pass: hasNav })
  if (hasMain) score++
  if (hasNav) score++

  // 3. Alt text on images
  const imgs = (all.match(/<img\s[^>]*>/g) || [])
  const imgsWithAlt = imgs.filter(tag => /alt=/.test(tag))
  const altRatio = imgs.length > 0 ? imgsWithAlt.length / imgs.length : 1
  checks.push({ name: 'images have alt', pass: altRatio >= 0.9, detail: `${imgsWithAlt.length}/${imgs.length}` })
  if (altRatio >= 0.9) score++

  // 4. focus-visible usage
  const hasFocusVisible = /focus-visible/.test(all)
  checks.push({ name: 'focus-visible used', pass: hasFocusVisible })
  if (hasFocusVisible) score++

  // 5. aria-label on interactive elements (from observer if available)
  if (observer?.semantic) {
    const ariaScore = observer.semantic.ariaScore || 0
    checks.push({ name: 'observer ARIA score', pass: ariaScore >= 6, detail: `${ariaScore}/10` })
    if (ariaScore >= 6) score++
  } else {
    const ariaLabels = (all.match(/aria-label/g) || []).length
    checks.push({ name: 'aria-label usage', pass: ariaLabels >= 3, detail: `${ariaLabels} instances` })
    if (ariaLabels >= 3) score++
  }

  return { layer: 'a11y', score, total, pct: Math.round(score / total * 100), checks }
}

// ---------------------------------------------------------------------------
// Layer 2: SEO
// ---------------------------------------------------------------------------

const auditSeo = (files) => {
  // SEO checks are MARKUP-only: they look at index.html specifically,
  // not Vue templates (since these tags live in the static HTML head).
  // Fall back to all content if no index.html was found (legacy behavior).
  const html = htmlContent(files)
  const markup = html || allContent(files)
  const all = allContent(files)
  const checks = []
  let score = 0
  const total = 6

  // 1. <title> or useHead/document.title
  // Title can live in index.html OR be set dynamically via useHead in code.
  const hasTitle = /<title[\s>]/i.test(markup) || /useHead|document\.title/i.test(all)
  checks.push({ name: 'title defined', pass: hasTitle })
  if (hasTitle) score++

  // 2. meta description
  const hasMetaDesc = /<meta[^>]+name=["']description["']/i.test(markup)
    || /useHead[\s\S]*description/i.test(all)
  checks.push({ name: 'meta description', pass: hasMetaDesc })
  if (hasMetaDesc) score++

  // 3. OG tags
  const hasOG = /og:title|og:description|og:image/i.test(markup)
    || /og:title|og:description|og:image/i.test(all)
  checks.push({ name: 'Open Graph tags', pass: hasOG })
  if (hasOG) score++

  // 4. lang attribute on <html>
  const hasLang = /<html[^>]+lang=/i.test(markup)
  checks.push({ name: 'lang attribute', pass: hasLang })
  if (hasLang) score++

  // 5. viewport meta
  const hasViewport = /<meta[^>]+name=["']viewport["']/i.test(markup)
  checks.push({ name: 'viewport meta', pass: hasViewport })
  if (hasViewport) score++

  // 6. Semantic HTML (section/article/aside usage across Vue templates + index.html)
  const semanticTags = (all.match(/<(section|article|aside|header|footer|main|nav)[\s>]/g) || []).length
  checks.push({ name: 'semantic HTML tags', pass: semanticTags >= 3, detail: `${semanticTags} tags` })
  if (semanticTags >= 3) score++

  return { layer: 'seo', score, total, pct: Math.round(score / total * 100), checks }
}

// ---------------------------------------------------------------------------
// Layer 3: Responsive
// ---------------------------------------------------------------------------

const auditResponsive = (files) => {
  const all = allContent(files)
  const checks = []
  let score = 0
  const total = 6

  // 1. Media queries exist
  const mediaQueries = (all.match(/@media/g) || []).length
  checks.push({ name: 'media queries', pass: mediaQueries >= 2, detail: `${mediaQueries} found` })
  if (mediaQueries >= 2) score++

  // 2. Mobile breakpoint (375/390/480)
  const hasMobile = /375|390|max-width:\s*48[0-9]|max-width:\s*4[0-7][0-9]/i.test(all)
  checks.push({ name: 'mobile breakpoint', pass: hasMobile })
  if (hasMobile) score++

  // 3. Tablet breakpoint (768/1024)
  const hasTablet = /768|1024|min-width:\s*76[89]|min-width:\s*102[4-9]/i.test(all)
  checks.push({ name: 'tablet breakpoint', pass: hasTablet })
  if (hasTablet) score++

  // 4. clamp() for fluid typography
  const clampUsage = (all.match(/clamp\(/g) || []).length
  checks.push({ name: 'clamp() usage', pass: clampUsage >= 1, detail: `${clampUsage} uses` })
  if (clampUsage >= 1) score++

  // 5. No fixed widths on containers (px widths > 1200 without max-width)
  const fixedWide = (all.match(/width:\s*\d{4,}px/g) || []).filter(m => {
    const val = parseInt(m.match(/\d+/)[0])
    return val > 1200
  }).length
  checks.push({ name: 'no hardcoded wide widths', pass: fixedWide === 0, detail: `${fixedWide} violations` })
  if (fixedWide === 0) score++

  // 6. gsap.matchMedia() for responsive animations
  const hasGsapMM = /gsap\.matchMedia|matchMedia/i.test(all)
  checks.push({ name: 'gsap.matchMedia()', pass: hasGsapMM })
  if (hasGsapMM) score++

  return { layer: 'responsive', score, total, pct: Math.round(score / total * 100), checks }
}

// ---------------------------------------------------------------------------
// Layer 4: CSS Quality
// ---------------------------------------------------------------------------

const auditCss = (files) => {
  const all = allContent(files)
  const checks = []
  let score = 0
  const total = 7

  // 1. CSS custom properties (tokens) usage
  const tokenUsage = (all.match(/var\(--/g) || []).length
  checks.push({ name: 'CSS token usage', pass: tokenUsage >= 10, detail: `${tokenUsage} var(--) uses` })
  if (tokenUsage >= 10) score++

  // 2. No magic color numbers (hex outside :root/tokens)
  // Count inline hex colors that aren't in variable declarations
  const inlineHex = (all.match(/(?<!--)(?:color|background|border|fill|stroke):\s*#[0-9a-f]{3,8}/gi) || []).length
  const tokenColors = (all.match(/--[\w-]+:\s*#[0-9a-f]{3,8}/gi) || []).length
  const magicColorRatio = tokenColors > 0 ? inlineHex / (tokenColors + inlineHex) : (inlineHex > 0 ? 1 : 0)
  checks.push({ name: 'colors via tokens', pass: magicColorRatio < 0.4, detail: `${inlineHex} inline / ${tokenColors} token defs` })
  if (magicColorRatio < 0.4) score++

  // 3. No pure #000 or #fff
  const pureBlack = (all.match(/#000(?:000)?(?:\b|;)/g) || []).length
  const pureWhite = (all.match(/#fff(?:fff)?(?:\b|;)/g) || []).length
  checks.push({ name: 'no pure #000/#fff', pass: pureBlack + pureWhite === 0, detail: `#000: ${pureBlack}, #fff: ${pureWhite}` })
  if (pureBlack + pureWhite === 0) score++

  // 4. No AI fingerprint fonts
  const aifonts = /\bInter\b|\bRoboto\b|\bArial\b|\bsystem-ui\b/i.test(all)
  checks.push({ name: 'no AI fingerprint fonts', pass: !aifonts })
  if (!aifonts) score++

  // 5. Custom easing (cubic-bezier, not just 'ease')
  const customEasing = (all.match(/cubic-bezier/g) || []).length
  const defaultEasing = (all.match(/ease(?!-)|ease;|ease\)/g) || []).length
  checks.push({ name: 'custom easing curves', pass: customEasing >= 2, detail: `${customEasing} cubic-bezier, ${defaultEasing} default` })
  if (customEasing >= 2) score++

  // 6. No will-change preventive
  const willChange = (all.match(/will-change/g) || []).length
  checks.push({ name: 'no will-change preventive', pass: willChange === 0, detail: `${willChange} uses` })
  if (willChange === 0) score++

  // 7. autoAlpha instead of bare opacity for fades
  const autoAlpha = (all.match(/autoAlpha/g) || []).length
  const bareOpacity = (all.match(/gsap.*opacity(?!.*autoAlpha)|\.to\(.*opacity/g) || []).length
  checks.push({ name: 'autoAlpha for fades', pass: autoAlpha >= 1 || bareOpacity === 0, detail: `${autoAlpha} autoAlpha, ${bareOpacity} bare opacity` })
  if (autoAlpha >= 1 || bareOpacity === 0) score++

  return { layer: 'css', score, total, pct: Math.round(score / total * 100), checks }
}

// ---------------------------------------------------------------------------
// Layer 5: Performance
// ---------------------------------------------------------------------------

const auditPerf = (files) => {
  const all = allContent(files)
  const checks = []
  let score = 0
  const total = 6

  // 1. Lazy loading on images
  const allImgs = (all.match(/<img\s[^>]*>/g) || [])
  const lazyImgs = allImgs.filter(tag => /loading\s*=\s*["']lazy["']/i.test(tag))
  const lazyRatio = allImgs.length > 0 ? lazyImgs.length / allImgs.length : 1
  checks.push({ name: 'lazy loading images', pass: lazyRatio >= 0.5, detail: `${lazyImgs.length}/${allImgs.length}` })
  if (lazyRatio >= 0.5) score++

  // 2. Images have width+height (prevents CLS)
  const sizedImgs = allImgs.filter(tag => /width=/.test(tag) && /height=/.test(tag))
  const sizedRatio = allImgs.length > 0 ? sizedImgs.length / allImgs.length : 1
  checks.push({ name: 'images have width+height', pass: sizedRatio >= 0.5, detail: `${sizedImgs.length}/${allImgs.length}` })
  if (sizedRatio >= 0.5) score++

  // 3. Lazy route imports
  const lazyRoutes = /import\s*\(/.test(all) || /defineAsyncComponent/.test(all)
  checks.push({ name: 'lazy route imports', pass: lazyRoutes })
  if (lazyRoutes) score++

  // 4. No infinite decorative animations
  const infiniteAnims = (all.match(/infinite/g) || []).length
  checks.push({ name: 'no infinite decorative loops', pass: infiniteAnims <= 1, detail: `${infiniteAnims} infinite anims` })
  if (infiniteAnims <= 1) score++

  // 5. GSAP plugins registered in main.js (not per-component)
  const mainFiles = files.js.filter(f => f.path.includes('main.'))
  const mainContent = mainFiles.map(f => f.content).join('')
  const gsapRegisterInMain = /gsap\.registerPlugin/.test(mainContent)
  // Allow if no GSAP at all
  const usesGsap = /gsap/.test(all)
  checks.push({ name: 'GSAP plugins in main.js', pass: gsapRegisterInMain || !usesGsap })
  if (gsapRegisterInMain || !usesGsap) score++

  // 6. No axios outside api.js
  const axiosFiles = [...files.vue, ...files.js].filter(f =>
    /axios/.test(f.content) && !f.path.includes('api.js') && !f.path.includes('api.mjs')
  )
  checks.push({ name: 'no axios outside api.js', pass: axiosFiles.length === 0, detail: `${axiosFiles.length} violations` })
  if (axiosFiles.length === 0) score++

  return { layer: 'perf', score, total, pct: Math.round(score / total * 100), checks }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const LAYERS = { a11y: auditA11y, seo: auditSeo, responsive: auditResponsive, css: auditCss, perf: auditPerf }

const main = async () => {
  const args = parseArgs(process.argv.slice(2))
  const project = args.project
  if (!project) fail('--project is required')

  const srcDir = path.join(project, 'src')
  const layerFilter = args.layer || null

  // Collect source (src/ tree + project-root index.html + dist/index.html)
  log('Collecting source files...')
  const files = await collectSource(srcDir, project)
  log(`Found ${files.vue.length} Vue, ${files.css.length} CSS, ${files.js.length} JS, ${(files.html || []).length} HTML files`)

  // Load observer data if available
  let observer = null
  const observerPath = args.observer || path.join(project, '.brain', 'observer', 'localhost', 'manifest.json')
  observer = await readJson(observerPath)

  // Run layers
  const results = []
  for (const [name, fn] of Object.entries(LAYERS)) {
    if (layerFilter && name !== layerFilter) continue
    const result = name === 'a11y' ? fn(files, observer) : fn(files)
    results.push(result)
    log(`${name}: ${result.score}/${result.total} (${result.pct}%)`)
  }

  // Compute overall
  const totalScore = results.reduce((s, r) => s + r.score, 0)
  const totalMax = results.reduce((s, r) => s + r.total, 0)
  const overallPct = Math.round(totalScore / totalMax * 100)

  const scorecard = {
    overall: { score: totalScore, total: totalMax, pct: overallPct },
    layers: results,
    pass: overallPct >= 60,
    auditedAt: new Date().toISOString(),
  }

  // Save scorecard
  const reportDir = path.join(project, '.brain', 'reports', 'quality')
  await ensureDir(reportDir)
  await writeJson(path.join(reportDir, 'audit.json'), scorecard)

  log(`Overall: ${totalScore}/${totalMax} (${overallPct}%) — ${scorecard.pass ? 'PASS' : 'FAIL'}`)

  out(scorecard)
}

main().catch(err => { log(`Fatal: ${err.message}`); process.exit(1) })
