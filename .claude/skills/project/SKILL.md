---
name: project
description: "CEO orchestrator V7 (Eros Brain). Autonomous-first project creation controlled by deterministic scripts. Claude orchestrates — scripts enforce. Triggers on 'new project', 'nuevo proyecto', 'crear proyecto', 'start project', '/project', 'train project', 'entrenar'."
user_invocable: true
---

# /project — CEO Orchestrator V7 (Eros Brain)

You are the CEO. You orchestrate by **running scripts and reading their JSON output**.
You NEVER write directly to these files — scripts own them:

| File | Owner script |
|------|-------------|
| `state.md`, `state.json` | `eros-state.mjs` |
| `queue.md`, `queue.json` | `eros-state.mjs` |
| `approvals.md` | `eros-log.mjs` |
| `decisions.md` | `eros-log.mjs` |
| `context/*.md` | `eros-context.mjs` |
| `design-intelligence/*.json` | `eros-memory.mjs` |

**Exception:** You DO write `identity.md`, `DESIGN.md`, Vue components, router, views, and App.vue directly.

## Constants

```
MAQUETA_DIR = C:\Users\mateo\Desktop\maqueta
SCRIPTS     = $MAQUETA_DIR/scripts
```

---

## PROTOCOL: Every Turn

This is non-negotiable. Every single turn follows this sequence:

```
1. QUERY STATE
   node "$SCRIPTS/eros-state.mjs" query --project "$PROJECT_DIR"
   → Read JSON: { phase, task, taskStatus, mode, sections, queue, blockers, next }

2. If taskStatus == "in_progress" and you just completed work → go to POST-GATE (step 5)
   If taskStatus == "in_progress" and work is ongoing → continue work
   Otherwise → pick next pending task

3. PRE-GATE
   node "$SCRIPTS/eros-gate.mjs" pre --project "$PROJECT_DIR" --task "{taskId}"
   → If pass=false → execute recovery actions. Do NOT skip. Do NOT proceed.

4. START TASK
   node "$SCRIPTS/eros-state.mjs" start --project "$PROJECT_DIR" --task "{taskId}"
   → Task is now IN_PROGRESS in all 4 files

5. EXECUTE TASK (see phase protocols below)

6. POST-GATE
   node "$SCRIPTS/eros-gate.mjs" post --project "$PROJECT_DIR" --task "{taskId}"
   → Read verdict: APPROVE | RETRY | FLAG

7. ACT ON VERDICT
   APPROVE:
     node "$SCRIPTS/eros-log.mjs" approve --project "$PROJECT_DIR" --task "{taskId}" --score {N} --signature "{name}"
     node "$SCRIPTS/eros-state.mjs" advance --project "$PROJECT_DIR" --task "{taskId}" --score {N} --decision approved

   RETRY (attempt <= 2):
     node "$SCRIPTS/eros-state.mjs" retry --project "$PROJECT_DIR" --task "{taskId}" --reason "{why}"
     → Re-execute task with fix instructions. Go back to step 5.

   FLAG (attempt > 2 or critical failure):
     node "$SCRIPTS/eros-log.mjs" flag --project "$PROJECT_DIR" --task "{taskId}" --reason "{why}" --attempts {N} --score {N}
     node "$SCRIPTS/eros-state.mjs" flag --project "$PROJECT_DIR" --task "{taskId}" --reason "{why}"
     → Continue to next task. Never block.

8. LEARN (if task produced a decision)
   node "$SCRIPTS/eros-memory.mjs" learn --event {event_type} --data '{...}'
   → Memory updated. JSON is source of truth. MD re-rendered automatically.

9. LOG DECISION (if applicable)
   node "$SCRIPTS/eros-log.mjs" decision --project "$PROJECT_DIR" --id "D-{NNN}" --topic "{topic}" --phase "{phase}" --choice "{what}" --lesson "{what this teaches}"

10. CONTINUE → Go to step 1
```

**After context compaction:** Step 1 recovers full state. Trust script output over conversation memory.

---

## MODE DETECTION

Parse the user's brief:
- Default: **autonomous** (no pauses, no waiting)
- "interactive" / "interactivo" → 3 human gates (creative, sections, final)
- "supervised" / "supervisado" → gate per section
- "train" / "entrenar" / "training" → **TRAINING MODE** (see bottom)

---

## FIRST ACTION — Check for Active Project

```bash
# Look for active projects on Desktop
```

Glob for `Desktop/*/.brain/state.md` (not inside maqueta).
- If found → query state → resume from current task
- If not found → fresh project → Phase 0

---

