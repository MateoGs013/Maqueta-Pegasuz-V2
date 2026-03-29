# {Project Name} — Design Tokens

<!-- This document is IMPLEMENTATION-READY. Every value here maps directly to CSS.
     The Creative Director fills this. The Constructor and CEO read from this.
     Structure: Primitive tokens (raw values) → Semantic tokens (roles + descriptions).
     Every semantic token MUST have a description field — without it, implementors guess. -->

## Primitive Tokens

<!-- Raw values. Never referenced in components directly.
     Semantic tokens map to these. This layer enables theming. -->

### Color Primitives

```css
/* --- Raw palette values (do not use in components) --- */
--color-{name}-100: #_____;  /* lightest */
--color-{name}-300: #_____;
--color-{name}-500: #_____;  /* base */
--color-{name}-700: #_____;
--color-{name}-900: #_____;  /* darkest */

/* Repeat for each color family in the palette */
```

### Type Primitives

```css
/* --- Raw size values --- */
--size-12: 12px;
--size-14: 14px;
--size-16: 16px;
--size-20: 20px;
--size-24: 24px;
--size-32: 32px;
--size-40: 40px;
--size-48: 48px;
--size-64: 64px;
--size-80: 80px;
--size-96: 96px;
--size-112: 112px;
```

### Spacing Primitives

```css
/* Base unit: {4|8}px */
--space-1: {N}px;
--space-2: {N*2}px;
--space-3: {N*3}px;
--space-4: {N*4}px;
--space-6: {N*6}px;
--space-8: {N*8}px;
--space-12: {N*12}px;
--space-16: {N*16}px;
--space-24: {N*24}px;
```

---

## Semantic Tokens

<!-- Tokens that go in components. Purposeful names + descriptions.
     Format per token: value → which primitive, description, use case, constraints. -->

### Color — Surface

| Token | Value | Maps to | Description |
|-------|-------|---------|-------------|
| `--canvas` | `#______` | `--color-{name}-{N}` | Page background. Used everywhere as base layer. Never use on text. |
| `--surface` | `#______` | `--color-{name}-{N}` | Cards, modals, elevated elements. Subtle lift from canvas. Contrast vs canvas: {ratio}:1 |
| `--surface-raised` | `#______` | | Higher elevation than surface. For tooltips, dropdowns. |
| `--border` | `#______` | | Dividers, card borders, input outlines. Subtle — don't compete with content. |
| `--overlay` | `rgba(_, _, _, _)` | | Scrim over content. Used in modals, lightboxes. |

### Color — Text

| Token | Value | Contrast on canvas | Contrast on surface | Description |
|-------|-------|-------------------|---------------------|-------------|
| `--text` | `#______` | {ratio}:1 ✓ | {ratio}:1 ✓ | Primary text. Body copy, headings. Use for all readable text. |
| `--text-muted` | `#______` | {ratio}:1 ✓ | {ratio}:1 ✓ | Secondary text. Captions, metadata, supporting labels. |
| `--text-disabled` | `#______` | {ratio}:1 | | Disabled state text. Use only when element is non-interactive. |

### Color — Interactive

| Token | Value | Contrast on canvas | Description |
|-------|-------|-------------------|-------------|
| `--accent-primary` | `#______` | {ratio}:1 ✓ | CTAs, primary buttons, links, focus rings, key highlights. This is the brand's main action color. |
| `--accent-primary-hover` | `#______` | | Hover state of accent-primary. Slightly lighter or more saturated. |
| `--accent-secondary` | `#______` | | Supporting accents. Tags, badges, decorative highlights. Do not use for interactive elements. |

### Color — Feedback

| Token | Value | Description |
|-------|-------|-------------|
| `--color-success` | `#______` | Form success, confirmation states |
| `--color-error` | `#______` | Validation errors, destructive actions |
| `--color-warning` | `#______` | Non-blocking alerts |

---

### Typography

| Token | Value | Description |
|-------|-------|-------------|
| `--font-display` | `'{Family Name}', sans-serif` | Display headings — hero titles, section headlines. Google Fonts: `{import URL}` |
| `--font-body` | `'{Family Name}', sans-serif` | Body text, UI labels, paragraphs. Google Fonts: `{import URL}` |
| `--font-accent` | `'{Family Name}', monospace` | Special callouts, stats, code snippets (optional) |

**Weights:**
| Token | Value | Usage |
|-------|-------|-------|
| `--weight-regular` | 400 | Body text, descriptions |
| `--weight-medium` | 500 | UI labels, nav items |
| `--weight-semibold` | 600 | Subheadings, card titles |
| `--weight-bold` | 700 | Section headings |
| `--weight-black` | 900 | Hero display (use sparingly) |

**Type scale:**
| Token | Value | `clamp()` expression | Usage |
|-------|-------|---------------------|-------|
| `--text-xs` | 12px | — | Captions, badges, legal |
| `--text-sm` | 14px | — | Small labels, metadata |
| `--text-base` | 16px | — | Body copy baseline |
| `--text-lg` | 20px | `clamp(18px, 1.5vw, 20px)` | Lead paragraphs |
| `--text-xl` | 24px | `clamp(20px, 2vw, 24px)` | Small headings (H4-H5) |
| `--text-2xl` | 32px | `clamp(24px, 2.5vw, 32px)` | Section subheadings (H3) |
| `--text-3xl` | 48px | `clamp(32px, 3.5vw, 48px)` | Section headings (H2) |
| `--text-4xl` | 64px | `clamp(40px, 5vw, 64px)` | Page titles (H1) |
| `--text-5xl` | 80px | `clamp(48px, 6vw, 80px)` | Large hero text |
| `--text-6xl` | 112px | `clamp(56px, 8vw, 112px)` | Oversized display |

