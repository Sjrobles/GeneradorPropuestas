export const FORMULATION_AGENTS = [
  'research',
  'ideation',
  'methodology',
  'budget',
  'impact',
] as const

export type FormulationAgent = (typeof FORMULATION_AGENTS)[number]

export const FORMULATION_COMPONENTS = [
  'theoretical_framework',
  'state_of_art',
  'problem_statement',
  'background',
  'bibliography',
  'activities',
  'smart_objectives',
  'schedule',
  'methodology',
  'budget',
  'beneficiaries',
  'risks',
  'expected_impacts',
] as const

export type FormulationComponent = (typeof FORMULATION_COMPONENTS)[number]

export interface FormulationComponentDefinition {
  agent: FormulationAgent
  component: FormulationComponent
  label: string
  order: number
}

export const FORMULATION_COMPONENT_REGISTRY = [
  {
    agent: 'research',
    component: 'theoretical_framework',
    label: 'Marco teórico',
    order: 1,
  },
  {
    agent: 'research',
    component: 'state_of_art',
    label: 'Estado del arte',
    order: 2,
  },
  {
    agent: 'research',
    component: 'problem_statement',
    label: 'Planteamiento del problema',
    order: 3,
  },
  {
    agent: 'research',
    component: 'background',
    label: 'Antecedentes',
    order: 4,
  },
  {
    agent: 'research',
    component: 'bibliography',
    label: 'Bibliografía',
    order: 5,
  },
  {
    agent: 'ideation',
    component: 'activities',
    label: 'Actividades',
    order: 6,
  },
  {
    agent: 'ideation',
    component: 'smart_objectives',
    label: 'Objetivos SMART',
    order: 7,
  },
  {
    agent: 'ideation',
    component: 'schedule',
    label: 'Cronograma',
    order: 8,
  },
  {
    agent: 'methodology',
    component: 'methodology',
    label: 'Metodología',
    order: 9,
  },
  {
    agent: 'budget',
    component: 'budget',
    label: 'Presupuesto',
    order: 10,
  },
  {
    agent: 'impact',
    component: 'beneficiaries',
    label: 'Beneficiarios',
    order: 11,
  },
  {
    agent: 'impact',
    component: 'risks',
    label: 'Riesgos',
    order: 12,
  },
  {
    agent: 'impact',
    component: 'expected_impacts',
    label: 'Impactos esperados',
    order: 13,
  },
] as const satisfies readonly FormulationComponentDefinition[]

export const AGENT_COMPONENTS: Record<
  FormulationAgent,
  readonly FormulationComponent[]
> = {
  research: [
    'theoretical_framework',
    'state_of_art',
    'problem_statement',
    'background',
    'bibliography',
  ],
  ideation: ['activities', 'smart_objectives', 'schedule'],
  methodology: ['methodology'],
  budget: ['budget'],
  impact: ['beneficiaries', 'risks', 'expected_impacts'],
}

export const AGENT_DEPENDENCIES: Record<
  FormulationAgent,
  readonly FormulationAgent[]
> = {
  research: [],
  ideation: ['research'],
  methodology: ['research', 'ideation'],
  budget: ['ideation', 'methodology'],
  impact: ['research', 'ideation', 'methodology', 'budget'],
}
