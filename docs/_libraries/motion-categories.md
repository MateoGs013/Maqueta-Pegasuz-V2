# Motion Categories

12 categories of animation. Each section is assigned ONE category.
**Rule: no consecutive sections may share the same category.**

---

## 1. Clip-Path Reveal

Element is masked and unmasked via `clip-path` animation.

```js
gsap.from(el, {
  clipPath: 'inset(100% 0 0 0)', // or polygon, circle
  duration: 1,
  ease: 'power3.inOut',
  scrollTrigger: { trigger: el, start: 'top 80%', once: true }
})
```

**Variations:**
- `inset(0 100% 0 0)` — reveal from left
- `inset(0 0 100% 0)` — reveal from top
- `circle(0% at 50% 50%)` → `circle(100%)` — radial reveal
- `polygon()` — custom shape reveal

**Best for:** Images, hero sections, dramatic reveals.

---

## 2. Stagger Cascade

Multiple elements animate in sequence with a stagger delay.

```js
gsap.from(items, {
  y: 40, autoAlpha: 0,   // autoAlpha: sets visibility:hidden at 0 (better than opacity alone)
  duration: 0.6,
  stagger: 0.08,
  ease: 'power3.out',
  scrollTrigger: { trigger: container, start: 'top 80%', once: true }
})
```

**ScrollTrigger.batch()** — coordinates reveals when multiple elements enter viewport at different times:
```js
// Better than individual ScrollTriggers for grid items
ScrollTrigger.batch('.grid-item', {
  interval: 0.1,    // group callbacks within 100ms window
  batchMax: 4,       // max 4 per batch
  onEnter: (batch) => gsap.to(batch, {
    autoAlpha: 1, y: 0, stagger: 0.1, overwrite: true
  })
})
```

**distribute()** — advanced stagger with eased distribution:
```js
gsap.from(items, {
  y: gsap.utils.distribute({ base: 20, amount: 60, from: 'center', ease: 'power1.inOut' }),
  autoAlpha: 0,
  duration: 0.6,
  stagger: { each: 0.06, from: 'center' },
  ease: 'power3.out',
  scrollTrigger: { trigger: container, start: 'top 80%', once: true }
})
```

**Variations:**
- Top-to-bottom stagger
- Left-to-right stagger
- Center-out stagger (`stagger: { from: 'center' }`)
- Random stagger (`stagger: { from: 'random' }`)
- Grid-aware via `distribute()` with `grid` and `axis`

**Best for:** Grid items, lists, cards, feature blocks.

---

## 3. Parallax Depth

Elements move at different scroll speeds, creating depth.

```js
// ALWAYS use scrub: 0.5 — never scrub: true (too snappy, no lag smoothing)
gsap.to(el, {
  y: -100,
  ease: 'none',
  scrollTrigger: {
    trigger: section,
    start: 'top bottom',
    end: 'bottom top',
    scrub: 0.5
  }
})
```

**Variations:**
- Foreground faster, background slower
- Horizontal parallax
- Scale parallax (elements grow/shrink)
- Rotation parallax

**Best for:** Hero sections, image-heavy sections, atmospheric backgrounds.

---

## 4. Counter-Motion

Elements move in opposite directions simultaneously.

```js
const tl = gsap.timeline({
  scrollTrigger: { trigger: section, start: 'top 80%', once: true }
})
tl.from(leftEl, { x: -60, opacity: 0, duration: 0.8, ease: 'power3.out' })
  .from(rightEl, { x: 60, opacity: 0, duration: 0.8, ease: 'power3.out' }, '<')
```

**Variations:**
- Left/right split entrance
- Scale up / scale down
- Rotate clockwise / counter-clockwise
- Vertical split (top down, bottom up)

**Best for:** Split layouts, before/after, comparison sections.

---

## 5. Text Split

Text is split into characters, words, or lines and animated individually.
SplitText is **free since GSAP 3.13** — use `SplitText.create()` (not `new SplitText()`).

