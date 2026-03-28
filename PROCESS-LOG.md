# Process Log: Maqueta Template Creation

> Fecha: 2026-03-28
> Objetivo: Crear una maqueta reutilizable para proyectos unicos y profesionales

---

## Que se hizo

### 1. Auditoria del estado previo

La carpeta tenia una configuracion completa de `.claude/` (agents, skills, settings, hooks, memory) pero todo estaba hardcodeado para un cliente especifico (Meridian Properties). No habia estructura de proyecto reutilizable.

**Archivos existentes:**
- CLAUDE.md con arquitectura Pegasuz (ya generico, se mantuvo)
- 7 agentes (todos con referencia a "Meridian Properties")
- 19 skills (ya genericos)
- 3 archivos de memoria (todos Meridian-especificos)
- settings.json con hooks (hardcoded slug check para "meridian")
- launch.json con configs de otros proyectos

### 2. Estructura creada

```
maqueta/
  docs/                    4 templates de documentacion
    _templates/              design-brief, content-brief, page-plans, motion-spec
    README.md                Como usar el sistema de docs

  prompts/                 17 prompts en 8 fases
    00-discovery/            client-intake, brand-questionnaire, competitive-analysis
    01-identity/             design-direction, color-strategy, typography, atmosphere
    02-content/              copy-framework, tone-of-voice, cta-strategy
    03-architecture/         page-planning, section-narratives, navigation-flow
    04-motion/               motion-personality, scroll-choreography, interaction-patterns
    05-3d/                   3d-scope, shader-brief
    06-implementation/       component-planning, state-management, api-integration
    07-quality/              pre-launch-checklist, audit-sequence

  inspiration/             14 archivos de referencia
    sites/                   6 rubros (agencies, real-estate, SaaS, e-commerce, portfolios, editorial)
    patterns/                6 patrones (hero, cards, nav, scroll, gallery, footer)
    motion/                  4 tipos (entrance, scroll, hover, page-transitions)
    3d/                      3 tipos (shaders, particles, interactive)

  guides/                  7 guias de proceso
    00-project-init          Como arrancar un proyecto
    01-pipeline-overview     Pipeline completo
    02-design-first          Metodologia design-first
    03-pegasuz-integration   Guia Pegasuz
    04-quality-standards     Estandares de calidad
    05-delivery-checklist    Checklist de entrega
    skill-dispatch-table     Que skill para que

  _project-scaffold/       Scaffold Vue 3 listo para copiar
    src/config/api.js        Axios + x-client + resolveImageUrl
    src/stores/content.js    CMS bootstrap store
    src/router/index.js      Router con lazy loading
    src/styles/tokens.css    Design tokens vacios (llenar del brief)
    src/main.js              Entry point con Pinia + CMS bootstrap
    src/App.vue              Layout base con skip-link + transitions
    package.json             Dependencias (Vue 3, Pinia, GSAP, Lenis, Axios)
    vite.config.js           Config Vite con alias @
    .env.example             Variables de entorno template
```

### 3. Cambios en .claude/

| Componente | Antes | Despues |
|-----------|-------|---------|
| **Agentes** | 7 agentes Meridian-especificos | 7 agentes genericos (leen de docs/) |
| **Memory** | 3 archivos Meridian | 3 archivos genericos (template-purpose, architecture-rules, pipeline) |
| **settings.json** | Hook hardcodeado "meridian" | Hook generico para cualquier slug |
| **launch.json** | 3 configs de otros proyectos | 1 config template limpia |
| **Skills** | 19 skills (sin cambios) | 19 skills (ya eran genericos) |
| **property-domain-expert** | Agente Meridian-especifico | Reemplazado por domain-expert generico |

### 4. Memorias actualizadas

**Proyecto (.claude/memory/):**
- `template-purpose.md` — Que es esta carpeta y como usarla
- `architecture-rules.md` — Reglas locked de arquitectura
- `pipeline.md` — Pipeline de ejecucion estricto

**Global (usuario):**
- `maqueta-template.md` — Referencia al template
- `user-profile.md` — Perfil de Mateo como desarrollador

---

## Como usar esta maqueta

### Para un nuevo proyecto

1. Leer `guides/00-project-init.md`
2. Seguir las fases de `prompts/` en orden (00 -> 07)
3. Llenar los 4 docs en `docs/` desde los templates
4. Copiar `_project-scaffold/` como base de codigo
5. Ejecutar la cadena de calidad post-build

### Para inspiracion

1. Ir a `inspiration/sites/` y buscar el rubro
2. Revisar `inspiration/patterns/` para layouts
3. Revisar `inspiration/motion/` para animaciones
4. Revisar `inspiration/3d/` para WebGL

### Para saber que skill usar

1. Consultar `guides/skill-dispatch-table.md`
2. O preguntar directamente — los skills se dispatchan automaticamente

---

## Principios que guian todo

1. **Design-first:** brief antes de codigo
2. **Content-first:** copy antes de visual
3. **Identidad unica:** cada proyecto es diferente
4. **3D siempre:** Tier 1 minimo
5. **Quality gate:** 0 CRITICAL para entregar
6. **Docs son la verdad:** el codigo ejecuta los docs

---

## Investigacion: Micro Design System Base (2026-03-28)

