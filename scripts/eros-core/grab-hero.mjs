/**
 * grab-hero.mjs — extrae estilos computados EXACTOS del hero + nav de un sitio,
 * para replicarlo 1:1. Lee el H1, el badge inline, el párrafo lead, los CTAs y el
 * nav, con font/size/weight/color/border/radius/padding reales.
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
  const pick = (el, props) => {
    if (!el) return null
    const c = getComputedStyle(el)
    const o = { tag: el.tagName.toLowerCase(), cls: (el.className || '').toString().slice(0, 50), text: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60) }
    props.forEach((p) => (o[p] = c[p]))
    return o
  }
  const STY = ['fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'textTransform', 'color', 'backgroundColor', 'border', 'borderRadius', 'padding', 'boxShadow', 'width', 'height']

  const h1 = document.querySelector('h1')
  // hijos directos del h1 (líneas / badge inline)
  const h1kids = h1 ? Array.from(h1.querySelectorAll('*')).slice(0, 12).map((el) => pick(el, STY)) : []

  // párrafo lead: el <p> más cercano al h1 con texto largo
  const ps = Array.from(document.querySelectorAll('p')).filter((p) => p.textContent.trim().length > 40)
  const lead = ps[0] ? pick(ps[0], STY) : null

  // CTAs del hero por texto
  const links = Array.from(document.querySelectorAll('a,button'))
  const findByText = (t) => links.find((a) => a.textContent.replace(/\s+/g, ' ').trim().toLowerCase().includes(t))
  const vc = findByText('venture capital')
  const is = findByText('innovation services')
  const contact = findByText('contact')
  const ctaIconVC = vc ? vc.querySelector('svg,span,div') : null

  // nav: links principales
  const navEls = Array.from(document.querySelectorAll('nav a, header a')).slice(0, 12).map((a) => a.textContent.replace(/\s+/g, ' ').trim()).filter(Boolean)

  return {
    h1: pick(h1, STY),
    h1kids,
    lead,
    cta_vc: pick(vc, STY),
    cta_is: pick(is, STY),
    cta_icon: pick(ctaIconVC, STY),
    contact: pick(contact, STY),
    navLinks: [...new Set(navEls)],
  }
})

await browser.close()
const txt = JSON.stringify(data, null, 2)
console.log(txt)
writeFileSync('C:\\Users\\mateo\\Desktop\\extra\\.eros\\tenity-hero.json', txt)
