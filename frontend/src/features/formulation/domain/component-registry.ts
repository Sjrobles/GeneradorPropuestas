import { COMPONENT_TYPES, type ComponentType } from '@/types/domain'

export type FormulationAgent =
  | 'ResearchAgent'
  | 'IdeationAgent'
  | 'ImpactAgent'
  | 'BudgetAgent'
  | 'MethodologyAgent'

export const agentLabels: Record<FormulationAgent, string> = {
  ResearchAgent: 'Agente de investigación',
  IdeationAgent: 'Agente de ideación',
  ImpactAgent: 'Agente de impacto',
  BudgetAgent: 'Agente de presupuesto',
  MethodologyAgent: 'Agente de metodología',
}

export interface ComponentDefinition {
  agent: FormulationAgent
  description: string
  englishLabel: string
  label: string
  order: number
  type: ComponentType
}

export const componentRegistry: ComponentDefinition[] = [
  {
    order: 1,
    type: COMPONENT_TYPES.THEORETICAL_FRAMEWORK,
    englishLabel: 'Theoretical framework',
    label: 'Marco teórico',
    description: 'Conceptos que orientan la propuesta.',
    agent: 'ResearchAgent',
  },
  {
    order: 2,
    type: COMPONENT_TYPES.STATE_OF_ART,
    englishLabel: 'State of the art',
    label: 'Estado del arte',
    description: 'Soluciones existentes y vacíos de conocimiento.',
    agent: 'ResearchAgent',
  },
  {
    order: 3,
    type: COMPONENT_TYPES.PROBLEM_STATEMENT,
    englishLabel: 'Problem statement',
    label: 'Planteamiento del problema',
    description: 'Situación, población, causas y alcance del reto.',
    agent: 'ResearchAgent',
  },
  {
    order: 4,
    type: COMPONENT_TYPES.BACKGROUND,
    englishLabel: 'Background',
    label: 'Antecedentes',
    description: 'Experiencias previas relevantes para la propuesta.',
    agent: 'ResearchAgent',
  },
  {
    order: 5,
    type: COMPONENT_TYPES.BIBLIOGRAPHY,
    englishLabel: 'Bibliography',
    label: 'Bibliografía',
    description: 'Fuentes verificables que respaldan la formulación.',
    agent: 'ResearchAgent',
  },
  {
    order: 6,
    type: COMPONENT_TYPES.ACTIVITIES,
    englishLabel: 'Activities',
    label: 'Actividades',
    description: 'Acciones necesarias para producir los resultados.',
    agent: 'IdeationAgent',
  },
  {
    order: 7,
    type: COMPONENT_TYPES.SMART_OBJECTIVES,
    englishLabel: 'SMART objectives',
    label: 'Objetivos SMART',
    description: 'Objetivos específicos, medibles, alcanzables y temporales.',
    agent: 'IdeationAgent',
  },
  {
    order: 8,
    type: COMPONENT_TYPES.SCHEDULE,
    englishLabel: 'Schedule',
    label: 'Cronograma',
    description: 'Secuencia temporal de actividades y entregables.',
    agent: 'IdeationAgent',
  },
  {
    order: 9,
    type: COMPONENT_TYPES.METHODOLOGY,
    englishLabel: 'Methodology',
    label: 'Metodología',
    description: 'Enfoque, fases, productos y evidencias de ejecución.',
    agent: 'MethodologyAgent',
  },
  {
    order: 10,
    type: COMPONENT_TYPES.BUDGET,
    englishLabel: 'Budget',
    label: 'Presupuesto',
    description: 'Recursos y costos estimados para la ejecución.',
    agent: 'BudgetAgent',
  },
  {
    order: 11,
    type: COMPONENT_TYPES.BENEFICIARIES,
    englishLabel: 'Beneficiaries',
    label: 'Beneficiarios',
    description: 'Caracterización de los destinatarios del proyecto.',
    agent: 'ImpactAgent',
  },
  {
    order: 12,
    type: COMPONENT_TYPES.RISKS,
    englishLabel: 'Risks',
    label: 'Riesgos',
    description: 'Eventos que pueden afectar la ejecución y su tratamiento.',
    agent: 'ImpactAgent',
  },
  {
    order: 13,
    type: COMPONENT_TYPES.EXPECTED_IMPACTS,
    englishLabel: 'Expected impacts',
    label: 'Impactos esperados',
    description: 'Cambios derivados de los resultados del proyecto.',
    agent: 'ImpactAgent',
  },
]

export const generationSequence: ComponentType[] = [
  COMPONENT_TYPES.THEORETICAL_FRAMEWORK,
  COMPONENT_TYPES.STATE_OF_ART,
  COMPONENT_TYPES.PROBLEM_STATEMENT,
  COMPONENT_TYPES.BACKGROUND,
  COMPONENT_TYPES.BIBLIOGRAPHY,
  COMPONENT_TYPES.ACTIVITIES,
  COMPONENT_TYPES.SMART_OBJECTIVES,
  COMPONENT_TYPES.SCHEDULE,
  COMPONENT_TYPES.METHODOLOGY,
  COMPONENT_TYPES.BUDGET,
  COMPONENT_TYPES.BENEFICIARIES,
  COMPONENT_TYPES.RISKS,
  COMPONENT_TYPES.EXPECTED_IMPACTS,
]

export function getComponentDefinition(type: ComponentType) {
  const definition = componentRegistry.find(
    (candidate) => candidate.type === type,
  )
  if (!definition) throw new Error(`Componente no registrado: ${type}`)
  return definition
}
