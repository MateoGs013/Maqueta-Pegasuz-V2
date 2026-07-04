#!/usr/bin/env node
// Compatibility shim. Real implementation is `gate.mjs` (prefix dropped in the
// brain→eros-core rename); callers still invoke `eros-gate.mjs`. Re-exec it.
import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const target = path.join(path.dirname(fileURLToPath(import.meta.url)), 'gate.mjs')
spawn(process.execPath, [target, ...process.argv.slice(2)], { stdio: 'inherit' })
  .on('exit', (code) => process.exit(code ?? 0))