```js
import { SplitText } from 'gsap/SplitText'
gsap.registerPlugin(SplitText)

// Modern API: SplitText.create() with autoSplit + onSplit + mask + aria
SplitText.create(headingEl, {
  type: 'words, chars',
  mask: 'chars',         // built-in overflow:clip wrapper — no manual divs needed
  autoSplit: true,        // re-splits on font-load + resize automatically
  aria: 'auto',           // adds aria-label on parent, aria-hidden on children
  onSplit(self) {
    // Return the animation — GSAP auto-cleans on re-split
    return gsap.from(self.chars, {
      y: '100%',
      autoAlpha: 0,
      duration: 0.5,
      stagger: 0.02,
      ease: 'power3.out',
      scrollTrigger: { trigger: headingEl, start: 'top 85%', once: true }
    })
  }
})
```

**Key SplitText options:**
- `mask: "lines"|"words"|"chars"` — overflow:clip wrapper (replaces manual parent + overflow:hidden)
- `autoSplit: true` — handles font loading and resize (critical for web fonts)
- `aria: "auto"` — a11y built-in (screen readers see original text, not individual spans)
- `propIndex: true` — adds `--char`, `--word` CSS variables for index-based styling
- `onSplit(self)` — return animation for auto cleanup on re-split

**Variations:**
- Char-by-char reveal with mask (most cinematic)
- Word-by-word with y offset
- Line-by-line with mask reveal
- Scramble effect (random chars → real text with `ScrambleTextPlugin`)

**Best for:** Headlines, hero text, manifesto sections, quotes.

---

## 6. Elastic Spring

Elements overshoot and bounce with spring physics.

```js
gsap.from(el, {
  scale: 0, opacity: 0,
  duration: 1,
  ease: 'elastic.out(1, 0.5)',
  scrollTrigger: { trigger: el, start: 'top 80%', once: true }
})
```

**Variations:**
- Scale spring (pop in)
- Position spring (overshoot target)
- Rotation spring (wobble)
- Staggered springs

**Best for:** CTAs, icons, playful elements, accent pieces.

---

## 7. Scroll-Linked

Animation progress is tied directly to scroll position (not triggered once).

```js
gsap.to(el, {
  rotation: 360,
  ease: 'none',
  scrollTrigger: {
    trigger: section,
    start: 'top bottom',
    end: 'bottom top',
    scrub: 0.5  // always 0.5 — smooth lag, not instant
  }
})
```

**Variations:**
- Progress bar fill
- Continuous rotation
- Scale with scroll
- Color/opacity shift with scroll
- Horizontal movement with vertical scroll

**Best for:** Progress indicators, decorative elements, immersive storytelling.

---

## 8. SVG Morph

SVG paths animate between shapes, or stroke draws on.

```js
// Stroke draw — no paid plugin needed
gsap.fromTo(path,
  { strokeDashoffset: path.getTotalLength(), strokeDasharray: path.getTotalLength() },
  {
    strokeDashoffset: 0,
    duration: 2,
    ease: 'power2.inOut',
    scrollTrigger: { trigger: path, start: 'top 80%', once: true }
  }
)
```

**Variations:**
- Path draw (stroke-dashoffset) — free, no plugin
- Shape morph (path A → path B) — requires MorphSVG plugin (GSAP Club, paid) or manual keyframe interpolation
- Fill reveal
- Line-drawing illustrations

**Note on MorphSVG:** MorphSVG is a paid GSAP Club plugin. Default to stroke-dashoffset for path drawing. Only use MorphSVG if the project has a Club license.

**Best for:** Icons, illustrations, decorative borders, signature elements.

---

## 9. Magnetic Attraction

Elements are attracted to or repelled by the cursor.

```js
section.addEventListener('mousemove', (e) => {
  const { left, top, width, height } = section.getBoundingClientRect()
  const x = ((e.clientX - left) / width - 0.5) * 20
  const y = ((e.clientY - top) / height - 0.5) * 20
  gsap.to(elements, {
    x: (i) => x * (i + 1) * 0.3,
    y: (i) => y * (i + 1) * 0.3,
    duration: 0.5,
    ease: 'power2.out'
  })
})
```

**Variations:**
- Attraction (follow cursor)
- Repulsion (push away from cursor)
- Orbit (elements circle the cursor)
- Layered depth (closer elements move more)

**Best for:** Interactive sections, CTAs, feature highlights, playful moments.

---

## 10. Kinetic Typography

