# Plan: Observer V2 — Eros Ve Por Sí Mismo

> **Status:** `in-progress`
> **Last reviewed:** 2026-04-14

## Problema actual

El observer V1 (`capture-refs.mjs`, 3000+ líneas, Puppeteer) hace análisis **estructural**:
- Cuenta z-index layers
- Mide padding asymmetry
- Busca clip-paths en el DOM
- Detecta GSAP via network interception
- Captura screenshots

Es como juzgar una película contando los cortes de cámara. Sabe que HAY técnica pero no sabe si **se ve bien**. Los scores de Excellence (Composition, Depth, Typography, Motion, Craft) se calculan con contadores binarios ("tiene 3+ z-index → +1 punto"). Un sitio con 10 z-index layers inútiles scorea igual que uno con 3 layers perfectamente compuestos.

## Objetivo

Un observer que analiza **calidad visual percibida** sin APIs externas. Eros ve con sus propias herramientas: geometría, color math, heurísticas tipográficas, detección de templates, y semántica del accessibility tree.

## Por qué Playwright

| Feature | Puppeteer | Playwright |
|---------|-----------|------------|
| ARIA accessibility tree snapshot (YAML) | No nativo | `page.accessibility.snapshot()` |
| Multi-browser (Chromium + Firefox + WebKit) | Solo Chromium | Los 3 |
| Auto-wait (reduce flakiness) | Manual | Built-in |
| Parallel execution | Manual | Nativo |
| `page.evaluate()` | Sí | Sí (misma API) |
| Network interception | Sí | Sí |
| Screenshots | Sí | Sí |
| Comunidad / mantenimiento 2026 | Activo | Dominante |

**Decisión**: migrar a Playwright. No es un rewrite — es un upgrade. El 80% del código de `page.evaluate()` se reutiliza tal cual.

## Arquitectura

```
eros-observer.mjs (nuevo, Playwright)
  │
  ├── Capa 1: Geometría     → visual balance, distribución, densidad
  ├── Capa 2: Estética       → color harmony, whitespace, tipografía
  ├── Capa 3: Semántica      → ARIA tree, heading hierarchy, landmarks
  ├── Capa 4: Anti-template  → pattern detection, uniqueness scoring
  ├── Capa 5: Structural     → z-index, clip-path, GSAP (migrado de V1)
  └── Capa 6: Funcional      → wheel states, hover, scroll behavior (migrado de V1)
       │
       ▼
  Scoring Engine → combina las 6 capas en scores finales
       │
       ▼
  Output: manifest.json + analysis.md (mismo contrato que V1)
```

## Las 6 capas en detalle

### Capa 1: Geometría Visual (NUEVA)

Analiza composición desde los bounding rects de cada elemento visible.

```javascript
// Dentro de page.evaluate():
const elements = [...document.querySelectorAll('*')].filter(el => {
  const rect = el.getBoundingClientRect()
  const style = getComputedStyle(el)
  return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.opacity !== '0'
})

// Para cada viewport-height (sección visual):
// 1. Centro de masa visual
const weightedX = elements.reduce((sum, el) => {
  const rect = el.getBoundingClientRect()
  const weight = rect.width * rect.height * parseFloat(getComputedStyle(el).opacity || 1)
  return sum + (rect.left + rect.width / 2) * weight
}, 0) / totalWeight

// 2. Distribución por cuadrantes (top-left, top-right, bottom-left, bottom-right)
// 3. Simetría horizontal y vertical
// 4. Overlap detection (elementos que se superponen intencionalmente)
// 5. "Sorpresa visual" — elementos que rompen el grid (negative margins, container breaks)
```

**Métricas:**
- `visualBalance.score` (0-10): centro de masa vs contrapeso
- `visualBalance.type`: "symmetric" | "asymmetric-balanced" | "asymmetric-unbalanced" | "chaotic"
- `visualBalance.quadrantDistribution`: peso por cuadrante
- `overlap.intentional`: elementos que se superponen con propósito (z-index + position)
- `surprise.count`: container breaks, negative margins, rotated elements

### Capa 2: Estética Computacional (NUEVA)

#### Color Harmony
```javascript
// Extraer todos los colores únicos (backgrounds + text + borders + accents)
// Convertir a HSL
// Analizar:
// - Distribución de Hue: ¿monochrome? ¿análogos? ¿complementarios? ¿triádicos?
// - Coherencia de temperatura: ¿todo warm? ¿todo cool? ¿mezcla intencional?
// - Saturación range: ¿apagado? ¿vibrante? ¿mixto?
// - AI fingerprint: purple gradients, neon-on-black genérico, rainbow sin propósito
```

