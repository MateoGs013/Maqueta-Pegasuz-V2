---
name: a11y-audit
description: Audit any frontend project for accessibility (a11y) issues following WCAG 2.1 AA. Framework-agnostic — works with Vue, React, Svelte, HTML, or any frontend stack. Use when the user asks about accessibility, WCAG compliance, screen reader support, keyboard navigation, ARIA attributes, or semantic HTML. Triggers on "accessibility", "a11y", "WCAG", "screen reader", "keyboard nav", "aria", "semantic", "accesibilidad".
---

# Accessibility Audit — WCAG 2.1 AA (Universal)

Audit any frontend component or page for accessibility. Framework-agnostic.

## Phase 1: Discover project context

1. **Framework**: Check `package.json` → Vue, React, Svelte, etc. Adjust what to grep for.
2. **Existing a11y setup**: Check for:
   - `eslint-plugin-jsx-a11y` or `eslint-plugin-vuejs-accessibility` → existing linting
   - `@axe-core/*` → automated testing
   - Skip-to-content links in layout
   - `aria-*` usage patterns
3. **Language**: Check `<html lang="?">` in index.html or layout.
4. **Motion handling**: Check if `prefers-reduced-motion` is respected.

## Phase 2: Audit checklist (WCAG 2.1 AA)

### Semantic structure
- [ ] Proper heading hierarchy (h1 > h2 > h3, no skipping)
- [ ] Only ONE `<h1>` per page
- [ ] Landmark elements used (`<nav>`, `<main>`, `<article>`, `<section>`, `<aside>`, `<footer>`)
- [ ] Lists use `<ul>`/`<ol>` + `<li>`
- [ ] Tables use `<table>`, `<thead>`, `<th scope>`
- [ ] `<button>` for actions, `<a>` for navigation (never reversed)

### Images & media
- [ ] All `<img>` have `alt` (meaningful or `alt=""` for decorative)
- [ ] SVG icons: `aria-hidden="true"` or labeled with `<title>`
- [ ] Background images with overlaid text have sufficient contrast
- [ ] Videos have captions/transcripts when applicable

### Interactive elements
- [ ] All interactive elements are keyboard focusable
- [ ] Focus order matches visual order
- [ ] Visible `:focus-visible` indicators
- [ ] Custom controls have ARIA roles and states
- [ ] Click handlers on non-semantic elements → need `role`, `tabindex="0"`, keyboard handler
- [ ] Modals trap focus and restore on close

### Color & contrast
- [ ] Text contrast >= 4.5:1 (normal), >= 3:1 (large text >= 18px bold or 24px)
- [ ] UI component boundaries >= 3:1 contrast
- [ ] Focus indicators >= 3:1 contrast
- [ ] Information NOT conveyed by color alone (use icons, text, patterns too)

### Forms
- [ ] All inputs have `<label>` (explicit `for=` or wrapping)
- [ ] Required fields: `aria-required="true"`
- [ ] Errors linked with `aria-describedby`
- [ ] Error announcements reach screen readers (`role="alert"` or live region)
- [ ] Autocomplete on relevant fields (`name`, `email`, `tel`, etc.)

### Navigation
- [ ] Skip-to-content link as first focusable element
- [ ] Current page marked with `aria-current="page"`
- [ ] Mobile menu keyboard accessible
- [ ] Route changes announced (live region or focus management)

### Motion & animation
- [ ] `prefers-reduced-motion` respected (check media query or JS check)
- [ ] No content hidden permanently by animation
- [ ] Auto-playing animations pausable
- [ ] No seizure-inducing flash (> 3 flashes/second)

### Language
- [ ] `<html lang="xx">` set correctly
- [ ] Content in other languages marked with `lang` attribute

## Anti-pattern detection — auto-severity

Grep for these patterns. Each match is an automatic finding at the specified severity:

### CRITICAL (blocks users from content)

