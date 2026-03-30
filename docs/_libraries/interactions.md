# Interaction Library

Reference for the Creative Director and Constructor agents.
Each interaction defines how an element responds to user input.

---

## Hover interactions

### I-Lift
Element lifts with shadow increase on hover.
```css
/* Never use CSS `ease` — always specify cubic-bezier */
.card { transition: transform 0.3s cubic-bezier(0.25, 0.1, 0, 1), box-shadow 0.3s cubic-bezier(0.25, 0.1, 0, 1); }
.card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.15); }
```

### I-Glow
Border or background glow effect on hover.
```css
.item { transition: box-shadow 0.3s cubic-bezier(0.25, 0.1, 0, 1); }
.item:hover { box-shadow: 0 0 0 1px var(--accent-primary), 0 0 20px var(--accent-primary-20); }
```

### I-Scale
Subtle scale increase (1.02-1.05) on hover.
```css
.card { transition: transform 0.3s cubic-bezier(0.25, 0.1, 0, 1); }
.card:hover { transform: scale(1.03); }
```

### I-Reveal
Hidden content reveals on hover (overlay, caption, details).
```css
.card__overlay { opacity: 0; transition: opacity 0.4s cubic-bezier(0.25, 0.1, 0, 1); }
.card:hover .card__overlay { opacity: 1; }
```

### I-Magnetic
Element subtly follows the cursor within its bounds. Uses JS.
Strength `0.3` is the standard multiplier — use consistently across all implementations.
```js
el.addEventListener('mousemove', (e) => {
  const { left, top, width, height } = el.getBoundingClientRect()
  const x = (e.clientX - left - width / 2) * 0.3   // standard strength: 0.3
  const y = (e.clientY - top - height / 2) * 0.3
  gsap.to(el, { x, y, duration: 0.3, ease: 'power2.out' })
})
el.addEventListener('mouseleave', () => {
  gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' })
})
```

### I-Tilt
3D tilt toward cursor. Uses `perspective` + `rotateX/Y`.

### I-Color-Shift
Background or text color shifts on hover using CSS transitions.
```css
.item { transition: background-color 0.3s cubic-bezier(0.25, 0.1, 0, 1), color 0.3s cubic-bezier(0.25, 0.1, 0, 1); }
```

---

## Click/tap interactions

### I-Ripple
Material-style ripple from click point. CSS + JS.

### I-Toggle
State toggle with smooth transition (accordion, drawer, switch).

### I-Expand
Element expands to reveal more content (card → detail view).

---

## Scroll interactions

### I-Parallax
Elements move at different speeds during scroll, creating depth.
Front elements faster, back elements slower.
```js
gsap.to(el, {
  yPercent: -20,
  ease: 'none',
  scrollTrigger: {
    trigger: sectionRef,
    start: 'top bottom', end: 'bottom top',
    scrub: 0.5  // use 0.5 for smooth lag — never scrub: true (too snappy)
  }
})
```

### I-Sticky-Reveal
Content sticks while new elements reveal beside/over it.
Uses ScrollTrigger pin.

### I-Progress
Visual progress indicator that fills as user scrolls through section.

### I-Counter
Numbers count up as they enter the viewport.
```js
gsap.to(el, {
  textContent: targetNumber,
  snap: { textContent: 1 },
  duration: 2,
  ease: 'power2.out',
  scrollTrigger: { trigger: el, start: 'top 80%', once: true }
})
```

---

## Cursor interactions

### I-Cursor-Follow
Custom cursor follows mouse with smooth interpolation.

### I-Cursor-Morph
Cursor changes shape/size based on hovered element type.
- Default: small dot
- Links/buttons: larger circle with label
- Images: expand with "View" text
- Text: thin line (text cursor)

### I-Cursor-Blend
Cursor uses `mix-blend-mode: difference` for contrast.

---

## Focus interactions (a11y)

### I-Focus-Ring
Visible focus ring for keyboard navigation.
```css
:focus-visible { outline: 2px solid var(--accent-primary); outline-offset: 4px; }
```
Never remove focus indicators. Style them to match the design.

### I-Skip-Link
Hidden link that appears on focus for keyboard users to skip navigation.

---

## Rules

- Every interactive element MUST have both hover and focus states
- Touch devices: hover effects become tap effects or are removed
- **Never use CSS `ease` keyword** — always `cubic-bezier(...)` or a GSAP named ease like `power2.out`
- Timing scale: fast = 200ms, medium = 500ms, slow = 1000ms (use `var(--duration-fast)` etc. from tokens)
  - Micro-interactions (lift, scale, glow): fast (200ms)
  - Reveals (overlay, expand): medium (500ms)
  - Magnetic spring-back: 500ms with `elastic.out`
- Magnetic/tilt effects: desktop only, disable on touch (`@media (hover: none)`)
- I-Parallax scrub: always `scrub: 0.5` — never `scrub: true`
- All interactions must be reversible (hover out = return to default)
