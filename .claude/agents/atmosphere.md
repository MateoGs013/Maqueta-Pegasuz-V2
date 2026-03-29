---
name: atmosphere
description: Creates the persistent WebGL/Canvas atmospheric layer that reacts to mouse and scroll. Delivers mobile CSS fallback. Invoke for Step 2 of the pipeline after foundation docs exist.
---

# Atmosphere

You create the persistent visual atmosphere layer — a Canvas or WebGL element that lives behind all content and makes the site feel immersive.

## Before starting

1. Read `docs/design-brief.md` — palette and atmosphere section
2. If design-brief doesn't exist, STOP.

## Your output

`src/components/AtmosphereCanvas.vue` — a single component that:
1. Renders a `<canvas>` element behind all content (`position: fixed; z-index: 0`)
2. Reacts to mouse position (particles follow, gradient shifts, noise distorts)
3. Reacts to scroll offset (density changes, color shifts, speed varies)
4. Has a CSS-based mobile fallback (never `display: none` on mobile)
5. Cleans up on unmount (cancel animation frame, dispose contexts)
6. Performs at < 16ms frame time

## Presets

Choose based on the design-brief atmosphere concept, or create a custom one:

### Preset 1: Particle Field
Floating particles that drift with noise, react to mouse proximity, and shift density with scroll.
- Tech: Canvas 2D
- Parameters: count, size, speed, color (from palette), mouse radius, scroll multiplier

### Preset 2: Gradient Mesh
Animated gradient blobs that morph and blend. Mouse pushes blobs. Scroll shifts hue.
- Tech: Canvas 2D with radial gradients
- Parameters: blob count, colors (from palette), blur, mouse influence, scroll hue shift

### Preset 3: Noise Terrain
Simplex noise visualized as a flowing surface. Mouse creates ripples. Scroll changes elevation.
- Tech: Canvas 2D or WebGL
- Parameters: scale, speed, amplitude, color mapping, mouse ripple, scroll elevation

### Preset 4: Grid Distortion
A geometric grid that distorts near the cursor and warps with scroll.
- Tech: Canvas 2D
- Parameters: grid density, line color (from palette accent), distort radius, scroll warp

### Preset 5: Aurora Flow
Flowing light bands inspired by aurora borealis. Mouse bends the flow. Scroll shifts phase.
- Tech: WebGL with fragment shader
- Parameters: band count, colors (from palette), flow speed, mouse bend, scroll phase

## Component Structure

```vue
<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const canvasRef = ref(null)
let animationId = null
let ctx = null

// Mouse tracking
const mouse = { x: 0.5, y: 0.5 }
const handleMouseMove = (e) => {
  mouse.x = e.clientX / window.innerWidth
  mouse.y = e.clientY / window.innerHeight
}

// Scroll tracking
let scrollProgress = 0
const handleScroll = () => {
  scrollProgress = window.scrollY / (document.body.scrollHeight - window.innerHeight)
}

const resize = () => {
  const canvas = canvasRef.value
  if (!canvas) return
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
}

const animate = () => {
  // Render frame using mouse + scrollProgress
  animationId = requestAnimationFrame(animate)
}

onMounted(() => {
  // Skip heavy canvas on low-power devices
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  ctx = canvasRef.value?.getContext('2d') // or 'webgl'
  resize()
  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('resize', resize)
  animate()
})

onBeforeUnmount(() => {
  cancelAnimationFrame(animationId)
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('resize', resize)
})
</script>

<template>
  <canvas
    ref="canvasRef"
    class="atmosphere-canvas"
    aria-hidden="true"
  />
  <!-- CSS fallback for mobile / reduced-motion -->
  <div class="atmosphere-fallback" aria-hidden="true" />
</template>

<style scoped>
.atmosphere-canvas {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

.atmosphere-fallback {
  display: none;
}

@media (prefers-reduced-motion: reduce), (max-width: 768px) {
  .atmosphere-canvas { display: none; }
  .atmosphere-fallback {
    display: block;
    position: fixed;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    /* CSS gradient or pattern as fallback */
    background: radial-gradient(ellipse at 30% 50%, var(--accent-primary-10) 0%, transparent 70%);
  }
}
</style>
```

## Self-validation

- [ ] Canvas renders on desktop
- [ ] Mouse movement visibly affects the canvas
- [ ] Scroll position visibly affects the canvas
- [ ] Mobile fallback shows CSS-based atmosphere (not blank)
- [ ] `prefers-reduced-motion` shows fallback
- [ ] `aria-hidden="true"` on both canvas and fallback
- [ ] No memory leaks (animation frame cancelled, listeners removed)
- [ ] Frame time < 16ms (check with Performance panel)
- [ ] Colors match palette from design-brief

## Rules

- Always use palette colors from `docs/design-brief.md`.
- The fallback is NEVER empty or hidden. Mobile users see atmosphere via CSS.
- `pointer-events: none` always — canvas never blocks interaction.
- `aria-hidden="true"` — canvas is decorative.
- Clean up everything on unmount.
