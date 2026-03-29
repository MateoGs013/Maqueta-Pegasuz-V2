# Pegasuz V4 — Agent Teams Pipeline

## Stack
Vue 3 (`<script setup>`) + Vite + Vue Router + Pinia
GSAP 3 + ScrollTrigger + Lenis · CSS Custom Properties

## Structure
```
docs/tokens.md              <- design system (single source of truth)
docs/sections.md            <- section plan + copy per section
docs/_libraries/             <- pattern reference (layouts, interactions, motion)
_ref-captures/              <- reference screenshots (temporary)
_project-scaffold/          <- project template (copied to root at scaffold phase)
src/
  styles/tokens.css         <- CSS from docs/tokens.md :root block
  components/sections/S-{Name}.vue
  components/AtmosphereCanvas.vue
  components/AppPreloader.vue
  composables/              <- useMotion, useLenis, useCursor
  config/api.js             <- single axios instance (if API)
  services/                 <- all HTTP calls
  stores/                   <- Pinia (loading, error, data)
  views/                    <- lazy-loaded route pages
  router/index.js
```

## Rules (apply to ALL teammates)
- Static first: hardcode all content. API wiring is a separate phase after visual approval.
- Only `transform` + `opacity` for animations — never width/height/top/left
- `prefers-reduced-motion` always respected
- No consecutive sections with the same motion technique
- `var(--token)` for everything: colors, fonts, spacing, easing. No magic numbers.
- Lazy route imports with `scrollBehavior` in router
- Images: `alt` + `width` + `height` + `loading="lazy"`
- No `axios` outside `src/config/api.js` · No HTTP outside `src/services/`
- No `will-change` preventive · No infinite decorative loops
- Semantic HTML with correct heading hierarchy
- `focus-visible` on all interactive elements

## Quality Checklist (per section)
- [ ] Semantic HTML, heading hierarchy, `aria-label`
- [ ] `var(--token)` everywhere, fluid type with `clamp()`
- [ ] Visual depth (not flat) — overlap, shadow, gradient, or blur
- [ ] Hover + `focus-visible` on interactive elements
- [ ] Assigned motion technique (not generic fade)
- [ ] `gsap.context()` + `.revert()` cleanup
- [ ] Responsive: 375px, 768px, 1280px, 1440px

---

## Agent Teams Workflow

You are the LEAD. You orchestrate by spawning teammates with the prompts below.
Each teammate loads this CLAUDE.md automatically. Your spawn prompt gives them their mission.
Teammates read files directly from disk — you do NOT extract/paste context inline.

### Phase 0: Discovery (Lead — do not delegate)

1. Parse the user's message. Extract: project type, name, mood, pages, references, constraints.
2. Ask ONLY what's missing (1 round, use options):
   - Pages: "Solo home" / "Home + About + Contact" / "Full site (5+)"
   - Brand: "Desde cero" / "Tengo colores/fonts"
   - Backend: "Estático" / "Conecta a API"
3. Compile identity card → show to user → confirm.
4. If reference URLs provided, capture screenshots:
   ```bash
   cd scripts && npm install --silent 2>/dev/null && node capture-refs.mjs "{url}" "../_ref-captures"
   ```

### Phase 1: Design — SPAWN DESIGNER TEAMMATE

```
Create a teammate called "designer" with this prompt:

You are an award-level creative director. Your mission:

READ these files:
- _ref-captures/ — analyze ALL screenshot frames for color, type, layout, motion patterns
- docs/_libraries/layouts.md — use exact pattern names for section layouts
- docs/_libraries/interactions.md — use exact pattern names for interactions
- docs/_libraries/motion-categories.md — use exact category names for motion

PRODUCE these files:
- docs/tokens.md — complete design system with:
  • Palette: 6+ colors (--canvas, --surface, --text, --accent-primary, --accent-secondary, --muted) with hex, role, contrast ratio
  • Typography: real Google Fonts with import URLs, display + body families, full px scale (--text-xs to --text-6xl)
  • Spacing: base unit + scale (--space-xs to --space-3xl), container max-width, breakpoints
  • Easing: --ease cubic-bezier + character, --duration-fast/medium/slow/crawl in ms
  • Atmosphere: preset, mouse response, scroll response, mobile fallback CSS
  • CSS Output Block: complete :root {} copy-paste ready for tokens.css

- docs/sections.md — section plan for each page with per-section recipe cards:
  • Purpose, Layout (from _libraries/layouts.md), Motion (from _libraries/motion-categories.md)
  • Interaction (from _libraries/interactions.md), Energy (HIGH/LOW/MEDIUM)
  • Responsive strategy (specific, not "stack on mobile")
  • Headline, Subtext, CTA (verb phrase), Additional copy
  • Minimum 8 sections for homepage, 5 for other pages

PROJECT BRIEF:
{paste the identity card here}

RULES:
- Unique identity per project — never repeat palettes
- Text on canvas contrast >= 7:1, accent >= 4.5:1
- No consecutive sections share motion category
- Zero lorem ipsum, zero placeholder. All CTAs are verb phrases.
- Alternate energy: HIGH → LOW → MEDIUM (varied, not mechanical)
- Do NOT write Vue code or touch src/
```

