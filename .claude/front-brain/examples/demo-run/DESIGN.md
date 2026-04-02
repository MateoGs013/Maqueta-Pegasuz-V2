# DESIGN.md — Atelier Fuego

## Project Framing

- Project: Atelier Fuego
- Type: premium creative studio
- Mode: autonomous
- Goal: launch a homepage that feels editorial, warm, cinematic, and clearly premium without drifting into generic agency aesthetics

## Brand Intent

- Present the studio as selective, sharp, and tactile
- Signal modernity through motion and systems, not through generic SaaS UI tropes
- Keep warmth and luxury without collapsing into sterile fashion minimalism

## Design Principles

1. Every section needs a visible compositional decision, not just balanced content blocks
2. Typography carries identity before decoration does
3. Depth must be perceptible in screenshots, not only in CSS
4. Motion should reveal hierarchy and rhythm, not act as ambient filler

## Tone And Atmosphere

- Warm-black canvas
- Editorial pacing
- Dense but breathable hero
- Grain and amber highlights
- Premium, not playful

## Composition Constraints

- Ban symmetric `1fr 1fr` hero layouts
- Require one visible overlap or container break per section
- Avoid repeating the same layout family in adjacent sections
- Hero must include a structural visual that reads immediately at desktop and mobile

## Typography Rules

- Display: expressive serif or premium grotesk
- Body: neutral but refined sans
- Scale contrast: at least 4x from body to dominant headline
- Tracking must be intentional on labels, nav, and metadata

## Palette And Token Intent

- Near-black base with warm white text
- Accent family should stay inside amber / copper / burnished gold territory
- Use soft opacity layers instead of flat gray panels

## Motion Rules

- Entrance choreography must use at least two easing personalities
- One scroll-linked motion system per hero
- Magnetic behavior reserved for primary intent actions
- No generic fade-up-only sections

## Responsive Rules

- Mobile layouts must preserve the same core tension, not merely stack content
- Tablet must be explicitly composed, not treated as a stretched mobile view
- Hero visual remains readable even when secondary detail zones collapse

## Accessibility Rules

- Contrast failures are never auto-approved
- Focus-visible on every interactive
- Heading hierarchy must remain coherent after section assembly

## Anti-Patterns

- Purple gradients on white
- Inter/Roboto/system UI defaults
- Flat single-color backgrounds with centered copy
- Thin accent-line heroes with no structural visual
- Decorative motion that does not change reading order or depth

## Seed Policy

- Allowed hero families: editorial-grid, ambient-canvas, split-stage, cinematic-overlay
- Allowed nav families: adaptive-contextual, floating-glass, fullscreen-editorial
- Banned hero patterns: centered generic SaaS hero, low-opacity dark photo on dark canvas, empty luxury minimalism
- Mutation budget: high on typography, copy layout, and detail systems; medium on core composition; low on signature-defining motion gestures
- Reference policy: borrow structure and rhythm, never clone surface styling
