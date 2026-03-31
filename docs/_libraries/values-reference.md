# Values Reference

Quick-lookup tables of specific values for all agents.
Every value is production-ready — copy directly into tokens or code.

---

## Motion Durations by Context

| Context | Duration | Notes |
|---------|----------|-------|
| Tooltip appearance | 100ms | Instant feedback |
| Button press / toggle | 100-150ms | Tactile response |
| Button hover | 200ms | Quick visual feedback |
| Dropdown / menu | 200-250ms | Functional reveal |
| Modal entrance | 250-300ms | Noticeable but swift |
| Small scroll reveal | 300-400ms | Single element entrance |
| Medium scroll reveal | 400-600ms | Standard section reveal |
| Large scroll reveal | 600-800ms | Hero / full-section |
| Page transition | 400-600ms | Context switch |
| Complex sequence (total) | 800-1400ms | Orchestrated timeline |
| Preloader exit | 600-1000ms | Dramatic reveal |

**Hard constraints:**
- < 100ms: Imperceptible — don't bother
- 100-300ms: Feels instant/responsive
- 300-500ms: Noticeable, intentional
- 500-1000ms: Dramatic — use sparingly
- > 1000ms: Only for intentional narrative moments (hero sequences, preloader)

---

## Easing Curves (Cubic-Bezier)

### Standard Set (include in every project)

| Name | Value | GSAP Equivalent | Character |
|------|-------|-----------------|-----------|
| Smooth out | `cubic-bezier(0.16, 1, 0.3, 1)` | `expo.out` | Silk deceleration |
| Smooth in-out | `cubic-bezier(0.65, 0, 0.35, 1)` | `power2.inOut` | Symmetric flow |
| Overshoot | `cubic-bezier(0.34, 1.56, 0.64, 1)` | `back.out(1.7)` | Playful bounce |
| Snap | `cubic-bezier(0.5, 0, 0, 1)` | `power4.out` | Quick start, hard stop |

### GSAP Named Easings (use in code)

| Name | Character | Best For |
|------|-----------|----------|
| `power2.out` | Smooth, natural | General-purpose entrance |
| `power3.out` | Confident deceleration | Headlines, cards |
| `power4.out` | Dramatic stop | Hero elements, emphasis |
| `power3.inOut` | Smooth transition | Clip-path reveals, morphs |
| `expo.out` | Ultra-smooth silk | Large movements, cursors |
| `back.out(1.7)` | Overshoot settle | Buttons, playful elements |
| `elastic.out(1, 0.3)` | Spring bounce | Magnetic release, success |
| `none` | Linear | Scroll-linked (scrub) only |

### Never Use

| Easing | Why |
|--------|-----|
| `ease` | CSS default — template fingerprint |
| `ease-in-out` | CSS default — template fingerprint |
| `ease-in` | Feels sluggish starting |
| `linear` | Only valid for scrub animations |

---

## Stagger Values

| Context | Delay Per Item | GSAP Stagger | Notes |
|---------|---------------|-------------|-------|
| Characters (SplitText) | 20-35ms | `stagger: 0.025` | Fast for short words, slow for long |
| Words (SplitText) | 60-100ms | `stagger: 0.08` | Natural reading pace |
| Lines (SplitText) | 80-120ms | `stagger: 0.1` | Paragraph reveals |
| Grid/list items | 80-120ms | `stagger: { each: 0.1, from: "start" }` | Cascade effect |
| Cards | 100-150ms | `stagger: { each: 0.12, from: "start" }` | Visible sequence |
| Navigation items | 60-100ms | `stagger: 0.08` | Quick sequence |
| Section elements | 150-250ms | Individual delays | Orchestrated entrance |

### Stagger Origins (use variety)

| Origin | Effect | Best For |
|--------|--------|----------|
| `from: "start"` | Left-to-right / top-to-bottom | Default cascade |
| `from: "end"` | Right-to-left / bottom-to-top | Reverse emphasis |
| `from: "center"` | Center outward | Symmetric reveals |
| `from: "edges"` | Edges inward | Dramatic convergence |
| `from: "random"` | Random order | Playful, chaotic |

---

## Parallax Speed Factors

| Layer | Speed | yPercent | Effect |
|-------|-------|----------|--------|
| Far background | Slowest | `-30` to `-50` | Creates depth |
| Near background | Slow | `-15` to `-25` | Moderate depth |
| Content (base) | Normal | `0` | Standard scroll |
| Foreground accent | Faster | `+10` to `+20` | Subtle forward motion |

