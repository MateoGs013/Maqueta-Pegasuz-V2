# Motion Spec: {{PROJECT_NAME}}

> Complete choreography for `motion-system`. Every value is specific.
> NEVER default to power3.out / 32px / 0.8s / stagger 0.1.

---

## 1. Motion Personality

- **Character**: {{DESCRIPTION}} (e.g., "liquid confidence — starts fast, settles slowly like poured honey")
- **Speed**: {{fast/medium/slow}} — {{value range: 0.4-0.6 / 0.6-0.9 / 0.9-1.4s}}
- **Easing signature**: `cubic-bezier({{a}}, {{b}}, {{c}}, {{d}})` — "{{NAME}}"
  - GSAP equivalent: `CustomEase.create("brand", "{{path}}")` or closest GSAP preset
  - NOT power3.out. NOT power4.out. NOT ease-in-out.

---

## 2. Preloader

- **Type**: {{brand text reveal / logo animation / abstract shape}}
- **Duration**: {{1.5-3s}}
- **Animation**: {{specific steps — e.g., "brand name fades in 0.6s, progress bar fills 1.5s with easeInOut, exit: slide up 0.8s power4.inOut"}}
- **Hero connection**: {{how preloader exit connects to hero entrance — e.g., "preloader slides up, revealing hero which continues the timeline"}}

---

## 3. Hero Entrance Timeline

Minimum 4 orchestrated steps:

| Step | Element | From | To | Duration | Delay | Easing |
|------|---------|------|-----|----------|-------|--------|
| 1 | {{element}} | {{state}} | {{state}} | {{s}} | 0s | {{easing}} |
| 2 | {{element}} | {{state}} | {{state}} | {{s}} | {{s}} | {{easing}} |
| 3 | {{element}} | {{state}} | {{state}} | {{s}} | {{s}} | {{easing}} |
| 4 | {{element}} | {{state}} | {{state}} | {{s}} | {{s}} | {{easing}} |
| 5 | {{element}} | {{state}} | {{state}} | {{s}} | {{s}} | {{easing}} |

Total hero timeline: {{1.5-3.0s}}

---

## 4. Scroll Reveal Defaults

Used ONLY when a section doesn't have a specific technique assigned:

