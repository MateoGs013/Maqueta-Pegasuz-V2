/**
 * grab-structure.mjs — extrae la ESTRUCTURA real de un sitio (DOM + layout) para
 * replicarla. Recorre las secciones de <main>/<body>, y por cada una saca:
 * tag.clase, headings, CTAs, y la firma de layout (display/grid/font-size del
 * heading/bordes/bg) computada. Sin adivinar: lee el sitio renderizado.
 * Uso: node grab-structure.mjs <url>
 */
import puppeteer from 'puppeteer'
import { writeFileSync } from 'fs'

const url = process.argv[2] || 'https://www.tenity.com/'
const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] })
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900 })
await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 })
await new Promise((r) => setTimeout(r, 2500))

const report = await page.evaluate(() => {
  const cssNum = (el, prop) => getComputedStyle(el)[prop]
  const short = (s, n = 80) => (s || '').replace(/\s+/g, ' ').trim().slice(0, n)

  // candidatos a "sección": hijos directos de main, o secciones marcadas
  const main = document.querySelector('main') || document.body
  const blocks = Array.from(main.children).filter((el) => el.offsetHeight > 120)

  const out = []
  blocks.forEach((sec, i) => {
    const cs = getComputedStyle(sec)
    const headings = Array.from(sec.querySelectorAll('h1,h2,h3')).slice(0, 4).map((h) => {
      const hcs = getComputedStyle(h)
      return `${h.tagName} "${short(h.textContent, 50)}" [${hcs.fontSize}/${hcs.fontWeight}/${hcs.fontFamily.split(',')[0]}]`
    })
    const ctas = Array.from(sec.querySelectorAll('a,button')).slice(0, 5).map((a) => short(a.textContent, 24)).filter(Boolean)
    // firma de layout: primer contenedor grid/flex relevante
    const grids = Array.from(sec.querySelectorAll('*')).filter((el) => {
      const d = getComputedStyle(el).display
      return d === 'grid' || d === 'flex'
    }).slice(0, 3).map((el) => {
      const c = getComputedStyle(el)
      return `${c.display}${c.gridTemplateColumns && c.gridTemplateColumns !== 'none' ? ' cols:' + short(c.gridTemplateColumns, 40) : ''}`
    })
    out.push({
      i,
      tag: sec.tagName.toLowerCase(),
      cls: short(sec.className, 60),
      h: sec.offsetHeight,
      bg: cs.backgroundColor,
      color: cs.color,
      pad: `${cs.paddingTop} ${cs.paddingBottom}`,
      headings,
      ctas,
      grids,
    })
  })
  return { count: blocks.length, sections: out }
})

await browser.close()

let txt = `STRUCTURE: ${url}\nsecciones top-level: ${report.count}\n`
report.sections.forEach((s) => {
  txt += `\n──[ ${s.i} ] <${s.tag}> .${s.cls}  (h=${s.h}px)\n`
  txt += `   bg:${s.bg}  color:${s.color}  pad:${s.pad}\n`
  if (s.headings.length) txt += `   headings:\n` + s.headings.map((h) => `     - ${h}`).join('\n') + '\n'
  if (s.ctas.length) txt += `   ctas: ${s.ctas.join(' | ')}\n`
  if (s.grids.length) txt += `   layout: ${s.grids.join('  ·  ')}\n`
})

console.log(txt)
writeFileSync('C:\\Users\\mateo\\Desktop\\extra\\.eros\\tenity-structure.txt', txt)
console.log('\n[grab-structure] guardado en extra/.eros/tenity-structure.txt')
