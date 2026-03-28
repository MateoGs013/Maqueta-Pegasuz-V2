---
name: gsap-motion
description: Implement frontend animations that adapt to the project's stack and the user's aesthetic direction. Supports GSAP, CSS transitions, Framer Motion, Motion One, or CSS-only. Use when the user asks for animations, scroll effects, reveal transitions, parallax, hover states, page transitions, or any motion/animation work. Triggers on "animation", "GSAP", "scroll", "reveal", "parallax", "transition", "motion", "animate", "animacion", "efecto".
---

# Animation System — Award-Level Motion
n## Prerequisites

- Pages/components must already be scaffolded (HTML structure exists for animation targeting)
- Design Brief strongly recommended -- docs/design-brief.md contains motion choreography
- Motion Spec strongly recommended -- docs/motion-spec.md contains brand easing and timing
- If neither exists, skill uses project aesthetic direction or CLAUDE.md emergency fallbacks

## Relevant docs/ files

- docs/motion-spec.md -- PRIMARY: brand easing, hero timeline, scroll reveal defaults, page transitions
- docs/design-brief.md -- SECONDARY: motion choreography section within the design brief
- docs/page-plans.md -- section purposes determine animation category selection

Implement animations that create immersive experiences. Motion is not decoration — it's storytelling, rhythm, and brand identity.

**`docs/motion-spec.md` is the primary source of truth for all motion decisions.** If it exists, implement exactly what it describes. The Design Brief's Motion Choreography section is also relevant. If neither exists, request them before proceeding.

## Phase 1: Discover project context

1. **Animation library**: Check `package.json` for:
   - `gsap` → GSAP (check for ScrollTrigger, SplitText plugins)
   - `framer-motion` → Framer Motion
   - `motion` → Motion One
   - None → CSS transitions/animations only
2. **Text splitting**: Check for `split-type`, `splitting` — these enable character/word/line animation
3. **Smooth scroll**: Check for `lenis`, `@studio-freight/lenis`, `locomotive-scroll`
4. **Motion spec (PRIMARY)**: Read `docs/motion-spec.md` first — this is the source of truth for all motion values. Also check `docs/design-brief.md` for brand easing
5. **Existing animations**: Grep for `gsap.from`, `gsap.to`, `ScrollTrigger`, `@keyframes` in `src/`
6. **Reduced motion**: Check if project already respects `prefers-reduced-motion`
7. **Design Brief**: Also read `docs/design-brief.md` for the Motion Choreography section (complements motion-spec.md)

## Phase 2: Understand motion personality

### From Design Brief (preferred)

Use the brief's easing curves, durations, stagger patterns, and scroll behaviors directly. Don't re-interpret — implement what it specifies.

### From aesthetic direction (if no brief)

| Aesthetic | Motion personality |
|-----------|-------------------|
| **Minimal** | Subtle fades, short durations (300-500ms), ease-out, minimal Y offset (16px), restrained |
| **Editorial** | Elegant line/word reveals, clip-path, longer durations (700-1000ms), power3/power4 |
| **Brutalist** | Instant cuts, no easing or linear, glitch offsets, unconventional timing |
| **Playful** | Bounce/elastic easing, overshoot, longer stagger, colorful transitions |
| **Luxury/premium** | Slow precision, power4.out, generous delays (200ms+ between elements), parallax depth |
| **Tech/futuristic** | Fast snappy (200-400ms), back.out easing, stagger in grid patterns, data-viz motion |
| **Cinematico** | Very slow (1-1.5s reveals), dramatic scale changes, pinned scroll sequences, full-screen transitions |
| **Dark elegance** | Smooth custom easing (choose per brand — power3, power4, expo, or custom cubic-bezier), subtle Y offset (choose per brand), accent glow on reveal, atmospheric textures |
| **Corporate** | Functional quick (300-500ms), ease-in-out, consistent predictable rhythm |
| No direction | Match existing project patterns |

