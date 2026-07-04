/**
 * grab-nav.mjs — extrae el contenedor del nav (la barra) + sus partes, con estilos
 * computados exactos: bg, border-radius, padding, position/top, height, box-shadow.
 */
import puppeteer from 'puppeteer'
import { writeFileSync } from 'fs'

const url = process.argv[2] || 'https://www.tenity.com/'
const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] })
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900 })
await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 })
await new Promise((r) => setTimeout(r, 2500))

const data = await page.evaluate(() => {
  const STY = ['position', 'top', 'left', 'right', 'margin', 'inset', 'width', 'height', 'backgroundColor', 'backdropFilter', 'borderRadius', 'border', 'padding', 'boxShadow', 'display', 'gap', 'color', 'zIndex']
  const pick = (el) => {
    if (!el) return null
    const c = getComputedStyle(el)
    const r = el.getBoundingClientRect()
    const o = { tag: el.tagName.toLowerCase(), cls: (el.className || '').toString().slice(0, 60), rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) } }
    STY.forEach((p) => (o[p] = c[p]))
    return o
  }

  // el header/nav: buscar el que contiene el logo "Tenity"
  const all = Array.from(document.querySelectorAll('header, nav, div'))
  const logo = all.find((el) => /(^|\s)tenity(\s|$)/i.test(el.textContent.trim()) && el.querySelector('a,svg,img') && el.getBoundingClientRect().top < 120 && el.getBoundingClientRect().height < 120)
  // candidato barra: ancestro fijo/sticky con bg no transparente
  let bar = logo
  for (let i = 0; i < 5 && bar; i++) {
    const c = getComputedStyle(bar)
    if ((c.position === 'fixed' || c.position === 'sticky') && c.backgroundColor !== 'rgba(0, 0, 0, 0)') break
    bar = bar.parentElement
  }
  // header explícito
  const header = document.querySelector('header')

  return {
    header: pick(header),
    bar: pick(bar),
    barParent: pick(bar && bar.parentElement),
  }
})

await browser.close()
const txt = JSON.stringify(data, null, 2)
console.log(txt)
writeFileSync('C:\\Users\\mateo\\Desktop\\extra\\.eros\\tenity-nav.json', txt)
