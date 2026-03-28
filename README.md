# Maqueta Pegasuz V2

Maqueta maestra reutilizable para crear proyectos web profesionales con Vue 3, GSAP, Three.js y la plataforma Pegasuz Core.

## Que es esto

Un template completo con todo lo necesario para arrancar un proyecto nuevo desde cero: estructura de carpetas, skills de Claude Code, agentes especializados, templates de documentacion, biblioteca de prompts, catalogo de inspiracion y guias de proceso.

Cada proyecto que sale de esta maqueta tiene **identidad visual unica** — paleta, tipografia, atmosfera y motion propios.

## Como arrancar un proyecto nuevo

```
iniciar un nuevo proyecto
```

Esto activa el wizard interactivo que guia todo el proceso creativo:
1. Discovery (rubro, audiencia, inspiracion)
2. Identidad visual (paleta, tipografia, atmosfera)
3. Paginas y secciones (conceptos creativos por seccion)
4. Contenido y copy
5. Personalidad de motion
6. Generacion de docs/ y arranque del pipeline

## Estructura

```
maqueta/
  .claude/
    agents/         7 agentes especializados
    skills/         Skills de construccion + wizard
    memory/         Estado y contexto persistente
    settings.json   Hooks y configuracion
  docs/
    _templates/     4 templates: design-brief, content-brief, page-plans, motion-spec
  prompts/          Biblioteca por fase (00-discovery -> 07-quality)
  inspiration/      Catalogo: sites, patterns, motion, 3d
  guides/           Guias de proceso completas
  _project-scaffold/  Estructura Vue 3 base
  CLAUDE.md         Arquitectura + dispatch de skills
```

## Stack

- Vue 3 (Composition API, `<script setup>`)
- Vite
- Vue Router (history mode, lazy loading)
- Pinia
- GSAP 3 + ScrollTrigger
- Three.js / TresJS
- Lenis (smooth scroll)
- CSS Custom Properties

## Reglas

- **Design-first**: sin brief no hay codigo
- **Content-first**: copy antes que visual
- **Identidad unica**: nunca reutilizar paleta/tipo/motion
- **3D siempre**: Tier 1 minimo (shader o particulas)
- **Variacion de animacion**: cada seccion usa tecnica diferente
- **prefers-reduced-motion**: siempre respetado

## Pegasuz Core

Para proyectos multi-tenant, la arquitectura es:

```
View -> Pinia Store -> Service -> api.js -> Pegasuz Core API (x-client header)
```

Sin atajos. Tenant isolation en cada cambio.
