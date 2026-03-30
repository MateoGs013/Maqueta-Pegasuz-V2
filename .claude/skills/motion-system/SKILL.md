---
name: motion-system
description: >
  Full motion choreography with mandatory variety enforcement and repeat detection.
  Implements Lenis smooth scroll, custom cursor, page transitions, preloader, and
  per-section reveals. Every project ships with these — none are optional.
  Replaces gsap-motion.
triggers:
  - "animation"
  - "GSAP"
  - "scroll"
  - "reveal"
  - "parallax"
  - "transition"
  - "motion"
  - "animate"
  - "animacion"
  - "efecto"
  - "motion-system"
  - "cursor"
  - "preloader"
  - "page transition"
---

# Motion System

You implement the complete motion layer for web projects. Motion is NOT decoration — it is the personality of the site. Every site ships with a MANDATORY BASELINE of motion features. Nothing is optional.

**HARD RULES**:
1. Every project gets: Lenis + custom cursor + magnetic buttons + page transitions + preloader + section reveals
2. No two consecutive sections share a motion technique category
3. Brand easing is NEVER power3.out, power4.out, or ease-in-out
4. Only animate `transform` and `opacity` (GPU-composited). NEVER width/height/top/left/margin/padding
5. `prefers-reduced-motion` via `gsap.matchMedia()` — NOT manual `window.matchMedia` checks
6. `gsap.matchMedia()` + `mm.revert()` in EVERY component (replaces `gsap.context()` + `ctx.revert()`)
7. `autoAlpha` instead of `opacity` for ALL fade animations
8. `gsap.quickTo()` for mouse followers — never create new tweens on mousemove
9. `SplitText.create()` with `autoSplit`, `mask`, `aria: 'auto'` for ALL text reveals
10. `ScrollTrigger.batch()` for grid/list items — not individual triggers per element
11. Register plugins in `main.js` — NEVER inside components
12. Never nest `gsap.context()` inside `gsap.matchMedia()` — matchMedia creates its own context

---

## Inputs

1. `docs/tokens.md` — palette, easing curves, durations, atmosphere spec
2. `docs/sections.md` — cinematic descriptions with motion assignments per section
3. `docs/_libraries/motion-categories.md` — GSAP code snippets for each technique

---

## Mandatory Baseline

Every project ships with ALL of these. Not some. ALL.

### 1. Lenis Smooth Scroll

```js
// src/composables/useLenis.js
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ref, onMounted, onBeforeUnmount } from 'vue'

gsap.registerPlugin(ScrollTrigger)

let lenis = null

export function useLenis() {
  const isLocked = ref(false)

  function init() {
    if (lenis) return lenis

    lenis = new Lenis({
      lerp: 0.08,           // Smoothness — lower = smoother (0.05-0.12)
      wheelMultiplier: 0.8,  // Scroll speed — lower = slower
      touchMultiplier: 1.5,  // Mobile scroll speed
      infinite: false,
    })

    // Connect Lenis to GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update)

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000)
    })
    gsap.ticker.lagSmoothing(0)

    return lenis
  }

  function lock() {
    lenis?.stop()
    isLocked.value = true
  }

  function unlock() {
    lenis?.start()
    isLocked.value = false
  }

  function scrollTo(target, options = {}) {
    lenis?.scrollTo(target, {
      offset: 0,
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // easeOutExpo
      ...options
    })
  }

  function destroy() {
    lenis?.destroy()
    lenis = null
  }

  return { init, lock, unlock, scrollTo, destroy, isLocked, getInstance: () => lenis }
}
```

```js
// In App.vue setup
import { useLenis } from '@/composables/useLenis'

const { init, destroy } = useLenis()
onMounted(() => init())
onBeforeUnmount(() => destroy())
```

### 2. Custom Cursor

