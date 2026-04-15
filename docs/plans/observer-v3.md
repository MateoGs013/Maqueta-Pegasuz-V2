# Plan: Observer V3 — Eros Ve, Siente, y Juzga

## De qué se trata

V2 mide **presencia** — tiene 3 z-index layers, tiene GSAP, tiene media queries.
V3 mide **calidad percibida** — las animaciones son suaves, la composición guía la mirada, los colores armonizan, el diseño es único.

Es la diferencia entre contar ingredientes y probar la comida.

## Problema actual (V2)

El observer V2 tiene 6 capas funcionando (geometría, estética, semántica, anti-template, structural, motion). Pero tiene **blindspots críticos** revelados por el audit del codebase:

### Lo que V2 NO puede hacer

1. **No mide calidad de motion** — cuenta animaciones pero no sabe si son suaves o janky. Linear y cubic-bezier custom scorean igual.
2. **No analiza estados interactivos** — hover, click, focus son invisibles. Un sitio con 50 hover effects y uno sin ninguno scorean igual si su HTML estático es idéntico.
3. **No evalúa canvas/3D** — cuenta `<canvas>` pero no analiza su contenido visual ni complejidad WebGL.
4. **No mide performance real** — no hay LCP, CLS, TBT. Solo busca patterns estáticos (lazy loading, width/height).
5. **No detecta armonía de color con rigor** — analiza clusters HSL pero no aplica Matsuda/Itten harmony templates.
6. **No predice atención visual** — no sabe dónde mira el usuario primero.
7. **No tiene AI aesthetic scoring** — no usa modelos de visión para evaluar calidad estética general.
8. **No mide CSS quality** — no detecta CSS no usado, specificity bloat, duplicación.
9. **Todo hardcoded** — viewports, pesos, thresholds, sample sizes sin config.
10. **Todo secuencial** — las 6 capas corren una después de otra (~95s por URL).

### Scoring actual (V2)

```
rawFinal = observerScore × 0.48 + criticScore × 0.34 + memoryAlignment × 0.18
```

Solo 3 señales. Sin granularidad. Todas las dimensiones pesadas igual.

## Visión V3: 4 Pases de Análisis

```
┌─────────────────────────────────────────────────────────────┐
│                    OBSERVER V3                               │
│                                                             │
│  Pase 1: STRUCTURAL (< 3s, paralelo)                       │
│  ├── ARIA snapshot (mode: 'ai')                             │
│  ├── DOM geometry + anti-template                           │
│  ├── CSS coverage (unused %)                                │
│  ├── CSS quality score (specificity, complexity, duplication)│
│  └── Resource analysis (fonts, images, compression)         │
│                                                             │
│  Pase 2: PERCEPTUAL (< 5s, paralelo)                       │
│  ├── CDP Animation domain → easing quality scoring          │
│  ├── CDP LayerTree → GPU compositing analysis               │
│  ├── PerformanceObserver → LCP, CLS, TBT reales            │
│  ├── Long Animation Frame → jank detection                  │
│  ├── Matsuda color harmony templates                        │
│  └── Interaction state capture (hover, focus, click)        │
│                                                             │
│  Pase 3: INTELLIGENCE (< 10s, paralelo)                    │
│  ├── Aesthetic scoring local (MUSIQ/CLIPIQA via pyiqa)      │
│  ├── Saliency map (DeepGaze/attention prediction)           │
│  ├── Template uniqueness (pHash distance vs corpus)         │
│  └── Section-to-section repetition (SSIM cross-compare)     │
│                                                             │
│  Pase 4: JUDGMENT (< 15s, secuencial)                      │
│  ├── LLM-as-judge por dimensión (composition, typography,   │
│  │   color, depth, motion, uniqueness)                      │
│  ├── Structured JSON rubric con anchoring calibrado         │
│  └── Ensemble: observer heuristics + AI scores → final      │
│                                                             │
│  Total: ~30s (vs 95s en V2) gracias a paralelización        │
└─────────────────────────────────────────────────────────────┘
```

---

## Pase 1: STRUCTURAL — Lo que se puede medir sin renderizar

### 1.1 ARIA Snapshot (mode: 'ai') — Playwright 1.59

```javascript
// Reemplaza page.accessibility.snapshot() actual
const ariaTree = await page.locator('body').ariaSnapshot({ mode: 'ai' })
// Retorna YAML optimizado para LLM con element refs + iframe contents
```

