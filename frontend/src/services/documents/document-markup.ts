export type DocumentTextAlignment = 'left' | 'center' | 'right' | 'justify'

export interface ParsedDocumentBlock {
  alignment: DocumentTextAlignment
  content: string
  headers?: string[]
  number?: string
  rows?: string[][]
  type: 'bullet' | 'heading' | 'numbered' | 'paragraph' | 'table'
}

export interface ParsedInlineSegment {
  bold: boolean
  content: string
  href?: string
  italic: boolean
  underline: boolean
}

interface InlineStyle {
  bold: boolean
  italic: boolean
  underline: boolean
}

const EMPTY_STYLE: InlineStyle = {
  bold: false,
  italic: false,
  underline: false,
}

function sameInlineStyle(
  left: ParsedInlineSegment,
  right: ParsedInlineSegment,
) {
  return (
    left.bold === right.bold &&
    left.href === right.href &&
    left.italic === right.italic &&
    left.underline === right.underline
  )
}

function pushInlineSegment(
  segments: ParsedInlineSegment[],
  segment: ParsedInlineSegment,
) {
  if (!segment.content) return
  const previous = segments.at(-1)
  if (previous && sameInlineStyle(previous, segment)) {
    previous.content += segment.content
    return
  }
  segments.push(segment)
}

function parseInlineRange(
  text: string,
  style: InlineStyle,
  href?: string,
): ParsedInlineSegment[] {
  const segments: ParsedInlineSegment[] = []
  let plainText = ''
  let index = 0

  const flushPlainText = () => {
    pushInlineSegment(segments, { ...style, content: plainText, href })
    plainText = ''
  }

  const pushNested = (
    content: string,
    nestedStyle: InlineStyle,
    nestedHref = href,
  ) => {
    parseInlineRange(content, nestedStyle, nestedHref).forEach((segment) =>
      pushInlineSegment(segments, segment),
    )
  }

  while (index < text.length) {
    const remaining = text.slice(index)
    const link = remaining.match(/^\[([^\]]+)]\((https?:\/\/[^)\s]+)\)/)
    if (link) {
      flushPlainText()
      pushNested(link[1], style, link[2])
      index += link[0].length
      continue
    }

    if (remaining.startsWith('<u>')) {
      const closing = text.indexOf('</u>', index + 3)
      if (closing >= 0) {
        flushPlainText()
        pushNested(text.slice(index + 3, closing), {
          ...style,
          underline: true,
        })
        index = closing + 4
        continue
      }
    }

    const delimiters: Array<{
      marker: string
      style: InlineStyle
    }> = [
      {
        marker: '***',
        style: { ...style, bold: true, italic: true },
      },
      { marker: '**', style: { ...style, bold: true } },
      { marker: '*', style: { ...style, italic: true } },
    ]
    const delimiter = delimiters.find(({ marker }) => {
      if (!remaining.startsWith(marker)) return false
      return text.indexOf(marker, index + marker.length) >= 0
    })
    if (delimiter) {
      const closing = text.indexOf(
        delimiter.marker,
        index + delimiter.marker.length,
      )
      flushPlainText()
      pushNested(
        text.slice(index + delimiter.marker.length, closing),
        delimiter.style,
      )
      index = closing + delimiter.marker.length
      continue
    }

    plainText += text[index]
    index += 1
  }

  flushPlainText()
  return segments
}

export function parseInlineFormatting(text: string): ParsedInlineSegment[] {
  return parseInlineRange(text, EMPTY_STYLE)
}

export function stripDocumentFormatting(text: string): string {
  return text
    .replace(/\[align=(?:left|center|right|justify)]\s*/g, '')
    .replace(/\s*\[\/align]/g, '')
    .split('\n')
    .map((line) =>
      parseInlineFormatting(line)
        .map(({ content }) => content)
        .join(''),
    )
    .join('\n')
}

function looksLikeHeading(text: string) {
  const normalized = stripDocumentFormatting(text).trim()
  return (
    !normalized.includes('\n') &&
    normalized.length > 2 &&
    normalized.length <= 86 &&
    !/[.!?;:]$/.test(normalized) &&
    !/^\d+[.)]\s/.test(normalized) &&
    !/^[-*]\s/.test(normalized)
  )
}

