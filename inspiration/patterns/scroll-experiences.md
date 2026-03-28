# UI Patterns: Scroll Experiences

> Catalogo de experiencias basadas en scroll.

---

## Tecnicas de scroll

### 1. Smooth Scroll (Lenis)
- Scroll suavizado con inercia
- Se siente premium y controlado
- Carga: baja (JS library liviana)
- **Cuando:** siempre (default recomendado)

### 2. Parallax Layers
- Elementos a diferentes velocidades de scroll
- Crea profundidad y dimension
- Carga: baja-media
- **Cuando:** heroes, secciones con imagen de fondo

### 3. Horizontal Scroll Section
- Seccion que scrollea horizontalmente con scroll vertical
- Pin la seccion, scrub horizontal
- Carga: media
- **Cuando:** galeria, timeline, showcases

### 4. Scroll-Triggered Reveals
- Elementos que aparecen al entrar en viewport
- once: true (no re-animan al scrollear arriba)
- Carga: baja
- **Cuando:** siempre (default para contenido)

### 5. Pinned Sections
- Seccion se pinea mientras el contenido cambia
- Ideal para features, steps, comparisons
- Carga: media
- **Cuando:** secciones de proceso, features detalladas

### 6. Scroll-Driven Color Transitions
- Background color cambia entre secciones
- Transicion suave basada en scroll progress
- Carga: baja
- **Cuando:** secciones con identidad de color diferente

### 7. Progress-Based Animation
- Animacion cuyo progreso esta ligado al scroll (scrub)
- No time-based sino position-based
- Carga: media
- **Cuando:** storytelling, reveals complejos

### 8. Infinite Scroll
- Contenido que carga al llegar al final
- Pagination invisible
- Carga: baja (pero cuidado con memory)
- **Cuando:** feeds, listados largos

---

### 9. CSS Scroll-Driven Animations (2025-2026 -- NO JS)
- `animation-timeline: scroll()` para scroll progress, `animation-timeline: view()` para view progress
- Carga: cero JS. Chrome 115+, Firefox (flag). Safari pendiente — usar polyfill o GSAP fallback.
- **Cuando:** progress bars, fade-ins, parallax simple

```css
.progress-bar {
  animation: grow-progress linear;
  animation-timeline: scroll();
}
@keyframes grow-progress {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}
```

---

## Reglas de scroll

| Regla | Razon |
|-------|-------|
| Parallax max 15% speed diff | Mas de eso es disorienting |
| Pin duration: 1-3 viewports max | Mas de eso el user se impacienta |
| Reveals: once: true | Re-animating on scroll up es molesto |
| Mobile: reducir/eliminar parallax | Performance y usabilidad |
| prefers-reduced-motion: skip all | Respeto por accesibilidad |
| CSS scroll-driven first | Usar CSS nativo cuando sea suficiente, GSAP para lo complejo |
