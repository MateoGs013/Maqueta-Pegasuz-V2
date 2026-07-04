# media — Pipeline de medios reales V2 (sin Adobe, decisión Mateo 2026-07-04)

> Eros ya sabe que "gradient placeholders en vez de imágenes reales = rechazo"
> ([[no-gradient-placeholders]], RULE-009). Este workflow es la solución positiva.
> **V2:** Adobe descartado por completo (decisión de Mateo). El pipeline es:
> **prompt pack → Mateo genera gratis donde Eros le indica → tratamiento local
> (sharp) → registro en el vault.** Sin APIs pagas, nunca.
> Investigación de respaldo: `docs/research/raw/2026-07-04-media-generation.md`
> (la sección Adobe queda como registro histórico — no se usa).

## Principio

**El asset generado nunca se shippea crudo.** Una imagen con grade + grain +
crop intencional es a la vez más "dirigida" y menos identificable como IA.
Un solo grade por proyecto = atmósfera compartida = dirección de arte.
El tratamiento es 100% local (`scripts/media/treat.mjs`, sharp) — cero
dependencia de servicios externos.

## Cuándo corre

Tarea `design/assets` del loop V8 — después de `review/creative` (la paleta ya
existe y define el grade), antes de `setup/scaffold` (el builder recibe assets
reales, nunca inventa placeholders).

**Dos modos:**
- **En Eros Studio (preferido):** Eros llama la MCP tool `request_asset` por cada
  slot → el Asset Tray muestra el prompt pack a Mateo → Mateo genera y suelta el
  archivo en el inbox → Studio lo trata y registra automáticamente.
- **En sesión plana (sin Studio):** Eros escribe el manifest `.eros/context/assets.md`
  con los prompt packs completos y el slot queda `status: awaiting-generation`.
  Mateo suelta archivos en `$PROJECT_DIR/src/assets/media/_inbox/` y Eros corre
  `node scripts/media/treat.mjs` a mano en el siguiente turno.

## Paso 0 — Derivar la lista de slots

Leer `DESIGN.md` + `docs/tokens.md` + `docs/pages/*.md`. Por cada sección que pide
un visual estructural, definir un slot:

```
slot: hero-background · kind: photo · aspect: 21:9 · mood: <del DESIGN.md>
slot: about-texture   · kind: texture · aspect: 1:1 · ...
```

Reglas de slots:
- El hero SIEMPRE tiene slot (RULE-005: heroes text-only rechazados).
- Texturas físicas (grain, papel, halftone) cuentan como assets — señal anti-IA fuerte.
- Si una sección se resuelve mejor con shader/tipografía como textura, anotarlo
  como `resolved-by: shader|type` — no todo slot necesita imagen.

## Paso 1 — Prompt pack (Eros lo escribe, Mateo genera)

Cada request incluye SIEMPRE: el prompt completo, el negative si aplica,
**dónde generarlo** (herramienta concreta + URL), settings (aspect/modo), y
el nombre de archivo esperado.

**Dónde generar (todo gratis, elegir por tipo de asset):**

| Herramienta | URL | Usar para | Nota |
|---|---|---|---|
| Google AI Studio (Gemini image) | aistudio.google.com | Fotorealismo editorial, escenas, materiales | El mejor default gratis en 2026 |
| Microsoft Copilot / Bing Image Creator | copilot.microsoft.com | Alternativa fotorealista rápida | Sin login extra si ya usa MS |
| Ideogram (free tier) | ideogram.ai | Cuando el asset lleva texto/lettering, estilo "raw photo" | Tier gratis con cola |
| Krea (free tier) | krea.ai | Flux gratis, upscale, variaciones | Bueno para iterar |
| Flux Playground (BFL) | playground.bfl.ai | Fotorealismo Flux puro | Tier gratis limitado |
| ComfyUI local (opcional) | localhost | Batch/iteración sin límites | GPU de Mateo: 10GB VRAM — solo SDXL o Flux Klein cuantizado con offload (32GB RAM ayudan). NO asumir disponible; preguntar antes de proponerlo. |

**Reglas de de-AI-ing del prompt (siempre):**
- Nombrar cámara/lente/film real: "shot on Fujifilm X-T4, 56mm f/2.8", "Kodak Portra 400".
- Prohibido: "4k, 8k, ultra HD, Unreal Engine, perfect lighting, hyperrealistic".
- Pedir imperfección explícita: "candid, unposed, slightly underexposed, visible
  skin texture, overcast available light, minor motion blur".
