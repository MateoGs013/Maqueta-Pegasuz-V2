# Guide: Quality Standards

> Estandares de calidad que cada proyecto debe cumplir.

---

## Nivel de referencia

Cada proyecto debe poder competir en Awwwards, FWA, o CSS Design Awards.
No en terminos de experimentalidad, sino en terminos de:
- **Craft:** atencion al detalle en cada pixel
- **UX:** claridad, flujo, conversion
- **Performance:** rapido, optimizado, accesible
- **Originalidad:** identidad propia, no template

## Criterios por area

### Visual (el sitio se VE premium)
- [ ] Paleta unica y coherente, no generica
- [ ] Tipografia seleccionada con intencion
- [ ] Spacing generoso y consistente (tokens)
- [ ] Imagenes tratadas con calidad (no stock generico)
- [ ] Jerarquia visual clara en cada seccion
- [ ] Atmosfera palpable (textura, luz, profundidad)

### UX (el sitio se USA bien)
- [ ] Mensaje claro en 3 segundos
- [ ] Navegacion intuitiva (2 clicks al objetivo)
- [ ] Loading states (no pantallas blancas)
- [ ] Error states (no errores crudos)
- [ ] Mobile-first (no afterthought)
- [ ] CTAs con contexto y progresion

### Motion (el sitio se SIENTE vivo)
- [ ] Personalidad de motion definida (no default)
- [ ] Cada seccion con tecnica diferente
- [ ] Hero timeline cinematico
- [ ] Hover interactions en todo lo interactivo
- [ ] prefers-reduced-motion respetado al 100%
- [ ] No animaciones en layout properties

### Performance (el sitio es RAPIDO)
- [ ] LCP < 2.5s
- [ ] FID < 100ms
- [ ] CLS < 0.1
- [ ] Images lazy loaded + optimized
- [ ] Routes lazy loaded
- [ ] 3D/GSAP lazy loaded si below fold
- [ ] Fonts preloaded

### SEO (el sitio se ENCUENTRA)
- [ ] Title + description unicos por pagina
- [ ] OG tags completos
- [ ] JSON-LD apropiado
- [ ] H1 unico, headings sequenciales
- [ ] Canonical URLs
- [ ] Alt text en imagenes

### Accessibility (el sitio es para TODOS)
- [ ] WCAG 2.1 AA compliance
- [ ] Keyboard navigable
- [ ] Screen reader compatible
- [ ] Contraste suficiente (4.5:1)
- [ ] Focus visible
- [ ] Skip to content

---

## Severity levels

| Level | Significado | Accion |
|-------|-----------|--------|
| **BLOCKING** | El sitio no funciona | Arreglar AHORA |
| **CRITICAL** | Violacion de estandar | Arreglar antes de entregar |
| **WARNING** | Suboptimo pero funcional | Arreglar si hay tiempo |
| **SUGGESTION** | Mejora nice-to-have | Backlog |

**Gate de entrega:** 0 BLOCKING + 0 CRITICAL = puede entregarse.
