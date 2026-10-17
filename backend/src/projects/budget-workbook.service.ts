import { BadRequestException, Injectable } from '@nestjs/common'
import ExcelJS from 'exceljs'
import {
  budgetComponentSchema,
  type BudgetAgentOutput,
  type IdeationAgentOutput,
} from '../orchestration/contracts/agent-output.schemas'
import { activityWithCode } from '../orchestration/application/activity-nomenclature'

export const BUDGET_WORKBOOK_MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024
const MAX_BUDGET_ITEMS = 40
const MAX_BUDGET_WORKSHEETS = 20
const MAX_WORKSHEET_COLUMNS = 20
const MAX_XLSX_ARCHIVE_ENTRIES = 1_000
const MAX_XLSX_UNCOMPRESSED_BYTES = 50 * 1024 * 1024
const VISIBLE_HEADERS = [
  'Objetivo',
  'Actividad',
  'Rubro',
  'Descripción',
  'Costo unitario',
  'Unidad',
  'Cantidad',
  'Total',
] as const
const TECHNICAL_HEADERS = [
  'ID',
  'IDs de objetivo',
  'IDs de actividad',
  'Fuente de financiación',
  'Estado del valor',
] as const

type Budget = BudgetAgentOutput['components']['budget']

interface WorkbookRow {
  activity: string
  activityIds: string[]
  category: string
  description: string
  fundingSource: string | null
  id: string
  objective: string
  objectiveIds: string[]
  quantity: number
  unit: string
  unitCost: number
  valueStatus: 'confirmed' | 'estimated'
}

@Injectable()
export class BudgetWorkbookService {
  async export(projectTitle: string, rawBudget: unknown): Promise<Buffer> {
    const budget = budgetComponentSchema.parse(rawBudget)
    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'Ágora'
    workbook.title = `Presupuesto — ${projectTitle}`
    workbook.subject = 'Presupuesto editable por rubros'
    workbook.created = new Date()
    workbook.calcProperties.fullCalcOnLoad = true

    const itemsByCategory = new Map<string, Budget['items']>()
    for (const item of budget.items) {
      const categoryItems = itemsByCategory.get(item.category) ?? []
      categoryItems.push(item)
      itemsByCategory.set(item.category, categoryItems)
    }

    const usedSheetNames = new Set<string>()
    let tableNumber = 0
    for (const [category, items] of itemsByCategory) {
      tableNumber += 1
      const worksheet = workbook.addWorksheet(
        uniqueSheetName(category, usedSheetNames),
        { views: [{ state: 'frozen', ySplit: 1 }] },
      )
      worksheet.properties.tabColor = { argb: 'FF315FE9' }
      worksheet.views = [{ showGridLines: false, state: 'frozen', ySplit: 1 }]

      worksheet.addTable({
        name: `BudgetCategory${tableNumber}`,
        ref: 'A1',
        headerRow: true,
        totalsRow: false,
        style: { showRowStripes: true, theme: 'TableStyleMedium2' },
        columns: VISIBLE_HEADERS.map((name) => ({ name })),
        rows: items.map((item, index) => {
          const rowNumber = index + 2
          return [
            item.objective,
            activityLabel(item),
            item.category,
            item.description,
            item.unitCost,
            item.unit,
            item.quantity,
            { formula: `E${rowNumber}*G${rowNumber}`, result: item.total },
          ]
        }),
      })

      worksheet.getRow(1).height = 28
      worksheet.getRow(1).font = {
        bold: true,
        color: { argb: 'FFFFFFFF' },
        name: 'Arial',
        size: 10,
      }
      worksheet.getRow(1).alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true,
      }
      worksheet.columns = [
        { key: 'objective', width: 36 },
        { key: 'activity', width: 42 },
        { key: 'category', width: 24 },
        { key: 'description', width: 48 },
        { key: 'unitCost', width: 18 },
        { key: 'unit', width: 16 },
        { key: 'quantity', width: 14 },
        { key: 'total', width: 18 },
        ...TECHNICAL_HEADERS.map((header) => ({
          header,
          hidden: true,
          width: 20,
        })),
      ]

      items.forEach((item, index) => {
        const rowNumber = index + 2
        const row = worksheet.getRow(rowNumber)
        row.font = { name: 'Arial', size: 10 }
        row.alignment = { vertical: 'top', wrapText: true }
        row.getCell(5).numFmt = '"$"#,##0;[Red]-"$"#,##0'
        row.getCell(7).numFmt = '#,##0.00'
        row.getCell(8).numFmt = '"$"#,##0;[Red]-"$"#,##0'
        row.getCell(9).value = item.id
        row.getCell(10).value = item.objectiveIds.join('|')
        row.getCell(11).value = item.activityIds.join('|')
        row.getCell(12).value = item.fundingSource ?? ''
        row.getCell(13).value = item.valueStatus
      })

      for (let columnNumber = 9; columnNumber <= 13; columnNumber += 1) {
        worksheet.getColumn(columnNumber).hidden = true
      }
      worksheet.autoFilter = `A1:H${items.length + 1}`
      worksheet.pageSetup = {
        fitToPage: true,
        fitToWidth: 1,
        orientation: 'landscape',
        paperSize: 9,
      }
    }