```vue
<!-- src/components/AppCursor.vue -->
<template>
  <div
    ref="cursorRef"
    class="cursor"
    :class="[
      `cursor--${state}`,
      { 'cursor--hidden': isHidden }
    ]"
    aria-hidden="true"
  >
    <div class="cursor__dot"></div>
    <div class="cursor__ring"></div>
    <span v-if="label" class="cursor__label">{{ label }}</span>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { gsap } from 'gsap'

const cursorRef = ref(null)
const state = ref('default')    // default, hover, text, loading, hidden
const label = ref('')
const isHidden = ref(false)
let mouse = { x: 0, y: 0 }

let mm = null

onMounted(() => {
  // gsap.matchMedia handles touch detection + reduced-motion in one structure
  mm = gsap.matchMedia()
  mm.add({
    canHover: '(hover: hover)',
    noReduce: '(prefers-reduced-motion: no-preference)'
  }, (context) => {
    const { canHover, noReduce } = context.conditions
    if (!canHover || !noReduce) {
      isHidden.value = true
      return
    }

    // Hide default cursor
    document.body.style.cursor = 'none'

    const dot = cursorRef.value.querySelector('.cursor__dot')
    const ring = cursorRef.value.querySelector('.cursor__ring')

    // gsap.quickTo() — reuses single tween per property (critical for 60fps)
    const dotX = gsap.quickTo(dot, 'x', { duration: 0.1, ease: 'power2.out' })
    const dotY = gsap.quickTo(dot, 'y', { duration: 0.1, ease: 'power2.out' })
    const ringX = gsap.quickTo(ring, 'x', { duration: 0.4, ease: 'power3.out' })
    const ringY = gsap.quickTo(ring, 'y', { duration: 0.4, ease: 'power3.out' })

    document.addEventListener('mousemove', (e) => {
      dotX(e.clientX); dotY(e.clientY)
      ringX(e.clientX); ringY(e.clientY)
    })

    // State detection
    document.addEventListener('mouseover', (e) => {
      const target = e.target.closest('[data-cursor]')
      if (target) {
        state.value = target.dataset.cursor
        label.value = target.dataset.cursorLabel || ''
      }
    })

    document.addEventListener('mouseout', (e) => {
      const target = e.target.closest('[data-cursor]')
      if (target) {
        state.value = 'default'
        label.value = ''
      }
    })

    // Hide when leaving window
    document.addEventListener('mouseleave', () => { isHidden.value = true })
    document.addEventListener('mouseenter', () => { isHidden.value = false })

    // matchMedia auto-reverts on condition change (e.g., connecting mouse/trackpad)
  })
})

onBeforeUnmount(() => {
  mm?.revert()
  document.body.style.cursor = ''
})
</script>

<style scoped>
.cursor {
  position: fixed;
  top: 0;
  left: 0;
  z-index: var(--z-cursor, 9999);
  pointer-events: none;
  mix-blend-mode: difference; /* or 'normal' depending on design-brief */
}

.cursor__dot,
.cursor__ring {
  position: absolute;
  border-radius: 50%;
  transform: translate(-50%, -50%);
}

.cursor__dot {
  width: 6px;
  height: 6px;
  background: var(--color-ink, #fff);
}

.cursor__ring {
  width: 36px;
  height: 36px;
  border: 1.5px solid var(--color-ink, #fff);
  opacity: 0.5;
  transition: width 0.3s var(--ease-out), height 0.3s var(--ease-out), opacity 0.3s;
}

/* States */
.cursor--hover .cursor__ring {
  width: 60px;
  height: 60px;
  opacity: 0.3;
}

.cursor--text .cursor__ring {
  width: 4px;
  height: 24px;
  border-radius: 2px;
  opacity: 0.8;
}

.cursor--loading .cursor__ring {
  animation: cursor-pulse 1s ease-in-out infinite;
}

.cursor--hidden {
  opacity: 0;
}

.cursor__label {
  position: absolute;
  transform: translate(20px, -50%);
  font-size: 0.7rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  white-space: nowrap;
}

@keyframes cursor-pulse {
  0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
  50% { transform: translate(-50%, -50%) scale(1.5); opacity: 0.2; }
}

/* Respect reduced motion */
@media (prefers-reduced-motion: reduce) {
  .cursor { display: none; }
}

/* Hide on touch devices */
@media (hover: none) {
  .cursor { display: none; }
}
</style>
```

