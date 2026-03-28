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

## Siguiente paso

Para cada FAIL, arreglar y re-ejecutar el checklist.
