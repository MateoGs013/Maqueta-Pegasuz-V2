# UI Patterns: Card Layouts

> Catalogo de layouts de cards y grids.

---

## Tipos de grid

### 1. Uniform Grid (2-4 columnas)
- Todas las cards del mismo tamaño
- Clean, predecible, scannable
- **Cuando:** listados uniformes (productos, servicios, team)

### 2. Masonry
- Cards de alturas variables
- Organico, pinterest-like
- **Cuando:** contenido visual de proporciones variadas

### 3. Featured + Grid
- 1 card grande + N cards menores
- Jerarquia visual clara
- **Cuando:** destacar un item sobre el resto

### 4. Bento Grid
- Grid con items de tamaños variados predefinidos
- Moderno, tech-forward
- **Cuando:** feature showcase, dashboard-like

### 5. Horizontal Scroll
- Cards en fila horizontal con scroll
- Touch-friendly, space-efficient
- **Cuando:** mobile, previews, carruseles

### 6. List View
- Cards como filas horizontales
- Mas info visible, menos visual
- **Cuando:** data-heavy listings, search results

---

## Anatomia de una card

```
┌─────────────────────┐
│ [Image/Visual]       │  <- Ratio fijo (16:9, 4:3, 1:1, 3:4)
│                      │
├─────────────────────┤
│ Category tag         │  <- Opcional, chip/badge
│ Title               │  <- 1-2 lineas max
│ Description         │  <- 2-3 lineas, truncate
│ Meta info           │  <- Fecha, autor, precio, etc
│ [CTA]               │  <- Link o button
└─────────────────────┘
```

## Hover interactions para cards

| Tecnica | Descripcion | Complejidad |
|---------|------------|------------|
| Shadow elevation | Shadow aumenta, card "levita" | Baja |
| Image zoom | Imagen scale 1.05 dentro del contenedor | Baja |
| Overlay reveal | Overlay con info extra aparece | Media |
| Border glow | Borde con glow del accent color | Baja |
| Tilt 3D | Card tilts hacia el mouse (perspective) | Media |
| Content shift | Contenido se desplaza revelando CTA | Media |
| Glassmorphism reveal | Frosted glass overlay on hover | Media |
| View Transition morph | Card morpha a detail (View Transitions API) | Alta |
| FLIP layout change | Card expande con FLIP animation | Media-Alta |

---

## Tendencias 2025-2026

### Bento Grid (trending)
- Tiles variados con corner radius exagerado, micro-interactions por tile
- **Implementar:** CSS Grid template + GSAP per-tile animations

### Glassmorphism Cards
- backdrop-filter: blur(16px) + background rgba + border semi-transparente
- **Implementar:** CSS backdrop-filter + border rgba + box-shadow difuso

### Soft Brutalist Cards
- Bordes gruesos, colores planos, drop shadows offset
- **Implementar:** CSS border + box-shadow offset + transition transform

### Animated Gradient Border Cards (2026)
- Cards con borde que es un gradient animado (conic-gradient rotation) — efecto "glow trail" alrededor de la card
- Combina con dark mode para maximo impacto visual
- **Implementar:** CSS `@property` para animar conic-gradient angle + `border-image` o pseudo-element con mask + `animation`

```css
@property --angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}
.card-glow {
  background: conic-gradient(from var(--angle), var(--accent), transparent, var(--accent));
  animation: rotate-glow 3s linear infinite;
}
@keyframes rotate-glow { to { --angle: 360deg; } }
```

### Magnetic Hover Cards (2026)
- Cards que siguen sutilmente al cursor (perspective tilt + translate) creando sensacion de profundidad
- En mobile: gyroscope tilt como alternativa
- **Implementar:** Vue 3 composable `useMagneticHover(el, strength)` + CSS `transform: perspective(800px) rotateX() rotateY() translate3d()`

### Expandable Detail Cards (2026)
- Cards que al click se expanden in-place a un detail view con FLIP animation
- No cambia de pagina — la card se abre revelando mas contenido
- **Implementar:** GSAP Flip plugin + Vue 3 Teleport (para z-index) + CSS Grid area expansion
