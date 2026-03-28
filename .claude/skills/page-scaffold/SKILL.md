---
name: page-scaffold
description: Scaffold a new page/view with routing and data integration, adapting to the current project's framework, router, and conventions. Use when the user asks to create a new page, add a route, build a new view, or scaffold a page component. Triggers on "new page", "add page", "create route", "scaffold page", "new view", "nueva pagina", "agregar ruta".
---

# Page Scaffolder — Narrative Page Builder

Scaffold pages that are complete, immersive experiences — not skeleton templates. Every page tells a story through its sections, motion, and content density.

**This skill requires `docs/page-plans.md` (section architecture) and `docs/design-brief.md` (visual tokens) as primary inputs.** If either file is missing, create it before proceeding.

## Prerequisites

- Design Brief MUST exist -- docs/design-brief.md produced by creative-design skill. If missing, invoke creative-design first.
- Content Brief recommended -- docs/content-brief.md for page copy.
- Page Plans recommended -- docs/page-plans.md for section architecture.
- Project must have Vue 3 + Vue Router installed

## Phase 1: Gather context

### 1. Page Plans + Design Brief (MANDATORY)

Read `docs/page-plans.md` first — it defines WHAT each page contains (sections, purposes, narrative arc). Then read `docs/design-brief.md` — it defines HOW it looks and feels. Also read `docs/content-brief.md` for copy and `docs/motion-spec.md` for animation choreography. Extract:
- Section architecture (the ordered list of sections with purpose, layout, motion)
- Visual identity tokens (colors, typography, spacing)
- Motion choreography (easing, durations, scroll behaviors)
- Atmospheric system (grain, glows, backgrounds)
- Responsive strategy

If `docs/page-plans.md` or `docs/design-brief.md` is missing, **stop and create them first** (page-plans via the wizard, design-brief via `creative-design`).

### 2. Project context

1. **Framework**: Check `package.json` for Vue, Nuxt, Next, React, Astro, etc.
2. **Router**:
   - Vue Router → check `src/router/` for route config
   - Nuxt → file-based routing in `pages/`
   - Next.js → file-based routing in `app/` or `pages/`
3. **Page directory**: Glob for `src/pages/`, `src/views/`, `pages/`, `app/`
4. **Existing pages**: Read 2-3 existing page files to learn:
   - Naming convention (PascalCase? `*View.vue`?)
   - Common imports (composables, stores, layout wrappers)
   - Layout/shell patterns
   - Animation patterns already in use
5. **Foundation docs**: Read `docs/design-brief.md`, `docs/content-brief.md`, `docs/page-plans.md`, `docs/motion-spec.md` — these are the source of truth for all decisions.
6. **Available stack**: Check for GSAP, SplitType, Lenis, Three.js in `package.json`

## Phase 2: Plan the page narrative

Based on the Design Brief's section architecture, plan the complete page. A page is a **story**, not a template.

### Minimum section count by page type

| Page type | Minimum sections | Required section purposes |
|-----------|-----------------|--------------------------|
| Homepage / landing | 8-14 | Impact, Manifesto, Energy, Context, Proof, Process, Trust, Evidence, Close |
| About / studio | 6-10 | Identity, Story, Values, Team, Culture, Close |
| Services | 6-10 | Overview, Detail, Process, Results, Differentiator, Close |
| Portfolio / work | 5-8 | Hero, Featured, Grid, Testimonials, Close |
| Case study | 6-10 | Context, Challenge, Process, Solution, Results, Next |
| Contact | 3-5 | Statement, Form, Info, Close |
| Blog listing | 4-6 | Hero, Featured, Grid, Categories, Close |

### Section purpose reference

Every section MUST have one of these purposes assigned:

