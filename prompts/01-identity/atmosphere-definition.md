# Prompt: Atmosphere Definition

> Fase: Identity | Output: Sistema atmosferico que hace el sitio memorable
> La atmosfera es lo que separa un sitio profesional de uno premiable.

---

## Prompt

```
Necesito definir la ATMOSFERA visual para {{PROJECT_NAME}}.

La atmosfera no son colores ni tipografia — es lo que hace que un sitio se SIENTA
de cierta manera. Es la textura, la luz, la profundidad, el movimiento ambiental.

PERSONALIDAD DEL PROYECTO: {{PERSONALITY}}
REFERENCIA EMOCIONAL: "quiero que se sienta como {{EMOTIONAL_REF}}"
(ej: "estar en un museo de arte moderno", "una noche en Tokyo", "un atelier de moda")

CATALOGO DE TECNICAS ATMOSFERICAS:

### Texturas y overlays
| Tecnica | Efecto | Stack | Intensidad sugerida |
|---------|--------|-------|-------------------|
| Film grain | Calidez analogica, exclusividad | CSS pseudo-element + noise SVG | opacity 0.02-0.05 |
| Noise texture | Profundidad sutil | CSS filter / SVG feTurbulence | opacity 0.03-0.08 |
| Halftone dots | Retro editorial | SVG pattern / CSS radial-gradient | contextual |
| Scan lines | Cyberpunk, tech retro | CSS repeating-linear-gradient | opacity 0.02-0.04 |
| Paper texture | Artesanal, organico | CSS background-image | opacity 0.05-0.1 |

### Luz y profundidad
| Tecnica | Efecto | Stack | Cuando usar |
|---------|--------|-------|------------|
| Glow orbs | Profundidad ambiental | CSS radial-gradient animado | Hero, secciones key |
| Bokeh particles | Inmersion cinematica | Three.js / Canvas 2D | Hero background |
| Gradient mesh | Fluidez, modernidad | CSS conic/radial gradients | Backgrounds |
| Light leaks | Calidez fotografica | CSS pseudo + gradient | Transiciones |
| Vignette | Foco cinematico | CSS box-shadow inset | Secciones con imagen |

### Elementos ambientales
| Tecnica | Efecto | Stack | Carga |
|---------|--------|-------|-------|
| Floating particles | Vida, profundidad | Three.js / Canvas | Media |
| Aurora/nebula bg | Inmersion espacial | Three.js shader | Alta |
| Animated gradient | Movimiento sutil | CSS animation / GSAP | Baja |
| Grid pattern | Estructura, tech | CSS / SVG | Baja |
| Dot matrix | Data-driven, moderno | CSS radial-gradient repeat | Baja |
| Parallax layers | Profundidad | GSAP ScrollTrigger | Media |

### Tecnicas interactivas
| Tecnica | Efecto | Stack | Complejidad |
|---------|--------|-------|------------|
| Custom cursor | Personalidad | JS + CSS | Baja |
| Mouse-reactive bg | Inmersion | Three.js / Canvas | Media |
| Magnetic elements | Juego, engagement | GSAP | Baja |
| Reveal on scroll | Descubrimiento | GSAP ScrollTrigger | Baja |
| Distortion on hover | Impacto visual | Three.js shader | Alta |

SELECCIONAR 3-5 tecnicas que mejor representen la personalidad del proyecto.

Para cada tecnica elegida definir:
1. Donde se aplica (hero, global, secciones especificas)
2. Intensidad (sutil, media, prominente)
3. Stack de implementacion
4. Fallback para mobile / reduced-motion
5. Impacto en performance (bajo, medio, alto)

OUTPUT: tabla de tecnicas seleccionadas con specs de implementacion.
```

---

## Siguiente paso

Integrar atmosfera en `docs/design-brief.md` seccion 6.
