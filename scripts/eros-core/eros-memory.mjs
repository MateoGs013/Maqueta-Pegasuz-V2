#!/usr/bin/env node
// Compatibility shim. `context.mjs`, `gate.mjs` and the orchestrator call
// `eros-memory.mjs` (expected to live in eros-core), but the implementation is
// at ../memory/memory.mjs. Re-exec it so memory insights/threshold/hooks resolve
// instead of silently falling back to "no memory data".
import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const target = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'memory', 'memory.mjs')
spawn(process.execPath, [target, ...process.argv.slice(2)], { stdio: 'inherit' })
  .on('exit', (code) => process.exit(code ?? 0))
