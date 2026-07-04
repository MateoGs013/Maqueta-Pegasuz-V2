---
type: lesson
id: LES-2026-04-07-2
severity: warning
phase: quality
project: "[[pegasuz-website-v2]]"
prevention-adopted: true
created: 2026-04-07
tags: [lesson, pipeline]
---

## Problema
Observer detects grain via class name or CSS rule containing noise/grain + url(), inline SVG data URIs without those keywords dont match

## Resolución
Used explicit .site-grain class on a dedicated div in SiteShell and wrote CSS selector .site-grain with a data URI whose filter id is noise

## Prevención
When adding grain overlays in future projects, name the element site-grain/noise-layer so observer detects it

Mapa: [[lessons-map]]

## Evidence log
<!-- eros:append-below -->
