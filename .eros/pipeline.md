# Pipeline V6.1 → V7 — Autonomous Brain (Eros Script Architecture)

## Core Concept: Three Memory Layers

```
Layer 1: Working Memory   → $PROJECT_DIR/.brain/     (per-project, hot state)
Layer 2: Session State    → $PROJECT_DIR/.brain/state.md + state.json  (crash recovery + machine state)
Layer 3: Long-Term Memory → $MAQUETA_DIR/.eros/memory/design-intelligence/  (cross-project)
```

**The brain works like this:** [V7: automated by eros-*.mjs scripts]
1. CEO runs `node eros-state.mjs query` → knows where it is and what to do next
2. CEO runs `node eros-context.mjs` → enriches context with memory insights (calls eros-memory.mjs interpret internally)
3. CEO writes `context/{task}.md` → pre-computes agent input
4. Agent reads ONE context file → does ONE task → writes to `reports/{task}.md`
5. CEO runs `node eros-gate.mjs post` → auto-evaluates against thresholds → approve or retry
6. CEO runs `node eros-memory.mjs learn` → writes learnings immediately to long-term memory
7. CEO runs `node eros-log.mjs` → logs decision to `.brain/approvals.md` + `.brain/decisions.md`
8. CEO runs `node eros-state.mjs advance` → atomically updates state.md, queue.md, queue.json
9. Repeat until queue is empty

## Front-Brain Runtime Contract

The operational brain is now **hybrid Markdown + JSON**:

- Markdown preserves narrative context, design reasoning, decision logs, and human-readable reviews.
- JSON exposes machine-readable run state for selectors, evaluators, retries, and the internal panel.

Every generated project should expose this minimum contract:

```text
$PROJECT_DIR/
  DESIGN.md
  .brain/
    state.md
    state.json
    metrics.json
    queue.md
    queue.json
    blueprints/
      selection.json
    control/
      rules.json
    decisions.md
    context/
    reports/
      quality/
        observer.json
        critic.json
        scorecard.json
      visual-debt.json
    reviews/
      REVIEW-SUMMARY.md
```

`state.md` remains the cold-resume entrypoint for agents. `state.json`, `metrics.json`, `queue.json`, `blueprints/selection.json`, and `control/rules.json` are the structured mirrors consumed by automation and the backoffice.

The canonical way to refresh quality artifacts after an observer pass is:

```bash
cd "$MAQUETA_DIR/scripts"
npm run refresh:quality -- --project "$PROJECT_DIR"
```

`refresh-quality.mjs` reads the latest observer artifacts, derives deterministic observer and critic JSON, updates visual debt and metrics, and rewrites `REVIEW-SUMMARY.md`.

`refresh-quality.mjs` now supports:

- `--critic-mode auto` → multimodal critic if `OPENAI_API_KEY` exists, otherwise deterministic fallback
- `--critic-mode multimodal` → require model-based critic output
- `--critic-mode heuristic` → force deterministic critic output

The canonical way to initialize a new project and emit this contract is:

```bash
cd "$MAQUETA_DIR/scripts"
npm run init:project -- \
  --brief-file "$PROJECT_DIR/.brain/context/intake.json" \
  --project "$PROJECT_DIR"
```

`init-project.mjs` copies the scaffold and libraries, writes the intake payload, runs the bootstrapper, and can install dependencies. `bootstrap-front-brain.mjs` remains the lower-level idempotent emitter when the project already exists and only needs hybrid artifacts refreshed.

**Why micro-tasks:** Each task is small enough that context can compact between tasks.
After compaction, `.brain/` files are the ground truth — not conversation memory.

**Default mode is autonomous.** No human gates unless the brief includes "interactive" or "supervised".

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
  state.json        ← machine-readable run state for retries, panel, and automations
  metrics.json      ← scorecards, retries, debt counts, and aggregate quality state
  identity.md       ← project identity card
  queue.md          ← micro-task queue with status
  queue.json        ← structured queue mirror for backoffice consumption
  decisions.md      ← real-time decision log
  approvals.md      ← auto-approval log (async review for user — never blocks)
  learnings.md      ← real-time learnings (persisted to long-term memory continuously)
  control/
    rules.json      ← hard rules, biases, and approval thresholds for the current run
  context/          ← pre-computed input for each agent task (includes memory insights)
    design-brief.md
    reference-observatory.md  ← extracted from observer: type sequence, rhythm, baseline
    S-{Name}.md               ← per section: tokens + recipe + memory + observatory
    evaluate-S-{Name}.md      ← per section: builder report path + observer path + threshold
    motion.md
  reports/          ← agent output (builder, designer, polisher)
    quality/        ← observer + critic + scorecard JSON outputs
  evaluations/      ← evaluator output per section: APPROVE/RETRY/FLAG + composite score
  observer/         ← observer output per run
    localhost/      ← from --local runs (per section QA)
    final/          ← final full-site pass
  reviews/          ← human-readable summaries and async review notes
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

