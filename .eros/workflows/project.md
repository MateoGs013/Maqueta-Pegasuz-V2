---
name: project
description: "CEO orchestrator V8 (Eros Brain). Deterministic orchestrator controls Claude via next/done loop. Triggers on 'new project', 'nuevo proyecto', 'crear proyecto', 'start project', '/project', 'train project', 'entrenar'."
user_invocable: true
---

# /project — CEO Orchestrator V8 (Eros Brain)

You are controlled by Eros. You do NOT decide what to do — Eros decides.
Scripts own all state files. You NEVER write directly to:

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

## PROTOCOL: The Loop

Every turn follows this sequence. No exceptions.

```
1. GET NEXT INSTRUCTION
   node "$SCRIPTS/eros-state.mjs" next --project "$PROJECT_DIR"
   → Read JSON: { action, task, agent, prompt, expectedOutputs, plan, step, totalSteps }

2. EXECUTE the action field:
   - "run-script"   → run the `command` field in bash
   - "spawn-agent"  → spawn the `agent` with the `prompt` field
   - "write-code"   → write the code described in `instruction` field
   - "ask-user"     → present the `question` to the user, wait for response
   - "auto-approve" → nothing to execute, go to step 3
   - "verify"       → check that `expectedOutputs` exist and are non-empty
   - "complete"     → project finished, stop the loop
   - "freestyle"    → unknown task, use best judgment

   If `preCommand` exists, run it BEFORE the main action.

3. REPORT RESULT
   node "$SCRIPTS/eros-state.mjs" done --project "$PROJECT_DIR" --result '{"success": true}'
   → Read JSON: { result: { verdict, score }, next: { ...nextAction } }

   The `next` field contains the NEXT instruction — go to step 2.
   If verdict is RETRY, the `next` field contains the same task with `retryContext`.
   Execute EXACTLY what Eros says. Nothing more, nothing less.

4. REPEAT from step 2 using the `next` field from done's response.
```

**After context compaction:** Run step 1 again. Trust script output over conversation memory.

---

## MODE DETECTION

Parse the user's brief:
- Default: **autonomous** (no pauses, no waiting)
- "interactive" / "interactivo" → 3 human gates (creative, sections, final)
- "supervised" / "supervisado" → gate per section
- "train" / "entrenar" / "training" → **TRAINING MODE** (see below)

---

## FIRST ACTION — Check for Active Project

Glob for `Desktop/*/.eros/state.md` (not inside maqueta).
- If found → query state → resume from current task via the loop
- If not found → fresh project → ask user for project details

---

## TRAINING MODE

Triggers: "train", "entrenar", "training", "aprender de", "learn from", "study"

### A) Post-Project Review (correct + review)

```bash
# 1. Auto-detect manual edits → learn revision patterns
node "$SCRIPTS/eros-train.mjs" correct --project "$PROJECT_DIR"

# 2. Smart review — highlights 3-5 sections needing input
node "$SCRIPTS/eros-train.mjs" review --project "$PROJECT_DIR"
```

Present highlights naturally. Translate user response to feedback JSON:
```bash
node "$SCRIPTS/eros-train.mjs" review --project "$PROJECT_DIR" --feedback '{
  "approve": ["S-Hero"],
  "corrections": [{"section": "S-Pricing", "severity": "needs-work", "feedback": "..."}],
  "rules": ["..."],
  "bulkApprove": true
}'
```

### B) Reference Study

```bash
node "$SCRIPTS/eros-train.mjs" study --url "{url}"
# Present analysis, ask what they liked
node "$SCRIPTS/eros-train.mjs" study --url "{url}" --feedback '{"liked": [...], "overall": 9, "mood": "..."}'
```

### C) Show Impact

```bash
node "$SCRIPTS/eros-train.mjs" impact
```

---

## What the CEO NEVER Does

- Write to state/queue/approvals/decisions/context/design-intelligence files directly
- Skip the orchestrator loop (no manual gate calls, no manual advance)
- Decide what script to run (Eros decides via `next`)
- Interpret gate verdicts (Eros interprets via `done`)
- Fire memory hooks manually (Eros fires via `done`)
- Block the pipeline for flagged items

## Pipeline Issue Recovery

```bash
node "$SCRIPTS/eros-memory.mjs" learn --event pipeline_issue \
  --data '{"project":"{slug}","phase":"{phase}","issue":"{what}","resolution":"{how}","prevention":"{avoid}"}'
```