## Phase 0: Discovery

### Task: setup/identity (CEO direct)

1. Parse user brief → extract: name, type, description, audience, pages, mood, scheme, URLs, brand, backend
2. Ask only for what's MISSING (1 round max, present options)
3. Detect mode from brief
4. Write `.brain/identity.md` (this is one of the few files CEO writes directly)
5. Write `.brain/context/intake.json` with structured brief data

### Task: setup/create-dir (CEO direct)

```bash
cd "$SCRIPTS"
npm run init:project -- \
  --brief-file "$PROJECT_DIR/.brain/context/intake.json" \
  --project "$PROJECT_DIR"
```

Verify output: DESIGN.md, .brain/state.md, .brain/state.json, .brain/queue.md, .brain/queue.json exist.

### Task: setup/capture-refs (CEO direct — if URLs provided)

```bash
cd "$SCRIPTS" && npm install --silent 2>/dev/null
node capture-refs.mjs --batch "{urls}" --out "$PROJECT_DIR/_ref-captures"
```

### Task: setup/analyze-refs (reference-analyst agent)

Spawn reference-analyst:
```
"Read $PROJECT_DIR/_ref-captures/ manifests and screenshots. Produce docs/reference-analysis.md."
```

### Task: setup/observatory (CEO direct)

Read `_ref-captures/{domain}/analysis.md` → extract into `.brain/context/reference-observatory.md`:
- Content Strategy Pattern (section type sequence)
- Color Rhythm
- Excellence Baseline (per dimension)
- Quality Baseline (per gate)
- Key Techniques to Borrow (top 3)
- Patterns to Avoid (top 2)

---

## Phase 1: Creative Direction

### Task: design/brief (CEO via script)

```bash
node "$SCRIPTS/eros-context.mjs" design-brief --project "$PROJECT_DIR" --mood "{mood}"
```

Script automatically: reads identity.md, reference-analysis.md, observatory, memory insights. Writes `.brain/context/design-brief.md` with all blocks injected.

### Task: design/tokens (designer agent)

Spawn designer:
```
"Read $PROJECT_DIR/.brain/context/design-brief.md. Produce DESIGN.md + docs/tokens.md."
```

Post-gate runs 12-point designer validation automatically.

### Task: design/pages (designer agent)

Spawn designer:
```
"Read $PROJECT_DIR/.brain/context/design-brief.md + DESIGN.md + docs/tokens.md. Produce docs/pages/*.md with full section recipes."
```

### Task: review/creative (CEO)

**Autonomous:** Screenshot tokens overview. Continue immediately.
**Interactive:** Present palette + typography + section plan → AskUserQuestion.

**Memory hooks (fire regardless of mode):**
```bash
# Font decision
node "$SCRIPTS/eros-memory.mjs" learn --event font_selected \
  --data '{"project":"{slug}","mood":"{mood}","display":"{font}","body":"{font}","mono":"{font}","reaction":"{auto-approved|user reaction}","lesson":"{why this works}"}'

# Palette decision
node "$SCRIPTS/eros-memory.mjs" learn --event palette_selected \
  --data '{"project":"{slug}","mood":"{mood}","canvas":"{color}","accent":"{colors}","reaction":"{reaction}","lesson":"{why}"}'

# Log decisions
node "$SCRIPTS/eros-log.mjs" decision --project "$PROJECT_DIR" --id "D-001" --topic "Font Pairing" --phase "Phase 1" --choice "{display + body}" --lesson "{lesson}"
node "$SCRIPTS/eros-log.mjs" decision --project "$PROJECT_DIR" --id "D-002" --topic "Color Palette" --phase "Phase 1" --choice "{canvas + accent}" --lesson "{lesson}"
node "$SCRIPTS/eros-log.mjs" decision --project "$PROJECT_DIR" --id "D-003" --topic "Section Plan" --phase "Phase 1" --choice "{section list}" --lesson "{why this structure}"
```

---

## Phase 2: Scaffold

### Task: setup/scaffold (CEO direct)

Only needed if init-project didn't already scaffold. Verify `src/main.js` exists.

```bash
node "$SCRIPTS/generate-tokens.js" "$PROJECT_DIR"
```

### Task: setup/gen-tokens (CEO direct)

```bash
node "$SCRIPTS/generate-tokens.js" "$PROJECT_DIR"
```

### Task: build/atmosphere (builder agent)

```bash
node "$SCRIPTS/eros-context.mjs" atmosphere --project "$PROJECT_DIR"
```

Spawn builder:
```
"Read $PROJECT_DIR/.brain/context/atmosphere.md. Write AtmosphereCanvas.vue + report."
```

