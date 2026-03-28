# Design System Base — {{Project Name}}

> This template provides a micro design system foundation. `creative-design` customizes it per project. NOT a generic UI kit — each project starts here and diverges into its own identity.

---

## 1. Color System

### Base palette (customize per project)

```css
/* Primary — brand color */
--color-primary-50:  #{{lightest}};
--color-primary-100: #{{...}};
--color-primary-200: #{{...}};
--color-primary-300: #{{...}};
--color-primary-400: #{{...}};
--color-primary-500: #{{base}};     /* Main brand color */
--color-primary-600: #{{...}};
--color-primary-700: #{{...}};
--color-primary-800: #{{...}};
--color-primary-900: #{{darkest}};

/* Accent — secondary highlight */
--color-accent-50 through --color-accent-900: same scale pattern

/* Neutral — grays */
--color-neutral-50:  #fafafa;
--color-neutral-100: #f5f5f5;
--color-neutral-200: #e5e5e5;
--color-neutral-300: #d4d4d4;
--color-neutral-400: #a3a3a3;
--color-neutral-500: #737373;
--color-neutral-600: #525252;
--color-neutral-700: #404040;
--color-neutral-800: #262626;
--color-neutral-900: #171717;
--color-neutral-950: #0a0a0a;

/* Semantic (map to scale tokens) */
--color-bg-primary:    var(--color-neutral-950);   /* or 50 for light */
--color-bg-secondary:  var(--color-neutral-900);
--color-bg-tertiary:   var(--color-neutral-800);
--color-text-primary:  var(--color-neutral-50);
--color-text-secondary: var(--color-neutral-400);
--color-text-muted:    var(--color-neutral-600);
--color-border:        var(--color-neutral-800);
--color-border-subtle: var(--color-neutral-900);

/* Status */
--color-success: #22c55e;
--color-warning: #f59e0b;
--color-error:   #ef4444;
--color-info:    #3b82f6;
```

### Dark mode mapping

```css
/* Light mode overrides — swap semantic tokens */
@media (prefers-color-scheme: light) {
  :root {
    --color-bg-primary:    var(--color-neutral-50);
    --color-bg-secondary:  var(--color-neutral-100);
    --color-text-primary:  var(--color-neutral-900);
    --color-text-secondary: var(--color-neutral-600);
    --color-border:        var(--color-neutral-200);
  }
}
```

### Generating a scale from a base color

Use HSL manipulation: keep hue constant, vary saturation (-5% per step darker) and lightness (95% → 10% across 10 steps). Tools: oklch() for perceptual uniformity.

---

## 2. Typography System

### Scale (fluid clamp)

```css
--text-xs:    clamp(0.75rem, 0.7rem + 0.2vw, 0.8rem);
--text-sm:    clamp(0.8rem, 0.75rem + 0.25vw, 0.875rem);
--text-base:  clamp(0.9rem, 0.85rem + 0.3vw, 1rem);
--text-lg:    clamp(1.1rem, 1rem + 0.4vw, 1.25rem);
--text-xl:    clamp(1.25rem, 1.1rem + 0.6vw, 1.5rem);
--text-2xl:   clamp(1.5rem, 1.2rem + 1vw, 2rem);
--text-3xl:   clamp(1.8rem, 1.4rem + 1.5vw, 2.5rem);
--text-4xl:   clamp(2.2rem, 1.6rem + 2vw, 3.5rem);
--text-hero:  clamp(2.8rem, 2rem + 3vw, 5rem);
```

### Tracking & leading

```css
--tracking-tight:  -0.02em;
--tracking-normal:  0;
--tracking-wide:    0.05em;
--tracking-display: -0.03em;  /* for hero/display sizes */

--leading-tight:    1.1;
--leading-normal:   1.5;
--leading-relaxed:  1.7;
```

### Font weights

```css
--font-weight-normal:   400;
--font-weight-medium:   500;
--font-weight-semibold: 600;
--font-weight-bold:     700;
```

---

## 3. Spacing System

### Base: 8px

```css
--space-0:   0;
--space-1:   0.25rem;  /* 4px */
--space-2:   0.5rem;   /* 8px */
--space-3:   0.75rem;  /* 12px */
--space-4:   1rem;     /* 16px */
--space-5:   1.25rem;  /* 20px */
--space-6:   1.5rem;   /* 24px */
--space-8:   2rem;     /* 32px */
--space-10:  2.5rem;   /* 40px */
--space-12:  3rem;     /* 48px */
--space-16:  4rem;     /* 64px */
--space-20:  5rem;     /* 80px */
--space-24:  6rem;     /* 96px */
--space-32:  8rem;     /* 128px */

/* Section spacing (responsive) */
--section-gap: clamp(4rem, 8vw, 8rem);
--section-padding-x: clamp(1rem, 5vw, 6rem);
```

