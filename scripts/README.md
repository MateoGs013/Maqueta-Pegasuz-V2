# Eros — Scripts

AI entry point for `scripts/`. Domain-organized Node helpers that power the autonomous brain, memory, observer, quality pipeline, and developer workflows.

## Category map

| Subdir | What lives here | When to use |
|--------|----------------|-------------|
| [`brain/`](./brain/) | Orchestration core — state, context, gate | The autonomous loop: what to do next, gate checks, task advancement |
| [`memory/`](./memory/) | Learning — memory, meta, train, practice, auto-train | Everything that writes to `.eros/memory/design-intelligence/` |
| [`observer/`](./observer/) | Vision — observer passes, detection, lint, saliency/aesthetic | Scoring a project, detecting visual changes, perceptual analysis |
| [`quality/`](./quality/) | Audit, critic, scorecard refresh | Quality gate, multimodal critique, refresh-quality runs |
| [`pipeline/`](./pipeline/) | Project init, bootstrap, sync | Creating new projects, syncing front-brain runs, blueprint selection |
| [`panel/`](./panel/) | Panel dev server, feed, tokens, watchdog | Running the panel, generating tokens, vite dev-server watchdog |
| [`dev/`](./dev/) | Developer workflows + integrations | chat, test-e2e, deploy, mood, log, workspace start |
| [`lib/`](./lib/) | Shared helpers imported by many scripts | `import` from `./lib/utils.mjs` for `parseArgs`, `readJson`, `fail`, etc. |
| [`archive/`](./archive/) | Deprecated scripts preserved for reference | Don't run — see archive/README.md for why each was retired |
| [`examples/`](./examples/) | Example input files (e.g., project briefs) | Reference when authoring new briefs or configs |

## Running scripts

Via npm aliases (see `package.json`):

```bash
cd scripts
npm run eros:state -- query --project <path>
npm run observe
```

Direct:

```bash
cd scripts && node brain/state.mjs --project <path>
```

## Conventions

- Every category subdir has a `README.md` enumerating its scripts with a one-line purpose.
- Shared helpers live in `lib/`. Do not add utilities to category dirs.
- The `eros-` prefix is dropped inside subdirs (directory already encodes ownership). Archive keeps original filenames for historical recognizability.
- Scripts invoke each other via relative imports (`../lib/utils.mjs`). Never use absolute paths.

## Validation

`node .eros/scripts/eros-doctor.mjs` enforces:
- `scripts/README.md` exists (rule 11)
- No `eros-*.mjs` files at `scripts/` root (rule 12)
- Every category subdir + `lib/` + `archive/` has a `README.md` (rule 13)
