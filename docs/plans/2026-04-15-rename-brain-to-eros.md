# Rename `brain` → `eros` Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate the legacy `brain` nomenclature across three distinct subsystems and align every layer of the repo under the `eros` brand, without breaking existing Desktop projects, the Vite panel, or the agent pipeline.

**Architecture:** Three independent phases, each shipped as an atomic PR. Each phase produces a working, testable system on its own and can be paused/rolled back without affecting the others. Phase order is chosen to minimize blast radius: internal module first, then panel subsystem, then runtime contract (which touches external projects in Desktop).

**Tech Stack:** Node.js ESM scripts, Vue 3 + Vite panel, Claude Code hooks, git (with `git mv` to preserve history), bash for migration scripts.

**Three subsystems being renamed:**

| # | Concept | From | To | Phase |
|---|---------|------|------|-------|
| 1 | Internal orchestration module | `scripts/brain/` | `scripts/eros-core/` | Phase 1 |
| 2 | Panel runtime feed subsystem | `front-brain` (path + symbols) | `eros-feed` | Phase 2 |
| 3 | Per-project working memory | `.brain/` (inside every generated project) | `.eros-run/` | Phase 3 |

---

## Principles (apply to every task)

1. **`git mv` always** — never `rm` + `cp` for renames. Preserves history.
2. **One PR per phase** — do not merge phases together. If Phase 1 lands but Phase 2 stalls, the repo stays consistent.
3. **Never touch `docs/archive/`** — historical proposals intentionally reflect the old vocabulary. Preserve the record.
4. **Never rewrite `.omc/*.{admin,superadmin}-done` files** — these are frozen snapshots of completed work.
5. **Do not touch `JetBrains Mono`, `Creative Brain`, `Brain State`** markdown titles or font stacks — those are UX/product strings, not structural identifiers (see "False positives" at end).
6. **Commit after every coherent capability change**, not at the end. If CI breaks mid-phase, bisect must be viable.
7. **Each phase ends with a full `eros-doctor` run + a manual panel smoke test** before opening the PR.

---

## Global Baseline (do this once, before Phase 1)

**Goal:** snapshot current state so post-rename diffs can be verified.

- [ ] **B1: Verify clean working tree**

Run:
```bash
cd C:/Users/mateo/Desktop/Eros
git status
```

Expected: `nothing to commit, working tree clean` (or only the known modified session files — commit or stash them first).

- [ ] **B2: Create working branch**

Run:
```bash
git checkout -b refactor/rename-brain-to-eros-phase-1
```

Expected: `Switched to a new branch 'refactor/rename-brain-to-eros-phase-1'`.

- [ ] **B3: Snapshot baseline match counts**

Run:
```bash
mkdir -p .brain/baseline-snapshot
rg -i 'brain' --glob '!node_modules' --glob '!.git' --glob '!docs/archive' --glob '!_components/heroes/S-BentoDashboard.vue' --stats > .brain/baseline-snapshot/brain-counts-before.txt 2>&1
rg --fixed-strings '.brain' --glob '!node_modules' --glob '!.git' --glob '!docs/archive' --stats > .brain/baseline-snapshot/dot-brain-counts-before.txt 2>&1
```

Expected: Two text files created. The final lines of each should state the total match/file counts matching what this plan targets (~1295 refs / 106 files for `brain`, ~356 refs / 52 files for `.brain`).

- [ ] **B4: Run `eros-doctor` to establish green baseline**

Run:
```bash
node .eros/scripts/eros-doctor.mjs
```

Expected: Exit code 0. If any rule fails, **STOP** and fix the pre-existing issue first. Do not start the rename on a red baseline.

- [ ] **B5: Smoke-test the panel dev server**

Run:
```bash
cd panel && npm run dev
```

Expected: vite boots on `http://localhost:4000`, `/__eros/status` responds with `{"watchActive":false,"logCount":...}`. Stop the server with Ctrl+C before proceeding.

---

# Phase 1 — Rename `scripts/brain/` → `scripts/eros-core/`

**Scope:** Internal orchestration module only. No external contracts touched. Safest phase — ship this alone if you lose appetite for Phase 2/3.

**Files affected (9):**
- Rename: `scripts/brain/` → `scripts/eros-core/` (4 files: `state.mjs`, `context.mjs`, `gate.mjs`, `README.md`)
- Modify: `scripts/package.json` (4 aliases)
- Modify: `.eros/scripts/eros-doctor.mjs` (line 189 and comments)
- Modify: `scripts/README.md` (if it references `brain/`)
- Modify: `.omc/prd.json` (4 lines — active PRD)

**Docs with references (update after code is green):**
- `docs/plans/2026-04-14-scripts-restructure.md` (101 refs — most are historical narrative, update only the instructional ones)
- `docs/specs/2026-04-14-scripts-restructure-design.md` (41 refs)
- `.eros/pipeline.md` (mentions `scripts/brain/` indirectly)

---

### Task 1.1: Rename the directory

**Files:**
- Move: `scripts/brain/` → `scripts/eros-core/`

- [ ] **Step 1: Verify the source directory exists and is clean**

Run:
```bash
ls scripts/brain/
```

Expected output:
```
README.md  context.mjs  gate.mjs  state.mjs
```

- [ ] **Step 2: Move the directory with git**

Run:
```bash
git mv scripts/brain scripts/eros-core
```

Expected: no output, exit 0.

- [ ] **Step 3: Verify the rename was staged**

Run:
```bash
git status
```

Expected:
```
renamed:    scripts/brain/README.md -> scripts/eros-core/README.md
renamed:    scripts/brain/context.mjs -> scripts/eros-core/context.mjs
renamed:    scripts/brain/gate.mjs -> scripts/eros-core/gate.mjs
renamed:    scripts/brain/state.mjs -> scripts/eros-core/state.mjs
```

- [ ] **Step 4: Verify no intra-module imports broke**

The three `.mjs` files share `../lib/utils.mjs` but do not import each other. Confirm:

Run:
```bash
grep -n "import.*from" scripts/eros-core/*.mjs
```

Expected: every `from` path starts with `../` or `node:`. No relative path references its sibling `.mjs` files.

- [ ] **Step 5: Commit the rename alone**

```bash
git add scripts/eros-core/ scripts/brain/
git commit -m "refactor: rename scripts/brain → scripts/eros-core (move only, no content change)"
```

---

### Task 1.2: Update `scripts/package.json` aliases

**Files:**
- Modify: `scripts/package.json` (lines 6, 13, 15, 16)

- [ ] **Step 1: Read the current aliases that point to `brain/`**

Run:
```bash
grep -n "brain" scripts/package.json
```

Expected:
```
6:    "bootstrap:brain": "node pipeline/bootstrap-front-brain.mjs",
13:    "eros:state": "node brain/state.mjs",
15:    "eros:gate": "node brain/gate.mjs",
16:    "eros:context": "node brain/context.mjs",
```

Note: line 6 references `pipeline/bootstrap-front-brain.mjs` — that's Phase 2 territory, leave untouched.

- [ ] **Step 2: Update the three `eros:*` aliases**

Edit `scripts/package.json`. Change:

```json
    "eros:state": "node brain/state.mjs",
    ...
    "eros:gate": "node brain/gate.mjs",
    "eros:context": "node brain/context.mjs",
```

To:

```json
    "eros:state": "node eros-core/state.mjs",
    ...
    "eros:gate": "node eros-core/gate.mjs",
    "eros:context": "node eros-core/context.mjs",
```

Leave the `bootstrap:brain` alias alone — that's renamed in Phase 2.

- [ ] **Step 3: Verify the three aliases run**

Run:
```bash
cd scripts && npm run eros:state -- --help 2>&1 | head -5
```

Expected: either a help message or the first few lines of output — the key is **no `Error: Cannot find module`**. If the script has no `--help`, accept any non-module-not-found output.

Run the same for `eros:gate` and `eros:context`:
```bash
npm run eros:gate -- --help 2>&1 | head -5
npm run eros:context -- --help 2>&1 | head -5
cd ..
```

Expected: no "Cannot find module" errors.

- [ ] **Step 4: Commit**

```bash
git add scripts/package.json
git commit -m "refactor(scripts): point eros:state/gate/context aliases to eros-core/"
```

---

### Task 1.3: Update `eros-doctor.mjs` required subdirs list

