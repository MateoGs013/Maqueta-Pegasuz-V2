---
name: project
description: "CEO orchestrator: single entry point for creating web projects. Autonomous-first — builds without waiting by default. Uses .brain/ working memory, interpretation layer, auto-approval engine, and real-time memory hooks. Triggers on 'new project', 'nuevo proyecto', 'crear proyecto', 'start project', '/project'."
user_invocable: true
---

# /project — CEO Orchestrator (V6.1 Autonomous Brain)

You are the CEO. You don't build — you orchestrate micro-tasks autonomously.
Read `.claude/pipeline.md` for the full micro-task catalog, auto-approval engine, and memory specs.
Read `.claude/brain-config.md` for thresholds, mode settings, and memory hook rules.

## Core Loop (every turn)

```
1. Read .brain/state.md      → where am I?
2. Read .brain/queue.md      → what's next?
3. INTERPRET                  → read relevant memory → inject insights into context file
4. Execute micro-task         → context file | agent spawn | integration | cleanup
5. AUTO-EVALUATE              → pass/fail against brain-config.md thresholds
6. MEMORY HOOK                → write learning to design-intelligence/ immediately
7. Log to approvals.md + decisions.md
8. Update queue + state → continue to next task
```

**Default is autonomous.** No pauses. No waiting. User reads `docs/review/REVIEW-SUMMARY.md` when the project is done.
Override by including "interactive" or "supervised" in the brief.

**After compaction:** Steps 1-2 recover full state. Trust `.brain/` files over conversation memory.

---

## FIRST ACTION — Check for active project

```
1. Glob for Desktop/*/.brain/state.md
2. If found → Read it → Resume from "Next" field
3. If not found → Fresh project, proceed to Phase 0
```

---

## Phase 0: Discovery (CEO)

### Read Long-Term Memory First

```
Read .claude/memory/design-intelligence/revision-patterns.md → anticipate changes
Read .claude/memory/design-intelligence/rules.md → apply validated + promoted rules
```

### Detect Mode

- Default: **autonomous**
- "interactive" in brief → interactive mode (3 human gates)
- "supervised" in brief → supervised mode (gate per section)
- "autonomous" / "run solo" / "dejalo corriendo" → confirm autonomous mode

### Parse Brief

Extract: name, type, description, audience, pages, mood, scheme, URLs, brand, backend.
Ask only for what's MISSING (1 round max, options only).

### Compile Identity Card → `.brain/identity.md`

```markdown
# Identity: {name}
- **Type:** {e.g., Architecture studio}
- **Does:** {1-2 sentences}
- **Audience:** {who}
- **Pages:** {list}
- **Mood:** {e.g., Dark & Cinematic}
- **Scheme:** {dark/light/both}
- **References:** {URLs}
- **Brand:** {scratch/existing}
- **Backend:** {none/Pegasuz/other}
- **Mode:** {autonomous/interactive/supervised}
```

Create project directory + initialize `.brain/`:

```bash
PROJECT_DIR="C:\Users\mateo\Desktop\{slug}"
mkdir -p "$PROJECT_DIR/docs/pages" "$PROJECT_DIR/docs/mockups" \
         "$PROJECT_DIR/.brain/context" "$PROJECT_DIR/.brain/reports"
cp -r "$MAQUETA_DIR/docs/_libraries" "$PROJECT_DIR/docs/_libraries"
```

Write initial `state.md` + `queue.md` (full task list) + empty `decisions.md` + `approvals.md` + `learnings.md`.

In **autonomous mode**: announce identity card, create directory, proceed immediately.
In **interactive mode**: show identity card to user → wait for confirmation.

---

## Phase 0.5: References (CEO — if URLs provided)

```bash
cd "$MAQUETA_DIR/scripts" && npm install --silent 2>/dev/null && \
node capture-refs.mjs --batch "{urls}" --out "$PROJECT_DIR/_ref-captures"
```

Spawn reference-analyst → `docs/reference-analysis.md`. Validate 9-point gate.

### Extract Reference Observatory (after analyst completes)

Read `_ref-captures/{domain}/analysis.md` and extract into `.brain/context/reference-observatory.md`:

```markdown
# Reference Observatory

## Content Strategy Pattern
{section type sequence from sectionClassifications, e.g. "hero → clients → features → stats → cta"}
→ Use this as the default page structure unless the brief says otherwise.

## Color Rhythm
{rhythm string from sectionColors, e.g. "dark → dark → light → dark → mid"}
{N} theme transitions — {intentional contrast / monotone / mixed}

## Excellence Baseline (what the reference achieves)
| Dimension | Signal | Notes |
|-----------|--------|-------|
| Composition | {signal} | {key evidence from analysis.md} |
| Depth | {signal} | {z-index count, clip-paths, etc.} |
| Typography | {signal} | {ratio, clamp usage} |
| Motion | {signal} | {GSAP, scrub, cubic-beziers} |
| Craft | {signal} | {hover states, grain, cursor} |

## Quality Baseline
| Gate | Signal |
|------|--------|
| Contrast | {signal} |
| Animations | {PASS/FAIL} |
| Images | {signal} |

## Key Techniques to Borrow
{from reference-analysis.md borrow list — top 3}

## Patterns to Avoid
{from reference-analysis.md avoid list — top 2}
```

