# Scripts Restructure — AI-Friendly Architecture Design

> **Status:** `draft` · pending user approval
> **Date:** 2026-04-14
> **Scope:** `scripts/` directory only — adds `archive/` + 7 category subdirs + `lib/` + README at every level. Three orphaned scripts archived. All cross-refs (internal imports, package.json aliases, external docs) updated in lockstep.

## Goal

Migrate `scripts/` from a flat 37-file root into a hierarchical AI-friendly architecture mirroring the brain-pipeline domains (brain, memory, observer, quality, pipeline, panel, dev). Every subdir carries a `README.md`; deprecated scripts land in `archive/` with explanatory notes; the shared utility helper moves to `lib/`. Drop the now-redundant `eros-` filename prefix inside categorized subdirs (the directory already encodes ownership).

## Context

The multi-AI refactor established `.eros/` as canonical brain; the `docs/` restructure applied status-as-directory to prose. `scripts/` was deliberately out of scope for both and today has:

- **37 files flat at `scripts/` root** — 24,127 LOC total, no README, no categorization
- **Massive cross-ref surface**: 20+ internal `./eros-utils.mjs` imports, several cross-script imports (`auto-train → feed + pucho`), 19 npm aliases in `scripts/package.json`, 2 refs in `panel/package.json`, 6+ refs across `.eros/` docs, root `README.md` scripts table, agent spawn paths
- **Deprecated code lives next to current**: `capture-refs.mjs` (V1, explicitly deprecated by commit `5b7cdd2`), `eros-orchestrator.mjs` (orphaned per V9 proposal audit), `eros-migrate-audits.mjs` (one-shot migration, ran)
- **Naming inconsistency**: most scripts are `eros-<name>.mjs`, but `init-project`, `bootstrap-front-brain`, `select-blueprints`, `refresh-quality`, `sync-front-brain-runs`, `multimodal-critic`, `lint-ux`, `generate-tokens`, `vite-watchdog` are bare (no prefix)
- **Mixed extensions**: `.mjs` (33), `.js` (1), `.py` (2), `.sh` (2) — no convention about where each belongs
- **`scripts/observer/` already exists** as a subdir with `config.json` + 5 pass-`.mjs` files + `scoring-engine.mjs` — a working precedent to extend
- **Monoliths**: `capture-refs.mjs` (3,214 LOC), `eros-observer.mjs` (1,849 LOC), `eros-memory.mjs` (1,437 LOC), `eros-auto-train.mjs` (1,307 LOC) — AI-hostile to read in one window (not refactored here; just relocated)

An AI agent that lands in `scripts/` cannot answer "what does each of these do, which are active, which should I touch?" without reading 37 file headers.

## Architecture

### Target structure

