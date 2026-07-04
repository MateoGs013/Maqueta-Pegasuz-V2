/**
 * shot-section.mjs — captura UNA sección por #id, en vivo, vía Lenis.
 * Espera el reveal (scrollTrigger once) y fotografía el viewport centrado en la
 * sección, en uno o más anchos.
 * Uso: node shot-section.mjs <url> <#id> <outBasename> [w1,w2,...]
 *   ej: node shot-section.mjs http://localhost:5174/ manifesto man [1440,390]
 */
import puppeteer from 'puppeteer'

const url = process.argv[2] || 'http://localhost:5174/'
const id = (process.argv[3] || 'manifesto').replace('#', '')
const base = process.argv[4] || id
const widths = (process.argv[5] || '1440,390').split(',').map((n) => parseInt(n, 10))
const OUT = 'C:\\Users\\mateo\\Desktop\\extra\\.eros\\_shots'

import { mkdirSync } from 'fs'
mkdirSync(OUT, { recursive: true })

const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
})

for (const w of widths) {
  const page = await browser.newPage()
  await page.setViewport({ width: w, height: Math.round(w >= 1024 ? 900 : 844), deviceScaleFactor: 1 })
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 })
  await new Promise((r) => setTimeout(r, 1200))

  // scroll a la sección (vía Lenis si existe; disparar el reveal)
  await page.evaluate((secId) => {
    const el = document.getElementById(secId)
    if (!el) return
    const y = el.getBoundingClientRect().top + window.scrollY
    if (window.__lenis) window.__lenis.scrollTo(y - 40, { immediate: false })
    else window.scrollTo({ top: y - 40, behavior: 'smooth' })
  }, id)
  await new Promise((r) => setTimeout(r, 2200)) // espera reveal + lava

  const el = await page.$(`#${id}`)
  const tag = w >= 1024 ? 'desktop' : 'mobile'
  if (el) {
    // viewport shot (lo que se ve) + section shot (la sección entera)
    await page.screenshot({ path: `${OUT}\\${base}-${tag}-view.png` })
    await el.screenshot({ path: `${OUT}\\${base}-${tag}-full.png` })
  } else {
    await page.screenshot({ path: `${OUT}\\${base}-${tag}-NOTFOUND.png` })
  }
  await page.close()
  console.log(`[shot] ${base} @ ${w}px → ${tag}`)
}

await browser.close()
console.log('[shot-section] done →', OUT)
