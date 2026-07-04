import puppeteer from 'puppeteer'
const OUT = 'C:/Users/mateo/Desktop/extra/.eros/_shots'
const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] })
const p = await b.newPage()
await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 })
p.goto('http://localhost:5174/', { waitUntil: 'domcontentloaded' }).catch(() => {})
const shots = [
  { t: 1600, name: 'loader-a-fill' },
  { t: 1950, name: 'loader-b-full' },
  { t: 2250, name: 'loader-c-hold' },
  { t: 3400, name: 'loader-d-done' },
]
let prev = 0
for (const s of shots) {
  await new Promise((r) => setTimeout(r, s.t - prev))
  prev = s.t
  await p.screenshot({ path: `${OUT}/${s.name}.png` })
  console.log(s.name)
}
await b.close()
console.log('done')