function normalizeHeadingContent(text: string) {
  const withoutHeadingMarkers = text
    .trim()
    .replace(/^\s{0,3}#{1,6}\s*/, '')
    .replace(/\s+#{1,6}\s*$/, '')
    .replace(/^(?:\*{1,3}|_{1,3})\s*/, '')
    .replace(/\s*(?:\*{1,3}|_{1,3})$/, '')

  return stripDocumentFormatting(withoutHeadingMarkers).trim()
}

function splitMarkdownRow(line: string): string[] {
  const cells: string[] = []
  let current = ''
  let escaped = false
  for (const character of line.trim().replace(/^\|/, '').replace(/\|$/, '')) {
    if (escaped) {
      current += character
      escaped = false
    } else if (character === '\\') {
      escaped = true
    } else if (character === '|') {
      cells.push(current.trim())
      current = ''
    } else {
      current += character
    }
  }
  cells.push(current.trim())
  return cells
}

function parseMarkdownTable(
  content: string,
  alignment: DocumentTextAlignment,
): ParsedDocumentBlock | undefined {
  const lines = content
    .trim()
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
  if (lines.length < 2 || !lines.every((line) => line.startsWith('|'))) {
    return undefined
  }
  const headers = splitMarkdownRow(lines[0])
  const separators = splitMarkdownRow(lines[1])
  if (
    headers.length !== separators.length ||
    !separators.every((cell) => /^:?-{3,}:?$/.test(cell))
  ) {
    return undefined
  }
  const rows = lines
    .slice(2)
    .map(splitMarkdownRow)
    .filter((row) => row.length === headers.length)

  return {
    alignment,
    content: '',
    headers,
    rows,
    type: 'table',
  }
}

function parseBlockGroup(
  content: string,
  alignment: DocumentTextAlignment,
): ParsedDocumentBlock[] {
  return content
    .trim()
    .split(/\n{2,}/)
    .flatMap((block) => {
      const lines = block
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
      return lines.some((line) => /^(?:\d+[.)]|[-*])\s+/.test(line))
        ? lines
        : [block]
    })
    .filter((block) => block.trim())
    .flatMap((rawContent) => {
      const normalized = rawContent.trim()
      const table = parseMarkdownTable(normalized, alignment)
      if (table) return [table]
      const numbered = normalized.match(/^(\d+)[.)]\s+([\s\S]+)$/)
      if (numbered) {
        return [
          {
            alignment,
            content: numbered[2],
            number: numbered[1],
            type: 'numbered' as const,
          },
        ]
      }
      const bullet = normalized.match(/^[-*]\s+([\s\S]+)$/)
      if (bullet) {
        return [
          {
            alignment,
            content: bullet[1],
            type: 'bullet' as const,
          },
        ]
      }
      const heading =
        /^\s{0,3}#{1,6}(?:\s+|$)/.test(normalized) ||
        looksLikeHeading(normalized)
      return [
        {
          alignment,
          content: heading ? normalizeHeadingContent(normalized) : normalized,
          type: heading ? ('heading' as const) : ('paragraph' as const),
        },
      ]
    })
}

export function parseDocumentContent(content: string): ParsedDocumentBlock[] {
  const groups: Array<{ alignment: DocumentTextAlignment; content: string }> =
    []
  const pattern =
    /\[align=(left|center|right|justify)]\s*\n?([\s\S]*?)\n?\s*\[\/align]/g
  let cursor = 0

  for (const match of content.matchAll(pattern)) {
    const index = match.index ?? 0
    if (index > cursor) {
      groups.push({
        alignment: 'justify',
        content: content.slice(cursor, index),
      })
    }
    groups.push({
      alignment: match[1] as DocumentTextAlignment,
      content: match[2],
    })
    cursor = index + match[0].length
  }
  if (cursor < content.length) {
    groups.push({ alignment: 'justify', content: content.slice(cursor) })
  }
  if (!groups.length) groups.push({ alignment: 'justify', content })

  return groups.flatMap(({ alignment, content: groupContent }) =>
    parseBlockGroup(groupContent, alignment),
  )
}
