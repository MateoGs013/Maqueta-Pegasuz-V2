# Design Brief: {{PROJECT_NAME}}

> Visual source of truth. Produced by `creative-director`. ALL downstream skills
> read from this file. NO code until this is complete and passes 12-point validation.

---

## 1. Creative Concept

- **Concept statement**: {{2-3 sentences capturing the essence of how the site FEELS}}
- **Reference level**: Awwwards / FWA / CSSDA
- **Visual keywords**: {{5 words — e.g., "cinematic, textured, asymmetric, nocturnal, architectural"}}
- **Anti-references**: {{what this is NOT — e.g., "not corporate, not template-clean, not minimalist-flat"}}

---

## 2. Color Palette

Each color has a REASON. Not just "looks nice."

```css
:root {
  /* Canvas — dominant background */
  --color-canvas: {{HEX}};         /* WHY: {{reason}} */
  --color-surface: {{HEX}};        /* WHY: {{reason}} */
  --color-surface-alt: {{HEX}};    /* WHY: {{reason}} */

  /* Ink — text */
  --color-ink: {{HEX}};
  --color-ink-muted: {{HEX}};
  --color-ink-subtle: {{HEX}};

  /* Signal — accent with meaning */
  --color-signal: {{HEX}};         /* WHY: {{reason}} */
  --color-signal-hover: {{HEX}};
  --color-signal-glow: {{HEX with alpha}};

  /* Atmosphere — depth and mood */
  --color-atmosphere-warm: {{HEX}};
  --color-atmosphere-cool: {{HEX}};

  /* Borders */
  --color-border: {{HEX with alpha}};
  --color-border-hover: {{HEX with alpha}};

  /* Semantic */
  --color-success: {{HEX}};
  --color-error: {{HEX}};
}
```

**Anti-clone check**: Palette is NOT dark+orange, dark+cyan, white+blue, or pure B&W.

---

## 3. Typography

```css
:root {
  /* Display — used as visual architecture */
  --font-display: '{{FONT}}', {{FALLBACK}};
  --text-hero: clamp(3.5rem, 2.5rem + 5vw, {{MAX}}rem);
  --text-display: clamp(2.5rem, 1.5rem + 4vw, {{MAX}}rem);
  --text-heading: clamp(1.5rem, 1rem + 2vw, {{MAX}}rem);
  --tracking-display: {{VALUE}};
  --leading-display: {{VALUE}};

  /* Body */
  --font-body: '{{FONT}}', {{FALLBACK}};
  --text-body: clamp(0.95rem, 0.85rem + 0.3vw, 1.125rem);
  --text-small: clamp(0.8rem, 0.75rem + 0.15vw, 0.875rem);
  --text-caption: 0.75rem;
  --leading-body: 1.6;

  /* Accent (labels, numbers, code) */
  --font-accent: '{{FONT}}', {{FALLBACK}};
  --text-label: 0.75rem;
  --tracking-label: {{VALUE}};
  --transform-label: {{uppercase / none}};
}
```

**Typography-as-design rules**:
- Hero: `--text-hero` creates architectural presence (intentional line breaks via max-width)
- {{N}} sections use typography as primary visual element
- Mixed weights: bold + light in same composition
- Key headlines have deliberate line breaks

---

## 4. Spacing

```css
:root {
  --space-unit: 8px;
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;
  --space-2xl: 3rem;
  --space-3xl: 4rem;
  --space-4xl: 6rem;
  --space-5xl: 8rem;
  --space-6xl: 12rem;

  --section-gap: clamp(var(--space-4xl), 8vw, var(--space-6xl));
  --section-padding: clamp(var(--space-3xl), 6vw, var(--space-5xl));
  --container-max: {{1200-1600}}px;
  --container-narrow: {{800-1000}}px;
  --container-padding: clamp(1.5rem, 4vw, 4rem);
}
```

---

## 5. Shape Language

```css
:root {
  --radius-sm: {{VALUE}};
  --radius-md: {{VALUE}};
  --radius-lg: {{VALUE}};
  --radius-full: 9999px;

  --shadow-sm: {{VALUE}};
  --shadow-md: {{VALUE}};
  --shadow-lg: {{VALUE}};
  --shadow-glow: 0 0 40px var(--color-signal-glow);
}
```

---

## 6. Motion Personality (MANDATORY)

```css
:root {
  /* Brand easing — the motion fingerprint (NOT power3.out) */
  --ease-out: cubic-bezier({{a}}, {{b}}, {{c}}, {{d}});
  --ease-in-out: cubic-bezier({{a}}, {{b}}, {{c}}, {{d}});

  --duration-fast: {{VALUE}};     /* 0.2-0.4s */
  --duration-normal: {{VALUE}};   /* 0.4-0.8s */
  --duration-slow: {{VALUE}};     /* 0.8-1.5s */
}
```

