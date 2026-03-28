# Process Guides

Documentacion del proceso completo para crear proyectos de calidad profesional con la maqueta Pegasuz V2.

Estas guias son **self-contained tutorials**: cada una se puede leer de forma independiente, pero se referencian entre si para profundizar temas.

## Guias disponibles

| # | Guia | Proposito |
|---|------|-----------|
| 00 | [project-init](00-project-init.md) | Como arrancar un proyecto nuevo desde cero |
| 01 | [pipeline-overview](01-pipeline-overview.md) | Pipeline completo paso a paso (8 fases) |
| 02 | [design-first](02-design-first.md) | Metodologia design-first explicada con ejemplos |
| 03 | [pegasuz-integration](03-pegasuz-integration.md) | Guia especifica para clientes Pegasuz (Phases 0-7) |
| 04 | [quality-standards](04-quality-standards.md) | Estandares de calidad, 6 auditorias, severity levels |
| 05 | [delivery-checklist](05-delivery-checklist.md) | Checklist final antes de entregar |
| 06 | [troubleshooting](06-troubleshooting.md) | Problemas comunes y como resolverlos |
| -- | [skill-dispatch-table](skill-dispatch-table.md) | Que skill usar para que tarea |

## Orden de lectura recomendado

```
Para desarrolladores nuevos:

  1. 00-project-init        Entender como arranca todo
          |
          v
  2. 01-pipeline-overview   Entender el flujo completo (8 fases)
          |
          v
  3. skill-dispatch-table   Saber que skill hace que
          |
          v
  4. 02-design-first        Entender la metodologia core
          |
          v
  5. 04-quality-standards   Conocer las auditorias y severity levels
          |
          v
  6. 05-delivery-checklist  Saber que se necesita para entregar
          |
          v
  7. 06-troubleshooting     Referencia cuando algo no funciona
```

Si el proyecto es un cliente Pegasuz, leer tambien `03-pegasuz-integration.md` despues de `01-pipeline-overview.md`.

## Prerequisitos

- Node.js 18+
- Familiaridad basica con Vue 3 (Composition API, `<script setup>`)
- Familiaridad basica con Git

## Relacion con otros archivos del proyecto

| Archivo | Relacion con las guias |
|---------|----------------------|
| `CLAUDE.md` | Reglas y constraints que estas guias explican en detalle |
| `docs/_templates/` | Templates que se llenan durante el proceso de `00-project-init` |
| `prompts/` | Prompt library usada en cada fase del pipeline |
| `.claude/skills/` | Skills invocables referenciados en `skill-dispatch-table` |
| `.claude/agents/` | Agentes especializados listados en `skill-dispatch-table` |
| `_project-scaffold/` | Scaffold base que se copia al iniciar un proyecto |
