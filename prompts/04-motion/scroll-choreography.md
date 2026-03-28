# Prompt: Scroll Choreography

> Fase: Motion | Output: Mapa detallado de comportamiento por scroll
> Complemento al motion-spec para experiencias scroll-driven.

---

## Prompt

```
Disena la coreografia de scroll completa para {{PAGE_NAME}} de {{PROJECT_NAME}}.

El scroll es la interaccion principal del usuario. Cada pixel de scroll
debe sentirse intencional.

MAPA DE SCROLL (por seccion, en orden):

| Viewport range | Seccion | Que pasa al scrollear |
|---------------|---------|----------------------|
| 0-100vh | Hero | {{BEHAVIOR}} |
| 100vh-200vh | {{SEC}} | {{BEHAVIOR}} |
| 200vh-300vh | {{SEC}} | {{BEHAVIOR}} |
| ... | ... | ... |

TECNICAS DE SCROLL:

1. PARALLAX LAYERS
   | Elemento | Speed | Rango | Direccion |
   |---------|-------|-------|-----------|
   | {{ELEMENT}} | {{0.5-1.5}} | {{RANGE}} | vertical/horizontal |

2. PIN SECTIONS (si aplica)
   | Seccion | Pin duration | Que pasa mientras esta pineado |
   |---------|-------------|-------------------------------|
   | {{SEC}} | {{DURATION}} | {{STEPS}} |

3. SCRUB ANIMATIONS (progreso ligado al scroll)
   | Elemento | Propiedad | Valor inicio | Valor fin | Rango scroll |
   |---------|-----------|-------------|----------|-------------|
   | {{ELEM}} | {{PROP}} | {{START}} | {{END}} | {{RANGE}} |

4. COLOR TRANSITIONS (si cambia el bg entre secciones)
   | De seccion | A seccion | Color inicio | Color fin |
   |-----------|----------|-------------|----------|
   | {{FROM}} | {{TO}} | {{COLOR}} | {{COLOR}} |

5. SCROLL INDICATORS
   - Indicador de "scroll down" en hero: si/no
   - Progress bar global: si/no
   - Section indicators: si/no

PERFORMANCE:
- Throttle: requestAnimationFrame
- will-change: solo durante scroll activo
- Mobile: reducir o eliminar parallax, simplificar pins
```

---

## Ejemplo: buena vs mala coreografia

### Hero scroll-out para un portfolio de fotografia

**Mala:**
```
0-100vh: Hero con parallax
100vh-200vh: Portfolio grid aparece
```
(Demasiado vago. Parallax de que? A que velocidad? Que pasa exactamente?)

**Buena:**
```
0-100vh: Hero section
  - Hero image: parallax speed 0.5 (se mueve a mitad de velocidad del scroll)
  - Hero headline: parallax speed 0.8 (casi fijo, crea profundidad vs imagen)
  - Vignette overlay: opacity 0 -> 0.6 al scrollear (oscurece para transicion)
  - Scale: hero image scale 1 -> 1.15 (zoom sutil)

100vh-150vh: Transition zone (pinned)
  - Hero bg-color morphs from transparent to #0f0f0f
  - Headline opacity 1 -> 0 (desaparece antes del portfolio)
  - "Trabajos seleccionados" text: opacity 0 -> 1, y:40 -> 0

150vh-500vh: Portfolio masonry
  - Cards reveal: stagger 0.1 per card, y:60 -> 0, opacity 0 -> 1
  - Images: parallax speed 0.3 dentro de cada card (efecto de ventana)
  - Background: fixed gradient, no se mueve con scroll

MOBILE ADAPTACION:
  - Parallax eliminado (performance)
  - Pin eliminado (confuso en touch)
  - Transition zone: simple fade, no pin
  - Cards: reveal sin stagger (todas a la vez cuando entran en viewport)
```

---

## Common errors

- **Parallax en mobile.** La mayoria de los dispositivos mobile tienen scroll performance inferior. Parallax causa jank visible. Desactivar o reducir drasticamente.
- **Demasiadas secciones pinned.** Cada pin rompe la expectativa de scroll normal. 1-2 pins por pagina es el maximo. Mas genera confusion.
- **will-change permanente.** will-change: transform solo debe aplicarse DURANTE la animacion, no como estilo estatico. Aplicarlo permanentemente consume memoria de GPU.
- **No usar requestAnimationFrame para scroll listeners.** Un scroll listener sin throttle genera cientos de eventos por segundo. Siempre throttle con rAF.
- **Scrub animations sin rango definido.** Si una animacion scrubbed no tiene start/end claros, el progreso es impredecible. Definir viewport range exacto.
- **Color transitions bruscas.** Si el bg cambia de blanco a negro entre secciones sin transicion, hay un flash visual. Usar zona de transicion con gradiente o morph.
- **Scroll indicators que no desaparecen.** El "scroll down" arrow del hero debe desaparecer despues del primer scroll. Si sigue visible en la seccion 3, es ruido.

---

## Pipeline connection

```
Input: motion-personality.md (personalidad, easing)
     + page-plans.md (secciones y su orden)
Output de este prompt -> Mapa de scroll detallado
  Se integra en: docs/motion-spec.md seccion 7
  Alimenta:
    - gsap-motion skill (ScrollTrigger implementation)
    - responsive-review (mobile scroll adaptations)
    - perf-check (scroll performance budget)
```

## Output esperado

Mapa de scroll que se integra en `docs/motion-spec.md` seccion 7.
