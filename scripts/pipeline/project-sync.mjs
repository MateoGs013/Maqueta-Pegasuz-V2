#!/usr/bin/env node
/**
 * eros-project-sync.mjs — Project archive sync across machines
 *
 * Uses a single GitHub repo (pegasuz-projects) with one branch per project.
 * Projects created on any machine can be pulled on any other.
 *
 * Subcommands:
 *   init    --project <path>              Initialize git in project, create branch, first commit + push
 *   commit  --project <path> [--message]  Commit current state with auto-message
 *   push    --project <path>              Push current branch to remote
 *   pull    --project <slug>              Clone a project branch to Desktop
 *   list                                  List all available projects in the archive
 *   status  --project <path>              Show sync status of a project
 *
 * Setup (run once):
 *   gh repo create pegasuz-projects --private --description "Eros project archive"
 *   — OR —
 *   Manually create the repo on GitHub and the script will detect it.
 */

import { execFile as execFileCb, spawn as spawnCb } from 'node:child_process'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { fileURLToPath } from 'node:url'
import { parseArgs, readJson, writeJson, ensureDir, exists, out, fail } from '../lib/utils.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const maquetaDir = path.resolve(__dirname, '..', '..')
const desktopDir = path.join(os.homedir(), 'Desktop')
const registryPath = path.join(maquetaDir, '.eros', 'memory', 'design-intelligence', 'project-registry.json')

const GITHUB_USER = 'MateoGs013'
const ARCHIVE_REPO = 'pegasuz-projects'
const REMOTE_URL = `https://github.com/${GITHUB_USER}/${ARCHIVE_REPO}.git`

const log = (msg) => process.stderr.write(`[sync] ${msg}\n`)

// ---------------------------------------------------------------------------
// Git helpers
// ---------------------------------------------------------------------------

const git = (args, cwd) => new Promise((resolve, reject) => {
  execFileCb('git', args, { cwd, timeout: 60000, maxBuffer: 5 * 1024 * 1024 }, (err, stdout, stderr) => {
    if (err) { reject(new Error(stderr?.trim() || err.message)); return }
    resolve(stdout.trim())
  })
})

const gitSafe = async (args, cwd) => {
  try { return await git(args, cwd) } catch { return null }
}

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

const loadRegistry = async () => {
  return (await readJson(registryPath)) || { projects: [] }
}

const saveRegistry = async (registry) => {
  await writeJson(registryPath, registry)
}

const updateRegistryEntry = async (slug, data) => {
  const registry = await loadRegistry()
  const idx = registry.projects.findIndex(p => p.slug === slug)
  const entry = {
    slug,
    ...data,
    updatedAt: new Date().toISOString(),
  }
  if (idx >= 0) {
    registry.projects[idx] = { ...registry.projects[idx], ...entry }
  } else {
    entry.createdAt = new Date().toISOString()
    registry.projects.push(entry)
  }
  await saveRegistry(registry)
  return entry
}

// ---------------------------------------------------------------------------
// Ensure archive repo exists
// ---------------------------------------------------------------------------

const ensureArchiveRepo = async () => {
  // Check if repo exists on GitHub
  try {
    await git(['ls-remote', REMOTE_URL], maquetaDir)
    return true
  } catch {
    log(`Archive repo not found. Creating ${GITHUB_USER}/${ARCHIVE_REPO}...`)
    try {
      await new Promise((resolve, reject) => {
        execFileCb('gh', [
          'repo', 'create', `${GITHUB_USER}/${ARCHIVE_REPO}`,
          '--private', '--description', 'Eros project archive — one branch per project',
        ], { timeout: 30000 }, (err, stdout) => {
          if (err) reject(err); else resolve(stdout)
        })
      })
      log('Archive repo created')
      return true
    } catch (err) {
      log(`Could not create repo: ${err.message}`)
      log(`Create it manually: gh repo create ${ARCHIVE_REPO} --private`)
      return false
    }
  }
}

// ---------------------------------------------------------------------------
// Default .gitignore for projects
// ---------------------------------------------------------------------------

const PROJECT_GITIGNORE = `node_modules/
dist/
.DS_Store
Thumbs.db
*.log
`

// ---------------------------------------------------------------------------
// Subcommand: init
// ---------------------------------------------------------------------------

