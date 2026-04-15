# Eros Feed Workspace

This directory contains the implementation contract, fixtures, and structured examples for the Maqueta eros-feed.

## Purpose

- Translate `BRAIN_FRONTEND_LOGICO.md` into repo-native, executable artifacts.
- Give the internal panel a stable source of truth for runs, quality reports, visual debt, and design DNA.
- Keep `.claude` as the canonical namespace for Claude-first orchestration.

## Key files

- `../EROS_FEED_SCHEMA.md`: canonical implementation contract.
- `examples/demo-run/`: reference payload for panel development and schema validation.
- `runtime/`: generated cache consumed by the panel after syncing real projects.
- `../../scripts/pipeline/bootstrap-eros-feed.mjs`: canonical project bootstrapper for emitting hybrid artifacts from intake data.
- `../../scripts/pipeline/init-project.mjs`: end-to-end project initializer that copies scaffold, writes intake, and invokes the bootstrapper.
- `../../scripts/pipeline/select-blueprints.mjs`: automatic hero/nav selector that emits structured direction candidates.
- `../../scripts/quality/refresh-quality.mjs`: deterministic quality refresh that promotes observer artifacts into scorecard, critic, visual debt, and review outputs.

## Rules

- Fixtures must model the real project artifact structure.
- Structured state belongs in JSON.
- Narrative context, rationale, and approvals belong in Markdown.
- Runtime cache is generated, not edited manually.