**Métricas:**
- `colorHarmony.score` (0-10)
- `colorHarmony.type`: "monochrome" | "analogous" | "complementary" | "triadic" | "chaotic"
- `colorHarmony.temperature`: "warm" | "cool" | "neutral" | "mixed"
- `colorHarmony.saturationRange`: [min, max]
- `colorHarmony.aiFingerprint`: boolean + reason

#### Whitespace Ratio
```javascript
// Viewport total area
// Área "ocupada" = sum de bounding rects de elementos con contenido
// Whitespace = viewport - ocupada (con overlap correction)
// Per-section whitespace (rhythm: dense → light → dense → light)
```

**Métricas:**
- `whitespace.globalRatio` (0-1): target 0.4-0.6
- `whitespace.perSection[]`: ratio por sección visual
- `whitespace.rhythm`: "uniform" | "varied" | "progressive" | "chaotic"
- `whitespace.verdict`: "generous" | "balanced" | "dense" | "empty"

#### Typography Rhythm
```javascript
// Todos los font-size usados → sort descending
// Calcular ratio entre cada nivel
// ¿Sigue una escala modular? (1.125 minor second → 1.618 golden ratio)
// Heading/body ratio
// Weight variety (cuántos font-weights distintos)
// Letter-spacing usage (mínimo 1 para labels/captions)
// Line-height consistency (body debería ser 1.5-1.7)
```

**Métricas:**
- `typography.score` (0-10)
- `typography.sizeRatio`: mayor / menor font-size
- `typography.modularScale`: escala detectada o "none"
- `typography.levels`: cantidad de tamaños distintos
- `typography.weights`: cantidad de weights usados
- `typography.hasCustomSpacing`: boolean
- `typography.lineHeightConsistency`: "consistent" | "varied" | "inconsistent"

### Capa 3: Semántica (NUEVA — Playwright)

```javascript
// Playwright ARIA snapshot
const ariaTree = await page.accessibility.snapshot()
// Analizar:
// - Heading hierarchy: h1 → h2 → h3, sin saltos
// - Landmarks: nav, main, section, footer existen
// - Interactive elements: todos los buttons/links tienen nombres accesibles
// - ARIA labels donde hacen falta
// - Form labels asociados
// - Skip links presentes
```

**Métricas:**
- `semantic.score` (0-10)
- `semantic.headingHierarchy`: "correct" | "has-skips" | "flat" | "missing-h1"
- `semantic.landmarks`: ["nav", "main", "footer"] presentes
- `semantic.interactiveNamed`: porcentaje de buttons/links con nombre accesible
- `semantic.issues[]`: lista de problemas específicos

### Capa 4: Anti-Template Detection (NUEVA)

```javascript
// Para cada sección detectada:
// 1. Layout fingerprint: grid-template-columns + flex-direction + alignment
// 2. Comparar fingerprints entre secciones
// 3. Si >50% de secciones comparten el mismo fingerprint → template-like

// Detectores específicos:
// - "Centered everything": >80% de elementos text-align:center → generic
// - "Uniform padding": todas las secciones con mismo padding → template
// - "Card clone": cards con misma estructura exacta (mismos tags, mismas clases) → repetitive
// - "Missing signature": 0 elementos con overlap, rotation, clip-path, o negative margin → flat
// - "Stock hero": hero con solo texto centrado + botón, sin elemento visual → generic
```

**Métricas:**
- `antiTemplate.score` (0-10): 10 = totalmente único, 0 = template puro
- `antiTemplate.isTemplate`: boolean
- `antiTemplate.layoutVariety`: cantidad de layouts únicos / total secciones
- `antiTemplate.signatures[]`: elementos que dan personalidad a cada sección
- `antiTemplate.findings[]`: "uniform padding", "centered everything", etc.

### Capa 5: Structural (MIGRADA de V1)

Lo que ya funciona, portado a Playwright:
- z-index layers + canvas depth
- Clip-path count
- Backdrop-filter count
- Shadow count
- Pseudo-elements
- Grain/noise detection
- GSAP detection (network + runtime)
- Wheel state detection

Sin cambios en la lógica. Solo cambiar `puppeteer` imports por `playwright`.

