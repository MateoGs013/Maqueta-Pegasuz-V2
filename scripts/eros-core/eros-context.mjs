#!/usr/bin/env node
// Compatibility shim. The brain→eros-core rename dropped the `eros-` prefix from
// the implementation file (now `context.mjs`), but the orchestrator and other
// callers still invoke `eros-context.mjs`. Re-exec the real script, passing args
// and inheriting stdio so callers that parse stdout (orchestrator) keep working.
import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const target = path.join(path.dirname(fileURLToPath(import.meta.url)), 'context.mjs')
spawn(process.execPath, [target, ...process.argv.slice(2)], { stdio: 'inherit' })
  .on('exit', (code) => process.exit(code ?? 0))
