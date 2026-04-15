# quality/

Quality gate — audit, critic, and scorecard refresh.

## Scripts

| File | Purpose | Entry point |
|------|---------|-------------|
| [`audit.mjs`](./audit.mjs) | Audit runner — produces audit reports for a project. | (CLI) `node quality/audit.mjs` |
| [`multimodal-critic.mjs`](./multimodal-critic.mjs) | Multimodal critic — vision-model-based critique. Requires `OPENAI_API_KEY`. | (CLI) `node quality/multimodal-critic.mjs` |
| [`refresh-quality.mjs`](./refresh-quality.mjs) | Deterministic scorecard refresh — promotes observer artifacts into scorecard, critic, visual debt, and review outputs. | `npm run refresh:quality` |

All scripts import `../lib/utils.mjs`.
