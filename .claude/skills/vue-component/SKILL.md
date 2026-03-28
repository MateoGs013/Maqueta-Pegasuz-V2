---
name: vue-component
description: Create Vue 3 SFC components that adapt to the current project's patterns and the user's aesthetic direction. Use when the user asks to create a new component, build a UI element, add a section, or scaffold any .vue file. Triggers on mentions of "component", "section", "card", "widget", "UI element", "vue file", "componente", "seccion".
---

# Vue 3 Component Creator — Immersive Components

Create Vue 3 SFCs that are visually ambitious, interaction-rich, and match the project's design language. Components should feel crafted, not templated.

**If a Design Brief exists for the project, use it as the source of truth for all visual decisions.**

## Phase 1: Discover project context

Before writing ANY code, scan the project:

1. **Design Brief**: Check if `creative-design` has produced a brief. If yes, extract tokens, atmosphere, motion choreography, and interaction patterns from it.
2. **Docs**: Glob for `docs/*.md`, `docs/brand*`, `docs/ui*`, `docs/motion*`. Read them — they define visual rules.
3. **Existing components**: Glob `src/components/**/*.vue`. Read 3-5 to learn naming, structure, style, and interaction patterns.
4. **CSS approach**: Tailwind, custom properties, SCSS, modules, scoped?
5. **Design tokens**: CSS custom properties, Tailwind theme, SCSS variables?
6. **Animation stack**: GSAP, SplitType, Framer Motion, CSS-only?
7. **Component library**: Vuetify, PrimeVue, Headless UI?
8. **Script style**: `<script setup>`, Options API, TypeScript?

## Phase 2: Understand the component's role

### What kind of component is this?

| Type | Visual ambition | Interaction depth |
|------|----------------|-------------------|
| **Section component** (hero, CTA, feature showcase) | High — this IS the visual experience | Deep: scroll triggers, parallax, reveals, hover overlays |
| **Card component** (project card, blog card, service card) | Medium-high — must reward hover interaction | Medium: multi-property hover, reveal overlay, image treatment |
| **UI element** (button, input, badge, tag) | Medium — polished micro-interactions | Focused: hover feedback, focus states, transition sequences |
| **Layout component** (header, footer, shell, nav) | Medium — functional but refined | Medium: scroll-aware transforms, theme transitions |
| **Data display** (table, list, stat counter) | Medium — clear with personality | Low-medium: entrance animations, hover highlights |
| **Utility** (modal, tooltip, toast) | Functional with polish | Focused: entrance/exit transitions, backdrop |

### Apply the Design Brief

If a brief exists, every decision flows from it:
- Colors → brief's palette
- Typography → brief's scale and families
- Spacing → brief's spacing system
- Motion → brief's easing curves and durations
- Atmosphere → brief's grain, glow, texture patterns
- Hover → brief's interaction design section

If no brief exists, match what already exists in the project.

## Phase 3: Generate the component

### Structure (strict order)
```vue
<template>
  <!-- Semantic HTML with aria -->
</template>

<script setup>
// imports → props → emits → composables → state → computed → methods → lifecycle
</script>

<style scoped>
/* Design tokens → layout → typography → surfaces → states → responsive → motion */
</style>
```

### Adapt to discovered conventions

| Discovery | Action |
|-----------|--------|
| TypeScript in project | Use `<script setup lang="ts">`, typed props |
| Tailwind detected | Use utility classes, minimal `<style>` |
| SCSS detected | Use `<style lang="scss" scoped>` |
| Custom properties | Use existing tokens, add component-scoped vars |
| GSAP detected | Use GSAP for complex animations, CSS for simple |
| Component library | Use its primitives, extend with custom styling |

### Interaction patterns — what makes components feel alive

#### Cards and list items

```vue
<!-- Award-level card with multi-property hover -->
<article
  class="card"
  @mouseenter="isHovered = true"
  @mouseleave="isHovered = false"
>
  <!-- Image with parallax on hover -->
  <div class="card__media">
    <img
      :style="{ transform: isHovered ? 'scale(1.05)' : 'scale(1)' }"
      loading="lazy"
    />
    <!-- Overlay that reveals on hover -->
    <div class="card__overlay" :class="{ 'is-active': isHovered }">
      <!-- Extra info, links, description -->
    </div>
  </div>

  <!-- Text with subtle translateY on hover -->
  <div class="card__content">
    <h3>{{ title }}</h3>
    <p>{{ excerpt }}</p>
  </div>

  <!-- Accent line or glow that animates on hover -->
  <div class="card__accent" />
</article>
```

```css
.card {
  transition: transform 0.5s cubic-bezier(0.23, 1, 0.32, 1);
}
.card:hover {
  transform: translateY(-4px);
}

/* Multi-property hover — stagger the transitions */
.card__media img {
  transition: transform 0.7s cubic-bezier(0.23, 1, 0.32, 1);
}
.card__overlay {
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 0.4s ease, transform 0.4s ease;
  transition-delay: 0.05s;
}
.card__overlay.is-active {
  opacity: 1;
  transform: translateY(0);
}
.card__accent {
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.5s cubic-bezier(0.23, 1, 0.32, 1);
  transition-delay: 0.1s;
}
.card:hover .card__accent {
  transform: scaleX(1);
}
```

#### Interactive rows (discipline list, feature list)