## Phase 3: Motion patterns library

### A. Page load orchestration

The first impression. An orchestrated timeline that introduces the hero section:

```js
// Hero entrance — orchestrated timeline
const heroTl = gsap.timeline({ defaults: { ease: 'power4.out' } })

// Split title for word-by-word reveal
const split = new SplitType('.hero__title', { types: 'words' })

heroTl
  .from(split.words, {
    yPercent: 120,
    duration: 1.3,
    stagger: 0.06,
  })
  .from('.hero__rule', {
    scaleX: 0,
    duration: 0.8,
    ease: 'power3.inOut',
    transformOrigin: 'left center',
  }, '-=0.5')
  .from('.hero__tag', {
    autoAlpha: 0,
    y: 12,
    duration: 0.6,
  }, '-=0.3')
  .from('.hero__visual', {
    autoAlpha: 0,
    scale: 0.96,
    duration: 1,
  }, '-=0.8')
```

### B. Scroll reveals — section entrances

```js
// Standard reveal — ALL values come from the Design Brief, never hardcoded
gsap.from(elements, {
  autoAlpha: 0,
  y: BRIEF_Y_OFFSET,          // from brief — varies per project (16-48px)
  duration: BRIEF_DURATION,     // from brief — varies per project (0.5-1.2s)
  ease: BRIEF_ENTRANCE_EASE,   // from brief — varies per project (never default to same ease)
  stagger: BRIEF_STAGGER,      // from brief — varies per project (0.04-0.15)
  clearProps: 'all',
  scrollTrigger: {
    trigger: parent,
    start: 'top 82%',
    once: true,
  },
})

// IMPORTANT: Never hardcode motion values. Every project has its own motion personality.
// power3.out is NOT the default. 32px is NOT the default. 0.8s is NOT the default.
// The Design Brief defines all of these. If no brief exists, ask for one.
```

### C. Text reveals — word-by-word and line-by-line

```js
// Word-by-word reveal (editorial, luxury)
const split = new SplitType(heading, { types: 'lines, words' })

// Wrap lines in overflow-hidden containers for clean reveals
split.lines.forEach(line => {
  const wrapper = document.createElement('span')
  wrapper.style.overflow = 'hidden'
  wrapper.style.display = 'block'
  line.parentNode.insertBefore(wrapper, line)
  wrapper.appendChild(line)
})

gsap.from(split.words, {
  yPercent: 110,
  duration: 1.1,
  ease: 'power4.out',
  stagger: 0.03,
  scrollTrigger: {
    trigger: heading,
    start: 'top 80%',
    once: true,
  },
})
```

```js
// Word-by-word scroll scrub (manifesto sections)
const words = new SplitType(statement, { types: 'words' })

gsap.from(words.words, {
  autoAlpha: 0.12,   // ghosted, not invisible — user sees the shape
  stagger: 0.05,
  scrollTrigger: {
    trigger: statement,
    start: 'top 78%',
    end: 'top 25%',
    scrub: 1,
  },
})
```

### D. Horizontal scroll sections

```js
// Pin section and scroll content horizontally
const container = document.querySelector('.horizontal-scroll')
const track = container.querySelector('.horizontal-scroll__track')
const cards = track.querySelectorAll('.card')

// Entrance animation for cards before horizontal scroll
gsap.from(cards, {
  autoAlpha: 0,
  y: 24,
  scale: 0.985,
  stagger: 0.1,
  duration: 0.7,
  ease: 'power3.out',
  scrollTrigger: {
    trigger: container,
    start: 'top 80%',
    once: true,
  },
})

// Horizontal scroll
gsap.to(track, {
  x: () => -(track.scrollWidth - window.innerWidth + 80), // 80px right padding
  ease: 'none',
  scrollTrigger: {
    trigger: container,
    start: 'top top',
    end: () => `+=${track.scrollWidth - window.innerWidth}`,
    pin: true,
    scrub: 1,
    invalidateOnRefresh: true,
  },
})
```