**ScrollTrigger scrub values:**
- `scrub: 0.5` — Snappy catch-up (recommended default)
- `scrub: 1` — Smooth, natural feel
- `scrub: 2` — Very smooth, cinematic
- `scrub: true` — NEVER use (feels jarring)

**Trigger points:**
- `start: "top 80%"` — Standard (element enters viewport bottom 20%)
- `start: "top 85%"` — Earlier trigger (for batched items)
- `start: "top 70%"` — Later trigger (for emphasis elements)

---

## Hover Effect Values

### Lift

| Property | Value | Duration | Easing |
|----------|-------|----------|--------|
| `translateY` | `-2px` to `-4px` | 200ms | `cubic-bezier(0.16, 1, 0.3, 1)` |
| `box-shadow` | `0 8px 30px rgba(0,0,0,0.12)` | 200ms | same |

### Card Lift (stronger)

| Property | Value | Duration | Easing |
|----------|-------|----------|--------|
| `translateY` | `-4px` to `-8px` | 300ms | `cubic-bezier(0.16, 1, 0.3, 1)` |
| `box-shadow` | `0 12px 40px rgba(0,0,0,0.15)` | 300ms | same |

### Scale

| Property | Value | Duration | Easing |
|----------|-------|----------|--------|
| `scale` (subtle) | `1.02` to `1.03` | 200ms | `cubic-bezier(0.34, 1.56, 0.64, 1)` |
| `scale` (prominent) | `1.05` to `1.08` | 300ms | same |

### Image Zoom (inside container)

| Property | Value | Duration | Easing |
|----------|-------|----------|--------|
| `scale` on inner image | `1.05` to `1.15` | 600ms | `cubic-bezier(0.16, 1, 0.3, 1)` |
| Container | `overflow: hidden` | — | — |

### Underline Grow

| Property | Value | Duration | Easing |
|----------|-------|----------|--------|
| `scaleX` on `::after` | `0` → `1` | 300ms | `cubic-bezier(0.16, 1, 0.3, 1)` |
| `transform-origin` | `left center` | — | — |

### Background Slide

| Property | Value | Duration | Easing |
|----------|-------|----------|--------|
| `translateX` on `::before` | `-100%` → `0` | 300-400ms | `cubic-bezier(0.16, 1, 0.3, 1)` |
| Container | `overflow: hidden` | — | — |

### Clip Reveal

| Property | Value | Duration | Easing |
|----------|-------|----------|--------|
| `clip-path` | `inset(0 100% 0 0)` → `inset(0 0 0 0)` | 400ms | `cubic-bezier(0.16, 1, 0.3, 1)` |

---

## Magnetic Effect Parameters

### Button Magnetic

```js
// Standard implementation
const strength = 0.3  // 0.2-0.5 range (0.3 is default)
const returnDuration = 0.6
const returnEase = 'elastic.out(1, 0.3)'

button.addEventListener('mousemove', (e) => {
  const rect = button.getBoundingClientRect()
  const x = (e.clientX - rect.left - rect.width / 2) * strength
  const y = (e.clientY - rect.top - rect.height / 2) * strength
  gsap.to(button, { x, y, duration: 0.3, ease: 'power2.out' })
})

button.addEventListener('mouseleave', () => {
  gsap.to(button, { x: 0, y: 0, duration: returnDuration, ease: returnEase })
})
```

### Cursor Follower (quickTo)

```js
const xTo = gsap.quickTo(cursor, 'x', { duration: 0.4, ease: 'power3.out' })
const yTo = gsap.quickTo(cursor, 'y', { duration: 0.4, ease: 'power3.out' })

window.addEventListener('mousemove', (e) => {
  xTo(e.clientX)
  yTo(e.clientY)
})
```

### Cursor sizes

| State | Dot Size | Follower Size | Blend Mode |
|-------|----------|--------------|------------|
| Default | 6-8px | 32-40px | `mix-blend-mode: difference` |
| Hovering link | 12-16px | 48-56px | same |
| Hovering image | 60-80px | hidden | `mix-blend-mode: normal` + label |

---

## Spacing Scale (8pt Grid)

| Token | Value | Use For |
|-------|-------|---------|
| `--space-xs` | 4px | Inline gaps, icon padding |
| `--space-sm` | 8px | Tight element spacing |
| `--space-md` | 16px | Standard element gap |
| `--space-lg` | 24px | Group spacing |
| `--space-xl` | 32px | Section sub-divisions |
| `--space-2xl` | 48px | Major content blocks |
| `--space-3xl` | 64px | Section padding (mobile) |
| `--space-4xl` | 96px | Section padding (tablet) |
| `--space-5xl` | 128px | Section padding (desktop) |
| `--space-6xl` | 192px | Hero padding, dramatic space |