## Memory Insights
← CEO injects this block BEFORE spawning. Read brain-config.md § Interpretation.

| Topic | Insight | Confidence |
|-------|---------|-----------|
| Font  | Clash Display + Satoshi → validated 4x for dark cinematic | HIGH |
| Technique | Clip-path reveal → avg 9/10 | HIGH |
| Risk  | Users enlarge hero images → pre-emptively large | MEDIUM |

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
| `designer` | Visual identity | `.brain/context/design-brief.md` | `DESIGN.md` + `docs/tokens.md` + `docs/pages/*.md` |
| `builder` | Section components | `.brain/context/S-{Name}.md` + `DESIGN.md` | `src/components/sections/S-{Name}.vue` + `.brain/reports/S-{Name}.md` |
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
| `setup/capture-refs` | ceo | identity.md URLs | `_ref-captures/` + `analysis.md` per page | Screenshots + analysis.md captured |
| `setup/analyze-refs` | reference-analyst | `_ref-captures/` (`analysis.md` + `manifest.json` + screenshots) | `docs/reference-analysis.md` | 9-point gate |
| `setup/observatory` | ceo | `_ref-captures/{domain}/analysis.md` | `.brain/context/reference-observatory.md` | content strategy + rhythm + baseline extracted |

### Phase 1: Creative Direction (Designer)

