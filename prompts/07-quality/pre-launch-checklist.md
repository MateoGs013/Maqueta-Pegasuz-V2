# Prompt: Pre-Launch Checklist

> Fase: Quality | Output: Reporte de estado pre-launch
> Ejecutar ANTES de considerar un proyecto terminado.

---

## Prompt

```
Ejecuta el checklist pre-launch completo para {{PROJECT_NAME}}.

## POR CADA PAGINA verificar:

### Funcional
- [ ] Carga correctamente (no errores en consola)
- [ ] Datos se renderizan desde el store (no hardcodeados)
- [ ] Loading state visible mientras carga
- [ ] Error state visible si falla la API
- [ ] Empty state si no hay datos
- [ ] Links internos funcionan (no 404)
- [ ] Links externos abren en nueva tab
- [ ] Formularios validan y envian
- [ ] Feedback al usuario post-submit (success/error)

### Visual
- [ ] Design tokens aplicados (no colores hardcodeados)
- [ ] Tipografia correcta (display, body, mono donde corresponde)
- [ ] Spacing consistente (usa tokens, no valores random)
- [ ] Imagenes cargan (con resolveImageUrl si Pegasuz)
- [ ] Imagenes tienen alt, width, height, lazy loading
- [ ] No hay overflow horizontal en ningún viewport
- [ ] Scrollbar no causa layout shift

### Motion
- [ ] Hero timeline funciona en primer carga
- [ ] Scroll reveals se activan correctamente
- [ ] Hover interactions en cards, buttons, links
- [ ] prefers-reduced-motion: todo desactivado
- [ ] No hay animaciones en layout properties (width, height, top, left)
- [ ] Cleanup: gsap.context + onBeforeUnmount

### Responsive
- [ ] Mobile (375px): legible, usable, no overflow
- [ ] Tablet (768px): layout adaptado
- [ ] Desktop (1280px): layout completo
- [ ] Wide (1440px+): no se estira innecesariamente

### SEO
- [ ] title tag unico y descriptivo
- [ ] meta description unica (120-160 chars)
- [ ] OG tags completos (title, description, image, url)
- [ ] Single h1 por pagina
- [ ] Heading hierarchy sequencial (h1 > h2 > h3)
- [ ] JSON-LD apropiado segun tipo de pagina
- [ ] canonical URL definida
- [ ] Imagenes con alt descriptivo

### Accessibility
- [ ] Navegacion por keyboard funciona (Tab, Enter, Escape)
- [ ] Focus visible en todos los interactivos
- [ ] Contraste WCAG AA (4.5:1 texto, 3:1 UI)
- [ ] aria-labels en iconos sin texto
- [ ] Skip to content link
- [ ] Landmarks semanticos (header, main, nav, footer)

### Performance
- [ ] Imagenes optimizadas (webp/avif, dimensiones correctas)
- [ ] Lazy loading en imagenes below-the-fold
- [ ] Code splitting (routes lazy loaded)
- [ ] No bloques de JS innecesarios en render path
- [ ] Three.js/GSAP lazy loaded si no son above-the-fold
- [ ] Fonts preloaded

### Pegasuz (si aplica)
- [ ] x-client header correcto en todas las requests
- [ ] No slugs hardcodeados en el codigo
- [ ] Feature flags verificados
- [ ] CMS content separado de feature data
- [ ] resolveImageUrl() en todas las imagenes
- [ ] View -> Store -> Service -> API sin atajos

## RESULTADO

| Area | Status | Issues |
|------|--------|--------|
| Funcional | PASS/FAIL | {{ISSUES}} |
| Visual | PASS/FAIL | {{ISSUES}} |
| Motion | PASS/FAIL | {{ISSUES}} |
| Responsive | PASS/FAIL | {{ISSUES}} |
| SEO | PASS/FAIL | {{ISSUES}} |
| A11y | PASS/FAIL | {{ISSUES}} |
| Performance | PASS/FAIL | {{ISSUES}} |
| Pegasuz | PASS/FAIL/N/A | {{ISSUES}} |

NO entregar si hay FAILs en Funcional, Visual, o Pegasuz.
```

---

## Ejemplo: buena vs mala ejecucion del checklist

### Reporte de area "Visual"

**Mala:**
```
| Visual | FAIL | Some issues |
```
(No dice que issues. No es actionable.)

**Buena:**
```
| Visual | FAIL | 3 issues |

Issues:
1. CRITICAL: HomeView.vue sec 3 — stats section usa font-size: 48px hardcodeado
   en vez de var(--text-h1). Fix: reemplazar con token.
2. WARNING: AboutView.vue sec 2 — imagen del equipo sin width/height attributes.
   Causa layout shift. Fix: agregar width="800" height="600".
3. WARNING: Footer — spacing entre columnas usa margin: 40px en vez de
   var(--space-10). Fix: reemplazar con token.
```
(Cada issue tiene severidad, ubicacion exacta, descripcion del problema, y fix.)

---

## Checklist items frecuentemente olvidados por industria

| Industria | Items extra a verificar |
|-----------|----------------------|
| Gastronomia | Horarios actualizados, carta/menu actualizado, reservas funcionales, Google Maps embed |
| Inmobiliaria | Filtros de busqueda funcionales, mapa interactivo, precios formateados, contacto por propiedad |
| E-commerce | Flujo de carrito completo, stock indicators, precios con formato local, guia de talles |
| Fintech | Simuladores funcionales, datos con formato monetario, disclaimers legales, SSL verificado |
| Salud | Horarios de atencion, telefono clickeable (tel:), HIPAA compliance si aplica, formulario de contacto seguro |
| SaaS | Pricing toggle funcional, demo/trial flow, integrations page, docs links |

---

## Common errors

- **Ejecutar checklist parcialmente.** Marcar PASS en "Motion" sin verificar prefers-reduced-motion es un falso positivo. Cada checkbox se verifica individualmente.
- **No testear en incognito.** Extensions de browser (ad blockers, CSS injecters) pueden alterar el sitio. Testear siempre en ventana privada.
- **Testear solo en Chrome.** Safari tiene quirks con GSAP, Firefox maneja fonts diferente. Testear en al menos 2 browsers.
- **Responsive testeado solo con DevTools.** DevTools emula viewport size pero no touch events, hover behavior, ni performance real. Testear en device fisico si es posible.
- **Asumir que el deploy se comporta como dev.** Build optimizations, CDN caching, y environment variables pueden cambiar comportamiento. Testear en staging post-build.
- **No verificar la primera visita.** Con cache caliente todo se ve rapido. Borrar cache y testear cold load — eso es lo que ve un usuario nuevo.
- **Olvidar los edge cases de contenido.** Que pasa si un servicio tiene un nombre de 80 caracteres? Que pasa si no hay testimonios? Que pasa si la imagen es vertical?

---

## Pipeline connection

```
Input: TODO el proyecto construido (views, components, stores, router)
     + docs/design-brief.md (tokens para verificar)
     + docs/content-brief.md (copy para verificar)
     + docs/motion-spec.md (animaciones para verificar)
Output de este prompt -> Reporte de estado con PASS/FAIL por area
  Alimenta:
    - Ciclo de fixes (arreglar FAILs)
    - audit-sequence.md (auditorias detalladas por skill)
    - Entrega final (solo si 0 FAILs en Funcional, Visual, Pegasuz)
```

## Siguiente paso

Para cada FAIL, arreglar y re-ejecutar el checklist.
Cuando todo pasa, ejecutar `audit-sequence.md` para auditorias detalladas.
