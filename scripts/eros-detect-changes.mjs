#!/usr/bin/env node
/**
 * eros-detect-changes.mjs
 * Detects manual code changes in a project via git diff,
 * infers revision patterns, and auto-writes them to memory
 * through eros-memory.mjs learn --event user_change.
 *
 * Usage:
 *   node eros-detect-changes.mjs --project "$PROJECT_DIR"
 *   node eros-detect-changes.mjs --project "$PROJECT_DIR" --since "2 hours ago"
 *   node eros-detect-changes.mjs --project "$PROJECT_DIR" --dry-run
 *
 * All output is JSON to stdout. Errors go to stderr with exit code 1.
 * No external dependencies.
 */

import { execFile as execFileCb } from 'node:child_process'
import { promisify } from 'node:util'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  parseArgs,
  out as output,
  fail,
} from './eros-utils.mjs'

const execFile = promisify(execFileCb)

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const MEMORY_SCRIPT = path.join(__dirname, 'eros-memory.mjs')

// ---------------------------------------------------------------------------
// Git helpers
// ---------------------------------------------------------------------------

async function gitDiff(projectDir, since) {
  const args = ['diff']

  if (since) {
    // Use diff against the state at a point in time via diff against a commit
    // git log --since="..." --format=%H gives us the oldest commit in the range
    try {
      const { stdout: logOut } = await execFile('git', [
        'log', `--since=${since}`, '--format=%H', '--reverse'
      ], { cwd: projectDir, maxBuffer: 10 * 1024 * 1024 })

      const commits = logOut.trim().split('\n').filter(Boolean)
      if (commits.length > 0) {
        // Diff from just before the oldest commit in the range to HEAD
        args.push(`${commits[0]}~1`, 'HEAD')
      } else {
        // No commits in that range — diff against HEAD~1 as fallback
        args.push('HEAD~1')
      }
    } catch {
      // Fallback: diff against HEAD~1
      args.push('HEAD~1')
    }
  } else {
    args.push('HEAD~1')
  }

  // Restrict to src/ files only
  args.push('--', 'src/')

  try {
    const { stdout } = await execFile('git', args, {
      cwd: projectDir,
      maxBuffer: 10 * 1024 * 1024,
    })
    return stdout
  } catch (err) {
    // git diff exits non-zero when there are differences in some configurations
    if (err.stdout) return err.stdout
    throw err
  }
}

// ---------------------------------------------------------------------------
// Diff parser
// ---------------------------------------------------------------------------

const SKIP_PATTERNS = [
  /package-lock\.json/,
  /node_modules\//,
  /\.brain\//,
  /\.vite\//,
  /dist\//,
]

const TRACKABLE_EXTENSIONS = ['.vue', '.css', '.js', '.ts', '.mjs']

const SECTION_RE = /src\/components\/sections\/S-([^/.]+)\.vue$/

function parseDiff(raw) {
  const files = []
  let current = null

  const lines = raw.split('\n')

  for (const line of lines) {
    // New file header
    const fileMatch = line.match(/^diff --git a\/(.*) b\/(.*)/)
    if (fileMatch) {
      if (current) files.push(current)
      const filePath = fileMatch[2]
      current = {
        path: filePath,
        added: [],
        removed: [],
        hunks: 0,
      }
      continue
    }

    if (!current) continue

    // Hunk header
    if (line.startsWith('@@')) {
      current.hunks++
      continue
    }

    // Added line (not the +++ header)
    if (line.startsWith('+') && !line.startsWith('+++')) {
      current.added.push(line.slice(1))
      continue
    }

    // Removed line (not the --- header)
    if (line.startsWith('-') && !line.startsWith('---')) {
      current.removed.push(line.slice(1))
      continue
    }
  }

  if (current) files.push(current)

  // Filter out skipped paths and non-trackable extensions
  return files.filter(f => {
    if (SKIP_PATTERNS.some(re => re.test(f.path))) return false
    const ext = path.extname(f.path)
    if (!TRACKABLE_EXTENSIONS.includes(ext)) return false
    // Must be under src/
    if (!f.path.startsWith('src/')) return false
    return true
  })
}

