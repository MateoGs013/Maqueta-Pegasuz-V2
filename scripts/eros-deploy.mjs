#!/usr/bin/env node
/**
 * eros-deploy.mjs — Deploy a built project to Vercel preview.
 *
 * Usage:
 *   node eros-deploy.mjs deploy --project /path/to/project [--no-prod]
 *   node eros-deploy.mjs list
 *   node eros-deploy.mjs remove --project <slug>
 *
 * Requires: Vercel CLI (npm i -g vercel) + `vercel login` once per machine.
 *
 * The deploy registry lives at
 *   .eros/memory/design-intelligence/deploy-registry.json
 * so the panel and other tools can look up preview URLs without re-running
 * `vercel ls` (which is slow and rate-limited).
 */

import { execFile } from 'node:child_process'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs, out, fail, readJson, writeJson } from './lib/utils.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const maquetaDir = path.resolve(__dirname, '..')
const registryPath = path.join(
  maquetaDir,
  '.eros',
  'memory',
  'design-intelligence',
  'deploy-registry.json',
)

// ─── Executable resolution (same pattern as eros-auto-train.mjs) ──────────
const isWindows = process.platform === 'win32'
const nodeBinDir = path.dirname(process.execPath)
const homeDir = process.env.USERPROFILE || process.env.HOME || ''
const findFirst = (candidates) => candidates.find((c) => c && existsSync(c)) || null

const NPX_CLI = findFirst([
  path.join(nodeBinDir, 'node_modules', 'npm', 'bin', 'npx-cli.js'),
])

// Vercel CLI locations. On Windows it's typically a .cmd wrapper in the
// user npm global bin; on Unix it's a plain script in .local/bin.
const VERCEL_CMD = isWindows
  ? findFirst([
      path.join(homeDir, 'AppData', 'Roaming', 'npm', 'vercel.cmd'),
      path.join(nodeBinDir, 'vercel.cmd'),
      'vercel',
    ])
  : findFirst([
      path.join(homeDir, '.local', 'bin', 'vercel'),
      path.join(nodeBinDir, 'vercel'),
      '/usr/local/bin/vercel',
      'vercel',
    ])

const log = (msg) => process.stderr.write(`[eros-deploy] ${msg}\n`)

// ─── Process spawn helper ──────────────────────────────────────────────────
// On Windows, .cmd files must run through cmd.exe /c because Node can't
// spawn them directly without shell:true. We bypass shell to avoid PATH
// parsing issues with spaces in "Program Files".
const runCmd = (cmd, args, opts = {}) =>
  new Promise((resolve, reject) => {
    let finalCmd = cmd
    let finalArgs = args
    if (isWindows && /\.cmd$|\.bat$/i.test(cmd)) {
      finalCmd = 'C:\\Windows\\System32\\cmd.exe'
      finalArgs = ['/c', cmd, ...args]
    }
    execFile(
      finalCmd,
      finalArgs,
      {
        encoding: 'utf8',
        maxBuffer: 10 * 1024 * 1024,
        ...opts,
      },
      (err, stdout, stderr) => {
        if (err) {
          const combined = (stderr || '').trim() || (stdout || '').trim() || err.message
          reject(new Error(combined))
          return
        }
        resolve(stdout || '')
      },
    )
  })

// ─── Commands ──────────────────────────────────────────────────────────────

