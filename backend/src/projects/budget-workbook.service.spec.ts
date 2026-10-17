import { BadRequestException } from '@nestjs/common'
import ExcelJS from 'exceljs'
import type { IdeationAgentOutput } from '../orchestration/contracts/agent-output.schemas'
import { BudgetWorkbookService } from './budget-workbook.service'

const narrative = 'Justificación presupuestal trazable y verificable. '.repeat(
  10,
)

describe('BudgetWorkbookService', () => {
  const service = new BudgetWorkbookService()
  const budget = {
    currency: 'COP' as const,
    items: [
      {
        activity: '1.1 Levantar la línea base',
        activityIds: ['1.1'],
        category: 'Talento humano',
        description: 'Profesional de campo',
        fundingSource: null,
        id: 'B1',
        objective: 'Caracterizar la situación inicial',
        objectiveIds: ['OBJ-1'],
        quantity: 2,
        total: 4_000_000,
        unit: 'mes',
        unitCost: 2_000_000,
        valueStatus: 'estimated' as const,
      },
      {
        activity: '2.1 Implementar el piloto',
        activityIds: ['2.1'],
        category: 'Equipos',
        description: 'Equipo para el piloto',
        fundingSource: null,
        id: 'B2',
        objective: 'Implementar la solución priorizada',
        objectiveIds: ['OBJ-2'],
        quantity: 1,
        total: 3_000_000,
        unit: 'unidad',
        unitCost: 3_000_000,
        valueStatus: 'confirmed' as const,
      },
    ],
    narrative,
    total: 7_000_000,
    valueStatus: 'estimated' as const,
  }
  const ideation = {
    agent: 'ideation',
    components: {
      activities: {
        narrative,
        items: [
          {
            description: 'Levantar la línea base',
            deliverableIds: ['E1'],
            id: '1.1',
            indicatorIds: ['I1'],
            objectiveIds: ['OBJ-1'],
          },
          {
            description: 'Implementar el piloto',
            deliverableIds: ['E2'],
            id: '2.1',
            indicatorIds: ['I2'],
            objectiveIds: ['OBJ-2'],
          },
        ],
      },
      schedule: {
        narrative,
        items: [
          {
            activityId: '1.1',
            dependencies: [],
            endMonth: 1,
            startMonth: 1,
          },
          {
            activityId: '2.1',
            dependencies: ['1.1'],
            endMonth: 2,
            startMonth: 2,
          },
        ],
      },
      smartObjectives: {
        narrative,
        items: [
          {
            achievableRationale: 'Viable.',
            deadline: 'Mes 1',
            id: 'OBJ-1',
            indicatorIds: ['I1'],
            measurableTarget: 'Una línea base.',
            statement: 'Caracterizar la situación inicial',
          },
          {
            achievableRationale: 'Viable.',
            deadline: 'Mes 2',
            id: 'OBJ-2',
            indicatorIds: ['I2'],
            measurableTarget: 'Un piloto.',
            statement: 'Implementar la solución priorizada',
          },
        ],
      },
    },
    assumptions: [],
    clarificationQuestions: [],
    consistencyWarnings: [],
  } satisfies IdeationAgentOutput

  it('crea una pestaña por rubro y reimporta los valores editados', async () => {
    const exported = await service.export('Proyecto de prueba', budget)
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.load(Uint8Array.from(exported).buffer)

    expect(workbook.worksheets.map(({ name }) => name)).toEqual([
      'Talento humano',
      'Equipos',
    ])
    expect(workbook.getWorksheet('Talento humano')?.getCell('B2').text).toBe(
      '1.1 Levantar la línea base',
    )

    const personnel = workbook.getWorksheet('Talento humano')
    if (!personnel) throw new Error('Pestaña no encontrada')
    personnel.getCell('B2').value = '2.1 Implementar el piloto'
    personnel.getCell('E2').value = 2_500_000
    personnel.getCell('G2').value = 3
    const edited = Buffer.from(await workbook.xlsx.writeBuffer())
    const imported = await service.import(edited, budget, ideation)

    expect(imported.items[0]).toMatchObject({
      activity: '2.1 Implementar el piloto',
      activityIds: ['2.1'],
      objective: 'Implementar la solución priorizada',
      objectiveIds: ['OBJ-2'],
      quantity: 3,
      total: 7_500_000,
      unitCost: 2_500_000,
    })
    expect(imported.total).toBe(10_500_000)
    expect(imported.narrative).toContain('COP 10.500.000')
    expect(imported.narrative).toContain('Talento humano: COP 7.500.000')
    expect(imported.narrative).toContain('Equipos: COP 3.000.000')
    expect(imported.narrative).not.toBe(narrative)
  })

  it('rechaza archivos que no sean libros xlsx válidos', async () => {
    await expect(
      service.import(Buffer.from('contenido inválido'), budget, ideation),
    ).rejects.toThrow(
      'No fue posible leer el archivo. Sube el .xlsx descargado desde Ágora.',
    )
  })

  it('rechaza un libro con tamaño descomprimido anómalo antes de cargarlo', async () => {
    const exported = await service.export('Proyecto de prueba', budget)
    const unsafe = Buffer.from(exported)
    const centralDirectoryOffset = unsafe.indexOf(
      Buffer.from([0x50, 0x4b, 0x01, 0x02]),
    )
    if (centralDirectoryOffset < 0) {
      throw new Error('Directorio central no encontrado')
    }
    unsafe.writeUInt32LE(51 * 1024 * 1024, centralDirectoryOffset + 24)

    await expect(service.import(unsafe, budget, ideation)).rejects.toThrow(
      'demasiada información para procesarse de forma segura',
    )
  })

  it('rechaza encabezados modificados sin alterar el presupuesto de entrada', async () => {
    const workbook = await exportedWorkbook()
    const personnel = workbook.getWorksheet('Talento humano')
    if (!personnel) throw new Error('Pestaña no encontrada')
    personnel.getCell('D1').value = 'Detalle libre'

    await expect(importWorkbook(workbook)).rejects.toBeInstanceOf(
      BadRequestException,
    )
    expect(budget.total).toBe(7_000_000)
    expect(budget.items).toHaveLength(2)
  })

  it('rechaza libros con más de cuarenta filas presupuestales', async () => {
    const workbook = await exportedWorkbook()
    const personnel = workbook.getWorksheet('Talento humano')
    if (!personnel) throw new Error('Pestaña no encontrada')

    for (let index = 0; index < 40; index += 1) {
      personnel.addRow([
        'Caracterizar la situación inicial',
        '1.1 Levantar la línea base',
        'Talento humano',
        `Apoyo ${index + 1}`,
        100_000,
        'unidad',
        1,
        100_000,
        `B-EXTRA-${index + 1}`,
        'OBJ-1',
        '1.1',
        '',
        'estimated',
      ])
    }

    await expect(importWorkbook(workbook)).rejects.toThrow(
      'supera el máximo permitido de 40 filas presupuestales',
    )
  })

  it('rechaza libros con demasiadas pestañas', async () => {
    const workbook = await exportedWorkbook()
    for (let index = 0; index < 19; index += 1) {
      workbook.addWorksheet(`Adicional ${index + 1}`)
    }

    await expect(importWorkbook(workbook)).rejects.toThrow(
      'como máximo 20 pestañas presupuestales',
    )
  })

  it('rechaza pestañas con una expansión anómala de columnas', async () => {
    const workbook = await exportedWorkbook()
    const personnel = workbook.getWorksheet('Talento humano')
    if (!personnel) throw new Error('Pestaña no encontrada')
    personnel.getCell('U1').value = 'Columna no permitida'

    await expect(importWorkbook(workbook)).rejects.toThrow(
      'contiene demasiadas columnas',
    )
  })

  it('rechaza rubros mezclados dentro de una misma pestaña', async () => {
    const workbook = await exportedWorkbook()
    const personnel = workbook.getWorksheet('Talento humano')
    if (!personnel) throw new Error('Pestaña no encontrada')
    personnel.addRow([
      'Caracterizar la situación inicial',
      '1.1 Levantar la línea base',
      'Equipos',
      'Equipo agregado en la pestaña incorrecta',
      500_000,
      'unidad',
      1,
      500_000,
      'B-EXTRA',
      'OBJ-1',
      '1.1',
      '',
      'estimated',
    ])

    await expect(importWorkbook(workbook)).rejects.toThrow('mezcla rubros')
  })

  it('no confunde una versión decimal con el código de una actividad', async () => {
    const workbook = await exportedWorkbook()
    const personnel = workbook.getWorksheet('Talento humano')
    if (!personnel) throw new Error('Pestaña no encontrada')
    personnel.getCell('B2').value = 'Software versión 2.0 para el diagnóstico'

    const imported = await importWorkbook(workbook)

    expect(imported.items[0]).toMatchObject({
      activity: '1.1 Levantar la línea base',
      activityIds: ['1.1'],
      objectiveIds: ['OBJ-1'],
    })
  })

  it('reconoce varios códigos cuando cada actividad inicia un segmento', async () => {
    const workbook = await exportedWorkbook()
    const personnel = workbook.getWorksheet('Talento humano')
    if (!personnel) throw new Error('Pestaña no encontrada')
    personnel.getCell('B2').value =
      '1.1 Levantar la línea base; 2.1 Implementar el piloto'

    const imported = await importWorkbook(workbook)

    expect(imported.items[0]).toMatchObject({
      activityIds: ['1.1', '2.1'],
      objectiveIds: ['OBJ-1', 'OBJ-2'],
    })
  })

  async function exportedWorkbook(): Promise<ExcelJS.Workbook> {
    const exported = await service.export('Proyecto de prueba', budget)
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.load(Uint8Array.from(exported).buffer)
    return workbook
  }

  async function importWorkbook(workbook: ExcelJS.Workbook) {
    const edited = Buffer.from(await workbook.xlsx.writeBuffer())
    return service.import(edited, budget, ideation)
  }
})
