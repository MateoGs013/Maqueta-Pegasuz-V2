# Guide: Delivery Checklist

> Checklist final antes de considerar un proyecto terminado.

---

## Pre-delivery

### Docs completos
- [ ] `docs/design-brief.md` existe y esta lleno
- [ ] `docs/content-brief.md` existe y esta lleno
- [ ] `docs/page-plans.md` existe y esta lleno
- [ ] `docs/motion-spec.md` existe y esta lleno
- [ ] No quedan placeholders `{{}}` en ningun doc

### Auditorias ejecutadas
- [ ] `a11y-audit` ejecutado — 0 CRITICAL
- [ ] `seo-audit` ejecutado — 0 CRITICAL
- [ ] `responsive-review` ejecutado — 0 CRITICAL
- [ ] `css-review` ejecutado — 0 CRITICAL
- [ ] `perf-check` ejecutado — 0 CRITICAL
- [ ] `pegasuz-validation-qa` ejecutado (si aplica) — 0 CRITICAL

### Funcionalidad
- [ ] Todas las paginas cargan sin errores
- [ ] Datos reales (no mock data, a menos que sea deliberado)
- [ ] Formularios funcionan end-to-end
- [ ] Links internos verificados
- [ ] Links externos abren en nueva tab
- [ ] 404 page implementada

### Visual
- [ ] Design tokens aplicados (no valores hardcodeados)
- [ ] Responsive: 375px, 768px, 1280px, 1440px+ verificados
- [ ] Imagenes optimizadas y con dimensiones
- [ ] Favicon instalado

### Motion
- [ ] Hero timeline funciona en carga limpia
- [ ] Scroll reveals en todas las secciones
- [ ] Hover interactions en todo lo clickeable
- [ ] prefers-reduced-motion: todo off
- [ ] GSAP cleanup en todos los componentes

### 3D
- [ ] Al menos 1 elemento 3D (Tier 1 minimo)
- [ ] Fallback CSS para no-WebGL
- [ ] Fallback para reduced-motion
- [ ] Mobile: version simplificada o desactivada
- [ ] Canvas dispose en unmount

### Pegasuz (si aplica)
- [ ] x-client header en todas las requests
- [ ] 0 slugs hardcodeados en source
- [ ] View -> Store -> Service -> API chain intacta
- [ ] Zero Omission Rule: todos los campos mapeados
- [ ] resolveImageUrl() en todas las imagenes
- [ ] CMS content separado de feature data

---

## Sign-off

| Area | Status | Reviewer |
|------|--------|---------|
| Visual | [ ] Pass | |
| UX | [ ] Pass | |
| Motion | [ ] Pass | |
| Performance | [ ] Pass | |
| SEO | [ ] Pass | |
| A11y | [ ] Pass | |
| Pegasuz | [ ] Pass / N/A | |

**Entregable cuando todas las areas estan en Pass.**