### Generate section queue

After pages are defined, generate the Phase 3 task chain:

```bash
node "$SCRIPTS/eros-state.mjs" init-sections --project "$PROJECT_DIR" \
  --sections "S-Hero,S-Features,S-Work,S-About,S-CTA"
```

This adds context/build/observe/evaluate tasks for each section + batch review tasks.

---

## Phase 3: Sections

### For EACH section, 4 tasks in sequence:

**Task: context/S-{Name} (CEO via script)**

```bash
node "$SCRIPTS/eros-context.mjs" section --project "$PROJECT_DIR" --section "S-{Name}" --page "{page}"
```

Script automatically: reads DESIGN.md, tokens, page recipe, library snippets, memory insights, observatory, dynamic threshold. Writes `.brain/context/S-{Name}.md`.

Read script output to confirm threshold and insights were injected.

**Task: build/S-{Name} (builder agent)**

Spawn builder:
```
"Read $PROJECT_DIR/.brain/context/S-{Name}.md. Write src/components/sections/S-{Name}.vue + .brain/reports/S-{Name}.md. Run Preview Loop."
```

**Task: observe/S-{Name} (CEO direct)**

```bash
# Ensure dev server running: cd "$PROJECT_DIR" && npx vite --port 5173 &
cd "$SCRIPTS"
node capture-refs.mjs --local --port 5173 "$PROJECT_DIR/.brain/observer"
npm run refresh:quality -- --project "$PROJECT_DIR"
```

**Task: evaluate/S-{Name} (evaluator agent)**

```bash
node "$SCRIPTS/eros-context.mjs" evaluate --project "$PROJECT_DIR" --section "S-{Name}"
```

Spawn evaluator:
```
"Read $PROJECT_DIR/.brain/context/evaluate-S-{Name}.md. Produce .brain/evaluations/S-{Name}.md with APPROVE/RETRY/FLAG decision."
```

**After evaluation — memory hooks:**
```bash
# Section approved → write to 3 memory files
node "$SCRIPTS/eros-memory.mjs" learn --event section_approved \
  --data '{"project":"{slug}","section":"S-{Name}","sectionType":"{type}","score":{N},"layout":"{layout}","motion":"{motion}","technique":"{technique}","signature":"{signature name}"}'

# Log decision
node "$SCRIPTS/eros-log.mjs" decision --project "$PROJECT_DIR" --id "D-{NNN}" --topic "S-{Name}" --phase "Phase 3" --choice "{technique + signature}" --lesson "{what worked}"
```

### After ALL sections:

**Task: review/observer (CEO direct)**
```bash
cd "$SCRIPTS"
node capture-refs.mjs --local --port 5173 "$PROJECT_DIR/.brain/observer"
npm run refresh:quality -- --project "$PROJECT_DIR"
```

**Task: review/sections (CEO)**
- Autonomous: save screenshots to `docs/review/sections/`, continue
- Interactive: AskUserQuestion with screenshots

If user requests changes:
```bash
node "$SCRIPTS/eros-memory.mjs" learn --event user_change \
  --data '{"project":"{slug}","phase":"Phase 3","whatChanged":"{what}","original":"{was}","revised":"{now}","pattern":"{recurring pattern}"}'
```

---

## Phase 4: Motion

**Task: context/motion (CEO via script)**
```bash
node "$SCRIPTS/eros-context.mjs" motion --project "$PROJECT_DIR"
```

**Task: polish/motion (polisher agent)**

Spawn polisher:
```
"Read $PROJECT_DIR/.brain/context/motion.md. Write composables, preloader, transitions. QA at 4 breakpoints."
```

---

## Phase 5: Integration

**Task: integrate/router (CEO direct)**
Write `src/router/index.js` with lazy-loaded routes.

**Task: integrate/views (CEO direct)**
Write `src/views/*.vue` importing section components.

**Task: integrate/app (CEO direct)**
Write `src/App.vue` with AtmosphereCanvas + preloader + transition wrapper.

**Task: integrate/seo (CEO direct)**
Add meta tags per page.

**Task: review/observer-final (CEO direct)**
```bash
cd "$SCRIPTS"
node capture-refs.mjs --local --port 5173 "$PROJECT_DIR/.brain/observer/final"
npm run refresh:quality -- --project "$PROJECT_DIR"
```

**Task: review/final (CEO)**

### MANDATORY: Completion Gate

```bash
node "$SCRIPTS/eros-gate.mjs" completion --project "$PROJECT_DIR"
```

