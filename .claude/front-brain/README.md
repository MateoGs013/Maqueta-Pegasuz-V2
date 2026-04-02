# Front-Brain Workspace

This directory contains the implementation contract, fixtures, and structured examples for the Maqueta front-brain.

## Purpose

- Translate `BRAIN_FRONTEND_LOGICO.md` into repo-native, executable artifacts.
- Give the internal panel a stable source of truth for runs, quality reports, visual debt, and design DNA.
- Keep `.claude` as the canonical namespace for Claude-first orchestration.

## Key files

- `../FRONT_BRAIN_SCHEMA.md`: canonical implementation contract.
- `examples/demo-run/`: reference payload for panel development and schema validation.
- `runtime/`: generated cache consumed by the panel after syncing real projects.
- `../../scripts/bootstrap-front-brain.mjs`: canonical project bootstrapper for emitting hybrid artifacts from intake data.

## Rules

- Fixtures must model the real project artifact structure.
- Structured state belongs in JSON.
- Narrative context, rationale, and approvals belong in Markdown.
- Runtime cache is generated, not edited manually.
