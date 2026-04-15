# Docs Restructure — AI-Friendly Architecture Design

> **Status:** `draft` · pending user approval
> **Date:** 2026-04-14
> **Scope:** `docs/` directory only — orchestration (`.eros/`, `.claude/`, `.gemini/`, `.codex/`) untouched

## Goal

Restructure `docs/` from a flat 15-file root with mixed naming conventions into a hierarchical AI-friendly information architecture where **status is visible in the directory tree**, every subdir has a `README.md` entry point, and deprecated content is archived instead of lingering alongside active work.

## Context

The multi-AI refactor (PR #6, merge `afef3b5`) established the canonical brain at `.eros/`. `docs/` was explicitly out of scope and today has:

- **15 files in root** with no hierarchy — AI agents must scan all of them to orient
- **Two naming conventions** coexist: `PLAN-FOO.md` (root, ALL-CAPS) vs `2026-04-14-foo-design.md` (superpowers/, date-prefixed)
- **No lifecycle** — 4 completed plans (`implemented`), 4 active plans (`in-progress`), and aspirational proposals (`eros-v9-proposal.md` at 77KB) live at the same level
- **4MB of screenshots** in `panel-observer-2026-04-14*/` polluting docs — these are observations, not docs
- **Legacy `WORKFLOW-EROS.md`** describes V7 but V8 has been `implemented` per `PLANS-STATUS.md`
- **Monoliths hostile to AI**: `pegasuz-superadmin-ux-ultra-plan-v2.md` (145KB) — unreadable in one context window
- **`docs/superpowers/` scoped narrow** — only brainstorming outputs live there; rest of repo doesn't use that path

An AI agent landing in `docs/` cannot answer "what's active, what's done, where do I look for X?" without reading 20+ files.

## Architecture

### Target structure

```
docs/
├── README.md                 # AI entry point — "what lives here and why"
├── STATUS.md                 # pinned: current repo state snapshot
│
├── plans/                    # ONLY active (in-progress) plans
│   ├── README.md            # status table of active plans
│   ├── hardening-audit.md
│   ├── observer-v2.md
│   ├── observer-v3.md
│   └── vercel-deploy.md
│
├── specs/                    # formal design specs (permanent record)
│   ├── 2026-04-14-multi-ai-architecture.md
│   └── 2026-04-14-docs-restructure.md          # this file (post-approval)
│
├── references/               # reusable briefs, aesthetic guides, upgrade prompts
│   ├── eros-panel-aesthetic-brief.md
│   ├── observer-upgrade-prompt.md
│   └── reference-analysis-fluid-glass.md
│
├── libraries/                # pattern libraries (renamed from _libraries/)
│   └── ... (unchanged content)
│
└── archive/                  # completed + deprecated
    ├── README.md            # "Why archive exists + how to read it"
    ├── plans/               # 4 implemented plans + the executed multi-ai plan
    ├── proposals/           # eros-v9, workflow-v7, pegasuz-* (4 files)
    └── ux-reform/           # historical observer-phase captures
```

### Moves OUT of `docs/`

- `docs/panel-observer-2026-04-14/` → `.eros/memory/observations/panel/2026-04-14/`
- `docs/panel-observer-2026-04-14-after/` → `.eros/memory/observations/panel/2026-04-14-after/`

Rationale: these are **observations** (panel state captures), not **docs** (human-readable prose about the system). `.eros/memory/` is the canonical home for observations.

### Design principles

1. **Status as directory hierarchy** — `plans/` vs `archive/plans/` is visible via `ls`. No need to open each file and parse a `Status:` frontmatter tag.
2. **README.md at every subdir** — AI orientation in ≤30s from any level.
3. **One naming convention**: kebab-case lowercase everywhere. Drop ALL-CAPS, drop `PLAN-` prefix (the directory already tells you it's a plan), drop `_libraries` underscore.
4. **Cross-ref integrity**: audit all external references BEFORE moves; update in the same commit as the move.
5. **Enforcement via eros-doctor**: 3 new rules prevent drift (see below).

## File mapping

### Active plans → `docs/plans/`

| From | To | Why |
|------|-----|-----|
| `docs/PLAN-HARDENING-AUDIT.md` | `docs/plans/hardening-audit.md` | Status: `in-progress` |
| `docs/PLAN-OBSERVER-V2.md` | `docs/plans/observer-v2.md` | Status: `in-progress` |
| `docs/PLAN-OBSERVER-V3.md` | `docs/plans/observer-v3.md` | Status: (V3 extends V2, still active) |
| `docs/PLAN-VERCEL-DEPLOY.md` | `docs/plans/vercel-deploy.md` | Status: `in-progress` |

### Completed plans → `docs/archive/plans/`

| From | To | Why |
|------|-----|-----|
| `docs/PLAN-AUTO-TRAIN-V2.md` | `docs/archive/plans/auto-train-v2.md` | Status: `implemented` |
| `docs/PLAN-EROS-ALIVE.md` | `docs/archive/plans/eros-alive.md` | Status: `implemented` |
| `docs/PLAN-EROS-V8.md` | `docs/archive/plans/eros-v8.md` | Status: `implemented` |
| `docs/PLAN-TRAINING-DASHBOARD.md` | `docs/archive/plans/training-dashboard.md` | Status: `implemented` |
| `docs/superpowers/plans/2026-04-14-multi-ai-architecture.md` | `docs/archive/plans/2026-04-14-multi-ai-architecture.md` | Executed via PR #6 |

### Specs → `docs/specs/`

| From | To | Why |
|------|-----|-----|
| `docs/superpowers/specs/2026-04-14-multi-ai-architecture-design.md` | `docs/specs/2026-04-14-multi-ai-architecture.md` | Permanent design record |

### Proposals/deprecated → `docs/archive/proposals/`

| From | To | Why |
|------|-----|-----|
| `docs/eros-v9-proposal.md` | `docs/archive/proposals/eros-v9-proposal.md` | Aspirational, not committed |
| `docs/WORKFLOW-EROS.md` | `docs/archive/proposals/workflow-eros-v7.md` | V7 workflow (V8 is current) |
| `docs/pegasuz-admin-ux-audit-brief.md` | `docs/archive/proposals/pegasuz-admin-ux-audit-brief.md` | External product |
| `docs/pegasuz-superadmin-reskin-plan.md` | `docs/archive/proposals/pegasuz-superadmin-reskin-plan.md` | External product |
| `docs/pegasuz-superadmin-ux-ultra-plan.md` | `docs/archive/proposals/pegasuz-superadmin-ux-ultra-plan.md` | External product, superseded |
| `docs/pegasuz-superadmin-ux-ultra-plan-v2.md` | `docs/archive/proposals/pegasuz-superadmin-ux-ultra-plan-v2.md` | External product |

### References → `docs/references/`

| From | To | Why |
|------|-----|-----|
| `docs/eros-panel-aesthetic-brief.md` | `docs/references/eros-panel-aesthetic-brief.md` | Reusable aesthetic brief |
| `docs/observer-upgrade-prompt.md` | `docs/references/observer-upgrade-prompt.md` | Reusable prompt |
| `docs/reference-analysis-fluid-glass.md` | `docs/references/reference-analysis-fluid-glass.md` | Reusable analysis |

### Renames

| From | To | Why |
|------|-----|-----|
| `docs/_libraries/` | `docs/libraries/` | Drop underscore — not a private convention |
| `docs/ux-reform/` | `docs/archive/ux-reform/` | Historical observer phases |

### Out of `docs/`

| From | To |
|------|-----|
| `docs/panel-observer-2026-04-14/` | `.eros/memory/observations/panel/2026-04-14/` |
| `docs/panel-observer-2026-04-14-after/` | `.eros/memory/observations/panel/2026-04-14-after/` |

### Deletions

- `docs/superpowers/` (empty after moves)
- `docs/PLANS-STATUS.md` — content absorbed into `docs/plans/README.md` (active table) and each plan's own header (historical detail)

### Preserved unchanged

- `docs/STATUS.md` (already updated post multi-AI refactor)

## Cross-reference strategy

Before any file moves:

1. **Audit** — grep entire repo (excluding `docs/**`) for:
   - `docs/PLAN-*` (any capitalization)
   - `docs/superpowers/`
   - `docs/_libraries/`
   - `docs/eros-v9-proposal`, `docs/pegasuz-*`, `docs/WORKFLOW-EROS`, etc.
   - `docs/panel-observer-*`

2. **Known external refs** (from prior audit):
   - `README.md` — references several docs files
   - `AGENTS.md` — links to `docs/superpowers/specs/...`
   - `.eros/pipeline.md`, `.eros/brain-config.md` — may reference plans
   - `.eros/agents/reference-analyst.md`, `.claude/agents/reference-analyst.md` — may reference
   - `.omc/progress.txt`, `.omc/prd.json` (and `.admin-done` variants) — automated state files, not manually edited

3. **Update in same commit as move** — never leave stale refs across commits.

## Enforcement via `eros-doctor`

Extend `.eros/scripts/eros-doctor.mjs` with three new rules:

- **RULE 8 — `docs/README.md` exists**: entry point present.
- **RULE 9 — No `PLAN-*.md` in `docs/` root**: bans the legacy ALL-CAPS pattern.
- **RULE 10 — No image files in `docs/`**: screenshots belong in `.eros/memory/`.

## Rollout — phased migration

Each phase is commit-safe and reversible:

1. **Audit + scaffold** — grep cross-refs, create `docs/plans/`, `docs/specs/`, `docs/references/`, `docs/archive/{plans,proposals}/`, write `docs/README.md` + subdir READMEs
2. **Archive completed plans** — move 4 implemented + update cross-refs
3. **Move active plans** — move 4 in-progress + drop `PLAN-` prefix + write `docs/plans/README.md` from `PLANS-STATUS.md` data
4. **Move references + rename `_libraries`** — 3 files + directory rename
5. **Consolidate specs** — move multi-ai spec to `docs/specs/`, executed plan to `docs/archive/plans/`, delete `docs/superpowers/`
6. **Archive proposals** — eros-v9, workflow-v7, pegasuz-* (6 files total)
7. **Relocate screenshots** — `panel-observer-*` to `.eros/memory/observations/panel/`
8. **Archive `ux-reform/`**
9. **Delete `docs/PLANS-STATUS.md`** after `docs/plans/README.md` absorbs the active status
10. **Extend eros-doctor** with rules 8-10, run full validation

## Success criteria

- [ ] `node .eros/scripts/eros-doctor.mjs` → "All checks passed" with 3 new rules active
- [ ] `grep -r "docs/PLAN-\|docs/superpowers\|docs/_libraries\|docs/panel-observer" --exclude-dir=docs` returns 0 results
- [ ] `ls docs/` shows 2 files (README, STATUS) + 5 dirs (plans, specs, references, libraries, archive) — no more
- [ ] Every subdir under `docs/` has a `README.md`
- [ ] `docs/plans/README.md` lists only active plans with a status table
- [ ] `README.md`, `AGENTS.md`, and `.eros/*` cross-refs still resolve

## Tradeoffs

**Chosen over flat+prefix approach** (alt B from brainstorm): directory hierarchy scales past 30-40 files; renaming conventions in a flat dir doesn't.

**Chosen over unified `work/` dir** (alt C): conceptual separation of spec (permanent) vs plan (ephemeral) vs reference (reusable) vs archive (historical) has load-bearing meaning for AI orientation — collapsing them loses signal.

**Risk: cross-ref breakage.** Mitigation: audit-first, atomic commits (move + ref update together), `eros-doctor` enforcement post-migration.

**Risk: merge conflicts for anyone working in `docs/` concurrently.** Mitigation: none — we're solo on this branch. If that changes, coordinate before executing.

## Non-goals

- **Not rewriting plan content.** Preserving original prose + status tags; only path changes.
- **Not changing `docs/_libraries/` content.** Only the directory name.
- **Not migrating `.eros/`, `.claude/`, `.gemini/`, `.codex/`.** Multi-AI brain architecture is stable.
- **Not editing screenshots or regenerating panel observations.** Just relocating files.

## References

- Multi-AI architecture spec: `docs/superpowers/specs/2026-04-14-multi-ai-architecture-design.md` (to be moved to `docs/specs/`)
- Multi-AI implementation plan (executed): `docs/superpowers/plans/2026-04-14-multi-ai-architecture.md` (to be archived)
- Enforcement script: `.eros/scripts/eros-doctor.mjs` (to be extended)
