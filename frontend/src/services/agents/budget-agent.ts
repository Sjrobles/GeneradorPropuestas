import { COMPONENT_TYPES } from '@/types/domain'

import type { AgentGenerationInput, FormulationSubagent } from './contracts'
import { requireContext } from './contracts'

export class BudgetAgent implements FormulationSubagent {
  generate({ context, executionDetails, type }: AgentGenerationInput) {
    if (type !== COMPONENT_TYPES.BUDGET) {
      throw new Error(`BudgetAgent no genera el componente ${type}.`)
    }
    const data = requireContext(context)
    const economicInformation =
      executionDetails?.knownEconomicInformation?.trim() ?? ''
    const match = economicInformation.match(
      /([\d.,]+)\s*(millones?|mill[oó]n|m)\b/i,
    )
    const parsedMillions = match
      ? Number(
          match[1].includes(',')
            ? match[1].replace(/\./g, '').replace(',', '.')
            : match[1],
        )
      : Number.NaN
    const explicitValues = [...economicInformation.matchAll(/[\d.,]+/g)]
      .map(({ 0: value }) => Number(value.replace(/[.,]/g, '')))
      .filter((value) => Number.isFinite(value) && value >= 1_000_000)
    const budgetCap = Number.isFinite(parsedMillions)
      ? Math.round(parsedMillions * 1_000_000)
      : Math.max(...explicitValues, 0) || 120_000_000
    const resources = [
      ['Talento humano', 'Coordinación técnica del proyecto', 'mes', 6, 0.18],
      [
        'Talento humano',
        'Servicios profesionales especializados',
        'mes',
        8,
        0.2,
      ],
      [
        'Servicios especializados',
        'Talleres técnicos y validación participativa',
        'jornada',
        6,
        0.12,
      ],
      [
        'Equipos',
        'Equipos y herramientas requeridos para la ejecución',
        'lote',
        1,
        0.16,
      ],
      [
        'Software y licencias',
        'Licencias, plataformas y soporte tecnológico',
        'mes',
        12,
        0.08,
      ],
      ['Transporte', 'Desplazamientos y trabajo de campo', 'salida', 8, 0.08],
      ['Materiales', 'Materiales e insumos de implementación', 'lote', 1, 0.08],
      [
        'Logística',
        'Producción, alimentación y cierre del proyecto',
        'lote',
        1,
        0.1,
      ],
    ] as const
    const rows = resources.map(
      ([category, description, unit, quantity, share], index) => {
        const objectiveNumber = (index % data.objectiveCount) + 1
        const activityNumber = (Math.floor(index / data.objectiveCount) % 2) + 1
        const activityId = `${objectiveNumber}.${activityNumber}`
        const unitCost = Math.round((budgetCap * share) / quantity)
        return {
          activity: `${activityId} Actividad vinculada al objetivo específico ${objectiveNumber}`,
          category,
          description,
          objective: `Objetivo ${objectiveNumber}`,
          quantity,
          total: unitCost * quantity,
          unit,
          unitCost,
        }
      },
    )
    const difference = budgetCap - rows.reduce((sum, row) => sum + row.total, 0)
    rows[rows.length - 1].unitCost += difference
    rows[rows.length - 1].total += difference
    const formatMoney = (value: number) =>
      new Intl.NumberFormat('es-CO', {
        currency: 'COP',
        maximumFractionDigits: 0,
        style: 'currency',
      }).format(value)
    const table = [
      '| Objetivo | Actividad | Rubro | Descripción | Costo unitario | Unidad | Cantidad | Total |',
      '| --- | --- | --- | --- | ---: | --- | ---: | ---: |',
      ...rows.map(
        (row) =>
          `| ${row.objective} | ${row.activity} | ${row.category} | ${row.description} | ${formatMoney(row.unitCost)} | ${row.unit} | ${row.quantity} | ${formatMoney(row.total)} |`,
      ),
      `|  |  |  | **TOTAL GENERAL** |  |  |  | **${formatMoney(budgetCap)}** |`,
    ].join('\n')

    return {
      type,
      content: `Moneda: COP\n\n${table}\n\nEl presupuesto se alinea con ${data.objectiveCount} objetivos, sus actividades y la metodología. ${economicInformation ? `Información económica aportada por el usuario: ${economicInformation}` : `Ante la ausencia de un tope confirmado, el simulador usa una estimación base explícita de ${formatMoney(budgetCap)}.`} Todos los valores son numéricos y el total general corresponde a la suma exacta de los ítems.`,
    }
  }
}
