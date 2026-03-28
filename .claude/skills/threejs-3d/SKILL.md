---
name: threejs-3d
description: Create 3D scenes, objects, and visual effects using Three.js or its framework wrappers (TresJS for Vue, React Three Fiber for React). Adapts to project stack. Use when the user asks for 3D graphics, WebGL, WebGPU, shaders, 3D models, particles, generative geometry, or immersive visuals. Triggers on "Three.js", "3D", "WebGL", "WebGPU", "shader", "GLSL", "particles", "3D model", "scene", "mesh", "geometry", "material", "TresJS", "R3F", "react-three-fiber", "tres dimensiones", "escena 3D", "particulas", "wireframe", "gltf", "orbit controls".
---

# Three.js / 3D — Adaptive

Create 3D scenes and effects that adapt to the project's framework, aesthetic, and performance constraints.

## Phase 1: Discover project context

### 1. Check installed 3D stack

Grep `package.json` for:

| Package | Ecosystem | Approach |
|---------|-----------|----------|
| `three` | Any | Raw Three.js |
| `@tresjs/core` | Vue | TresJS declarative |
| `@react-three/fiber` | React | React Three Fiber (R3F) |
| `@react-three/drei` | React | R3F helpers (controls, loaders, effects) |
| `@tresjs/cientos` | Vue | TresJS helpers (like drei for Vue) |
| `postprocessing` | Any | Post-processing effects |
| `@react-three/postprocessing` | React | R3F post-processing |
| `leva` / `tweakpane` | Any | Debug GUI |
| `@theatre/core` | Any | Animation timeline |
| `cannon-es` / `@dimforge/rapier3d` | Any | Physics |

### 2. Check if 3D is NOT installed

If no 3D library exists, recommend the appropriate one:
- **Vue project** → suggest `@tresjs/core` + `@tresjs/cientos` (or raw `three` for more control)
- **React project** → suggest `@react-three/fiber` + `@react-three/drei`
- **Vanilla / other** → suggest raw `three`
- **Already using Canvas 2D for 3D** → suggest upgrading to Three.js for complex scenes, or keep Canvas 2D for simple wireframes

### 3. Check existing 3D patterns

- Glob for `*.vue`, `*.tsx`, `*.jsx` containing Three.js imports
- Read existing 3D components to learn: initialization, cleanup, animation loop, responsive handling
- Check if Canvas 2D 3D exists (like `Wireframe*.vue` components) — understand the visual language

### 4. Renderer target

- **WebGPU**: Since Three.js r171+ and Safari 26 (Sept 2025), WebGPU is viable for all major browsers. Use `WebGPURenderer` for new projects.
- **WebGL**: Use `WebGLRenderer` for broader compatibility or existing projects.

### 5. Design Brief and project aesthetic

**If a Design Brief from `creative-design` exists, read the "3D/WebGL Scope" section.** It specifies:
- Where 3D is used (hero background, specific section, persistent canvas)
- What kind of 3D (particles, wireframe, model, shader)
- How it responds to scroll (camera path, rotation, morph)
- Mobile fallback strategy

Also read design docs if they exist — the 3D style should match the overall brand.

## Phase 2: Understand aesthetic intent

3D has enormous stylistic range. Adapt to what the user communicates:

| Aesthetic | 3D expression |
|-----------|---------------|
| **Minimal** | Wireframe, single color, low poly, no textures, subtle rotation |
| **Editorial/luxury** | Smooth materials, reflection, ambient occlusion, metallic, slow camera |
| **Brutalist** | Raw geometry, harsh lighting, glitch shaders, broken meshes |
| **Playful** | Bright colors, bouncy physics, cartoon shading (toon material), particles |
| **Sci-fi/tech** | Grid planes, glow edges, holographic, scan lines, particles, data viz |
| **Organic** | Noise-deformed shapes, subsurface scattering, soft lighting, nature |
| **Abstract/generative** | Math-driven shapes, noise fields, GPU particles, shader art |
| **Realistic** | PBR materials, HDR environment, GLTF models, shadows, post-processing |
| No direction | Match existing project aesthetic, default to clean and performant |

