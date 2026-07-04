import puppeteer from 'puppeteer'
const out = process.argv[2] || 'C:/Users/mateo/Desktop/extra/.eros/_shots/full-page.png'
const w = parseInt(process.argv[3] || '1440', 10)
const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] })
const p = await b.newPage()
await p.setViewport({ width: w, height: 900, deviceScaleFactor: 1 })
await p.goto('http://localhost:5174/', { waitUntil: 'networkidle2', timeout: 60000 })
await new Promise((r) => setTimeout(r, 1200))
await p.evaluate(async () => {
  const h = document.body.scrollHeight
  for (let y = 0; y < h; y += 600) {
    if (window.__lenis) window.__lenis.scrollTo(y, { immediate: true })
    else window.scrollTo(0, y)
    await new Promise((r) => setTimeout(r, 90))
  }
  if (window.__lenis) window.__lenis.scrollTo(0, { immediate: true })
  else window.scrollTo(0, 0)
  await new Promise((r) => setTimeout(r, 400))
})
await p.screenshot({ path: out, fullPage: true })
await b.close()
console.log('full-page done')
