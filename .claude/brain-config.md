# Brain Configuration — V6.1

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
Pass → continue. Fail → retry (max `retry_max`). Still fail → log to `.brain/approvals.md` + continue.

```yaml
designer_gate:
  points_required: 12/12
  decision_tree_used: true          # must cite design-decisions.md paths

builder_gate:
  excellence_dimensions: all_pass   # all 6 dimensions must pass
  signature_named: true             # must be named + explained
  score_minimum: 7                  # /10 from Preview Loop
  anti_ai_patterns: 0              # zero tolerance

visual_qa:
  layers_visible: 3+
  no_broken_areas: true
  mobile_designed: true
  density_minimum: 3                # 4 for hero/portfolio sections

retry_max: 2                        # max agent re-dispatches per task before flagging
```

---

## Memory — Auto-Write Rules

The brain writes to long-term memory **immediately** after each event.
Never batch writes to Phase 6.

```yaml
on_font_selected:
  write_to: design-intelligence/font-pairings.md
  fields: [date, project, mood, display, body, reaction, lesson]

on_palette_selected:
  write_to: design-intelligence/color-palettes.md
  fields: [date, project, mood, canvas, accent, reaction, lesson]

on_section_approved:
  write_to: design-intelligence/signatures.md
  write_to: design-intelligence/section-patterns.md
  write_to: design-intelligence/technique-scores.md

on_user_change_requested:
  write_to: design-intelligence/revision-patterns.md
  fields: [date, project, phase, what_changed, original, new, pattern]

on_pipeline_issue:
  write_to: design-intelligence/pipeline-lessons.md

on_rule_validated_3x:
  promote_to: CLAUDE.md or agent file
  mark_in: design-intelligence/rules.md → PROMOTED
```

---

## Interpretation — Context Enrichment

Before writing any `context/{task}.md`, the brain reads its own memory and injects insights.

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

## Approvals Log (`.brain/approvals.md`)

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
