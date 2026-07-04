import puppeteer from 'puppeteer'
const OUT = 'C:/Users/mateo/Desktop/extra/.eros/_shots'
const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] })
const p = await b.newPage()
await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 })
await p.goto('http://localhost:5174/', { waitUntil: 'networkidle2', timeout: 60000 })
await new Promise((r) => setTimeout(r, 2600))

// estado default: punto chico sobre área vacía
await p.mouse.move(1150, 470, { steps: 6 })
await new Promise((r) => setTimeout(r, 600))
await p.screenshot({ path: `${OUT}/cursor-default.png` })

// estado hover: sobre un link del nav (barra clara → contraste)
const box = await p.evaluate(() => {
  const el = document.querySelector('.nav__menu .nav__link') || document.querySelector('a')
  const r = el.getBoundingClientRect()
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
})
await p.mouse.move(box.x, box.y, { steps: 10 })
await new Promise((r) => setTimeout(r, 700))
await p.screenshot({ path: `${OUT}/cursor-hover.png` })
await b.close()
console.log('cursor shots done')
