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

---

## Elementos trending 2025-2026

### 7. Liquid Raymarching Scene (Tier 3-4)
- Escena 3D construida enteramente en fragment shader via raymarching
- Formas liquidas/organicas con SDF blending
- Puede ser interactiva con mouse uniforms
- **Stack:** Three.js + custom fragment shader (o TSL) + mouse uniforms
- **Referencia:** https://tympanus.net/codrops/2024/07/15/how-to-create-a-liquid-raymarching-scene-using-three-js-shading-language/
- **Best for:** hero immersivo, landing pages experimentales

### 8. WebGPU-Ready Scenes (Tier 2-3)
- Escenas preparadas para WebGPU via Three.js WebGPURenderer
- TSL (Three.js Shader Language) para shader portability
- Automatic fallback a WebGL si WebGPU no esta disponible
- **Stack:** Three.js r160+ + WebGPURenderer + TSL nodes
- **Best for:** future-proofing cualquier escena 3D

### 9. Image Distortion on Hover (Tier 2)
- Imagenes que se distorsionan con shader en hover
- Chromatic aberration, wave distortion, pixel displacement
- Lightweight y alto impacto visual
- **Stack:** Three.js + custom fragment shader + mousemove events
- **Best for:** portfolio image grids, gallery hovers, product showcases

### 10. Generative Typography 3D (Tier 3)
- Texto extruido o generado proceduralmente en 3D
- Puede ser interactivo (explode, morph, float)
- **Stack:** Three.js + TextGeometry o troika-three-text + GSAP
- **Best for:** hero typography, brand statements, creative agencies

---

## Fallbacks obligatorios

| Situacion | Fallback |
|----------|---------|
| No WebGL | CSS gradient background |
| Low-end device | Image or CSS animation |
| prefers-reduced-motion | Static image, no animation |
| Mobile (si Tier 3+) | Simplified version o image |
| Loading GLTF | Skeleton / progress bar |
| Error loading | Graceful CSS fallback |
| No WebGPU | Automatic WebGL fallback via TSL |
