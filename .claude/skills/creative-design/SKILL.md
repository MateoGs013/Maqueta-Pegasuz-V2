---
name: creative-design
description: Design and build creative, high-end frontend experiences by analyzing inspiration URLs, extracting design patterns, and implementing them with the project's full tech stack (Vue, GSAP, Three.js, CSS, etc.). Use when the user shares a URL for inspiration, asks for creative design, wants something "like this site", asks to replicate a visual effect, wants award-level quality, or describes an aesthetic vision. Triggers on "inspiration", "like this", "creative", "design like", "Awwwards", "award", "reference", "estilo como", "inspiracion", "diseno creativo", "como esta pagina", "mirá esta web", "copiar estilo", "quiero algo asi", "landing", "hero", "visual", "efecto", "look and feel".
---

# Creative Design — Immersive Experience Architect
n## Prerequisites

- This skill runs FIRST in the frontend pipeline -- no upstream dependencies
- User must provide at least one of: inspiration URL(s), aesthetic description, or business type
- For Pegasuz clients: docs/content-brief.md should exist first (content-first principle)

## Relevant docs/ files (consumed and produced)

Consumes (if they exist):
- docs/content-brief.md -- understanding the copy helps inform visual decisions
- docs/_templates/design-brief.template.md -- template for output format

Produces:
- docs/design-brief.md -- the primary output with all visual decisions

This skill is the **design brain** of the entire frontend pipeline. It produces a concrete, actionable Design Brief that all other skills consume. No CSS gets written, no color gets chosen, no animation gets choreographed without this skill running first.

**This skill does NOT copy. It extracts principles, deconstructs techniques, and creates original work that surpasses the reference.**

## What this skill produces

A **Design Brief** — a structured document with concrete decisions that downstream skills (page-scaffold, vue-component, gsap-motion, threejs-3d) consume directly. Not abstract descriptions — implementable values.

The brief contains:
1. **Visual identity** — palette (hex values), typography (families + scale), spacing scale, radii, shadows
2. **Atmospheric system** — grain, glows, gradients, background textures, depth layers
3. **Section architecture** — ordered list of sections with purpose, layout, and content density
4. **Motion choreography** — easing curves, durations, stagger patterns, scroll behaviors, page transitions
5. **Interaction design** — cursor behavior, hover states, micro-interactions, feedback patterns
6. **Immersion strategy** — how users get pulled in and why they keep scrolling
7. **3D/WebGL scope** — if needed, what and where
8. **Responsive strategy** — how creative intent translates to mobile/tablet

---

## Phase 1: Gather inspiration

### If the user provides URL(s)

For each URL, use **WebFetch** to retrieve the page content. Analyze across 6 dimensions:

#### 1. Layout architecture
- How is the page composed? Full-viewport sections, overlapping layers, asymmetric grids, horizontal scroll, freeform?
- Grid system: columns, gaps, container width, asymmetry ratios
- How do sections flow into each other? Hard breaks, overlap, seamless transitions?
- Whitespace strategy: generous breathing room or dense information design?
- Hero pattern: what dominates the first viewport?

#### 2. Typography system
- Scale: what's the ratio between display heading and body text?
- Personality: geometric, humanist, serif, mono, display, variable, custom?
- Treatment: letter-spacing, text-transform, line-height, color, mixed weights
- Role: is typography THE visual element or supporting cast?
- Animation: split text, character reveals, word-by-word, kinetic type?

#### 3. Color & atmosphere
- Palette: dominant, secondary, accent — extract hex values
- Mode: dark, light, muted, saturated, monochrome, duotone
- Atmospheric layers: grain overlay, grid backgrounds, radial glows, mesh gradients, blur
- Surface treatment: flat, depth via shadows, glassmorphism, layered

#### 4. Motion & interaction
- Scroll architecture: Lenis/Locomotive smooth scroll, scroll-linked animations
- Reveal patterns: fade, slide, clip-path, scale, stagger, split-text, morph
- Timing personality: slow cinematic vs snappy responsive
- Interaction: custom cursor, magnetic buttons, hover distortion, tilt
- Page transitions: overlay, clip-path, WebGL morph, fade
- Preloader: how does the experience begin?

#### 5. Content deployment
- How much content per section? Dense or singular focus?
- Progressive disclosure: how information reveals over scroll
- Image treatment: parallax, scale-on-scroll, clip-path reveal, canvas rendering
- Video: ambient loops, scroll-scrubbed, interactive
- CTA rhythm: where and how calls-to-action appear

