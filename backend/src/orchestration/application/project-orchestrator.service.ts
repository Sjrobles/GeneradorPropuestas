import { Injectable } from '@nestjs/common'
import type { FormulationAgentOutput } from '../contracts/agent-output.schemas'
import {
  AGENT_DEPENDENCIES,
  FORMULATION_AGENTS,
  type FormulationAgent,
} from '../domain/formulation.constants'
import { AgentExecutorService } from './agent-executor.service'
import type {
  ProjectGenerationInput,
  ProjectGenerationLifecycle,
  ProjectGenerationOutput,
} from './orchestration.types'

@Injectable()
export class ProjectOrchestratorService {
  constructor(private readonly executor: AgentExecutorService) {}

  async generate(
    input: ProjectGenerationInput,
    lifecycle: ProjectGenerationLifecycle = {},
  ): Promise<ProjectGenerationOutput> {
    const outputs: Partial<Record<FormulationAgent, FormulationAgentOutput>> = {
      ...(input.initialOutputs ?? {}),
    }
    const executionInput = {
      context: input.context,
      executionDetails: input.executionDetails,
      language: input.language,
      projectTitle: input.projectTitle,
      safetyIdentifier: input.safetyIdentifier,
    }

    for (const agent of FORMULATION_AGENTS) {
      if (outputs[agent] !== undefined) {
        if (agent === input.stopAfterAgent) break
        continue
      }
      await lifecycle.onAgentStarted?.(agent)
      const previousOutputs = Object.fromEntries(
        AGENT_DEPENDENCIES[agent]
          .filter((dependency) => outputs[dependency] !== undefined)
          .map((dependency) => [dependency, outputs[dependency]]),
      ) as Partial<Record<FormulationAgent, FormulationAgentOutput>>

      const output = await this.executor.execute({
        ...executionInput,
        agent,
        previousOutputs,
      })
      outputs[agent] = output
      await lifecycle.onAgentCompleted?.(agent, output)
      if (agent === input.stopAfterAgent) break
    }

    return outputs
  }
}