```
scripts/
├── README.md                       # AI entry point — category map + conventions
├── package.json                    # 19 npm aliases updated to new paths
├── package-lock.json
│
├── lib/                            # shared helpers (every script depends on utils)
│   └── utils.mjs                   # ← was eros-utils.mjs
│
├── eros-core/                      # orchestration: state/context/gate (core autonomous loop)
│   ├── state.mjs                   # ← was eros-state.mjs
│   ├── context.mjs                 # ← was eros-context.mjs
│   └── gate.mjs                    # ← was eros-gate.mjs
│
├── memory/                         # learning: memory/meta/train/practice
│   ├── memory.mjs                  # ← was eros-memory.mjs
│   ├── meta.mjs                    # ← was eros-meta.mjs
│   ├── train.mjs                   # ← was eros-train.mjs
│   ├── train-reference.mjs         # ← was eros-train-reference.mjs
│   ├── practice.mjs                # ← was eros-practice.mjs
│   └── auto-train.mjs              # ← was eros-auto-train.mjs
│
├── observer/                       # vision: passes + detection + linting (EXTEND existing subdir)
│   ├── README.md                   # NEW
│   ├── config.json                 # (unchanged)
│   ├── pass-intelligence.mjs       # (unchanged)
│   ├── pass-judgment.mjs           # (unchanged)
│   ├── pass-perceptual.mjs         # (unchanged)
│   ├── pass-structural.mjs         # (unchanged)
│   ├── scoring-engine.mjs          # (unchanged)
│   ├── observer.mjs                # ← was eros-observer.mjs
│   ├── observer-v3.mjs             # ← was eros-observer-v3.mjs
│   ├── detect-changes.mjs          # ← was eros-detect-changes.mjs
│   ├── lint-ux.mjs                 # (unchanged name)
│   ├── saliency.py                 # ← was eros-saliency.py
│   └── aesthetic.py                # ← was eros-aesthetic.py
│
├── quality/                        # audit / critic / refresh
│   ├── audit.mjs                   # ← was eros-audit.mjs
│   ├── multimodal-critic.mjs       # (unchanged name)
│   └── refresh-quality.mjs         # (unchanged name)
│
├── pipeline/                       # project init / bootstrap / sync
│   ├── init-project.mjs            # (unchanged name)
│   ├── bootstrap-front-brain.mjs   # (unchanged name)
│   ├── select-blueprints.mjs       # (unchanged name)
│   ├── project-sync.mjs            # ← was eros-project-sync.mjs
│   └── sync-front-brain-runs.mjs   # (unchanged name)
│
├── panel/                          # panel dev server + feed
│   ├── server.mjs                  # ← was eros-server.mjs
│   ├── feed.mjs                    # ← was eros-feed.mjs
│   ├── vite-watchdog.mjs           # (unchanged name)
│   └── generate-tokens.js          # (unchanged name)
│
├── dev/                            # developer workflows + integrations
│   ├── chat.mjs                    # ← was eros-chat.mjs
│   ├── pucho.mjs                   # ← was eros-pucho.mjs
│   ├── discover.mjs                # ← was eros-discover.mjs
│   ├── test-e2e.mjs                # ← was eros-test-e2e.mjs
│   ├── mood.mjs                    # ← was eros-mood.mjs
│   ├── log.mjs                     # ← was eros-log.mjs
│   ├── deploy.mjs                  # ← was eros-deploy.mjs
│   ├── auto-practice.sh            # ← was eros-auto-practice.sh
│   └── start-workspace.sh          # (unchanged name)
│
├── archive/                       # deprecated, preserved for reference
│   ├── README.md
│   ├── capture-refs.mjs            # V1 observer, 3214 LOC, superseded by observer/
│   ├── eros-orchestrator.mjs       # 757 LOC, orphaned (V9 audit)
│   └── eros-migrate-audits.mjs     # 370 LOC, one-shot migration, ran
│
└── examples/                       # (unchanged)
    └── front-brain-brief.example.json
```

### Design principles

1. **Domain-based subdirs** mirroring the brain pipeline (`brain → memory → observer → quality`) + infrastructure (`pipeline`, `panel`, `dev`). Matches `.eros/pipeline.md`'s conceptual model.
2. **`lib/` for shared code**. `utils.mjs` is imported by ~20 scripts; it lives in its own dir to signal "shared library, not a command".
3. **Drop `eros-` prefix inside subdirs**. The path already encodes ownership (`scripts/eros-core/state.mjs`). Keep prefix ONLY in `archive/` filenames to preserve historical recognizability.
4. **`archive/` consistent with `docs/archive/`** — no underscore. The `_` prefix is reserved for "template source copied to new projects" (`_libraries/`, `_project-scaffold/`, `_components/`) — archive content is historical, not template source, so no underscore.
5. **`README.md` at every subdir level** — AI orientation in ≤30s from any entry point.
6. **Deprecate-then-move for 3 orphans** — don't just relocate, archive with reason notes.
7. **Cross-ref integrity**: every external reference (npm alias, agent path, doc link) updated in the same commit as the move. Atomic, reversible.
8. **Enforcement via `eros-doctor`**: 3 new rules prevent regressions.

