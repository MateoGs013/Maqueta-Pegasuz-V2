# panel/

Panel dev server, event feed, tokens, and watchdog.

## Scripts

| File | Purpose | Entry point |
|------|---------|-------------|
| [`server.mjs`](./server.mjs) | Panel dev server. | (CLI) `node panel/server.mjs` |
| [`feed.mjs`](./feed.mjs) | SSE event feed — append/read events for panel live updates. Importable by other scripts via `appendEvent`. | (CLI) `node panel/feed.mjs` |
| [`vite-watchdog.mjs`](./vite-watchdog.mjs) | Restarts Vite dev server on config churn. | (CLI) `node panel/vite-watchdog.mjs` |
| [`generate-tokens.js`](./generate-tokens.js) | Generates design tokens from input JSON. | `npm run tokens` |

All scripts import `../lib/utils.mjs` (or are standalone for `generate-tokens.js`).
