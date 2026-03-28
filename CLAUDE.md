# CLAUDE.md

## Regla principal

Cada cliente Pegasuz es un producto con identidad propia. La arquitectura es compartida, la estetica es unica.

- **Design-first:** brief antes de codigo. Sin plan de `creative-design`, no se escribe CSS ni se eligen colores.
- **Content-first:** copy antes de visual. `docs/content-brief.md` se crea primero.
- **Identidad unica:** cada proyecto tiene su propia paleta, tipografia, easing, atmosfera. Nunca reutilizar valores de otro proyecto.
- **3D/WebGL siempre:** Tier 1 minimo (shader atmosferico o campo de particulas).
- **Variacion de animacion:** cada seccion usa tecnica diferente. Nunca el mismo fade-up en todas.

---

## Plataforma

Pegasuz Core — SaaS multi-tenant. Backend Node.js + Express + Prisma + MySQL. Cada cliente tiene su propia DB y frontend Vue 3.

---

## Arquitectura (locked)

### Backend
```
HTTP Request (x-client: <slug>) -> clientResolver -> prismaManager.getPrisma(db) -> Controller -> Service -> Prisma
```

### Frontend
```
View.vue -> Pinia Store -> Service (src/services/) -> api.js (src/config/api.js) -> Pegasuz Core API (x-client)
```

### Reglas inviolables
- **Tenant isolation** en cada cambio. Dynamic Prisma connection (nunca `new PrismaClient()` directo)
- **Cadena completa:** View -> Store -> Service -> API. Sin atajos
- No axios imports fuera de `src/config/api.js`. No HTTP calls fuera de `src/services/`
- No JSON.parse en views/components. No hardcoded slugs (siempre `VITE_CLIENT_SLUG`)
- CMS content (`contentStore.get`) separado de feature data (feature stores)
- Imagenes siempre con `resolveImageUrl()`
- Naming: routes kebab-case, DB snake_case, functions camelCase
- Auth: `authenticate` + `authorize(...roles)` en rutas protegidas

---

## Features disponibles

```
properties, services, projects, blog, collections,
categories, tags, media, messages, settings,
analytics, translations, menu, content
```

Cada cliente puede tener un subset habilitado. Verificar feature flags antes de bindear.

---

## Foundation docs — crear ANTES de escribir codigo

**Regla:** Antes de escribir cualquier codigo frontend, crear el directorio `docs/` con los archivos de planificacion. Estos archivos son la fuente de verdad para todo el proyecto. Cada skill lee de estos archivos antes de ejecutar. Si un archivo no existe, crearlo antes de codear.

### Archivos obligatorios en `docs/`

#### 1. `docs/design-brief.md` — Identidad visual completa

Producido por `creative-design`. Contiene decisiones implementables, no descripciones abstractas.

```
- Paleta de colores (hex values, tokens CSS)
- Tipografia (families, scale fluid clamp, weights, tracking)
- Spacing scale (8px base, todos los valores)
- Radii y shadows (con glow specs)
- Atmospheric system (grain, glow orbs, gradients, scan lines)
- Responsive strategy (breakpoints, que cambia en cada uno)
- Technique-to-stack mapping (que tool para cada efecto)
```

#### 2. `docs/content-brief.md` — Copy especifico del cliente

Todo el texto que va en el sitio. Nunca copy generico. Si el contenido viene del CMS, documentar los `contentStore.get()` keys y sus fallbacks.

```
- Nombre, tagline, voz y tono
- Hero headline + sub (especifico, no template)
- Copy de cada servicio (nombre real + 2-3 oraciones)
- Proceso/metodologia (pasos especificos de ESTE cliente)
- Testimonios (reales o realistas)
- CTAs concretos (verbos de accion, no "Contactanos")
- Footer copy, about snippets, cualquier texto visible
```

#### 3. `docs/page-plans.md` — Arquitectura de secciones por pagina

