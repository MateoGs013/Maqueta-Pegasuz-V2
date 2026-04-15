# Docs Restructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate `docs/` from flat 15-file root into a hierarchical AI-friendly architecture where status is visible in the directory tree, every subdir has a `README.md`, and deprecated content is archived instead of lingering alongside active work.

**Architecture:** Status-as-directory (`plans/` vs `archive/plans/`) + one convention (kebab-case lowercase, underscore preserved only for template sources) + entry-point READMEs everywhere. Cross-ref audit before any move. `eros-doctor` gets 3 new rules to prevent drift.

**Tech Stack:** Git (file moves), Node.js (eros-doctor extension), Bash (grep/find for validation), no new dependencies.

**Reference:** `docs/specs/2026-04-14-docs-restructure-design.md`

---

## Pre-execution verification

Before starting, confirm current state with:

```bash
git branch --show-current
# Expected: docs/ai-friendly

ls docs/ | grep -c "^PLAN-"
# Expected: 8 (the PLAN-*.md files to migrate)

node .eros/scripts/eros-doctor.mjs
# Expected: All checks passed
```

If any check fails, stop and reconcile before proceeding.

---

## Task 1: Cross-reference audit (research snapshot)

**Files:**
- Create: `.brain/docs-migration-audit.txt` (scratch reference, not committed)

- [ ] **Step 1: Collect all external references to legacy `docs/` paths**

Run:
```bash
mkdir -p .brain
grep -rn --include="*.md" --include="*.mjs" --include="*.js" --include="*.json" \
  "docs/PLAN-\|docs/superpowers\|docs/panel-observer\|docs/WORKFLOW-EROS\|docs/eros-v9\|docs/pegasuz-\|docs/eros-panel-aesthetic\|docs/observer-upgrade\|docs/reference-analysis-fluid\|docs/ux-reform\|docs/PLANS-STATUS" \
  --exclude-dir=docs --exclude-dir=node_modules --exclude-dir=.git . \
  > .brain/docs-migration-audit.txt 2>&1 || true

wc -l .brain/docs-migration-audit.txt
```

Expected: non-zero line count (~2-10 lines). This file is the source of truth for Task 11 (cross-ref update).

- [ ] **Step 2: Manual review of the audit file**

Read `.brain/docs-migration-audit.txt`. Verify each hit is a genuine path reference (not a string inside unrelated prose). Any false positives — note them to skip in Task 11.

- [ ] **Step 3: Verify `docs/_libraries/` is intentionally excluded from audit**

Run:
```bash
grep -rn "docs/_libraries" --include="*.md" --include="*.mjs" --include="*.js" --include="*.json" \
  --exclude-dir=docs --exclude-dir=node_modules --exclude-dir=.git . | wc -l
```

Expected: 9 references. These are NOT touched in this migration (`_libraries/` stays as-is per spec).

- [ ] **Step 4: No commit**

This task produces a scratch file only. `.brain/` is already in `.gitignore` (verify with `grep -n "^\.brain" .gitignore`).

---

## Task 2: Scaffold new directory structure + root entry points

**Files:**
- Create: `docs/plans/` (directory)
- Create: `docs/specs/` (directory, already exists from spec step)
- Create: `docs/references/` (directory)
- Create: `docs/archive/` (directory)
- Create: `docs/archive/plans/` (directory)
- Create: `docs/archive/proposals/` (directory)
- Create: `docs/README.md`
- Create: `docs/archive/README.md`

- [ ] **Step 1: Create all new directories at once**

Run:
```bash
mkdir -p docs/plans docs/specs docs/references docs/archive/plans docs/archive/proposals
ls -d docs/plans docs/specs docs/references docs/archive docs/archive/plans docs/archive/proposals
```

Expected: all 6 paths listed (no "cannot access" errors).

- [ ] **Step 2: Write `docs/README.md`**

```markdown
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
```

- [ ] **Step 3: Write `docs/archive/README.md`**