#### 6. Immersion techniques
- What makes the user want to keep scrolling?
- Narrative flow: does it tell a story or present information?
- Emotional arc: impact -> context -> proof -> trust -> action?
- Partial reveals at section boundaries (next section peeks in)
- Ambient motion (floating elements, gentle oscillation, particles)
- Sound design integration?

### If the user describes an aesthetic (no URL)

Translate the aesthetic direction into a complete visual system. The table below is a starting point — combine descriptors for specificity.

| Aesthetic | Visual system |
|-----------|--------------|
| **Minimalista** | Max whitespace, 2-3 colors, restrained motion (subtle fades 300ms), large type with tight tracking, few elements per section, generous vertical padding, no texture |
| **Brutalist** | Monospace + heavy sans, harsh contrast (black/white + one neon), broken grids with overlap, no border-radius anywhere, abrupt cuts instead of transitions, raw borders |
| **Luxury/premium** | Dark palette with warm accent glow, slow motion (1-1.2s reveals), generous spacing (120px+ between sections), metallic/glass textures, serif + geometric sans pairing |
| **Editorial/magazine** | Image-dominant (60-80% visual area), serif headlines + sans body, structured grid with intentional breaks, pull quotes, caption systems, reading rhythm |
| **Playful** | Rounded elements (16-24px radius), vivid saturated palette, bouncy elastic easing, illustrations/icons as primary visual, dynamic asymmetric layout |
| **Tech/futuristic** | Grid overlays with low-opacity lines, monospace accents, particles or data-viz elements, scan-line effects, glow edges, dark with electric accent |
| **Organic/natural** | Soft curves in layout and elements, earth tones (sage, clay, cream), flowing layout with gentle asymmetry, subtle texture (paper, fabric), gentle motion |
| **Glassmorphism** | Backdrop-filter blur panels, transparency layers, soft borders (1px white at 15%), light refraction hints, gradient backgrounds behind panels |
| **Neo-brutalist** | Chunky 3-4px borders, clashing vivid colors, zero border-radius, bold geometric sans, raw HTML aesthetic elevated, shadows hard not soft |
| **Dark mode elegance** | Deep dark background (choose per brand — charcoal, navy, forest, obsidian, not always the same black), accent glow (radial, not flat), subtle grain overlay, refined thin type at small sizes, smooth reveals, muted text (warm or cool per brand, not always the same off-white) |
| **Corporate clean** | Neutral palette (slate/zinc), strict 12-col grid, consistent 8px spacing unit, professional sans (Inter, SF Pro), functional motion (quick ease-out), predictable rhythm |
| **Experimental** | Rule-breaking layout (overlapping, off-grid), custom shaders, unconventional scroll behavior, generative elements, art-directed per-section, maximum creative risk |
| **Cinematico** | Full-viewport sections as "frames", slow deliberate motion (1-1.5s), dramatic scale contrast, dark palette, video/image fullbleed, minimal UI chrome |

**Always combine.** "estudio de diseño gráfico" could be editorial + experimental + portfolio-heavy, OR brutalist + playful, OR minimal + cinematico. Don't default to the same combination every time. "inmobiliaria premium" could be luxury + editorial, OR organic + cinematico, OR glassmorphism + minimal. **Be creative and varied.**

### If the user gives a business type only (no URL, no aesthetic)

Infer the aesthetic from the industry — but **never default to the same combination twice**. The table below shows EXAMPLES, not prescriptions. Each project should explore a DIFFERENT aesthetic territory.

| Business type | Possible directions (choose ONE, vary between projects) |
|---------------|------------------------------|
| Estudio de diseño gráfico | Editorial + experimental // Brutalist + bold color // Minimal + kinetic type // Dark + 3D generative |
| Inmobiliaria | Luxury + editorial imagery // Organic + warm cinematico // Clean + large photography // Dark + glassmorphism |
| Agencia de marketing | Tech/futuristic + particles // Playful + illustration-heavy // Editorial + dark // Brutalist + neon accent |
| Restaurante | Organic + warm tones // Editorial + food photography // Playful + bright // Dark luxury + ambient video |
| E-commerce | Clean + product-focused // Playful + hover interactions // Minimal + large imagery // Tech + dynamic filtering |
| Startup tech | Minimal + glassmorphism // Dark + 3D particles // Playful + bold type // Clean + data visualization |
| Consultora | Corporate + editorial // Minimal + slow reveals // Dark elegance + authority // Clean + structured grid |
| Estudio de arquitectura | Minimal + large imagery // Cinematico + horizontal scroll // Brutalist + raw // Dark + 3D architectural |