**Métricas nuevas:**
- Heading hierarchy depth + skip detection (ya existe, pero más rico)
- Landmark completeness score (0-100)
- Interactive element naming coverage (% de buttons/links con nombre accesible)
- ARIA tree complexity (profundidad × anchura, normalizada)

### 1.2 CSS Coverage — Detectar CSS muerto

```javascript
await page.coverage.startCSSCoverage({ resetOnNavigation: false })
await page.goto(url)
const coverage = await page.coverage.stopCSSCoverage()

for (const entry of coverage) {
  const total = entry.text?.length ?? 0
  const used = entry.ranges.reduce((s, r) => s + (r.end - r.start), 0)
  const unusedPct = ((total - used) / total * 100)
  // unusedPct > 60% → flag como CSS bloat
}
```

**Métrica:** `cssUnusedPercent` (0-100). Target: < 40%.

### 1.3 CSS Quality Score — @projectwallace/css-code-quality

```javascript
import { calculate } from '@projectwallace/css-code-quality'

// Extraer todo el CSS de la página
const allCSS = await page.evaluate(() => {
  return [...document.styleSheets]
    .filter(s => !s.href || s.href.startsWith(location.origin))
    .map(s => [...s.cssRules].map(r => r.cssText).join('\n'))
    .join('\n')
})

const quality = calculate(allCSS)
// quality.performance.score   (0-100) — @import, duplication, file size
// quality.maintainability.score (0-100) — selectors/rule, declarations/rule
// quality.complexity.score    (0-100) — specificity outliers, !important, ID ratio
```

**Métricas:** 3 scores independientes (performance, maintainability, complexity).

### 1.4 Resource Analysis — Fonts, imágenes, compresión

```javascript
const resources = await page.evaluate(() =>
  JSON.stringify(performance.getEntriesByType('resource'))
)
const parsed = JSON.parse(resources)

// Detectar: imágenes sin comprimir, fonts lentos, scripts bloqueantes
const uncompressed = parsed.filter(r =>
  r.initiatorType === 'img' && r.encodedBodySize === r.decodedBodySize
)
const slowFonts = parsed.filter(r =>
  r.initiatorType === 'link' && r.name.match(/\.(woff2?|ttf|otf)/) && r.duration > 2000
)
```

**Métricas:** `uncompressedImages`, `slowFontCount`, `totalTransferKB`.

---

## Pase 2: PERCEPTUAL — Lo que se ve y se siente

### 2.1 CDP Animation Domain — Calidad real de motion

**Esto NO existe en ningún observer del mercado.** Es completamente nuevo.

```javascript
const session = await page.context().newCDPSession(page)
await session.send('Animation.enable')

const animations = []
session.on('Animation.animationCreated', async ({ id }) => {
  const detail = await session.send('Animation.getAnimation', { animationId: id })
  animations.push(detail)
})

await page.goto(url)
// Scroll para triggear animaciones
// animations[] ahora tiene CADA animación con:
// - type: 'CSSTransition' | 'CSSAnimation' | 'WebAnimation'
// - duration, delay, playbackRate
// - source.keyframesRule (keyframes completos)
// - source.timingFunction (la easing curve REAL)
```

**Scoring de easing quality:**
```javascript
const BAD_EASINGS = ['linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out']

const easingScore = animations.reduce((score, anim) => {
  const tf = anim.animation?.source?.timingFunction || 'ease'
  if (BAD_EASINGS.includes(tf)) return score // default = 0 points
  if (tf.startsWith('cubic-bezier')) return score + 2 // custom = 2 points
  return score + 1 // named GSAP = 1 point
}, 0) / Math.max(animations.length, 1)
```

**Métricas nuevas:**
- `easingQuality` (0-10) — ratio custom vs default easings
- `animationVariety` — count of unique timing functions
- `staggerDetected` — boolean, ¿hay delays incrementales entre elementos?
- `durationDistribution` — {min, max, avg, stddev} de duraciones

### 2.2 CDP LayerTree — Composición GPU

```javascript
await session.send('LayerTree.enable')
let gpuLayers = []
session.on('LayerTree.layerTreeDidChange', ({ layers }) => {
  gpuLayers = layers || []
})

// Después de scroll:
// gpuLayers.length = número de capas GPU composited
// Alto = posible over-compositing (> 50 capas → warn)
// Bajo = sin depth real (< 3 capas en desktop → flag)
```

**Métrica:** `gpuLayerCount`, `overCompositingRisk` (boolean si > 50).

### 2.3 Performance Real — LCP, CLS, TBT