    const output = await workbook.xlsx.writeBuffer()
    return Buffer.from(output)
  }

  async import(
    file: Buffer,
    currentBudget: unknown,
    ideation?: IdeationAgentOutput,
  ): Promise<Budget> {
    if (!file.length) {
      throw new BadRequestException('El archivo Excel está vacío')
    }
    if (file[0] !== 0x50 || file[1] !== 0x4b) {
      throw new BadRequestException(
        'No fue posible leer el archivo. Sube el .xlsx descargado desde Ágora.',
      )
    }
    assertSafeXlsxArchive(file)

    const workbook = new ExcelJS.Workbook()
    try {
      await workbook.xlsx.load(Uint8Array.from(file).buffer)
    } catch {
      throw new BadRequestException(
        'No fue posible leer el archivo. Sube el .xlsx descargado desde Ágora.',
      )
    }
    if (workbook.worksheets.length > MAX_BUDGET_WORKSHEETS) {
      throw new BadRequestException(
        `El archivo puede contener como máximo ${MAX_BUDGET_WORKSHEETS} pestañas presupuestales.`,
      )
    }

    const existing = budgetComponentSchema.parse(currentBudget)
    const activitiesById = new Map(
      ideation?.components.activities.items.map((activity) => [
        activity.id,
        activity,
      ]) ?? [],
    )
    const objectivesById = new Map(
      ideation?.components.smartObjectives.items.map((objective) => [
        objective.id,
        objective,
      ]) ?? [],
    )
    const rows: WorkbookRow[] = []

    for (const worksheet of workbook.worksheets) {
      if (worksheet.actualRowCount === 0) continue
      if (worksheet.actualRowCount > MAX_BUDGET_ITEMS + 1) {
        throw new BadRequestException(
          `La pestaña «${worksheet.name}» supera el máximo permitido de ${MAX_BUDGET_ITEMS} filas presupuestales.`,
        )
      }
      if (worksheet.columnCount > MAX_WORKSHEET_COLUMNS) {
        throw new BadRequestException(
          `La pestaña «${worksheet.name}» contiene demasiadas columnas. Conserva las columnas del archivo generado por Ágora.`,
        )
      }
      this.assertHeaders(worksheet)
      let sheetCategory = ''

      for (
        let rowNumber = 2;
        rowNumber <= worksheet.actualRowCount;
        rowNumber += 1
      ) {
        const row = worksheet.getRow(rowNumber)
        if (rowIsEmpty(row)) continue
        if (rows.length >= MAX_BUDGET_ITEMS) {
          throw new BadRequestException(
            `El presupuesto puede contener como máximo ${MAX_BUDGET_ITEMS} filas.`,
          )
        }

        const category = requiredCellText(row, 3, 'Rubro', rowNumber)
        if (!sheetCategory) sheetCategory = category
        if (category !== sheetCategory) {
          throw new BadRequestException(
            `La pestaña «${worksheet.name}» mezcla rubros. Mueve cada gasto a la pestaña de su rubro.`,
          )
        }

        const rawActivity = requiredCellText(row, 2, 'Actividad', rowNumber)
        const hiddenActivityIds = splitIdentifiers(cellText(row, 11))
        const visibleActivityIds = activityCodes(rawActivity)
        const activityIds =
          visibleActivityIds.length > 0 ? visibleActivityIds : hiddenActivityIds
        const unknownActivity = activityIds.find(
          (activityId) => !activitiesById.has(activityId),
        )
        if (unknownActivity && activitiesById.size > 0) {
          throw new BadRequestException(
            `La actividad ${unknownActivity} de la fila ${rowNumber} no existe en la ideación del proyecto.`,
          )
        }

        const derivedObjectiveIds = Array.from(
          new Set(
            activityIds.flatMap(
              (activityId) =>
                activitiesById.get(activityId)?.objectiveIds ?? [],
            ),
          ),
        )
        const hiddenObjectiveIds = splitIdentifiers(cellText(row, 10))
        const objectiveIds =
          derivedObjectiveIds.length > 0
            ? derivedObjectiveIds
            : hiddenObjectiveIds
        const canonicalActivity =
          activityIds.length > 0
            ? activityIds
                .map((activityId) => {
                  const activity = activitiesById.get(activityId)
                  return activity
                    ? activityWithCode(activityId, activity.description)
                    : activityWithCode(activityId, rawActivity)
                })
                .join('; ')
            : rawActivity
        const rawObjective = requiredCellText(row, 1, 'Objetivo', rowNumber)
        const canonicalObjective =
          objectiveIds.length > 0
            ? objectiveIds
                .map(
                  (objectiveId) => objectivesById.get(objectiveId)?.statement,
                )
                .filter((value): value is string => Boolean(value))
                .join('; ') || rawObjective
            : rawObjective

        rows.push({
          activity: canonicalActivity,
          activityIds,
          category,
          description: requiredCellText(row, 4, 'Descripción', rowNumber),
          fundingSource: cellText(row, 12) || null,
          id: cellText(row, 9) || `B-XLSX-${rows.length + 1}`,
          objective: canonicalObjective,
          objectiveIds,
          quantity: requiredPositiveNumber(row, 7, 'Cantidad', rowNumber),
          unit: requiredCellText(row, 6, 'Unidad', rowNumber),
          unitCost: requiredNonnegativeNumber(
            row,
            5,
            'Costo unitario',
            rowNumber,
          ),
          valueStatus:
            cellText(row, 13).toLowerCase() === 'confirmed'
              ? 'confirmed'
              : 'estimated',
        })
      }
    }

    if (!rows.length) {
      throw new BadRequestException(
        'El archivo no contiene filas presupuestales para importar.',
      )
    }

    const usedIds = new Set<string>()
    const items = rows.map((row, index) => {
      let id = row.id
      if (usedIds.has(id)) id = `B-XLSX-${index + 1}`
      while (usedIds.has(id)) id = `${id}-${index + 1}`
      usedIds.add(id)
      return {
        ...row,
        id,
        total: row.unitCost * row.quantity,
      }
    })
    const valueStatus = items.every((item) => item.valueStatus === 'confirmed')
      ? ('confirmed' as const)
      : ('estimated' as const)
    const total = items.reduce((sum, item) => sum + item.total, 0)

    return budgetComponentSchema.parse({
      ...existing,
      items,
      narrative: importedBudgetNarrative(items, total),
      total,
      valueStatus,
    })
  }

  private assertHeaders(worksheet: ExcelJS.Worksheet): void {
    const headers = VISIBLE_HEADERS.map((_, index) =>
      normalizeHeader(cellText(worksheet.getRow(1), index + 1)),
    )
    const expected = VISIBLE_HEADERS.map(normalizeHeader)
    if (headers.some((header, index) => header !== expected[index])) {
      throw new BadRequestException(
        `La pestaña «${worksheet.name}» no conserva las ocho columnas del presupuesto de Ágora.`,
      )
    }
  }
}

