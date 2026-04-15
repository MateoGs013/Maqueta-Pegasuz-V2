# dev/

Developer workflows, tests, deploys, and integration scripts.

## Scripts

| File | Purpose | Entry point |
|------|---------|-------------|
| [`chat.mjs`](./chat.mjs) | Chat CLI — talk to the running brain. | (CLI) `node dev/chat.mjs` |
| [`pucho.mjs`](./pucho.mjs) | Notification pulse (Telegram/Discord, "pucho" of life). Importable by other scripts via `lightPucho`, `finishPucho`, `smokePucho`. | (CLI) `node dev/pucho.mjs` |
| [`discover.mjs`](./discover.mjs) | Discovery — finds projects in the workspace. | (CLI) `node dev/discover.mjs` |
| [`test-e2e.mjs`](./test-e2e.mjs) | End-to-end test for the autonomous loop. | `npm run eros:test` |
| [`mood.mjs`](./mood.mjs) | Mood setter — writes mood state. | (CLI) `node dev/mood.mjs` |
| [`log.mjs`](./log.mjs) | Log inspection helper. | `npm run eros:log` |
| [`deploy.mjs`](./deploy.mjs) | Vercel deploy runner. | (CLI) `node dev/deploy.mjs` |
| [`auto-practice.sh`](./auto-practice.sh) | Shell wrapper for continuous practice loops. | `bash dev/auto-practice.sh` |
| [`start-workspace.sh`](./start-workspace.sh) | Workspace bootstrap — starts panel + dev environment. | `cd panel && npm run workspace` |