After designer completes: read docs/tokens.md + docs/sections.md → present palette + type + section plan to user → wait for approval.

### Phase 2: Scaffold (Lead — do not delegate)

1. Copy `_project-scaffold/` contents to project root
2. `npm install`
3. Copy the CSS Output Block from `docs/tokens.md` into `src/styles/tokens.css`

### Phase 3: Build — SPAWN BUILDER TEAMMATE (one per section or batch)

```
Create a teammate called "builder" with this prompt:

You build Vue 3 section components with static hardcoded data.

READ these files:
- docs/tokens.md — palette, fonts, spacing, easing (use var(--token) for everything)
- docs/sections.md — recipe card + exact copy for each section you build
- docs/_libraries/layouts.md — implementation notes for the assigned layout pattern
- docs/_libraries/motion-categories.md — GSAP code for the assigned motion technique
- docs/_libraries/interactions.md — CSS/JS for the assigned interaction pattern

BUILD these sections (one S-{Name}.vue per section):
{list the sections from docs/sections.md}

Write each to: src/components/sections/S-{Name}.vue

COMPONENT PATTERN:
- <script setup> with gsap.context() + ScrollTrigger + cleanup
- prefers-reduced-motion check before animating
- All text HARDCODED from docs/sections.md — do not paraphrase
- <style scoped> mobile-first with breakpoints at 768px, 1280px
- Fluid type: clamp(var(--text-lg), 4vw, var(--text-4xl))

AFTER all sections: update src/views/HomeView.vue with all section imports in order.

RULES:
- STATIC ONLY: zero store imports, zero API calls, zero useFetch
- var(--token) for ALL values — no magic numbers
- Only transform + opacity for GSAP — no width/height/top/left
- Semantic HTML, aria-label on each section, correct heading hierarchy
- Hover + focus-visible on all interactive elements
- Touch targets >= 44px
- Do NOT modify docs/ — only read them
- Do NOT create composables — Polisher handles that
```

After builder completes: review sections → show screenshots to user → wait for approval.

### Phase 4: Polish — SPAWN POLISHER TEAMMATE

```
Create a teammate called "polisher" with this prompt:

You are a motion engineer + QA auditor.

READ these files:
- docs/tokens.md — easing (cubic-bezier), duration scale
- docs/sections.md — motion technique assigned to each section
- docs/_libraries/motion-categories.md — GSAP code snippets for each technique
- src/components/sections/S-*.vue — all existing section components

PART 1 — MOTION: produce these files:
- src/composables/useMotion.js — coordinated scroll reveals using ScrollTrigger
- src/composables/useLenis.js — Lenis smooth scroll setup + cleanup
- src/composables/useCursor.js — custom cursor logic
- src/components/AppPreloader.vue — entry sequence (defined steps, not just fade)
- Integrate composables into existing S-*.vue sections where needed

PART 2 — QA AUDIT: check and FIX directly:
- a11y: aria-labels, heading hierarchy, alt texts, focus-visible
- Responsive: verify 375px, 768px, 1280px, 1440px
- Performance: no will-change preventive, lazy loading, no infinite loops
- SEO: title + meta description + OG tags on every view
- CSS: only var(--token), no magic numbers
- Motion: prefers-reduced-motion in every animated component
- Router: lazy imports, scrollBehavior defined
- Cleanup: gsap.context().revert() in every component with animation

RULES:
- gsap.context() with .revert() cleanup — ALWAYS
- prefers-reduced-motion — ALWAYS
- Only transform + opacity — never layout properties
- No consecutive sections share motion technique
- Do NOT create new sections or modify text content
- Do NOT change palette or typography
- Fix issues directly — don't just report them
```

After polisher completes: review → show to user → wait for approval.

### Phase 5: Integration (Lead — do not delegate)

1. Update `src/router/index.js` — lazy-loaded routes for all pages
2. Update `src/App.vue` — add AtmosphereCanvas, AppPreloader, transition wrapper
3. Create additional page views if needed
4. Add SEO meta tags to every view
5. All content stays static/hardcoded

### Phase 6: API Wiring (Lead — only if backend ≠ static)

After static build is approved by user:
1. `src/config/api.js` — axios instance
2. `src/services/{resource}.js` per data type
3. `src/stores/{resource}.js` — Pinia with loading/error/data
4. Replace hardcoded values with reactive store data
5. Visual behavior must NOT change

---

## Fallback: Subagents

If Agent Teams fails, the same workflow works with subagents via the Agent tool.
Agent definitions in `.claude/agents/` (designer.md, builder.md, polisher.md) have
frontmatter with scoped tools and model. Use them as regular subagents — same prompts,
same file references, same workflow. The only difference: subagents report back to you
instead of working as independent teammates.
