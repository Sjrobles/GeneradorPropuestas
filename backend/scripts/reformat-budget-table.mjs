import mongoose from 'mongoose'

const projectId = process.argv[2]
if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
  throw new Error('Indica un projectId válido como primer argumento')
}
if (!process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI no está configurado')
}

const markdownCell = (value) =>
  String(value).replace(/\r?\n/g, ' ').replace(/\|/g, '\\|').trim()
const readableActivity = (description) =>
  String(description)
    .split(/\s+Meta:\s*/i)[0]
    .trim()

await mongoose.connect(process.env.MONGODB_URI)

try {
  const projects = mongoose.connection.db.collection('projects')
  const project = await projects.findOne({
    _id: new mongoose.Types.ObjectId(projectId),
  })
  if (!project) throw new Error('Proyecto no encontrado')

  const ideation = project.agentOutputs?.ideation?.components
  const storedBudget = project.agentOutputs?.budget?.components?.budget
  const budgetComponent = project.components?.find(
    ({ type }) => type === 'budget',
  )
  if (!ideation || !storedBudget || !budgetComponent) {
    throw new Error('El proyecto no tiene Ideación y Presupuesto persistidos')
  }
  if (budgetComponent.modifiedBy === 'user') {
    throw new Error(
      'El presupuesto contiene cambios manuales; no se reemplazó automáticamente',
    )
  }

  const activities = new Map(
    ideation.activities.items.map((activity) => [activity.id, activity]),
  )
  const objectives = new Map(
    ideation.smartObjectives.items.map((objective) => [
      objective.id,
      objective.statement,
    ]),
  )
  const specificObjectiveIds = ideation.smartObjectives.items
    .map(({ id }) => id)
    .filter((id) => id !== 'OG')

  const items = storedBudget.items.map((item) => {
    const linkedActivities = item.activityIds
      .map((id) => activities.get(id))
      .filter(Boolean)
    const objectiveIds = [
      ...new Set(linkedActivities.flatMap(({ objectiveIds }) => objectiveIds)),
    ]
    const transversal = linkedActivities.length === 0
    const resolvedObjectiveIds = transversal
      ? specificObjectiveIds
      : objectiveIds

    return {
      ...item,
      activity: transversal
        ? 'Gestión transversal de las actividades del proyecto.'
        : linkedActivities
            .map(({ description }) => readableActivity(description))
            .join(' / '),
      objective: transversal
        ? 'Apoyo transversal a todos los objetivos específicos del proyecto.'
        : resolvedObjectiveIds
            .map((id) => objectives.get(id))
            .filter(Boolean)
            .join(' / '),
      objectiveIds: resolvedObjectiveIds,
    }
  })

  const money = (value) =>
    new Intl.NumberFormat('es-CO', {
      currency: storedBudget.currency,
      maximumFractionDigits: 0,
      style: 'currency',
    }).format(value)
  const quantity = (value) =>
    new Intl.NumberFormat('es-CO', { maximumFractionDigits: 2 }).format(value)
  const table = [
    '| Objetivo | Actividad | Rubro | Descripción | Costo unitario | Unidad | Cantidad | Total |',
    '| --- | --- | --- | --- | ---: | --- | ---: | ---: |',
    ...items.map(
      (item) =>
        `| ${[
          item.objective,
          item.activity,
          item.category,
          item.description,
          money(item.unitCost),
          item.unit,
          quantity(item.quantity),
          money(item.total),
        ]
          .map(markdownCell)
          .join(' | ')} |`,
    ),
  ].join('\n')
  const content = `${storedBudget.narrative}\n\nMoneda: ${storedBudget.currency}\n\n${table}\n\nTotal del proyecto: ${money(storedBudget.total)} (${storedBudget.valueStatus})`
  const updatedBudget = { ...storedBudget, items }
  const now = new Date()
  const result = await projects.updateOne(
    {
      _id: project._id,
      components: {
        $elemMatch: { id: budgetComponent.id, modifiedBy: 'ai' },
      },
    },
    {
      $set: {
        'agentOutputs.budget.components.budget': updatedBudget,
        'components.$.aiGeneratedContent': content,
        'components.$.currentContent': content,
        'components.$.structuredContent': updatedBudget,
        'components.$.updatedAt': now,
        updatedAt: now,
      },
    },
  )
  if (result.modifiedCount !== 1) {
    throw new Error('No fue posible actualizar el presupuesto de forma segura')
  }

  console.log(
    JSON.stringify({
      projectId,
      rows: items.length,
      total: storedBudget.total,
      updated: true,
    }),
  )
} finally {
  await mongoose.disconnect()
}
