# Multi-AI Architecture — Design Spec

**Date:** 2026-04-14
**Branch:** `feat/streamline`
**Status:** Approved + revised with Gemini/Codex research findings and doc-cleanup scope additions
**Owner:** Mateo

**Revision history:**
- v1 (2026-04-14 early): Initial design (5 phases, 3 AI adapters at root)
- v2 (2026-04-14 late): Gemini/Codex research applied → no CODEX.md at root (Codex reads AGENTS.md natively), GEMINI.md uses `@include` syntax. Added Phase 4.5 (doc cleanup) and Phase 5.5 (README revamp).

---

## 1. Context & Motivation

Eros is an autonomous creative-director AI pipeline for Vue 3 design-heavy websites. Today its entire brain runs on markdown files inside `.claude/` — a Claude-specific namespace. Two frictions emerge:

1. **Duplication**: `CLAUDE.md` and `AGENTS.md` overlap ~95% (178 vs. 195 lines). Drift is guaranteed.
2. **AI lock-in**: The naming (`.claude/`, "skills", Claude tool references) couples Eros to Claude conceptually, even though Gemini is gaining ground on frontend work and Codex is also relevant.

This spec redesigns the root-level architecture so that **Eros' identity and brain are AI-neutral**, while each supported AI (Claude, Gemini, Codex) gets a thin adapter layer. The goal is not full multi-AI parity today — it is clean separation of concerns (hedge + architectural cleanup), so that switching or adding an AI is a localized change.

---

## 2. Goals & Non-Goals

### Goals
- Single source of truth for Eros identity (no duplication across AI files)
- Single source of truth for orchestration/brain (no duplication either)
- Each AI has one dedicated root file + one dedicated directory for quirks
- Auto-discovery: any AI session "wakes up" with full context without manual instruction
- Migration is phased, reversible, and commit-safe
- Zero regression for Claude workflows during migration

### Non-Goals
- Building real adapters for Gemini or Codex runtime (skeletons only for now)
- Rewriting the Node.js scripts in `scripts/` (they are already AI-neutral)
- Refactoring `.brain/` per-project working memory (out of scope)
- Redesigning agent prompts or workflows (content preserved, only location changes)

---

## 3. Architecture

### 3.1 Folder structure (target state)

```
Eros/
├── EROS.md                    # Soul: identity, voice, philosophy
├── AGENTS.md                  # Brain: orchestrator contract (AI-neutral)
│                              #        Codex reads this natively (AGENTS.md convention)
├── CLAUDE.md                  # Adapter: Claude tool mappings + quirks
├── GEMINI.md                  # Adapter: Gemini (uses @include to import EROS.md + AGENTS.md)
│                              # NO CODEX.md at root — Codex reads AGENTS.md natively
│
├── .eros/                     # SHARED BRAIN (AI-neutral canonical source)
│   ├── agents/                # Agent prose definitions (designer, builder, etc.)
│   ├── workflows/             # Ex-skills: project, motion-system, etc.
│   ├── memory/                # design-intelligence + personality.json
│   ├── pipeline.md            # Runtime loop contract
│   ├── brain-config.md        # Thresholds, policies
│   └── scripts/               # eros-*.mjs Node scripts (already AI-neutral)
│
├── .claude/                   # CLAUDE ADAPTER
│   ├── agents/                # Wrappers with YAML frontmatter → read .eros/agents/
│   ├── skills/                # Stubs → read .eros/workflows/
│   └── settings.json          # Hooks, permissions, SessionStart
│
├── .gemini/                   # GEMINI ADAPTER
│   ├── settings.json          # Gemini CLI config (context.fileName overrides, tool whitelists)
│   └── (optional: overrides, sub-context GEMINI.md files for specific dirs)
│
└── .codex/                    # CODEX ADAPTER
    ├── AGENTS.override.md     # Local overrides of root AGENTS.md (Codex convention)
    └── config.toml            # Codex config (project_doc_max_bytes, etc.)
```

### 3.2 Responsibility rules

| File/Directory | Purpose | Writer | Reader |
|----------------|---------|--------|--------|
| `EROS.md` | Identity, voice, philosophy | Mateo (curated) | Referenced by all AI adapters |
| `AGENTS.md` | Orchestrator contract, agent registry, quality standards | Mateo (curated) | Codex reads natively; Claude/Gemini via adapter directive/import |
| `CLAUDE.md` | Claude tool mapping, skills invocation, hooks, directive to read EROS+AGENTS | Mateo | Claude auto-loads at session start |
| `GEMINI.md` | Gemini tool mapping via `@EROS.md` + `@AGENTS.md` imports | Mateo | Gemini CLI auto-loads hierarchically |
| `.eros/` | Canonical brain content | CEO + Mateo | All AI adapters forward to here |
| `.claude/` | Claude-specific wrappers, skills stubs, hooks | Mateo (rare) | Claude runtime |
| `.gemini/` | Gemini settings.json, optional sub-context files | Mateo (rare) | Gemini CLI |
| `.codex/` | AGENTS.override.md, config.toml | Mateo (rare) | Codex runtime |