## File mapping (complete)

### eros-core/ (3 scripts + 1 lib)

| From | To | LOC |
|------|-----|-----|
| `scripts/eros-state.mjs` | `scripts/eros-core/state.mjs` | 936 |
| `scripts/eros-context.mjs` | `scripts/eros-core/context.mjs` | 605 |
| `scripts/eros-gate.mjs` | `scripts/eros-core/gate.mjs` | 669 |
| `scripts/eros-utils.mjs` | `scripts/lib/utils.mjs` | 119 |

### memory/ (6 scripts)

| From | To | LOC |
|------|-----|-----|
| `scripts/eros-memory.mjs` | `scripts/memory/memory.mjs` | 1437 |
| `scripts/eros-meta.mjs` | `scripts/memory/meta.mjs` | 562 |
| `scripts/eros-train.mjs` | `scripts/memory/train.mjs` | 595 |
| `scripts/eros-train-reference.mjs` | `scripts/memory/train-reference.mjs` | 573 |
| `scripts/eros-practice.mjs` | `scripts/memory/practice.mjs` | 324 |
| `scripts/eros-auto-train.mjs` | `scripts/memory/auto-train.mjs` | 1307 |

### observer/ (6 moves into existing subdir)

| From | To | LOC |
|------|-----|-----|
| `scripts/eros-observer.mjs` | `scripts/observer/observer.mjs` | 1849 |
| `scripts/eros-observer-v3.mjs` | `scripts/observer/observer-v3.mjs` | 420 |
| `scripts/eros-detect-changes.mjs` | `scripts/observer/detect-changes.mjs` | 558 |
| `scripts/lint-ux.mjs` | `scripts/observer/lint-ux.mjs` | 233 |
| `scripts/eros-saliency.py` | `scripts/observer/saliency.py` | ~60 |
| `scripts/eros-aesthetic.py` | `scripts/observer/aesthetic.py` | ~30 |

Existing files at `scripts/observer/` remain unchanged: `config.json`, `pass-intelligence.mjs`, `pass-judgment.mjs`, `pass-perceptual.mjs`, `pass-structural.mjs`, `scoring-engine.mjs`.

### quality/ (3 scripts)

| From | To | LOC |
|------|-----|-----|
| `scripts/eros-audit.mjs` | `scripts/quality/audit.mjs` | 411 |
| `scripts/multimodal-critic.mjs` | `scripts/quality/multimodal-critic.mjs` | 572 |
| `scripts/refresh-quality.mjs` | `scripts/quality/refresh-quality.mjs` | 693 |

### pipeline/ (5 scripts)

| From | To | LOC |
|------|-----|-----|
| `scripts/init-project.mjs` | `scripts/pipeline/init-project.mjs` | 207 |
| `scripts/bootstrap-front-brain.mjs` | `scripts/pipeline/bootstrap-front-brain.mjs` | 783 |
| `scripts/select-blueprints.mjs` | `scripts/pipeline/select-blueprints.mjs` | 527 |
| `scripts/eros-project-sync.mjs` | `scripts/pipeline/project-sync.mjs` | 436 |
| `scripts/sync-front-brain-runs.mjs` | `scripts/pipeline/sync-front-brain-runs.mjs` | 734 |

### panel/ (4 scripts)

| From | To | LOC |
|------|-----|-----|
| `scripts/eros-server.mjs` | `scripts/panel/server.mjs` | 215 |
| `scripts/eros-feed.mjs` | `scripts/panel/feed.mjs` | 154 |
| `scripts/vite-watchdog.mjs` | `scripts/panel/vite-watchdog.mjs` | 205 |
| `scripts/generate-tokens.js` | `scripts/panel/generate-tokens.js` | 132 |

### dev/ (9 scripts)