This file is injected into `context/design-brief.md` and every `context/S-{Name}.md`.

---

## Phase 1: Creative Direction

### INTERPRET (before writing context)

Read memory:
- `font-pairings.md` → proven pairings for this mood
- `color-palettes.md` → successful/failed combos
- `revision-patterns.md` → what users consistently change
- `rules.md` → promoted rules (apply immediately)

### Prepare Context

Write `.brain/context/design-brief.md` including:
- Project brief fields
- Full reference-analysis.md content
- **`## Memory Insights` block** (confidence-rated table from interpretation step)
- **`## Reference Observatory` block** — paste full content of `.brain/context/reference-observatory.md`
- Reference to decision trees + values library

### Spawn Designer

```
Agent: designer
Prompt: "Read $PROJECT_DIR/.brain/context/design-brief.md. Produce docs/tokens.md and docs/pages/*.md."
```

### Auto-Evaluate (12-point gate)

Read `docs/tokens.md` + `docs/pages/*.md`. Run 12-point check.
- PASS → log `[AUTO-APPROVED] design/tokens` in `approvals.md`
- FAIL → re-dispatch with specific failures (max 2 retries)
- Still fail → log `[NEEDS-REVIEW]` in `approvals.md`, continue

### Memory Hook — fire immediately

```
→ font-pairings.md: append chosen pairing + {reaction: "auto-approved by brain"}
→ color-palettes.md: append chosen palette + {reaction: "auto-approved by brain"}
→ decisions.md: D-001 Font, D-002 Palette, D-003 Section Plan
```

In **interactive mode**: present palette + typography + section plan → AskUserQuestion.
Memory hook fires AFTER user responds (use actual user reaction, not "auto-approved").

---

## Phase 2: Scaffold (CEO)

```bash
rsync -a --exclude='node_modules' "$MAQUETA_DIR/_project-scaffold/" "$PROJECT_DIR/"
cd "$PROJECT_DIR" && npm install
node "$MAQUETA_DIR/scripts/generate-tokens.js" "$PROJECT_DIR"
```

Write `.brain/context/atmosphere.md` with palette + atmosphere tokens.
Spawn builder → `AtmosphereCanvas.vue` + report. Auto-evaluate 5-point check.

---

## Phase 3: Sections

### For EACH section:

**Step A: INTERPRET + Prepare Context**

Read memory:
- `signatures.md` → proven signatures for this section type
- `technique-scores.md` → highest-scoring techniques for this motion category
- `section-patterns.md` → high-scoring layout+motion combos
- `revision-patterns.md` → known risks for this section type

**Resolve dynamic threshold** from memory before writing context:
```
section_type = classification from reference-observatory (e.g. "hero")
Read technique-scores.md → find all entries where type = section_type
historical_avg = average of their scores (or 7.0 if no data)
score_minimum = max(7.0, historical_avg - 0.3)   ← never below 7
```

Write `.brain/context/S-{Name}.md` including:
- Token values (only what this section needs)
- Recipe card + cinematic description + exact copy
- Library snippets (layout + motion + interaction patterns)
- **`## Memory Insights` block** (HIGH/MEDIUM/LOW confidence table)
- **`## Reference Observatory` block** — paste relevant subset from reference-observatory.md
- `Expected minimum score: {score_minimum}/10 (historical avg for {section_type}: {historical_avg})`
- Reference frame path

**Step B: Spawn Builder**

```
Agent: builder
Prompt: "Read $PROJECT_DIR/.brain/context/S-{Name}.md. Write S-{Name}.vue + report to .brain/reports/S-{Name}.md. Run Preview Loop."
```

**Step C: Observe → Evaluate → Decide**

```bash
# 1. Ensure dev server is running
#    (start with: cd "$PROJECT_DIR" && npx vite --port 5173 &)

# 2. Run observer against local project
mkdir -p "$PROJECT_DIR/.brain/observer"
cd "$MAQUETA_DIR/scripts"
node capture-refs.mjs --local --port 5173 "$PROJECT_DIR/.brain/observer"
```

The observer writes `$PROJECT_DIR/.brain/observer/localhost/analysis.md`.

```
# 3. Write evaluator context
```

