# Pipeline V6 — Brain Architecture

## Core Concept: Three Memory Layers

```
Layer 1: Working Memory   → $PROJECT_DIR/.brain/     (per-project, hot state)
Layer 2: Session State    → $PROJECT_DIR/.brain/state.md  (crash recovery)
Layer 3: Long-Term Memory → $MAQUETA_DIR/.claude/memory/design-intelligence/  (cross-project)
```

**The brain works like this:**
1. CEO reads `.brain/state.md` → knows where it is
2. CEO reads `.brain/queue.md` → knows what to do next
3. CEO writes `context/{task}.md` → pre-computes agent input
4. Agent reads ONE context file → does ONE task → writes to `reports/{task}.md`
5. CEO reads report → updates queue → writes decisions + learnings in real-time
6. Repeat until queue is empty

**Why micro-tasks:** Each task is small enough that context can compact between tasks.
After compaction, `.brain/` files are the ground truth — not conversation memory.

---

## Project Isolation

```
$MAQUETA_DIR = C:\Users\mateo\Desktop\maqueta     ← read-only template
$PROJECT_DIR = C:\Users\mateo\Desktop\{slug}       ← all project output
```

Never write project files inside maqueta. Only read: scaffold, libraries, scripts, agents.

---

## .brain/ Directory (Working Memory)

Created at project start. Deleted at project completion (learnings already persisted to long-term memory).

```
$PROJECT_DIR/.brain/
  state.md          ← 15 lines: current phase, next task, blockers
  identity.md       ← project identity card
  queue.md          ← micro-task queue with status
  decisions.md      ← real-time decision log
  learnings.md      ← real-time learnings (persisted to long-term memory continuously)
  context/          ← pre-computed input for each agent task
  reports/          ← agent output reports
```

### state.md Format (lightweight — read first on every turn)

```markdown
# Brain State
- **Project:** {name} ({slug})
- **Phase:** {current phase name}
- **Task:** {current micro-task ID from queue}
- **Blocker:** {none | description}
- **Next:** {exact next action — cold-resume instruction}
- **Mode:** {interactive | autonomous}
- **Files created:** {count}
- **Sections:** {done}/{total}
```

### queue.md Format (task queue — ground truth for progress)

```markdown
# Task Queue — {project name}

## Active
- [IN_PROGRESS] {task-id} | {agent} | context/{file}.md → reports/{file}.md

## Done
- [DONE] {task-id} | {agent} | {output path} | {score if applicable}

## Pending
- [PENDING] {task-id} | {agent} | {dependencies if any}
```

### decisions.md Format (real-time — written as decisions happen)

```markdown
# Decisions — {project}

## D-{NNN} | {topic} | {phase}
- **Choice:** {what was chosen}
- **Path:** {decision tree path if used}
- **User:** {approved | changed to X | pending}
- **Learn:** {what this teaches for future projects}
```

### context/{task}.md Format (pre-computed agent input)

```markdown
# Context: {task name}

## Tokens
{only the token values this task needs — not the full tokens.md}

## Recipe
{recipe card for this specific section}

## Copy
{exact text content}

## Cinematic Description
{full cinematic description}

## Library Snippets
{relevant patterns from _libraries/ — only what this task needs}

## Learnings
{relevant entries from design-intelligence/ — only what matters for this task}

## Reference Frame
{path to the best matching reference screenshot, if available}
```

### reports/{task}.md Format (agent output)

```markdown
# Report: {task name}

## Output
- File: {path to created file}
- Score: {X/10 if applicable}

## Excellence Standard
{per-dimension pass/fail if builder task}

## Signature
{name and description of distinctive element}

## Self-Assessment
{what the agent checked, what it fixed, what remains}

## Issues
{any problems encountered}
```

---

## Agent Registry