### Objetivo

Investigar design systems modernos y crear un template de micro design system que `creative-design` pueda personalizar por proyecto. Template de documentacion puro, sin codigo.

### Sistemas investigados

| Sistema | Que se extrajo | Decision adoptada |
|---------|---------------|-------------------|
| **Radix UI Colors** | 12-step scale con proposito por step, APCA contrast, P3 gamut | 12 steps (mapeados a 50-950) con uso semantico por step |
| **Shadcn/ui** | Token pairs bg/fg, oklch(), dark mode con borders semi-transparentes | Patron de semantic token pairs, oklch() como color space |
| **Vercel Geist** | 4 categorias tipograficas (heading/button/label/copy) | Type roles expandidos a 7 (display/heading/title/label/body/caption/code) |
| **Linear** | LCH color space, 3-variable theming, 8px spacing | oklch como espacio perceptualmente uniforme, spacing 4px base |
| **Stripe** | CIELAB perceptual uniformity, regla de 5 levels de separacion | Contrast por separacion de steps en la scale |
| **Apple HIG 2025** | Liquid Glass, 44px touch targets, dynamic type | 44px min touch target, fluid type scale con clamp() |
| **Material Design 3** | 3-layer tokens (ref/system/component), spatial vs effect easings | Arquitectura 3 capas, easing split spatial/effect, motion personalities |

### Decisiones clave

1. **oklch()** como color space (perceptualmente uniforme, P3 gamut)
2. **3 capas de tokens**: Reference (palette) -> Semantic (proposito) -> Component
3. **12-step color scale** (Radix) nombrados 50-950 (Tailwind-compatible)
4. **Spacing 4px base** (vs 8px previo) para mayor granularidad
5. **Animation tokens en 3 sistemas**: duration (9 niveles), easing (spatial vs effects), stagger (5 niveles)
6. **6 motion personalities** como punto de partida: Cinematic, Snappy, Playful, Minimal, Dramatic, Fluid
7. **6 componentes base** con variantes, states, props y a11y: Button, Input, Card, Badge, Modal, Toast

### Output

`docs/_templates/design-system-base.template.md` con 6 secciones:
1. Token System (reference, semantic, dark mode, contrast rules)
2. Component Patterns (Button, Input, Card, Badge, Modal, Toast)
3. Layout Patterns (section wrapper, container, grid, spacing scale)
4. Animation Tokens (duration, easing, stagger, scroll defaults, presets, personalities)
5. Typography System (type roles, fluid scale reference)
6. Integration guide (conexion con otros templates)

---

## Auditoria profunda de 7 skills Pegasuz (2026-03-28)

### Scope

Auditoria de los 7 skills Pegasuz en `.claude/skills/`:
1. pegasuz-integrator
2. pegasuz-backend-development
3. pegasuz-feature-binding
4. pegasuz-frontend-normalization
5. pegasuz-frontend-executor
6. pegasuz-validation-qa
7. pegasuz-documentation-system

### Dimensiones auditadas

1. Pipeline end-to-end (outputs -> inputs entre fases)
2. Response extraction (todas las entidades documentadas)
3. Tenant isolation (x-client, VITE_CLIENT_SLUG, prismaManager)
4. Normalization anti-patterns (cobertura vs CLAUDE.md)
5. Validation QA (5 layers + Zero Omission Rule)

### Hallazgos (10 gaps detectados)

#### 1. PIPELINE END-TO-END

| ID | Severidad | Skill | Hallazgo |
|----|-----------|-------|----------|
| GAP-PIPE-01 | CRITICAL | integrator | Phase 4 no mencionaba `pegasuz-frontend-normalization` explicitamente |
| GAP-PIPE-02 | WARNING | frontend-executor | Mode A y Mode B usan sistemas de docs diferentes (intencional, documentado) |
| GAP-PIPE-03 | CRITICAL | integrator | Skill Registry no incluia normalization (solo 5 de 6 skills) |

#### 2. RESPONSE EXTRACTION

| ID | Severidad | Skill | Hallazgo |
|----|-----------|-------|----------|
| GAP-EXTRACT-01 | MAJOR | feature-binding | Faltaba tabla consolidada de Response Extraction Reference |
| GAP-EXTRACT-02 | MAJOR | validation-qa | SiteContent ausente de extraction rules (8/9 entidades) |
| GAP-EXTRACT-03 | MINOR | validation-qa | Menu ausente de extraction rules |

#### 3. TENANT ISOLATION

| ID | Severidad | Skill | Hallazgo |
|----|-----------|-------|----------|
| GAP-TENANT-01 | MAJOR | frontend-executor | Pre-QA checklist sin verificacion de tenant isolation |

#### 4. NORMALIZATION ANTI-PATTERNS

| ID | Severidad | Skill | Hallazgo |
|----|-----------|-------|----------|
| GAP-NORM-01 | MAJOR | normalization | Sin AP code para "Stores sin loading/error" |
| GAP-NORM-02 | MAJOR | normalization | Sin AP code para "CMS data para feature entities" |

#### 5. VALIDATION QA

| ID | Severidad | Skill | Hallazgo |
|----|-----------|-------|----------|
| GAP-QA-01 | MINOR | validation-qa | Menu sin Entity Field Inventory en Layer 1 |

