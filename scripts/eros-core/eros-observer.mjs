#!/usr/bin/env node
// Compatibility shim. Callers (train-reference, capture-refs deprecation note)
// reference `eros-observer.mjs` as the capture/observe tool. The active
// implementation with an identical CLI is `capture-refs.mjs`. Re-exec it so the
// promised "same CLI" name resolves. (A future Playwright rewrite can replace
// this target without touching callers.)
import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const target = path.join(path.dirname(fileURLToPath(import.meta.url)), 'capture-refs.mjs')
spawn(process.execPath, [target, ...process.argv.slice(2)], { stdio: 'inherit' })
  .on('exit', (code) => process.exit(code ?? 0))