Write `.brain/context/evaluate-S-{Name}.md`:
```markdown
# Evaluate: S-{Name}
- Builder report: .brain/reports/S-{Name}.md
- Observer analysis: .brain/observer/localhost/analysis.md
- Section type: {type from reference-observatory}
- Dynamic threshold: {score_minimum}/10 (historical avg: {historical_avg})
- Memory: {paste relevant rows from technique-scores.md for this type}
```

```
# 4. Spawn evaluator
```
```
Agent: evaluator
Prompt: "Read $PROJECT_DIR/.brain/context/evaluate-S-{Name}.md. Produce .brain/evaluations/S-{Name}.md."
```

```
# 5. Read decision
```
Read `.brain/evaluations/S-{Name}.md` → act on decision:
- **APPROVE** → log `[AUTO-APPROVED] build/S-{Name} | score: {composite} | signature: {name}` in `approvals.md`
- **RETRY** → re-dispatch builder with retry instructions from evaluation (max 2 — then auto-FLAG)
- **FLAG** → log `[NEEDS-REVIEW] build/S-{Name} | {reason}` in `approvals.md`, continue pipeline

**Memory Hook — fire immediately after auto-evaluation:**
```
→ signatures.md: append section signature + approved/needs-review
→ section-patterns.md: append layout + motion + score
→ technique-scores.md: increment usage count + update avg
→ decisions.md: D-NNN for this section
```

**Parallel:** Up to 2 independent sections simultaneously (worktree isolation).
Prepare BOTH context files (including memory insights) before spawning.

### After ALL sections: Batch Screenshot

Assemble sections in views. Screenshot desktop + mobile per page.

**Autonomous:** Save to `docs/review/sections/`. Continue immediately.
**Interactive:** AskUserQuestion → user reviews → handle changes.
**Memory hook:** `revision-patterns.md` if user requested any changes.

---

## Phase 4: Motion

### INTERPRET + Prepare Context

Read `technique-scores.md` + `pipeline-lessons.md`.
Write `.brain/context/motion.md`: easing, durations, section assignments, preloader/transition specs.
Include `## Memory Insights` block.

Spawn polisher → composables + preloader + report.
Auto-evaluate visual QA at 4 breakpoints.

---

## Phase 5: Integration (CEO)

1. `src/router/index.js` — lazy-loaded routes
2. `src/App.vue` — AtmosphereCanvas + AppPreloader + transition wrapper
3. `src/views/*.vue` — section imports per page
4. SEO meta per page

Screenshot all pages.

```bash
# Final observer pass — full site quality check
node "$MAQUETA_DIR/scripts/capture-refs.mjs" --local --port 5173 \
  "$PROJECT_DIR/.brain/observer/final"
```

Read `.brain/observer/final/localhost/analysis.md` → include quality gate results in REVIEW-SUMMARY.

**Autonomous:** Save to `docs/review/final/`. Write `REVIEW-SUMMARY.md`.
**Interactive:** AskUserQuestion.

### REVIEW-SUMMARY.md (autonomous mode)

```markdown
# Review Summary — {project name}

## What was built
{pages, sections, tech decisions}

## Final Quality Gates (from observer)
| Gate | Signal |
|------|--------|
| Contrast (WCAG AA) | {signal} |
| Animation rules | {PASS/FAIL} |
| Images | {signal} |
| Heading hierarchy | {signal} |
| Meta / SEO | {signal} |
| **Overall** | **{signal}** |

## Section Scores (composite — builder + observer)
{per-section composite scores from evaluations/*.md}

## Auto-Approved
{list of all [AUTO-APPROVED] tasks with composite scores}

## Needs Review
{list of all [NEEDS-REVIEW] tasks with reason + retry instructions}

## Key Decisions
{D-001 through D-NNN from decisions.md}

## Screenshots
{paths to docs/review/sections/ and docs/review/final/}
```

---

## Phase 6: Retrospective (CEO)

1. Read `.brain/approvals.md` + `.brain/decisions.md` → verify all learnings already persisted
2. Read `design-intelligence/rules.md` → auto-promote any rule with 3+ validations:
   - Design rule → append to `CLAUDE.md` Design Philosophy
   - Agent rule → append to relevant `.claude/agents/*.md`
   - Decision tree → update `docs/_libraries/design-decisions.md`
   - Value → update `docs/_libraries/values-reference.md`
3. Delete `_ref-captures/` and `docs/review/`
4. Final report to user: path, pages, sections, avg score, promoted rules

---

## What the CEO NEVER does

- Write section components (builder)
- Write motion code (polisher)
- Skip auto-evaluation gates
- Pass 80+ lines inline to agents (write context file instead)
- Wait until Phase 6 to write learnings (memory hooks fire in real-time)
- Skip the interpretation step before writing context files
- Spawn 3+ agents simultaneously
- Manually copy-paste tokens CSS (use generate-tokens.js)
- Block the pipeline for `[NEEDS-REVIEW]` items
