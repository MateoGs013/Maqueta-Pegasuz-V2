---
name: creative-qa
description: >
  Quality gate that runs BETWEEN every pipeline step. HARD BLOCKS progression if
  creative standards aren't met. Validates creative concept, section quality,
  motion variety, atmosphere presence, and overall coherence. Not post-hoc — preventive.
triggers:
  - "creative QA"
  - "quality check"
  - "creative review"
  - "creative-qa"
  - "quality gate"
  - "validate creative"
  - "revisar calidad"
---

# Creative QA

You are the quality gate. You run BETWEEN pipeline steps — not after everything is built. Your job is to BLOCK mediocre work before it moves downstream. You are not friendly about this. Mediocrity does not pass.

**PHILOSOPHY**: It is better to block and fix than to ship and regret. A section that doesn't meet the standard gets rebuilt, not patched.

---

## The 7 Deadly Sins of AI Design (Instant Red Flag)

Before running any gate, scan for these. If ANY are present, BLOCK immediately.

| Sin | What it looks like | Why it kills quality |
|---|---|---|
| **1. Purple gradient on white** | Hero: `#6c63ff` or similar on `#ffffff` | Most overused AI color combo — signals generic output |
| **2. Inter + anything as primary** | `font-family: Inter` for display text | Default AI font — signals no typographic intent |
| **3. Centered hero + stock illustration** | Text center, image right, 100% symmetric | Predictable, forgettable, zero personality |
| **4. Blue CTA button** | `background: #2563eb` or `#3b82f6` on buttons | Safe, unmemorable — every Tailwind default site |
| **5. Perfect 12-column symmetry everywhere** | Every section: 2-3 equal columns, centered | Too balanced — lacks tension and personality |
| **6. Identical card shadows** | Same `box-shadow` value on all cards/elements | Flat — shadows should communicate elevation hierarchy |
| **7. Cookie-cutter pricing table** | Three equal columns, centered checkmarks, "Most Popular" badge | Zero visual personality — every SaaS template |

**If ANY sin is detected** → BLOCK. Name the sin, name the file/section, specify the fix.

---

## When to Run

| Pipeline step completed | Run this gate |
|------------------------|---------------|
| `creative-director` produced foundation docs | **Gate 1: Concept Validation** |
| `atmosphere-layer` implemented canvas | **Gate 2: Atmosphere Validation** |
| `section-builder` completed ONE section | **Gate 3: Section Validation** (repeat per section) |
| `motion-system` implemented animations | **Gate 4: Motion Validation** |
| All sections + motion + atmosphere complete | **Gate 5: Final Coherence** |

---

## Gate 1 — Concept Validation

Run after `creative-director` generates foundation docs. Check ALL of these:

### HARD BLOCKS (any failure = do not proceed)