**Golden rule:** `.eros/` is the source of truth. `.claude/`, `.gemini/`, `.codex/` contain ONLY adapters — never content. If a change would duplicate content into an adapter directory, rethink it.

---

## 4. File Contracts

### 4.1 `EROS.md` (~80-120 lines) — THE SOUL
- Mythological origin (descendant of Chaos)
- Essence: desire for beauty, taste, memory, tension, evolution
- Voice and self-expression rules (first person, past references, honesty about uncertainty)
- Design philosophy excellence standard (signatures, composition, depth, typography, motion, craft)
- Growth principles (personality.json evolves per project)
- **MUST NOT contain:** tool names, pipeline mechanics, commands, architecture

### 4.2 `AGENTS.md` (~150-200 lines) — THE BRAIN (orchestrator)
- System purpose and end-to-end behavior
- Memory architecture (3 layers: working / long-term / session)
- Autonomous brain loop (7 steps)
- Agent registry (designer, builder, polisher, evaluator, reference-analyst) with inputs/outputs
- Workflow registry (location, calling conventions conceptually)
- Quality standards (measurable per section)
- Global rules (GSAP anti-patterns, static-first, design tokens)
- Cross-references to EROS.md (soul) and AI adapters
- **MUST NOT contain:** AI-specific tool names (Skill, Task, activate_skill), personality prose

### 4.3 `CLAUDE.md` (~40-60 lines) — CLAUDE ADAPTER
- "Read EROS.md + AGENTS.md first"
- Tool mapping:
  - Spawn agent = `Task(subagent_type=...)`
  - Invoke workflow = `Skill("<name>")`
  - File ops = `Read / Edit / Write / Glob / Grep`
- Skill registry reference (`.claude/skills/` points to `.eros/workflows/`)
- Claude-specific quirks (default language Spanish with Mateo, extended thinking, context windows)
- Hooks reference (SessionStart, PreToolUse, PostToolUse, Stop)

### 4.4 `GEMINI.md` (~30-50 lines) — GEMINI ADAPTER
Gemini CLI supports `@file.md` import syntax inside GEMINI.md, so this file can be ultra-thin:
```markdown
@EROS.md
@AGENTS.md

## Gemini-specific quirks
- Tool mapping (Gemini equivalents for spawn/read/edit)
- Language default (Spanish for Mateo)
- (any Gemini CLI-specific workflow overrides)
```
Zero duplication. Hierarchical loading (global `~/.gemini/GEMINI.md` → project → component) is handled by Gemini CLI natively.

