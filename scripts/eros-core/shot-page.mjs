/**
 * shot-page.mjs — full-page de cualquier URL a un ancho dado (mobile/tablet/desktop).
 * Uso: node shot-page.mjs <url> <outPath> <width> [height]
 */
import puppeteer from 'puppeteer'
const url = process.argv[2]
const out = process.argv[3]
const w = parseInt(process.argv[4] || '390', 10)
const h = parseInt(process.argv[5] || (w < 700 ? '844' : '1000'), 10)
const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] })
const p = await b.newPage()
await p.setViewport({ width: w, height: h, deviceScaleFactor: 1, isMobile: w < 700, hasTouch: w < 700 })
await p.goto(url, { waitUntil: 'networkidle2', timeout: 60000 })
await new Promise((r) => setTimeout(r, 3000)) // preloader/reveal settle
await p.evaluate(async () => {
  const H = document.body.scrollHeight
  for (let y = 0; y < H; y += 500) {
    if (window.__lenis) window.__lenis.scrollTo(y, { immediate: true })
    else window.scrollTo(0, y)
    await new Promise((r) => setTimeout(r, 110))
  }
  if (window.__lenis) window.__lenis.scrollTo(0, { immediate: true })
  else window.scrollTo(0, 0)
  await new Promise((r) => setTimeout(r, 500))
})
await p.screenshot({ path: out, fullPage: true })
await b.close()
console.log('shot', w + 'px →', out)