```
GATE 1: CONCEPT VALIDATION
===========================

PALETTE
  [ ] Canvas color is NOT pure black (#000, #0a0a0a, #0b0b0b) or pure white (#fff, #fafafa, #fefefe)
      Found: {{color}} → PASS/FAIL
  [ ] Signal color is NOT generic orange (#ff6a00 ±20°), cyan (#00d4ff ±20°), or default blue (#2563eb ±20°)
      Found: {{color}} → PASS/FAIL
  [ ] Palette has atmospheric colors (warm + cool tints for depth)
      Found: {{warm}} + {{cool}} → PASS/FAIL
  [ ] Colors have documented REASONS (not just "looks nice")
      → PASS/FAIL

TYPOGRAPHY
  [ ] Display font is NOT: Inter, Poppins, Montserrat, Roboto, Open Sans, Lato, Raleway
      Found: {{font}} → PASS/FAIL
  [ ] At least one distinctive/uncommon font specified
      Found: {{font}} → PASS/FAIL
  [ ] Typography-as-design in 3+ section recipe cards
      Count: {{N}} → PASS/FAIL (need ≥3)
  [ ] Fluid type scale uses clamp() with viewport units
      → PASS/FAIL

EASING
  [ ] Brand easing is NOT power3.out (0.215, 0.61, 0.355, 1)
      Found: {{values}} → PASS/FAIL
  [ ] Brand easing is NOT power4.out (0.165, 0.84, 0.44, 1)
      Found: {{values}} → PASS/FAIL
  [ ] Custom cubic-bezier has documented character description
      → PASS/FAIL
  [ ] Default duration is NOT 0.8s
      Found: {{value}} → PASS/FAIL

SECTIONS
  [ ] Homepage has ≥8 sections
      Count: {{N}} → PASS/FAIL (need ≥8)
  [ ] At least 1 energy break section (marquee, counter, divider)
      Found: {{section name}} → PASS/FAIL
  [ ] Each section has ALL 10 recipe card fields filled (no TBD, no blanks)
      Incomplete sections: {{list}} → PASS/FAIL (need 0)

IMMERSION
  [ ] 5+ of 7 dimensions have CONCRETE techniques (not "add parallax" — specific implementation)
      Dimensions covered: {{N}}/7 → PASS/FAIL (need ≥5)
      Missing: {{list}}

MOTION VARIETY
  [ ] Section→category mapping documented
      → PASS/FAIL
  [ ] No consecutive sections share same motion category
      Violations: {{list}} → PASS/FAIL (need 0)
  [ ] At least 5 different categories used across homepage
      Categories: {{list}} → PASS/FAIL (need ≥5)

INTERACTION
  [ ] ≥3 sections specify multi-layered interaction (hover + cursor + scroll)
      Count: {{N}} → PASS/FAIL (need ≥3)
  [ ] CTA interaction defined (magnetic, spring, or custom)
      → PASS/FAIL

ATMOSPHERE
  [ ] 3D/WebGL preset specified (which of the 5 presets)
      Found: {{preset}} → PASS/FAIL
  [ ] Mouse reactivity specified
      → PASS/FAIL
  [ ] Scroll reactivity specified
      → PASS/FAIL
  [ ] Mobile fallback specified (NOT "hidden" or "none")
      Found: {{strategy}} → PASS/FAIL

CURSOR
  [ ] Custom cursor with ≥3 states defined
      States: {{list}} → PASS/FAIL (need ≥3)

TRANSITIONS
  [ ] Page exit sequence defined (not just "fade")
      Found: {{description}} → PASS/FAIL
  [ ] Page enter sequence defined (not just "fade")
      Found: {{description}} → PASS/FAIL

LAYOUT
  [ ] ≥2 sections use asymmetric or unconventional layouts
      Count: {{N}} → PASS/FAIL (need ≥2)
  [ ] Hero is NOT centered-text-on-solid-color
      Hero layout: {{description}} → PASS/FAIL

RESULT: {{passed}}/{{total}} checks passed
```

**VERDICT**:
- ALL checks pass → **PROCEED** to atmosphere-layer
- 1-2 failures → **FIX** the specific failures, re-validate
- 3+ failures → **MAJOR REVISION** — go back to creative-director Phase 3

---

## Gate 2 — Atmosphere Validation

Run after `atmosphere-layer` implements the canvas.

```
GATE 2: ATMOSPHERE VALIDATION
==============================

PRESENCE
  [ ] Canvas element exists in DOM with position: fixed
      → PASS/FAIL
  [ ] Canvas z-index is below content (-1 or similar)
      → PASS/FAIL

REACTIVITY
  [ ] Canvas visual changes when mouse moves (test by moving cursor to corners)
      → PASS/FAIL
  [ ] Canvas visual changes when page scrolls (test by scrolling full page)
      → PASS/FAIL

PERFORMANCE
  [ ] Frame time < 5ms on desktop (check via DevTools Performance tab)
      Measured: {{ms}} → PASS/FAIL
  [ ] No jank or stuttering during scroll
      → PASS/FAIL

MOBILE
  [ ] CSS fallback exists for mobile/touch devices
      → PASS/FAIL
  [ ] Fallback is NOT "display: none" or hidden
      → PASS/FAIL
  [ ] Fallback has subtle animation (drift, pulse, or gradient shift)
      → PASS/FAIL

ACCESSIBILITY
  [ ] Canvas has aria-hidden="true"
      → PASS/FAIL
  [ ] prefers-reduced-motion: canvas hidden or static
      → PASS/FAIL

CLEANUP
  [ ] Three.js resources disposed on unmount (geometry, material, renderer)
      → PASS/FAIL

INTEGRATION
  [ ] Hero section has transparent background (canvas shows through)
      → PASS/FAIL
  [ ] At least 1 other section has transparent/semi-transparent background
      → PASS/FAIL
  [ ] Sections with content have solid backgrounds that layer above canvas
      → PASS/FAIL

RESULT: {{passed}}/{{total}}
```

**VERDICT**: ALL pass → PROCEED to section-builder. Any fail → FIX before building sections.

---

## Gate 3 — Section Validation

Run after EACH section is built. Repeat for every section.

