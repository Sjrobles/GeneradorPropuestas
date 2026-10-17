import { describe, expect, it } from 'vitest'

import type { ProjectDocument } from '@/types/domain'

import { createDocxBlob, createPdfBlob } from './document-download'

function blobBytes(blob: Blob) {
  return new Promise<Uint8Array>((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () =>
      reject(reader.error ?? new Error('No fue posible leer el archivo'))
    reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer))
    reader.readAsArrayBuffer(blob)
  })
}

const documentFixture: ProjectDocument = {
  content: '1. MARCO TEÓRICO\n\nContenido académico verificable.',
  generatedAt: '2026-08-18T12:00:00.000Z',
  id: 'document-id',
  language: 'es',
  projectId: 'project-id',
  sections: [
    {
      componentId: 'component-id',
      content:
        'Este párrafo contiene **negrilla**, *cursiva*, ***negrilla y cursiva***, <u>subrayado</u> y una [fuente](https://example.com).\n\nAplicación en el proyecto\n\n1. Primera actividad verificable.\n\n| Objetivo | Actividad | Rubro | Descripción | Costo unitario | Unidad | Cantidad | Total |\n| --- | --- | --- | --- | ---: | --- | ---: | ---: |\n| Caracterizar | Levantar línea base | Talento humano | Profesional agrícola | $ 2.000.000 | mes | 2 | $ 4.000.000 |',
      id: 'theoretical_framework',
      order: 1,
      title: 'Marco teórico',
    },
  ],
  status: 'ready',
  title: 'Proyecto Ágora de prueba',
}

const wideTable = `| ${Array.from({ length: 13 }, (_, index) => `Columna ${index + 1}`).join(' | ')} |
| ${Array.from({ length: 13 }, () => '---').join(' | ')} |
${Array.from(
  { length: 35 },
  (_, row) =>
    `| ${Array.from({ length: 13 }, (_, column) => `Dato extenso ${row + 1}.${column + 1} para validar paginación`).join(' | ')} |`,
).join('\n')}`

const ganttTable = `## **Diagrama de Gantt**

| Actividad | M1 | M2 | M3 | M4 |
| --- | --- | --- | --- | --- |
| A1 · Caracterizar la población participante | ● | ● | | |
| A2 · Implementar y validar el piloto | | ● | ● | ● |`

describe('document-download', () => {
  it('genera un PDF binario válido', async () => {
    const blob = createPdfBlob(documentFixture)
    const bytes = await blobBytes(blob)
    const signature = new TextDecoder().decode(bytes.slice(0, 5))
    const pdfSource = new TextDecoder('latin1').decode(bytes)

    expect(blob.type).toBe('application/pdf')
    expect(signature).toBe('%PDF-')
    expect(blob.size).toBeGreaterThan(1_000)
    expect(pdfSource).toContain('/F10 10.8 Tf')
    expect(pdfSource).toContain('/F11 10.8 Tf')
    expect(pdfSource).toContain('/F12 10.8 Tf')
    expect(pdfSource).toContain('/URI (https://example.com)')
  })

  it('genera un DOCX editable basado en OOXML', async () => {
    const blob = await createDocxBlob(documentFixture)
    const signature = (await blobBytes(blob)).slice(0, 2)

    expect(blob.type).toContain(
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    )
    expect(Array.from(signature)).toEqual([0x50, 0x4b])
    expect(blob.size).toBeGreaterThan(5_000)
  })

  it('pagina tablas anchas y extensas sin producir coordenadas inválidas', async () => {
    const documentWithWideTable: ProjectDocument = {
      ...documentFixture,
      sections: [
        {
          ...documentFixture.sections[0],
          content: `Resumen financiero.\n\n${wideTable}`,
        },
      ],
    }

    const pdf = createPdfBlob(documentWithWideTable)
    const docx = await createDocxBlob(documentWithWideTable)

    expect(pdf.type).toBe('application/pdf')
    expect(pdf.size).toBeGreaterThan(5_000)
    expect(docx.type).toContain(
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    )
    expect(docx.size).toBeGreaterThan(5_000)
  })

  it('exporta encabezados limpios y un Gantt sin depender del glifo Unicode', async () => {
    const ganttDocument: ProjectDocument = {
      ...documentFixture,
      sections: [
        {
          ...documentFixture.sections[0],
          content: ganttTable,
          id: 'schedule',
          title: 'Cronograma',
        },
      ],
    }

    const pdf = createPdfBlob(ganttDocument)
    const source = new TextDecoder('latin1').decode(await blobBytes(pdf))

    expect(pdf.type).toBe('application/pdf')
    expect(pdf.size).toBeGreaterThan(1_000)
    expect(source).not.toContain('##')
    expect(source).not.toContain('●')
  })
})
