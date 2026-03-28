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
