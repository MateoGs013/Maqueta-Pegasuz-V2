/** Observer V3 — Pass 2: Perceptual Analysis (CDP + browser APIs) */
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const defaultConfig = JSON.parse(readFileSync(join(__dirname, 'config.json'), 'utf-8'))

// ── helpers ──────────────────────────────────────────────────
function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return [0, 0, l]
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h = 0
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
  else if (max === g) h = ((b - r) / d + 2) / 6
  else h = ((r - g) / d + 4) / 6
  return [Math.round(h * 360), s, l]
}
function hueDistance(a, b) { const d = Math.abs(a - b); return Math.min(d, 360 - d) }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)) }

// ── CDP Animation Analysis ───────────────────────────────────
async function analyzeAnimations(page, session, config) {
  await session.send('Animation.enable')
  const animations = []
  session.on('Animation.animationCreated', async ({ id }) => {
    try { animations.push(await session.send('Animation.getAnimation', { animationId: id })) } catch {}
  })
  // Scroll to trigger animations
  const totalHeight = await page.evaluate(() => document.documentElement.scrollHeight)
  const vh = await page.evaluate(() => window.innerHeight)
  const steps = Math.min(20, Math.ceil(totalHeight / vh))
  for (let i = 0; i < steps; i++) {
    await page.evaluate(y => window.scrollTo(0, y), (i + 1) * vh * 0.8)
    await page.waitForTimeout(150)
  }
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(500)

  const BAD_EASINGS = config.easingQuality?.bad || ['linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out']
  let customEasingCount = 0, defaultEasingCount = 0, cssCount = 0, webCount = 0
  const uniqueTimingFns = new Set(), durations = []
  for (const anim of animations) {
    const src = anim.animation?.source
    const tf = src?.timingFunction || 'ease'
    uniqueTimingFns.add(tf)
    durations.push(src?.duration || 0)
    BAD_EASINGS.includes(tf) ? defaultEasingCount++ : customEasingCount++
    const type = anim.animation?.type
    ;(type === 'CSSAnimation' || type === 'CSSTransition') ? cssCount++ : webCount++
  }
  const delays = animations.map(a => a.animation?.source?.delay || 0).filter(d => d > 0)
  const hasStagger = delays.length >= 3 && delays.some((d, i) => i > 0 && d > delays[i - 1])
  const total = customEasingCount + defaultEasingCount
  const easingQuality = total === 0 ? 5 : clamp(Math.round((customEasingCount / total) * 10), 0, 10)
  const valid = durations.filter(d => d > 0)
  const durationStats = {
    min: valid.length ? Math.min(...valid) : 0,
    max: valid.length ? Math.max(...valid) : 0,
    avg: valid.length ? Math.round(valid.reduce((a, b) => a + b, 0) / valid.length) : 0
  }
  await session.send('Animation.disable').catch(() => {})
  return { count: animations.length, easingQuality, uniqueTimingFunctions: uniqueTimingFns.size,
    staggerDetected: hasStagger, durationStats, types: { css: cssCount, web: webCount } }
}

// ── CDP LayerTree — GPU Compositing ──────────────────────────
async function analyzeGpuLayers(page, session) {
  let gpuLayers = []
  try {
    await session.send('LayerTree.enable')
    await page.waitForTimeout(500)
    const layerHandler = ({ layers }) => { if (layers) gpuLayers = layers }
    session.on('LayerTree.layerTreeDidChange', layerHandler)
    await page.evaluate(() => { window.scrollBy(0, 1); window.scrollBy(0, -1) })
    await page.waitForTimeout(300)
    session.off('LayerTree.layerTreeDidChange', layerHandler)
    await session.send('LayerTree.disable').catch(() => {})
  } catch {}
  return { count: gpuLayers.length, overCompositing: gpuLayers.length > 50 }
}

