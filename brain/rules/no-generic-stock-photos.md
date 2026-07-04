---
type: rule
id: RULE-006
aliases: [RULE-006]
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

Nunca usar stock photos genericos de Unsplash

Mapa: [[rules-map]]

## Evidence log
<!-- eros:append-below -->
- 2026-07-04 [decision-mateo] CORRECCIÓN: Adobe (Stock incluido) descartado por completo por Mateo. La solución positiva vigente es el pipeline handoff V2: prompt pack → generación gratuita → treat.mjs local. La entrada anterior sobre Adobe Stock queda sin efecto.
- 2026-07-04 [research/media] Ahora tiene solución positiva: Adobe Stock + cadena de grade/grain vía MCP (ver [[media-pipeline]] workflow). La foto real tratada ES la alternativa al stock genérico.