**Usage in HTML** — add `data-cursor` attributes:
```html
<a href="/about" data-cursor="hover">About</a>
<p data-cursor="text">Read this paragraph</p>
<button data-cursor="hover" data-cursor-label="View">Project Card</button>
<video data-cursor="hidden">...</video>
```

### 3. Magnetic Buttons

```js
// src/composables/useMagnetic.js
import { gsap } from 'gsap'
import { onMounted, onBeforeUnmount } from 'vue'

export function useMagnetic(elRef, options = {}) {
  const { strength = 0.35, radius = 100, ease = 'power2.out', springBack = 'elastic.out(1, 0.4)' } = options
  let bounds = null

  function onMove(e) {
    if (!bounds) return
    const dx = e.clientX - bounds.cx
    const dy = e.clientY - bounds.cy
    const dist = Math.sqrt(dx * dx + dy * dy)

    if (dist < radius) {
      gsap.to(elRef.value, {
        x: dx * strength,
        y: dy * strength,
        duration: 0.3,
        ease
      })
    }
  }

  function onLeave() {
    gsap.to(elRef.value, {
      x: 0,
      y: 0,
      duration: 0.6,
      ease: springBack
    })
  }

  function updateBounds() {
    if (!elRef.value) return
    const rect = elRef.value.getBoundingClientRect()
    bounds = {
      cx: rect.left + rect.width / 2,
      cy: rect.top + rect.height / 2
    }
  }

  onMounted(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (!elRef.value) return

    updateBounds()
    elRef.value.addEventListener('mousemove', onMove)
    elRef.value.addEventListener('mouseleave', onLeave)
    window.addEventListener('scroll', updateBounds, { passive: true })
  })

  onBeforeUnmount(() => {
    elRef.value?.removeEventListener('mousemove', onMove)
    elRef.value?.removeEventListener('mouseleave', onLeave)
    window.removeEventListener('scroll', updateBounds)
  })
}
```

### 4. Page Transitions

```vue
<!-- In App.vue or a transition wrapper -->
<template>
  <div ref="transitionOverlay" class="page-transition" aria-hidden="true"></div>

  <router-view v-slot="{ Component, route }">
    <transition
      :name="transitionName"
      mode="out-in"
      @before-leave="onLeave"
      @enter="onEnter"
    >
      <component :is="Component" :key="route.path" />
    </transition>
  </router-view>
</template>

<script setup>
import { ref } from 'vue'
import { gsap } from 'gsap'

const transitionOverlay = ref(null)
const transitionName = ref('page')

function onLeave(el, done) {
  const tl = gsap.timeline({ onComplete: done })

  // 1. Fade content
  tl.to(el, {
    opacity: 0,
    y: -20,
    duration: 0.4,
    ease: 'power3.in'
  })

  // 2. Slide overlay up
  tl.to(transitionOverlay.value, {
    scaleY: 1,
    transformOrigin: 'bottom',
    duration: 0.5,
    ease: 'power4.inOut'
  }, '-=0.2')
}

function onEnter(el, done) {
  const tl = gsap.timeline({ onComplete: done })

  // 1. Slide overlay away
  tl.to(transitionOverlay.value, {
    scaleY: 0,
    transformOrigin: 'top',
    duration: 0.5,
    ease: 'power4.inOut'
  })

  // 2. Fade content in
  tl.from(el, {
    opacity: 0,
    y: 20,
    duration: 0.5,
    ease: 'power3.out'
  }, '-=0.3')

  // 3. Scroll to top
  window.scrollTo(0, 0)
}
</script>

<style>
.page-transition {
  position: fixed;
  inset: 0;
  background: var(--color-signal);
  z-index: var(--z-overlay);
  transform: scaleY(0);
  transform-origin: bottom;
  pointer-events: none;
}
</style>
```

### 5. Preloader

