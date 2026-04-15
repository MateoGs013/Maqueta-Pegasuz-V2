# Eros Configuration — V7 (Script-Driven)

Central configuration for autonomous behavior, approval thresholds, and memory rules.

---

## Mode

```
default: autonomous
```

The brain builds, evaluates, and advances **without waiting for the user** by default.
The user receives a `docs/review/REVIEW-SUMMARY.md` at project end — not blocking gates.

Override by including in the brief:
- `"interactive"` → 3 human review gates active (creative, sections, final)
- `"supervised"` → human reviews each section individually

---

## Auto-Approval Thresholds

The brain evaluates every agent output against these thresholds.
Pass → continue. Fail → retry (max `retry_max`). Still fail → log to `.eros/approvals.md` + continue.

```yaml
designer_gate:
  points_required: 12/12
  decision_tree_used: true          # must cite design-decisions.md paths

builder_gate:
  # Score minimum is DYNAMIC — resolved per section type from memory.
  # See "Dynamic Threshold Resolution" below for the algorithm.
  # Static fallback: 7.0 (used when no historical data exists for the type)
  excellence_dimensions: all_pass   # observer signals must all be MEDIUM+
  quality_gates: no_FAIL            # observer gates must all be PASS or WARN
  signature_named: true
  anti_ai_patterns: 0

evaluator_gate:
  # Composite score = observer + critic + design-dna compliance + memory confidence.
  # Structured outputs are persisted to .eros/reports/quality/{observer,critic,scorecard}.json
  # STRONG=10, MEDIUM=7, WEAK=4 | PASS=10, WARN=7, FAIL=0
  approve_threshold: composite >= score_minimum AND all_excellence MEDIUM+ AND no_gate_FAIL AND critic_brand_alignment >= MEDIUM
  retry_threshold:   composite >= score_minimum - 1.5 OR 1-2 signals WEAK OR critic_genericity = MEDIUM
  flag_threshold:    contrast_FAIL OR 3+_signals_WEAK OR composite < 6 OR critic_brand_alignment = LOW

visual_qa:
  layers_visible: 3+
  no_broken_areas: true
  mobile_designed: true
  density_minimum: 3                # 4 for hero/portfolio sections

retry_max: 2                        # max agent re-dispatches per task before flagging
```

---

## Dynamic Threshold Resolution

[V7: automated by eros-memory.mjs] The CEO no longer manually reads memory files to resolve thresholds.
Run: `node eros-memory.mjs threshold --section-type hero` to get the resolved minimum for any section type.
The script reads `design-intelligence/technique-scores.md`, computes historical averages, and returns the threshold.

The algorithm (now executed by the script):

```
1. Identify section type from reference-observatory.md
   (e.g. "hero", "testimonials", "pricing")

2. eros-memory.mjs reads design-intelligence/technique-scores.md
   → filter entries where section_type = this type
   → compute historical_avg = mean of their scores

3. score_minimum = max(7.0, historical_avg - 0.3)
   → "we expect to match or slightly beat historical average"
   → floor at 7.0 so we never accept below-average work

4. Include in context file:
   "Expected minimum score: {score_minimum}/10
    (based on {N} historical {type} sections, avg {historical_avg})"

5. Evaluator uses this threshold (not the static 7.0 from builder_gate)
```

**Example thresholds from accumulated memory:**

| Section type | Historical avg | Resolved minimum |
|-------------|---------------|-----------------|
| hero | 8.3 | **8.0** |
| features | 7.8 | **7.5** |
| testimonials | 7.4 | **7.1** |
| contact | 7.0 | **7.0** (floor) |
| pricing | 8.1 | **7.8** |
| (new type) | — | **7.0** (default) |

---

## Memory — Auto-Write Rules

[V7: automated by eros-memory.mjs] All memory writes are handled by `eros-memory.mjs learn`.
The CEO calls `node eros-memory.mjs learn --event <event_name> --data '<json>'` instead of manually editing memory files.

Supported event names: `font_selected`, `palette_selected`, `section_approved`, `user_change`, `pipeline_issue`, `rule_discovered`, `rule_validated`.

The brain writes to long-term memory **immediately** after each event.
Never batch writes to Phase 6.

```yaml
on_font_selected:       # node eros-memory.mjs learn --event font_selected --data '...'
  write_to: design-intelligence/font-pairings.md
  fields: [date, project, mood, display, body, reaction, lesson]

on_palette_selected:    # node eros-memory.mjs learn --event palette_selected --data '...'
  write_to: design-intelligence/color-palettes.md
  fields: [date, project, mood, canvas, accent, reaction, lesson]

on_section_approved:    # node eros-memory.mjs learn --event section_approved --data '...'
  write_to: design-intelligence/signatures.md
  write_to: design-intelligence/section-patterns.md
  write_to: design-intelligence/technique-scores.md

on_user_change_requested:  # node eros-memory.mjs learn --event user_change --data '...'
  write_to: design-intelligence/revision-patterns.md
  fields: [date, project, phase, what_changed, original, new, pattern]

on_pipeline_issue:      # node eros-memory.mjs learn --event pipeline_issue --data '...'
  write_to: design-intelligence/pipeline-lessons.md

on_rule_validated_3x:   # node eros-memory.mjs learn --event rule_validated --data '...'
  promote_to: CLAUDE.md or agent file
  mark_in: design-intelligence/rules.md → PROMOTED
```

---

## Interpretation — Context Enrichment

