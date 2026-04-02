# Front-Brain Roadmap

Execution roadmap for moving Maqueta toward a Stitch-like autonomous frontend brain.

## Current baseline

- `.claude/` is the canonical architecture namespace.
- `_project-scaffold/` ships the hybrid front-brain contract.
- `_components/blueprints.manifest.js` exposes structured seed metadata plus contract aliases.
- `panel/` is now a working backoffice over the demo-run fixture:
  - Runs
  - Blueprints
  - Design DNA
  - Observer
  - Visual Debt
  - Decisions
- `_components-preview/` remains only as deprecated compatibility sandbox.

## Next execution tracks

### 1. Brain / core

- Generate `DESIGN.md` automatically from prompt intake.
- Write live project artifacts in the hybrid `.md` + `.json` schema.
- Promote observer + critic + scorecard into the main approval loop.
- Persist reusable learnings into `.claude/memory/design-intelligence/`.

### 2. Seed selection

- Build an automatic selector that filters by brief, `DESIGN.md`, banned patterns, and repetition.
- Score candidate hero/nav directions before the builder starts.
- Track mutation budgets and seed-family repetition across runs.

### 3. Backoffice

- Replace fixture-only panel loading with a runtime cache generated from real projects.
- Add run history, screenshots, and section-level comparisons.
- Surface visual debt trends and repeated failure modes across projects.

### 4. Quality loop

- Connect real observer output at 375, 768, 1280, and 1440.
- Wire multimodal critic results into structured JSON.
- Auto-retry until threshold or hard flag conditions are met.

## Acceptance targets

- Prompt-only flow produces `DESIGN.md`, three directions, selected seed pair, homepage, observer pass, critic pass, and review summary.
- No repeated generic hero/nav families when the manifest provides stronger alternatives.
- Panel reads JSON as primary state and Markdown only as narrative context.
- Panel can ingest both modern hybrid runs and legacy markdown-only runs through the runtime bridge.