- **Easing name**: "{{EVOCATIVE_NAME}}"
- **Character**: {{1 sentence — how it feels}}
- **Default Y offset**: {{20-60px, NOT 32px}}
- **Default stagger**: {{0.03-0.08s, NOT 0.1s}}

---

## 7. Atmospheric System (MANDATORY)

### Canvas Preset
- **Preset**: {{Noise Mesh / Particle Field / Gradient Orb / Grid Distortion / Aurora Waves}}
- **Mouse reactivity**: {{how cursor affects the canvas}}
- **Scroll reactivity**: {{how scroll affects the canvas}}
- **Mobile fallback**: {{CSS gradient + drift animation, NOT hidden}}

### Per-Section Atmosphere

| Section | Canvas Visible | Additional Effect |
|---------|---------------|-------------------|
| Hero | Yes (bg: transparent) | {{grain 2% / accent glow / etc.}} |
| {{Section 2}} | {{Yes/No}} | {{effect}} |
| {{Section 3}} | {{Yes/No}} | {{effect}} |
| ... | ... | ... |
| Close | Yes (bg: transparent) | {{canvas at full intensity}} |

### Depth Techniques

| Technique | Where Applied |
|-----------|--------------|
| Grain overlay | {{sections}} |
| Accent glow | {{behind headings / CTAs}} |
| Gradient overlay | {{image sections}} |
| Z-stacking | {{overlapping layouts}} |

---

## 8. Cursor System (MANDATORY)

| State | Visual | Trigger |
|-------|--------|---------|
| Default | {{shape, size, blend-mode}} | Default state |
| Hover interactive | {{changes}} | Buttons, links, cards |
| Hover text | {{changes}} | Paragraph text |
| Loading | {{changes}} | During page transition |
| Hidden | Invisible | Over video/canvas |

---

## 9. Page Transitions (MANDATORY)

- **Exit sequence**: {{specific — e.g., "content opacity 0 in 0.4s, overlay scaleY 0→1 from bottom in 0.5s"}}
- **Enter sequence**: {{specific — e.g., "overlay scaleY 1→0 to top in 0.5s, content staggers in from y:20 in 0.6s"}}
- **Persistent elements**: {{canvas, cursor, nav}}
- **Overlay color**: {{--color-signal / --color-canvas / custom}}

---

## 10. Preloader (MANDATORY)

- **Type**: {{brand text + progress bar / logo animation / abstract sequence}}
- **Duration**: {{1.5-3s minimum}}
- **Exit animation**: {{specific — e.g., "slide up with power4.inOut in 0.8s"}}
- **Connection to hero**: {{preloader exit flows into hero entrance timeline}}

---

## 11. Responsive Strategy

| Breakpoint | Key Changes |
|-----------|-------------|
| Mobile (< 768px) | {{not just "stack" — specific layout redesigns}} |
| Tablet (768-1024px) | {{intermediate layouts}} |
| Desktop (1024-1440px) | {{primary design}} |
| Wide (> 1440px) | {{max-width behavior, scaling}} |

**Mobile philosophy**: {{describe — e.g., "typography stays bold, images go full-bleed, interactions adapt to touch, atmosphere canvas switches to CSS fallback"}}

---

## 12. Immersion Dimensions

| Dimension | Technique | Implementation |
|-----------|-----------|----------------|
| 1. Reactivity | {{SPECIFIC}} | {{HOW}} |
| 2. Spatial depth | {{SPECIFIC}} | {{HOW}} |
| 3. Continuity | {{SPECIFIC}} | {{HOW}} |
| 4. Surprise | {{SPECIFIC}} | {{HOW}} |
| 5. Atmosphere | {{SPECIFIC}} | {{HOW}} |
| 6. Narrative | {{SPECIFIC}} | {{HOW}} |
| 7. Generative | {{SPECIFIC}} | {{HOW}} |

**Minimum**: 5/7 dimensions must have concrete techniques.

---

## 13. Z-Index Scale

```css
:root {
  --z-canvas: -1;
  --z-content: 1;
  --z-sticky: 100;
  --z-overlay: 500;
  --z-modal: 700;
  --z-cursor: 900;
  --z-toast: 1000;
}
```

---

## Validation (12-Point Check)

- [ ] Palette not in anti-clone list
- [ ] Typography uses distinctive font
- [ ] Easing is not power3.out/power4.out
- [ ] 8+ homepage sections
- [ ] 5/7 immersion dimensions
- [ ] No consecutive motion category repeats
- [ ] 3+ sections with multi-layer interaction
- [ ] Atmospheric preset specified
- [ ] Custom cursor with 3+ states
- [ ] Page transitions choreographed
- [ ] 2+ asymmetric layouts
- [ ] Typography-as-design in 3+ sections