// ---------------------------------------------------------------------------
// Change analysis
// ---------------------------------------------------------------------------

const CSS_PROPERTY_RE = /^\s*([\w-]+)\s*:/

function extractCSSProperties(lines) {
  const props = new Set()
  for (const line of lines) {
    const m = line.match(CSS_PROPERTY_RE)
    if (m && !m[1].startsWith('--') && !m[1].startsWith('//')) {
      props.add(m[1])
    }
  }
  return [...props]
}

function detectHTMLElements(lines) {
  const elements = new Set()
  for (const line of lines) {
    // Match opening tags
    const tags = line.matchAll(/<(\w[\w-]*)/g)
    for (const tag of tags) {
      elements.add(tag[1])
    }
  }
  return [...elements]
}

function classifyLineRegion(line) {
  const trimmed = line.trim()
  // Very rough heuristic for Vue SFC sections
  if (trimmed.startsWith('<template') || trimmed.startsWith('</template')) return 'template'
  if (trimmed.startsWith('<script') || trimmed.startsWith('</script')) return 'script'
  if (trimmed.startsWith('<style') || trimmed.startsWith('</style')) return 'style'
  return null
}

function analyzeFile(fileData) {
  const { path: filePath, added, removed } = fileData
  const totalChanged = added.length + removed.length

  // Determine which SFC section the changes mostly belong to
  // For .vue files, scan added+removed for region markers
  const isVue = filePath.endsWith('.vue')
  const isCSS = filePath.endsWith('.css')
  const isJS = filePath.endsWith('.js') || filePath.endsWith('.ts') || filePath.endsWith('.mjs')

  const regions = { template: 0, script: 0, style: 0, unknown: 0 }

  if (isVue) {
    let currentRegion = 'unknown'
    // Since we only have diff lines (not full file context), we try to detect
    // region switches from the diff. Failing that, use heuristics.
    const allLines = [...removed, ...added]
    for (const line of allLines) {
      const region = classifyLineRegion(line)
      if (region) {
        currentRegion = region
        continue
      }
      // Heuristic: CSS properties -> style, HTML tags -> template, JS -> script
      if (CSS_PROPERTY_RE.test(line) && (line.includes(';') || line.includes('{'))) {
        regions.style++
      } else if (/<\w/.test(line) || /v-if|v-for|v-show|:class|@click/.test(line)) {
        regions.template++
      } else if (/import |const |let |function |=>|\.value|ref\(|computed\(/.test(line)) {
        regions.script++
      } else {
        regions[currentRegion]++
      }
    }
  }

  // For non-vue files, assign the dominant region
  if (isCSS) regions.style = totalChanged
  if (isJS) regions.script = totalChanged

  const changes = []

  // CSS analysis
  const addedCSS = extractCSSProperties(added)
  const removedCSS = extractCSSProperties(removed)
  const allCSS = [...new Set([...addedCSS, ...removedCSS])]
  if (allCSS.length > 0) {
    changes.push({
      type: 'style',
      properties: allCSS,
      added: addedCSS,
      removed: removedCSS,
    })
  }

  // Template analysis
  const addedElements = detectHTMLElements(added)
  const removedElements = detectHTMLElements(removed)
  if (addedElements.length > 0 || removedElements.length > 0) {
    changes.push({
      type: 'template',
      addedElements,
      removedElements,
    })
  }

  // Script analysis (detect function/variable changes)
  const scriptAdded = added.filter(l =>
    /import |const |let |function |=>|\.value|ref\(|computed\(|watch\(|onMounted|gsap/.test(l)
  )
  const scriptRemoved = removed.filter(l =>
    /import |const |let |function |=>|\.value|ref\(|computed\(|watch\(|onMounted|gsap/.test(l)
  )
  if (scriptAdded.length > 0 || scriptRemoved.length > 0) {
    changes.push({
      type: 'script',
      linesAdded: scriptAdded.length,
      linesRemoved: scriptRemoved.length,
    })
  }

  // Dominant region
  const dominant = Object.entries(regions)
    .filter(([k]) => k !== 'unknown')
    .sort((a, b) => b[1] - a[1])
  const dominantRegion = dominant.length > 0 && dominant[0][1] > 0
    ? dominant[0][0]
    : 'mixed'

  return { changes, dominantRegion, regions }
}

// ---------------------------------------------------------------------------
// Pattern generation
// ---------------------------------------------------------------------------

function generatePattern(filePath, analysis, fileData) {
  const sectionMatch = filePath.match(SECTION_RE)
  const sectionName = sectionMatch ? `S-${sectionMatch[1]}` : path.basename(filePath, path.extname(filePath))
  const { changes, dominantRegion } = analysis

  const parts = []

  for (const change of changes) {
    switch (change.type) {
      case 'style': {
        const props = change.properties.slice(0, 6).join(', ')
        const extra = change.properties.length > 6 ? ` (+${change.properties.length - 6} more)` : ''
        parts.push(`Updated styles — changed [${props}${extra}]`)
        break
      }
      case 'template': {
        if (change.addedElements.length > 0 && change.removedElements.length > 0) {
          parts.push(`Updated template — added [${change.addedElements.slice(0, 4).join(', ')}], removed [${change.removedElements.slice(0, 4).join(', ')}]`)
        } else if (change.addedElements.length > 0) {
          parts.push(`Updated template — added [${change.addedElements.slice(0, 4).join(', ')}]`)
        } else {
          parts.push(`Updated template — removed [${change.removedElements.slice(0, 4).join(', ')}]`)
        }
        break
      }
      case 'script': {
        const direction = change.linesAdded > change.linesRemoved ? 'added logic' : 'refactored logic'
        parts.push(`Updated logic — ${direction} (${change.linesAdded} added, ${change.linesRemoved} removed)`)
        break
      }
    }
  }

  if (parts.length === 0) {
    parts.push(`Modified (${fileData.added.length} added, ${fileData.removed.length} removed lines)`)
  }

  const whatChanged = `${sectionName}: ${parts.join('; ')}`

  // Build original/revised summaries from the first few lines
  const originalSample = fileData.removed
    .filter(l => l.trim().length > 0)
    .slice(0, 3)
    .map(l => l.trim())
    .join(' | ')

  const revisedSample = fileData.added
    .filter(l => l.trim().length > 0)
    .slice(0, 3)
    .map(l => l.trim())
    .join(' | ')

  // Infer a pattern (what the user tends to correct)
  let pattern = null
  const styleChange = changes.find(c => c.type === 'style')
  const templateChange = changes.find(c => c.type === 'template')

  if (styleChange && styleChange.properties.length > 0) {
    const spacingProps = styleChange.properties.filter(p =>
      /margin|padding|gap|top|bottom|left|right|width|height/.test(p)
    )
    const colorProps = styleChange.properties.filter(p =>
      /color|background|border|shadow|opacity/.test(p)
    )
    const layoutProps = styleChange.properties.filter(p =>
      /display|flex|grid|position|align|justify|order|z-index/.test(p)
    )
    const typoProps = styleChange.properties.filter(p =>
      /font|letter-spacing|line-height|text/.test(p)
    )

    const categories = []
    if (spacingProps.length > 0) categories.push('spacing')
    if (colorProps.length > 0) categories.push('colors')
    if (layoutProps.length > 0) categories.push('layout')
    if (typoProps.length > 0) categories.push('typography')

    if (categories.length > 0) {
      pattern = `User corrects ${categories.join(' + ')} in ${dominantRegion} region`
    }
  }

  if (!pattern && templateChange) {
    if (templateChange.addedElements.length > templateChange.removedElements.length) {
      pattern = 'User adds structural HTML elements'
    } else if (templateChange.removedElements.length > templateChange.addedElements.length) {
      pattern = 'User simplifies HTML structure'
    } else {
      pattern = 'User restructures template layout'
    }
  }

  if (!pattern) {
    pattern = `User manually edits ${dominantRegion} in ${sectionName}`
  }

  return {
    section: sectionName,
    isSection: !!sectionMatch,
    whatChanged,
    original: originalSample || null,
    revised: revisedSample || null,
    pattern,
    linesAdded: fileData.added.length,
    linesRemoved: fileData.removed.length,
  }
}

// ---------------------------------------------------------------------------
// Memory writer
// ---------------------------------------------------------------------------

async function writeToMemory(projectSlug, changeInfo) {
  const data = JSON.stringify({
    project: projectSlug,
    phase: 'manual-edit',
    whatChanged: changeInfo.whatChanged,
    original: changeInfo.original,
    revised: changeInfo.revised,
    pattern: changeInfo.pattern,
  })

  const { stdout } = await execFile('node', [
    MEMORY_SCRIPT,
    'learn',
    '--event', 'user_change',
    '--data', data,
  ], { maxBuffer: 5 * 1024 * 1024 })

  return JSON.parse(stdout)
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const MIN_LINES = 3

async function main() {
  const args = parseArgs(process.argv.slice(2))

  if (!args.project) {
    fail('--project is required. Usage: node eros-detect-changes.mjs --project "$PROJECT_DIR" [--since "2 hours ago"] [--dry-run]')
  }

  const projectDir = path.resolve(args.project)
  const projectSlug = path.basename(projectDir)
  const since = args.since || null
  const dryRun = !!args['dry-run']

  // 1. Get git diff
  let diffOutput
  try {
    diffOutput = await gitDiff(projectDir, since)
  } catch (err) {
    fail(`Failed to run git diff in ${projectDir}: ${err.message}`)
  }

  if (!diffOutput || diffOutput.trim().length === 0) {
    output({
      status: 'no_changes',
      project: projectSlug,
      filesAnalyzed: 0,
      patternsDetected: 0,
      changes: [],
    })
    return
  }

  // 2. Parse the diff
  const files = parseDiff(diffOutput)

  if (files.length === 0) {
    output({
      status: 'no_trackable_changes',
      project: projectSlug,
      filesAnalyzed: 0,
      patternsDetected: 0,
      changes: [],
    })
    return
  }

  // 3. Analyze each file and generate patterns
  const results = []
  const skipped = []

  for (const fileData of files) {
    const totalChanged = fileData.added.length + fileData.removed.length

    // Skip trivial changes (fewer than MIN_LINES total)
    if (totalChanged < MIN_LINES) {
      skipped.push({
        path: fileData.path,
        reason: `Only ${totalChanged} line(s) changed (minimum: ${MIN_LINES})`,
      })
      continue
    }

    const analysis = analyzeFile(fileData)
    const changeInfo = generatePattern(fileData.path, analysis, fileData)

    results.push({
      file: fileData.path,
      ...changeInfo,
    })
  }

  // 4. Write to memory (or dry-run)
  const memoryResults = []

  for (const change of results) {
    if (dryRun) {
      memoryResults.push({
        file: change.file,
        section: change.section,
        action: 'dry-run',
        wouldWrite: {
          event: 'user_change',
          data: {
            project: projectSlug,
            phase: 'manual-edit',
            whatChanged: change.whatChanged,
            original: change.original,
            revised: change.revised,
            pattern: change.pattern,
          },
        },
      })
    } else {
      try {
        const result = await writeToMemory(projectSlug, change)
        memoryResults.push({
          file: change.file,
          section: change.section,
          action: 'written',
          memoryResult: result,
        })
      } catch (err) {
        memoryResults.push({
          file: change.file,
          section: change.section,
          action: 'error',
          error: err.message,
        })
      }
    }
  }

  // 5. Output summary
  output({
    status: dryRun ? 'dry_run' : 'completed',
    project: projectSlug,
    since: since || 'HEAD~1',
    filesAnalyzed: files.length,
    patternsDetected: results.length,
    skipped: skipped.length,
    changes: results.map(r => ({
      file: r.file,
      section: r.section,
      isSection: r.isSection,
      whatChanged: r.whatChanged,
      pattern: r.pattern,
      linesAdded: r.linesAdded,
      linesRemoved: r.linesRemoved,
    })),
    memoryWrites: memoryResults,
    skippedFiles: skipped,
  })
}

main().catch(err => {
  fail(err.message)
})