**Anti-pattern: defaulting to "dark + orange accent + grain + power3.out" for everything.** Each project MUST have its own identity. Different palette, different typography, different motion personality, different atmosphere.

Present the inferred direction to the user for confirmation before proceeding to the full brief.

---

## Phase 2: Discover project capabilities

Scan the project to map available tools:

1. **Framework**: Vue, Nuxt, React, Next, etc. from `package.json`
2. **Animation**: GSAP + ScrollTrigger, SplitType/SplitText, Framer Motion
3. **3D**: Three.js, TresJS, R3F, Canvas 2D, or none
4. **Smooth scroll**: Lenis, Locomotive, native
5. **CSS approach**: Custom properties, Tailwind, SCSS, modules
6. **Existing components**: What's already built (read 3-5 components)
7. **Design docs**: Any existing brand/motion/UI rules

### Technique-to-stack mapping

| Technique | If available | If NOT available |
|-----------|-------------|-----------------|
| Smooth scroll | Lenis → use it | Recommend installing Lenis |
| Scroll reveals | GSAP ScrollTrigger → use it | CSS IntersectionObserver fallback |
| Text splitting | SplitType → use it | Install SplitType or manual spans |
| Horizontal scroll | GSAP ScrollTrigger pin + translateX | CSS scroll-snap alternative |
| Parallax depth | GSAP scrub on multiple layers | CSS transform with scroll listener |
| 3D backgrounds | Three.js/TresJS → full scenes | Canvas 2D wireframes (lightweight) |
| Shader effects | Three.js ShaderMaterial | CSS filters + blend-modes |
| Custom cursor | Vue component + rAF lerp | CSS cursor + hover states |
| Page transitions | GSAP timeline + router hooks | CSS transition classes |
| Preloader | GSAP timeline + clip-path reveal | CSS animation |
| Particles | Three.js Points or Canvas 2D | CSS radial-gradient animated dots |
| Grain/noise | SVG filter overlay | CSS background-image noise pattern |
| Image parallax | GSAP scrub scale(1.15) in overflow-hidden | CSS background-attachment |

---

## Phase 3: Section architecture — the narrative

This is where most skills fail. A page is NOT "hero + content + footer." A page is a **story** with rhythm, pacing, emotional arc, and enough density to make the experience feel complete.

### Content density rules

| Page type | Minimum sections | Narrative structure |
|-----------|-----------------|---------------------|
| Homepage / landing | 8-14 sections | Impact -> Context -> Proof -> Energy -> Process -> Trust -> Evidence -> Close |
| About / studio | 6-10 sections | Identity -> Story -> Team -> Values -> Culture -> CTA |
| Services / offerings | 6-10 sections | Overview -> Detail grid -> Process -> Results -> Differentiator -> CTA |
| Portfolio / work | 5-8 sections | Hero -> Featured -> Grid/gallery -> Testimonials -> CTA |
| Case study / project detail | 6-10 sections | Context -> Challenge -> Process -> Solution -> Results -> Next |
| Contact | 3-5 sections | Statement -> Form -> Info/map -> Closing |
| Blog listing | 4-6 sections | Hero -> Featured -> Grid -> Categories -> CTA |
| Blog article | Standard prose + hero | Hero image -> Content -> Author -> Related |

### Section purpose library

Every section must have a **purpose** in the narrative. Choose from:

| Purpose | What it achieves | Example execution |
|---------|-----------------|-------------------|
| **Impact** | Stop the user. Create a first impression. | Full-viewport hero with bold statement, 2-4 words max, atmospheric background |
| **Manifesto** | Articulate the identity or mission | Word-by-word scroll scrub, single statement, dramatic pacing |
| **Energy** | Create rhythm between contemplative sections | Marquee strip, kinetic type, animated counter, visual break |
| **Context** | Explain what/who/why | Split layout: visual left + text right (or inverted), with scroll reveal |
| **Proof** | Show work, results, portfolio | Asymmetric grid, hover reveal overlays, image-dominant |
| **Process** | Explain how it works | Horizontal scroll pin, numbered steps, sticky sidebar + scrolling content |
| **Trust** | Build credibility | Client logos at low opacity, testimonial carousel, partner grid |
| **Evidence** | Quantify results | Animated counters, statistics grid, data visualization |
| **Depth** | Go deeper into a topic | Accordion/expand sections, tabbed content, long-form with visual breaks |
| **Differentiator** | Why choose us over alternatives | Comparison, unique value props with icons, bold statement |
| **Close** | Final call to action | Cinematic full-viewport CTA, minimal text, strong verb, atmospheric treatment |
| **Transition** | Break between content types | Gradient divider, decorative element, subtle horizontal rule with glow |