### E. Parallax depth — multi-layer

```js
// Images inside overflow-hidden with scale + translate
gsap.to('.parallax-image', {
  yPercent: -8,
  ease: 'none',
  scrollTrigger: {
    trigger: '.parallax-container',
    start: 'top bottom',
    end: 'bottom top',
    scrub: true,
  },
})

// The image must be scaled to prevent gaps:
// CSS: .parallax-image { transform: scale(1.15); }

// Multi-layer parallax (background, midground, foreground)
const layers = [
  { el: '.bg-layer', speed: -3 },    // slow
  { el: '.mid-layer', speed: -6 },   // medium
  { el: '.fg-layer', speed: -12 },   // fast
]
layers.forEach(({ el, speed }) => {
  gsap.to(el, {
    y: speed * 10,
    ease: 'none',
    scrollTrigger: {
      trigger: '.parallax-section',
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
    },
  })
})
```

### F. Pinned storytelling sections

```js
// Pin section while internal content transforms
const section = document.querySelector('.story-section')
const steps = section.querySelectorAll('.step')

const tl = gsap.timeline({
  scrollTrigger: {
    trigger: section,
    start: 'top top',
    end: `+=${steps.length * 100}%`,
    pin: true,
    scrub: 1,
  },
})

steps.forEach((step, i) => {
  if (i > 0) {
    tl.from(step, { autoAlpha: 0, y: 40 })
    tl.to(steps[i - 1], { autoAlpha: 0, y: -20 }, '<')
  }
})
```

### G. Animated counters

```js
// Counter with eased count-up
const targets = document.querySelectorAll('[data-count]')
targets.forEach(el => {
  const end = parseFloat(el.dataset.count)
  const decimals = (el.dataset.decimals || 0)
  const obj = { val: 0 }

  gsap.to(obj, {
    val: end,
    duration: 2.2,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: el,
      start: 'top 85%',
      once: true,
    },
    onUpdate: () => {
      el.textContent = obj.val.toFixed(decimals)
    },
  })
})
```

### H. Marquee / infinite scroll strip

```js
// Infinite horizontal marquee
const marquee = document.querySelector('.marquee__track')
const clone = marquee.innerHTML
marquee.innerHTML += clone // duplicate content for seamless loop

gsap.to(marquee, {
  xPercent: -50,
  duration: 20,       // adjust speed
  ease: 'none',
  repeat: -1,
})
```

### I. Preloader sequence

```js
// Preloader with counter + clip-path reveal
const preloader = document.querySelector('.preloader')
const counter = preloader.querySelector('.preloader__count')
const obj = { val: 0 }

const preloaderTl = gsap.timeline({
  onComplete: () => {
    preloader.style.pointerEvents = 'none'
  }
})

// Count 0-100
preloaderTl.to(obj, {
  val: 100,
  duration: 2.5,
  ease: 'power2.inOut',
  onUpdate: () => {
    counter.textContent = Math.round(obj.val)
  },
})

// Reveal: clip-path wipe
preloaderTl.to(preloader, {
  clipPath: 'inset(0 0 100% 0)',
  duration: 0.8,
  ease: 'power3.inOut',
}, '+=0.3')

// Hero entrance starts overlapping with preloader exit
preloaderTl.add(heroTimeline, '-=0.4')
```

### J. Page transitions (with Vue Router)

