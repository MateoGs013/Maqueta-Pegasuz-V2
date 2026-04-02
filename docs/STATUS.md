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
- New projects now have a concrete initializer (`scripts/init-project.mjs`) that copies scaffold, carries libraries, and emits the hybrid contract natively from parsed brief data.
- New projects now emit structured seed selection in `.brain/blueprints/selection.json` through the automatic blueprint selector.
- The panel bridge is active, but legacy projects still arrive with heuristic scores until they emit `DESIGN.md` and `.brain/*.json`.
- Blueprint coverage exists, and the automatic selector is now active, but mutation scoring and repetition history are still in progress.
- Multimodal critic integration is specified in the schema, but not yet wired into the execution loop.
- Some legacy docs and compatibility surfaces still reflect older naming or orchestration assumptions.

## Next Execution Track

1. Wire observer + critic JSON into the runtime loop
2. Push `/project` beyond init so it also generates design-brief context automatically
3. Add mutation scoring and repetition history on top of the selector
4. Close remaining legacy naming and compatibility drift
