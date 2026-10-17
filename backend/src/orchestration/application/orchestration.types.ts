import type { FormulationAgentOutput } from '../contracts/agent-output.schemas'
import type { FormulationAgent } from '../domain/formulation.constants'

export type FormulationLanguage = 'en' | 'es'

export interface ConfirmedProjectContext {
  expectedResults: string
  initialScope: string
  location: string
  objectiveCount: number
  problem: string
  projectDuration: string
  proposedSolution: string
  targetPopulation: string
}

export interface ExecutionDetails {
  activityDevelopment: string
  participants: string
  locationsAndParticipants: string
  requiredResources: string
  timelineAndDependencies: string
  expectedDeliverables: string
  verificationMethods: string
  knownEconomicInformation: string
  specialConditions: string
}

export interface AgentExecutionInput {
  agent: FormulationAgent
  context: ConfirmedProjectContext
  executionDetails?: ExecutionDetails
  language: FormulationLanguage
  previousOutputs: Partial<Record<FormulationAgent, FormulationAgentOutput>>
  projectTitle: string
  safetyIdentifier: string
}

export interface ProjectGenerationInput {
  context: ConfirmedProjectContext
  executionDetails?: ExecutionDetails
  initialOutputs?: Partial<Record<FormulationAgent, FormulationAgentOutput>>
  language: FormulationLanguage
  projectTitle: string
  safetyIdentifier: string
  stopAfterAgent?: FormulationAgent
}

export interface ProjectGenerationLifecycle {
  onAgentCompleted?: (
    agent: FormulationAgent,
    output: FormulationAgentOutput,
  ) => Promise<void> | void
  onAgentStarted?: (agent: FormulationAgent) => Promise<void> | void
}

export type ProjectGenerationOutput = Partial<
  Record<FormulationAgent, FormulationAgentOutput>
>