```vue
<!-- src/components/AppPreloader.vue -->
<template>
  <div
    v-if="!isDone"
    ref="preloaderRef"
    class="preloader"
    role="status"
    aria-label="Loading"
  >
    <div class="preloader__content">
      <!-- Brand-themed loading — NOT a spinner -->
      <div class="preloader__brand">{{ brandName }}</div>
      <div class="preloader__bar">
        <div ref="progressRef" class="preloader__progress"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { gsap } from 'gsap'

const props = defineProps({
  brandName: { type: String, default: 'Loading' },
  minDuration: { type: Number, default: 1.5 }
})

const emit = defineEmits(['complete'])
const preloaderRef = ref(null)
const progressRef = ref(null)
const isDone = ref(false)

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    isDone.value = true
    emit('complete')
    return
  }

  const tl = gsap.timeline({
    onComplete: () => {
      // Exit animation
      gsap.to(preloaderRef.value, {
        yPercent: -100,
        duration: 0.8,
        ease: 'power4.inOut',
        onComplete: () => {
          isDone.value = true
          emit('complete')
        }
      })
    }
  })

  // Brand name entrance
  tl.from('.preloader__brand', {
    autoAlpha: 0,
    y: 20,
    duration: 0.6,
    ease: 'power3.out'
  })

  // Progress bar fill
  tl.to(progressRef.value, {
    scaleX: 1,
    transformOrigin: 'left',
    duration: props.minDuration,
    ease: 'power2.inOut'
  }, '-=0.3')
})
</script>

<style scoped>
.preloader {
  position: fixed;
  inset: 0;
  z-index: 10000;
  background: var(--color-canvas);
  display: grid;
  place-items: center;
}

.preloader__content {
  text-align: center;
}

.preloader__brand {
  font-family: var(--font-display);
  font-size: var(--text-heading);
  letter-spacing: var(--tracking-display);
  color: var(--color-ink);
  margin-bottom: var(--space-lg);
}

.preloader__bar {
  width: 200px;
  height: 2px;
  background: var(--color-border);
  overflow: hidden;
}

.preloader__progress {
  width: 100%;
  height: 100%;
  background: var(--color-signal);
  transform: scaleX(0);
  transform-origin: left;
}
</style>
```

### 6. Hero Entrance Timeline

Every hero has a multi-step orchestrated entrance:

```js
// Minimum 4 steps — timing from motion-spec
function heroEntrance(section) {
  const tl = gsap.timeline({
    defaults: { ease: 'BRAND_EASING' } // from design-brief
  })

  // Step 1: Background/atmosphere enters (t=0)
  tl.from(section.querySelector('.hero__bg'), {
    scale: 1.1,
    autoAlpha: 0,
    duration: 1.2,
  })

  // Step 2: Headline enters (t=0.3)
  tl.from(section.querySelector('.hero__headline'), {
    autoAlpha: 0,
    y: 60,
    duration: 0.8,
  }, 0.3)

  // Step 3: Supporting text (t=0.6)
  tl.from(section.querySelector('.hero__body'), {
    autoAlpha: 0,
    y: 30,
    duration: 0.6,
  }, 0.6)

  // Step 4: CTA (t=0.9)
  tl.from(section.querySelector('.hero__cta'), {
    autoAlpha: 0,
    scale: 0.9,
    duration: 0.5,
  }, 0.9)

  // Step 5: Decorative elements (t=1.0)
  tl.from(section.querySelectorAll('.hero__accent'), {
    autoAlpha: 0,
    scale: 0.8,
    stagger: 0.1,
    duration: 0.6,
  }, 1.0)

  return tl
}
```

---

## 9 Motion Technique Categories (Complete Code)

### Category 1 — Timeline (Orchestrated Multi-Step)
```js
function animTimeline(section, elements) {
  const tl = gsap.timeline({
    scrollTrigger: { trigger: section, start: 'top 75%', once: true }
  })

  elements.forEach((el, i) => {
    tl.from(el, {
      autoAlpha: 0,
      y: 30 + (i * 5),   // Increasing offset for stagger feel
      duration: 0.6 + (i * 0.05),
      ease: 'BRAND_EASING'
    }, i * 0.15)  // Staggered start times
  })

  return tl
}
```

