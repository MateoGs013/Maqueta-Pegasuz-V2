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

## Timing guidelines

| Element | Duration in | Duration out | Easing |
|---------|-----------|------------|--------|
| Cards | 0.3-0.4s | 0.2-0.3s | power2.out |
| Buttons | 0.2-0.3s | 0.15-0.2s | power2.out |
| Links | 0.2-0.3s | 0.15-0.2s | power1.out |
| Images | 0.4-0.6s | 0.3-0.4s | power2.out |

Exit is always slightly faster than enter.
