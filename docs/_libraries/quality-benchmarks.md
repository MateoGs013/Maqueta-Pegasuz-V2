# Quality Benchmarks

Measurable quality standards for all agents. Every value is concrete and verifiable.
These benchmarks replace subjective judgment with hard thresholds.

---

## Awwwards Scoring Dimensions

| Dimension | Weight | What Judges Evaluate |
|-----------|--------|----------------------|
| **Design** | 40% | Visual quality, layout, typography, color, consistency |
| **Usability** | 30% | Navigation, responsiveness, loading, cross-device, intuitive UX |
| **Creativity** | 20% | Innovation, originality, memorable interactions |
| **Content** | 10% | Real content quality, copy, imagery, messaging |

### Score Thresholds

| Score | Level | What It Means |
|-------|-------|---------------|
| 6.5 | Honorable Mention | Solid but recognizable patterns. Good usability, nothing surprising. |
| 7.0 | Strong | One memorable moment. Responsive feels designed, not just adapted. |
| 8.0+ | Site of the Day | Signature moment that stops scrolling. Performance under pressure. Cross-device parity. Scroll as narrative. |
| 9.0+ | Exceptional | Every section has a "why" moment. Motion serves content hierarchy. Zero template fingerprints. |

### Common Rejection Reasons
- Mobile/touch experience is clunky or untested
- Judges recognize template/framework patterns
- Generic imagery and copy
- Inconsistent design tokens between pages
- Over-reliance on trends without purpose
- Performance problems (slow loading, janky animations)
- Navigation that requires a learning curve

---

## Performance Benchmarks (Developer Award Level)

| Metric | Target | Acceptable |
|--------|--------|------------|
| Lighthouse Performance | 90+ | 80+ |
| LCP (Largest Contentful Paint) | < 1.5s | < 2.5s |
| CLS (Cumulative Layout Shift) | < 0.05 | < 0.1 |
| INP (Interaction to Next Paint) | < 100ms | < 200ms |
| Total page weight | < 3MB | < 5MB |
| Animation frame rate | 60fps sustained | 45fps minimum |
| WCAG contrast ratio (text) | 4.5:1 minimum | 3:1 for large text |

---

## Anti-AI Pattern Detection

These are the specific, measurable traits that make a site look AI-generated.
Every agent must check against this list. If ANY pattern is detected, fix immediately.

### Color Anti-Patterns

| AI Default | Detection | Premium Alternative |
|------------|-----------|---------------------|
| Purple-to-blue gradient (`#667eea` → `#764ba2`) | Any purple gradient as primary | Project-specific accent derived from mood |
| Tailwind indigo (`#5E6AD2`, `bg-indigo-500`) | Default framework colors | Custom token: `--color-brand` unique to project |
| Cyan on dark (`#38BDF8`) | Cyan as sole accent | Warm or unexpected accent with 7:1+ contrast |
| Shadows at exactly `0.1` opacity | Uniform shadow opacity | Layered shadows: `0 2px 4px rgba(0,0,0,0.06), 0 12px 40px rgba(0,0,0,0.12)` |
| No color temperature | Neither warm nor cool | Intentional temperature: cool-blue or warm-amber near-blacks |
| Pure `#000` or `#fff` | No hue in backgrounds | Rich near-blacks with 2-5% hue tint |

### Typography Anti-Patterns

| AI Default | Detection | Premium Alternative |
|------------|-----------|---------------------|
| Inter, Roboto, Arial, Open Sans | Top-4 training data fonts | Distinctive fonts from decision tree |
| Weight variation only 400/600 | Less than 3 weights | Full range: 300, 400, 500, 700+ |
| Size contrast only 1.5x | Heading ÷ body < 3x | Minimum 4x ratio (64px ÷ 16px) |
| No serif/sans pairing | Single font family | Display + body from different categories |
| Missing letter-spacing | All at browser default | Tight headlines (-0.02em), tracked labels (+0.08em) |
| Uniform line-height | Same line-height everywhere | 0.9-1.1 for display, 1.5-1.6 for body |

### Layout Anti-Patterns

| AI Default | Detection | Premium Alternative |
|------------|-----------|---------------------|
| "Hero Left, Text Right" | 1fr 1fr symmetric split | Asymmetric ratios (1.4fr 0.6fr, 2fr 0.8fr) |
| Three cards below hero | Uniform card grid after hero | Asymmetric grid, overlapping elements, varied sizes |
| Everything centered | All text-align: center | Mixed alignment (left + right + center) |
| Uniform `py-20` all sections | Same padding everywhere | Varied padding with 20%+ difference per section |
| No overlaps or bleeds | All elements within containers | Negative margins, 100vw breaks, absolute overlaps |
| Symmetric everything | mirror-image layouts | Intentional asymmetry with purpose |
| Cards in cards in cards | 3+ nesting levels | Maximum 2 nesting levels |
| `border-radius: 12px` everywhere | Single radius value | Mix: 0px (sharp), 4px (subtle), 8px (medium), 999px (pill) |

### Motion Anti-Patterns

| AI Default | Detection | Premium Alternative |
|------------|-----------|---------------------|
| `ease-in-out` everywhere | Single easing curve | 3+ custom cubic-bezier per page |
| Everything fades up identically | Same animation on all elements | Orchestrated sequences with varied techniques |
| No scroll-linked animations | Only triggered fades | ScrollTrigger with `scrub: 0.5` |
| Uniform stagger delays | Same stagger on all groups | Varied stagger timing by context |
| Infinite decorative loops | `repeat: -1` on non-functional elements | Finite, purposeful animations |
| No text split animations | Blocks of text fade as one | SplitText chars/words with stagger |
| No cursor interaction | Default cursor everywhere | Custom cursor + magnetic elements |

