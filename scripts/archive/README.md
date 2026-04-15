# archive/

Deprecated scripts preserved for historical reference. Do not run.

## Files

| File | Retired | Reason |
|------|---------|--------|
| [`capture-refs.mjs`](./capture-refs.mjs) | 2026-04-14 (deprecation commit `5b7cdd2`) | V1 observer (3214 LOC). Superseded by the multi-pass architecture in `../observer/` (passes + scoring-engine). |
| [`eros-orchestrator.mjs`](./eros-orchestrator.mjs) | 2026-04-14 | 757 LOC, orphaned per V9 audit ("Loaded, no llamado"). Replaced functionally by `../brain/state.mjs`. Kept as reference if architecture ever returns to top-down orchestration. |
| [`eros-migrate-audits.mjs`](./eros-migrate-audits.mjs) | 2026-04-14 | 370 LOC, one-shot migration that already ran. Kept for historical reference (could be deleted entirely; archive is the safer first step). |

## Note on filenames

Archived scripts keep their original filenames (with `eros-` prefix) because recognizability of historical names outweighs consistency. Active scripts in category subdirs drop the prefix.

## Deletion policy

Files here can be deleted in a future release once the archive has been stable (no one has needed to reference them). Track deletions in git history.
