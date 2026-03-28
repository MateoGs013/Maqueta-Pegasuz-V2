# Guide: Quality Standards

> Estandares de calidad que cada proyecto debe cumplir.
> **Contexto:** Cada proyecto Maqueta Pegasuz apunta a calidad award-level.
> **Relacion:** Los checks de esta guia se ejecutan en Phase 7 del [pipeline](01-pipeline-overview.md).

---

## Nivel de referencia

Cada proyecto debe poder competir en Awwwards, FWA, o CSS Design Awards.
No en terminos de experimentalidad, sino en terminos de:
- **Craft:** atencion al detalle en cada pixel
- **UX:** claridad, flujo, conversion
- **Performance:** rapido, optimizado, accesible
- **Originalidad:** identidad propia, no template

---

## Las 6 auditorias (cadena de calidad)

Ejecutar en este orden despues de construir. Cada auditoria tiene su skill dedicado.

```
CADENA DE CALIDAD:

  1. pegasuz-validation-qa   <- Solo si es Pegasuz (5 layers de integracion)
         |
         v
  2. a11y-audit              <- Accesibilidad WCAG 2.1 AA
         |
         v
  3. seo-audit               <- Meta tags, JSON-LD, headings, OG
         |
         v
  4. responsive-review       <- Mobile 375px, tablet 768px, desktop 1280px+
         |
         v
  5. css-review              <- Tokens, spacing, consistencia visual
         |
         v
  6. perf-check              <- Bundle size, imagenes, lazy loading, Core Web Vitals
```

### Auditoria 1: `pegasuz-validation-qa` (solo Pegasuz)

**Skill:** `pegasuz-validation-qa`
**Que revisa:** Integracion backend-frontend en 5 layers.

```
Layer 1: API       -> Endpoints responden, x-client presente
Layer 2: Service   -> Solo importa de api.js, tiene getAll/getById
Layer 3: Store     -> loading/error state, extraction correcta
Layer 4: View      -> Loading/error UI, resolveImageUrl, datos reales
Layer 5: Route     -> History mode, lazy loading, scrollBehavior
```

**Ejemplo de uso:**
```
Prompt: "Ejecutar pegasuz-validation-qa"

Output tipico:
  CRITICAL: postStore extrae data en vez de data.posts
  CRITICAL: PropertyView no tiene error state
  WARNING: menuService falta getById()
  PASS: API layer (5/5 endpoints OK)
```

### Auditoria 2: `a11y-audit`

**Skill:** `a11y-audit`
**Que revisa:** Accesibilidad WCAG 2.1 AA.

```
Checks:
  - Semantica HTML (header, main, nav, section, article)
  - ARIA attributes (roles, labels, live regions)
  - Keyboard navigation (tab order, focus visible, skip-to-content)
  - Contraste de color (4.5:1 texto normal, 3:1 texto grande)
  - Alt text en imagenes
  - Form labels
  - prefers-reduced-motion respetado
```

**Ejemplo de uso:**
```
Prompt: "Ejecutar a11y-audit"

Output tipico:
  CRITICAL: Hero image sin alt text
  CRITICAL: Contraste 2.8:1 en .subtitle (necesita 4.5:1)
  WARNING: Nav no tiene aria-label
  SUGGESTION: Agregar skip-to-content link
```

### Auditoria 3: `seo-audit`

**Skill:** `seo-audit`
**Que revisa:** SEO tecnico y contenido.

```
Checks:
  - Title unico por pagina (50-60 chars)
  - Meta description unica (150-160 chars)
  - Open Graph tags (og:title, og:description, og:image, og:type)
  - JSON-LD structured data (Organization, LocalBusiness, etc.)
  - H1 unico por pagina
  - Heading hierarchy sequencial (h1 > h2 > h3, no saltos)
  - Canonical URLs
  - Alt text en imagenes
  - Sitemap.xml y robots.txt
```

**Ejemplo de uso:**
```
Prompt: "Ejecutar seo-audit"

Output tipico:
  CRITICAL: Home page sin meta description
  CRITICAL: Blog posts sin JSON-LD Article
  WARNING: About page tiene 2 h1
  SUGGESTION: Agregar og:image a todas las paginas
```

