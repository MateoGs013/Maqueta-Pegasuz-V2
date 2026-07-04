---
type: rule
id: RULE-009
aliases: [RULE-009]
status: PROMOTED
validations: 3
source: user-training/coque
seeded: false
promoted-to: personality.json/voice.opinions
promoted-at: 2026-04-08
created: 2026-04-03
updated: 2026-07-04
tags: [rule, anti-ai]
---

Gradient placeholders en vez de imagenes reales = rechazo

Mapa: [[rules-map]]

## Evidence log
<!-- eros:append-below -->
- 2026-07-04 [decision-mateo] CORRECCIÓN: el pipeline ejecutable es media.md V2 (handoff + treat.mjs local), no Adobe. El Asset Tray de Studio automatiza el loop completo.
- 2026-07-04 [research/media] Por fin ejecutable: pipeline de assets reales (stock-first) elimina la necesidad de placeholders. Ver `.eros/workflows/media.md`.
