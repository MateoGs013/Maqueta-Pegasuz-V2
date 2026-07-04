#!/usr/bin/env node
/**
 * treat.mjs — Local de-AI treatment chain for generated/sourced images.
 *
 * Replaces the discarded Adobe MCP chain (decision Mateo 2026-07-04) with a
 * 100% local pipeline built on sharp: editorial crop -> project grade
 * (tint/saturation/contrast/brightness) -> film grain -> optional vignette ->
 * web-ready AVIF/WebP/JPG.
 *
 * Usage:
 *   node treat.mjs <input> --out <dir> --slot <name>
 *     [--aspect 21:9] [--gravity attention|center|left|right|top|bottom]
 *     [--tint #c4843e] [--saturation 0.82] [--contrast 1.06] [--brightness 0.98]
 *     [--grain 32] [--vignette 0.18] [--widths 2400,1200] [--json]
 *
 * Exposed as a module too: treat(input, options) — used by Eros Studio's
 * asset inbox watcher.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

// ---------------------------------------------------------------------------

function parseAspect(str) {
  if (!str) return null
  const m = String(str).match(/^(\d+(?:\.\d+)?)[:x/](\d+(?:\.\d+)?)$/)
  if (!m) throw new Error(`Bad aspect "${str}" (use W:H, e.g. 21:9)`)
  return Number(m[1]) / Number(m[2])
}

/** Generate a monochrome noise overlay (with alpha) for film grain. */
async function grainOverlay(width, height, intensity) {
  // Grain cell ~1.6px at full res: render noise at reduced size, join the alpha
  // at the SAME size, then upscale — so all channels stay in sync.
  const gw = Math.max(64, Math.round(width / 1.6))
  const gh = Math.max(64, Math.round(height / 1.6))
  const raw = Buffer.alloc(gw * gh)
  for (let i = 0; i < raw.length; i++) raw[i] = Math.floor(Math.random() * 256)
  const alpha = Math.round(Math.min(255, intensity * 2.2)) // grain 32 -> ~70/255
  const noise = await sharp(raw, { raw: { width: gw, height: gh, channels: 1 } })
    .joinChannel(Buffer.alloc(gw * gh, alpha), { raw: { width: gw, height: gh, channels: 1 } })
    .png()
    .toBuffer()
  return sharp(noise).resize(width, height, { kernel: 'nearest' }).png().toBuffer()
}

function hexToRgb(hex) {
  const m = String(hex).replace('#', '')
  const full = m.length === 3 ? m.split('').map((c) => c + c).join('') : m
  return { r: parseInt(full.slice(0, 2), 16), g: parseInt(full.slice(2, 4), 16), b: parseInt(full.slice(4, 6), 16) }
}

