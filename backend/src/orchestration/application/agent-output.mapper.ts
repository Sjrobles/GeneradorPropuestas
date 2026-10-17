import type {
  BudgetAgentOutput,
  FormulationAgentOutput,
} from '../contracts/agent-output.schemas'
import type { FormulationComponent } from '../domain/formulation.constants'
import { activityWithCode } from './activity-nomenclature'
import type { FormulationLanguage } from './orchestration.types'

export interface GeneratedComponentDraft {
  content: string
  structuredContent?: unknown
  type: FormulationComponent
}

function numbered(items: string[]): string {
  return items.map((item, index) => `${index + 1}. ${item}`).join('\n')
}

function markdownTableCell(value: string | number): string {
  return String(value).replace(/\r?\n/g, ' ').replace(/\|/g, '\\|').trim()
}

function markdownTable(headers: string[], rows: Array<Array<string | number>>) {
  return [
    `| ${headers.map(markdownTableCell).join(' | ')} |`,
    `| ${headers.map(() => '---').join(' | ')} |`,
    ...rows.map((row) => `| ${row.map(markdownTableCell).join(' | ')} |`),
  ].join('\n')
}

function compactActivityLabel(description: string): string {
  const summary = description
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

export function mapBudgetToContent(
  budget: BudgetAgentOutput['components']['budget'],
  language: FormulationLanguage = 'es',
): string {
  const english = language === 'en'
  const money = (value: number) =>
    new Intl.NumberFormat(english ? 'en-US' : 'es-CO', {
      currency: budget.currency,
      maximumFractionDigits: 0,
      style: 'currency',
    }).format(value)
  const quantity = (value: number) =>
    new Intl.NumberFormat(english ? 'en-US' : 'es-CO', {
      maximumFractionDigits: 2,
    }).format(value)
  const table = [
    english
      ? '| Objective | Activity | Budget category | Description | Unit cost | Unit | Quantity | Total |'
      : '| Objetivo | Actividad | Rubro | Descripción | Costo unitario | Unidad | Cantidad | Total |',
    '| --- | --- | --- | --- | ---: | --- | ---: | ---: |',
    ...budget.items.map((item) =>
      [
        item.objective,
        item.activityIds.length === 1 && /^\d+\.\d+$/.test(item.activityIds[0])
          ? activityWithCode(item.activityIds[0], item.activity)
          : item.activity,
        item.category,
        item.description,
        money(item.unitCost),
        item.unit,
        quantity(item.quantity),
        money(item.total),
      ]
        .map(markdownTableCell)
        .join(' | ')
        .replace(/^/, '| ')
        .replace(/$/, ' |'),
    ),
  ].join('\n')

  return `${budget.narrative}\n\n${english ? 'Currency' : 'Moneda'}: ${budget.currency}\n\n${table}\n\n${english ? 'Project total' : 'Total del proyecto'}: ${money(budget.total)} (${budget.valueStatus})`
}

export function mapAgentOutputToComponents(
  output: FormulationAgentOutput,
  language: FormulationLanguage = 'es',
): GeneratedComponentDraft[] {
  const english = language === 'en'
  switch (output.agent) {
    case 'research': {
      const components = output.components
      return [
        {
          type: 'theoretical_framework',
          content: [
            components.theoreticalFramework.narrative,
            ...components.theoreticalFramework.sections.map(
              ({ content, projectApplication, title }) =>
                `${title}\n\n${content}\n\n${english ? 'Application to the project' : 'Aplicación en el proyecto'}\n\n${projectApplication}`,
            ),
          ].join('\n\n'),
          structuredContent: components.theoreticalFramework,
        },
        {
          type: 'state_of_art',
          content: components.stateOfArt.narrative,
        },
        {
          type: 'problem_statement',
          content: components.problemStatement.narrative,
        },
        { type: 'background', content: components.background.narrative },
        {
          type: 'bibliography',
          content:
            components.bibliography.references.length > 0
              ? components.bibliography.references
                  .map(
                    ({ citation, projectRelevance }) =>
                      `${citation}\n\n${english ? 'Relevance to the project' : 'Pertinencia para el proyecto'}: ${projectRelevance}`,
                  )
                  .join('\n\n')
              : english
                ? 'Bibliography pending verification.'
                : 'Bibliografía pendiente de verificación.',
        },
      ]
    }
    case 'ideation': {
      const components = output.components
      const activitiesById = new Map(
        components.activities.items.map((activity) => [activity.id, activity]),
      )
      const objectivesById = new Map(
        components.smartObjectives.items.map((objective) => [
          objective.id,
          objective,
        ]),
      )
      const scheduleItems = [...components.schedule.items].sort(
        (left, right) =>
          left.startMonth - right.startMonth ||
          left.endMonth - right.endMonth ||
          left.activityId.localeCompare(right.activityId),
      )
      const monthLabel = (month: number) =>
        `${english ? 'Month' : 'Mes'} ${month}`
      const scheduleTable = markdownTable(
        english
          ? [
              'No.',
              'Specific objective',
              'Activity',
              'Start',
              'End',
              'Duration',
              'Dependencies',
              'Deliverables',
            ]
          : [
              'N.º',
              'Objetivo específico',
              'Actividad',
              'Inicio',
              'Fin',
              'Duración',
              'Dependencias',
              'Entregables',
            ],
        scheduleItems.map((item) => {
          const activity = activitiesById.get(item.activityId)
          const objectives = (activity?.objectiveIds ?? [])
            .map((objectiveId) => objectivesById.get(objectiveId)?.statement)
            .filter((statement): statement is string => Boolean(statement))
            .join('; ')
          const duration = item.endMonth - item.startMonth + 1
          return [
            item.activityId,
            objectives || (english ? 'Not linked' : 'Sin vincular'),
            activity?.description ?? item.activityId,
            monthLabel(item.startMonth),
            monthLabel(item.endMonth),
            `${duration} ${english ? (duration === 1 ? 'month' : 'months') : duration === 1 ? 'mes' : 'meses'}`,
            item.dependencies.length
              ? item.dependencies.join(', ')
              : english
                ? 'None'
                : 'Ninguna',
            activity?.deliverableIds.length
              ? activity.deliverableIds.join(', ')
              : '—',
          ]
        }),
      )
      const lastMonth = Math.max(
        1,
        ...scheduleItems.map(({ endMonth }) => endMonth),
      )
      const ganttTables: string[] = []
      const monthsPerTable = 12
      for (
        let firstMonth = 1;
        firstMonth <= lastMonth;
        firstMonth += monthsPerTable
      ) {
        const finalMonth = Math.min(firstMonth + monthsPerTable - 1, lastMonth)
        const months = Array.from(
          { length: finalMonth - firstMonth + 1 },
          (_, index) => firstMonth + index,
        )
        const title =
          lastMonth <= monthsPerTable
            ? english
              ? 'Gantt chart'
              : 'Diagrama de Gantt'
            : english
              ? `Gantt chart · Months ${firstMonth}–${finalMonth}`
              : `Diagrama de Gantt · Meses ${firstMonth}–${finalMonth}`
        ganttTables.push(
          `${title}\n\n${markdownTable(
            [
              english ? 'Activity' : 'Actividad',
              ...months.map((month) => `M${month}`),
            ],
            scheduleItems.map((item) => [
              `${item.activityId} · ${compactActivityLabel(activitiesById.get(item.activityId)?.description ?? item.activityId)}`,
              ...months.map((month) =>
                month >= item.startMonth && month <= item.endMonth ? '●' : '',
              ),
            ]),
          )}`,
        )
      }
      return [
        {
          type: 'activities',
          content: `${components.activities.narrative}\n\n${components.activities.items
            .map(({ description, id }) => activityWithCode(id, description))
            .join('\n')}`,
        },
        {
          type: 'smart_objectives',
          content: `${components.smartObjectives.narrative}\n\n${numbered(components.smartObjectives.items.map(({ statement }) => statement))}`,
        },
        {
          type: 'schedule',
          content: `${components.schedule.narrative}\n\n${english ? 'Detailed schedule' : 'Cronograma detallado'}\n\n${scheduleTable}\n\n${ganttTables.join('\n\n')}`,
          structuredContent: components.schedule,
        },
      ]
    }
    case 'impact': {
      const components = output.components
      return [
        {
          type: 'beneficiaries',
          content: `${components.beneficiaries.narrative}\n\n${numbered(
            components.beneficiaries.groups.map(
              ({ name, characterization }) => `${name}: ${characterization}`,
            ),
          )}`,
        },
        {
          type: 'risks',
          content: `${components.risks.narrative}\n\n${numbered(
            components.risks.items.map(
              ({ description, mitigation }) =>
                `${description} ${english ? 'Treatment' : 'Tratamiento'}: ${mitigation}`,
            ),
          )}`,
        },
        {
          type: 'expected_impacts',
          content: `${components.expectedImpacts.narrative}\n\n${numbered(
            components.expectedImpacts.items.map(
              ({ description }) => description,
            ),
          )}`,
        },
      ]
    }
    case 'budget': {
      const budget = output.components.budget
      return [
        {
          type: 'budget',
          content: mapBudgetToContent(budget, language),
          structuredContent: budget,
        },
      ]
    }
    case 'methodology': {
      const methodology = output.components.methodology
      const phases = methodology.phases.map((phase) => ({
        activities: phase.activityIds.map((activityId) => ({
          description: `${english ? 'Related activity' : 'Actividad relacionada'} ${activityId}`,
          id: activityId,
          relatedObjectiveIds: phase.objectiveIds,
        })),
        description: phase.procedure,
        expectedOutputs: phase.outputs,
        name: phase.name,
        order: phase.order,
        relatedObjectiveIds: phase.objectiveIds,
      }))
      return [
        {
          type: 'methodology',
          content: `${methodology.narrative}\n\n${numbered(
            methodology.phases.map(
              ({ name, procedure }) => `${name}: ${procedure}`,
            ),
          )}`,
          structuredContent: { narrative: methodology.narrative, phases },
        },
      ]
    }
  }
}