Cada pagina definida seccion por seccion con proposito narrativo. Respetar los minimos del `page-scaffold` skill.

```
Minimos obligatorios:
- Homepage / landing: 8-14 secciones
- About / studio: 6-10 secciones
- Services: 6-10 secciones
- Portfolio / work: 5-8 secciones
- Case study: 6-10 secciones
- Contact: 3-5 secciones

Cada seccion lleva:
- Proposito: Impact | Manifesto | Energy | Context | Proof | Process | Trust | Evidence | Differentiator | Close
- Layout: que estructura visual
- Contenido: que texto/datos van (referencia al content-brief)
- Motion: que animacion (referencia al motion-spec)

Ritmo narrativo: alternar ⚡ energeticas y 🧘 contemplativas.
Nunca dos secciones densas consecutivas sin Energy break.
```

#### 4. `docs/motion-spec.md` — Coreografia de motion

Spec completa para que `gsap-motion` pueda implementar sin improvisar.

```
- Hero entrance timeline (paso a paso con tiempos)
- Scroll reveal defaults (easing, duration, y-offset, stagger, trigger)
- Interacciones hover (cards, buttons, links)
- Page transitions (enter/leave)
- Scroll-linked animations (parallax, pins, scrub)
- Tecnicas especiales (marquee, counters, text split, custom cursor)
- prefers-reduced-motion: siempre documentar que se desactiva
```

### Orden de creacion (obligatorio)

```
1. Leer SKILL.md de: creative-design, page-scaffold, gsap-motion, vue-component
2. Crear docs/content-brief.md (copy primero — content-first)
3. Crear docs/design-brief.md (tokens, paleta, atmosfera — via creative-design)
4. Crear docs/page-plans.md (secciones por pagina, propositos, narrativa)
5. Crear docs/motion-spec.md (coreografia completa)
6. RECIEN AHORA escribir codigo
```

### Como usar los docs en cada decision

| Decision frontend | Archivo fuente |
|-------------------|----------------|
| Que texto poner | `docs/content-brief.md` |
| Que colores/tipografia | `docs/design-brief.md` |
| Cuantas secciones, que layout | `docs/page-plans.md` |
| Como animar | `docs/motion-spec.md` |
| Que spacing/radii/shadows | `docs/design-brief.md` |
| Responsive behavior | `docs/design-brief.md` |

**No improvisar.** Si el page-plan dice 9 secciones con estos propositos, implementar eso. Si el content-brief dice "Schedule a code review" como CTA, usar eso. Los docs son el brief. El codigo es la ejecucion del brief.

---

## Pipeline de ejecucion

### Para nuevo cliente (onboarding completo)

Seguir el pipeline del `pegasuz-integrator` en orden estricto:

1. **Phase 0** - Analizar request, producir task breakdown
2. **Phase 1** - Provisionar cliente (POST /api/core-admin/clients)
3. **Phase 2** - Configurar feature flags
4. **Phase 3** - Verificar endpoints con x-client del nuevo tenant
5. **Phase 4** - Scaffold frontend normalizado (`pegasuz-frontend-normalization`)
6. **Phase 5** - Feature binding por dependencias (`pegasuz-feature-binding`)
7. **Phase 5a** - **Foundation docs** — Leer SKILL.md de creative-design + page-scaffold. Crear `docs/` con los 4 archivos obligatorios:
   - `docs/content-brief.md` (copy especifico primero)
   - `docs/design-brief.md` (via `creative-design`)
   - `docs/page-plans.md` (secciones por pagina, propositos, minimos)
   - `docs/motion-spec.md` (coreografia GSAP)
