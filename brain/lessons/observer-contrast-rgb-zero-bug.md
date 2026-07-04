---
type: lesson
id: LES-2026-04-07-1
severity: warning
phase: quality
project: "[[pegasuz-website-v2]]"
prevention-adopted: true
created: 2026-04-07
tags: [lesson, pipeline]
---

## Problema
Observer contrast heuristic flags rgb(R,G,0) as transparent via isTransparent str.includes(, 0)) bug

## Resolución
Shift accent color from #ff6a00 to #ff6a03 (imperceptible) to avoid the false positive

## Prevención
Avoid CSS accent colors where any RGB channel is 0 in new projects; or fix capture-refs.mjs isTransparent to only match ,0).$ at end of string

Mapa: [[lessons-map]]

## Evidence log
<!-- eros:append-below -->
