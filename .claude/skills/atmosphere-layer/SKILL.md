---
name: atmosphere-layer
description: >
  Mandatory atmospheric WebGL/Canvas layer. Ships with EVERY project — no opt-out.
  Contains 5 ready-to-use presets with complete code. Canvas responds to mouse AND scroll.
  Mobile fallback is CSS-based (never hidden). Replaces threejs-3d.
triggers:
  - "Three.js"
  - "3D"
  - "WebGL"
  - "shader"
  - "particles"
  - "atmosphere"
  - "canvas"
  - "atmosfera"
  - "particulas"
  - "atmosphere-layer"
  - "TresJS"
  - "generative"
  - "noise"
---

# Atmosphere Layer

Every project ships with a persistent atmospheric canvas. This is NOT optional. The canvas creates the living, breathing foundation that separates award-level sites from templates.

**HARD RULES**:
1. Every project gets at minimum ONE persistent atmospheric element
2. Canvas responds to MOUSE position (cursor affects the atmosphere)
3. Canvas responds to SCROLL position (scroll affects the atmosphere)
4. Mobile gets a CSS-based fallback (NOT hidden, NOT "display: none")
5. Performance budget: < 5ms per frame on desktop, < 8ms on mobile
6. `prefers-reduced-motion`: static state, no animation
7. Cleanup: dispose geometry, materials, textures, renderer on unmount

---

## Integration Architecture

The atmospheric canvas is a FIXED, full-viewport element that sits BEHIND all content:

```
z-index: -1  →  Atmospheric Canvas (fixed, full viewport)
z-index: 0   →  Page content (sections stack on top)
z-index: 100 →  Navigation
z-index: 900 →  Custom cursor
```

Some sections let the canvas show through (transparent background). Others cover it (solid background). This is specified in the design-brief's per-section atmosphere field.

```vue
<!-- src/components/AtmosphereCanvas.vue -->
<template>
  <canvas
    ref="canvasRef"
    class="atmosphere-canvas"
    aria-hidden="true"
  />
</template>

<style scoped>
.atmosphere-canvas {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: var(--z-canvas, -1);
  pointer-events: none;
}

@media (prefers-reduced-motion: reduce) {
  .atmosphere-canvas {
    display: none;
  }
}
</style>
```

---

## 5 Atmospheric Presets

Choose based on project personality. The `creative-director` specifies which preset in the design-brief.

### Preset 1 — Noise Mesh

Animated simplex noise surface. Organic, fluid feel. Good for: luxury, nature, wellness, editorial.

```vue
<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'

const canvasRef = ref(null)
let renderer, scene, camera, mesh, uniforms, animId
let mouse = { x: 0.5, y: 0.5 }
let scroll = 0

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = `
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uScroll;
  uniform vec2 uResolution;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  varying vec2 vUv;

  // Simplex noise function
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                       -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m * m; m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    vec2 uv = vUv;

    // Mouse influence (distort UV)
    float mouseDist = distance(uv, uMouse);
    uv += (uMouse - 0.5) * 0.05 * smoothstep(0.5, 0.0, mouseDist);

    // Noise layers
    float n1 = snoise(uv * 3.0 + uTime * 0.1 + uScroll * 0.5);
    float n2 = snoise(uv * 6.0 - uTime * 0.05) * 0.5;
    float n = (n1 + n2) * 0.5 + 0.5;

    // Color mixing
    vec3 color = mix(uColorA, uColorB, n);

    // Vignette
    float vignette = 1.0 - smoothstep(0.3, 0.9, distance(uv, vec2(0.5)));
    color *= 0.7 + vignette * 0.3;

    gl_FragColor = vec4(color, 0.6); // Semi-transparent — blends with page bg
  }