```markdown
# Archive

Completed plans and deprecated proposals. Files here were active at some point in `docs/plans/` or `docs/` root — once done or superseded, they were moved here to keep the active surface clean.

## Structure

| Subdir | Contents |
|--------|----------|
| [`plans/`](./plans/) | Plans marked `implemented` — historical record of what was built |
| [`proposals/`](./proposals/) | Aspirational docs, earlier-version workflows, external-product briefs |
| [`ux-reform/`](./ux-reform/) | Observer-phase captures from the V2→V3 reform arc |

## Why archive instead of delete

Git preserves everything; the archive exists for **discovery**, not for recovery. Having `archive/plans/eros-v8.md` visible reminds future contributors (human or AI) that the V8 pipeline is a thing, and the file next to it explains how it was built.

## Reading rule

Files here are **frozen snapshots**. Do not edit archive content unless correcting a factual error in history. New work goes in `docs/plans/` or `docs/specs/`.
```

- [ ] **Step 4: Verify both READMEs are valid**

Run:
```bash
wc -l docs/README.md docs/archive/README.md
```

Expected: both files non-empty (~30 and ~15 lines respectively).

- [ ] **Step 5: Commit**

```bash
git add docs/README.md docs/archive/README.md docs/plans docs/specs docs/references docs/archive
git commit -m "docs: scaffold new directory structure + root READMEs

Adds docs/plans, docs/specs, docs/references, docs/archive/{plans,proposals}
with entry-point README.md at docs/ root and docs/archive/. Preserves
existing docs/_libraries/ (template source — underscore is load-bearing)."
```

---

## Task 3: Move active plans to `docs/plans/` + write status index

**Files:**
- Move: `docs/PLAN-HARDENING-AUDIT.md` → `docs/plans/hardening-audit.md`
- Move: `docs/PLAN-OBSERVER-V2.md` → `docs/plans/observer-v2.md`
- Move: `docs/PLAN-OBSERVER-V3.md` → `docs/plans/observer-v3.md`
- Move: `docs/PLAN-VERCEL-DEPLOY.md` → `docs/plans/vercel-deploy.md`
- Create: `docs/plans/README.md`

- [ ] **Step 1: Move 4 active plans with `git mv`**

Run:
```bash
git mv docs/PLAN-HARDENING-AUDIT.md docs/plans/hardening-audit.md
git mv docs/PLAN-OBSERVER-V2.md docs/plans/observer-v2.md
git mv docs/PLAN-OBSERVER-V3.md docs/plans/observer-v3.md
git mv docs/PLAN-VERCEL-DEPLOY.md docs/plans/vercel-deploy.md
ls docs/plans/
```

Expected: 4 kebab-case files in `docs/plans/` (plus the restructure plan already present). No `PLAN-*.md` files left in `docs/` root (verify in step 4).

- [ ] **Step 2: Write `docs/plans/README.md`**

```markdown
# Active Plans

Implementation plans that are currently in progress or pending execution. Each file is a standalone plan with its own status, success criteria, and task breakdown.

## Status table

| Plan | Status | Last reviewed |
|------|--------|---------------|
| [hardening-audit](./hardening-audit.md) | in-progress | 2026-04-14 |
| [observer-v2](./observer-v2.md) | in-progress | 2026-04-14 |
| [observer-v3](./observer-v3.md) | active · not yet implemented | 2026-04-14 |
| [vercel-deploy](./vercel-deploy.md) | in-progress | 2026-04-14 |
| [2026-04-14-docs-restructure](./2026-04-14-docs-restructure.md) | in-progress · this migration | 2026-04-14 |

## Completed plans

Once a plan is marked `implemented`, move it to [`../archive/plans/`](../archive/plans/). The status table above only reflects active work.

## Plan authoring

New plans follow the superpowers convention (see `.claude/plugins/.../skills/writing-plans/`):
- One Markdown file per feature
- Status header (`Status: in-progress | implemented | deprecated`) + `Last reviewed` date
- Tasks decomposed to bite-sized TDD steps
- Date-prefix (`YYYY-MM-DD-`) only when the topic is time-scoped (e.g., migrations); topical plans use a plain slug.
```

- [ ] **Step 3: Verify the 4 moved files retain Status headers**

Run:
```bash
grep -l "^> \*\*Status:\*\*" docs/plans/*.md | sort
```

