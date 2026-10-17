import {
  ideationAgentOutputSchema,
  type IdeationAgentOutput,
} from '../contracts/agent-output.schemas'

const ACTIVITY_CODE_PATTERN = /^(?:actividad\s+)?\d+\.\d+\s*(?:[.:·\-–—]\s*)?/i

export function withoutActivityCode(value: string): string {
  return value.replace(ACTIVITY_CODE_PATTERN, '').trim()
}

export function activityWithCode(id: string, description: string): string {
  return `${id} ${withoutActivityCode(description)}`.trim()
}

/**
 * The model may invent identifiers such as ACT-01. Ágora replaces them with a
 * deterministic objective.activity sequence and updates every dependent
 * reference before persisting the ideation output.
 */
export function normalizeIdeationActivityNomenclature(
  output: unknown,
): IdeationAgentOutput {
  const parsed = ideationAgentOutputSchema.parse(output)
  const objectiveOrder = new Map(
    parsed.components.smartObjectives.items.map(({ id }, index) => [
      id,
      index + 1,
    ]),
  )
  const counters = new Map<number, number>()
  const renamedIds = new Map<string, string>()

  const activities = parsed.components.activities.items.map((activity) => {
    const objectiveNumber = activity.objectiveIds
      .map((objectiveId) => objectiveOrder.get(objectiveId))
      .filter((value): value is number => value !== undefined)
      .sort((left, right) => left - right)[0]

    if (objectiveNumber === undefined) return activity

    const activityNumber = (counters.get(objectiveNumber) ?? 0) + 1
    counters.set(objectiveNumber, activityNumber)
    const id = `${objectiveNumber}.${activityNumber}`
    renamedIds.set(activity.id, id)
    return { ...activity, id }
  })

  const schedule = parsed.components.schedule.items.map((item) => ({
    ...item,
    activityId: renamedIds.get(item.activityId) ?? item.activityId,
    dependencies: item.dependencies.map(
      (dependency) => renamedIds.get(dependency) ?? dependency,
    ),
  }))

  return ideationAgentOutputSchema.parse({
    ...parsed,
    components: {
      ...parsed.components,
      activities: {
        ...parsed.components.activities,
        items: activities,
      },
      schedule: {
        ...parsed.components.schedule,
        items: schedule,
      },
    },
  })
}
