# Active Plans

Implementation plans that are currently in progress or pending execution. Each file is a standalone plan with its own status, success criteria, and task breakdown.

## Status table

| Plan | Status | Last reviewed |
|------|--------|---------------|
| [hardening-audit](./hardening-audit.md) | in-progress | 2026-04-14 |
| [observer-v2](./observer-v2.md) | in-progress | 2026-04-14 |
| [observer-v3](./observer-v3.md) | active · not yet implemented | 2026-04-14 |
| [vercel-deploy](./vercel-deploy.md) | in-progress | 2026-04-14 |
| [2026-04-14-docs-restructure](./2026-04-14-docs-restructure.md) | in-progress · this migration | 2026-04-14 |

## Completed plans

Once a plan is marked `implemented`, move it to [`../archive/plans/`](../archive/plans/). The status table above only reflects active work.

## Plan authoring

New plans follow the superpowers convention:
- One Markdown file per feature
- Status header (`Status: in-progress | implemented | deprecated`) + `Last reviewed` date
- Tasks decomposed to bite-sized TDD steps
- Date-prefix (`YYYY-MM-DD-`) only when the topic is time-scoped (e.g., migrations); topical plans use a plain slug.

## History

| Date | Event |
|------|-------|
| 2026-04-10 | Full verification sweep: 3 Explore agents in parallel validated every plan against code. Corrected inflated completion percentages. Added RULE-015 to RULE-018 to anti-AI V2 ruleset. Audit of 18 design-intelligence files raised signal-to-noise from 35% to 90%. |
| 2026-04-14 | Multi-AI architecture migration (PR #6) — EROS.md + AGENTS.md + .eros/ canonical split. |
| 2026-04-14 | Docs restructure migration (this plan) — status-as-directory, READMEs everywhere, PLANS-STATUS.md deleted in favor of per-plan headers + this table. |

For per-plan execution detail, read each plan file directly — every plan carries its own `Status:` header and inline progress notes.