Expected: 4 files listed (hardening-audit.md, observer-v2.md, observer-v3.md, vercel-deploy.md — the restructure plan uses a different header format, that's OK).

- [ ] **Step 4: Verify no `PLAN-*.md` files remain in `docs/` root**

Run:
```bash
ls docs/PLAN-*.md 2>&1 | head -3
```

Expected: `ls: cannot access 'docs/PLAN-*.md': No such file or directory`.

- [ ] **Step 5: Commit**

```bash
git add docs/plans/
git rm --cached docs/PLAN-HARDENING-AUDIT.md docs/PLAN-OBSERVER-V2.md docs/PLAN-OBSERVER-V3.md docs/PLAN-VERCEL-DEPLOY.md 2>/dev/null || true
git commit -m "docs(plans): migrate active plans to docs/plans/

Moves 4 in-progress plans + adds docs/plans/README.md with status table.
Drops PLAN- prefix and ALL-CAPS (directory already encodes 'plan'; kebab-case
lowercase per new convention)."
```

---

## Task 4: Archive completed plans

**Files:**
- Move: `docs/PLAN-AUTO-TRAIN-V2.md` → `docs/archive/plans/auto-train-v2.md`
- Move: `docs/PLAN-EROS-ALIVE.md` → `docs/archive/plans/eros-alive.md`
- Move: `docs/PLAN-EROS-V8.md` → `docs/archive/plans/eros-v8.md`
- Move: `docs/PLAN-TRAINING-DASHBOARD.md` → `docs/archive/plans/training-dashboard.md`

- [ ] **Step 1: Move 4 completed plans with `git mv`**

Run:
```bash
git mv docs/PLAN-AUTO-TRAIN-V2.md docs/archive/plans/auto-train-v2.md
git mv docs/PLAN-EROS-ALIVE.md docs/archive/plans/eros-alive.md
git mv docs/PLAN-EROS-V8.md docs/archive/plans/eros-v8.md
git mv docs/PLAN-TRAINING-DASHBOARD.md docs/archive/plans/training-dashboard.md
ls docs/archive/plans/
```

Expected: 4 kebab-case files listed.

- [ ] **Step 2: Verify each archived file still carries its `implemented` status**

Run:
```bash
grep -h "^> \*\*Status:\*\*" docs/archive/plans/*.md
```

Expected: 4 lines, all containing `implemented`.

- [ ] **Step 3: Commit**

```bash
git add docs/archive/plans/
git commit -m "docs(archive): move 4 implemented plans to archive/plans/

auto-train-v2, eros-alive, eros-v8, training-dashboard — all marked
implemented in original Status headers. Status-as-directory: archive/plans/
makes 'done' visible via ls."
```

---

## Task 5: Consolidate specs + delete `docs/superpowers/`

**Files:**
- Move: `docs/superpowers/specs/2026-04-14-multi-ai-architecture-design.md` → `docs/specs/2026-04-14-multi-ai-architecture.md` (drop `-design` suffix for consistency with our new spec)
- Move: `docs/superpowers/plans/2026-04-14-multi-ai-architecture.md` → `docs/archive/plans/2026-04-14-multi-ai-architecture.md`
- Delete: `docs/superpowers/` (empty after moves)

- [ ] **Step 1: Move the multi-AI spec to `docs/specs/`**

Run:
```bash
git mv docs/superpowers/specs/2026-04-14-multi-ai-architecture-design.md docs/specs/2026-04-14-multi-ai-architecture.md
ls docs/specs/
```

Expected: two files in `docs/specs/` — `2026-04-14-docs-restructure-design.md` (this migration's spec) and `2026-04-14-multi-ai-architecture.md` (prior migration's spec).

- [ ] **Step 2: Move the multi-AI implementation plan to archive**

Run:
```bash
git mv docs/superpowers/plans/2026-04-14-multi-ai-architecture.md docs/archive/plans/2026-04-14-multi-ai-architecture.md
ls docs/archive/plans/
```

Expected: 5 files now in archive/plans/ (4 implemented plans + executed multi-ai plan).

- [ ] **Step 3: Remove the now-empty `docs/superpowers/` directory**

Run:
```bash
rmdir docs/superpowers/specs docs/superpowers/plans docs/superpowers
ls -d docs/superpowers 2>&1 | head -1
```

Expected: `ls: cannot access 'docs/superpowers': No such file or directory`.

- [ ] **Step 4: Commit**

```bash
git add docs/specs/ docs/archive/plans/
git commit -m "docs: migrate specs/plans out of superpowers/ and delete dir

Multi-AI spec -> docs/specs/ (permanent design record).
Multi-AI plan -> docs/archive/plans/ (executed via PR #6).
docs/superpowers/ deleted (empty after moves). Single canonical
location for specs and plans."
```

---

## Task 6: Move references

**Files:**
- Move: `docs/eros-panel-aesthetic-brief.md` → `docs/references/eros-panel-aesthetic-brief.md`
- Move: `docs/observer-upgrade-prompt.md` → `docs/references/observer-upgrade-prompt.md`
- Move: `docs/reference-analysis-fluid-glass.md` → `docs/references/reference-analysis-fluid-glass.md`
- Create: `docs/references/README.md`

- [ ] **Step 1: Move 3 reference files**

Run:
```bash
git mv docs/eros-panel-aesthetic-brief.md docs/references/eros-panel-aesthetic-brief.md
git mv docs/observer-upgrade-prompt.md docs/references/observer-upgrade-prompt.md
git mv docs/reference-analysis-fluid-glass.md docs/references/reference-analysis-fluid-glass.md
ls docs/references/
```

Expected: 3 kebab-case files.

- [ ] **Step 2: Write `docs/references/README.md`**

```markdown
# References

Reusable briefs, aesthetic guides, and upgrade prompts. Content that is consulted repeatedly across projects — not tied to a specific plan or spec.

## Contents

| File | Purpose |
|------|---------|
| [eros-panel-aesthetic-brief](./eros-panel-aesthetic-brief.md) | Aesthetic brief for the Eros panel surface — tokens, palette, type direction |
| [observer-upgrade-prompt](./observer-upgrade-prompt.md) | Prompt template for upgrading the observer layer incrementally |
| [reference-analysis-fluid-glass](./reference-analysis-fluid-glass.md) | Reference-analysis output from the fluid-glass aesthetic exploration |

## What belongs here

- Documents consulted repeatedly, not just once
- Aesthetic briefs, prompt templates, reference-analysis outputs
- Anything an agent might want to load mid-workflow as context

## What does NOT belong here

- Plans (active → `docs/plans/`, done → `docs/archive/plans/`)
- Specs (permanent design decisions → `docs/specs/`)
- One-off proposals or external-product docs (→ `docs/archive/proposals/`)
```

- [ ] **Step 3: Commit**

```bash
git add docs/references/
git commit -m "docs(references): consolidate reusable briefs + upgrade prompts

3 files (aesthetic brief, observer-upgrade prompt, fluid-glass analysis)
moved to docs/references/ with entry-point README."
```

---

## Task 7: Archive proposals

**Files:**
- Move: `docs/eros-v9-proposal.md` → `docs/archive/proposals/eros-v9-proposal.md`
- Move: `docs/WORKFLOW-EROS.md` → `docs/archive/proposals/workflow-eros-v7.md`
- Move: `docs/pegasuz-admin-ux-audit-brief.md` → `docs/archive/proposals/pegasuz-admin-ux-audit-brief.md`
- Move: `docs/pegasuz-superadmin-reskin-plan.md` → `docs/archive/proposals/pegasuz-superadmin-reskin-plan.md`
- Move: `docs/pegasuz-superadmin-ux-ultra-plan.md` → `docs/archive/proposals/pegasuz-superadmin-ux-ultra-plan.md`
- Move: `docs/pegasuz-superadmin-ux-ultra-plan-v2.md` → `docs/archive/proposals/pegasuz-superadmin-ux-ultra-plan-v2.md`

- [ ] **Step 1: Move 6 proposals**

Run:
```bash
git mv docs/eros-v9-proposal.md docs/archive/proposals/eros-v9-proposal.md
git mv docs/WORKFLOW-EROS.md docs/archive/proposals/workflow-eros-v7.md
git mv docs/pegasuz-admin-ux-audit-brief.md docs/archive/proposals/pegasuz-admin-ux-audit-brief.md
git mv docs/pegasuz-superadmin-reskin-plan.md docs/archive/proposals/pegasuz-superadmin-reskin-plan.md
git mv docs/pegasuz-superadmin-ux-ultra-plan.md docs/archive/proposals/pegasuz-superadmin-ux-ultra-plan.md
git mv docs/pegasuz-superadmin-ux-ultra-plan-v2.md docs/archive/proposals/pegasuz-superadmin-ux-ultra-plan-v2.md
ls docs/archive/proposals/
```

Expected: 6 files listed.

- [ ] **Step 2: Commit**

```bash
git add docs/archive/proposals/
git commit -m "docs(archive): move 6 proposals to archive/proposals/

eros-v9-proposal (aspirational, uncommitted), workflow-eros-v7 (superseded
by V8), 4 pegasuz-* specs (external product, historical). Kebab-case
rename for WORKFLOW-EROS -> workflow-eros-v7 (version explicit)."
```

---

## Task 8: Relocate panel-observer screenshots to `.eros/memory/`

**Files:**
- Move: `docs/panel-observer-2026-04-14/` → `.eros/memory/observations/panel/2026-04-14/`
- Move: `docs/panel-observer-2026-04-14-after/` → `.eros/memory/observations/panel/2026-04-14-after/`

- [ ] **Step 1: Create target directory**

Run:
```bash
mkdir -p .eros/memory/observations/panel
ls -d .eros/memory/observations/panel
```

Expected: `.eros/memory/observations/panel` path exists.

- [ ] **Step 2: Move both screenshot directories**

Run:
```bash
git mv docs/panel-observer-2026-04-14 .eros/memory/observations/panel/2026-04-14
git mv docs/panel-observer-2026-04-14-after .eros/memory/observations/panel/2026-04-14-after
ls -d .eros/memory/observations/panel/*
```

Expected: both date-stamped directories present under `.eros/memory/observations/panel/`.

- [ ] **Step 3: Write `.eros/memory/observations/panel/README.md`**

```markdown
# Panel Observations

Panel state captures — screenshots, analysis manifests, HTML snapshots produced by the observer during verification sweeps. Organized by date.

## Entries

| Date | Context |
|------|---------|
| [`2026-04-14/`](./2026-04-14/) | Panel observer verification — pre-fix baseline |
| [`2026-04-14-after/`](./2026-04-14-after/) | Panel observer verification — post-fix (9/9 PASS) |

## Why here and not in `docs/`

These are **observations** — raw artifacts from the panel observer pipeline. `docs/` is for human-readable prose about how the system works. Observations are data the system produced; they belong next to other long-term memory in `.eros/memory/`.

## Adding new entries

Observer captures are written here by the panel-observer workflow automatically. Do not commit ad-hoc screenshots — use the observer pipeline so manifests stay consistent.
```

- [ ] **Step 4: Verify no image files remain in `docs/`**

Run:
```bash
find docs -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.webp" -o -name "*.gif" \) | head -5
```

Expected: no output (empty result).

- [ ] **Step 5: Commit**

```bash
git add .eros/memory/observations/
git commit -m "memory: relocate panel-observer captures to .eros/memory/observations/

2026-04-14/ and 2026-04-14-after/ (4MB PNGs + manifests) moved out of
docs/. Observations are data artifacts, not prose — canonical home is
.eros/memory/. Adds entry-point README."
```

---

## Task 9: Archive `ux-reform/`

**Files:**
- Move: `docs/ux-reform/` → `docs/archive/ux-reform/`

- [ ] **Step 1: Move the directory**

Run:
```bash
git mv docs/ux-reform docs/archive/ux-reform
ls -d docs/archive/ux-reform docs/archive/ux-reform/observer-phase-3 2>&1 | head -3
```

Expected: both paths accessible.

- [ ] **Step 2: Commit**

```bash
git add docs/archive/ux-reform/
git commit -m "docs(archive): move ux-reform/ to archive/

7 observer-phase subdirs (baseline, phase-3, phase-3-fix, phase-3-verify,
phase-4, phase-5, phase-6) — historical reform arc, completed."
```

---

## Task 10: Absorb `PLANS-STATUS.md` narrative + delete

**Files:**
- Read: `docs/PLANS-STATUS.md` (for context absorption)
- Delete: `docs/PLANS-STATUS.md`

- [ ] **Step 1: Read PLANS-STATUS.md and extract narrative notes worth preserving**

Run:
```bash
head -15 docs/PLANS-STATUS.md
```

Expected: the 2026-04-10 verification-sweep note visible ("3 agentes Explore en paralelo... 4 nuevas reglas anti-AI V2"). This is narrative context worth saving.

- [ ] **Step 2: Append a condensed history block to `docs/plans/README.md`**

Open `docs/plans/README.md` and append (at end of file):

```markdown

## History

| Date | Event |
|------|-------|
| 2026-04-10 | Full verification sweep: 3 Explore agents in parallel validated every plan against code. Corrected inflated completion percentages. Added RULE-015 to RULE-018 to anti-AI V2 ruleset. Audit of 18 design-intelligence files raised signal-to-noise from 35% to 90%. |
| 2026-04-14 | Multi-AI architecture migration (PR #6). docs/ restructure (this plan). |

For per-plan execution detail, read each plan file directly — every plan carries its own `Status:` header and inline progress notes.
```

- [ ] **Step 3: Delete `PLANS-STATUS.md`**

Run:
```bash
git rm docs/PLANS-STATUS.md
ls docs/PLANS-STATUS.md 2>&1 | head -1
```

Expected: `ls: cannot access 'docs/PLANS-STATUS.md': No such file or directory`.

- [ ] **Step 4: Commit**

```bash
git add docs/plans/README.md
git commit -m "docs: absorb PLANS-STATUS.md narrative into plans/README; delete

Active status now lives in docs/plans/README.md status table. Historical
narrative (2026-04-10 verification sweep) preserved in a History section.
Rationale: git preserves the deleted file's full history; a separate
status aggregator invites drift (two sources of truth)."
```

---

## Task 11: Update cross-references repo-wide

**Files:**
- Modify: `README.md` (line ~165)
- Modify: (other files per audit from Task 1)

- [ ] **Step 1: Fix `README.md` reference to the multi-AI spec**

Read `.brain/docs-migration-audit.txt` for the exact list. Known hit: `README.md:165`.

Edit `README.md`, replacing:
```
- [Multi-AI architecture spec](./docs/superpowers/specs/2026-04-14-multi-ai-architecture-design.md)
```
with:
```
- [Multi-AI architecture spec](./docs/specs/2026-04-14-multi-ai-architecture.md)
- [Docs restructure spec](./docs/specs/2026-04-14-docs-restructure-design.md)
```

- [ ] **Step 2: Fix any other cross-refs listed in the audit**

For each line in `.brain/docs-migration-audit.txt`, open the file, update the path to the new location per the file-mapping table in `docs/specs/2026-04-14-docs-restructure-design.md`.

Common patterns:
- `docs/superpowers/specs/2026-04-14-multi-ai-architecture-design.md` → `docs/specs/2026-04-14-multi-ai-architecture.md`
- `docs/superpowers/plans/2026-04-14-multi-ai-architecture.md` → `docs/archive/plans/2026-04-14-multi-ai-architecture.md`
- `docs/PLAN-FOO.md` → `docs/plans/foo.md` or `docs/archive/plans/foo.md` per plan's status

- [ ] **Step 3: Verify no stale references remain in the repo**

Run:
```bash
grep -rn "docs/PLAN-\|docs/superpowers\|docs/panel-observer\|docs/WORKFLOW-EROS\|docs/eros-v9-proposal\|docs/pegasuz-\|docs/eros-panel-aesthetic\|docs/observer-upgrade\|docs/reference-analysis-fluid\|docs/ux-reform\|docs/PLANS-STATUS" \
  --exclude-dir=docs --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.brain . 2>&1 | head -5
```

Expected: no output. If any hits remain, update them and re-run.

- [ ] **Step 4: Commit**

```bash
git add -u
git commit -m "docs: update cross-references to new docs/ layout

README.md + .omc/prd.json pointer to multi-AI spec. Confirms no stale
references to moved PLAN-*.md, superpowers/, panel-observer/, or
relocated files remain anywhere in the repo."
```

---

## Task 12: Extend `eros-doctor` with RULE 8, 9, 10 (TDD)

**Files:**
- Modify: `.eros/scripts/eros-doctor.mjs`
- Temporary test artifact: `docs/PLAN-TEST-FIXTURE.md` (created and deleted inside tasks)

- [ ] **Step 1: Read the current eros-doctor structure to understand the rule pattern**

Run:
```bash
wc -l .eros/scripts/eros-doctor.mjs
grep -n "^// RULE\|^function rule" .eros/scripts/eros-doctor.mjs | head -20
```

Use the output to locate where new rules should slot in (after the last existing rule).

- [ ] **Step 2: Write RULE 8 test first (docs/README.md must exist)**

Create a failing state:
```bash
mv docs/README.md docs/README.md.bak
node .eros/scripts/eros-doctor.mjs
```

Expected: doctor should FAIL. But before implementing RULE 8, it will currently PASS because nothing checks for `docs/README.md`.

Confirm current pass (the test fails first because it cannot distinguish):
```bash
node .eros/scripts/eros-doctor.mjs; echo "exit: $?"
```

Expected: "All checks passed" and exit 0 (because RULE 8 doesn't exist yet — this is the RED state of TDD).

Restore:
```bash
mv docs/README.md.bak docs/README.md
```

- [ ] **Step 3: Implement RULE 8**

Open `.eros/scripts/eros-doctor.mjs`. Add after the last existing rule function:

```javascript
function rule8_docsReadmeExists(issues) {
  const readmePath = path.join(ROOT, 'docs', 'README.md');
  if (!fs.existsSync(readmePath)) {
    issues.push({
      rule: 8,
      severity: 'ERROR',
      message: 'docs/README.md missing — required entry point for AI agents.',
    });
  }
}
```

Register it in the main run loop where other `ruleN_*` functions are called.

- [ ] **Step 4: Verify RULE 8 works**

Run:
```bash
mv docs/README.md docs/README.md.bak
node .eros/scripts/eros-doctor.mjs; echo "exit: $?"
```

Expected: FAIL with rule-8 ERROR mentioning `docs/README.md missing`, exit code non-zero.

Restore:
```bash
mv docs/README.md.bak docs/README.md
node .eros/scripts/eros-doctor.mjs
```

Expected: "All checks passed" again.

- [ ] **Step 5: Write RULE 9 test (no `PLAN-*.md` in `docs/` root)**

Create a failing state by dropping a fixture file:
```bash
touch docs/PLAN-TEST-FIXTURE.md
node .eros/scripts/eros-doctor.mjs; echo "exit: $?"
```

Expected: currently PASS (RULE 9 not yet implemented — RED state).

- [ ] **Step 6: Implement RULE 9**

Add to `.eros/scripts/eros-doctor.mjs`:

```javascript
function rule9_noPlanPrefixInRoot(issues) {
  const docsRoot = path.join(ROOT, 'docs');
  if (!fs.existsSync(docsRoot)) return;
  const offenders = fs.readdirSync(docsRoot)
    .filter(f => /^PLAN-.*\.md$/.test(f));
  if (offenders.length > 0) {
    issues.push({
      rule: 9,
      severity: 'ERROR',
      message: `Legacy PLAN-*.md files in docs/ root: ${offenders.join(', ')}. Move to docs/plans/ or docs/archive/plans/.`,
    });
  }
}
```

Register in main run loop.

- [ ] **Step 7: Verify RULE 9 works**

```bash
node .eros/scripts/eros-doctor.mjs; echo "exit: $?"
```

Expected: FAIL citing `PLAN-TEST-FIXTURE.md`.

Clean up:
```bash
rm docs/PLAN-TEST-FIXTURE.md
node .eros/scripts/eros-doctor.mjs
```

Expected: "All checks passed".

- [ ] **Step 8: Write RULE 10 test (no image files in `docs/`)**

Create failing state:
```bash
touch docs/fixture.png
node .eros/scripts/eros-doctor.mjs; echo "exit: $?"
```

Expected: currently PASS (RULE 10 not yet implemented — RED state).

- [ ] **Step 9: Implement RULE 10**

Add:

```javascript
function rule10_noImagesInDocs(issues) {
  const docsRoot = path.join(ROOT, 'docs');
  if (!fs.existsSync(docsRoot)) return;

  const exts = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif']);
  const offenders = [];

  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (exts.has(path.extname(entry.name).toLowerCase())) {
        offenders.push(path.relative(ROOT, full).replace(/\\/g, '/'));
      }
    }
  }

  walk(docsRoot);
  if (offenders.length > 0) {
    issues.push({
      rule: 10,
      severity: 'ERROR',
      message: `Image files in docs/ (relocate to .eros/memory/observations/): ${offenders.slice(0, 5).join(', ')}${offenders.length > 5 ? ` +${offenders.length - 5} more` : ''}`,
    });
  }
}
```

Register in main run loop.

- [ ] **Step 10: Verify RULE 10 works**

```bash
node .eros/scripts/eros-doctor.mjs; echo "exit: $?"
```

Expected: FAIL citing `docs/fixture.png`.

Clean up:
```bash
rm docs/fixture.png
node .eros/scripts/eros-doctor.mjs
```

Expected: "All checks passed".

- [ ] **Step 11: Commit**

```bash
git add .eros/scripts/eros-doctor.mjs
git commit -m "feat(eros-doctor): add rules 8-10 for docs/ layout enforcement

RULE 8: docs/README.md must exist (AI entry point).
RULE 9: No PLAN-*.md in docs/ root (legacy ALL-CAPS pattern banned).
RULE 10: No image files in docs/ (observations belong in .eros/memory/).

All three rules verified via manual TDD loop (create broken state ->
confirm rule flags it -> fix state -> confirm rule passes)."
```

---

## Task 13: Final validation + push

**Files:** none modified; validation only.

- [ ] **Step 1: Full eros-doctor run**

Run:
```bash
node .eros/scripts/eros-doctor.mjs
```

Expected: "All checks passed" with 10 rules now active.

- [ ] **Step 2: Verify zero stale docs references**

Run:
```bash
grep -rn "docs/PLAN-\|docs/superpowers\|docs/panel-observer\|docs/WORKFLOW-EROS\|docs/eros-v9-proposal\|docs/pegasuz-\|docs/eros-panel-aesthetic\|docs/observer-upgrade\|docs/reference-analysis-fluid\|docs/ux-reform\|docs/PLANS-STATUS" \
  --exclude-dir=docs --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.brain . 2>&1 | head -5
```

Expected: no output.

- [ ] **Step 3: Verify final `docs/` shape**

Run:
```bash
ls docs/
```

Expected output (exactly these entries, alphabetical):
```
README.md
STATUS.md
_libraries/
archive/
plans/
references/
specs/
```

- [ ] **Step 4: Verify every subdir has a README**

Run:
```bash
for d in docs/plans docs/specs docs/references docs/archive .eros/memory/observations/panel; do
  test -f "$d/README.md" && echo "OK   $d/README.md" || echo "MISS $d/README.md"
done
```

Expected: all lines start with `OK`.

- [ ] **Step 5: Smoke-test the script path that references docs/_libraries still works**

Run:
```bash
node -e "const fs = require('fs'); const p = 'docs/_libraries'; console.log('exists:', fs.existsSync(p))"
```

Expected: `exists: true`.

- [ ] **Step 6: Inspect the git log for the migration**

Run:
```bash
git log --oneline master..HEAD | head -20
```

Expected: ~12 commits (one per task that had a commit step — Task 1 had no commit).

- [ ] **Step 7: Push the branch**

Run:
```bash
git push -u origin docs/ai-friendly
```

Expected: pushes successfully, GitHub suggests a PR URL.

- [ ] **Step 8: No final commit**

Validation only — no changes to commit in this task.

---

## Self-review checklist (controller, before handoff)

Run this checklist after all 13 tasks are implemented, before calling the migration done:

- [ ] `node .eros/scripts/eros-doctor.mjs` — all 10 rules pass
- [ ] `ls docs/` shows exactly: `README.md`, `STATUS.md`, `_libraries/`, `archive/`, `plans/`, `references/`, `specs/`
- [ ] `docs/plans/` contains 5 files: 4 migrated plans + this restructure plan
- [ ] `docs/archive/plans/` contains 5 files: 4 implemented + 1 executed multi-ai plan
- [ ] `docs/archive/proposals/` contains 6 files
- [ ] `docs/specs/` contains 2 files
- [ ] `docs/references/` contains 3 files
- [ ] `.eros/memory/observations/panel/` contains 2 dated dirs + a README
- [ ] No `docs/PLAN-*.md`, `docs/superpowers/`, `docs/panel-observer-*`, or `docs/PLANS-STATUS.md` exist
- [ ] README.md references the new spec path
- [ ] git log shows ~12 atomic commits

If any check fails, the corresponding task was incomplete — fix and re-run.

---

## Post-execution (optional next steps, not part of this plan)

- Create PR `docs/ai-friendly` → `master` on GitHub.
- Once merged to master, move this plan file from `docs/plans/2026-04-14-docs-restructure.md` to `docs/archive/plans/2026-04-14-docs-restructure.md` (it will have become `implemented`). This is a trivial follow-up commit; it's out of scope for this plan because the plan cannot move itself during execution.
