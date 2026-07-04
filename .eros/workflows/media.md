# media — Pipeline de medios reales (Frente 2, 2026-07-04)

> Eros ya sabe que "gradient placeholders en vez de imágenes reales = rechazo"
> ([[no-gradient-placeholders]], RULE-009). Este workflow es la solución positiva:
> producir el asset real, tratado con dirección de arte, y registrarlo en el cerebro.
> Investigación de respaldo: `docs/research/raw/2026-07-04-media-generation.md`.

## Principio

**Fotografía real primero, generación como escalación.** Una foto real con grade +
grain + crop intencional es a la vez más "dirigida" y menos identificable como IA.
El mismo tratamiento se aplica a TODO asset del proyecto (stock o generado):
un solo grade por proyecto = atmósfera compartida = dirección de arte.

## Cuándo corre

Tarea `design/assets` del loop V8 — después de `review/creative` (la paleta ya
existe y define el grade), antes de `setup/scaffold` (el builder recibe assets
reales, nunca inventa placeholders).

**Quién:** la sesión principal (CEO). Los MCPs de Adobe/Canva/Pencil viven en la
sesión principal, no en subagentes.

## Paso 0 — Derivar la lista de slots

Leer `DESIGN.md` + `docs/tokens.md` + `docs/pages/*.md`. Por cada sección que pide
un visual estructural, definir un slot:

```
slot: hero/background · kind: photo · aspect: 21:9 · mood: <del DESIGN.md>
slot: about/texture   · kind: texture · aspect: 1:1 · ...
```

Reglas de slots:
- El hero SIEMPRE tiene slot (RULE-005: heroes text-only rechazados).
- Texturas físicas (grain, papel, halftone) cuentan como assets — son el señal
  anti-IA más fuerte de 2026 (ver research design-trends §4).
- Si una sección se resuelve mejor con shader/tipografía como textura, anotarlo
  en el manifest como `resolved-by: shader|type` — no todo slot necesita imagen.

## Paso 1 — Ruta primaria: Adobe Stock (autónoma, cubierta por suscripción)

1. `asset_search` con términos derivados del mood — buscar **fotografía editorial**,
   nunca "business team laptop" (RULE-006). Preferir: interiores, manos, materiales,
   sujetos de espaldas/medio girados, arquitectura, texturas macro.
2. Seleccionar por composición off-center con espacio negativo para tipografía.
3. `asset_license_and_download_stock` — licencia en alta resolución.

## Paso 2 — Cadena de tratamiento (SIEMPRE, también para generados)

En orden, vía MCP de Adobe:

1. **Crop editorial:** `image_crop_and_resize` al aspect del slot, composición
   off-center. Si el flip de aspecto recortaría contenido: `image_generative_expand`
   primero (registrar el seed).
2. **Grade del proyecto:** `image_list_presets` → `image_apply_preset` — UN preset
   film/cinematic/B&W elegido una vez por proyecto según la paleta. Todos los
   assets del proyecto usan el mismo.
3. **Ajuste fino:** `image_adjust_highlights` (bajar), `image_adjust_vibrance_and_saturation`
   (desaturar levemente), `image_adjust_color_temperature` (hacia la paleta),
   `image_adjust_hsl` para unificar hues con los tokens.
4. **Grain:** `image_add_grain` 30–45. El de-digitalizador de mayor palanca.
5. **Identidad de textura (opcional, decidir por proyecto):** `image_apply_halftone`
   (feel print), `image_apply_monochromatic_tint` / `image_apply_color_overlay` a baja
   opacidad (duotono editorial), `image_apply_lens_blur` (imperfección de profundidad).
6. **En página:** el builder complementa con CSS filter/blend hacia los tokens +
   overlay de noise sutil — imagen y UI comparten una sola atmósfera.

## Paso 3 — Escalaciones (cuando Stock no alcanza)

| Necesidad | Ruta | Estado |
|---|---|---|
| Imagen imposible de stockear (surreal, marca-específica) | **Firefly Boards handoff**: `create_firefly_board` + prompt pack (abajo) → Mateo genera en Firefly web (ilimitado bajo promo Adobe) → Eros ingiere y aplica Paso 2 | Requiere OK de Mateo (decisión abierta #2) |
| Gráficos compuestos (OG image, social cards) | Canva `generate-design` → export PNG | Disponible |
| Vector/ilustración | SVG autorado por Eros (a mano o Pencil MCP) · `image_vectorize` para marcas raster tratadas | Disponible |
| Video | NO generar. Preferir shader/WebGL motion. Edición de footage existente: `video_create_quick_cut`/`video_resize` | Por diseño |

**Prompt pack para Firefly Boards** (cuando aplique — reglas de de-AI-ing):
- Nombrar cámara/lente/film real: "shot on Fujifilm X-T4, 56mm f/2.8", "Kodak Portra 400".
- Prohibido: "4k, 8k, ultra HD, Unreal Engine, perfect lighting, hyperrealistic".
- Pedir imperfección explícita: "candid, unposed, slightly underexposed, visible skin
  texture, overcast available light, minor motion blur".
- Composición off-center: "subject at left third, negative space right, cropped at the elbow".
- Preferir entorno sobre retrato glamour: interiores, manos, materiales.

## Paso 4 — Registro (memoria de medios)

Por CADA asset producido:

1. Archivo web-ready en `$PROJECT_DIR/src/assets/media/` (formatos: AVIF/WebP + fallback).
2. Manifest del proyecto: `$PROJECT_DIR/.eros/context/assets.md` — tabla slot → archivo
   → fuente → tratamiento → estado.
3. **Nota del vault** (el aprendizaje acumulativo):

```bash
node scripts/memory/vault.mjs new asset {project}-{slot-slug} \
  --set asset-kind=photo --set source-type=adobe_stock \
  --set stock-asset-id={id} --set license=adobe-stock-standard \
  --set review-status=pending --set project="[[{project}]]" \
  --set slot={slot} \
  --body "Preset: {preset} · Grain: {n} · Crop: {desc}

Prompt/búsqueda: {query o prompt completo}

Mapa: [[style-map]]"
```

4. Cuando Mateo aprueba/rechaza: `set-field {nota} review-status approved|rejected`
   + `set-field {nota} rejection-reason {too-ai|wrong-mood|composition|color-clash}`
   + append de la lección si generaliza. Así el sistema aprende qué estilos de
   generación funcionan para qué tipo de proyecto — la extensión de personality
   a medios que pedía el brief.

## Gates

- Cero placeholders CSS de imagen en el build ([[no-gradient-placeholders]]).
- Cero stock genérico sin tratar ([[no-generic-stock-photos]]) — un asset sin
  Paso 2 completo no pasa.
- El manifest `assets.md` debe existir antes de `setup/scaffold`; slots sin
  resolver van como `status: deferred` con razón — nunca silenciosamente vacíos.

## Decisiones abiertas (no asumir)

1. GPU ≥12GB VRAM → ¿ComfyUI + Flux 2 local como ruta text-to-image autónoma?
2. ¿Handoff Firefly Boards aceptado como parte del flujo?
3. ¿Recraft API paga para SVG ilustrativo?
4. Verificar cuota real de licencias Adobe Stock del plan.
