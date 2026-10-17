import { z } from 'zod'
import { FORMULATION_AGENTS } from '../domain/formulation.constants'

const requiredText = z.string().trim().min(1)
const identifier = z.string().trim().min(1).max(120)
const developedNarrative = (minimumCharacters: number) =>
  z.string().trim().min(minimumCharacters)

const qualitySchema = z.object({
  assumptions: z.array(requiredText),
  clarificationQuestions: z.array(requiredText),
  consistencyWarnings: z.array(requiredText),
})

const sourceSchema = z
  .object({
    authors: z.array(requiredText).min(1),
    citation: developedNarrative(120),
    doi: z.string().trim().nullable(),
    id: identifier,
    projectRelevance: developedNarrative(220),
    sourceType: z.enum([
      'academic_article',
      'book',
      'institutional_report',
      'legal_document',
      'website',
      'other',
    ]),
    title: requiredText,
    url: z.string().trim().nullable(),
    verified: z.literal(true),
    year: z.number().int().min(1800).max(2200),
  })
  .refine((source) => Boolean(source.doi || source.url), {
    message: 'Cada fuente debe incluir una URL o un DOI verificable',
    path: ['url'],
  })

const sourcedNarrativeSchema = z.object({
  citationIds: z.array(identifier).min(3).max(5),
  narrative: developedNarrative(1_000),
})

const theoreticalSectionSchema = z.object({
  citationIds: z.array(identifier).min(1).max(5),
  content: developedNarrative(500),
  projectApplication: developedNarrative(250),
  title: requiredText,
})

const researchAgentOutputBaseSchema = qualitySchema.extend({
  agent: z.literal('research'),
  components: z.object({
    background: sourcedNarrativeSchema.extend({
      precedents: z.array(requiredText).min(3).max(5),
    }),
    bibliography: z.object({
      references: z.array(sourceSchema).min(3).max(5),
    }),
    problemStatement: sourcedNarrativeSchema.extend({
      causes: z.array(requiredText).min(1),
      effects: z.array(requiredText).min(1),
      evidenceGaps: z.array(requiredText).min(1),
    }),
    stateOfArt: sourcedNarrativeSchema.extend({
      findings: z.array(requiredText).min(3),
      knowledgeGaps: z.array(requiredText).min(1),
    }),
    theoreticalFramework: sourcedNarrativeSchema.extend({
      conceptualAxes: z.array(requiredText).min(1),
      sections: z.array(theoreticalSectionSchema).min(1),
    }),
  }),
})

export const researchAgentOutputSchema =
  researchAgentOutputBaseSchema.superRefine((output, context) => {
    const references = new Set(
      output.components.bibliography.references.map(({ id }) => id),
    )
    const citedByComponent = [
      ['background', output.components.background.citationIds],
      ['problemStatement', output.components.problemStatement.citationIds],
      ['stateOfArt', output.components.stateOfArt.citationIds],
      [
        'theoreticalFramework',
        output.components.theoreticalFramework.citationIds,
      ],
    ] as const

    for (const [component, citationIds] of citedByComponent) {
      for (const citationId of citationIds) {
        if (!references.has(citationId)) {
          context.addIssue({
            code: 'custom',
            message: `La referencia ${citationId} citada en ${component} no aparece en la bibliografía`,
            path: ['components', component, 'citationIds'],
          })
        }
      }
    }
  })

const activitySchema = z.object({
  description: requiredText,
  deliverableIds: z.array(identifier),
  id: identifier,
  indicatorIds: z.array(identifier),
  objectiveIds: z.array(identifier).min(1),
})

const smartObjectiveSchema = z.object({
  achievableRationale: requiredText,
  deadline: requiredText,
  id: identifier,
  indicatorIds: z.array(identifier),
  measurableTarget: requiredText,
  statement: requiredText,
})

const scheduleItemSchema = z
  .object({
    activityId: identifier,
    dependencies: z.array(identifier),
    endMonth: z.number().int().positive(),
    startMonth: z.number().int().positive(),
  })
  .refine((item) => item.endMonth >= item.startMonth, {
    message: 'endMonth debe ser mayor o igual a startMonth',
    path: ['endMonth'],
  })

export const ideationAgentOutputSchema = qualitySchema
  .extend({
    agent: z.literal('ideation'),
    components: z.object({
      activities: z.object({
        items: z.array(activitySchema),
        narrative: developedNarrative(300),
      }),
      schedule: z.object({
        items: z.array(scheduleItemSchema),
        narrative: developedNarrative(300),
      }),
      smartObjectives: z.object({
        items: z.array(smartObjectiveSchema),
        narrative: developedNarrative(300),
      }),
    }),
  })
  .superRefine((output, context) => {
    const activities = new Set(
      output.components.activities.items.map(({ id }) => id),
    )
    const objectives = new Set(
      output.components.smartObjectives.items.map(({ id }) => id),
    )
    const scheduled = new Map<string, number>()

    output.components.schedule.items.forEach((item, index) => {
      scheduled.set(item.activityId, (scheduled.get(item.activityId) ?? 0) + 1)
      if (!activities.has(item.activityId)) {
        context.addIssue({
          code: 'custom',
          message: `La actividad ${item.activityId} del cronograma no existe en activities.items`,
          path: ['components', 'schedule', 'items', index, 'activityId'],
        })
      }
      for (const dependency of item.dependencies) {
        if (!activities.has(dependency) || dependency === item.activityId) {
          context.addIssue({
            code: 'custom',
            message: `La dependencia ${dependency} debe referenciar otra actividad existente`,
            path: ['components', 'schedule', 'items', index, 'dependencies'],
          })
        }
      }
    })

    output.components.activities.items.forEach((activity, index) => {
      if (scheduled.get(activity.id) !== 1) {
        context.addIssue({
          code: 'custom',
          message: `La actividad ${activity.id} debe aparecer exactamente una vez en el cronograma`,
          path: ['components', 'schedule', 'items'],
        })
      }
      for (const objectiveId of activity.objectiveIds) {
        if (!objectives.has(objectiveId)) {
          context.addIssue({
            code: 'custom',
            message: `El objetivo ${objectiveId} asociado a ${activity.id} no existe`,
            path: ['components', 'activities', 'items', index, 'objectiveIds'],
          })
        }
      }
    })
  })

