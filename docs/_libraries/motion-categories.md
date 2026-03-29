# Motion Categories

9 categories of scroll-reveal animation. Each section is assigned ONE category.
**Rule: no consecutive sections may share the same category.**

---

## 1. Clip-Path Reveal

Element is masked and unmasked via `clip-path` animation.

```js
gsap.from(el, {
  clipPath: 'inset(100% 0 0 0)', // or polygon, circle
  duration: 1,
  ease: 'power3.inOut',
  scrollTrigger: { trigger: el, start: 'top 80%', once: true }
})
```

**Variations:**
- `inset(0 100% 0 0)` — reveal from left
- `inset(0 0 100% 0)` — reveal from top
- `circle(0% at 50% 50%)` → `circle(100%)` — radial reveal
- `polygon()` — custom shape reveal

**Best for:** Images, hero sections, dramatic reveals.

---

## 2. Stagger Cascade

Multiple elements animate in sequence with a stagger delay.

```js
gsap.from(items, {
  y: 40, opacity: 0,
  duration: 0.6,
  stagger: 0.08,
  ease: 'power3.out',
  scrollTrigger: { trigger: container, start: 'top 80%', once: true }
})
```

**Variations:**
- Top-to-bottom stagger
- Left-to-right stagger
- Center-out stagger (`stagger: { from: 'center' }`)
- Random stagger (`stagger: { from: 'random' }`)

**Best for:** Grid items, lists, cards, feature blocks.

---

## 3. Parallax Depth

Elements move at different scroll speeds, creating depth.

```js
gsap.to(el, {
  y: -100,
  ease: 'none',
  scrollTrigger: {
    trigger: section,
    start: 'top bottom',
    end: 'bottom top',
    scrub: true
  }
})
```

**Variations:**
- Foreground faster, background slower
- Horizontal parallax
- Scale parallax (elements grow/shrink)
- Rotation parallax

**Best for:** Hero sections, image-heavy sections, atmospheric backgrounds.

---

## 4. Counter-Motion

Elements move in opposite directions simultaneously.

```js
const tl = gsap.timeline({
  scrollTrigger: { trigger: section, start: 'top 80%', once: true }
})
tl.from(leftEl, { x: -60, opacity: 0, duration: 0.8 })
  .from(rightEl, { x: 60, opacity: 0, duration: 0.8 }, '<')
```

**Variations:**
- Left/right split entrance
- Scale up / scale down
- Rotate clockwise / counter-clockwise
- Vertical split (top down, bottom up)

**Best for:** Split layouts, before/after, comparison sections.

---

## 5. Text Split

Text is split into characters, words, or lines and animated individually.

```js
// Split text into chars (use SplitText plugin or manual span wrapping)
gsap.from(chars, {
  y: '100%', opacity: 0,
  duration: 0.5,
  stagger: 0.02,
  ease: 'power3.out',
  scrollTrigger: { trigger: textEl, start: 'top 85%', once: true }
})
```

**Variations:**
- Char-by-char reveal (typewriter)
- Word-by-word with y offset
- Line-by-line with clip-path
- Scramble effect (random chars → real text)

**Best for:** Headlines, hero text, manifesto sections, quotes.

---

## 6. Elastic Spring

Elements overshoot and bounce with spring physics.

```js
gsap.from(el, {
  scale: 0, opacity: 0,
  duration: 1,
  ease: 'elastic.out(1, 0.5)',
  scrollTrigger: { trigger: el, start: 'top 80%', once: true }
})
```

**Variations:**
- Scale spring (pop in)
- Position spring (overshoot target)
- Rotation spring (wobble)
- Staggered springs

**Best for:** CTAs, icons, playful elements, accent pieces.

---

## 7. Scroll-Linked

Animation progress is tied directly to scroll position (not triggered once).

```js
gsap.to(el, {
  rotation: 360,
  ease: 'none',
  scrollTrigger: {
    trigger: section,
    start: 'top bottom',
    end: 'bottom top',
    scrub: 0.5
  }
})
```

**Variations:**
- Progress bar fill
- Continuous rotation
- Scale with scroll
- Color/opacity shift with scroll
- Horizontal movement with vertical scroll

**Best for:** Progress indicators, decorative elements, immersive storytelling.

---

## 8. SVG Morph

SVG paths animate between shapes, or stroke draws on.

```js
// Stroke draw
gsap.from(path, {
  strokeDashoffset: path.getTotalLength(),
  duration: 2,
  ease: 'power2.inOut',
  scrollTrigger: { trigger: path, start: 'top 80%', once: true }
})
```

**Variations:**
- Path draw (stroke-dashoffset)
- Shape morph (path A → path B, needs MorphSVG plugin or manual)
- Fill reveal
- Line-drawing illustrations

**Best for:** Icons, illustrations, decorative borders, signature elements.

---

## 9. Magnetic Attraction

Elements are attracted to or repelled by the cursor.

```js
section.addEventListener('mousemove', (e) => {
  const { left, top, width, height } = section.getBoundingClientRect()
  const x = ((e.clientX - left) / width - 0.5) * 20
  const y = ((e.clientY - top) / height - 0.5) * 20
  gsap.to(elements, {
    x: (i) => x * (i + 1) * 0.3,
    y: (i) => y * (i + 1) * 0.3,
    duration: 0.5,
    ease: 'power2.out'
  })
})
```

**Variations:**
- Attraction (follow cursor)
- Repulsion (push away from cursor)
- Orbit (elements circle the cursor)
- Layered depth (closer elements move more)

**Best for:** Interactive sections, CTAs, feature highlights, playful moments.

---

## Variety Enforcement

When assigning techniques to sections, use this checklist:
1. Write out the sequence: S1=?, S2=?, S3=?, ...
2. Verify: no two adjacent sections share a category number
3. If violated, swap one of the conflicting sections to a different category
4. Aim for at least 5 different categories across the homepage

## Reduced Motion Fallback

For ALL categories, when `prefers-reduced-motion: reduce`:
- Skip all transforms and position changes
- Elements appear at full opacity instantly
- No scroll-linked effects
- Simple crossfade (0.2s) if any transition is needed
