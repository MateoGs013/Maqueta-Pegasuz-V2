# Maqueta — V6 Brain Architecture

Immutable template for building award-level Vue 3 websites via an agent pipeline.
Every project is created in its own directory — maqueta is never modified during builds.

---

## How it works

```
/project → CEO orchestrates micro-tasks → agents build one thing at a time
```

Three memory layers keep the system coherent across long builds and context compaction:

| Layer | Location | Purpose |
|-------|----------|---------|
| Working Memory | `$PROJECT_DIR/.brain/` | Task queue, pre-computed context, reports |
| Long-Term Memory | `.claude/memory/design-intelligence/` | Cross-project intelligence |
| Session State | `.brain/state.md` | 15-line crash recovery |

---

## Pipeline (micro-tasks)

Each task is small enough that context can compact between tasks without losing state.

```
Phase 0: Discovery       → .brain/identity.md + reference capture
Phase 1: Design          → CEO prepares context → designer → tokens.md + pages/*.md
Phase 2: Scaffold        → scaffold copy + generate-tokens.js + atmosphere
Phase 3: Sections        → CEO prepares context → builder (per section) → Preview Loop
Phase 4: Motion          → CEO prepares context → polisher → composables + preloader
Phase 5: Integration     → CEO: router + views + SEO + final screenshots
Phase 6: Retrospective   → learnings → long-term memory → rule promotion → cleanup
```

**Context rule:** CEO writes `.brain/context/{task}.md` before spawning any agent.
Agent reads ONE file. Never "read the docs."

---

## Stack

```
Vue 3 (script setup) + Vite + Vue Router + Pinia
GSAP 3 + ScrollTrigger + Lenis
CSS Custom Properties (no Tailwind)
@splinetool/runtime (optional 3D)
```

---

## Directory structure

```
maqueta/
  _project-scaffold/           ← copied to every new project
    .brain/                    ← working memory template
    src/                       ← Vue 3 starter
  docs/_libraries/             ← design patterns (layouts, motion, interactions, decisions)
  scripts/
    capture-refs.mjs           ← 4-pass reference capture (desktop + mobile + interactions)
    generate-tokens.js         ← parses tokens.md → tokens.css
  .claude/
    pipeline.md                ← micro-task catalog + .brain/ spec
    skills/project/SKILL.md    ← CEO orchestrator (~244 lines)
    agents/                    ← designer, builder, polisher, reference-analyst
    memory/
      MEMORY.md                ← index
      design-intelligence/     ← 8 focused learning files
  CLAUDE.md                    ← design philosophy + rules (applies to all agents)
```

```
Desktop/{project-slug}/
  .brain/
    state.md                   ← current phase + next task (15 lines)
    queue.md                   ← micro-task queue
    decisions.md               ← real-time decision log
    context/                   ← pre-computed agent inputs
    reports/                   ← agent output reports
  docs/
    tokens.md                  ← design system (source of truth)
    pages/home.md              ← sections with cinematic descriptions
    _libraries/                ← copied from maqueta
  src/
    styles/tokens.css          ← auto-generated from tokens.md
    components/sections/       ← S-{Name}.vue
    composables/               ← useMotion, useLenis, useCursor
```

---

## Excellence Standard (per section)

Every section must pass all 6 dimensions before shipping:

| Dimension | Hard requirements |
|-----------|------------------|
| Composition | Grid >= 1.4:1 · overlap · container break · asymmetric padding · 2+ alignments |
| Depth | 3+ z-index · atmospheric pseudo-element · backdrop-filter/shadow/blur · scroll-responsive bg |
| Typography | 4x size ratio · 4+ sizes · 2+ weights · custom letter-spacing |
| Motion | 3+ animated elements · 2+ easing curves · 1 scroll-linked · stagger |
| Craft | 2+ distinct hovers · magnetic element · focus-visible · clip-path/mask |
| Signature | 1 distinctive named element — if you can't name it, redesign |

---

## Long-Term Memory (cross-project intelligence)

`.claude/memory/design-intelligence/` accumulates knowledge from every project.
CEO reads only what's relevant per task. Writes in real-time — not at Phase 6.

| File | When to read |
|------|-------------|
| `font-pairings.md` | Before choosing fonts (designer) |
| `color-palettes.md` | Before choosing colors (designer) |
| `signatures.md` | Before designing signatures (builder) |
| `section-patterns.md` | Before planning sections (designer) |
| `revision-patterns.md` | Before starting any project (CEO) |
| `technique-scores.md` | Before choosing motion techniques (builder) |
| `pipeline-lessons.md` | When debugging process issues (CEO) |
| `rules.md` | Before any design work — rules promoted after 3 validations |

---

## Versions

| Version | Key feature |
|---------|------------|
| V6 | Brain Architecture — .brain/ working memory, micro-tasks, real-time learning |
| V5.6 | Design learning system — cross-project intelligence |
| V5.5 | Autonomous mode — overnight pipeline, decision trees |
| V5.4 | Excellence Standard — measurable hard requirements |
| V5.3 | Auto-critique scoring, batch user review |
| V5.2 | Builder Preview Loop — self-screenshot + self-correct |
