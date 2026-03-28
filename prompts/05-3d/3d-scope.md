# Prompt: 3D Scope Definition

> Fase: 3D | Output: Spec para implementacion Three.js/WebGL
> Cada proyecto incluye al menos un elemento 3D (Tier 1 minimo).

---

## Prompt

```
Define el scope de 3D/WebGL para {{PROJECT_NAME}}.

CONTEXTO:
- Personalidad: {{PERSONALITY}}
- Atmosfera: {{ATMOSPHERE}} (de design-brief)
- Hero concept: {{HERO_CONCEPT}} (de page-plans)

TIERS DE COMPLEJIDAD (elegir uno como baseline):

### Tier 1 — Atmospheric (obligatorio minimo)
Shader o sistema de particulas que vive como fondo/ambiente.
- Shader atmosferico (gradient noise, aurora, nebula)
- Campo de particulas (floating dots, snow, fireflies)
- Animated mesh gradient
- Carga: BAJA. No bloquea interaccion.

### Tier 2 — Interactive Background
Elemento 3D que reacciona al mouse o scroll.
- Particle system que sigue el cursor
- Distortion shader on mousemove
- Scroll-driven geometry morphing
- Carga: MEDIA. Mouse events throttled.

### Tier 3 — Scene
Escena 3D con objetos, iluminacion, y posiblemente modelos.
- Producto 3D rotable
- Escena ambiental con multiples objetos
- Globe/mapa interactivo
- Carga: MEDIA-ALTA. LOD strategy necesaria.

### Tier 4 — Immersive
Experiencia 3D como elemento narrativo central.
- Scroll-driven scene progression
- Full-page 3D experience
- Interactive storytelling with 3D
- Carga: ALTA. Code splitting obligatorio.

PARA EL TIER ELEGIDO, definir:

1. CONCEPTO VISUAL
   - Que se ve (descripcion concreta, no abstracta)
   - Donde vive (hero bg, section bg, floating element)
   - Paleta de colores del 3D (alineada con design-brief)

2. COMPORTAMIENTO
   - Reacciona al mouse? Como?
   - Reacciona al scroll? Como?
   - Tiene animacion idle? Cual?
   - Cambia entre secciones? Como?

3. TECNICO
   - Three.js renderer: WebGL2 / WebGPU fallback
   - Resolution: canvas size strategy (full viewport, contained)
   - Post-processing: bloom, vignette, chromatic aberration?
   - Performance budget: max 16ms frame time (60fps)
   - Mobile strategy: simplificar o reemplazar con imagen/CSS

4. FALLBACKS
   - prefers-reduced-motion: imagen estatica o CSS gradient
   - Low-end device: canvas resolution reducida o desactivar
   - No WebGL: CSS fallback elegante

5. IMPLEMENTACION
   - Script: TresJS (Vue wrapper) o Three.js vanilla?
   - Carga: lazy load del canvas (IntersectionObserver)
   - Dispose: cleanup de geometria, material, renderer en unmount

OUTPUT: spec completa para que threejs-3d pueda implementar sin improvisar.
```

---

## Ejemplo: buena vs mala definicion de scope

### Tier 1 para una clinica de fisioterapia

**Mala:**
```
3D: particulas flotando en el hero background.
```
(Que tipo de particulas? Que colores? Reacciona al mouse? Que pasa en mobile?)

