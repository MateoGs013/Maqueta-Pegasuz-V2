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

## Siguiente paso

Con el 3D scope definido, todo esta listo para `06-implementation/component-planning.md`.
