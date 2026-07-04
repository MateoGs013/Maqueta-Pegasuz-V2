---
name: media
description: >
  Real media pipeline V2 (no Adobe, no paid APIs): Eros writes prompt packs and
  says WHERE to generate (free tools), Mateo drops files in _inbox/, local
  treatment via scripts/media/treat.mjs (grade + grain + editorial crop),
  vault asset registry. Kills gradient placeholders (RULE-009).
triggers:
  - "assets"
  - "media"
  - "imagen"
  - "imagenes"
  - "images"
  - "photo"
  - "foto"
  - "prompt pack"
  - "generar imagen"
  - "design/assets"
---

See `.eros/workflows/media.md` for the canonical workflow content.

This stub exists so Claude's `Skill("media")` tool can invoke the workflow. The full content lives in the AI-neutral `.eros/workflows/` directory.
