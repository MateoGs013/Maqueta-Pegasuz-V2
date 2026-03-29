# Maqueta V3 — Console Orchestrator

## RULES (read before writing ANY code)

1. NO code without `docs/design-tokens.md` and `docs/design-concept.md` — run `/project` first
2. NO section without its recipe card in `docs/page-plans.md`
3. NO consecutive sections with same motion technique
4. NO generic palettes — every project gets a unique visual identity
5. NO animating width/height/top/left — only transform + opacity
6. `prefers-reduced-motion` always respected
7. Every section passes 7 layers: composition, typo, depth, interaction, motion, atmosphere, responsive
8. GATE between every step — QA console must PASS before advancing

## ARCHITECTURE: CEO + 6 Consoles

`/project` is the CEO. It creates tasks, dispatches to consoles, manages context.
Each console receives ONLY the context it needs — CEO extracts and passes inline.
Reference URLs are captured as screenshots and analyzed before design begins.
Max 2 consoles active. See `.claude/pipeline.md` for context contracts.

## PIPELINE

| Step | Console | Output | Gate |
|------|---------|--------|------|
| 0 | CEO | Task breakdown | Brief clear |
| 0.5 | Reference Analyst | `reference-analysis.md` | All refs captured + analyzed |
| 1 | Creative Director | 6 foundation docs | 12-point validation |
| 2 | Atmosphere | `AtmosphereCanvas.vue` | Mouse + scroll + mobile |
| 3 | Constructor (x N) | `S-{Name}.vue` per section | 7-layer check + user review each |
| 4 | Choreographer | Motion composables + preloader | No repeats, reduced-motion |
| 5A | CEO | Static integration + final audit | a11y + seo + responsive + css + perf |
| 5B | CEO | API wiring (if backend ≠ none) | Stores + services connected |
| 6 | CEO | Cleanup `_ref-captures/` | Done |

## CONSOLES (context contracts)

| Console | Gets (extracted by CEO) | Does NOT get |
|---------|------------------------|--------------|
| Reference Analyst | Screenshot paths, manifest, libraries | Brief, mood, constraints |
| Creative Director | Brief + ref analysis findings + templates | Raw screenshots |
| Atmosphere | Palette hex + atmosphere concept only | Typography, content, pages |
| Constructor | 1 recipe card + 1 section's copy + tokens | Other sections, full docs |
| Choreographer | Motion spec + section file list | Content, palette, layouts |
| QA | Step outputs + relevant criteria | Unrelated docs |

## ANTI-PATTERNS

- `axios` outside `src/config/api.js` · HTTP outside `src/services/`
- Static route imports (always lazy) · Pages without meta tags
- Images without `alt`, `width`, `height`, `loading="lazy"`
- `will-change` preventive · Infinite decorative loops
- Same reveal on consecutive sections · Hardcoded content · Hash routing

## STACK

Vue 3 (`<script setup>`) + Vite + Vue Router + Pinia
GSAP 3 + ScrollTrigger + Lenis · CSS Custom Properties

## STRUCTURE

```
project/
  docs/                    <- BEFORE code (6 foundation docs)
  scripts/capture-refs.mjs <- Reference screenshot tool
  _ref-captures/           <- Temp screenshots (deleted after build)
  src/
    config/api.js          <- Single axios instance
    services/              <- All HTTP calls
    stores/                <- Pinia (loading, error, data)
    views/                 <- Route pages
    components/
      sections/            <- S-{Name}.vue
      AtmosphereCanvas.vue
      ui/
    composables/           <- useMotion, useLenis, useCursor
    router/index.js        <- Lazy routes, scrollBehavior
    styles/tokens.css      <- Design tokens from brief
    App.vue + main.js
```

## DOCS LOOKUP

| Need | File |
|------|------|
| How it should feel, visual principles | `docs/design-concept.md` |
| Hex values, font names, px sizes, easing | `docs/design-tokens.md` |
| Why a value was chosen, which ref frame | `docs/design-decisions.md` |
| Copy, CTAs, SEO meta | `docs/content-brief.md` |
| Sections, recipe cards, layouts | `docs/page-plans.md` |
| Animation, easing, choreography | `docs/motion-spec.md` |
| Reference findings | `docs/reference-analysis.md` |
| Layout patterns | `docs/_libraries/layouts.md` |
| Interaction patterns | `docs/_libraries/interactions.md` |
| Motion techniques | `docs/_libraries/motion-categories.md` |
