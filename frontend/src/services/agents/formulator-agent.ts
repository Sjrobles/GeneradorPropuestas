import { getComponentDefinition } from '@/features/formulation/domain/component-registry'

import { BudgetAgent } from './budget-agent'
import type { AgentGenerationInput, FormulationSubagent } from './contracts'
import { IdeationAgent } from './ideation-agent'
import { ImpactAgent } from './impact-agent'
import { MethodologyAgent } from './methodology-agent'
import { ResearchAgent } from './research-agent'

export class FormulatorAgent {
  private readonly subagents: Record<string, FormulationSubagent> = {
    ResearchAgent: new ResearchAgent(),
    IdeationAgent: new IdeationAgent(),
    ImpactAgent: new ImpactAgent(),
    BudgetAgent: new BudgetAgent(),
    MethodologyAgent: new MethodologyAgent(),
  }

  generateComponent(input: AgentGenerationInput) {
    const definition = getComponentDefinition(input.type)
    return this.subagents[definition.agent].generate(input)
  }
}

export const formulatorAgent = new FormulatorAgent()
