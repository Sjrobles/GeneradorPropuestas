import type {
  ComponentType,
  ExecutionDetails,
  Methodology,
  ProjectContext,
} from '@/types/domain'

export interface ComponentDraft {
  content: string
  structuredContent?: Methodology
  type: ComponentType
}

export interface AgentGenerationInput {
  context: ProjectContext
  executionDetails?: ExecutionDetails
  existingDrafts: Partial<Record<ComponentType, ComponentDraft>>
  type: ComponentType
}

export interface FormulationSubagent {
  generate(input: AgentGenerationInput): ComponentDraft
}

interface ConfirmedMockContext {
  expectedResults: string
  initialScope: string
  location: string
  objectiveCount: number
  problem: string
  projectDuration: string
  proposedSolution: string
  targetPopulation: string
}

export function requireContext(context: ProjectContext) {
  const values = {
    problem: context.problem?.trim(),
    targetPopulation: context.targetPopulation?.trim(),
    location: context.location?.trim(),
    objectiveCount: context.objectiveCount,
    proposedSolution: context.proposedSolution?.trim(),
    expectedResults: context.expectedResults?.trim(),
    initialScope: context.initialScope?.trim(),
    projectDuration: context.projectDuration?.trim(),
  }

  if (
    Object.entries(values).some(([field, value]) =>
      field === 'objectiveCount'
        ? !Number.isInteger(value) || Number(value) < 2 || Number(value) > 5
        : !value,
    )
  ) {
    throw new Error(
      'El contexto confirmado no contiene todos los campos requeridos.',
    )
  }

  return values as ConfirmedMockContext
}