// ── Core Web Vitals ──────────────────────────────────────────
async function measureCWV(page) {
  const cwv = await page.evaluate(() => new Promise(resolve => {
    const r = { lcp: null, cls: 0, tbt: 0 }
    try { new PerformanceObserver(l => {
      const e = l.getEntries(); if (e.length) r.lcp = e[e.length - 1].startTime
    }).observe({ type: 'largest-contentful-paint', buffered: true }) } catch {}
    try { new PerformanceObserver(l => {
      l.getEntries().forEach(e => { if (!e.hadRecentInput) r.cls += e.value })
    }).observe({ type: 'layout-shift', buffered: true }) } catch {}
    try { new PerformanceObserver(l => {
      l.getEntries().forEach(e => { if (e.duration > 50) r.tbt += e.duration - 50 })
    }).observe({ type: 'longtask', buffered: true }) } catch {}
    setTimeout(() => resolve(r), 2000)
  }))
  return { lcp: cwv.lcp, cls: Math.round(cwv.cls * 1000) / 1000, tbt: Math.round(cwv.tbt) }
}

// ── CDP Performance Metrics ──────────────────────────────────
async function measurePerfMetrics(session) {
  const pm = {}
  try {
    await session.send('Performance.enable')
    const { metrics } = await session.send('Performance.getMetrics')
    for (const m of metrics) pm[m.name] = m.value
    await session.send('Performance.disable').catch(() => {})
  } catch {}
  return {
    recalcStyleCount: pm.RecalcStyleCount || 0, layoutCount: pm.LayoutCount || 0,
    scriptDurationMs: Math.round((pm.ScriptDuration || 0) * 1000),
    jsHeapMB: Number(((pm.JSHeapUsedSize || 0) / 1024 / 1024).toFixed(1))
  }
}

// ── Matsuda Color Harmony ────────────────────────────────────
async function analyzeColorHarmony(page, config) {
  const colors = await page.evaluate(() => {
    const seen = new Set(), result = [], els = document.querySelectorAll('*')
    for (let i = 0, max = Math.min(els.length, 300); i < max; i++) {
      const cs = getComputedStyle(els[i])
      for (const prop of ['color', 'backgroundColor', 'borderColor']) {
        const val = cs[prop]
        if (!val || val === 'rgba(0, 0, 0, 0)' || val === 'transparent' || seen.has(val)) continue
        seen.add(val)
        const m = val.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
        if (m) result.push([+m[1], +m[2], +m[3]])
      }
    }
    return result
  })
  if (colors.length < 2) return { template: 'i', score: 5, rotation: 0, type: 'identity' }
  const hues = colors.map(([r, g, b]) => rgbToHsl(r, g, b)).filter(([, s]) => s > 0.1).map(([h]) => h)
  if (hues.length < 2) return { template: 'i', score: 5, rotation: 0, type: 'achromatic' }

  const templates = config.colorHarmony?.templates || defaultConfig.colorHarmony.templates
  const NAMES = { i: 'identity', V: 'complementary', L: 'analogous-right',
    T: 'triadic', Y: 'split-complementary', X: 'tetradic' }
  let bestTemplate = 'i', bestScore = 0, bestRotation = 0
  for (const [name, sectors] of Object.entries(templates)) {
    for (let rot = 0; rot < 360; rot += 5) {
      let inSector = 0
      for (const hue of hues) {
        for (const [center, hw] of sectors) {
          if (hueDistance(hue, (center + rot) % 360) <= hw) { inSector++; break }
        }
      }
      const cov = inSector / hues.length
      if (cov > bestScore) { bestScore = cov; bestTemplate = name; bestRotation = rot }
    }
  }
  return { template: bestTemplate, score: clamp(Math.round(bestScore * 10), 0, 10),
    rotation: bestRotation, type: NAMES[bestTemplate] || 'unknown' }
}

