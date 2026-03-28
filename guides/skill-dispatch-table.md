# Guide: Skill Dispatch Table

> Que skill usar para que tarea. Referencia rapida.
> **Contexto:** Estos skills se invocan via prompt en Claude Code.
> **Fuente de verdad:** `CLAUDE.md` > Dispatch de skills.

---

## Entry point -- Proyecto nuevo

| Necesito... | Skill | Trigger phrases |
|-------------|-------|-----------------|
| Crear un proyecto desde cero | `new-project` | "nuevo proyecto", "crear proyecto", "/new-project" |

**Este es el entry point de CUALQUIER proyecto nuevo.** No arrancar a codear sin pasar por este wizard.

```
Ejemplo de uso:
  Prompt: "Iniciar nuevo proyecto para restaurante italiano"
  -> El skill new-project arranca el wizard interactivo
  -> Discovery -> identidad visual -> secciones -> copy -> motion
  -> Genera docs/ -> arranca pipeline
```

> Ver [00-project-init](00-project-init.md) para el proceso completo.

---

## Skills de construccion (pipeline estricto)

Orden obligatorio. Cada paso depende del anterior. Sin brief, no hay construccion.

| Paso | Skill | Input | Output | Trigger phrases |
|------|-------|-------|--------|-----------------|
| 1 | `creative-design` | Estetica, rubro, inspiracion | `docs/design-brief.md` + tokens CSS | "paleta", "tipografia", "atmosfera", "design like", "inspiracion" |
| 2 | `page-scaffold` | `docs/page-plans.md` + tokens | Paginas con N secciones | "new page", "scaffold page", "nueva pagina" |
| 3 | `threejs-3d` | `docs/design-brief.md` atmosfera | Escena WebGL (Tier 1 min) | "3D", "shader", "particulas", "WebGL" |
| 4 | `vue-component` | Tokens + page structure | Componentes .vue | "componente", "card", "seccion", "widget" |
| 5 | `vue-composable` | Logica compartida | Composables useX() | "composable", "useX", "logica compartida" |
| 6 | `gsap-motion` | `docs/motion-spec.md` | Animaciones GSAP | "animacion", "scroll", "parallax", "hover" |

```
Flujo de construccion:

  creative-design ──> page-scaffold ──> threejs-3d ──> vue-component ──> gsap-motion
       |                   |                |               |                |
  Design Brief        Estructura        Canvas 3D      Componentes     Animaciones
  + tokens CSS        HTML + layout     atmosferico     reutilizables   + motion
```

**Reglas:**
- `creative-design` siempre primero (sin brief no hay codigo)
- `threejs-3d` siempre se ejecuta (3D NO es opcional, Tier 1 minimo)
- `threejs-3d` va ANTES de `vue-component` porque el canvas 3D es atmosfera fundacional, no un add-on final
- Cada skill lee de `docs/` (no improvisar)

> Ver [01-pipeline-overview](01-pipeline-overview.md) para detalles de cada fase.
> Ver [02-design-first](02-design-first.md) para entender por que el orden importa.

---

## Skills de auditoria (cadena de calidad)

Ejecutar post-construccion. Corregir BLOCKING y CRITICAL antes de avanzar.

| # | Skill | Que revisa | Trigger phrases |
|---|-------|-----------|-----------------|
| 1 | `pegasuz-validation-qa` | 5 layers de integracion (solo Pegasuz) | "validar integracion", "QA" |
| 2 | `a11y-audit` | WCAG 2.1 AA, keyboard, ARIA, contraste | "accesibilidad", "a11y", "WCAG" |
| 3 | `seo-audit` | Meta tags, JSON-LD, headings, OG | "SEO", "meta tags", "JSON-LD" |
| 4 | `responsive-review` | Mobile 375px, tablet 768px, desktop | "responsive", "mobile", "tablet" |
| 5 | `css-review` | Tokens, spacing, colores, consistencia | "CSS review", "estilos", "spacing" |
| 6 | `perf-check` | Bundle, images, lazy loading, Web Vitals | "performance", "bundle", "optimize" |

```
Ejemplo de uso:
  Prompt: "Ejecutar a11y-audit"
  -> El skill revisa accesibilidad
  -> Output: lista de CRITICAL / WARNING / SUGGESTION
  -> Arreglar CRITICAL antes de entregar
```

