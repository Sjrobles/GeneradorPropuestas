import type { AgentExecutorService } from './agent-executor.service'
import type { FormulationAgentOutput } from '../contracts/agent-output.schemas'
import type { AgentExecutionInput } from './orchestration.types'
import { ProjectOrchestratorService } from './project-orchestrator.service'

describe('ProjectOrchestratorService', () => {
  it('ejecuta los cinco agentes en orden y entrega a impacto todas sus dependencias', async () => {
    const calls: AgentExecutionInput[] = []
    const execute = jest.fn((input: AgentExecutionInput) => {
      calls.push(input)
      return Promise.resolve({ agent: input.agent } as FormulationAgentOutput)
    })
    const service = new ProjectOrchestratorService({
      execute,
    } as unknown as AgentExecutorService)

    const result = await service.generate({
      context: {
        expectedResults: 'Resultados',
        initialScope: 'Alcance',
        projectDuration: '6 meses',
        location: 'Bolívar',
        objectiveCount: 3,
        problem: 'Problema',
        proposedSolution: 'Solución',
        targetPopulation: 'Población',
      },
      language: 'en',
      projectTitle: 'Proyecto',
      safetyIdentifier: 'safe-user',
    })

    expect(calls.map(({ agent }) => agent)).toEqual([
      'research',
      'ideation',
      'methodology',
      'budget',
      'impact',
    ])
    expect(calls.every(({ language }) => language === 'en')).toBe(true)
    expect(calls[2].previousOutputs).toEqual({
      research: { agent: 'research' },
      ideation: { agent: 'ideation' },
    })
    expect(calls[4].previousOutputs).toEqual({
      research: { agent: 'research' },
      ideation: { agent: 'ideation' },
      methodology: { agent: 'methodology' },
      budget: { agent: 'budget' },
    })
    expect(Object.keys(result)).toHaveLength(5)
  })

  it('reanuda desde el agente pendiente sin repetir salidas ya guardadas', async () => {
    const execute = jest.fn((input: AgentExecutionInput) =>
      Promise.resolve({ agent: input.agent } as FormulationAgentOutput),
    )
    const service = new ProjectOrchestratorService({
      execute,
    } as unknown as AgentExecutorService)
    const initialOutputs = {
      research: { agent: 'research' } as FormulationAgentOutput,
      ideation: { agent: 'ideation' } as FormulationAgentOutput,
      methodology: { agent: 'methodology' } as FormulationAgentOutput,
      budget: { agent: 'budget' } as FormulationAgentOutput,
    }

    const result = await service.generate({
      context: {
        expectedResults: 'Resultados',
        initialScope: 'Alcance',
        projectDuration: '6 meses',
        location: 'Bolívar',
        objectiveCount: 3,
        problem: 'Problema',
        proposedSolution: 'Solución',
        targetPopulation: 'Población',
      },
      initialOutputs,
      language: 'es',
      projectTitle: 'Proyecto',
      safetyIdentifier: 'safe-user',
    })

    expect(execute).toHaveBeenCalledTimes(1)
    expect(execute).toHaveBeenCalledWith(
      expect.objectContaining({ agent: 'impact' }),
    )
    expect(result.research).toBe(initialOutputs.research)
    expect(result.impact?.agent).toBe('impact')
  })

  it('se detiene después de ideación cuando el usuario debe responder', async () => {
    const execute = jest.fn((input: AgentExecutionInput) =>
      Promise.resolve({ agent: input.agent } as FormulationAgentOutput),
    )
    const service = new ProjectOrchestratorService({
      execute,
    } as unknown as AgentExecutorService)

    const result = await service.generate({
      context: {
        expectedResults: 'Resultados',
        initialScope: 'Alcance',
        projectDuration: '6 meses',
        location: 'Bolívar',
        objectiveCount: 3,
        problem: 'Problema',
        proposedSolution: 'Solución',
        targetPopulation: 'Población',
      },
      language: 'es',
      projectTitle: 'Proyecto',
      safetyIdentifier: 'safe-user',
      stopAfterAgent: 'ideation',
    })

    expect(execute.mock.calls.map(([input]) => input.agent)).toEqual([
      'research',
      'ideation',
    ])
    expect(result.methodology).toBeUndefined()
  })

  it('respeta la pausa aunque investigación e ideación ya estén persistidos', async () => {
    const execute = jest.fn((input: AgentExecutionInput) =>
      Promise.resolve({ agent: input.agent } as FormulationAgentOutput),
    )
    const service = new ProjectOrchestratorService({
      execute,
    } as unknown as AgentExecutorService)

    await service.generate({
      context: {
        expectedResults: 'Resultados',
        initialScope: 'Alcance',
        projectDuration: '6 meses',
        location: 'Bolívar',
        objectiveCount: 3,
        problem: 'Problema',
        proposedSolution: 'Solución',
        targetPopulation: 'Población',
      },
      initialOutputs: {
        research: { agent: 'research' } as FormulationAgentOutput,
        ideation: { agent: 'ideation' } as FormulationAgentOutput,
      },
      language: 'es',
      projectTitle: 'Proyecto',
      safetyIdentifier: 'safe-user',
      stopAfterAgent: 'ideation',
    })

    expect(execute).not.toHaveBeenCalled()
  })
})