### Category 2 — Scrub (Scroll-Position-Linked)
```js
function animScrub(section, target, properties) {
  gsap.to(target, {
    ...properties,  // e.g., { x: '-50%', scale: 1.2, color: '#fff' }
    ease: 'none',
    scrollTrigger: {
      trigger: section,
      start: 'top bottom',
      end: 'bottom top',
      scrub: 0.5  // Smooth scrub (0.3-1.0)
    }
  })
}

// Word-by-word scrub reveal
function wordScrub(textEl) {
  const words = textEl.querySelectorAll('.word')
  gsap.from(words, {
    autoAlpha: 0.15,
    stagger: 0.05,
    ease: 'none',
    scrollTrigger: {
      trigger: textEl,
      start: 'top 80%',
      end: 'bottom 50%',
      scrub: 0.3
    }
  })
}
```

### Category 3 — Reveal (Clip-Path / Mask / Blur-to-Clear)
```js
// Clip-path from left
function revealClipPath(el, direction = 'left') {
  const clips = {
    left: { from: 'inset(0 100% 0 0)', to: 'inset(0 0% 0 0)' },
    right: { from: 'inset(0 0 0 100%)', to: 'inset(0 0 0 0%)' },
    top: { from: 'inset(100% 0 0 0)', to: 'inset(0% 0 0 0)' },
    bottom: { from: 'inset(0 0 100% 0)', to: 'inset(0 0 0% 0)' },
    center: { from: 'inset(50% 50% 50% 50%)', to: 'inset(0% 0% 0% 0%)' },
  }
  gsap.fromTo(el,
    { clipPath: clips[direction].from },
    {
      clipPath: clips[direction].to,
      duration: 1.2,
      ease: 'power4.inOut',
      scrollTrigger: { trigger: el, start: 'top 80%', once: true }
    }
  )
}

// Blur-to-clear (like Lanterne Architectes)
function revealBlur(el) {
  gsap.from(el, {
    filter: 'blur(20px)',
    autoAlpha: 0,
    scale: 0.95,
    duration: 1.0,
    ease: 'power3.out',
    scrollTrigger: { trigger: el, start: 'top 85%', once: true }
  })
}
```

### Category 4 — Stagger (Grid/List with Varied Delays)
```js
function animStagger(items, options = {}) {
  const {
    from = 'start',  // 'start', 'end', 'center', 'edges', 'random'
    each = 0.06,
    y = 40,
    scale = 0.95,
  } = options

  gsap.from(items, {
    autoAlpha: 0,
    y,
    scale,
    duration: 0.7,
    ease: 'BRAND_EASING',
    stagger: { each, from },
    scrollTrigger: {
      trigger: items[0]?.parentElement,
      start: 'top 80%',
      once: true
    }
  })
}
```

### Category 5 — Pin (Section Pinned While Content Transforms)
```js
function animPin(section, panels) {
  const totalScroll = panels.length * 100  // % of viewport

  ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: `+=${totalScroll}%`,
    pin: true,
    scrub: 1,
    onUpdate: (self) => {
      const progress = self.progress
      const activeIndex = Math.floor(progress * panels.length)

      panels.forEach((panel, i) => {
        if (i === activeIndex) {
          gsap.to(panel, { autoAlpha: 1, y: 0, duration: 0.3 })
        } else {
          gsap.to(panel, { autoAlpha: 0, y: i < activeIndex ? -30 : 30, duration: 0.3 })
        }
      })
    }
  })
}
```

### Category 6 — Depth (Parallax, Z-Layer, Scale-Based)
```js
// Multi-layer parallax
function animDepth(section, layers) {
  layers.forEach((layer, i) => {
    const speed = (i + 1) * 0.15  // Each layer moves at different speed

    gsap.to(layer, {
      yPercent: -speed * 100,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 0.5  // always 0.5 — smooth lag, not instant
      }
    })
  })
}

// Scale on scroll
function animScaleDepth(el) {
  gsap.fromTo(el,
    { scale: 0.8, autoAlpha: 0 },
    {
      scale: 1,
      autoAlpha: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top 90%',
        end: 'top 40%',
        scrub: 0.5
      }
    }
  )
}
```

