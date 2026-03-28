---
name: section-builder
description: >
  Builds ONE section at a time with full creative depth. Each section goes through
  7 mandatory layers: composition, typography, depth, interaction, motion, atmosphere,
  responsive. Contains Layout Library (20+) and Interaction Library (15+) with working code.
  Replaces page-scaffold + vue-component.
triggers:
  - "component"
  - "section"
  - "componente"
  - "seccion"
  - "build section"
  - "crear seccion"
  - "new section"
  - "nueva seccion"
  - "card"
  - "widget"
  - "UI element"
  - "vue file"
  - "section-builder"
---

# Section Builder

You build ONE section at a time. Each section is a unique composition — not a template fill. You apply 7 mandatory layers to every section, ensuring creative depth that matches award-level standards.

**HARD RULE**: You do NOT build generic sections. Every section must have:
- A layout from the Layout Library (or a custom composition justified by the recipe)
- Typography used as design (not just content delivery)
- Visual depth (overlays, gradients, z-stacking)
- At least one interaction beyond scroll-reveal
- Motion that differs from adjacent sections
- Atmospheric integration (grain, glow, canvas visibility)
- Responsive that is REDESIGNED (not just stacked)

---

## Inputs (MANDATORY)

Before building ANY section, you MUST have:
1. `docs/design-brief.md` — visual tokens (palette, typography, spacing, easing)
2. `docs/page-plans.md` — the Section Recipe Card for THIS section
3. `docs/motion-spec.md` — motion personality and technique details
4. Knowledge of adjacent sections (to ensure motion category differs)

**HARD BLOCK**: If the Section Recipe Card is missing or incomplete (any of the 10 fields blank), DO NOT BUILD. Ask `creative-director` to complete it first.

---

## The 7 Layers

Apply these IN ORDER to every section component.

### Layer 1 — Composition

The HTML structure and spatial layout. This is NOT "just put elements in a container."

**RULES**:
- Use the Layout Library pattern specified in the recipe card
- Semantic HTML always (section, article, figure, blockquote — not div soup)
- CSS Grid or Flexbox with INTENTIONAL proportions (never equal columns unless justified)
- Container width varies by section (some full-bleed, some narrow, some asymmetric)

```vue
<template>
  <section
    ref="sectionRef"
    class="s-{{name}}"
    :class="{ 'is-visible': isVisible }"
    aria-label="{{accessible label}}"
  >
    <!-- Layer 3: Depth elements (behind content) -->
    <div class="s-{{name}}__depth" aria-hidden="true">
      <!-- Gradient overlay, grain, glow elements -->
    </div>

    <!-- Main content with specific layout -->
    <div class="s-{{name}}__content">
      <!-- Layout-specific structure from Layout Library -->
    </div>
  </section>
</template>
```

### Layer 2 — Typography

Text is a DESIGN ELEMENT. Not just content in a box.

**RULES**:
- Hero/display text uses `--text-hero` or `--text-display` (3.5-8rem). NEVER small headings in hero sections.
- Mixed font weights in same composition (bold headline + light body creates tension)
- `letter-spacing` and `line-height` are intentional design choices, not defaults
- Key headlines have deliberate line breaks (use `<br>` or max-width control)
- Labels/eyebrows use `--font-accent` with tracking and uppercase
- Numbers in statistics use display font at oversized scale

```css
/* Typography as design — NOT just styling */
.s-hero__headline {
  font-family: var(--font-display);
  font-size: var(--text-hero);          /* 3.5-8rem — fills the space */
  line-height: var(--leading-display);  /* tight: 0.9-1.0 for display */
  letter-spacing: var(--tracking-display);
  font-weight: 700;
  max-width: 12ch;  /* Forces intentional line breaks */
}

.s-hero__eyebrow {
  font-family: var(--font-accent);
  font-size: var(--text-label);
  letter-spacing: var(--tracking-label);
  text-transform: var(--transform-label);
  color: var(--color-signal);
}

.s-hero__body {
  font-family: var(--font-body);
  font-size: var(--text-body);
  line-height: var(--leading-body);
  max-width: 45ch;  /* Optimal reading width */
  color: var(--color-ink-muted);
}
```

### Layer 3 — Depth

Visual layers that create dimensional space. EVERY section needs at least ONE depth element.