```js
// In App.vue or SiteShell
<template>
  <Transition
    @before-leave="onBeforeLeave"
    @leave="onLeave"
    @enter="onEnter"
    mode=""  /* no mode — overlap transitions */
    :css="false"
  >
    <RouterView :key="route.path" />
  </Transition>
</template>

<script setup>
function onBeforeLeave(el) {
  // Capture scroll position, freeze layout
  el.style.position = 'fixed'
  el.style.width = '100%'
  el.style.top = `-${window.scrollY}px`
}

function onLeave(el, done) {
  gsap.to(el, {
    autoAlpha: 0,
    y: -20,
    duration: 0.4,
    ease: 'power2.in',
    onComplete: done,
  })
}

function onEnter(el, done) {
  gsap.from(el, {
    autoAlpha: 0,
    y: 20,
    duration: 0.5,
    ease: 'power3.out',
    onComplete: done,
  })
  window.scrollTo(0, 0)
}
</script>
```

### K. Custom cursor with contextual states

```js
// In a CustomCursor.vue component
const cursor = ref(null)
const follower = ref(null)
let mouse = { x: 0, y: 0 }
let pos = { x: 0, y: 0 }
let followerPos = { x: 0, y: 0 }

function onMouseMove(e) {
  mouse.x = e.clientX
  mouse.y = e.clientY
}

function tick() {
  // Fast cursor (lerp 0.35)
  pos.x += (mouse.x - pos.x) * 0.35
  pos.y += (mouse.y - pos.y) * 0.35
  cursor.value.style.transform = `translate(${pos.x}px, ${pos.y}px)`

  // Slow follower (lerp 0.08)
  followerPos.x += (mouse.x - followerPos.x) * 0.08
  followerPos.y += (mouse.y - followerPos.y) * 0.08
  follower.value.style.transform = `translate(${followerPos.x}px, ${followerPos.y}px)`

  requestAnimationFrame(tick)
}

// Contextual states via event delegation
document.addEventListener('mouseover', (e) => {
  const target = e.target.closest('[data-cursor]')
  if (target) {
    cursorState.value = target.dataset.cursor // 'link', 'project', 'cta', etc.
  }
})
```

### L. Scroll-velocity response

```js
// Elements that respond to scroll speed
let scrollVelocity = 0
ScrollTrigger.create({
  onUpdate: (self) => {
    scrollVelocity = self.getVelocity() / 300
  },
})

// Apply velocity to elements (e.g., skew on scroll)
gsap.ticker.add(() => {
  const skew = gsap.utils.clamp(-5, 5, scrollVelocity)
  gsap.to('.velocity-element', {
    skewY: skew,
    duration: 0.3,
    ease: 'power2.out',
  })
  scrollVelocity *= 0.9 // decay
})
```

## Phase 4: Lenis integration

If the project uses Lenis for smooth scroll, integrate with GSAP:

```js
// In main.js or App.vue
import Lenis from 'lenis'

const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  orientation: 'vertical',
  smoothWheel: true,
})

// Sync with GSAP ticker
gsap.ticker.add((time) => {
  lenis.raf(time * 1000)
})
gsap.ticker.lagSmoothing(0)

// Sync with ScrollTrigger
lenis.on('scroll', ScrollTrigger.update)
```

## Phase 5: Brand easing — your motion signature

Award-winning sites use custom easing curves as part of their brand identity. Define and use consistently:

```js
// Register custom easing — each project gets its OWN brand curve
gsap.registerEase('brand', function(progress) {
  // Custom curve — CHANGE coefficients per project personality
  // Examples of DIFFERENT curves:
  // Aggressive snap: 1 - Math.pow(1 - progress, 5)     // ~power5.out
  // Gentle float:    1 - Math.pow(1 - progress, 2.5)   // between power2 and power3
  // Bouncy:          gsap elastic or back easing
  // Sharp:           cubic-bezier(0.16, 1, 0.3, 1)
  return 1 - Math.pow(1 - progress, 4)
})

// CSS cubic-bezier references for inspiration (DON'T copy — create your own):
// Immersive Garden: cubic-bezier(.445,.05,.55,.95)
// Monopo: cubic-bezier(.165,.84,.44,1)
// Locomotive: cubic-bezier(0.215, 0.61, 0.355, 1)
// Unseen Studio: cubic-bezier(0.76, 0, 0.24, 1)
// Darkroom: cubic-bezier(0.33, 1, 0.68, 1)

// ANTI-PATTERN: Using the same easing (e.g., power3.out) for every project.
// Each brand's easing IS its motion fingerprint. Vary it.
```

