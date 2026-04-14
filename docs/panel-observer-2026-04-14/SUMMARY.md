# Eros Panel — Observer Sweep 2026-04-14

Sweep completo del panel de Eros (build estático servido en `vite preview`, 9 rutas).

## Verdict por ruta

| Ruta | Comp | Depth | Typo | Motion | Craft | Contrast | Anim | Head | Meta | Overall |
|------|------|-------|------|--------|-------|----------|------|------|------|---------|
| `/projects` | WEAK | WEAK | STRONG | WEAK | MEDIUM | FAIL | FAIL | FAIL | FAIL | **FAIL** |
| `/eros` | WEAK | WEAK | MEDIUM | WEAK | MEDIUM | FAIL | FAIL | PASS | FAIL | **FAIL** |
| `/eros/chat` | WEAK | WEAK | STRONG | WEAK | MEDIUM | FAIL | FAIL | FAIL | FAIL | **FAIL** |
| `/eros/feed` | WEAK | WEAK | STRONG | WEAK | MEDIUM | FAIL | FAIL | FAIL | FAIL | **FAIL** |
| `/eros/diary` | MEDIUM | WEAK | STRONG | WEAK | MEDIUM | FAIL | FAIL | FAIL | FAIL | **FAIL** |
| `/eros/training` | WEAK | WEAK | STRONG | WEAK | MEDIUM | WARN | FAIL | FAIL | FAIL | **FAIL** |
| `/workshop` | WEAK | WEAK | STRONG | WEAK | MEDIUM | FAIL | FAIL | PASS | FAIL | **FAIL** |
| `/workshop/tokens` | WEAK | WEAK | MEDIUM | WEAK | MEDIUM | FAIL | FAIL | FAIL | FAIL | **FAIL** |
| `/workshop/components` | WEAK | WEAK | STRONG | WEAK | MEDIUM | FAIL | FAIL | FAIL | FAIL | **FAIL** |

## Lectura

### Lo esperado (ruido — no actuar)
- **Composition WEAK / Depth WEAK / Motion WEAK** en todas las rutas: el observer aplica el rubro Excellence (pensado para sitios de marketing). El panel es deliberadamente utilitario por brief — densidad informacional, sin atmosphere layers, sin scroll-linked motion. Esperable.
- **Meta FAIL universal**: SPA interna sin meta tags por página. Irrelevante para herramienta interna.
- **Typography STRONG/MEDIUM**: confirma fortaleza del sistema (display + mono, escala 6.4x).

### Bugs reales a actuar
1. **Animations FAIL en 9/9** — `div.pulse-fill` anima `width` (forbidden, debería ser `transform: scaleX`). Anti-pattern universal del CLAUDE.md. Origen único, fix puntual.
2. **Contrast FAIL en 8/9** — link `rgb(240,231,216)` sobre `rgba(255,106,0,0.06)` da ratio 2.34 (debajo de 4.5 AA). El bg con alpha 0.06 sobre `--bg` deja al observer calcular el composite mal o el real es bajo. Hay que verificar el componente fuente.
3. **Headings FAIL en 7/9** — solo `/eros` y `/workshop` tienen `h1`. Las otras rutas hijas usan `h2`/`h3` sin h1 o no tienen heading. Real issue de jerarquía semántica.

### Anomalía
- `/eros/diary` es la única con **Composition MEDIUM** (resto WEAK). Algo en su layout suma puntos — vale la pena ver qué hizo bien.

## Próximos pasos sugeridos
1. Fix `pulse-fill` width → `transform: scaleX` (1 commit, blast radius local).
2. Auditar el link con bg copper-alpha — subir alpha o cambiar fg.
3. Agregar `h1` por ruta (Eros Chat, Eros Feed, Eros Diary, Training, Workshop Tokens, Workshop Components).
4. Considerar si conviene un *panel-rubric* alterno en el observer que no penalice WEAK motion/depth en surfaces utilitarias.

## Artefactos
- 9 carpetas `localhost--{ruta}/` con `manifest.json` + `analysis.md` + screenshots desktop/mobile.
- Index global: `localhost--index.json`.