### Fixes aplicados

| # | GAP(s) resueltos | Skill modificado | Fix aplicado |
|---|------------------|------------------|-------------|
| 1 | PIPE-01, PIPE-03 | pegasuz-integrator | +Normalization Skill en registry, Phase 4 referencia explicita |
| 2 | EXTRACT-01 | pegasuz-feature-binding | +Response Extraction Reference (10 entidades) |
| 3 | EXTRACT-02, EXTRACT-03, QA-01 | pegasuz-validation-qa | +SiteContent/Menu en extraction rules y field inventory |
| 4 | TENANT-01 | pegasuz-frontend-executor | +4 tenant checks en pre-QA checklist |
| 5 | NORM-01, NORM-02 | pegasuz-frontend-normalization | +AP-16 (stores sin loading/error), +AP-17 (CMS para feature data) |

### Gap no corregido

| ID | Razon | Recomendacion |
|----|-------|---------------|
| GAP-PIPE-02 | Mode A (sitio institucional) usa docs propios del repo. Mode B (clientes) usa docs/ del CLAUDE.md. Bifurcacion intencional por arquitectura. | Documentar en el executor que cada modo tiene su propio sistema de docs. |

### Archivos modificados

- `.claude/skills/pegasuz-integrator/pegasuz-integrator/SKILL.md`
- `.claude/skills/pegasuz-feature-binding/pegasuz-feature-binding/SKILL.md`
- `.claude/skills/pegasuz-validation-qa/pegasuz-validation-qa/SKILL.md`
- `.claude/skills/pegasuz-frontend-executor/SKILL.md`
- `.claude/skills/pegasuz-frontend-normalization/pegasuz-frontend-normalization/SKILL.md`
- `PROCESS-LOG.md`

### Estado post-auditoria

| Dimension | Estado |
|-----------|--------|
| Pipeline end-to-end | FIXED |
| Response extraction (10/10 entidades) | FIXED |
| Tenant isolation | FIXED |
| Normalization (17 anti-patterns AP-1 a AP-17) | FIXED |
| Validation QA 5 layers | FIXED |
| Zero Omission Rule | OK (sin cambios) |

---

## Auditoria completa de prompts/ (2026-03-28)

### Objetivo

Auditar los 23 prompts en 8 carpetas (00-discovery a 07-quality). Para cada uno evaluar: accionabilidad, especificidad de preguntas, ejemplos buenos vs malos, conexion pipeline, cobertura de rubros, anti-patterns. Aplicar mejoras directamente.

### Evaluacion pre-mejoras (23 archivos)

| Archivo | Accionable | Ejemplos | Pipeline | Rubros | Anti-patterns |
|---------|-----------|----------|----------|--------|---------------|
| 00/client-intake | SI | SI | PARCIAL | NO | SI (signals) |
| 00/brand-questionnaire | SI | SI | PARCIAL | SI | SI |
| 00/competitive-analysis | SI | SI | PARCIAL | SI | SI |
| 01/design-direction | SI | NO | PARCIAL | NO | NO |
| 01/color-strategy | SI | NO | SI | SI | SI |
| 01/typography-selection | SI | NO | SI | SI | SI |
| 01/atmosphere-definition | SI | SI* | PARCIAL | SI* | SI* |
| 02/copy-framework | SI | NO | PARCIAL | NO | NO |
| 02/tone-of-voice | SI | NO | NO | NO | NO |
| 02/cta-strategy | SI | NO | NO | NO | NO |
| 03/page-planning | SI | NO | PARCIAL | NO | NO |
| 03/section-narratives | SI | SI (1) | NO | NO | NO |
| 03/navigation-flow | SI | NO | NO | NO | NO |
| 04/motion-personality | SI | NO | PARCIAL | NO | NO |
| 04/scroll-choreography | SI | NO | NO | NO | NO |
| 04/interaction-patterns | SI | NO | NO | NO | NO |
| 05/3d-scope | SI | NO | PARCIAL | NO | NO |
| 05/shader-brief | SI | NO | NO | NO | NO |
| 06/component-planning | SI | NO | NO | NO | NO |
| 06/state-management | SI | SI (code) | NO | NO | NO |
| 06/api-integration | SI | NO | NO | NO | NO |
| 07/pre-launch-checklist | SI | NO | PARCIAL | NO | NO |
| 07/audit-sequence | SI | NO | NO | NO | NO |

*atmosphere-definition ya tenia mejoras parciales de sesion anterior

### Mejoras aplicadas

**00-discovery/ (3 archivos)**
- client-intake: +variaciones por rubro (5 rubros), +conexion pipeline con diagrama
- brand-questionnaire: +output format estructurado, +conexion pipeline (identity, content, motion)
- competitive-analysis: +output format obligatorio, +conexion pipeline

**01-identity/ (4 archivos)**
- design-direction: +ejemplo bueno vs malo, +errores comunes (5), +variaciones rubro (4), +conexion pipeline
- color-strategy: sin cambios (ya completo)
- typography-selection: sin cambios (ya completo)
- atmosphere-definition: +conexion pipeline con diagrama