## Phase 3: Implementation patterns

### A) Raw Three.js in Vue (no TresJS)

```vue
<template>
  <canvas ref="canvasRef" class="three-canvas" aria-hidden="true" />
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'

const canvasRef = ref(null)
let renderer, scene, camera, raf, observer

const props = defineProps({
  /* expose control props relevant to the scene */
})

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return

  // Respect reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  // Scene
  scene = new THREE.Scene()

  // Camera
  camera = new THREE.PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 100)
  camera.position.z = 5

  // Renderer
  renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance',
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(canvas.clientWidth, canvas.clientHeight)

  // Objects — adapt to aesthetic
  // ...

  // Resize handler
  const onResize = () => {
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setSize(w, h)
  }
  window.addEventListener('resize', onResize)

  // Animation loop
  const clock = new THREE.Clock()
  function animate() {
    raf = requestAnimationFrame(animate)
    if (!visible) return
    const elapsed = clock.getElapsedTime()
    // Update objects
    renderer.render(scene, camera)
  }

  // Visibility observer (pause when off-screen)
  let visible = true
  observer = new IntersectionObserver(
    ([e]) => { visible = e.isIntersecting },
    { threshold: 0.05 }
  )
  observer.observe(canvas)

  animate()

  // Store resize handler for cleanup
  canvas._onResize = onResize
})

onBeforeUnmount(() => {
  if (raf) cancelAnimationFrame(raf)
  observer?.disconnect()
  if (canvasRef.value?._onResize) {
    window.removeEventListener('resize', canvasRef.value._onResize)
  }
  // CRITICAL: Dispose everything
  renderer?.dispose()
  scene?.traverse((obj) => {
    if (obj.geometry) obj.geometry.dispose()
    if (obj.material) {
      if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose())
      else obj.material.dispose()
    }
  })
})
</script>

<style scoped>
.three-canvas {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
```

### B) TresJS (Vue declarative)

```vue
<template>
  <TresCanvas alpha :power-preference="'high-performance'">
    <TresPerspectiveCamera :position="[0, 0, 5]" />

    <TresMesh ref="meshRef">
      <TresBoxGeometry :args="[1, 1, 1]" />
      <TresMeshStandardMaterial :color="color" :wireframe="wireframe" />
    </TresMesh>

    <TresAmbientLight :intensity="0.5" />
    <TresDirectionalLight :position="[5, 5, 5]" :intensity="1" />
  </TresCanvas>
</template>

<script setup>
import { ref } from 'vue'
import { useRenderLoop } from '@tresjs/core'

const meshRef = ref(null)
const { onLoop } = useRenderLoop()

onLoop(({ elapsed }) => {
  if (meshRef.value) {
    meshRef.value.rotation.y = elapsed * 0.5
  }
})
</script>
```

### C) React Three Fiber

```tsx
import { Canvas, useFrame } from '@react-three/fiber'
import { useRef } from 'react'

function RotatingMesh({ color, wireframe }) {
  const meshRef = useRef()

  useFrame((_, delta) => {
    meshRef.current.rotation.y += delta * 0.5
  })

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={color} wireframe={wireframe} />
    </mesh>
  )
}

export default function Scene() {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} />
      <RotatingMesh color={accentColor} wireframe={false} />
    </Canvas>
  )
}
```

### D) Canvas 2D 3D (lightweight, no library)

For simple wireframes without loading Three.js (~150KB). Project rotation + depth alpha:

```js
// Manual projection: rotate → tilt → project to 2D
function project(x, y, z, cosY, sinY) {
  const rx = x * cosY - z * sinY
  const rz = x * sinY + z * cosY
  return { fx: rx, fy: y, depth: rz }
}
// Draw with per-segment depth-based alpha
// Use IntersectionObserver to pause when off-screen
// Use requestAnimationFrame for the loop
```

Use this approach when the visual is simple (wireframe geometry, no textures, no lighting).

## 3D as default atmosphere — NOT optional

