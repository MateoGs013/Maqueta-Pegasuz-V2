# brain/

Orchestration core — scripts that drive the autonomous next/done loop and gate decisions.

## Scripts

| File | Purpose | Entry point |
|------|---------|-------------|
| [`state.mjs`](./state.mjs) | Single authority for all state transitions. Subcommands: `query`, `start`, `advance`, `retry`, `flag`, `init-sections`, `check-gate`, `next`, `done`. | `npm run eros:state` |
| [`context.mjs`](./context.mjs) | Builds context files for agent spawns (design-brief, motion, S-{Name}). | `npm run eros:context` |
| [`gate.mjs`](./gate.mjs) | Gate checker — validates expected outputs before advancing state. | `npm run eros:gate` |

## Dependencies

All three scripts import `../lib/utils.mjs` for shared helpers.

`state.mjs` is the ground truth; `context.mjs` and `gate.mjs` are invoked by it via file-based contracts (not direct imports).