**02-content/ (3 archivos)**
- copy-framework: +ejemplo copy bueno vs malo (4 rubros), +errores comunes (6), +conexion pipeline
- tone-of-voice: +ejemplos completos (3 rubros), +errores comunes (5), +conexion pipeline, +siguiente paso
- cta-strategy: +CTAs por rubro (tabla 6 rubros), +errores comunes (6), +conexion pipeline, +siguiente paso

**03-architecture/ (3 archivos)**
- page-planning: +ejemplo homepage plan (4 secciones), +errores comunes (6), +variaciones rubro (4), +conexion pipeline
- section-narratives: +ejemplo narrativa hero, +errores comunes (5), +conexion pipeline, +siguiente paso
- navigation-flow: +errores comunes (6), +variaciones rubro (4), +conexion pipeline, +siguiente paso

**04-motion/ (3 archivos)**
- motion-personality: +errores comunes (6), +variaciones rubro (tabla 6), +conexion pipeline
- scroll-choreography: +ejemplo scroll map (8 secciones), +errores comunes (6), +conexion pipeline, +siguiente paso
- interaction-patterns: +ejemplo catalogo completo, +errores comunes (6), +conexion pipeline, +siguiente paso

**05-3d/ (2 archivos)**
- 3d-scope: +tier por rubro (tabla 6), +errores comunes (7), +conexion pipeline
- shader-brief: +ejemplo shader brief completo, +errores comunes (6), +conexion pipeline, +siguiente paso

**06-implementation/ (3 archivos)**
- component-planning: +errores comunes (6), +conexion pipeline, +siguiente paso
- state-management: +errores comunes (7), +conexion pipeline, +siguiente paso
- api-integration: +errores comunes (6), +conexion pipeline, +siguiente paso

**07-quality/ (2 archivos)**
- pre-launch-checklist: +errores comunes QA (6), +triage de issues (tabla 7), +siguiente paso reforzado
- audit-sequence: +errores comunes auditoria (6), +tiempos estimados (tabla 6), +conexion pipeline, +ciclo de resolucion (9 pasos)

### Resumen cuantitativo

| Tipo de mejora | Archivos afectados |
|---------------|-------------------|
| Errores comunes agregados | 20 de 23 |
| Conexion pipeline | 20 de 23 |
| Ejemplos concretos | 14 de 23 |
| Variaciones por rubro | 10 de 23 |
| Output format definido | 3 de 23 |
| Siguiente paso explicito | 12 de 23 |

### Archivos sin cambios (ya completos)

- `01-identity/color-strategy.md` — paletas por rubro, errores comunes, pipeline ok
- `01-identity/typography-selection.md` — fonts por rubro, overused fonts, errores comunes ok

---

## Revision y mejora de guides/ (2026-03-28)

### Objetivo

Revisar todas las guias en `guides/` para mejorar su calidad, asegurar que sean autocontenidas, incluyan ejemplos concretos, y esten sincronizadas con CLAUDE.md.

### Analisis previo (hallazgos)

| Guia | Autocontenida | Pasos claros | Ejemplos | Skills correctos | Estado |
|------|:---:|:---:|:---:|:---:|--------|
| README.md | Parcial | No | No | Si | Faltaba onboarding, relacion entre archivos |
| 00-project-init.md | Si | Si | Pocos | Si | Faltaban prompts concretos, `new-project` no mencionado |
| 01-pipeline-overview.md | Parcial | Si | No | Si | Sin tiempos, sin prompts, sin "como saber que termino" |
| 02-design-first.md | Si | Parcial | Pocos | Si | Sin ejemplos de tokens CSS, sin anti-patterns detallados |
| 03-pegasuz-integration.md | Parcial | Si | Minimos | Si | Sin curl examples completos, sin code examples |
| 04-quality-standards.md | Si | Si | No | Si | Sin prompts de auditoria, sin code examples |
| 05-delivery-checklist.md | Si | Si | No | Si | Sin comandos de verificacion bash |
| skill-dispatch-table.md | Si | N/A | No | Desincronizado | Faltaba `new-project`, sin trigger keywords |

### Mejoras aplicadas

#### README.md
- Agregado "Que es esto" (contexto para dev nuevo)
- Tabla expandida con columna "Cuando leerla"
- Agregada guia 06-troubleshooting en la tabla
- Agregado diagrama de relacion entre archivos del proyecto
- Agregada seccion de convenciones de las guias

#### 00-project-init.md
- Agregado diagrama ASCII del flujo de inicializacion
- Agregada Opcion A: skill `new-project` como metodo recomendado
- Agregados prompts concretos para cada paso (con texto entre comillas)
- Agregadas verificaciones para cada doc ("como saber que esta listo")
- Agregada tabla de errores comunes al iniciar
- Agregada referencia rapida de prompts por fase
- Agregada seccion de configuracion de .env

#### 01-pipeline-overview.md
- Diagrama visual reescrito con dependencias claras
- Agregado diagrama de dependencias entre fases
- Cada fase ahora tiene: prompt concreto, "como saber que termino"
- Agregado patron base obligatorio de GSAP (codigo)
- Agregada tabla de tiempos estimados por fase
- Agregadas 7 reglas del pipeline (vs 6 originales)

