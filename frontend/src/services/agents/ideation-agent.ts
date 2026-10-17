import { COMPONENT_TYPES } from '@/types/domain'

import type { AgentGenerationInput, FormulationSubagent } from './contracts'
import { requireContext } from './contracts'

function markdownTable(headers: string[], rows: string[][]) {
  return [
    `| ${headers.join(' | ')} |`,
    `| ${headers.map(() => '---').join(' | ')} |`,
    ...rows.map((row) => `| ${row.join(' | ')} |`),
  ].join('\n')
}

function activitiesFor(data: ReturnType<typeof requireContext>) {
  const population = data.targetPopulation.replace(/[.\s]+$/g, '')
  const location = data.location.replace(/[.\s]+$/g, '')
  const solution = data.proposedSolution.toLowerCase().replace(/[.\s]+$/g, '')
  return Array.from({ length: data.objectiveCount }, (_, objectiveIndex) => [
    {
      description: `Caracterizar y validar los insumos requeridos para el objetivo específico ${objectiveIndex + 1} con ${population} en ${location}.`,
      id: `${objectiveIndex + 1}.1`,
      objectiveIndex,
    },
    {
      description: `Ejecutar y documentar las acciones del objetivo específico ${objectiveIndex + 1} dentro del alcance de ${solution}.`,
      id: `${objectiveIndex + 1}.2`,
      objectiveIndex,
    },
  ]).flat()
}

export class IdeationAgent implements FormulationSubagent {
  generate({ context, type }: AgentGenerationInput) {
    const data = requireContext(context)

    if (type === COMPONENT_TYPES.ACTIVITIES) {
      const activities = activitiesFor(data)
      return {
        type,
        content: activities
          .map(({ description, id }) => `${id} ${description}`)
          .join('\n\n'),
      }
    }

    if (type === COMPONENT_TYPES.SMART_OBJECTIVES) {
      const originalObjectives = [
        `Caracterizar el problema priorizado con la participación de ${data.targetPopulation} en ${data.location}, usando criterios e indicadores verificables durante la etapa inicial del proyecto.`,
        `Diseñar, validar e implementar ${data.proposedSolution.toLowerCase()} dentro del alcance definido (${data.initialScope}) y de la duración total confirmada (${data.projectDuration}).`,
        `Evaluar al cierre de la ejecución el cumplimiento de los resultados esperados (${data.expectedResults}) mediante evidencias e indicadores aprobados por el equipo.`,
      ]
      const expandedObjectives = [
        originalObjectives[0],
        `Diseñar y validar ${data.proposedSolution.toLowerCase()} dentro del alcance definido (${data.initialScope}).`,
        `Implementar ${data.proposedSolution.toLowerCase()} con la población beneficiaria y registrar evidencias verificables de su ejecución.`,
        originalObjectives[2],
        `Documentar aprendizajes, resultados y recomendaciones de continuidad antes de finalizar ${data.projectDuration}.`,
      ]
      const reducedObjectives = [
        originalObjectives[0],
        `Diseñar, validar e implementar ${data.proposedSolution.toLowerCase()} dentro del alcance definido (${data.initialScope}) y evaluar, antes de finalizar ${data.projectDuration}, el cumplimiento de los resultados esperados (${data.expectedResults}) mediante evidencias e indicadores aprobados por el equipo.`,
      ]
      const objectives =
        data.objectiveCount === 2
          ? reducedObjectives
          : data.objectiveCount === 3
            ? originalObjectives
            : expandedObjectives.slice(0, data.objectiveCount)

      return {
        type,
        content: `${objectives
          .map((objective, index) => `${index + 1}. ${objective}`)
          .join(
            '\n\n',
          )}\n\nLos valores meta y fechas exactas deberán confirmarse durante la revisión humana para completar los criterios SMART.`,
      }
    }

    if (type === COMPONENT_TYPES.SCHEDULE) {
      const totalMonths = Math.max(
        1,
        Number.parseInt(data.projectDuration.match(/\d+/)?.[0] ?? '6', 10),
      )
      const activities = activitiesFor(data)
      const phases = activities.map((activity, index) => {
        const startMonth = Math.min(
          totalMonths,
          Math.floor((index * totalMonths) / activities.length) + 1,
        )
        const endMonth = Math.max(
          startMonth,
          Math.min(
            totalMonths,
            Math.ceil(((index + 1) * totalMonths) / activities.length),
          ),
        )
        const previous = activities[index - 1]
        return {
          activity: activity.description,
          deliverable: `Evidencia verificable de la actividad ${activity.id}`,
          dependencies:
            previous?.objectiveIndex === activity.objectiveIndex
              ? previous.id
              : 'Ninguna',
          id: activity.id,
          objective: `Objetivo específico ${activity.objectiveIndex + 1}`,
          startMonth,
          endMonth,
        }
      })
      const detailedSchedule = markdownTable(
        [
          'N.º',
          'Objetivo específico',
          'Actividad',
          'Inicio',
          'Fin',
          'Duración',
          'Dependencias',
          'Entregables',
        ],
        phases.map((phase) => [
          phase.id,
          phase.objective,
          phase.activity,
          `Mes ${phase.startMonth}`,
          `Mes ${phase.endMonth}`,
          `${phase.endMonth - phase.startMonth + 1} ${phase.endMonth === phase.startMonth ? 'mes' : 'meses'}`,
          phase.dependencies,
          phase.deliverable,
        ]),
      )
      const ganttTables: string[] = []
      for (let firstMonth = 1; firstMonth <= totalMonths; firstMonth += 12) {
        const finalMonth = Math.min(firstMonth + 11, totalMonths)
        const months = Array.from(
          { length: finalMonth - firstMonth + 1 },
          (_, index) => firstMonth + index,
        )
        const title =
          totalMonths <= 12
            ? 'Diagrama de Gantt'
            : `Diagrama de Gantt · Meses ${firstMonth}–${finalMonth}`
        ganttTables.push(
          `${title}\n\n${markdownTable(
            ['Actividad', ...months.map((month) => `M${month}`)],
            phases.map((phase) => [
              `${phase.id} · ${phase.activity}`,
              ...months.map((month) =>
                month >= phase.startMonth && month <= phase.endMonth ? '●' : '',
              ),
            ]),
          )}`,
        )
      }
      return {
        type,
        content: `El cronograma organiza la comprensión y el diseño, la implementación, y la evaluación y el cierre dentro de la duración total confirmada: ${data.projectDuration}. El alcance aplicable es: ${data.initialScope}.\n\nCronograma detallado\n\n${detailedSchedule}\n\n${ganttTables.join('\n\n')}`,
      }
    }

    throw new Error(`IdeationAgent no genera el componente ${type}.`)
  }
}
