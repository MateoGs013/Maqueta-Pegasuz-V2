#!/usr/bin/env node
// Compatibility shim. Real implementation is `state.mjs` (prefix dropped in the
// brain→eros-core rename); some callers (test harness, panel) still invoke
// `eros-state.mjs`. Re-exec it.
import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const target = path.join(path.dirname(fileURLToPath(import.meta.url)), 'state.mjs')
spawn(process.execPath, [target, ...process.argv.slice(2)], { stdio: 'inherit' })
  .on('exit', (code) => process.exit(code ?? 0))
