export type EditorCommand =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'bullet-list'
  | 'numbered-list'
  | 'align-left'
  | 'align-center'
  | 'align-right'
  | 'align-justify'
  | 'link'

export interface EditorSelectionResult {
  selectionEnd: number
  selectionStart: number
  value: string
}

const PLACEHOLDERS: Record<EditorCommand, string> = {
  bold: 'texto en negrita',
  italic: 'texto en cursiva',
  underline: 'texto subrayado',
  'bullet-list': 'elemento de la lista',
  'numbered-list': 'elemento de la lista',
  'align-left': 'texto alineado',
  'align-center': 'texto alineado',
  'align-right': 'texto alineado',
  'align-justify': 'texto alineado',
  link: 'texto del enlace',
}

function replaceSelection(
  value: string,
  start: number,
  end: number,
  replacement: string,
  selectedStart: number,
  selectedEnd: number,
): EditorSelectionResult {
  return {
    value: `${value.slice(0, start)}${replacement}${value.slice(end)}`,
    selectionStart: start + selectedStart,
    selectionEnd: start + selectedEnd,
  }
}

function selectedLines(value: string, start: number, end: number) {
  const lineStart = value.lastIndexOf('\n', Math.max(0, start - 1)) + 1
  const nextBreak = value.indexOf('\n', end)
  const lineEnd = nextBreak === -1 ? value.length : nextBreak
  return { lineEnd, lineStart, text: value.slice(lineStart, lineEnd) }
}

export function applyEditorCommand(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  command: EditorCommand,
  linkUrl?: string,
): EditorSelectionResult {
  const selected = value.slice(selectionStart, selectionEnd)
  const text = selected || PLACEHOLDERS[command]

  if (command === 'bold' || command === 'italic' || command === 'underline') {
    const [prefix, suffix] =
      command === 'bold'
        ? ['**', '**']
        : command === 'italic'
          ? ['*', '*']
          : ['<u>', '</u>']
    return replaceSelection(
      value,
      selectionStart,
      selectionEnd,
      `${prefix}${text}${suffix}`,
      prefix.length,
      prefix.length + text.length,
    )
  }

  if (command === 'link') {
    const url = linkUrl?.trim() || 'https://'
    const replacement = `[${text}](${url})`
    return replaceSelection(
      value,
      selectionStart,
      selectionEnd,
      replacement,
      1,
      1 + text.length,
    )
  }

  if (command === 'bullet-list' || command === 'numbered-list') {
    const {
      lineEnd,
      lineStart,
      text: lines,
    } = selectedLines(value, selectionStart, selectionEnd)
    const source = lines || text
    const replacement = source
      .split('\n')
      .map((line, index) =>
        command === 'bullet-list'
          ? `- ${line.replace(/^[-*]\s+/, '')}`
          : `${index + 1}. ${line.replace(/^\d+[.)]\s+/, '')}`,
      )
      .join('\n')
    return replaceSelection(
      value,
      lineStart,
      lineEnd,
      replacement,
      0,
      replacement.length,
    )
  }

  const {
    lineEnd,
    lineStart,
    text: lines,
  } = selectedLines(value, selectionStart, selectionEnd)
  const alignment = command.replace('align-', '')
  const source = lines || text
  const replacement = `[align=${alignment}]\n${source}\n[/align]`
  const prefixLength = `[align=${alignment}]\n`.length
  return replaceSelection(
    value,
    lineStart,
    lineEnd,
    replacement,
    prefixLength,
    prefixLength + source.length,
  )
}
