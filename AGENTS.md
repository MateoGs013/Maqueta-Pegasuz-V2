# AGENTS.md — Eros Orchestrator Contract

> This file is the AI-neutral contract for working inside this repository. Any AI agent reads this to understand how Eros operates. The soul of Eros lives in `EROS.md`. AI-specific tool mappings live in `CLAUDE.md`, `GEMINI.md`, and `.codex/`.

## System Purpose

Eros is an autonomous creative-director pipeline that turns a one-line project brief into a production-ready Vue 3 website with cinematic motion, distinctive typography, and a complete design system.

## Project Isolation

**Maqueta is an immutable template.** Never write project files inside maqueta.
Every new project is created in its own directory on the Desktop:

```
Desktop/
  maqueta/                   <- TEMPLATE (read-only during projects)
    _project-scaffold/       <- Vue 3 starter (copied to new projects)
    _components/             <- curated seed library (heroes/navs as creative anchors)
    panel/                   <- dual panel: Eros (quality) + Workshop (ABM editor)
    docs/                    <- plans/specs/references/_libraries/archive (see docs/README.md)
    scripts/                 <- eros-core/memory/observer/quality/pipeline/panel/dev/lib/archive (see scripts/README.md)
    .eros/                   <- canonical brain: agents, workflows, memory, pipeline
    .claude/                 <- Claude adapter: skills, agent wrappers, settings
    .gemini/                 <- Gemini adapter: settings, overrides
    .codex/                  <- Codex adapter: AGENTS.override.md, config.toml

  {project-slug}/            <- NEW PROJECT (created from template)
    .eros/                  <- working memory (micro-task state, context, reports)
    docs/                    <- design docs (generated) + _libraries (copied)
    _ref-captures/           <- reference screenshots (temporary)
    src/                     <- Vue 3 app (from scaffold)
```

- `MAQUETA_DIR` = `C:\Users\mateo\Desktop\maqueta`
- `PROJECT_DIR` = `C:\Users\mateo\Desktop\{project-slug}`

## Stack

Vue 3 (`<script setup>`) + Vite + Vue Router + Pinia · GSAP 3 + ScrollTrigger + Lenis · CSS Custom Properties · @splinetool/runtime (optional)

## Brain Architecture — 3 Memory Layers

| Layer | Location | Purpose | Lifetime |
|-------|----------|---------|----------|
| Working Memory | `$PROJECT_DIR/.eros/` | Hot state: tasks, context, reports, approvals | Per project |
| Long-Term Memory | `$MAQUETA_DIR/.eros/memory/design-intelligence/` | Cross-project intelligence | Permanent |
| Session State | `$PROJECT_DIR/.eros/state.md` | Crash recovery | Per project |

## Autonomous Brain Loop

1. Read `.eros/state.md` — where am I?
2. Read `.eros/queue.md` — what's next?
3. INTERPRET — read design-intelligence, inject Memory Insights
4. Execute ONE micro-task — context file | agent spawn | integration
5. AUTO-EVALUATE — pass/fail vs config thresholds
6. MEMORY HOOK — write learning to design-intelligence immediately
7. Log to approvals.md + decisions.md; update queue + state

## Agent Registry

Agents live in `.eros/agents/`. The CEO orchestrator writes a context file to `.eros/context/`, then spawns the agent which reads ONE file. Agents never "read the docs" — context is pre-computed.

| Agent | Input | Output |
|-------|-------|--------|
| `designer` | `.eros/context/design-brief.md` | `docs/tokens.md` + `docs/pages/*.md` |
| `builder` | `.eros/context/S-{Name}.md` | `S-{Name}.vue` + `.eros/reports/S-{Name}.md` |
| `polisher` | `.eros/context/motion.md` | composables + `.eros/reports/motion.md` |
| `reference-analyst` | `_ref-captures/` | `docs/reference-analysis.md` |
| `evaluator` | agent output + config thresholds | pass/fail verdict |

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
- `autoAlpha` instead of `opacity` for fades.
- `SplitText.create()` with `autoSplit`, `mask`, `aria: 'auto'`.
- `gsap.quickTo()` for mouse followers.
- `ScrollTrigger.batch()` for grids.
- No consecutive sections with same motion technique.
- `var(--token)` for everything. No magic numbers.
- Register GSAP plugins once in `main.js`.
- Lazy route imports with `scrollBehavior`.
- Images: `alt` + `width` + `height` + `loading="lazy"`.
- No `axios` outside `src/config/api.js`.
- No `will-change` preventive. No infinite decorative loops.
- Semantic HTML, correct heading hierarchy, `focus-visible`.

## GSAP Anti-Patterns

- Never ScrollTrigger on child tweens inside timeline — on the timeline itself.
- Never `scrub` + `toggleActions` together.
- Never nest `gsap.context()` inside `gsap.matchMedia()`.
- Never forget `immediateRender: false` when stacking `from()`/`fromTo()`.
- Never create ScrollTriggers in random order without `refreshPriority`.
- Never leave `markers: true` in production.
- `clearProps: 'all'` when CSS classes should take over.
- `ScrollTrigger.refresh()` after Vue nextTick for dynamic content.

## Per-Section Quality Checklist

Before marking a section done:
- [ ] Semantic HTML, heading hierarchy, `aria-label`
- [ ] `var(--token)` everywhere, fluid type with `clamp()`
- [ ] Visual depth: 2+ layers, overlap, shadow, gradient, blur, grain
- [ ] Hover + `focus-visible` + magnetic effects
- [ ] Motion with specific easing + timing + stagger
- [ ] `gsap.matchMedia()` + `mm.revert()` cleanup
- [ ] `autoAlpha` for fades, `SplitText.create()` with `mask` + `aria`
- [ ] Responsive: 375px, 768px, 1280px, 1440px
- [ ] Grain overlay on dark sections (2-4% opacity)
- [ ] No default easing — all cubic-bezier or GSAP named
- [ ] Asymmetric composition — not centered-everything

## Health Check (mandatory before every PR)

```bash
node .eros/scripts/eros-doctor.mjs
```

Validates multi-AI architecture integrity: required root files, canonical `.eros/` docs, scripts subdir structure, agent contracts, legacy-ref detection. **Must exit 0** before opening or updating a PR. Any agent finishing a task — worker or lead — runs this before reporting complete.

## References

- Soul: `EROS.md`
- Runtime loop: `.eros/pipeline.md`
- Thresholds: `.eros/config.md`
- Schema contracts: `.eros/EROS_FEED_SCHEMA.md`
- Claude specifics: `CLAUDE.md`
- Gemini specifics: `GEMINI.md`
- Codex overrides: `.codex/AGENTS.override.md`
