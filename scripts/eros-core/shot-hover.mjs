import puppeteer from 'puppeteer'
const OUT = 'C:/Users/mateo/Desktop/extra/.eros/_shots'
const id = (process.argv[2] || 'proceso').replace('#', '')
const cardSel = process.argv[3] || '.prc-card'
const idxs = (process.argv[4] || '0,1,2').split(',').map((n) => parseInt(n, 10))
const w = parseInt(process.argv[5] || '1440', 10)
const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] })
const p = await b.newPage()
await p.setViewport({ width: w, height: 900, deviceScaleFactor: 1 })
await p.goto('http://localhost:5174/', { waitUntil: 'networkidle2', timeout: 60000 })
await new Promise((r) => setTimeout(r, 1200))
await p.evaluate((secId) => {
  const el = document.getElementById(secId)
  const y = el.getBoundingClientRect().top + window.scrollY
  if (window.__lenis) window.__lenis.scrollTo(y - 20, { immediate: true })
  else window.scrollTo(0, y - 20)
}, id)
await new Promise((r) => setTimeout(r, 1800))
const cards = await p.$$(`#${id} ${cardSel}`)
for (const i of idxs) {
  if (!cards[i]) continue
  await cards[i].hover()
  await new Promise((r) => setTimeout(r, 900))
  const sec = await p.$(`#${id}`)
  await sec.screenshot({ path: `${OUT}/${id}-hover-${i}.png` })
  console.log('[hover]', id, i)
}
await b.close()
console.log('done')