// ── Hover State Detection ────────────────────────────────────
async function analyzeHoverEffects(page, config) {
  const interactiveEls = await page.$$('a[href], button, [role="button"], [tabindex]:not([tabindex="-1"])')
  const testEls = interactiveEls.slice(0, config.limits?.maxHoverTests || 20)
  let hoverEffectCount = 0
  const hoverTypes = new Set()
  for (const el of testEls) {
    try {
      const box = await el.boundingBox()
      if (!box || box.width < 5 || box.height < 5) continue
      const clip = { x: Math.max(0, box.x - 5), y: Math.max(0, box.y - 5),
        width: box.width + 10, height: box.height + 10 }
      const before = await page.screenshot({ clip })
      await el.hover()
      await page.waitForTimeout(350)
      const after = await page.screenshot({ clip })
      if (!before.equals(after)) { hoverEffectCount++; hoverTypes.add('visual-change') }
      await page.mouse.move(0, 0)
      await page.waitForTimeout(100)
    } catch {}
  }
  const tested = testEls.length
  return { tested, withEffect: hoverEffectCount, variety: hoverTypes.size,
    coverage: tested > 0 ? Math.round((hoverEffectCount / tested) * 100) / 100 : 0 }
}

// ── overall score ────────────────────────────────────────────
function computeOverallScore(anim, gpu, cwv, perf, harmony, hover, config) {
  const s = {}, w = { animations: 0.25, performance: 0.20, colorHarmony: 0.15, hoverEffects: 0.20, gpu: 0.10, cwv: 0.10 }
  if (anim) {
    s.animations = clamp(Math.round(clamp(anim.count / 5, 0, 1) * 4 + (anim.easingQuality / 10) * 4 + (anim.staggerDetected ? 2 : 0)), 0, 10)
  }
  if (gpu) s.gpu = gpu.overCompositing ? 4 : (gpu.count > 5 ? 8 : 6)
  if (cwv) {
    const t = config.performance || defaultConfig.performance
    let v = 10
    if (cwv.lcp != null && cwv.lcp > t.lcpTarget) v -= 3
    if (cwv.cls > t.clsTarget) v -= 3
    if (cwv.tbt > t.tbtTarget) v -= 2
    s.cwv = clamp(v, 0, 10)
  }
  if (perf) {
    let v = 10
    if (perf.layoutCount > 200) v -= 2
    if (perf.recalcStyleCount > 300) v -= 2
    if (perf.scriptDurationMs > 2000) v -= 2
    if (perf.jsHeapMB > 50) v -= 2
    s.performance = clamp(v, 0, 10)
  }
  if (harmony) s.colorHarmony = harmony.score
  if (hover) s.hoverEffects = clamp(Math.round(hover.coverage * 10), 0, 10)
  let total = 0, wSum = 0
  for (const [k, wt] of Object.entries(w)) { if (s[k] != null) { total += s[k] * wt; wSum += wt } }
  return wSum === 0 ? 0 : Math.round((total / wSum) * 10) / 10
}

// ── main export ──────────────────────────────────────────────
export async function runPerceptualPass(page, config = {}) {
  const cfg = { ...defaultConfig, ...config }
  let session = null
  try { session = await page.context().newCDPSession(page) } catch {}

  let anim = null, gpu = null, cwv = null, perf = null, harmony = null, hover = null
  if (session) {
    try { anim = await analyzeAnimations(page, session, cfg) } catch {}
    try { gpu = await analyzeGpuLayers(page, session) } catch {}
    try { perf = await measurePerfMetrics(session) } catch {}
  }
  try { cwv = await measureCWV(page) } catch {}
  try { harmony = await analyzeColorHarmony(page, cfg) } catch {}
  try { hover = await analyzeHoverEffects(page, cfg) } catch {}
  if (session) { try { await session.detach() } catch {} }

  return {
    animations: anim, gpuLayers: gpu, cwv, perfMetrics: perf,
    colorHarmony: harmony, hoverEffects: hover,
    score: computeOverallScore(anim, gpu, cwv, perf, harmony, hover, cfg)
  }
}