function activityLabel(item: Budget['items'][number]): string {
  if (item.activityIds.length === 1 && /^\d+\.\d+$/.test(item.activityIds[0])) {
    return activityWithCode(item.activityIds[0], item.activity)
  }
  return item.activity
}

function activityCodes(value: string): string[] {
  const codes = value
    .split(/[;|\n]+/)
    .map((segment) => segment.trim().match(/^(\d+\.\d+)(?=\s|$|[:\-–—])/)?.[1])
    .filter((code): code is string => Boolean(code))
  return Array.from(new Set(codes))
}

function assertSafeXlsxArchive(file: Buffer): void {
  const minimumEndRecordSize = 22
  const maximumCommentSize = 65_535
  const firstPossibleEndRecord = Math.max(
    0,
    file.length - minimumEndRecordSize - maximumCommentSize,
  )
  let endRecordOffset = -1

  for (
    let offset = file.length - minimumEndRecordSize;
    offset >= firstPossibleEndRecord;
    offset -= 1
  ) {
    if (
      file.readUInt32LE(offset) === 0x06054b50 &&
      offset + minimumEndRecordSize + file.readUInt16LE(offset + 20) ===
        file.length
    ) {
      endRecordOffset = offset
      break
    }
  }

  if (endRecordOffset < 0) throw unreadableWorkbookException()

  const currentDisk = file.readUInt16LE(endRecordOffset + 4)
  const centralDirectoryDisk = file.readUInt16LE(endRecordOffset + 6)
  const entryCount = file.readUInt16LE(endRecordOffset + 10)
  const centralDirectorySize = file.readUInt32LE(endRecordOffset + 12)
  const centralDirectoryOffset = file.readUInt32LE(endRecordOffset + 16)

  if (
    currentDisk !== 0 ||
    centralDirectoryDisk !== 0 ||
    entryCount === 0xffff ||
    centralDirectorySize === 0xffffffff ||
    centralDirectoryOffset === 0xffffffff
  ) {
    throw workbookTooLargeException()
  }
  if (entryCount > MAX_XLSX_ARCHIVE_ENTRIES) {
    throw workbookTooLargeException()
  }

  const centralDirectoryEnd = centralDirectoryOffset + centralDirectorySize
  if (
    centralDirectoryOffset < 0 ||
    centralDirectoryEnd > endRecordOffset ||
    centralDirectoryEnd > file.length
  ) {
    throw unreadableWorkbookException()
  }

  let cursor = centralDirectoryOffset
  let uncompressedBytes = 0
  for (let entry = 0; entry < entryCount; entry += 1) {
    if (
      cursor + 46 > centralDirectoryEnd ||
      file.readUInt32LE(cursor) !== 0x02014b50
    ) {
      throw unreadableWorkbookException()
    }

    const uncompressedSize = file.readUInt32LE(cursor + 24)
    const fileNameLength = file.readUInt16LE(cursor + 28)
    const extraFieldLength = file.readUInt16LE(cursor + 30)
    const commentLength = file.readUInt16LE(cursor + 32)
    if (uncompressedSize === 0xffffffff) throw workbookTooLargeException()
    uncompressedBytes += uncompressedSize
    if (uncompressedBytes > MAX_XLSX_UNCOMPRESSED_BYTES) {
      throw workbookTooLargeException()
    }

    cursor += 46 + fileNameLength + extraFieldLength + commentLength
  }

  if (cursor !== centralDirectoryEnd) throw unreadableWorkbookException()
}

