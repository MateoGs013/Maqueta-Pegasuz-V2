# Guide: Project Initialization

> Como arrancar un proyecto nuevo desde esta maqueta.

---

## Paso 1: Copiar la maqueta

```bash
# Opcion A: Copiar la carpeta completa
cp -r /path/to/maqueta /path/to/Clientes/<project-slug>

# Opcion B: Si es proyecto Pegasuz, la estructura esta en _project-scaffold/
cp -r /path/to/maqueta/_project-scaffold /path/to/Clientes/<project-slug>
```

## Paso 2: Discovery (prompts/00-discovery/)

1. Ejecutar `prompts/00-discovery/client-intake.md`
   - Entender el negocio, objetivos, estetica, contenido, tecnico
2. Ejecutar `prompts/00-discovery/competitive-analysis.md`
   - Analizar competidores, encontrar oportunidades
3. Ejecutar `prompts/00-discovery/brand-questionnaire.md`
   - Definir personalidad de marca, posicionamiento, analogias

**Output:** perfil completo del cliente y su marca

## Paso 3: Foundation Docs (docs/)

Copiar templates de `docs/_templates/` a `docs/`:

```bash
cp docs/_templates/content-brief.template.md docs/content-brief.md
cp docs/_templates/design-brief.template.md docs/design-brief.md
cp docs/_templates/page-plans.template.md docs/page-plans.md
cp docs/_templates/motion-spec.template.md docs/motion-spec.md
```

Llenar EN ESTE ORDEN (content-first):

1. **content-brief.md** — usando `prompts/02-content/copy-framework.md`
2. **design-brief.md** — usando `prompts/01-identity/design-direction.md` (activa `creative-design`)
3. **page-plans.md** — usando `prompts/03-architecture/page-planning.md`
4. **motion-spec.md** — usando `prompts/04-motion/motion-personality.md`

**Output:** 4 archivos en `docs/` completamente llenos, sin placeholders

## Paso 4: Implementacion

Si es proyecto Pegasuz: seguir `guides/03-pegasuz-integration.md`
Si es proyecto independiente: seguir `guides/01-pipeline-overview.md`

## Paso 5: Quality

Ejecutar la cadena de calidad completa: `prompts/07-quality/audit-sequence.md`

---

## Estructura final esperada

```
proyecto/
  docs/
    design-brief.md     <- Lleno, aprobado
    content-brief.md    <- Lleno, aprobado
    page-plans.md       <- Lleno, aprobado
    motion-spec.md      <- Lleno, aprobado
  src/                  <- Codigo implementado
  .env                  <- Variables de entorno
  package.json          <- Dependencias
  ...
```

## Regla de oro

NO ESCRIBIR CODIGO hasta que los 4 docs esten completos.
Los docs son el brief. El codigo es la ejecucion del brief.