Text that responds to scroll, hover, or cursor proximity using SplitText (free since GSAP 3.13).

```js
import { gsap } from 'gsap'
import { SplitText } from 'gsap/SplitText'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(SplitText, ScrollTrigger)

// Line mask reveal — SplitText.create() is the modern API
SplitText.create(headingEl, {
  type: 'lines',
  mask: 'lines',         // overflow:clip wrapper — no manual divs needed
  autoSplit: true,        // re-splits on resize/font-load automatically
  aria: 'auto',           // a11y: screen readers see original text
  onSplit(self) {
    // Return animation for auto-cleanup on re-split
    return gsap.from(self.lines, {
      yPercent: 110,
      duration: 0.9,
      stagger: 0.08,
      ease: 'power3.out',
      scrollTrigger: { trigger: headingEl, start: 'top 80%', once: true }
    })
  }
})
```

**Variations:**
- Line mask reveal (lines slide up from hidden container — most cinematic)
- Word-by-word stagger with y offset
- Character scramble (random chars → real text with `ScrambleTextPlugin`)
- Variable font axis animation (if variable font: animate `font-weight` or `font-stretch` on scroll)
- Hover letter scatter (chars repel from cursor with magnetic)

```js
// Variable font axis animation (only if font is a variable font)
gsap.to(headingEl, {
  fontVariationSettings: '"wght" 900',
  duration: 0.4,
  ease: 'power2.out',
  scrollTrigger: { trigger: headingEl, start: 'top 80%', once: true }
})
```

**Best for:** Hero headlines, manifesto sections, pull quotes, section titles that need to command attention.

---

## 11. CSS Scroll-Driven (Native — no JS)

CSS-native scroll animations using `animation-timeline`. Zero JS, zero bundle weight.

**Browser support (as of 2025):** Chrome 115+, Edge 115+, Firefox 110+, Opera 101+.
Safari: partial support in Safari 17.4+ for `scroll()`, full `view()` support in Safari 18+.
**Always gate with `@supports`** — do not assume availability.

```css
/* Always wrap in @supports gate */
@supports (animation-timeline: scroll()) {

  /* Section entry reveal */
  .s-section__content {
    animation: reveal-up linear both;
    animation-timeline: view();
    animation-range: entry 0% entry 40%;
  }

  /* Sticky header opacity on scroll */
  .site-header {
    animation: header-fade linear both;
    animation-timeline: scroll(root block);
    animation-range: 0px 100px;
  }

  /* Reading progress bar */
  .progress-bar {
    transform-origin: left;
    animation: progress-grow linear both;
    animation-timeline: scroll(root block);
  }

}

@keyframes reveal-up {
  from { opacity: 0; translate: 0 40px; }
  to   { opacity: 1; translate: 0 0; }
}

@keyframes header-fade {
  from { background-color: transparent; }
  to   { background-color: var(--canvas); }
}

@keyframes progress-grow {
  from { scale: 0 1; }
  to   { scale: 1 1; }
}
```

**Best for:** Simple section reveals, sticky element state changes, reading progress indicators, parallax background positions, decorative element rotations.

**When to use GSAP instead:** Complex multi-step timelines, text splitting, physics-based motion, anything requiring JS callbacks or state changes.

---

## 12. Spline 3D (Interactive WebGL Scene)

Embed an interactive 3D scene designed in Spline (spline.design) as an atmosphere or hero element.
Max 1–2 Spline scenes per page. One on mobile. Always provide a static image fallback.

```bash
npm install @splinetool/runtime
```

