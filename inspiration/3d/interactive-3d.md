# 3D Reference: Interactive 3D Elements

> Elementos 3D interactivos (Tier 2-4).
> Para cuando el proyecto requiere mas que un shader atmosferico.

---

## Tipos de elementos interactivos

### 1. Product Viewer (Tier 3)
- Modelo 3D rotable con drag
- Lighting setup profesional
- Material PBR realista
- **Stack:** Three.js + OrbitControls + GLTF loader
- **Best for:** e-commerce, arquitectura, producto

### 2. Interactive Globe (Tier 3)
- Globo terraqueo con markers interactivos
- Rotacion automatica + mouse control
- Markers con tooltip on hover
- **Stack:** Three.js + custom geometry o library
- **Best for:** empresas globales, logistics, travel

### 3. Scroll-Driven Scene (Tier 4)
- Escena 3D cuyo estado cambia con scroll
- Camera moves, objects appear/morph
- **Stack:** Three.js + GSAP ScrollTrigger
- **Best for:** storytelling, inmersivo, hero cinematico

### 4. Mouse-Reactive Mesh (Tier 2)
- Mesh/plane que se deforma segun mouse position
- Efecto de "fabric" o "water"
- **Stack:** Three.js + vertex shader + uniforms
- **Best for:** backgrounds, hover effects

### 5. Morphing Geometry (Tier 3)
- Geometria que morpha entre estados
- Transitions entre formas
- **Stack:** Three.js + morph targets o custom
- **Best for:** creative, artistico, experimental

### 6. Text in 3D Space (Tier 2)
- Texto renderizado en 3D con perspectiva
- Puede reaccionar al mouse (parallax 3D)
- **Stack:** Three.js + TextGeometry o troika-three-text
- **Best for:** hero sections, titulos impactantes

---

## Loading strategy

| Tipo | Carga | Strategy |
|------|-------|---------|
| Shader (Tier 1) | < 50KB | Inline, no lazy load |
| Particles (Tier 1-2) | < 100KB | Inline o lazy si below fold |
| GLTF model (Tier 3) | 500KB-5MB | SIEMPRE lazy load + progress |
| Complex scene (Tier 4) | 1MB+ | Lazy load + skeleton + progress |

## Fallbacks obligatorios

| Situacion | Fallback |
|----------|---------|
| No WebGL | CSS gradient background |
| Low-end device | Image or CSS animation |
| prefers-reduced-motion | Static image, no animation |
| Mobile (si Tier 3+) | Simplified version o image |
| Loading GLTF | Skeleton / progress bar |
| Error loading | Graceful CSS fallback |