```javascript
// Inyectar ANTES de navigation
const [lcp, cls, tbt] = await Promise.all([
  page.evaluate(() => new Promise(resolve => {
    new PerformanceObserver(list => {
      resolve(list.getEntries().at(-1).startTime)
    }).observe({ type: 'largest-contentful-paint', buffered: true })
  })),

  page.evaluate(() => new Promise(resolve => {
    let score = 0
    new PerformanceObserver(list => {
      list.getEntries().forEach(e => { if (!e.hadRecentInput) score += e.value })
    }).observe({ type: 'layout-shift', buffered: true })
    setTimeout(() => resolve(score), 5000)
  })),

  page.evaluate(() => new Promise(resolve => {
    let total = 0
    new PerformanceObserver(list => {
      list.getEntries().forEach(e => { total += e.duration - 50 })
    }).observe({ type: 'longtask', buffered: true })
    setTimeout(() => resolve(total), 5000)
  }))
])
```

**Métricas:** `lcpMs`, `clsScore`, `tbtMs`. Thresholds: LCP < 2500ms, CLS < 0.1, TBT < 300ms.

### 2.4 CDP Performance.getMetrics — Estilo y layout

```javascript
await session.send('Performance.enable')
const { metrics } = await session.send('Performance.getMetrics')
// Extraer:
// - RecalcStyleCount (> 50 = CSS over-engineered)
// - LayoutCount (> 30 = layout thrashing)
// - ScriptDuration (> 2000ms = JS-heavy)
```

**Métricas:** `recalcStyleCount`, `layoutCount`, `scriptDurationMs`.

### 2.5 Matsuda Color Harmony — Algoritmo real

Reemplaza el clustering HSL actual con el algoritmo de Cohen-Or (SIGGRAPH 2006):

```javascript
// 8 templates de Matsuda (hue sectors en grados)
const TEMPLATES = {
  'i':  [[0, 18]],                              // monochrome
  'V':  [[0, 18], [180, 18]],                   // complementary
  'L':  [[0, 18], [90, 18]],                    // split
  'T':  [[0, 18], [120, 18], [240, 18]],        // triadic
  'Y':  [[0, 18], [26, 18], [180, 18]],         // split-complementary
  'X':  [[0, 18], [90, 18], [180, 18], [270, 18]], // square
}

// Para cada template, rotar para minimizar distancia angular
// Score = proporción de pixels dentro de sectors del template óptimo
```

**Métricas:** `harmonyTemplate` (tipo), `harmonyScore` (0-10), `harmonyRotation` (grados de ajuste).

### 2.6 Interaction State Capture — Hover/Focus/Click

```javascript
// Recuperar lo que V1 tenía y V2 perdió, pero mejor
const interactiveElements = await page.$$('a, button, [role="button"], [tabindex]')

for (const el of interactiveElements.slice(0, 20)) {
  const before = await el.screenshot()
  await el.hover()
  await page.waitForTimeout(300) // esperar transición
  const after = await el.screenshot()

  // Comparar before/after con SSIM
  const hasHoverEffect = ssimCompare(before, after) < 0.95
  if (hasHoverEffect) hoverEffectCount++
}
```

**Métricas:** `hoverEffectCount`, `hoverEffectVariety` (unique transitions), `focusVisibleCount`.

---

## Pase 3: INTELLIGENCE — Lo que requiere ML

### 3.1 Aesthetic Scoring Local — pyiqa

```bash
# Setup one-time
pip install pyiqa torch
```

```python
# eros-aesthetic.py — llamado como child process
import pyiqa, torch, sys, json

device = "cuda" if torch.cuda.is_available() else "cpu"
musiq = pyiqa.create_metric('musiq', device=device)  # 0-100, any resolution
clipiqa = pyiqa.create_metric('clipiqa', device=device)  # 0-1, CLIP-based

path = sys.argv[1]
scores = {
    'musiq': float(musiq(path)),      # 0-100
    'clipiqa': float(clipiqa(path)),  # 0-1
}
print(json.dumps(scores))
```

```javascript
// Desde Node.js:
const { stdout } = await execFile('python', ['eros-aesthetic.py', screenshotPath])
const { musiq, clipiqa } = JSON.parse(stdout)
// musiq > 60 = good aesthetic quality
// clipiqa > 0.5 = good perceptual quality
```

**Métricas:** `aestheticMusiq` (0-100), `aestheticClipIqa` (0-1).

### 3.2 Saliency Prediction — DeepGaze