---

## 4. Layout Patterns

### Container variants

```css
--container-narrow:  640px;
--container-default: 1024px;
--container-wide:    1280px;
--container-full:    100%;
```

### Grid

```css
/* Flexible grid — not rigid 12-column */
.grid-auto { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr)); gap: var(--space-6); }
.grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-6); }
.grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-6); }
.grid-asymmetric { display: grid; grid-template-columns: 2fr 1fr; gap: var(--space-8); }
```

### Section wrapper

```css
.section {
  padding-block: var(--section-gap);
  padding-inline: var(--section-padding-x);
}
.section__inner {
  max-width: var(--container-default);
  margin-inline: auto;
}
```

---

## 5. Component Patterns

### Button

| Variant | Background | Text | Border | Hover |
|---------|-----------|------|--------|-------|
| Primary | `--color-accent-primary` | `--color-bg-primary` | none | lighten 10% + scale(1.02) |
| Secondary | transparent | `--color-text-primary` | `--color-border` | bg `--color-bg-secondary` |
| Ghost | transparent | `--color-text-secondary` | none | text `--color-text-primary` |
| Destructive | `--color-error` | white | none | darken 10% |

States: `:hover`, `:focus-visible` (ring), `:active` (scale 0.98), `:disabled` (opacity 0.5)

### Card

| Variant | Background | Border | Shadow | Hover |
|---------|-----------|--------|--------|-------|
| Default | `--color-bg-secondary` | `--color-border-subtle` | none | border lighten |
| Elevated | `--color-bg-secondary` | none | `--shadow-md` | shadow-lg + translateY(-2px) |
| Outlined | transparent | `--color-border` | none | bg `--color-bg-secondary` |

### Input

```
States: default → focus → error → disabled
Focus: ring with --color-accent-primary at 30% opacity
Error: border --color-error, helper text below
```

### Badge/Tag

```
Sizes: sm (--text-xs, --space-1 --space-2), md (--text-sm, --space-1 --space-3)
Variants: filled (bg accent, text contrast), outlined (border accent, text accent), subtle (bg accent/10%)
```

---

## 6. Animation Tokens

### Easings (CSS + GSAP equivalents)

```css
--ease-out:       cubic-bezier(0.16, 1, 0.3, 1);          /* GSAP: power3.out */
--ease-in-out:    cubic-bezier(0.65, 0, 0.35, 1);         /* GSAP: power2.inOut */
--ease-out-back:  cubic-bezier(0.34, 1.56, 0.64, 1);      /* GSAP: back.out(1.7) */
--ease-out-expo:  cubic-bezier(0.16, 1, 0.3, 1);          /* GSAP: expo.out */
--ease-spring:    cubic-bezier(0.175, 0.885, 0.32, 1.275); /* bouncy */
```

### Durations

```css
--duration-instant:  100ms;
--duration-fast:     200ms;
--duration-normal:   400ms;
--duration-slow:     700ms;
--duration-slower:   1000ms;
--duration-entrance: 800ms;   /* page/section entrances */
```

### Stagger scale

```css
--stagger-tight:   0.03s;  /* fast sequence */
--stagger-normal:  0.08s;  /* comfortable */
--stagger-relaxed: 0.15s;  /* dramatic reveal */
```

---

## 7. Shadows & Effects

```css
--shadow-sm:  0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md:  0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg:  0 10px 15px -3px rgba(0, 0, 0, 0.15);
--shadow-xl:  0 20px 25px -5px rgba(0, 0, 0, 0.2);
--shadow-glow: 0 0 30px rgba(var(--color-accent-rgb), 0.3);

--radius-sm:   4px;
--radius-md:   8px;
--radius-lg:   12px;
--radius-xl:   16px;
--radius-full: 9999px;
```

---

## 8. Z-Index Scale

```css
--z-base:     0;
--z-dropdown: 10;
--z-sticky:   20;
--z-overlay:  30;
--z-modal:    40;
--z-toast:    50;
--z-cursor:   100;
```

---

## How to use this template

1. `creative-design` reads this template as a STARTING POINT
2. Customizes colors, fonts, and atmospheric tokens per the project's brief
3. Outputs the final design-brief.md with concrete values (not templates)
4. `page-scaffold` and `vue-component` consume the final values

This template ensures no token is forgotten. The creative skill decides the VALUES.