| Agent | Role | Reads | Writes |
|-------|------|-------|--------|
| `designer` | Visual identity | `.brain/context/design-brief.md` | `docs/tokens.md` + `docs/pages/*.md` |
| `builder` | Section components | `.brain/context/S-{Name}.md` | `src/components/sections/S-{Name}.vue` + `.brain/reports/S-{Name}.md` |
| `polisher` | Motion + QA | `.brain/context/motion.md` | `src/composables/use*.js` + `.brain/reports/motion.md` |
| `reference-analyst` | Analyze references | `_ref-captures/` + `docs/_libraries/` | `docs/reference-analysis.md` |

**Context management rule:** CEO writes the context file. Agent reads ONE file.
Never tell an agent "read the docs" — pre-compute what it needs.

---

## Micro-Task Catalog

Each task has: ID, agent, input, output, gate. Tasks run sequentially unless marked parallel-safe.

### Phase 0: Discovery (CEO)

| Task ID | Agent | Input | Output | Gate |
|---------|-------|-------|--------|------|
| `setup/identity` | ceo | user message | `.brain/identity.md` | Brief is complete |
| `setup/create-dir` | ceo | identity.md | `$PROJECT_DIR/` created | Directory exists |
| `setup/capture-refs` | ceo | identity.md URLs | `_ref-captures/` | Screenshots captured |
| `setup/analyze-refs` | reference-analyst | `_ref-captures/` + `_libraries/` | `docs/reference-analysis.md` | 9-point gate |

### Phase 1: Creative Direction (Designer)

