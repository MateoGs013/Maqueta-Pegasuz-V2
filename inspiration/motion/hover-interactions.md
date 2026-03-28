# Motion Reference: Hover Interactions

> Catalogo de hover states para elementos interactivos.

---

## Cards

| Tecnica | CSS / GSAP | Complejidad |
|---------|-----------|------------|
| Shadow elevation | `box-shadow` transition | CSS only |
| Image zoom | `img { transform: scale(1.05) }` on parent hover | CSS only |
| Border glow | `box-shadow: 0 0 20px accent` | CSS only |
| Overlay info | `::after` overlay con opacity transition | CSS only |
| 3D tilt | JS mousemove + transform perspective | GSAP |
| Image + text shift | Image moves up, text space increases | GSAP |
| Color accent reveal | Accent border or bg slides in | CSS |
| Magnetic pull | Card follows mouse slightly | GSAP |

## Buttons

| Tecnica | Descripcion | Complejidad |
|---------|------------|------------|
| Background slide | Bg color slides from left/bottom | CSS |
| Icon arrow move | Arrow icon moves right on hover | CSS |
| Underline draw | Underline draws from left | CSS |
| Scale pulse | Subtle scale 1.02 + shadow | CSS |
| Invert colors | Swap bg and text colors | CSS |
| Ripple effect | Material-style ripple from click point | JS |
| Magnetic | Button follows cursor slightly | GSAP |
| Text swap | Text slides out, new text slides in | GSAP |

## Links / Navigation

| Tecnica | Descripcion | Complejidad |
|---------|------------|------------|
| Underline from left | `::after` width 0 -> 100% from left | CSS |
| Underline from center | `::after` scaleX(0) -> scaleX(1) | CSS |
| Background highlight | Subtle bg color on hover | CSS |
| Color shift | Text color changes to accent | CSS |
| Weight shift | Font weight changes (400 -> 500) | CSS |
| Letter spacing | Tracking increases subtly | CSS |
| Bracket markers | `[` `]` appear around text | CSS |

## Images

| Tecnica | Descripcion | Complejidad |
|---------|------------|------------|
| Zoom in container | Image scales but container clips | CSS |
| Brightness increase | `filter: brightness(1.1)` | CSS |
| Grayscale to color | `filter: grayscale(1)` -> `grayscale(0)` | CSS |
| Overlay with label | Label text appears over image | CSS |
| Parallax on mouse | Image shifts based on mouse position | GSAP |
| Distortion shader | WebGL distortion effect | Three.js |

---

---

## Tecnicas trending 2025-2026

### Magnetic Hover (elevated)
- Elemento que se "atrae" al cursor con fuerza variable segun distancia — no solo el elemento sino su contenido interno
- El contenido (texto, icono) se mueve mas que el contenedor, creando parallax interno
- **Implementar:** Vue 3 composable `useMagnetic(el, { strength, innerStrength })` + GSAP `quickTo` para performance

```js
// Composable pattern
const useMagnetic = (el, { strength = 0.3, innerStrength = 0.5 }) => {
  const xTo = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3.out' })
  const yTo = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3.out' })
  // mousemove: calculate distance, apply proportional transform
  // mouseleave: animate back to 0,0
}
```

### Cursor Trail / Custom Cursor States
- Cursor custom que cambia de forma/color/tamano segun el elemento sobre el que esta
- Sobre links: cursor crece y muestra "View", sobre imagenes: cursor muestra "Drag", sobre text: cursor normal
- **Implementar:** Vue 3 global cursor component + GSAP quickTo for smooth following + data attributes para estados

### Shader Hover on Images
- Al hover una imagen, un shader de Three.js aplica efecto (wave distortion, RGB split, zoom lens)
- Al salir, el efecto se revierte suavemente
- **Implementar:** Three.js plane per image + fragment shader uniforms (uHover: 0 -> 1) + mouseenter/mouseleave

### Spring-Based Hover (CSS)
- CSS `transition-timing-function: linear(...)` para simular spring physics sin JS
- Bounce sutil al entrar al hover state, overshooting elegante
- Browser support: Baseline 2024 (Chrome 113+, Firefox 112+, Safari 17.2+)
- **Implementar:** CSS `linear()` easing con valores de spring precalculados

```css
.button:hover {
  transform: scale(1.05);
  transition: transform 0.5s linear(0, 0.006, 0.025, 0.06, 0.11, 0.17, 0.24, 0.33,
    0.43, 0.54, 0.64, 0.74, 0.83, 0.91, 0.96, 1.0, 1.02, 1.03, 1.02, 1.01, 1.0);
}
```

---

## Timing guidelines

| Element | Duration in | Duration out | Easing |
|---------|-----------|------------|--------|
| Cards | 0.3-0.4s | 0.2-0.3s | power2.out |
| Buttons | 0.2-0.3s | 0.15-0.2s | power2.out |
| Links | 0.2-0.3s | 0.15-0.2s | power1.out |
| Images | 0.4-0.6s | 0.3-0.4s | power2.out |
| Magnetic elements | 0.4-0.6s | 0.3s | power3.out (quickTo) |
| Custom cursor | 0.1-0.2s | 0.1s | power2.out (quickTo) |

Exit is always slightly faster than enter.

## CSS vs JS for Hovers

| Hover type | CSS only | JS needed | Recomendacion |
|-----------|---------|----------|---------------|
| Color/shadow/scale | Yes | No | CSS always |
| Underline draw | Yes | No | CSS always |
| Spring bounce | Yes (linear() easing) | No | CSS (modern) |
| 3D tilt | No | mousemove + transform | GSAP |
| Magnetic pull | No | mousemove + quickTo | GSAP |
| Shader distortion | No | Three.js + uniforms | Three.js |
| Custom cursor | No | mousemove + quickTo | GSAP |
| Content shift/reveal | Possible | Optional | CSS preferido, GSAP si complejo |
