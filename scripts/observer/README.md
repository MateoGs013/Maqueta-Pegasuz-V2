# observer/

Vision — observer passes, change detection, linting, and perceptual helpers.

## Multi-pass observer

| File | Purpose |
|------|---------|
| [`config.json`](./config.json) | Observer pass configuration |
| [`pass-structural.mjs`](./pass-structural.mjs) | Structural pass — DOM/layout analysis |
| [`pass-intelligence.mjs`](./pass-intelligence.mjs) | Intelligence pass — high-level quality heuristics |
| [`pass-judgment.mjs`](./pass-judgment.mjs) | Judgment pass — final scoring call |
| [`pass-perceptual.mjs`](./pass-perceptual.mjs) | Perceptual pass — visual properties |
| [`scoring-engine.mjs`](./scoring-engine.mjs) | Shared scoring primitives used by the passes |

## Entry points + helpers

| File | Purpose | Entry point |
|------|---------|-------------|
| [`observer.mjs`](./observer.mjs) | Main observer runner (V2). | `npm run observe` |
| [`observer-v3.mjs`](./observer-v3.mjs) | V3 observer — eros ve, siente, y juzga. | (CLI) `node observer/observer-v3.mjs` |
| [`detect-changes.mjs`](./detect-changes.mjs) | Detect visual changes between runs. | `npm run eros:detect` |
| [`lint-ux.mjs`](./lint-ux.mjs) | UX lint rules. | (CLI) `node observer/lint-ux.mjs` |
| [`saliency.py`](./saliency.py) | Python helper — saliency map generation. | (CLI) `python observer/saliency.py` |
| [`aesthetic.py`](./aesthetic.py) | Python helper — aesthetic scoring. | (CLI) `python observer/aesthetic.py` |

## Legacy

The previous V1 observer (`capture-refs.mjs`, 3214 LOC) was superseded by this multi-pass architecture. It lives in `../archive/` for reference.
