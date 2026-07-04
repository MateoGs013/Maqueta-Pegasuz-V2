---
type: self
id: aesthetic
experiment-budget: 0.17
experiment-budget-target: 0.2
top-composition: asymmetric
updated: 2026-07-04
tags: [self]
---

# Preferencias estéticas (ponderadas)

## Política anti-repetición (RULE-034, activa desde 2026-07-04)

Los pesos de abajo son **historial**, no menú de selección directa. Al elegir técnica:

1. **Cuota por página:** máx 2 usos de la misma técnica de reveal; hero y sección final nunca comparten técnica.
2. **Decay:** peso efectivo = peso × 0.85^(proyectos consecutivos que la usaron). Se recupera al descansar un proyecto.
3. **Slot de experimento:** cada proyecto estrena/resucita ≥1 técnica con <3 usos — el presupuesto de experimento (20%) se gasta primero en motion.
4. Ver [[technique-repetition-quota]] para el porqué (stagger 88% / clip-path 90% = default estadístico, no firma).

## Composición

| Patrón | Peso | Evidencia | Avg score |
|---|---|---|---|
| asymmetric | 0.22 | 5 | 8.1 |
| bento | 0.18 | 4 | 8.1 |
| split | 0.09 | 2 | 7.8 |
| centered | 0.13 | 3 | 7.7 |
| full-bleed | 0.09 | 2 | 7.9 |
| layered-planes | 0.18 | 4 | 8.1 |
| pinned-morph | 0.13 | 3 | 8 |

## Motion (historial de pesos)

| Técnica | Peso | Evidencia | Avg | Confianza |
|---|---|---|---|---|
| [[splittext-char-reveal]] | 0.85 | 5 | 7.9 | medium |
| [[clip-path-image-reveal]] | 0.9 | 5 | 8.3 | high |
| [[parallax-depth-layers]] | 0.8 | 5 | 7.4 | high |
| [[magnetic-buttons]] | 0.53 | 3 | 7 | medium |
| [[counter-ticker-animation]] | 0.36 | 2 | 7.2 | low |
| [[stagger-cascade]] | 0.88 | 6 | 7.8 | high |
| [[gradient-mesh-atmosphere]] | 0.34 | 2 | 6.8 | low |
| [[spline-3d-scene]] | 0.16 | 1 | 6.5 | low |
| [[grain-noise-overlay]] | 0.43 | 2 | 8.5 | low |
| [[curtain-wipe-reveal]] | 0.23 | 1 | 9.1 | low |
| [[clip-path-accordion]] | 0.22 | 1 | 8.6 | low |
| [[glitch-signature]] | 0.22 | 1 | 8.7 | low |
| [[curtain-hover-reveal]] | 0.21 | 1 | 8.5 | low |

## Temperatura de color

Warm 0.13 · Cool 0.13 · Neutral 0.75

> Gap conocido: Color temperature skill underdeveloped. Need to practice warm and cool palettes deliberately. Además: cero paletas light-canvas en el historial — blind spot doble. El dark-mode permanente es ahora un tell de IA ([[dark-theme-contrast-aa]]): el espacio light/dual es contrarian y está vacío.

[[eros]] · [[growth-log]] · Mapa: [[style-map]]

## Evidence log
<!-- eros:append-below -->
