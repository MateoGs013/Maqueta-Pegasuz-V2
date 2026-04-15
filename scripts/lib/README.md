# lib/

Shared helpers imported by most scripts. No entry points — library only.

## Files

| File | Exports |
|------|---------|
| [`utils.mjs`](./utils.mjs) | `parseArgs`, `exists`, `ensureDir`, `readJson`, `writeJson`, `readText`, `writeText`, `out`, `fail`, `today`, `appendEvent` (and more). Canonical home for cross-script helpers. |

## Import patterns

From a category subdir (one level deep):

```js
import { parseArgs, readJson, fail } from '../lib/utils.mjs';
```

## When to add a new utility

Only when 3+ scripts would import it. Don't eagerly move single-use helpers here.