8. **Phase 5b** - UI/UX application (skills frontend) — **leyendo de docs/** en cada paso
9. **Phase 6** - Validation QA de 5 layers (`pegasuz-validation-qa`)
10. **Phase 7** - Documentation (`pegasuz-documentation-system`)

### Para feature nuevo o modificacion

1. Verificar scope (feature permitido?)
2. Backend: endpoint existe? Si no, crear con `pegasuz-backend-development`
3. Frontend: binding completo? Si no, ejecutar `pegasuz-feature-binding`
4. **Plan de diseno**: ejecutar `creative-design` para definir como se ve y se siente el feature. Si ya existe un plan de diseno del cliente, alinear con el.
5. UI: aplicar visual con skills frontend **siguiendo el plan**
6. Validar con `pegasuz-validation-qa`
7. Documentar

### Para construccion de pagina/componente

1. **Leer docs/** — Abrir `docs/page-plans.md` para la pagina. Si no existe el plan para esta pagina, crearlo primero.
2. **Leer content-brief** — Obtener el copy exacto de `docs/content-brief.md`. Si no existe para esta pagina, escribirlo primero.
3. **HTML semantico** basado en las secciones del page-plan (respetar propositos, minimos, ritmo narrativo)
4. **Datos** via store
5. **Design tokens** — implementar los tokens de `docs/design-brief.md` (no inventar)
6. **Estilos** aplicando paleta, tipografia, spacing del design-brief
7. **Motion** con GSAP siguiendo `docs/motion-spec.md`
8. **SEO** meta tags + JSON-LD segun tipo de pagina
9. **Checklist**: loading state, error state, reduced motion, responsive, a11y, zero omission, minimo de secciones cumplido

---

## Feature binding — response extraction

| Entity | API Wrapper | Store Extraction |
|--------|------------|-----------------|
| Properties | Direct array | `items = data` |
| Services | Direct array | `items = data` |
| Categories | Direct array | `items = data` |
| Tags | Direct array | `items = data` |
| Menu | Direct array | `items = data` |
| Media | Direct array | `items = data` |
| Posts | `{ posts, pagination }` | `items = data.posts` |
| Projects | `{ projects, pagination }` | `items = data.projects` |
| Testimonials | `{ testimonials, pagination }` | `items = data.testimonials` |
| Contacts | `{ contacts, pagination }` | `items = data.contacts` |
| SiteContent | `{ tenant, version, contents }` | `contents = data.contents` |

---

## Motion — emergency fallbacks

Estos valores se usan SOLO si `docs/motion-spec.md` no existe o no define valores para un campo. El motion-spec del proyecto es la fuente de verdad. Cada proyecto define su propia personalidad de motion en el design-brief.

| Fallback | Valor |
|----------|-------|
| Easing | power3.out |
| Duration | 0.8s |
| Y offset | 32px |
| ScrollTrigger | once: true |
| Cleanup | clearProps: 'all' |
| Reduced motion | prefers-reduced-motion guard obligatorio |

```js
// Patron obligatorio en todo componente con animaciones
let ctx = null
onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  ctx = gsap.context(() => { /* animaciones */ }, rootEl)
})
onBeforeUnmount(() => ctx?.revert())
```

---

## Anti-patterns — bloquear activamente

**Frontend:** No axios fuera de `api.js`. No HTTP fuera de `services/`. No JSON.parse en views. No slugs hardcodeados. No stores sin loading/error. No OR chains en extraction. No static route imports. No CMS data para features. No paginas sin meta tags. No imagenes sin `resolveImageUrl()`. No animar width/height/top/left (solo transform y opacity).

**Backend:** No `new PrismaClient()` directo. No hardcoded DB names. No raw SQL con interpolacion. No endpoints sin auth. No npm packages sin justificar.

---

## Dispatch de skills

### 🚀 Inicio de proyecto (entry point)

| Trigger | Skill | Que hace |
|---------|-------|---------|
| "iniciar un nuevo proyecto" | `new-project` | Wizard interactivo completo: discovery → identidad visual → secciones → copy → motion → genera docs/ → arranca pipeline |
| "nuevo proyecto" | `new-project` | Idem |
| "crear proyecto" | `new-project` | Idem |
| "/new-project" | `new-project` | Idem |

**Este es el entry point de CUALQUIER proyecto nuevo.** No arrancar a codear sin pasar por este wizard.

---

### Orquestacion y backend

| Contexto | Skill |
|----------|-------|
| Operacion multi-fase, onboarding | `pegasuz-integrator` |
| Schema, endpoints, controllers | `pegasuz-backend-development` |
| Conectar API a frontend | `pegasuz-feature-binding` |
| Normalizar frontend antes de binding | `pegasuz-frontend-normalization` |
| Validar integracion cross-layer | `pegasuz-validation-qa` |
| Documentar cambios | `pegasuz-documentation-system` |
| Orquestar frontend end-to-end | `pegasuz-frontend-executor` |

### Construccion frontend — pipeline estricto

Orden obligatorio. Cada paso depende del anterior. Sin brief, no hay construccion.

| Paso | Skill | Input | Output |
|------|-------|-------|--------|
| 1 | `creative-design` | Estetica, rubro, inspiracion | Design Brief (`docs/design-brief.md`) |
| 2 | `page-scaffold` | `docs/page-plans.md` + tokens + atmosphere | Paginas con N secciones |
| 3 | `threejs-3d` | Technique mapping + 3D scope | Escenas WebGL (Tier 1 minimo) |
| 4 | `vue-component` | Tokens + interaction patterns | Componentes reutilizables |
| 5 | `gsap-motion` | `docs/motion-spec.md` + brand easing | Animaciones implementadas |
| 6 | Auditorias | — | CRITICAL/WARNING/SUGGESTION |

**Reglas:** `creative-design` siempre primero. `threejs-3d` siempre se ejecuta (3D NO es opcional) y va ANTES de `vue-component` (el canvas 3D es atmosfera fundacional, no add-on final). Cada skill lee de `docs/`. Auditorias en paralelo, resolver CRITICAL antes de avanzar. Identidad visual unica por proyecto.

### Auditoria

| Contexto | Skill |
|----------|-------|
| Accesibilidad, WCAG | `a11y-audit` |
| Performance, bundle size | `perf-check` |
| CSS, tokens, sistema visual | `css-review` |
| Responsive, breakpoints | `responsive-review` |
| SEO, meta tags, JSON-LD | `seo-audit` |
| Buscar codigo, patrones | `find-code` |

### Cadena de calidad (ejecutar post-construccion)

1. `pegasuz-validation-qa` - Zero Omission Rule, 5 layers
2. `a11y-audit` - semantica, aria, keyboard
3. `seo-audit` - meta tags, JSON-LD, headings
4. `responsive-review` - mobile/tablet/desktop
5. `css-review` - tokens, spacing
6. `perf-check` - imagenes, bundle, lazy loading

Corregir BLOCKING y CRITICAL antes de avanzar.

---

## Estructura frontend esperada por cliente

```
Clientes/<slug>/
  docs/
    design-brief.md         <- Identidad visual, tokens, atmosfera, responsive
    content-brief.md        <- Copy especifico: headlines, servicios, CTAs, testimonios
    page-plans.md           <- Secciones por pagina con proposito, layout, contenido
    motion-spec.md          <- Coreografia GSAP, timelines, scroll behaviors
  src/
    config/
      api.js                <- Single axios + resolveImageUrl + x-client
    services/
      <entity>Service.js    <- Un archivo por entidad
    stores/
      content.js            <- CMS bootstrap (get, getJSON)
      <entity>.js           <- Un store por entidad (loading, error, pagination)
    views/
      <Entity>View.vue      <- List view
      <Entity>DetailView.vue <- Detail view
    components/             <- UI reutilizable
    composables/            <- Logica compartida (NO para data loading)
    router/
      index.js              <- Lazy loading, scrollBehavior
    styles/                 <- Design tokens del cliente
    App.vue
    main.js                 <- Pinia + CMS bootstrap before mount
  .env                      <- VITE_API_URL + VITE_CLIENT_SLUG
```

