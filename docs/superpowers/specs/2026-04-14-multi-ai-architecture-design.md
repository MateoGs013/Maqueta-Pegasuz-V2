# Multi-AI Architecture — Design Spec

**Date:** 2026-04-14
**Branch:** `feat/streamline`
**Status:** Approved (pending final user review of this spec)
**Owner:** Mateo

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
├── CLAUDE.md                  # Adapter: Claude tool mappings + quirks
├── GEMINI.md                  # Adapter: Gemini tool mappings + quirks
├── CODEX.md                   # Adapter: Codex tool mappings + quirks
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
├── .gemini/                   # GEMINI ADAPTER (skeleton for now)
│   ├── workflows/             # Activation configs → .eros/workflows/
│   └── agents/                # Gemini agent configs → .eros/agents/
│
└── .codex/                    # CODEX ADAPTER (skeleton for now)
    └── (TBD per Codex conventions)
```

### 3.2 Responsibility rules

| File/Directory | Purpose | Writer | Reader |
|----------------|---------|--------|--------|
| `EROS.md` | Identity, voice, philosophy | Mateo (curated) | All AIs at session start |
| `AGENTS.md` | Orchestrator contract, agent registry, quality standards | Mateo (curated) | All AIs at session start |
| `CLAUDE.md` | Claude tool mapping, skills invocation, hooks | Mateo | Claude at session start |
| `GEMINI.md` | Gemini tool mapping, activation mechanism | Mateo | Gemini at session start |
| `CODEX.md` | Codex tool mapping, conventions | Mateo | Codex at session start |
| `.eros/` | Canonical brain content | CEO + Mateo | All AI adapters forward to here |
| `.claude/`, `.gemini/`, `.codex/` | Thin wrappers/adapters | Mateo (rare) | Respective AI runtime |

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

### 4.4 `GEMINI.md` (~40-60 lines) — GEMINI ADAPTER
- "Read EROS.md + AGENTS.md first"
- Gemini tool mapping equivalent
- `.gemini/workflows/` and `.gemini/agents/` configs
- Gemini-specific quirks (tool catalog differences, reduced motion defaults for frontend)

### 4.5 `CODEX.md` (~40-60 lines) — CODEX ADAPTER
- "Read EROS.md + AGENTS.md first"
- Codex tool mapping
- `.codex/` configuration

---

## 5. Discovery Mechanism — Defense in Depth

Each AI session must auto-load the right files without Mateo manually instructing it every time. Three layers of guarantee:

### Layer 1 — Native auto-load (already exists)
- **Claude Code** auto-loads `CLAUDE.md` at session start
- **Codex** auto-loads `AGENTS.md` natively
- **Gemini CLI** auto-loads `GEMINI.md`

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

All phases commit-safe, reversible, testable. Total estimated effort: 8-12 hours.

### Phase 0 — Root-level refactor (1-2 h, risk: very low)
- Extract identity from current `CLAUDE.md` → create `EROS.md`
- Rewrite `AGENTS.md` neutral (replaces current duplicate)
- Rewrite `CLAUDE.md` as thin adapter (~40-60 lines)
- Create `GEMINI.md` and `CODEX.md` stubs
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

### Phase 3 — Gemini + Codex skeletons (1 h, risk: zero)
- Create empty `.gemini/workflows/`, `.gemini/agents/` with placeholder stubs
- Create `.codex/` placeholder per Codex convention
- Write content for `GEMINI.md` and `CODEX.md` adapter files
- **Validation:** Files exist; no runtime activation yet

### Phase 4 — Defense in depth (1 h, risk: low)
- Add `SessionStart` hook to `.claude/settings.json`: inject EROS.md + AGENTS.md
- Write `scripts/eros-doctor.mjs`: validate structure, paths, references
- Run `eros-doctor` and confirm green
- **Validation:** New session shows auto-injected context; doctor passes

### Phase 5 — Cleanup (1 h, risk: low)
- Delete legacy `.agents/` directory (verified to contain only empty `skills/`; 4 doc references non-runtime)
- Remove any duplicate content remnants
- Delete stale docs identified during migration
- Final `eros-doctor` + full build verification
- **Validation:** Clean end state; all tests green

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
- [ ] All 5 root-level files exist with correct content and no duplication
- [ ] `.eros/` contains all canonical brain content
- [ ] `.claude/`, `.gemini/`, `.codex/` contain only adapters (no prose content)
- [ ] `eros-doctor` passes with zero warnings
- [ ] A fresh Claude session loads EROS + AGENTS automatically and builds a section successfully
- [ ] Legacy `.agents/` is gone from the tree
- [ ] `git log` shows 5 atomic commits corresponding to phases 0-4 plus a cleanup commit for phase 5

---

## 9. Open Questions

- **Q1:** Does Gemini CLI auto-load `GEMINI.md` today, or does the user always pass a file? (Affects Layer 1 reliability)
- **Q2:** Should `personality.json` stay at `.eros/memory/design-intelligence/` or live one level up as `.eros/personality.json`? (Ergonomics question — affects read paths)
- **Q3:** Do we want `eros-doctor` to run as a pre-commit hook or just on-demand? (Answer likely: on-demand first, maybe pre-commit later)

These questions do not block approval but will be resolved during implementation.

---

## 10. Out-of-Scope (explicit non-goals)

- Building real Gemini/Codex runtime adapters (skeleton only)
- Refactoring the 67 .md files identified in the broader audit (only the ones touched by this migration)
- Changing agent prose content (behavior preserved, only location changes)
- Modifying `.brain/` per-project working memory structure
- Public documentation or open-sourcing of Eros (separate concern)
