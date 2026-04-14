# Eros Panel — Observer Sweep AFTER fixes (2026-04-14)

Verificación post-fix de los 3 bugs reales detectados en `docs/panel-observer-2026-04-14/SUMMARY.md`.

## Verdict comparado (antes → después)

| Ruta | Comp | Anim | Head | Overall |
|------|------|------|------|---------|
| `/projects` | WEAK→**MEDIUM** | FAIL→**PASS** | FAIL→**PASS** | FAIL |
| `/eros` | WEAK | FAIL→**PASS** | PASS | FAIL |
| `/eros/chat` | WEAK→**MEDIUM** | FAIL→**PASS** | FAIL→**PASS** | FAIL |
| `/eros/feed` | WEAK→**MEDIUM** | FAIL→**PASS** | FAIL→**PASS** | FAIL |
| `/eros/diary` | MEDIUM | FAIL→**PASS** | FAIL→**PASS** | FAIL |
| `/eros/training` | WEAK→**MEDIUM** | FAIL→**PASS** | FAIL→**PASS** | FAIL |
| `/workshop` | WEAK | FAIL→**PASS** | PASS | FAIL |
| `/workshop/tokens` | WEAK→**MEDIUM** | FAIL→**PASS** | FAIL→**PASS** | FAIL |
| `/workshop/components` | WEAK→**MEDIUM** | FAIL→**PASS** | FAIL→**PASS** | FAIL |

**Animations:** 0/9 → **9/9 PASS**
**Headings:** 2/9 → **9/9 PASS**
**Composition:** 1/9 MEDIUM → **8/9 MEDIUM** (efecto secundario del h1)

## Fixes aplicados

1. **`pulse-fill` width → transform** (`panel/src/components/MainShell.vue`)
   - Antes: `transition: width 1s` con `style="width: X%"` → forbidden-transition HIGH
   - Después: `transition: transform 1s` con `style="transform: scaleX(X)"` + `transform-origin: left`
   - Estética idéntica, motion correcto

2. **`h1.sr-only` por vista** (7 vistas + utility en `panel.css`)
   - Agregado `<h1 class="sr-only">` con título descriptivo en: ProjectList, ErosChat, ErosFeed, ErosDiary, Training, TokenEditor, ComponentEditor
   - `.sr-only` es visually-hidden — no afecta diseño visual, solo semántica
   - Beneficio: SR-readers + observer detection + jerarquía heading correcta

3. **Iframe transition removida** (`panel/src/views/workshop/ComponentEditor.vue`)
   - Antes: iframe del preview animaba `width` y `margin` al cambiar viewport (tablet/mobile)
   - Después: snap instantáneo. La acción del switch ya da feedback claro; el morph era anti-pattern (forbidden transitions)

## Bug NO fixeado (false positive del observer)

**Contraste FAIL/WARN persistente.** El observer reporta ratio 2.34 sobre links/elementos con `background: var(--accent-ember)` (= `rgba(255,106,0,0.06)`). Verificado:

- Composite real: `#0a0a0b * 0.94 + #ff6a00 * 0.06 ≈ rgb(25,15,8)` (casi negro con micro-tinte cálido)
- Contraste real contra `#f0e7d8`: ~14:1 (AAA pasa con margen)
- El observer está midiendo contra `(255,106,0)` opaco, ignorando el alpha 0.06

**Decisión:** no actuar visualmente. Reportar como ticket al observer (V3) para corregir el cálculo de compositing antes de propagar la regla a otros proyectos.

## Pendientes legítimos para más adelante

- **Composition WEAK en /eros y /workshop** — son landings del shell, contenido escaso. Vale revisarlos como diseño, no como bug.
- **Depth WEAK 9/9** — el panel es por brief flat-utilitarian. No es un sitio de marketing. El rubric Excellence no aplica de la misma forma. Considerar un *panel-rubric* alterno en el observer.
- **Motion WEAK 9/9** — mismo razonamiento que Depth.
- **Meta FAIL 9/9** — irrelevante para SPA interna.