**Spacing & rhythm:**
| Token | Value | Description |
|-------|-------|-------------|
| `--tracking-tight` | -0.03em | Display headings. Tight at large sizes. |
| `--tracking-normal` | 0em | Body text default. |
| `--tracking-wide` | 0.1em | Uppercase labels, navigation items, tags. |
| `--leading-tight` | 1.1 | Display headings. Keep lines close. |
| `--leading-snug` | 1.3 | Subheadings. Some breathing room. |
| `--leading-body` | 1.65 | Body paragraphs. Comfortable reading. |

---

### Spacing

```css
/* Semantic spacing tokens (use these in components, not primitives) */
--space-section: var(--space-16);   /* Between page sections: 128px */
--space-component: var(--space-8);  /* Between component blocks: 64px */
--space-element: var(--space-4);    /* Between elements within components: 32px */
--space-tight: var(--space-2);      /* Tight pairs: label + value, icon + text: 16px */
--space-page-x: var(--space-6);     /* Horizontal page padding: 48px (mobile: --space-3) */
```

---

### Shape

| Token | Value | Description |
|-------|-------|-------------|
| `--radius-sm` | {N}px | Small elements: badges, tags, chips |
| `--radius-md` | {N}px | Cards, inputs, buttons |
| `--radius-lg` | {N}px | Modals, panels, large containers |
| `--radius-xl` | {N}px | Hero imagery, featured cards |
| `--radius-full` | 9999px | Pills, avatars, circular elements |

---

### Motion Tokens

| Token | Value | Description |
|-------|-------|-------------|
| `--ease` | `cubic-bezier(_, _, _, _)` | Brand easing. {Character description}. Applied to all animations unless overridden. |
| `--ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | Exit animations. Elements leaving the screen. |
| `--ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Playful overshoot. Use for micro-interactions. |
| `--duration-fast` | {N}ms | Hover states, micro-interactions. Instant feedback. |
| `--duration-medium` | {N}ms | Reveals, state transitions. Felt but not slow. |
| `--duration-slow` | {N}ms | Hero entrances, dramatic reveals. Cinematic. |
| `--duration-crawl` | {N}ms | Preloader, atmospheric elements. Intentionally slow. |

---

### Atmosphere

| Token | Value | Description |
|-------|-------|-------------|
| `--atmosphere-preset` | `{Particle Field\|Gradient Mesh\|Noise Terrain\|Grid Distortion\|Aurora Flow}` | WebGL canvas preset |
| `--atmosphere-color-primary` | `#______` | Primary canvas color (usually --canvas or near) |
| `--atmosphere-color-accent` | `#______` | Accent glow/particle color (usually --accent-primary at low opacity) |
| `--atmosphere-opacity` | {0.0–1.0} | Overall intensity. Keep subtle: 0.3–0.6 range |
| `--atmosphere-mouse-radius` | {N}px | Radius of mouse interaction effect |
| `--atmosphere-mobile-fallback` | `{CSS gradient value}` | Full CSS value for mobile: `radial-gradient(ellipse at 30% 40%, #______ 0%, #______ 70%)` |

---

## CSS Output Block

<!-- Copy-paste ready block for src/styles/tokens.css -->

```css
/* ============================================================
   {Project Name} — Design Tokens
   Generated from docs/design-tokens.md
   ============================================================ */

/* Google Fonts */
@import url('{font-display import URL}');
@import url('{font-body import URL}');

:root {
  /* Color — Surface */
  --canvas: #______;
  --surface: #______;
  --surface-raised: #______;
  --border: #______;
  --overlay: rgba(_, _, _, _);

  /* Color — Text */
  --text: #______;
  --text-muted: #______;
  --text-disabled: #______;

  /* Color — Interactive */
  --accent-primary: #______;
  --accent-primary-hover: #______;
  --accent-secondary: #______;

  /* Color — Feedback */
  --color-success: #______;
  --color-error: #______;
  --color-warning: #______;

  /* Typography — Families */
  --font-display: '{Family}', sans-serif;
  --font-body: '{Family}', sans-serif;

  /* Typography — Weights */
  --weight-regular: 400;
  --weight-medium: 500;
  --weight-semibold: 600;
  --weight-bold: 700;
  --weight-black: 900;

  /* Typography — Scale */
  --text-xs: 12px;
  --text-sm: 14px;
  --text-base: 16px;
  --text-lg: 20px;
  --text-xl: 24px;
  --text-2xl: 32px;
  --text-3xl: 48px;
  --text-4xl: 64px;
  --text-5xl: 80px;
  --text-6xl: 112px;

  /* Typography — Tracking */
  --tracking-tight: -0.03em;
  --tracking-normal: 0em;
  --tracking-wide: 0.1em;

  /* Typography — Leading */
  --leading-tight: 1.1;
  --leading-snug: 1.3;
  --leading-body: 1.65;

  /* Spacing */
  --space-1: {N}px;
  --space-2: {N*2}px;
  --space-3: {N*3}px;
  --space-4: {N*4}px;
  --space-6: {N*6}px;
  --space-8: {N*8}px;
  --space-12: {N*12}px;
  --space-16: {N*16}px;
  --space-24: {N*24}px;
  --space-section: var(--space-16);
  --space-component: var(--space-8);
  --space-element: var(--space-4);
  --space-tight: var(--space-2);
  --space-page-x: var(--space-6);

  /* Shape */
  --radius-sm: {N}px;
  --radius-md: {N}px;
  --radius-lg: {N}px;
  --radius-xl: {N}px;
  --radius-full: 9999px;

  /* Motion */
  --ease: cubic-bezier(_, _, _, _);
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --duration-fast: {N}ms;
  --duration-medium: {N}ms;
  --duration-slow: {N}ms;
  --duration-crawl: {N}ms;
}
```