```python
# eros-saliency.py
import deepgaze_pytorch, torch, numpy as np, sys, json
from PIL import Image
from scipy.ndimage import zoom
from scipy.special import logsumexp

model = deepgaze_pytorch.DeepGazeIIE(pretrained=True)
img = np.array(Image.open(sys.argv[1]))
img_t = torch.tensor([img.transpose(2,0,1)]).float()

# Centerbias prior
cb = np.load('centerbias_mit1003.npy')
cb = zoom(cb, (img.shape[0]/cb.shape[0], img.shape[1]/cb.shape[1]))
cb -= logsumexp(cb)
cb_t = torch.tensor([cb]).float()

log_density = model(img_t, cb_t)
density = torch.exp(log_density).squeeze().detach().numpy()

# Calcular: ¿el punto más saliente coincide con el CTA/heading principal?
# Dividir en cuadrantes, reportar distribución de atención
quadrants = {
  'top_left': density[:h//2, :w//2].sum(),
  'top_right': density[:h//2, w//2:].sum(),
  'bottom_left': density[h//2:, :w//2].sum(),
  'bottom_right': density[h//2:, w//2:].sum(),
}
print(json.dumps({ 'attention_distribution': quadrants, 'peak_region': max_region }))
```

**Métricas:** `attentionDistribution` (4 quadrants), `peakRegion`, `attentionAlignedWithCTA` (boolean).

### 3.3 Template Uniqueness — Perceptual Hash

```javascript
import sharpPhash from 'sharp-phash'
import sharp from 'sharp'

// Comparar contra corpus de templates conocidos (Bootstrap, Tailwind defaults, etc.)
const hash = await sharpPhash(sharp(screenshotPath))
const distances = templateCorpus.map(t => hammingDistance(hash, t.hash))
const minDistance = Math.min(...distances)

// 0-5: near-duplicate template
// 6-15: similar structure
// 16+: distinctive
const uniquenessScore = Math.min(10, minDistance / 6.4) // normalize to 0-10
```

**Métrica:** `uniquenessHash` (0-10), `nearestTemplate` (nombre del más similar).

### 3.4 Section Repetition — SSIM Cross-Compare

```javascript
// Capturar screenshot de cada sección visible
// Comparar CADA par de secciones entre sí
for (let i = 0; i < sections.length; i++) {
  for (let j = i + 1; j < sections.length; j++) {
    const similarity = ssim(sections[i].screenshot, sections[j].screenshot)
    if (similarity > 0.85) {
      repetitions.push({ a: sections[i].id, b: sections[j].id, similarity })
    }
  }
}
```

**Métrica:** `sectionRepetitions` (count de pares con SSIM > 0.85).

---

## Pase 4: JUDGMENT — LLM evalúa como director creativo

### 4.1 Design por dimensión (UICrit methodology)

Basado en Google Research UICrit (2024): evaluaciones por dimensión son 55% más precisas que prompts genéricos.

```javascript
const DIMENSIONS = ['composition', 'typography', 'color', 'depth', 'motion', 'uniqueness']

const evaluations = await Promise.all(DIMENSIONS.map(async dim => {
  const response = await claude.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 500,
    system: `You are a senior creative director evaluating web design.
Score ONLY the ${dim} dimension on a 0-10 scale.
Anchoring: 1=Bootstrap default, 5=competent agency, 10=Awwwards SOTD.
Return JSON: { "score": N, "rationale": "...", "issues": [...] }`,
    messages: [{
      role: 'user',
      content: [
        { type: 'image', source: { type: 'base64', media_type: 'image/png', data: screenshot } },
        { type: 'text', text: `Evaluate ${dim}. Return ONLY JSON.` }
      ]
    }]
  })
  return { dimension: dim, ...JSON.parse(response.content[0].text) }
}))
```

### 4.2 Ensemble Final — Heuristics + AI = Confianza

