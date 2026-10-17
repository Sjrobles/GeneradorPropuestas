import {
  AlignmentType,
  Document,
  ExternalHyperlink,
  Footer,
  Header,
  HeadingLevel,
  LevelFormat,
  PageBreak,
  PageNumber,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableLayoutType,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
} from 'docx'
import { jsPDF } from 'jspdf'

import type { ProjectDocument } from '@/types/domain'
import {
  parseDocumentContent,
  parseInlineFormatting,
  stripDocumentFormatting,
  type DocumentTextAlignment,
  type ParsedDocumentBlock,
  type ParsedInlineSegment,
} from '@/services/documents/document-markup'

export type DocumentExportFormat = 'docx' | 'pdf'

const COLORS = {
  blue: '#3862E8',
  darkBlue: '#1E315F',
  ink: '#263550',
  muted: '#6D7890',
}

interface PdfInlineRun extends ParsedInlineSegment {
  text: string
  width: number
}

interface PdfInlineLine {
  runs: PdfInlineRun[]
  width: number
}

interface PdfRichTextOptions {
  alignment?: DocumentTextAlignment
  baseBold?: boolean
  boldColor?: string
  bullet?: boolean
  color?: string
  font?: 'helvetica' | 'times'
  fontSize?: number
  indent?: number
  label?: boolean
  lineHeight?: number
  number?: string
  spacingAfter?: number
}

function safeName(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
}

function cleanExportText(value: string) {
  return normalizeExportText(value).trim()
}

function normalizeExportText(value: string) {
  return value
    .replace(/[–—]/g, '-')
    .replace(/\u00a0/g, ' ')
    .replace(/\r\n/g, '\n')
}

function download(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const anchor = window.document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  anchor.style.display = 'none'
  window.document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000)
}

function inlineSegmentsForExport(text: string, detectLabel = true) {
  const label = detectLabel ? text.match(/^([^:\n]{2,52}):\s+([\s\S]+)$/) : null
  const source = label ? label[2] : text
  const segments = parseInlineFormatting(source)

  if (label) {
    segments.unshift({
      bold: true,
      content: `${label[1]}: `,
      italic: false,
      underline: false,
    })
  }

  return segments
}

function docxRuns(text: string) {
  const runs: Array<TextRun | ExternalHyperlink> = []

  inlineSegmentsForExport(text).forEach((segment) => {
    if (segment.href) {
      runs.push(
        new ExternalHyperlink({
          children: [
            new TextRun({
              bold: segment.bold,
              color: COLORS.blue.slice(1),
              italics: segment.italic,
              text: segment.content,
              underline: {},
            }),
          ],
          link: segment.href,
        }),
      )
      return
    }
    runs.push(
      new TextRun({
        bold: segment.bold,
        color: segment.bold ? COLORS.darkBlue.slice(1) : COLORS.ink.slice(1),
        italics: segment.italic,
        text: segment.content,
        underline: segment.underline ? {} : undefined,
      }),
    )
  })

  return runs
}

const BUDGET_COLUMN_WIDTHS = [14, 16, 10, 18, 13, 8, 8, 13] as const
const SCHEDULE_COLUMN_WIDTHS = [5, 17, 24, 8, 8, 8, 12, 18] as const

function isGanttTable(headers: string[]) {
  return (
    headers.length > 1 &&
    headers.slice(1).every((header) => /^M\d+$/.test(header))
  )
}

function compactGanttActivityLabel(value: string) {
  const summary = value
    .split(
      /\s+(?:Meta|Indicador|Fuente de verificación|Entregable|Target|Indicator|Verification source|Deliverable):/i,
    )[0]
    .replace(/\s+/g, ' ')
    .trim()
  if (summary.length <= 150) return summary
  const shortened = summary
    .slice(0, 147)
    .replace(/\s+\S*$/, '')
    .trim()
  return `${shortened || summary.slice(0, 147)}...`
}

