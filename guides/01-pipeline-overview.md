# Guide: Pipeline Overview

> El flujo completo de creacion de un proyecto, paso a paso.
> **Prerequisito:** [00-project-init](00-project-init.md) para entender como arrancar.

---

## Pipeline visual

```
Phase 0         Phase 1           Phase 2          Phase 3
DISCOVERY       FOUNDATION        DESIGN SYSTEM    PAGE STRUCTURE
---------       ----------        -------------    --------------
Client Intake   Content Brief     creative-design  page-scaffold
Competitive     Design Brief      tokens CSS       HTML semantico
  Analysis      Page Plans        src/styles/      secciones
Brand Profile   Motion Spec                        layouts
     |               |                 |                |
     v               v                 v                v

Phase 4         Phase 5           Phase 6          Phase 7
3D ELEMENTS     COMPONENTS        MOTION           QUALITY CHAIN
-----------     ----------        ------           -------------
threejs-3d      vue-component     gsap-motion      validation-qa
WebGL scene     Cards, forms      Scroll reveals   a11y-audit
Tier 1 min      Reutilizables     Hover states     seo-audit
                                  Page transitions responsive-review
                                                   css-review
                                                   perf-check
```

```
Flujo de datos entre fases:

  Discovery ──> docs/content-brief.md ──> page-scaffold (copy)
            ──> docs/design-brief.md  ──> creative-design (tokens)
            ──> docs/page-plans.md    ──> page-scaffold (structure)
            ──> docs/motion-spec.md   ──> gsap-motion (choreography)
```

---

## Fases detalladas

### Phase 0: Discovery

- **Duracion:** 1 sesion
- **Input:** brief del cliente o idea del proyecto
- **Prompts:** `prompts/00-discovery/*` (3 prompts)
  - `client-intake.md` -- entender negocio, estetica, features
  - `competitive-analysis.md` -- analizar competidores
  - `brand-questionnaire.md` -- definir personalidad de marca
- **Output:** perfil completo de cliente + marca
- **Quien decide:** el usuario (Mateo) con input del cliente

**Ejemplo concreto:**
```
Input:  "Restaurante italiano premium en Buenos Aires, quiere reservas online"
Output: Perfil con estetica luxury-warm, features [menu, reservas, galeria],
        tono elegante pero accesible, personalidad "como un Noma pero argentino"
```

### Phase 1: Foundation Docs

- **Duracion:** 1-2 sesiones
- **Input:** discovery output (Phase 0)
- **Prompts:** `prompts/01-identity/*`, `prompts/02-content/*`, `prompts/03-architecture/*`, `prompts/04-motion/*`
- **Output:** 4 archivos en `docs/` completos
- **Regla:** content-first (copy antes de diseno)

**Orden de creacion (obligatorio):**
```
1. docs/content-brief.md   <- prompts/02-content/copy-framework.md
2. docs/design-brief.md    <- prompts/01-identity/design-direction.md
3. docs/page-plans.md      <- prompts/03-architecture/page-planning.md
4. docs/motion-spec.md     <- prompts/04-motion/motion-personality.md
```

**Verificar antes de avanzar:**
```bash
# Los 4 docs deben existir y no tener placeholders
ls docs/content-brief.md docs/design-brief.md docs/page-plans.md docs/motion-spec.md
grep -c "{{" docs/*.md  # Debe dar 0 en cada archivo
```

### Phase 2: Design System

- **Skill:** `creative-design`
- **Input:** `docs/design-brief.md`
- **Output:** tokens CSS implementados en `src/styles/`
- **Regla:** todo sale del brief, nada se inventa

**Ejemplo concreto:**
```css
/* src/styles/tokens.css - generado desde docs/design-brief.md */
:root {
  /* Paleta del brief */
  --color-bg-primary: #0a0a0f;
  --color-accent-primary: #ff6b35;
  --color-text-primary: #f5f5f0;

  /* Tipografia del brief */
  --font-display: 'Playfair Display', serif;
  --font-body: 'Inter', sans-serif;
  --text-hero: clamp(3rem, 8vw, 7rem);

  /* Spacing del brief */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;
  --space-3xl: 64px;
  --space-4xl: 96px;
}
```

### Phase 3: Page Structure

- **Skill:** `page-scaffold`
- **Input:** `docs/page-plans.md` + tokens
- **Output:** paginas con HTML semantico, secciones, layout
- **Regla:** respetar minimos de secciones y propositos

**Minimos de secciones por tipo de pagina:**
```
Homepage / Landing:   8-14 secciones
About / Studio:       6-10 secciones
Services:             6-10 secciones
Portfolio / Work:     5-8 secciones
Case study:           6-10 secciones
Contact:              3-5 secciones
```

