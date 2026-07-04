#!/usr/bin/env node
/**
 * vault.mjs — Read/write interface for the Eros brain vault (brain/).
 *
 * The vault is an Obsidian-compatible knowledge base: markdown notes with
 * typed YAML frontmatter, [[wikilinks]], MOC hub notes and .base queries.
 * This script is the ONLY sanctioned writer for machine-generated knowledge
 * (replaces memory.mjs, which owned the legacy design-intelligence JSONs).
 *
 * Contract (see docs/research/raw/2026-07-04-obsidian-vault.md):
 *  - New knowledge -> new note from schema, never a rewrite of prose.
 *  - Updates to existing notes: frontmatter field edits + appends under the
 *    `<!-- eros:append-below -->` marker. Above the marker = human territory.
 *  - Every note links to >= 1 map/sibling. Orphans are validation errors.
 *
 * CLI:
 *   node vault.mjs new <type> <slug> --set key=value ... [--body-file <path> | --body "<md>"]
 *   node vault.mjs append <note-path-or-slug> "<markdown line(s)>"
 *   node vault.mjs set-field <note-path-or-slug> <key> <value>
 *   node vault.mjs regen-start
 *   node vault.mjs validate
 *   node vault.mjs query <type> [--where key=value] [--json]
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const MAQUETA_DIR = path.resolve(__dirname, '..', '..')
export const VAULT_DIR = path.join(MAQUETA_DIR, 'brain')

export const APPEND_MARKER = '<!-- eros:append-below -->'

/** type -> { folder, required frontmatter keys } — templates in brain/templates/ mirror this. */
export const NOTE_TYPES = {
  rule:        { folder: 'rules',      required: ['type', 'id', 'status', 'validations'] },
  technique:   { folder: 'techniques', required: ['type', 'id', 'avg-score', 'times-used', 'confidence'] },
  pattern:     { folder: 'patterns',   required: ['type', 'id', 'section-type'] },
  signature:   { folder: 'signatures', required: ['type', 'id', 'verdict', 'section-type'] },
  palette:     { folder: 'palettes',   required: ['type', 'id', 'canvas'] },
  'font-pairing': { folder: 'typography', required: ['type', 'id', 'display'] },
  lesson:      { folder: 'lessons',    required: ['type', 'id', 'severity', 'phase'] },
  revision:    { folder: 'revisions',  required: ['type', 'id', 'project'] },
  project:     { folder: 'projects',   required: ['type', 'id', 'status'] },
  reference:   { folder: 'references', required: ['type', 'id'] },
  asset:       { folder: 'assets',     required: ['type', 'id', 'asset-kind', 'source-type', 'review-status'] },
  self:        { folder: 'self',       required: ['type', 'id'] },
  map:         { folder: 'maps',       required: ['type', 'id'] },
}

// ---------------------------------------------------------------------------
// YAML (subset): strings, numbers, booleans, null, flat arrays. Enough for the
// vault schemas; avoids a dependency. Wikilink values stay quoted.
// ---------------------------------------------------------------------------

export function yamlValue(v) {
  if (v === null || v === undefined) return ''
  if (typeof v === 'number' || typeof v === 'boolean') return String(v)
  if (Array.isArray(v)) return `[${v.map((x) => yamlValue(x)).join(', ')}]`
  const s = String(v)
  if (/^[\d.]+$/.test(s) || /[:#\[\]{}"',&*?|>%@`]/.test(s) || s.includes('[[')) {
    return `"${s.replace(/"/g, '\\"')}"`
  }
  return s
}

export function serializeFrontmatter(fm) {
  const lines = ['---']
  for (const [k, v] of Object.entries(fm)) {
    if (v === undefined) continue
    lines.push(`${k}: ${yamlValue(v)}`)
  }
  lines.push('---')
  return lines.join('\n')
}

export function parseFrontmatter(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
  if (!m) return { fm: {}, body: raw, fmRaw: null }
  const fm = {}
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([\w-]+):\s*(.*)$/)
    if (!kv) continue
    let v = kv[2].trim()
    if (v === '') { fm[kv[1]] = null; continue }
    if (v.startsWith('[') && v.endsWith(']')) {
      fm[kv[1]] = v.slice(1, -1).split(',').map((x) => stripQuotes(x.trim())).filter(Boolean)
      continue
    }
    fm[kv[1]] = coerce(stripQuotes(v))
  }
  return { fm, body: raw.slice(m[0].length), fmRaw: m[0] }
}

function stripQuotes(s) {
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1).replace(/\\"/g, '"')
  }
  return s
}

function coerce(s) {
  if (s === 'true') return true
  if (s === 'false') return false
  if (s !== '' && !Number.isNaN(Number(s)) && /^-?[\d.]+$/.test(s)) return Number(s)
  return s
}

// ---------------------------------------------------------------------------
// Core operations
// ---------------------------------------------------------------------------

export function slugify(name) {
  return String(name)
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
}