| From | To | LOC |
|------|-----|-----|
| `scripts/eros-chat.mjs` | `scripts/dev/chat.mjs` | 154 |
| `scripts/eros-pucho.mjs` | `scripts/dev/pucho.mjs` | 244 |
| `scripts/eros-discover.mjs` | `scripts/dev/discover.mjs` | 257 |
| `scripts/eros-test-e2e.mjs` | `scripts/dev/test-e2e.mjs` | 451 |
| `scripts/eros-mood.mjs` | `scripts/dev/mood.mjs` | 231 |
| `scripts/eros-log.mjs` | `scripts/dev/log.mjs` | 187 |
| `scripts/eros-deploy.mjs` | `scripts/dev/deploy.mjs` | 234 |
| `scripts/eros-auto-practice.sh` | `scripts/dev/auto-practice.sh` | ~180 |
| `scripts/start-workspace.sh` | `scripts/dev/start-workspace.sh` | ~80 |

### archive/ (3 scripts)

| From | To | Reason |
|------|-----|--------|
| `scripts/capture-refs.mjs` | `scripts/archive/capture-refs.mjs` | V1 observer — deprecation committed `5b7cdd2`. Superseded by `scripts/observer/` multi-pass architecture. |
| `scripts/eros-orchestrator.mjs` | `scripts/archive/eros-orchestrator.mjs` | Orphaned per V9 audit ("Loaded, no llamado"). Replaced functionally by `eros-state.mjs`. Kept as reference in case architecture returns to top-down orchestration. |
| `scripts/eros-migrate-audits.mjs` | `scripts/archive/eros-migrate-audits.mjs` | One-shot migration that already ran. Kept for historical reference (could be deleted entirely; archive is the safer first step). |

### Preserved unchanged

- `scripts/package.json` (content updated — paths only, same file location)
- `scripts/package-lock.json` (unchanged)
- `scripts/examples/` (unchanged — contains `front-brain-brief.example.json`)
- `scripts/node_modules/` (gitignored, unchanged)

## Cross-reference update strategy

### Internal imports (within `scripts/`)

Every script that moves needs its import paths updated. Current pattern is `from './eros-utils.mjs'` (same-dir import). After move, most scripts live one level deep (e.g., `scripts/eros-core/state.mjs`) and need `from '../lib/utils.mjs'`.

**Cross-category imports** (rarer, but present):
- `memory/auto-train.mjs` imports `../panel/feed.mjs` + `../dev/pucho.mjs`
- `memory/meta.mjs` imports `../dev/pucho.mjs`
- Any other cross-category imports discovered during Task 1 audit get updated.

**Audit step** (first task of the plan) runs this exact grep to enumerate every internal import:

```bash
grep -rn "from ['\"]\./" scripts/*.mjs > .brain/scripts-migration-internal-imports.txt
```

The migration plan edits each file's imports in the same commit as the `git mv`.

### External references (outside `scripts/`)

From the audit (excluding `docs/archive/**` which is frozen historical):

| File | Current ref | New ref |
|------|-------------|---------|
| `panel/package.json` | `../scripts/sync-front-brain-runs.mjs` | `../scripts/pipeline/sync-front-brain-runs.mjs` |
| `panel/package.json` | `../scripts/start-workspace.sh` | `../scripts/dev/start-workspace.sh` |
| `.eros/brain-config.md:241` | `scripts/capture-refs.mjs` | `scripts/archive/capture-refs.mjs` (with note: legacy, see observer/) |
| `.eros/front-eros-core/README.md:16` | `scripts/bootstrap-front-brain.mjs` | `scripts/pipeline/bootstrap-front-brain.mjs` |
| `.eros/front-eros-core/README.md:17` | `scripts/init-project.mjs` | `scripts/pipeline/init-project.mjs` |
| `.eros/front-eros-core/README.md:18` | `scripts/select-blueprints.mjs` | `scripts/pipeline/select-blueprints.mjs` |
| `.eros/front-eros-core/README.md:19` | `scripts/refresh-quality.mjs` | `scripts/quality/refresh-quality.mjs` |
| `.eros/front-brain/runtime/README.md:15` | `scripts/sync-front-brain-runs.mjs` | `scripts/pipeline/sync-front-brain-runs.mjs` |
| `README.md` (scripts table) | `scripts/eros-state.mjs` (existing fixed line) | `scripts/eros-core/state.mjs` (plus other rows) |