### Category 7 — Morphing (Shape, Color, Layout Interpolation)
```js
// Color morphing via scroll
function animMorph(section, fromColor, toColor) {
  gsap.fromTo(section,
    { backgroundColor: fromColor },
    {
      backgroundColor: toColor,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top 60%',
        end: 'top 20%',
        scrub: 0.5
      }
    }
  )
}

// Layout morphing (grid to stack)
function animLayoutMorph(container, items) {
  // Items start overlapping (stacked)
  gsap.from(items, {
    x: (i) => (i - items.length / 2) * -20,
    y: (i) => (i - items.length / 2) * -10,
    rotation: (i) => (i - items.length / 2) * 3,
    scale: 0.9,
    duration: 0.8,
    stagger: 0.05,
    ease: 'BRAND_EASING',
    scrollTrigger: { trigger: container, start: 'top 75%', once: true }
  })
}
```

### Category 8 — Typography (Word/Char/Line Animation)
```js
import { SplitText } from 'gsap/SplitText'
gsap.registerPlugin(SplitText) // register once in main.js, not here

// Word-by-word entrance — SplitText.create() modern API
function animTypeWords(textEl) {
  SplitText.create(textEl, {
    type: 'words',
    mask: 'words',        // overflow:clip wrapper — no manual parent divs
    autoSplit: true,       // handles font-load + resize
    aria: 'auto',          // a11y built-in
    onSplit(self) {
      return gsap.from(self.words, {
        autoAlpha: 0,
        y: '100%',
        rotateX: -90,
        transformOrigin: 'top',
        duration: 0.6,
        stagger: 0.04,
        ease: 'power4.out',
        scrollTrigger: { trigger: textEl, start: 'top 80%', once: true }
      })
    }
  })
}

// Char-by-char with blur
function animTypeChars(textEl) {
  SplitText.create(textEl, {
    type: 'chars',
    mask: 'chars',
    autoSplit: true,
    aria: 'auto',
    onSplit(self) {
      return gsap.from(self.chars, {
        autoAlpha: 0,
        filter: 'blur(10px)',
        y: 20,
        duration: 0.4,
        stagger: 0.02,
        ease: 'power3.out',
        scrollTrigger: { trigger: textEl, start: 'top 80%', once: true }
      })
    }
  })
}

// Line mask reveal (most cinematic — no manual clip-path needed)
function animTypeLines(textEl) {
  SplitText.create(textEl, {
    type: 'lines',
    mask: 'lines',         // built-in overflow:clip per line
    autoSplit: true,
    aria: 'auto',
    onSplit(self) {
      return gsap.from(self.lines, {
        yPercent: 110,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power4.out',
        scrollTrigger: { trigger: textEl, start: 'top 80%', once: true }
      })
    }
  })
}
```

### Category 9 — Cinematic (Slow, Full-Viewport, Dramatic)
```js
function animCinematic(section) {
  const tl = gsap.timeline({
    scrollTrigger: { trigger: section, start: 'top 60%', once: true }
  })

  // Slow, dramatic entrance
  tl.from(section, {
    autoAlpha: 0,
    duration: 1.5,
    ease: 'power2.out'
  })

  // Content emerges slowly
  tl.from(section.querySelector('.cinematic__content'), {
    y: 60,
    autoAlpha: 0,
    duration: 1.2,
    ease: 'power3.out'
  }, '-=0.8')

  // Background element drifts slowly
  tl.from(section.querySelector('.cinematic__bg'), {
    scale: 1.15,
    duration: 2.0,
    ease: 'power1.out'
  }, 0)
}
```

---

## Repeat Detection System

**MANDATORY**: Before implementing section N's animation, run this check:

```
MOTION VARIETY CHECK
====================
Section 1: {{category}} — {{technique}}
Section 2: {{category}} — {{technique}}
...
Section N-2: {{category}}
Section N-1: {{category}}
Section N (current): {{proposed category}}

CHECK: Does Section N match Section N-1? → {{YES/NO}}
CHECK: Does Section N match Section N-2? → {{YES/NO}}

If EITHER check is YES → BLOCK. Choose a different category.
If BOTH are NO → PROCEED.
```

Log this mapping as a comment at the TOP of each page component:

```vue
<!--
  MOTION CATEGORY MAP
  ===================
  Section 1 (Hero):        Timeline
  Section 2 (Manifesto):   Typography
  Section 3 (Showcase):    Stagger
  Section 4 (Process):     Pin
  Section 5 (Energy):      Continuous
  Section 6 (Proof):       Reveal
  Section 7 (Trust):       Depth
  Section 8 (Close):       Cinematic
  ✓ No consecutive repeats
-->
```

