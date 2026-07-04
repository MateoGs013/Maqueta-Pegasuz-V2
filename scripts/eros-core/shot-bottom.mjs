import puppeteer from 'puppeteer'
const widths = (process.argv[2] || '1440,390').split(',').map((n) => parseInt(n, 10))
const OUT = 'C:/Users/mateo/Desktop/extra/.eros/_shots'
const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] })
for (const w of widths) {
  const p = await b.newPage()
  await p.setViewport({ width: w, height: w >= 1024 ? 900 : 844, deviceScaleFactor: 1 })
  await p.goto('http://localhost:5174/', { waitUntil: 'networkidle2', timeout: 60000 })
  await new Promise((r) => setTimeout(r, 1000))
  await p.evaluate(async () => {
    const y = document.body.scrollHeight
    if (window.__lenis) window.__lenis.scrollTo(y, { immediate: true })
    else window.scrollTo(0, y)
    await new Promise((r) => setTimeout(r, 800))
  })
  const tag = w >= 1024 ? 'desktop' : 'mobile'
  await p.screenshot({ path: `${OUT}/footer-${tag}.png` })
  await p.close()
  console.log('[footer]', w)
}
await b.close()
console.log('done')
