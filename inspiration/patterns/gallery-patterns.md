# UI Patterns: Gallery & Media

> Catalogo de patrones para mostrar imagenes y media.

---

## Tipos de galeria

### 1. Lightbox Classic
- Thumbnail grid -> click -> overlay fullscreen
- Navegacion con flechas, keyboard, swipe
- **Standard:** portfolios, real estate, productos

### 2. Inline Carousel
- Carousel horizontal dentro de la pagina
- Dots o arrows como indicadores
- Swipeable en mobile
- **Versatil:** testimonios, features, imagenes

### 3. Fullscreen Slider
- Slider a pantalla completa con transiciones
- Transition: fade, slide, clip-path
- **Impacto:** heroes, showcases principales

### 4. Masonry Gallery
- Grid de imagenes de tamaños variados
- Organico, visual-first
- **Creativo:** fotografia, arte, moodboards

### 5. Scroll-Triggered Sequence
- Imagenes que cambian con scroll
- Como un video frame-by-frame
- **Cinematico:** storytelling, case studies

### 6. Before/After Slider
- Comparacion side by side con slider draggable
- **Especifico:** renovaciones, retoque, comparaciones

---

## Patrones trending 2025-2026

### 7. Shader-Distorted Gallery
- Imagenes con shader de distorsion en hover (wave, chromatic aberration, pixel displacement)
- La imagen se "rompe" al hover y se recompone — efecto premium sin ser pesado
- **Implementar con:** Three.js plane mesh per image + custom fragment shader + mouse uniform
- **Mejor para:** portfolios creativos, agencies, fashion
- **Complejidad:** media (un shader reusable para todas las imagenes)

### 8. View Transition Gallery
- Thumbnail grid donde click transiciona la imagen a fullscreen via View Transitions API
- Shared element animation nativa del browser — la imagen "crece" de la thumbnail a hero
- **Implementar con:** CSS `view-transition-name` per image + `document.startViewTransition()` + Vue Router
- **Mejor para:** cualquier galeria, e-commerce product grids, portfolio
- **Complejidad:** baja (CSS + una linea de JS), degradacion graceful en browsers sin soporte

### 9. FLIP-Filtered Grid
- Grid de imagenes con filtros (categorias) donde el reorder se anima con FLIP
- Items que salen shrink + fade, items que entran grow + fade, items que se mueven slide a nueva posicion
- **Implementar con:** GSAP Flip plugin + Vue 3 computed filtering + CSS Grid
- **Mejor para:** portfolio filterable, product categories, tagged content
- **Complejidad:** media (GSAP Flip automatiza el calculo de posiciones)

---

## Reglas de galeria

| Regla | Implementacion |
|-------|---------------|
| Lazy load siempre | loading="lazy" + IntersectionObserver |
| Aspect ratio fijo | object-fit: cover en container con ratio |
| Alt text descriptivo | Cada imagen con alt unico y util |
| Keyboard navigation | Arrow keys, Escape para cerrar |
| Swipe en mobile | Touch events o library (Swiper) |
| Fallback si no hay imagenes | Placeholder elegante, no broken image |
| Preload next/prev | En lightbox, precargar la siguiente |
