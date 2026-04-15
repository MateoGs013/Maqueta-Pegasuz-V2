#!/usr/bin/env node
/**
 * generate-tokens.js
 * Parses docs/tokens.md → extracts CSS Output Block → writes src/styles/tokens.css
 * Also extracts Google Fonts @import URLs and prepends them.
 *
 * Usage:
 *   node generate-tokens.js                    # uses current directory
 *   node generate-tokens.js /path/to/project   # uses specified project directory
 *
 * Expects docs/tokens.md to contain a code fence with :root { ... }
 * Writes to src/styles/tokens.css (creates directory if needed)
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, resolve } from 'path'

const projectDir = resolve(process.argv[2] || '.')
const tokensDoc = join(projectDir, 'docs', 'tokens.md')
const outputDir = join(projectDir, 'src', 'styles')
const outputFile = join(outputDir, 'tokens.css')

// --- Read tokens.md ---
let content
try {
  content = readFileSync(tokensDoc, 'utf-8')
} catch (e) {
  console.error(`\u274C Cannot read ${tokensDoc}`)
  console.error('   Make sure docs/tokens.md exists in the project directory.')
  process.exit(1)
}

// --- Extract CSS code fence containing :root ---
// Look for ```css blocks that contain :root {
const cssBlocks = []
const fenceRegex = /```css\s*\n([\s\S]*?)```/gi
let match
while ((match = fenceRegex.exec(content)) !== null) {
  cssBlocks.push(match[1].trim())
}

if (cssBlocks.length === 0) {
  console.error('\u274C No ```css code fences found in tokens.md')
  process.exit(1)
}

// Find the block with :root (usually the CSS Output Block at the end)
let rootBlock = cssBlocks.find(block => block.includes(':root'))
if (!rootBlock) {
  // Fall back to the last CSS block (the "CSS Output Block" is typically last)
  rootBlock = cssBlocks[cssBlocks.length - 1]
  console.warn('\u26A0 No :root {} found in CSS blocks, using last CSS block')
}

// --- Extract Google Fonts imports ---
// From the CSS block itself
const importsInBlock = []
const importRegex = /@import\s+url\([^)]+\)\s*;?/gi
let importMatch
while ((importMatch = importRegex.exec(rootBlock)) !== null) {
  importsInBlock.push(importMatch[0].replace(/;?\s*$/, ';'))
}

// Also scan the full document for font URLs (in case they're outside the code fence)
const fontUrls = new Set()
const fontUrlRegex = /https:\/\/fonts\.googleapis\.com\/css2\?[^\s)'"<>]+/gi
while ((match = fontUrlRegex.exec(content)) !== null) {
  fontUrls.add(match[0])
}

// Build import list (dedup)
const allImports = new Set(importsInBlock)
for (const url of fontUrls) {
  const importStr = `@import url('${url}');`
  // Check if this URL isn't already in an import
  if (!importsInBlock.some(imp => imp.includes(url))) {
    allImports.add(importStr)
  }
}

// Remove @import lines from the root block (we'll put them at the top)
let cleanBlock = rootBlock.replace(/@import\s+url\([^)]+\)\s*;?\s*\n?/gi, '').trim()

// --- Count custom properties ---
const propCount = (cleanBlock.match(/--[\w-]+\s*:/g) || []).length

// --- Build output ---
const lines = [
  '/* ═══════════════════════════════════════════════════════════════',
  ' * Design Tokens — Auto-generated from docs/tokens.md',
  ' * Do NOT edit manually. Update docs/tokens.md and re-run:',
  ` *   node ${projectDir === '.' ? '' : projectDir + '/'}scripts/generate-tokens.js`,
  ' * ═══════════════════════════════════════════════════════════════ */',
  '',
]

if (allImports.size > 0) {
  lines.push('/* Google Fonts */')
  for (const imp of allImports) {
    lines.push(imp)
  }
  lines.push('')
}

lines.push(cleanBlock)
lines.push('')

const output = lines.join('\n')

// --- Write output ---
mkdirSync(outputDir, { recursive: true })
writeFileSync(outputFile, output, 'utf-8')

console.log(`\u2705 tokens.css written → ${outputFile}`)
console.log(`   ${allImports.size} font import(s), ${propCount} custom properties`)

// --- Validate ---
if (propCount < 10) {
  console.warn(`\u26A0 Only ${propCount} custom properties found — expected 20+. Check tokens.md format.`)
}

if (!cleanBlock.includes('--canvas') && !cleanBlock.includes('--bg')) {
  console.warn('\u26A0 No --canvas or --bg property found — palette may be missing.')
}

if (!cleanBlock.includes('--font-display') && !cleanBlock.includes('--font-heading')) {
  console.warn('\u26A0 No --font-display or --font-heading property found — typography may be missing.')
}

if (!cleanBlock.includes('--ease')) {
  console.warn('\u26A0 No --ease property found — motion tokens may be missing.')
}