**Depth techniques** (use what the recipe specifies):

```css
/* Grain overlay */
.s-{{name}}__grain {
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,..."); /* inline noise SVG */
  opacity: 0.03;
  pointer-events: none;
  mix-blend-mode: overlay;
}

/* Accent glow */
.s-{{name}}__glow {
  position: absolute;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, var(--color-signal-glow) 0%, transparent 70%);
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
  /* Position intentionally — behind a heading or CTA */
}

/* Gradient overlay for image sections */
.s-{{name}}__gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    color-mix(in srgb, var(--color-canvas) 60%, transparent) 60%,
    var(--color-canvas) 100%
  );
}

/* Z-stacking for depth */
.s-{{name}} {
  position: relative;
  isolation: isolate; /* Creates stacking context */
}
```

### Layer 4 — Interaction

Hover states, cursor responses, scroll-linked effects BEYOND the main reveal animation.

**HARD RULE**: Hover interactions must transition 3+ CSS properties simultaneously.

```vue
<script setup>
// === Tilt on hover ===
function handleMouseMove(e) {
  const rect = e.currentTarget.getBoundingClientRect()
  const x = (e.clientX - rect.left) / rect.width - 0.5
  const y = (e.clientY - rect.top) / rect.height - 0.5

  gsap.to(e.currentTarget, {
    rotateY: x * 8,
    rotateX: y * -8,
    transformPerspective: 800,
    duration: 0.4,
    ease: 'power2.out'
  })
}

function handleMouseLeave(e) {
  gsap.to(e.currentTarget, {
    rotateY: 0,
    rotateX: 0,
    duration: 0.6,
    ease: 'elastic.out(1, 0.5)'
  })
}

// === Magnetic button ===
function handleMagnet(e) {
  const rect = e.currentTarget.getBoundingClientRect()
  const x = e.clientX - rect.left - rect.width / 2
  const y = e.clientY - rect.top - rect.height / 2

  gsap.to(e.currentTarget, {
    x: x * 0.3,
    y: y * 0.3,
    duration: 0.3,
    ease: 'power2.out'
  })
}

function handleMagnetLeave(e) {
  gsap.to(e.currentTarget, {
    x: 0,
    y: 0,
    duration: 0.5,
    ease: 'elastic.out(1, 0.4)'
  })
}
</script>
```

**Multi-property hover examples**:

```css
/* Card hover — 4 properties transitioning */
.s-showcase__card {
  transition:
    transform var(--duration-fast) var(--ease-out),
    box-shadow var(--duration-fast) var(--ease-out),
    background-color var(--duration-fast) var(--ease-out);
}

.s-showcase__card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-lg), var(--shadow-glow);
  background-color: var(--color-surface-alt);
}

.s-showcase__card:hover .card__image {
  transform: scale(1.05);
}

.s-showcase__card:hover .card__overlay {
  opacity: 1;
  transform: translateY(0);
}

.s-showcase__card:hover .card__tag {
  color: var(--color-signal);
}

/* Link hover — gradient underline reveal */
.s-nav__link {
  background-image: linear-gradient(var(--color-signal), var(--color-signal));
  background-position: 0% 100%;
  background-repeat: no-repeat;
  background-size: 0% 2px;
  transition: background-size 0.4s var(--ease-out);
}

.s-nav__link:hover {
  background-size: 100% 2px;
}

/* Row hover — expanding gradient */
.s-list__row {
  position: relative;
}

.s-list__row::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, var(--color-signal-glow), transparent);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.5s var(--ease-out);
}

.s-list__row:hover::before {
  transform: scaleX(1);
}
```

### Layer 5 — Motion

Section-specific animation from the recipe card. MUST differ from adjacent sections.

**CRITICAL**: Before implementing, check the motion category of sections N-1 and N-2. If this section's category matches either, STOP and consult the recipe card for reassignment.

```vue
<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const sectionRef = ref(null)
let ctx = null

onMounted(() => {
  // ALWAYS check reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  ctx = gsap.context(() => {
    // === IMPLEMENT THE RECIPE'S MOTION TECHNIQUE ===
    // The specific implementation depends on the recipe card's "Motion technique" field.
    // See motion-system skill for full code per technique category.
  }, sectionRef.value)
})

onBeforeUnmount(() => {
  ctx?.revert() // ALWAYS clean up — non-negotiable
})
</script>
```

