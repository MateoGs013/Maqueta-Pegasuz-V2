# 3D Reference: Particle Systems

> Sistemas de particulas para crear profundidad y vida.
> Tier 1-2 de complejidad.

---

## Tipos de sistema de particulas

### 1. Floating Dots
- Puntos simples flotando suavemente
- Conexiones opcionales entre puntos cercanos (constellation)
- **Complejidad:** baja | **Carga:** baja
- **Best for:** tech, minimal, data-driven

### 2. Bokeh / Light Points
- Puntos con blur y variacion de tamano
- Efecto fotografico de profundidad de campo
- **Complejidad:** baja | **Carga:** baja
- **Best for:** luxury, cinematico, nocturno

### 3. Snow / Dust
- Particulas cayendo suavemente con wind drift
- Efecto ambiental sutil
- **Complejidad:** baja | **Carga:** baja
- **Best for:** seasonal, atmosferico, sereno

### 4. Fireflies / Sparks
- Puntos con glow que parpadean
- Movimiento organico, no lineal
- **Complejidad:** media | **Carga:** baja-media
- **Best for:** magico, natural, nocturno

### 5. Galaxy / Spiral
- Particulas organizadas en espiral o galaxia
- Rotacion lenta, profundidad con perspectiva
- **Complejidad:** media | **Carga:** media
- **Best for:** tech, startup, futurista

### 6. Interactive Field
- Particulas que reaccionan al mouse (repel/attract)
- Engagement directo con el usuario
- **Complejidad:** media | **Carga:** media
- **Best for:** portfolios interactivos, hero sections

### 7. Text/Shape Particles
- Particulas que forman texto o formas
- Morph entre estados
- **Complejidad:** alta | **Carga:** media-alta
- **Best for:** hero statements, logos animados

---

## Parametros por sistema

| Parametro | Rango tipico | Notas |
|----------|-------------|-------|
| Count | 100-5000 | Mobile: 50% del desktop |
| Size | 1-8px | Variacion random para profundidad |
| Speed | 0.001-0.01 per frame | Slow = premium, fast = energetico |
| Opacity | 0.1-0.8 | Variacion para profundidad |
| Color | 1-3 del brand palette | Nunca random |
| Connection distance | 100-200px | Solo si constellation style |
| Mouse influence radius | 100-300px | Solo si interactivo |

---

## Sistemas de particulas trending 2025-2026

### 8. GPGPU Curl Noise Particles
- **Referencia:** https://tympanus.net/codrops/2024/12/19/crafting-a-dreamy-particle-effect-with-three-js-and-gpgpu/
- Particulas simuladas enteramente en GPU via ping-pong FBO
- Curl noise para movimiento fluido sin colisiones
- 10k-100k particulas a 60fps
- **Complejidad:** alta | **Carga:** media (GPU-bound, no CPU)
- **Best for:** hero backgrounds premium, generative art, immersive experiences

### 9. Dissolve Particle Burst
- **Referencia:** https://tympanus.net/codrops/2025/02/17/implementing-a-dissolve-effect-with-shaders-and-particles-in-three-js/
- Geometria que se desintegra en particulas
- Noise threshold controla donde se disuelve
- Emissive glow en bordes de disolucion
- **Complejidad:** alta | **Carga:** media-alta
- **Best for:** transiciones, loading reveals, hero animations

### 10. Instanced Mesh Particles
- InstancedMesh de Three.js para miles de objetos con geometria
- Cada particula puede ser un cubo, esfera, o custom shape
- Matrix4 per-instance para posicion/rotacion/escala
- **Complejidad:** media | **Carga:** media
- **Best for:** cuando las particulas necesitan ser 3D objects, no solo puntos

### 11. Audio-Reactive Particles
- Particulas que reaccionan a audio via Web Audio API AnalyserNode
- Frequency data mapea a size, color, velocity
- **Complejidad:** media-alta | **Carga:** media
- **Best for:** musica, audio brands, experiencias interactivas

---

## Performance

| Count | Desktop FPS | Mobile FPS | Recommendation |
|-------|-----------|-----------|---------------|
| 100 | 60 | 60 | Safe for any device |
| 500 | 60 | 50-60 | Good default |
| 1000 | 60 | 30-45 | Reduce on mobile |
| 5000 | 50-60 | < 30 | Desktop only, GPU particles |
| 10000+ | 30-50 | Skip | Need instanced mesh or GPU compute |
| 50000+ (GPGPU) | 60 | Skip | FBO ping-pong, desktop only |

---

## Sistemas trending 2026

### 12. Particle Morphing (shape-to-shape)
- Particulas que transicionan entre formas (logo -> texto -> abstract -> logo)
- Cada particula tiene posiciones target per-shape, interpoladas con easing
- Trigger puede ser scroll, click, o timer
- **Complejidad:** media-alta | **Carga:** media
- **Best for:** hero entrances, brand reveals, section transitions
- **Implementar:** Precalcular positions per shape (logo/text via canvas getImageData) + BufferGeometry + GSAP tween de attribute positions

### 13. Flow Field Particles
- Particulas que siguen un campo vectorial (flow field) generado por noise
- Crea trazos visuales tipo "viento" o "corriente" — efecto organico y vivo
- Se puede combinar con mouse como attractor/repulsor
- **Complejidad:** media | **Carga:** media
- **Best for:** backgrounds organicos, hero sections, weather/nature themes
- **Implementar:** Perlin/simplex noise grid + particle velocity from noise angle + trail rendering (line segments)

### 14. Confetti / Celebration Particles
- Burst de particulas con gravedad, rotacion random, y colores del brand
- Trigger: on milestone, on success, on CTA click
- Short-lived (2-3s) y auto-cleanup
- **Complejidad:** baja | **Carga:** baja (100-300 particulas max)
- **Best for:** gamification, success states, celebrations, onboarding
- **Implementar:** Three.js InstancedMesh + gravity simulation + GSAP timeline for burst + auto-dispose

### 15. Depth-of-Field Particle Layers
- Multiples capas de particulas a diferentes profundidades con blur variable
- Las particulas cercanas son grandes y blurry, las lejanas son pequenas y sharp (o vice versa)
- Crea sensacion fotografica de profundidad de campo
- **Complejidad:** media | **Carga:** media
- **Best for:** cinematico, luxury, nocturno, fotografico
- **Implementar:** 3 capas de BufferGeometry a diferentes z-depths + point material con size attenuation + post-processing bokeh pass (opcional)