| Pattern to grep | Violation | WCAG |
|-----------------|-----------|------|
| `@click` on `<div>` or `<span>` without `role=` and `tabindex` | Non-semantic interactive element | 4.1.2 |
| `<img` without `alt` attribute | Missing alt text | 1.1.1 |
| `outline: none` or `outline: 0` without visible replacement | Invisible focus indicator | 2.4.7 |
| `tabindex="[2-9]"` or `tabindex="[0-9]{2,}"` | Positive tabindex disrupts navigation | 2.4.3 |
| `<input` without associated `<label>` or `aria-label` | Unlabeled form control | 1.3.1 |
| `role="button"` without `onkeydown`/`@keydown` handler | Button without keyboard support | 2.1.1 |
| `autofocus` on non-primary elements | Disrupts navigation flow | 2.4.3 |

### WARNING (degrades assistive technology experience)

| Pattern to grep | Violation | WCAG |
|-----------------|-----------|------|
| `aria-hidden="true"` on focusable element | Hidden but still tabbable | 4.1.2 |
| `<a` with empty `href="#"` and `@click` | Link used as button | 4.1.2 |
| `display: none` toggled without focus management | Content disappears without announcement | 4.1.3 |
| No `prefers-reduced-motion` check near `gsap` or `animation` | Motion not respectable | 2.3.3 |
| `<svg` without `aria-hidden` or `<title>` | Unlabeled vector graphic | 1.1.1 |
| Heading levels skipped (`h1` then `h3`, no `h2`) | Broken heading hierarchy | 1.3.1 |

### SUGGESTION (enhancement beyond AA)

| Pattern to grep | Enhancement |
|-----------------|-------------|
| No `aria-current="page"` in navigation | Missing current page indicator |
| No skip-to-content link in layout | Missing landmark shortcut |
| No `aria-live` region for dynamic content | Screen readers miss updates |
| No `role="alert"` on error messages | Errors not announced |

## Severity decision rules

| Condition | Severity |
|-----------|----------|
| User CANNOT access content or functionality | CRITICAL |
| User CAN access but experience is degraded | WARNING |
| Content accessible, could be improved | SUGGESTION |
| Only affects screen reader users AND blocks them | CRITICAL |
| Only affects keyboard users AND blocks them | CRITICAL |
| Contrast ratio below 3:1 on any text | CRITICAL |
| Contrast ratio between 3:1 and 4.5:1 on normal text | WARNING |

## Pass/fail criteria

| Result | Condition |
|--------|-----------|
| **PASS** | Zero CRITICAL, fewer than 5 WARNING |
| **CONDITIONAL PASS** | Zero CRITICAL, 5+ WARNING |
| **FAIL** | Any CRITICAL finding |

**A FAIL blocks further pipeline progress.** Fix all CRITICAL findings before proceeding.

---

## Phase 3: How to audit

### For Vue projects
Grep for:
- `@click` on `<div>`/`<span>` without `role`/`tabindex`
- `<img` without `alt`
- `<input` without associated label
- `<h[1-6]` to check hierarchy
- `aria-` usage patterns

### For React projects
Grep for:
- `onClick` on `<div>`/`<span>` without `role`/`tabIndex`
- `<img` without `alt`
- `htmlFor` on labels
- Role/aria usage

### For any project
Grep for:
- `tabindex` values (flag anything > 0)
- `:focus` styles (ensure they exist)
- `outline: none` or `outline: 0` without replacement
- Color hex values to check contrast

## Phase 4: Report

```
[CRITICAL] file:line — Description (WCAG X.X.X)
  Issue: what's wrong
  Impact: who is affected (screen reader, keyboard, low vision, etc.)
  Fix: specific code change

[WARNING] file:line — Description (WCAG X.X.X)
  Issue: what's wrong
  Fix: how to resolve

[SUGGESTION] file:line — Enhancement beyond minimum compliance
  Improvement: what could be better
```

Severities:
- `[CRITICAL]` — blocks users from accessing content or functionality
- `[WARNING]` — degrades experience for assistive technology users
- `[SUGGESTION]` — enhancement beyond minimum AA compliance
