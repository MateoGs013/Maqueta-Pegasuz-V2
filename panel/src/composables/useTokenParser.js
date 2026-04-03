// ── Token type inference ──

function inferType(name, value) {
  const v = value.trim()
  if (/^#[0-9a-fA-F]{3,8}$/.test(v)) return 'color'
  if (/^rgba?\(/.test(v)) return 'color'
  if (/^hsla?\(/.test(v)) return 'color'
  if (name.includes('font-') && /['"]/.test(v)) return 'font'
  if (/^clamp\(/.test(v)) return 'clamp'
  if (/^cubic-bezier\(/.test(v)) return 'easing'
  if (/^blur\(/.test(v)) return 'filter'
  if (/^var\(/.test(v)) return 'reference'
  if (/^-?\d+(\.\d+)?(px|em|rem|vw|vh|%|s|ms|deg)$/.test(v)) return 'dimension'
  if (/^-?\d+(\.\d+)?$/.test(v)) return 'number'
  if (v === 'linear' || v === 'none' || v === 'auto') return 'keyword'
  return 'text'
}

// ── Parse tokens.css into structured groups ──

export function parseTokens(css) {
  const groups = []
  let currentGroup = null

  const lines = css.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Detect section headers: /* ──... TITLE ...── */
    const sectionMatch = line.match(
      /^\s*\/\*\s*─+\s*$|^\s*─+\s*\*\/\s*$/
    )

    // Two-line section header pattern:
    // Line 1: /* ─────────
    // Line 2:    TITLE
    // Line 3: ─────────── */
    if (/^\s*\/\*\s*─+\s*$/.test(line)) {
      // Next non-empty line is the title
      let titleLine = ''
      let j = i + 1
      while (j < lines.length) {
        const candidate = lines[j].trim()
        if (candidate && !candidate.startsWith('─') && !candidate.endsWith('*/')) {
          titleLine = candidate
          break
        }
        j++
      }
      if (titleLine) {
        currentGroup = {
          id: titleLine.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
          label: titleLine,
          tokens: [],
          subgroups: [],
        }
        groups.push(currentGroup)
      }
      continue
    }

    // Detect sub-headers: /* Text */ or /* Canvas — main backgrounds */
    const subMatch = line.match(/^\s*\/\*\s*([A-Z][^*]+?)\s*\*\/\s*$/)
    if (subMatch && currentGroup) {
      currentGroup.subgroups.push({
        label: subMatch[1].trim(),
        startIndex: currentGroup.tokens.length,
      })
      continue
    }

    // Detect token declarations: --name: value;  /* optional comment */
    const tokenMatch = line.match(
      /^\s*(--[\w-]+)\s*:\s*(.+?)\s*;\s*(?:\/\*\s*(.+?)\s*\*\/)?\s*$/
    )
    if (tokenMatch && currentGroup) {
      const [, name, value, comment] = tokenMatch
      currentGroup.tokens.push({
        name,
        value: value.trim(),
        comment: comment?.trim() ?? '',
        type: inferType(name, value),
        line: i,
      })
    }
  }

  return groups
}

// ── Serialize: apply token changes back to CSS string ──
// Performs targeted line replacements, preserving all formatting and comments.

export function applyTokenChanges(originalCss, changes) {
  // changes: Map<tokenName, newValue> or array of { name, value }
  const changeMap = changes instanceof Map
    ? changes
    : new Map(changes.map((c) => [c.name, c.value]))

  if (changeMap.size === 0) return originalCss

  const lines = originalCss.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(
      /^(\s*)(--[\w-]+)(\s*:\s*)(.+?)(\s*;\s*(?:\/\*.*?\*\/)?\s*)$/
    )
    if (!match) continue
    const [, indent, name, sep, , suffix] = match
    if (changeMap.has(name)) {
      lines[i] = `${indent}${name}${sep}${changeMap.get(name)}${suffix}`
    }
  }

  return lines.join('\n')
}

// ── Build CSS override block for iframe injection ──

export function buildOverrideCSS(changes) {
  // changes: array of { name, value } or Map
  const entries = changes instanceof Map
    ? [...changes.entries()]
    : changes.map((c) => [c.name, c.value])

  if (entries.length === 0) return ''
  const declarations = entries.map(([name, value]) => `  ${name}: ${value};`).join('\n')
  return `:root {\n${declarations}\n}`
}