**Every project should have at least one 3D/WebGL element** unless the user explicitly opts out. 3D is the most powerful immersion tool available. Without it, sites feel flat.

### Tier system — choose based on project needs

| Tier | Complexity | Performance | Examples |
|------|-----------|-------------|---------|
| **Tier 1: Atmospheric** | Low | < 5ms/frame | Noise shader background, simple particle field, gradient mesh, floating shapes |
| **Tier 2: Interactive** | Medium | < 10ms/frame | Mouse-reactive particles, scroll-driven camera, hover distortion shader, flow field |
| **Tier 3: Spectacular** | High | < 16ms/frame | GPGPU particles (100k+), full 3D scene, model loading, post-processing pipeline |

### When to use each tier

- **Tier 1** — ALWAYS. Every project gets at least this. A subtle shader background or particle field behind the hero adds depth without performance cost.
- **Tier 2** — When the project emphasizes interactivity or the aesthetic is tech/futuristic/experimental.
- **Tier 3** — When 3D is a primary storytelling tool (architecture, product showcase, experimental/art).

---

## Immersive 3D patterns

### Atmospheric shader background (Tier 1)

```js
// Noise-based gradient background — subtle, performant, unique per project
const material = new THREE.ShaderMaterial({
  uniforms: {
    uTime: { value: 0 },
    uColor1: { value: new THREE.Color(/* from brief palette */) },
    uColor2: { value: new THREE.Color(/* from brief accent */) },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    uniform vec2 uMouse;
    varying vec2 vUv;

    // Simplex noise function (include your preferred implementation)
    // ...

    void main() {
      float noise = snoise(vec3(vUv * 3.0, uTime * 0.1));
      float mouseDist = distance(vUv, uMouse);
      noise += smoothstep(0.5, 0.0, mouseDist) * 0.3;
      vec3 color = mix(uColor1, uColor2, noise * 0.5 + 0.5);
      gl_FragColor = vec4(color, 1.0);
    }
  `,
})
// Fullscreen quad: new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material)
```

### Mouse-reactive particle field (Tier 2)

```js
// Particles that respond to cursor position
const count = 5000
const positions = new Float32Array(count * 3)
const velocities = new Float32Array(count * 3)

for (let i = 0; i < count; i++) {
  positions[i * 3] = (Math.random() - 0.5) * 10
  positions[i * 3 + 1] = (Math.random() - 0.5) * 10
  positions[i * 3 + 2] = (Math.random() - 0.5) * 5
}

// In animation loop:
const mouse3D = new THREE.Vector3(mouseX, mouseY, 0)
for (let i = 0; i < count; i++) {
  const px = positions[i * 3]
  const py = positions[i * 3 + 1]
  const dist = Math.sqrt((px - mouse3D.x) ** 2 + (py - mouse3D.y) ** 2)
  if (dist < repulsionRadius) {
    const force = (1 - dist / repulsionRadius) * repulsionStrength
    velocities[i * 3] += (px - mouse3D.x) * force
    velocities[i * 3 + 1] += (py - mouse3D.y) * force
  }
  // Apply velocity with damping
  positions[i * 3] += velocities[i * 3]
  positions[i * 3 + 1] += velocities[i * 3 + 1]
  velocities[i * 3] *= 0.96  // damping
  velocities[i * 3 + 1] *= 0.96
}
geometry.attributes.position.needsUpdate = true
```

### GPGPU particle system (Tier 3)

```js
// Massive particle counts (50k-500k) using DataTexture for GPU computation
const size = 256 // 256x256 = 65536 particles
const data = new Float32Array(size * size * 4)

// Initialize positions in RGBA channels
for (let i = 0; i < size * size; i++) {
  data[i * 4] = (Math.random() - 0.5) * 10     // x
  data[i * 4 + 1] = (Math.random() - 0.5) * 10 // y
  data[i * 4 + 2] = (Math.random() - 0.5) * 10 // z
  data[i * 4 + 3] = Math.random()                // life
}

