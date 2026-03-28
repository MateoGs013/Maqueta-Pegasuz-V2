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