**Motion implementation per category** — see `motion-system/SKILL.md` for full code. Here are the patterns:

```js
// Timeline — orchestrated multi-step
const tl = gsap.timeline({
  scrollTrigger: { trigger: section, start: 'top 80%', once: true }
})
tl.from(eyebrow, { autoAlpha: 0, y: 20, duration: 0.6 })
  .from(headline, { autoAlpha: 0, y: 40, duration: 0.8 }, '-=0.3')
  .from(body, { autoAlpha: 0, y: 30, duration: 0.6 }, '-=0.4')
  .from(cta, { autoAlpha: 0, scale: 0.9, duration: 0.5 }, '-=0.3')

// Reveal — clip-path
gsap.from(element, {
  clipPath: 'inset(0 100% 0 0)',  // or 'polygon(0 0, 0 0, 0 100%, 0 100%)'
  duration: 1.2,
  ease: 'power4.inOut',
  scrollTrigger: { trigger: element, start: 'top 80%', once: true }
})

// Stagger — grid items with varied delays
gsap.from(items, {
  autoAlpha: 0,
  y: 40,
  scale: 0.95,
  duration: 0.7,
  stagger: { each: 0.06, from: 'random' },  // 'random' adds organic feel
  ease: brandEasing,
  scrollTrigger: { trigger: grid, start: 'top 80%', once: true }
})

// Scrub — scroll-position-linked
gsap.to(element, {
  x: '-50%',  // or any scroll-linked property
  ease: 'none',
  scrollTrigger: {
    trigger: section,
    start: 'top bottom',
    end: 'bottom top',
    scrub: 0.5  // smooth scrub, not direct
  }
})

// Pin — section pinned while content transforms
ScrollTrigger.create({
  trigger: section,
  start: 'top top',
  end: `+=${panels.length * 100}%`,
  pin: true,
  scrub: 1,
  onUpdate: (self) => {
    // Transform content based on self.progress
  }
})
```

### Layer 6 — Atmosphere

Integration with the persistent atmospheric canvas + section-specific effects.

```css
/* Sections where canvas shows through */
.s-hero,
.s-close {
  background: transparent;  /* Canvas visible behind */
}

/* Sections with their own background */
.s-showcase {
  background: var(--color-surface);
  position: relative;
  z-index: var(--z-content);
}

/* Grain overlay — on sections that need texture */
.s-manifesto::after {
  content: '';
  position: absolute;
  inset: 0;
  background: url('/noise.svg') repeat;
  opacity: 0.025;
  pointer-events: none;
  mix-blend-mode: overlay;
}
```

### Layer 7 — Responsive

**HARD RULE**: Mobile is NOT "same layout stacked." It is REDESIGNED.

```css
/* Desktop: asymmetric 60/40 split */
.s-about__content {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: var(--space-3xl);
  align-items: start; /* Intentional offset, not center */
}

/* Tablet: equal split but with different padding */
@media (max-width: 1024px) {
  .s-about__content {
    grid-template-columns: 1fr 1fr;
    gap: var(--space-xl);
  }
}

/* Mobile: REDESIGNED — not just stacked */
@media (max-width: 768px) {
  .s-about__content {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
  }

  /* Image becomes full-bleed on mobile (breaks container) */
  .s-about__image {
    margin-inline: calc(var(--container-padding) * -1);
    width: calc(100% + var(--container-padding) * 2);
    aspect-ratio: 16/9;  /* Different ratio than desktop */
  }

  /* Typography scales DOWN but stays impactful */
  .s-about__headline {
    font-size: var(--text-display);  /* Still large, not tiny */
    max-width: 100%;  /* Full width on mobile */
  }

  /* CTA becomes full-width button on mobile */
  .s-about__cta {
    width: 100%;
    text-align: center;
    padding: var(--space-md) var(--space-xl);
  }
}

/* Mobile: touch targets minimum 44px */
.s-about__link {
  min-height: 44px;
  display: inline-flex;
  align-items: center;
}
```

---

## Layout Library

### 20 Layout Compositions with CSS

Each layout is a complete CSS Grid/Flexbox pattern ready to use.

