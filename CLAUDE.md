# CLAUDE.md — Pegasuz Maqueta V2

## Reglas cardinales (leer primero, cumplir siempre)

1. **Design-first:** sin `creative-design` brief, no se escribe CSS ni se eligen colores
2. **Content-first:** `docs/content-brief.md` se crea antes de cualquier visual
3. **Identidad unica:** paleta, tipografia, easing y atmosfera propios por proyecto. Nunca reutilizar
4. **3D obligatorio:** Tier 1 minimo (shader atmosferico o campo de particulas)
5. **Variacion de animacion:** cada seccion usa tecnica diferente. Nunca el mismo fade-up en todas
6. **Docs son ley:** no improvisar. Si el page-plan dice 9 secciones, implementar 9. Si el content-brief dice "Schedule a code review" como CTA, usar eso

---

## Anti-patterns (bloquear ANTES de codear)

**Frontend:** No axios fuera de `api.js`. No HTTP fuera de `services/`. No JSON.parse en views. No slugs hardcodeados (siempre `VITE_CLIENT_SLUG`). No stores sin loading/error. No OR chains en extraction. No static route imports. No CMS data para features. No paginas sin meta tags. No imagenes sin `resolveImageUrl()`. No animar width/height/top/left (solo transform y opacity).

**Backend:** No `new PrismaClient()` directo. No hardcoded DB names. No raw SQL con interpolacion. No endpoints sin auth.

---

## Arquitectura (locked)

**Plataforma:** Pegasuz Core — SaaS multi-tenant. Node.js + Express + Prisma + MySQL. Cada cliente: propia DB + frontend Vue 3.

**Backend chain:** `HTTP (x-client: <slug>) -> clientResolver -> prismaManager.getPrisma(db) -> Controller -> Service -> Prisma`

**Frontend chain:** `View.vue -> Pinia Store -> Service (src/services/) -> api.js (src/config/api.js) -> API (x-client)`

**Inviolable:** Tenant isolation dinamica. Cadena completa sin atajos. CMS content (`contentStore.get`) separado de feature data. Imagenes con `resolveImageUrl()`. Naming: routes kebab-case, DB snake_case, functions camelCase. Auth: `authenticate` + `authorize(...roles)`.

**Features:** `properties, services, projects, blog, collections, categories, tags, media, messages, settings, analytics, translations, menu, content`. Verificar feature flags antes de bindear.

---

## Foundation docs (crear ANTES de codigo)

Cada skill lee de `docs/`. Si un archivo no existe, crearlo antes de codear. Templates en `docs/_templates/`.

**Orden obligatorio:**
1. Leer SKILL.md de: creative-design, page-scaffold, gsap-motion, vue-component
2. `docs/content-brief.md` — copy especifico (content-first). Nunca generico. CMS keys + fallbacks
3. `docs/design-brief.md` — via `creative-design`. Tokens implementables (paleta, tipo, spacing, radii, atmosfera, responsive, technique mapping)
4. `docs/page-plans.md` — secciones por pagina con proposito narrativo. Minimos: homepage 8-14, about/services 6-10, portfolio 5-8, case-study 6-10, contact 3-5. Cada seccion: proposito, layout, contenido, motion. Ritmo: alternar energeticas y contemplativas
5. `docs/motion-spec.md` — coreografia completa para `gsap-motion` (hero timeline, scroll reveals, hover, transitions, scroll-linked, reduced-motion)
6. RECIEN AHORA escribir codigo

**Que doc consultar:** texto -> content-brief | colores/tipo/spacing/radii/responsive -> design-brief | secciones/layout -> page-plans | animaciones -> motion-spec

---

## Response extraction

| Entity | API response | Store extraction |
|--------|-------------|-----------------|
| Properties, Services, Categories, Tags, Menu, Media | Direct array | `items = data` |
| Posts | `{ posts, pagination }` | `items = data.posts` |
| Projects | `{ projects, pagination }` | `items = data.projects` |
| Testimonials | `{ testimonials, pagination }` | `items = data.testimonials` |
| Contacts | `{ contacts, pagination }` | `items = data.contacts` |
| SiteContent | `{ tenant, version, contents }` | `contents = data.contents` |