function tableColumnWidths(headers: string[]): number[] {
  if (
    headers.length === BUDGET_COLUMN_WIDTHS.length &&
    headers.some((header) => ['Costo unitario', 'Unit cost'].includes(header))
  ) {
    return [...BUDGET_COLUMN_WIDTHS]
  }
  if (
    headers.length === SCHEDULE_COLUMN_WIDTHS.length &&
    headers.some((header) => ['Dependencias', 'Dependencies'].includes(header))
  ) {
    return [...SCHEDULE_COLUMN_WIDTHS]
  }
  if (isGanttTable(headers)) {
    const activityWidth = 32
    return [
      activityWidth,
      ...headers
        .slice(1)
        .map(() => (100 - activityWidth) / (headers.length - 1)),
    ]
  }
  return Array.from({ length: headers.length }, () => 100 / headers.length)
}

function buildDocxTable(block: ParsedDocumentBlock) {
  const headers = block.headers ?? []
  const rows = block.rows ?? []
  const gantt = isGanttTable(headers)
  const columnWidths = tableColumnWidths(headers)
  const tableRow = (cells: string[], header = false) =>
    new TableRow({
      cantSplit: true,
      tableHeader: header,
      children: cells.map(
        (cell, index) =>
          new TableCell({
            shading: header
              ? { fill: 'EAF1FF', type: ShadingType.CLEAR }
              : undefined,
            verticalAlign: VerticalAlign.CENTER,
            width: {
              size: columnWidths[index],
              type: WidthType.PERCENTAGE,
            },
            children: [
              new Paragraph({
                spacing: { after: 40, before: 40 },
                children: [
                  new TextRun({
                    bold: header,
                    color: header
                      ? COLORS.darkBlue.slice(1)
                      : COLORS.ink.slice(1),
                    size: header ? 16 : 15,
                    text: stripDocumentFormatting(
                      gantt && !header && index === 0
                        ? compactGanttActivityLabel(cell)
                        : cell,
                    ),
                  }),
                ],
              }),
            ],
          }),
      ),
    })

  return new Table({
    layout: TableLayoutType.FIXED,
    rows: [tableRow(headers, true), ...rows.map((row) => tableRow(row))],
    width: { size: 100, type: WidthType.PERCENTAGE },
  })
}

const docxAlignments = {
  center: AlignmentType.CENTER,
  justify: AlignmentType.JUSTIFIED,
  left: AlignmentType.LEFT,
  right: AlignmentType.RIGHT,
} as const satisfies Record<DocumentTextAlignment, string>