`

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  if (!canvasRef.value) return

  // Setup renderer
  renderer = new THREE.WebGLRenderer({
    canvas: canvasRef.value,
    alpha: true,
    antialias: false,
    powerPreference: 'low-power'
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(window.innerWidth, window.innerHeight)

  scene = new THREE.Scene()
  camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

  // Colors from design-brief CSS custom properties
  const styles = getComputedStyle(document.documentElement)
  const colorA = new THREE.Color(styles.getPropertyValue('--color-atmosphere-warm').trim() || '#1a1a2e')
  const colorB = new THREE.Color(styles.getPropertyValue('--color-atmosphere-cool').trim() || '#0a0a1a')

  uniforms = {
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    uScroll: { value: 0 },
    uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    uColorA: { value: colorA },
    uColorB: { value: colorB },
  }

  const geometry = new THREE.PlaneGeometry(2, 2)
  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
    transparent: true
  })

  mesh = new THREE.Mesh(geometry, material)
  scene.add(mesh)

  // Mouse tracking
  document.addEventListener('mousemove', onMouseMove)
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onResize)

  animate()
})

function onMouseMove(e) {
  mouse.x = e.clientX / window.innerWidth
  mouse.y = 1 - (e.clientY / window.innerHeight) // Flip Y for shader
}

function onScroll() {
  scroll = window.scrollY / (document.body.scrollHeight - window.innerHeight)
}

function onResize() {
  renderer?.setSize(window.innerWidth, window.innerHeight)
  if (uniforms) {
    uniforms.uResolution.value.set(window.innerWidth, window.innerHeight)
  }
}

function animate() {
  animId = requestAnimationFrame(animate)
  if (!uniforms) return

  uniforms.uTime.value += 0.005  // Slow animation speed
  // Lerp mouse for smoothness
  uniforms.uMouse.value.x += (mouse.x - uniforms.uMouse.value.x) * 0.05
  uniforms.uMouse.value.y += (mouse.y - uniforms.uMouse.value.y) * 0.05
  uniforms.uScroll.value = scroll

  renderer.render(scene, camera)
}

onBeforeUnmount(() => {
  cancelAnimationFrame(animId)
  document.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onResize)

  // Dispose Three.js resources
  mesh?.geometry?.dispose()
  mesh?.material?.dispose()
  renderer?.dispose()
  renderer = null
})
</script>
```

### Preset 2 — Particle Field

Floating particles with cursor repulsion. Good for: tech, SaaS, fintech, digital.

```js
// Canvas 2D approach — lighter than Three.js
const PARTICLE_COUNT = 800 // Desktop. Mobile: 200
const CONNECT_DISTANCE = 120

class Particle {
  constructor(w, h) {
    this.x = Math.random() * w
    this.y = Math.random() * h
    this.vx = (Math.random() - 0.5) * 0.3
    this.vy = (Math.random() - 0.5) * 0.3
    this.radius = Math.random() * 1.5 + 0.5
  }

  update(w, h, mx, my) {
    // Cursor repulsion
    const dx = this.x - mx
    const dy = this.y - my
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist < 150) {
      const force = (150 - dist) / 150
      this.vx += (dx / dist) * force * 0.2
      this.vy += (dy / dist) * force * 0.2
    }

    // Apply velocity with damping
    this.vx *= 0.98
    this.vy *= 0.98
    this.x += this.vx
    this.y += this.vy

    // Wrap edges
    if (this.x < 0) this.x = w
    if (this.x > w) this.x = 0
    if (this.y < 0) this.y = h
    if (this.y > h) this.y = 0
  }
}

// In onMounted:
const ctx = canvas.getContext('2d')
const particles = Array.from({ length: PARTICLE_COUNT }, () =>
  new Particle(canvas.width, canvas.height)
)

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // Get signal color from CSS
  const color = getComputedStyle(document.documentElement)
    .getPropertyValue('--color-signal').trim() || '#fff'

  // Draw particles
  particles.forEach(p => {
    p.update(canvas.width, canvas.height, mouse.x, mouse.y)
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
    ctx.fillStyle = color
    ctx.globalAlpha = 0.4
    ctx.fill()
  })

  // Draw connections between close particles
  ctx.globalAlpha = 0.08
  ctx.strokeStyle = color
  ctx.lineWidth = 0.5
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x
      const dy = particles[i].y - particles[j].y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < CONNECT_DISTANCE) {
        ctx.globalAlpha = 0.08 * (1 - dist / CONNECT_DISTANCE)
        ctx.beginPath()
        ctx.moveTo(particles[i].x, particles[i].y)
        ctx.lineTo(particles[j].x, particles[j].y)
        ctx.stroke()
      }
    }
  }

  animId = requestAnimationFrame(draw)
}
```

### Preset 3 — Gradient Orb

Animated mesh gradient blob. Good for: creative agencies, luxury, art, fashion.