const cmdInit = async (args) => {
  const projectDir = args.project
  if (!projectDir) fail('--project is required')

  const resolvedDir = path.resolve(projectDir)
  if (!(await exists(resolvedDir))) fail(`Project not found: ${resolvedDir}`)

  const slug = path.basename(resolvedDir)

  // Ensure archive repo exists
  if (!(await ensureArchiveRepo())) fail('Archive repo not available')

  // Check if already initialized
  const isGit = await exists(path.join(resolvedDir, '.git'))
  if (isGit) {
    log('Git already initialized, checking remote...')
    const remote = await gitSafe(['remote', 'get-url', 'origin'], resolvedDir)
    if (remote === REMOTE_URL) {
      log('Already connected to archive repo')
      out({ status: 'already-initialized', slug, remote })
      return
    }
    // Add our remote as 'archive' if origin is different
    await gitSafe(['remote', 'remove', 'archive'], resolvedDir)
    await git(['remote', 'add', 'archive', REMOTE_URL], resolvedDir)
    log(`Added 'archive' remote`)
  } else {
    // Initialize fresh
    await git(['init'], resolvedDir)
    await git(['remote', 'add', 'origin', REMOTE_URL], resolvedDir)
    log('Git initialized with archive remote')
  }

  // Write .gitignore if missing
  const gitignorePath = path.join(resolvedDir, '.gitignore')
  if (!(await exists(gitignorePath))) {
    await fs.writeFile(gitignorePath, PROJECT_GITIGNORE, 'utf8')
  }

  // Create orphan branch named after the project slug
  const remoteName = isGit ? 'archive' : 'origin'
  await git(['checkout', '--orphan', slug], resolvedDir)
  await git(['add', '-A'], resolvedDir)
  await git(['commit', '-m', `init: ${slug} project scaffold`], resolvedDir)

  // Push
  try {
    await git(['push', '-u', remoteName, slug], resolvedDir)
    log(`Pushed branch '${slug}' to archive`)
  } catch (err) {
    log(`Push failed (will retry on next push): ${err.message?.slice(0, 80)}`)
  }

  // Update registry
  const brainIdentity = await readJson(path.join(resolvedDir, '.brain', 'identity.json'))
  await updateRegistryEntry(slug, {
    name: brainIdentity?.name || slug,
    branch: slug,
    remote: REMOTE_URL,
    projectDir: resolvedDir,
    machine: os.hostname(),
  })

  log(`Project '${slug}' initialized and synced`)
  out({ status: 'initialized', slug, branch: slug, remote: REMOTE_URL })
}

// ---------------------------------------------------------------------------
// Subcommand: commit
// ---------------------------------------------------------------------------

const cmdCommit = async (args) => {
  const projectDir = path.resolve(args.project || '.')
  if (!(await exists(path.join(projectDir, '.git')))) fail('Not a git repo. Run sync init first.')

  const slug = path.basename(projectDir)
  const message = args.message || `checkpoint: ${slug} — ${new Date().toISOString().slice(0, 16)}`

  // Stage all changes
  await git(['add', '-A'], projectDir)

  // Check if there are changes to commit
  const status = await git(['status', '--porcelain'], projectDir)
  if (!status) {
    log('Nothing to commit')
    out({ status: 'clean', slug })
    return
  }

  const lines = status.split('\n').filter(l => l.trim())
  await git(['commit', '-m', message], projectDir)
  log(`Committed ${lines.length} changes: ${message}`)

  out({ status: 'committed', slug, changes: lines.length, message })
}

// ---------------------------------------------------------------------------
// Subcommand: push
// ---------------------------------------------------------------------------

const cmdPush = async (args) => {
  const projectDir = path.resolve(args.project || '.')
  if (!(await exists(path.join(projectDir, '.git')))) fail('Not a git repo. Run sync init first.')

  const slug = path.basename(projectDir)

  // Auto-commit if there are uncommitted changes
  const status = await git(['status', '--porcelain'], projectDir)
  if (status) {
    log('Uncommitted changes found, auto-committing...')
    await git(['add', '-A'], projectDir)
    await git(['commit', '-m', `auto: sync push — ${new Date().toISOString().slice(0, 16)}`], projectDir)
  }

  // Determine remote name
  const remotes = await git(['remote'], projectDir)
  const remoteName = remotes.includes('archive') ? 'archive' : 'origin'

  // Push
  const branch = await git(['branch', '--show-current'], projectDir)
  await git(['push', remoteName, branch], projectDir)
  log(`Pushed '${branch}' to ${remoteName}`)

  // Update registry
  await updateRegistryEntry(slug, {
    lastPush: new Date().toISOString(),
    machine: os.hostname(),
  })

  out({ status: 'pushed', slug, branch, remote: remoteName })
}

// ---------------------------------------------------------------------------
// Subcommand: pull
// ---------------------------------------------------------------------------