### Narrative pacing

Alternate between **high-energy** and **contemplative** sections:

```
[Impact ⚡] → [Manifesto 🧘] → [Energy ⚡] → [Context 🧘] → [Proof ⚡] → [Energy ⚡] → [Process 🧘] → [Trust 🧘] → [Evidence ⚡] → [Depth 🧘] → [Close ⚡]
```

Never place two dense content sections back-to-back. Insert an energy break (marquee, visual divider, counter, or breathing space) between heavy sections.

### Section flow patterns (how sections connect)

| Pattern | Effect | Implementation |
|---------|--------|----------------|
| **Hard section** | Clear chapter break | Full-width horizontal rule, background color change, generous padding |
| **Overlap** | Depth, elements bleed into next | Negative margin, z-index layering, position: relative |
| **Seamless gradient** | Smooth color transition | Background gradient spanning two sections |
| **Peek reveal** | Curiosity, next section partially visible | Next section's first element visible at bottom of current viewport |
| **Sticky handoff** | Pinned content transitions to new content | ScrollTrigger pin with content swap inside |

---

## Phase 4: Immersion strategy — the 7 dimensions

A truly immersive site operates on 7 dimensions simultaneously. An "animated page" only covers 1-2. Award-level work covers 5+.

### The 7 dimensions of immersion

| Dimension | What it means | "Animated page" (basic) | "Immersive experience" (award-level) |
|-----------|--------------|------------------------|-------------------------------------|
| **1. Reactivity** | Environment responds to user | Hover color changes | Cursor-reactive particles, mouse-repelling elements, tilt on hover, magnetic buttons, shader distortion on mouse proximity |
| **2. Spatial depth** | Sense of existing in a space | Flat 2D sections | Parallax layers, 3D camera paths, z-depth via blur/scale/opacity, elements that exist "behind" or "in front of" content |
| **3. Continuity** | Elements persist across boundaries | Each section isolated | Persistent canvas/3D background, particles that flow between sections, color transitions, header that morphs, cursor that carries state |
| **4. Surprise & variation** | Breaking the expected pattern | Same fade-up everywhere | Each section has its own animation signature — clip-path here, word-scrub there, horizontal pin next, scale reveal after |
| **5. Atmosphere** | Beyond-visual sensory feel | Clean flat surfaces | Grain texture, ambient glow, mesh gradients, subtle noise, light leaks, film effects, optional sound |
| **6. Narrative structure** | Scroll as storytelling | Info blocks in order | Emotional arc (impact → context → proof → trust → action), pacing variation, energy breaks, dramatic pauses |
| **7. Generative/procedural** | Alive, non-repeating visuals | Static backgrounds | Noise-driven particles, flow fields, procedural patterns, shader-generated textures, data-reactive visuals |

### Immersion score target

For every project, aim for at least 5/7 dimensions. The brief must explicitly address each dimension:

```
Dimension 1 (Reactivity): [How the site reacts to the user — cursor, scroll, hover]
Dimension 2 (Spatial depth): [How depth is created — parallax, 3D, z-layers]
Dimension 3 (Continuity): [What persists across sections — canvas, particles, color]
Dimension 4 (Surprise): [How animation varies per section — different technique each time]
Dimension 5 (Atmosphere): [Sensory layer — texture, grain, glow, ambient motion]
Dimension 6 (Narrative): [Story arc — emotional progression section by section]
Dimension 7 (Generative): [Alive visuals — procedural, noise-driven, unique per visit]
```

### Concrete immersion techniques (specify in the brief)