### Capa 6: Funcional (MIGRADA de V1)

- Scroll sweep (desktop + mobile screenshots)
- Hover state detection
- Click state detection
- Scroll-triggered diffs
- Wheel event simulation

Sin cambios en la lógica.

## Scoring Engine

### De contadores binarios a scores continuos

**V1 (actual):**
```javascript
const depthPoints =
  (zIndexCount >= 3 ? 1 : 0) +    // binario: tiene o no tiene
  (hasPseudoElements ? 1 : 0) +    // binario
  (backdropFilterCount > 0 ? 1 : 0) // binario
// Score: 0-5 puntos → WEAK/MEDIUM/STRONG
```

**V2 (nuevo):**
```javascript
const depthScore =
  clamp(zIndexCount / 5, 0, 1) * 2.0 +           // proporcional: más layers = más score (hasta 5)
  clamp(canvasLayerCount / 3, 0, 1) * 1.5 +       // proporcional
  (hasPseudoElements ? 1.0 : 0) +                  // binario (sí importa)
  clamp(backdropFilterCount / 2, 0, 1) * 1.5 +    // proporcional
  clamp(overlapIntentional / 3, 0, 1) * 2.0 +      // nuevo: overlaps intencionales
  (hasGrain ? 1.0 : 0) +                            // binario
  clamp(shadowDepthVariety / 3, 0, 1) * 1.0         // nuevo: variedad de sombras (no solo contar)
// Score: 0-10 continuo
```

### Composición del score final

```
Excellence Score = {
  composition: geometry.visualBalance * 0.3 + antiTemplate * 0.3 + whitespace * 0.2 + overlap * 0.2,
  depth:       structural.depth * 0.5 + geometry.overlap * 0.3 + antiTemplate.signatures * 0.2,
  typography:  typography.rhythm * 0.4 + typography.sizeRatio * 0.3 + typography.modularScale * 0.3,
  motion:      structural.motion * 0.5 + functional.wheelStates * 0.2 + functional.scrollDiffs * 0.3,
  craft:       functional.hoverStates * 0.3 + colorHarmony * 0.3 + semantic * 0.2 + antiTemplate * 0.2
}

// Quality Gates (pass/fail):
contrast: WCAG AA check (sin cambio)
animations: anti-pattern check (con exemptions mejoradas)
images: alt + dimensions check
headings: semantic.headingHierarchy
meta: og tags + description
```

## Output (mismo contrato que V1)

```json
// manifest.json — misma estructura, más datos
{
  "url": "...",
  "geometry": { "visualBalance": {...}, "overlap": {...}, "surprise": {...} },
  "aesthetic": { "colorHarmony": {...}, "whitespace": {...}, "typography": {...} },
  "semantic": { "ariaTree": "...", "headingHierarchy": "...", "landmarks": [...] },
  "antiTemplate": { "isTemplate": false, "layoutVariety": 0.85, "findings": [] },
  "depthMetrics": { ... },           // migrado de V1
  "motionProfile": { ... },          // migrado de V1
  "compositionMetrics": { ... },     // migrado de V1 + enriched con geometry
  "excellenceSignals": {              // mismo formato, mejor scoring
    "composition": "STRONG",
    "depth": "STRONG",
    "typography": "STRONG",
    "motion": "MEDIUM",
    "craft": "STRONG",
    "_scores": { ... }                // scores continuos 0-10
  },
  "qualityGates": { ... },           // mismo formato
  "screenshots": { ... }              // mismo formato
}

// analysis.md — mismo formato, más insights
```

`refresh-quality.mjs` sigue leyendo el mismo manifest.json → produce scorecard.json. Sin cambios en el pipeline downstream.

## Implementación

### Fase 1: Setup Playwright + scaffold (1 hora)

- `npm install playwright` en scripts/
- Crear `scripts/eros-observer.mjs` con estructura base
- CLI: `node eros-observer.mjs --local --port 5173 <output-dir>`
- Compatibilidad de flags con capture-refs.mjs (`--batch`, `--no-discover`, etc.)

### Fase 2: Migrar capas 5+6 de Puppeteer a Playwright (2 horas)

- Copiar lógica de `page.evaluate()` (es idéntica)
- Cambiar `puppeteer.launch()` → `chromium.launch()`
- Cambiar `page.screenshot()` API (casi igual)
- Cambiar network interception API (RequestHandler en vez de events)
- Verificar que produce el mismo manifest.json que V1

