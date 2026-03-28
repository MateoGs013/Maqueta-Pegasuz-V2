# Memory — Pegasuz Maqueta

## Qué es esta carpeta

**Maqueta maestra** — template reutilizable para crear proyectos nuevos (Pegasuz multi-tenant o Vue 3 independiente). Cada proyecto nuevo parte de esta base.

## Entry point para proyecto nuevo

Decir: **"iniciar un nuevo proyecto"** → activa el wizard `/new-project`

El wizard conduce un proceso creativo interactivo completo:
- Discovery (rubro, audiencia, inspiración URLs, anti-referencias)
- Identidad visual (paleta nombrada, tipografía, atmósfera con opciones vividas)
- Sección por sección de cada página (3-4 conceptos creativos por sección)
- Copy y voz de marca
- Personalidad de motion
- Output: 4 foundation docs en `docs/` + arranque del pipeline

## Estructura de la maqueta

```
maqueta/
  .claude/
    agents/           design-critic, motion-director, ux-reviewer, binding-auditor,
                      tenant-safety-guard, seo-content-architect, domain-expert
    skills/           Todas las skills + new-project wizard
    memory/           MEMORY.md + current-state.md
    settings.json     Hooks: PEGASUZ CHECK, BINDING CHECK, CHECKLIST al cierre
    settings.local.json  Permisos bypassPermissions amplios
  docs/
    _templates/       4 templates: design-brief, content-brief, page-plans, motion-spec
  prompts/            Biblioteca por fase: 00-discovery → 07-quality
  inspiration/        Referencias: sites/ patterns/ motion/ 3d/
  guides/             Proceso: pipeline, design-first, pegasuz, quality, delivery
  _project-scaffold/  Estructura Vue 3 base para copiar
  CLAUDE.md           Arquitectura locked + dispatch de skills
```

## Reglas permanentes

- **Design-first**: sin brief no hay código
- **Content-first**: copy antes que visual
- **Identidad única**: nunca reutilizar paleta/tipo/motion de otro proyecto
- **3D siempre**: Tier 1 mínimo (shader atmosférico o partículas)
- **Variación de animación**: cada sección usa técnica diferente
- **Pegasuz**: View → Store → Service → API. Sin atajos.
- **prefers-reduced-motion**: siempre respetado

## Skills activos

| Trigger | Skill |
|---------|-------|
| "iniciar un nuevo proyecto" | `new-project` (wizard) |
| URL de inspiración | `creative-design` |
| Crear página | `page-scaffold` |
| 3D/WebGL | `threejs-3d` |
| Componente Vue | `vue-component` |
| Animaciones | `gsap-motion` |
| Onboarding Pegasuz | `pegasuz-integrator` |
| Auditoría | `a11y-audit`, `seo-audit`, `responsive-review`, `css-review`, `perf-check` |