function buildDocx(document: ProjectDocument) {
  const generatedDate = new Date(document.generatedAt).toLocaleDateString(
    'es-CO',
    { day: 'numeric', month: 'long', year: 'numeric' },
  )
  const children: Array<Paragraph | Table> = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 1_800, after: 260 },
      children: [
        new TextRun({
          bold: true,
          color: COLORS.blue.slice(1),
          size: 22,
          text: 'ÁGORA · PROYECTO CTeI',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 220 },
      children: [
        new TextRun({
          bold: true,
          color: COLORS.darkBlue.slice(1),
          font: 'Georgia',
          size: 56,
          text: cleanExportText(document.title),
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 620 },
      children: [
        new TextRun({
          color: COLORS.muted.slice(1),
          italics: true,
          size: 24,
          text: 'Documento consolidado para formulación de proyectos',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
      children: [
        new TextRun({
          bold: true,
          color: COLORS.darkBlue.slice(1),
          text: `${document.sections.length} apartados · Idioma ${document.language.toUpperCase()}`,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          color: COLORS.muted.slice(1),
          text: `Generado el ${generatedDate}`,
        }),
      ],
    }),
    new Paragraph({ children: [new PageBreak()] }),
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [new TextRun({ text: 'Contenido del proyecto' })],
    }),
    ...document.sections.map(
      (section) =>
        new Paragraph({
          spacing: { after: 100 },
          children: [
            new TextRun({
              bold: true,
              color: COLORS.blue.slice(1),
              text: `${String(section.order).padStart(2, '0')}  `,
            }),
            new TextRun({ text: cleanExportText(section.title) }),
          ],
        }),
    ),
  ]

  document.sections.forEach((section) => {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        pageBreakBefore: true,
        keepNext: true,
        children: [
          new TextRun({
            color: COLORS.blue.slice(1),
            text: `${String(section.order).padStart(2, '0')}. `,
          }),
          new TextRun({ text: cleanExportText(section.title) }),
        ],
      }),
    )

    parseDocumentContent(section.content).forEach((block) => {
      if (block.type === 'table') {
        children.push(buildDocxTable(block), new Paragraph({ text: '' }))
        return
      }
      if (block.type === 'heading') {
        children.push(
          new Paragraph({
            alignment: docxAlignments[block.alignment],
            heading: HeadingLevel.HEADING_2,
            keepNext: true,
            children: [
              new TextRun({ text: stripDocumentFormatting(block.content) }),
            ],
          }),
        )
        return
      }

      children.push(
        new Paragraph({
          alignment: docxAlignments[block.alignment],
          bullet: block.type === 'bullet' ? { level: 0 } : undefined,
          numbering:
            block.type === 'numbered'
              ? {
                  reference: 'agora-numbering',
                  level: 0,
                  // Cada apartado usa una instancia independiente para que
                  // sus listas editables vuelvan a comenzar en 1.
                  instance: section.order,
                }
              : undefined,
          children: docxRuns(block.content),
        }),
      )
    })
  })

  return new Document({
    creator: 'Ágora',
    description: 'Documento consolidado de proyecto CTeI',
    title: cleanExportText(document.title),
    styles: {
      default: {
        document: {
          run: { font: 'Calibri', size: 22, color: COLORS.ink.slice(1) },
          paragraph: {
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 160, line: 320 },
          },
        },
      },
      paragraphStyles: [
        {
          id: 'Heading1',
          name: 'Heading 1',
          basedOn: 'Normal',
          next: 'Normal',
          quickFormat: true,
          run: {
            bold: true,
            color: COLORS.darkBlue.slice(1),
            font: 'Calibri',
            size: 32,
          },
          paragraph: { spacing: { before: 360, after: 200 }, keepNext: true },
        },
        {
          id: 'Heading2',
          name: 'Heading 2',
          basedOn: 'Normal',
          next: 'Normal',
          quickFormat: true,
          run: {
            bold: true,
            color: '2E74B5',
            font: 'Calibri',
            size: 26,
          },
          paragraph: { spacing: { before: 240, after: 120 }, keepNext: true },
        },
      ],
    },
    numbering: {
      config: [
        {
          reference: 'agora-numbering',
          levels: [
            {
              level: 0,
              format: LevelFormat.DECIMAL,
              text: '%1.',
              alignment: AlignmentType.START,
              style: {
                paragraph: {
                  indent: { left: 540, hanging: 280 },
                  spacing: { after: 80, line: 290 },
                },
                run: { bold: true, color: COLORS.blue.slice(1) },
              },
            },
          ],
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1_440,
              right: 1_440,
              bottom: 1_440,
              left: 1_440,
              header: 708,
              footer: 708,
            },
            size: { width: 12_240, height: 15_840 },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    bold: true,
                    color: COLORS.muted.slice(1),
                    size: 18,
                    text: 'ÁGORA · DOCUMENTO CONSOLIDADO',
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    color: COLORS.muted.slice(1),
                    size: 18,
                    children: [
                      'Página ',
                      PageNumber.CURRENT,
                      ' de ',
                      PageNumber.TOTAL_PAGES,
                    ],
                  }),
                ],
              }),
            ],
          }),
        },
        children,
      },
    ],
  })
}

export async function createDocxBlob(document: ProjectDocument) {
  return Packer.toBlob(buildDocx(document))
}