| Purpose | What it achieves |
|---------|-----------------|
| **Impact** | Stop the user. Full-viewport hero, 2-4 words max, atmospheric background. |
| **Manifesto** | Articulate identity. Word-by-word scroll scrub or dramatic statement reveal. |
| **Energy** | Create rhythm break. Marquee, kinetic type, counter, visual divider. |
| **Context** | Explain what/who/why. Split layout with text + visual. |
| **Proof** | Show work or results. Asymmetric grid, image-dominant, hover reveals. |
| **Process** | Explain how. Horizontal scroll, numbered steps, sticky + scroll content. |
| **Trust** | Build credibility. Client logos, testimonials, partner grid. |
| **Evidence** | Quantify. Animated counters, statistics, metrics. |
| **Depth** | Go deeper. Expandable content, tabs, long-form with visual breaks. |
| **Differentiator** | Why choose us. Comparison, unique value props. |
| **Close** | Final CTA. Cinematic full-viewport, minimal text, strong verb. |

### Narrative pacing rule

Alternate between high-energy (⚡) and contemplative (🧘) sections:

```
⚡ Impact → 🧘 Manifesto → ⚡ Energy → 🧘 Context → ⚡ Proof → ⚡ Energy → 🧘 Process → 🧘 Trust → ⚡ Evidence → 🧘 Depth → ⚡ Close
```

Never place two dense content sections back-to-back without an energy break.

## Phase 3: Scaffold the page

### Page structure (Vue — adapt to framework)

```vue
<template>
  <article class="page-name" ref="pageRef">

    <!-- Section 1: [Purpose] — [Brief description] -->
    <section class="page-name__hero">
      <!-- Full implementation per Design Brief spec -->
    </section>

    <!-- Section 2: [Purpose] — [Brief description] -->
    <section class="page-name__[name]">
      <!-- Full implementation per Design Brief spec -->
    </section>

    <!-- ... Continue for ALL sections from the Design Brief ... -->

    <!-- Final section: Close — CTA -->
    <section class="page-name__cta">
      <!-- Cinematic close per Design Brief spec -->
    </section>

  </article>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
// Import SplitType if text animation specified in brief
// Import data layer (store/composable per project pattern)

gsap.registerPlugin(ScrollTrigger)

const pageRef = ref(null)

// Data layer connection (per project pattern)
// ...

// Motion system
let ctx = null
onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  ctx = gsap.context(() => {

    // Hero entrance timeline (from Design Brief's page load sequence)
    const heroTl = gsap.timeline()
    // ... orchestrated entrance per brief spec

    // Section reveals (from Design Brief's scroll reveals spec)
    // ... per-section ScrollTrigger instances

    // Scroll-linked animations (from Design Brief's scroll-linked spec)
    // ... pin sections, scrub animations, parallax

  }, pageRef.value)
})

onBeforeUnmount(() => ctx?.revert())

// SEO meta
useHead({
  title: '...',
  meta: [
    { name: 'description', content: '...' },
    { property: 'og:title', content: '...' },
    { property: 'og:description', content: '...' },
  ]
})
</script>

<style scoped>
/* Design tokens from brief */
.page-name {
  --bg: /* from brief */;
  --text: /* from brief */;
  --accent: /* from brief */;
}

/* Atmospheric system from brief */
.page-name::before {
  /* grain overlay if specified */
}

/* Section styles — implement ALL sections from brief */
/* Each section gets its own layout, spacing, typography per brief spec */
</style>
```

### What each section MUST include

Every section in the page must have:

1. **Semantic HTML** — `<section>` with descriptive class, proper heading hierarchy
2. **Content** — Real or realistic placeholder that matches the brief's content specification
3. **Layout** — CSS matching the brief's layout spec (grid columns, split ratios, etc.)
4. **Spacing** — Vertical padding from the brief's spacing scale, never magic numbers
5. **Typography** — Heading/body sizes from the brief's fluid type scale
6. **Background** — Section-specific atmosphere from the brief (color, texture, glow)
7. **Motion** — ScrollTrigger reveal with easing/duration from the brief's choreography
8. **Responsive** — Mobile adaptation per the brief's responsive strategy

### Route registration

- **Vue Router config** → add lazy-loaded route: `() => import('../views/PageName.vue')`
- **Nuxt file-based** → file creation IS registration
- **Add to navigation** → only if page should appear in nav
- **scrollBehavior** → ensure smooth scroll to top on navigation

## Phase 4: Atmospheric layer

Apply the Design Brief's atmospheric system globally to the page:

### Background textures
```css
/* Grid background (if specified in brief) */
.page-name__section--with-grid {
  background-image:
    linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
  background-size: var(--grid-size) var(--grid-size); /* from brief — no hardcoded default */
  mask-image: radial-gradient(ellipse at center, black 30%, transparent 70%);
}

/* Grain overlay (if specified in brief) */
.page-name::after {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  opacity: var(--grain-opacity, 0.035);
  mix-blend-mode: overlay;
  background: url("data:image/svg+xml,..."); /* SVG noise */
  z-index: 9999;
}

/* Accent glow (if specified in brief) */
.page-name__section--glow::before {
  content: '';
  position: absolute;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, var(--accent-glow) 0%, transparent 70%);
  filter: blur(80px);
  pointer-events: none;
}
```

## Phase 4b: 3D/WebGL integration

**Every page should include at least one 3D/WebGL element** from the Design Brief's 3D layer specification. If the brief specifies Tier 1 (atmospheric), add a shader or particle canvas behind the hero or as a persistent background.

### Persistent 3D canvas pattern

```vue
<template>
  <article class="page-name" ref="pageRef">
    <!-- 3D canvas behind all content -->
    <canvas ref="bgCanvas" class="page-name__bg-canvas" aria-hidden="true" />

    <!-- Sections render on top -->
    <section class="page-name__hero">...</section>
    <section class="page-name__content">...</section>
  </article>
</template>

<style scoped>
.page-name__bg-canvas {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}
/* All sections get z-index: 1 and position: relative */
.page-name section {
  position: relative;
  z-index: 1;
}
</style>
```

### Section-specific 3D

Some sections may have their own 3D elements (e.g., a shader-distorted image, a particle explosion, a rotating model). These are embedded within the section, not persistent.

### Mobile fallback

The brief must specify the mobile fallback:
- **Simplified**: Fewer particles, no post-processing, lower pixel ratio
- **CSS-only atmosphere**: Gradient backgrounds, CSS noise, blend modes
- **Static**: Render one frame, display as background image
- **Hidden**: Skip 3D entirely on mobile (last resort)

## Phase 4c: Animation variation enforcement

**Each section must use a DIFFERENT primary animation technique.** Refer to the Design Brief's motion choreography and the `gsap-motion` skill's animation categories.

| Section | Animation category | NOT allowed |
|---------|-------------------|-------------|
| Hero | Timeline (orchestrated) | — |
| Section 2 | Must be DIFFERENT from hero | Timeline |
| Section 3 | Must be DIFFERENT from section 2 | Previous category |
| ... | Continue cycling | No 3+ repeats |

**Never use the same fade-up reveal for every section.** Cycle through: timeline, scrub, reveal, stagger, pin, depth, scale, continuous, dramatic.

## Phase 5: Validate

### Structural validation
- [ ] All sections from Design Brief are present — none skipped
- [ ] Section order matches the narrative arc in the brief
- [ ] Each section has semantic HTML, proper heading hierarchy
- [ ] Route is correctly registered and lazy-loaded

### Content density validation
- [ ] Page meets minimum section count for its type
- [ ] No two dense sections without an energy break
- [ ] Hero section is a full-viewport moment, not a small header
- [ ] Close/CTA section is cinematic, not just a paragraph + button

### Visual validation
- [ ] Design tokens match the brief exactly (colors, typography, spacing)
- [ ] Atmospheric elements present (grain, glows, grid if specified)
- [ ] Background variations between sections create depth

### Motion validation
- [ ] Page load sequence matches brief's choreography
- [ ] All scroll reveals use brief's easing, duration, trigger positions
- [ ] Scroll-linked animations (pin, scrub, parallax) per brief
- [ ] `prefers-reduced-motion` guard wraps all GSAP code

### Technical validation
- [ ] Loading states for async data
- [ ] Error states for failed loads
- [ ] Responsive at mobile/tablet/desktop
- [ ] Accessible heading hierarchy (h1 once, h2-h6 in order)
- [ ] SEO meta tags present (title, description, OG)
- [ ] Images with alt, width, height, lazy loading
