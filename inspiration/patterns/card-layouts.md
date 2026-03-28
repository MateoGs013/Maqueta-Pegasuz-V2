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
