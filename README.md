# Maqueta

Claude-first front-brain template for generating modern Vue 3 frontends with:

- a curated seed library for non-generic heroes and navs
- a hybrid `.brain` contract (`.md` + `.json`)
- a dual-panel system: **Eros** (autonomous quality) + **Workshop** (local ABM editor)
- an observer-driven quality loop aimed at autonomous delivery

## Current Positioning

This repository is not a single product runtime. It is the source template for a larger system:

- `.claude/` is the canonical source of truth for brain rules, pipeline, agents, memory, and front-brain contracts.
- `_project-scaffold/` is the starter copied into each generated project.
- `_components/` is the curated seed library the LLM uses as creative anchors.
- `panel/` hosts two isolated panels: Eros (observability) and Workshop (ABM editor).
- `_components-preview/` is deprecated. Preview now belongs inside `panel`.

## Canonical Docs

- [Repo status](./docs/STATUS.md)
- [Front-Brain schema](./.claude/FRONT_BRAIN_SCHEMA.md)
- [Front-Brain workspace](./.claude/front-brain/README.md)
- [Front-Brain roadmap](./.claude/front-brain/ROADMAP.md)
- [Pipeline](./.claude/pipeline.md)
- [Brain config](./.claude/brain-config.md)

## Runtime Layers

### 1. Brain core

Lives in `.claude/`. It defines:

- orchestration rules
- memory model
- quality gates
- front-brain artifacts such as `DESIGN.md`, `.brain/state.json`, `.brain/control/rules.json`

### 2. Project scaffold

Lives in `_project-scaffold/`. It provides:

- Vue 3 + Vite starter
- starter `.brain/` files
- starter `DESIGN.md`
- base routing and token wiring

### 3. Seeds

Lives in `_components/`. Seeds are not rigid templates and not final assemblies. They are:

- curated visual anchors
- minimum quality contracts
- non-generic starting points the LLM can mutate without collapsing into basic heroes/navs

### 4. Panel (dual architecture)

Lives in `panel/`. Single Vite server, route-based separation, lazy-loaded — no state contamination.

#### Eros (`/eros/*`)

Autonomous quality observability:

- **Resumen** — score, health, queue, timeline
- **Calidad** — observer signals, critic notes, debt breakdown
- **Componentes** — blueprint browser with iframe preview
- **Sistema** — run history, memory techniques, fonts, rules

Data source: `runs.generated.json` via SSE live sync (`vite-plugin-eros.js`).

#### Workshop (`/workshop/*`)

Local ABM editor (personal Stitch-like tool):

- **Token Editor** — visual editing of `_components/tokens.css` with color pickers, sliders, clamp sub-inputs, palette overview, import/export JSON
- **Component Editor** — browse heroes/navs, edit props with live preview, create/duplicate/delete components
- **Staging Layer** — in-memory drafts, diff viewer with selective apply, localStorage persistence, automatic backups

Data source: `/__workshop/*` REST endpoints (`vite-plugin-workshop.js`).

A floating pill at top-right switches between panels. Keyboard shortcuts: `1/2/3` for nav, `Ctrl+S` to review changes.

## Development Notes

### Canonical namespace

Use `.claude/` as the source of truth.

- `AGENTS.md` and `.agents/` exist for Codex compatibility.
- Do not create competing canonical docs under `.Codex/`.

### Preview strategy

- `panel` owns preview mode via `?preview=ComponentName`.
- Workshop uses the same mechanism for live token/prop editing via CSS injection and `postMessage`.
- `_components-preview/` is retained only as deprecated sandbox compatibility.

### Build commands

#### Panel

```bash
cd panel
npm run dev        # dev server on :4000 (syncs runs first)
npm run build      # production build (syncs runs first)
```

#### Scaffold

```bash
cd _project-scaffold
npm run build
```

#### Scripts

```bash
# Create a new project from template
cd scripts && npm run init:project -- --brief-file ".\\examples\\front-brain-brief.example.json"

# Bootstrap brain contract on existing project
npm run bootstrap:brain -- --project "C:\\Users\\mateo\\Desktop\\my-project"

# Rerun seed selection
npm run select:blueprints -- --project "C:\\Users\\mateo\\Desktop\\my-project"

# Refresh quality artifacts (observer, critic, scorecard, debt)
npm run refresh:quality -- --project "C:\\Users\\mateo\\Desktop\\my-project"

# Sync front-brain runs (with --watch for live panel updates)
npm run sync:runs
```

### Environment variables

- `OPENAI_API_KEY` — enables multimodal critic mode
- `OPENAI_PROJECT_ID`, `OPENAI_ORGANIZATION_ID` — optional
- `OPENAI_QUALITY_MODEL` — defaults to `gpt-5-mini`

## Near-Term Objective

Maqueta is moving toward a Stitch-like workflow:

1. prompt-only brief intake
2. `DESIGN.md` generation
3. multiple visual directions
4. seed selection with mutation budgets
5. homepage generation
6. observer-driven scorecard refresh and critic retries
7. Workshop-based token/component editing with staged apply
8. final review summary with no mandatory human intervention

Execution details now live in `.claude/front-brain/ROADMAP.md`.
