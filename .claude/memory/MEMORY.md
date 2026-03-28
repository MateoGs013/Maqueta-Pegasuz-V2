# Memory — Pegasuz Maqueta V2

## Qué es esta carpeta

**Maqueta maestra** — template reutilizable para crear proyectos nuevos (Pegasuz multi-tenant o Vue 3 independiente). Cada proyecto nuevo parte de esta base.

## Estado actual

Repo: https://github.com/MateoGs013/Maqueta-Pegasuz-V2
Versión: 2.0
Última actualización: 2026-03-28

## Scheduled Tasks pendientes

Hay 16 scheduled tasks en `.claude/scheduled-tasks/` listas para ejecutar. Cada una tiene su SKILL.md con el prompt completo. Ejecutar en este orden:

### Fase 1 — Auditoría y consistencia (ejecutar primero, se pueden paralelizar)
1. `cross-skill-consistency-check` — Verificar que todos los skills usen mismas convenciones
2. `skill-optimization-audit` — Optimizar cada SKILL.md (triggers, instrucciones, output)
3. `scaffold-validation-test` — Validar que _project-scaffold compile como Vue 3 real
4. `agent-completeness-review` — Revisar y mejorar los 7 agentes
5. `doc-templates-stress-test` — Testear los 4 templates con proyecto ficticio
6. `new-project-wizard-dry-run` — Validar flujo del wizard, fonts, paletas

### Fase 2 — Mejoras de contenido
7. `prompt-library-quality-review` — Mejorar los 24 prompts con ejemplos y anti-patterns
8. `pegasuz-skills-deep-review` — Auditar pipeline Pegasuz end-to-end
9. `guides-completeness-rewrite` — Reescribir guías como tutoriales autocontenidos
10. `claude-md-optimization` — Reducir tokens del CLAUDE.md (-50%+)
11. `memory-system-improvement` — Crear active-projects.md y lessons-learned.md
12. `inspiration-catalog-expansion` — Investigar tendencias 2025-2026, agregar rubros

### Fase 3 — Nuevas features
13. `create-project-review-skill` — Crear skill para auditar proyectos existentes
14. `design-system-research` — Investigar y crear micro design system base

### Fase 4 — Los 10 sitios demo (DESPUÉS de todo lo anterior)
15. `create-10-demo-sites` — 10 proyectos completos en C:\Users\mateo\Desktop\

### Fase 5 — Critique (DESPUÉS de los 10 sitios)
16. `awwwards-design-critique` — Iterar cada sitio hasta score ≥ 9.0/10

## Hallazgos de auditorías previas (aplicar al re-ejecutar)

Estos hallazgos fueron descubiertos por agentes que corrieron y fueron revertidos. Las tasks los van a re-descubrir y aplicar:

- `new-project` SKILL.md no tiene YAML frontmatter → invisible al matching
- `page-scaffold` no referencia `docs/page-plans.md`
- `gsap-motion` no lee `docs/motion-spec.md` como fuente primaria
- CLAUDE.md tiene contradicción threejs-3d paso 3 vs paso 5
- CLAUDE.md motion defaults se contradicen con regla de "nunca defaultear"
- Pipeline integrator no registra normalization skill
- Feature-binding sin tabla consolidada de response extraction
- Frontend-executor sin tenant checks en pre-QA
- Normalization faltan AP-16 y AP-17
- `skill-dispatch-table.md` no tiene el entry point `new-project`

## Reglas permanentes

- **Design-first**: sin brief no hay código
- **Content-first**: copy antes que visual
- **Identidad única**: nunca reutilizar paleta/tipo/motion de otro proyecto
- **3D siempre**: Tier 1 mínimo (shader atmosférico o partículas)
- **Variación de animación**: cada sección usa técnica diferente
- **Pegasuz**: View → Store → Service → API. Sin atajos.
- **prefers-reduced-motion**: siempre respetado

## Estructura

```
maqueta/
  .claude/
    agents/              7 agentes especializados
    skills/              20+ skills de construcción + wizard
    scheduled-tasks/     16 tasks para ejecución batch
    memory/              MEMORY.md + current-state.md
    settings.json        Hooks y configuración
  docs/_templates/       4 templates: design-brief, content-brief, page-plans, motion-spec
  prompts/               Biblioteca por fase: 00-discovery → 07-quality
  inspiration/           Catálogo: sites/ patterns/ motion/ 3d/
  guides/                Guías de proceso completas
  _project-scaffold/     Estructura Vue 3 base
  CLAUDE.md              Arquitectura locked + dispatch de skills
```
