# Foundation Docs

> Los 4 archivos que definen TODO antes de escribir codigo.
> Cada skill lee de estos archivos. Son la fuente de verdad.

## Archivos obligatorios

| Archivo | Que define | Quien lo produce | Template |
|---------|-----------|-----------------|---------|
| `content-brief.md` | Todo el copy del sitio | `copy-framework` prompt | `_templates/content-brief.template.md` |
| `design-brief.md` | Identidad visual, tokens | `creative-design` skill | `_templates/design-brief.template.md` |
| `page-plans.md` | Secciones por pagina | `page-planning` prompt | `_templates/page-plans.template.md` |
| `motion-spec.md` | Coreografia de animacion | `motion-personality` prompt | `_templates/motion-spec.template.md` |

## Orden de creacion (inviolable)

```
1. content-brief.md     <- Content FIRST (copy antes de visual)
2. design-brief.md      <- Identidad visual via creative-design
3. page-plans.md        <- Arquitectura de paginas
4. motion-spec.md       <- Coreografia de motion
5. RECIEN AHORA codear
```

## Como crear un doc

1. Copiar la template desde `_templates/`
2. Ejecutar el prompt correspondiente de `prompts/`
3. Llenar TODOS los campos (no dejar placeholders `{{}}`)
4. Verificar con el checklist al final de cada template

## Como usar los docs en cada decision

| Decision | Archivo fuente |
|----------|---------------|
| Que texto poner | `content-brief.md` |
| Que colores/tipografia | `design-brief.md` |
| Cuantas secciones, que layout | `page-plans.md` |
| Como animar | `motion-spec.md` |
| Que spacing/radii/shadows | `design-brief.md` |
| Responsive behavior | `design-brief.md` |

**No improvisar.** Los docs son el brief. El codigo es la ejecucion.
