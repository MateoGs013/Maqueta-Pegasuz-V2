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

## Errores comunes en el proceso de auditoria

- **Ejecutar auditorias antes de que el sitio este funcional** - Si las paginas no cargan o tienen errores de consola, arreglar eso primero. Las auditorias asumen un sitio funcional.
- **Resolver WARNINGs antes de CRITICALs** - El orden importa. BLOCKING primero, CRITICAL segundo. Los WARNINGs pueden esperar.
- **No re-auditar despues de fixes** - Cada fix puede romper algo. Correr al menos una pasada rapida post-fix.
- **Auditorias sin contexto del design-brief** - El css-review necesita saber que tokens se definieron. El responsive-review necesita saber que breakpoints se decidieron. Sin contexto, la auditoria es generica.
- **Ignorar SUGGESTIONs sistematicamente** - Las sugerencias son el backlog de mejora continua. Si siempre se ignoran, la deuda tecnica se acumula.
- **No documentar los fixes** - Cada fix debe documentarse brevemente para evitar regresiones y para informar proyectos futuros.

## Tiempos estimados por auditoria

| Auditoria | Tiempo estimado | Depende de |
|-----------|----------------|-----------|
| pegasuz-validation-qa | 5-10 min | Cantidad de features |
| a11y-audit | 10-15 min | Cantidad de paginas |
| seo-audit | 5-10 min | Cantidad de paginas |
| responsive-review | 15-20 min | Complejidad de layouts |
| css-review | 10-15 min | Tamanho del CSS |
| perf-check | 5-10 min | Bundle size, imagenes |

Total estimado: 50-80 minutos para un sitio de 5 paginas.

## Conexion con el pipeline

```
audit-sequence.md (este) -> reportes de auditoria
  Lee de: TODO el proyecto (codigo, assets, config)
  Alimenta: ciclo de fixes -> re-auditoria -> entrega
  Cierra: el pipeline de construccion. Despues de 0 BLOCKING + 0 CRITICAL, el proyecto esta listo.
```

## Output esperado

Reportes de cada auditoria con plan de accion para cada issue.

## Ciclo de resolucion

```
1. Ejecutar cadena completa
2. Clasificar issues: BLOCKING > CRITICAL > WARNING > SUGGESTION
3. Resolver BLOCKINGs (si hay)
4. Re-auditar areas afectadas
5. Resolver CRITICALs
6. Re-auditar areas afectadas
7. Verificar 0 BLOCKING + 0 CRITICAL
8. Documentar WARNINGs + SUGGESTIONs como backlog
9. Proyecto listo para entrega
```