**Buena:**
```
CONCEPTO: "Flujo de energia" — particulas organicas que se mueven como fluidos
  representando el concepto de recuperacion y movimiento del cuerpo.

VISUAL:
  - ~200 particulas de tamano variable (1-4px)
  - Colores: 70% --color-accent-soft (#a8d8b9), 20% --color-accent (#4db875), 10% blanco
  - Movimiento: noise-based flow field, velocidad lenta (feeling: rio calmo)
  - Zona: hero bg, canvas size 100vw x 100vh

COMPORTAMIENTO:
  - Mouse: particulas se repelen suavemente del cursor (radio 100px, fuerza 0.3)
  - Scroll: particulas se desvanecen con opacity al scrollear fuera del hero
  - Idle: movimiento continuo basado en simplex noise
  - No cambia entre secciones (solo vive en el hero)

TECNICO:
  - Renderer: WebGL2 (Three.js Points)
  - Resolution: devicePixelRatio capped a 2
  - Mobile: reducir a 80 particulas, desactivar mouse repulsion
  - Performance: target 60fps, measured <4ms frame time

FALLBACKS:
  - reduced-motion: imagen estatica con gradient mesh CSS
  - No WebGL: CSS animated gradient (radial-gradient con hue-rotate)
  - Low battery: desactivar animacion, mostrar frame estatico
```

---

## 3D scope por industria

| Industria | Tier recomendado | Concepto sugerido | Justificacion |
|-----------|-----------------|-------------------|---------------|
| Gastronomia | Tier 1 | Particulas calidas (vapor, chispas) | Atmosfera sin distraer de la comida |
| Inmobiliaria luxury | Tier 2 | Distortion shader on hover sobre fotos | Experiencia tactil sobre las propiedades |
| Fintech | Tier 1-2 | Grid/mesh animado, data particles | Precision y datos, no decoracion |
| Moda | Tier 2-3 | Shader de distorsion en imagen, o tela 3D | Producto como estrella |
| SaaS | Tier 1 | Gradient mesh animado, orbs | Moderno sin ser pesado |
| Estudio creativo | Tier 3-4 | Escena 3D interactiva, producto rotable | Showcase de capacidades tecnicas |
| Portfolio personal | Tier 2 | Mouse-reactive background | Personalidad e inmersion |
| E-commerce premium | Tier 3 | Producto 3D rotable | El usuario manipula el producto |

---

## Common errors

- **3D como decoracion sin proposito.** Particulas random porque "se ve cool" no agrega valor. El 3D debe reforzar la narrativa o la atmosfera definida en el design-brief.
- **Tier 4 para un sitio que no lo necesita.** Una experiencia immersiva completa para un restaurante es overkill. Elegir el tier mas bajo que cumpla el proposito.
- **No definir el mobile strategy.** 60% del trafico es mobile. Si el 3D no funciona en mobile, 60% de los usuarios no lo ven. Siempre definir que pasa en mobile.
- **Canvas sin dispose.** Three.js leaks memoria si no se hace dispose() de geometrias, materiales, y renderer en unmount. Esto es un bug frecuente.
- **Post-processing excesivo.** Bloom + chromatic aberration + vignette + noise en el mismo canvas consume GPU innecesariamente. Elegir 1-2 efectos, no todos.
- **No lazy-loadear el canvas.** Si el 3D esta en el hero, se carga inmediatamente. Pero si esta en una seccion intermedia, debe cargarse con IntersectionObserver.
- **Olvidar el fallback de WebGL.** Algunos navegadores/devices no soportan WebGL. Sin fallback, el usuario ve un rectangulo negro.
- **devicePixelRatio sin cap.** En pantallas Retina (dpr 3), el canvas renderiza a 3x la resolucion. Capear a 2 ahorra mucha GPU sin perdida visual perceptible.

---

## Pipeline connection

```
Input: atmosphere-definition.md (tecnicas atmosfericas)
     + design-brief.md (paleta, personalidad)
     + page-plans.md (donde vive el 3D)
     + motion-personality.md (easing, timing del proyecto)
Output de este prompt -> Spec para implementacion 3D
  Alimenta directamente:
    - shader-brief.md (si se necesitan shaders custom)
    - threejs-3d skill (implementacion del canvas)
    - perf-check (3D performance budget)
    - component-planning.md (3D components map)
```

## Siguiente paso

Con el 3D scope definido, todo esta listo para `06-implementation/component-planning.md`.
