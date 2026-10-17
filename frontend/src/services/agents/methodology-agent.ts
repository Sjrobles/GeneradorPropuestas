import { COMPONENT_TYPES, type Methodology } from '@/types/domain'

import type { AgentGenerationInput, FormulationSubagent } from './contracts'
import { requireContext } from './contracts'

export class MethodologyAgent implements FormulationSubagent {
  generate({ context, executionDetails, type }: AgentGenerationInput) {
    if (type !== COMPONENT_TYPES.METHODOLOGY)
      throw new Error(`MethodologyAgent no genera el componente ${type}.`)
    const data = requireContext(context)
    const objectiveIds = Array.from(
      { length: data.objectiveCount },
      (_, index) => `objective-${index + 1}`,
    )
    const implementationObjectiveIds =
      objectiveIds.length === 2 ? [objectiveIds[1]] : objectiveIds.slice(1, -1)
    const evaluationObjectiveIds = [objectiveIds.at(-1) as string]
    const methodology: Methodology = {
      narrative: `La metodología organiza el proyecto en tres fases encadenadas: comprensión del reto, implementación de la solución y evaluación de resultados. Cada fase se relaciona con los objetivos específicos pertinentes y produce evidencias revisables.`,
      phases: [
        {
          order: 1,
          name: 'Comprensión participativa del reto',
          description: `Caracterización del problema con ${data.targetPopulation} en ${data.location}.`,
          relatedObjectiveIds: [objectiveIds[0]],
          activities: [
            {
              id: '1.1',
              description:
                'Recopilar y organizar información primaria del contexto.',
              relatedObjectiveIds: [objectiveIds[0]],
            },
          ],
          expectedOutputs: [
            'Caracterización validada del problema y sus condiciones de contexto.',
          ],
        },
        {
          order: 2,
          name: 'Diseño e implementación',
          description: `Desarrollo de ${data.proposedSolution.toLowerCase()} dentro del alcance acordado.`,
          relatedObjectiveIds: implementationObjectiveIds,
          activities: implementationObjectiveIds.map((objectiveId) => ({
            id: `${objectiveIds.indexOf(objectiveId) + 1}.1`,
            description:
              'Diseñar, validar e implementar la solución propuesta.',
            relatedObjectiveIds: [objectiveId],
          })),
          expectedOutputs: [
            'Solución implementada y registro de su ejecución.',
          ],
        },
        {
          order: 3,
          name: 'Evaluación y aprendizaje',
          description: `Valoración de los resultados esperados: ${data.expectedResults}`,
          relatedObjectiveIds: evaluationObjectiveIds,
          activities: [
            {
              id: `${objectiveIds.length}.2`,
              description:
                'Recopilar evidencias, analizar resultados y documentar aprendizajes.',
              relatedObjectiveIds: evaluationObjectiveIds,
            },
          ],
          expectedOutputs: [
            'Informe de resultados, evidencias y recomendaciones de continuidad.',
          ],
        },
      ],
    }

    const phases = methodology.phases
      .map(
        (phase) =>
          `${phase.order}. ${phase.name}\n${phase.description}\nActividad principal: ${phase.activities[0]?.description}\nProducto esperado: ${phase.expectedOutputs[0]}`,
      )
      .join('\n\n')
    const alignmentDetails = [
      ['Desarrollo de las actividades', executionDetails?.activityDevelopment],
      ['Equipo y participantes', executionDetails?.participants],
      [
        'Lugares, población y participantes',
        executionDetails?.locationsAndParticipants,
      ],
      ['Recursos requeridos', executionDetails?.requiredResources],
      [
        'Duración, orden y dependencias',
        executionDetails?.timelineAndDependencies,
      ],
      ['Resultados y entregables', executionDetails?.expectedDeliverables],
      ['Evidencias y verificación', executionDetails?.verificationMethods],
      [
        'Información económica disponible',
        executionDetails?.knownEconomicInformation,
      ],
      ['Condiciones especiales', executionDetails?.specialConditions],
    ]
      .filter((detail): detail is [string, string] => Boolean(detail[1]))
      .map(([label, value]) => `${label}: ${value}`)
      .join('\n')
    const alignmentSection = alignmentDetails
      ? `\n\nAlineación operativa confirmada por el usuario\n${alignmentDetails}`
      : ''

    return {
      type,
      structuredContent: methodology,
      content: `${methodology.narrative}\n\n${phases}${alignmentSection}`,
    }
  }
}