#### 02-design-first.md
- Diagrama ASCII del flujo design-first completo (5 columnas)
- Ejemplo concreto de identidad unica (3 proyectos comparados)
- Ejemplo concreto de variacion de animacion (8 secciones)
- Ejemplo completo de tokens CSS (30+ custom properties)
- Ejemplo de mal vs bien en CSS (tokens vs valores hardcodeados)
- Tabla de anti-patterns de design con causas
- Agregado checklist rapido pre-build
- Seccion practica paso a paso con prompts

#### 03-pegasuz-integration.md
- Diagrama ASCII de arquitectura bidireccional (frontend + backend)
- Curl examples completos con headers y body para provisioning
- Lista completa de 14 features disponibles
- Ejemplo completo de feature binding (Service + Store + View con codigo)
- Diagrama ASCII de response extraction (9 entidades)
- Tabla de 9 anti-patterns numerados con ubicacion exacta
- Prompt concreto para buscar anti-patterns automaticamente
- Seccion de arquitectura CMS vs Features con diagrama

#### 04-quality-standards.md
- Agregado prompt de auditoria para cada area
- Ejemplo de loading/error states correcto (codigo Vue)
- Tabla de anti-patterns de motion (mal vs bien)
- Ejemplo de lazy loading en router (codigo)
- Ejemplo de meta tags en Vue 3 (codigo con useHead)
- Ejemplo de skip-link correcto (HTML + CSS)
- Tabla de severity con ejemplos concretos
- Tabla de metricas objetivo resumen (10 metricas)

#### 05-delivery-checklist.md
- Comandos bash de verificacion para cada seccion
- Tabla de auditorias con prompt y resultado esperado
- Scripts de busqueda de anti-patterns (hex hardcodeados, alt faltantes, etc.)
- Script de verificacion de GSAP cleanup en componentes
- Script de verificacion de reduced-motion guard
- Tabla de "si algo falla" con referencia a la guia correcta
- Seccion de configuracion (.env, .gitignore, build limpio)

#### skill-dispatch-table.md
- Agregado `new-project` como entry point (faltaba completamente)
- Diagrama ASCII del pipeline de construccion con input/output por paso
- Trigger keywords para cada skill de construccion
- Diagrama del Pegasuz pipeline completo (arbol de skills)
- Tabla de agentes con "Cuando se activa"
- Mapa completo skill-por-situacion en formato conversacional (20 entradas)
- Sincronizado con CLAUDE.md (20 skills + 7 agentes)

### Archivo nuevo creado

#### 06-troubleshooting.md
Guia de problemas comunes organizada en 8 categorias:
1. Build & Development (npm, Vite, variables de entorno)
2. API & Pegasuz (CORS, 401, 404, response extraction incorrecta)
3. Imagenes (resolveImageUrl, URLs rotas)
4. Vue & Router (pantalla blanca, 404 en refresh, reactividad de params)
5. GSAP & Motion (animaciones no corren, memory leaks, ScrollTrigger)
6. 3D / Three.js (canvas negro, performance mobile, memory leaks de GPU)
7. CSS & Responsive (tokens no aplican, layout roto en mobile)
8. Pegasuz-specific (tenant not found, Zero Omission Rule)

Incluye: Quick diagnostic (5 pasos) y tabla resumen de errores frecuentes (12 items).

### Archivos modificados

```
guides/README.md                  <- Reescrito
guides/00-project-init.md         <- Reescrito
guides/01-pipeline-overview.md    <- Reescrito
guides/02-design-first.md         <- Reescrito
guides/03-pegasuz-integration.md  <- Reescrito
guides/04-quality-standards.md    <- Reescrito
guides/05-delivery-checklist.md   <- Reescrito
guides/skill-dispatch-table.md    <- Reescrito y sincronizado con CLAUDE.md
guides/06-troubleshooting.md      <- Nuevo
PROCESS-LOG.md                    <- Actualizado
```

---

## Expansion del catalogo de inspiracion (2026-03-28)

### Objetivo

Expandir el catalogo de inspiracion con referencias actuales (URLs reales), nuevos rubros (gastronomy, fintech), tendencias 2025-2026, y tecnicas emergentes (View Transitions API, CSS scroll-driven animations, FLIP, raymarching SDF, GPGPU particles).

### Investigacion realizada

