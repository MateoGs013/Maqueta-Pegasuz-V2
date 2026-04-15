#!/usr/bin/env node
/**
 * eros-train-reference.mjs — Reference Training Mode
 *
 * Train Eros from external reference sites without building a project.
 * Analyze sites you love (or hate), rate them, and propagate learnings
 * directly into design-intelligence memory.
 *
 * Subcommands:
 *   analyze   — capture + analyze a reference URL, output structured analysis
 *   learn     — take an analysis + user ratings and write to memory
 *   compare   — compare two analyses side by side
 *   session   — interactive training: analyze → rate → learn in one flow
 *   list      — list all reference training sessions
 *
 * Usage:
 *   node eros-train-reference.mjs analyze --url "https://sirnik.co" --out "./training-refs"
 *   node eros-train-reference.mjs learn --analysis "./training-refs/sirnik-co/analysis.json" --ratings '{"overall":9,"composition":9,...}'
 *   node eros-train-reference.mjs compare --a "./a/analysis.json" --b "./b/analysis.json"
 *   node eros-train-reference.mjs session --url "https://sirnik.co" --out "./training-refs"
 *   node eros-train-reference.mjs list --dir "./training-refs"
 */

import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFile as execFileCb } from 'node:child_process'
import { promisify } from 'node:util'

const execFile = promisify(execFileCb)

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const maquetaDir = path.resolve(__dirname, '..', '..')
const defaultOutDir = path.join(maquetaDir, '_training-refs')

const parseArgs = (argv) => {
  const args = { _: [] }
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i]
    if (!token.startsWith('--')) { args._.push(token); continue }
    const key = token.slice(2)
    const next = argv[i + 1]
    if (!next || next.startsWith('--')) { args[key] = true; continue }
    args[key] = next
    i++
  }
  return args
}

const readJson = async (p) => {
  try { return JSON.parse(await fs.readFile(p, 'utf8')) } catch { return null }
}

const writeJson = async (p, data) => {
  await fs.mkdir(path.dirname(p), { recursive: true })
  await fs.writeFile(p, JSON.stringify(data, null, 2) + '\n', 'utf8')
}

const readText = async (p) => {
  try { return await fs.readFile(p, 'utf8') } catch { return null }
}

const out = (obj) => process.stdout.write(JSON.stringify(obj, null, 2) + '\n')
const fail = (msg) => { process.stderr.write(`Error: ${msg}\n`); process.exit(1) }
const today = () => new Date().toISOString().slice(0, 10)

const slugify = (url) => {
  try {
    const u = new URL(url)
    return u.hostname.replace(/^www\./, '').replace(/\./g, '-')
  } catch {
    return url.replace(/[^a-z0-9]+/gi, '-').toLowerCase()
  }
}

// Call another eros script
const callScript = async (script, args) => {
  const scriptPath = path.join(__dirname, script)
  const { stdout } = await execFile(process.execPath, [scriptPath, ...args], { cwd: __dirname })
  try { return JSON.parse(stdout) } catch { return { raw: stdout } }
}

// ---------------------------------------------------------------------------
// analyze — capture + parse a reference site
// ---------------------------------------------------------------------------

