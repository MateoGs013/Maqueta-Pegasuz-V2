# Layout Library

Reference for the Creative Director and Constructor agents.
Each layout defines a grid/composition pattern for a section.

---

## Hero layouts

Heroes must use one of the five layouts below. Each is named and referenced in design-decisions.md Section 10.
`L-Hero-Center` (centered text on background) is **REMOVED** — it is the default AI-generated pattern and is banned.

---

### L-Hero-SplitTension (Recipe A)
Two columns at golden or dominant ratio. Visual bleeds past its column boundary.
```
[ Heading + desc + CTA  | ←visual bleeds 60px ]
[ index / rule          |    into text column  ]
```
```css
.hero-inner {
  display: grid;
  grid-template-columns: 1.618fr 1fr;   /* golden — or 2fr 0.8fr (dominant) */
  min-height: 100svh;
  overflow: hidden;
}
.hero__visual {
  clip-path: polygon(8% 0, 100% 0, 100% 100%, 0% 100%); /* diagonal left edge */
  margin-left: -60px;   /* bleeds into text column */
  align-self: stretch;
  object-fit: cover;
  width: calc(100% + 60px);
}
.hero__heading {
  margin-right: -5%;   /* 1-2 words bleed past grid line */
}
```
Distinctive element: the visual's diagonal left edge + negative-margin bleed makes the two columns feel locked together rather than placed side by side.

---

### L-Hero-OversizedVisual (Recipe B)
Large visual (55-70vw) flushes to one viewport edge; text is in a constrained block on the opposite side with a frosted contrast band.
```
[ Text + contrast band  |← visual 60vw →|flush-right ]
```
```css
.hero {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  min-height: 100svh;
  overflow: hidden;
}
.hero__visual {
  grid-column: 2 / 3;
  align-self: stretch;
  margin-right: calc(-1 * (100vw - 1200px) / 2);  /* flush to viewport edge */
  object-fit: cover;
}
.hero__content { position: relative; z-index: 2; align-self: center; }
.hero__text-band {
  background: rgba(var(--canvas-rgb), 0.65);
  backdrop-filter: blur(16px);
  padding: 32px 40px;
}
```
Distinctive element: the full-height visual flush to the edge makes the section feel like a magazine spread, not a webpage.

---

### L-Hero-LayeredPlanes (Recipe C)
Three depth levels share one grid cell via `grid-area: 1 / -1`. All layers are simultaneously visible.
```
[ BACK: oversized text 22vw at 7% opacity        ]
[ MID:  atmospheric visual at 40% opacity         ]
[ FRONT: content block max 52% width, off-center  ]
```
**Mid-plane must be visually distinguishable.** Safe choices:
- Gradient mesh in accent colors (always safe, never invisible)
- Bright photography at 75-85% opacity (warm, colorful, NOT dark studio/code/night shots)
- SVG or abstract illustration at 100% opacity
**Never:** dark photography at ≤60% opacity on a dark canvas — it will be invisible.
```css
.hero { display: grid; min-height: 100svh; }

.hero__back-type,
.hero__mid-visual,
.hero__front-content { grid-area: 1 / -1; }  /* all share same cell */

.hero__back-type {
  font-size: clamp(180px, 22vw, 360px);
  font-weight: 900;
  opacity: 0.07;
  z-index: 0;
  align-self: center;
  white-space: nowrap;
  overflow: visible;           /* intentionally clips off viewport */
  letter-spacing: -0.04em;
  line-height: 1;
}
.hero__mid-visual  { z-index: 1; opacity: 0.42; align-self: stretch; object-fit: cover; }
.hero__front-content {
  z-index: 2;
  max-width: 52%;
  align-self: flex-end;
  justify-self: flex-start;
  padding-bottom: 10vh;
}
```
Distinctive element: the three planes create genuine depth — the back-type functions as spatial architecture, not decoration.

---

### L-Hero-KineticGrid (Recipe D)
Named CSS grid areas spanning rows and columns. Large index/number spans 2 columns; heading spans 2 rows.
```
[ IDX(200-400px) | IDX       | nav-item  ]
[ IDX            | heading   | image-inset]
[ descriptor     | heading   | cta        ]
```
```css
.hero-grid {
  display: grid;
  grid-template-columns: 0.8fr 1.2fr 0.6fr;
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    "idx  idx  nav"
    "idx  head img"
    "desc head cta";
  min-height: 100svh;
  padding: clamp(24px, 4vw, 60px);
}
.hero__index {
  grid-area: idx;
  font-size: clamp(200px, 25vw, 400px);
  opacity: 0.06;
  line-height: 1;
  overflow: hidden;
}
.hero__heading  { grid-area: head; align-self: center; }
.hero__image    { grid-area: img;  object-fit: cover; }
.hero__cta      { grid-area: cta;  align-self: flex-end; }
```
Distinctive element: the grid itself is the composition — elements live at different grid coordinates, not stacked in a column.