### Auditoria 4: `responsive-review`

**Skill:** `responsive-review`
**Que revisa:** Comportamiento en todos los breakpoints.

```
Breakpoints verificados:
  - 375px   (mobile, iPhone SE)
  - 768px   (tablet, iPad)
  - 1024px  (tablet landscape)
  - 1280px  (desktop)
  - 1440px+ (desktop grande)

Checks por breakpoint:
  - Contenido no se sale del viewport
  - Tipografia escala correctamente (clamp)
  - Grids se adaptan (1 col mobile, 2-3 col desktop)
  - Imagenes escalan (max-width: 100%)
  - Navigation es usable (hamburger en mobile)
  - Touch targets >= 44px en mobile
  - Spacing se adapta
```

**Ejemplo de uso:**
```
Prompt: "Ejecutar responsive-review"

Output tipico:
  CRITICAL: Service cards overflow en 375px
  CRITICAL: Hero text ilegible en mobile (font-size fijo)
  WARNING: Footer grid no colapsa en 768px
  SUGGESTION: Reducir padding en sections para mobile
```

### Auditoria 5: `css-review`

**Skill:** `css-review`
**Que revisa:** Consistencia del sistema de diseno.

```
Checks:
  - Todos los colores usan tokens (no hex hardcodeado)
  - Tipografia usa tokens (no font-size fijo)
  - Spacing usa tokens (no px random)
  - No animar width/height/top/left (solo transform y opacity)
  - No will-change preventivo
  - Tokens definidos coinciden con design-brief.md
  - No hay valores repetidos que deberian ser tokens
```

**Ejemplo de uso:**
```
Prompt: "Ejecutar css-review"

Output tipico:
  CRITICAL: 12 valores hex hardcodeados (deberian ser tokens)
  CRITICAL: .card anima height en vez de transform
  WARNING: --space-section no esta definido pero se usa
  SUGGESTION: Consolidar 3 grays similares en un solo token
```

### Auditoria 6: `perf-check`

**Skill:** `perf-check`
**Que revisa:** Performance y Core Web Vitals.

```
Checks:
  - LCP < 2.5s (Largest Contentful Paint)
  - FID < 100ms (First Input Delay)
  - CLS < 0.1 (Cumulative Layout Shift)
  - Imagenes: lazy loaded, con width/height, formato optimizado
  - Routes: lazy loaded (import(() => import('./views/X.vue')))
  - 3D/GSAP: lazy loaded si estan below the fold
  - Fonts: preloaded
  - Bundle size razonable (< 200KB initial JS)
  - No loops decorativos infinitos
```

**Ejemplo de uso:**
```
Prompt: "Ejecutar perf-check"

Output tipico:
  CRITICAL: Hero image 3.2MB sin optimizar
  CRITICAL: All routes static imported (no lazy loading)
  WARNING: Three.js loaded on every page (should be lazy)
  SUGGESTION: Preload display font for faster LCP
```

---

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

| Level | Significado | Accion | Ejemplo |
|-------|-----------|--------|---------|
| **BLOCKING** | El sitio no funciona | Arreglar AHORA | JS error que rompe la pagina |
| **CRITICAL** | Violacion de estandar | Arreglar antes de entregar | Imagen sin alt, contraste < 4.5:1 |
| **WARNING** | Suboptimo pero funcional | Arreglar si hay tiempo | Nav sin aria-label |
| **SUGGESTION** | Mejora nice-to-have | Backlog | Preload hint para font |

**Gate de entrega:** 0 BLOCKING + 0 CRITICAL = puede entregarse.

---

## Relacion con otras guias

- [01-pipeline-overview](01-pipeline-overview.md) -- Phase 7 es donde se ejecutan estas auditorias
- [05-delivery-checklist](05-delivery-checklist.md) -- Checklist final que verifica todo esto
- [06-troubleshooting](06-troubleshooting.md) -- Soluciones a problemas encontrados en auditorias
- [skill-dispatch-table](skill-dispatch-table.md) -- Skills de auditoria