---

## Pipelines

### Nuevo cliente (onboarding via `pegasuz-integrator`)

Phase 0: task breakdown -> Phase 1: provisionar (POST /api/core-admin/clients) -> Phase 2: feature flags -> Phase 3: verificar endpoints -> Phase 4: `pegasuz-frontend-normalization` -> Phase 5: `pegasuz-feature-binding` -> Phase 5a: foundation docs (los 4 archivos de arriba) -> Phase 5b: UI/UX leyendo de docs/ -> Phase 6: `pegasuz-validation-qa` -> Phase 7: `pegasuz-documentation-system`

### Feature nuevo

1. Verificar scope -> 2. Backend con `pegasuz-backend-development` si falta -> 3. Binding con `pegasuz-feature-binding` si falta -> 4. Plan con `creative-design` -> 5. UI siguiendo plan -> 6. `pegasuz-validation-qa` -> 7. Documentar

### Pagina/componente

1. Leer page-plans (crear si no existe) -> 2. Leer content-brief (escribir si falta) -> 3. HTML semantico respetando secciones -> 4. Datos via store -> 5. Tokens del design-brief -> 6. Estilos -> 7. Motion via motion-spec -> 8. SEO meta + JSON-LD -> 9. Checklist: loading, error, reduced-motion, responsive, a11y, zero omission

---

## Skill dispatch

**Entry point:** "nuevo/crear/iniciar proyecto" o "/new-project" -> `new-project` (wizard obligatorio antes de codear)

**Frontend pipeline (orden estricto, cada paso depende del anterior):**

| Paso | Skill | Output |
|------|-------|--------|
| 1 | `creative-design` | `docs/design-brief.md` |
| 2 | `page-scaffold` | Paginas con N secciones |
| 3 | `threejs-3d` | Escenas WebGL (atmosfera fundacional, no add-on) |
| 4 | `vue-component` | Componentes reutilizables |
| 5 | `gsap-motion` | Animaciones implementadas |
| 6 | Auditorias (en paralelo) | CRITICAL/WARNING/SUGGESTION |

**Backend/orquestacion:** `pegasuz-integrator` (onboarding) | `pegasuz-backend-development` (endpoints) | `pegasuz-feature-binding` (API->frontend) | `pegasuz-frontend-normalization` (scaffold) | `pegasuz-frontend-executor` (orquestar frontend e2e) | `pegasuz-validation-qa` (QA) | `pegasuz-documentation-system` (docs)

**Auditorias (tambien via `vue-composable`, `find-code` y `project-review`):**
`pegasuz-validation-qa` -> `a11y-audit` -> `seo-audit` -> `responsive-review` -> `css-review` -> `perf-check` -> `project-review` (health check global). Resolver CRITICAL antes de avanzar.

---

## Estructura frontend

```
Clientes/<slug>/
  docs/                     <- 4 foundation docs
  src/
    config/api.js           <- Single axios + resolveImageUrl + x-client
    services/<entity>Service.js
    stores/content.js       <- CMS bootstrap (get, getJSON)
    stores/<entity>.js      <- Loading, error, pagination
    views/<Entity>View.vue + <Entity>DetailView.vue
    components/             <- UI reutilizable
    composables/            <- Logica compartida (NO data loading)
    router/index.js         <- Lazy loading, scrollBehavior
    styles/                 <- Design tokens
    App.vue + main.js       <- Pinia + CMS bootstrap before mount
  .env                      <- VITE_API_URL + VITE_CLIENT_SLUG
```

---

## Motion fallbacks (solo si NO hay motion-spec)

Easing: power3.out | Duration: 0.8s | Y offset: 32px | ScrollTrigger: once: true | Cleanup: clearProps: 'all' | Reduced motion: obligatorio

```js
let ctx = null
onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  ctx = gsap.context(() => { /* animaciones */ }, rootEl)
})
onBeforeUnmount(() => ctx?.revert())
```
