# Prompt: Audit Sequence

> Fase: Quality | Output: Reportes de auditoria de todos los skills
> Ejecutar la cadena de calidad completa post-construccion.

---

## Prompt

```
Ejecuta la cadena de calidad completa para {{PROJECT_NAME}}.

ORDEN DE EJECUCION (estricto):

1. /pegasuz-validation-qa (si es cliente Pegasuz)
   - Zero Omission Rule: cada campo del API mapeado
   - 5 layers: API -> Service -> Store -> View -> Route
   - Output: defects table, field coverage, fix instructions

2. /a11y-audit
   - WCAG 2.1 AA compliance
   - Keyboard navigation
   - Screen reader compatibility
   - ARIA attributes
   - Color contrast
   - Output: findings con severity

3. /seo-audit
   - Meta tags por pagina
   - JSON-LD structured data
   - Heading hierarchy
   - OG tags
   - Canonical URLs
   - Output: findings por pagina

4. /responsive-review
   - Mobile (375px)
   - Tablet (768px)
   - Desktop (1280px)
   - Wide (1440px+)
   - Output: issues por breakpoint

5. /css-review
   - Tokens consistency
   - Spacing system
   - Color system usage
   - Typography scale
   - Output: deviations from design-brief

6. /perf-check
   - Bundle size
   - Image optimization
   - Lazy loading
   - Render blocking resources
   - Core Web Vitals estimate
   - Output: optimization opportunities

CRITERIO DE BLOQUEO:

| Severity | Accion |
|----------|--------|
| BLOCKING | Arreglar ANTES de cualquier otra cosa |
| CRITICAL | Arreglar antes de entregar |
| WARNING | Arreglar si hay tiempo, documentar si no |
| SUGGESTION | Backlog para mejora futura |

No considerar el proyecto terminado hasta que 0 BLOCKING y 0 CRITICAL.
```

---

## Output esperado

Reportes de cada auditoria con plan de accion para cada issue.
