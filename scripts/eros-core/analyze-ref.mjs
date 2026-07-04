/**
 * analyze-ref.mjs — mide el patrón real de una imagen de referencia.
 * Extrae: perfil de luminancia a lo ancho, borde izquierdo del drapeado, cantidad
 * de columnas (picos), ancho promedio de columna, y el degradé de color.
 * Uso: node analyze-ref.mjs <imagen.png>
 */
import puppeteer from 'puppeteer'
import { readFileSync } from 'fs'

const imgPath = process.argv[2]
const buf = readFileSync(imgPath)
const dataUrl = 'data:image/png;base64,' + buf.toString('base64')

const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] })
const page = await browser.newPage()
await page.setViewport({ width: 1600, height: 1100 })

const res = await page.evaluate(async (dataUrl) => {
  const img = new Image()
  await new Promise((r) => { img.onload = r; img.src = dataUrl })
  const W = img.naturalWidth, H = img.naturalHeight
  const c = document.createElement('canvas'); c.width = W; c.height = H
  const ctx = c.getContext('2d'); ctx.drawImage(img, 0, 0)
  const data = ctx.getImageData(0, 0, W, H).data
  const at = (x, y) => { const i = (y * W + x) * 4; return [data[i], data[i + 1], data[i + 2]] }

  // perfil de luminancia a lo ancho, promediando varias filas de la franja media
  const rows = [0.30, 0.45, 0.60, 0.72].map((f) => Math.floor(H * f))
  const lum = new Array(W).fill(0)
  const rcol = new Array(W).fill(0), gcol = new Array(W).fill(0), bcol = new Array(W).fill(0)
  for (let x = 0; x < W; x++) {
    let s = 0, rr = 0, gg = 0, bb = 0
    for (const y of rows) {
      const [r, g, b] = at(x, y)
      s += 0.2126 * r + 0.7152 * g + 0.0722 * b
      rr += r; gg += g; bb += b
    }
    lum[x] = s / rows.length
    rcol[x] = rr / rows.length; gcol[x] = gg / rows.length; bcol[x] = bb / rows.length
  }
  // degradé vertical: muestrear una columna en la zona brillante (x ~ 0.75W)
  const xv = Math.floor(W * 0.75)
  const vprof = []
  for (let y = 0; y < H; y += Math.max(1, Math.floor(H / 24))) vprof.push({ y, c: at(xv, y) })
  return { W, H, lum, rcol, gcol, bcol, vprof }
}, dataUrl)

await browser.close()

const { W, H, lum, rcol, gcol, bcol, vprof } = res
const maxL = Math.max(...lum)
const thr = maxL * 0.16
// borde izquierdo del drapeado (primer x sostenido por encima del umbral, de izq a der)
let left = 0
for (let x = 0; x < W; x++) { if (lum[x] > thr) { left = x; break } }
// borde derecho
let right = W - 1
for (let x = W - 1; x >= 0; x--) { if (lum[x] > thr) { right = x; break } }

// suavizado leve para detección de picos
const sm = lum.map((_, i) => {
  let s = 0, n = 0
  for (let k = -2; k <= 2; k++) { const j = i + k; if (j >= 0 && j < W) { s += lum[j]; n++ } }
  return s / n
})
// contar picos (máximos locales con prominencia) en la región del drapeado
let peaks = []
for (let x = left + 2; x < right - 2; x++) {
  if (sm[x] > sm[x - 1] && sm[x] >= sm[x + 1] && sm[x] > thr * 1.1) {
    if (peaks.length === 0 || x - peaks[peaks.length - 1] > 6) peaks.push(x)
  }
}
const widthPx = right - left
const colCount = peaks.length
const avgSpacing = peaks.length > 1
  ? (peaks[peaks.length - 1] - peaks[0]) / (peaks.length - 1) : 0

console.log(`Imagen: ${W}x${H}`)
console.log(`Drapeado: x=${left}..${right} (ancho ${widthPx}px, = ${(widthPx / W * 100).toFixed(0)}% del ancho; empieza en x=${(left / W * 100).toFixed(0)}%)`)
console.log(`Columnas (picos detectados): ${colCount}`)
console.log(`Espaciado promedio entre columnas: ${avgSpacing.toFixed(1)}px (~${(avgSpacing / W * 100).toFixed(1)}% del ancho)`)
console.log(`→ columnas extrapoladas a TODO el ancho: ${avgSpacing > 0 ? (W / avgSpacing).toFixed(0) : 'n/a'}`)
console.log(`\nPicos (x): ${peaks.join(', ')}`)

// perfil ASCII de luminancia (downsample a 90 cols)
console.log(`\nPerfil de luminancia a lo ancho (0=izq, der=derecha):`)
const N = 90, ramp = ' .:-=+*#%@'
let line = ''
for (let i = 0; i < N; i++) {
  const x = Math.floor(i / N * W)
  const v = lum[x] / maxL
  line += ramp[Math.min(ramp.length - 1, Math.floor(v * ramp.length))]
}
console.log(line)

// degradé de color horizontal (muestras)
console.log(`\nColor a lo ancho (cada ~10%):`)
for (let f = 0; f <= 1.0001; f += 0.1) {
  const x = Math.min(W - 1, Math.floor(f * W))
  console.log(`  x=${(f * 100).toFixed(0).padStart(3)}%  rgb(${Math.round(rcol[x])},${Math.round(gcol[x])},${Math.round(bcol[x])})  lum=${(lum[x] / maxL * 100).toFixed(0)}%`)
}

// degradé de color vertical en la zona brillante
console.log(`\nColor vertical en x=75% (top→bottom):`)
for (const { y, c } of vprof) {
  console.log(`  y=${(y / H * 100).toFixed(0).padStart(3)}%  rgb(${c[0]},${c[1]},${c[2]})`)
}