### 4.5 Codex — NO ROOT FILE
Codex reads `AGENTS.md` natively per its open convention ([agents.md](https://agents.md/), stewarded by the Linux Foundation Agentic AI project). No separate `CODEX.md` at the root.

**Codex-specific configuration lives in `.codex/`:**
- `.codex/AGENTS.override.md` — local overrides of root `AGENTS.md` when Codex needs different behavior (e.g., experimental tool flags)
- `.codex/config.toml` — `project_doc_max_bytes`, `project_doc_fallback_filenames`, model selection, sandbox config

The root `AGENTS.md` must be written to be Codex-readable as-is (clear structure, build steps, conventions). Since Codex also benefits from the same orchestrator contract Claude and Gemini need, this is not extra work — just a constraint on how AGENTS.md is written (no Claude-specific jargon).

---

## 5. Discovery Mechanism — Defense in Depth

Each AI session must auto-load the right files without Mateo manually instructing it every time. Three layers of guarantee:

### Layer 1 — Native auto-load (verified via research)
- **Claude Code** auto-loads `CLAUDE.md` (project) + `~/.claude/CLAUDE.md` (global) at session start
- **Codex** auto-loads `AGENTS.md` natively (open convention, Linux Foundation standard). Reads `AGENTS.override.md` first if present. Supports hierarchy (project + subdirectories)
- **Gemini CLI** auto-loads `GEMINI.md` hierarchically: `~/.gemini/GEMINI.md` (global) → project → component-level. Supports `@file.md` import syntax so GEMINI.md can pull in EROS.md + AGENTS.md with zero duplication

### Layer 2 — First-read directive (inside adapter)
Each AI adapter file opens with:
```
## BEFORE RESPONDING: read these files in order
1. EROS.md           <- who you are
2. AGENTS.md         <- how the system works
3. .eros/pipeline.md <- if this is a build task
```

### Layer 3 — Session hooks (hard guarantee for Claude)
`SessionStart` hook in `.claude/settings.json` injects `EROS.md + AGENTS.md` as `<system-reminder>` before Claude sees the user's message. Guaranteed loading, AI cannot skip it.

Future: equivalent hooks for Gemini/Codex when activated.

### Layer 4 — Doctor script
`eros-doctor.mjs` validates:
- All 5 root files exist
- Each AI adapter references EROS + AGENTS
- `.eros/` has expected structure
- No broken path references in scripts

Run on demand or as a Stop hook for continuous validation.

---

## 6. Migration Plan — 5 Phases

All phases commit-safe, reversible, testable. Total estimated effort: **12-16 hours** (includes doc cleanup + README revamp).

### Phase 0 — Root-level refactor (1-2 h, risk: very low)
- Extract identity from current `CLAUDE.md` → create `EROS.md`
- Rewrite `AGENTS.md` neutral (replaces current duplicate) — **written to be Codex-readable as-is**
- Rewrite `CLAUDE.md` as thin adapter (~40-60 lines) with first-read directive
- Create `GEMINI.md` using `@EROS.md` + `@AGENTS.md` imports (~30-50 lines)
- **Does NOT create `CODEX.md`** — Codex reads AGENTS.md natively
- **Does not touch:** `.claude/`, scripts, workflows
- **Validation:** Claude session loads, recognizes Eros identity, responds normally

### Phase 1 — Shared brain to `.eros/` (3-4 h, risk: medium)
- Move `.claude/memory/` → `.eros/memory/`
- Move `.claude/pipeline.md` → `.eros/pipeline.md`
- Move `.claude/brain-config.md` → `.eros/brain-config.md`
- Update paths in `scripts/eros-*.mjs` (estimated 10-15 references)
- Update paths in `.claude/settings.json` hooks if any reference these
- **Validation:** Full build runs clean; CEO loop reads memory correctly

### Phase 2 — Workflows + agents via wrappers (2-3 h, risk: medium)
- Content move: `.claude/skills/project/SKILL.md` (418 lines) → `.eros/workflows/project.md`. Stub `SKILL.md` (5 lines) reads the workflow.
- Same pattern: `.claude/skills/motion-system/` → `.eros/workflows/motion-system.md`
- Content move: `.claude/agents/*.md` (5 agents) → `.eros/agents/`. Wrappers in `.claude/agents/` with YAML frontmatter + include/reference of `.eros/` content.
- **Validation:** Claude can spawn agents and invoke skills as before

### Phase 3 — Gemini + Codex adapter directories (1 h, risk: zero)
- Create `.gemini/settings.json` with minimal config (context.fileName defaults, tool whitelists if needed)
- Create `.codex/AGENTS.override.md` (empty or minimal — future override point)
- Create `.codex/config.toml` with sensible defaults (`project_doc_max_bytes`, etc.)
- **Validation:** Files exist with valid syntax; no runtime activation required yet

### Phase 4 — Defense in depth (1 h, risk: low)
- Add `SessionStart` hook to `.claude/settings.json`: inject EROS.md + AGENTS.md
- Write `scripts/eros-doctor.mjs`: validate structure, paths, references
- Run `eros-doctor` and confirm green
- **Validation:** New session shows auto-injected context; doctor passes

### Phase 4.5 — Documentation path migration (2 h, risk: low)
Update existing documentation to reflect new `.eros/` paths. Audit identified ~8 files needing updates:

**Planning docs with hardcoded `.claude/` references:**
- `docs/PLAN-HARDENING-AUDIT.md`
- `docs/PLAN-OBSERVER-V2.md`
- `docs/PLAN-TRAINING-DASHBOARD.md`
- `docs/PLAN-VERCEL-DEPLOY.md`

**Status/reference docs:**
- `docs/STATUS.md` (describes `.claude/` as canonical namespace — update to `.eros/`)
- `docs/PLANS-STATUS.md` (if any path refs)

**Plan lifecycle decisions (each PLAN-*.md):**
- Mark: `STATUS: implemented` / `STATUS: in-progress` / `STATUS: archived`
- Move implemented/archived plans to `docs/_archive/` if we don't want root pollution
- Keep in-progress at top level

- **Validation:** `grep -r "\.claude/" docs/` returns only intentional references (e.g., "legacy `.claude/`" historical notes); `eros-doctor` passes

### Phase 5 — Legacy cleanup (1 h, risk: low)
- Delete legacy `.agents/` directory (verified to contain only empty `skills/`; 4 doc references non-runtime)
- Remove any duplicate content remnants
- Final `eros-doctor` + full build verification
- **Validation:** Clean end state; all tests green

### Phase 5.5 — README revamp AI-friendly (2-3 h, risk: very low)
Rewrite `README.md` as a top-notch, AI-friendly entry point. Goals:
- **For humans:** 30-second orientation — what is Eros, why does it exist, how to run it
- **For AIs:** explicit pointers to EROS.md + AGENTS.md so any AI opening the repo knows where to go
- **For open-source readiness:** badges, stack, quickstart, architecture diagram (ASCII), contributing notes

**Structure:**
```
README.md
├── Hero: What is Eros (1 paragraph + tagline)
├── Quickstart (3 commands max)
├── Architecture overview (ASCII diagram of root files + .eros/)
├── AI-friendliness section
│   ├── For Claude users
│   ├── For Gemini users
│   └── For Codex users
├── Project conventions (link to AGENTS.md + EROS.md)
├── Stack & scripts
└── Contributing / License
```

- **Validation:** README renders well on GitHub; includes clear "if you are an AI agent, read X" block; doctor passes

---

## 7. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Script breaks during Phase 1 path refactor | Medium | High | Search-and-replace with regex + full test run after each file moved |
| Claude's native agent system fails to load moved files | Low | High | Phase 2 uses wrappers preserving YAML frontmatter; rollback point after Phase 1 |
| SessionStart hook causes token bloat | Low | Medium | Measure token cost; EROS+AGENTS together ~5KB = ~1250 tokens (acceptable) |
| `.agents/` deletion hides something live | Low | Medium | Phase 5 is last; `eros-doctor` runs before delete; git history preserves |
| Mid-migration commit causes broken intermediate state | Medium | Medium | Each phase is one commit; rollback is `git reset --hard` to previous phase tag |
| Windows symlink issues if we try symlinks | High | Medium | **Decision: no symlinks.** Use file-level moves + explicit path updates |

---

## 8. Success Criteria

Migration is complete when:
- [ ] 4 root-level files exist (`EROS.md`, `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`) with correct content and no duplication
- [ ] No `CODEX.md` at root — `AGENTS.md` serves Codex natively
- [ ] `.eros/` contains all canonical brain content
- [ ] `.claude/`, `.gemini/`, `.codex/` contain only adapters (no prose content duplication)
- [ ] `GEMINI.md` uses `@include` syntax to import EROS + AGENTS
- [ ] `eros-doctor` passes with zero warnings
- [ ] A fresh Claude session loads EROS + AGENTS automatically and builds a section successfully
- [ ] Legacy `.agents/` is gone from the tree
- [ ] All `docs/PLAN-*.md` files have clear `STATUS:` markers and no broken `.claude/` references
- [ ] `docs/STATUS.md` reflects `.eros/` canonical namespace
- [ ] `README.md` rewrite shipped with AI-friendly entry block
- [ ] `git log` shows ~8 atomic commits (phases 0, 1, 2, 3, 4, 4.5, 5, 5.5)

---

## 9. Open Questions

- **Q1 (RESOLVED):** Gemini CLI auto-loads `GEMINI.md` hierarchically (global `~/.gemini/GEMINI.md` → project → component). Confirmed via official docs. Layer 1 is reliable.
- **Q2:** Should `personality.json` stay at `.eros/memory/design-intelligence/` or live one level up as `.eros/personality.json`? (Ergonomics question — affects read paths). Resolve during Phase 1.
- **Q3:** Do we want `eros-doctor` to run as a pre-commit hook or just on-demand? (Answer likely: on-demand first, maybe pre-commit later). Resolve during Phase 4.
- **Q4 (NEW):** What is the PLAN-*.md lifecycle decision per file? (audit, hardening, observer-v2, training-dashboard, vercel-deploy — implemented? in-progress? archive?). Resolve during Phase 4.5 before doing path updates.

Only Q2, Q3, Q4 remain open. None block spec approval.

---

## 10. Out-of-Scope (explicit non-goals)

- Building real Gemini/Codex runtime adapters (config skeletons only)
- Testing Eros end-to-end on Gemini or Codex (that's a future spec)
- Changing agent prose content (behavior preserved, only location changes)
- Modifying `.brain/` per-project working memory structure
- Rewriting the 30+ files in `.eros/memory/design-intelligence/` (path update only)
- Creating `.gemini/workflows/` and `.gemini/agents/` beyond empty stubs — content lives in `.eros/`

---

## 11. References

- [GEMINI.md convention docs](https://geminicli.com/docs/cli/gemini-md/) — hierarchical loading, `@include` syntax
- [Gemini CLI GEMINI.md hierarchy (GitHub)](https://github.com/google-gemini/gemini-cli/blob/main/docs/cli/gemini-md.md)
- [Codex AGENTS.md guide (OpenAI)](https://developers.openai.com/codex/guides/agents-md) — AGENTS.override.md pattern, config knobs
- [Codex config basics](https://developers.openai.com/codex/config-basic) — config.toml reference
- [AGENTS.md open standard](https://agents.md/) — Linux Foundation Agentic AI project