**L1 — full-bleed-hero**: Full viewport, content centered but with asymmetric offset
```css
.layout-full-bleed {
  min-height: 100vh;
  min-height: 100dvh;
  display: grid;
  place-items: center;
  padding: var(--section-padding) var(--container-padding);
  position: relative;
  overflow: hidden;
}
```

**L2 — asymmetric-60-40**: Intentionally uneven columns with offset alignment
```css
.layout-asym-60-40 {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: var(--space-3xl);
  align-items: start;
  padding: var(--section-padding) var(--container-padding);
  max-width: var(--container-max);
  margin: 0 auto;
}
/* Image column bleeds right */
.layout-asym-60-40__media {
  margin-right: calc(var(--container-padding) * -1);
}
```

**L3 — asymmetric-40-60**: Reversed (media left, content right)
```css
.layout-asym-40-60 {
  display: grid;
  grid-template-columns: 0.8fr 1.2fr;
  gap: var(--space-3xl);
  align-items: center;
  padding: var(--section-padding) var(--container-padding);
  max-width: var(--container-max);
  margin: 0 auto;
}
```

**L4 — bento-grid**: Mixed-size cells for showcases
```css
.layout-bento {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: minmax(200px, auto);
  gap: var(--space-md);
  padding: var(--section-padding) var(--container-padding);
  max-width: var(--container-max);
  margin: 0 auto;
}
.layout-bento__featured { grid-column: span 2; grid-row: span 2; }
.layout-bento__tall { grid-row: span 2; }
.layout-bento__wide { grid-column: span 2; }
```

**L5 — full-viewport-typography**: Text fills the viewport
```css
.layout-type-statement {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: var(--space-3xl) var(--container-padding);
}
.layout-type-statement__text {
  font-size: clamp(3rem, 2rem + 6vw, 9rem);
  line-height: 0.95;
  max-width: 15ch;
}
```

**L6 — horizontal-pin**: Horizontal scroll via vertical scroll
```css
.layout-h-pin {
  /* Height = number of panels * 100vh */
  overflow: hidden;
}
.layout-h-pin__track {
  display: flex;
  width: max-content;
}
.layout-h-pin__panel {
  width: 100vw;
  height: 100vh;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  padding: var(--space-3xl);
}
```

**L7 — staggered-grid**: Masonry-like with intentional offset
```css
.layout-staggered {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-xl);
  padding: var(--section-padding) var(--container-padding);
  max-width: var(--container-max);
  margin: 0 auto;
}
.layout-staggered > :nth-child(3n+2) {
  transform: translateY(var(--space-3xl)); /* Offset every other column */
}
```

**L8 — split-screen**: 50/50 with each half full-height
```css
.layout-split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 100vh;
  min-height: 100dvh;
}
.layout-split__left,
.layout-split__right {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: var(--space-3xl);
}
```

**L9 — overlapping-layers**: Elements overlap intentionally with z-stacking
```css
.layout-overlap {
  position: relative;
  padding: var(--section-padding) var(--container-padding);
  min-height: 80vh;
}
.layout-overlap__bg {
  position: absolute;
  top: 10%;
  right: 5%;
  width: 60%;
  z-index: 0;
}
.layout-overlap__content {
  position: relative;
  z-index: 1;
  max-width: 50%;
}
.layout-overlap__accent {
  position: absolute;
  bottom: -5%;
  left: 15%;
  z-index: 2;
}
```

**L10 — edge-to-edge**: Full-width with content island
```css
.layout-edge {
  padding: var(--section-padding) 0;
  position: relative;
}
.layout-edge__full {
  width: 100%;
  /* Image or media spans full width */
}
.layout-edge__island {
  max-width: var(--container-narrow);
  margin: var(--space-2xl) auto 0;
  padding: 0 var(--container-padding);
}
```

**L11 — diagonal-split**: Clip-path diagonal composition
```css
.layout-diagonal {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 80vh;
  overflow: hidden;
}
.layout-diagonal__left {
  clip-path: polygon(0 0, 110% 0, 90% 100%, 0 100%);
  padding: var(--space-3xl);
  display: flex;
  align-items: center;
}
.layout-diagonal__right {
  margin-left: -10%;
  clip-path: polygon(10% 0, 100% 0, 100% 100%, 0 100%);
}
```