| Task ID | Agent | Input | Output | Gate |
|---------|-------|-------|--------|------|
| `design/brief` | ceo | identity + ref-analysis + learnings | `.brain/context/design-brief.md` | Context file complete |
| `design/tokens` | designer | `context/design-brief.md` | `DESIGN.md` + `docs/tokens.md` | 12-point validation |
| `design/pages` | designer | `context/design-brief.md` + `DESIGN.md` + tokens.md | `docs/pages/*.md` | Section validation |
| `review/creative` | ceo | tokens.md + pages/*.md | autonomous: save screenshots; interactive: user approval | Memory hooks fire regardless of mode |

**Memory hooks fire immediately (both modes):**
- `design-intelligence/font-pairings.md` (pairing + reaction)
- `design-intelligence/color-palettes.md` (palette + reaction)
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
| `context/S-{Name}` | ceo | `DESIGN.md` + tokens.md + pages/{page}.md + _libraries/ + learnings + observatory | `.brain/context/S-{Name}.md` | Context file complete + dynamic threshold resolved |
| `build/S-{Name}` | builder | `context/S-{Name}.md` | `S-{Name}.vue` + `reports/S-{Name}.md` | Excellence Standard + Preview Loop |
| `observe/S-{Name}` | ceo | dev server at localhost:5173 | `.brain/observer/localhost/analysis.md` | Observer runs without error |
| `evaluate/S-{Name}` | evaluator | `context/evaluate-S-{Name}.md` | `.brain/evaluations/S-{Name}.md` | APPROVE / RETRY / FLAG decision |

After ALL sections pass:

| Task ID | Agent | Input | Output | Gate |
|---------|-------|-------|--------|------|
| `review/observer` | ceo | dev server at localhost | `.brain/observer/analysis.md` + `.brain/reports/quality/*.json` | Observer runs without error |
| `review/sections` | ceo | observer analysis.md + screenshots | autonomous: save to docs/review/ + continue; interactive: user approval | All excellenceSignals MEDIUM+ |

**Memory hooks fire immediately (both modes):**
- `design-intelligence/signatures.md` (each section's signature + approved/rejected)
- `design-intelligence/section-patterns.md` (layout+motion+score)
- `design-intelligence/technique-scores.md` (update usage + avg)
- `design-intelligence/revision-patterns.md` (if user requested changes)
- `.brain/decisions.md` (D-NNN per section)

### Phase 4: Motion (Polisher)

| Task ID | Agent | Input | Output | Gate |
|---------|-------|-------|--------|------|
| `context/motion` | ceo | `DESIGN.md` + tokens.md + pages/*.md + section list | `.brain/context/motion.md` | Context file complete |
| `polish/motion` | polisher | `context/motion.md` | composables + preloader + report | Visual QA 4 breakpoints |

### Phase 5: Integration (CEO)

| Task ID | Agent | Input | Output | Gate |
|---------|-------|-------|--------|------|
| `integrate/router` | ceo | pages list | `src/router/index.js` | Routes work |
| `integrate/views` | ceo | section list per page | `src/views/*.vue` | Views render |
| `integrate/app` | ceo | component list | `src/App.vue` | App shell complete |
| `integrate/seo` | ceo | identity + pages | meta tags per page | Tags present |
| `review/observer-final` | ceo | dev server at localhost | `.brain/observer/final-analysis.md` + `.brain/reports/quality/*.json` | Observer runs without error |
| `review/final` | ceo | observer final-analysis.md + screenshots | autonomous: REVIEW-SUMMARY.md + continue; interactive: user approval | All excellenceSignals MEDIUM+ |

### Phase 6: Retrospective (CEO)

| Task ID | Agent | Input | Output | Gate |
|---------|-------|-------|--------|------|
| `cleanup/retrospective` | ceo | `.brain/decisions.md` + reports/ | verify long-term memory updated | All learnings persisted |
| `cleanup/promote-rules` | ceo | `design-intelligence/rules.md` | promote 3+ validated rules | Rules promoted |
| `cleanup/delete-temp` | ceo | `_ref-captures/`, `docs/review/` | directories deleted | Clean project |

---

## CEO Micro-Task Loop (the core algorithm)

[V7: automated by eros-*.mjs] The CEO orchestrates — scripts enforce. Manual file reads/writes
are replaced by deterministic script calls.

```
ON EVERY TURN:
  1. Run `node eros-state.mjs query` → know where I am + find next [PENDING] task

  2. IF task is "context/*":
       → Run `node eros-context.mjs --task {task-id} --project "$PROJECT_DIR"`
         (internally calls eros-memory.mjs interpret → injects "## Memory Insights" block)
       → Extract source values, write context/{task}.md (includes insights)
       → Run `node eros-state.mjs advance` → mark task [DONE], advance to next

  3. IF task is "build/*":
       → Spawn builder: "Read $PROJECT_DIR/.brain/context/{X}.md, write component + report"
       → Run observer: node capture-refs.mjs --local --port 5173 .brain/observer/
       → Refresh quality: npm run refresh:quality -- --project "$PROJECT_DIR"
       → Write context/evaluate-{X}.md (report path + observer path + threshold)
       → Spawn evaluator: "Read context/evaluate-{X}.md, write .brain/evaluations/{X}.md"
       → Run `node eros-gate.mjs post --task {task-id}` → read evaluation decision:
           APPROVE → run `node eros-log.mjs` + `node eros-state.mjs advance`
           RETRY   → re-dispatch builder with retry instructions (max retry_max)
           RETRY×2 → escalate to FLAG
           FLAG    → run `node eros-log.mjs --flag` + `node eros-state.mjs advance`

  3b. IF task is "design/*" or "polish/*":
       → Spawn agent: "Read $PROJECT_DIR/.brain/context/{X}.md, write output + report"
       → Run `node eros-gate.mjs post --task {task-id}` → auto-evaluate against thresholds:
           PASS → run `node eros-log.mjs` + `node eros-state.mjs advance`
           FAIL → re-dispatch with specific failures (max retry_max)
           STILL FAIL → run `node eros-log.mjs --flag` + `node eros-state.mjs advance`

  4. IF task is "review/*":
       → AUTONOMOUS: Screenshot + refresh quality → save to docs/review/ → run `node eros-state.mjs advance`
       → INTERACTIVE: Screenshot → AskUserQuestion → wait for user
       → SUPERVISED: Screenshot → AskUserQuestion after EVERY section

  5. IF task is "integrate/*" or "setup/*" or "cleanup/*":
       → Do it directly (no agent needed)

  6. MEMORY HOOKS — run `node eros-memory.mjs learn` after EVERY task that produced a decision:
       → --event font_selected / palette_selected → writes to font-pairings.md / color-palettes.md
       → --event section_approved → writes to signatures.md + section-patterns.md + technique-scores.md
       → --event user_change → writes to revision-patterns.md
       → --event pipeline_issue → writes to pipeline-lessons.md
       → --event rule_validated → auto-promote, mark PROMOTED in rules.md

  7. Run `node eros-state.mjs advance` → atomically updates state.md, queue.md, queue.json, decisions.md
  8. Continue (no end-of-turn pause unless waiting for user in interactive mode)
```

**After compaction:** Step 1 (`eros-state.mjs query`) reconstructs full context from files. No conversation memory needed.

---

## Operating Modes

Read `brain-config.md` for full threshold definitions.

### Autonomous (DEFAULT)

Brain builds the entire project without waiting.
User gets `docs/review/REVIEW-SUMMARY.md` at the end — not blocking gates.

- All `review/*` tasks → screenshot + save to `docs/review/` + **continue**
- All agent outputs → auto-evaluated against thresholds
- Failures → retry (max 2) → flag `[NEEDS-REVIEW]` → **continue**
- Memory → written in real-time after every decision
- Rules → promoted automatically at 3 validations

### Interactive

Add "interactive" to the brief. Three human gates:
1. `review/creative` — approve palette + typography + section plan
2. `review/sections` — approve all sections as a full page
3. `review/final` — approve complete site

### Supervised

Add "supervised" to the brief. Human reviews each section individually.
Slowest mode — use only for experimental or high-stakes projects.

---

## Auto-Approval Engine

After every agent task, brain evaluates the report:

```
PASS criteria (from brain-config.md):
  designer_gate: 12/12 points + decision trees used
  builder_gate: all Excellence dimensions + signature + score >= 7 + 0 anti-AI patterns
  visual_qa: 3+ layers + no broken + mobile designed + density >= 3

ON PASS:
  → append to .brain/approvals.md: [AUTO-APPROVED] {task} | score: {X} | {timestamp}
  → mark [DONE] in queue
  → trigger memory hooks

ON FAIL (after retry_max = 2):
  → append to .brain/approvals.md: [NEEDS-REVIEW] {task} | failed: {dimension} | {timestamp}
  → mark [DONE] in queue (never blocks)
  → continue to next task
```

### approvals.md Format

```markdown
# Auto-Approvals — {project}

## [AUTO-APPROVED] build/S-Hero | score: 8/10 | signature: parallax counter | 2026-04-01
## [AUTO-APPROVED] build/S-Features | score: 9/10 | signature: bento depth cards | 2026-04-01
## [NEEDS-REVIEW] build/S-Stats | failed: Craft (0/4) | 2 retries exhausted | 2026-04-01
```

User reads this file when they want. Nothing waits for them.

---

## Interpretation Layer

[V7: automated by eros-context.mjs + eros-memory.mjs] The CEO never manually reads memory files.
`eros-context.mjs` calls `eros-memory.mjs interpret` internally, which reads the relevant memory
files, computes confidence levels, and produces the "## Memory Insights" block.

```
FOR design tasks:
  → eros-memory.mjs interpret reads: font-pairings.md + color-palettes.md + revision-patterns.md + rules.md
  → injects "## Memory Insights" block with confidence levels

FOR build tasks:
  → eros-memory.mjs interpret reads: signatures.md + technique-scores.md + section-patterns.md + revision-patterns.md
  → injects insights: high-scoring techniques, known risks, weak dimensions

FOR polish tasks:
  → eros-memory.mjs interpret reads: technique-scores.md + pipeline-lessons.md
  → injects: effective composable patterns, known issues to avoid
```

**Confidence levels:**
- `HIGH` — 3+ project validations → follow with confidence
- `MEDIUM` — 1-2 validations → prefer but watch
- `LOW` — no data → neutral (don't avoid, don't prioritize)

**Rule:** If confidence is HIGH and the rule contradicts a subjective choice → trust the rule.
If confidence is LOW → still document the decision so it can build toward HIGH.

---

## Memory Hooks (auto-write events)

[V7: automated by eros-memory.mjs] All hooks are handled by `node eros-memory.mjs learn --event <name> --data '<json>'`.
The script validates event data against a schema before writing, ensuring consistent memory entries.
These fire automatically — no explicit CEO instruction needed.

| Event | eros-memory.mjs event name | Writes to | Fields |
|-------|---------------------------|-----------|--------|
| Font selected | `font_selected` | `font-pairings.md` | date, project, mood, display, body, reaction, lesson |
| Palette selected | `palette_selected` | `color-palettes.md` | date, project, mood, canvas, accent, reaction, lesson |
| Section auto-approved | `section_approved` | `signatures.md` | date, project, section, element, description, why |
| Section score received | `section_approved` | `section-patterns.md` | layout, motion, technique, score |
| Technique used | `section_approved` | `technique-scores.md` | increment usage + update avg score |
| User changed something | `user_change` | `revision-patterns.md` | what changed, original, new, pattern |
| Pipeline issue | `pipeline_issue` | `pipeline-lessons.md` | phase, issue, resolution, prevention |
| Rule discovered | `rule_discovered` | `rules.md` | add new candidate rule |
| Rule validated 3x | `rule_validated` | `rules.md` → promote | mark PROMOTED, write to target file |

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
9. [V7] **Use eros-context.mjs to build context files** — never assemble manually. The script handles memory interpretation, insight injection, and confidence levels.
10. [V7] **Use eros-state.mjs for all state/queue updates** — never write to state.md, queue.md, or queue.json directly.

---

## Queue Sync Enforcement (MANDATORY) — AUTOMATED by eros-state.mjs

[V7: automated by eros-state.mjs] The dual-write obligation is now enforced by the script.
The CEO MUST use `node eros-state.mjs advance` for all task status changes — never write
to queue.md, queue.json, or state.md directly. The script performs atomic updates across
all three files, eliminating the dual-write problem entirely.

### Rules

1. **Atomic write via script:** Every task status change (PENDING → IN_PROGRESS → DONE) is handled by `eros-state.mjs advance`, which updates `queue.md`, `queue.json`, and `state.md` in a single operation. The dual-write obligation is enforced by the script — not by CEO discipline.

2. **queue.json update contract:** When marking a task DONE, `eros-state.mjs` writes these fields:
   ```json
   {
     "id": "build/S-Hero",
     "status": "done",
     "completedAt": "2026-04-03T14:30:00Z",
     "score": 8.2,
     "decision": "approved"
   }
   ```

3. **Reconciliation check:** `eros-state.mjs` automatically verifies queue sync before advancing to any `review/*` or `integrate/*` task. Manual reconciliation is no longer needed.

4. **state.md <-> queue.json sync:** The `Sections: {done}/{total}` count in `state.md` always matches the `done` count in `queue.json` — enforced atomically by the script.

---

## Completion Gate (MANDATORY — Phase 5 cannot close without this)

[V7: automated by eros-gate.mjs] Run `node eros-gate.mjs completion --project "$PROJECT_DIR"`
to execute all 5 checks automatically. The script returns PASS or BLOCK with details.

Phase 5 CANNOT be marked as "Complete" unless ALL of the following are true:

### Hard Requirements

1. **Observer ran:** `.brain/observer/` directory exists AND contains at least one `analysis.md` file with non-empty content. If the observer never ran, Phase 5 is BLOCKED.

2. **refresh-quality ran:** `.brain/reports/quality/scorecard.json` exists AND `finalScore > 0`. A scorecard with `finalScore: 0` means the quality loop never executed — Phase 5 is BLOCKED.

3. **Queue is complete:** Every task in `queue.json` has `status: "done"`. No task can be left as `"pending"` or `"in_progress"` when Phase 5 closes.

4. **Evaluations exist:** For every `build/S-{Name}` task, a corresponding `.brain/evaluations/S-{Name}.md` file MUST exist with an APPROVE, RETRY, or FLAG decision.

### Enforcement Algorithm

`eros-gate.mjs completion` runs this automatically:

```
BEFORE marking Phase 5 as "Complete":
  1. Check: does .brain/observer/ contain analysis.md? → NO → BLOCK
  2. Check: does .brain/reports/quality/scorecard.json exist? → NO → BLOCK
  3. Read scorecard.json → is finalScore > 0? → NO → BLOCK
  4. Read queue.json → are all tasks "done"? → NO → BLOCK
  5. Count build/S-* tasks → count evaluations/*.md → match? → NO → BLOCK

  IF any check BLOCKS:
    → Log to state.md: "Blocker: completion gate failed — {which check}"
    → Execute missing steps (run observer, run refresh-quality, etc.)
    → Re-check after execution
    → Only proceed when ALL checks pass

  IF all checks PASS:
    → Write to state.md: "Phase: 5 | Status: Complete | Quality: {finalScore}/10"
    → Write to approvals.md: "[QUALITY-GATE] Phase 5 completion | score: {finalScore}/10"
    → Proceed to Phase 6
```

### What to do when blocked

| Missing step | Recovery action |
|-------------|-----------------|
| Observer never ran | Start dev server → run `capture-refs.mjs --local` → retry |
| scorecard.json missing or zero | Run `npm run refresh:quality -- --project "$PROJECT_DIR"` → retry |
| Queue tasks still pending | Execute remaining pending tasks → retry |
| Evaluations missing | Write evaluate context → spawn evaluator → retry |