- **Easing**: {{brand easing — same as §1}}
- **Duration**: {{NOT 0.8s — specify actual value}}
- **Y offset**: {{NOT 32px — specify actual value}}
- **Stagger**: {{NOT 0.1 — specify actual value, 0.03-0.08}}
- **ScrollTrigger start**: `top {{75-85}}%`
- **once**: true (entrance animations don't replay)

---

## 5. Section-by-Section Techniques (MANDATORY)

Every section has a unique motion technique. NO consecutive repeats.

### Homepage

| Section | Name | Category | Technique Detail |
|---------|------|----------|-----------------|
| 1 | {{name}} | {{Timeline/Scrub/Reveal/Stagger/Pin/Depth/Morphing/Typography/Cinematic}} | {{specific implementation}} |
| 2 | {{name}} | {{different from 1}} | {{specific}} |
| 3 | {{name}} | {{different from 2}} | {{specific}} |
| 4 | {{name}} | {{different from 3}} | {{specific}} |
| 5 | {{name}} | {{different from 4}} | {{specific}} |
| 6 | {{name}} | {{different from 5}} | {{specific}} |
| 7 | {{name}} | {{different from 6}} | {{specific}} |
| 8 | {{name}} | {{different from 7}} | {{specific}} |

### {{Inner Page}} (repeat for each page)

| Section | Name | Category | Technique Detail |
|---------|------|----------|-----------------|
| ... | ... | ... | ... |

---

## 6. Hover & Interaction Animations

### Cards
```
Hover in: {{specific — e.g., "translateY(-6px) + shadow-lg + image scale(1.06) + title color signal — 0.4s brand easing"}}
Hover out: {{specific — e.g., "return to origin — 0.3s ease-out (faster than in)"}}
Properties animated: {{list min 3 — e.g., transform, box-shadow, img transform, color}}
```

### Buttons / CTAs
```
Type: magnetic with spring
Strength: {{0.2-0.5}}
Return easing: elastic.out(1, {{0.3-0.5}})
Visual: {{what changes — e.g., "background slides from left, text color inverts"}}
```

### Links
```
Underline: gradient reveal from left — 0.4s brand easing
Color: {{change on hover or not}}
```

### Images
```
Hover: {{scale + filter + overlay — specify all}}
Duration: {{value}}
```

### Nav Items
```
Hover: {{underline / bg slide / text scale — specify}}
Active: {{how active state differs}}
```

---

## 7. Navigation & Menu

- **Scroll behavior**: Lenis smooth scroll (lerp: {{0.05-0.12}}, wheelMultiplier: {{0.6-1.0}})
- **Nav visibility**: Intelligent — hide on scroll-down, show on scroll-up
- **Mobile menu type**: {{overlay takeover / slide panel}}
- **Menu open animation**: {{specific — e.g., "overlay fades in 0.3s, links stagger from bottom 0.05s each"}}
- **Menu close animation**: {{specific}}
- **Hamburger animation**: {{specific — e.g., "lines morph to X with rotation"}}

---

## 8. Page Transitions

### Leave (current page exits)
```
Step 1: {{what happens — e.g., "content opacity 0, y -20, 0.4s power3.in"}}
Step 2: {{what happens — e.g., "overlay scaleY 0→1 from bottom, 0.5s power4.inOut"}}
```

### Enter (new page appears)
```
Step 1: {{what happens — e.g., "overlay scaleY 1→0 to top, 0.5s power4.inOut"}}
Step 2: {{what happens — e.g., "content opacity 0→1, y 20→0, 0.5s power3.out"}}
Step 3: scroll to top
```

### Persistent elements: {{canvas, cursor, nav — what survives the transition}}
### Overlay color: {{CSS variable or hex}}

---

## 9. Scroll-Linked Effects

Beyond entrance reveals — these create continuous interaction:

| Effect | Element | Trigger | Detail |
|--------|---------|---------|--------|
| Parallax | {{element}} | scroll | yPercent: {{value}}, scrub: true |
| Scale | {{element}} | scroll | scale: {{from}}→{{to}}, scrub: 0.5 |
| Color shift | {{element}} | scroll position | bg transitions between {{colors}} |
| Marquee speed | marquee track | scroll velocity | speed multiplier: 1 + velocity * 0.002 |
| Skew | {{element}} | scroll velocity | skewY: velocity * {{0.03-0.08}} |

---

## 10. Cursor System

| State | Visual | Transition |
|-------|--------|-----------|
| Default | {{dot: Npx, ring: Npx, blend-mode: difference}} | - |
| Hover interactive | {{ring expands to Npx, opacity changes}} | 0.3s ease-out |
| Hover text | {{ring becomes thin line (vertical bar)}} | 0.3s ease-out |
| Loading | {{ring pulses}} | 1s ease-in-out infinite |
| Hidden | opacity 0 | 0.2s |

### Magnetic elements
Elements that attract the cursor: {{list — CTAs, logo, nav items, card titles}}
Magnetic strength: {{0.2-0.5}}
Magnetic radius: {{80-150px}}
Return easing: elastic.out(1, {{0.3-0.5}})

---

## 11. Special Techniques

| Technique | Used Where | Detail |
|-----------|-----------|--------|
| Marquee | {{section name}} | {{direction, speed, content, hover behavior}} |
| Counter animation | {{section name}} | {{start: 0, end: N, duration, easing}} |
| Text split (word/char) | {{section name}} | {{library: SplitType / manual, animation type}} |
| Smooth scroll anchors | {{where}} | {{offset, duration, easing}} |
| Custom scrollbar | global | {{width, color, track color}} |

---

## 12. prefers-reduced-motion

When user prefers reduced motion:
- All entrance animations: set final state immediately (no animation)
- Scroll-linked effects: disabled
- Parallax: disabled
- Marquee: paused
- Canvas: hidden or static frame
- Cursor: system default
- Page transitions: instant (no overlay animation)
- Hover states: still apply (color changes OK, transforms disabled)

---

## 13. Performance Guards

- ONLY animate: transform, opacity, clip-path, filter (GPU-composited)
- NEVER animate: width, height, top, left, margin, padding, border-radius
- No preventive will-change
- ScrollTrigger entrance: once: true (no re-trigger)
- GSAP cleanup: gsap.context() + onBeforeUnmount(() => ctx?.revert())
- Mobile: reduce particle count, simplify shaders, disable parallax on < 768px
