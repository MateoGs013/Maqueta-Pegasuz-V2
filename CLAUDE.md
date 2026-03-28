# CLAUDE.md

## Plataforma

Pegasuz Core - plataforma SaaS multi-tenant. Backend centralizado (Node.js + Express + Prisma + MySQL) sirviendo multiples clientes, cada uno con su propia base de datos y frontend Vue 3.

---

## Arquitectura backend (locked)

```
HTTP Request (header: x-client: <slug>)
  -> clientResolver middleware
  -> prismaManager.getPrisma(database_name)
  -> req.client + req.prisma (tenant-scoped)
  -> Controller -> Service -> Prisma (tenant DB)
```

**Reglas inviolables:**
- Tenant isolation en cada cambio
- Dynamic Prisma connection (nunca new PrismaClient() directo)
- No npm packages sin justificacion
- Naming: routes kebab-case, DB snake_case, functions camelCase
- Auth: authenticate + authorize(...roles) en rutas protegidas
- Documentar todo en /Documentation/

---

## Arquitectura frontend por cliente (locked)

```
View.vue
  -> Pinia Store
      -> Service (src/services/<entity>Service.js)
          -> api.js (src/config/api.js - single axios instance)
              -> Pegasuz Core API (header: x-client: <slug>)
```

**Reglas inviolables:**
- View -> Store -> Service -> API. Sin atajos.
- No axios imports fuera de src/config/api.js
- No HTTP calls fuera de src/services/
- No JSON.parse en views o components
- No hardcoded slugs (siempre VITE_CLIENT_SLUG)
- CMS content (contentStore.get) separado de feature data (feature stores)
- Imagenes siempre con resolveImageUrl()

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

## Feature binding - response extraction

| Entity | API Wrapper | Store Extraction |
|--------|------------|-----------------|
| Properties | Direct array | items = data |
| Services | Direct array | items = data |
| Categories | Direct array | items = data |
| Tags | Direct array | items = data |
| Posts | { posts, pagination } | items = data.posts |
| Projects | { projects, pagination } | items = data.projects |
| Testimonials | { testimonials, pagination } | items = data.testimonials |
| Contacts | { contacts, pagination } | items = data.contacts |
| SiteContent | { tenant, version, contents } | contents = data.contents |

---

## Reglas de motion (defaults - el cliente puede customizar)

| Regla | Valor default |
|-------|--------------|
| Easing entrances | power3.out |
| Duration reveals | 0.7 - 0.9s |
| Y offset scroll reveal | 32px |
| ScrollTrigger | once: true |
| Cleanup | clearProps: 'all' |
| Vue cleanup | onBeforeUnmount(() => ctx?.revert()) |
| Reduced motion | prefers-reduced-motion guard obligatorio |

```js
let ctx = null
onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  ctx = gsap.context(() => { /* animaciones */ }, rootEl)
})
onBeforeUnmount(() => ctx?.revert())
```

---

## Anti-patterns - bloquear activamente

### Frontend

| Anti-pattern | Corregir con |
|-------------|-------------|
| Axios import en store o view | Service layer |
| JSON.parse en views | Parsear en store o service |
| API config fuera de src/config/ | Mover a src/config/api.js |
| Slug hardcodeado | VITE_CLIENT_SLUG |
| Stores sin loading/error | Siempre incluir ambos |
| OR chains en response extraction | Extraer segun wrapper documentado |
| Static route imports | Lazy loading: () => import() |
| CMS data para feature entities | contentStore = labels, feature store = data |
| Pagina sin meta tags | Siempre incluir SEO basico |
| Imagenes sin resolveImageUrl | Siempre resolver URLs |

### Backend

| Anti-pattern | Corregir con |
|-------------|-------------|
| new PrismaClient() directo | prismaManager.getPrisma() |
| Hardcoded database names | Dynamic resolution via clientResolver |
| Raw SQL con interpolacion | Prisma query API |
| Endpoints sin auth | authenticate + authorize |
| npm packages sin justificar | Usar el stack existente |

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

La construccion frontend sigue un orden obligatorio. Cada paso depende del anterior.

```
1. creative-design     → Produce Design Brief (guardado en docs/design-brief.md)
2. page-scaffold       → Crea la estructura narrativa (secciones, layout) desde el brief
3. threejs-3d          → Implementa 3D/WebGL (SIEMPRE — Tier 1 minimo)
4. vue-component       → Construye componentes reutilizables con tokens del brief
5. gsap-motion         → Implementa la motion choreography del brief
6. Cadena de calidad   → a11y → seo → responsive → css → perf (corregir CRITICAL antes de avanzar)
```

**Reglas del pipeline:**
- No se puede ejecutar el paso N sin haber completado el paso N-1
- `creative-design` siempre primero. Sin brief, no hay construccion.
- `threejs-3d` siempre se ejecuta (Tier 1 minimo). 3D NO es opcional.
- El brief se guarda en archivo (`docs/design-brief.md`) para que todas las skills lo lean
- Cada skill recibe las secciones relevantes del brief como input
- Las auditorias corren en paralelo pero todos los CRITICAL deben resolverse
- Cada proyecto DEBE tener identidad visual unica. Nunca repetir la misma paleta/easing/atmosfera.

| Paso | Skill | Input del brief | Output |
|------|-------|-----------------|--------|
| 1 | `creative-design` | Estetica, rubro, URL inspiracion | Design Brief completo |
| 2 | `page-scaffold` | Section architecture + tokens + atmosphere | Pagina con N secciones |
| 3 | `vue-component` | Tokens + interaction patterns + atmosphere | Componentes reutilizables |
| 4 | `gsap-motion` | Motion choreography + brand easing | Animaciones implementadas |
| 5 | `threejs-3d` | Technique mapping + 3D scope | Escenas WebGL |
| 6 | Auditorias | — | Findings con CRITICAL/WARNING/SUGGESTION |

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

---

## Regla principal

Cada cliente Pegasuz es un producto con identidad propia. La arquitectura es compartida, la estetica es unica. Construir con la solidez del sistema y la libertad creativa que el cliente necesita.

**Design-first, siempre.** No escribir CSS, no elegir colores, no definir spacing, no animar sin antes tener un plan de `creative-design`. El plan es el brief. El codigo es la ejecucion del brief.

**Identidad unica, siempre.** Cada proyecto tiene su propia paleta, tipografia, easing, atmosfera y personalidad de motion. Nunca reutilizar valores de otro proyecto. Nunca defaultear a dark + warm accent + power3.out + 32px + 0.8s + grain.

**3D/WebGL, siempre.** Cada proyecto incluye al menos un elemento 3D (Tier 1: shader atmosferico o campo de particulas). 3D es una herramienta de inmersion primaria, no una decoracion opcional.

**Variacion de animacion, siempre.** Cada seccion usa una tecnica de animacion diferente. Nunca el mismo fade-up en todas las secciones.