const positionTexture = new THREE.DataTexture(
  data, size, size, THREE.RGBAFormat, THREE.FloatType
)

// Use GPUComputationRenderer (three/examples) for simulation
// Render as Points with custom ShaderMaterial reading from the sim texture
```

### Scroll-driven camera path (Tier 2-3)

```js
// Camera follows a curve as user scrolls
const curve = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0, 0, 10),    // start position
  new THREE.Vector3(5, 2, 7),
  new THREE.Vector3(-3, -1, 4),
  new THREE.Vector3(0, 0, 2),     // end position (close to subject)
])

ScrollTrigger.create({
  trigger: '.page-container',
  start: 'top top',
  end: 'bottom bottom',
  scrub: 1,
  onUpdate: (self) => {
    const point = curve.getPointAt(self.progress)
    const lookAt = curve.getPointAt(Math.min(self.progress + 0.01, 1))
    camera.position.copy(point)
    camera.lookAt(lookAt)
  },
})
```

### Image displacement on hover (Tier 2)

```js
// WebGL image with displacement effect on hover
const material = new THREE.ShaderMaterial({
  uniforms: {
    uTexture: { value: imageTexture },
    uDisplacement: { value: displacementMap },
    uHover: { value: 0 },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
  },
  fragmentShader: `
    uniform sampler2D uTexture;
    uniform sampler2D uDisplacement;
    uniform float uHover;
    uniform vec2 uMouse;
    varying vec2 vUv;
    void main() {
      vec4 disp = texture2D(uDisplacement, vUv);
      float dist = distance(vUv, uMouse);
      float strength = smoothstep(0.4, 0.0, dist) * uHover;
      vec2 distortedUv = vUv + disp.rg * strength * 0.05;
      gl_FragColor = texture2D(uTexture, distortedUv);
    }
  `,
})

// Animate uHover: gsap.to(uniforms.uHover, { value: 1, duration: 0.6 })
// Track mouse: update uniforms.uMouse on mousemove
```

### Post-processing pipeline (Tier 2-3)

```js
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js'

const composer = new EffectComposer(renderer)
composer.addPass(new RenderPass(scene, camera))

// Bloom — glow on bright elements
composer.addPass(new UnrealBloomPass(
  new THREE.Vector2(w, h),
  0.3,   // strength (subtle)
  0.4,   // radius
  0.85   // threshold
))

// Chromatic aberration — custom shader pass
const chromaticShader = {
  uniforms: {
    tDiffuse: { value: null },
    uOffset: { value: 0.002 },
  },
  vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float uOffset;
    varying vec2 vUv;
    void main() {
      float r = texture2D(tDiffuse, vUv + vec2(uOffset, 0.0)).r;
      float g = texture2D(tDiffuse, vUv).g;
      float b = texture2D(tDiffuse, vUv - vec2(uOffset, 0.0)).b;
      gl_FragColor = vec4(r, g, b, 1.0);
    }
  `,
}
composer.addPass(new ShaderPass(chromaticShader))

// In loop: composer.render() instead of renderer.render()
// Cleanup: composer.dispose()
```

---

## Common 3D recipes

### Wireframe geometry
```js
new THREE.MeshBasicMaterial({ wireframe: true, color: accentColor })
// Or custom wireframe with EdgesGeometry for clean edges:
const edges = new THREE.EdgesGeometry(geometry)
const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color }))
```

### Particles / point clouds
```js
const particles = new THREE.BufferGeometry()
const positions = new Float32Array(count * 3)
// Fill positions with random/noise values
particles.setAttribute('position', new THREE.BufferAttribute(positions, 3))
const material = new THREE.PointsMaterial({ size: 0.02, color, transparent: true })
const points = new THREE.Points(particles, material)
```

### GLTF model loading
```js
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'

const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('/draco/')
const loader = new GLTFLoader()
loader.setDRACOLoader(dracoLoader)
loader.load('/model.glb', (gltf) => {
  scene.add(gltf.scene)
})
```

### Shader material (custom)
```js
const material = new THREE.ShaderMaterial({
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    varying vec2 vUv;
    void main() {
      gl_FragColor = vec4(vUv, sin(uTime) * 0.5 + 0.5, 1.0);
    }
  `,
  uniforms: {
    uTime: { value: 0 },
  },
})
// Update in loop: material.uniforms.uTime.value = elapsed
```

### Post-processing (bloom, vignette)
```js
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'

