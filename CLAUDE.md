# Pegasuz V4 — Agent Teams Pipeline

## Stack
Vue 3 (`<script setup>`) + Vite + Vue Router + Pinia
GSAP 3 + ScrollTrigger + Lenis · CSS Custom Properties

## Structure
```
src/
  components/sections/S-{Name}.vue   <- one per section
  components/AtmosphereCanvas.vue    <- WebGL/Canvas ambient layer
  components/AppPreloader.vue        <- entry animation
  composables/useMotion.js, useLenis.js, useCursor.js
  styles/tokens.css                  <- from docs/tokens.md CSS block
  config/api.js                      <- single axios instance (if API)
  services/                          <- all HTTP calls
  stores/                            <- Pinia (loading, error, data)
  views/                             <- lazy-loaded route pages
  router/index.js
docs/
  tokens.md                          <- single source of truth (design)
  sections.md                        <- section plan + copy
  _libraries/                        <- reference patterns (read on demand)
```

## Rules
- Static first: hardcode all content, API wiring is a separate phase
- Only `transform` + `opacity` for animations (never width/height/top/left)
- `prefers-reduced-motion` always respected
- No consecutive sections with same motion technique
- `var(--token)` for everything: colors, fonts, spacing, easing
- Lazy route imports · `scrollBehavior` in router
- Images: `alt` + `width` + `height` + `loading="lazy"`
- No `axios` outside `src/config/api.js` · No HTTP outside `src/services/`
- No `will-change` preventive · No infinite decorative loops

## Workflow (Agent Teams)
```
Lead: discovery -> capture refs -> delegate to teammates -> review -> approve
Designer: refs + brief -> docs/tokens.md + docs/sections.md
Builder: docs/ + _libraries/ -> S-{Name}.vue (one per task, static only)
Polisher: tokens + sections + src/ -> composables + preloader + QA fixes
```

## Libraries (read on demand, not preloaded)
- `docs/_libraries/layouts.md` — layout patterns + implementation notes
- `docs/_libraries/interactions.md` — hover, focus, cursor patterns
- `docs/_libraries/motion-categories.md` — GSAP techniques + code snippets