[V7: automated by eros-context.mjs] The CEO never manually reads memory files for interpretation.
`eros-context.mjs` calls `eros-memory.mjs interpret` internally to read the relevant memory files,
compute confidence levels, and inject the "## Memory Insights" block into the context file automatically.

The CEO runs: `node eros-context.mjs --task <task-id> --project "$PROJECT_DIR"`

The script selects the correct memory files based on task type:

```yaml
before_design_task:
  read: [font-pairings.md, color-palettes.md, revision-patterns.md, rules.md]
  inject_as: "## Memory Insights" block in context file
  confidence_levels:
    HIGH: 3+ validations
    MEDIUM: 1-2 validations
    LOW: new (no data)

before_build_task:
  read: [signatures.md, technique-scores.md, section-patterns.md, revision-patterns.md]
  inject_as: "## Memory Insights" block in context file

before_polish_task:
  read: [technique-scores.md, pipeline-lessons.md]
  inject_as: "## Memory Insights" block in context file
```

**Format of injected block:**
```markdown
## Memory Insights

| Topic | Insight | Confidence |
|-------|---------|-----------|
| Font | Clash Display + Satoshi → validated 4x for dark cinematic | HIGH |
| Hero technique | Clip-path reveal → avg 9/10 | HIGH |
| Revision risk | Users consistently enlarge hero images → pre-emptively large | MEDIUM |
| Rule | Asymmetric grid ≥1.4:1 → always | PROMOTED |
```

---

## Approvals Log (`.eros/approvals.md`)

Every auto-approval is logged here. User reads this when they want — it never blocks.

```yaml
auto_approve:
  log_entry: [task, score, dimensions_passed, signature, timestamp]

needs_review_flag:
  trigger: fails threshold after retry_max attempts
  log_entry: [task, what_failed, attempts, last_score]
  action: continue pipeline (never block)
```

---

## Completion Gate (Phase 5 Hard Stop)

Phase 5 CANNOT close unless these conditions are met. This is not advisory — it blocks.

```yaml
completion_gate:
  observer_ran: true                    # .eros/observer/ must have analysis.md
  quality_refreshed: true               # .eros/reports/quality/scorecard.json must exist
  scorecard_nonzero: true               # scorecard.finalScore > 0
  queue_complete: true                  # all queue.json tasks status = "done"
  evaluations_complete: true            # every build/S-* has matching evaluations/*.md
  queue_synced: true                    # queue.md DONE count == queue.json done count

on_gate_fail:
  action: execute_missing_step          # not skip, not flag — actually run the step
  log_to: state.md (Blocker field)
  retry: until all checks pass
```

**Queue sync enforcement:**
[V7: automated by eros-state.mjs] The dual-write problem is eliminated. `eros-state.mjs` atomically
updates `queue.md`, `queue.json`, and `state.md` in a single operation. The CEO never writes to these
files directly — all state/queue mutations go through `eros-state.mjs`.
- Every task status change is handled by `node eros-state.mjs advance`
- Before any `review/*` or `integrate/*` task, `eros-state.mjs` verifies queue sync automatically
- `state.md` section count always matches `queue.json` done count (enforced by the script)

---

## Rule Promotion

```yaml
promotion_threshold: 3             # validations across different projects
promotion_targets:
  design_rule: CLAUDE.md Design Philosophy
  agent_rule: relevant .claude/agents/*.md
  decision_tree: docs/_libraries/design-decisions.md
  value: docs/_libraries/values-reference.md
auto_promote: true                 # brain promotes without asking
```

---

## Observer Integration (v4)

The General Observer (`scripts/archive/capture-refs.mjs` — legacy V1, superseded by `scripts/observer/` multi-pass architecture) was used in two modes:

### Mode A: Reference analysis (setup/capture-refs task)
```bash
node capture-refs.mjs <url> $PROJECT_DIR/_ref-captures
```
- Captures external reference sites
- Output: manifest.json + analysis.md + screenshots per page
- Feed to: `reference-analyst` agent → `docs/reference-analysis.md`

### Mode B: Own-project QA (review/sections and review/final tasks)
```bash
node capture-refs.mjs --local --port 5173 $PROJECT_DIR/.eros/observer
```
- Observes the project running locally
- Output: manifest.json + analysis.md with **Excellence Standard scores**
- Feed to: CEO auto-evaluation engine
- Approval criteria derived from `excellenceSignals` in observer output

### Observer → Approval Criteria

When evaluating builder output, the CEO must:
1. Run observer on localhost AFTER the dev server is running
2. Read `.eros/observer/{localhost}/analysis.md`
3. Compare `excellenceSignals` against `config.md` thresholds:
   - All dimensions must be MEDIUM or STRONG
   - WEAK on any dimension → flag in `approvals.md`, trigger retry
4. Inject observer findings into next context file as "## Observer Signals" block

```yaml
observer_gate:
  composition: MEDIUM+    # WEAK → retry with composition guidance
  depth: MEDIUM+
  typography: MEDIUM+
  motion: MEDIUM+         # checked after polish phase
  craft: MEDIUM+          # checked after polish phase

critic_gate:
  genericity: LOW         # MEDIUM/HIGH → retry
  brand_alignment: MEDIUM+
  tension: MEDIUM+
  pattern_repetition: LOW

## Design DNA Contract

Every project must generate a root-level `DESIGN.md` before section building starts.
This file is the canonical design toolkit for the run and must include:

- brand intent and tone
- composition constraints
- typography rules
- palette intent
- motion rules
- responsive rules
- anti-patterns
- allowed / banned seed combinations

The brain treats `DESIGN.md` as a required input for `builder`, `polisher`, and the multimodal critic.
```
