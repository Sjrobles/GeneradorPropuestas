import {
  budgetAgentOutputSchema,
  formulationAgentOutputSchema,
  ideationAgentOutputSchema,
  impactAgentOutputSchema,
  methodologyAgentOutputSchema,
  researchAgentOutputSchema,
} from './agent-output.schemas'
import { zodTextFormat } from 'openai/helpers/zod'

describe('contratos de salida de los agentes', () => {
  const developedText = (length: number) =>
    'Contenido desarrollado. '.repeat(length)

  it('rechaza una respuesta etiquetada para el agente equivocado', () => {
    const result = budgetAgentOutputSchema.safeParse({
      agent: 'ideation',
      assumptions: [],
      clarificationQuestions: [],
      consistencyWarnings: [],
      components: {},
    })

    expect(result.success).toBe(false)
  })

  it('rechaza un cronograma cuyo mes final antecede al inicial', () => {
    const result = ideationAgentOutputSchema.safeParse({
      agent: 'ideation',
      assumptions: [],
      clarificationQuestions: [],
      consistencyWarnings: [],
      components: {
        activities: {
          narrative: 'Actividades trazables.',
          items: [
            {
              id: 'A1',
              description: 'Caracterizar el problema.',
              deliverableIds: [],
              indicatorIds: [],
              objectiveIds: ['OE1'],
            },
          ],
        },
        smartObjectives: {
          narrative: 'Objetivos verificables.',
          items: [
            {
              achievableRationale: 'Existe capacidad confirmada.',
              deadline: 'Mes 3',
              id: 'OE1',
              indicatorIds: ['IND1'],
              measurableTarget: 'Una caracterización aprobada.',
              statement:
                'Caracterizar el problema durante el primer trimestre.',
            },
          ],
        },
        schedule: {
          narrative: 'Secuencia aprobada.',
          items: [
            {
              activityId: 'A1',
              dependencies: [],
              startMonth: 3,
              endMonth: 2,
            },
          ],
        },
      },
    })

    expect(result.success).toBe(false)
  })

  it('exige una única fila de cronograma por cada actividad existente', () => {
    const result = ideationAgentOutputSchema.safeParse({
      agent: 'ideation',
      assumptions: [],
      clarificationQuestions: [],
      consistencyWarnings: [],
      components: {
        activities: {
          narrative: developedText(20),
          items: [
            {
              id: 'A1',
              description: 'Caracterizar el problema.',
              deliverableIds: ['E1'],
              indicatorIds: ['I1'],
              objectiveIds: ['OE1'],
            },
            {
              id: 'A2',
              description: 'Implementar el piloto.',
              deliverableIds: ['E2'],
              indicatorIds: ['I2'],
              objectiveIds: ['OE1'],
            },
          ],
        },
        smartObjectives: {
          narrative: developedText(20),
          items: [
            {
              achievableRationale: 'Existe capacidad confirmada.',
              deadline: 'Mes 3',
              id: 'OE1',
              indicatorIds: ['I1'],
              measurableTarget: 'Una caracterización aprobada.',
              statement: 'Caracterizar e implementar el piloto.',
            },
          ],
        },
        schedule: {
          narrative: developedText(20),
          items: [
            {
              activityId: 'A1',
              dependencies: [],
              startMonth: 1,
              endMonth: 2,
            },
            {
              activityId: 'A1',
              dependencies: [],
              startMonth: 2,
              endMonth: 3,
            },
          ],
        },
      },
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            message:
              'La actividad A1 debe aparecer exactamente una vez en el cronograma',
          }),
          expect.objectContaining({
            message:
              'La actividad A2 debe aparecer exactamente una vez en el cronograma',
          }),
        ]),
      )
    }
  })

  it('acepta un presupuesto completamente estimado y valorizado', () => {
    const result = formulationAgentOutputSchema.safeParse({
      agent: 'budget',
      assumptions: ['Se adopta una tarifa mensual conservadora de mercado.'],
      clarificationQuestions: [],
      consistencyWarnings: [],
      components: {
        budget: {
          currency: 'COP',
          narrative: developedText(80),
          total: 4_000_000,
          valueStatus: 'estimated',
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
        },
      },
    })

    expect(result.success).toBe(true)
  })

  it('exige COP y al menos un ítem presupuestal', () => {
    const result = budgetAgentOutputSchema.safeParse({
      agent: 'budget',
      assumptions: [],
      clarificationQuestions: [],
      consistencyWarnings: [],
      components: {
        budget: {
          currency: 'USD',
          items: [],
          narrative: developedText(80),
          total: 0,
          valueStatus: 'confirmed',
        },
      },
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.map(({ path }) => path)).toEqual(
        expect.arrayContaining([
          ['components', 'budget', 'currency'],
          ['components', 'budget', 'items'],
        ]),
      )
    }
  })

  it('rechaza valores pendientes o nulos en el presupuesto', () => {
    const result = budgetAgentOutputSchema.safeParse({
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
              quantity: null,
              total: null,
              unit: null,
              unitCost: null,
              valueStatus: 'pending',
            },
          ],
          narrative: developedText(80),
          total: null,
          valueStatus: 'pending',
        },
      },
    })

    expect(result.success).toBe(false)
  })

  it('rechaza apartados superficiales aunque respeten la forma del JSON', () => {
    const result = budgetAgentOutputSchema.safeParse({
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
              quantity: 1,
              total: 2_000_000,
              unit: 'mes',
              unitCost: 2_000_000,
              valueStatus: 'estimated',
            },
          ],
          narrative: 'El presupuesto deberá desarrollarse posteriormente.',
          total: 2_000_000,
          valueStatus: 'estimated',
        },
      },
    })

    expect(result.success).toBe(false)
  })

  it('exige al menos mil caracteres y tres referencias verificables por apartado de investigación', () => {
    const references = ['S1', 'S2', 'S3'].map((id, index) => ({
      authors: [`Autor ${index + 1}`],
      citation: developedText(6),
      doi: null,
      id,
      projectRelevance: developedText(10),
      sourceType: 'academic_article' as const,
      title: `Fuente verificable ${index + 1}`,
      url: `https://example.org/source-${index + 1}`,
      verified: true as const,
      year: 2025,
    }))
    const sourcedNarrative = {
      citationIds: ['S1', 'S2', 'S3'],
      narrative: developedText(50),
    }
    const result = researchAgentOutputSchema.safeParse({
      agent: 'research',
      assumptions: [],
      clarificationQuestions: [],
      consistencyWarnings: [],
      components: {
        background: {
          ...sourcedNarrative,
          precedents: ['Referente 1', 'Referente 2', 'Referente 3'],
        },
        bibliography: { references },
        problemStatement: {
          ...sourcedNarrative,
          causes: ['Causa verificable'],
          effects: ['Efecto verificable'],
          evidenceGaps: ['Brecha verificable'],
        },
        stateOfArt: {
          ...sourcedNarrative,
          narrative: 'Descripción demasiado corta.',
          findings: ['Hallazgo 1', 'Hallazgo 2', 'Hallazgo 3'],
          knowledgeGaps: ['Brecha de conocimiento'],
        },
        theoreticalFramework: {
          ...sourcedNarrative,
          conceptualAxes: ['Eje conceptual'],
          sections: [
            {
              citationIds: ['S1', 'S2', 'S3'],
              content: developedText(25),
              projectApplication: developedText(12),
              title: 'Eje conceptual',
            },
          ],
        },
      },
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: ['components', 'stateOfArt', 'narrative'],
          }),
        ]),
      )
    }
  })

  it('convierte los cinco contratos al formato estricto de OpenAI', () => {
    const schemas = [
      researchAgentOutputSchema,
      ideationAgentOutputSchema,
      impactAgentOutputSchema,
      budgetAgentOutputSchema,
      methodologyAgentOutputSchema,
    ]

    for (const [index, schema] of schemas.entries()) {
      expect(() => zodTextFormat(schema, `agent_${index + 1}`)).not.toThrow()
    }
  })
})