const beneficiaryGroupSchema = z.object({
  characterization: requiredText,
  estimatedCount: z.number().int().nonnegative().nullable(),
  estimationStatus: z.enum(['confirmed', 'pending']),
  id: identifier,
  location: requiredText,
  name: requiredText,
})

const riskSchema = z.object({
  description: requiredText,
  id: identifier,
  impact: z.enum(['low', 'medium', 'high', 'pending']),
  mitigation: requiredText,
  probability: z.enum(['low', 'medium', 'high', 'pending']),
  relatedActivityIds: z.array(identifier),
  warningSignal: requiredText,
})

const expectedImpactSchema = z.object({
  description: requiredText,
  evidence: requiredText,
  id: identifier,
  indicatorIds: z.array(identifier),
  timeframe: z.enum(['short', 'medium', 'long', 'pending']),
})

export const impactAgentOutputSchema = qualitySchema.extend({
  agent: z.literal('impact'),
  components: z.object({
    beneficiaries: z.object({
      groups: z.array(beneficiaryGroupSchema),
      narrative: developedNarrative(300),
    }),
    expectedImpacts: z.object({
      items: z.array(expectedImpactSchema),
      narrative: developedNarrative(300),
    }),
    risks: z.object({
      items: z.array(riskSchema),
      narrative: developedNarrative(300),
    }),
  }),
})

const moneySchema = z.number().nonnegative()

const budgetItemSchema = z.object({
  activity: requiredText,
  activityIds: z.array(identifier),
  category: requiredText,
  description: requiredText,
  fundingSource: requiredText.nullable(),
  id: identifier,
  objective: requiredText,
  objectiveIds: z.array(identifier),
  quantity: z.number().positive(),
  total: moneySchema,
  unit: requiredText,
  unitCost: moneySchema,
  valueStatus: z.enum(['confirmed', 'estimated']),
})

export const budgetComponentSchema = z.object({
  currency: z.literal('COP'),
  items: z.array(budgetItemSchema).min(1).max(40),
  narrative: developedNarrative(300),
  total: moneySchema,
  valueStatus: z.enum(['confirmed', 'estimated']),
})

const budgetAgentOutputBaseSchema = qualitySchema.extend({
  agent: z.literal('budget'),
  components: z.object({
    budget: budgetComponentSchema,
  }),
})

export const budgetAgentOutputSchema = budgetAgentOutputBaseSchema

const methodologyPhaseSchema = z
  .object({
    activityIds: z.array(identifier),
    closureCriteria: z.array(requiredText),
    dependencies: z.array(identifier),
    endMonth: z.number().int().positive(),
    evidence: z.array(requiredText),
    id: identifier,
    indicatorIds: z.array(identifier),
    instruments: z.array(requiredText),
    name: requiredText,
    objectiveIds: z.array(identifier),
    order: z.number().int().positive(),
    outputs: z.array(requiredText),
    procedure: requiredText,
    purpose: requiredText,
    roles: z.array(requiredText),
    startMonth: z.number().int().positive(),
    techniques: z.array(requiredText),
  })
  .refine((phase) => phase.endMonth >= phase.startMonth, {
    message: 'endMonth debe ser mayor o igual a startMonth',
    path: ['endMonth'],
  })

export const methodologyAgentOutputSchema = qualitySchema.extend({
  agent: z.literal('methodology'),
  components: z.object({
    methodology: z.object({
      approach: z.object({
        justification: requiredText,
        type: z.enum([
          'quantitative',
          'qualitative',
          'mixed',
          'applied',
          'other',
        ]),
      }),
      dataAndEthics: z.array(requiredText),
      governance: z.object({
        decisionMechanism: requiredText,
        roles: z.array(requiredText),
      }),
      monitoring: z.array(requiredText),
      narrative: developedNarrative(600),
      phases: z.array(methodologyPhaseSchema),
      qualityControls: z.array(requiredText),
      riskControls: z.array(requiredText),
    }),
  }),
})

export const formulationAgentOutputSchema = z.discriminatedUnion('agent', [
  researchAgentOutputSchema,
  ideationAgentOutputSchema,
  impactAgentOutputSchema,
  budgetAgentOutputSchema,
  methodologyAgentOutputSchema,
])

export const formulationAgentNameSchema = z.enum(FORMULATION_AGENTS)

export type ResearchAgentOutput = z.infer<typeof researchAgentOutputSchema>
export type IdeationAgentOutput = z.infer<typeof ideationAgentOutputSchema>
export type ImpactAgentOutput = z.infer<typeof impactAgentOutputSchema>
export type BudgetAgentOutput = z.infer<typeof budgetAgentOutputSchema>
export type MethodologyAgentOutput = z.infer<
  typeof methodologyAgentOutputSchema
>
export type FormulationAgentOutput = z.infer<
  typeof formulationAgentOutputSchema
>
