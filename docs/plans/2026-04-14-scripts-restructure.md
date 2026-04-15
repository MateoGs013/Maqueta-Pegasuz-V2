# Scripts Restructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate `scripts/` from a flat 37-file root into a hierarchical AI-friendly architecture: 7 category subdirs (brain, memory, observer, quality, pipeline, panel, dev) + `lib/` for shared helpers + `archive/` for 3 orphaned scripts. Every subdir carries a `README.md`.

**Architecture:** Status/domain visible in directory tree. Shared helper (`lib/utils.mjs`) moves FIRST as stable target. Each category migrates atomically: `git mv` + rewrite internal imports + update `scripts/package.json` aliases + smoke-load test + commit. Drop the now-redundant `eros-` filename prefix inside subdirs (archive keeps original names for historical recognizability). Three new `eros-doctor` rules (11/12/13) prevent regressions.

**Tech Stack:** Git (file moves with `git mv`), Node.js 20+ ESM (relative imports with `.mjs` extensions), no new dependencies.

**Reference:** `docs/specs/2026-04-14-scripts-restructure-design.md`

---

## Pre-execution verification

Before starting, confirm clean state:

```bash
git branch --show-current
# Expected: docs/ai-friendly

git status --short | grep -v "\.omc"
# Expected: empty (no staged/unstaged changes except .omc/ runtime)

node .eros/scripts/eros-doctor.mjs
# Expected: "All checks passed" with 10 existing rules

ls scripts/ | head -5
# Expected: flat layout with eros-*.mjs files visible
```

If anything fails, stop and reconcile before proceeding.

---

## Task 1: Audit internal imports + agent cross-refs

**Files:**
- Create: `.brain/scripts-migration-audit.txt` (scratch, not committed — `.brain/` is gitignored)

