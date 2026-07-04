import puppeteer from 'puppeteer'
const OUT = 'C:/Users/mateo/Desktop/extra/.eros/_shots'
const id = (process.argv[2] || 'clientes').replace('#', '')
const base = process.argv[3] || id
const w = parseInt(process.argv[4] || '1440', 10)
const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] })
const p = await b.newPage()
await p.setViewport({ width: w, height: w >= 1024 ? 900 : 844, deviceScaleFactor: 1 })
await p.goto('http://localhost:5174/', { waitUntil: 'networkidle2', timeout: 60000 })
await new Promise((r) => setTimeout(r, 2600)) // dejar terminar el preloader
// scroll escalonado hasta la sección (cruza los ScrollTriggers → dispara reveals)
const targetY = await p.evaluate((secId) => {
  const el = document.getElementById(secId)
  return el.getBoundingClientRect().top + window.scrollY
}, id)
let y = 0
while (y < targetY - 60) {
  y += 360
  await p.evaluate((yy) => {
    if (window.__lenis) window.__lenis.scrollTo(yy, { immediate: false })
    else window.scrollTo(0, yy)
  }, y)
  await new Promise((r) => setTimeout(r, 220))
}
await new Promise((r) => setTimeout(r, 1600))
await p.screenshot({ path: `${OUT}/${base}-view.png` })
await b.close()
console.log('view shot', id)
