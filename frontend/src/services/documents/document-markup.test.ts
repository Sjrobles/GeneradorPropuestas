import { describe, expect, it } from 'vitest'

import {
  parseDocumentContent,
  parseInlineFormatting,
  stripDocumentFormatting,
} from './document-markup'

describe('document markup', () => {
  it('parses inline styles and safe links', () => {
    const segments = parseInlineFormatting(
      '**Negrita**, *cursiva*, <u>subrayado</u> y [fuente](https://example.com)',
    )

    expect(segments).toEqual([
      expect.objectContaining({ bold: true, content: 'Negrita' }),
      expect.objectContaining({ content: ', ' }),
      expect.objectContaining({ content: 'cursiva', italic: true }),
      expect.objectContaining({ content: ', ' }),
      expect.objectContaining({ content: 'subrayado', underline: true }),
      expect.objectContaining({ content: ' y ' }),
      expect.objectContaining({
        content: 'fuente',
        href: 'https://example.com',
      }),
    ])
  })

  it('combines nested styles without leaving markup in the content', () => {
    expect(
      parseInlineFormatting(
        '***Negrita y cursiva***, <u>**subrayada y negrita**</u> y **[fuente](https://example.com)**',
      ),
    ).toEqual([
      expect.objectContaining({
        bold: true,
        content: 'Negrita y cursiva',
        italic: true,
      }),
      expect.objectContaining({ content: ', ' }),
      expect.objectContaining({
        bold: true,
        content: 'subrayada y negrita',
        underline: true,
      }),
      expect.objectContaining({ content: ' y ' }),
      expect.objectContaining({
        bold: true,
        content: 'fuente',
        href: 'https://example.com',
      }),
    ])
  })

  it('parses alignment, bullets and numbering', () => {
    const blocks = parseDocumentContent(
      '[align=center]\nTítulo\n[/align]\n\n- Uno\n- Dos\n\n1. Tres',
    )
    expect(blocks[0]).toEqual(
      expect.objectContaining({ alignment: 'center', content: 'Título' }),
    )
    expect(blocks.map(({ type }) => type)).toEqual([
      'heading',
      'bullet',
      'bullet',
      'numbered',
    ])
  })

  it('removes Markdown markers from section headings', () => {
    const blocks = parseDocumentContent(
      '## **Marco teórico**\n\n### 1. Competencias digitales\n\n**Resultados esperados**',
    )

    expect(blocks).toEqual([
      expect.objectContaining({ content: 'Marco teórico', type: 'heading' }),
      expect.objectContaining({
        content: '1. Competencias digitales',
        type: 'heading',
      }),
      expect.objectContaining({
        content: 'Resultados esperados',
        type: 'heading',
      }),
    ])
  })

  it('parses a budget markdown table as structured rows', () => {
    const blocks = parseDocumentContent(
      'Moneda: COP\n\n| Objetivo | Actividad | Rubro | Total |\n| --- | --- | --- | ---: |\n| Caracterizar | Levantar línea base | Talento humano | $ 4.000.000 |',
    )
    const table = blocks.find(({ type }) => type === 'table')

    expect(table?.headers).toEqual(['Objetivo', 'Actividad', 'Rubro', 'Total'])
    expect(table?.rows).toEqual([
      ['Caracterizar', 'Levantar línea base', 'Talento humano', '$ 4.000.000'],
    ])
  })

  it('parses the schedule and Gantt as independent structured tables', () => {
    const blocks = parseDocumentContent(
      'Cronograma detallado\n\n| N.º | Actividad | Inicio | Fin |\n| --- | --- | --- | --- |\n| A1 | Levantar línea base | Mes 1 | Mes 2 |\n\nDiagrama de Gantt\n\n| Actividad | M1 | M2 | M3 |\n| --- | --- | --- | --- |\n| A1 · Levantar línea base | ● | ● | |',
    )
    const tables = blocks.filter(({ type }) => type === 'table')

    expect(tables).toHaveLength(2)
    expect(tables[0]?.headers).toEqual(['N.º', 'Actividad', 'Inicio', 'Fin'])
    expect(tables[1]?.headers).toEqual(['Actividad', 'M1', 'M2', 'M3'])
    expect(tables[1]?.rows).toEqual([
      ['A1 · Levantar línea base', '●', '●', ''],
    ])
  })

  it('strips portable markup for plain-text exports', () => {
    expect(
      stripDocumentFormatting(
        '[align=right]\n**Informe** con [fuente](https://example.com)\n[/align]',
      ),
    ).toBe('Informe con fuente')
  })
})