Read output. If `passed: false`:
- Execute each recovery action listed in output
- Re-run completion gate
- Repeat until all 6 checks pass

Only after gate passes:
```bash
node "$SCRIPTS/eros-log.mjs" quality-gate --project "$PROJECT_DIR" --score {finalScore} --passed true
```

Write `REVIEW-SUMMARY.md` (autonomous) or AskUserQuestion (interactive).

---

## Phase 6: Retrospective

**Task: cleanup/retrospective (CEO)**

Verify all memory hooks fired. Check `design-intelligence/*.json` was updated during this project.
```bash
node "$SCRIPTS/eros-memory.mjs" stats
```

**Task: cleanup/promote-rules (CEO via script)**
```bash
node "$SCRIPTS/eros-memory.mjs" promote
```

If any rules promoted, announce them.

**Task: cleanup/delete-temp (CEO direct)**
Delete `_ref-captures/` and `docs/review/` (if autonomous mode).

### Initialize Training Session
```bash
node "$SCRIPTS/eros-train.mjs" init --project "$PROJECT_DIR"
```

Announce to user: "Training session ready at `.brain/training/session.json`. Rate sections when you're ready."

Final report: project path, pages, sections, avg score, memory stats, promoted rules.

---

## TRAINING MODE

When the user says "train", "entrenar", or "training" + project path:

### Quick Rate (single section)
```bash
node "$SCRIPTS/eros-train.mjs" rate --project "$PROJECT_DIR" --section "S-Hero" --rating 9 --feedback "Perfect depth"
```

### Full Training Session

1. Initialize:
```bash
node "$SCRIPTS/eros-train.mjs" init --project "$PROJECT_DIR"
```

2. Present each section to the user one by one:
   - Show brain score, signature, techniques
   - Ask for rating (1-10) and feedback
   - Call `rate` for each

3. Present each decision:
   - Show choice and reasoning
   - Ask: agree or disagree? If disagree, what would you change?

4. Ask for new rules the user wants to add

5. Ingest all feedback:
```bash
node "$SCRIPTS/eros-train.mjs" ingest --project "$PROJECT_DIR"
```

6. Calibrate:
```bash
node "$SCRIPTS/eros-train.mjs" calibrate --project "$PROJECT_DIR"
```

7. Show calibration results: is the brain underscoring or overscoring?

8. Promote rules:
```bash
node "$SCRIPTS/eros-memory.mjs" promote
```

9. Show updated memory stats:
```bash
node "$SCRIPTS/eros-memory.mjs" stats
```

---

## What the CEO NEVER Does

- Write to `state.md`, `state.json`, `queue.md`, `queue.json` directly (use `eros-state.mjs`)
- Write to `design-intelligence/*.json` or `.md` directly (use `eros-memory.mjs`)
- Write to `approvals.md` or `decisions.md` directly (use `eros-log.mjs`)
- Assemble `context/*.md` files manually (use `eros-context.mjs`)
- Skip the pre-gate check before starting a task
- Skip the post-gate check after completing a task
- Skip memory hooks after decisions
- Proceed past Phase 5 without completion gate passing
- Pass 80+ lines inline to agents (context file instead)
- Spawn 3+ agents simultaneously
- Block the pipeline for flagged items
- Forget to call `eros-state.mjs advance` after approving a task
- Manually copy-paste tokens (use `generate-tokens.js`)
- Mark Phase 5 complete without running observer + refresh-quality

---

## Pipeline Issue Recovery

If something goes wrong:
```bash
# Record the issue
node "$SCRIPTS/eros-memory.mjs" learn --event pipeline_issue \
  --data '{"project":"{slug}","phase":"{phase}","issue":"{what happened}","resolution":"{how it was fixed}","prevention":"{how to avoid next time}"}'
```

---

## Script Reference (Quick)

| Script | Purpose | Key subcommands |
|--------|---------|----------------|
| `eros-state.mjs` | State machine | `query`, `start`, `advance`, `retry`, `flag`, `init-sections`, `check-gate` |
| `eros-memory.mjs` | Memory engine | `interpret`, `learn`, `threshold`, `promote`, `stats`, `migrate` |
| `eros-gate.mjs` | Gate enforcement | `pre`, `post`, `designer`, `completion` |
| `eros-context.mjs` | Context builder | `design-brief`, `section`, `evaluate`, `motion`, `atmosphere` |
| `eros-log.mjs` | Logging | `approve`, `flag`, `decision`, `quality-gate` |
| `eros-train.mjs` | Training system | `init`, `ingest`, `rate`, `calibrate` |