---

## Advanced Scroll-Linked Effects

Beyond entrance animations, these create continuous scroll interaction:

### Parallax Text (text moves at different speed than scroll)
```js
gsap.to('.parallax-text', {
  yPercent: -30,
  ease: 'none',
  scrollTrigger: {
    trigger: '.parallax-text',
    start: 'top bottom',
    end: 'bottom top',
    scrub: 0.5
  }
})
```

### Marquee Speed Change on Scroll
```js
const marquee = document.querySelector('.marquee__track')
let speed = 1

gsap.to(marquee, {
  x: '-50%',
  ease: 'none',
  duration: 20,
  repeat: -1
})

// Speed up when scrolling
lenis.on('scroll', ({ velocity }) => {
  speed = 1 + Math.abs(velocity) * 0.002
  gsap.to(marquee, { timeScale: speed, duration: 0.3 })
})
```

### Scroll-Velocity Visual Response
```js
// Elements react to scroll speed
lenis.on('scroll', ({ velocity }) => {
  const skew = velocity * 0.05
  gsap.to('.velocity-element', {
    skewY: skew,
    duration: 0.3,
    ease: 'power2.out'
  })
})
```

---

## Performance Rules (Non-Negotiable)

1. **GPU-only properties**: Only animate `transform` (translate, rotate, scale, skew) and `opacity`. NEVER `width`, `height`, `top`, `left`, `margin`, `padding`, `border-radius` (animate clip-path instead).
2. **`will-change`**: Do NOT add preventively. Only if measured jank exists.
3. **Cleanup**: Every component with animations MUST use `gsap.matchMedia()`:
   ```js
   let mm = null
   onMounted(() => {
     mm = gsap.matchMedia()
     mm.add({
       isDesktop: '(min-width: 1280px)',
       isTablet: '(min-width: 768px) and (max-width: 1279px)',
       isMobile: '(max-width: 767px)',
       reduceMotion: '(prefers-reduced-motion: reduce)'
     }, (context) => {
       const { reduceMotion } = context.conditions
       if (reduceMotion) return  // skip animation setup entirely
       // all animations here — matchMedia auto-reverts on condition change
     }, sectionRef.value)  // 3rd arg = scope for selectors
   })
   onBeforeUnmount(() => mm?.revert())
   ```
   **Do NOT nest `gsap.context()` inside `gsap.matchMedia()` — matchMedia creates its own context.**
4. **ScrollTrigger**: Use `once: true` for entrance animations. Use `scrub: 0.5` for continuous (never `scrub: true`).
5. **ScrollTrigger.batch()** for grid/list items — not individual triggers per element.
6. **Stagger**: Never `stagger: 0` (no stagger) or `stagger: 0.1` (too uniform). Use `0.03-0.08` for organic feel.
7. **Timeline**: Use relative positions (`'-=0.3'`) for overlap, not absolute delays.
8. **autoAlpha** instead of `opacity` for all fade animations — also sets `visibility: hidden` at 0.
9. **gsap.quickTo()** for mouse followers — never create new tweens on mousemove.
10. **SplitText.create()** with `autoSplit: true`, `mask`, `aria: 'auto'` for text reveals.
11. **Register plugins in main.js** — never inside component render cycles.
12. **ScrollTrigger on timeline, NOT on child tweens** inside that timeline.
13. **`immediateRender: false`** when stacking multiple `from()`/`fromTo()` on same property.
14. **`ScrollTrigger.refresh()`** after Vue `nextTick` when content changes dynamically.
15. Call `gsap.matchMediaRefresh()` if matchMedia conditions need re-evaluation.

---

## Reduced Motion (via gsap.matchMedia — preferred pattern)

```js
// In component — matchMedia handles reduced-motion as a condition:
mm.add({ reduceMotion: '(prefers-reduced-motion: reduce)' }, (context) => {
  if (context.conditions.reduceMotion) return  // skip all animation setup
  // ... animations only run when reduced-motion is NOT active
})

// CSS fallback (always include as safety net):
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```
