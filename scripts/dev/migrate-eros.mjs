#!/usr/bin/env node
/**
 * migrate-eros.mjs — one-shot migration of .brain/ → .eros/ for every
 * project under the user's Desktop.
 *
 * Usage:
 *   node scripts/dev/migrate-eros.mjs --dry-run      # preview (default)
 *   node scripts/dev/migrate-eros.mjs --execute      # rename for real
 *
 * Idempotent: if .eros/ already exists and .brain/ doesn't, project is skipped.
 * Conflict: if both exist, project is reported as a conflict and skipped.
 *
 * Excluded directories: 'maqueta', 'Eros' (the template repo itself).
 */
import { promises as fs } from 'node:fs'
import path from 'node:path'
import os from 'node:os'

const args = new Set(process.argv.slice(2))
const dryRun = !args.has('--execute')

const desktopDir = path.join(os.homedir(), 'Desktop')

let entries
try {
  entries = await fs.readdir(desktopDir, { withFileTypes: true })
} catch (err) {
  console.error(`Cannot read Desktop: ${err.message}`)
  process.exit(1)
}

const results = { mode: dryRun ? 'dry-run' : 'execute', migrated: [], skipped: [], conflicts: [], errors: [] }

for (const e of entries) {
  if (!e.isDirectory()) continue
  if (e.name === 'maqueta' || e.name === 'Eros') continue

  const projectDir = path.join(desktopDir, e.name)
  const brainDir = path.join(projectDir, '.brain')
  const erosDir = path.join(projectDir, '.eros')

  let hasBrain = false
  let hasEros = false
  try { await fs.access(brainDir); hasBrain = true } catch {}
  try { await fs.access(erosDir); hasEros = true } catch {}

  if (!hasBrain && !hasEros) continue

  if (hasBrain && hasEros) {
    results.conflicts.push(e.name)
    continue
  }

  if (!hasBrain && hasEros) {
    results.skipped.push(e.name)
    continue
  }

  // hasBrain && !hasEros — needs migration
  if (dryRun) {
    results.migrated.push(`${e.name} (would rename .brain → .eros)`)
  } else {
    try {
      await fs.rename(brainDir, erosDir)
      results.migrated.push(e.name)
    } catch (err) {
      results.errors.push(`${e.name}: ${err.message}`)
    }
  }
}

console.log(JSON.stringify(results, null, 2))

if (results.conflicts.length > 0) {
  console.error('\nWARNING: conflicts detected — projects with BOTH .brain/ and .eros/ exist.')
  console.error('Inspect manually, remove the stale one, then re-run.')
}

process.exit(results.errors.length > 0 ? 1 : 0)