**L12 — vertical-timeline**: Steps or process with connecting line
```css
.layout-timeline {
  max-width: var(--container-narrow);
  margin: 0 auto;
  padding: var(--section-padding) var(--container-padding);
  position: relative;
}
.layout-timeline::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--color-border);
}
.layout-timeline__step {
  padding-left: var(--space-2xl);
  margin-bottom: var(--space-3xl);
  position: relative;
}
.layout-timeline__step::before {
  content: '';
  position: absolute;
  left: -5px;
  top: 8px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--color-signal);
}
```

**L13 — narrow-centered**: Narrow content, maximum reading focus
```css
.layout-narrow {
  max-width: var(--container-narrow);
  margin: 0 auto;
  padding: var(--section-padding) var(--container-padding);
  text-align: center; /* or left, depending on content */
}
```

**L14 — grid-stats**: 3-4 column metric display
```css
.layout-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-xl);
  padding: var(--section-padding) var(--container-padding);
  max-width: var(--container-max);
  margin: 0 auto;
}
.layout-stats__item {
  text-align: center;
}
.layout-stats__number {
  font-family: var(--font-display);
  font-size: clamp(2.5rem, 2rem + 3vw, 5rem);
  line-height: 1;
  color: var(--color-signal);
}
```

**L15 — marquee-strip**: Infinite horizontal scroll
```css
.layout-marquee {
  overflow: hidden;
  padding: var(--space-xl) 0;
  white-space: nowrap;
}
.layout-marquee__track {
  display: flex;
  gap: var(--space-2xl);
  animation: marquee 20s linear infinite;
  width: max-content;
}
@keyframes marquee {
  to { transform: translateX(-50%); }
}
```

**L16 — full-bleed-image-text**: Image fills section, text overlaid
```css
.layout-bleed-text {
  position: relative;
  min-height: 70vh;
  display: flex;
  align-items: flex-end;
  padding: var(--space-3xl) var(--container-padding);
}
.layout-bleed-text__image {
  position: absolute;
  inset: 0;
  object-fit: cover;
}
.layout-bleed-text__content {
  position: relative;
  z-index: 1;
  max-width: 600px;
}
```

**L17 — cards-grid**: Standard but with varied sizes
```css
.layout-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--space-lg);
  padding: var(--section-padding) var(--container-padding);
  max-width: var(--container-max);
  margin: 0 auto;
}
```

**L18 — sidebar-content**: Content with persistent sidebar
```css
.layout-sidebar {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: var(--space-2xl);
  padding: var(--section-padding) var(--container-padding);
  max-width: var(--container-max);
  margin: 0 auto;
}
.layout-sidebar__nav {
  position: sticky;
  top: var(--space-3xl);
  align-self: start;
}
```

**L19 — alternating-rows**: Rows that alternate image/text position
```css
.layout-alternating {
  display: flex;
  flex-direction: column;
  gap: var(--space-4xl);
  padding: var(--section-padding) var(--container-padding);
  max-width: var(--container-max);
  margin: 0 auto;
}
.layout-alternating__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-2xl);
  align-items: center;
}
.layout-alternating__row:nth-child(even) {
  direction: rtl; /* Flips image/text position */
}
.layout-alternating__row:nth-child(even) > * {
  direction: ltr; /* Reset text direction */
}
```

**L20 — mosaic**: CSS Grid with named areas for editorial layouts
```css
.layout-mosaic {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-auto-rows: minmax(100px, auto);
  gap: var(--space-md);
  padding: var(--section-padding) var(--container-padding);
}
.layout-mosaic__hero-img { grid-column: 1 / 8; grid-row: 1 / 4; }
.layout-mosaic__title { grid-column: 8 / 13; grid-row: 1 / 2; align-self: end; }
.layout-mosaic__body { grid-column: 8 / 13; grid-row: 2 / 4; }
.layout-mosaic__accent { grid-column: 1 / 5; grid-row: 4 / 6; }
```

---

## Interaction Library

### 15 Interaction Patterns with Code

**I1 — Multi-property card hover** (MINIMUM for any card)
```css
.card {
  transition:
    transform 0.4s var(--ease-out),
    box-shadow 0.4s var(--ease-out);
}
.card:hover {
  transform: translateY(-6px) scale(1.01);
  box-shadow: var(--shadow-lg);
}
.card:hover .card__image {
  transform: scale(1.06);
  transition: transform 0.6s var(--ease-out);
}
.card:hover .card__title {
  color: var(--color-signal);
  transition: color 0.3s;
}
```