### npm aliases in `scripts/package.json`

All 19 aliases updated to new paths. Examples:

```json
{
  "scripts": {
    "bootstrap:brain": "node pipeline/bootstrap-front-brain.mjs",
    "capture": "node archive/capture-refs.mjs",
    "init:project": "node pipeline/init-project.mjs",
    "refresh:quality": "node quality/refresh-quality.mjs",
    "select:blueprints": "node pipeline/select-blueprints.mjs",
    "tokens": "node panel/generate-tokens.js",
    "sync:runs": "node pipeline/sync-front-brain-runs.mjs",
    "eros:state": "node eros-core/state.mjs",
    "eros:memory": "node memory/memory.mjs",
    "eros:gate": "node eros-core/gate.mjs",
    "eros:context": "node eros-core/context.mjs",
    "eros:log": "node dev/log.mjs",
    "eros:train": "node memory/train.mjs",
    "eros:detect": "node observer/detect-changes.mjs",
    "eros:test": "node dev/test-e2e.mjs",
    "eros:ref": "node memory/train-reference.mjs",
    "observe": "node observer/observer.mjs",
    "observe:local": "node observer/observer.mjs --local"
  }
}
```

## Enforcement via `eros-doctor`

Extend `.eros/scripts/eros-doctor.mjs` with three new rules:

- **RULE 11 — `scripts/README.md` exists**: AI entry point for `scripts/`.
- **RULE 12 — No `eros-*.mjs` at `scripts/` root**: files belong inside a category subdir or in `archive/`. The three archived originals keep their prefix in `archive/` — the rule targets `scripts/*.mjs` directly, not `scripts/archive/*.mjs`.
- **RULE 13 — Every category subdir has a `README.md`**: walks `scripts/{brain,memory,observer,quality,pipeline,panel,dev,lib,archive}/` and asserts each contains a `README.md`.

## Rollout — phased migration

Commit-safe phases. Each phase independently reversible via `git revert`.

1. **Audit** — `.brain/scripts-migration-internal-imports.txt` enumerates every `./` import. Plan Task 1.
2. **Scaffold subdirs + READMEs** — `eros-core/`, `memory/`, `observer/`, `quality/`, `pipeline/`, `panel/`, `dev/`, `lib/`, `archive/` each get a `README.md`. `scripts/README.md` as entry point. No moves yet.
3. **Move `lib/utils.mjs`** + update all importers in one atomic commit. Highest-dependency move goes first so subsequent moves have a stable target.
4. **Move `eros-core/` scripts** (3 files) + update internal imports + npm aliases.
5. **Move `memory/` scripts** (6 files) + imports + aliases.
6. **Move `observer/` scripts** (6 files into existing subdir) + imports + aliases + observer `README.md`.
7. **Move `quality/`, `pipeline/`, `panel/`, `dev/`** (21 files) + imports + aliases. Grouped since no cross-category conflicts.
8. **Archive 3 deprecated scripts** to `archive/` + `archive/README.md` explaining each.
9. **Update external refs**: `panel/package.json`, `.eros/brain-config.md`, `.eros/front-eros-core/README.md`, `.eros/front-brain/runtime/README.md`, root `README.md` scripts table.
10. **Extend `eros-doctor`** with RULE 11/12/13 (TDD: fixture-based).
11. **Final validation**: `eros-doctor` clean, `npm run <every alias>` smoke-loads, grep audit shows zero stale refs.

## Success criteria