### Fase 3: Capa 1 — Geometría Visual (2 horas)

- `extractGeometry(page)` → visual balance, centro de masa, cuadrantes, overlap, sorpresa
- Test con los 3 proyectos existentes (Coque, Axon, Lampone)
- Validar que "asymmetric-balanced" > "symmetric" > "chaotic" en scoring

### Fase 4: Capa 2 — Estética Computacional (2 horas)

- `extractColorHarmony(page)` → HSL analysis, harmony type, temperature, AI fingerprint
- `extractWhitespace(page)` → global ratio, per-section, rhythm
- `extractTypographyRhythm(page)` → modular scale, levels, weights, spacing
- Test con los 3 proyectos

### Fase 5: Capa 3 — Semántica (1 hora)

- `extractSemantic(page)` → ARIA snapshot, heading hierarchy, landmarks, interactive names
- Playwright `page.accessibility.snapshot()` → parse YAML
- Test con los 3 proyectos

### Fase 6: Capa 4 — Anti-Template (1 hora)

- `detectTemplate(page, sections)` → layout fingerprints, repetition, signature detection
- Comparar fingerprints entre secciones
- Scoring: variety ratio + signature count + finding count

### Fase 7: Scoring Engine V2 (1 hora)

- Reemplazar contadores binarios con scores continuos (0-10)
- Implementar weighted composition del score final
- Calibrar pesos con los 3 proyectos existentes como ground truth
- Asegurar que Coque (8.74 actual) mantiene un score alto

### Fase 8: Integración + backward compatibility (1 hora)

- `refresh-quality.mjs` lee el nuevo manifest.json (backward compatible)
- `eros-gate.mjs` usa los nuevos scores (richer verdicts)
- `eros-context.mjs` inyecta los nuevos findings en context files
- Actualizar `eros-test-e2e.mjs`

### Fase 9: Deprecar V1 (30 min)

- Renombrar `capture-refs.mjs` → `capture-refs-v1.mjs` (backup)
- `eros-observer.mjs` toma su lugar con alias en package.json
- Actualizar SKILL.md/pipeline.md references

## Estimación

| Fase | Esfuerzo |
|------|----------|
| 1. Setup + scaffold | 1h |
| 2. Migrar capas V1 | 2h |
| 3. Geometría Visual | 2h |
| 4. Estética Computacional | 2h |
| 5. Semántica (ARIA) | 1h |
| 6. Anti-Template | 1h |
| 7. Scoring Engine V2 | 1h |
| 8. Integración | 1h |
| 9. Deprecar V1 | 30min |
| **Total** | **~11.5 horas** |

## Qué gana Eros

| Antes (V1) | Después (V2) |
|------------|-------------|
| "Composition: MEDIUM (3 text alignments)" | "Composition: 8.2 — asymmetric-balanced, good visual tension, hero content left-weighted with counterbalance" |
| "Depth: STRONG (4 z-index layers)" | "Depth: 7.8 — 4 real layers with intentional overlap, but shadow variety is low" |
| "Craft: MEDIUM (2 hover states)" | "Craft: 8.5 — cohesive warm-analogous palette, strong typography rhythm (1.5 scale), unique section signatures" |
| "No template detection" | "Anti-template: 9.0 — every section has distinct layout, 3 container breaks, 2 rotated elements" |
| "No whitespace analysis" | "Whitespace: 7.5 — hero generous (62%), features dense (35%), good rhythm" |
| "Binary pass/fail" | "Continuous 0-10 with weighted dimensions" |
| "No semantic analysis" | "Semantic: 9.5 — correct heading hierarchy, all landmarks present" |

Eros entiende POR QUÉ algo se ve bien o mal, no solo SI tiene las piezas.

## Fuentes

- [Playwright ARIA Snapshots](https://playwright.dev/docs/aria-snapshots)
- [Playwright vs Puppeteer 2026](https://www.browserstack.com/guide/playwright-vs-puppeteer)
- [Computational Aesthetics and Applications](https://link.springer.com/article/10.1186/s42492-018-0006-1)
- [Computational Models of Visual Balance](https://www.researchgate.net/publication/220108465)
- [Aesthetic and Minimalist Design — NN/g](https://www.nngroup.com/articles/aesthetic-minimalist-design/)
- [Accessibility Tree in Testing](https://testdino.com/blog/accessibility-tree/)
