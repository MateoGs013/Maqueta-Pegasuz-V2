# memory/

Long-term learning — scripts that read from and write to `.eros/memory/design-intelligence/`.

## Scripts

| File | Purpose | Entry point |
|------|---------|-------------|
| [`memory.mjs`](./memory.mjs) | Core memory read/write — rules, techniques, signatures, patterns. | `npm run eros:memory` |
| [`meta.mjs`](./meta.mjs) | Meta-analysis: `gaps`, `reflect`, `personality`, `diary`. | (CLI) `node memory/meta.mjs` |
| [`train.mjs`](./train.mjs) | Training orchestration — single training run from brief. | `npm run eros:train` |
| [`train-reference.mjs`](./train-reference.mjs) | Reference training — ingest external references as memory. | `npm run eros:ref` |
| [`practice.mjs`](./practice.mjs) | Practice generator — targets weak spots from gaps. | (CLI) `node memory/practice.mjs` |
| [`auto-train.mjs`](./auto-train.mjs) | Autonomous training loop — runs practice sessions end-to-end. | (CLI) `node memory/auto-train.mjs` |

## Cross-dir imports

- `auto-train.mjs` imports `../panel/feed.mjs` (appends events) + `../dev/pucho.mjs` (notification pulse)
- `meta.mjs` imports `../dev/pucho.mjs`
- All import `../lib/utils.mjs`
