import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFile } from 'node:child_process'
import {
  parseArgs,
  readText,
  readJson,
  ensureDir,
  writeText,
  out,
  fail,
} from './eros-utils.mjs'

// ---------------------------------------------------------------------------
// eros-context.mjs — Context File Builder
//
// Assembles .brain/context/{task}.md files mechanically.
// Always injects Memory Insights + Reference Observatory blocks.
// Claude never assembles context files by hand.
//
// Subcommands:
//   design-brief  — build context for the designer agent
//   section       — build context for a builder agent (one section)
//   evaluate      — build context for the evaluator agent
//   motion        — build context for the polisher agent
//   atmosphere    — build context for the atmosphere builder
// ---------------------------------------------------------------------------

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const maquetaDir = path.resolve(__dirname, '..')
const MEMORY_DIR = path.resolve(__dirname, '..', '.claude', 'memory', 'design-intelligence')

// Read personality.json and format as markdown block
const readPersonality = async () => {
  const p = await readJson(path.join(MEMORY_DIR, 'personality.json'))
  if (!p) return null

  const lines = ['## Eros Personality', '']

  // Values
  if (p.values?.core?.length) {
    lines.push('### Values')
    for (const v of p.values.core) {
      const strength = v.strength >= 0.8 ? 'HIGH' : v.strength >= 0.5 ? 'MEDIUM' : 'LOW'
      lines.push(`- ${v.value} (${strength} conviction)`)
    }
    lines.push('')
  }

  // Relevant opinions (top 5)
  if (p.voice?.opinions?.length) {
    lines.push('### Opinions')
    for (const o of p.voice.opinions.slice(0, 5)) {
      const conv = o.conviction >= 0.8 ? 'HIGH' : o.conviction >= 0.5 ? 'MEDIUM' : 'LOW'
      lines.push(`- **${o.topic}:** ${o.opinion} (${conv} conviction)`)
    }
    lines.push('')
  }

  // Aesthetic direction
  if (p.aesthetic) {
    lines.push('### Aesthetic Direction')
    const prefs = p.aesthetic.compositionPreferences || {}
    const topComps = Object.entries(prefs).sort((a, b) => b[1].weight - a[1].weight).slice(0, 3)
    if (topComps.length) {
      lines.push(`- Preferred layouts: ${topComps.map(([k, v]) => `${k} (${v.weight})`).join(', ')}`)
    }
    const motions = p.aesthetic.motionPreferences || {}
    const topMotions = Object.entries(motions).sort((a, b) => b[1].weight - a[1].weight).slice(0, 3)
    if (topMotions.length) {
      lines.push(`- Preferred motion: ${topMotions.map(([k, v]) => `${k} (${v.evidence} uses)`).join(', ')}`)
    }
    // Experiment suggestion (20% budget)
    if (p.aesthetic.experimentBudget > 0) {
      const weakMotions = Object.entries(motions).filter(([, v]) => v.evidence <= 1).slice(0, 2)
      if (weakMotions.length) {
        lines.push(`- Experiment: try ${weakMotions.map(([k]) => k).join(' or ')} (low evidence, explore)`)
      }
    }
    lines.push('')
  }

  // Philosophy
  if (p.voice?.philosophy) {
    lines.push('### Philosophy', '', p.voice.philosophy, '')
  }

  return lines.join('\n')
}

// Call eros-memory.mjs interpret
const callInterpret = (taskType, extraArgs = []) => {
  return new Promise((resolve) => {
    const script = path.join(__dirname, 'eros-memory.mjs')
    const allArgs = [script, 'interpret', '--task-type', taskType, ...extraArgs]
    execFile('node', allArgs, { cwd: __dirname }, (err, stdout) => {
      if (err) {
        resolve({ insightsMarkdown: '## Memory Insights\n\n_No memory data available._\n', threshold: null, relevantRules: [] })
        return
      }
      try {
        resolve(JSON.parse(stdout))
      } catch {
        resolve({ insightsMarkdown: '## Memory Insights\n\n_Parse error._\n', threshold: null, relevantRules: [] })
      }
    })
  })
}

// Call eros-memory.mjs threshold
const callThreshold = (sectionType) => {
  return new Promise((resolve) => {
    const script = path.join(__dirname, 'eros-memory.mjs')
    execFile('node', [script, 'threshold', '--section-type', sectionType], { cwd: __dirname }, (err, stdout) => {
      if (err) {
        resolve({ scoreMinimum: 7.0, isDefault: true })
        return
      }
      try {
        resolve(JSON.parse(stdout))
      } catch {
        resolve({ scoreMinimum: 7.0, isDefault: true })
      }
    })
  })
}

// ---------------------------------------------------------------------------
// Helpers: extract sections from page recipes
// ---------------------------------------------------------------------------

