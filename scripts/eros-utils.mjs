/**
 * eros-utils.mjs — Shared utilities for the Eros brain scripts.
 *
 * Canonical implementations of file I/O, argument parsing, and output helpers.
 * All eros-* scripts import from here instead of defining their own copies.
 */

import { promises as fs } from 'node:fs'
import path from 'node:path'

// ---------------------------------------------------------------------------
// Arg parser
// ---------------------------------------------------------------------------

/**
 * Parse `--key value` arguments from an argv array.
 * The first positional arg (no `--` prefix) is stored as `_command`.
 * All remaining positional args are collected in the `_` array.
 */
export const parseArgs = (argv) => {
  const args = { _: [] }

  for (let i = 0; i < argv.length; i++) {
    const token = argv[i]

    if (!token.startsWith('--')) {
      if (!args._command) {
        args._command = token
      } else {
        args._.push(token)
      }
      continue
    }

    const key = token.slice(2)
    const next = argv[i + 1]

    if (!next || next.startsWith('--')) {
      args[key] = true
      continue
    }

    args[key] = next
    i += 1
  }

  return args
}

// ---------------------------------------------------------------------------
// File helpers
// ---------------------------------------------------------------------------

/** mkdir -p */
export const ensureDir = async (dirPath) => {
  await fs.mkdir(dirPath, { recursive: true })
}

/** Check if a path exists. */
export const exists = async (filePath) => {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

/** Read + parse JSON file. Returns `null` on any error. */
export const readJson = async (filePath) => {
  try {
    return JSON.parse(await fs.readFile(filePath, 'utf8'))
  } catch {
    return null
  }
}

/** Read a file as UTF-8 text. Returns `null` on any error. */
export const readText = async (filePath) => {
  try {
    return await fs.readFile(filePath, 'utf8')
  } catch {
    return null
  }
}

/** ensureDir + write JSON with 2-space indent + trailing newline. */
export const writeJson = async (filePath, data) => {
  await ensureDir(path.dirname(filePath))
  await fs.writeFile(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8')
}

/** ensureDir + write text (trimmed) + trailing newline. */
export const writeText = async (filePath, content) => {
  await ensureDir(path.dirname(filePath))
  await fs.writeFile(filePath, content.trimEnd() + '\n', 'utf8')
}

// ---------------------------------------------------------------------------
// Output helpers
// ---------------------------------------------------------------------------

/** Write a JSON object to stdout. */
export const out = (obj) => {
  process.stdout.write(JSON.stringify(obj, null, 2) + '\n')
}

/** Write an error message to stderr and exit with code 1. */
export const fail = (msg) => {
  process.stderr.write(`Error: ${msg}\n`)
  process.exit(1)
}

// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------

/** Return today's date as a YYYY-MM-DD string. */
export const today = () => new Date().toISOString().slice(0, 10)
