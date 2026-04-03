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

Dual-panel system running on a single Vite server with route-based separation:

#### Eros (`/eros/*`)

Autonomous quality observability over a generated runtime cache:

- Resumen — scores, health index, queue, timeline
- Calidad — observer signals/gates, critic notes, debt breakdown, section analysis
- Componentes — blueprint browser with iframe preview and viewport switcher
- Sistema — run history, memory techniques, font validations, promoted rules

Data flows through `vite-plugin-eros.js` (SSE live sync from `runs.generated.json`).

#### Workshop (`/workshop/*`)

Local ABM editor for tokens and components:

- Token Editor — visual editing of `tokens.css` (color pickers, sliders, clamp sub-inputs, palette overview, JSON import/export)
- Component Editor — prop editing with live postMessage preview, create/duplicate/delete, viewport switcher
- Staging — in-memory drafts, DiffViewer modal with selective apply, localStorage persistence, automatic disk backups

Data flows through `vite-plugin-workshop.js` (REST endpoints for read/write/list/create/delete).

State isolation: Eros code never loads on Workshop routes and vice versa (code splitting via lazy imports).

### `_components-preview/`

Deprecated sandbox. Preview belongs inside `panel` via `?preview=ComponentName`.

## Known Gaps

- The front-brain runtime contract exists in scaffold and schema, but live project generation still needs to emit every artifact consistently.
- Legacy projects still arrive with heuristic scores until they emit `DESIGN.md` and `.brain/*.json`.
- Blueprint mutation scoring and repetition history are still in progress.
- Workshop undo/redo is not yet implemented.
- Workshop does not yet detect external file changes (e.g. if another tool edits `tokens.css` while Workshop has it staged).

## Next Execution Track

1. Browser-test the full Workshop flow (token editing, component CRUD, staging apply)
2. Add mutation scoring and repetition history on top of the blueprint selector
3. Expand multimodal critic coverage and feed real screenshot history into the panel
4. Workshop: undo/redo, theme presets, backup browser UI
5. Close remaining legacy naming and compatibility drift