```javascript
// Combinar observer heuristics (rápido, determinista) con AI judgment (rico, costoso)
const finalScore = {
  composition: weightedAvg(
    observerGeometry.score * 0.4,      // heurística: visual balance
    aiJudgment.composition.score * 0.4, // LLM evaluation
    aestheticMusiq * 0.1,              // ML aesthetic
    saliencyAlignment * 0.1            // attention prediction
  ),
  depth: weightedAvg(
    observerStructural.score * 0.3,
    gpuLayerScore * 0.2,
    aiJudgment.depth.score * 0.4,
    aestheticClipIqa * 0.1
  ),
  typography: weightedAvg(
    observerTypography.score * 0.5,   // las heurísticas de typo son buenas
    aiJudgment.typography.score * 0.4,
    cssQuality.maintainability * 0.1
  ),
  motion: weightedAvg(
    easingQuality * 0.3,              // CDP Animation data
    jankScore * 0.2,                  // PerformanceObserver
    aiJudgment.motion.score * 0.3,
    staggerBonus * 0.2
  ),
  craft: weightedAvg(
    hoverEffectScore * 0.2,
    colorHarmonyScore * 0.2,
    aiJudgment.uniqueness.score * 0.3,
    cssUnusedPenalty * 0.1,
    a11yScore * 0.2
  )
}
```

---

## Arquitectura de implementación

### Archivos nuevos

| Archivo | Qué hace | Líneas est. |
|---------|----------|-------------|
| `scripts/eros-observer-v3.mjs` | Orquestador de los 4 pases | ~400 |
| `scripts/observer/pass-structural.mjs` | Pase 1: ARIA, CSS coverage, CSS quality, resources | ~300 |
| `scripts/observer/pass-perceptual.mjs` | Pase 2: CDP animation, LayerTree, CWV, hover states | ~400 |
| `scripts/observer/pass-intelligence.mjs` | Pase 3: wrapper Node para pyiqa, saliency, pHash, SSIM | ~200 |
| `scripts/observer/pass-judgment.mjs` | Pase 4: LLM evaluations, ensemble scoring | ~250 |
| `scripts/observer/scoring-engine.mjs` | Weighted ensemble, configurable weights | ~150 |
| `scripts/observer/template-corpus.json` | Hashes de templates genéricos conocidos | data |
| `scripts/eros-aesthetic.py` | Python: pyiqa MUSIQ + CLIPIQA scoring | ~30 |
| `scripts/eros-saliency.py` | Python: DeepGaze saliency prediction | ~40 |

### Dependencias nuevas

```bash
# Node.js
npm install @projectwallace/css-code-quality sharp-phash

# Python (one-time setup)
pip install pyiqa torch deepgaze-pytorch scipy scikit-image pillow
```

### Backward compatibility

- `manifest.json` mantiene el mismo schema pero con campos adicionales
- `refresh-quality.mjs` sigue leyendo el mismo formato
- V2 campos (`excellenceSignals`, `qualityGates`) se preservan
- Nuevos campos: `performanceMetrics`, `animationAnalysis`, `aestheticScores`, `llmJudgment`
- Flag `observerVersion: 3` para que downstream sepa qué datos están disponibles

---

## Configuración (lo que V2 tenía hardcoded)

```json
// .claude/observer-config.json (NUEVO)
{
  "viewports": {
    "desktop": { "width": 1440, "height": 900 },
    "mobile": { "width": 375, "height": 812 }
  },
  "limits": {
    "maxElements": 500,
    "maxAnimations": 100,
    "maxHoverTests": 20,
    "wheelStates": 4
  },
  "scoring": {
    "weights": {
      "observer": 0.35,
      "llmJudge": 0.35,
      "aesthetic": 0.15,
      "performance": 0.15
    },
    "dimensionWeights": {
      "composition": 0.25,
      "depth": 0.20,
      "typography": 0.20,
      "motion": 0.20,
      "craft": 0.15
    }
  },
  "performance": {
    "lcpTarget": 2500,
    "clsTarget": 0.1,
    "tbtTarget": 300
  },
  "passes": {
    "structural": true,
    "perceptual": true,
    "intelligence": true,
    "judgment": true
  },
  "llm": {
    "model": "claude-sonnet-4-6",
    "maxTokensPerDimension": 500,
    "dimensions": ["composition", "typography", "color", "depth", "motion", "uniqueness"]
  }
}
```

---

## Estimación

| Fase | Qué | Esfuerzo | Dependencia |
|------|-----|----------|-------------|
| 0 | Setup: config file, module structure, dependencies | 1h | — |
| 1 | Pase Structural: ARIA v2, CSS coverage, CSS quality, resources | 3h | Fase 0 |
| 2 | Pase Perceptual: CDP Animation, LayerTree, CWV, Matsuda color | 4h | Fase 0 |
| 3 | Pase Perceptual: interaction states (hover/focus capture) | 2h | Fase 2 |
| 4 | Pase Intelligence: pyiqa wrapper, saliency wrapper | 2h | Python setup |
| 5 | Pase Intelligence: pHash uniqueness, SSIM repetition | 2h | Fase 4 |
| 6 | Pase Judgment: LLM evaluator con UICrit rubrics | 2h | Fase 0 |
| 7 | Scoring Engine: weighted ensemble, configurable | 2h | Fases 1-6 |
| 8 | Integración: manifest v3, backward compat, refresh-quality | 2h | Fase 7 |
| 9 | Template corpus: capturar hashes de 20+ templates genéricos | 1h | Fase 5 |
| 10 | Testing: calibrar con proyectos existentes (Coque, Axon, Lampone) | 3h | Todo |
| **Total** | | **~24h** | |