const cmdAnalyze = async (args) => {
  const url = args.url
  if (!url) fail('--url is required')

  const outDir = args.out || defaultOutDir
  const slug = slugify(url)
  const refDir = path.join(outDir, slug)

  process.stderr.write(`Capturing ${url}...\n`)

  // Step 1: Capture screenshots using capture-refs.mjs
  try {
    const captureScript = path.join(__dirname, 'capture-refs.mjs')
    // Use eros-observer.mjs (V2, Playwright) — faster and more reliable
    const observerScript = path.join(__dirname, 'eros-observer.mjs')
    await execFile(process.execPath, [observerScript, '--no-discover', url, refDir], {
      cwd: __dirname,
      timeout: 180000,
    })
  } catch (e) {
    fail(`observer failed: ${e.message}`)
  }

  // Step 2: Read the analysis.md that capture-refs generates
  const analysisPath = path.join(refDir, slug, 'analysis.md')
  const analysisMd = await readText(analysisPath)

  // Step 3: Read manifest
  const manifestPath = path.join(refDir, slug, 'manifest.json')
  const manifest = await readJson(manifestPath)

  // Step 4: Parse analysis.md into structured data
  const analysis = parseAnalysisMd(analysisMd, manifest)
  analysis.url = url
  analysis.slug = slug
  analysis.capturedAt = new Date().toISOString()
  analysis.refDir = refDir

  // Step 5: Save structured analysis
  const analysisJsonPath = path.join(refDir, 'analysis.json')
  await writeJson(analysisJsonPath, analysis)

  out({
    url,
    slug,
    analysisPath: analysisJsonPath,
    screenshotsDir: refDir,
    sections: analysis.sections?.length || 0,
    techniques: analysis.techniques?.length || 0,
    fonts: analysis.fonts || [],
    palette: analysis.palette || [],
  })
}