Busqueda web en Awwwards, FWA, CSS Design Awards, Siteinspire, Codrops, MDN, Chrome DevTools, GSAP docs. Se investigaron:
- Awwwards SOTD recientes (Marzo 2026)
- Tendencias de diseno web 2025-2026 (bento grid, glassmorphism, broken grids, AI-native, dark mode premium)
- Fintech web design (Stripe, Revolut, Mercury, Wise, Brex)
- Gastronomy web design (IRONHILL, SOM, Aupale Vodka, Casper's Caviar)
- Nuevas APIs del browser (View Transitions API, CSS scroll-driven animations)
- Tecnicas de animacion (FLIP, View Transitions, scroll-timeline)
- Shaders trending (raymarching SDF, GPGPU particles, dissolve effects, TSL/WebGPU)

### Archivos actualizados (6 sites existentes)

| Archivo | Cambios |
|---------|---------|
| `sites/creative-agencies.md` | +6 referencias con URLs (Unseen Studio, Immersive Garden, Resn, Darknode, Fello, CERNE), +2 patrones, +2 tecnicas |
| `sites/luxury-real-estate.md` | +5 referencias con URLs (Sotheby's, Compass, The Agency, Knight Frank, Aventura Dental Arts), +5 tendencias 2026 |
| `sites/saas-products.md` | +6 referencias con URLs (Linear, Stripe, Raycast, Clerk, Mercury, Resend), +6 tendencias 2026 |
| `sites/e-commerce.md` | +5 referencias con URLs (Belle Oaks, Oura Ring, BOMBON, Adanola, Studio Few) |
| `sites/portfolios.md` | +5 referencias con URLs (Corentin Bernadou, Samsy, Gavin Schneider, Stiff, Good Fella) |
| `sites/editorial.md` | +4 referencias con URLs (It's Nice That, Dezeen, Bloomberg, FC Porto Memorial) |

### Archivos actualizados (patterns, motion, 3d)

| Archivo | Cambios |
|---------|---------|
| `patterns/hero-patterns.md` | +4 nuevos tipos (Bento Hero, Calculator Hero, AI Dynamic, Glassmorphism Layered) |
| `patterns/card-layouts.md` | +3 hover techniques + Bento Grid trending + Glassmorphism Cards + Soft Brutalist Cards |
| `patterns/navigation-patterns.md` | +View Transitions nav, Scroll-Driven nav state, Command Palette pattern |
| `patterns/scroll-experiences.md` | +CSS scroll-driven animations (animation-timeline: scroll/view) con codigo |
| `motion/page-transitions.md` | +View Transitions API (code + browser support) + FLIP Animation (GSAP Flip code) |
| `3d/atmospheric-shaders.md` | +5 shaders trending (Raymarching SDF, Dissolve, GPGPU Texture, Chromatic Aberration, TSL) |
| `3d/particle-systems.md` | +4 sistemas (GPGPU Curl Noise, Dissolve Burst, Instanced Mesh, Audio-Reactive) |
| `3d/interactive-3d.md` | +4 elementos (Liquid Raymarching, WebGPU-Ready, Image Distortion, Generative Typography 3D) |

### Archivos creados (3 nuevos)

| Archivo | Contenido |
|---------|-----------|
| `sites/gastronomy.md` | 6 referencias con URLs + patrones + tecnicas de diferenciacion + keywords |
| `sites/fintech.md` | 6 referencias con URLs + patrones + tecnicas + tendencias 2026 + keywords |
| `trends-2026.md` | 10 tendencias principales + Stack Decision Matrix + Awwwards SOTD recientes |

### Totales

- **Referencias con URL agregadas:** 37 sitios con enlaces directos
- **Nuevos patrones documentados:** 15+
- **Nuevas tecnicas de animacion:** View Transitions API, CSS scroll-driven animations, FLIP
- **Nuevos shaders/3D:** Raymarching SDF, GPGPU, Dissolve, TSL/WebGPU, Chromatic Aberration
- **Archivos antes:** 19 (6 sites + 6 patterns + 4 motion + 3 3d)
- **Archivos ahora:** 22 (8 sites + 6 patterns + 4 motion + 3 3d + 1 trends)

---

## Stress-test de templates con proyecto ficticio (2026-03-28)

### Proyecto de prueba

**Noctua Studio** -- Agencia de diseno de interiores de lujo en Barcelona. Paleta oscura con acentos dorados. Publico: clientes de alto poder adquisitivo. Personalidad: sofisticada, arquitectonica, cinematica.

### Metodologia

Simulacion de llenado completo de los 4 templates en `docs/_templates/`. Para cada campo se intento rellenar con datos reales de Noctua Studio. Se identificaron fricciones, gaps, redundancias y campos confusos.

---

### Template 1: design-brief.template.md

**Funciona bien:** Identidad del proyecto, tokens CSS por categoria, scale fluid con clamp, spacing, reglas de accent, checklist final.

**Problematico (corregido):**
- Faltaba accent secundario (Noctua necesita oro + crema). Agregado `--color-accent-secondary`.
- Faltaban border/divider tokens. Agregado: `--color-border-default`, `--color-border-subtle`, `--color-border-strong`, `--border-width-*`.
- Font names eran comillas vacias. Cambiado a `'{{DISPLAY_FONT}}'` con placeholders claros.
- No habia tabla de fuentes seleccionadas (Google Fonts vs self-hosted). Agregada.
- Sistema atmosferico sin "Por que". Agregada columna justificacion.
- Mapeo tecnica-stack tenia 1 sola fila. Expandido a 3.
- Responsive strategy solo decia "CHANGES". Expandido con columnas: Tipografia, Layout, Motion.
- Component tokens eran pseudo-codigo. Reescrito con tokens reales.
- Checklist incompleta. Agregados 6 checks nuevos.

**Faltante (agregado):**
- Seccion 6 "Image treatment" (aspect ratios, filtros, hover, placeholder).
- `--color-bg-inverse`, `--color-gradient-mid`.
- "Keywords visuales" en seccion 1.
- Transition tokens (`--transition-fast/base/slow`, `--transition-easing`).
- Z-index scale.

---

### Template 2: content-brief.template.md

**Funciona bien:** Voz y tono (Persona/Nunca), manifesto + diferenciadores + stats, proceso, testimonios, microcopy, SEO por pagina.

**Problematico (corregido):**
- Hero headline "maximo 3 palabras" era restrictivo. Cambiado a "2 hasta 8 palabras".
- Subheadline "expanden" era typo. Corregido a "expande".
- Servicios hardcodeados 1-2-3 sin guia de extension. Reestructurado con nota "Copiar el bloque".
- Servicios sin beneficios ni precio. Agregados ambos campos.
- Tabla CTA faltaban paginas (case study, blog articulo, etc). Expandida a 10 paginas.
- SEO sin JSON-LD type. Agregada columna.
- Fuente de datos era 1 fila. Expandida a 5 pre-templated con fallback.
- Checklist incompleta. Agregados 6 checks.

**Faltante (agregado):**
- Origin story, idioma principal/secundarios.
- Testimonios con rating, logos de clientes.
- Microcopy: form success/error, newsletter, cookie banner.
- SEO: OG defaults, site_name, twitter card.

---

### Template 3: page-plans.template.md

**Funciona bien:** Tabla de minimos, tabla de propositos, reglas de ritmo, hero pre-estructurado, checklist.

**Problematico (corregido) -- PROBLEMA MAS GRAVE:**
- Homepage solo tenia 4 secciones (minimo es 8). Expandido a 8 secciones pre-estructuradas.
- About/Services/Portfolio/Contact tenian 1 seccion cada una. Expandido al minimo por pagina.
- Blog listing y Blog article no tenian template. Agregados completos.
- Faltaba "Data source" y "Responsive" por seccion. Agregados a cada seccion.

**Faltante (agregado):**
- Proposito "Showcase" (galeria fullscreen donde el visual ES el mensaje).
- Tipos "Service detail" y "Property/Product detail" en tabla de minimos.
- 3 checks nuevos en checklist.

---

### Template 4: motion-spec.template.md

**Funciona bien:** Personalidad de motion, hero timeline con timestamps, scroll reveal defaults, tecnicas especiales checkbox, reduced motion, performance guards, catalogo de tecnicas.

**Problematico (corregido):**
- Tecnicas por seccion solo 5 filas (Homepage minimo 8). Reestructurado con subseccion Homepage (8 filas) + resumen otras paginas.
- Hover interactions sin focus states. Agregados para accesibilidad.
- Hover interactions sin imagenes. Agregada subseccion.
- Page transitions demasiado minimal. Expandido con duracion, easing, route overrides.
- Scroll-linked tenia 1 fila. Expandido a 3 con columna "Intensidad mobile".
- Performance guards sin budget mobile. Agregados budgets.
- Checklist incompleta. Agregados 5 checks.

**Faltante (agregado):**
- Easing secundario, stagger from, X offset, easing override por seccion.
- "Horizontal scroll" y "Cursor trail" en tecnicas especiales.
- Reduced motion: custom cursor desactivado, counters sin animacion.
- 3 tecnicas nuevas en catalogo: blur reveal, rotate in, elastic bounce.

---

### Resumen de cambios

| Template | Campos agregados | Campos corregidos | Secciones nuevas | Checklist items nuevos |
|----------|-----------------|-------------------|-----------------|----------------------|
| design-brief | 12 | 5 | 1 (Image treatment) | 6 |
| content-brief | 14 | 4 | 0 | 6 |
| page-plans | 2 propositos + 2 page types | 0 | 2 (Blog listing, Blog article) + expansion de todas las paginas | 3 |
| motion-spec | 9 | 3 | 0 | 5 |
| **TOTAL** | **37** | **12** | **3** | **20** |

### Conclusion

Los templates originales tenian buena estructura base pero pecaban de ser esqueleticos donde mas importa. La friccion principal no estaba en campos individuales sino en la falta de slots pre-estructurados que fuercen completitud. El page-plans era el caso mas grave: decia "minimo 8 secciones" pero solo templaba 4. Los templates ahora estan dimensionados para que el llenado sea guiado y completo sin dejar gaps.

---

## FASE 1 — Core Optimization (2026-03-28)

### Task 1: claude-md-optimization ✅

**Cambios aplicados:**

1. **Regla principal movida al top** — Las 5 reglas criticas (design-first, content-first, identidad unica, 3D siempre, variacion de animacion) ahora son lo PRIMERO que Claude lee.

2. **Contradiccion threejs-3d resuelta** — El pipeline tenia threejs-3d en paso 3 (lista) pero paso 5 (tabla). Unificado a paso 5 en ambos: creative-design → page-scaffold → vue-component → gsap-motion → threejs-3d → quality.

3. **Motion defaults → emergency fallbacks** — Renombrado de "defaults - el cliente puede customizar" a "emergency fallbacks". Ahora dice explicitamente: "se usan SOLO si docs/motion-spec.md no existe". El motion-spec del proyecto es la fuente de verdad.

4. **Response extraction ampliada** — Agregadas entidades Menu y Media a la tabla (10 → 11 entities).

5. **Anti-patterns comprimidos** — De 2 tablas (15 rows) a 2 parrafos densos. Misma info, ~50% menos tokens.

6. **Arquitectura consolidada** — Backend y frontend merged en una seccion "Arquitectura (locked)" con subsecciones. Reglas inviolables unificadas en lista unica.

7. **Global CLAUDE.md limpiado** — Eliminada duplicacion de response extraction, pipeline Pegasuz detallado, y anti-patterns extensos. El global ahora tiene solo reglas universales y delega al project CLAUDE.md para detalles.

8. **skill-dispatch-table.md actualizado** — Agregado entry point new-project. Pipeline reordenado para coincidir con CLAUDE.md.

**Metricas:**
- CLAUDE.md proyecto: ~390 → ~310 lineas (reduccion ~20%)
- CLAUDE.md global: ~100 → ~75 lineas (reduccion ~25%)

---

## Cross-Skill Consistency Check (2026-03-28)

### Scope

Verified all 14 skills in `.claude/skills/*/SKILL.md` against `CLAUDE.md` as source of truth, checking 6 dimensions: architecture chain, naming conventions, CSS tokens, motion defaults, pipeline order, and docs references.

### Findings and Fixes Applied

#### 1. PIPELINE ORDER — threejs-3d position corrected (CRITICAL)

**Problem:** CLAUDE.md pipeline table had threejs-3d at step 5 and vue-component at step 3. But `pegasuz-frontend-executor` and `new-project` both place threejs-3d at step 3 (before vue-component). A previous audit (same day) incorrectly unified to step 5.

**Correct order per pegasuz-frontend-executor:**
```
creative-design -> page-scaffold -> threejs-3d -> vue-component -> gsap-motion -> audits
```

**Rationale (from pegasuz-frontend-executor):** "threejs-3d runs BEFORE vue-component so that 3D canvases are established before component styling. The 3D layer is foundational atmosphere, not a final add-on."

**Fixed in:**
- `CLAUDE.md` — Pipeline table: threejs-3d moved from step 5 to step 3, vue-component to step 4, gsap-motion to step 5. Added clarifying note about 3D being foundational.
- `guides/skill-dispatch-table.md` — Same reorder + explanatory note added.

#### 2. page-scaffold — docs/page-plans.md now primary input (MEDIUM)

**Problem:** page-scaffold intro said "This skill requires a Design Brief from creative-design as input" — but `docs/page-plans.md` is the actual blueprint for section architecture. The brief provides visual language, page-plans provides the blueprint.

**Fixed in:**
- `.claude/skills/page-scaffold/SKILL.md` — Intro now says both `docs/page-plans.md` and `docs/design-brief.md` are required inputs. Section header renamed to "Page Plans + Design Brief (MANDATORY)". Phase 1 instructions now read page-plans first, then design-brief, then content-brief and motion-spec.

#### 3. gsap-motion — docs/motion-spec.md now primary source (MEDIUM)

**Problem:** gsap-motion referenced "Motion docs: Glob for docs/motion*, docs/animation*, docs/design*" as a generic search, and said "If creative-design produced a brief, read the Motion Choreography section" — treating motion-spec.md as an afterthought. Per CLAUDE.md, `docs/motion-spec.md` IS the source of truth.

**Fixed in:**
- `.claude/skills/gsap-motion/SKILL.md` — Opening statement now explicitly names `docs/motion-spec.md` as primary source. Phase 1 point 4 reads motion-spec.md first. Point 7 reads design-brief as complement.

#### 4. skill-dispatch-table.md — new-project entry already present (NO FIX NEEDED)

The entry point section already had new-project listed correctly.

### Consistency Matrix — Final State

| Dimension | Status | Notes |
|-----------|--------|-------|
| Architecture (View->Store->Service->API) | CONSISTENT | All skills respect the chain. No shortcuts suggested. |
| Naming (kebab-case routes, snake_case DB, camelCase functions) | CONSISTENT | Defined in CLAUDE.md, no contradictions in skills. |
| CSS Tokens | CONSISTENT | creative-design produces tokens, page-scaffold + vue-component consume them. All reference "from brief" pattern. |
| Motion fallbacks | CONSISTENT | CLAUDE.md labels them "emergency fallbacks" (SOLO si motion-spec no existe). gsap-motion now reads motion-spec.md first. No skill hardcodes values as defaults. |
| Pipeline order | NOW CONSISTENT | All 4 sources agree: creative-design(1) -> page-scaffold(2) -> threejs-3d(3) -> vue-component(4) -> gsap-motion(5) -> audits(6). |
| Docs references | NOW CONSISTENT | page-scaffold reads page-plans.md + design-brief.md. gsap-motion reads motion-spec.md. creative-design writes design-brief.md. All skills read from docs/. |

### No Issues Found In

- **a11y-audit, seo-audit, css-review, responsive-review, perf-check** — Pure audit skills, no construction contradictions possible.
- **find-code, vue-composable** — Utility skills, architecture-neutral.
- **new-project** — Already had correct pipeline order.
- **pegasuz-frontend-executor** — Was the source of truth for correct pipeline order.
- **creative-design** — Correctly produces to docs/design-brief.md. No pipeline contradictions.
- **threejs-3d** — Correctly references design brief, prefers-reduced-motion respected.
- **vue-component** — Correctly reads brief for all visual decisions. No shortcuts.
