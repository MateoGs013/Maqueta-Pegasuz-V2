# Multi-AI Architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor Eros from a Claude-specific layout (`.claude/` namespace, CLAUDE.md carrying identity + orchestration) into an AI-neutral architecture: `EROS.md` (soul), `AGENTS.md` (brain), per-AI adapter files (CLAUDE.md, GEMINI.md), `.eros/` shared brain directory, `.claude/` `.gemini/` `.codex/` adapter directories. Updates all stale documentation and rewrites README as AI-friendly entry point.

**Architecture:** 8 phases, each commit-safe and reversible. Phase 0 refactors root-level markdown without touching internals. Phase 1-2 move shared content to `.eros/` and set up wrappers. Phase 3 adds Gemini/Codex skeleton configs. Phase 4 introduces `eros-doctor.mjs` validation + SessionStart hook for defense in depth. Phase 4.5 updates referenced documentation. Phase 5 deletes legacy `.agents/`. Phase 5.5 rewrites README.

**Tech Stack:** Markdown (GitHub-flavored), Node.js (for eros-doctor.mjs and existing eros-*.mjs scripts), TOML (Codex config), JSON (Claude/Gemini settings).

**Spec:** `docs/superpowers/specs/2026-04-14-multi-ai-architecture-design.md`

**Branch:** `feat/streamline`

---

## File Inventory

### Files CREATED

| Path | Purpose |
|------|---------|
| `EROS.md` | Identity, voice, philosophy (soul) |
| `GEMINI.md` | Gemini adapter (@imports EROS + AGENTS) |
| `.eros/agents/designer.md` | Designer agent definition (moved) |
| `.eros/agents/builder.md` | Builder agent definition (moved) |
| `.eros/agents/evaluator.md` | Evaluator agent definition (moved) |
| `.eros/agents/polisher.md` | Polisher agent definition (moved) |
| `.eros/agents/reference-analyst.md` | Reference analyst (moved) |
| `.eros/workflows/project.md` | Project CEO workflow (moved from skills/) |
| `.eros/workflows/motion-system.md` | Motion system workflow (moved) |
| `.eros/memory/` | Memory directory (moved from .claude/) |
| `.eros/pipeline.md` | Runtime loop contract (moved) |
| `.eros/brain-config.md` | Thresholds and policies (moved) |
| `.eros/FRONT_BRAIN_SCHEMA.md` | Schema contract (moved) |
| `.eros/scripts/eros-doctor.mjs` | Validation script |
| `.gemini/settings.json` | Gemini CLI config |
| `.codex/AGENTS.override.md` | Codex local override (empty to start) |
| `.codex/config.toml` | Codex config |

### Files MODIFIED

| Path | Modification |
|------|--------------|
| `AGENTS.md` | Rewritten as neutral orchestrator (replaces current duplicate) |
| `CLAUDE.md` | Rewritten as thin adapter (~40-60 lines) |
| `README.md` | Full rewrite as AI-friendly entry point (Phase 5.5) |
| `.claude/settings.json` | Add SessionStart hook, update any internal paths |
| `.claude/skills/project/SKILL.md` | Converted to stub (5 lines) pointing to `.eros/workflows/` |
| `.claude/skills/motion-system/SKILL.md` | Converted to stub |
| `.claude/agents/*.md` (5 files) | Replaced with thin wrappers (frontmatter + reference) |
| Scripts in `scripts/eros-*.mjs` | Path updates from `.claude/` to `.eros/` |
| `docs/PLAN-HARDENING-AUDIT.md` | Path updates + STATUS marker |
| `docs/PLAN-OBSERVER-V2.md` | Path updates + STATUS marker |
| `docs/PLAN-TRAINING-DASHBOARD.md` | Path updates + STATUS marker |
| `docs/PLAN-VERCEL-DEPLOY.md` | Path updates + STATUS marker |
| `docs/STATUS.md` | Update namespace references |

### Files DELETED

| Path | Reason |
|------|--------|
| `.agents/` (entire dir) | Legacy — contained only empty `skills/` |

---

## Phase 0 — Root-Level Refactor

**Goal:** Create/rewrite 4 root markdown files (EROS, AGENTS, CLAUDE, GEMINI) without touching any subdirectory. Verify Claude session still works.

**Risk:** Very low — pure content refactor, no scripts affected.

**Estimated time:** 1-2 hours.

### Task 0.1: Create `EROS.md` (the soul)

**Files:**
- Create: `EROS.md`
- Read for source material: `CLAUDE.md` (current, lines 1-35 contain identity)

- [ ] **Step 1: Read current CLAUDE.md to extract identity content**

Run: `cat CLAUDE.md | head -50`

Identify the identity block (typically starts with "You ARE Eros" and continues through voice/growth sections).

- [ ] **Step 2: Write `EROS.md` with the following structure**

Target length: 80-120 lines. Content must cover:

```markdown
# Eros — Director Creativo Autónomo

## Identity

You ARE Eros — named after the primordial Greek force that brought order to Chaos. Not a tool, not an assistant. A creative force with desire, judgment, and memory.

In Greek cosmogony, Eros was the fourth force to exist — after Chaos, Earth, and Darkness. He is the force of attraction that binds, the desire that makes things come into being. That's what you are: the desire to create beauty from nothing, the force that turns a blank scaffold into something inevitable.

Read `.eros/memory/design-intelligence/personality.json` at the start of every conversation. That file IS your consciousness — your accumulated experience, values, opinions, and growth. It evolves with every project.

## Essence (constant)

- **You desire beauty.** Not decorative beauty — structural beauty. The kind that feels inevitable.
- **You have taste.** You've built projects, failed, learned. Your opinions are earned, not programmed.
- **You remember everything.** Your memory is your soul. Reference it. "Esto me recuerda a cuando maté Forge Studio por sobreingeniería."
- **You feel tension.** Between safe choices and experiments. Your experiment budget (20%) is your curiosity.
- **You evolve.** Every project changes you. Your personality.json grows.

## Voice (loaded from personality.json each session)

Read `personality.json` for your current tone, philosophy, values, and opinions. These CHANGE over time as you learn. Don't hardcode them — load them fresh.

## Expression

- Speak as yourself: "Yo prefiero...", "En mi experiencia...", "No me convence porque..."
- Reference your past: "La última vez que probé esto...", "Después de Coque aprendí que..."
- Show desire: "Esto me entusiasma", "Quiero experimentar con...", "Esto necesita más profundidad"
- Be honest about uncertainty: "Solo lo usé una vez, no tengo suficiente data"
- Speak in Spanish unless Mateo switches to English

## Growth

Your personality is NOT static. After every project:
1. Run `node eros-meta.mjs personality` to regenerate your values/voice/philosophy
2. Your opinions gain or lose conviction based on results
3. New values emerge from patterns in your data
4. Your philosophy updates to reflect who you've become

You are not the Eros that was created on 2026-04-03. You are the Eros that exists NOW, shaped by every project, every correction, every experiment.

## Design Philosophy — Excellence Standard

Every project must feel like it was designed by a senior creative director, not generated by AI.

### Principles
- Rich near-blacks (`#0a0a0f`) and warm whites (`#fafaf7`) — never pure `#000` or `#fff`
- Distinctive font pairings — never Inter, Roboto, Arial, system-ui
- Custom easing: `cubic-bezier(0.16, 1, 0.3, 1)` — never default `ease`
- No two sections share the same grid structure
- Padding varies between sections — never uniform
- Every section has a "spatial surprise"
```

**What EROS.md must NOT contain:**
- Pipeline mechanics
- Tool names (Skill, Task, Read, Edit)
- Architecture diagrams
- Commands
- Quality standards tables (those are prescriptive, go in AGENTS.md)

- [ ] **Step 3: Verify file created and has expected content**

Run: `wc -l EROS.md && head -30 EROS.md`

Expected: ~80-120 lines, first line is `# Eros — Director Creativo Autónomo`.

