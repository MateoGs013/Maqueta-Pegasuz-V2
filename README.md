# Maqueta

Claude-first front-brain template for generating modern Vue 3 frontends with:

- a curated seed library for non-generic heroes and navs
- a hybrid `.brain` contract (`.md` + `.json`)
- an internal backoffice panel for observability
- an observer-driven quality loop aimed at autonomous delivery

## Current Positioning

This repository is not a single product runtime. It is the source template for a larger system:

- `.claude/` is the canonical source of truth for brain rules, pipeline, agents, memory, and front-brain contracts.
- `_project-scaffold/` is the starter copied into each generated project.
- `_components/` is the curated seed library the LLM uses as creative anchors.
- `panel/` is the internal backoffice for runs, seeds, design DNA, observer output, visual debt, and decisions.
- `_components-preview/` is deprecated. Preview now belongs inside `panel`.

## Canonical Docs

- [Repo status](./docs/STATUS.md)
- [Front-Brain schema](./.claude/FRONT_BRAIN_SCHEMA.md)
- [Front-Brain workspace](./.claude/front-brain/README.md)
- [Front-Brain roadmap](./.claude/front-brain/ROADMAP.md)
- [Pipeline](./.claude/pipeline.md)
- [Brain config](./.claude/brain-config.md)

The implementation contract in `.claude/FRONT_BRAIN_SCHEMA.md` is derived from the conceptual base in `BRAIN_FRONTEND_LOGICO.md`.

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

### 4. Backoffice

Lives in `panel/`. It is the operator surface for:

- run state
- blueprint metadata
- Design DNA
- observer metrics
- visual debt
- decisions and learnings

The panel now reads a generated runtime cache in `.claude/front-brain/runtime/runs.generated.json`.
That cache is produced by `scripts/sync-front-brain-runs.mjs`, which bridges:

- modern hybrid projects with `DESIGN.md` + `.brain/*.json`
- legacy markdown-only `.brain/` projects through a fallback normalization layer
- the canonical `demo-run` fixture

## Development Notes

### Canonical namespace

Use `.claude/` as the source of truth.

- `AGENTS.md` and `.agents/` exist for Codex compatibility.
- Do not create competing canonical docs under `.Codex/`.

### Preview strategy

- `panel` owns preview mode via `?preview=ComponentName`.
- `_components-preview/` is retained only as deprecated sandbox compatibility.

### Build commands

#### Scaffold

```bash
cd _project-scaffold
npm run build
```

#### Panel

```bash
cd panel
npm run build
```

`panel` build automatically runs the runtime sync first.

To bootstrap a new project into the hybrid front-brain contract without waiting for later migration:

```bash
cd scripts
npm run bootstrap:brain -- --project "C:\\Users\\mateo\\Desktop\\my-project" --brief-file ".\\examples\\front-brain-brief.example.json"
```

That command emits `DESIGN.md`, `.brain/state.json`, `.brain/metrics.json`, `.brain/queue.json`, `.brain/control/rules.json`, quality placeholders, and the first review summary.

To create a brand-new project end-to-end from the template:

```bash
cd scripts
npm run init:project -- --brief-file ".\\examples\\front-brain-brief.example.json"
```

This creates `Desktop\\{slug}`, copies `_project-scaffold`, copies `docs/_libraries`, bootstraps the hybrid front-brain contract, and runs `npm install` unless `--skip-install` is passed.

The init flow now also emits `.brain/blueprints/selection.json`, which contains three scored direction candidates plus the chosen hero/nav pair.

If you need to rerun only seed selection on an existing project:

```bash
cd scripts
npm run select:blueprints -- --project "C:\\Users\\mateo\\Desktop\\my-project"
```

If you need to promote the latest observer output into structured quality artifacts for the brain and panel:

```bash
cd scripts
npm run refresh:quality -- --project "C:\\Users\\mateo\\Desktop\\my-project"
```

That command rewrites `.brain/reports/quality/observer.json`, `.brain/reports/quality/critic.json`, `.brain/reports/quality/scorecard.json`, `.brain/reports/visual-debt.json`, `.brain/metrics.json`, and `REVIEW-SUMMARY.md`.

## Near-Term Objective

Maqueta is moving toward a Stitch-like workflow:

1. prompt-only brief intake
2. `DESIGN.md` generation
3. multiple visual directions
4. seed selection with mutation budgets
5. homepage generation
6. observer-driven scorecard refresh and critic retries
7. final review summary with no mandatory human intervention

Execution details now live in `.claude/front-brain/ROADMAP.md`.
