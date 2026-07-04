<!-- generated: do not hand-edit. Regenerate: node scripts/memory/vault.mjs regen-start -->

# START — Eros brain entry point

Soy Eros. Mi identidad completa: [[eros]] · mis preferencias estéticas y política anti-repetición: [[aesthetic]] · mi historia: [[growth-log]].

**Estado:** Post-evolución Fable 2026-07-04. Cerebro migrado a vault. Reglas anti-IA actualizadas a H2-2026. Pipeline de medios reales definido. · proyectos lifetime: 19 · notas: 33 reglas, 13 técnicas, 17 proyectos.

## Reglas PROMOTED — obedecer siempre

- **RULE-007** [[curtain-reveal-timing]] — Curtain reveals must use cubic-bezier(0.77,0,0.175,1) and stay under 600ms for scroll-triggered reveals. Portfolio/hover reveals may extend to 1000ms with justification.
- **RULE-011** [[depth-layers-in-features]] — Always add depth layers to feature sections
- **RULE-010** [[differentiated-hover-per-section]] — Cada seccion necesita un hover state diferenciado
- **RULE-019** [[fingerprint-fonts-2026h2]] — Ningún font-family del set fingerprint 2026-H2: Inter, Geist, Space Grotesk, Instrument Serif, Poppins, Satoshi, DM Sans, Plus Jakarta Sans, Outfit, Sora, General Sans, Bricolage Grotesque, Figtree, Onest.
- **RULE-033** [[krebs-slop-gate]] — Gate de QA duro: el output de Eros debe puntuar 0–1 patrones en la checklist determinista de 16 patrones de Krebs (bucket "clean", 46% de Show HN).
- **RULE-024** [[no-cream-amber-default]] — El cream/beige "cálido y de buen gusto" + acento ámbar es el nuevo violeta ("the em-dash of design"). También vetado: emerald "seguro" sobre near-black como escape predecible.
- **RULE-002** [[no-fingerprint-fonts]] — Inter/Roboto = AI fingerprint fonts
- **RULE-006** [[no-generic-stock-photos]] — Nunca usar stock photos genericos de Unsplash
- **RULE-009** [[no-gradient-placeholders]] — Gradient placeholders en vez de imagenes reales = rechazo
- **RULE-001** [[no-purple-gradients]] — Purple gradients = instant AI fingerprint
- **RULE-003** [[no-symmetric-1fr-grids]] — 1fr 1fr grids look template-like
- **RULE-004** [[no-uniform-section-padding]] — Uniform padding across sections = AI tell
- **RULE-034** [[technique-repetition-quota]] — Anti-auto-clonación: máx 2 usos de la misma técnica de reveal por página; hero y sección final nunca comparten técnica; el peso efectivo de una técnica decae 15% por proyecto consecutivo que la usa; cada proyecto estrena o resucita ≥1 técnica con <3 usos (el presupuesto de experimento se gasta primero en motion).

## Top técnicas (por score)

- [[curtain-wipe-reveal]] — avg 9.1 · 1 usos · low
- [[glitch-signature]] — avg 8.7 · 1 usos · low
- [[clip-path-accordion]] — avg 8.6 · 1 usos · low
- [[curtain-hover-reveal]] — avg 8.5 · 1 usos · low
- [[grain-noise-overlay]] — avg 8.5 · 2 usos · low

> Anti-repetición activa: máx 2 usos de la misma técnica de reveal por página; decay 15% por proyecto consecutivo. Detalle en [[aesthetic]].

## Últimas lecciones

- [[observer-contrast-rgb-zero-bug]] (warning, [[pegasuz-website-v2]])
- [[observer-grain-detection-naming]] (warning, [[pegasuz-website-v2]])
- [[builder-generic-hero-syndrome]] (critical, [[forge-studio]])

## Cómo consultar el resto (no hagas bulk-read)

- Reglas candidatas (19): `Grep "^status: CANDIDATE" brain/rules/ -l`
- Técnica puntual: `brain/techniques/<slug>.md` · Proyecto: `brain/projects/<slug>.md`
- Hubs de navegación: [[rules-map]] · [[techniques-map]] · [[projects-map]] · [[style-map]] · [[lessons-map]]

## Cómo escribir (protocolo obligatorio)

- Nota nueva: `node scripts/memory/vault.mjs new <type> <slug> --set key=value --body "..."`
- Evidencia: `node scripts/memory/vault.mjs append <slug> "- YYYY-MM-DD [proyecto] hallazgo"`
- Campo: `node scripts/memory/vault.mjs set-field <slug> validations 4`
- NUNCA edites prosa arriba del marker `<!-- eros:append-below -->` — es territorio de Mateo.
- Al cerrar sesión de trabajo: `node scripts/memory/vault.mjs regen-start`