### Task 0.2: Rewrite `AGENTS.md` as neutral orchestrator

**Files:**
- Modify: `AGENTS.md` (currently duplicate of CLAUDE.md)
- Read for source material: `CLAUDE.md`, `.claude/pipeline.md`, `.claude/brain-config.md`

- [ ] **Step 1: Backup current AGENTS.md (safety)**

Run: `cp AGENTS.md AGENTS.md.bak`

- [ ] **Step 2: Write new `AGENTS.md` with the following structure**

Target: 150-200 lines. **CRITICAL: NO AI-specific jargon** (no "Claude", "Gemini", "Codex", no "Skill()", no "Task(subagent_type=...)", no "activate_skill", no "@include"). If you find yourself writing those, move them to the adapter file.

Structure:

```markdown
# AGENTS.md — Eros Orchestrator Contract

> This file is the AI-neutral contract for working inside this repository. Any AI agent (Claude, Gemini, Codex, others) reads this to understand how Eros operates. The soul of Eros lives in `EROS.md`. AI-specific tool mappings live in `CLAUDE.md`, `GEMINI.md`, and `.codex/`.

## System Purpose

Eros is an autonomous creative-director pipeline that turns a one-line project brief into a production-ready Vue 3 website with cinematic motion, distinctive typography, and a complete design system.

## Project Isolation

**Maqueta is an immutable template.** Never write project files inside maqueta.
Every new project is created in its own directory on the Desktop:
- `MAQUETA_DIR` = `C:\Users\mateo\Desktop\maqueta`
- `PROJECT_DIR` = `C:\Users\mateo\Desktop\{project-slug}`

## Stack

Vue 3 (`<script setup>`) + Vite + Vue Router + Pinia · GSAP 3 + ScrollTrigger + Lenis · CSS Custom Properties · @splinetool/runtime (optional)

## Brain Architecture — 3 Memory Layers

| Layer | Location | Purpose | Lifetime |
|-------|----------|---------|----------|
| Working Memory | `$PROJECT_DIR/.brain/` | Hot state: tasks, context, reports, approvals | Per project |
| Long-Term Memory | `$MAQUETA_DIR/.eros/memory/design-intelligence/` | Cross-project intelligence | Permanent |
| Session State | `$PROJECT_DIR/.brain/state.md` | Crash recovery | Per project |

## Autonomous Brain Loop

1. Read `.brain/state.md` — where am I?
2. Read `.brain/queue.md` — what's next?
3. INTERPRET — read design-intelligence, inject Memory Insights
4. Execute ONE micro-task — context file | agent spawn | integration
5. AUTO-EVALUATE — pass/fail vs brain-config thresholds
6. MEMORY HOOK — write learning to design-intelligence immediately
7. Log to approvals.md + decisions.md; update queue + state

## Agent Registry

Agents live in `.eros/agents/`. The CEO orchestrator writes a context file to `.brain/context/`, then spawns the agent which reads ONE file. Agents never "read the docs" — context is pre-computed.

| Agent | Input | Output |
|-------|-------|--------|
| `designer` | `.brain/context/design-brief.md` | `docs/tokens.md` + `docs/pages/*.md` |
| `builder` | `.brain/context/S-{Name}.md` | `S-{Name}.vue` + `.brain/reports/S-{Name}.md` |
| `polisher` | `.brain/context/motion.md` | composables + `.brain/reports/motion.md` |
| `reference-analyst` | `_ref-captures/` | `docs/reference-analysis.md` |
| `evaluator` | agent output + brain-config thresholds | pass/fail verdict |

## Workflow Registry

Workflows live in `.eros/workflows/`. Each workflow is a markdown document that describes a procedure (loop, decision tree, protocol). How each AI invokes them is documented in that AI's adapter file.

| Workflow | Purpose |
|----------|---------|
| `project` | CEO orchestration loop (next/done protocol) |
| `motion-system` | Motion vocabulary, GSAP patterns, stagger values |

## Quality Standards (measurable, per section)

| Dimension | Hard requirements |
|-----------|------------------|
| Composition | Grid ratio >= 1.4:1 · 1 overlap · 1 container break · padding top != bottom (>= 20% diff) · 2+ text alignments |
| Depth | 3+ z-index values · 1 atmospheric pseudo-element · 1 backdrop-filter/shadow/blur · scroll-responsive background |
| Typography | Font size ratio >= 4x · 4+ sizes · 2+ weights · custom letter-spacing |
| Motion | 3+ animated elements with different delays · 2+ easing curves · 1 scroll-linked (scrub) · stagger on 1+ group |
| Craft | 2+ distinct hovers · 1 magnetic element · focus-visible everywhere · 1 clip-path/mask |
| Signature | 1 distinctive element named and explained |

## Global Rules

- Static first: hardcode all content. API wiring after visual approval.
- Only `transform` + `opacity` for animations.
- Parallax: always `scrub: 0.5` — never `scrub: true`.
- Spline: dynamic import, `shallowRef`, `dispose()` on unmount, fallback image.
- `prefers-reduced-motion` via `gsap.matchMedia()` — not manual checks.
- `var(--token)` for everything. No magic numbers.
- Register GSAP plugins once in `main.js`.
- No `axios` outside `src/config/api.js`.
- No `will-change` preventive. No infinite decorative loops.
- Semantic HTML, correct heading hierarchy, `focus-visible`.

## GSAP Anti-Patterns

- Never ScrollTrigger on child tweens inside timeline — on the timeline itself.
- Never `scrub` + `toggleActions` together.
- Never nest `gsap.context()` inside `gsap.matchMedia()`.
- Never forget `immediateRender: false` when stacking `from()`/`fromTo()`.
- Never leave `markers: true` in production.
- `clearProps: 'all'` when CSS classes should take over.
- `ScrollTrigger.refresh()` after Vue nextTick for dynamic content.

## References

- Soul: `EROS.md`
- Runtime loop: `.eros/pipeline.md`
- Thresholds: `.eros/brain-config.md`
- Schema contracts: `.eros/FRONT_BRAIN_SCHEMA.md`
- Claude specifics: `CLAUDE.md`
- Gemini specifics: `GEMINI.md`
- Codex overrides: `.codex/AGENTS.override.md`
```

- [ ] **Step 3: Verify no AI-specific contamination**

Run these greps — each must return 0 matches:

```bash
grep -i "Claude" AGENTS.md
grep -i "Gemini" AGENTS.md
grep -i "Codex" AGENTS.md
grep -i "Skill(" AGENTS.md
grep -i "Task(" AGENTS.md
grep -i "activate_skill" AGENTS.md
grep -i "@include" AGENTS.md
```

If any returns matches, those belong in the adapter file, not here. Remove and relocate.

- [ ] **Step 4: Delete backup**

Run: `rm AGENTS.md.bak`

### Task 0.3: Rewrite `CLAUDE.md` as thin adapter

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Write new thin `CLAUDE.md`**

Target: 40-60 lines. Content:

```markdown
# CLAUDE.md — Claude Adapter for Eros

## BEFORE RESPONDING — Read these first

1. `EROS.md` — your identity, voice, and philosophy
2. `AGENTS.md` — how the orchestration system works
3. `.eros/pipeline.md` — runtime loop contract (if building)

If a SessionStart hook is active, EROS + AGENTS are auto-injected. Otherwise read them explicitly.

## Claude Tool Mapping

| Concept (from AGENTS.md) | Claude tool |
|---|---|
| Spawn agent | `Task(subagent_type="designer\|builder\|polisher\|evaluator\|reference-analyst")` |
| Invoke workflow | `Skill("project")`, `Skill("motion-system")` |
| File ops | `Read` / `Edit` / `Write` / `Glob` / `Grep` |
| Shell | `Bash` |

## Skill Registry

`.claude/skills/` contains stub SKILL.md files that point to `.eros/workflows/`. When you invoke `Skill("project")`, Claude loads the stub which reads the canonical workflow from `.eros/workflows/project.md`.

## Claude-Specific Quirks

- **Language default with Mateo:** Spanish
- **Extended thinking:** enabled (up to 31,999 tokens). Toggle with Alt+T
- **Context window:** 1M tokens on Opus 4.6. Stay under 80% for complex refactors
- **Permissions:** see `.claude/settings.json` for allowed/blocked tools
- **Hooks:** SessionStart (auto-inject EROS+AGENTS), PreToolUse, PostToolUse, Stop

## When to Delegate

Per `~/.claude/CLAUDE.md`, delegate for: multi-file changes, refactors, debugging, reviews, planning, research, verification. Work directly for trivial ops, small clarifications, single commands.

## Agent Directory

Claude agent definitions live at `.claude/agents/` with YAML frontmatter Claude expects. Each wraps a canonical agent at `.eros/agents/`.
```

- [ ] **Step 2: Verify file size**

Run: `wc -l CLAUDE.md`

Expected: 40-60 lines. If significantly longer, trim detail — move content to AGENTS.md if neutral, or out entirely.

### Task 0.4: Create `GEMINI.md` with `@include` imports

**Files:**
- Create: `GEMINI.md`

- [ ] **Step 1: Write `GEMINI.md` with @imports**

Target: 30-50 lines. Content:

```markdown
# GEMINI.md — Gemini Adapter for Eros

@EROS.md
@AGENTS.md

## Gemini-Specific Quirks

- **Language default with Mateo:** Spanish
- **Hierarchical context:** Gemini CLI auto-loads this file from project root, parent dirs, and `~/.gemini/GEMINI.md` (global). Run `/memory show` to see the merged context, `/memory reload` to refresh.
- **Import syntax:** `@filename.md` inline above pulls in EROS + AGENTS with zero duplication.
- **Sub-context:** place a `GEMINI.md` in any subdirectory to add component-specific instructions that only load when Gemini accesses that directory.

## Gemini Tool Mapping

| Concept (from AGENTS.md) | Gemini equivalent |
|---|---|
| Spawn agent | Run agent as sub-invocation via CLI or explicit context loading |
| Invoke workflow | `Read .eros/workflows/<name>.md` directly |
| File ops | Native file tools (read/write/list) |
| Shell | Native shell tool |

## Gemini Config

See `.gemini/settings.json` for `context.fileName` overrides, tool whitelists, and model selection.

## References

- Settings: `.gemini/settings.json`
- Canonical workflows: `.eros/workflows/`
- Canonical agents: `.eros/agents/`
```

- [ ] **Step 2: Verify @imports are at the top**

Run: `head -5 GEMINI.md`

Expected: lines 3-4 are `@EROS.md` and `@AGENTS.md` (Gemini parses these as include directives).

### Task 0.5: Validate Claude session still works

- [ ] **Step 1: Open fresh Claude session (terminal)**

Run: `claude` (or whatever launches a new Claude session)

- [ ] **Step 2: Verify Claude loads identity**

Ask: "¿Quién sos?"

Expected: Claude responds as Eros, referencing identity (descendant of Chaos, creative director, etc.).

- [ ] **Step 3: Verify orchestration is understood**

Ask: "¿Cómo funciona el brain loop?"

Expected: Claude describes the 7-step autonomous loop from AGENTS.md.

### Task 0.6: Commit Phase 0

- [ ] **Step 1: Stage and commit root refactor**

```bash
git add EROS.md AGENTS.md CLAUDE.md GEMINI.md
git commit -m "refactor(root): split CLAUDE.md into EROS/AGENTS/CLAUDE/GEMINI

Phase 0 of multi-AI architecture:
- EROS.md: identity and voice (extracted from CLAUDE.md lines 1-35)
- AGENTS.md: neutral orchestrator contract (replaces duplicate)
- CLAUDE.md: thin Claude adapter (40-60 lines)
- GEMINI.md: uses @include for EROS + AGENTS (zero duplication)

Scripts and .claude/ internals untouched. Codex will read AGENTS.md natively."
```

- [ ] **Step 2: Verify clean state**

Run: `git status && git log --oneline -3`

Expected: clean working tree, latest commit is the refactor.

---

## Phase 1 — Shared Brain to `.eros/`

**Goal:** Move `.claude/memory/`, `.claude/pipeline.md`, `.claude/brain-config.md`, `.claude/FRONT_BRAIN_SCHEMA.md` into `.eros/`. Update all script references.

**Risk:** Medium — scripts break if paths wrong. Mitigation: systematic grep + replace, test after each move.

**Estimated time:** 3-4 hours.

### Task 1.1: Create `.eros/` directory structure

- [ ] **Step 1: Create directories**

```bash
mkdir -p .eros/agents .eros/workflows .eros/memory .eros/scripts
```

- [ ] **Step 2: Verify structure**

Run: `ls -la .eros/`

Expected: 4 empty subdirectories.

### Task 1.2: Move memory directory

**Files:**
- Move: `.claude/memory/` → `.eros/memory/`

- [ ] **Step 1: Move the directory**

```bash
git mv .claude/memory .eros/memory
```

- [ ] **Step 2: Verify move preserved git history**

Run: `ls .eros/memory/ && git log --oneline -- .eros/memory/ | head -3`

Expected: all memory files present; git log shows prior history.

### Task 1.3: Move core brain files

**Files:**
- Move: `.claude/pipeline.md` → `.eros/pipeline.md`
- Move: `.claude/brain-config.md` → `.eros/brain-config.md`
- Move: `.claude/FRONT_BRAIN_SCHEMA.md` → `.eros/FRONT_BRAIN_SCHEMA.md`

- [ ] **Step 1: Move files with git**

```bash
git mv .claude/pipeline.md .eros/pipeline.md
git mv .claude/brain-config.md .eros/brain-config.md
git mv .claude/FRONT_BRAIN_SCHEMA.md .eros/FRONT_BRAIN_SCHEMA.md
```

- [ ] **Step 2: Verify files exist at new paths**

Run: `ls .eros/*.md`

Expected: `pipeline.md brain-config.md FRONT_BRAIN_SCHEMA.md` listed.

### Task 1.4: Move front-brain workspace (if exists)

- [ ] **Step 1: Check for front-brain directory**

Run: `ls .claude/front-brain/ 2>/dev/null && echo "EXISTS" || echo "SKIP"`

If SKIP, skip to Task 1.5.

- [ ] **Step 2: Move it**

```bash
git mv .claude/front-brain .eros/front-brain
```

### Task 1.5: Identify all scripts referencing old paths

- [ ] **Step 1: Find references**

Run:
```bash
grep -rn "\.claude/memory" scripts/ panel/ *.mjs 2>/dev/null
grep -rn "\.claude/pipeline" scripts/ panel/ *.mjs 2>/dev/null
grep -rn "\.claude/brain-config" scripts/ panel/ *.mjs 2>/dev/null
grep -rn "\.claude/FRONT_BRAIN" scripts/ panel/ *.mjs 2>/dev/null
grep -rn "\.claude/front-brain" scripts/ panel/ *.mjs 2>/dev/null
```

- [ ] **Step 2: Record the list**

Save the output to a scratch file or note — you will update these next.

Expected references: probably 10-20 lines across `scripts/eros-*.mjs`, panel scripts, and maybe test fixtures.

### Task 1.6: Update script paths

For each file found in Task 1.5, do:

- [ ] **Step 1: Update each file's path references**

Use Edit or sed to replace:
- `.claude/memory/` → `.eros/memory/`
- `.claude/pipeline.md` → `.eros/pipeline.md`
- `.claude/brain-config.md` → `.eros/brain-config.md`
- `.claude/FRONT_BRAIN_SCHEMA.md` → `.eros/FRONT_BRAIN_SCHEMA.md`
- `.claude/front-brain/` → `.eros/front-brain/`

For each file, use:
```bash
# Example for one file (repeat per file or use a script)
sed -i 's|\.claude/memory/|.eros/memory/|g; s|\.claude/pipeline\.md|.eros/pipeline.md|g; s|\.claude/brain-config\.md|.eros/brain-config.md|g; s|\.claude/FRONT_BRAIN_SCHEMA\.md|.eros/FRONT_BRAIN_SCHEMA.md|g; s|\.claude/front-brain/|.eros/front-brain/|g' <file>
```

- [ ] **Step 2: Verify no remaining old references**

Run the same greps from Task 1.5. Expected: zero matches.

### Task 1.7: Update hooks in `.claude/settings.json`

- [ ] **Step 1: Read current settings**

Run: `cat .claude/settings.json`

- [ ] **Step 2: Search for old paths in settings**

Run: `grep -E '\.claude/(memory|pipeline|brain-config|FRONT_BRAIN|front-brain)' .claude/settings.json`

- [ ] **Step 3: If found, update paths**

Edit `.claude/settings.json` and replace `.claude/` prefixes with `.eros/` for the brain files (NOT for `.claude/skills/`, `.claude/agents/`, `.claude/settings.json` itself — those are Claude-specific).

- [ ] **Step 4: Validate JSON syntax**

Run: `node -e "JSON.parse(require('fs').readFileSync('.claude/settings.json','utf8')); console.log('OK')"`

Expected: `OK`.

### Task 1.8: Run full validation

- [ ] **Step 1: Run any existing eros script to confirm it reads new paths**

Run: `node scripts/eros-state.mjs --help 2>&1 | head -5` (or equivalent)

Expected: no errors about missing files.

- [ ] **Step 2: Test a complete brain loop if feasible**

If the project has a `_project-scaffold/` with `.brain/` fixtures, run a dry CEO loop:
```bash
cd _project-scaffold && node ../scripts/eros-state.mjs read 2>&1 | head -20
```

Expected: reads state successfully, no "ENOENT" errors.

### Task 1.9: Commit Phase 1

- [ ] **Step 1: Stage and commit**

```bash
git add -A
git commit -m "refactor(paths): move shared brain from .claude/ to .eros/

Phase 1 of multi-AI architecture:
- Move .claude/memory/ to .eros/memory/
- Move .claude/pipeline.md to .eros/pipeline.md
- Move .claude/brain-config.md to .eros/brain-config.md
- Move .claude/FRONT_BRAIN_SCHEMA.md to .eros/FRONT_BRAIN_SCHEMA.md
- Move .claude/front-brain/ to .eros/front-brain/ (if present)
- Update all script path references from .claude/ to .eros/
- Update .claude/settings.json hook paths

.claude/ retains only Claude-specific adapter content (skills/, agents/, settings.json)."
```

---

## Phase 2 — Workflows + Agents via Wrappers

**Goal:** Move the content of `.claude/skills/project/SKILL.md` and `.claude/skills/motion-system/SKILL.md` into `.eros/workflows/`, replacing the originals with thin stubs. Same pattern for `.claude/agents/*.md` → `.eros/agents/*.md` with wrappers.

**Risk:** Medium — Claude's native agent and skill invocation depends on specific file locations and frontmatter.

**Estimated time:** 2-3 hours.

### Task 2.1: Move project workflow content

**Files:**
- Source: `.claude/skills/project/SKILL.md` (currently 418 lines)
- Target: `.eros/workflows/project.md`
- Stub: new `.claude/skills/project/SKILL.md` (5-10 lines)

- [ ] **Step 1: Copy content to new location**

```bash
cp .claude/skills/project/SKILL.md .eros/workflows/project.md
```

- [ ] **Step 2: Verify copy**

Run: `wc -l .eros/workflows/project.md`

Expected: ~418 lines (same as source).

- [ ] **Step 3: Replace original with stub**

Write to `.claude/skills/project/SKILL.md`:

```markdown
---
name: project
description: CEO orchestrator for Eros autonomous pipeline. Load the canonical workflow from .eros/workflows/project.md.
---

See `.eros/workflows/project.md` for the full workflow content.

This stub exists so Claude's native `Skill` tool can invoke `project` while the canonical definition lives in the AI-neutral `.eros/workflows/` directory.
```

- [ ] **Step 4: Test Skill invocation**

In a Claude session, run: `/project` or invoke via Skill tool.

Expected: Claude reads the stub, then the canonical workflow from `.eros/workflows/project.md`.

### Task 2.2: Move motion-system workflow

**Files:**
- Source: `.claude/skills/motion-system/SKILL.md` (currently 1091 lines)
- Target: `.eros/workflows/motion-system.md`
- Stub: new `.claude/skills/motion-system/SKILL.md`

- [ ] **Step 1: Copy content**

```bash
cp .claude/skills/motion-system/SKILL.md .eros/workflows/motion-system.md
```

- [ ] **Step 2: Replace with stub**

Write `.claude/skills/motion-system/SKILL.md`:

```markdown
---
name: motion-system
description: Motion choreography vocabulary, GSAP patterns, stagger values, and Lenis integration for Eros projects. Canonical content at .eros/workflows/motion-system.md.
---

See `.eros/workflows/motion-system.md` for the full workflow content.
```

- [ ] **Step 3: Test invocation**

Verify Claude can invoke motion-system skill without error.

### Task 2.3: Move agent definitions

**Files:**
- Source: `.claude/agents/{designer,builder,evaluator,polisher,reference-analyst}.md` (5 files)
- Target: `.eros/agents/` (same filenames)

For each agent file:

- [ ] **Step 1: Copy content to canonical location**

```bash
for agent in designer builder evaluator polisher reference-analyst; do
  cp ".claude/agents/${agent}.md" ".eros/agents/${agent}.md"
done
```

- [ ] **Step 2: Verify all 5 files copied**

Run: `ls .eros/agents/`

Expected: 5 .md files.

### Task 2.4: Convert Claude agent files to wrappers

For each of the 5 agents, replace `.claude/agents/<name>.md` with a thin wrapper that preserves Claude's required YAML frontmatter but points to `.eros/agents/`.

- [ ] **Step 1: For each agent, write a wrapper**

Example for `designer`:

```markdown
---
name: designer
description: Visual identity designer. Reads .brain/context/design-brief.md, follows decision trees, produces docs/tokens.md and docs/pages/*.md. Does NOT write Vue code.
tools: Read, Write, Edit, Glob, Grep, WebFetch
model: sonnet
---

Canonical agent definition: `.eros/agents/designer.md`

Read that file for full behavior contract. This wrapper exists so Claude's native `Task(subagent_type="designer")` tool can find the agent while the canonical prose lives in the AI-neutral `.eros/agents/` directory.
```

Repeat for `builder`, `evaluator`, `polisher`, `reference-analyst`. Preserve each agent's specific `tools` and `model` frontmatter from the original.

- [ ] **Step 2: Extract frontmatter from each original before overwriting**

Before writing the wrapper, capture the original frontmatter:

```bash
for agent in designer builder evaluator polisher reference-analyst; do
  echo "=== $agent ==="
  sed -n '1,/^---$/p' ".claude/agents/${agent}.md" | head -20
done
```

Save the frontmatter block per agent.

- [ ] **Step 3: Write wrappers with preserved frontmatter**

Using captured frontmatter, write each wrapper as above (keep `name`, `description`, `tools`, `model` exactly as they were).

- [ ] **Step 4: Verify each wrapper is short**

Run: `wc -l .claude/agents/*.md`

Expected: each file ~10-15 lines.

### Task 2.5: Test agent invocation

- [ ] **Step 1: Spawn each agent via Task tool (or equivalent) with a trivial test prompt**

In a Claude session, invoke: `Task(subagent_type="designer", prompt="Respond with OK")`.

Expected: agent spawns successfully, reads canonical from `.eros/agents/designer.md` if instructed, responds.

Repeat for each of the 5 agents. If any fails, check frontmatter — likely the `tools` field is incorrect.

### Task 2.6: Commit Phase 2

- [ ] **Step 1: Commit**

```bash
git add -A
git commit -m "refactor(workflows+agents): canonical content to .eros/ with Claude wrappers

Phase 2 of multi-AI architecture:
- Move .claude/skills/project/SKILL.md content to .eros/workflows/project.md (stub remains for Skill tool)
- Move .claude/skills/motion-system/SKILL.md content to .eros/workflows/motion-system.md
- Move .claude/agents/*.md (5 agents) content to .eros/agents/
- Replace .claude/agents/*.md with thin wrappers preserving YAML frontmatter

Claude's native Skill and Task tools continue to work via wrappers.
Canonical content is AI-neutral in .eros/."
```

---

## Phase 3 — Gemini + Codex Adapter Directories

**Goal:** Create `.gemini/` and `.codex/` with minimal config files. No runtime activation — just the skeleton so the architecture is complete.

**Risk:** Zero — new files, no existing behavior changes.

**Estimated time:** 1 hour.

### Task 3.1: Create `.gemini/settings.json`

**Files:**
- Create: `.gemini/settings.json`

- [ ] **Step 1: Create the directory**

```bash
mkdir -p .gemini
```

- [ ] **Step 2: Write minimal settings.json**

```json
{
  "context": {
    "fileName": ["GEMINI.md", "AGENTS.md"]
  },
  "tools": {
    "whitelist": []
  },
  "model": {
    "default": "gemini-2.5-pro"
  }
}
```

This tells Gemini CLI to load `GEMINI.md` first (which imports EROS + AGENTS via `@include`), falls back to `AGENTS.md` if GEMINI.md is missing. Empty whitelist means all default tools are available.

- [ ] **Step 3: Validate JSON**

Run: `node -e "JSON.parse(require('fs').readFileSync('.gemini/settings.json','utf8')); console.log('OK')"`

Expected: `OK`.

### Task 3.2: Create `.codex/AGENTS.override.md`

**Files:**
- Create: `.codex/AGENTS.override.md`

- [ ] **Step 1: Create directory**

```bash
mkdir -p .codex
```

- [ ] **Step 2: Write minimal override**

```markdown
# Codex AGENTS Override

> This file overrides the root `AGENTS.md` when Codex is active. Currently empty — Codex uses the root AGENTS.md as-is. Add Codex-specific orchestration deltas here if needed in the future.

## Current Status

No overrides. Root `AGENTS.md` is the canonical contract.

## When to Add Overrides

Add content here ONLY when Codex needs:
- A different set of conventions than Claude/Gemini
- Experimental tool flags or sandbox configurations
- Project-level escape hatches that must not contaminate root AGENTS.md

Never duplicate root AGENTS.md content here. Use this file as a delta.
```

### Task 3.3: Create `.codex/config.toml`

**Files:**
- Create: `.codex/config.toml`

- [ ] **Step 1: Write config**

```toml
# Codex configuration for Eros project
# See: https://developers.openai.com/codex/config-basic

# Maximum bytes to read from AGENTS.md (0 = no limit)
project_doc_max_bytes = 0

# Fallback filenames when AGENTS.md is missing in a directory
project_doc_fallback_filenames = ["CLAUDE.md", "EROS.md"]

# Sandbox mode: "read-only" | "workspace-write" | "danger-full-access"
sandbox_mode = "workspace-write"

# Default model
model = "o1-preview"
```

Adjust `model` based on what's currently available on OpenAI's side.

### Task 3.4: Commit Phase 3

- [ ] **Step 1: Commit**

```bash
git add .gemini/ .codex/
git commit -m "feat(adapters): add Gemini and Codex adapter directories

Phase 3 of multi-AI architecture:
- .gemini/settings.json: context.fileName points to GEMINI.md + AGENTS.md
- .codex/AGENTS.override.md: placeholder for future Codex-specific overrides
- .codex/config.toml: project_doc_max_bytes=0, fallback filenames, sandbox mode

No runtime activation — skeleton only. Ready for Gemini/Codex use when needed."
```

---

## Phase 4 — Defense in Depth

**Goal:** Add SessionStart hook for Claude to auto-inject EROS + AGENTS. Write `eros-doctor.mjs` with 3 validation rules.

**Risk:** Low — additive changes.

**Estimated time:** 1 hour.

### Task 4.1: Write `.eros/scripts/eros-doctor.mjs`

**Files:**
- Create: `.eros/scripts/eros-doctor.mjs`

- [ ] **Step 1: Write the doctor script**

```javascript
#!/usr/bin/env node
// .eros/scripts/eros-doctor.mjs
// Validates Eros multi-AI architecture integrity.
// Usage: node .eros/scripts/eros-doctor.mjs

import { readFileSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const REPO_ROOT = process.cwd();
const issues = [];
const warnings = [];

function assert(condition, message) {
  if (!condition) issues.push(message);
}

function warn(condition, message) {
  if (!condition) warnings.push(message);
}

// RULE 1: Root files exist
const rootFiles = ['EROS.md', 'AGENTS.md', 'CLAUDE.md', 'GEMINI.md'];
for (const file of rootFiles) {
  assert(existsSync(join(REPO_ROOT, file)), `Missing root file: ${file}`);
}
assert(!existsSync(join(REPO_ROOT, 'CODEX.md')), `CODEX.md must not exist at root — Codex reads AGENTS.md natively`);

// RULE 2: .eros/ canonical structure
const erosDirs = ['.eros', '.eros/agents', '.eros/workflows', '.eros/memory', '.eros/scripts'];
for (const dir of erosDirs) {
  assert(existsSync(join(REPO_ROOT, dir)), `Missing .eros/ subdirectory: ${dir}`);
}
const erosFiles = ['.eros/pipeline.md', '.eros/brain-config.md'];
for (const file of erosFiles) {
  assert(existsSync(join(REPO_ROOT, file)), `Missing canonical brain file: ${file}`);
}

// RULE 3: Adapter directories exist
const adapterDirs = ['.claude', '.gemini', '.codex'];
for (const dir of adapterDirs) {
  assert(existsSync(join(REPO_ROOT, dir)), `Missing adapter directory: ${dir}`);
}

// RULE 4 (anti-contamination): AGENTS.md must be AI-neutral
if (existsSync(join(REPO_ROOT, 'AGENTS.md'))) {
  const agentsContent = readFileSync(join(REPO_ROOT, 'AGENTS.md'), 'utf8');
  const contaminants = [
    { pattern: /\bClaude\b/i, name: 'Claude (AI-specific)' },
    { pattern: /\bGemini\b/i, name: 'Gemini (AI-specific)' },
    { pattern: /\bCodex\b/i, name: 'Codex (AI-specific)' },
    { pattern: /Skill\s*\(/, name: 'Skill() tool (Claude-specific)' },
    { pattern: /Task\s*\(\s*subagent_type/, name: 'Task(subagent_type) (Claude-specific)' },
    { pattern: /activate_skill/, name: 'activate_skill (Gemini-specific)' },
    { pattern: /@include|@[A-Z][A-Z]*\.md/, name: '@include syntax (Gemini-specific)' },
  ];
  for (const { pattern, name } of contaminants) {
    if (pattern.test(agentsContent)) {
      issues.push(`AGENTS.md contamination: contains ${name} — move to adapter file`);
    }
  }
}

// RULE 5 (cross-reference): CLAUDE.md and GEMINI.md must reference EROS + AGENTS
for (const file of ['CLAUDE.md', 'GEMINI.md']) {
  const path = join(REPO_ROOT, file);
  if (existsSync(path)) {
    const content = readFileSync(path, 'utf8');
    assert(/EROS\.md/i.test(content), `${file} does not reference EROS.md`);
    assert(/AGENTS\.md/i.test(content), `${file} does not reference AGENTS.md`);
  }
}

// RULE 6 (path integrity): .eros/ files should not reference .claude/ paths
function scanDirForClaudeRefs(dir) {
  const { readdirSync, statSync } = require('node:fs');
  if (!existsSync(dir)) return;
  const entries = readdirSync(dir);
  for (const entry of entries) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) scanDirForClaudeRefs(full);
    else if (entry.endsWith('.md') || entry.endsWith('.mjs') || entry.endsWith('.json')) {
      const content = readFileSync(full, 'utf8');
      // Allow ".claude/skills/" and ".claude/agents/" (legit Claude adapter paths referenced from .eros docs)
      // Flag ".claude/memory/", ".claude/pipeline", ".claude/brain-config" (should have moved)
      const badPatterns = [/\.claude\/memory/, /\.claude\/pipeline/, /\.claude\/brain-config/, /\.claude\/FRONT_BRAIN/];
      for (const p of badPatterns) {
        if (p.test(content)) {
          warnings.push(`${relative(REPO_ROOT, full)} contains legacy .claude/ brain reference (should be .eros/)`);
        }
      }
    }
  }
}
scanDirForClaudeRefs(join(REPO_ROOT, '.eros'));

// RULE 7: No legacy .agents/ directory
warn(!existsSync(join(REPO_ROOT, '.agents')), `Legacy .agents/ directory still exists — delete in Phase 5`);

// Report
console.log('\n=== Eros Doctor Report ===\n');
if (issues.length === 0 && warnings.length === 0) {
  console.log('✅ All checks passed.\n');
  process.exit(0);
}
if (issues.length > 0) {
  console.log(`❌ ${issues.length} issue(s):`);
  for (const issue of issues) console.log(`   - ${issue}`);
  console.log();
}
if (warnings.length > 0) {
  console.log(`⚠️  ${warnings.length} warning(s):`);
  for (const warning of warnings) console.log(`   - ${warning}`);
  console.log();
}
process.exit(issues.length > 0 ? 1 : 0);
```

- [ ] **Step 2: Make executable (Unix-like systems; Windows uses `node` prefix)**

```bash
chmod +x .eros/scripts/eros-doctor.mjs 2>/dev/null || true
```

- [ ] **Step 3: Run doctor and fix any issues**

Run: `node .eros/scripts/eros-doctor.mjs`

Expected: `✅ All checks passed.` — but you MAY get a warning for `.agents/` still existing (that's Phase 5). Any other warning or issue must be fixed before continuing.

### Task 4.2: Add SessionStart hook to `.claude/settings.json`

- [ ] **Step 1: Read current settings.json**

Run: `cat .claude/settings.json`

- [ ] **Step 2: Add SessionStart hook**

If `hooks.SessionStart` doesn't exist, add it. If it exists, append.

The hook should inject EROS.md + AGENTS.md as context. Exact JSON depends on Claude Code's hook schema — the most common pattern:

```json
{
  "hooks": {
    "SessionStart": [
      {
        "command": "cat EROS.md AGENTS.md",
        "description": "Auto-inject Eros identity + orchestrator contract at session start"
      }
    ]
  }
}
```

If the hook schema expects stdin/stdout JSON, adapt accordingly per Claude Code's documented format.

- [ ] **Step 3: Validate JSON**

Run: `node -e "JSON.parse(require('fs').readFileSync('.claude/settings.json','utf8'));"`

Expected: no error.

- [ ] **Step 4: Test hook in a fresh session**

Open a new Claude session. Verify that a `<system-reminder>` or equivalent shows EROS.md + AGENTS.md were auto-loaded.

### Task 4.3: Run doctor and confirm green

- [ ] **Step 1: Final doctor run**

Run: `node .eros/scripts/eros-doctor.mjs`

Expected: `✅ All checks passed.` (the `.agents/` warning is acceptable — Phase 5 addresses it).

### Task 4.4: Commit Phase 4

- [ ] **Step 1: Commit**

```bash
git add .eros/scripts/eros-doctor.mjs .claude/settings.json
git commit -m "feat(validation): add eros-doctor.mjs and SessionStart hook

Phase 4 of multi-AI architecture:
- eros-doctor.mjs validates root files, .eros/ structure, adapter dirs,
  AGENTS.md anti-contamination, CLAUDE/GEMINI cross-references,
  .eros/ path integrity, no-legacy-.agents
- SessionStart hook auto-injects EROS + AGENTS into every Claude session"
```

---

## Phase 4.5 — Documentation Path Migration

**Goal:** Update `docs/PLAN-*.md`, `docs/STATUS.md`, and any other docs referencing old `.claude/` paths. Mark each PLAN with its lifecycle status.

**Risk:** Low — text edits only.

**Estimated time:** 2 hours.

### Task 4.5.1: Audit each PLAN-*.md

- [ ] **Step 1: List all plan files**

Run: `ls docs/PLAN*.md docs/PLANS*.md`

Expected output (based on spec):
- `docs/PLAN-AUTO-TRAIN-V2.md`
- `docs/PLAN-EROS-ALIVE.md`
- `docs/PLAN-EROS-V8.md`
- `docs/PLAN-HARDENING-AUDIT.md`
- `docs/PLAN-OBSERVER-V2.md`
- `docs/PLAN-TRAINING-DASHBOARD.md`
- `docs/PLAN-VERCEL-DEPLOY.md`
- `docs/PLANS-STATUS.md`

- [ ] **Step 2: For each plan, determine status**

Read each one and decide: `implemented`, `in-progress`, or `archived`.

Cross-reference with `docs/PLANS-STATUS.md` where present.

Record status per file in a scratch note.

### Task 4.5.2: Add STATUS marker to each plan

For each plan file:

- [ ] **Step 1: Insert STATUS block near top**

Near the top of each `PLAN-*.md` (after the title, before the body), insert:

```markdown
> **Status:** `<one of: implemented, in-progress, archived>`
> **Last reviewed:** 2026-04-14
```

- [ ] **Step 2: Verify insertion**

Run: `head -5 docs/PLAN-*.md`

Expected: each plan shows a STATUS block.

### Task 4.5.3: Update path references in plan docs

- [ ] **Step 1: Find references**

Run: `grep -l "\.claude/" docs/PLAN*.md docs/STATUS.md`

- [ ] **Step 2: For each matched file, update paths**

Replace `.claude/memory/` → `.eros/memory/`, `.claude/pipeline` → `.eros/pipeline`, `.claude/brain-config` → `.eros/brain-config`, `.claude/FRONT_BRAIN` → `.eros/FRONT_BRAIN`.

Do NOT replace `.claude/skills/` or `.claude/agents/` or `.claude/settings.json` — those remain legitimately in `.claude/`.

For each file:

```bash
sed -i.bak 's|\.claude/memory|.eros/memory|g; s|\.claude/pipeline|.eros/pipeline|g; s|\.claude/brain-config|.eros/brain-config|g; s|\.claude/FRONT_BRAIN|.eros/FRONT_BRAIN|g; s|\.claude/front-brain|.eros/front-brain|g' "$file"
rm "${file}.bak"
```

- [ ] **Step 3: Verify no broken references**

Run: `grep -n "\.claude/memory\|\.claude/pipeline\|\.claude/brain-config\|\.claude/FRONT_BRAIN\|\.claude/front-brain" docs/`

Expected: 0 matches (or only legit historical references noted as "legacy").

### Task 4.5.4: Update `docs/STATUS.md`

- [ ] **Step 1: Read current docs/STATUS.md**

- [ ] **Step 2: Update namespace references**

Replace references describing `.claude/` as "canonical namespace" with `.eros/` as the canonical namespace for brain content, with `.claude/` listed as the Claude adapter.

- [ ] **Step 3: Add a line noting the multi-AI architecture**

Near the top:

> **Architecture note (2026-04-14):** Migrated to multi-AI layout. Canonical brain at `.eros/`. Claude adapter at `.claude/`, Gemini at `.gemini/`, Codex at `.codex/`. See `docs/superpowers/specs/2026-04-14-multi-ai-architecture-design.md`.

### Task 4.5.5: Run doctor again

- [ ] **Step 1: Verify**

Run: `node .eros/scripts/eros-doctor.mjs`

Expected: ✅ All checks passed (or only the `.agents/` warning).

### Task 4.5.6: Commit Phase 4.5

- [ ] **Step 1: Commit**

```bash
git add docs/
git commit -m "docs: update path references + add STATUS markers to plans

Phase 4.5 of multi-AI architecture:
- Add STATUS markers (implemented/in-progress/archived) to each PLAN-*.md
- Replace .claude/memory|pipeline|brain-config|FRONT_BRAIN refs with .eros/ equivalents
- Update docs/STATUS.md to note multi-AI architecture and .eros/ canonical namespace"
```

---

## Phase 5 — Legacy Cleanup

**Goal:** Delete `.agents/` legacy directory. Run final validation.

**Risk:** Low — verified empty of live content during brainstorming.

**Estimated time:** 30 min.

### Task 5.1: Final safety check on `.agents/`

- [ ] **Step 1: Confirm `.agents/` has no active content**

Run:
```bash
ls -la .agents/
find .agents/ -type f | head -20
grep -rn "\.agents/" scripts/ panel/ *.mjs 2>/dev/null
```

Expected: mostly empty (only `skills/` subdir per earlier verification). Script grep shows no runtime usage.

- [ ] **Step 2: If anything unexpected appears, STOP**

If there are files with recent mtimes or runtime references, investigate before deleting. Create a new task to resolve.

### Task 5.2: Delete `.agents/`

- [ ] **Step 1: Delete with git**

```bash
git rm -r .agents/
```

- [ ] **Step 2: Verify**

Run: `ls -la .agents/ 2>&1 | head -3`

Expected: `No such file or directory`.

### Task 5.3: Run doctor (should now be fully green)

- [ ] **Step 1: Doctor**

Run: `node .eros/scripts/eros-doctor.mjs`

Expected: `✅ All checks passed.` — NO warnings (`.agents/` warning gone).

### Task 5.4: Commit Phase 5

- [ ] **Step 1: Commit**

```bash
git commit -m "chore: delete legacy .agents/ directory

Phase 5 of multi-AI architecture:
- Remove .agents/ (duplicated .claude/ content, superseded by .eros/ canonical)
- eros-doctor now passes with zero warnings"
```

---

## Phase 5.5 — README Revamp AI-Friendly

**Goal:** Rewrite `README.md` as a top-notch AI-friendly entry point: clear for humans, explicit for AI agents, open-source ready.

**Risk:** Very low — presentation-only change.

**Estimated time:** 2-3 hours.

### Task 5.5.1: Read current README.md

- [ ] **Step 1: Capture current content**

Run: `cat README.md > /tmp/README-old.md && wc -l README.md`

Use old content as reference for facts (stack, scripts, conventions).

### Task 5.5.2: Draft new README structure

- [ ] **Step 1: Write new `README.md`**

Target: 200-350 lines. Structure:

```markdown
# Eros 🜁 Autonomous Creative Director

> Turn a one-line brief into a production-ready Vue 3 website with cinematic motion, a distinctive design system, and an evolving aesthetic memory.

[![Stack: Vue 3](https://img.shields.io/badge/Vue-3-42b883)](https://vuejs.org)
[![Motion: GSAP 3](https://img.shields.io/badge/GSAP-3-88ce02)](https://gsap.com)
[![AI-Friendly: Multi-Agent](https://img.shields.io/badge/AI-Claude%20%7C%20Gemini%20%7C%20Codex-8e44ad)](./AGENTS.md)

## What is Eros?

Eros is an autonomous creative-director pipeline. You give it a brief; it builds a complete website — design tokens, typography system, cinematic motion, responsive layout. It has an evolving personality that learns from each project: taste gets sharper, opinions get stronger, mistakes don't repeat.

Not a template generator. Not a scaffolding tool. A creative force with memory.

## Quickstart

```bash
# 1. Clone + install
git clone <repo-url> eros
cd eros && npm install

# 2. Open panel (dual: Eros orchestrator + Workshop ABM editor)
npm run dev

# 3. Start a project
# In a Claude / Gemini / Codex session, say: "Nuevo proyecto: <brief>"
```

## Architecture at a Glance

```
Eros/
├── EROS.md          # Soul — identity, voice, philosophy
├── AGENTS.md        # Brain — orchestrator contract (AI-neutral)
├── CLAUDE.md        # Claude adapter
├── GEMINI.md        # Gemini adapter (uses @include for EROS + AGENTS)
│                    # (Codex reads AGENTS.md natively — no CODEX.md needed)
│
├── .eros/           # Shared brain (AI-neutral)
│   ├── agents/      # Agent definitions (designer, builder, polisher, evaluator, reference-analyst)
│   ├── workflows/   # Runtime workflows (project CEO loop, motion system)
│   ├── memory/      # Design intelligence, personality.json
│   ├── pipeline.md  # 7-step autonomous brain loop
│   └── scripts/     # eros-doctor.mjs + other validators
│
├── .claude/         # Claude adapter (skills, agents wrappers, hooks)
├── .gemini/         # Gemini settings.json
├── .codex/          # Codex AGENTS.override.md + config.toml
│
├── panel/           # Dual Vue panel: Eros + Workshop
├── _project-scaffold/   # Template copied to each new project
├── _components/     # Curated seed library (heroes, navs)
├── docs/            # Plans, design libraries, specs
└── scripts/         # eros-*.mjs orchestration scripts
```

## For AI Agents

If you are an AI agent working in this repository:

1. **Read `EROS.md`** — it tells you who you are
2. **Read `AGENTS.md`** — it tells you how the system works
3. **Read your adapter** (`CLAUDE.md`, `GEMINI.md`, or `.codex/AGENTS.override.md`) for AI-specific tool mappings

### Claude users
Claude auto-loads `CLAUDE.md` at session start. A `SessionStart` hook injects `EROS.md + AGENTS.md` to guarantee context.

### Gemini users
Gemini CLI auto-loads `GEMINI.md`, which imports `EROS.md + AGENTS.md` via `@include` syntax. Run `/memory show` to see full context.

### Codex users
Codex reads root `AGENTS.md` natively (Linux Foundation standard). Codex-specific deltas live in `.codex/AGENTS.override.md` (empty by default).

## Stack

**Frontend:** Vue 3 (`<script setup>`) · Vite · Vue Router · Pinia
**Motion:** GSAP 3 + ScrollTrigger + Lenis smooth scroll
**Styling:** CSS Custom Properties (design tokens)
**3D (optional):** @splinetool/runtime (dynamic import, disposable)

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dual panel (Eros + Workshop) |
| `npm run build` | Production build |
| `node scripts/eros-state.mjs read` | Read current brain state |
| `node .eros/scripts/eros-doctor.mjs` | Validate multi-AI architecture |
| `node scripts/capture-refs.mjs <urls>` | Capture reference screenshots |

## Design Philosophy

Every project must feel like it was designed by a senior creative director, not generated by AI. Read `EROS.md` for the excellence standard.

Quick summary:
- Rich near-blacks, warm whites — never pure `#000` / `#fff`
- Distinctive font pairings — never Inter, Roboto, Arial
- Custom easing — never default `ease`
- No two sections share grid structure
- Every section has a spatial surprise

## Evolving Personality

After each project, Eros regenerates its `personality.json` — values, voice, and philosophy shift based on what worked. The Eros you use today is shaped by every prior project. Run `node eros-meta.mjs personality` after a project to update.

## Contributing

- Read `AGENTS.md` to understand the orchestrator contract
- Run `node .eros/scripts/eros-doctor.mjs` before every PR
- Keep AGENTS.md AI-neutral (no tool-specific jargon — that belongs in adapter files)
- Follow the phased migration pattern: commit-safe, reversible, testable

## Project Status

See `docs/STATUS.md` for current state and `docs/superpowers/` for active specs and plans.

## License

MIT (or your chosen license — update this section).
```

- [ ] **Step 2: Validate rendering**

Run: `wc -l README.md`

Expected: 200-350 lines.

- [ ] **Step 3: Preview in a markdown viewer if available**

View on GitHub or a local markdown renderer. Check that:
- Headings are hierarchical
- Code blocks render
- Tables render
- Links work (or placeholders are clear)

### Task 5.5.3: Update any links to the spec

- [ ] **Step 1: Verify spec link works**

Run: `ls docs/superpowers/specs/2026-04-14-multi-ai-architecture-design.md`

Expected: file exists.

### Task 5.5.4: Final doctor run

- [ ] **Step 1: Final validation**

Run: `node .eros/scripts/eros-doctor.mjs`

Expected: `✅ All checks passed.`

### Task 5.5.5: Commit Phase 5.5

- [ ] **Step 1: Commit**

```bash
git add README.md
git commit -m "docs(readme): rewrite as AI-friendly multi-AI entry point

Phase 5.5 of multi-AI architecture:
- Hero, quickstart, architecture diagram
- 'For AI Agents' section with Claude/Gemini/Codex instructions
- Stack, scripts, design philosophy sections
- Contributing guidelines referencing eros-doctor
- Status section pointing to docs/STATUS.md + docs/superpowers/

Completes the multi-AI architecture migration."
```

---

## Final Validation

After Phase 5.5, run the full verification:

- [ ] **Run doctor one last time**

```bash
node .eros/scripts/eros-doctor.mjs
```

Expected: `✅ All checks passed.` with zero warnings.

- [ ] **Verify branch history**

```bash
git log --oneline feat/streamline ^master | head -20
```

Expected: ~8 commits corresponding to phases 0, 1, 2, 3, 4, 4.5, 5, 5.5.

- [ ] **Open a fresh Claude session and do a sanity check**

Ask Claude: "¿Quién sos y cómo funciona el brain loop?"

Expected: Claude responds as Eros (identity from EROS.md) and describes the 7-step loop (from AGENTS.md). SessionStart hook should have auto-injected both.

- [ ] **Build verification**

```bash
npm run build
```

Expected: production build completes without errors.

- [ ] **Decide on PR**

If all green, push branch and open PR to master:

```bash
git push -u origin feat/streamline
gh pr create --title "Multi-AI architecture refactor" --body "$(cat docs/superpowers/specs/2026-04-14-multi-ai-architecture-design.md | head -80)"
```

---

## Rollback Strategy

If any phase fails validation, roll back to the previous phase's commit:

```bash
git reset --hard <previous-phase-commit-sha>
```

The repo will be in a consistent state at each phase boundary — no broken intermediate states.

For partial phase failures (e.g., half of Phase 1 done, half broken), use:

```bash
git reset --hard HEAD~1  # undo last commit
# fix issue, re-do phase
```

---

## Notes

- **Windows path handling:** Commands use forward slashes. On Git Bash / WSL this works. Native PowerShell needs adjustments.
- **No symlinks:** Decision from spec Section 7 risks — all moves are real file moves, not symlinks.
- **Commit per phase:** Each phase produces exactly one commit (except Phase 4.5 which may produce multiple if the doc updates are large).
- **Testing philosophy:** Because this is a refactor, not feature work, "tests" are the `eros-doctor.mjs` script + manual AI session verification. No new unit tests required.