export function notePath(type, slug) {
  const t = NOTE_TYPES[type]
  if (!t) throw new Error(`Unknown note type: ${type}`)
  return path.join(VAULT_DIR, t.folder, `${slug}.md`)
}

/** Resolve "rules/foo", "foo.md", full path, or bare slug (searched across folders). */
export function resolveNote(ref) {
  if (fs.existsSync(ref)) return ref
  const abs = path.join(VAULT_DIR, ref.endsWith('.md') ? ref : `${ref}.md`)
  if (fs.existsSync(abs)) return abs
  const bare = ref.replace(/\.md$/, '')
  for (const { folder } of Object.values(NOTE_TYPES)) {
    const p = path.join(VAULT_DIR, folder, `${bare}.md`)
    if (fs.existsSync(p)) return p
  }
  throw new Error(`Note not found: ${ref}`)
}

export function writeNote(type, slug, fm, body, { force = false } = {}) {
  const t = NOTE_TYPES[type]
  if (!t) throw new Error(`Unknown note type: ${type}`)
  for (const key of t.required) {
    if (fm[key] === undefined || fm[key] === null || fm[key] === '') {
      throw new Error(`Note ${type}/${slug} missing required frontmatter: ${key}`)
    }
  }
  const file = notePath(type, slug)
  if (fs.existsSync(file) && !force) throw new Error(`Note exists (use append/set-field): ${file}`)
  fs.mkdirSync(path.dirname(file), { recursive: true })
  let md = `${serializeFrontmatter(fm)}\n\n${body.trim()}\n`
  if (!md.includes(APPEND_MARKER)) {
    md += `\n## Evidence log\n${APPEND_MARKER}\n`
  }
  fs.writeFileSync(file, md, 'utf8')
  return file
}

export function appendToNote(ref, text) {
  const file = resolveNote(ref)
  const raw = fs.readFileSync(file, 'utf8')
  if (!raw.includes(APPEND_MARKER)) {
    fs.writeFileSync(file, `${raw.trimEnd()}\n\n## Evidence log\n${APPEND_MARKER}\n${text.trim()}\n`, 'utf8')
    return file
  }
  const idx = raw.indexOf(APPEND_MARKER) + APPEND_MARKER.length
  const updated = `${raw.slice(0, idx)}\n${text.trim()}${raw.slice(idx)}`
  fs.writeFileSync(file, updated, 'utf8')
  return file
}

export function setField(ref, key, value) {
  const file = resolveNote(ref)
  const raw = fs.readFileSync(file, 'utf8')
  const { fm, body } = parseFrontmatter(raw)
  if (!Object.keys(fm).length) throw new Error(`No frontmatter in ${file}`)
  fm[key] = coerce(String(value))
  fm.updated = new Date().toISOString().slice(0, 10)
  fs.writeFileSync(file, `${serializeFrontmatter(fm)}\n${body}`, 'utf8')
  return file
}

export function listNotes(type) {
  const t = NOTE_TYPES[type]
  if (!t) throw new Error(`Unknown note type: ${type}`)
  const dir = path.join(VAULT_DIR, t.folder)
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const file = path.join(dir, f)
      const { fm, body } = parseFrontmatter(fs.readFileSync(file, 'utf8'))
      return { file, slug: f.replace(/\.md$/, ''), fm, body }
    })
}

export function query(type, where = {}) {
  return listNotes(type).filter((n) =>
    Object.entries(where).every(([k, v]) => String(n.fm[k]) === String(v)))
}

// ---------------------------------------------------------------------------
// START.md — machine entry point (regenerated, <= ~2K tokens)
// ---------------------------------------------------------------------------

