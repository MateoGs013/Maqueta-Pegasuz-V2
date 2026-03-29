# {Project Name} — Motion Spec

## Brand Easing
`cubic-bezier(_, _, _, _)` — "{character description}"

## Durations
| Speed | Value | Usage |
|-------|-------|-------|
| Fast | 0.3s | Hovers, micro-interactions |
| Medium | 0.6s | Reveals, state changes |
| Slow | 1.2s | Hero entrances, dramatic moments |

## Per-Section Choreography

| # | Section | Technique | Description |
|---|---------|-----------|-------------|
<!-- One row per section. Technique from _libraries/motion-categories.md -->
<!-- RULE: No consecutive sections share the same technique -->

## Preloader
**Sequence:** {step-by-step: logo appears → text reveals → wipe transition → first section}
**Duration:** {total time}

## Page Transitions
**Type:** {fade | slide | clip | morph}
**Exit:** {what happens on leave}
**Enter:** {what happens on enter}
**Duration:** {time}

## Scroll-Linked Effects
<!-- Elements that animate continuously with scroll, not triggered -->
| Element | Effect | Range |
|---------|--------|-------|
<!-- e.g., "Atmosphere canvas" | "Density increases" | "0-100% scroll" -->

## Hover States
| Element | Effect |
|---------|--------|
| Buttons | {scale, color shift, etc.} |
| Cards | {lift, shadow, border glow, etc.} |
| Links | {underline reveal, color, etc.} |
| Images | {zoom, overlay, etc.} |

## Reduced Motion
When `prefers-reduced-motion: reduce`:
- All scroll reveals: instant (opacity 1, no movement)
- Page transitions: simple crossfade (0.2s)
- Hover states: color change only (no transforms)
- Atmosphere: CSS fallback (no canvas)
- Preloader: simplified (fade in → fade out)
