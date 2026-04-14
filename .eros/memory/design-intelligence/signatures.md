# Signature Elements

Distinctive design elements that make sections memorable. Only entries with actual content retained.

## Approved (8)

| Date | Project | Section | Element | Description | Why It Worked |
|------|---------|---------|---------|-------------|---------------|
| 2025-04 | baseline | Hero | Diagonal text overlap | Display heading -3deg overlapping full-bleed image with clip-path reveal | Immediate visual tension, breaks centered heading pattern |
| 2025-04 | baseline | Nav | Contextual micro-interactions | Nav items shift color/weight by scroll section, magnetic hover on CTA | Nav feels alive without distraction |
| 2025-04 | baseline | Features | Staggered card cascade | Bento grid with ScrollTrigger.batch(), alternating left/right + depth shadows | Combines stagger + depth + asymmetric grid (3 dimensions) |
| 2025-04 | baseline | Footer | Parallax depth close | 3 parallax layers collapsing on scroll end | Distinctive close -- most footers are flat |
| 2026-04-02 | Coque | Hero | Phantom architecture back-type | 22vw "COQUE" behind gradient mesh, 3-plane parallax, front-content bottom-left | Back-type as spatial anchor, depth without imagery |
| 2026-04-02 | Coque | FeaturedWork | Curtain reveal clip-path | clip-path: inset() at 1000ms power3.inOut on light theme (pre-RULE-007) | Slow curtain-pull makes each project an event |
| 2026-04-02 | Coque | Marquee | Contra-scroll kinetic | Two rows at 60px/s vs 45px/s, opposite directions, pause on hover | Speed differential prevents mechanical feel |
| 2026-04-02 | Coque | CTA | Repulsion field | Words push away from cursor, CTA pulls toward (magnetic + repulsion) | Gravitational tension micro-narrative |

## Rejected (2)

| Date | Project | Section | Element | Lesson |
|------|---------|---------|---------|--------|
| 2025-04 | baseline | Hero | Auto-playing video bg | Performance hit, feels like 2018. Use static + motion overlays. |
| 2025-04 | baseline | Features | Infinite scroll marquee | Feels cheap. Only works for testimonial quotes with careful pacing. |

---
*Cleaned 2026-04-10: removed 33 all-null shell entries (41 -> 8 approved).*
