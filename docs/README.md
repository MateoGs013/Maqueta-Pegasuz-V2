# Eros — Documentation

AI entry point for `docs/`. Everything human-readable about how this repo works lives here. Canonical orchestration contracts live at the repo root (`EROS.md`, `AGENTS.md`) and in `.eros/`.

## Structure

| Directory | What lives here |
|-----------|----------------|
| [`plans/`](./plans/) | Active, in-progress implementation plans |
| [`specs/`](./specs/) | Formal design specs — permanent record of architectural decisions |
| [`references/`](./references/) | Reusable briefs, aesthetic guides, upgrade prompts |
| [`_libraries/`](./_libraries/) | Pattern libraries copied to new projects (template source — keep the underscore) |
| [`archive/`](./archive/) | Completed plans and deprecated proposals |

## Pinned

- [`STATUS.md`](./STATUS.md) — current repo snapshot (architecture notes, migration state)

## For AI agents

1. Starting a new project? Read `EROS.md` + `AGENTS.md` at the repo root.
2. Looking for what's being built right now? Go to [`plans/README.md`](./plans/README.md).
3. Need context on a past architectural decision? Read the matching spec in [`specs/`](./specs/).
4. Something looks historical but lives at `docs/` root? It's a bug — report it. Everything completed should be in `archive/`.

## Conventions

- **kebab-case-lowercase** for files and directories.
- **Underscore prefix** (`_libraries/`, `_project-scaffold/`, `_components/`) encodes "template source, copied to new projects". Do not rename.
- **Status is visible in the directory tree** — an `in-progress` plan lives in `plans/`, not `archive/`. If a plan is done, move it.
- Every subdir has a `README.md` — if you create a new subdir, add one.

## Validation

`node .eros/scripts/eros-doctor.mjs` enforces:
- `docs/README.md` exists
- No `PLAN-*.md` in `docs/` root (legacy ALL-CAPS pattern banned)
- No image files (`.png`, `.jpg`, `.webp`, `.gif`) in `docs/` — those belong in `.eros/memory/observations/`