- [ ] `node .eros/scripts/eros-doctor.mjs` — "All checks passed" with 13 rules active
- [ ] `ls scripts/` shows: `README.md`, `package.json`, `package-lock.json`, `archive/`, `eros-core/`, `dev/`, `examples/`, `lib/`, `memory/`, `observer/`, `panel/`, `pipeline/`, `quality/` (and `node_modules/` gitignored)
- [ ] No `eros-*.mjs` at `scripts/` root (RULE 12 passes)
- [ ] Every category subdir + `lib/` + `archive/` has a `README.md` (RULE 13 passes)
- [ ] Every internal import resolves (fresh `node -e "import('./scripts/eros-core/state.mjs')"` smoke tests load without `ERR_MODULE_NOT_FOUND`)
- [ ] `grep -rn "scripts/eros-\|scripts/capture-refs\|scripts/multimodal-critic\|scripts/lint-ux\|scripts/init-project\|scripts/bootstrap-front-brain\|scripts/select-blueprints\|scripts/refresh-quality\|scripts/sync-front-brain-runs\|scripts/generate-tokens\|scripts/vite-watchdog\|scripts/start-workspace" --exclude-dir=scripts --exclude-dir=docs/archive --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.brain --exclude-dir=.omc .` returns 0 hits outside legacy/archive contexts
- [ ] `cd panel && npm run sync:runs` still works (verifies `panel/package.json` update)
- [ ] `cd scripts && npm run eros:state` smoke-loads (verifies alias + internal imports)

## Tradeoffs

**Chosen over additive README-only approach** (alt B): physical organization scales past 50 scripts and makes `ls scripts/eros-core/` self-documenting. README-only keeps files flat — invites regression as scripts pile up.

**Chosen over keeping `eros-` prefix inside subdirs**: the prefix is redundant inside `scripts/eros-core/` — the path already says "this is an Eros brain script". Dropping it matches the docs/ migration (we dropped `PLAN-` prefix the same way). Archive preserves original filenames because recognizability of historical commands (e.g., `capture-refs.mjs`) is higher-value there than consistency.

**Chosen not to split monoliths** (`eros-memory.mjs` at 1437 LOC, `eros-observer.mjs` at 1849 LOC): out of scope. Splitting is a future refactor that needs its own spec. This migration only relocates.

**Risk: import path mistakes** during the ~20 cross-import updates. **Mitigation**: audit step produces an explicit list; each phase's tests include a smoke-load to catch `ERR_MODULE_NOT_FOUND` immediately.

**Risk: agent-spawn paths** if any agent spawns a script via hardcoded `scripts/eros-*.mjs` path. **Mitigation**: plan Task 1 extends the grep to agent files; if hits found, add them to the update list before moves start.

**Risk: external contributors or bookmarks** to old paths. **Mitigation**: none practical — this is a monorepo with one contributor. If that changes, publish a migration note.

## Non-goals

- **Not refactoring script contents.** Monoliths stay monoliths; this migration only moves.
- **Not changing `scripts/examples/`** or `scripts/package-lock.json`.
- **Not touching `scripts/observer/`'s existing 6 files** (config.json + 5 pass-*.mjs + scoring-engine.mjs) — they stay.
- **Not removing deprecated scripts outright.** `archive/` preserves them; deletion is a future call once the archive has been stable for a release cycle.
- **Not migrating `.eros/scripts/`** — that is a separate, smaller, internal-only scripts dir.
- **Not adding new scripts, new npm aliases, or new features.** Zero scope creep.

## References

- Docs restructure spec (precedent): `docs/specs/2026-04-14-docs-restructure-design.md`
- Multi-AI architecture spec: `docs/specs/2026-04-14-multi-ai-architecture.md`
- V9 proposal (archive rationale source): `docs/archive/proposals/eros-v9-proposal.md`
- Enforcement script: `.eros/scripts/eros-doctor.mjs` (to be extended)
