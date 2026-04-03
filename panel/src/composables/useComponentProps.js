// ── Extract defineProps from a .vue file's <script setup> ──

function extractScriptSetup(source) {
  const match = source.match(/<script\s+setup[^>]*>([\s\S]*?)<\/script>/)
  return match ? match[1] : ''
}

// Find the defineProps({...}) call and extract the object literal as raw text
function extractPropsObject(script) {
  const idx = script.indexOf('defineProps(')
  if (idx === -1) return ''

  // Find the opening { after defineProps(
  let start = script.indexOf('{', idx)
  if (start === -1) return ''

  // Balance braces to find the matching }
  let depth = 0
  let end = start
  for (let i = start; i < script.length; i++) {
    if (script[i] === '{') depth++
    else if (script[i] === '}') {
      depth--
      if (depth === 0) { end = i; break }
    }
  }

  return script.slice(start, end + 1)
}

// Parse individual prop entries from the raw object text
function parsePropEntries(objText) {
  const props = []
  // Match: propName: { type: Type, default: value }
  // or propName: { type: Type, default: () => value }
  const propPattern = /(\w+)\s*:\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)\}/g
  let m

  while ((m = propPattern.exec(objText)) !== null) {
    const name = m[1]
    const body = m[2]

    // Extract type
    const typeMatch = body.match(/type\s*:\s*(\w+)/)
    const type = typeMatch ? typeMatch[1] : 'String'

    // Extract default value
    let defaultValue = ''
    let defaultRaw = ''

    // Arrow function default: default: () => [...]  or  default: () => ({...})
    const arrowMatch = body.match(/default\s*:\s*\(\)\s*=>\s*([\s\S]+)$/)
    if (arrowMatch) {
      defaultRaw = arrowMatch[1].trim()
      // Remove trailing comma if present
      if (defaultRaw.endsWith(',')) defaultRaw = defaultRaw.slice(0, -1).trim()
      try {
        defaultValue = JSON.parse(defaultRaw.replace(/'/g, '"').replace(/,\s*([}\]])/g, '$1'))
      } catch {
        defaultValue = defaultRaw
      }
    } else {
      // Simple default: default: 'value' or default: 123
      const simpleMatch = body.match(/default\s*:\s*(.+?)(?:\s*,\s*$|\s*$)/m)
      if (simpleMatch) {
        defaultRaw = simpleMatch[1].trim()
        if (defaultRaw.endsWith(',')) defaultRaw = defaultRaw.slice(0, -1).trim()
        // Try to parse as literal
        if (defaultRaw.startsWith("'") || defaultRaw.startsWith('"')) {
          defaultValue = defaultRaw.slice(1, -1)
        } else if (defaultRaw === 'true' || defaultRaw === 'false') {
          defaultValue = defaultRaw === 'true'
        } else if (!isNaN(Number(defaultRaw))) {
          defaultValue = Number(defaultRaw)
        } else {
          defaultValue = defaultRaw
        }
      }
    }

    // Infer editor type
    let editorType = 'text'
    if (type === 'Boolean') editorType = 'toggle'
    else if (type === 'Number') editorType = 'number'
    else if (type === 'Array' || type === 'Object') editorType = 'json'
    else if (type === 'String') {
      if (typeof defaultValue === 'string' && defaultValue.includes('\n')) editorType = 'textarea'
      else if (name.toLowerCase().includes('color') || name.toLowerCase().includes('bg')) editorType = 'color'
      else editorType = 'text'
    }

    props.push({
      name,
      type,
      default: defaultValue,
      defaultRaw,
      editorType,
    })
  }

  return props
}

// ── Main export ──

export function parseComponentProps(source) {
  const script = extractScriptSetup(source)
  const objText = extractPropsObject(script)
  return parsePropEntries(objText)
}

// ── Apply prop default changes back to .vue source ──

export function applyPropChanges(source, changes) {
  // changes: Map<propName, newDefaultValue> or array of { name, value }
  const changeMap = changes instanceof Map
    ? changes
    : new Map(changes.map((c) => [c.name, c.value]))

  if (changeMap.size === 0) return source

  let result = source

  for (const [propName, newValue] of changeMap) {
    // Find: propName: { ... default: 'oldValue' ... }
    // and replace the default value
    const serialized = typeof newValue === 'string'
      ? `'${newValue.replace(/'/g, "\\'")}'`
      : JSON.stringify(newValue)

    // Match the default value within this prop's definition
    // This regex finds:  propName: { ... default: SOMETHING
    const propRegex = new RegExp(
      `(${propName}\\s*:\\s*\\{[^}]*?default\\s*:\\s*)([^,}]+)`,
      's'
    )

    result = result.replace(propRegex, (match, prefix, oldDefault) => {
      // If it was an arrow function default, keep the arrow
      if (oldDefault.trim().startsWith('()')) return match
      return prefix + serialized
    })
  }

  return result
}
