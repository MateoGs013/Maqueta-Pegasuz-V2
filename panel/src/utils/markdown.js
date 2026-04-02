const escapeHtml = (value) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')

const renderInline = (value) =>
  escapeHtml(value)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')

const isTableDivider = (line) =>
  /^\|?(?:\s*:?-{3,}:?\s*\|)+\s*:?-{3,}:?\s*\|?$/.test(line.trim())

const parseTableRow = (line) => {
  const trimmed = line.trim()
  const withoutEdgePipes = trimmed.replace(/^\|/, '').replace(/\|$/, '')
  return withoutEdgePipes.split('|').map((cell) => cell.trim())
}

const renderParagraph = (lines) => `<p>${renderInline(lines.join(' '))}</p>`

const renderList = (lines, ordered) => {
  const tag = ordered ? 'ol' : 'ul'
  const itemPattern = ordered ? /^\d+\.\s+/ : /^-\s+/
  const items = lines.map((line) => `<li>${renderInline(line.replace(itemPattern, '').trim())}</li>`)
  return `<${tag}>${items.join('')}</${tag}>`
}

const renderTable = (lines) => {
  const headers = parseTableRow(lines[0])
  const rows = lines.slice(2).map(parseTableRow)

  const headerHtml = headers.map((cell) => `<th>${renderInline(cell)}</th>`).join('')
  const bodyHtml = rows
    .map((row) => `<tr>${row.map((cell) => `<td>${renderInline(cell)}</td>`).join('')}</tr>`)
    .join('')

  return `<div class="table-shell"><table><thead><tr>${headerHtml}</tr></thead><tbody>${bodyHtml}</tbody></table></div>`
}

export const extractMarkdownTitle = (markdown) =>
  markdown
    .split(/\r?\n/)
    .find((line) => line.startsWith('# '))
    ?.replace(/^#\s+/, '')
    .trim() ?? 'Document'

export const splitMarkdownSections = (markdown) => {
  const lines = markdown.trim().split(/\r?\n/)
  const sections = []
  let current = null

  for (const line of lines) {
    if (line.startsWith('# ')) {
      continue
    }

    if (line.startsWith('## ')) {
      if (current) {
        sections.push({
          ...current,
          content: current.lines.join('\n').trim(),
        })
      }

      current = {
        title: line.replace(/^##\s+/, '').trim(),
        lines: [],
      }
      continue
    }

    if (!current) {
      current = {
        title: 'Overview',
        lines: [],
      }
    }

    current.lines.push(line)
  }

  if (current) {
    sections.push({
      ...current,
      content: current.lines.join('\n').trim(),
    })
  }

  return sections.filter((section) => section.content.length > 0)
}

export const renderMarkdown = (markdown) => {
  const lines = markdown.trim().split(/\r?\n/)
  const html = []

  for (let index = 0; index < lines.length; ) {
    const line = lines[index].trim()

    if (!line) {
      index += 1
      continue
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/)
    if (headingMatch) {
      const level = headingMatch[1].length
      html.push(`<h${level}>${renderInline(headingMatch[2])}</h${level}>`)
      index += 1
      continue
    }

    if (lines[index].includes('|') && lines[index + 1] && isTableDivider(lines[index + 1])) {
      const tableLines = [lines[index], lines[index + 1]]
      let cursor = index + 2

      while (cursor < lines.length && lines[cursor].includes('|') && lines[cursor].trim()) {
        tableLines.push(lines[cursor])
        cursor += 1
      }

      html.push(renderTable(tableLines))
      index = cursor
      continue
    }

    if (/^-\s+/.test(line)) {
      const listLines = []
      let cursor = index

      while (cursor < lines.length && /^-\s+/.test(lines[cursor].trim())) {
        listLines.push(lines[cursor].trim())
        cursor += 1
      }

      html.push(renderList(listLines, false))
      index = cursor
      continue
    }

    if (/^\d+\.\s+/.test(line)) {
      const listLines = []
      let cursor = index

      while (cursor < lines.length && /^\d+\.\s+/.test(lines[cursor].trim())) {
        listLines.push(lines[cursor].trim())
        cursor += 1
      }

      html.push(renderList(listLines, true))
      index = cursor
      continue
    }

    const paragraphLines = []
    let cursor = index

    while (
      cursor < lines.length &&
      lines[cursor].trim() &&
      !/^(#{1,6})\s+/.test(lines[cursor].trim()) &&
      !/^-\s+/.test(lines[cursor].trim()) &&
      !/^\d+\.\s+/.test(lines[cursor].trim()) &&
      !(lines[cursor].includes('|') && lines[cursor + 1] && isTableDivider(lines[cursor + 1]))
    ) {
      paragraphLines.push(lines[cursor].trim())
      cursor += 1
    }

    html.push(renderParagraph(paragraphLines))
    index = cursor
  }

  return html.join('')
}