### Content Anti-Patterns

| AI Default | Detection | Premium Alternative |
|------------|-----------|---------------------|
| "Elevate your...", "Revolutionize..." | Generic startup language | Specific, conversational copy |
| Lorem ipsum anywhere | Placeholder text | Real content from brief, never placeholder |
| Stock photography style descriptions | Generic image references | Specific visual concepts tied to brand |

---

## Visual Density Scoring

Rate each section's visual density on a 1-5 scale. Minimum score: 3 for all sections.

| Score | Density | Characteristics |
|-------|---------|-----------------|
| 1 | Empty | Single centered block, flat background, no atmosphere |
| 2 | Sparse | Content + background, but no overlaps, depth, or atmosphere |
| 3 | Moderate | Content + 1 atmospheric layer + 1 overlap/depth technique |
| 4 | Rich | Content + 2 atmospheric layers + overlaps + decorative elements |
| 5 | Maximalist | Multiple content layers + atmosphere + overlaps + motion + decorative |

### Density Requirements by Section Type

| Section Type | Minimum Density | Typical |
|--------------|----------------|---------|
| Hero | 4 | 4-5 |
| Features / Services | 3 | 3-4 |
| About / Bio | 3 | 3-4 |
| Work / Portfolio | 4 | 4-5 |
| Testimonials | 3 | 3-4 |
| Stats / Numbers | 3 | 3-4 |
| CTA / Contact | 3 | 3-4 |
| Footer | 2 | 2-3 |

---

## Section Composition Checklist (Builder Self-Evaluation)

For each section, the builder must verify ALL of these measurable requirements.
This replaces subjective "does it look good?" with concrete checks.

### Composition (verify in CSS)
- [ ] Grid ratio ≥ 1.4:1 (never 1fr 1fr)
- [ ] At least 1 overlap (absolute positioning or negative margin)
- [ ] At least 1 container break (negative margin, 100vw, or calc(100% + Npx))
- [ ] padding-top ≠ padding-bottom (≥ 20% difference)
- [ ] At least 2 distinct text alignments

### Depth (verify in CSS + screenshot)
- [ ] Minimum 3 distinct z-index values
- [ ] At least 1 atmospheric pseudo-element (::before or ::after)
- [ ] At least 1 of: backdrop-filter, box-shadow with 2+ layers, gradient overlay, filter: blur()
- [ ] Background has scroll-responsive behavior (parallax, opacity shift, or color transition)

### Typography (verify in CSS)
- [ ] Font size ratio ≥ 4x (largest ÷ smallest)
- [ ] At least 4 distinct font-size values
- [ ] At least 2 distinct font-weight values
- [ ] At least 1 element with custom letter-spacing

### Motion (verify in JS)
- [ ] Entry animation has ≥ 3 gsap calls with different delays
- [ ] At least 2 different easing curves
- [ ] At least 1 scroll-linked animation (ScrollTrigger with scrub)
- [ ] stagger used on at least 1 group

### Craft (verify in CSS + JS)
- [ ] At least 2 visually distinct hover effects
- [ ] At least 1 magnetic element ([data-magnetic])
- [ ] focus-visible on every interactive element
- [ ] At least 1 of: clip-path, mask, shape-outside, or CSS path()

### Signature
- [ ] ONE element named that would make someone pause and screenshot
- [ ] 1-sentence explanation of why it's distinctive

### Anti-AI
- [ ] No pattern from the Anti-AI Detection tables detected
- [ ] Visual density score ≥ 3 (≥ 4 for hero/portfolio sections)
- [ ] At least 1 "spatial surprise" (something that breaks expectation)

---

## Reference Comparison Methodology (Builder Pass B)

When comparing output against reference frames, evaluate these measurable dimensions:

| Dimension | How to Measure | Threshold |
|-----------|---------------|-----------|
| **Layer count** | Count distinct visual layers in screenshot | Within ±1 of reference |
| **Color count** | Count distinct colors visible | Within ±2 of reference |
| **Typography sizes** | Count distinct text sizes visible | Within ±1 of reference |
| **Interactive elements** | Count hover/click targets visible | At least 80% of reference count |
| **Atmospheric elements** | Count gradients, overlays, decorative elements | At least match reference |
| **Whitespace ratio** | Estimate content vs. breathing room | Similar proportion (±15%) |
| **Asymmetry** | Is the layout intentionally unbalanced? | Must match reference if reference is asymmetric |

If the builder's output has FEWER layers, colors, sizes, or atmospheric elements than the reference, the section is too simple. Add more complexity until parity is reached.

---

## CEO Auto-QA Verification

The CEO verifies builder output using this checklist (no user needed):

1. **Score check:** Builder reports all Excellence Standard dimensions pass + signature named → PASS
2. **Screenshot check:** CEO reads desktop + mobile screenshots and verifies:
   - No blank/broken areas visible
   - Text is readable (not overlapping unintentionally)
   - Layout matches cinematic description intent
   - At least 3 visual layers visible in screenshot
   - Mobile layout is designed, not just stacked
3. **Anti-AI check:** No patterns from Anti-AI Detection tables visible in screenshots
4. **Density check:** Visual density ≥ minimum for section type

If ALL pass → section approved autonomously.
If ANY fail → CEO re-dispatches builder with specific failure reason.
Maximum 3 re-dispatch loops. After 3 fails → mark section with `[NEEDS_REVIEW]` flag for user morning review.
