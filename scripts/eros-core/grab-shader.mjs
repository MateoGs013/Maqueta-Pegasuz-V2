/**
 * grab-shader.mjs — captura el GLSL real de un sitio WebGL.
 * Sobrescribe gl.shaderSource() ANTES de que cargue la página y registra todo el
 * código de shader que el sitio le pasa a la GPU. Saca el shader exacto de la fuente.
 * Uso: node grab-shader.mjs <url>
 */
import puppeteer from 'puppeteer'
import { writeFileSync } from 'fs'

const url = process.argv[2] || 'https://www.tenity.com/'

const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--ignore-gpu-blocklist'],
})
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900 })

await page.evaluateOnNewDocument(() => {
  window.__shaders = []
  const wrap = (proto) => {
    if (!proto || !proto.shaderSource) return
    const orig = proto.shaderSource
    proto.shaderSource = function (shader, source) {
      try { window.__shaders.push(source) } catch (e) {}
      return orig.call(this, shader, source)
    }
  }
  if (window.WebGLRenderingContext) wrap(WebGLRenderingContext.prototype)
  if (window.WebGL2RenderingContext) wrap(WebGL2RenderingContext.prototype)
})

const scriptUrls = []
page.on('response', (r) => {
  const u = r.url()
  if (u.endsWith('.js') || u.includes('.js?')) scriptUrls.push(u)
})

console.log('[grab] →', url)
await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 })
await new Promise((r) => setTimeout(r, 4000))
// un poco de scroll/mouse por si el shader se inicializa con interacción
await page.mouse.move(720, 450)
await new Promise((r) => setTimeout(r, 1500))

const shaders = await page.evaluate(() => window.__shaders || [])
await browser.close()

console.log(`[grab] scripts .js cargados: ${scriptUrls.length}`)
scriptUrls.forEach((u) => console.log('   ' + u))
console.log(`\n[grab] shaders capturados: ${shaders.length}`)
shaders.forEach((s, i) => {
  console.log(`\n===== SHADER ${i}  (${s.length} chars) =====`)
  console.log(s)
})

writeFileSync(
  'C:\\Users\\mateo\\Desktop\\extra\\.eros\\tenity-shaders.txt',
  scriptUrls.join('\n') + '\n\n' + shaders.map((s, i) => `===== SHADER ${i} =====\n${s}`).join('\n\n'),
)
console.log('\n[grab] guardado en extra/.eros/tenity-shaders.txt')
