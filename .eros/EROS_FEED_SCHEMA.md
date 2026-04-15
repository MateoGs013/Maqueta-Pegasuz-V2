# Eros Feed Schema

Implementation contract for Maqueta's Claude-first eros-feed.

This document operationalizes the ideas from `BRAIN_FRONTEND_LOGICO.md` into repo artifacts, runtime expectations, and panel-facing data.

## 1. Intent

The eros-feed is the control layer for autonomous frontend generation. It is responsible for:

- reading the brief and references
- generating `DESIGN.md`
- selecting and mutating curated seeds
- tracking state and visual debt
- evaluating output through deterministic observer metrics plus multimodal critique
- deciding retry, approve, or flag without mandatory human intervention

## 2. Canonical Namespace

`.claude/` is the canonical architecture namespace.

- `.eros/pipeline.md` defines orchestration
- `.eros/brain-config.md` defines thresholds and approval logic
- `.claude/agents/*.md` define worker behavior
- `.eros/eros-feed/` stores eros-feed contracts, fixtures, and examples

`AGENTS.md` and `.agents/` are compatibility surfaces for Codex and should not diverge from `.claude`.

## 3. Runtime Artifacts

Every generated project must expose the following hybrid contract:

```text
PROJECT_DIR/
  DESIGN.md
  .brain/
    state.json
    metrics.json
    queue.json
    decisions.md
    context/
      *.md
    control/
      rules.json
    reports/
      quality/
        observer.json
        critic.json
        scorecard.json
    reviews/
      REVIEW-SUMMARY.md
```

### Markdown artifacts

Use Markdown for:

- `DESIGN.md`
- `decisions.md`
- agent context files
- review summaries
- narrative learnings

### JSON artifacts

Use JSON for:

- live state
- queue state
- rules and thresholds
- observer output
- multimodal critic output
- scorecards
- visual debt
- run history consumed by the panel

## 4. DESIGN.md Contract

`DESIGN.md` is the canonical design artifact for a generated project. It must be readable by Claude, Codex, and the panel.

Required sections:

1. Project framing
2. Brand intent
3. Design principles
4. Tone and atmosphere
5. Composition constraints
6. Typography rules
7. Palette and token intent
8. Motion rules
9. Responsive rules
10. Accessibility rules
11. Anti-patterns
12. Seed policy

Minimum seed policy fields:

- allowed section types
- banned hero patterns
- repetition avoidance rules
- mutation budget guidance
- reference usage rules

## 5. Seed Manifest Contract

The canonical seed catalog lives in `_components/blueprints.manifest.js`.

Each seed must expose:

- `name`
- `label`
- `category`
- `sectionType`
- `signature`
- `compositionFamily`
- `motionFamily`
- `themeCompatibility`
- `densityScore`
- `mutationBudget`
- `antiPatternCoverage`
- `requiredAssets`
- `creativityTags`
- `contract.problem`
- `contract.nonGenericSignal`
- `contract.lockedParts`
- `contract.mutableParts`
- `contract.preserveSignals`
- `contract.forbiddenCombos`

Seeds are creative anchors. The builder may mutate them strongly, but must preserve their contract.

## 6. Quality Loop

The approval loop is dual:

### Observer layer

Deterministic metrics for:

- composition
- depth
- typography
- motion
- craft
- accessibility
- responsive
- design-system consistency
- visual debt

### Critic layer

Multimodal structured critique for:

- generic feel
- brand drift
- loss of tension
- repeated section patterns
- missing award-level detail

### Decision output

The eros-feed produces a combined scorecard and one of:

- `approve`
- `retry`
- `flag`

Retry is default while under threshold and within retry budget.
Flag is reserved for persistent contrast risk, persistent brand incoherence, or repeated low scores.

## 7. Panel Contract

The panel is the internal backoffice for the eros-feed. It must consume structured artifacts rather than ad hoc strings.

Minimum views:

- Runs
- Blueprints
- Design DNA
- Observer
- Visual Debt
- Decisions

The panel may render Markdown where helpful, but its primary state must come from JSON artifacts.

## 8. Example Run

The example implementation lives under:

```text
.eros/eros-feed/examples/demo-run/
```

This fixture is the reference payload for panel development until live project ingestion is wired.