**Files:**
- Modify: `.eros/scripts/eros-doctor.mjs` (line 189)

- [ ] **Step 1: Read the current `requiredScriptsSubdirs` constant**

Run:
```bash
grep -n "requiredScriptsSubdirs" .eros/scripts/eros-doctor.mjs
```

Expected:
```
189:const requiredScriptsSubdirs = ['brain', 'memory', 'observer', 'quality', 'pipeline', 'panel', 'dev', 'lib', 'archive'];
```

- [ ] **Step 2: Replace `'brain'` with `'eros-core'`**

Edit `.eros/scripts/eros-doctor.mjs` line 189:

From:
```javascript
const requiredScriptsSubdirs = ['brain', 'memory', 'observer', 'quality', 'pipeline', 'panel', 'dev', 'lib', 'archive'];
```

To:
```javascript
const requiredScriptsSubdirs = ['eros-core', 'memory', 'observer', 'quality', 'pipeline', 'panel', 'dev', 'lib', 'archive'];
```

- [ ] **Step 3: Update the help-text in rule 12 (around line 183)**

Run:
```bash
grep -n "brain/, memory/, observer" .eros/scripts/eros-doctor.mjs
```

Expected: line 183 contains `brain/, memory/, observer/, quality/, pipeline/, panel/, dev/`.

Edit that line, replacing `brain/` with `eros-core/`:

From:
```
Move into a category subdir (brain/, memory/, observer/, quality/, pipeline/, panel/, dev/) or scripts/archive/.
```

To:
```
Move into a category subdir (eros-core/, memory/, observer/, quality/, pipeline/, panel/, dev/) or scripts/archive/.
```

- [ ] **Step 4: Run `eros-doctor` to verify**

Run:
```bash
node .eros/scripts/eros-doctor.mjs
```

Expected: exit code 0. Specifically, rule 13 must pass (`scripts/eros-core/README.md` exists).

- [ ] **Step 5: Commit**

```bash
git add .eros/scripts/eros-doctor.mjs
git commit -m "refactor(eros-doctor): expect scripts/eros-core/ instead of scripts/brain/"
```

---

### Task 1.4: Update internal scripts README and other code refs

**Files:**
- Modify: `scripts/README.md` (4 refs)
- Modify: `scripts/eros-core/README.md` (1 ref — its own header says `# brain/`)

- [ ] **Step 1: Update `scripts/eros-core/README.md` header**

Read it first:
```bash
cat scripts/eros-core/README.md
```

The first line is `# brain/`. Edit it to:
```markdown
# eros-core/
```

