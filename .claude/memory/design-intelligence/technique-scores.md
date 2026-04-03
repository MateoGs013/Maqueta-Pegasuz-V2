# Technique Effectiveness

Usage counts and average scores per technique. CEO updates after Phase 3.

| Technique | Times Used | Avg Score | Notes |
|------|------|------|------|
| SplitText char reveal | 4 | 7.8 | Strong for hero headlines + editorial sections. Needs mask:true for polish. Weak on short copy. |
| Clip-path image reveal | 3 | 8.2 | Top performer for visual sections. Works best with high-contrast imagery. Avoid on small elements. |
| Parallax depth layers | 5 | 7.4 | Reliable depth technique. Always use scrub:0.5. Diminishing returns past 3 layers. |
| Magnetic buttons | 3 | 7 | Good craft signal but subtle. Must disable on touch. Works best with scale + border feedback. |
| Counter/ticker animation | 2 | 7.2 | Effective for stats sections. Needs intersection observer trigger. Avoid decimals. |
| Stagger cascade | 4 | 7.6 | Workhorse for grids/features. Use ScrollTrigger.batch(). Range 0.03-0.08 per item. |
| Gradient mesh atmosphere | 2 | 6.8 | Adds depth cheaply but can feel generic. Needs low opacity (2-4%) and hue variation. |
| Spline 3D scene | 1 | 6.5 | High impact but heavy. Requires dynamic import + fallback image. Loading UX is critical. |