function unreadableWorkbookException(): BadRequestException {
  return new BadRequestException(
    'No fue posible leer el archivo. Sube el .xlsx descargado desde Ágora.',
  )
}

function workbookTooLargeException(): BadRequestException {
  return new BadRequestException(
    'El archivo Excel contiene demasiada información para procesarse de forma segura.',
  )
}

function splitIdentifiers(value: string): string[] {
  return value
    .split('|')
    .map((identifier) => identifier.trim())
    .filter(Boolean)
}

function importedBudgetNarrative(
  items: Budget['items'],
  total: number,
): string {
  const categoryTotals = new Map<string, number>()
  const activities = new Set<string>()
  for (const item of items) {
    categoryTotals.set(
      item.category,
      (categoryTotals.get(item.category) ?? 0) + item.total,
    )
    item.activityIds.forEach((activityId) => activities.add(activityId))
  }

  const categories = Array.from(
    categoryTotals,
    ([category, subtotal]) => `${category}: ${formatCop(subtotal)}`,
  ).join('; ')
  const activityList = Array.from(activities).sort(naturalIdentifierSort)

  return [
    `Este presupuesto fue actualizado a partir del archivo Excel importado por el usuario. La versión vigente contiene ${items.length} partidas distribuidas en ${categoryTotals.size} rubros y conserva la relación trazable entre cada gasto, su objetivo y las actividades del proyecto${activityList.length ? ` (${activityList.join(', ')})` : ''}.`,
    `La distribución recalculada por rubro es la siguiente: ${categories}. El total general vigente es ${formatCop(total)}.`,
    'Los costos unitarios, las cantidades y los totales que aparecen en la tabla siguiente sustituyen cualquier cifra de una versión anterior. Ágora recalculó cada total como costo unitario por cantidad y reorganizó las partidas según la pestaña de rubro en la que fueron cargadas. Los valores marcados como estimados deben validarse con cotizaciones antes de contratar, sin alterar la coherencia con la metodología y las actividades aprobadas.',
  ].join('\n\n')
}