export function regenStart() {
  const self = listNotes('self').find((n) => n.slug === 'eros')
  const rules = listNotes('rule')
  const promoted = rules.filter((n) => n.fm.status === 'PROMOTED')
  const candidates = rules.filter((n) => n.fm.status === 'CANDIDATE')
  const techniques = listNotes('technique')
    .sort((a, b) => (b.fm['avg-score'] || 0) - (a.fm['avg-score'] || 0))
  const lessons = listNotes('lesson')
    .sort((a, b) => String(b.fm.created || '').localeCompare(String(a.fm.created || '')))
    .slice(0, 3)
  const projects = listNotes('project')

  const ruleLine = (n) => {
    const firstLine = n.body.trim().split(/\r?\n/).find((l) => l.trim() && !l.startsWith('#')) || n.slug
    return `- **${n.fm.id}** [[${n.slug}]] — ${firstLine.trim()}`
  }

  const md = `<!-- generated: do not hand-edit. Regenerate: node scripts/memory/vault.mjs regen-start -->

# START — Eros brain entry point

Soy Eros. Mi identidad completa: [[eros]] · mis preferencias estéticas y política anti-repetición: [[aesthetic]] · mi historia: [[growth-log]].

**Estado:** ${self?.fm['current-state'] || 'n/a'} · proyectos lifetime: ${self?.fm['projects-lifetime'] ?? '?'} · notas: ${rules.length} reglas, ${techniques.length} técnicas, ${projects.length} proyectos.

## Reglas PROMOTED — obedecer siempre

${promoted.map(ruleLine).join('\n')}

## Top técnicas (por score)

${techniques.slice(0, 5).map((n) => `- [[${n.slug}]] — avg ${n.fm['avg-score']} · ${n.fm['times-used']} usos · ${n.fm.confidence}`).join('\n')}

> Anti-repetición activa: máx 2 usos de la misma técnica de reveal por página; decay 15% por proyecto consecutivo. Detalle en [[aesthetic]].

## Últimas lecciones

${lessons.map((n) => `- [[${n.slug}]] (${n.fm.severity}, ${n.fm.project || 'general'})`).join('\n')}

## Cómo consultar el resto (no hagas bulk-read)

- Reglas candidatas (${candidates.length}): \`Grep "^status: CANDIDATE" brain/rules/ -l\`
- Técnica puntual: \`brain/techniques/<slug>.md\` · Proyecto: \`brain/projects/<slug>.md\`
- Hubs de navegación: [[rules-map]] · [[techniques-map]] · [[projects-map]] · [[style-map]] · [[lessons-map]]

## Cómo escribir (protocolo obligatorio)

- Nota nueva: \`node scripts/memory/vault.mjs new <type> <slug> --set key=value --body "..."\`
- Evidencia: \`node scripts/memory/vault.mjs append <slug> "- YYYY-MM-DD [proyecto] hallazgo"\`
- Campo: \`node scripts/memory/vault.mjs set-field <slug> validations 4\`
- NUNCA edites prosa arriba del marker \`${APPEND_MARKER}\` — es territorio de Mateo.
- Al cerrar sesión de trabajo: \`node scripts/memory/vault.mjs regen-start\`
`
  fs.writeFileSync(path.join(VAULT_DIR, 'START.md'), md, 'utf8')
  return path.join(VAULT_DIR, 'START.md')
}

// ---------------------------------------------------------------------------
// Validation — schema + orphan check
// ---------------------------------------------------------------------------

export function validateVault() {
  const problems = []
  for (const [type, def] of Object.entries(NOTE_TYPES)) {
    for (const n of listNotes(type)) {
      for (const key of def.required) {
        if (n.fm[key] === undefined || n.fm[key] === null || n.fm[key] === '') {
          problems.push(`${path.relative(VAULT_DIR, n.file)}: missing frontmatter "${key}"`)
        }
      }
      if (n.fm.type !== type) {
        problems.push(`${path.relative(VAULT_DIR, n.file)}: type "${n.fm.type}" != folder type "${type}"`)
      }
      if (type !== 'map' && type !== 'self' && !/\[\[[^\]]+\]\]/.test(n.body) && !JSON.stringify(n.fm).includes('[[')) {
        problems.push(`${path.relative(VAULT_DIR, n.file)}: orphan (no wikilinks)`)
      }
    }
  }
  return problems
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function parseCliArgs(argv) {
  const args = { _: [], set: {} }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--set') {
      const kv = argv[++i]
      const eq = kv.indexOf('=')
      args.set[kv.slice(0, eq)] = kv.slice(eq + 1)
    } else if (a.startsWith('--')) {
      args[a.slice(2)] = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true
    } else args._.push(a)
  }
  return args
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isMain) {
  const [cmd, ...rest] = process.argv.slice(2)
  const args = parseCliArgs(rest)
  try {
    switch (cmd) {
      case 'new': {
        const [type, slug] = args._
        const fm = { type, id: args.set.id || slug, ...args.set }
        for (const k of Object.keys(fm)) fm[k] = coerce(String(fm[k]))
        fm.created = fm.created || new Date().toISOString().slice(0, 10)
        const body = args['body-file'] ? fs.readFileSync(args['body-file'], 'utf8') : (args.body || slug)
        console.log(writeNote(type, slug, fm, String(body), { force: !!args.force }))
        break
      }
      case 'append': {
        const [ref, ...text] = args._
        console.log(appendToNote(ref, text.join(' ')))
        break
      }
      case 'set-field': {
        const [ref, key, ...val] = args._
        console.log(setField(ref, key, val.join(' ')))
        break
      }
      case 'regen-start':
        console.log(regenStart())
        break
      case 'validate': {
        const problems = validateVault()
        if (problems.length) { console.error(problems.join('\n')); process.exit(1) }
        console.log('Vault OK — 0 problems.')
        break
      }
      case 'query': {
        const [type] = args._
        const where = {}
        if (args.where) { const eq = args.where.indexOf('='); where[args.where.slice(0, eq)] = args.where.slice(eq + 1) }
        const out = query(type, where).map((n) => args.json ? n : `${n.slug} :: ${JSON.stringify(n.fm)}`)
        console.log(args.json ? JSON.stringify(out, null, 2) : out.join('\n'))
        break
      }
      default:
        console.log('Usage: vault.mjs <new|append|set-field|regen-start|validate|query> ...')
        process.exit(cmd ? 1 : 0)
    }
  } catch (e) {
    console.error(`[vault] ${e.message}`)
    process.exit(1)
  }
}