/** Radial vignette as SVG composite (multiply). */
function vignetteOverlay(width, height, strength) {
  const s = Math.min(0.6, Math.max(0, strength))
  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs><radialGradient id="v" cx="50%" cy="46%" r="72%">
      <stop offset="58%" stop-color="black" stop-opacity="0"/>
      <stop offset="100%" stop-color="black" stop-opacity="${s}"/>
    </radialGradient></defs>
    <rect width="100%" height="100%" fill="url(#v)"/></svg>`
  return Buffer.from(svg)
}

export async function treat(input, opts = {}) {
  const {
    outDir, slot = path.parse(input).name,
    aspect = null, gravity = 'attention',
    tint = null, saturation = 0.85, contrast = 1.05, brightness = 0.99,
    grain = 32, vignette = 0,
    widths = [2400, 1200],
  } = opts
  if (!outDir) throw new Error('outDir required')
  fs.mkdirSync(outDir, { recursive: true })

  let img = sharp(input, { failOn: 'none' }).rotate()
  const meta = await img.metadata()
  let width = meta.width, height = meta.height

  // 1. Editorial crop to target aspect
  const ratio = parseAspect(aspect)
  if (ratio) {
    if (width / height > ratio) width = Math.round(height * ratio)
    else height = Math.round(width / ratio)
    const position = gravity === 'attention' ? sharp.strategy.attention : gravity
    img = img.resize(width, height, { fit: 'cover', position })
  }

  // 2. Project grade
  img = img.modulate({ saturation, brightness })
  // linear(a, b): a>1 raises contrast around midpoint
  img = img.linear(contrast, Math.round(128 * (1 - contrast)))

  // Materialize before compositing overlays sized to the final image
  let buf = await img.toBuffer()
  const dims = await sharp(buf).metadata()

  const composites = []
  // 2b. Tint as low-opacity soft-light wash — shifts temperature toward the
  // palette WITHOUT flattening hue variety (sharp's tint() recolors entirely).
  if (tint) {
    composites.push({
      input: { create: { width: dims.width, height: dims.height, channels: 4, background: { ...hexToRgb(tint), alpha: 0.22 } } },
      blend: 'soft-light',
    })
  }
  // 3. Film grain (soft-light keeps blacks from washing out)
  if (grain > 0) {
    composites.push({ input: await grainOverlay(dims.width, dims.height, grain), blend: 'soft-light' })
  }
  // 4. Vignette
  if (vignette > 0) {
    composites.push({ input: vignetteOverlay(dims.width, dims.height, vignette), blend: 'multiply' })
  }
  if (composites.length) buf = await sharp(buf).composite(composites).toBuffer()

  // 5. Web-ready outputs
  const outputs = []
  const targetWidths = [...new Set(widths.filter((w) => w <= dims.width).concat(
    widths.every((w) => w > dims.width) ? [dims.width] : []))]
  for (const w of targetWidths) {
    const base = targetWidths.length > 1 ? `${slot}-${w}` : slot
    const resized = sharp(buf).resize(w, null, { withoutEnlargement: true })
    const avif = path.join(outDir, `${base}.avif`)
    const webp = path.join(outDir, `${base}.webp`)
    const jpg = path.join(outDir, `${base}.jpg`)
    await Promise.all([
      resized.clone().avif({ quality: 62 }).toFile(avif),
      resized.clone().webp({ quality: 78 }).toFile(webp),
      resized.clone().jpeg({ quality: 84, mozjpeg: true }).toFile(jpg),
    ])
    outputs.push({ width: w, avif, webp, jpg })
  }

  return {
    slot,
    source: path.resolve(input),
    finalSize: { width: dims.width, height: dims.height },
    grade: { tint, saturation, contrast, brightness, grain, vignette, aspect, gravity },
    outputs,
  }
}

// --- CLI ---------------------------------------------------------------------

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isMain) {
  const argv = process.argv.slice(2)
  const input = argv[0]
  const get = (flag, dflt) => {
    const i = argv.indexOf(`--${flag}`)
    return i >= 0 ? argv[i + 1] : dflt
  }
  if (!input || input.startsWith('--')) {
    console.error('Usage: node treat.mjs <input> --out <dir> --slot <name> [--aspect 21:9] [--tint #hex] [--saturation 0.85] [--contrast 1.05] [--brightness 0.99] [--grain 32] [--vignette 0] [--widths 2400,1200] [--gravity attention]')
    process.exit(1)
  }
  try {
    const result = await treat(input, {
      outDir: get('out'),
      slot: get('slot'),
      aspect: get('aspect', null),
      gravity: get('gravity', 'attention'),
      tint: get('tint', null),
      saturation: Number(get('saturation', 0.85)),
      contrast: Number(get('contrast', 1.05)),
      brightness: Number(get('brightness', 0.99)),
      grain: Number(get('grain', 32)),
      vignette: Number(get('vignette', 0)),
      widths: String(get('widths', '2400,1200')).split(',').map(Number),
    })
    if (argv.includes('--json')) console.log(JSON.stringify(result, null, 2))
    else console.log(`treated ${result.slot}: ${result.outputs.map((o) => path.basename(o.webp)).join(', ')}`)
  } catch (e) {
    console.error(`[treat] ${e.message}`)
    process.exit(1)
  }
}
