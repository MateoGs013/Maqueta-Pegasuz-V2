/**
 * scroll-capture.mjs — frames reales a distintas posiciones de scroll.
 *
 * El capturador normal (capture-refs.mjs) no puede pasar el hero: Lenis intercepta
 * el scroll programático. Acá usamos `window.__lenis.scrollTo(y, { immediate:true })`
 * (Lenis está expuesto en App.vue) para mover el scroll DE VERDAD, esperamos unos
 * frames de rAF para que el shader de la atmósfera interpole, y sacamos la foto.
 * Así validamos: (1) que el telón persiste hacia abajo, (2) el arco de mood por
 * sección, (3) los reveals en su estado final.
 *
 * Uso: node scroll-capture.mjs <url> <outDir> [width] [height] [steps]
 */
import puppeteer from 'puppeteer'
import { mkdirSync } from 'fs'
import { join } from 'path'

const url = process.argv[2] || 'http://localhost:5173/'
const outDir = process.argv[3] || './scroll-capture'
const W = Number(process.argv[4] || 1440)
const H = Number(process.argv[5] || 900)
const STEPS = Number(process.argv[6] || 9)

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

mkdirSync(outDir, { recursive: true })

// Mismos args que capture-refs.mjs: el backend GL por defecto renderiza el WebGL
// correctamente (forzar swiftshader producía un canvas en blanco).
const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
})
const page = await browser.newPage()
await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 })

console.log(`[scroll-capture] → ${url}`)
await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 })

// dar tiempo a que monten Lenis + GSAP + el canvas
await sleep(1500)

const docHeight = await page.evaluate(() => document.documentElement.scrollHeight)
const maxScroll = Math.max(0, docHeight - H)
console.log(`[scroll-capture] doc=${docHeight}px  max=${maxScroll}px  steps=${STEPS}`)

for (let i = 0; i < STEPS; i++) {
  const t = STEPS === 1 ? 0 : i / (STEPS - 1)
  const y = Math.round(maxScroll * t)

  await page.evaluate((targetY) => {
    if (window.__lenis && typeof window.__lenis.scrollTo === 'function') {
      window.__lenis.scrollTo(targetY, { immediate: true, force: true })
    } else {
      window.scrollTo(0, targetY)
    }
  }, y)

  // esperar a que el lerp del shader (0.07/frame) alcance el objetivo + drift
  await sleep(900)

  const file = join(outDir, `scroll-${String(i).padStart(2, '0')}-y${y}.png`)
  await page.screenshot({ path: file })
  console.log(`[scroll-capture] frame ${i + 1}/${STEPS} @ ${y}px → ${file}`)
}

await browser.close()
console.log('[scroll-capture] ✓ done')