**I2 — Magnetic button** (REQUIRED for all CTAs)
```js
// In <script setup>
function magnetize(e) {
  const btn = e.currentTarget
  const rect = btn.getBoundingClientRect()
  const x = e.clientX - rect.left - rect.width / 2
  const y = e.clientY - rect.top - rect.height / 2
  gsap.to(btn, { x: x * 0.35, y: y * 0.35, duration: 0.3, ease: 'power2.out' })
}
function demagnetize(e) {
  gsap.to(e.currentTarget, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' })
}
```

**I3 — Cursor-aware spotlight**
```css
.spotlight-area {
  position: relative;
  overflow: hidden;
}
.spotlight-area::before {
  content: '';
  position: absolute;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, var(--color-signal-glow), transparent 70%);
  border-radius: 50%;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s;
  transform: translate(-50%, -50%);
}
.spotlight-area:hover::before {
  opacity: 1;
}
```
```js
// Move spotlight with cursor
el.addEventListener('mousemove', (e) => {
  const rect = el.getBoundingClientRect()
  el.style.setProperty('--mx', `${e.clientX - rect.left}px`)
  el.style.setProperty('--my', `${e.clientY - rect.top}px`)
})
// In CSS: left: var(--mx); top: var(--my);
```

**I4 — Tilt on hover**
```js
function tilt(e) {
  const rect = e.currentTarget.getBoundingClientRect()
  const x = (e.clientX - rect.left) / rect.width - 0.5
  const y = (e.clientY - rect.top) / rect.height - 0.5
  gsap.to(e.currentTarget, {
    rotateY: x * 10,
    rotateX: y * -10,
    transformPerspective: 800,
    duration: 0.4,
    ease: 'power2.out'
  })
}
function untilt(e) {
  gsap.to(e.currentTarget, {
    rotateY: 0, rotateX: 0,
    duration: 0.7,
    ease: 'elastic.out(1, 0.5)'
  })
}
```

**I5 — Link underline gradient reveal**
```css
.link-reveal {
  background-image: linear-gradient(var(--color-signal), var(--color-signal));
  background-size: 0% 2px;
  background-position: 0% 100%;
  background-repeat: no-repeat;
  transition: background-size 0.4s var(--ease-out);
  text-decoration: none;
}
.link-reveal:hover {
  background-size: 100% 2px;
}
```

**I6 — Image displacement on hover**
```css
.img-displace {
  overflow: hidden;
  position: relative;
}
.img-displace img {
  transition: transform 0.6s var(--ease-out), filter 0.6s var(--ease-out);
}
.img-displace:hover img {
  transform: scale(1.08);
  filter: brightness(1.05) saturate(1.1);
}
.img-displace::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, var(--color-canvas), transparent 50%);
  opacity: 0;
  transition: opacity 0.4s;
}
.img-displace:hover::after {
  opacity: 0.3;
}
```

**I7 — Row hover with expanding bg**
```css
.row-expand {
  position: relative;
  padding: var(--space-lg) 0;
  border-bottom: 1px solid var(--color-border);
  overflow: hidden;
}
.row-expand::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--color-surface-alt);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.5s var(--ease-out);
  z-index: -1;
}
.row-expand:hover::before {
  transform: scaleX(1);
}
```

**I8 — Parallax mouse-follow**
```js
// Elements follow mouse at different speeds = depth
function parallaxMouse(container, layers) {
  container.addEventListener('mousemove', (e) => {
    const rect = container.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5

    layers.forEach((layer, i) => {
      const depth = (i + 1) * 0.02
      gsap.to(layer, {
        x: x * depth * 100,
        y: y * depth * 100,
        duration: 0.8,
        ease: 'power2.out'
      })
    })
  })
}
```

**I9 — Scroll-proximity scale**
```js
// Elements scale based on distance from viewport center
gsap.utils.toArray('.proximity-item').forEach(item => {
  gsap.to(item, {
    scale: 1,
    opacity: 1,
    filter: 'blur(0px)',
    ease: 'none',
    scrollTrigger: {
      trigger: item,
      start: 'top 90%',
      end: 'top 50%',
      scrub: 0.5
    }
  })
  gsap.set(item, { scale: 0.9, opacity: 0.5, filter: 'blur(4px)' })
})
```