Tambien existe:

| Skill | Que hace | Trigger phrases |
|-------|---------|-----------------|
| `find-code` | Buscar patterns, archivos, funciones en el codebase | "buscar", "donde esta", "find" |

> Ver [04-quality-standards](04-quality-standards.md) para detalles de cada auditoria.

---

## Skills Pegasuz (backend + orquestacion)

| Skill | Que hace | Cuando usar |
|-------|---------|-------------|
| `pegasuz-integrator` | Onboarding multi-fase (Phases 0-7) | Nuevo cliente completo |
| `pegasuz-backend-development` | Schema, controllers, endpoints, routes | Crear o modificar endpoints |
| `pegasuz-feature-binding` | Conectar API a frontend: Service -> Store -> View | Nuevo feature en frontend |
| `pegasuz-frontend-normalization` | Normalizar estructura frontend antes de binding | Antes de feature-binding |
| `pegasuz-validation-qa` | Validar integracion cross-layer (5 layers) | Post-binding, pre-entrega |
| `pegasuz-documentation-system` | Documentar cambios, features, decisiones | Post-entrega |
| `pegasuz-frontend-executor` | Orquestar frontend end-to-end (bridge backend-frontend) | Build features completas |

```
Ejemplo de onboarding completo:
  Prompt: "Onboarding nuevo cliente: Restaurante Nonna con menu, blog, galeria"
  -> pegasuz-integrator orquesta todo:
     Phase 0: Task breakdown
     Phase 1: POST /api/core-admin/clients
     Phase 2: Feature flags
     Phase 3: Verificar endpoints
     Phase 4: Scaffold frontend
     Phase 5: Feature binding + Foundation docs + UI
     Phase 6: Validation QA
     Phase 7: Documentation
```

> Ver [03-pegasuz-integration](03-pegasuz-integration.md) para el pipeline completo.

---

## Agentes disponibles

Los agentes son evaluadores especializados que se pueden invocar para feedback.

| Agente | Rol | Cuando invocar |
|--------|-----|---------------|
| `design-critic` | Evalua propuestas visuales | Despues de creative-design |
| `motion-director` | Revisa coreografia de motion | Despues de gsap-motion |
| `ux-reviewer` | Valida claridad y conversion | Antes de entregar |
| `binding-auditor` | Audita cadena View->Store->Service->API | Despues de feature-binding |
| `tenant-safety-guard` | Verifica aislamiento multi-tenant | En proyectos Pegasuz |
| `seo-content-architect` | Revisa SEO y estructura de contenido | Despues de seo-audit |
| `domain-expert` | Logica de negocio especifica del rubro | Durante discovery |

```
Ejemplo de uso:
  Prompt: "Invocar design-critic para evaluar la landing page"
  -> El agente revisa la propuesta visual contra el design-brief
  -> Output: feedback con mejoras sugeridas
```

---

## Pipeline completo (diagrama de referencia)

```
PROYECTO NUEVO
==============

  /new-project (wizard)
       |
       v
  DISCOVERY (prompts/00-discovery/)
       |
       v
  FOUNDATION DOCS (4 archivos en docs/)
       |
       +--> content-brief.md   (copy-framework prompt)
       +--> design-brief.md    (creative-design skill)
       +--> page-plans.md      (page-planning prompt)
       +--> motion-spec.md     (motion-personality prompt)
       |
       v
  CONSTRUCTION (skills en orden)
       |
       +--> creative-design    -> tokens CSS
       +--> page-scaffold      -> paginas con secciones
       +--> threejs-3d         -> escena WebGL
       +--> vue-component      -> componentes reutilizables
       +--> gsap-motion        -> animaciones
       |
       v
  QUALITY (6 auditorias)
       |
       +--> pegasuz-validation-qa  (si Pegasuz)
       +--> a11y-audit
       +--> seo-audit
       +--> responsive-review
       +--> css-review
       +--> perf-check
       |
       v
  DELIVERY (0 BLOCKING, 0 CRITICAL)
```

> Ver [05-delivery-checklist](05-delivery-checklist.md) para el checklist final.
