# UI Patterns: Heroes

> Catalogo de patrones de hero section para referencia rapida.

---

## Tipos de hero

### 1. Fullscreen Cinematic
- Imagen o video a viewport completo
- Texto overlay con tratamiento de legibilidad
- CTA en la parte inferior o centro
- Scroll indicator sutil
- **Mejor para:** luxury, real estate, hospitality, fashion

### 2. Split Screen
- 50/50 horizontal (texto | visual)
- Asimetria intencional (60/40, 70/30)
- Visual puede ser imagen, 3D, o ilustracion
- **Mejor para:** agencies, SaaS, services

### 3. Typography-Driven
- Headline gigante como elemento visual principal
- Minimal o sin imagen de fondo
- Motion en la tipografia (char reveal, scale, clip)
- **Mejor para:** portfolios, studios, editorial

### 4. 3D/WebGL Background
- Canvas Three.js como fondo del hero
- Contenido overlaid con z-index
- Interactividad con mouse o scroll
- **Mejor para:** tech, creative, experimental

### 5. Video Background
- Video loop corto (8-15s) como fondo
- Muted, autoplay, sin controles
- Overlay sutil para legibilidad
- **Mejor para:** lifestyle, real estate, hospitality

### 6. Animated Gradient
- Gradient mesh o aurora animada
- Lightweight alternative a 3D
- Colores del brand en movimiento
- **Mejor para:** SaaS, startups, tech

### 7. Editorial/Magazine
- Grid asimetrico con multiples elementos
- Imagen principal + thumbnails + texto
- Densidad de informacion alta pero organizada
- **Mejor para:** editorial, e-commerce, media

### 8. Scroll-Triggered Reveal
- Hero que se construye mientras scrolleas
- Elementos aparecen progresivamente
- Pin + scrub timeline
- **Mejor para:** storytelling, case studies, portfolios

### 9. Bento Hero (2025-2026)
- Grid estilo bento con multiples tiles animadas
- Micro-interactions dentro de cada tile
- **Mejor para:** SaaS, tech products
- **Implementar:** CSS Grid template-areas + GSAP stagger tiles

### 10. Interactive Calculator/Tool Hero (2025-2026)
- Herramienta funcional ES el hero, engagement instantaneo
- **Mejor para:** fintech, pricing tools, SaaS
- **Implementar:** Vue 3 reactive component + GSAP number animations

### 11. Glassmorphism Layered Hero (2025-2026)
- Capas translucidas con backdrop-filter, depth sin 3D
- **Mejor para:** SaaS, fintech, modern brands
- **Implementar:** CSS backdrop-filter + layered positioning + GSAP parallax layers

---

## Checklist de hero

- [ ] Mensaje claro en 3 segundos
- [ ] CTA visible sin scroll
- [ ] Mobile: contenido no se corta, legible
- [ ] Performance: LCP < 2.5s
- [ ] Accessibility: contraste suficiente sobre background