const cmdDeploy = async (args) => {
  const projectDir = args.project ? path.resolve(args.project) : null
  if (!projectDir) fail('--project <path> required')
  if (!existsSync(projectDir)) fail(`Project directory not found: ${projectDir}`)
  if (!existsSync(path.join(projectDir, 'package.json'))) {
    fail(`Not a Node project (missing package.json): ${projectDir}`)
  }

  const slug = path.basename(projectDir)
  const prod = args['no-prod'] !== true

  log(`Deploying ${slug}`)
  log(`  from: ${projectDir}`)
  log(`  prod: ${prod}`)

  // Step 1: Build via npx vite build (unless a dist/ already exists and --skip-build)
  if (!args['skip-build']) {
    if (!NPX_CLI) fail('npx-cli.js not found in node_modules')
    log('Building (vite build)...')
    try {
      await runCmd(process.execPath, [NPX_CLI, 'vite', 'build'], {
        cwd: projectDir,
        timeout: 300000,
      })
    } catch (err) {
      fail(`Build failed: ${err.message.slice(0, 400)}`)
    }
    log('Build complete')
  }

  if (!existsSync(path.join(projectDir, 'dist'))) {
    fail('No dist/ directory after build — nothing to deploy')
  }

  // Step 2: Deploy via vercel CLI
  if (!VERCEL_CMD) {
    fail('Vercel CLI not found. Install with: npm i -g vercel && vercel login')
  }
  log(`Deploying via ${VERCEL_CMD}...`)

  let stdout
  try {
    const deployArgs = ['deploy', '--yes']
    if (prod) deployArgs.push('--prod')
    stdout = await runCmd(VERCEL_CMD, deployArgs, {
      cwd: projectDir,
      timeout: 300000,
    })
  } catch (err) {
    fail(`Vercel deploy failed: ${err.message.slice(0, 500)}`)
  }

  // Step 3: Extract the URL from stdout.
  // Vercel prints the URL as the last non-empty line by default.
  const lines = stdout.split('\n').map((l) => l.trim()).filter(Boolean)
  const url = lines.reverse().find((l) => l.startsWith('http'))
  if (!url) {
    fail(`Could not extract deployment URL. Last lines: ${lines.slice(-5).join(' | ').slice(0, 300)}`)
  }

  log(`Deployed: ${url}`)

  // Step 4: Update registry
  const registry = (await readJson(registryPath)) || { deploys: {}, updatedAt: null }
  registry.deploys[slug] = {
    slug,
    url,
    projectDir,
    prod,
    deployedAt: new Date().toISOString(),
  }
  registry.updatedAt = new Date().toISOString()
  await writeJson(registryPath, registry)

  out({ ok: true, slug, url, prod, registry: registryPath })
}

const cmdList = async () => {
  const registry = (await readJson(registryPath)) || { deploys: {} }
  const deploys = Object.values(registry.deploys || {}).sort((a, b) =>
    (b.deployedAt || '').localeCompare(a.deployedAt || ''),
  )
  out({ count: deploys.length, deploys })
}

const cmdRemove = async (args) => {
  const slug = args.project
  if (!slug) fail('--project <slug> required')

  const registry = (await readJson(registryPath)) || { deploys: {} }
  const entry = registry.deploys?.[slug]
  if (!entry) fail(`Deploy not found in registry: ${slug}`)

  if (!VERCEL_CMD) fail('Vercel CLI not found')

  log(`Removing ${slug} from Vercel...`)
  try {
    await runCmd(VERCEL_CMD, ['rm', '--yes', slug], {
      cwd: entry.projectDir || maquetaDir,
      timeout: 60000,
    })
    log('Removed')
  } catch (err) {
    log(`Vercel rm warning: ${err.message.slice(0, 200)}`)
    // Continue — update registry anyway so we don't get stuck on a stale entry
  }

  delete registry.deploys[slug]
  registry.updatedAt = new Date().toISOString()
  await writeJson(registryPath, registry)

  out({ ok: true, slug, removed: true })
}

// ─── Main ──────────────────────────────────────────────────────────────────

const main = async () => {
  const args = parseArgs(process.argv.slice(2))
  const sub = args._command

  if (sub === 'deploy') await cmdDeploy(args)
  else if (sub === 'list') await cmdList()
  else if (sub === 'remove') await cmdRemove(args)
  else {
    process.stderr.write(`eros-deploy.mjs — Vercel preview deploys

Usage:
  node eros-deploy.mjs deploy --project <path> [--no-prod] [--skip-build]
  node eros-deploy.mjs list
  node eros-deploy.mjs remove --project <slug>

Requires: npm i -g vercel && vercel login (once per machine)
`)
    process.exit(1)
  }
}

main().catch((err) => {
  log(`Fatal: ${err.message}`)
  process.exit(1)
})