#### Reactive techniques (Dimension 1)
| Technique | Implementation | When to use |
|-----------|---------------|-------------|
| **Mouse-reactive particles** | Three.js Points with positions influenced by mouse coordinates via uniform | Hero backgrounds, section atmospheres |
| **Cursor-driven shader distortion** | ShaderMaterial with `uMouse` uniform, displacement map distortion around cursor | Image hovers, background effects |
| **Magnetic buttons** | GSAP lerp tracking mouse within button bounding box, elastic.out return | CTAs, navigation items |
| **Tilt on hover** | `mousemove` → calculate angle → `transform: perspective(800px) rotateX(Ydeg) rotateY(Xdeg)` | Cards, panels, images |
| **Mouse repulsion** | Particles/elements that push away from cursor with spring physics | Decorative elements, backgrounds |
| **Scroll velocity visual response** | `ScrollTrigger.getVelocity()` → map to skew, particle speed, blur, or scale | Global or per-section |

#### Spatial depth techniques (Dimension 2)
| Technique | Implementation | When to use |
|-----------|---------------|-------------|
| **Scroll-driven camera path** | Three.js camera position interpolated along a curve based on scroll progress | Full-page 3D experiences |
| **Multi-layer parallax** | 3+ layers at different speeds (background -3, mid -6, foreground -12) | Section backgrounds, heroes |
| **Depth-of-field blur** | CSS `filter: blur()` on background layers, sharp foreground | Creating focal hierarchy |
| **Scale-on-scroll** | Elements scale from 0.8 to 1.0 as they enter viewport | Section entrances |
| **z-layer composition** | Overlapping elements with `z-index` + `translateZ` + perspective | Complex visual layouts |

#### Continuity techniques (Dimension 3)
| Technique | Implementation | When to use |
|-----------|---------------|-------------|
| **Persistent WebGL canvas** | Fixed-position canvas behind content, reacting to scroll position | Ambient background for entire site |
| **Color morphing** | `ScrollTrigger` driving CSS custom property changes per section | Section-to-section transitions |
| **Flowing particles** | Particle system that continues across section boundaries | Background atmosphere |
| **Morphing cursor** | Custom cursor that changes shape/size/color per section context | Interactive discovery |
| **Persistent audio layer** | Ambient sound that shifts tone per section (Howler.js, opt-in) | Multisensory experiences |

#### Surprise & variation techniques (Dimension 4)
| Technique | Animation type | Section purpose |
|-----------|---------------|-----------------|
| **Clip-path reveal** | `clip-path: inset(100% 0 0 0)` → `inset(0)` | Hero, featured work |
| **Word-by-word scrub** | SplitType + scroll-scrubbed opacity per word | Manifesto, statements |
| **Horizontal pin scroll** | ScrollTrigger pin + translateX | Process, timeline |
| **Scale-in from center** | `scale(0) → scale(1)` with clip-path circle | Impact moments |
| **Stagger grid pop** | Grid items with random delay stagger (not linear) | Portfolio, gallery |
| **Counter roll-up** | Animated number counting with custom easing | Evidence, statistics |
| **Marquee strip** | Infinite horizontal scroll text/images | Energy breaks |
| **Accordion reveal** | Height animation + content fade | Deep content |
| **Image displacement** | WebGL shader with displacement map on hover | Portfolio items |
| **Parallax text** | Text at different scroll speeds than background | Large statements |

**Rule: Never use the same animation technique for more than 3 consecutive sections. Each section should feel like a new chapter.**

#### Generative techniques (Dimension 7)
| Technique | Implementation | When to use |
|-----------|---------------|-------------|
| **Flow field particles** | Noise-driven velocity field (Perlin/Simplex), particles follow flow | Backgrounds, heroes |
| **Shader backgrounds** | Custom fragment shader (noise, gradient, organic patterns) | Hero, section backgrounds |
| **GPGPU particles** | Three.js + DataTexture for massive particle counts (100k+) | Visual spectacles |
| **Procedural geometry** | Noise-deformed meshes, parametric surfaces | 3D elements |
| **Generative color** | HSL cycling, noise-driven palette shifts | Ambient atmosphere |

### What makes users keep scrolling

1. **Partial reveals at boundaries** — Next section peeks into current viewport
2. **Progressive disclosure** — Each scroll increment rewards with new content
3. **Scroll velocity response** — Visual feedback reacts to scroll speed
4. **Ambient living motion** — Subtle continuous movement makes the page feel alive
5. **State changes on scroll** — Background shifts, cursor morphs, header transforms
6. **Custom cursor as companion** — Contextual cursor creates interactive discovery
7. **Sound design** (optional, always opt-in) — Ambient audio adds multisensory dimension
8. **Preloader as introduction** — Loading sequence is chapter zero
9. **Typography as event** — Text that reveals word-by-word becomes a visual experience
10. **Emotional arc** — Page moves user: surprise → understanding → admiration → trust → action