```css
.row {
  position: relative;
  overflow: hidden;
}
.row::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, var(--accent-glow) 0%, transparent 60%);
  transform: scaleX(0);
  transform-origin: left center;
  transition: transform 0.6s cubic-bezier(0.23, 1, 0.32, 1);
}
.row:hover::before {
  transform: scaleX(1);
}
```

#### Buttons with magnetic pull (if cursor system exists)

```js
// Magnetic effect within gsap.context
const btn = el.querySelector('.magnetic-btn')
btn.addEventListener('mousemove', (e) => {
  const rect = btn.getBoundingClientRect()
  const x = e.clientX - rect.left - rect.width / 2
  const y = e.clientY - rect.top - rect.height / 2
  gsap.to(btn, { x: x * 0.3, y: y * 0.3, duration: 0.4, ease: 'power2.out' })
})
btn.addEventListener('mouseleave', () => {
  gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.3)' })
})
```

### Atmospheric techniques for components

#### Grain overlay on a component
```css
.component::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.03;
  mix-blend-mode: overlay;
  background: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
}
```

#### Accent glow behind elements
```css
.element {
  position: relative;
}
.element::before {
  content: '';
  position: absolute;
  inset: -20%;
  background: radial-gradient(circle, var(--accent) 0%, transparent 70%);
  opacity: 0.06;
  filter: blur(40px);
  pointer-events: none;
  z-index: -1;
}
```

#### Background grid with radial mask
```css
.section {
  /* Grid size from Design Brief — never hardcode a default */
  background-image:
    linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
  background-size: var(--grid-size) var(--grid-size); /* from brief */
  mask-image: radial-gradient(ellipse at center, black 30%, transparent 70%);
}
```

## Phase 3b: Reactive and immersive patterns

Beyond static styling and basic hover, components can be truly alive. Choose from these patterns based on the Design Brief's immersion strategy.

### Tilt effect on hover (cards, panels)

```vue
<script setup>
function onMouseMove(e) {
  const rect = el.getBoundingClientRect()
  const x = (e.clientX - rect.left) / rect.width - 0.5
  const y = (e.clientY - rect.top) / rect.height - 0.5
  gsap.to(el, {
    rotateX: y * -10,
    rotateY: x * 10,
    transformPerspective: 800,
    duration: 0.4,
    ease: 'power2.out',
  })
}
function onMouseLeave() {
  gsap.to(el, { rotateX: 0, rotateY: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)' })
}
</script>
```

### Cursor-aware spotlight

```css
/* Apply via mousemove updating --mx and --my custom properties */
.spotlight-card {
  background: radial-gradient(
    circle 200px at var(--mx, 50%) var(--my, 50%),
    rgba(var(--accent-rgb), 0.08),
    transparent
  );
}
```

```js
el.addEventListener('mousemove', (e) => {
  const rect = el.getBoundingClientRect()
  el.style.setProperty('--mx', `${e.clientX - rect.left}px`)
  el.style.setProperty('--my', `${e.clientY - rect.top}px`)
})
```

### Scroll-linked section color transitions

```js
// Each section can define its own background/text colors
// As user scrolls, colors morph between sections
const sectionColors = [
  { bg: '#0a0a0b', text: '#e8e2d6' },  // from brief palette
  { bg: '#1a1a2e', text: '#f0f0f0' },
  { bg: '#0f3460', text: '#e8e2d6' },
]
```

### WebGL-enhanced component (inline Three.js canvas)

```vue
<template>
  <div class="component-with-3d" ref="rootRef">
    <canvas ref="canvasRef" class="bg-canvas" aria-hidden="true" />
    <div class="content">
      <!-- Regular Vue content rendered on top of canvas -->
      <slot />
    </div>
  </div>
</template>
```

Components can embed their own WebGL canvas for shader backgrounds, particle effects, or interactive visuals. The canvas sits behind the content with `position: absolute` and `z-index: -1`.

## Phase 4: Motion integration

If the component has entrance animation or scroll-linked behavior:

```js
// Inside <script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)

const rootRef = ref(null)
let ctx = null

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  ctx = gsap.context(() => {
    // Entrance animation — ALL values from Design Brief, never hardcoded
    // Each project has its own Y offset, duration, easing, and stagger
    gsap.from('.element', {
      autoAlpha: 0,
      y: /* from brief */,
      duration: /* from brief */,
      ease: /* from brief */,
      stagger: /* from brief */,
      clearProps: 'all',
      scrollTrigger: {
        trigger: rootRef.value,
        start: 'top 82%',
        once: true,
      }
    })
  }, rootRef.value)
})

onBeforeUnmount(() => ctx?.revert())
```

## Phase 5: Validate

### Visual quality
- [ ] Component looks crafted, not templated — specific visual choices, not defaults
- [ ] Hover interactions are multi-property with staggered timing
- [ ] Atmospheric elements present where appropriate (glow, grain, texture)
- [ ] Typography uses project's type scale, not ad-hoc sizes
- [ ] Colors from project tokens, no improvised values

### Interaction quality
- [ ] Hover state has at least 2 properties transitioning (not just color change)
- [ ] Transition durations and easings match project's motion language
- [ ] Focus states visible for keyboard navigation
- [ ] Touch targets minimum 44x44px

### Technical quality
- [ ] Semantic HTML with proper aria attributes
- [ ] Responsive at all breakpoints
- [ ] Performance: GPU-only animations (transform, opacity)
- [ ] Props validated with defaults
- [ ] Events emitted with descriptive names
- [ ] Animation cleanup on unmount
- [ ] `prefers-reduced-motion` respected
- [ ] Matches project naming convention
