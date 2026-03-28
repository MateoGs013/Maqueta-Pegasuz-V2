# 3D Reference: Atmospheric Shaders

> Shaders para crear atmosfera visual de fondo.
> Tier 1 de complejidad — obligatorio en cada proyecto.

---

## Tipos de shader atmosferico

### 1. Gradient Noise (Simplex/Perlin)
- Colores del brand que fluyen organicamente
- Low-key, nunca compite con el contenido
- **Best for:** cualquier proyecto, es el Tier 1 default
- **Uniforms:** uTime, uColor1, uColor2, uColor3, uResolution

### 2. Aurora / Northern Lights
- Bandas de color ondulantes
- Efecto de luz natural en movimiento
- **Best for:** premium, sereno, espacial
- **Complejidad:** media (FBM + color mapping)

### 3. Nebula / Cosmic
- Nubes de color con profundidad
- Efecto espacial inmersivo
- **Best for:** tech, startup, futurista
- **Complejidad:** media-alta (multiple octaves de noise)

### 4. Fluid Gradient
- Gradientes que se mezclan suavemente
- Similar a los fondos de macOS
- **Best for:** SaaS, moderno, clean
- **Complejidad:** baja (2-3 colores con sine movement)

### 5. Organic Cells (Voronoi)
- Patron celular que se mueve lentamente
- Efecto biologico/organico
- **Best for:** health, nature, science
- **Complejidad:** media (Voronoi distance function)

### 6. Wave / Ocean
- Ondas sinusoidales con profundidad
- Efecto calmante, fluido
- **Best for:** wellness, music, creative
- **Complejidad:** baja-media (sine waves + distortion)

---

## Template de shader basico

```glsl
// Vertex
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}

// Fragment
uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;

varying vec2 vUv;

// Simplex noise function here...

void main() {
  vec2 uv = vUv;
  float noise = snoise(vec3(uv * 2.0, uTime * 0.1));
  vec3 color = mix(uColor1, uColor2, noise);
  color = mix(color, uColor3, snoise(vec3(uv * 1.5 + 100.0, uTime * 0.05)));
  gl_FragColor = vec4(color, 1.0);
}
```

---

## Shaders trending 2025-2026

### 7. Raymarching SDF (Signed Distance Functions)
- **Referencia:** https://tympanus.net/codrops/2024/07/15/how-to-create-a-liquid-raymarching-scene-using-three-js-shading-language/
- Renderizado volumetrico en fragment shader sin geometria
- Formas liquidas, metaballs, organic blobs
- Puede usar Three.js Shader Language (TSL) para compilar a WebGPU/WebGL
- **Complejidad:** alta (raymarching loop + SDF combinators)
- **Best for:** tech, creative, experimental, hero backgrounds

### 8. Dissolve/Disintegration Shader
- **Referencia:** https://tympanus.net/codrops/2025/02/17/implementing-a-dissolve-effect-with-shaders-and-particles-in-three-js/
- Objetos que se disuelven en particulas
- Noise-driven threshold para edge detection
- Emissive glow en el borde de disolucion
- **Complejidad:** media-alta (noise + particles + glow)
- **Best for:** transiciones dramaticas, loading states, hero reveals

### 9. GPGPU Texture Simulation
- **Referencia:** https://tympanus.net/codrops/2024/12/19/crafting-a-dreamy-particle-effect-with-three-js-and-gpgpu/
- Simulacion de fisica en GPU via ping-pong FBO (Frame Buffer Object)
- Positions y velocities almacenados en texturas
- Curl noise para movimiento organico
- **Complejidad:** alta (requires FBO setup + compute shaders)
- **Best for:** particle fields complejos, fluid simulation, generative art

### 10. Chromatic Aberration + Distortion
- Efecto de lente con separacion RGB
- Mouse-driven distortion en hover de imagenes
- Lightweight pero high-impact visual
- **Complejidad:** baja-media (post-processing shader)
- **Best for:** portfolio image hovers, gallery transitions

### 11. Three.js Shader Language (TSL)
- **Referencia:** Three.js docs — WebGPURenderer + TSL nodes
- Abstraccion de shaders que compila a WGSL (WebGPU) o GLSL (WebGL)
- API funcional (no raw GLSL strings)
- Future-proof: prepara para WebGPU sin perder WebGL fallback
- **Complejidad:** media (nueva API, mejor DX que raw GLSL)
- **Best for:** cualquier proyecto que quiera prepararse para WebGPU

---

## Performance budget

| Metrica | Target |
|---------|--------|
| Frame time | < 16ms (60fps) |
| GPU memory | < 50MB |
| Shader complexity | < 50 instructions (simple), < 200 (complex with fallback) |
| Canvas size | Match viewport, max 2x pixel ratio |
| Mobile | Half resolution, simplified shader |
| WebGPU first | Usar TSL para auto-fallback WebGPU -> WebGL |
| Raymarching max steps | 64 mobile, 128 desktop |