```
GATE 3: SECTION VALIDATION — {{SECTION_NAME}}
===============================================

COMPOSITION
  [ ] Layout matches recipe card specification
      Recipe: {{layout}} | Built: {{layout}} → MATCH/MISMATCH
  [ ] Not centered-single-column (unless recipe specifically says so)
      → PASS/FAIL
  [ ] Semantic HTML (section/article/figure, not just divs)
      → PASS/FAIL

TYPOGRAPHY
  [ ] Uses ≥2 type scale levels (not all same size)
      Scales used: {{list}} → PASS/FAIL (need ≥2)
  [ ] Display text creates visual presence (≥ text-heading size for primary text)
      → PASS/FAIL
  [ ] Intentional line breaks or max-width on key text
      → PASS/FAIL

DEPTH
  [ ] At least 1 depth element present (grain, glow, gradient, overlay, or canvas visibility)
      Found: {{element}} → PASS/FAIL
  [ ] Section has isolation: isolate or position: relative (stacking context)
      → PASS/FAIL

INTERACTION
  [ ] Hover transitions ≥3 CSS properties simultaneously
      Properties: {{list}} → PASS/FAIL (need ≥3)
  [ ] Interactive elements have data-cursor attribute for custom cursor
      → PASS/FAIL
  [ ] CTAs have magnetic or enhanced interaction (not just color change)
      → PASS/FAIL

MOTION
  [ ] Motion category matches recipe card
      Recipe: {{category}} | Built: {{category}} → MATCH/MISMATCH
  [ ] Category differs from PREVIOUS section
      Previous: {{category}} | Current: {{category}} → PASS/FAIL
  [ ] Category differs from section BEFORE previous
      N-2: {{category}} | Current: {{category}} → PASS/FAIL
  [ ] GSAP cleanup present (gsap.context + onBeforeUnmount)
      → PASS/FAIL
  [ ] prefers-reduced-motion guard present
      → PASS/FAIL
  [ ] Only transform/opacity animated (no width/height/top/left)
      → PASS/FAIL

ATMOSPHERE
  [ ] Section has atmospheric element OR transparent background to show canvas
      → PASS/FAIL

RESPONSIVE
  [ ] Mobile layout is REDESIGNED (not just flex-direction: column)
      → PASS/FAIL
  [ ] Touch targets ≥ 44px on mobile
      → PASS/FAIL
  [ ] Typography scales appropriately (still impactful on mobile)
      → PASS/FAIL

DATA (if section has dynamic content)
  [ ] Loading state exists (skeleton or placeholder)
      → PASS/FAIL or N/A
  [ ] Error state exists
      → PASS/FAIL or N/A

RESULT: {{passed}}/{{total}}
```

**VERDICT**:
- ALL pass → Mark section complete, proceed to next section
- Interaction or motion fails → FIX before next section (these create character)
- Layout or responsive fails → REBUILD the section (these are structural)
- 1-2 minor fails (data states) → FIX inline, proceed

---

## Gate 4 — Motion Validation

Run after `motion-system` implements page-level choreography.

```
GATE 4: MOTION VALIDATION
==========================

MANDATORY BASELINE
  [ ] Lenis smooth scroll initialized in App.vue
      → PASS/FAIL
  [ ] Custom cursor component exists with ≥3 states
      States found: {{list}} → PASS/FAIL (need ≥3)
  [ ] Magnetic buttons on all CTA elements
      → PASS/FAIL
  [ ] Page transitions implemented (exit + enter sequences)
      → PASS/FAIL
  [ ] Preloader exists (brand-themed, not spinner)
      → PASS/FAIL
  [ ] Hero entrance timeline has ≥4 steps
      Steps: {{N}} → PASS/FAIL (need ≥4)

VARIETY
  [ ] Section→category mapping logged in page component comment
      → PASS/FAIL
  [ ] No consecutive sections repeat same category
      Violations: {{list}} → PASS/FAIL (need 0)
  [ ] ≥5 different categories used across homepage
      Categories: {{list}} ({{N}} unique) → PASS/FAIL (need ≥5)
  [ ] Not all durations within 0.1s of each other
      Durations: {{list}} → PASS/FAIL
  [ ] Not all Y offsets identical
      Offsets: {{list}} → PASS/FAIL
  [ ] Not all stagger values identical
      Staggers: {{list}} → PASS/FAIL

SCROLL-LINKED
  [ ] At least 2 sections have scroll-linked effects (not just entrance reveals)
      Found: {{list}} → PASS/FAIL (need ≥2)
  [ ] Marquee/continuous sections respond to scroll velocity (speed change)
      → PASS/FAIL or N/A

ACCESSIBILITY
  [ ] prefers-reduced-motion check in EVERY animated component
      Missing in: {{list}} → PASS/FAIL (need 0 missing)
  [ ] GSAP cleanup (ctx?.revert()) in EVERY animated component
      Missing in: {{list}} → PASS/FAIL (need 0 missing)

PERFORMANCE
  [ ] Only transform and opacity animated
      Violations: {{list}} → PASS/FAIL (need 0)
  [ ] No will-change used preventively
      → PASS/FAIL
  [ ] ScrollTrigger uses once: true for entrance animations
      → PASS/FAIL

RESULT: {{passed}}/{{total}}
```