export function createPdfBlob(document: ProjectDocument) {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'letter',
  })
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const left = 72
  const right = 72
  const contentWidth = pageWidth - left - right
  const top = 78
  const bottom = 62
  let y = top

  const addPage = () => {
    pdf.addPage('letter', 'portrait')
    y = top
  }

  const ensureSpace = (required: number) => {
    if (y + required > pageHeight - bottom) addPage()
  }

  const fontStyleOf = (
    segment: ParsedInlineSegment,
    baseBold = false,
  ): 'bold' | 'bolditalic' | 'italic' | 'normal' => {
    const bold = baseBold || segment.bold
    if (bold && segment.italic) return 'bolditalic'
    if (bold) return 'bold'
    return segment.italic ? 'italic' : 'normal'
  }

  const applyPdfInlineStyle = (
    segment: ParsedInlineSegment,
    options: PdfRichTextOptions,
  ) => {
    const color = segment.href
      ? COLORS.blue
      : (options.baseBold || segment.bold) && options.boldColor
        ? options.boldColor
        : (options.color ?? COLORS.ink)
    pdf.setFont(options.font ?? 'times', fontStyleOf(segment, options.baseBold))
    pdf.setFontSize(options.fontSize ?? 10.8)
    pdf.setTextColor(color)
    return color
  }

  const layoutPdfLines = (
    text: string,
    maxWidth: number,
    options: PdfRichTextOptions,
  ): PdfInlineLine[] => {
    const lines: PdfInlineLine[] = []
    let line: PdfInlineLine = { runs: [], width: 0 }
    let pendingSpace: ParsedInlineSegment | undefined

    const runWidth = (runText: string, segment: ParsedInlineSegment) => {
      applyPdfInlineStyle(segment, options)
      return pdf.getTextWidth(runText)
    }
    const pushRun = (runText: string, segment: ParsedInlineSegment) => {
      const width = runWidth(runText, segment)
      line.runs.push({ ...segment, text: runText, width })
      line.width += width
    }
    const finishLine = () => {
      if (line.runs.length) lines.push(line)
      line = { runs: [], width: 0 }
    }

    const pushWord = (sourceWord: string, segment: ParsedInlineSegment) => {
      let word = sourceWord
      while (word) {
        const spaceSegment = line.runs.length > 0 ? pendingSpace : undefined
        const spaceWidth = spaceSegment ? runWidth(' ', spaceSegment) : 0
        const wordWidth = runWidth(word, segment)
        if (line.width + spaceWidth + wordWidth <= maxWidth) {
          if (spaceSegment) pushRun(' ', spaceSegment)
          pushRun(word, segment)
          pendingSpace = undefined
          return
        }
        if (line.runs.length) {
          finishLine()
          pendingSpace = undefined
          continue
        }

        let splitAt = 1
        for (let index = 2; index <= word.length; index += 1) {
          if (runWidth(word.slice(0, index), segment) > maxWidth) break
          splitAt = index
        }
        pushRun(word.slice(0, splitAt), segment)
        word = word.slice(splitAt)
        if (word) finishLine()
      }
    }

    inlineSegmentsForExport(
      normalizeExportText(text),
      options.label ?? true,
    ).forEach((segment) => {
      segment.content
        .split(/(\s+)/)
        .filter(Boolean)
        .forEach((token) => {
          if (/^\s+$/u.test(token)) pendingSpace = segment
          else pushWord(token, segment)
        })
    })
    finishLine()
    return lines.length ? lines : [{ runs: [], width: 0 }]
  }

  const drawRichText = (text: string, options: PdfRichTextOptions = {}) => {
    const indent = options.indent ?? 0
    const marker = options.number
      ? `${options.number}.`
      : options.bullet
        ? '•'
        : ''
    const hasMarker = Boolean(marker)
    const lineWidth = contentWidth - indent - (hasMarker ? 20 : 0)
    const lines = layoutPdfLines(text, lineWidth, options)
    const lineHeight = options.lineHeight ?? 16.5
    ensureSpace(Math.min(lines.length, 3) * lineHeight + 8)

    if (marker) {
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(COLORS.blue)
      pdf.text(marker, left + indent, y)
    }

    lines.forEach((line, lineIndex) => {
      if (y > pageHeight - bottom) addPage()
      const alignment = hasMarker ? 'left' : options.alignment
      let textX =
        alignment === 'center'
          ? pageWidth / 2
          : alignment === 'right'
            ? pageWidth - right
            : left + indent + (hasMarker ? 20 : 0)
      if (alignment === 'center') textX -= line.width / 2
      if (alignment === 'right') textX -= line.width

      const spaceCount = line.runs.filter(({ text }) => text === ' ').length
      const extraSpace =
        alignment === 'justify' &&
        lineIndex < lines.length - 1 &&
        spaceCount > 0
          ? Math.max(0, lineWidth - line.width) / spaceCount
          : 0

      line.runs.forEach((run) => {
        const color = applyPdfInlineStyle(run, options)
        if (run.href) {
          pdf.textWithLink(run.text, textX, y, { url: run.href })
        } else {
          pdf.text(run.text, textX, y)
        }
        if (run.underline || run.href) {
          pdf.setDrawColor(color)
          pdf.setLineWidth(0.45)
          pdf.line(textX, y + 1.6, textX + run.width, y + 1.6)
        }
        textX += run.width + (run.text === ' ' ? extraSpace : 0)
      })
      y += lineHeight
    })
    y += options.spacingAfter ?? 7
  }

  const drawParagraph = (
    text: string,
    options: {
      alignment?: DocumentTextAlignment
      bullet?: boolean
      indent?: number
      number?: string
    } = {},
  ) => {
    drawRichText(text, {
      ...options,
      boldColor: COLORS.darkBlue,
      color: COLORS.ink,
      font: 'times',
      fontSize: 10.8,
      lineHeight: 16.5,
    })
  }

  const drawSubheading = (text: string) => {
    y += 4
    drawRichText(text, {
      baseBold: true,
      boldColor: COLORS.blue,
      color: COLORS.blue,
      font: 'helvetica',
      fontSize: 11.5,
      label: false,
      lineHeight: 16,
      spacingAfter: 6,
    })
  }

  const drawTable = (block: ParsedDocumentBlock) => {
    const headers = block.headers ?? []
    const rows = block.rows ?? []
    if (!headers.length) return
    const gantt = isGanttTable(headers)
    const widths = tableColumnWidths(headers).map(
      (percentage) => (contentWidth * percentage) / 100,
    )

    const drawRow = (cells: string[], header = false, rowIndex = 0) => {
      pdf.setFont('helvetica', header ? 'bold' : 'normal')
      pdf.setFontSize(gantt ? (header ? 6.5 : 6.2) : header ? 5.5 : 5.1)
      const normalizedCells = cells.map((cell, index) =>
        stripDocumentFormatting(
          normalizeExportText(
            gantt && !header && index === 0
              ? compactGanttActivityLabel(cell)
              : cell,
          ),
        ),
      )
      const lineGroups = cells.map((_, index) =>
        gantt && !header && index > 0
          ? ['']
          : (pdf.splitTextToSize(
              normalizedCells[index],
              Math.max(12, widths[index] - 6),
            ) as string[]),
      )
      const rowHeight = Math.max(
        gantt ? 18 : 0,
        Math.max(1, ...lineGroups.map((lines) => lines.length)) *
          (gantt ? 7.2 : 6.2) +
          7,
      )

      if (y + rowHeight > pageHeight - bottom) {
        addPage()
        if (!header) drawRow(headers, true)
      }

      let x = left
      cells.forEach((_, index) => {
        const width = widths[index]
        if (![x, y, width, rowHeight].every(Number.isFinite)) {
          throw new Error(
            `Coordenadas inválidas en la tabla PDF: columna=${index}, columnas=${cells.length}, x=${x}, y=${y}, ancho=${width}, alto=${rowHeight}`,
          )
        }
        pdf.setFillColor(
          header ? '#EAF1FF' : rowIndex % 2 === 1 ? '#F8FAFF' : '#FFFFFF',
        )
        pdf.setDrawColor('#CFD9EB')
        pdf.rect(x, y, width, rowHeight, 'FD')
        const activeGanttCell =
          gantt && !header && index > 0 && normalizedCells[index].trim()
        if (activeGanttCell) {
          pdf.setFillColor(COLORS.blue)
          pdf.circle(x + width / 2, y + rowHeight / 2, 2.3, 'F')
        } else {
          pdf.setTextColor(header ? COLORS.darkBlue : COLORS.ink)
          pdf.text(
            lineGroups[index],
            gantt && index > 0 ? x + width / 2 : x + 3,
            y + (gantt ? 7.2 : 6.5),
            {
              align: gantt && index > 0 ? 'center' : 'left',
              baseline: 'top',
            },
          )
        }
        x += width
      })
      y += rowHeight
    }

    drawRow(headers, true)
    rows.forEach((row, rowIndex) => drawRow(row, false, rowIndex))
    y += 10
  }

  pdf.setFillColor(COLORS.darkBlue)
  pdf.rect(0, 0, pageWidth, 176, 'F')
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(11)
  pdf.setTextColor('#BFD0FF')
  pdf.text('ÁGORA · PROYECTO CTeI', pageWidth / 2, 78, { align: 'center' })
  pdf.setFont('times', 'bold')
  pdf.setFontSize(30)
  pdf.setTextColor('#FFFFFF')
  const titleLines = pdf.splitTextToSize(
    cleanExportText(document.title),
    contentWidth,
  ) as string[]
  pdf.text(titleLines, pageWidth / 2, 112, { align: 'center' })
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(12)
  pdf.setTextColor(COLORS.muted)
  pdf.text(
    'Documento consolidado para formulación de proyectos',
    pageWidth / 2,
    246,
    {
      align: 'center',
    },
  )
  pdf.setFontSize(10)
  pdf.text(
    `${document.sections.length} apartados · Idioma ${document.language.toUpperCase()}`,
    pageWidth / 2,
    276,
    { align: 'center' },
  )
  pdf.text(
    `Generado el ${new Date(document.generatedAt).toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })}`,
    pageWidth / 2,
    294,
    { align: 'center' },
  )

  addPage()
  document.sections.forEach((section) => {
    if (section.order > 1) addPage()
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(9)
    pdf.setTextColor(COLORS.blue)
    pdf.text(`APARTADO ${String(section.order).padStart(2, '0')}`, left, y)
    y += 24
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(21)
    pdf.setTextColor(COLORS.darkBlue)
    const headingLines = pdf.splitTextToSize(
      cleanExportText(section.title),
      contentWidth,
    ) as string[]
    pdf.text(headingLines, left, y)
    y += headingLines.length * 24 + 20

    parseDocumentContent(section.content).forEach((block) => {
      if (block.type === 'table') drawTable(block)
      else if (block.type === 'heading') drawSubheading(block.content)
      else
        drawParagraph(block.content, {
          alignment: block.alignment,
          bullet: block.type === 'bullet',
          indent: block.type === 'numbered' ? 8 : 0,
          number: block.number,
        })
    })
  })

  const totalPages = pdf.getNumberOfPages()
  for (let page = 1; page <= totalPages; page += 1) {
    pdf.setPage(page)
    if (page > 1) {
      pdf.setDrawColor('#DDE3EE')
      pdf.line(left, 48, pageWidth - right, 48)
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(8)
      pdf.setTextColor(COLORS.muted)
      pdf.text('ÁGORA · DOCUMENTO CONSOLIDADO', left, 37)
    }
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(8.5)
    pdf.setTextColor(COLORS.muted)
    pdf.text(
      `Página ${page} de ${totalPages}`,
      pageWidth / 2,
      pageHeight - 30,
      {
        align: 'center',
      },
    )
  }

  return pdf.output('blob')
}

export async function downloadProjectDocument(
  document: ProjectDocument,
  format: DocumentExportFormat,
) {
  const blob =
    format === 'pdf' ? createPdfBlob(document) : await createDocxBlob(document)
  download(blob, `${safeName(document.title) || 'proyecto-agora'}.${format}`)
}