function formatCop(value: number): string {
  return `COP ${new Intl.NumberFormat('es-CO', {
    maximumFractionDigits: 2,
  }).format(value)}`
}

function naturalIdentifierSort(left: string, right: string): number {
  return left.localeCompare(right, 'es', { numeric: true })
}

function normalizeHeader(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

function rowIsEmpty(row: ExcelJS.Row): boolean {
  return Array.from({ length: 8 }, (_, index) =>
    cellText(row, index + 1),
  ).every((value) => !value)
}

function cellText(row: ExcelJS.Row, column: number): string {
  return row.getCell(column).text.trim()
}

function requiredCellText(
  row: ExcelJS.Row,
  column: number,
  label: string,
  rowNumber: number,
): string {
  const value = cellText(row, column)
  if (!value) {
    throw new BadRequestException(
      `La fila ${rowNumber} no tiene un valor para «${label}».`,
    )
  }
  return value
}

function requiredPositiveNumber(
  row: ExcelJS.Row,
  column: number,
  label: string,
  rowNumber: number,
): number {
  const value = numericCellValue(row, column)
  if (!Number.isFinite(value) || value <= 0) {
    throw new BadRequestException(
      `La fila ${rowNumber} debe tener un valor numérico mayor que cero en «${label}».`,
    )
  }
  return value
}

function requiredNonnegativeNumber(
  row: ExcelJS.Row,
  column: number,
  label: string,
  rowNumber: number,
): number {
  const value = numericCellValue(row, column)
  if (!Number.isFinite(value) || value < 0) {
    throw new BadRequestException(
      `La fila ${rowNumber} debe tener un valor numérico válido en «${label}».`,
    )
  }
  return value
}

function numericCellValue(row: ExcelJS.Row, column: number): number {
  const value = row.getCell(column).value
  if (typeof value === 'number') return value
  if (
    value &&
    typeof value === 'object' &&
    'result' in value &&
    typeof value.result === 'number'
  ) {
    return value.result
  }

  const normalized = row
    .getCell(column)
    .text.replace(/[^\d,.-]/g, '')
    .trim()
  if (!normalized) return Number.NaN
  const comma = normalized.lastIndexOf(',')
  const dot = normalized.lastIndexOf('.')
  const separatorIndex = Math.max(comma, dot)
  const decimalDigits =
    separatorIndex >= 0 ? normalized.length - separatorIndex - 1 : 0
  const hasDecimal = decimalDigits > 0 && decimalDigits <= 2
  const integerPart = hasDecimal
    ? normalized.slice(0, separatorIndex)
    : normalized
  const decimalPart = hasDecimal ? normalized.slice(separatorIndex + 1) : ''
  return Number(
    `${integerPart.replace(/[.,]/g, '')}${decimalPart ? `.${decimalPart}` : ''}`,
  )
}

function uniqueSheetName(category: string, used: Set<string>): string {
  const base =
    category
      .replace(/[\\/*?:[\]]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim() || 'Rubro'
  let suffix = ''
  let attempt = 1
  let candidate = base.slice(0, 31)
  while (used.has(candidate.toLowerCase())) {
    attempt += 1
    suffix = ` (${attempt})`
    candidate = `${base.slice(0, 31 - suffix.length)}${suffix}`
  }
  used.add(candidate.toLowerCase())
  return candidate
}
