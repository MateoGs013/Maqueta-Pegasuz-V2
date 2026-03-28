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

## Ejemplos: buena vs mala atmosfera

### Para un estudio de grabacion musical

**Mala:** "Queremos que se sienta oscuro y moderno. Usar particulas y gradientes."
(Sin especificidad. No dice donde, con que intensidad, ni que herramienta.)

**Buena:**
| Tecnica | Donde | Intensidad | Stack | Mobile fallback |
|---------|-------|------------|-------|-----------------|
| Film grain | Global overlay | opacity 0.03 | CSS pseudo + SVG noise | Mantener (es CSS puro, sin costo) |
| Glow orbs | Hero bg (2 orbs: amber + violet) | Prominente | CSS radial-gradient animado con GSAP | Reducir a 1 orb estatico |
| Scan lines | Section dividers | opacity 0.02 | CSS repeating-linear-gradient | Mantener |
| Custom cursor | Global (desktop only) | Media | JS + CSS, blend-mode: difference | Desactivar en touch devices |
| Mouse-reactive bg | Hero only | Sutil (parallax 0.02) | Canvas 2D | Imagen estatica |

Referencia emocional: "estar en el control room de Abbey Road a las 2AM — intimidad, concentracion, equipo analogico iluminado por LEDs suaves."

---

## Combinaciones atmosfericas por rubro

| Industria | Combo recomendado | Referencia emocional |
|-----------|-------------------|---------------------|
| Gastronomia fine dining | Film grain + vignette + glow calido | "Cenar a la luz de velas en un restaurante intimo" |
| Fintech | Grid pattern + gradient mesh + animated gradient | "El dashboard de Mission Control de SpaceX" |
| Inmobiliaria luxury | Light leaks + parallax layers + bokeh | "Recorrer un penthouse al atardecer con vista al mar" |
| Moda | Noise texture + custom cursor + distortion on hover | "Una galeria de arte contemporaneo en Berlin" |
| Salud/Bienestar | Animated gradient suave + floating particles lentas | "Un jardin zen japones con niebla matutina" |
| Estudio creativo | Halftone + magnetic elements + mouse-reactive bg | "El estudio de un artista con herramientas por todos lados" |
| E-commerce premium | Vignette + glow orbs + parallax layers | "Entrar a una boutique en la Rue du Faubourg" |
| SaaS | Dot matrix + gradient mesh + reveal on scroll | "Un producto Apple recien sacado de la caja" |

---

## Common errors

- **Acumular demasiadas tecnicas.** 3-5 es el rango. Mas de 5 compiten entre si y bajan la performance. Cada tecnica debe tener un proposito claro.
- **Atmosfera que compite con el contenido.** Las particulas detras del hero headline deben COMPLEMENTAR el texto, no hacerlo ilegible. Testear legibilidad sobre la atmosfera.
- **No definir fallbacks para mobile.** Muchas tecnicas (Canvas, Three.js, custom cursor) no funcionan o son pesadas en mobile. Cada tecnica necesita un plan B.
- **prefers-reduced-motion sin cobertura.** TODOS los elementos atmosfericos animados deben desactivarse cuando el usuario tiene reduced-motion activado. No es opcional.
- **Film grain a opacidad alta.** Grain a mas de 0.05 se ve como un defecto, no como un efecto estetico. Sutil es la clave.
- **Ignorar el impacto en performance.** Un shader Three.js en el hero + particulas + mouse tracking + animaciones GSAP pueden bajar de 60fps. Medir frame time antes de agregar mas.
- **Olvidar que la atmosfera debe ser consistente.** Si el hero tiene grain y glow, pero el resto del sitio es plano, hay una desconexion. Los elementos atmosfericos deben hilar todo el sitio.

---

## Pipeline connection

```
Input: design-direction.md (personalidad, tecnicas mapeadas)
     + brand-questionnaire.md (referencia emocional)
Output de este prompt -> Sistema atmosferico con specs de implementacion
  Se integra en: docs/design-brief.md seccion 6
  Alimenta:
    - 3d-scope.md (contexto visual para el Tier de 3D)
    - motion-personality.md (elementos ambientales animados)
    - page-scaffold (que tecnicas se aplican en cada seccion)
    - threejs-3d skill (implementacion del layer 3D)
```

## Siguiente paso

Integrar atmosfera en `docs/design-brief.md` seccion 6.