## Prioridad de fases

Si hay que hacer incremental:

1. **Fases 0+1+2** (Structural + Perceptual core) — 8h. El mayor salto de calidad. CDP Animation + CWV reales + CSS quality.
2. **Fase 3** (Interaction states) — 2h. Recupera lo que V1 tenía y V2 perdió.
3. **Fases 4+5** (Intelligence) — 4h. Aesthetic scoring + uniqueness. Requiere Python.
4. **Fase 6+7** (Judgment + Scoring) — 4h. LLM-as-judge. El feature más innovador.
5. **Fases 8+9+10** (Integration + Testing) — 6h. Cerrar el loop.

## Lo que hace único a V3

Ningún tool de visual testing en el mercado combina estos 4 pases. Los tools existentes hacen UNO:
- Applitools/Percy → visual regression (pixel diff)
- Lighthouse → performance metrics
- axe-core → accessibility
- Stylelint → CSS linting

**V3 hace los 4 en un solo scan**, más:
- CDP Animation analysis (no existe en ningún tool público)
- Aesthetic scoring con modelos ML locales (solo labs de investigación lo hacen)
- Saliency prediction aplicada a web design (solo Attention Insight comercial)
- LLM-as-judge con UICrit methodology (Google Research 2024, no productizado)
- Template uniqueness via perceptual hash (novel para web design)

## Fuentes de la investigación

### Playwright / CDP
- [Playwright Visual Comparisons](https://playwright.dev/docs/test-snapshots)
- [Playwright ARIA Snapshots mode: 'ai'](https://playwright.dev/docs/aria-snapshots)
- [Playwright CSS Coverage API](https://playwright.dev/docs/api/class-coverage)
- [Playwright CDPSession](https://playwright.dev/docs/api/class-cdpsession)
- [Playwright Screencast API v1.59](https://playwright.dev/docs/api/class-screencast)
- [Chrome DevTools Protocol — Animation domain](https://chromedevtools.github.io/devtools-protocol/tot/Animation/)
- [Chrome DevTools Protocol — LayerTree domain](https://chromedevtools.github.io/devtools-protocol/tot/LayerTree/)
- [Checkly: Playwright Performance](https://www.checklyhq.com/docs/learn/playwright/performance/)

### Computational Aesthetics
- [IQA-PyTorch (pyiqa) — 50+ models](https://github.com/chaofengc/IQA-PyTorch)
- [LAION Aesthetic Predictor V2.5](https://github.com/discus0434/aesthetic-predictor-v2-5)
- [DeepGaze PyTorch — saliency prediction](https://github.com/matthias-k/DeepGaze)
- [Cohen-Or Color Harmonization (SIGGRAPH 2006)](https://igl.ethz.ch/projects/color-harmonization/harmonization.pdf)
- [Matsuda Harmony Templates — geometric approach](https://arxiv.org/pdf/1709.02252)

### LLM-as-Judge
- [UICrit: LLM Design Evaluation (Google Research 2024)](https://arxiv.org/html/2407.08850v3)
- [UICrit Dataset](https://github.com/google-research-datasets/uicrit)

### CSS Analysis
- [Project Wallace CSS Code Quality](https://github.com/projectwallace/css-code-quality)
- [analyze-css — 50 CSS metrics](https://github.com/macbre/analyze-css)

### Visual Testing
- [imagehash — perceptual hashing](https://github.com/JohannesBuchner/imagehash)
- [sharp-phash — Node.js pHash](https://www.context.dev/blog/perceptual-hashing-in-node-js-with-sharp-phash-for-developers)
- [web.dev Animation Smoothness Metrics](https://web.dev/articles/smoothness)
- [Motion.dev Web Animation Performance Tier List](https://motion.dev/blog/web-animation-performance-tier-list)

### Accessibility
- [IBM Equal Access](https://github.com/IBMa/equal-access)
- [GSAP AI Skills](https://github.com/greensock/gsap-skills)
