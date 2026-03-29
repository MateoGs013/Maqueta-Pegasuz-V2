# {Project Name} — Design Brief

## Concept

<!-- 2-3 sentences describing how the site FEELS. This is the north star every downstream decision is tested against. -->
<!-- BAD: "A modern, minimal design for a tech company" -->
<!-- GOOD: "The site moves like a confident architect — unhurried, deliberate, with sudden moments of spatial drama. Dark stone surfaces interrupted by a single warm amber. Typography that commands space without shouting." -->

## Palette

| Token | Hex | RGB | Contrast on canvas | Usage |
|-------|-----|-----|---------------------|-------|
| `--canvas` | `#______` | | — | Page background |
| `--surface` | `#______` | | ≥ 3:1 vs canvas | Cards, elevated elements |
| `--text` | `#______` | | ≥ 7:1 vs canvas | Primary text (AAA) |
| `--text-muted` | `#______` | | ≥ 4.5:1 vs canvas | Secondary text (AA) |
| `--accent-primary` | `#______` | | ≥ 4.5:1 vs canvas | CTAs, key highlights |
| `--accent-secondary` | `#______` | | | Supporting accents, decorative |
| `--border` | `#______` | | | Dividers, card borders |

<!-- REQUIRED: Every color needs a reason. "Accent-primary is amber #E8A04A — from the warmth of aged paper against architecture blueprints." -->
<!-- REQUIRED: Calculate contrast ratios. Use https://webaim.org/resources/contrastchecker/ -->
<!-- No generic dark+orange or white+blue combos. The palette should be immediately recognizable as belonging to this brand. -->

## Typography

| Role | Family | Google Fonts URL | Weights | Usage |
|------|--------|-----------------|---------|-------|
| Display | {e.g., Clash Display} | fonts.googleapis.com/css2?family=... | 400, 700 | Hero headlines, section titles |
| Body | {e.g., Satoshi} | fonts.googleapis.com/css2?family=... | 400, 500 | Paragraphs, labels, UI text |
| Accent | {optional} | | | Pull quotes, stats, special callouts |

**Size scale (adjust values to match the personality — bold brands use larger display sizes):**

| Token | Value | Usage |
|-------|-------|-------|
| `--text-xs` | 12px | Labels, captions |
| `--text-sm` | 14px | Small UI text |
| `--text-base` | 16px | Body text |
| `--text-lg` | 20px | Lead paragraphs |
| `--text-xl` | 24px | Small headings |
| `--text-2xl` | 32px | Section headings |
| `--text-3xl` | 48px | Page headings |
| `--text-4xl` | 64px | Large display |
| `--text-5xl` | 80px | Hero display |
| `--text-6xl` | 112px | Oversized / dramatic |

**Letter spacing:** `--tracking-tight: -0.02em` · `--tracking-normal: 0` · `--tracking-wide: 0.08em`
**Line height:** `--leading-tight: 1.1` (display) · `--leading-body: 1.65` (paragraphs)

## Spacing

**Base unit:** 8px
**Scale:**

| Token | Value |
|-------|-------|
| `--space-1` | 8px |
| `--space-2` | 16px |
| `--space-3` | 24px |
| `--space-4` | 32px |
| `--space-6` | 48px |
| `--space-8` | 64px |
| `--space-12` | 96px |
| `--space-16` | 128px |
| `--space-24` | 192px |

**Border radii:** `--radius-sm: 4px` · `--radius-md: 8px` · `--radius-lg: 16px` · `--radius-xl: 24px` · `--radius-full: 9999px`

## Easing

**Brand easing:** `cubic-bezier(_, _, _, _)` — "{character description}"

<!-- REQUIRED: Define the exact cubic-bezier. Name its feel. -->
<!-- Examples: -->
<!--   cubic-bezier(0.16, 1, 0.3, 1) — "confident snap with soft landing" (expo out) -->
<!--   cubic-bezier(0.22, 1, 0.36, 1) — "silk unfurl — fast start, lingers at rest" -->
<!--   cubic-bezier(0.4, 0, 0.2, 1) — "clean material snap" -->
<!-- This easing applies to ALL animations unless overridden. It's the brand's heartbeat. -->

```css
--ease: cubic-bezier(_, _, _, _);
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: var(--ease);
```

## Atmosphere

**Preset:** {Particle Field | Gradient Mesh | Noise Terrain | Grid Distortion | Aurora Flow}

**Configuration:**
- Particle/mesh density: {low | medium | high} ({e.g., 800 particles})
- Primary color: {hex} (usually `--canvas` or slightly lighter)
- Accent color: {hex} (usually `--accent-primary` at low opacity)
- Speed: {slow | medium | fast} (e.g., 0.3)

**Mouse response:** {e.g., "Particles repel from cursor within 80px radius, return with spring easing"}
**Scroll response:** {e.g., "Mesh distortion increases with scroll velocity, smoothes on stop"}
**Mobile fallback:** {e.g., "Static radial gradient: radial-gradient(ellipse at 30% 40%, #1a1a2e 0%, #0d0d0d 70%)"}

<!-- The atmosphere is the ambient breath of the site. It should be SUBTLE — never distracting. -->
<!-- It reinforces the concept without stealing attention from content. -->

## Section Map

| # | Section | Layout pattern | Motion category | Interaction | Energy | Responsive |
|---|---------|---------------|----------------|-------------|--------|------------|
| 1 | S-Hero | | | | HIGH | |
| 2 | S-Intro | | | | LOW | |
| 3 | | | | | | |

<!-- RULES: -->
<!-- - No consecutive sections share the same motion category -->
<!-- - Energy alternates: HIGH → LOW → MEDIUM → HIGH... -->
<!-- - Layout from docs/_libraries/layouts.md (use exact pattern names) -->
<!-- - Motion from docs/_libraries/motion-categories.md (use exact category names) -->
<!-- - Interaction from docs/_libraries/interactions.md (use exact pattern names) -->
