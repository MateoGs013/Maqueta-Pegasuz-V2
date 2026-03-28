---
name: perf-check
description: Audit any frontend project for performance issues. Framework-agnostic — covers Vue, React, Svelte, vanilla, and any build tool. Use when the user asks about performance, loading speed, bundle size, rendering, lazy loading, optimization, Core Web Vitals, or Lighthouse scores. Triggers on "performance", "speed", "optimize", "slow", "bundle", "lazy load", "render", "web vitals", "lighthouse", "rendimiento", "optimizar", "lento".
---

# Performance Audit — Frontend (Universal)

Check any frontend project for performance issues affecting Core Web Vitals and user experience.

## Phase 1: Discover project context

1. **Framework**: `package.json` → Vue, React, Next, Nuxt, Svelte, Astro, vanilla
2. **Build tool**: Vite, Webpack, Turbopack, esbuild, Parcel
3. **Build config**: Read `vite.config.*`, `webpack.config.*`, `next.config.*` for:
   - Code splitting configuration
   - Chunk strategy
   - Tree shaking
   - Minification
4. **Dependencies**: Check `package.json` for heavy libraries (moment.js, lodash full, etc.)
5. **Image handling**: Check for `next/image`, `vite-imagetools`, manual optimization, or none
6. **Rendering mode**: Check if it's SPA, pre-rendered, or hybrid.

## Phase 2: Audit checklist

### Component rendering (framework-specific)

**Vue:**
- [ ] `v-for` always has `:key` with unique stable ID (not index)
- [ ] Expensive computations in `computed`, not template
- [ ] `shallowRef` for large non-deep-reactive objects
- [ ] `defineAsyncComponent` for heavy below-fold components

**React:**
- [ ] `key` prop on list items (stable, not index)
- [ ] `useMemo`/`useCallback` where appropriate
- [ ] `React.lazy` + `Suspense` for code splitting
- [ ] No unnecessary re-renders (check dependency arrays)

**Both/Any:**
- [ ] Conditional render: show/hide toggle vs mount/unmount — appropriate choice
- [ ] Large lists use virtual scrolling or pagination
- [ ] No state updates in render/template expressions

### Images & media
- [ ] Explicit `width` and `height` on images (prevents CLS)
- [ ] Below-fold images: `loading="lazy"`
- [ ] Hero/above-fold images: `loading="eager"` + `fetchpriority="high"`
- [ ] Modern formats (WebP/AVIF) when possible
- [ ] Responsive `srcset` and `sizes` for different viewports
- [ ] No oversized images (match displayed size)
- [ ] SVG for icons/illustrations (not PNG)

### Bundle & code splitting
- [ ] Pages/routes are lazy-loaded (dynamic `import()`)
- [ ] Heavy libraries in separate vendor chunks
- [ ] No unused imports or dead code
- [ ] Tree-shaking friendly imports: `import { x } from 'lib'` not `import lib from 'lib'`
- [ ] No duplicate dependencies (check `npm ls` or `pnpm why`)
- [ ] Bundle analyzer run recently? Flag if bundle seems large.

### CSS performance
- [ ] Only animate `transform` and `opacity`
- [ ] No layout-triggering animations (`width`, `height`, `top`, `left`)
- [ ] `will-change` only on actively animated elements
- [ ] No massive unused CSS
- [ ] Critical CSS considered (above-fold styles load fast)

### Fonts & assets
- [ ] Fonts: `<link rel="preload">` or `font-display: swap`
- [ ] Preconnect to critical third-party origins
- [ ] Fallback/skeleton content during loading

### JavaScript performance
- [ ] No blocking `<script>` tags (use `defer` or `async`)
- [ ] No memory leaks (event listeners, timers, observers cleaned up)
- [ ] No large synchronous operations on main thread
- [ ] `requestAnimationFrame` for visual updates
- [ ] Web Workers for heavy computation (if applicable)

### Animation performance (if applicable)
- [ ] Animation library contexts cleaned up on unmount
- [ ] `clearProps` or style reset after animation
- [ ] Mobile: reduced animation complexity
- [ ] Scroll-triggered animations use efficient observation (IntersectionObserver, not scroll event)

### Core Web Vitals targets
| Metric | Good | Needs improvement | Poor |
|--------|------|-------------------|------|
| **LCP** | < 2.5s | 2.5-4.0s | > 4.0s |
| **INP** | < 200ms | 200-500ms | > 500ms |
| **CLS** | < 0.1 | 0.1-0.25 | > 0.25 |

## Anti-pattern detection — auto-severity

### CRITICAL (directly impacts Core Web Vitals)

| Pattern to grep | Violation | Metric affected |
|-----------------|-----------|-----------------|
| `<img` without `width` AND `height` | Layout shift on load | CLS |
| `<script` without `defer` or `async` (not module) | Render blocking | LCP |
| `import` of full lodash/moment (`import _ from 'lodash'`) | Massive bundle | LCP |
| `v-for` without `:key` | Inefficient list re-renders | INP |
| `animation` or `transition` on `width`, `height`, `top`, `left` | Layout thrashing | INP |
| `watch` or `useEffect` that triggers state update → re-render loop | Render loop | INP |
| `<img` with `loading="lazy"` above fold (hero/LCP image) | Delayed LCP image | LCP |
| No route-level code splitting (all routes in one bundle) | Full app loaded upfront | LCP |

### WARNING (degrades performance)

| Pattern to grep | Violation | Metric affected |
|-----------------|-----------|-----------------|
| `will-change` on elements not currently animated | Wasted GPU memory | General |
| `document.querySelector` inside animation loop / `useFrame` / `onLoop` | DOM access in hot path | INP |
| `new Event` / `addEventListener` without cleanup in `onBeforeUnmount` | Memory leak | General |
| `setInterval` / `setTimeout` without cleanup | Timer leak | General |
| `<img` without `loading="lazy"` below fold | Unnecessary upfront load | LCP |
| Font loaded without `font-display: swap` or `preload` | Flash of invisible text | LCP |
| Three.js/Canvas without `IntersectionObserver` pause | Renders when offscreen | General |
| `JSON.parse` or heavy computation in template/render | Blocking main thread | INP |

### SUGGESTION

| Pattern | Enhancement |
|---------|-------------|
| No `fetchpriority="high"` on LCP image | Suboptimal load priority |
| No `<link rel="preconnect">` to API origin | Missing early connection |
| No virtual scrolling for lists > 50 items | Could be virtualized |
| Images not in WebP/AVIF format | Larger file sizes |
| No critical CSS extraction | Slower first paint |

## Pass/fail criteria

| Result | Condition |
|--------|-----------|
| **PASS** | Zero CRITICAL, fewer than 3 WARNING |
| **CONDITIONAL PASS** | Zero CRITICAL, 3+ WARNING |
| **FAIL** | Any CRITICAL finding |

Core Web Vitals targets must be achievable based on code analysis:
- LCP: < 2.5s (no render-blocking resources, LCP image prioritized)
- INP: < 200ms (no main thread blocking, no layout-triggering animations)
- CLS: < 0.1 (all images sized, no late-shifting elements)

---

## Phase 3: Report

```
[CRITICAL] file:line — Issue (metric: LCP/INP/CLS)
  Problem: description
  Impact: estimated effect on metric
  Fix: specific solution

[WARNING] file:line — Issue
  Problem: description
  Fix: solution

[SUGGESTION] file:line — Optimization opportunity
  Improvement: what could be better
```
