# Repo Status

## Canonical Source of Truth

The canonical architecture lives in `.claude/`.

- pipeline
- brain config
- agent contracts
- memory
- front-brain schema

`AGENTS.md` and `.agents/` are compatibility surfaces for Codex. They are not the canonical architecture namespace.

## Product Surfaces

### `_project-scaffold/`

Runtime base for generated projects.

### `_components/`

Curated seed library. These are creative anchors with minimum quality contracts, not rigid production blocks.

### `panel/`

Structured backoffice over a generated runtime cache. It now exposes:

- runs
- blueprints
- design DNA
- observer
- visual debt
- decisions

### `_components-preview/`

Deprecated sandbox. Preview belongs inside `panel`.

## Known Gaps

- The front-brain runtime contract exists in scaffold and schema, but live project generation still needs to emit every artifact consistently.
- New projects now have a concrete bootstrap step (`scripts/bootstrap-front-brain.mjs`) to emit the hybrid contract natively from parsed brief data.
- The panel bridge is active, but legacy projects still arrive with heuristic scores until they emit `DESIGN.md` and `.brain/*.json`.
- Blueprint coverage exists, but the automatic selector and mutation scoring loop are still in progress.
- Multimodal critic integration is specified in the schema, but not yet wired into the execution loop.
- Some legacy docs and compatibility surfaces still reflect older naming or orchestration assumptions.

## Next Execution Track

1. Wire `/project` execution to call the bootstrap step end-to-end without manual intervention
2. Build the automatic seed selector and mutation scorer
3. Wire observer + critic JSON into the runtime loop
4. Close remaining legacy naming and compatibility drift