- Composición off-center con espacio negativo para tipografía: "subject at left
  third, negative space right".
- Preferir entorno sobre retrato glamour: interiores, manos, materiales, sujetos
  de espaldas/medio girados.
- El prompt se escribe EN INGLÉS (los modelos rinden mejor) pero la instrucción
  a Mateo va en español.

**Entrega:** Mateo guarda el resultado con el nombre indicado
(`{slot}.png|jpg`) en `$PROJECT_DIR/src/assets/media/_inbox/`.
En Studio, el tray muestra la ruta con botón de copiar.

## Paso 2 — Tratamiento local (SIEMPRE, automático en Studio)

`node scripts/media/treat.mjs <input> --out <dir> --slot <slot> [opciones]`

Cadena (sharp, 100% local):

1. **Crop editorial** al aspect del slot (`--aspect 21:9 --gravity attention|left|right`).
2. **Grade del proyecto** (`--tint #hex --saturation 0.82 --contrast 1.06 --brightness 0.98`):
   UN set de valores por proyecto, derivado de la paleta en tokens.md. Todos los
   assets del proyecto usan el mismo.
3. **Grain** (`--grain 32`, rango 25–45): el de-digitalizador de mayor palanca.
4. **Vignette opcional** (`--vignette 0.18`) para imperfección de profundidad.
5. **Salida web-ready:** AVIF + WebP + fallback JPG, con sufijos de ancho si se pide
   (`--widths 2400,1200,640`).
6. **En página:** el builder complementa con CSS filter/blend hacia los tokens +
   overlay de noise sutil — imagen y UI comparten una sola atmósfera.

## Paso 3 — Otras clases de asset

| Necesidad | Ruta |
|---|---|
| Gráficos compuestos (OG image, social card) | Eros los compone él mismo (HTML→screenshot con Playwright, ya disponible) o SVG autorado |
| Vector/ilustración | SVG autorado por Eros (a mano o Pencil MCP si está conectado) |
| Texturas físicas | Generar como photo-prompt ("scanned paper texture, ink bleed...") + tratar, o SVG noise procedural |
| Video | NO generar. Shader/WebGL motion (fortaleza de Eros) |

## Paso 4 — Registro (memoria de medios)

Por CADA asset producido:

1. Archivo web-ready en `$PROJECT_DIR/src/assets/media/`.
2. Manifest del proyecto: `$PROJECT_DIR/.eros/context/assets.md` — tabla
   slot → archivo → herramienta → prompt → tratamiento → estado.
3. **Nota del vault:**

```bash
node scripts/memory/vault.mjs new asset {project}-{slot} \
  --set asset-kind=photo --set source-type=handoff \
  --set model="{herramienta usada}" --set license=generated \
  --set review-status=pending --set project="[[{project}]]" \
  --set slot={slot} \
  --body "Herramienta: {tool} · Grade: tint {hex} sat {n} · Grain: {n}

Prompt: {prompt completo}

Mapa: [[style-map]]"
```

4. Veredicto de Mateo → `set-field {nota} review-status approved|rejected` +
   `rejection-reason` (too-ai | wrong-mood | composition | color-clash) + lección
   si generaliza. Así Eros aprende qué prompts/herramientas/grades funcionan.

## Gates

- Cero placeholders CSS de imagen en el build ([[no-gradient-placeholders]]).
- Un asset sin Paso 2 completo no pasa ([[no-generic-stock-photos]] aplica también
  a generados crudos).
- El manifest `assets.md` debe existir antes de `setup/scaffold`; slots sin
  resolver van como `status: awaiting-generation` con su prompt pack listo —
  nunca silenciosamente vacíos, y el build puede arrancar con los slots que ya
  estén (los pendientes entran al llegar).

## Decisiones tomadas (Mateo, 2026-07-04)

- **Adobe descartado por completo** (MCP, Stock, Firefly Boards). Este workflow no lo usa.
- **Sin APIs pagas** — Recraft y similares descartados.
- **Handoff aceptado**: Eros da el prompt + dónde generar; Mateo genera.
- **GPU 10GB VRAM / 32GB RAM**: ComfyUI local es opcional y marginal (SDXL/Flux
  Klein cuantizado); no es la ruta primaria.
- **Todo vive en Eros Studio** (Asset Tray); el CLI queda aparte.