```vue
<script setup>
import { ref, onMounted, onBeforeUnmount, shallowRef } from 'vue'

const canvasRef = ref(null)
const containerRef = ref(null)
const isLoading = ref(true)
const hasError = ref(false)
const splineApp = shallowRef(null)  // shallowRef — never deep-reactive on WebGL objects

onMounted(async () => {
  // Lazy-init: only when section enters viewport
  const observer = new IntersectionObserver(async ([entry]) => {
    if (!entry.isIntersecting) return
    observer.disconnect()

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const gl = canvasRef.value?.getContext('webgl2') || canvasRef.value?.getContext('webgl')
    if (!gl) { hasError.value = true; isLoading.value = false; return }

    try {
      // Dynamic import — keeps Spline's 6.8MB out of the main bundle
      const { Application } = await import('@splinetool/runtime')
      const app = new Application(canvasRef.value, { renderOnDemand: true })
      await app.load('https://your-cdn.com/scene.splinecode')  // self-host for production
      if (prefersReduced) app.stop()  // halt animations on reduced-motion
      splineApp.value = app
    } catch {
      hasError.value = true
    } finally {
      isLoading.value = false
    }
  }, { rootMargin: '200px' })

  if (containerRef.value) observer.observe(containerRef.value)
})

onBeforeUnmount(() => {
  // ALWAYS dispose — browser hard limit of ~16 WebGL contexts per page
  splineApp.value?.stop()
  splineApp.value?.dispose()
  splineApp.value = null
})

// Trigger a named animation from JS:
// splineApp.value?.emitEvent('mouseDown', 'ObjectName')

// Read/write scene variables:
// splineApp.value?.setVariable('color', '#ff0000')
// splineApp.value?.getVariable('isOpen')
</script>

<template>
  <div ref="containerRef" class="spline-wrap" aria-hidden="true">
    <!-- Fallback: shown during load and on error/no-WebGL -->
    <img
      v-if="isLoading || hasError"
      src="/images/spline-fallback.webp"
      alt=""
      width="1200" height="800"
      loading="lazy"
    />
    <canvas v-show="!isLoading && !hasError" ref="canvasRef" />
  </div>
</template>
```

**Vite config** (suppress unknown element warning if using `<spline-viewer>` web component):
```js
// vite.config.js
vue({ template: { compilerOptions: { isCustomElement: tag => tag === 'spline-viewer' } } })
```

**API cheatsheet:**

| Method | What it does |
|---|---|
| `app.emitEvent('mouseDown', 'Name')` | Trigger forward animation on object |
| `app.emitEventReverse('mouseDown', 'Name')` | Trigger reverse animation on object |
| `app.findObjectByName('Name')` | Get SPEObject (position, rotation, scale, visible) |
| `app.setVariable('key', value)` | Set a scene variable (string, number, boolean) |
| `app.getVariable('key')` | Read a scene variable |
| `app.setBackgroundColor('#hex')` | Override background |
| `app.stop()` / `app.play()` | Pause/resume render loop |
| `app.dispose()` | Destroy instance — always call on unmount |

**What you CANNOT do at runtime:** swap textures, change material colors arbitrarily (only via variables defined in editor), control camera position beyond zoom, add/remove objects.

**Performance rules:**
- `renderOnDemand: true` (default) — halts GPU when scene is idle. Critical on mobile.
- Cap to 1 scene on mobile. Test on real hardware.
- Self-host the `.splinecode` file. `prod.spline.design` has uptime dependency.
- Container must have fixed height before load to prevent CLS.
- Use "Performance" geometry quality + texture compression when exporting.

**Best for:** Hero backgrounds, product showcases, abstract atmosphere layers, interactive brand moments.

---

## Variety Enforcement

When assigning techniques to sections, use this checklist:
1. Write out the sequence: S1=?, S2=?, S3=?, ...
2. Verify: no two adjacent sections share a category number
3. If violated, swap one of the conflicting sections to a different category
4. Aim for at least 5 different categories across the homepage
5. Use CSS Scroll-Driven (11) for simple reveals — reserve GSAP categories for sections that need complexity
6. Spline (12) counts as a category — no two consecutive Spline sections

## Reduced Motion Fallback

For ALL categories, when `prefers-reduced-motion: reduce`:

**GSAP animations:** Set elements to their final state immediately — no transition.
```js
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  gsap.set(elements, { opacity: 1, y: 0, scale: 1, clipPath: 'none' })
  return  // skip all animation setup
}
```

**CSS Scroll-Driven:** Wrap in `@media (prefers-reduced-motion: no-preference)`:
```css
@media (prefers-reduced-motion: no-preference) {
  @supports (animation-timeline: scroll()) {
    .s-section__content {
      animation: reveal-up linear both;
      animation-timeline: view();
    }
  }
}
```

**Spline scenes:** Call `app.stop()` after load to halt auto-playing animations.
