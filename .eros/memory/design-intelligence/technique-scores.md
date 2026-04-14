# Technique Scores

Performance history of motion/visual techniques. Cleaned 2026-04-10 (22 -> 13 real techniques).

| Technique | Uses | Avg | Confidence | Best With | Notes |
|-----------|------|-----|------------|-----------|-------|
| Clip-path image reveal | 5 | 8.3 | high | hero, portfolio | Top performer. High-contrast imagery. Avoid small elements. |
| Curtain wipe reveal | 1 | 9.1 | low | hero | Highest single score. Cyberpunk validated. Needs other-mood data. |
| Glitch signature | 1 | 8.7 | low | team | RGB split hover + status pulse. Cyberpunk context. |
| Clip-path accordion | 1 | 8.6 | low | faq | Curtain accordion 420ms. Numeral transitions. |
| Curtain hover reveal | 1 | 8.5 | low | services | Neon curtain 480ms per-card + content inversion. |
| Grain/noise overlay | 2 | 8.5 | low | dark sections | Film grain 2-4% opacity. Name element for observer. |
| SplitText char reveal | 5 | 7.9 | medium | hero, editorial | Needs mask:true. Weak on short copy. |
| Stagger cascade | 6 | 7.8 | high | features, grid | ScrollTrigger.batch(). 0.03-0.08 per item. |
| Parallax depth layers | 5 | 7.4 | high | hero, about | Always scrub:0.5. Max 3 layers. |
| Counter/ticker | 2 | 7.2 | low | stats | Intersection observer trigger. No decimals. |
| Magnetic buttons | 3 | 7.0 | medium | cta, nav | Disable on touch. Scale + border feedback. |
| Gradient mesh atmosphere | 2 | 6.8 | low | hero, cta | Low opacity only. Feels generic fast. |
| Spline 3D scene | 1 | 6.5 | low | hero | Heavy. Dynamic import + fallback required. |

---
*Removed 10 phantom/duplicate entries (SplitText, clip-path, stagger, scrub, grain, noise, GSAP, ScrollTrigger, Lenis, WebGL).*