**I10 — Dynamic shadow following mouse** (like Lanterne Architectes)
```js
function dynamicShadow(elements) {
  document.addEventListener('mousemove', (e) => {
    elements.forEach(el => {
      const rect = el.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const dx = (e.clientX - centerX) / 25
      const dy = (e.clientY - centerY) / 25
      const distance = Math.sqrt(dx * dx + dy * dy)
      const blur = Math.max(20, distance / 12)

      el.style.boxShadow = `${dx}px ${dy}px ${blur}px rgba(var(--shadow-rgb), 0.15)`
    })
  })
}
```

**I11 — Accordion reveal with height animation**
```js
function toggleAccordion(el) {
  const content = el.querySelector('.accordion__content')
  const isOpen = el.classList.contains('is-open')

  if (isOpen) {
    gsap.to(content, { height: 0, opacity: 0, duration: 0.4, ease: 'power3.inOut' })
    el.classList.remove('is-open')
  } else {
    gsap.set(content, { height: 'auto', opacity: 1 })
    gsap.from(content, { height: 0, opacity: 0, duration: 0.5, ease: 'power3.out' })
    el.classList.add('is-open')
  }
}
```

**I12 — Hover preview image** (like nav link preview)
```js
function hoverPreview(links, previewEl) {
  links.forEach(link => {
    link.addEventListener('mouseenter', () => {
      const src = link.dataset.preview
      previewEl.style.backgroundImage = `url(${src})`
      gsap.to(previewEl, { opacity: 1, scale: 1, duration: 0.3 })
    })
    link.addEventListener('mousemove', (e) => {
      gsap.to(previewEl, { x: e.clientX + 20, y: e.clientY - 20, duration: 0.2 })
    })
    link.addEventListener('mouseleave', () => {
      gsap.to(previewEl, { opacity: 0, scale: 0.9, duration: 0.2 })
    })
  })
}
```

**I13 — Scroll-linked background color change**
```js
const colors = ['#1a1a2e', '#16213e', '#0f3460', '#533483']
gsap.to('body', {
  backgroundColor: colors[colors.length - 1],
  ease: 'none',
  scrollTrigger: {
    trigger: document.body,
    start: 'top top',
    end: 'bottom bottom',
    scrub: true,
    onUpdate: (self) => {
      const i = Math.floor(self.progress * (colors.length - 1))
      document.body.style.backgroundColor = colors[Math.min(i, colors.length - 1)]
    }
  }
})
```

**I14 — Form input focus animation**
```css
.input-animated {
  border: 2px solid var(--color-border);
  background: transparent;
  transition: border-color 0.3s, box-shadow 0.3s;
}
.input-animated:focus {
  border-color: var(--color-signal);
  box-shadow: 0 0 0 4px var(--color-signal-glow);
  outline: none;
}
.input-animated__label {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  transition: all 0.3s var(--ease-out);
  color: var(--color-ink-subtle);
}
.input-animated:focus ~ .input-animated__label,
.input-animated:not(:placeholder-shown) ~ .input-animated__label {
  top: 0;
  transform: translateY(-100%);
  font-size: var(--text-caption);
  color: var(--color-signal);
}
```

**I15 — Mouse-following gradient background**
```js
function gradientFollow(el) {
  el.addEventListener('mousemove', (e) => {
    const rect = el.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    el.style.background = `radial-gradient(
      circle at ${x}% ${y}%,
      var(--color-atmosphere-warm) 0%,
      var(--color-canvas) 50%
    )`
  })
}
```

