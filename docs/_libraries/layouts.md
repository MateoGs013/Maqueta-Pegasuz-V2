# Layout Library

Reference for the Creative Director and Constructor agents.
Each layout defines a grid/composition pattern for a section.

---

## Full-width layouts

### L-Hero-Split
Two columns: text left, visual right (or reversed). Visual can be image, 3D, or video.
```
[  Text Column  |  Visual Column  ]
```
Grid: `grid-template-columns: 1fr 1fr` — collapses to stacked on mobile.

### L-Hero-Center
Centered text over full-width background (image, video, or atmosphere).
```
[         Centered Headline         ]
[           Subtext + CTA           ]
```
Max-width container for text. Background is edge-to-edge.

### L-Hero-Asymmetric
Off-center composition. Large text on one side, offset visual that bleeds.
```
[  Large Text          ]
[              Visual --|--overflow ]
```
Uses negative margin or `overflow: visible` for the bleed effect.

### L-Full-Bleed
Content spans the entire viewport width. No container.
Good for: immersive images, video backgrounds, atmospheric sections.

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