The brief should define the brand easing. If not specified, choose one that matches the aesthetic and use it EVERYWHERE.

## Universal rules (apply always)

### Performance
- Only animate `transform` and `opacity` (GPU-composited).
- Never animate `width`, `height`, `top`, `left`, `margin`, `padding`.
- `will-change` only on actively animated elements, not preventively.
- Use `clearProps` after one-shot animations.
- Mobile: reduce stagger counts, simplify parallax, drop complex sequences.

### Accessibility
- **Always** respect `prefers-reduced-motion: reduce`.
- Content must be accessible without animations.
- No auto-playing video/audio without user consent.

### Vue lifecycle (ALWAYS)
```js
let ctx = null
onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  ctx = gsap.context(() => { /* all GSAP code here */ }, rootEl.value)
})
onBeforeUnmount(() => ctx?.revert())
```

### Best practices
- Clean up ALL animation instances on component unmount via `gsap.context`.
- Scroll reveals: fire once (`once: true`) unless intentionally repeatable.
- Hover states: CSS transitions for simple (1-2 property), GSAP for complex (3+ property or sequenced).
- Media query for hover support: `@media (hover: hover) and (pointer: fine)`.
- Qualify touch: disable custom cursor, magnetic effects on touch devices.
- IntersectionObserver for Canvas/WebGL: pause render loop when off-screen.
- Duration reference: UI feedback < 300ms, reveals 600-1000ms, hero sequences 1.5-2.5s, preloaders 2-4s.

### What NOT to do
- Scrolljacking (hijacking native scroll momentum completely)
- Infinite decorative loops with no purpose (but: marquees, ambient particles, and branded loops ARE acceptable when purposeful)
- Animations that permanently hide content
- Linear easing on entrance animations (linear is for scrub and progress only)
- Same generic fade-up on every single element — vary the motion per section purpose

## Phase 6: Advanced immersive motion patterns

These patterns create experiences that go beyond "animated pages" into truly immersive territory. Use them based on the Design Brief.

### M. Scroll-driven shader effects

```js
// Image displacement on scroll (requires Three.js ShaderMaterial)
const material = new THREE.ShaderMaterial({
  uniforms: {
    uTexture: { value: texture },
    uDisplacement: { value: displacementTexture },
    uProgress: { value: 0 },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D uTexture;
    uniform sampler2D uDisplacement;
    uniform float uProgress;
    uniform vec2 uMouse;
    varying vec2 vUv;
    void main() {
      vec4 disp = texture2D(uDisplacement, vUv);
      vec2 distortedUv = vUv + disp.rg * uProgress * 0.1;
      // Mouse influence
      float dist = distance(vUv, uMouse);
      distortedUv += (vUv - uMouse) * smoothstep(0.3, 0.0, dist) * 0.02;
      gl_FragColor = texture2D(uTexture, distortedUv);
    }
  `,
})

// Drive with scroll
ScrollTrigger.create({
  trigger: section,
  start: 'top bottom',
  end: 'bottom top',
  onUpdate: (self) => {
    material.uniforms.uProgress.value = self.progress
  },
})
```

### N. Spring physics for UI elements

```js
// Spring-based return (more natural than linear easing)
// Magnetic button with spring physics
const btn = el.querySelector('.spring-btn')
btn.addEventListener('mousemove', (e) => {
  const rect = btn.getBoundingClientRect()
  const x = (e.clientX - rect.left - rect.width / 2) * 0.3
  const y = (e.clientY - rect.top - rect.height / 2) * 0.3
  gsap.to(btn, { x, y, duration: 0.4, ease: 'power2.out' })
})
btn.addEventListener('mouseleave', () => {
  gsap.to(btn, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.3)' })
})
```

### O. Clip-path reveals (varied directions)

```js
// Different clip-path directions for variety
const clipReveals = {
  fromBottom: { clipPath: 'inset(100% 0 0 0)' },
  fromTop: { clipPath: 'inset(0 0 100% 0)' },
  fromLeft: { clipPath: 'inset(0 100% 0 0)' },
  fromRight: { clipPath: 'inset(0 0 0 100%)' },
  fromCenter: { clipPath: 'inset(50% 50% 50% 50%)' },
  circle: { clipPath: 'circle(0% at 50% 50%)' },
}