```js
// Canvas 2D — organic gradient blob with cursor follow
let orb = { x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5, radius: 300 }

function drawOrb() {
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // Lerp orb position toward mouse (spring feel)
  orb.x += (orb.targetX - orb.x) * 0.02
  orb.y += (orb.targetY - orb.y) * 0.02

  const time = Date.now() * 0.001
  const cx = orb.x * canvas.width
  const cy = orb.y * canvas.height

  // Pulsing radius
  const r = orb.radius + Math.sin(time * 0.5) * 50

  // Main gradient orb
  const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
  gradient.addColorStop(0, 'var(--color-signal-glow)'.replace('var(--color-signal-glow)', 'rgba(100, 60, 200, 0.3)'))
  gradient.addColorStop(0.5, 'rgba(60, 30, 150, 0.1)')
  gradient.addColorStop(1, 'transparent')

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Secondary orb (opposite movement)
  const cx2 = canvas.width - cx + Math.sin(time * 0.3) * 100
  const cy2 = canvas.height - cy + Math.cos(time * 0.4) * 80
  const gradient2 = ctx.createRadialGradient(cx2, cy2, 0, cx2, cy2, r * 0.7)
  gradient2.addColorStop(0, 'rgba(200, 60, 100, 0.2)')
  gradient2.addColorStop(1, 'transparent')

  ctx.fillStyle = gradient2
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  animId = requestAnimationFrame(drawOrb)
}

// Update target on mouse move
document.addEventListener('mousemove', (e) => {
  orb.targetX = e.clientX / window.innerWidth
  orb.targetY = e.clientY / window.innerHeight
})

// Scroll affects radius
window.addEventListener('scroll', () => {
  const progress = window.scrollY / (document.body.scrollHeight - window.innerHeight)
  orb.radius = 300 + progress * 200
}, { passive: true })
```

### Preset 4 — Grid Distortion

Wireframe grid with vertex displacement. Good for: architecture, tech, minimal, editorial.

```js
// Canvas 2D wireframe grid with mouse distortion
const GRID_SIZE = 40
const DISTORT_RADIUS = 200
const DISTORT_STRENGTH = 30

function drawGrid() {
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  const color = getComputedStyle(document.documentElement)
    .getPropertyValue('--color-border').trim() || 'rgba(255,255,255,0.08)'

  ctx.strokeStyle = color
  ctx.lineWidth = 0.5

  const cols = Math.ceil(canvas.width / GRID_SIZE) + 1
  const rows = Math.ceil(canvas.height / GRID_SIZE) + 1

  // Vertical lines
  for (let i = 0; i < cols; i++) {
    ctx.beginPath()
    for (let j = 0; j <= rows; j++) {
      let x = i * GRID_SIZE
      let y = j * GRID_SIZE

      // Mouse distortion
      const dx = x - mouse.x
      const dy = y - mouse.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < DISTORT_RADIUS) {
        const force = (1 - dist / DISTORT_RADIUS) * DISTORT_STRENGTH
        x += (dx / dist) * force
        y += (dy / dist) * force
      }

      if (j === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()
  }

  // Horizontal lines
  for (let j = 0; j < rows; j++) {
    ctx.beginPath()
    for (let i = 0; i <= cols; i++) {
      let x = i * GRID_SIZE
      let y = j * GRID_SIZE

      const dx = x - mouse.x
      const dy = y - mouse.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < DISTORT_RADIUS) {
        const force = (1 - dist / DISTORT_RADIUS) * DISTORT_STRENGTH
        x += (dx / dist) * force
        y += (dy / dist) * force
      }

      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()
  }

  // Highlight near cursor
  ctx.fillStyle = 'rgba(var(--signal-rgb, 100, 100, 255), 0.03)'
  ctx.beginPath()
  ctx.arc(mouse.x, mouse.y, DISTORT_RADIUS, 0, Math.PI * 2)
  ctx.fill()

  animId = requestAnimationFrame(drawGrid)
}
```

### Preset 5 — Aurora Waves

Layered sine waves with color gradients. Good for: wellness, music, hospitality, organic.

```js
// Canvas 2D aurora-style waves
const WAVE_COUNT = 5

function drawAurora() {
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  const time = Date.now() * 0.0005
  const scrollInfluence = scroll * 2

  for (let w = 0; w < WAVE_COUNT; w++) {
    const hue = 200 + w * 30 + scrollInfluence * 50  // Color shifts on scroll
    const alpha = 0.08 - w * 0.01
    const yOffset = canvas.height * (0.3 + w * 0.1)
    const amplitude = 80 + w * 20 + Math.sin(time + w) * 30
    const frequency = 0.002 + w * 0.0005

    // Mouse influence on wave
    const mouseInfluence = (mouse.x - 0.5) * 100

    ctx.beginPath()
    ctx.moveTo(0, canvas.height)

    for (let x = 0; x <= canvas.width; x += 4) {
      const normalX = x / canvas.width
      const mouseProximity = 1 - Math.abs(normalX - mouse.x) * 2
      const mouseAmp = mouseProximity > 0 ? mouseProximity * mouseInfluence : 0

      const y = yOffset +
        Math.sin(x * frequency + time * (1 + w * 0.2)) * amplitude +
        Math.cos(x * frequency * 0.5 + time * 0.5) * amplitude * 0.5 +
        mouseAmp

      ctx.lineTo(x, y)
    }

    ctx.lineTo(canvas.width, canvas.height)
    ctx.closePath()

    const gradient = ctx.createLinearGradient(0, yOffset - amplitude, 0, canvas.height)
    gradient.addColorStop(0, `hsla(${hue}, 60%, 50%, ${alpha})`)
    gradient.addColorStop(1, 'transparent')

    ctx.fillStyle = gradient
    ctx.fill()
  }

  animId = requestAnimationFrame(drawAurora)
}
```

