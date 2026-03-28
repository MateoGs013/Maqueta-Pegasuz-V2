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

## Ejemplo: buena vs mala ejecucion de auditoria

### Resultado de a11y-audit

**Mala:**
```
a11y: FAIL — some accessibility issues found.
```
(No dice cuales. No tiene severidad. No es actionable.)

**Buena:**
```
a11y-audit results — 7 findings:

CRITICAL:
1. HomeView.vue — Hero image (<img>) sin alt attribute.
   Fix: alt="Estudio de arquitectura Lumen — fachada del edificio principal"
2. ContactView.vue — Form inputs sin <label> asociado.
   Fix: agregar <label for="name"> y id="name" a cada input.

WARNING:
3. AppHeader.vue — Mobile hamburger button sin aria-label.
   Fix: aria-label="Abrir menu de navegacion"
4. ServicesView.vue — Heading jump: h1 -> h3 (falta h2).
   Fix: cambiar h3 a h2 en la seccion de servicios.

SUGGESTION:
5. Global — No hay skip-to-content link.
6. Global — Focus ring usa outline: none sin replacement visible.
7. PortfolioView.vue — Image gallery sin role="list" ni aria-label.
```
(Cada finding tiene severidad, ubicacion exacta, descripcion, y fix.)

---

## Errores comunes en el proceso de auditoria

- **Ejecutar auditorias antes de que el sitio este funcional** - Si las paginas no cargan o tienen errores de consola, arreglar eso primero. Las auditorias asumen un sitio funcional.
- **Resolver WARNINGs antes de CRITICALs** - El orden importa. BLOCKING primero, CRITICAL segundo. Los WARNINGs pueden esperar.
- **No re-auditar despues de fixes** - Cada fix puede romper algo. Correr al menos una pasada rapida post-fix.
- **Auditorias sin contexto del design-brief** - El css-review necesita saber que tokens se definieron. El responsive-review necesita saber que breakpoints se decidieron. Sin contexto, la auditoria es generica.
- **Ignorar SUGGESTIONs sistematicamente** - Las sugerencias son el backlog de mejora continua. Si siempre se ignoran, la deuda tecnica se acumula.
- **No documentar los fixes** - Cada fix debe documentarse brevemente para evitar regresiones y para informar proyectos futuros.
- **Ejecutar auditorias en orden incorrecto** - pegasuz-validation-qa primero (verifica que la cadena de datos funciona), luego a11y y seo (verifican el HTML output), despues responsive y css (verifican visual), y perf al final (el mas lento).
- **Arreglar un issue e introducir otro** - Si un fix de contraste cambia el color de un boton, verificar que el nuevo color funciona en hover, focus, y disabled states tambien.

---

## Issues frecuentes por industria

| Industria | a11y issues frecuentes | SEO issues frecuentes | Perf issues frecuentes |
|-----------|----------------------|---------------------|----------------------|
| Gastronomia | Menu images sin alt, carta PDF sin texto alternativo | Falta JSON-LD Restaurant, horarios no estructurados | Imagenes de platos sin optimizar (fotos de 5MB) |
| Inmobiliaria | Mapa sin keyboard nav, filtros sin aria-label | Falta JSON-LD RealEstateAgent/Place, cada propiedad sin canonical | Muchas imagenes de propiedades sin lazy loading |
| E-commerce | Product images sin alt descriptivo, carrito sin aria-live | Falta JSON-LD Product con price/availability, reviews sin markup | Product images sin WebP/AVIF, JavaScript bundle enorme |
| Fintech | Charts sin texto alternativo, datos tabulares sin scope | Falta JSON-LD FinancialService, FAQ sin markup | Heavy charts libraries sin lazy load |
| SaaS | Pricing table sin scope headers, toggle sin aria-label | Falta JSON-LD SoftwareApplication, FAQ page sin markup | Demo embeds sin lazy loading |

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
