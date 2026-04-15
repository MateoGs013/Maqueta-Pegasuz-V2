# pipeline/

Project initialization, bootstrap, and synchronization.

## Scripts

| File | Purpose | Entry point |
|------|---------|-------------|
| [`init-project.mjs`](./init-project.mjs) | End-to-end project initializer — copies scaffold, writes intake, invokes bootstrapper. | `npm run init:project` |
| [`bootstrap-eros-feed.mjs`](./bootstrap-eros-feed.mjs) | Canonical project bootstrapper — emits hybrid artifacts from intake data. | `npm run bootstrap:feed` |
| [`select-blueprints.mjs`](./select-blueprints.mjs) | Automatic hero/nav selector — emits structured direction candidates. | `npm run select:blueprints` |
| [`project-sync.mjs`](./project-sync.mjs) | Project sync — keeps project state aligned with brain. | (CLI) `node pipeline/project-sync.mjs` |
| [`sync-eros-feed-runs.mjs`](./sync-eros-feed-runs.mjs) | Syncs eros-feed runs for panel consumption. Also invoked by `panel/package.json`. | `npm run sync:feed` |

All scripts import `../lib/utils.mjs`.