---

### L-Hero-FullBleedOverlay (Recipe E)
The visual fills the entire section. Content is anchored to a non-centered position. `mix-blend-mode` integrates one text element with the image.
```
[ full-bleed visual ← fills 100% of section height/width           ]
[    contrast gradient (not black 0.7 — project-specific)          ]
[                                          content block: left 8%  ]
[                                                       bottom 15% ]
```
```css
.hero {
  position: relative;
  min-height: 100svh;
  overflow: hidden;
}
.hero__bg {
  position: absolute; inset: 0;
  object-fit: cover; width: 100%; height: 100%;
  z-index: 0;
}
.hero__overlay {
  position: absolute; inset: 0; z-index: 1;
  /* intentional, not safe black */
  background: linear-gradient(
    160deg,
    rgba(var(--canvas-rgb), 0.5) 0%,
    rgba(var(--canvas-rgb), 0.15) 55%,
    transparent 100%
  );
}
.hero__content {
  position: absolute;
  left: 8%; bottom: 15%;
  max-width: 50%; z-index: 2;
}
.hero__accent-word { mix-blend-mode: overlay; color: #fff; }
```
Distinctive element: content anchored to bottom-left (not center), with one `mix-blend-mode: overlay` word that integrates with the image beneath.

---

### L-Full-Bleed
Content spans the entire viewport width. No container.
Good for: immersive images, video backgrounds, atmospheric sections (non-hero use).

---

## Grid layouts

### L-Grid-2
Two equal columns. Good for: feature pairs, before/after, comparison.
```
[  Card  |  Card  ]
```

### L-Grid-3
Three equal columns. Good for: features, team members, pricing.
```
[  Card  |  Card  |  Card  ]
```
Collapses to 1 column on mobile, 2 on tablet.

### L-Grid-Masonry
Variable-height items in columns. Good for: portfolios, galleries, testimonials.
Uses CSS `columns` or JS-based masonry.

### L-Grid-Bento
Mixed-size tiles in a bento-box layout. Some items span 2 cols or 2 rows.
```
[ Large  |  Small ]
[        |  Small ]
[ Small  | Large  ]
```

---

## Asymmetric layouts

### L-Offset-Left
Large content left (60-70%), smaller content right with vertical offset.
```
[   Large Content   | Offset ]
[                   | Content]
```

### L-Offset-Right
Mirror of L-Offset-Left. Large content right.

### L-Stagger
Items alternate left and right as you scroll down.
```
[  Item 1        ]
[        Item 2  ]
[  Item 3        ]
```
Good for: timelines, process steps, case study sections.

---

## Text-focused layouts

### L-Text-Center
Centered text block with generous whitespace. No visuals.
Max-width ~65ch for readability. Good for: manifesto, about statement, philosophy.

### L-Text-Sidebar
Main text with a narrow sidebar (stats, quotes, or navigation).
```
[ Sidebar |     Main Text Content      ]
```

### L-Columns-Text
Text split into 2-3 columns (newspaper style).
Good for: detailed descriptions where vertical scroll should be minimized.

---

## Interactive layouts

### L-Tabs
Tabbed content with animated panel switching.
Good for: features, services, FAQ categories.

### L-Accordion
Expandable/collapsible content blocks.
Good for: FAQ, specifications, detailed breakdowns.

### L-Carousel
Horizontal scrolling cards or panels.
Good for: testimonials, portfolio pieces, team members.
Use CSS `scroll-snap` or GSAP Draggable.

### L-Scroll-Sequence
Content changes as user scrolls through a pinned section.
Uses ScrollTrigger pin. Good for: storytelling, product features, process steps.

---

## Marquee layouts

### L-Marquee
Infinite horizontal scroll of logos, text, or images.
CSS animation for performance. Pauses on hover.
Good for: client logos, tech stack, social proof.

### L-Ticker
Vertical scrolling content. Less common but distinctive.
Good for: live data, news feed, activity log.

---

## Responsive rules

- All multi-column layouts collapse to single column below 768px
- Grid gaps reduce on mobile (use spacing scale)
- Asymmetric layouts become stacked with preserved visual hierarchy
- Horizontal scroll sections become vertical on mobile
- Touch targets minimum 44x44px