const composer = new EffectComposer(renderer)
composer.addPass(new RenderPass(scene, camera))
composer.addPass(new UnrealBloomPass(new THREE.Vector2(w, h), 0.5, 0.4, 0.85))
// In loop: composer.render() instead of renderer.render()
```

### OrbitControls
```js
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.dampingFactor = 0.05
// In loop: controls.update()
// Cleanup: controls.dispose()
```

## Performance rules (apply always)

### Draw calls
- Target **< 100 draw calls** for 60fps.
- Use **InstancedMesh** for many identical objects (thousands of cubes, particles).
- Use **BufferGeometryUtils.mergeGeometries** for static meshes that share material.
- Use **LOD** (Level of Detail) for scenes with distance variation.

### Textures
- Compress with **KTX2** (GPU compressed) or at minimum use power-of-2 dimensions.
- Set `texture.minFilter` and `texture.magFilter` appropriately.
- Dispose textures when no longer needed.
- Use a single texture atlas instead of many small textures.

### Geometry
- Use **Draco compression** for GLTF models.
- Reduce polygon count where visual difference is negligible.
- Reuse geometry instances — don't create duplicates.

### Renderer
- `renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))` — cap at 2x.
- Enable `renderer.powerPreference = 'high-performance'` on mobile.
- Use `alpha: true` only if you need transparent background.
- Consider `antialias: false` + FXAA post-processing for better perf on complex scenes.

### Animation loop
- **Pause when off-screen** — use IntersectionObserver.
- Reuse objects (Vector3, Matrix4, Quaternion) — never allocate in the loop.
- `Clock.getElapsedTime()` or `Clock.getDelta()` for frame-independent animation.
- R3F: mutations in `useFrame`, never in React state (`useState` triggers re-render).

### Memory & disposal (CRITICAL)
```js
// Always dispose on unmount:
geometry.dispose()
material.dispose()
texture.dispose()
renderer.dispose()
controls?.dispose()
// Traverse scene for deep cleanup:
scene.traverse((obj) => {
  if (obj.geometry) obj.geometry.dispose()
  if (obj.material) {
    const materials = Array.isArray(obj.material) ? obj.material : [obj.material]
    materials.forEach(m => {
      Object.values(m).forEach(v => { if (v?.dispose) v.dispose() })
      m.dispose()
    })
  }
})
```

### Mobile
- Reduce geometry complexity and particle count.
- Lower pixel ratio: `Math.min(devicePixelRatio, 1.5)`.
- Disable post-processing or reduce passes.
- Consider static renders (render once + CSS transform) for decorative 3D.
- Respect `prefers-reduced-motion` — show static frame or skip 3D entirely.

### Monitoring
- **r3f-perf** for React Three Fiber stats.
- **stats.js** for vanilla Three.js FPS/memory.
- **Spector.js** browser extension for WebGL call inspection.

## Accessibility

- Canvas elements: `aria-hidden="true"` (decorative 3D).
- If 3D is interactive: provide keyboard alternatives and ARIA descriptions.
- Respect `prefers-reduced-motion`: pause or show static fallback.
- Never use 3D as the only way to convey information.
- Provide text alternatives for content shown only in 3D.

## WebGPU (Three.js r171+)

```js
import * as THREE from 'three/webgpu'

const renderer = new THREE.WebGPURenderer({ canvas, alpha: true })
await renderer.init() // async initialization required
// Rest of the API is the same as WebGLRenderer
```

Use WebGPU when:
- Targeting modern browsers (Chrome 113+, Firefox 130+, Safari 26+)
- Scene is GPU-heavy (many draw calls, complex shaders)
- You need compute shaders

Fallback to WebGL for broader compatibility.
