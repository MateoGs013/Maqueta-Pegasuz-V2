import { promises as fs } from 'node:fs'
import { spawn, execFile } from 'node:child_process'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  bootstrapProject,
  normalizeBrief,
  parseArgs,
  readJson,
} from './bootstrap-eros-feed.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoDir = path.resolve(__dirname, '..', '..')
const scaffoldDir = path.join(repoDir, '_project-scaffold')
const librariesDir = path.join(repoDir, 'docs', '_libraries')
const desktopDir = path.join(os.homedir(), 'Desktop')
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm'

const exists = async (targetPath) => {
  try {
    await fs.access(targetPath)
    return true
  } catch {
    return false
  }
}

const ensureDir = async (targetPath) => {
  await fs.mkdir(targetPath, { recursive: true })
}

const copyDirectoryContents = async (sourceDir, targetDir) => {
  await ensureDir(targetDir)
  const entries = await fs.readdir(sourceDir, { withFileTypes: true })

  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry.name)
    const targetPath = path.join(targetDir, entry.name)

    await fs.cp(sourcePath, targetPath, {
      recursive: true,
      force: true,
      errorOnExist: false,
    })
  }
}

const resolveBriefInput = async (args) => {
  if (typeof args.brief === 'string') {
    return JSON.parse(args.brief)
  }

  if (typeof args['brief-file'] === 'string') {
    return readJson(path.resolve(args['brief-file']), {})
  }

  return {}
}

const readDirectoryEntries = async (targetPath) => {
  try {
    return await fs.readdir(targetPath)
  } catch {
    return []
  }
}

const ensureProjectTarget = async ({ projectDir, allowExisting }) => {
  const alreadyExists = await exists(projectDir)
  if (!alreadyExists) {
    await ensureDir(projectDir)
    return
  }

  const entries = await readDirectoryEntries(projectDir)
  if (entries.length === 0 || allowExisting) {
    return
  }

  throw new Error(`Target project directory already exists and is not empty: ${projectDir}`)
}

const updateProjectPackageJson = async ({ projectDir, brief }) => {
  const packagePath = path.join(projectDir, 'package.json')
  if (!(await exists(packagePath))) {
    return
  }

  const manifest = await readJson(packagePath, null)
  if (!manifest) {
    return
  }

  manifest.name = brief.slug

  await fs.writeFile(packagePath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')
}

const runInstall = async (projectDir) => {
  await new Promise((resolve, reject) => {
    const child = spawn(npmCommand, ['install'], {
      cwd: projectDir,
      stdio: 'inherit',
    })

    child.on('error', reject)
    child.on('exit', (code) => {
      if (code === 0) {
        resolve()
        return
      }

      reject(new Error(`npm install failed with exit code ${code}`))
    })
  })
}

const writeInitializationSummary = async ({ projectDir, brief, installSkipped }) => {
  const selection = await readJson(path.join(projectDir, '.eros', 'blueprints', 'selection.json'), null)
  const content = `# Project Init

## Status

- Project scaffold copied
- Eros-feed bootstrap emitted
- Blueprint selector emitted
- Libraries copied into \`docs/_libraries\`
- npm install: ${installSkipped ? 'skipped' : 'completed'}

## Identity

- Name: ${brief.name}
- Slug: ${brief.slug}
- Mode: ${brief.mode}
- Pages: ${brief.pages.join(', ')}

## Direction

- Hero: ${selection?.selection?.heroName ?? 'pending'}
- Nav: ${selection?.selection?.navName ?? 'pending'}
- Direction: ${selection?.selection?.chosenDirectionId ?? 'pending'}
`

  const targetPath = path.join(projectDir, '.eros', 'reports', 'project-init.md')
  await ensureDir(path.dirname(targetPath))
  await fs.writeFile(targetPath, content.trimEnd() + '\n', 'utf8')
}

const main = async () => {
  const args = parseArgs(process.argv.slice(2))
  const briefInput = await resolveBriefInput(args)
  const seedProjectDir = typeof args.project === 'string'
    ? path.resolve(args.project)
    : path.join(desktopDir, normalizeBrief({ brief: briefInput, projectDir: desktopDir }).slug)

  const brief = normalizeBrief({ brief: briefInput, projectDir: seedProjectDir })
  const projectDir = typeof args.project === 'string'
    ? path.resolve(args.project)
    : path.join(desktopDir, brief.slug)
  const allowExisting = Boolean(args['allow-existing'])
  const skipInstall = Boolean(args['skip-install'])

  await ensureProjectTarget({ projectDir, allowExisting })
  await copyDirectoryContents(scaffoldDir, projectDir)
  await copyDirectoryContents(librariesDir, path.join(projectDir, 'docs', '_libraries'))
  await ensureDir(path.join(projectDir, 'docs', 'pages'))
  await ensureDir(path.join(projectDir, 'docs', 'mockups'))
  await ensureDir(path.join(projectDir, '_ref-captures'))

  const { brief: bootstrappedBrief } = await bootstrapProject({ projectDir, briefInput })
  await updateProjectPackageJson({ projectDir, brief: bootstrappedBrief })

  if (!skipInstall) {
    await runInstall(projectDir)
  }

  await writeInitializationSummary({
    projectDir,
    brief: bootstrappedBrief,
    installSkipped: skipInstall,
  })

  // Sync: initialize git + push to archive repo
  try {
    await new Promise((resolve, reject) => {
      execFile(process.execPath, [
        path.join(__dirname, 'project-sync.mjs'), 'init', '--project', projectDir,
      ], { cwd: __dirname, timeout: 60000 }, (err, stdout, stderr) => {
        if (stderr) process.stderr.write(stderr)
        if (err) { reject(err); return }
        resolve(stdout)
      })
    })
  } catch (err) {
    console.error(`[sync] Warning: ${err.message?.slice(0, 80)} — project created but not synced`)
  }

  console.log(`Initialized project ${bootstrappedBrief.name} at ${projectDir}`)
}

main().catch((error) => {
  console.error(error.message)
  process.exitCode = 1
})