// Extract only relevant subsections from DESIGN.md instead of dumping the whole file
const extractDesignExcerpt = (designMd, sectionType) => {
  // Always-relevant sections
  const relevantHeadings = [
    /composition/i, /typography/i, /palette/i, /color/i,
    /motion/i, /easing/i, /animation/i,
    /responsive/i, /breakpoint/i,
    /anti.?pattern/i, /avoid/i, /forbidden/i,
    /brand/i, /tone/i, /personality/i,
  ]

  // Section-type specific headings
  if (sectionType) {
    const typeNorm = sectionType.toLowerCase()
    relevantHeadings.push(new RegExp(typeNorm, 'i'))
    if (typeNorm.includes('hero')) relevantHeadings.push(/hero/i, /landing/i)
    if (typeNorm.includes('footer')) relevantHeadings.push(/footer/i)
    if (typeNorm.includes('nav')) relevantHeadings.push(/nav/i, /header/i)
  }

  // Split by ## headings and filter
  const sections = designMd.split(/(?=^##\s)/m)
  const relevant = sections.filter(section => {
    const firstLine = section.split('\n')[0] || ''
    return relevantHeadings.some(re => re.test(firstLine))
  })

  if (relevant.length === 0) {
    // Fallback: return first 100 lines
    return designMd.split('\n').slice(0, 100).join('\n')
  }

  // Cap at 150 lines total
  const joined = relevant.join('\n\n')
  const lines = joined.split('\n')
  return lines.length > 150 ? lines.slice(0, 150).join('\n') + '\n\n_...truncated..._' : joined
}

const extractSectionRecipe = async (project, sectionName, pageName) => {
  // Try to find recipe in docs/pages/{page}.md
  if (pageName) {
    const pagePath = path.join(project, 'docs', 'pages', `${pageName}.md`)
    const content = await readText(pagePath)
    if (content) {
      // Look for section header matching sectionName
      const escapedName = sectionName.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
      const regex = new RegExp(`(##\\s*${escapedName}[\\s\\S]*?)(?=\\n##\\s|$)`, 'i')
      const match = content.match(regex)
      if (match) return match[1].trim()
    }
  }

  // Fallback: scan all page files
  try {
    const pagesDir = path.join(project, 'docs', 'pages')
    const files = await fs.readdir(pagesDir)
    for (const file of files) {
      if (!file.endsWith('.md')) continue
      const content = await readText(path.join(pagesDir, file))
      if (!content) continue
      const escapedName = sectionName.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
      const regex = new RegExp(`(##\\s*${escapedName}[\\s\\S]*?)(?=\\n##\\s|$)`, 'i')
      const match = content.match(regex)
      if (match) return match[1].trim()
    }
  } catch { /* empty */ }

  return null
}

// Load relevant library snippets
const loadLibrarySnippets = async (sectionType) => {
  const libDir = path.join(maquetaDir, 'docs', '_libraries')
  const snippets = []

  try {
    const files = await fs.readdir(libDir)
    for (const file of files) {
      if (!file.endsWith('.md')) continue
      const content = await readText(path.join(libDir, file))
      if (!content) continue

      // Check if this library file has relevant content for the section type
      const typeNorm = (sectionType || '').toLowerCase()
      const contentLower = content.toLowerCase()
      if (
        contentLower.includes(typeNorm) ||
        contentLower.includes('all sections') ||
        file.includes('decision') ||
        file.includes('values')
      ) {
        // Extract just the relevant parts (truncate at 200 lines to keep context compact)
        const lines = content.split('\n')
        snippets.push({
          source: file,
          content: lines.slice(0, 200).join('\n'),
        })
      }
    }
  } catch { /* empty */ }

  return snippets
}

// Read reference observatory
const readObservatory = async (project) => {
  const obsPath = path.join(project, '.brain', 'context', 'reference-observatory.md')
  return await readText(obsPath)
}

// Extract token subset relevant to a section
const extractRelevantTokens = async (project) => {
  const tokensPath = path.join(project, 'docs', 'tokens.md')
  return await readText(tokensPath)
}

// ---------------------------------------------------------------------------
// Subcommands
// ---------------------------------------------------------------------------

const cmdDesignBrief = async (args) => {
  const project = args.project
  if (!project) fail('--project is required')

  const identity = await readText(path.join(project, '.brain', 'identity.md'))
  if (!identity) fail('.brain/identity.md not found')

  const refAnalysis = await readText(path.join(project, 'docs', 'reference-analysis.md'))
  const observatory = await readObservatory(project)

  // Get memory insights for design tasks
  const mood = args.mood || ''
  const interpretArgs = mood ? ['--mood', mood] : []
  const memory = await callInterpret('design', interpretArgs)

  // Read personality
  const personalityBlock = await readPersonality()

  // Assemble context
  const parts = [
    '# Context: Design Brief',
    '',
    memory.insightsMarkdown,
  ]

  if (personalityBlock) parts.push('', personalityBlock)

  parts.push(
    '',
    '## Project Identity',
    '',
    identity,
  )

  if (refAnalysis) {
    parts.push('', '## Reference Analysis', '', refAnalysis)
  }

  if (observatory) {
    parts.push('', '## Reference Observatory', '', observatory)
  }

  // Add library design decisions
  const snippets = await loadLibrarySnippets('design')
  if (snippets.length > 0) {
    parts.push('', '## Library References')
    for (const s of snippets) {
      parts.push('', `### ${s.source}`, '', s.content)
    }
  }

  const contextPath = path.join(project, '.brain', 'context', 'design-brief.md')
  await writeText(contextPath, parts.join('\n'))

  out({
    written: path.relative(project, contextPath),
    insightsInjected: true,
    personalityInjected: !!personalityBlock,
    observatoryInjected: observatory !== null,
    referenceAnalysisInjected: refAnalysis !== null,
    librarySnippets: snippets.length,
  })
}

const cmdSection = async (args) => {
  const project = args.project
  if (!project) fail('--project is required')
  const section = args.section
  if (!section) fail('--section is required (e.g., S-Hero)')
  const page = args.page || null

  // Derive section type from name
  const sectionType = section
    .replace(/^S-/, '')
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase()

  // Get memory + threshold
  const memory = await callInterpret('build', ['--section-type', sectionType])
  const threshold = await callThreshold(sectionType)

  // Read design docs
  const designMd = await readText(path.join(project, 'DESIGN.md'))
  const tokens = await extractRelevantTokens(project)
  const recipe = await extractSectionRecipe(project, section, page)
  const observatory = await readObservatory(project)

  // Library snippets relevant to this section type
  const snippets = await loadLibrarySnippets(sectionType)

  // Read personality
  const personalityBlock = await readPersonality()

  // Assemble
  const parts = [
    `# Context: ${section}`,
    '',
    `**Expected minimum score:** ${threshold.scoreMinimum}/10`,
    threshold.isDefault
      ? '_(default threshold — no historical data for this section type)_'
      : `_(based on ${threshold.dataPoints} historical ${sectionType} sections, avg ${threshold.historicalAvg})_`,
    '',
    memory.insightsMarkdown,
  ]

  if (personalityBlock) parts.push('', personalityBlock)

  if (tokens) {
    parts.push('', '## Tokens', '', tokens)
  }

  if (recipe) {
    parts.push('', '## Recipe', '', recipe)
  }

  if (designMd) {
    const excerpt = extractDesignExcerpt(designMd, sectionType)
    if (excerpt) {
      parts.push('', '## Design DNA (excerpt)', '', excerpt)
    }
  }

  if (observatory) {
    parts.push('', '## Reference Observatory', '', observatory)
  }

  if (snippets.length > 0) {
    parts.push('', '## Library Snippets')
    for (const s of snippets) {
      parts.push('', `### ${s.source}`, '', s.content)
    }
  }

  // Rules reminder
  if (memory.relevantRules && memory.relevantRules.length > 0) {
    parts.push('', '## Rules (PROMOTED — must follow)')
    for (const r of memory.relevantRules) {
      parts.push(`- ${r.rule || r.text}`)
    }
  }

  const contextPath = path.join(project, '.brain', 'context', `${section}.md`)
  await writeText(contextPath, parts.join('\n'))

  out({
    written: path.relative(project, contextPath),
    threshold: threshold.scoreMinimum,
    thresholdDefault: threshold.isDefault,
    insightsInjected: true,
    personalityInjected: !!personalityBlock,
    observatoryInjected: observatory !== null,
    recipeFound: recipe !== null,
    librarySnippets: snippets.length,
  })
}

const cmdEvaluate = async (args) => {
  const project = args.project
  if (!project) fail('--project is required')
  const section = args.section
  if (!section) fail('--section is required (e.g., S-Hero)')

  const sectionType = section
    .replace(/^S-/, '')
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase()

  const threshold = await callThreshold(sectionType)

  // Read builder report
  const reportPath = path.join(project, '.brain', 'reports', `${section}.md`)
  const report = await readText(reportPath)

  // Read observer analysis
  const observerPath = path.join(project, '.brain', 'observer', 'localhost', 'analysis.md')
  const observer = await readText(observerPath)

  const parts = [
    `# Context: Evaluate ${section}`,
    '',
    `**Threshold:** ${threshold.scoreMinimum}/10`,
    threshold.isDefault
      ? '_(default — no historical data)_'
      : `_(from ${threshold.dataPoints} entries, avg ${threshold.historicalAvg})_`,
    '',
    '## Builder Report',
    '',
    report || '_Report not found._',
    '',
    '## Observer Analysis',
    '',
    observer || '_Observer has not run yet._',
  ]

  const contextPath = path.join(project, '.brain', 'context', `evaluate-${section}.md`)
  await writeText(contextPath, parts.join('\n'))

  out({
    written: path.relative(project, contextPath),
    threshold: threshold.scoreMinimum,
    reportFound: report !== null,
    observerFound: observer !== null,
  })
}

const cmdMotion = async (args) => {
  const project = args.project
  if (!project) fail('--project is required')

  const memory = await callInterpret('polish')

  const designMd = await readText(path.join(project, 'DESIGN.md'))
  const tokens = await extractRelevantTokens(project)

  // List all sections
  let sectionList = []
  try {
    const sectionsDir = path.join(project, 'src', 'components', 'sections')
    const files = await fs.readdir(sectionsDir)
    sectionList = files.filter((f) => f.startsWith('S-') && f.endsWith('.vue'))
  } catch { /* empty */ }

  // Read page docs for motion hints
  let pageMotionHints = ''
  try {
    const pagesDir = path.join(project, 'docs', 'pages')
    const files = await fs.readdir(pagesDir)
    for (const file of files) {
      if (!file.endsWith('.md')) continue
      const content = await readText(path.join(pagesDir, file))
      if (content) {
        // Extract motion-related sections
        const motionBlocks = content.match(/#{1,3}.*motion.*[\s\S]*?(?=\n#{1,3}\s|$)/gi)
        if (motionBlocks) {
          pageMotionHints += motionBlocks.join('\n\n') + '\n\n'
        }
      }
    }
  } catch { /* empty */ }

  const personalityBlock = await readPersonality()

  const parts = [
    '# Context: Motion & Polish',
    '',
    memory.insightsMarkdown,
  ]

  if (personalityBlock) parts.push('', personalityBlock)

  parts.push(
    '',
    '## Sections to Polish',
    '',
    ...sectionList.map((f) => `- ${f}`),
    '',
  ]

  if (tokens) {
    parts.push('## Tokens', '', tokens, '')
  }

  if (designMd) {
    const excerpt = extractDesignExcerpt(designMd, 'motion')
    if (excerpt) parts.push('## Design DNA (excerpt)', '', excerpt, '')
  }

  if (pageMotionHints.trim()) {
    parts.push('## Motion Hints from Page Docs', '', pageMotionHints)
  }

  const contextPath = path.join(project, '.brain', 'context', 'motion.md')
  await writeText(contextPath, parts.join('\n'))

  out({
    written: path.relative(project, contextPath),
    insightsInjected: true,
    personalityInjected: !!personalityBlock,
    sectionCount: sectionList.length,
  })
}

const cmdAtmosphere = async (args) => {
  const project = args.project
  if (!project) fail('--project is required')

  const designMd = await readText(path.join(project, 'DESIGN.md'))
  const tokens = await extractRelevantTokens(project)
  const memory = await callInterpret('build', ['--section-type', 'atmosphere'])

  const personalityBlock = await readPersonality()

  const parts = [
    '# Context: Atmosphere Canvas',
    '',
    memory.insightsMarkdown,
  ]

  if (personalityBlock) parts.push('', personalityBlock)

  parts.push('')

  if (tokens) {
    parts.push('## Tokens', '', tokens, '')
  }

  if (designMd) {
    const excerpt = extractDesignExcerpt(designMd, 'atmosphere')
    if (excerpt) parts.push('## Design DNA (excerpt)', '', excerpt, '')
  }

  const contextPath = path.join(project, '.brain', 'context', 'atmosphere.md')
  await writeText(contextPath, parts.join('\n'))

  out({
    written: path.relative(project, contextPath),
    insightsInjected: true,
    personalityInjected: !!personalityBlock,
  })
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const main = async () => {
  const rawArgs = process.argv.slice(2)
  const subcommand = rawArgs[0]
  const args = parseArgs(rawArgs.slice(1))

  const commands = {
    'design-brief': cmdDesignBrief,
    section: cmdSection,
    evaluate: cmdEvaluate,
    motion: cmdMotion,
    atmosphere: cmdAtmosphere,
  }

  const handler = commands[subcommand]
  if (!handler) {
    fail(
      `Unknown subcommand: ${subcommand}\nUsage: node eros-context.mjs <design-brief|section|evaluate|motion|atmosphere> [options]`
    )
  }

  await handler(args)
}

main().catch((err) => {
  process.stderr.write(`Fatal: ${err.message}\n`)
  process.exit(1)
})