gsap.from(element, {
  ...clipReveals.fromBottom,
  duration: 1.0,
  ease: 'power3.inOut',
  scrollTrigger: { trigger: element, start: 'top 80%', once: true },
})

// Reveal to:
// clipPath: 'inset(0 0 0 0)' for inset variants
// clipPath: 'circle(100% at 50% 50%)' for circle variant
```

### P. RGB split / chromatic aberration on scroll

```js
// CSS-based chromatic aberration effect driven by scroll velocity
let velocity = 0
ScrollTrigger.create({
  onUpdate: (self) => { velocity = self.getVelocity() / 500 }
})

gsap.ticker.add(() => {
  const offset = gsap.utils.clamp(-3, 3, velocity)
  gsap.set('.rgb-split-text', {
    textShadow: `${offset}px 0 rgba(255,0,0,0.5), ${-offset}px 0 rgba(0,0,255,0.5)`,
  })
  velocity *= 0.92 // decay
})
```

### Q. Scroll-linked color morphing

```js
// Background and accent colors shift as user scrolls through sections
const sections = document.querySelectorAll('[data-section-color]')
sections.forEach(section => {
  const bg = section.dataset.sectionColor
  const text = section.dataset.sectionText
  ScrollTrigger.create({
    trigger: section,
    start: 'top 60%',
    end: 'bottom 40%',
    onEnter: () => {
      gsap.to(document.documentElement, {
        '--bg': bg,
        '--text': text,
        duration: 0.8,
        ease: 'power2.inOut',
      })
    },
    onEnterBack: () => {
      gsap.to(document.documentElement, {
        '--bg': bg,
        '--text': text,
        duration: 0.8,
        ease: 'power2.inOut',
      })
    },
  })
})
```

## Phase 7: Animation variation enforcement

**CRITICAL RULE: No two consecutive sections should use the same animation technique.**

### Section animation signature map

For each section in the page, assign a DIFFERENT primary animation:

| Section # | Example technique | Category |
|-----------|-------------------|----------|
| 1 (Hero) | Orchestrated timeline (split text + staggered elements) | Timeline |
| 2 (Manifesto) | Word-by-word scroll scrub | Scrub |
| 3 (Energy) | Marquee + counter roll-up | Continuous |
| 4 (Context) | Clip-path reveal (from left/right) | Reveal |
| 5 (Proof) | Stagger grid with random delays | Stagger |
| 6 (Process) | Horizontal scroll pin | Pin |
| 7 (Trust) | Parallax multi-layer | Depth |
| 8 (Evidence) | Scale-up from center + counter | Scale |
| 9 (Close) | Cinematic slow reveal | Dramatic |

### Animation categories (cycle through these)

1. **Timeline** — Orchestrated multi-element sequence
2. **Scrub** — Scroll-linked continuous animation
3. **Reveal** — Clip-path or mask-based appearance
4. **Stagger** — Multiple elements with varied delays
5. **Pin** — Section pinned while content transforms
6. **Depth** — Parallax, z-layer, scale-based depth
7. **Scale** — Transform scale as primary motion
8. **Continuous** — Marquee, counter, ambient loop
9. **Dramatic** — Slow, cinematic, full-viewport

**Never repeat the same category more than twice in a page.**
