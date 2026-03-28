---
name: responsive-review
description: Review responsive design implementation across breakpoints for any frontend project. Use when the user asks about mobile layout, tablet view, responsive design, breakpoints, media queries, or viewport issues. Triggers on "responsive", "mobile", "tablet", "breakpoint", "media query", "viewport", "mobile-first", "adaptable", "responsive design", "responsivo", "movil".
---

# Responsive Review — Multi-Breakpoint Audit (Universal)

Check that components and pages respond correctly across all viewports.

## Phase 1: Discover project context

1. **CSS approach**:
   - Tailwind → check `tailwind.config.*` for custom breakpoints, otherwise `sm:640 md:768 lg:1024 xl:1280 2xl:1536`
   - Custom CSS → grep `@media` in stylesheets to catalog breakpoints
   - CSS-in-JS → check theme/breakpoint definitions
2. **Design docs**: Check `docs/` for responsive rules, breakpoint definitions, spacing scales.
3. **Existing patterns**: Read 2-3 components to see how they handle responsiveness.
4. **Container queries**: Check if the project uses `@container` queries.
5. **Mobile approach**: Is it mobile-first (`min-width`) or desktop-first (`max-width`)?

## Phase 2: Establish breakpoint map

Use the project's breakpoints. If none defined, use common defaults:

| Name | Width | Context |
|------|-------|---------|
| Mobile | 0-639px | Phone portrait |
| Tablet | 640-1023px | Tablet / phone landscape |
| Desktop | 1024-1279px | Laptop / small desktop |
| Wide | 1280px+ | Large desktop |

## Phase 3: Audit checklist

### Layout integrity
- [ ] No horizontal overflow at any viewport (check for `overflow-x` issues)
- [ ] Content doesn't break out of containers
- [ ] Grid/flex layouts adapt appropriately per breakpoint
- [ ] Max-width on content containers prevents ultra-wide stretching
- [ ] No fixed-width elements that break on small screens
- [ ] No content hidden unintentionally (check `display: none` at breakpoints)

### Spacing & sizing
- [ ] Padding/margin scales between mobile and desktop (not identical)
- [ ] Font sizes readable at all viewports (min ~14px body on mobile)
- [ ] Line-length appropriate (45-75 characters for body text)
- [ ] Section heights adapt (100vh sections work on mobile? check address bar)

### Navigation
- [ ] Desktop: full navigation visible
- [ ] Mobile: collapsed menu (hamburger, bottom nav, or drawer)
- [ ] Nav links have adequate touch targets on mobile (>= 44x44px)
- [ ] Active state visible at all sizes

### Images & media
- [ ] Images scale proportionally (no stretching/squishing)
- [ ] Hero images maintain visual impact on mobile
- [ ] Grids: multi-column on desktop, appropriate stacking on mobile
- [ ] Video embeds scale (responsive aspect-ratio container)

### Interactive elements
- [ ] Touch targets >= 44x44px on mobile
- [ ] Hover-only interactions have tap alternatives on touch devices
- [ ] Forms usable on mobile (input sizes, keyboard types, no tiny buttons)
- [ ] Scroll interactions work on touch (no hover-only reveals)
- [ ] Dropdown/select elements don't overflow viewport

### Typography
- [ ] Heading sizes scale down on mobile (not massive on small screens)
- [ ] Body text line-height comfortable at all sizes
- [ ] No text truncation that hides critical content
- [ ] Long words/URLs don't overflow (`overflow-wrap: break-word` if needed)

### Performance on mobile
- [ ] Reduced animation complexity on smaller viewports
- [ ] Images appropriately sized per viewport (`srcset`/`sizes`)
- [ ] Heavy components lazy-loaded (below fold)
- [ ] No layout shift from late-loading elements

### Project-specific rules
If design docs define responsive rules, add them here. For example:
- Specific padding values per breakpoint
- Column layout changes
- Component visibility rules
- Mobile-specific component variants

## Anti-pattern detection — auto-severity

### CRITICAL (breaks usability on a device category)

| Pattern to grep | Violation | Affected |
|-----------------|-----------|----------|
| Fixed `width` in px on containers (not `max-width`) | Overflows on mobile | Mobile |
| `100vh` on sections without `-webkit-fill-available` fallback | Address bar overlap on iOS | Mobile |
| `position: fixed` element covering interactive content on mobile | Blocks taps | Mobile |
| No `@media` queries in stylesheets at all | Zero responsive adaptation | All |
| `font-size` in `px` > 20px without responsive reduction | Giant text on mobile | Mobile |
| `display: none` on content sections at mobile without alternative | Hidden content | Mobile |
| `hover:` styles used as only interaction (no tap alternative) | Inaccessible on touch | Mobile/Tablet |

### WARNING (degrades experience at specific breakpoints)

| Pattern to grep | Violation | Affected |
|-----------------|-----------|----------|
| `grid-template-columns` with fixed px values, no responsive override | Grid doesn't adapt | Mobile |
| Touch targets < 44px (button/link with small padding) | Hard to tap | Mobile |
| No `max-width` on text containers | Ultra-wide lines | Wide desktop |
| `background-size: cover` on tall images without object-position | Cropping may hide content | Variable |
| No breakpoint between mobile and desktop (jumping from 1 col to 4) | Missing tablet layout | Tablet |
| Horizontal scroll section without mobile fallback | Broken on touch | Mobile |

### SUGGESTION

| Pattern | Enhancement |
|---------|-------------|
| No `container` queries for component-level responsiveness | Could use @container |
| No `srcset`/`sizes` on images | Missing responsive images |
| No `clamp()` for fluid values | Could be smoother between breakpoints |

## Test methodology

For each component/page, verify at these viewport widths:
1. **375px** — iPhone SE (smallest common mobile)
2. **428px** — iPhone 14 Pro Max (large mobile)
3. **768px** — iPad portrait (tablet)
4. **1024px** — iPad landscape / small laptop
5. **1440px** — Standard desktop
6. **1920px** — Full HD desktop
7. **2560px** — Ultra-wide (if relevant)

### What to check at each width:
- Layout doesn't overflow horizontally
- Text is readable (body >= 14px)
- Touch targets >= 44x44px (mobile/tablet)
- Grid adapts (correct column count)
- Navigation is accessible
- Images don't break or distort
- Section padding adapts

## Pass/fail criteria

| Result | Condition |
|--------|-----------|
| **PASS** | Zero CRITICAL at any breakpoint, fewer than 3 WARNING |
| **CONDITIONAL PASS** | Zero CRITICAL, 3+ WARNING |
| **FAIL** | Any CRITICAL at any breakpoint |

---

## Phase 4: Report

```
[SEVERITY] file:line — Issue at Xpx viewport
  Breakpoint: [mobile/tablet/desktop/wide]
  Expected: responsive behavior
  Found: current implementation
  Fix: specific CSS/code change
```

For each issue, specify WHICH breakpoint(s) are affected.
Group by component/page, then by breakpoint.