### Immersion techniques to specify in the brief

For each technique used, the brief must specify HOW (not just "use parallax" but "images inside overflow-hidden containers with scale(1.15), translateY scrubbed -8% to +8% on scroll"):

| Technique | Specification required |
|-----------|----------------------|
| Preloader | Animation sequence, duration, transition-into-hero method (clip-path, scale, opacity) |
| Smooth scroll | Library, easing curve, lerp value |
| Text reveals | Split method (lines/words/chars), stagger value, easing, trigger position |
| Image treatment | Parallax amount, scale, reveal method (clip-path direction, fade, slide) |
| Section transitions | How one section flows into the next (overlap, gradient, hard break, pin) |
| Hover interactions | What transforms, what the timing is, multi-property sequences |
| Cursor | States (default, hover-link, hover-project, hover-CTA), transition between states |
| Background atmosphere | Grain opacity, glow color + blur radius, mesh gradient colors |
| Page transitions | Enter sequence, exit sequence, duration, easing, what persists during transition |
| 3D/WebGL layer | What scene, where positioned, how it reacts to scroll/mouse, mobile fallback |
| Shader effects | Which shaders, what triggers them (hover, scroll, time), uniforms needed |
| Reactive elements | What responds to cursor/scroll velocity, what physics (spring, lerp, elastic) |

---

## Phase 5: Produce the Design Brief

### Brief structure (deliver ALL of this)

```markdown
# Design Brief: [Project Name]

## 1. Direction
- **Aesthetic**: [combined descriptors, e.g., "Editorial dark + cinematico"]
- **Mood**: [2-3 emotion words, e.g., "Authoritative, precise, immersive"]
- **Reference**: [URL or description that inspired]
- **Business context**: [What the client does, who visits the site]

## 2. Visual Identity

### Color palette
- Background: [hex]
- Background deep: [hex] (for section alternation)
- Text primary: [hex]
- Text muted: [hex]
- Accent: [hex]
- Accent glow: [rgba with low alpha for glows]
- Selection: [hex at opacity]
- Lines/borders: [rgba]

### Typography
- Display: [family], [weight], letter-spacing [value], line-height [value]
- Body: [family], [weight], line-height [value]
- Meta/eyebrow: [family], [weight], [size], text-transform uppercase, letter-spacing [value]
- Fluid scale: hero [clamp(min, preferred, max)], h2 [clamp], h3 [clamp], body [clamp]

### Spacing
- Section vertical padding: [clamp value]
- Container max-width: [value]
- Container padding (gutter): [clamp value]
- Grid gap: [value]
- Component internal padding: [value]

### Surfaces
- Border radius: [values per context: cards, buttons, inputs]
- Shadows: [values per elevation level]
- Grain overlay: [opacity, blend-mode]
- Background texture: [grid/dots/none, size, opacity]

## 3. Atmospheric System
- [Describe grain, grid backgrounds, radial glows, mesh gradients]
- [Specify exact CSS values: opacity, blend-mode, gradient definitions]
- [Per-section atmospheric variations if applicable]

## 4. Section Architecture

### Section [N]: [Name] — [Purpose]
- **Layout**: [Description: full viewport, split 60/40, 3-col grid, etc.]
- **Content**: [What goes here: headline, body text, image, cards, etc.]
- **Visual weight**: [High/medium/low — does this section dominate or breathe?]
- **Background**: [Color, texture, atmospheric elements]
- **Motion**: [What animates, how, when triggered]
- [Repeat for every section — minimum based on page type rules]

## 5. Motion Choreography

### Brand easing curve
- Entrances: [cubic-bezier or GSAP ease name]
- Exits: [if applicable]
- Scrub: [linear or custom]
- Hover: [cubic-bezier]

### Page load sequence
- Preloader: [description, duration, transition method]
- Hero entrance: [timeline — element 1 at 0s, element 2 at 0.2s, etc.]

### Scroll reveals
- Default: [property animated, distance, duration, easing, trigger position]
- Stagger pattern: [delay between elements]
- Text reveal: [split method, per-word/char stagger, duration]

### Scroll-linked animations
- [Which sections use scroll scrub, what transforms]
- [Pin sections: which, for how long (vh), what happens inside]

### Hover interactions
- Links: [underline behavior, color shift]
- Cards: [translateY, shadow change, overlay reveal, scale]
- Interactive elements: [magnetic pull range, scale, glow]

### Page transitions
- Exit: [what happens to current page content]
- Enter: [how new page content appears]
- Duration: [total]
- Persistent elements: [header, cursor, canvas]

## 6. Interaction Design
- Cursor: [custom or default, states per element type, lerp values]
- Scroll behavior: [smooth scroll library, easing]
- Navigation: [sticky header behavior, transform on scroll, transparency]
- Mobile interactions: [touch equivalents for hover, swipe patterns]

## 7. 3D/WebGL Layer
**Every project should have at least one 3D/WebGL element** unless explicitly opted out. 3D is not optional decoration — it's a primary immersion tool.

### Tier system (choose based on project complexity):

**Tier 1 — Atmospheric (minimum):** Shader background, particle field, or noise-driven canvas. Subtle, ambient, behind content. Low performance cost.

**Tier 2 — Interactive:** Mouse-reactive 3D elements, scroll-driven camera, hover shader distortion. Medium performance cost.

**Tier 3 — Spectacular:** GPGPU particles, full 3D scenes, model loading, post-processing pipeline. Higher performance cost, bigger impact.

### Specify:
- Where: [hero background, persistent canvas, specific section, full-page]
- What: [particles, shader, wireframe, model, flow field, noise mesh]
- Reactivity: [mouse-reactive, scroll-driven, time-based, idle animation]
- Scroll integration: [camera path, morph, color shift, intensity change]
- Post-processing: [bloom, chromatic aberration, DOF, vignette — if any]
- Mobile fallback: [simplified particles, static gradient, CSS-only atmosphere, hidden]

## 8. Responsive Strategy
- Breakpoints: [values]
- Mobile-first or desktop-first
- What changes per breakpoint: [columns, type scale, section padding, motion reduction]
- What gets hidden on mobile: [3D, complex animations, decorative elements]
- Touch adaptations: [cursor removal, tap targets, swipe gestures]
```