// Parse analysis.md into structured data
const parseAnalysisMd = (md, manifest) => {
  const result = {
    sections: [],
    techniques: [],
    fonts: [],
    palette: [],
    composition: null,
    depth: null,
    typography: null,
    motion: null,
    craft: null,
    excellence: {},
    borrow: [],
    avoid: [],
  }

  if (!md) return result

  // Extract excellence signals
  const signalPattern = /\*\*(Composition|Depth|Typography|Motion|Craft)\*\*[:\s]+(\w+)/gi
  let m
  while ((m = signalPattern.exec(md)) !== null) {
    const dim = m[1].toLowerCase()
    result[dim] = m[2].toUpperCase()
    result.excellence[dim] = m[2].toUpperCase()
  }

  // Extract section classifications
  const sectionPattern = /(?:section|hero|footer|nav|features|about|contact|pricing|testimonials|work|portfolio|cta|services|stats)/gi
  const sectionMatches = new Set()
  let sm
  while ((sm = sectionPattern.exec(md)) !== null) {
    sectionMatches.add(sm[0].toLowerCase())
  }
  result.sections = [...sectionMatches]

  // Extract technique mentions
  const techniqueKeywords = [
    'SplitText', 'clip-path', 'parallax', 'magnetic', 'stagger', 'gradient mesh',
    'scrub', 'pin', 'morph', 'counter', 'ticker', 'marquee', 'curtain',
    'reveal', 'fade', 'scale', 'blur', 'grain', 'noise', 'glow',
    'GSAP', 'ScrollTrigger', 'Lenis', 'Spline', 'Three.js', 'WebGL',
  ]
  for (const kw of techniqueKeywords) {
    if (md.toLowerCase().includes(kw.toLowerCase())) {
      result.techniques.push(kw)
    }
  }

  // Extract font mentions
  const fontPattern = /(?:font-family|font)[:\s]*['"]?([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)/g
  let fm
  while ((fm = fontPattern.exec(md)) !== null) {
    if (!result.fonts.includes(fm[1])) result.fonts.push(fm[1])
  }

  // Extract borrow/avoid
  const borrowMatch = md.match(/(?:borrow|adopt|keep|use)[:\s]*\n([\s\S]*?)(?=\n#|\n\*\*|$)/i)
  if (borrowMatch) {
    result.borrow = borrowMatch[1].split('\n').filter(l => l.trim().startsWith('-')).map(l => l.replace(/^-\s*/, '').trim())
  }

  const avoidMatch = md.match(/(?:avoid|skip|don't)[:\s]*\n([\s\S]*?)(?=\n#|\n\*\*|$)/i)
  if (avoidMatch) {
    result.avoid = avoidMatch[1].split('\n').filter(l => l.trim().startsWith('-')).map(l => l.replace(/^-\s*/, '').trim())
  }

  // Extract color values
  const colorPattern = /#[0-9a-fA-F]{3,8}\b/g
  let cm
  while ((cm = colorPattern.exec(md)) !== null) {
    if (!result.palette.includes(cm[0])) result.palette.push(cm[0])
  }

  return result
}

// ---------------------------------------------------------------------------
// learn — take analysis + ratings and write to memory
// ---------------------------------------------------------------------------

const cmdLearn = async (args) => {
  const analysisPath = args.analysis
  if (!analysisPath) fail('--analysis is required (path to analysis.json)')

  const analysis = await readJson(path.resolve(analysisPath))
  if (!analysis) fail(`Cannot read ${analysisPath}`)

  let ratings
  try {
    ratings = JSON.parse(args.ratings || '{}')
  } catch {
    fail('--ratings must be valid JSON')
  }

  const overall = ratings.overall ?? ratings.score ?? null
  const source = `ref-training/${analysis.slug}`
  const written = []

  // Learn fonts
  if (analysis.fonts?.length >= 2) {
    try {
      await callScript('./memory.mjs', [
        'learn', '--event', 'font_selected',
        '--data', JSON.stringify({
          project: analysis.slug,
          mood: ratings.mood || 'reference',
          display: analysis.fonts[0],
          body: analysis.fonts[1] || '—',
          mono: analysis.fonts[2] || null,
          reaction: overall >= 8 ? 'reference-excellent' : overall >= 6 ? 'reference-good' : 'reference-weak',
          lesson: `From ${analysis.url}. ${ratings.fontNote || ''}`.trim(),
        }),
      ])
      written.push('font-pairings')
    } catch { /* non-fatal */ }
  }

  // Learn palette
  if (analysis.palette?.length >= 2) {
    try {
      await callScript('./memory.mjs', [
        'learn', '--event', 'palette_selected',
        '--data', JSON.stringify({
          project: analysis.slug,
          mood: ratings.mood || 'reference',
          canvas: analysis.palette[0] || '—',
          accent: analysis.palette.slice(1, 4).join(', '),
          reaction: overall >= 8 ? 'reference-excellent' : overall >= 6 ? 'reference-good' : 'reference-weak',
          lesson: `From ${analysis.url}. ${ratings.paletteNote || ''}`.trim(),
        }),
      ])
      written.push('color-palettes')
    } catch { /* non-fatal */ }
  }

  // Learn techniques with scores
  for (const tech of analysis.techniques || []) {
    const techScore = ratings.techniques?.[tech] ?? overall ?? 7.0
    try {
      await callScript('./memory.mjs', [
        'learn', '--event', 'section_approved',
        '--data', JSON.stringify({
          project: analysis.slug,
          section: 'reference',
          sectionType: 'reference',
          score: techScore,
          layout: '—',
          motion: '—',
          technique: tech,
          signature: `${tech} (from ${analysis.slug})`,
        }),
      ])
      written.push(`technique:${tech}`)
    } catch { /* non-fatal */ }
  }

  // Learn excellence patterns as section patterns
  if (overall && Object.keys(analysis.excellence || {}).length > 0) {
    const excellenceStr = Object.entries(analysis.excellence)
      .map(([k, v]) => `${k}:${v}`)
      .join(', ')
    try {
      await callScript('./memory.mjs', [
        'learn', '--event', 'section_approved',
        '--data', JSON.stringify({
          project: analysis.slug,
          section: 'reference-site',
          sectionType: ratings.primarySectionType || 'hero',
          score: overall,
          layout: `Reference site (${excellenceStr})`,
          motion: analysis.techniques?.slice(0, 3).join(' + ') || '—',
          technique: analysis.techniques?.[0] || '—',
          signature: `${analysis.slug} reference (${overall}/10)`,
        }),
      ])
      written.push('section-patterns')
    } catch { /* non-fatal */ }
  }

  // Learn borrow items as rules (candidates)
  for (const item of (analysis.borrow || []).slice(0, 3)) {
    if (!item || item.length < 10) continue
    try {
      await callScript('./memory.mjs', [
        'learn', '--event', 'rule_discovered',
        '--data', JSON.stringify({
          text: item,
          source,
        }),
      ])
      written.push(`rule:${item.slice(0, 40)}`)
    } catch { /* non-fatal */ }
  }

  // Learn avoid items as rules too
  for (const item of (analysis.avoid || []).slice(0, 2)) {
    if (!item || item.length < 10) continue
    try {
      await callScript('./memory.mjs', [
        'learn', '--event', 'rule_discovered',
        '--data', JSON.stringify({
          text: `AVOID: ${item}`,
          source,
        }),
      ])
      written.push(`rule-avoid:${item.slice(0, 40)}`)
    } catch { /* non-fatal */ }
  }

  // Save the ratings alongside the analysis
  const ratingsPath = path.join(path.dirname(path.resolve(analysisPath)), 'ratings.json')
  await writeJson(ratingsPath, {
    ...ratings,
    url: analysis.url,
    slug: analysis.slug,
    ratedAt: new Date().toISOString(),
  })

  out({
    url: analysis.url,
    overall,
    written,
    totalWrites: written.length,
    ratingsPath,
  })
}

// ---------------------------------------------------------------------------
// compare — compare two analyses side by side
// ---------------------------------------------------------------------------

const cmdCompare = async (args) => {
  const pathA = args.a
  const pathB = args.b
  if (!pathA || !pathB) fail('--a and --b are required (paths to analysis.json files)')

  const a = await readJson(path.resolve(pathA))
  const b = await readJson(path.resolve(pathB))
  if (!a) fail(`Cannot read ${pathA}`)
  if (!b) fail(`Cannot read ${pathB}`)

  const comparison = {
    a: { url: a.url, slug: a.slug },
    b: { url: b.url, slug: b.slug },
    excellence: {},
    techniquesOnlyA: [],
    techniquesOnlyB: [],
    techniquesBoth: [],
    fontsA: a.fonts || [],
    fontsB: b.fonts || [],
    paletteA: a.palette?.slice(0, 5) || [],
    paletteB: b.palette?.slice(0, 5) || [],
  }

  // Compare excellence dimensions
  const dims = ['composition', 'depth', 'typography', 'motion', 'craft']
  for (const dim of dims) {
    comparison.excellence[dim] = {
      a: a.excellence?.[dim] || a[dim] || '—',
      b: b.excellence?.[dim] || b[dim] || '—',
    }
  }

  // Compare techniques
  const techA = new Set(a.techniques || [])
  const techB = new Set(b.techniques || [])
  comparison.techniquesOnlyA = [...techA].filter(t => !techB.has(t))
  comparison.techniquesOnlyB = [...techB].filter(t => !techA.has(t))
  comparison.techniquesBoth = [...techA].filter(t => techB.has(t))

  out(comparison)
}

// ---------------------------------------------------------------------------
// session — interactive flow: analyze → rate → learn
// ---------------------------------------------------------------------------

const cmdSession = async (args) => {
  const url = args.url
  if (!url) fail('--url is required')
  const outDir = args.out || defaultOutDir

  // Step 1: Analyze
  process.stderr.write(`\n=== Reference Training Session ===\n`)
  process.stderr.write(`URL: ${url}\n\n`)

  const slug = slugify(url)
  const refDir = path.join(outDir, slug)

  // Run analyze
  process.stderr.write(`Step 1: Capturing and analyzing...\n`)

  let analysis
  const analysisJsonPath = path.join(refDir, 'analysis.json')

  // Check if already analyzed
  const existing = await readJson(analysisJsonPath)
  if (existing) {
    process.stderr.write(`  Found existing analysis. Reusing.\n`)
    analysis = existing
  } else {
    // Capture
    try {
      const captureScript = path.join(__dirname, 'capture-refs.mjs')
      await execFile(process.execPath, [captureScript, '--no-discover', url, refDir], {
        cwd: __dirname,
        timeout: 120000,
      })
    } catch (e) {
      fail(`observer failed: ${e.message}`)
    }

    const analysisMd = await readText(path.join(refDir, slug, 'analysis.md'))
    const manifest = await readJson(path.join(refDir, slug, 'manifest.json'))
    analysis = parseAnalysisMd(analysisMd, manifest)
    analysis.url = url
    analysis.slug = slug
    analysis.capturedAt = new Date().toISOString()
    analysis.refDir = refDir
    await writeJson(analysisJsonPath, analysis)
  }

  process.stderr.write(`  Sections detected: ${analysis.sections?.join(', ') || 'none'}\n`)
  process.stderr.write(`  Techniques: ${analysis.techniques?.join(', ') || 'none'}\n`)
  process.stderr.write(`  Fonts: ${analysis.fonts?.join(', ') || 'none'}\n`)
  process.stderr.write(`  Excellence: ${Object.entries(analysis.excellence || {}).map(([k, v]) => `${k}:${v}`).join(', ') || 'not scored'}\n`)

  // Output the session data for the CEO to present to the user
  // The CEO will collect ratings and call `learn` with them
  out({
    status: 'awaiting_ratings',
    url,
    slug,
    analysisPath: analysisJsonPath,
    screenshotsDir: refDir,
    analysis: {
      sections: analysis.sections,
      techniques: analysis.techniques,
      fonts: analysis.fonts,
      palette: analysis.palette?.slice(0, 8),
      excellence: analysis.excellence,
      borrow: analysis.borrow,
      avoid: analysis.avoid,
    },
    ratingsTemplate: {
      overall: null,
      mood: null,
      primarySectionType: null,
      fontNote: null,
      paletteNote: null,
      techniques: Object.fromEntries((analysis.techniques || []).map(t => [t, null])),
      notes: null,
    },
  })
}

// ---------------------------------------------------------------------------
// list — list all reference training sessions
// ---------------------------------------------------------------------------

const cmdList = async (args) => {
  const dir = args.dir || defaultOutDir

  let entries = []
  try {
    entries = await fs.readdir(dir, { withFileTypes: true })
  } catch {
    out({ sessions: [], dir })
    return
  }

  const sessions = []
  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    const analysisPath = path.join(dir, entry.name, 'analysis.json')
    const ratingsPath = path.join(dir, entry.name, 'ratings.json')
    const analysis = await readJson(analysisPath)
    const ratings = await readJson(ratingsPath)

    sessions.push({
      slug: entry.name,
      url: analysis?.url || '—',
      capturedAt: analysis?.capturedAt || null,
      rated: ratings !== null,
      overall: ratings?.overall || null,
      techniques: analysis?.techniques?.length || 0,
      fonts: analysis?.fonts || [],
    })
  }

  out({ sessions, dir })
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const main = async () => {
  const rawArgs = process.argv.slice(2)
  const subcommand = rawArgs[0]
  const args = parseArgs(rawArgs.slice(1))

  const commands = {
    analyze: cmdAnalyze,
    learn: cmdLearn,
    compare: cmdCompare,
    session: cmdSession,
    list: cmdList,
  }

  const handler = commands[subcommand]
  if (!handler) {
    fail(
      `Unknown subcommand: ${subcommand}\n` +
      `Usage: node eros-train-reference.mjs <analyze|learn|compare|session|list> [options]\n\n` +
      `  analyze  --url <url> [--out <dir>]     Capture + analyze a reference site\n` +
      `  learn    --analysis <path> --ratings '{...}'  Write ratings to memory\n` +
      `  compare  --a <path> --b <path>         Compare two analyses\n` +
      `  session  --url <url> [--out <dir>]     Full training session (analyze → rate → learn)\n` +
      `  list     [--dir <dir>]                 List all training sessions\n`
    )
  }

  await handler(args)
}

main().catch((err) => {
  process.stderr.write(`Fatal: ${err.message}\n`)
  process.exit(1)
})