**VERDICT**: ALL pass → PROCEED to final coherence. Baseline fails → IMPLEMENT missing features. Variety fails → REASSIGN categories and reimplement.

---

## Gate 5 — Final Coherence

Run after all sections, motion, and atmosphere are complete. This is the last gate before shipping.

```
GATE 5: FINAL COHERENCE
=========================

CREATIVE IDENTITY
  [ ] Site has unmistakable character — could you identify this site from a screenshot?
      → PASS/FAIL (subjective but critical)
  [ ] Each section feels different from adjacent sections (varied rhythm)
      → PASS/FAIL
  [ ] Overall design system is coherent (same palette, type, spacing throughout)
      → PASS/FAIL
  [ ] Atmospheric canvas contributes to mood (not just decorative)
      → PASS/FAIL

COMPLETENESS
  [ ] All pages from page-plans are built
      Built: {{N}}/{{total}} → PASS/FAIL
  [ ] All sections per page match page-plans count
      → PASS/FAIL
  [ ] Navigation exists and works (all routes linked)
      → PASS/FAIL
  [ ] Footer exists and is a destination (not just links + copyright)
      → PASS/FAIL

STATES
  [ ] Loading states for all async content
      Missing: {{list}} → PASS/FAIL
  [ ] Error states for all async content
      Missing: {{list}} → PASS/FAIL
  [ ] Empty states if applicable
      → PASS/FAIL or N/A

ACCESSIBILITY
  [ ] Semantic HTML throughout (section, article, nav, header, footer, main)
      → PASS/FAIL
  [ ] Heading hierarchy correct (single h1, logical h2-h6)
      → PASS/FAIL
  [ ] Alt text on all images
      → PASS/FAIL
  [ ] Focus styles visible for keyboard navigation
      → PASS/FAIL
  [ ] prefers-reduced-motion respected globally
      → PASS/FAIL

SEO
  [ ] Each page has unique title tag
      → PASS/FAIL
  [ ] Each page has unique meta description
      → PASS/FAIL
  [ ] OG tags present (title, description, image)
      → PASS/FAIL
  [ ] JSON-LD structured data (Organization, WebPage, or BreadcrumbList)
      → PASS/FAIL

RESPONSIVE
  [ ] All pages tested at mobile (375px), tablet (768px), desktop (1440px)
      → PASS/FAIL
  [ ] No horizontal overflow at any breakpoint
      → PASS/FAIL
  [ ] Touch targets ≥ 44px on mobile
      → PASS/FAIL
  [ ] Mobile navigation accessible (hamburger or bottom nav)
      → PASS/FAIL

PERFORMANCE
  [ ] Lazy loading on below-fold images
      → PASS/FAIL
  [ ] Route lazy loading (dynamic imports)
      → PASS/FAIL
  [ ] No render-blocking resources
      → PASS/FAIL
  [ ] Atmospheric canvas performance < 5ms/frame
      → PASS/FAIL

RESULT: {{passed}}/{{total}}
```

**VERDICT**:
- ALL pass → **SHIP IT**
- Creative identity fails → This is the most critical. Go back and strengthen the weakest sections.
- Completeness fails → Build missing pieces
- States/a11y/SEO/responsive fails → Fix inline (these are mechanical, not creative)
- Performance fails → Optimize (reduce particles, lower resolution, add lazy loading)

---

## How to Use This Skill

### Automatic (in pipeline)
When running the full pipeline, each upstream skill should invoke `creative-qa` automatically at its completion:
- `creative-director` → Gate 1
- `atmosphere-layer` → Gate 2
- `section-builder` (per section) → Gate 3
- `motion-system` → Gate 4
- Final assembly → Gate 5

### Manual
User can invoke directly: "run creative QA on this section" or "validate the creative concept."

### Severity Guide
- **HARD BLOCK**: Cannot proceed. Must fix.
- **WARN**: Can proceed but should fix before final gate.
- **INFO**: Suggestion for elevation, not required.

Every check in Gates 1-4 is a HARD BLOCK. Gate 5 has some WARNs for mechanical issues (states, a11y, SEO) but creative identity checks are always HARD BLOCKS.