---

## Phase 6: Persist the brief

**The Design Brief must be saved to a file** so downstream skills can read it without re-generating.

### Save location

| Project type | Save path |
|-------------|-----------|
| Pegasuz client frontend | `Clientes/<slug>/docs/design-brief.md` |
| Pegasuz institutional site | `docs/design-brief.md` |
| Standalone project | `docs/design-brief.md` |

### File format

Save the complete brief using the template from Phase 5, with frontmatter:

```markdown
---
project: [Project Name]
aesthetic: [Combined descriptors]
created: [YYYY-MM-DD]
status: active
---

# Design Brief: [Project Name]

[Full brief content from Phase 5...]
```

### Update protocol

- If a brief already exists and the user asks for changes, **update the existing brief** — don't create a new one.
- Mark the update date in frontmatter.
- Downstream skills always read the latest version of the brief file.

### Verification

After saving, confirm:
- [ ] File exists at the correct path
- [ ] All 8 sections of the brief are present
- [ ] All values are concrete (hex codes, rem values, ms durations)
- [ ] Section architecture has minimum section count for page type

---

## Phase 7: Quality bar — the Awwwards standard

Based on analysis of Site of the Year winners (Igloo Inc, Locomotive, Immersive Garden, Unseen Studio, Darkroom Engineering, Monopo London):

### What separates award-level from generic