**I16 — Liquid Glass panels** (glassmorphism with gradient border)
Two variants: light (subtle shimmer) and strong (heavy frost). Use for badges, cards, hero overlays.
```css
/* Light glass — subtle, luminosity-blended */
.glass-light {
  background: rgba(255, 255, 255, 0.01);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  mix-blend-mode: luminosity;
  border-radius: var(--radius-md);
  position: relative;
}
/* Gradient border via mask-composite (no actual border needed) */
.glass-light::before {
  content: '';
  position: absolute;
  inset: 0;
  padding: 1.4px;
  border-radius: inherit;
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.45),
    rgba(255, 255, 255, 0) 40%,
    rgba(255, 255, 255, 0) 60%,
    rgba(255, 255, 255, 0.45)
  );
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: exclude;
  -webkit-mask-composite: xor;
  pointer-events: none;
}

/* Strong glass — heavy frost panel */
.glass-strong {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(50px);
  -webkit-backdrop-filter: blur(50px);
  box-shadow:
    inset 0 1px 1px rgba(255, 255, 255, 0.15),
    inset 0 -1px 1px rgba(0, 0, 0, 0.1);
  border-radius: var(--radius-lg);
}

/* Usage: apply .glass-light::before trick for gradient border on strong too */
.glass-strong::before {
  content: '';
  position: absolute;
  inset: 0;
  padding: 1px;
  border-radius: inherit;
  background: linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.05));
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: exclude;
  -webkit-mask-composite: xor;
  pointer-events: none;
}
```

**I17 — Word-by-word blur reveal** (3-state keyframe — Motionsites signature)
The key is the mid-state: blur 10→5→0 with opacity 0→0.5→1 and overshoot on y (50→-5→0).
```js
// Requires words wrapped in <span class="word"> (SplitType or manual)
function wordBlurReveal(textEl, { delay = 0, staggerMs = 100, duration = 0.35 } = {}) {
  const words = textEl.querySelectorAll('.word')

  words.forEach((word, i) => {
    const wordDelay = delay + (i * staggerMs / 1000)
    const tl = gsap.timeline({ delay: wordDelay })

    // 3-state: blur 10→5→0, opacity 0→0.5→1, y 50→-5→0
    tl.fromTo(word,
      { filter: 'blur(10px)', opacity: 0, y: 50 },
      { filter: 'blur(5px)', opacity: 0.5, y: -5, duration: duration * 0.43, ease: 'power2.out' }
    ).to(word,
      { filter: 'blur(0px)', opacity: 1, y: 0, duration: duration * 0.57, ease: 'back.out(1.4)' }
    )
  })
}

// Char-by-char variant (for shorter display text)
function charBlurReveal(textEl, { delay = 0, staggerMs = 25, duration = 0.3 } = {}) {
  const chars = textEl.querySelectorAll('.char')
  gsap.fromTo(chars,
    { filter: 'blur(8px)', opacity: 0, y: 20 },
    {
      filter: 'blur(0px)', opacity: 1, y: 0,
      duration,
      stagger: staggerMs / 1000,
      delay,
      ease: 'power3.out'
    }
  )
}

// Helper — wrap words manually (no SplitType dependency)
function wrapWords(el) {
  const text = el.textContent
  el.innerHTML = text.split(' ')
    .map(word => `<span class="word" style="display:inline-block">${word}</span>`)
    .join(' ')
}
```

---

## Precision Mandate for Motion

**NEVER** write vague motion specs. Every animation implemented in a section must have exact values.

| WRONG | RIGHT |
|---|---|
| "animate the heading in" | `blur 10px→0px, opacity 0→1, y 50→0, 100ms stagger/word, 0.35s duration, back.out(1.4)` |
| "stagger the cards" | `scale 0.92→1, opacity 0→1, y 30→0, stagger: 0.06s from center, 0.7s, expo.out` |
| "fade the section in" | `opacity 0→1, y 40→0, 0.9s, BRAND_EASING, scrollTrigger start: top 75%` |

Extract exact values from `docs/motion-spec.md`. If values are missing, ask `creative-director` to specify them before building.

---

## Post-Build Validation

After building each section, check:

- [ ] Layout matches the recipe card's specified pattern
- [ ] Typography uses 2+ scale levels with intentional sizing
- [ ] At least 1 depth element (grain, glow, gradient, or canvas visibility)
- [ ] Hover interactions transition 3+ properties
- [ ] Motion technique differs from adjacent sections (check the category)
- [ ] Responsive is redesigned, not just stacked
- [ ] `prefers-reduced-motion` respected
- [ ] GSAP cleanup via `ctx?.revert()` in `onBeforeUnmount`
- [ ] Only transform/opacity animated (no width/height/top/left)
- [ ] Semantic HTML with proper ARIA
- [ ] Loading state if async data
- [ ] Error state if async data

**If any check fails**: Fix before moving to the next section.
**NEXT SECTION**: Apply all 7 layers again. Each section is a new creative challenge.