**Cada seccion tiene:**
- Proposito narrativo (Impact, Manifesto, Energy, Context, Proof, Process, Trust, Evidence, Differentiator, Close)
- Alternancia de ritmo (energeticas y contemplativas, nunca dos densas consecutivas)

### Phase 4: 3D Elements

- **Skill:** `threejs-3d`
- **Input:** `docs/design-brief.md` atmosfera + 3D scope
- **Output:** elementos WebGL implementados
- **Regla:** Tier 1 minimo, siempre. 3D NO es opcional.

**Tiers de 3D:**
```
Tier 1 (minimo):  Shader atmosferico o campo de particulas
Tier 2:           Objetos interactivos, geometria generativa
Tier 3:           Escenas completas, modelos GLTF, animaciones complejas
```

### Phase 5: Components

- **Skill:** `vue-component`
- **Input:** tokens + page structure + content
- **Output:** componentes reutilizables con datos reales
- **Regla:** datos del store, no hardcodeados

**Ejemplo concreto:**
```
Input:  Section "Proof" del page-plan con testimonios
Output: TestimonialCard.vue que consume testimonialStore.items
        con loading state, error state, y tokens del design-brief
```

### Phase 6: Motion

- **Skill:** `gsap-motion`
- **Input:** `docs/motion-spec.md`
- **Output:** animaciones implementadas
- **Regla:** cada seccion tecnica diferente, reduced-motion respetado

**Ejemplo de variacion de tecnicas:**
```
Section 1 (Hero):       Timeline cinematico (stagger de elementos)
Section 2 (About):      Scroll-driven parallax
Section 3 (Services):   Cards con hover 3D tilt
Section 4 (Stats):      Counter animation con scrub
Section 5 (Testimonials): Marquee horizontal infinito
Section 6 (CTA):        Reveal con clip-path
```

**Patron obligatorio en cada componente:**
```js
let ctx = null
onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  ctx = gsap.context(() => {
    // animaciones aqui
  }, rootEl.value)
})
onBeforeUnmount(() => ctx?.revert())
```

### Phase 7: Quality Chain

- **Skills:** cadena de 6 auditorias (ver [04-quality-standards](04-quality-standards.md) para detalles)
- **Input:** proyecto construido
- **Output:** reporte con issues categorizados
- **Regla:** 0 BLOCKING, 0 CRITICAL antes de entregar

```
CADENA DE CALIDAD (orden recomendado):

  1. pegasuz-validation-qa  <- Solo si es Pegasuz (5 layers)
  2. a11y-audit             <- Accesibilidad WCAG 2.1 AA
  3. seo-audit              <- Meta tags, JSON-LD, headings
  4. responsive-review      <- 375px, 768px, 1280px, 1440px+
  5. css-review             <- Tokens, spacing, consistencia
  6. perf-check             <- Bundle, imagenes, lazy loading
```

> Ver [05-delivery-checklist](05-delivery-checklist.md) para el checklist final completo.

---

## Reglas del pipeline

1. **Orden estricto:** no saltar fases. Phase 2 necesita Phase 1 completa.
2. **Design-first:** sin brief no hay codigo (ver [02-design-first](02-design-first.md)).
3. **Content-first:** copy antes de visual. `content-brief.md` se crea primero.
4. **Identidad unica:** cada proyecto tiene paleta/tipo/motion propios. Nunca reutilizar.
5. **3D siempre:** Tier 1 como minimo. El canvas 3D va antes de componentes.
6. **Quality gate:** 0 BLOCKING + 0 CRITICAL para entregar.
7. **Docs son la fuente de verdad:** si no esta en el doc, no se implementa. Si se necesita algo que no esta en el doc, se agrega al doc primero.

---

## Mapa de skills por fase

| Fase | Skill principal | Input | Output |
|------|----------------|-------|--------|
| 0 | (prompts manuales) | Brief del cliente | Perfil de marca |
| 1 | (prompts manuales) | Perfil de marca | 4 docs en `docs/` |
| 2 | `creative-design` | `docs/design-brief.md` | `src/styles/tokens.css` |
| 3 | `page-scaffold` | `docs/page-plans.md` | Views con secciones |
| 4 | `threejs-3d` | `docs/design-brief.md` | Escena WebGL |
| 5 | `vue-component` | Tokens + page structure | Componentes .vue |
| 6 | `gsap-motion` | `docs/motion-spec.md` | Animaciones GSAP |
| 7 | 6 auditorias | Proyecto completo | Reporte de issues |

> Ver [skill-dispatch-table](skill-dispatch-table.md) para la referencia completa.