| Dimension | Generic site | Award-level site |
|-----------|-------------|-----------------|
| **Section count** | 3-5 sparse sections | 8-14 purposeful sections with narrative arc |
| **Hero** | Stock image + headline + CTA button | Full-viewport moment: bold typography OR 3D scene OR video, minimal text, atmospheric background, orchestrated reveal timeline |
| **Typography** | One sans-serif at regular sizes | Display + body pairing, fluid clamp scale, tight letter-spacing on headlines, text-as-visual-element |
| **Color** | 5 colors from a template | 2-3 core colors + atmospheric variants (glows, transparencies, opacity gradations) |
| **Motion** | Fade-in on scroll | Orchestrated timelines, scroll-scrub sections, staggered sequences, custom easing curves as brand identity |
| **Hover** | Color change + underline | Multi-property sequences: translateY + shadow + scale, or overlay reveals, or gradient sweeps |
| **Scroll** | Native or basic smooth | Lenis/Locomotive + ScrollTrigger, sections that pin and transform, parallax depth |
| **Atmosphere** | Clean flat surfaces | Grain overlay, grid backgrounds, radial accent glows, mesh gradients, depth via layering |
| **Cursor** | Default browser | Custom cursor with contextual states (circle, expand, arrow, text) + coordinate display |
| **Page transition** | Instant route change | Orchestrated exit/enter with persistent canvas or overlay |
| **Preloader** | Spinner or none | Brand introduction: animated logo, progress, visual sequence that transitions into hero |
| **Footer** | Links + copyright | Destination section: large CTA, unique layout, closing statement, atmospheric treatment |
| **Mobile** | Same content, single column | Creative intent preserved: simplified motion, touch-adapted interactions, responsive type scale |

### Self-critique checklist (after producing the brief)

**Structure & content:**
- [ ] Does the brief specify at least 8 sections for a homepage?
- [ ] Is there a clear emotional arc from first to last section?
- [ ] Are there at least 2 "energy break" sections (marquee, counter, visual divider)?
- [ ] Does every section have a PURPOSE (not just "another content block")?

**Visual identity — ORIGINALITY CHECK:**
- [ ] Is the color palette DIFFERENT from any previous project? (not the same dark + orange/warm accent)
- [ ] Is the typography pairing UNIQUE? (not the same display + body combo every time)
- [ ] Are all values concrete (hex codes, rem values, ms durations)?
- [ ] Would this brief produce a site visually distinct from ALL other projects?

**Immersion — 7 DIMENSIONS CHECK:**
- [ ] Dimension 1 (Reactivity): How does the site react to the user? (cursor, hover, scroll)
- [ ] Dimension 2 (Spatial depth): How is depth created? (parallax, 3D, layers)
- [ ] Dimension 3 (Continuity): What persists across sections? (canvas, particles, color)
- [ ] Dimension 4 (Surprise): Do sections use VARIED animation techniques? (not all fade-up)
- [ ] Dimension 5 (Atmosphere): Is there a sensory layer? (texture, glow, ambient motion)
- [ ] Dimension 6 (Narrative): Is there an emotional arc? (impact → context → proof → close)
- [ ] Dimension 7 (Generative): Are there alive, non-static visuals? (noise, particles, shaders)
- [ ] Does the brief cover at least 5 of 7 dimensions?

**3D/WebGL:**
- [ ] Is a 3D/WebGL element specified? (at minimum Tier 1 atmospheric)
- [ ] Is the mobile fallback defined?

**Motion:**
- [ ] Is motion choreography detailed enough to implement without guessing?
- [ ] Is the preloader/page-load experience defined?
- [ ] Are hover interactions described for all interactive elements?
- [ ] Do different sections use DIFFERENT animation techniques?

**Anti-clone check:**
- [ ] The palette is NOT #0a0a0b + #ff6a00 or any close variation
- [ ] The easing is NOT always power3.out / power4.out
- [ ] The grain is NOT always 2-4% opacity
- [ ] The Y offset is NOT always 32px
- [ ] The reveal duration is NOT always 0.8s
- [ ] The grid background is NOT always 80px
- [ ] The text color is NOT always warm bone / off-white

---

## Award-level design principles

1. **Craft obsession** — Every pixel, timing value, and spacing decision is intentional. No defaults.
2. **Custom easing as brand identity** — Your cubic-bezier curve IS your brand's motion fingerprint. Never use generic ease-in-out.
3. **Restraint with purpose** — Know when NOT to animate. Silence makes the loud moments louder.
4. **One surprise per page** — At least one moment that delights: an unexpected interaction, a clever reveal, a visual twist.
5. **Coherence** — Every visual decision supports the same language. If the hero is cinematic, the footer can't be corporate.
6. **Content density** — Award sites have substance. They tell stories with 10+ sections, not 3 sparse blocks.
7. **Atmosphere** — Flat surfaces are dead. Grain, glow, depth, texture make screens feel physical.
8. **Typography as composition** — Headlines should function as visual elements, not just text containers.
9. **Performance** — Complex visuals that still render at 60fps. GPU-only animations, lazy loading, observer-paused canvases.
10. **Responsive creativity** — Mobile isn't "desktop but smaller." It's a different canvas with its own creative solutions.
