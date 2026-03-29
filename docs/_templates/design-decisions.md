# {Project Name} — Design Decisions

<!-- The extraction layer between reference analysis and design tokens.
     Every major design choice is documented here with:
     - The decision (what was chosen)
     - The reference evidence (which screenshot / frame)
     - The extracted signal (what specifically in that frame informed this)
     - The intent (what this achieves for the concept)
     - Alternatives considered (what was rejected and why)

     This file is the "why" behind every token in design-tokens.md.
     The Creative Director writes it. The CEO reads it before Phase 3 to understand
     the reasoning, and the Constructor can be given excerpts when a section's
     creative intent needs explanation.

     Without this file: tokens are arbitrary. With it: tokens have provenance. -->

## Color Decisions

### Decision: Canvas / Base color

**Choice:** `#______` (→ `--canvas`)
**Reference:** `_ref-captures/{domain}/frame-{NNN}.png`
**Extracted signal:** "{Describe what you saw — e.g., 'Frame 004 shows a near-black base at approximately #0D0D0D rather than pure black — gives depth without harshness. The slight warmth prevents the cold tension that pure black creates.'}"
**Intent:** {Why this serves the concept — e.g., "Creates the 'late evening studio' atmosphere from the concept statement. Warm enough to feel inhabitable, dark enough to make the accent pop dramatically."}
**Alternatives considered:** Pure black (#000000) — rejected, too cold and harsh. Dark navy — rejected, would shift mood toward corporate.

---

### Decision: Accent Primary

**Choice:** `#______` (→ `--accent-primary`)
**Reference:** `_ref-captures/{domain}/frame-{NNN}.png`
**Extracted signal:** "{e.g., 'Frame 007 uses a single warm amber for all interactive elements — hover states, active navigation, CTA buttons. The accent never appears as a background, always as a point of light against dark.'}"
**Intent:** {e.g., "The tension between cold dark canvas and warm accent is the emotional core of the design. Restraint in usage makes each appearance feel deliberate — exactly what the 'one accent, used deliberately' principle demands."}
**Alternatives considered:** Electric blue — rejected, too tech/corporate for architectural brand. Deep orange — rejected, too warm and casual.

---

### Decision: Text contrast approach

**Choice:** `--text: #______` ({ratio}:1 on canvas) / `--text-muted: #______` ({ratio}:1)
**Reference:** `_ref-captures/{domain}/frame-{NNN}.png`
**Extracted signal:** "{e.g., 'Frame 002 uses near-white #F2F2F2 rather than pure white for body text — softer against the dark canvas, reduces eye strain on long reads. Muted text at ~60% brightness handles labels and captions.'}"
**Intent:** {e.g., "Meets WCAG AAA (7:1) for primary text, AA (4.5:1) for muted. The slight warmth in the white prevents harshness."}
**Alternatives considered:** Pure white (#FFFFFF) — more contrast but harsher, creates too much tension.

---

## Typography Decisions

### Decision: Display font

**Choice:** `{Font Family}` (→ `--font-display`)
**Reference:** `_ref-captures/{domain}/frame-{NNN}.png`
**Extracted signal:** "{e.g., 'Frame 001 hero uses a high-contrast serif or geometric sans at very large size — the letters take up structural space, not just label space. The tight tracking at large sizes is deliberate.'}"
**Intent:** {e.g., "The display font IS the architecture. Headlines are structural elements, not labels — as per Visual Principle 3. Needs enough character to command space at 80-112px without decorative weight."}
**Alternatives considered:** {rejected options + reasons}

---

### Decision: Body font

**Choice:** `{Font Family}` (→ `--font-body`)
**Reference:** `_ref-captures/{domain}/frame-{NNN}.png`
**Extracted signal:** "{e.g., 'Frame 003 body text uses a humanist sans — readable at small sizes, neutral enough not to compete with the display font, but with enough personality to avoid being anonymous.'}"
**Intent:** {e.g., "Pairs with display font by providing clear contrast: geometric structure vs humanist curves. Body font disappears into readability — display font commands attention."}
**Alternatives considered:** {rejected options + reasons}

---

### Decision: Type scale anchoring

**Choice:** Base 16px, display range 80-112px, section headings 48px
**Reference:** `_ref-captures/{domain}/frame-{NNN}.png`
**Extracted signal:** "{e.g., 'Frames 001-003 show a dramatic scale contrast — hero text dwarfs everything else. Section headings are large but not hero-large. Body text is standard. The hierarchy is sharp.'}"
**Intent:** {e.g., "The large scale ratio (7:1 between body and hero) creates the dramatic visual hierarchy from the concept statement. 'Typography that commands space.'"}
**Alternatives considered:** Moderate scale (body 16 → display 48) — rejected, too conservative for the concept.

---

## Motion Decisions

### Decision: Brand easing

**Choice:** `cubic-bezier(_, _, _, _)` — "{character}"
**Reference:** `_ref-captures/{domain}/frame-{NNN}.png`
**Extracted signal:** "{e.g., 'Frame-to-frame comparison suggests fast acceleration into slow exit — elements arrive with intention and settle deliberately. Not a generic ease-out — the arrival is quicker than standard.'}"
**Intent:** {e.g., "The easing is the brand's 'gait' — how it moves through space. Should reinforce the Visual Principle of restraint: elements don't float or drift, they place themselves."}
**Alternatives considered:** `power3.out` (generic GSAP) — rejected, too standard. `back.out` — rejected, overshoot is playful, inconsistent with restraint principle.

---

### Decision: Animation vocabulary

**Choice:** Clip-path and transform-based reveals (no opacity-only fades)
**Reference:** `_ref-captures/{domain}/frame-{NNN}.png`
**Extracted signal:** "{e.g., 'Frames 004-006 show elements appearing to materialize from edges or surfaces — clip-path from 0 to 100% creating a wipe reveal. No fades — everything moves with spatial logic.'}"
**Intent:** {e.g., "Opacity-only fades feel like ghosts appearing. Clip-path reveals feel like curtains drawing back — physical, architectural. Aligns with the architectural studio brand."}
**Alternatives considered:** Standard fade-up (translateY + opacity) — rejected, generic, inconsistent with concept.

---

## Layout Decisions

### Decision: Overall grid approach

**Choice:** {e.g., 12-column grid, 80px gutters at 1440px, full-bleed sections with contained content}
**Reference:** `_ref-captures/{domain}/frame-{NNN}.png`
**Extracted signal:** "{e.g., 'Frame 003 shows content constrained within a column while the background bleeds edge-to-edge. The tension between contained content and atmospheric edges is deliberate.'}"
**Intent:** {e.g., "Content has a home (the contained column). Atmosphere has freedom (edge-to-edge). This division is structural, not decorative."}

---

### Decision: Whitespace approach

**Choice:** {e.g., Section padding: 128px top/bottom, generous even at mobile (64px min)}
**Reference:** `_ref-captures/{domain}/frame-{NNN}.png`
**Extracted signal:** "{e.g., 'Frame 002 shows extreme whitespace between sections — almost uncomfortable. This is intentional: space is a material, not a gap.'}"
**Intent:** {e.g., "Whitespace signals confidence. A brand that doesn't need to fill every pixel. Matches the restraint principle and the late-evening studio atmosphere."}

---

## Atmosphere Decisions

### Decision: WebGL preset

**Choice:** {Preset name}
**Reference:** `_ref-captures/{domain}/frame-{NNN}.png`
**Extracted signal:** "{e.g., 'Frame 001 shows a subtle particle system in the background — very low density, barely visible. The particles move slowly, creating a sense of air rather than digital noise.'}"
**Intent:** {e.g., "The atmosphere is the room the site lives in. Should be felt more than seen. Particle field at low density and speed creates 'air' — alive without being distracting."}
**Configuration chosen:** {density, speed, opacity values — these flow into design-tokens.md}

---

## Decisions Still Needed

<!-- Track any decisions that couldn't be made from reference analysis alone.
     These need human input before building begins. -->

- [ ] {Decision pending user input}
- [ ] {Decision pending user input}
