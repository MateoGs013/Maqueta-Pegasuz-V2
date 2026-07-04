/**
 * grab-deep.mjs — EXTRACCIÓN PROFUNDA del código fuente real de un sitio.
 * --------------------------------------------------------------------------
 * No adivina: scrollea para disparar todos los reveals, luego camina el DOM y
 * por cada nodo SIGNIFICATIVO (heading, párrafo, card redondeada, pill/botón,
 * imagen, número gigante, contenedor grid/flex) saca su caja absoluta + estilos
 * computados clave (font, color, bg/gradiente, border, radius POR ESQUINA,
 * padding, gap, grid-template). Ordena por Y y agrupa en bandas de 1022px para
 * que cada nodo case con las capturas scroll-NN.png.
 *
 * Uso: node grab-deep.mjs <url> <outBasename>
 *   ej: node grab-deep.mjs https://www.tenity.com/ tenity-deep
 * Escribe en extra/.eros/<outBasename>.json y <outBasename>.txt
 */
import puppeteer from 'puppeteer'
import { writeFileSync } from 'fs'

const url = process.argv[2] || 'https://www.tenity.com/'
const base = process.argv[3] || 'tenity-deep'
const OUT = `C:\\Users\\mateo\\Desktop\\extra\\.eros\\${base}`

const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
})
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 })
await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 })
await new Promise((r) => setTimeout(r, 2000))

// Scroll por toda la página para disparar reveals/lazy, luego volver arriba.
await page.evaluate(async () => {
  const h = document.body.scrollHeight
  for (let y = 0; y < h; y += 700) {
    window.scrollTo(0, y)
    await new Promise((r) => setTimeout(r, 120))
  }
  window.scrollTo(0, 0)
  await new Promise((r) => setTimeout(r, 400))
})