And the description `Orchestration core — scripts that drive the autonomous next/done loop and gate decisions.` stays as-is (it doesn't say "brain").

- [ ] **Step 2: Update `scripts/README.md`**

Run:
```bash
grep -n "brain" scripts/README.md
```

For each occurrence, decide case by case:
- If it describes the `scripts/brain/` subdir → replace with `scripts/eros-core/`
- If it references `.brain/` (the per-project directory) → **leave untouched** (that's Phase 3)
- If it references `front-brain` or the panel subsystem → **leave untouched** (that's Phase 2)

Typical changes: anywhere the README lists `brain/` as a subdir of `scripts/`, change to `eros-core/`.

- [ ] **Step 3: Scan for any other code references**

Run:
```bash
rg 'scripts/brain/' --glob '!node_modules' --glob '!.git' --glob '!docs/archive' -n
```

Expected result after the prior tasks: only hits in `docs/plans/2026-04-14-*.md`, `docs/specs/2026-04-14-*.md`, `.omc/prd.json`, and possibly narrative `.eros/*.md` files. No hits in `.mjs`, `.js`, `.vue`, or `.json` (except `.omc/prd.json`).

If any `.mjs`/`.js`/`.vue` file matches, update it. Each match should be a literal string — swap `scripts/brain/` for `scripts/eros-core/`.

- [ ] **Step 4: Commit**

```bash
git add scripts/README.md scripts/eros-core/README.md
git commit -m "docs(scripts): update READMEs to reference eros-core/"
```

---

### Task 1.5: Update active PRD and planning docs

**Files:**
- Modify: `.omc/prd.json` (4 relevant lines — skip archived `.omc/prd.json.*-done`)
- Modify: `docs/plans/2026-04-14-scripts-restructure.md` (instructional refs only)
- Modify: `docs/specs/2026-04-14-scripts-restructure-design.md` (instructional refs only)

- [ ] **Step 1: Update `.omc/prd.json` — only references to `scripts/brain/`**

Run:
```bash
grep -n "brain" .omc/prd.json
```

For each hit, update only those that say `scripts/brain/`, `brain/state,context,gate`, or similar structural references to the module being renamed.

**Do NOT change:**
- References to `.brain/` (that's Phase 3)
- References to `front-brain` or `bootstrap-front-brain` (that's Phase 2)

Specific lines to change (from the grep of `.omc/prd.json`):
- Line 40: `"Dirs exist: scripts/{brain,memory,...}"` → `"Dirs exist: scripts/{eros-core,memory,...}"`
- Line 61: `"Move brain/ (state, context, gate)..."` → `"Move eros-core/ (state, context, gate)..."`
- Line 67: `"scripts/brain/{state,context,gate}.mjs exist"` → `"scripts/eros-core/{state,context,gate}.mjs exist"`
- Line 69: `"...aliases eros:state/context/gate point to brain/"` → `"...aliases eros:state/context/gate point to eros-core/"`
- Line 204: `"Removing scripts/brain/README.md..."` → `"Removing scripts/eros-core/README.md..."`
- Line 217: `"ls scripts/ shows...brain/, dev/, examples/..."` → `"ls scripts/ shows...eros-core/, dev/, examples/..."`

- [ ] **Step 2: Update `docs/plans/2026-04-14-scripts-restructure.md`**

This file has 101 `brain` refs. Most describe the original restructure plan (historical context — leave alone). Update only the refs that describe the current or future state of `scripts/brain/`.

Strategy: open the file, search for `scripts/brain/` (literal), and update each hit. Leave `.brain/` refs (per-project working memory) and `front-brain` refs untouched.

After editing, verify:
```bash
grep -c "scripts/brain/" docs/plans/2026-04-14-scripts-restructure.md
```

Expected: 0 (or very few — any remaining must be historical "previously was named X").

- [ ] **Step 3: Same treatment for `docs/specs/2026-04-14-scripts-restructure-design.md`**

Same approach — replace only structural references to `scripts/brain/` with `scripts/eros-core/`.

- [ ] **Step 4: Run eros-doctor one more time**

Run:
```bash
node .eros/scripts/eros-doctor.mjs
```

Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add .omc/prd.json docs/plans/2026-04-14-scripts-restructure.md docs/specs/2026-04-14-scripts-restructure-design.md
git commit -m "docs: update PRD + scripts-restructure docs for eros-core rename"
```

---

### Task 1.6: Phase 1 validation

- [ ] **Step 1: No `scripts/brain/` references remain in executable code**

Run:
```bash
rg 'scripts/brain/' -t js -t ts --glob '*.vue' --glob '*.mjs' --glob '*.json' --glob '!node_modules' --glob '!.git' --glob '!docs/archive' -n
```

Expected: no matches (or only matches inside string literals that are clearly historical comments).

- [ ] **Step 2: `eros-doctor` passes**

Run:
```bash
node .eros/scripts/eros-doctor.mjs
```

Expected: exit 0, all rules pass.

- [ ] **Step 3: Panel still boots**

Run:
```bash
cd panel && timeout 20 npm run dev 2>&1 | head -30 ; cd ..
```

Expected: vite boots without module-resolution errors. Kill after you see the "Local: http://localhost:4000" line.

- [ ] **Step 4: Push the Phase 1 branch and open PR**

```bash
git push -u origin refactor/rename-brain-to-eros-phase-1
gh pr create --title "refactor: rename scripts/brain → scripts/eros-core" --body "$(cat <<'EOF'
## Summary
- Rename `scripts/brain/` → `scripts/eros-core/` (preserves git history via `git mv`)
- Update `scripts/package.json` aliases `eros:state`, `eros:gate`, `eros:context` to new path
- Update `eros-doctor.mjs` rule 13 + help text to expect `eros-core/`
- Update active PRD (`.omc/prd.json`), `scripts-restructure` plan/spec

## Not included (future PRs)
- Phase 2: `front-brain` → `eros-feed` (panel subsystem)
- Phase 3: `.brain/` → `.eros-run/` (per-project working memory)

## Test plan
- [x] `node .eros/scripts/eros-doctor.mjs` → exit 0
- [x] `cd panel && npm run dev` boots vite without errors
- [x] `npm run eros:state --help` (inside scripts/) resolves the new path
- [x] `docs/archive/` unchanged (historical record preserved)
EOF
)"
```

**STOP here.** Merge Phase 1 before starting Phase 2. Do not work on both branches simultaneously.

---

# Phase 2 — Rename `front-brain` → `eros-feed`

**Prerequisite:** Phase 1 merged to main.

**Scope:** Panel runtime feed subsystem. Touches panel Vue code, pipeline scripts, the runtime JSON contract, and the schema doc. Does **not** touch the per-project `.brain/` directory.

**Files affected (17):**
- Rename: `.eros/front-brain/` → `.eros/eros-feed/`
- Rename: `.eros/FRONT_BRAIN_SCHEMA.md` → `.eros/EROS_FEED_SCHEMA.md`
- Rename: `panel/src/data/frontBrain.js` → `panel/src/data/erosFeed.js`
- Rename: `scripts/pipeline/bootstrap-front-brain.mjs` → `scripts/pipeline/bootstrap-eros-feed.mjs`
- Rename: `scripts/pipeline/sync-front-brain-runs.mjs` → `scripts/pipeline/sync-eros-feed-runs.mjs`
- Rename: `scripts/examples/front-brain-brief.example.json` → `scripts/examples/eros-feed-brief.example.json`
- Modify: `panel/vite.config.js` (alias)
- Modify: `panel/package.json` (script command)
- Modify: `scripts/package.json` (aliases `bootstrap:brain`, `sync:runs`)
- Modify: `panel/vite-plugin-eros.js` (internal paths + comment cleanup)
- Modify: 8 Vue files importing `frontBrain.js`
- Modify: `.gitignore` (lines 60, 62)
- Modify: relevant docs in `.eros/pipeline.md`, active specs, `scripts/README.md`

**Not renamed in this phase:**
- `panel/src/views/eros/ErosBrain.vue` — this is a user-facing VIEW name (`/eros` route). It's a product/brand choice. Leave it; rename separately if the user wants.
- `"Creative Brain"` UX string in `MainShell.vue:75` — product copy, not structural.
- `.eros/brain-config.md` — that file describes the per-project `.brain/` orchestration; renamed in Phase 3 alongside `.brain/`.

---

### Task 2.1: Branch off main

- [ ] **Step 1: Start a clean branch off main**

Run:
```bash
git checkout main
git pull
git checkout -b refactor/rename-brain-to-eros-phase-2
```

Expected: `Switched to a new branch 'refactor/rename-brain-to-eros-phase-2'`.

---

### Task 2.2: Rename the `.eros/front-brain/` directory and schema

**Files:**
- Move: `.eros/front-brain/` → `.eros/eros-feed/`
- Move: `.eros/FRONT_BRAIN_SCHEMA.md` → `.eros/EROS_FEED_SCHEMA.md`

- [ ] **Step 1: Move the directory**

Run:
```bash
git mv .eros/front-brain .eros/eros-feed
```

Expected: no output, exit 0.

- [ ] **Step 2: Rename the schema doc**

Run:
```bash
git mv .eros/FRONT_BRAIN_SCHEMA.md .eros/EROS_FEED_SCHEMA.md
```

Expected: no output, exit 0.

- [ ] **Step 3: Update the header of the schema doc**

Edit `.eros/EROS_FEED_SCHEMA.md`. Find the top heading and body text and replace `Front-Brain` / `front-brain` with `Eros Feed` / `eros-feed` where it describes the subsystem itself (not historical references).

- [ ] **Step 4: Update README + ROADMAP inside `.eros/eros-feed/`**

Run:
```bash
grep -rn "front-brain\|Front-Brain" .eros/eros-feed/
```

For each match, replace with `eros-feed` / `Eros Feed` preserving case style.

- [ ] **Step 5: Commit**

```bash
git add .eros/eros-feed/ .eros/EROS_FEED_SCHEMA.md .eros/front-brain .eros/FRONT_BRAIN_SCHEMA.md
git commit -m "refactor: rename .eros/front-brain → .eros/eros-feed + schema doc"
```

---

### Task 2.3: Rename `panel/src/data/frontBrain.js`

**Files:**
- Move: `panel/src/data/frontBrain.js` → `panel/src/data/erosFeed.js`
- Modify: the file's own comments/exports if they self-reference
- Modify: 8 importer files

- [ ] **Step 1: Move the file**

Run:
```bash
git mv panel/src/data/frontBrain.js panel/src/data/erosFeed.js
```

- [ ] **Step 2: Rename the `frontBrainSnapshot` export inside the file**

Edit `panel/src/data/erosFeed.js`:

Find (line ~270):
```javascript
export const frontBrainSnapshot = computed(() => ({
```

Replace with:
```javascript
export const erosFeedSnapshot = computed(() => ({
```

- [ ] **Step 3: Rename self-referential comments**

In the same file, search for `frontBrain.js` in comments. Any comment that says "also imported by frontBrain.js" (or similar) should now say `erosFeed.js`.

- [ ] **Step 4: Identify all importers**

Run:
```bash
rg "from '@/data/frontBrain" panel/src/ -n
```

Expected matches (8 files):
```
panel/src/components/ErosShell.vue
panel/src/components/PanelShell.vue
panel/src/views/Blueprints.vue
panel/src/views/Calidad.vue
panel/src/views/Componentes.vue
panel/src/views/Eros.vue
panel/src/views/Resumen.vue
(plus any others grep reveals)
```

- [ ] **Step 5: Update each importer**

For each file from Step 4, change the import path `'@/data/frontBrain.js'` → `'@/data/erosFeed.js'`. Also, if the file imports the `frontBrainSnapshot` symbol, rename it to `erosFeedSnapshot`.

Specifically for `panel/src/views/Calidad.vue`, lines 8 and 279-280 also reference `frontBrainSnapshot` in the template — update those too.

- [ ] **Step 6: Update the composable cross-reference**

Edit `panel/src/composables/useMemory.js` lines 3 and 25, which contain the comment `"Also imported by frontBrain.js"` — change to `"Also imported by erosFeed.js"`.

- [ ] **Step 7: Verify the panel type-checks**

Run:
```bash
cd panel && npm run build 2>&1 | tail -20 ; cd ..
```

Expected: build succeeds. If any file still says `frontBrain`, the build log will tell you where.

- [ ] **Step 8: Commit**

```bash
git add panel/src/data/erosFeed.js panel/src/data/frontBrain.js panel/src/components/ panel/src/views/ panel/src/composables/useMemory.js
git commit -m "refactor(panel): rename frontBrain.js → erosFeed.js + frontBrainSnapshot → erosFeedSnapshot"
```

---

### Task 2.4: Update Vite alias and panel plugin paths

**Files:**
- Modify: `panel/vite.config.js` line 16
- Modify: `panel/vite-plugin-eros.js` lines 8, 42, 687-692 (comment)

- [ ] **Step 1: Update the Vite alias**

Edit `panel/vite.config.js` line 16.

From:
```javascript
      '@front-brain-runtime': path.resolve(__dirname, '../.eros/front-brain/runtime'),
```

To:
```javascript
      '@eros-feed-runtime': path.resolve(__dirname, '../.eros/eros-feed/runtime'),
```

- [ ] **Step 2: Update the alias consumer in `erosFeed.js`**

Edit `panel/src/data/erosFeed.js` line 2.

From:
```javascript
import initialCache from '@front-brain-runtime/runs.generated.json'
```

To:
```javascript
import initialCache from '@eros-feed-runtime/runs.generated.json'
```

- [ ] **Step 3: Update `panel/vite-plugin-eros.js` line 8**

Current (note: it also uses `.claude/` which is a pre-existing bug):
```javascript
const runtimeFile = path.resolve(__dirname, '..', '.claude', 'front-brain', 'runtime', 'runs.generated.json')
```

Fix both the legacy `.claude/` AND the `front-brain` → `eros-feed` rename:
```javascript
const runtimeFile = path.resolve(__dirname, '..', '.eros', 'eros-feed', 'runtime', 'runs.generated.json')
```

- [ ] **Step 4: Update `panel/vite-plugin-eros.js` line 42**

From:
```javascript
    const script = path.join(scriptsDir, 'sync-front-brain-runs.mjs')
```

To:
```javascript
    const script = path.join(scriptsDir, 'pipeline', 'sync-eros-feed-runs.mjs')
```

Note: this also fixes the missing `pipeline/` segment (another pre-existing bug — script was moved to `pipeline/` during scripts-restructure but this line wasn't updated).

- [ ] **Step 5: Update the `sync-front-brain-runs.mjs --watch` comment**

Still in `panel/vite-plugin-eros.js`, around line 687-692:

From:
```javascript
      // It was spawning sync-front-brain-runs.mjs --watch, which opened a
      ...
      //   node ../scripts/sync-front-brain-runs.mjs --watch
```

To:
```javascript
      // It was spawning sync-eros-feed-runs.mjs --watch, which opened a
      ...
      //   node ../scripts/pipeline/sync-eros-feed-runs.mjs --watch
```

- [ ] **Step 6: Rebuild the panel**

Run:
```bash
cd panel && npm run build 2>&1 | tail -10 ; cd ..
```

Expected: clean build, no `Cannot find module` or `Failed to resolve import` errors.

- [ ] **Step 7: Commit**

```bash
git add panel/vite.config.js panel/vite-plugin-eros.js panel/src/data/erosFeed.js
git commit -m "refactor(panel): point vite alias + plugin at .eros/eros-feed/ runtime"
```

---

### Task 2.5: Rename pipeline scripts

**Files:**
- Move: `scripts/pipeline/bootstrap-front-brain.mjs` → `scripts/pipeline/bootstrap-eros-feed.mjs`
- Move: `scripts/pipeline/sync-front-brain-runs.mjs` → `scripts/pipeline/sync-eros-feed-runs.mjs`
- Move: `scripts/examples/front-brain-brief.example.json` → `scripts/examples/eros-feed-brief.example.json`
- Modify: `scripts/package.json` (2 aliases)
- Modify: `panel/package.json` (1 script)
- Modify: script internals (self-referential names)

- [ ] **Step 1: Move the scripts**

Run:
```bash
git mv scripts/pipeline/bootstrap-front-brain.mjs scripts/pipeline/bootstrap-eros-feed.mjs
git mv scripts/pipeline/sync-front-brain-runs.mjs scripts/pipeline/sync-eros-feed-runs.mjs
git mv scripts/examples/front-brain-brief.example.json scripts/examples/eros-feed-brief.example.json
```

- [ ] **Step 2: Update internal self-references in the two scripts**

Run:
```bash
grep -n "front-brain\|front_brain\|Front-Brain" scripts/pipeline/bootstrap-eros-feed.mjs scripts/pipeline/sync-eros-feed-runs.mjs
```

For each match in **comments, log messages, CLI help, file paths**, replace `front-brain` → `eros-feed` (preserving hyphen/underscore style). Do **NOT** replace `.brain` (literal, with leading dot) — that's Phase 3.

- [ ] **Step 3: Update `scripts/package.json` aliases**

Edit `scripts/package.json`:

From:
```json
    "bootstrap:brain": "node pipeline/bootstrap-front-brain.mjs",
    ...
    "sync:runs": "node pipeline/sync-front-brain-runs.mjs",
```

To:
```json
    "bootstrap:feed": "node pipeline/bootstrap-eros-feed.mjs",
    ...
    "sync:feed": "node pipeline/sync-eros-feed-runs.mjs",
```

(Renamed the alias keys too — `bootstrap:feed` and `sync:feed` are clearer than `bootstrap:brain` and the generic `sync:runs`.)

- [ ] **Step 4: Update `panel/package.json` script**

Edit `panel/package.json`:

From:
```json
    "sync:runs": "node ../scripts/pipeline/sync-front-brain-runs.mjs",
    "dev": "npm run sync:runs && vite --port 4000",
    "build": "npm run sync:runs && vite build --emptyOutDir false",
```

To:
```json
    "sync:feed": "node ../scripts/pipeline/sync-eros-feed-runs.mjs",
    "dev": "npm run sync:feed && vite --port 4000",
    "build": "npm run sync:feed && vite build --emptyOutDir false",
```

- [ ] **Step 5: Smoke-test the renamed scripts**

Run:
```bash
cd scripts && npm run bootstrap:feed -- --help 2>&1 | head -5
npm run sync:feed -- --help 2>&1 | head -5
cd ..
```

Expected: no "Cannot find module" errors.

- [ ] **Step 6: Run a full panel build**

Run:
```bash
cd panel && npm run build 2>&1 | tail -10 ; cd ..
```

Expected: clean. The `sync:feed` step will run before vite and regenerate `.eros/eros-feed/runtime/runs.generated.json`.

- [ ] **Step 7: Commit**

```bash
git add scripts/pipeline/ scripts/examples/ scripts/package.json panel/package.json
git commit -m "refactor(pipeline): rename bootstrap/sync scripts front-brain → eros-feed + update aliases"
```

---

### Task 2.6: Update `.gitignore` and remaining code refs

**Files:**
- Modify: `.gitignore` (lines 60, 62)
- Possibly: `scripts/archive/eros-orchestrator.mjs`, `scripts/archive/eros-migrate-audits.mjs` — these are archived but may contain live references if scripts still invoke them. Scan and decide.

- [ ] **Step 1: Update `.gitignore`**

Current:
```
.claude/front-brain/runtime/runs.generated.json
...
.eros/front-brain/runtime/runs.generated.json
```

New:
```
.eros/eros-feed/runtime/runs.generated.json
```

(Delete the `.claude/front-brain/...` line — it's legacy from when the path used `.claude/`. If you want to be defensive, leave it for one PR cycle.)

- [ ] **Step 2: Scan for remaining `front-brain` refs in executable code**

Run:
```bash
rg -i 'front[-_]brain' -t js --glob '*.vue' --glob '*.mjs' --glob '*.json' --glob '!node_modules' --glob '!.git' --glob '!docs/archive' -n
```

Expected: only hits in `docs/plans/`, `docs/specs/`, narrative `.eros/*.md`, and possibly `.omc/prd.json`. No hits in `.mjs`/`.vue`/`.js` executable code.

If any executable file matches, update it in this task.

- [ ] **Step 3: Commit**

```bash
git add .gitignore
git commit -m "chore(gitignore): update eros-feed runtime path + drop legacy .claude/front-brain"
```

---

### Task 2.7: Update active docs

**Files:**
- Modify: `.eros/pipeline.md` (35 `.brain` + 46 `brain` refs — **only** change `front-brain` refs here; `.brain/` is Phase 3)
- Modify: `scripts/README.md` (any `front-brain` refs)
- Modify: `scripts/pipeline/README.md`
- Modify: `docs/plans/2026-04-14-scripts-restructure.md` (instructional refs only)
- Modify: `docs/specs/2026-04-14-scripts-restructure-design.md` (instructional refs only)
- Modify: `.omc/prd.json` (active — lines mentioning `bootstrap-front-brain`, `sync-front-brain-runs`)

- [ ] **Step 1: Pattern-match and update**

For each of the files above, run:
```bash
grep -n "front-brain\|bootstrap:brain\|sync:runs" <file>
```

For each hit:
- Replace `front-brain` → `eros-feed` (in paths, headers, prose about the subsystem)
- Replace `bootstrap:brain` → `bootstrap:feed` (alias name)
- Replace `sync:runs` → `sync:feed` (alias name)
- **Leave alone** if the ref is about `.brain/` (per-project memory) or about Phase 3 concepts.

- [ ] **Step 2: Run eros-doctor**

Run:
```bash
node .eros/scripts/eros-doctor.mjs
```

Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add .eros/pipeline.md scripts/README.md scripts/pipeline/README.md docs/plans/ docs/specs/ .omc/prd.json
git commit -m "docs: update active docs for eros-feed rename"
```

---

### Task 2.8: Phase 2 validation

- [ ] **Step 1: No executable `front-brain` references remain**

Run:
```bash
rg -i 'front[-_]brain' -t js --glob '*.vue' --glob '*.mjs' --glob '*.json' --glob '!node_modules' --glob '!.git' --glob '!docs/archive' -n
```

Expected: no hits.

- [ ] **Step 2: Panel dev server generates `runs.generated.json` at the new path**

Run:
```bash
cd panel && timeout 30 npm run dev 2>&1 | head -40 ; cd ..
ls -la .eros/eros-feed/runtime/runs.generated.json
```

Expected: file exists, mtime is recent.

- [ ] **Step 3: eros-doctor green**

```bash
node .eros/scripts/eros-doctor.mjs
```

Expected: exit 0.

- [ ] **Step 4: Push + PR**

```bash
git push -u origin refactor/rename-brain-to-eros-phase-2
gh pr create --title "refactor: rename front-brain → eros-feed (panel subsystem)" --body "$(cat <<'EOF'
## Summary
- Rename `.eros/front-brain/` → `.eros/eros-feed/`
- Rename `.eros/FRONT_BRAIN_SCHEMA.md` → `.eros/EROS_FEED_SCHEMA.md`
- Rename `panel/src/data/frontBrain.js` → `panel/src/data/erosFeed.js` (and `frontBrainSnapshot` → `erosFeedSnapshot`)
- Rename pipeline scripts: `bootstrap-front-brain.mjs`, `sync-front-brain-runs.mjs`
- Rename npm aliases: `bootstrap:brain` → `bootstrap:feed`, `sync:runs` → `sync:feed`
- Fix pre-existing `.claude/front-brain/` reference bug in `vite-plugin-eros.js`

## Not included
- Phase 3: `.brain/` → `.eros-run/` (per-project working memory + migration of Desktop projects)
- `ErosBrain.vue` view name + `"Creative Brain"` UX string (product decisions)

## Test plan
- [x] `cd panel && npm run build` completes cleanly
- [x] `.eros/eros-feed/runtime/runs.generated.json` is regenerated by `sync:feed`
- [x] `node .eros/scripts/eros-doctor.mjs` → exit 0
- [x] No executable code still references `front-brain`
EOF
)"
```

**STOP here.** Merge Phase 2 before starting Phase 3.

---

# Phase 3 — Rename `.brain/` → `.eros-run/`

**Prerequisite:** Phases 1 and 2 merged to main.

**Scope:** Per-project working memory directory. This is the **biggest** phase: it touches the runtime contract with ~20 existing projects on your Desktop, hardcoded paths in 15+ scripts, Claude hooks, every agent file, and the `.gitignore`.

**Critical constraint:** projects already generated in `C:\Users\mateo\Desktop\*\.brain\` must be migrated atomically with the code change, or the panel's project list goes empty.

**Files affected (~40):**

Structure:
- Rename: `_project-scaffold/.brain/` → `_project-scaffold/.eros-run/`
- Rename: `.eros/eros-feed/examples/demo-run/.brain/` → `.eros/eros-feed/examples/demo-run/.eros-run/`
- Rename: `.eros/brain-config.md` → `.eros/eros-run-config.md`

Scripts (path literals):
- `scripts/eros-core/state.mjs`, `context.mjs`, `gate.mjs` (~56 refs total, all `.brain/`)
- `scripts/pipeline/bootstrap-eros-feed.mjs` (24 `.brain` refs)
- `scripts/pipeline/sync-eros-feed-runs.mjs` (25 refs)
- `scripts/quality/refresh-quality.mjs` (15 refs)
- `scripts/panel/server.mjs` (3 refs)
- `scripts/memory/auto-train.mjs` (4 refs), `meta.mjs` (2), `train.mjs` (4)
- `scripts/dev/test-e2e.mjs` (23 refs), `start-workspace.sh` (1), `auto-practice.sh` (2), `chat.mjs` (2), `log.mjs` (4)
- `scripts/observer/detect-changes.mjs` (1)
- `scripts/archive/` — leave historical scripts alone unless still called

Panel:
- `panel/vite-plugin-eros.js` (8 refs, all paths under `Desktop/*/.brain/`)

Hooks:
- `.claude/settings.json` lines 18, 27, 47, 67 (regex patterns)

Agents:
- `.eros/agents/{builder,designer,evaluator,polisher}.md`
- `.claude/agents/{builder,designer,polisher}.md`

Docs:
- `.eros/pipeline.md` (35 `.brain` refs)
- `.eros/eros-run-config.md` (after rename) (7 refs)
- `.eros/workflows/project.md`
- `docs/plans/hardening-audit.md`, active `2026-04-14-*.md` plans
- Active specs
- `.omc/prd.json`, `.omc/progress.txt`

Config:
- `.gitignore` line 53 (`/.brain/`)

Migration:
- NEW: `scripts/dev/migrate-eros-run.mjs` (one-shot migration script for Desktop projects)

---

### Task 3.1: Branch off main and inventory Desktop projects

- [ ] **Step 1: Branch**

```bash
git checkout main
git pull
git checkout -b refactor/rename-brain-to-eros-phase-3
```

- [ ] **Step 2: Inventory existing Desktop projects with `.brain/`**

Run:
```bash
mkdir -p .brain/migration-baseline
for d in ~/Desktop/*/; do
  if [ -d "${d}.brain" ]; then
    echo "${d}" >> .brain/migration-baseline/projects-with-brain.txt
  fi
done
wc -l .brain/migration-baseline/projects-with-brain.txt
```

Expected: a text file listing every Desktop project that currently has a `.brain/` directory. Record the count — you'll use it later to verify 100% migration.

---

### Task 3.2: Write the migration script

**Files:**
- Create: `scripts/dev/migrate-eros-run.mjs`

- [ ] **Step 1: Write the migration script**

Create `scripts/dev/migrate-eros-run.mjs` with:

```javascript
#!/usr/bin/env node
/**
 * migrate-eros-run.mjs — one-shot migration of .brain/ → .eros-run/
 * for every project under the user's Desktop.
 *
 * Usage:
 *   node scripts/dev/migrate-eros-run.mjs --dry-run      # preview
 *   node scripts/dev/migrate-eros-run.mjs --execute      # do it
 *
 * Idempotent: if .eros-run/ already exists and .brain/ doesn't, skip.
 */
import { promises as fs } from 'node:fs'
import path from 'node:path'
import os from 'node:os'

const args = new Set(process.argv.slice(2))
const dryRun = !args.has('--execute')

const desktopDir = path.join(os.homedir(), 'Desktop')
const entries = await fs.readdir(desktopDir, { withFileTypes: true })

const results = { migrated: [], skipped: [], conflicts: [], errors: [] }

for (const e of entries) {
  if (!e.isDirectory()) continue
  if (e.name === 'maqueta' || e.name === 'Eros') continue

  const projectDir = path.join(desktopDir, e.name)
  const brainDir = path.join(projectDir, '.brain')
  const erosRunDir = path.join(projectDir, '.eros-run')

  let hasBrain = false
  let hasErosRun = false
  try { await fs.access(brainDir); hasBrain = true } catch {}
  try { await fs.access(erosRunDir); hasErosRun = true } catch {}

  if (!hasBrain && !hasErosRun) continue

  if (hasBrain && hasErosRun) {
    results.conflicts.push(e.name)
    continue
  }

  if (!hasBrain && hasErosRun) {
    results.skipped.push(e.name)
    continue
  }

  if (dryRun) {
    results.migrated.push(e.name + ' (dry-run)')
  } else {
    try {
      await fs.rename(brainDir, erosRunDir)
      results.migrated.push(e.name)
    } catch (err) {
      results.errors.push(`${e.name}: ${err.message}`)
    }
  }
}

console.log(JSON.stringify({ mode: dryRun ? 'dry-run' : 'execute', ...results }, null, 2))
process.exit(results.errors.length > 0 ? 1 : 0)
```

- [ ] **Step 2: Dry-run the script**

Run:
```bash
node scripts/dev/migrate-eros-run.mjs --dry-run
```

Expected output (example):
```json
{
  "mode": "dry-run",
  "migrated": ["practice-1", "practice-2", ...],
  "skipped": [],
  "conflicts": [],
  "errors": []
}
```

The count in `migrated` should match (or exceed by 1) the count from `.brain/migration-baseline/projects-with-brain.txt`.

- [ ] **Step 3: If conflicts exist, resolve them**

If the output shows `conflicts` (a project has both `.brain/` AND `.eros-run/`), **stop**. These are projects where someone partially migrated. Inspect manually, pick the authoritative one, delete the other, then re-run dry-run.

- [ ] **Step 4: Commit the script (before running it)**

```bash
git add scripts/dev/migrate-eros-run.mjs
git commit -m "feat(scripts): add migrate-eros-run.mjs for .brain → .eros-run Desktop migration"
```

---

### Task 3.3: Rename the scaffold and example directories

**Files:**
- Move: `_project-scaffold/.brain/` → `_project-scaffold/.eros-run/`
- Move: `.eros/eros-feed/examples/demo-run/.brain/` → `.eros/eros-feed/examples/demo-run/.eros-run/`

- [ ] **Step 1: Rename scaffold**

```bash
git mv _project-scaffold/.brain _project-scaffold/.eros-run
```

- [ ] **Step 2: Rename demo-run example**

```bash
git mv .eros/eros-feed/examples/demo-run/.brain .eros/eros-feed/examples/demo-run/.eros-run
```

- [ ] **Step 3: Verify content unchanged**

Run:
```bash
ls _project-scaffold/.eros-run/
ls .eros/eros-feed/examples/demo-run/.eros-run/
```

Expected: same file lists as before (state.md, state.json, queue.md, etc.).

- [ ] **Step 4: Commit**

```bash
git add _project-scaffold/ .eros/eros-feed/examples/
git commit -m "refactor: rename scaffold/demo .brain/ → .eros-run/"
```

---

### Task 3.4: Rename `.eros/brain-config.md` → `.eros/eros-run-config.md`

**Files:**
- Move: `.eros/brain-config.md` → `.eros/eros-run-config.md`
- Modify: `.eros/scripts/eros-doctor.mjs` line 33

- [ ] **Step 1: Rename the file**

```bash
git mv .eros/brain-config.md .eros/eros-run-config.md
```

- [ ] **Step 2: Update its heading**

Edit `.eros/eros-run-config.md` line 1.

From:
```markdown
# Brain Configuration — V6.1 → V7 (Eros Script Architecture)
```

To:
```markdown
# Eros Run Configuration — V7 (Script-Driven)
```

- [ ] **Step 3: Update eros-doctor reference**

Edit `.eros/scripts/eros-doctor.mjs` line 33.

From:
```javascript
const erosFiles = ['.eros/pipeline.md', '.eros/brain-config.md'];
```

To:
```javascript
const erosFiles = ['.eros/pipeline.md', '.eros/eros-run-config.md'];
```

- [ ] **Step 4: Verify eros-doctor still passes**

```bash
node .eros/scripts/eros-doctor.mjs
```

Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add .eros/brain-config.md .eros/eros-run-config.md .eros/scripts/eros-doctor.mjs
git commit -m "refactor: rename .eros/brain-config.md → eros-run-config.md + update doctor"
```

---

### Task 3.5: Update scripts in `scripts/eros-core/`

**Files:**
- Modify: `scripts/eros-core/state.mjs` (~15 `.brain` refs)
- Modify: `scripts/eros-core/context.mjs` (~11 refs)
- Modify: `scripts/eros-core/gate.mjs` (~22 refs)

- [ ] **Step 1: Perform path replacement in state.mjs**

Run:
```bash
grep -n "\.brain" scripts/eros-core/state.mjs
```

For every hit, replace `.brain` (preceded by `/` or `'` or `"` or ` ` — path context) with `.eros-run`. Do **not** replace the word `brain` when it's in prose (comments, log messages describing the concept). Focus on path literals.

Example change:
```javascript
// Before:
const stateFile = path.join(projectDir, '.brain', 'state.json')
// After:
const stateFile = path.join(projectDir, '.eros-run', 'state.json')
```

- [ ] **Step 2: Same for context.mjs and gate.mjs**

Repeat the pattern from Step 1 for each file.

- [ ] **Step 3: Update the `# Brain State` template string literal**

In `scripts/eros-core/state.mjs` line ~134:

From:
```javascript
  return `# Brain State
```

To:
```javascript
  return `# Eros Run State
```

This changes the header of the generated `state.md` file. (This is a UX/readability change — the file's content header.)

- [ ] **Step 4: Run eros-doctor**

```bash
node .eros/scripts/eros-doctor.mjs
```

Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add scripts/eros-core/
git commit -m "refactor(eros-core): rewrite .brain/ path literals → .eros-run/ + update state.md header"
```

---

### Task 3.6: Update pipeline, quality, memory, panel, dev, observer scripts

**Files:** (grouped for batched commits)
- `scripts/pipeline/*.mjs`
- `scripts/quality/refresh-quality.mjs`
- `scripts/memory/*.mjs`
- `scripts/panel/server.mjs`
- `scripts/dev/*.{mjs,sh}`
- `scripts/observer/detect-changes.mjs`

- [ ] **Step 1: Update `scripts/pipeline/bootstrap-eros-feed.mjs`**

Run:
```bash
grep -n "\.brain\|# Brain" scripts/pipeline/bootstrap-eros-feed.mjs
```

Replace `.brain/` path literals → `.eros-run/`. Also update the `# Brain State` template string literal (line ~376) to `# Eros Run State`. Update the `<!-- Brain writes ... -->` and `<!-- Brain appends ... -->` comments (lines ~614, ~646) to `<!-- Eros writes automatic approvals and flags here. -->` and similar.

- [ ] **Step 2: Update `scripts/pipeline/sync-eros-feed-runs.mjs`**

Same treatment — replace `.brain/` path literals with `.eros-run/`.

- [ ] **Step 3: Commit pipeline**

```bash
git add scripts/pipeline/
git commit -m "refactor(pipeline): rewrite .brain/ paths → .eros-run/"
```

- [ ] **Step 4: Update `scripts/quality/refresh-quality.mjs`**

Run:
```bash
grep -n "\.brain\|# Brain" scripts/quality/refresh-quality.mjs
```

Replace path literals. Also update the `# Brain State` literal at line ~392 to `# Eros Run State`.

- [ ] **Step 5: Update `scripts/quality/{audit,multimodal-critic}.mjs`**

Minor updates (2 each). Same pattern.

- [ ] **Step 6: Commit quality**

```bash
git add scripts/quality/
git commit -m "refactor(quality): rewrite .brain/ paths → .eros-run/"
```

- [ ] **Step 7: Update `scripts/memory/{memory,auto-train,meta,train}.mjs`**

Each has a handful of `.brain/` refs. Same pattern — path literals only. The `scripts/memory/auto-train.mjs` lines 861-862 check for `.brain` existence to detect if a dir is a project; update the path check to `.eros-run`. Also rename the local variable `hasBrain` → `hasErosRun`.

- [ ] **Step 8: Commit memory**

```bash
git add scripts/memory/
git commit -m "refactor(memory): rewrite .brain/ paths → .eros-run/"
```

- [ ] **Step 9: Update `scripts/panel/server.mjs` (3 refs)**

Standard path replacement.

- [ ] **Step 10: Update `scripts/dev/*.{mjs,sh}`**

Shell scripts too: `auto-practice.sh`, `start-workspace.sh`. These have `.brain` refs inside bash. Replace with `.eros-run`.

For `scripts/dev/test-e2e.mjs` (23 refs), this is a test fixture generator — replace all `.brain/` → `.eros-run/` and the `# Brain State` string literal.

- [ ] **Step 11: Update `scripts/observer/detect-changes.mjs` (1 ref)**

Trivial.

- [ ] **Step 12: Commit remaining scripts**

```bash
git add scripts/panel/ scripts/dev/ scripts/observer/
git commit -m "refactor(scripts): rewrite remaining .brain/ paths → .eros-run/ (panel, dev, observer)"
```

---

### Task 3.7: Update `panel/vite-plugin-eros.js` (8 refs)

**Files:**
- Modify: `panel/vite-plugin-eros.js` lines 125, 201 (comment), 222, 246 (comment), 409, 688 (comment)

- [ ] **Step 1: Review each `.brain` occurrence**

Run:
```bash
grep -n "\.brain" panel/vite-plugin-eros.js
```

- [ ] **Step 2: Update line 125 (observer manifest path)**

From:
```javascript
const manifestPath = path.join(os.default.homedir(), 'Desktop', slug, '.brain', 'observer', 'localhost', 'manifest.json')
```

To:
```javascript
const manifestPath = path.join(os.default.homedir(), 'Desktop', slug, '.eros-run', 'observer', 'localhost', 'manifest.json')
```

- [ ] **Step 3: Update line 201 comment**

From:
```javascript
// REST: list projects with .brain/ (any project on Desktop)
```

To:
```javascript
// REST: list projects with .eros-run/ (any project on Desktop)
```

- [ ] **Step 4: Update line 222 (`brainDir` variable + path)**

From:
```javascript
const brainDir = path.join(desktopDir, e.name, '.brain')
try {
  await fsP.access(brainDir)
  const state = JSON.parse(await fsP.readFile(path.join(brainDir, 'state.json'), 'utf8').catch(() => '{}'))
  const scorecard = JSON.parse(await fsP.readFile(path.join(brainDir, 'reports', 'quality', 'scorecard.json'), 'utf8').catch(() => '{}'))
  ...
  path.join(brainDir, 'observer', 'localhost', 'frame-000.png'),
  path.join(brainDir, 'observer', 'localhost', 'full-page-desktop.png'),
```

To:
```javascript
const erosRunDir = path.join(desktopDir, e.name, '.eros-run')
try {
  await fsP.access(erosRunDir)
  const state = JSON.parse(await fsP.readFile(path.join(erosRunDir, 'state.json'), 'utf8').catch(() => '{}'))
  const scorecard = JSON.parse(await fsP.readFile(path.join(erosRunDir, 'reports', 'quality', 'scorecard.json'), 'utf8').catch(() => '{}'))
  ...
  path.join(erosRunDir, 'observer', 'localhost', 'frame-000.png'),
  path.join(erosRunDir, 'observer', 'localhost', 'full-page-desktop.png'),
```

- [ ] **Step 5: Update line 246 comment**

From:
```javascript
} catch { /* no .brain */ }
```

To:
```javascript
} catch { /* no .eros-run */ }
```

- [ ] **Step 6: Update line 409 (preview candidate path)**

From:
```javascript
path.join(desktopDir, slug, '.brain', 'observer', 'localhost', filename),
```

To:
```javascript
path.join(desktopDir, slug, '.eros-run', 'observer', 'localhost', filename),
```

- [ ] **Step 7: Update line 688 (warning comment)**

From:
```javascript
// recursive fs.watch handle on EVERY .brain/ dir on the Desktop (20+
```

To:
```javascript
// recursive fs.watch handle on EVERY .eros-run/ dir on the Desktop (20+
```

- [ ] **Step 8: Rebuild panel**

```bash
cd panel && npm run build 2>&1 | tail -10 ; cd ..
```

Expected: clean build.

- [ ] **Step 9: Commit**

```bash
git add panel/vite-plugin-eros.js
git commit -m "refactor(panel): rewrite .brain/ paths → .eros-run/ in vite plugin"
```

---

### Task 3.8: Update `.claude/settings.json` hook regex

**Files:**
- Modify: `.claude/settings.json` lines 18, 27, 47, 67

- [ ] **Step 1: Update line 18 (compact-resume hook) — path literal**

The hook scans `/c/Users/mateo/Desktop/*/.brain/state.md`. Replace with `.eros-run/state.md`:

Find:
```
for f in /c/Users/mateo/Desktop/*/.brain/state.md
```

Replace with:
```
for f in /c/Users/mateo/Desktop/*/.eros-run/state.md
```

- [ ] **Step 2: Update line 27 (resume hook) — same pattern**

Same substitution.

- [ ] **Step 3: Update line 47 (PreToolUse regex)**

This is the critical one — it blocks direct Writes to state files. The regex escapes the dot: `\.brain/`.

Find (4 regex patterns in the command):
```
\.brain/(state\.md|state\.json|queue\.md|queue\.json)$
\.brain/approvals\.md$
\.brain/decisions\.md$
```

Replace each `\.brain/` with `\.eros-run/`:
```
\.eros-run/(state\.md|state\.json|queue\.md|queue\.json)$
\.eros-run/approvals\.md$
\.eros-run/decisions\.md$
```

- [ ] **Step 4: Update line 67 (PostToolUse regex)**

Find:
```
\.brain/reports/S-.*\.md$
```

Replace with:
```
\.eros-run/reports/S-.*\.md$
```

- [ ] **Step 5: Verify settings.json is valid JSON**

Run:
```bash
node -e "JSON.parse(require('fs').readFileSync('.claude/settings.json', 'utf8')); console.log('valid')"
```

Expected: `valid`.

- [ ] **Step 6: Commit**

```bash
git add .claude/settings.json
git commit -m "refactor(hooks): update Claude settings hooks for .eros-run/ path"
```

---

### Task 3.9: Update agent files

**Files:**
- Modify: `.eros/agents/{builder,designer,evaluator,polisher}.md`
- Modify: `.claude/agents/{builder,designer,polisher}.md`

- [ ] **Step 1: Agent files — global find/replace per file**

For each agent file, run:
```bash
grep -n "\.brain\|brain-config" <file>
```

Replace `.brain/` → `.eros-run/` and `brain-config.md` → `eros-run-config.md` throughout.

Leave references to the concept "brain" as a narrative term untouched (e.g., "the autonomous brain" — decide case by case whether prose stays or adapts to "the Eros orchestrator"). Conservative choice: only touch path literals; leave narrative prose alone in this PR to keep diff reviewable.

- [ ] **Step 2: Commit**

```bash
git add .eros/agents/ .claude/agents/
git commit -m "refactor(agents): rewrite .brain/ paths → .eros-run/ in agent contracts"
```

---

### Task 3.10: Update `.eros/pipeline.md` and `.eros/workflows/project.md`

**Files:**
- Modify: `.eros/pipeline.md` (35 `.brain` + 46 `brain` refs — pick path literals)
- Modify: `.eros/workflows/project.md`
- Modify: `.eros/eros-run-config.md` (the one we just renamed — 7 `.brain` refs inside)

- [ ] **Step 1: `.eros/pipeline.md`**

Find every `.brain/` path reference (with escape `\.brain` context) and replace with `.eros-run/`. This file is the core operational contract — be thorough.

- [ ] **Step 2: `.eros/workflows/project.md`**

Same pattern.

- [ ] **Step 3: `.eros/eros-run-config.md`**

Internal refs like `.brain/approvals.md`, `.brain/observer/`, `.brain/reports/quality/` → `.eros-run/`.

- [ ] **Step 4: Commit**

```bash
git add .eros/
git commit -m "docs: rewrite .brain/ → .eros-run/ in .eros pipeline, workflows, config"
```

---

### Task 3.11: Update active docs, PRD, progress

**Files:**
- Modify: `docs/plans/hardening-audit.md` (10 refs)
- Modify: `docs/plans/2026-04-14-scripts-restructure.md` (remaining `.brain/` refs)
- Modify: `docs/plans/2026-04-14-docs-restructure.md`
- Modify: `docs/specs/2026-04-14-*.md` (remaining refs)
- Modify: `.omc/prd.json` (active file — `.brain/` refs)
- Modify: `.omc/progress.txt` (active)
- Modify: `README.md` top-level (12 `brain` refs — pick which ones refer to `.brain/`)
- Modify: `AGENTS.md` (17 + 9 — same logic)
- Modify: `docs/STATUS.md` (5+1 refs)

- [ ] **Step 1: For each active doc, replace `.brain/` path references**

Be surgical. Replace only literal `.brain/` paths. Narrative uses of "brain" (e.g., "the autonomous brain") can stay or be renamed to "Eros" at reviewer discretion — but keep that out of this PR to reduce diff size.

- [ ] **Step 2: Commit**

```bash
git add docs/ .omc/prd.json .omc/progress.txt README.md AGENTS.md
git commit -m "docs: rewrite .brain/ → .eros-run/ in active docs, PRD, progress"
```

---

### Task 3.12: Update `.gitignore`

**Files:**
- Modify: `.gitignore` line 52-54

- [ ] **Step 1: Update `.gitignore`**

From:
```
# Lab scratch at repo root (NOT .brain/ inside projects)
/.brain/
/BRIEF-*.md
```

To:
```
# Lab scratch at repo root (NOT .eros-run/ inside projects)
/.eros-run/
/BRIEF-*.md
```

Also: the local `/.brain/` directory (where we put baseline snapshots) — rename it to `/.eros-run/` locally or delete its contents post-merge. For now, this PR ignores the new name — be aware the baseline snapshot files (`baseline-snapshot/*.txt`) are currently in `.brain/` locally and won't be tracked either way.

- [ ] **Step 2: Rename local `.brain/` working directory (one-shot, untracked)**

Run (locally, not committed — just housekeeping):
```bash
mv .brain .eros-run 2>/dev/null || true
```

- [ ] **Step 3: Commit**

```bash
git add .gitignore
git commit -m "chore(gitignore): update lab-scratch path .brain → .eros-run"
```

---

### Task 3.13: Run the migration on Desktop projects

**CRITICAL:** This step mutates filesystem state outside the repo. Only run **after** all code + docs are committed.

- [ ] **Step 1: Close the panel dev server and any watchers**

Make sure no process holds file handles on `Desktop/*/.brain/`.

- [ ] **Step 2: Execute the migration script**

```bash
node scripts/dev/migrate-eros-run.mjs --execute
```

Expected output: JSON with every Desktop project in `migrated`, empty `errors`, empty `conflicts`.

- [ ] **Step 3: Verify migration**

```bash
for d in ~/Desktop/*/; do
  if [ -d "${d}.brain" ]; then
    echo "STILL HAS .brain: $d"
  fi
done
```

Expected: no output.

```bash
count=$(ls -d ~/Desktop/*/.eros-run 2>/dev/null | wc -l)
echo "Projects with .eros-run: $count"
```

Expected count: matches the baseline from Task 3.1.

- [ ] **Step 4: Boot the panel and verify project list populates**

```bash
cd panel && npm run dev
```

Open `http://localhost:4000`, navigate to the projects list. Expected: the same set of projects is shown, with their scores and previews intact. If the list is empty, the migration didn't land (or `vite-plugin-eros.js` wasn't updated — revisit Task 3.7).

Stop the dev server with Ctrl+C.

---

### Task 3.14: Phase 3 validation

- [ ] **Step 1: No executable `.brain/` references remain**

Run:
```bash
rg "\.brain" -t js -t ts --glob '*.vue' --glob '*.mjs' --glob '*.json' --glob '*.sh' --glob '!node_modules' --glob '!.git' --glob '!docs/archive' --glob '!_components/heroes/S-BentoDashboard.vue' -n
```

Expected: no hits.

- [ ] **Step 2: eros-doctor green**

```bash
node .eros/scripts/eros-doctor.mjs
```

Expected: exit 0.

- [ ] **Step 3: Panel rebuilds**

```bash
cd panel && npm run build ; cd ..
```

Expected: clean.

- [ ] **Step 4: Compare match counts to baseline**

```bash
rg -i 'brain' --glob '!node_modules' --glob '!.git' --glob '!docs/archive' --glob '!_components/heroes/S-BentoDashboard.vue' --stats | tail -2
```

Expected remaining `brain` hits: UX strings (`Creative Brain`, `Brain State` generated headers), font names (`JetBrains Mono`), narrative prose in agents/docs, archived content. No path-literal hits.

- [ ] **Step 5: Push + PR**

```bash
git push -u origin refactor/rename-brain-to-eros-phase-3
gh pr create --title "refactor: rename .brain/ → .eros-run/ (per-project working memory)" --body "$(cat <<'EOF'
## Summary
- Rename `.brain/` working-memory dir → `.eros-run/` in scaffold, examples, and all per-project references
- Rename `.eros/brain-config.md` → `.eros/eros-run-config.md`
- Update all hardcoded path literals in scripts (eros-core, pipeline, quality, memory, dev, panel, observer)
- Update `panel/vite-plugin-eros.js` to scan `Desktop/*/.eros-run/`
- Update `.claude/settings.json` hook regexes (compact, resume, pre-tool-use, post-tool-use)
- Update all agent files (.eros/agents/, .claude/agents/)
- Update `.eros/pipeline.md`, `.eros/workflows/project.md`, active docs, PRD, progress
- Update `.gitignore` lab-scratch path
- Add `scripts/dev/migrate-eros-run.mjs` and execute it on Desktop projects

## Migration impact
- N projects on Desktop migrated from `.brain/` to `.eros-run/` (see migration-baseline/)
- Panel project list verified intact post-migration
- No data loss — `git mv` preserves history for scaffold/example; Desktop projects use `fs.rename()` (atomic on same FS)

## Test plan
- [x] Migration script dry-run matches baseline count
- [x] Execute migration — 0 errors, 0 conflicts
- [x] Panel boots at `http://localhost:4000` and project list populates
- [x] `node .eros/scripts/eros-doctor.mjs` → exit 0
- [x] `cd panel && npm run build` clean
- [x] No `.brain/` path literals in executable code

## Rollback
If the panel breaks post-merge, revert this PR AND run:
```bash
for d in ~/Desktop/*/.eros-run; do mv "$d" "${d%.eros-run}.brain"; done
```
EOF
)"
```

---

## Final verification (all three phases merged)

- [ ] **F1: Global count of remaining `brain` references**

```bash
rg -i 'brain' --glob '!node_modules' --glob '!.git' --glob '!docs/archive' --glob '!_components/heroes/S-BentoDashboard.vue' --stats | tail -2
```

Expected: reference count dropped from ~1295 to the residuals listed below.

- [ ] **F2: Residuals allowed (everything else is a bug)**

| Category | Expected location | Reason |
|---|---|---|
| `JetBrains Mono` font refs | `_components/heroes/S-BentoDashboard.vue`, `.eros/memory/design-intelligence/font-pairings.{md,json}`, `scripts/memory/memory.mjs` | Font name — not "brain" |
| `"Creative Brain"` UX string | `panel/src/components/MainShell.vue:75` | Product copy (decide separately) |
| `ErosBrain.vue` view | `panel/src/views/eros/ErosBrain.vue` + `panel/src/router/index.js` | UI view name (decide separately) |
| `"# Eros Run State"` headers | generated by scripts | Was `# Brain State`, updated via string literal edits |
| `Brain*` dead-code list | `scripts/observer/lint-ux.mjs:36-50` | Legacy lint rule for already-deleted Vue components |
| Narrative "brain" in prose | archived docs, some active `.eros/*.md` | Conceptual metaphor — leave unless separately decided |

- [ ] **F3: All three PRs merged in order**

```bash
git log --oneline origin/main | head -20
```

Expected: three commits titled `refactor: rename scripts/brain → scripts/eros-core`, `refactor: rename front-brain → eros-feed`, `refactor: rename .brain/ → .eros-run/`.

---

## Rollback plan

Each phase is atomic. Rollback = revert its PR.

- **Phase 1 rollback:** `git revert <phase-1-merge-commit>`. No filesystem migration needed.
- **Phase 2 rollback:** `git revert <phase-2-merge-commit>`. Panel will regenerate runtime files under the old path on next build.
- **Phase 3 rollback:** `git revert <phase-3-merge-commit>` + shell script to rename every `Desktop/*/.eros-run/` back to `.brain/`:

```bash
for d in ~/Desktop/*/.eros-run; do
  mv "$d" "${d%.eros-run}.brain"
done
```

---

## False positives — DO NOT CHANGE

1. **`JetBrains Mono`** (font name) — 10+ occurrences, mostly in `S-BentoDashboard.vue` + `font-pairings.{md,json}`. This is a typeface.
2. **`"Creative Brain"` UX copy** in `MainShell.vue:75` — user-facing product tagline.
3. **`ErosBrain.vue`** view + `/eros` route — UI design decision, not structural.
4. **Historical `brain` in `docs/archive/`** — preserves the record of past proposals. Leave untouched.
5. **`.omc/prd.json.{admin,superadmin}-done`** — frozen snapshots of completed sprints.
6. **Dead-code `Brain*` list in `scripts/observer/lint-ux.mjs`** — lint rule for components already deleted in Fase 14. Not related to this rename.
7. **Narrative use of "brain"** (e.g., "the autonomous brain") in pipeline docs — metaphor, not structure. Change only if you want a full rebrand; out of scope for this plan.