- [ ] **Step 1: Enumerate every internal import in scripts/**

Run:
```bash
mkdir -p .brain
grep -rn "from ['\"]\\./" scripts/*.mjs > .brain/scripts-migration-internal-imports.txt 2>&1 || true
wc -l .brain/scripts-migration-internal-imports.txt
```

Expected: ~20-25 lines. Each line is `path:lineno:importStatement` — the authoritative list of every relative import between scripts at root.

- [ ] **Step 2: Enumerate external references to scripts/ files**

Run:
```bash
grep -rn "scripts/[a-z-]*\.\(mjs\|js\|py\|sh\)" \
  --include="*.md" --include="*.mjs" --include="*.js" --include="*.json" \
  --exclude-dir=scripts --exclude-dir=node_modules --exclude-dir=.git \
  --exclude-dir=.brain --exclude-dir=.omc --exclude-dir=docs/archive . \
  > .brain/scripts-migration-external-refs.txt 2>&1 || true
wc -l .brain/scripts-migration-external-refs.txt
cat .brain/scripts-migration-external-refs.txt
```

Expected: ~10 lines covering `panel/package.json` (2 refs), `.eros/brain-config.md` (1), `.eros/front-brain/README.md` (4), `.eros/front-brain/runtime/README.md` (1), root `README.md` (multiple), plus any agent refs.

- [ ] **Step 3: Check agent files for script spawn paths**

Run:
```bash
grep -rn "scripts/[a-z-]*\.\(mjs\|js\|py\|sh\)" .eros/agents/ .claude/agents/ 2>&1 | head -10
```

Expected: if any hits found, note them — they get updated in Task 12.

- [ ] **Step 4: Inventory scripts that will MOVE vs STAY**

Run:
```bash
ls scripts/*.mjs scripts/*.js scripts/*.py scripts/*.sh 2>&1 | wc -l
```

Expected: 40 (37 files to categorize + 3 to archive, matching the spec). If count differs, note for Task 14 final validation.

- [ ] **Step 5: No commit**

This task produces scratch files in `.brain/` only. Verify with:
```bash
grep -n "^/.brain\|^\.brain" .gitignore
```

Expected: `.brain/` is gitignored (line ~53).

---

## Task 2: Scaffold subdirs + `scripts/README.md` + 9 subdir READMEs

**Files:**
- Create: `scripts/brain/` (directory)
- Create: `scripts/memory/` (directory)
- Create: `scripts/quality/` (directory)
- Create: `scripts/pipeline/` (directory)
- Create: `scripts/panel/` (directory)
- Create: `scripts/dev/` (directory)
- Create: `scripts/lib/` (directory)
- Create: `scripts/archive/` (directory)
- (Note: `scripts/observer/` already exists)
- Create: `scripts/README.md`
- Create: `scripts/brain/README.md`
- Create: `scripts/memory/README.md`
- Create: `scripts/observer/README.md`
- Create: `scripts/quality/README.md`
- Create: `scripts/pipeline/README.md`
- Create: `scripts/panel/README.md`
- Create: `scripts/dev/README.md`
- Create: `scripts/lib/README.md`
- Create: `scripts/archive/README.md`

- [ ] **Step 1: Create all new directories**

Run:
```bash
mkdir -p scripts/brain scripts/memory scripts/quality scripts/pipeline scripts/panel scripts/dev scripts/lib scripts/archive
ls -d scripts/brain scripts/memory scripts/observer scripts/quality scripts/pipeline scripts/panel scripts/dev scripts/lib scripts/archive
```

Expected: 9 paths listed.

- [ ] **Step 2: Write `scripts/README.md`**

Content:
```markdown
# Eros — Scripts

AI entry point for `scripts/`. Domain-organized Node helpers that power the autonomous brain, memory, observer, quality pipeline, and developer workflows.

## Category map

| Subdir | What lives here | When to use |
|--------|----------------|-------------|
| [`brain/`](./brain/) | Orchestration core — state, context, gate | The autonomous loop: what to do next, gate checks, task advancement |
| [`memory/`](./memory/) | Learning — memory, meta, train, practice, auto-train | Everything that writes to `.eros/memory/design-intelligence/` |
| [`observer/`](./observer/) | Vision — observer passes, detection, lint, saliency/aesthetic | Scoring a project, detecting visual changes, perceptual analysis |
| [`quality/`](./quality/) | Audit, critic, scorecard refresh | Quality gate, multimodal critique, refresh-quality runs |
| [`pipeline/`](./pipeline/) | Project init, bootstrap, sync | Creating new projects, syncing front-brain runs, blueprint selection |
| [`panel/`](./panel/) | Panel dev server, feed, tokens, watchdog | Running the panel, generating tokens, vite dev-server watchdog |
| [`dev/`](./dev/) | Developer workflows + integrations | chat, test-e2e, deploy, mood, log, workspace start |
| [`lib/`](./lib/) | Shared helpers imported by many scripts | `import` from `./lib/utils.mjs` for `parseArgs`, `readJson`, `fail`, etc. |
| [`archive/`](./archive/) | Deprecated scripts preserved for reference | Don't run — see archive/README.md for why each was retired |
| [`examples/`](./examples/) | Example input files (e.g., project briefs) | Reference when authoring new briefs or configs |

## Running scripts

Via npm aliases (see `package.json`):

```bash
cd scripts
npm run eros:state -- query --project <path>
npm run observe
```

Direct:

```bash
cd scripts && node brain/state.mjs --project <path>
```

## Conventions

- Every category subdir has a `README.md` enumerating its scripts with a one-line purpose.
- Shared helpers live in `lib/`. Do not add utilities to category dirs.
- The `eros-` prefix is dropped inside subdirs (directory already encodes ownership). Archive keeps original filenames for historical recognizability.
- Scripts invoke each other via relative imports (`../lib/utils.mjs`). Never use absolute paths.

## Validation

`node .eros/scripts/eros-doctor.mjs` enforces:
- `scripts/README.md` exists (rule 11)
- No `eros-*.mjs` files at `scripts/` root (rule 12)
- Every category subdir + `lib/` + `archive/` has a `README.md` (rule 13)
```

- [ ] **Step 3: Write `scripts/brain/README.md`**

Content:
```markdown
# brain/

Orchestration core — scripts that drive the autonomous next/done loop and gate decisions.

## Scripts

| File | Purpose | Entry point |
|------|---------|-------------|
| [`state.mjs`](./state.mjs) | Single authority for all state transitions. Subcommands: `query`, `start`, `advance`, `retry`, `flag`, `init-sections`, `check-gate`, `next`, `done`. | `npm run eros:state` |
| [`context.mjs`](./context.mjs) | Builds context files for agent spawns (design-brief, motion, S-{Name}). | `npm run eros:context` |
| [`gate.mjs`](./gate.mjs) | Gate checker — validates expected outputs before advancing state. | `npm run eros:gate` |

## Dependencies

All three scripts import `../lib/utils.mjs` for shared helpers.

`state.mjs` is the ground truth; `context.mjs` and `gate.mjs` are invoked by it via file-based contracts (not direct imports).
```

- [ ] **Step 4: Write `scripts/memory/README.md`**

Content:
```markdown
# memory/

Long-term learning — scripts that read from and write to `.eros/memory/design-intelligence/`.

## Scripts

| File | Purpose | Entry point |
|------|---------|-------------|
| [`memory.mjs`](./memory.mjs) | Core memory read/write — rules, techniques, signatures, patterns. | `npm run eros:memory` |
| [`meta.mjs`](./meta.mjs) | Meta-analysis: `gaps`, `reflect`, `personality`, `diary`. | `npm run eros:meta` |
| [`train.mjs`](./train.mjs) | Training orchestration — single training run from brief. | `npm run eros:train` |
| [`train-reference.mjs`](./train-reference.mjs) | Reference training — ingest external references as memory. | `npm run eros:ref` |
| [`practice.mjs`](./practice.mjs) | Practice generator — targets weak spots from gaps. | (CLI) `node memory/practice.mjs` |
| [`auto-train.mjs`](./auto-train.mjs) | Autonomous training loop — runs practice sessions end-to-end. | (CLI) `node memory/auto-train.mjs` |

## Cross-dir imports

- `auto-train.mjs` imports `../panel/feed.mjs` (appends events) + `../dev/pucho.mjs` (notification pulse)
- `meta.mjs` imports `../dev/pucho.mjs`
- All import `../lib/utils.mjs`
```

- [ ] **Step 5: Write `scripts/observer/README.md`**

Content:
```markdown
# observer/

Vision — observer passes, change detection, linting, and perceptual helpers.

## Multi-pass observer

| File | Purpose |
|------|---------|
| [`config.json`](./config.json) | Observer pass configuration |
| [`pass-structural.mjs`](./pass-structural.mjs) | Structural pass — DOM/layout analysis |
| [`pass-intelligence.mjs`](./pass-intelligence.mjs) | Intelligence pass — high-level quality heuristics |
| [`pass-judgment.mjs`](./pass-judgment.mjs) | Judgment pass — final scoring call |
| [`pass-perceptual.mjs`](./pass-perceptual.mjs) | Perceptual pass — visual properties |
| [`scoring-engine.mjs`](./scoring-engine.mjs) | Shared scoring primitives used by the passes |

## Entry points + helpers

| File | Purpose | Entry point |
|------|---------|-------------|
| [`observer.mjs`](./observer.mjs) | Main observer runner (V2). | `npm run observe` |
| [`observer-v3.mjs`](./observer-v3.mjs) | V3 observer — eros ve, siente, y juzga. | (CLI) `node observer/observer-v3.mjs` |
| [`detect-changes.mjs`](./detect-changes.mjs) | Detect visual changes between runs. | `npm run eros:detect` |
| [`lint-ux.mjs`](./lint-ux.mjs) | UX lint rules. | (CLI) `node observer/lint-ux.mjs` |
| [`saliency.py`](./saliency.py) | Python helper — saliency map generation. | (CLI) `python observer/saliency.py` |
| [`aesthetic.py`](./aesthetic.py) | Python helper — aesthetic scoring. | (CLI) `python observer/aesthetic.py` |

## Legacy

The previous V1 observer (`capture-refs.mjs`, 3214 LOC) was superseded by this multi-pass architecture. It lives in `../archive/` for reference.
```

- [ ] **Step 6: Write `scripts/quality/README.md`**

Content:
```markdown
# quality/

Quality gate — audit, critic, and scorecard refresh.

## Scripts

| File | Purpose | Entry point |
|------|---------|-------------|
| [`audit.mjs`](./audit.mjs) | Audit runner — produces audit reports for a project. | (CLI) `node quality/audit.mjs` |
| [`multimodal-critic.mjs`](./multimodal-critic.mjs) | Multimodal critic — vision-model-based critique. Requires `OPENAI_API_KEY`. | (CLI) `node quality/multimodal-critic.mjs` |
| [`refresh-quality.mjs`](./refresh-quality.mjs) | Deterministic scorecard refresh — promotes observer artifacts into scorecard, critic, visual debt, and review outputs. | `npm run refresh:quality` |

All scripts import `../lib/utils.mjs`.
```

- [ ] **Step 7: Write `scripts/pipeline/README.md`**

Content:
```markdown
# pipeline/

Project initialization, bootstrap, and synchronization.

## Scripts

| File | Purpose | Entry point |
|------|---------|-------------|
| [`init-project.mjs`](./init-project.mjs) | End-to-end project initializer — copies scaffold, writes intake, invokes bootstrapper. | `npm run init:project` |
| [`bootstrap-front-brain.mjs`](./bootstrap-front-brain.mjs) | Canonical project bootstrapper — emits hybrid artifacts from intake data. | `npm run bootstrap:brain` |
| [`select-blueprints.mjs`](./select-blueprints.mjs) | Automatic hero/nav selector — emits structured direction candidates. | `npm run select:blueprints` |
| [`project-sync.mjs`](./project-sync.mjs) | Project sync — keeps project state aligned with brain. | (CLI) `node pipeline/project-sync.mjs` |
| [`sync-front-brain-runs.mjs`](./sync-front-brain-runs.mjs) | Syncs front-brain runs for panel consumption. Also invoked by `panel/package.json`. | `npm run sync:runs` |

All scripts import `../lib/utils.mjs`.
```

- [ ] **Step 8: Write `scripts/panel/README.md`**

Content:
```markdown
# panel/

Panel dev server, event feed, tokens, and watchdog.

## Scripts

| File | Purpose | Entry point |
|------|---------|-------------|
| [`server.mjs`](./server.mjs) | Panel dev server. | (CLI) `node panel/server.mjs` |
| [`feed.mjs`](./feed.mjs) | SSE event feed — append/read events for panel live updates. Importable by other scripts via `appendEvent`. | (CLI) `node panel/feed.mjs` |
| [`vite-watchdog.mjs`](./vite-watchdog.mjs) | Restarts Vite dev server on config churn. | (CLI) `node panel/vite-watchdog.mjs` |
| [`generate-tokens.js`](./generate-tokens.js) | Generates design tokens from input JSON. | `npm run tokens` |

All scripts import `../lib/utils.mjs` (or are standalone for `generate-tokens.js`).
```

- [ ] **Step 9: Write `scripts/dev/README.md`**

Content:
```markdown
# dev/

Developer workflows, tests, deploys, and integration scripts.

## Scripts

| File | Purpose | Entry point |
|------|---------|-------------|
| [`chat.mjs`](./chat.mjs) | Chat CLI — talk to the running brain. | (CLI) `node dev/chat.mjs` |
| [`pucho.mjs`](./pucho.mjs) | Notification pulse (Telegram/Discord, "pucho" of life). Importable by other scripts via `lightPucho`, `finishPucho`, `smokePucho`. | (CLI) `node dev/pucho.mjs` |
| [`discover.mjs`](./discover.mjs) | Discovery — finds projects in the workspace. | (CLI) `node dev/discover.mjs` |
| [`test-e2e.mjs`](./test-e2e.mjs) | End-to-end test for the autonomous loop. | `npm run eros:test` |
| [`mood.mjs`](./mood.mjs) | Mood setter — writes mood state. | (CLI) `node dev/mood.mjs` |
| [`log.mjs`](./log.mjs) | Log inspection helper. | `npm run eros:log` |
| [`deploy.mjs`](./deploy.mjs) | Vercel deploy runner. | (CLI) `node dev/deploy.mjs` |
| [`auto-practice.sh`](./auto-practice.sh) | Shell wrapper for continuous practice loops. | `bash dev/auto-practice.sh` |
| [`start-workspace.sh`](./start-workspace.sh) | Workspace bootstrap — starts panel + dev environment. | `cd panel && npm run workspace` |
```

- [ ] **Step 10: Write `scripts/lib/README.md`**

Content:
```markdown
# lib/

Shared helpers imported by most scripts. No entry points — library only.

## Files

| File | Exports |
|------|---------|
| [`utils.mjs`](./utils.mjs) | `parseArgs`, `exists`, `ensureDir`, `readJson`, `writeJson`, `readText`, `writeText`, `out`, `fail`, `today`, `appendEvent` (and more). Canonical home for cross-script helpers. |

## Import patterns

From a category subdir (one level deep):

```js
import { parseArgs, readJson, fail } from '../lib/utils.mjs';
```

From `scripts/` root (rarely — there shouldn't be root-level scripts outside README/package.json after migration):

```js
import { parseArgs } from './lib/utils.mjs';
```

## When to add a new utility

Only when 3+ scripts would import it. Don't eagerly move single-use helpers here.
```

- [ ] **Step 11: Write `scripts/archive/README.md`**

Content:
```markdown
# archive/

Deprecated scripts preserved for historical reference. Do not run.

## Files

| File | Retired | Reason |
|------|---------|--------|
| [`capture-refs.mjs`](./capture-refs.mjs) | 2026-04-14 (deprecation commit `5b7cdd2`) | V1 observer (3214 LOC). Superseded by the multi-pass architecture in `../observer/` (passes + scoring-engine). |
| [`eros-orchestrator.mjs`](./eros-orchestrator.mjs) | 2026-04-14 | 757 LOC, orphaned per V9 audit ("Loaded, no llamado"). Replaced functionally by `../brain/state.mjs`. Kept as reference if architecture ever returns to top-down orchestration. |
| [`eros-migrate-audits.mjs`](./eros-migrate-audits.mjs) | 2026-04-14 | 370 LOC, one-shot migration that already ran. Kept for historical reference (could be deleted entirely; archive is the safer first step). |

## Note on filenames

Archived scripts keep their original filenames (with `eros-` prefix) because recognizability of historical names outweighs consistency. Active scripts in category subdirs drop the prefix.

## Deletion policy

Files here can be deleted in a future release once the archive has been stable (no one has needed to reference them). Track deletions in git history.
```

- [ ] **Step 12: Verify all 10 READMEs exist**

Run:
```bash
for d in scripts scripts/brain scripts/memory scripts/observer scripts/quality scripts/pipeline scripts/panel scripts/dev scripts/lib scripts/archive; do
  test -f "$d/README.md" && echo "OK   $d/README.md" || echo "MISS $d/README.md"
done
```

Expected: all 10 lines start with `OK`.

- [ ] **Step 13: Commit**

Run:
```bash
git add scripts/README.md scripts/brain scripts/memory scripts/observer scripts/quality scripts/pipeline scripts/panel scripts/dev scripts/lib scripts/archive
git commit -m "scripts: scaffold AI-friendly subdir structure + READMEs

Creates scripts/{brain,memory,observer,quality,pipeline,panel,dev,lib,archive}
with entry-point README at every level plus scripts/README as the domain map.
observer/ subdir already existed and gets its README added. No file moves
yet — Tasks 3-11 migrate scripts into these dirs."
```

---

## Task 3: Move `lib/utils.mjs` (foundational) + update all importers

`utils.mjs` is imported by ~20 scripts. Moving it first establishes a stable target before categorized scripts move.

**Files:**
- Move: `scripts/eros-utils.mjs` → `scripts/lib/utils.mjs`
- Modify: every `scripts/*.mjs` that imports `./eros-utils.mjs` — update path to `./lib/utils.mjs`

- [ ] **Step 1: List every file that currently imports `./eros-utils.mjs`**

Run:
```bash
grep -l "from ['\"]\\./eros-utils\\.mjs['\"]" scripts/*.mjs | sort
```

Expected: a list of ~20 files. Each needs its import line updated.

- [ ] **Step 2: Move the file**

Run:
```bash
git mv scripts/eros-utils.mjs scripts/lib/utils.mjs
test -f scripts/lib/utils.mjs && echo OK
```

Expected: `OK`.

- [ ] **Step 3: Update all importers — from `./eros-utils.mjs` to `./lib/utils.mjs`**

Run a sed substitution across all `.mjs` files at `scripts/` root (files move in later tasks, so they're still at root for this substitution):

```bash
for f in scripts/*.mjs; do
  sed -i "s|from '\./eros-utils\.mjs'|from './lib/utils.mjs'|g" "$f"
  sed -i "s|from \"\./eros-utils\.mjs\"|from \"./lib/utils.mjs\"|g" "$f"
done
```

(Note: use `sed -i ''` on macOS; plain `sed -i` works on Git Bash / Linux. The project is Windows with Git Bash per env — plain `-i` is correct.)

- [ ] **Step 4: Verify no `./eros-utils.mjs` references remain**

Run:
```bash
grep -rn "./eros-utils.mjs" scripts/*.mjs
```

Expected: no output.

- [ ] **Step 5: Verify new path is referenced**

Run:
```bash
grep -c "from ['\"]\\./lib/utils\\.mjs['\"]" scripts/*.mjs | awk -F: '$2>0' | head -25
```

Expected: ~20 files with 1+ matches.

- [ ] **Step 6: Smoke-load a couple of updated scripts**

Run:
```bash
cd scripts && node -e "import('./eros-state.mjs').then(() => console.log('state OK')).catch(e => { console.error(e.message); process.exit(1); })" && cd ..
cd scripts && node -e "import('./eros-memory.mjs').then(() => console.log('memory OK')).catch(e => { console.error(e.message); process.exit(1); })" && cd ..
```

Expected: `state OK` and `memory OK`. If `ERR_MODULE_NOT_FOUND` appears, an import was missed — re-run Step 3 with a broader regex.

- [ ] **Step 7: Commit**

Run:
```bash
git add scripts/lib/utils.mjs scripts/*.mjs
git commit -m "scripts(lib): move eros-utils.mjs to lib/utils.mjs + update 20 importers

First move of the scripts restructure. lib/utils.mjs is the shared
helper imported by ~20 scripts; moving it first establishes a stable
target before categorized dirs migrate. Smoke-loaded eros-state and
eros-memory to confirm imports resolve."
```

---

## Task 4: Move `brain/` (state, context, gate) + update imports + npm aliases

**Files:**
- Move: `scripts/eros-state.mjs` → `scripts/brain/state.mjs`
- Move: `scripts/eros-context.mjs` → `scripts/brain/context.mjs`
- Move: `scripts/eros-gate.mjs` → `scripts/brain/gate.mjs`
- Modify: imports inside each moved file (`./lib/utils.mjs` → `../lib/utils.mjs`)
- Modify: `scripts/package.json` — aliases `eros:state`, `eros:context`, `eros:gate`

- [ ] **Step 1: Move the 3 brain scripts**

Run:
```bash
git mv scripts/eros-state.mjs scripts/brain/state.mjs
git mv scripts/eros-context.mjs scripts/brain/context.mjs
git mv scripts/eros-gate.mjs scripts/brain/gate.mjs
ls scripts/brain/
```

Expected: `README.md  context.mjs  gate.mjs  state.mjs`.

- [ ] **Step 2: Update imports inside each moved file**

Each moved file is now one level deeper, so relative imports need `../` prefix.

Run:
```bash
for f in scripts/brain/state.mjs scripts/brain/context.mjs scripts/brain/gate.mjs; do
  sed -i "s|from '\./lib/utils\.mjs'|from '../lib/utils.mjs'|g" "$f"
  sed -i "s|from \"\./lib/utils\.mjs\"|from \"../lib/utils.mjs\"|g" "$f"
done
```

- [ ] **Step 3: Verify imports in moved files**

Run:
```bash
grep -n "from ['\"].*utils\\.mjs['\"]" scripts/brain/*.mjs
```

Expected: every match shows `'../lib/utils.mjs'` (or double-quoted equivalent). No `./lib/` or `./eros-utils`.

- [ ] **Step 4: Update `scripts/package.json` aliases**

Read `scripts/package.json`, replace the three lines:

```json
    "eros:state": "node eros-state.mjs",
    "eros:context": "node eros-context.mjs",
    "eros:gate": "node eros-gate.mjs",
```

with:

```json
    "eros:state": "node brain/state.mjs",
    "eros:context": "node brain/context.mjs",
    "eros:gate": "node brain/gate.mjs",
```

- [ ] **Step 5: Smoke-load each moved script**

Run:
```bash
cd scripts && node -e "import('./brain/state.mjs').then(() => console.log('state OK')).catch(e => { console.error(e.message); process.exit(1); })" && cd ..
cd scripts && node -e "import('./brain/context.mjs').then(() => console.log('context OK')).catch(e => { console.error(e.message); process.exit(1); })" && cd ..
cd scripts && node -e "import('./brain/gate.mjs').then(() => console.log('gate OK')).catch(e => { console.error(e.message); process.exit(1); })" && cd ..
```

Expected: three `OK` lines.

- [ ] **Step 6: Smoke-test npm alias**

Run:
```bash
cd scripts && npm run eros:state 2>&1 | head -3 && cd ..
```

Expected: stderr output like `Error: Missing required argument: --project <path>` (the script loaded and parsed args successfully).

- [ ] **Step 7: Commit**

Run:
```bash
git add scripts/brain/ scripts/package.json
git commit -m "scripts(brain): move state/context/gate to brain/

Drops eros- prefix (directory encodes ownership). Updates relative imports
to ../lib/utils.mjs and rewrites 3 npm aliases (eros:state, eros:context,
eros:gate). Smoke-loaded all three modules."
```

---

## Task 5: Move `memory/` (6 scripts) + cross-dir imports + npm aliases

**Files:**
- Move: `scripts/eros-memory.mjs` → `scripts/memory/memory.mjs`
- Move: `scripts/eros-meta.mjs` → `scripts/memory/meta.mjs`
- Move: `scripts/eros-train.mjs` → `scripts/memory/train.mjs`
- Move: `scripts/eros-train-reference.mjs` → `scripts/memory/train-reference.mjs`
- Move: `scripts/eros-practice.mjs` → `scripts/memory/practice.mjs`
- Move: `scripts/eros-auto-train.mjs` → `scripts/memory/auto-train.mjs`
- Modify: imports in each moved file (`./lib/utils.mjs` → `../lib/utils.mjs`)
- Modify: `auto-train.mjs` cross-imports (`./eros-feed.mjs` + `./eros-pucho.mjs`) — eros-feed still at root, eros-pucho still at root at this point, so update them to match eventual paths AFTER those scripts move. Strategy: update to `../panel/feed.mjs` + `../dev/pucho.mjs` NOW even though feed/pucho haven't moved yet — this would break auto-train imports temporarily. Safer strategy: update to same-root paths NOW (`../eros-feed.mjs` doesn't work since auto-train is nested). Choose: defer auto-train cross-imports to after all moves (Task 10.5 fixup).
- Modify: `meta.mjs` cross-imports (`./eros-pucho.mjs`) — same deferred-fixup strategy
- Modify: `scripts/package.json` — aliases `eros:memory`, `eros:train`, `eros:ref`

- [ ] **Step 1: Move 6 memory scripts**

Run:
```bash
git mv scripts/eros-memory.mjs scripts/memory/memory.mjs
git mv scripts/eros-meta.mjs scripts/memory/meta.mjs
git mv scripts/eros-train.mjs scripts/memory/train.mjs
git mv scripts/eros-train-reference.mjs scripts/memory/train-reference.mjs
git mv scripts/eros-practice.mjs scripts/memory/practice.mjs
git mv scripts/eros-auto-train.mjs scripts/memory/auto-train.mjs
ls scripts/memory/
```

Expected: 7 entries (6 scripts + README.md).

- [ ] **Step 2: Update utils imports in each moved file**

Run:
```bash
for f in scripts/memory/*.mjs; do
  sed -i "s|from '\./lib/utils\.mjs'|from '../lib/utils.mjs'|g" "$f"
  sed -i "s|from \"\./lib/utils\.mjs\"|from \"../lib/utils.mjs\"|g" "$f"
done
```

- [ ] **Step 3: Update cross-dir imports in `auto-train.mjs` and `meta.mjs`**

`eros-feed.mjs` and `eros-pucho.mjs` are still at `scripts/` root (they move in Tasks 9 and 10). We have two choices:
- **A**: Leave imports as `../eros-feed.mjs` / `../eros-pucho.mjs` (works now, breaks after Tasks 9/10)
- **B**: Write imports to target locations now (`../panel/feed.mjs` / `../dev/pucho.mjs`), accepting that `auto-train.mjs` and `meta.mjs` are temporarily broken until Tasks 9/10 complete.

Choose **B** — target locations now, verify at end of each subsequent task. This keeps commits clean (one final import state, no interim rewrites).

Run:
```bash
sed -i "s|from '\./eros-feed\.mjs'|from '../panel/feed.mjs'|g" scripts/memory/auto-train.mjs
sed -i "s|from \"\./eros-feed\.mjs\"|from \"../panel/feed.mjs\"|g" scripts/memory/auto-train.mjs
sed -i "s|from '\./eros-pucho\.mjs'|from '../dev/pucho.mjs'|g" scripts/memory/auto-train.mjs
sed -i "s|from \"\./eros-pucho\.mjs\"|from \"../dev/pucho.mjs\"|g" scripts/memory/auto-train.mjs
sed -i "s|from '\./eros-pucho\.mjs'|from '../dev/pucho.mjs'|g" scripts/memory/meta.mjs
sed -i "s|from \"\./eros-pucho\.mjs\"|from \"../dev/pucho.mjs\"|g" scripts/memory/meta.mjs
```

- [ ] **Step 4: Verify imports look correct**

Run:
```bash
grep -n "from ['\"]" scripts/memory/auto-train.mjs | head -5
grep -n "from ['\"]" scripts/memory/meta.mjs | head -5
```

Expected: `auto-train.mjs` shows `'../lib/utils.mjs'`, `'../panel/feed.mjs'`, `'../dev/pucho.mjs'`. `meta.mjs` shows `'../lib/utils.mjs'` and `'../dev/pucho.mjs'`.

- [ ] **Step 5: Update `scripts/package.json` aliases**

Replace:
```json
    "eros:memory": "node eros-memory.mjs",
    "eros:train": "node eros-train.mjs",
    "eros:ref": "node eros-train-reference.mjs",
```

with:
```json
    "eros:memory": "node memory/memory.mjs",
    "eros:train": "node memory/train.mjs",
    "eros:ref": "node memory/train-reference.mjs",
```

- [ ] **Step 6: Smoke-load scripts without cross-imports (skip `auto-train` and `meta` — they will fail until Tasks 9/10 complete)**

Run:
```bash
cd scripts && node -e "import('./memory/memory.mjs').then(() => console.log('memory OK')).catch(e => { console.error(e.message); process.exit(1); })" && cd ..
cd scripts && node -e "import('./memory/train.mjs').then(() => console.log('train OK')).catch(e => { console.error(e.message); process.exit(1); })" && cd ..
cd scripts && node -e "import('./memory/train-reference.mjs').then(() => console.log('train-ref OK')).catch(e => { console.error(e.message); process.exit(1); })" && cd ..
cd scripts && node -e "import('./memory/practice.mjs').then(() => console.log('practice OK')).catch(e => { console.error(e.message); process.exit(1); })" && cd ..
```

Expected: four `OK` lines.

Do NOT smoke-load `auto-train.mjs` or `meta.mjs` yet — they depend on `panel/feed.mjs` and `dev/pucho.mjs` which move in Tasks 9 and 10.

- [ ] **Step 7: Commit**

Run:
```bash
git add scripts/memory/ scripts/package.json
git commit -m "scripts(memory): move 6 learning scripts to memory/

memory, meta, train, train-reference, practice, auto-train. Drops eros-
prefix. Updates utils imports to ../lib/utils.mjs. Pre-rewrites cross-dir
imports in auto-train (../panel/feed) and meta (../dev/pucho) to target
paths; those scripts will be smoke-testable after Tasks 9-10 complete.
Updates 3 npm aliases (memory/train/ref)."
```

---

## Task 6: Move `observer/` (6 scripts into existing subdir) + imports + aliases

**Files:**
- Move: `scripts/eros-observer.mjs` → `scripts/observer/observer.mjs`
- Move: `scripts/eros-observer-v3.mjs` → `scripts/observer/observer-v3.mjs`
- Move: `scripts/eros-detect-changes.mjs` → `scripts/observer/detect-changes.mjs`
- Move: `scripts/lint-ux.mjs` → `scripts/observer/lint-ux.mjs`
- Move: `scripts/eros-saliency.py` → `scripts/observer/saliency.py`
- Move: `scripts/eros-aesthetic.py` → `scripts/observer/aesthetic.py`
- Modify: imports in moved `.mjs` files (`./lib/utils.mjs` → `../lib/utils.mjs`)
- Modify: `scripts/package.json` — aliases `observe`, `observe:local`, `eros:detect`

- [ ] **Step 1: Move the 6 scripts**

Run:
```bash
git mv scripts/eros-observer.mjs scripts/observer/observer.mjs
git mv scripts/eros-observer-v3.mjs scripts/observer/observer-v3.mjs
git mv scripts/eros-detect-changes.mjs scripts/observer/detect-changes.mjs
git mv scripts/lint-ux.mjs scripts/observer/lint-ux.mjs
git mv scripts/eros-saliency.py scripts/observer/saliency.py
git mv scripts/eros-aesthetic.py scripts/observer/aesthetic.py
ls scripts/observer/
```

Expected: 13 entries (6 new + 5 existing pass/engine + config.json + README.md).

- [ ] **Step 2: Update utils imports in moved `.mjs` files**

Run:
```bash
for f in scripts/observer/observer.mjs scripts/observer/observer-v3.mjs scripts/observer/detect-changes.mjs scripts/observer/lint-ux.mjs; do
  sed -i "s|from '\./lib/utils\.mjs'|from '../lib/utils.mjs'|g" "$f"
  sed -i "s|from \"\./lib/utils\.mjs\"|from \"../lib/utils.mjs\"|g" "$f"
done
```

- [ ] **Step 3: Check if observer.mjs imports any sibling pass files** (was at root, now same dir as pass-*.mjs)

Run:
```bash
grep -n "from ['\"]\\./pass-\\|from ['\"]\\./scoring-engine\\|from ['\"]\\./config" scripts/observer/observer.mjs
```

If it was importing from a non-existent `./observer/pass-*.mjs` before the move, those imports now resolve correctly since observer.mjs is inside observer/. If it used relative paths to the subdir (`./observer/pass-intelligence.mjs`), those need updating to `./pass-intelligence.mjs`.

Run to detect:
```bash
grep -n "from ['\"]\\./observer/" scripts/observer/observer.mjs scripts/observer/observer-v3.mjs
```

If matches found, update:
```bash
for f in scripts/observer/observer.mjs scripts/observer/observer-v3.mjs; do
  sed -i "s|from '\./observer/|from './|g" "$f"
  sed -i "s|from \"\./observer/|from \"./|g" "$f"
done
```

If no matches, skip this substitution.

- [ ] **Step 4: Update `scripts/package.json` aliases**

Replace:
```json
    "eros:detect": "node eros-detect-changes.mjs",
    "observe": "node eros-observer.mjs",
    "observe:local": "node eros-observer.mjs --local"
```

with:
```json
    "eros:detect": "node observer/detect-changes.mjs",
    "observe": "node observer/observer.mjs",
    "observe:local": "node observer/observer.mjs --local"
```

- [ ] **Step 5: Smoke-load the 4 moved `.mjs` files**

Run:
```bash
cd scripts && node -e "import('./observer/observer.mjs').then(() => console.log('observer OK')).catch(e => { console.error(e.message); process.exit(1); })" && cd ..
cd scripts && node -e "import('./observer/observer-v3.mjs').then(() => console.log('observer-v3 OK')).catch(e => { console.error(e.message); process.exit(1); })" && cd ..
cd scripts && node -e "import('./observer/detect-changes.mjs').then(() => console.log('detect OK')).catch(e => { console.error(e.message); process.exit(1); })" && cd ..
cd scripts && node -e "import('./observer/lint-ux.mjs').then(() => console.log('lint-ux OK')).catch(e => { console.error(e.message); process.exit(1); })" && cd ..
```

Expected: four `OK` lines.

- [ ] **Step 6: Commit**

Run:
```bash
git add scripts/observer/ scripts/package.json
git commit -m "scripts(observer): move 6 scripts into existing observer/ subdir

observer.mjs, observer-v3.mjs, detect-changes.mjs, lint-ux.mjs, saliency.py,
aesthetic.py join the existing multi-pass observer/ subdir (pass-*.mjs,
scoring-engine.mjs, config.json). Drops eros- prefix. Updates utils imports
to ../lib/utils.mjs and rewrites 3 npm aliases (observe, observe:local,
eros:detect)."
```

---

## Task 7: Move `quality/` (3 scripts) + imports

**Files:**
- Move: `scripts/eros-audit.mjs` → `scripts/quality/audit.mjs`
- Move: `scripts/multimodal-critic.mjs` → `scripts/quality/multimodal-critic.mjs`
- Move: `scripts/refresh-quality.mjs` → `scripts/quality/refresh-quality.mjs`
- Modify: imports in moved files
- Modify: `scripts/package.json` — alias `refresh:quality`

- [ ] **Step 1: Move 3 scripts**

Run:
```bash
git mv scripts/eros-audit.mjs scripts/quality/audit.mjs
git mv scripts/multimodal-critic.mjs scripts/quality/multimodal-critic.mjs
git mv scripts/refresh-quality.mjs scripts/quality/refresh-quality.mjs
ls scripts/quality/
```

Expected: 4 entries (3 scripts + README.md).

- [ ] **Step 2: Update utils imports**

Run:
```bash
for f in scripts/quality/*.mjs; do
  sed -i "s|from '\./lib/utils\.mjs'|from '../lib/utils.mjs'|g" "$f"
  sed -i "s|from \"\./lib/utils\.mjs\"|from \"../lib/utils.mjs\"|g" "$f"
done
```

- [ ] **Step 3: Update `scripts/package.json` — `refresh:quality` alias**

Replace:
```json
    "refresh:quality": "node refresh-quality.mjs",
```

with:
```json
    "refresh:quality": "node quality/refresh-quality.mjs",
```

- [ ] **Step 4: Smoke-load**

Run:
```bash
cd scripts && node -e "import('./quality/audit.mjs').then(() => console.log('audit OK')).catch(e => { console.error(e.message); process.exit(1); })" && cd ..
cd scripts && node -e "import('./quality/multimodal-critic.mjs').then(() => console.log('critic OK')).catch(e => { console.error(e.message); process.exit(1); })" && cd ..
cd scripts && node -e "import('./quality/refresh-quality.mjs').then(() => console.log('refresh OK')).catch(e => { console.error(e.message); process.exit(1); })" && cd ..
```

Expected: three `OK` lines.

- [ ] **Step 5: Commit**

Run:
```bash
git add scripts/quality/ scripts/package.json
git commit -m "scripts(quality): move 3 scripts to quality/

audit, multimodal-critic, refresh-quality. Drops eros- prefix on audit.
Updates utils imports to ../lib/utils.mjs and rewrites 1 npm alias
(refresh:quality)."
```

---

## Task 8: Move `pipeline/` (5 scripts) + imports + aliases

**Files:**
- Move: `scripts/init-project.mjs` → `scripts/pipeline/init-project.mjs`
- Move: `scripts/bootstrap-front-brain.mjs` → `scripts/pipeline/bootstrap-front-brain.mjs`
- Move: `scripts/select-blueprints.mjs` → `scripts/pipeline/select-blueprints.mjs`
- Move: `scripts/eros-project-sync.mjs` → `scripts/pipeline/project-sync.mjs`
- Move: `scripts/sync-front-brain-runs.mjs` → `scripts/pipeline/sync-front-brain-runs.mjs`
- Modify: imports in moved files
- Modify: `scripts/package.json` — aliases `init:project`, `bootstrap:brain`, `select:blueprints`, `sync:runs`

- [ ] **Step 1: Move 5 scripts**

Run:
```bash
git mv scripts/init-project.mjs scripts/pipeline/init-project.mjs
git mv scripts/bootstrap-front-brain.mjs scripts/pipeline/bootstrap-front-brain.mjs
git mv scripts/select-blueprints.mjs scripts/pipeline/select-blueprints.mjs
git mv scripts/eros-project-sync.mjs scripts/pipeline/project-sync.mjs
git mv scripts/sync-front-brain-runs.mjs scripts/pipeline/sync-front-brain-runs.mjs
ls scripts/pipeline/
```

Expected: 6 entries (5 scripts + README.md).

- [ ] **Step 2: Update utils imports**

Run:
```bash
for f in scripts/pipeline/*.mjs; do
  sed -i "s|from '\./lib/utils\.mjs'|from '../lib/utils.mjs'|g" "$f"
  sed -i "s|from \"\./lib/utils\.mjs\"|from \"../lib/utils.mjs\"|g" "$f"
done
```

- [ ] **Step 3: Update `scripts/package.json` — 4 aliases**

Replace:
```json
    "bootstrap:brain": "node bootstrap-front-brain.mjs",
    "init:project": "node init-project.mjs",
    "select:blueprints": "node select-blueprints.mjs",
    "sync:runs": "node sync-front-brain-runs.mjs",
```

with:
```json
    "bootstrap:brain": "node pipeline/bootstrap-front-brain.mjs",
    "init:project": "node pipeline/init-project.mjs",
    "select:blueprints": "node pipeline/select-blueprints.mjs",
    "sync:runs": "node pipeline/sync-front-brain-runs.mjs",
```

- [ ] **Step 4: Smoke-load**

Run:
```bash
cd scripts && node -e "import('./pipeline/init-project.mjs').then(() => console.log('init-project OK')).catch(e => { console.error(e.message); process.exit(1); })" && cd ..
cd scripts && node -e "import('./pipeline/bootstrap-front-brain.mjs').then(() => console.log('bootstrap OK')).catch(e => { console.error(e.message); process.exit(1); })" && cd ..
cd scripts && node -e "import('./pipeline/select-blueprints.mjs').then(() => console.log('select OK')).catch(e => { console.error(e.message); process.exit(1); })" && cd ..
cd scripts && node -e "import('./pipeline/project-sync.mjs').then(() => console.log('project-sync OK')).catch(e => { console.error(e.message); process.exit(1); })" && cd ..
cd scripts && node -e "import('./pipeline/sync-front-brain-runs.mjs').then(() => console.log('sync-runs OK')).catch(e => { console.error(e.message); process.exit(1); })" && cd ..
```

Expected: five `OK` lines.

- [ ] **Step 5: Commit**

Run:
```bash
git add scripts/pipeline/ scripts/package.json
git commit -m "scripts(pipeline): move 5 project scripts to pipeline/

init-project, bootstrap-front-brain, select-blueprints, project-sync
(drops eros- prefix), sync-front-brain-runs. Updates utils imports
to ../lib/utils.mjs and rewrites 4 npm aliases. panel/package.json
reference to sync-front-brain-runs gets fixed in Task 12."
```

---

## Task 9: Move `panel/` (4 scripts) + imports + alias

**Files:**
- Move: `scripts/eros-server.mjs` → `scripts/panel/server.mjs`
- Move: `scripts/eros-feed.mjs` → `scripts/panel/feed.mjs`
- Move: `scripts/vite-watchdog.mjs` → `scripts/panel/vite-watchdog.mjs`
- Move: `scripts/generate-tokens.js` → `scripts/panel/generate-tokens.js`
- Modify: imports in moved files
- Modify: `scripts/package.json` — alias `tokens`

- [ ] **Step 1: Move 4 scripts**

Run:
```bash
git mv scripts/eros-server.mjs scripts/panel/server.mjs
git mv scripts/eros-feed.mjs scripts/panel/feed.mjs
git mv scripts/vite-watchdog.mjs scripts/panel/vite-watchdog.mjs
git mv scripts/generate-tokens.js scripts/panel/generate-tokens.js
ls scripts/panel/
```

Expected: 5 entries (4 scripts + README.md).

- [ ] **Step 2: Update utils imports**

Run:
```bash
for f in scripts/panel/*.mjs; do
  sed -i "s|from '\./lib/utils\.mjs'|from '../lib/utils.mjs'|g" "$f"
  sed -i "s|from \"\./lib/utils\.mjs\"|from \"../lib/utils.mjs\"|g" "$f"
done
```

(`generate-tokens.js` is standalone — check separately in step 3.)

- [ ] **Step 3: Check `generate-tokens.js` for any relative imports**

Run:
```bash
grep -n "from ['\"]\\./\\|require(['\"]\\./" scripts/panel/generate-tokens.js
```

If matches found, update the paths. If no matches, skip.

- [ ] **Step 4: Update `scripts/package.json` — `tokens` alias**

Replace:
```json
    "tokens": "node generate-tokens.js",
```

with:
```json
    "tokens": "node panel/generate-tokens.js",
```

- [ ] **Step 5: Smoke-load**

Run:
```bash
cd scripts && node -e "import('./panel/server.mjs').then(() => console.log('server OK')).catch(e => { console.error(e.message); process.exit(1); })" && cd ..
cd scripts && node -e "import('./panel/feed.mjs').then(() => console.log('feed OK')).catch(e => { console.error(e.message); process.exit(1); })" && cd ..
cd scripts && node -e "import('./panel/vite-watchdog.mjs').then(() => console.log('watchdog OK')).catch(e => { console.error(e.message); process.exit(1); })" && cd ..
```

Expected: three `OK` lines.

- [ ] **Step 6: Smoke-load `memory/auto-train.mjs` — should now resolve** (feed is in place)

Run:
```bash
cd scripts && node -e "import('./memory/auto-train.mjs').then(() => console.log('auto-train (partial) OK')).catch(e => { console.error(e.message); process.exit(1); })" && cd ..
```

Expected: either `auto-train (partial) OK` (if pucho is not needed at top-level import) or a specific error about `../dev/pucho.mjs` not found — that's OK, Task 10 resolves it.

- [ ] **Step 7: Commit**

Run:
```bash
git add scripts/panel/ scripts/package.json
git commit -m "scripts(panel): move 4 panel scripts to panel/

server, feed (drops eros- prefix), vite-watchdog, generate-tokens.
Updates utils imports and rewrites tokens npm alias.
memory/auto-train.mjs cross-import to ../panel/feed.mjs now resolves.
panel/package.json reference gets fixed in Task 12."
```

---

## Task 10: Move `dev/` (9 scripts) + imports + aliases

**Files:**
- Move: `scripts/eros-chat.mjs` → `scripts/dev/chat.mjs`
- Move: `scripts/eros-pucho.mjs` → `scripts/dev/pucho.mjs`
- Move: `scripts/eros-discover.mjs` → `scripts/dev/discover.mjs`
- Move: `scripts/eros-test-e2e.mjs` → `scripts/dev/test-e2e.mjs`
- Move: `scripts/eros-mood.mjs` → `scripts/dev/mood.mjs`
- Move: `scripts/eros-log.mjs` → `scripts/dev/log.mjs`
- Move: `scripts/eros-deploy.mjs` → `scripts/dev/deploy.mjs`
- Move: `scripts/eros-auto-practice.sh` → `scripts/dev/auto-practice.sh`
- Move: `scripts/start-workspace.sh` → `scripts/dev/start-workspace.sh`
- Modify: imports in moved `.mjs` files
- Modify: `scripts/package.json` — aliases `eros:log`, `eros:test`

- [ ] **Step 1: Move 9 scripts**

Run:
```bash
git mv scripts/eros-chat.mjs scripts/dev/chat.mjs
git mv scripts/eros-pucho.mjs scripts/dev/pucho.mjs
git mv scripts/eros-discover.mjs scripts/dev/discover.mjs
git mv scripts/eros-test-e2e.mjs scripts/dev/test-e2e.mjs
git mv scripts/eros-mood.mjs scripts/dev/mood.mjs
git mv scripts/eros-log.mjs scripts/dev/log.mjs
git mv scripts/eros-deploy.mjs scripts/dev/deploy.mjs
git mv scripts/eros-auto-practice.sh scripts/dev/auto-practice.sh
git mv scripts/start-workspace.sh scripts/dev/start-workspace.sh
ls scripts/dev/
```

Expected: 10 entries (9 scripts + README.md).

- [ ] **Step 2: Update utils imports in `.mjs` files**

Run:
```bash
for f in scripts/dev/*.mjs; do
  sed -i "s|from '\./lib/utils\.mjs'|from '../lib/utils.mjs'|g" "$f"
  sed -i "s|from \"\./lib/utils\.mjs\"|from \"../lib/utils.mjs\"|g" "$f"
done
```

- [ ] **Step 3: Update `scripts/package.json` — 2 aliases**

Replace:
```json
    "eros:log": "node eros-log.mjs",
    "eros:test": "node eros-test-e2e.mjs",
```

with:
```json
    "eros:log": "node dev/log.mjs",
    "eros:test": "node dev/test-e2e.mjs",
```

- [ ] **Step 4: Smoke-load all 7 dev `.mjs` files**

Run:
```bash
cd scripts && node -e "import('./dev/chat.mjs').then(() => console.log('chat OK')).catch(e => { console.error(e.message); process.exit(1); })" && cd ..
cd scripts && node -e "import('./dev/pucho.mjs').then(() => console.log('pucho OK')).catch(e => { console.error(e.message); process.exit(1); })" && cd ..
cd scripts && node -e "import('./dev/discover.mjs').then(() => console.log('discover OK')).catch(e => { console.error(e.message); process.exit(1); })" && cd ..
cd scripts && node -e "import('./dev/test-e2e.mjs').then(() => console.log('test-e2e OK')).catch(e => { console.error(e.message); process.exit(1); })" && cd ..
cd scripts && node -e "import('./dev/mood.mjs').then(() => console.log('mood OK')).catch(e => { console.error(e.message); process.exit(1); })" && cd ..
cd scripts && node -e "import('./dev/log.mjs').then(() => console.log('log OK')).catch(e => { console.error(e.message); process.exit(1); })" && cd ..
cd scripts && node -e "import('./dev/deploy.mjs').then(() => console.log('deploy OK')).catch(e => { console.error(e.message); process.exit(1); })" && cd ..
```

Expected: seven `OK` lines.

- [ ] **Step 5: Smoke-load previously-broken cross-dir imports** (auto-train, meta — now both deps resolve)

Run:
```bash
cd scripts && node -e "import('./memory/auto-train.mjs').then(() => console.log('auto-train OK')).catch(e => { console.error(e.message); process.exit(1); })" && cd ..
cd scripts && node -e "import('./memory/meta.mjs').then(() => console.log('meta OK')).catch(e => { console.error(e.message); process.exit(1); })" && cd ..
```

Expected: both `OK`. If either fails, fix the specific import error before committing.

- [ ] **Step 6: Verify no `.mjs`/`.js`/`.py`/`.sh` files remain at `scripts/` root** (except package.json/lock, README)

Run:
```bash
ls scripts/*.mjs scripts/*.js scripts/*.py scripts/*.sh 2>&1 | grep -v "No such" | head -10
```

Expected: only `scripts/capture-refs.mjs`, `scripts/eros-orchestrator.mjs`, `scripts/eros-migrate-audits.mjs` (the 3 to be archived in Task 11). No other `.mjs` files.

- [ ] **Step 7: Commit**

Run:
```bash
git add scripts/dev/ scripts/package.json
git commit -m "scripts(dev): move 9 dev scripts to dev/

chat, pucho, discover, test-e2e, mood, log, deploy (drops eros- prefix),
auto-practice.sh, start-workspace.sh. Updates utils imports and rewrites
2 npm aliases (eros:log, eros:test). memory/auto-train and memory/meta
cross-imports to ../dev/pucho now fully resolve. panel/package.json
reference to start-workspace gets fixed in Task 12."
```

---

## Task 11: Archive 3 deprecated scripts

**Files:**
- Move: `scripts/capture-refs.mjs` → `scripts/archive/capture-refs.mjs`
- Move: `scripts/eros-orchestrator.mjs` → `scripts/archive/eros-orchestrator.mjs`
- Move: `scripts/eros-migrate-audits.mjs` → `scripts/archive/eros-migrate-audits.mjs`
- Modify: imports in archived files (if any reference `./lib/utils.mjs` or `./eros-*` at root)
- Modify: `scripts/package.json` — alias `capture`

- [ ] **Step 1: Move 3 archived scripts**

Run:
```bash
git mv scripts/capture-refs.mjs scripts/archive/capture-refs.mjs
git mv scripts/eros-orchestrator.mjs scripts/archive/eros-orchestrator.mjs
git mv scripts/eros-migrate-audits.mjs scripts/archive/eros-migrate-audits.mjs
ls scripts/archive/
```

Expected: 4 entries (3 scripts + README.md).

- [ ] **Step 2: Update utils imports in archived files** (so they still technically load if anyone ever imports them for reference)

Run:
```bash
for f in scripts/archive/*.mjs; do
  sed -i "s|from '\./lib/utils\.mjs'|from '../lib/utils.mjs'|g" "$f"
  sed -i "s|from \"\./lib/utils\.mjs\"|from \"../lib/utils.mjs\"|g" "$f"
  sed -i "s|from '\./eros-utils\.mjs'|from '../lib/utils.mjs'|g" "$f"
  sed -i "s|from \"\./eros-utils\.mjs\"|from \"../lib/utils.mjs\"|g" "$f"
done
```

(Second pair handles any archived script that never got the Task 3 update.)

- [ ] **Step 3: Update `scripts/package.json` — `capture` alias**

Replace:
```json
    "capture": "node capture-refs.mjs",
```

with:
```json
    "capture": "node archive/capture-refs.mjs",
```

(This preserves the alias even though the script is archived, so anyone who habitually runs `npm run capture` gets a clear path to the legacy tool.)

- [ ] **Step 4: Verify scripts/ root now contains ONLY non-script files**

Run:
```bash
ls scripts/ | grep -E "\.(mjs|js|py|sh)$"
```

Expected: no output (all scripts moved to subdirs).

- [ ] **Step 5: Commit**

Run:
```bash
git add scripts/archive/ scripts/package.json
git commit -m "scripts(archive): move 3 deprecated scripts to archive/

capture-refs (V1 observer, superseded), eros-orchestrator (orphaned per
V9 audit), eros-migrate-audits (one-shot, ran). archive/README documents
each. capture npm alias updated; scripts/ root now contains no .mjs/.js/
.py/.sh files — all migrated or archived."
```

---

## Task 12: Update external references (panel + .eros + README)

**Files:**
- Modify: `panel/package.json` (2 refs)
- Modify: `.eros/brain-config.md` (1 ref)
- Modify: `.eros/front-brain/README.md` (4 refs)
- Modify: `.eros/front-brain/runtime/README.md` (1 ref)
- Modify: `README.md` (root — scripts table)
- Verify: any agent file cross-refs from `.eros/agents/`, `.claude/agents/`

- [ ] **Step 1: Fix `panel/package.json`**

Edit `panel/package.json`. Find:

```json
    "sync:runs": "node ../scripts/sync-front-brain-runs.mjs",
    ...
    "workspace": "bash ../scripts/start-workspace.sh"
```

Replace with:

```json
    "sync:runs": "node ../scripts/pipeline/sync-front-brain-runs.mjs",
    ...
    "workspace": "bash ../scripts/dev/start-workspace.sh"
```

- [ ] **Step 2: Fix `.eros/brain-config.md:241`**

Find:

```
The General Observer (`scripts/capture-refs.mjs`) is now used in two modes:
```

Replace with:

```
The General Observer (`scripts/archive/capture-refs.mjs` — legacy V1, superseded by `scripts/observer/` multi-pass architecture) was used in two modes:
```

(Tense shifted to past since it's archived, and the new canonical path is pointed to.)

- [ ] **Step 3: Fix `.eros/front-brain/README.md` (4 lines: 16-19)**

Find:

```
- `../../scripts/bootstrap-front-brain.mjs`: canonical project bootstrapper for emitting hybrid artifacts from intake data.
- `../../scripts/init-project.mjs`: end-to-end project initializer that copies scaffold, writes intake, and invokes the bootstrapper.
- `../../scripts/select-blueprints.mjs`: automatic hero/nav selector that emits structured direction candidates.
- `../../scripts/refresh-quality.mjs`: deterministic quality refresh that promotes observer artifacts into scorecard, critic, visual debt, and review outputs.
```

Replace with:

```
- `../../scripts/pipeline/bootstrap-front-brain.mjs`: canonical project bootstrapper for emitting hybrid artifacts from intake data.
- `../../scripts/pipeline/init-project.mjs`: end-to-end project initializer that copies scaffold, writes intake, and invokes the bootstrapper.
- `../../scripts/pipeline/select-blueprints.mjs`: automatic hero/nav selector that emits structured direction candidates.
- `../../scripts/quality/refresh-quality.mjs`: deterministic quality refresh that promotes observer artifacts into scorecard, critic, visual debt, and review outputs.
```

- [ ] **Step 4: Fix `.eros/front-brain/runtime/README.md:15`**

Find:

```
This file is generated by `scripts/sync-front-brain-runs.mjs` and is intentionally ignored by git.
```

Replace with:

```
This file is generated by `scripts/pipeline/sync-front-brain-runs.mjs` and is intentionally ignored by git.
```

- [ ] **Step 5: Fix root `README.md` scripts table**

Read `README.md`, find the scripts table (around line 98-110). Update each script path:

Before (examples):
```
| `node scripts/eros-state.mjs query --project "<path>"` | Read current brain state |
```

After:
```
| `node scripts/brain/state.mjs query --project "<path>"` | Read current brain state |
```

Apply similar path updates to every row in the scripts table. For each npm alias (e.g., `npm run refresh:quality`), the alias itself doesn't change — only any direct `node scripts/foo.mjs` references.

Specific known rows to update in root README.md:

| Old path | New path |
|----------|----------|
| `scripts/eros-state.mjs` | `scripts/brain/state.mjs` |
| Any other direct `scripts/eros-*.mjs` or `scripts/<bare>.mjs` mentions | matching new subdir path |

- [ ] **Step 6: Scan agent files for any script path refs**

Run:
```bash
grep -rn "scripts/[a-z-]*\.\(mjs\|js\|py\|sh\)" .eros/agents/ .claude/agents/ 2>&1 | head -10
```

If matches found, update each file using Edit tool with the new path per the mapping. If no matches, skip.

- [ ] **Step 7: Final repo-wide audit — no stale refs**

Run:
```bash
grep -rn "scripts/eros-[a-z-]*\.mjs\|scripts/capture-refs\|scripts/multimodal-critic\|scripts/lint-ux\|scripts/init-project\|scripts/bootstrap-front-brain\|scripts/select-blueprints\|scripts/refresh-quality\|scripts/sync-front-brain-runs\|scripts/generate-tokens\|scripts/vite-watchdog\|scripts/start-workspace" \
  --exclude-dir=scripts --exclude-dir=node_modules --exclude-dir=.git \
  --exclude-dir=.brain --exclude-dir=.omc --exclude-dir="docs/archive" . 2>&1 | head -20
```

Expected: no output. If matches remain, update them and re-run.

- [ ] **Step 8: Smoke-test panel integration**

Run:
```bash
cd panel && node -e "const s = require('./package.json').scripts; console.log(s['sync:runs']); console.log(s['workspace']);" && cd ..
```

Expected:
```
node ../scripts/pipeline/sync-front-brain-runs.mjs
bash ../scripts/dev/start-workspace.sh
```

Verify the referenced files actually exist:
```bash
test -f scripts/pipeline/sync-front-brain-runs.mjs && echo OK
test -f scripts/dev/start-workspace.sh && echo OK
```

Expected: two `OK` lines.

- [ ] **Step 9: Commit**

Run:
```bash
git add panel/package.json .eros/brain-config.md .eros/front-brain/README.md .eros/front-brain/runtime/README.md README.md
git commit -m "docs: update external references to new scripts/ layout

panel/package.json (2 refs: sync:runs + workspace), .eros/brain-config
(capture-refs now archived), .eros/front-brain/README (4 pipeline refs),
.eros/front-brain/runtime/README (1 ref), root README scripts table.
Zero stale refs remain repo-wide (excluding docs/archive/)."
```

---

## Task 13: Extend `eros-doctor` with RULE 11 / 12 / 13 (TDD)

**Files:**
- Modify: `.eros/scripts/eros-doctor.mjs`

- [ ] **Step 1: Read current structure of eros-doctor**

Run:
```bash
grep -n "^// RULE" .eros/scripts/eros-doctor.mjs
```

Expected: RULE 1 through RULE 10 listed with line numbers.

- [ ] **Step 2: Verify baseline clean state passes**

Run:
```bash
node .eros/scripts/eros-doctor.mjs; echo "exit: $?"
```

Expected: "All checks passed", exit 0. If not, something is already broken — fix before proceeding.

- [ ] **Step 3: TDD RED — confirm RULE 11 not yet enforced**

Run:
```bash
mv scripts/README.md scripts/README.md.bak
node .eros/scripts/eros-doctor.mjs; echo "exit: $?"
```

Expected: "All checks passed" (RULE 11 doesn't exist yet — RED state). Exit 0.

Restore:
```bash
mv scripts/README.md.bak scripts/README.md
```

- [ ] **Step 4: Implement RULE 11, 12, 13**

Open `.eros/scripts/eros-doctor.mjs`. Locate the section right before `// Report`.

Add immediately after RULE 10's closing block:

```javascript
// RULE 11 (scripts entry point): scripts/README.md must exist
assert(
  existsSync(join(REPO_ROOT, 'scripts', 'README.md')),
  'Missing scripts/README.md — AI entry point required for scripts/ layout',
);

// RULE 12 (no legacy root scripts): no eros-*.mjs files at scripts/ root
const scriptsRootDir = join(REPO_ROOT, 'scripts');
if (existsSync(scriptsRootDir)) {
  const legacyScripts = readdirSync(scriptsRootDir).filter((f) => /^eros-.*\.mjs$/.test(f));
  if (legacyScripts.length > 0) {
    issues.push(
      `Legacy eros-*.mjs files at scripts/ root: ${legacyScripts.join(', ')}. Move into a category subdir (brain/, memory/, observer/, quality/, pipeline/, panel/, dev/) or scripts/archive/.`,
    );
  }
}

// RULE 13 (every category has README): each scripts/ subdir must have a README.md
const requiredScriptsSubdirs = ['brain', 'memory', 'observer', 'quality', 'pipeline', 'panel', 'dev', 'lib', 'archive'];
if (existsSync(scriptsRootDir)) {
  for (const subdir of requiredScriptsSubdirs) {
    const subdirPath = join(scriptsRootDir, subdir);
    if (!existsSync(subdirPath)) {
      issues.push(`Missing scripts/${subdir}/ subdirectory — scripts restructure incomplete`);
      continue;
    }
    const readmePath = join(subdirPath, 'README.md');
    if (!existsSync(readmePath)) {
      issues.push(`Missing scripts/${subdir}/README.md — every category subdir needs an entry point`);
    }
  }
}
```

- [ ] **Step 5: TDD GREEN — verify RULE 11 catches missing scripts/README.md**

Run:
```bash
mv scripts/README.md scripts/README.md.bak
node .eros/scripts/eros-doctor.mjs; echo "exit: $?"
```

Expected: 1 issue reported mentioning `scripts/README.md`, exit 1.

Restore:
```bash
mv scripts/README.md.bak scripts/README.md
node .eros/scripts/eros-doctor.mjs
```

Expected: "All checks passed", exit 0.

- [ ] **Step 6: TDD GREEN — verify RULE 12 catches eros-*.mjs at root**

Run:
```bash
touch scripts/eros-test-fixture.mjs
node .eros/scripts/eros-doctor.mjs; echo "exit: $?"
```

Expected: issue mentioning `eros-test-fixture.mjs` and "Legacy eros-*.mjs at scripts/ root".

Clean up:
```bash
rm scripts/eros-test-fixture.mjs
node .eros/scripts/eros-doctor.mjs
```

Expected: "All checks passed".

- [ ] **Step 7: TDD GREEN — verify RULE 13 catches missing subdir README**

Run:
```bash
mv scripts/brain/README.md scripts/brain/README.md.bak
node .eros/scripts/eros-doctor.mjs; echo "exit: $?"
```

Expected: issue mentioning `scripts/brain/README.md`.

Restore:
```bash
mv scripts/brain/README.md.bak scripts/brain/README.md
node .eros/scripts/eros-doctor.mjs
```

Expected: "All checks passed".

- [ ] **Step 8: Commit**

Run:
```bash
git add .eros/scripts/eros-doctor.mjs
git commit -m "feat(eros-doctor): add rules 11-13 for scripts/ layout enforcement

RULE 11: scripts/README.md must exist (AI entry point).
RULE 12: No eros-*.mjs files at scripts/ root (legacy naming banned).
RULE 13: Every category subdir (brain/memory/observer/quality/pipeline/
panel/dev/lib/archive) must have a README.md.

All three rules verified via manual TDD: create broken state, confirm
rule flags it, restore state, confirm rule passes."
```

---

## Task 14: Final validation + push

**Files:** no modifications — validation only.

- [ ] **Step 1: Full eros-doctor run**

Run:
```bash
node .eros/scripts/eros-doctor.mjs
```

Expected: "All checks passed" with 13 rules active.

- [ ] **Step 2: Verify scripts/ layout matches target**

Run:
```bash
ls scripts/
```

Expected output (alphabetical):

```
README.md
archive/
brain/
dev/
examples/
lib/
memory/
node_modules/
observer/
package-lock.json
package.json
panel/
pipeline/
quality/
```

No `.mjs`, `.js`, `.py`, `.sh` files at root. `node_modules/` is gitignored.

- [ ] **Step 3: Verify every subdir has a README**

Run:
```bash
for d in scripts/brain scripts/memory scripts/observer scripts/quality scripts/pipeline scripts/panel scripts/dev scripts/lib scripts/archive; do
  test -f "$d/README.md" && echo "OK   $d/README.md" || echo "MISS $d/README.md"
done
```

Expected: all 9 lines start with `OK`.

- [ ] **Step 4: Verify every npm alias resolves to an existing file**

Run:
```bash
cd scripts && node -e "
const pkg = require('./package.json');
let allOk = true;
for (const [alias, cmd] of Object.entries(pkg.scripts)) {
  const match = cmd.match(/node\s+([^\s]+)/) || cmd.match(/bash\s+([^\s]+)/);
  if (match) {
    const file = match[1];
    const fs = require('fs');
    if (!fs.existsSync(file)) {
      console.error('BROKEN ' + alias + ': ' + file);
      allOk = false;
    } else {
      console.log('OK ' + alias + ': ' + file);
    }
  }
}
process.exit(allOk ? 0 : 1);
" && cd ..
```

Expected: every alias shows `OK <alias>: <path>`. Exit 0.

- [ ] **Step 5: Smoke-load every moved script**

Run:
```bash
cd scripts
FAIL=0
for f in brain/state.mjs brain/context.mjs brain/gate.mjs \
         memory/memory.mjs memory/meta.mjs memory/train.mjs memory/train-reference.mjs memory/practice.mjs memory/auto-train.mjs \
         observer/observer.mjs observer/observer-v3.mjs observer/detect-changes.mjs observer/lint-ux.mjs \
         quality/audit.mjs quality/multimodal-critic.mjs quality/refresh-quality.mjs \
         pipeline/init-project.mjs pipeline/bootstrap-front-brain.mjs pipeline/select-blueprints.mjs pipeline/project-sync.mjs pipeline/sync-front-brain-runs.mjs \
         panel/server.mjs panel/feed.mjs panel/vite-watchdog.mjs \
         dev/chat.mjs dev/pucho.mjs dev/discover.mjs dev/test-e2e.mjs dev/mood.mjs dev/log.mjs dev/deploy.mjs \
         lib/utils.mjs; do
  if node -e "import('./$f').then(()=>{}, e => { console.error('FAIL $f: ' + e.message); process.exit(1); })" 2>&1; then
    :
  else
    FAIL=$((FAIL+1))
  fi
done
echo "failures: $FAIL"
cd ..
```

Expected: `failures: 0`. If any load fails, fix the specific import and re-run.

- [ ] **Step 6: Verify no stale refs repo-wide**

Run:
```bash
grep -rn "scripts/eros-[a-z-]*\.mjs\|scripts/capture-refs\|scripts/multimodal-critic\|scripts/lint-ux\|scripts/init-project\|scripts/bootstrap-front-brain\|scripts/select-blueprints\|scripts/refresh-quality\|scripts/sync-front-brain-runs\|scripts/generate-tokens\|scripts/vite-watchdog\|scripts/start-workspace" \
  --exclude-dir=scripts --exclude-dir=node_modules --exclude-dir=.git \
  --exclude-dir=.brain --exclude-dir=.omc --exclude-dir="docs/archive" . 2>&1 | head -10
```

Expected: no output.

- [ ] **Step 7: Verify commit count**

Run:
```bash
git log --oneline master..HEAD | wc -l
```

Expected: somewhere around 30+ commits (previous migrations + spec + plan + this migration's ~13 commits). Exact number varies — just confirm reasonable, not double-digit low.

- [ ] **Step 8: Push**

Run:
```bash
git push origin docs/ai-friendly
```

Expected: pushes successfully.

- [ ] **Step 9: No commit**

Validation-only task.

---

## Self-review checklist (controller, before handoff)

Run after all tasks complete:

- [ ] `node .eros/scripts/eros-doctor.mjs` — all 13 rules pass
- [ ] `ls scripts/` shows only: `README.md`, `package.json`, `package-lock.json`, `archive/`, `brain/`, `dev/`, `examples/`, `lib/`, `memory/`, `observer/`, `panel/`, `pipeline/`, `quality/` (plus `node_modules/` gitignored)
- [ ] No `.mjs`, `.js`, `.py`, `.sh` files at `scripts/` root
- [ ] Every required subdir has `README.md`
- [ ] All 19 npm aliases resolve to existing files
- [ ] Every moved script smoke-loads without `ERR_MODULE_NOT_FOUND`
- [ ] `panel/package.json` `sync:runs` and `workspace` point to correct new paths
- [ ] `.eros/brain-config.md`, `.eros/front-brain/README.md`, `.eros/front-brain/runtime/README.md` updated
- [ ] Root `README.md` scripts table reflects new paths
- [ ] Zero stale refs from grep audit (excluding `docs/archive/`)
- [ ] Branch pushed

If any check fails, the corresponding task was incomplete — fix and re-run.