const cmdPull = async (args) => {
  const slug = args.project || args._?.[0]
  if (!slug) fail('--project <slug> is required')

  if (!(await ensureArchiveRepo())) fail('Archive repo not available')

  const targetDir = path.join(desktopDir, slug)

  if (await exists(targetDir)) {
    // Project exists — pull latest
    log(`Project exists at ${targetDir}, pulling latest...`)
    const remotes = await git(['remote'], targetDir)
    const remoteName = remotes.includes('archive') ? 'archive' : 'origin'
    try {
      await git(['pull', remoteName, slug], targetDir)
      log('Pulled latest changes')
      out({ status: 'updated', slug, dir: targetDir })
    } catch (err) {
      log(`Pull failed: ${err.message?.slice(0, 80)}`)
      out({ status: 'error', slug, error: err.message })
    }
    return
  }

  // Clone just the branch
  log(`Cloning '${slug}' to Desktop...`)
  await git([
    'clone', '--single-branch', '-b', slug, REMOTE_URL, targetDir,
  ], desktopDir)

  log(`Project '${slug}' cloned to ${targetDir}`)

  // Install deps
  const packageJson = path.join(targetDir, 'package.json')
  if (await exists(packageJson)) {
    log('Installing dependencies...')
    const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm'
    try {
      await new Promise((resolve, reject) => {
        execFileCb(npmCmd, ['install'], { cwd: targetDir, timeout: 120000 }, (err) => {
          if (err) reject(err); else resolve()
        })
      })
      log('Dependencies installed')
    } catch (err) {
      log(`npm install warning: ${err.message?.slice(0, 60)}`)
    }
  }

  // Update registry
  await updateRegistryEntry(slug, {
    lastPull: new Date().toISOString(),
    machine: os.hostname(),
    projectDir: targetDir,
  })

  out({ status: 'cloned', slug, dir: targetDir })
}

// ---------------------------------------------------------------------------
// Subcommand: list
// ---------------------------------------------------------------------------

const cmdList = async () => {
  if (!(await ensureArchiveRepo())) fail('Archive repo not available')

  // Get remote branches
  log('Fetching project list...')
  let branches = []
  try {
    const refs = await git(['ls-remote', '--heads', REMOTE_URL], maquetaDir)
    branches = refs.split('\n')
      .filter(l => l.trim())
      .map(l => {
        const parts = l.split('\t')
        return parts[1]?.replace('refs/heads/', '') || null
      })
      .filter(b => b && b !== 'main' && b !== 'master')
  } catch (err) {
    log(`Could not list branches: ${err.message?.slice(0, 60)}`)
  }

  // Merge with registry
  const registry = await loadRegistry()
  const projects = branches.map(branch => {
    const reg = registry.projects.find(p => p.slug === branch || p.branch === branch)
    const localDir = path.join(desktopDir, branch)
    return {
      slug: branch,
      name: reg?.name || branch,
      local: reg?.projectDir || localDir,
      lastPush: reg?.lastPush || null,
      machine: reg?.machine || null,
      createdAt: reg?.createdAt || null,
    }
  })

  // Check which exist locally
  for (const p of projects) {
    p.existsLocally = await exists(p.local)
  }

  log(`Found ${projects.length} projects`)

  out({
    total: projects.length,
    projects,
  })
}

// ---------------------------------------------------------------------------
// Subcommand: status
// ---------------------------------------------------------------------------

const cmdStatus = async (args) => {
  const projectDir = path.resolve(args.project || '.')
  if (!(await exists(path.join(projectDir, '.git')))) {
    out({ synced: false, reason: 'not a git repo' })
    return
  }

  const slug = path.basename(projectDir)
  const branch = await gitSafe(['branch', '--show-current'], projectDir)
  const status = await git(['status', '--porcelain'], projectDir)
  const lastCommit = await gitSafe(['log', '-1', '--format=%H %s', '--date=short'], projectDir)
  const remotes = await git(['remote', '-v'], projectDir)
  const hasArchive = remotes.includes(REMOTE_URL)

  out({
    synced: hasArchive,
    slug,
    branch,
    uncommittedChanges: status ? status.split('\n').filter(l => l.trim()).length : 0,
    lastCommit,
    remote: hasArchive ? REMOTE_URL : null,
  })
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const COMMANDS = {
  init: cmdInit,
  commit: cmdCommit,
  push: cmdPush,
  pull: cmdPull,
  list: cmdList,
  status: cmdStatus,
}

const main = async () => {
  const args = parseArgs(process.argv.slice(2))
  const command = args._command

  if (!command || !COMMANDS[command]) {
    fail(`Usage: eros-project-sync.mjs <${Object.keys(COMMANDS).join('|')}> [options]

Commands:
  init    --project <path>              Git init + branch + first commit + push
  commit  --project <path> [--message]  Commit milestone
  push    --project <path>              Push to archive
  pull    --project <slug>              Clone project to Desktop
  list                                  List all archived projects
  status  --project <path>              Check sync status`)
  }

  await COMMANDS[command](args)
}

main().catch(err => { log(`Fatal: ${err.message}`); process.exit(1) })
