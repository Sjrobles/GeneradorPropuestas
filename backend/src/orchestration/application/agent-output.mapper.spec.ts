import { mapAgentOutputToComponents } from './agent-output.mapper'
import type {
  BudgetAgentOutput,
  IdeationAgentOutput,
} from '../contracts/agent-output.schemas'

describe('mapAgentOutputToComponents', () => {
  it('convierte el cronograma estructurado en tabla detallada y Gantt', () => {
    const output: IdeationAgentOutput = {
      agent: 'ideation',
      assumptions: [],
      clarificationQuestions: [],
      consistencyWarnings: [],
      components: {
        activities: {
          narrative: 'Las actividades siguen una secuencia verificable.',
          items: [
            {
              description: 'Levantar la línea base territorial.',
              deliverableIds: ['E1'],
              id: 'A1',
              indicatorIds: ['I1'],
              objectiveIds: ['O1'],
            },
            {
              description: 'Implementar y validar el piloto.',
              deliverableIds: ['E2'],
              id: 'A2',
              indicatorIds: ['I2'],
              objectiveIds: ['O2'],
            },
          ],
        },
        schedule: {
          narrative:
            'El levantamiento precede al piloto y permite validar su ejecución.',
          items: [
            {
              activityId: 'A1',
              dependencies: [],
              endMonth: 2,
              startMonth: 1,
            },
            {
              activityId: 'A2',
              dependencies: ['A1'],
              endMonth: 13,
              startMonth: 3,
            },
          ],
        },
        smartObjectives: {
          narrative: 'Los objetivos orientan la ejecución.',
          items: [
            {
              achievableRationale: 'Existen capacidades técnicas.',
              deadline: 'Mes 2',
              id: 'O1',
              indicatorIds: ['I1'],
              measurableTarget: 'Una línea base aprobada.',
              statement: 'Caracterizar las condiciones territoriales.',
            },
            {
              achievableRationale: 'El piloto cuenta con recursos.',
              deadline: 'Mes 13',
              id: 'O2',
              indicatorIds: ['I2'],
              measurableTarget: 'Un piloto validado.',
              statement: 'Implementar y validar la solución.',
            },
          ],
        },
      },
    }

    const schedule = mapAgentOutputToComponents(output).find(
      ({ type }) => type === 'schedule',
    )

    expect(schedule?.content).toContain(
      '| N.º | Objetivo específico | Actividad | Inicio | Fin | Duración | Dependencias | Entregables |',
    )
    expect(schedule?.content).toContain(
      '| A1 | Caracterizar las condiciones territoriales. | Levantar la línea base territorial. | Mes 1 | Mes 2 | 2 meses | Ninguna | E1 |',
    )
    expect(schedule?.content).toContain('Diagrama de Gantt · Meses 1–12')
    expect(schedule?.content).toContain('Diagrama de Gantt · Meses 13–13')
    expect(schedule?.content).toContain('| Actividad | M1 | M2 | M3 |')
    expect(schedule?.content).toContain(
      '| A1 · Levantar la línea base territorial. | ● | ● |',
    )
    expect(schedule?.structuredContent).toEqual(output.components.schedule)

    const englishSchedule = mapAgentOutputToComponents(output, 'en').find(
      ({ type }) => type === 'schedule',
    )
    expect(englishSchedule?.content).toContain(
      '| No. | Specific objective | Activity | Start | End | Duration | Dependencies | Deliverables |',
    )
    expect(englishSchedule?.content).toContain('Gantt chart · Months 1–12')
  })

  it('convierte la salida presupuestal en el componente visible', () => {
    const output: BudgetAgentOutput = {
      agent: 'budget',
      assumptions: [],
      clarificationQuestions: [],
      consistencyWarnings: [],
      components: {
        budget: {
          currency: 'COP',
          items: [
            {
              activity: 'Realizar la caracterización técnica del territorio.',
              activityIds: ['A1'],
              category: 'Talento humano',
              description: 'Profesional responsable de la actividad A1.',
              fundingSource: null,
              id: 'B1',
              objective: 'Caracterizar técnicamente el territorio.',
              objectiveIds: ['O1'],
              quantity: 2,
              total: 4_000_000,
              unit: 'mes',
              unitCost: 2_000_000,
              valueStatus: 'estimated',
            },
          ],
          narrative: 'Presupuesto sujeto a validación.',
          total: 4_000_000,
          valueStatus: 'estimated',
        },
      },
    }

    const components = mapAgentOutputToComponents(output)
    expect(components).toHaveLength(1)
    expect(components[0].type).toBe('budget')
    expect(components[0].content).toContain('Talento humano')
    expect(components[0].content).toContain(
      '| Objetivo | Actividad | Rubro | Descripción | Costo unitario | Unidad | Cantidad | Total |',
    )
    expect(components[0].content).toContain(
      '| Caracterizar técnicamente el territorio. | Realizar la caracterización técnica del territorio.',
    )
    expect(components[0].content).toContain(
      'Profesional responsable de la actividad A1.',
    )
    expect(components[0].content).toContain('Total del proyecto:')
    expect(components[0].content).not.toContain('valor pendiente')

    const englishComponents = mapAgentOutputToComponents(output, 'en')
    expect(englishComponents[0].content).toContain(
      '| Objective | Activity | Budget category | Description | Unit cost | Unit | Quantity | Total |',
    )
    expect(englishComponents[0].content).toContain('Currency: COP')
    expect(englishComponents[0].content).toContain('Project total:')
    expect(englishComponents[0].content).not.toContain('Moneda:')
  })
})