---

## Z-Index Scale

| Token | Value | Use For |
|-------|-------|---------|
| `--z-behind` | -1 | Background atmosphere, decorative |
| `--z-base` | 0 | Default content |
| `--z-elevated` | 1 | Cards, raised content |
| `--z-overlap` | 2 | Overlapping elements |
| `--z-decoration` | 5 | Decorative foreground elements |
| `--z-grain` | 10 | Grain overlay |
| `--z-nav` | 50 | Navigation, sticky header |
| `--z-modal` | 100 | Modals, lightboxes |
| `--z-cursor` | 200 | Custom cursor |
| `--z-preloader` | 999 | Preloader overlay |

---

## Color Construction Values

### Near-Black Taxonomy

| Temperature | Hex | HSL | Use Case |
|-------------|-----|-----|----------|
| Cool blue | `#0a0a12` | 240, 30%, 5% | Tech, SaaS, futuristic |
| Cool violet | `#0d0b14` | 260, 30%, 5% | Creative, luxury digital |
| Neutral | `#0a0a0a` | 0, 0%, 4% | Versatile, product-focused |
| Warm amber | `#0f0d0a` | 35, 25%, 5% | Luxury, editorial |
| Green-tinted | `#0a0f0c` | 140, 25%, 5% | Nature, fintech |

### Gray Scale Construction

From base hex, increment lightness by 4-5% per step:
```
Canvas:    HSL(hue, sat, 5%)   → #0a0a12
Surface:   HSL(hue, sat, 9%)   → #141420
Surface-2: HSL(hue, sat, 13%)  → #1e1e2e
Border:    HSL(hue, sat, 18%)  → #2a2a3c
Muted:     HSL(hue, sat, 40%)  → #5c5c78
```

### Accent Contrast Requirements

| Context | Min Contrast vs Canvas | Target |
|---------|----------------------|--------|
| Body text | 4.5:1 (WCAG AA) | 7:1+ |
| Large text (24px+) | 3:1 | 4.5:1+ |
| UI components | 3:1 | 4.5:1+ |
| Accent for impact | 7:1 | 10:1+ |
| Decorative (non-text) | No minimum | — |

### Gradient Techniques

**Mesh gradient (2-3 radial layers):**
```css
background-color: var(--canvas);
background-image:
  radial-gradient(circle at 20% 30%, var(--accent-primary-10) 0%, transparent 50%),
  radial-gradient(circle at 80% 60%, var(--accent-secondary-08) 0%, transparent 60%);
```

**Directional glow:**
```css
background: radial-gradient(ellipse at top right,
  var(--accent-primary-08) 0%, transparent 50%);
```

**Vignette:**
```css
background: radial-gradient(ellipse at center,
  transparent 50%, rgba(0,0,0,0.4) 100%);
```

---

## Touch Target Sizes

| Standard | Minimum | Best Practice |
|----------|---------|---------------|
| WCAG 2.2 AA | 24×24 CSS px | — |
| Apple iOS | 44×44 points | 44×44px |
| Google Android | 48×48 dp | 48×48px |
| **Project standard** | **44×44px** | **48×48px** |

---

## Border Radius Mixing

Never use a single radius everywhere. Mix these values:

| Context | Radius | Token |
|---------|--------|-------|
| Sharp edges (images, sections) | 0px | `--radius-none` |
| Subtle rounding (cards, inputs) | 4px | `--radius-sm` |
| Medium rounding (buttons, tags) | 8px | `--radius-md` |
| Large rounding (modals, panels) | 16px | `--radius-lg` |
| Pill shape (badges, toggles) | 999px | `--radius-full` |

---

## Responsive Scaling Factors

| Property | Mobile→Desktop Ratio | Example |
|----------|---------------------|---------|
| Display font | 0.5x - 0.65x | 72px desktop → 36-48px mobile |
| Section heading | 0.6x - 0.7x | 48px desktop → 28-36px mobile |
| Section padding | 0.5x - 0.6x | 160px desktop → 80-96px mobile |
| Grid gap | 0.5x | 32px desktop → 16px mobile |
| Container margin | 20px fixed | 60px desktop → 20px mobile |
| Overlaps | 0-0.5x | 80px desktop → 0-40px mobile |
| Decorative elements | Hidden or 0.5x scale | Often hidden on mobile |
