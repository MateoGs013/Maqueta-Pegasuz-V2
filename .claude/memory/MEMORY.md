# Memory -- Pegasuz Maqueta V2

## Quick Reference

| Field | Value |
|-------|-------|
| Version | 2.0 |
| Created | 2026-03-28 |
| Last updated | 2026-03-28 |
| Repo | https://github.com/MateoGs013/Maqueta-Pegasuz-V2 |
| Branch | master |
| Skills | 20 (in `.claude/skills/`) |
| Agents | 7 (in `.claude/agents/`) |
| Doc templates | 4 (in `docs/_templates/`) |
| Prompts | 24 across 8 phases (in `prompts/`) |
| Inspiration files | 21 across 4 categories (in `inspiration/`) |
| Guides | 9 (in `guides/`) |
| Scheduled tasks | 16 (in `.claude/scheduled-tasks/`) |

## What this is

**Master template** for creating unique web projects (Pegasuz multi-tenant clients or standalone Vue 3 sites). Every new project starts from this base but gets its own identity -- never copy design decisions between projects.

## Memory files index

| File | Purpose | When to read |
|------|---------|--------------|
| `MEMORY.md` (this file) | Project overview, task status, quick reference | Start of every session |
| `active-projects.md` | Registry of projects built from this maqueta | When starting/resuming a project |
| `lessons-learned.md` | Problems found and solutions applied | Before running any task to avoid repeating mistakes |

## Scheduled tasks status

### Fase 1 -- Audit and consistency (6 tasks)

| # | Task | Status | Key findings |
|---|------|--------|-------------|
| 1 | `cross-skill-consistency-check` | DONE (commit 9a1766e) | YAML frontmatter added to `new-project`, `page-scaffold` now references `docs/page-plans.md`, `gsap-motion` reads `docs/motion-spec.md` |
| 2 | `skill-optimization-audit` | DONE (commit 9a1766e) | Triggers, output format, and instructions improved across all skills |
| 3 | `scaffold-validation-test` | DONE (commit 9a1766e) | Vue 3 scaffold validated, package.json dependencies aligned |
| 4 | `agent-completeness-review` | DONE (commit 9a1766e) | All 7 agents genericized, `binding-auditor` improved |
| 5 | `doc-templates-stress-test` | DONE (commit 9a1766e) | Templates expanded: page-plans meets minimums, design-brief adds accent-secondary/border/transition tokens, content-brief hero changed to 2-8 words, motion-spec restructured with homepage subsection |
| 6 | `new-project-wizard-dry-run` | DONE (commit 9a1766e) | Wizard flow validated, font/palette generation working |

### Fase 2 -- Content improvements (6 tasks)

| # | Task | Status | Key findings |
|---|------|--------|-------------|
| 7 | `prompt-library-quality-review` | DONE (commit 9a1766e) | 20/23 prompts got errores comunes, 14/23 got concrete examples, 10/23 got rubro variations |
| 8 | `pegasuz-skills-deep-review` | DONE (commit 9a1766e) | 10 gaps found and fixed across 5 skills (pipeline, extraction, tenant, normalization, QA) |
| 9 | `guides-completeness-rewrite` | DONE (commit 9a1766e) | Guides rewritten as self-contained tutorials, `skill-dispatch-table.md` updated with `new-project` entry |
| 10 | `claude-md-optimization` | DONE (commit 9a1766e) | CLAUDE.md contradictions fixed (threejs step, motion defaults, extraction table) |
| 11 | `memory-system-improvement` | DONE (commit e3323a4) | MEMORY.md, active-projects, lessons-learned all improved |
| 12 | `inspiration-catalog-expansion` | DONE (commit e3323a4) | Added fintech, gastronomy rubros + trends-2026.md, expanded all categories |

### Fase 3 -- New features (2 tasks)

| # | Task | Status | Notes |
|---|------|--------|-------|
| 13 | `create-project-review-skill` | DONE (commit 158067f) | `.claude/skills/project-review/SKILL.md` created with health score system |
| 14 | `design-system-research` | DONE (commit 158067f) | `docs/_templates/design-system-base.template.md` created with color scales, component patterns, animation tokens |

### Fase 4 -- Demo sites (1 task)

| # | Task | Status | Notes |
|---|------|--------|-------|
| 15 | `create-10-demo-sites` | DONE (commit 3c5d6f4) | 10 unique Vue 3 projects created on Desktop, each with 4 docs, 5-6 views, 4-7 components, 3D, git |

### Fase 5 -- Critique (1 task)

| # | Task | Status | Notes |
|---|------|--------|-------|
| 16 | `awwwards-design-critique` | IN PROGRESS | Critique agents running, applying improvements to all 10 sites |

## Git history

| Commit | Phase | Description |
|--------|-------|-------------|
| 9a1766e | Fase 1 | Audit and consistency pass: skills, agents, scaffold, templates |
| 158067f | Fase 3 | project-review skill + design-system-base template |
| e3323a4 | Fase 2 | Content improvements: prompts, guides, Pegasuz skills, memory, inspiration |
| 5bdbf2d | Fase 2+ | Additional guide, prompt, inspiration improvements |
| c99846c | Fase 2 final | Remaining prompt and inspiration improvements |
| 3c5d6f4 | Fase 4 | 10 demo sites created + final prompt/guide improvements |
- `CLAUDE.md`, `PROCESS-LOG.md`
- `docs/_templates/` (all 4 templates)
- `guides/skill-dispatch-table.md`
- `inspiration/` (new: fintech, gastronomy, trends-2026)
- `prompts/07-quality/audit-sequence.md`

Plus untracked: `active-projects.md`, `lessons-learned.md`, `guides/06-troubleshooting.md`

## Key files for any session

| Need | File |
|------|------|
| Architecture rules | `CLAUDE.md` |
| Which skill to use | `guides/skill-dispatch-table.md` |
| How to start a project | `guides/00-project-init.md` or use `/new-project` |
| Pipeline overview | `guides/01-pipeline-overview.md` |
| Quality standards | `guides/04-quality-standards.md` |
| Design brief template | `docs/_templates/design-brief.template.md` |
| Content brief template | `docs/_templates/content-brief.template.md` |
| Page plans template | `docs/_templates/page-plans.template.md` |
| Motion spec template | `docs/_templates/motion-spec.template.md` |

## Core rules (never violate)

1. **Design-first**: brief before code. No `creative-design` plan = no CSS.
2. **Content-first**: copy before visual. `content-brief.md` is created first.
3. **Unique identity**: every project has its own palette, typography, easing, atmosphere.
4. **3D always**: Tier 1 minimum (atmospheric shader or particle field).
5. **Animation variety**: each section uses a different technique.
6. **Pegasuz chain**: View -> Store -> Service -> API. No shortcuts.
7. **prefers-reduced-motion**: always respected.
8. **Docs are truth**: code executes the docs, never improvises.

## Structure

```
maqueta/
  .claude/
    agents/              7 specialized agents
    skills/              20 construction + wizard skills
    scheduled-tasks/     16 batch execution tasks
    memory/              MEMORY.md + active-projects.md + lessons-learned.md
    settings.json        Hooks and configuration
  docs/_templates/       4 templates: design-brief, content-brief, page-plans, motion-spec
  prompts/               24 prompts in 8 phases: 00-discovery -> 07-quality
  inspiration/           21 files: sites(8) + patterns(6) + motion(4) + 3d(3)
  guides/                9 guides + dispatch table
  _project-scaffold/     Vue 3 base structure (copy to new project)
  CLAUDE.md              Architecture locked + skill dispatch
  PROCESS-LOG.md         Detailed audit history and decisions
```