| Task ID | Agent | Input | Output | Gate |
|---------|-------|-------|--------|------|
| `design/brief` | ceo | identity + ref-analysis + learnings | `.brain/context/design-brief.md` | Context file complete |
| `design/tokens` | designer | `context/design-brief.md` | `docs/tokens.md` | 12-point validation |
| `design/pages` | designer | `context/design-brief.md` + tokens.md | `docs/pages/*.md` | Section validation |
| `review/creative` | ceo | tokens.md + pages/*.md | user approval | User says "approved" |

**Real-time learning:** After review/creative → CEO writes to:
- `design-intelligence/font-pairings.md` (pairing + user reaction)
- `design-intelligence/color-palettes.md` (palette + user reaction)
- `.brain/decisions.md` (D-001: Font, D-002: Palette, etc.)

### Phase 2: Scaffold (CEO)

| Task ID | Agent | Input | Output | Gate |
|---------|-------|-------|--------|------|
| `setup/scaffold` | ceo | `_project-scaffold/` | `$PROJECT_DIR/src/` | Files copied |
| `setup/gen-tokens` | ceo | `docs/tokens.md` | `src/styles/tokens.css` | CSS generated |
| `build/atmosphere` | builder | `.brain/context/atmosphere.md` | `AtmosphereCanvas.vue` + report | 5-point check |

### Phase 3: Sections (Builder — parallel-safe between independent sections)

For EACH section:

| Task ID | Agent | Input | Output | Gate |
|---------|-------|-------|--------|------|
| `context/S-{Name}` | ceo | tokens.md + pages/{page}.md + _libraries/ + learnings | `.brain/context/S-{Name}.md` | Context file complete |
| `build/S-{Name}` | builder | `context/S-{Name}.md` | `S-{Name}.vue` + `reports/S-{Name}.md` | Excellence Standard + Preview Loop |

After ALL sections pass:

| Task ID | Agent | Input | Output | Gate |
|---------|-------|-------|--------|------|
| `review/sections` | ceo | assembled page screenshots | user approval | User says "approved" |

**Real-time learning:** After review/sections → CEO writes to:
- `design-intelligence/signatures.md` (each section's signature + reaction)
- `design-intelligence/section-patterns.md` (layout+motion+score)
- `design-intelligence/technique-scores.md` (update usage + avg)
- `design-intelligence/revision-patterns.md` (if user requested changes)
- `.brain/decisions.md` (D-NNN per section)

### Phase 4: Motion (Polisher)

| Task ID | Agent | Input | Output | Gate |
|---------|-------|-------|--------|------|
| `context/motion` | ceo | tokens.md + pages/*.md + section list | `.brain/context/motion.md` | Context file complete |
| `polish/motion` | polisher | `context/motion.md` | composables + preloader + report | Visual QA 4 breakpoints |

### Phase 5: Integration (CEO)

| Task ID | Agent | Input | Output | Gate |
|---------|-------|-------|--------|------|
| `integrate/router` | ceo | pages list | `src/router/index.js` | Routes work |
| `integrate/views` | ceo | section list per page | `src/views/*.vue` | Views render |
| `integrate/app` | ceo | component list | `src/App.vue` | App shell complete |
| `integrate/seo` | ceo | identity + pages | meta tags per page | Tags present |
| `review/final` | ceo | full-site screenshots | user approval | User says "approved" |

### Phase 6: Retrospective (CEO)

| Task ID | Agent | Input | Output | Gate |
|---------|-------|-------|--------|------|
| `cleanup/retrospective` | ceo | `.brain/decisions.md` + reports/ | verify long-term memory updated | All learnings persisted |
| `cleanup/promote-rules` | ceo | `design-intelligence/rules.md` | promote 3+ validated rules | Rules promoted |
| `cleanup/delete-temp` | ceo | `_ref-captures/`, `docs/review/` | directories deleted | Clean project |

---

## CEO Micro-Task Loop (the core algorithm)

```
ON EVERY TURN:
  1. Read .brain/state.md → know where I am
  2. Read .brain/queue.md → find next [PENDING] task
  3. IF task is "context/*":
       → Read source docs, extract values, write context/{task}.md
       → Mark task [DONE], advance to next
  4. IF task is "build/*" or "design/*" or "polish/*":
       → Spawn agent with: "Read $PROJECT_DIR/.brain/context/{X}.md, write output, write report to .brain/reports/{X}.md"
       → Read report → verify gate → mark [DONE] or re-dispatch
  5. IF task is "review/*":
       → Screenshot → AskUserQuestion → wait
  6. IF task is "integrate/*" or "setup/*" or "cleanup/*":
       → Do it directly (no agent needed)
  7. Update state.md with current position
  8. Write decision to .brain/decisions.md if a choice was made
  9. Write learning to long-term memory if something was learned
  10. Continue to next task (or end turn if waiting for user)
```

**After compaction:** Steps 1-2 reconstruct full context from files. No conversation memory needed.

---

## Autonomous Mode

Activates when initial prompt has: name + type + mood + pages (or user says "run autonomously").

**Differences from interactive:**
- Skip `review/creative` → validate with 12-point gate + decision trees
- Skip `review/sections` → auto-QA + screenshots to `docs/review/sections/`
- Skip `review/final` → screenshots to `docs/review/final/` + write `REVIEW-SUMMARY.md`
- Flag `[NEEDS_REVIEW]` instead of blocking

**Auto-QA thresholds** (same as V5.5):
- Designer: 12 points pass
- Builder: Excellence Standard all dimensions + signature
- Screenshots: no blank/broken, 3+ layers, mobile designed
- Anti-AI: 0 patterns
- Density: meets minimum for section type

---

## Parallel Rules

- Max 2 concurrent builder agents (worktree isolation)
- Independent sections only (different pages or non-adjacent)
- Fall back to 1 on API errors
- CEO prepares BOTH context files before spawning

## Error Recovery

- Agent spawn fails → retry once after 5s
- Agent output incomplete → re-spawn with specific gaps
- Gate fails 3x → flag [NEEDS_REVIEW], continue
- Capture script fails → ask user to skip references
- Preview Loop unavailable → builder reports without visuals, CEO screenshots instead

## Context Management Rules

1. **Write context file, then spawn.** Never pass 80 lines inline.
2. **One task per agent.** One section = one builder call.
3. **Read report before advancing.** Verify gate passes.
4. **Update queue after every task.** Queue is ground truth.
5. **Write decisions in real-time.** Not at Phase 6.
6. **Write learnings in real-time.** Persist to long-term memory continuously.
7. **After compaction: read state.md first.** Trust files over memory.
8. **Use generate-tokens.js.** Never manually copy CSS.