---

## Mobile Fallback

On mobile (< 768px or touch devices), replace canvas with CSS-based atmosphere:

```css
/* Mobile atmospheric fallback — NEVER hidden */
@media (max-width: 768px), (hover: none) {
  .atmosphere-canvas {
    display: none; /* Hide WebGL canvas */
  }

  /* CSS-based atmosphere instead */
  .atmosphere-fallback {
    position: fixed;
    inset: 0;
    z-index: var(--z-canvas);
    pointer-events: none;
    background:
      radial-gradient(
        ellipse at 30% 20%,
        var(--color-atmosphere-warm) 0%,
        transparent 50%
      ),
      radial-gradient(
        ellipse at 70% 80%,
        var(--color-atmosphere-cool) 0%,
        transparent 50%
      );
    opacity: 0.4;
    animation: atmosphere-drift 20s ease-in-out infinite alternate;
  }

  @keyframes atmosphere-drift {
    0% { transform: translate(0, 0) scale(1); }
    50% { transform: translate(-3%, 2%) scale(1.05); }
    100% { transform: translate(2%, -3%) scale(1.02); }
  }

  @media (prefers-reduced-motion: reduce) {
    .atmosphere-fallback {
      animation: none;
    }
  }
}
```

```vue
<!-- Add to AtmosphereCanvas.vue template -->
<template>
  <canvas ref="canvasRef" class="atmosphere-canvas" aria-hidden="true" />
  <div class="atmosphere-fallback" aria-hidden="true"></div>
</template>
```

---

## Performance Guard

```js
// Monitor frame time
let lastTime = performance.now()
let slowFrames = 0

function animate() {
  const now = performance.now()
  const delta = now - lastTime
  lastTime = now

  // If frame takes > 16ms consistently, reduce quality
  if (delta > 16) slowFrames++
  else slowFrames = Math.max(0, slowFrames - 1)

  if (slowFrames > 30) {
    // Reduce particle count, lower resolution, or switch to CSS fallback
    reduceQuality()
    slowFrames = 0
  }

  // ... render
  animId = requestAnimationFrame(animate)
}

function reduceQuality() {
  // Lower pixel ratio
  renderer?.setPixelRatio(1)
  // Or reduce particle count
  // Or switch to simpler shader
}
```

---

## Cleanup (NON-NEGOTIABLE)

```js
onBeforeUnmount(() => {
  cancelAnimationFrame(animId)

  // Remove event listeners
  document.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onResize)

  // Dispose Three.js (if used)
  if (mesh) {
    mesh.geometry?.dispose()
    mesh.material?.dispose()
    if (mesh.material?.uniforms) {
      Object.values(mesh.material.uniforms).forEach(u => {
        if (u.value?.dispose) u.value.dispose()
      })
    }
  }
  if (renderer) {
    renderer.dispose()
    renderer.forceContextLoss()
    renderer = null
  }
  scene = null
  camera = null
})
```

---

## Output Checklist

After implementing the atmosphere layer:

- [ ] Persistent canvas element exists at `z-index: -1`
- [ ] Canvas responds to mouse position (elements move/distort toward cursor)
- [ ] Canvas responds to scroll position (visual change as page scrolls)
- [ ] Mobile has CSS-based fallback (NOT hidden)
- [ ] `prefers-reduced-motion` respected (canvas hidden or static)
- [ ] Performance < 5ms/frame on desktop
- [ ] All Three.js/Canvas resources disposed on unmount
- [ ] Colors read from CSS custom properties (respects design-brief tokens)
- [ ] Sections with transparent backgrounds reveal the canvas
- [ ] Sections with solid backgrounds layer above the canvas
