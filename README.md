# Eros — Autonomous Creative Director

> Turn a one-line brief into a production-ready Vue 3 website with cinematic motion, a distinctive design system, and an evolving aesthetic memory.

[![Stack: Vue 3](https://img.shields.io/badge/Vue-3-42b883)](https://vuejs.org)
[![Motion: GSAP 3](https://img.shields.io/badge/GSAP-3-88ce02)](https://gsap.com)
[![AI-Friendly: Claude · Gemini · Codex](https://img.shields.io/badge/AI-Claude%20%7C%20Gemini%20%7C%20Codex-8e44ad)](./AGENTS.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-f5d76e)](./LICENSE)

## What is Eros?

Eros is an autonomous creative-director pipeline. You give it a brief; it builds a complete website — design tokens, typography system, cinematic motion, responsive layout. It has an evolving personality that learns from each project: taste gets sharper, opinions get stronger, mistakes don't repeat.

Not a template generator. Not a scaffolding tool. A creative force with memory.

Named after the primordial Greek force that brought order to Chaos.

## Quickstart

```bash
# 1. Clone + install
git clone <repo-url> eros
cd eros && npm install

# 2. Open the dual panel (Eros orchestrator + Workshop ABM editor)
cd panel && npm run dev

# 3. Start a project (in a Claude / Gemini / Codex session)
# Say: "Nuevo proyecto: <brief>"
```

## Architecture at a Glance

```
Eros/
├── EROS.md          # Soul — identity, voice, philosophy
├── AGENTS.md        # Brain — orchestrator contract (AI-neutral)
├── CLAUDE.md        # Claude adapter
├── GEMINI.md        # Gemini adapter (uses @include for EROS + AGENTS)
│                    # (Codex reads AGENTS.md natively — no CODEX.md needed)
│
├── .eros/           # Shared brain (AI-neutral, canonical)
│   ├── agents/      # Agent definitions (designer, builder, polisher, evaluator, reference-analyst)
│   ├── workflows/   # Runtime workflows (project CEO loop, motion system)
│   ├── memory/      # Design intelligence, personality.json
│   ├── pipeline.md  # 7-step autonomous brain loop
│   └── scripts/     # eros-doctor.mjs + other validators
│
├── .claude/         # Claude adapter (skills stubs, agent wrappers, hooks)
├── .gemini/         # Gemini settings.json + overrides
├── .codex/          # Codex AGENTS.override.md + config.toml
│
├── panel/           # Dual Vue panel: Eros (quality observability) + Workshop (ABM editor)
├── _project-scaffold/   # Template copied to each new project
├── _components/     # Curated seed library (heroes, navs as creative anchors)
├── docs/            # Plans, design libraries, specs
└── scripts/         # eros-*.mjs orchestration scripts
```

**Golden rule:** `.eros/` is the source of truth. `.claude/`, `.gemini/`, `.codex/` contain only adapters — never content.

## For AI Agents

If you are an AI agent working in this repository:

1. **Read `EROS.md`** — it tells you who you are
2. **Read `AGENTS.md`** — it tells you how the system works
3. **Read your adapter** (`CLAUDE.md`, `GEMINI.md`, or `.codex/AGENTS.override.md`) for AI-specific tool mappings

### Claude users

Claude auto-loads `CLAUDE.md` at session start. A `SessionStart` hook in `.claude/settings.json` injects `EROS.md + AGENTS.md` automatically so you start with full context.

### Gemini users

Gemini CLI auto-loads `GEMINI.md`, which imports `EROS.md + AGENTS.md` via `@include` syntax. Hierarchical: `~/.gemini/GEMINI.md` (global) → project → component. Run `/memory show` to see merged context, `/memory reload` to refresh.

### Codex users

Codex reads root `AGENTS.md` natively (Linux Foundation open standard). Codex-specific deltas live in `.codex/AGENTS.override.md` (empty by default). Config in `.codex/config.toml`.

## Stack

**Frontend:** Vue 3 (`<script setup>`) · Vite · Vue Router · Pinia
**Motion:** GSAP 3 + ScrollTrigger + Lenis smooth scroll
**Styling:** CSS Custom Properties (design tokens)
**3D (optional):** @splinetool/runtime (dynamic import, disposable)

## Panel

Single Vite server with route-based separation. Lazy-loaded, no state contamination between the two surfaces.

- **Eros (`/eros/*`)** — autonomous quality observability: score, queue, timeline, observer signals, debt breakdown, blueprint browser, run history, memory techniques, fonts, rules. Data via SSE live sync.
- **Workshop (`/workshop/*`)** — local ABM editor: token editor (color pickers, clamp sliders, palette overview), component editor with live preview, staging layer with diff viewer and selective apply.

Floating pill at top-right switches between panels. Keyboard: `1/2/3` for nav, `Ctrl+S` to review changes.

## Scripts

| Command | Purpose |
|---------|---------|
| `cd panel && npm run dev` | Start dual panel (syncs runs first) |
| `npm run build` (in panel or scaffold) | Production build |
| `node scripts/eros-state.mjs query --project "<path>"` | Read current brain state |
| `node .eros/scripts/eros-doctor.mjs` | Validate multi-AI architecture integrity |
| `cd scripts && npm run init:project -- --brief-file "<path>"` | Create a new project from template |
| `npm run bootstrap:brain -- --project "<path>"` | Bootstrap brain contract on existing project |
| `npm run select:blueprints -- --project "<path>"` | Rerun seed selection |
| `npm run refresh:quality -- --project "<path>"` | Refresh observer, critic, scorecard, debt |
| `npm run sync:runs` | Sync front-brain runs (`--watch` for live panel) |

## Design Philosophy

Every project must feel like it was designed by a senior creative director, not generated by AI. Read `EROS.md` for the excellence standard.

Quick summary:
- Rich near-blacks, warm whites — never pure `#000` / `#fff`
- Distinctive font pairings — never Inter, Roboto, Arial
- Custom easing — never default `ease`
- No two sections share grid structure
- Every section has a spatial surprise

The full **measurable enforcement criteria** (composition ratios, z-index counts, motion rules, craft requirements) live in `AGENTS.md` under "Quality Standards".

## Evolving Personality

After each project, Eros regenerates its `personality.json` — values, voice, and philosophy shift based on what worked. The Eros you use today is shaped by every prior project. Run `node eros-meta.mjs personality` after a project to update.

## Environment Variables

- `OPENAI_API_KEY` — enables multimodal critic mode
- `OPENAI_PROJECT_ID`, `OPENAI_ORGANIZATION_ID` — optional
- `OPENAI_QUALITY_MODEL` — defaults to `gpt-5-mini`

## Near-Term Objective

Eros is moving toward a Stitch-like workflow:

1. Prompt-only brief intake
2. `DESIGN.md` generation
3. Multiple visual directions
4. Seed selection with mutation budgets
5. Homepage generation
6. Observer-driven scorecard refresh and critic retries
7. Workshop-based token/component editing with staged apply
8. Final review summary with no mandatory human intervention

Execution details in `.eros/front-brain/ROADMAP.md`.

## Contributing

- Read `AGENTS.md` to understand the orchestrator contract
- Run `node .eros/scripts/eros-doctor.mjs` before every PR — must pass with zero issues
- Keep `AGENTS.md` AI-neutral (no tool-specific jargon — that belongs in adapter files)
- Follow the phased migration pattern: commit-safe, reversible, testable

## Canonical Docs

- [Repo status](./docs/STATUS.md)
- [Pipeline](./.eros/pipeline.md)
- [Brain config](./.eros/brain-config.md)
- [Front-Brain schema](./.eros/FRONT_BRAIN_SCHEMA.md)
- [Front-Brain workspace](./.eros/front-brain/README.md)
- [Front-Brain roadmap](./.eros/front-brain/ROADMAP.md)
- [Multi-AI architecture spec](./docs/superpowers/specs/2026-04-14-multi-ai-architecture-design.md)

## License

Released under the [MIT License](./LICENSE) © 2026 MateoGs013.
