---
name: css-review
description: Review and audit CSS/styles against the current project's design rules, conventions, and the user's aesthetic intent. Use when the user asks to check styles, fix layout issues, review CSS, audit visual consistency, check spacing, or improve design implementation. Triggers on "CSS review", "style audit", "layout check", "spacing", "design review", "visual consistency", "fix styles", "revisar estilos", "auditoria CSS".
---

# CSS Review — Adaptive Style Audit

Audit CSS and visual implementation against the project's own rules and conventions.

## Phase 1: Discover project context

1. **Design docs**: Glob for `docs/ui*`, `docs/brand*`, `docs/design*`, `docs/style*`. Read them — they define the project's specific rules.
2. **CSS approach**: Determine:
   - Tailwind → audit utility usage, custom config, consistency
   - Custom CSS → audit custom properties, naming, specificity
   - CSS Modules → audit module patterns
   - SCSS/LESS → audit variables, mixins, nesting depth
   - CSS-in-JS → audit styled patterns
3. **Design tokens**: Find and catalog:
   - CSS custom properties (`--color-*`, `--spacing-*`, etc.)
   - Tailwind theme extensions
   - SCSS variables
   - JSON/JS token files
4. **Component library**: If using one (Vuetify, PrimeVue, etc.), audit against its conventions.
5. **Existing patterns**: Read 3-5 component styles to establish the baseline.

## Phase 2: Build the audit checklist from discoveries

### Always check (universal)

#### Consistency
- [ ] Colors reference tokens/variables, not hardcoded hex/rgb
- [ ] Spacing uses a consistent scale (not random pixel values)
- [ ] Typography uses a defined scale
- [ ] Border radius is consistent across similar elements
- [ ] Transitions use consistent duration and easing

#### Layout
- [ ] No horizontal overflow at any viewport
- [ ] Grids/flexbox used appropriately for the layout type
- [ ] Max-width on content containers prevents ultra-wide stretching
- [ ] z-index values are managed (not arbitrary large numbers)

#### Responsive
- [ ] Mobile-first approach (or whatever the project convention is)
- [ ] Breakpoints are consistent with project's defined breakpoints
- [ ] Touch targets >= 44x44px on mobile
- [ ] Font sizes readable at all viewports

#### Performance
- [ ] Animations only on `transform` and `opacity`
- [ ] No excessive specificity (keep selectors flat)
- [ ] No `!important` abuse
- [ ] `will-change` not applied preventively

#### Accessibility
- [ ] Sufficient color contrast (4.5:1 normal text, 3:1 large text)
- [ ] Focus indicators visible
- [ ] Information not conveyed by color alone

### Project-specific checks (from docs)

If design docs were found, add their specific rules to the checklist. Examples:
- Max CTAs per section
- Required padding values
- Image aspect ratios
- Card hover behavior
- Typography constraints
- Grid layout rules

### Aesthetic-specific checks (from user)

If the user specified an aesthetic, verify the implementation matches:
- Minimal → verify restraint, whitespace, subtlety
- Brutalist → verify rawness, intentional breaking of conventions
- Corporate → verify alignment, consistency, professionalism
- etc.

## Anti-pattern detection — auto-severity

### CRITICAL (breaks layout or accessibility)

| Pattern to grep | Violation |
|-----------------|-----------|
| `!important` on layout properties (width, height, margin, padding, display) | Specificity override breaking layout |
| `position: fixed` without `z-index` management | Potential overlap/blocking |
| `overflow: hidden` on `<body>` or `<html>` without reason | Breaks scroll behavior |
| `animation` on `width`, `height`, `top`, `left`, `margin`, `padding` | Layout-triggering animation (jank) |
| Hardcoded color hex/rgb NOT in a CSS custom property (in component styles) | Bypassing design tokens |
| `font-size` in `px` below 14px for body text | Readability violation |
| `outline: none` / `outline: 0` without replacement focus style | Focus indicator removed |

### WARNING (inconsistency or deviation)

| Pattern to grep | Violation |
|-----------------|-----------|
| `z-index` values > 100 without documented system | z-index chaos |
| `will-change` applied permanently (not during animation) | Preventive will-change |
| Magic number spacing (not from spacing scale) | Ad-hoc spacing |
| `font-family` declaration not using design token | Font outside type system |
| Nested selectors > 3 levels deep | Excessive specificity |
| `@media` breakpoint values not matching project's defined breakpoints | Inconsistent breakpoints |
| `border-radius` value not from project's radius scale | Inconsistent radii |
| Transition duration or easing not matching project's motion values | Motion inconsistency |

### SUGGESTION

| Pattern | Enhancement |
|---------|-------------|
| Repeated property groups that could be a shared class | Potential abstraction |
| `@media (hover: hover)` not used to qualify hover states | No hover media query |
| Missing `clamp()` for fluid typography | No fluid type scaling |

## Design Brief validation

If a Design Brief exists for the project, verify:
- [ ] All colors used in components match brief's palette (hex comparison)
- [ ] Typography families match brief's specified fonts
- [ ] Spacing values come from brief's spacing scale
- [ ] Border radius matches brief's radius spec
- [ ] Transition easings match brief's brand easing curve
- [ ] Atmospheric elements (grain, glow, grid) are implemented per brief

Deviations from the Design Brief are automatically WARNING severity.

## Pass/fail criteria

| Result | Condition |
|--------|-----------|
| **PASS** | Zero CRITICAL, fewer than 5 WARNING |
| **CONDITIONAL PASS** | Zero CRITICAL, 5+ WARNING |
| **FAIL** | Any CRITICAL finding |

---

## Phase 3: Report

For each issue found:
```
[SEVERITY] file:line — Description
  Rule: which convention or principle is violated
  Found: current implementation
  Fix: suggested change
```

Severity levels:
- `[CRITICAL]` — breaks layout, accessibility, or core design intent
- `[WARNING]` — inconsistency or deviation from established patterns
- `[SUGGESTION]` — improvement opportunity, not a violation