const data = await page.evaluate(() => {
  const px = (v) => Math.round(parseFloat(v) || 0)
  const short = (s, n = 90) => (s || '').replace(/\s+/g, ' ').trim().slice(0, n)
  const cls = (el) => short((el.className && el.className.baseVal !== undefined ? el.className.baseVal : el.className) || '', 50)

  const radiusOf = (cs) => {
    const tl = px(cs.borderTopLeftRadius), tr = px(cs.borderTopRightRadius)
    const br = px(cs.borderBottomRightRadius), bl = px(cs.borderBottomLeftRadius)
    if (tl === tr && tr === br && br === bl) return tl === 0 ? '' : `r:${tl}`
    return `r:${tl}/${tr}/${br}/${bl}` // tl tr br bl  (detecta la esquina cuarto-de-círculo)
  }
  const bgOf = (cs) => {
    const img = cs.backgroundImage
    if (img && img !== 'none') {
      if (img.includes('gradient')) return 'grad:' + short(img, 60)
      if (img.includes('url')) return 'img'
    }
    const c = cs.backgroundColor
    return c && c !== 'rgba(0, 0, 0, 0)' ? `bg:${c}` : ''
  }
  const borderOf = (cs) => {
    const w = px(cs.borderTopWidth)
    if (!w) return ''
    return `bd:${w}px ${cs.borderTopColor}`
  }

  const nodes = []
  const all = document.querySelectorAll('body *')
  all.forEach((el) => {
    const cs = getComputedStyle(el)
    if (cs.display === 'none' || cs.visibility === 'hidden') return
    const rect = el.getBoundingClientRect()
    const w = Math.round(rect.width), h = Math.round(rect.height)
    if (w < 8 || h < 8) return
    const top = Math.round(rect.top + window.scrollY)
    const left = Math.round(rect.left + window.scrollX)
    const tag = el.tagName.toLowerCase()
    const fs = px(cs.fontSize)
    const radius = radiusOf(cs)
    const bg = bgOf(cs)
    const bd = borderOf(cs)
    const display = cs.display

    // ¿texto propio? (no de los hijos)
    let ownText = ''
    for (const n of el.childNodes) if (n.nodeType === 3) ownText += n.textContent
    ownText = short(ownText, 70)

    const isHeading = /^h[1-6]$/.test(tag)
    const isMedia = tag === 'img' || tag === 'video' || tag === 'svg'
    const isInteractive = tag === 'a' || tag === 'button'
    const isCard = (radius || bd) && h >= 60 && w >= 80
    const isGiant = fs >= 44 // número/heading gigante
    const isGridFlex =
      (display === 'grid' || display === 'flex') &&
      el.children.length >= 2 &&
      h >= 120

    if (!(isHeading || isMedia || isInteractive || isCard || isGiant || isGridFlex || ownText)) return

    const type = []
    if (isHeading) type.push(tag.toUpperCase())
    if (isCard) type.push('CARD')
    if (isGridFlex) type.push(display === 'grid' ? 'GRID' : 'FLEX')
    if (isInteractive) type.push(tag === 'a' ? 'LINK' : 'BTN')
    if (isMedia) type.push(tag.toUpperCase())
    if (isGiant && !isHeading) type.push('BIG')

    const styleBits = []
    if (fs) styleBits.push(`fs:${fs} fw:${cs.fontWeight} lh:${cs.lineHeight === 'normal' ? 'n' : px(cs.lineHeight)} ls:${cs.letterSpacing === 'normal' ? '0' : cs.letterSpacing}`)
    if (fs) styleBits.push(`ff:${cs.fontFamily.split(',')[0].replace(/["']/g, '')}`)
    const col = cs.color
    if (col && (isHeading || isGiant || ownText || isInteractive)) styleBits.push(`col:${col}`)
    if (bg) styleBits.push(bg)
    if (bd) styleBits.push(bd)
    if (radius) styleBits.push(radius)
    const pad = `${px(cs.paddingTop)} ${px(cs.paddingRight)} ${px(cs.paddingBottom)} ${px(cs.paddingLeft)}`
    if (pad !== '0 0 0 0' && (isCard || isGridFlex || isInteractive)) styleBits.push(`pad:${pad}`)
    if (isGridFlex) {
      if (cs.gap && cs.gap !== 'normal') styleBits.push(`gap:${cs.gap}`)
      if (cs.gridTemplateColumns && cs.gridTemplateColumns !== 'none') styleBits.push(`cols:${short(cs.gridTemplateColumns, 60)}`)
      styleBits.push(`dir:${cs.flexDirection || ''} just:${cs.justifyContent} align:${cs.alignItems}`)
    }

    nodes.push({
      top, left, w, h,
      tag, type: type.join('+'),
      cls: cls(el),
      text: ownText,
      style: styleBits.join('  '),
    })
  })

  // dedup: nodos casi idénticos (wrappers que comparten caja exacta)
  nodes.sort((a, b) => a.top - b.top || a.left - b.left)
  return { docHeight: document.body.scrollHeight, vw: window.innerWidth, nodes }
})

await browser.close()

// JSON crudo
writeFileSync(`${OUT}.json`, JSON.stringify(data, null, 2))

// TXT legible agrupado por bandas de 1022px (case con scroll-NN.png)
const BAND = 1022
let txt = `DEEP STRUCTURE: ${url}\nviewport: 1440  ·  docHeight: ${data.docHeight}px  ·  nodos: ${data.nodes.length}\n`
txt += `radius r:TL/TR/BR/BL  (busca la esquina cuarto-de-círculo: un valor enorme aislado)\n`
let band = -1
for (const n of data.nodes) {
  const b = Math.floor(n.top / BAND)
  if (b !== band) {
    band = b
    txt += `\n${'═'.repeat(60)}\n BANDA ${String(b).padStart(2, '0')}  (y≈${b * BAND}..${(b + 1) * BAND})   →  scroll-${String(b).padStart(2, '0')}\n${'═'.repeat(60)}\n`
  }
  const label = n.type ? `[${n.type}]` : ''
  const txtPart = n.text ? `  "${n.text}"` : ''
  txt += `  y${n.top} x${n.left} ${n.w}×${n.h} <${n.tag}>${label}${txtPart}\n`
  if (n.style) txt += `      ${n.style}\n`
}

writeFileSync(`${OUT}.txt`, txt)
console.log(`[grab-deep] ${data.nodes.length} nodos → ${base}.json + ${base}.txt`)
