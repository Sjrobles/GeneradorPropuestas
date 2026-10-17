import { describe, expect, it } from 'vitest'

import { applyEditorCommand } from './editor-formatting'

describe('editor formatting', () => {
  it('applies inline emphasis to the selected text', () => {
    expect(applyEditorCommand('Texto importante', 6, 16, 'bold').value).toBe(
      'Texto **importante**',
    )
    expect(applyEditorCommand('Texto claro', 6, 11, 'italic').value).toBe(
      'Texto *claro*',
    )
    expect(applyEditorCommand('Texto clave', 6, 11, 'underline').value).toBe(
      'Texto <u>clave</u>',
    )
  })

  it('converts selected lines into numbered and bulleted lists', () => {
    expect(applyEditorCommand('Uno\nDos', 0, 7, 'bullet-list').value).toBe(
      '- Uno\n- Dos',
    )
    expect(applyEditorCommand('Uno\nDos', 0, 7, 'numbered-list').value).toBe(
      '1. Uno\n2. Dos',
    )
  })

  it('persists alignment and links with portable markup', () => {
    expect(applyEditorCommand('Título', 0, 6, 'align-center').value).toBe(
      '[align=center]\nTítulo\n[/align]',
    )
    expect(
      applyEditorCommand(
        'Consulta la fuente',
        12,
        18,
        'link',
        'https://example.com',
      ).value,
    ).toBe('Consulta la [fuente](https://example.com)')
  })
})
