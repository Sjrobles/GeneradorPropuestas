import { ServiceUnavailableException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Agent } from '@openai/agents'
import type { Environment } from '../../config/environment'
import { PromptCatalogService } from '../prompts/prompt-catalog.service'
import { AgentExecutorService } from './agent-executor.service'

const mockRun = jest.fn<
  Promise<{ finalOutput: unknown }>,
  [agent: unknown, input: string, options: unknown]
>()

jest.mock('@openai/agents', () => ({
  Agent: jest.fn().mockImplementation(() => ({})),
  Runner: jest.fn().mockImplementation(() => ({ run: mockRun })),
  setDefaultOpenAIKey: jest.fn(),
  webSearchTool: jest.fn().mockReturnValue({ type: 'web_search' }),
}))

describe('AgentExecutorService', () => {
  beforeEach(() => {
    mockRun.mockReset()
    ;(Agent as unknown as jest.Mock).mockClear()
  })

  it('no simula componentes cuando falta la clave de OpenAI', async () => {
    const config = {
      get: jest.fn((key: keyof Environment) =>
        key === 'OPENAI_MODEL' ? 'gpt-5.6-luna' : undefined,
      ),
    } as unknown as ConfigService<Environment, true>
    const service = new AgentExecutorService(config, new PromptCatalogService())

    await expect(
      service.execute({
        agent: 'research',
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
        previousOutputs: {},
        projectTitle: 'Proyecto',
        safetyIdentifier: 'safe-user',
      }),
    ).rejects.toBeInstanceOf(ServiceUnavailableException)
  })

  it('reintenta con una instrucción correctiva cuando el JSON no coincide con el esquema', async () => {
    const config = {
      get: jest.fn((key: keyof Environment) => {
        if (key === 'OPENAI_MODEL') return 'gpt-5.6-luna'
        if (key === 'OPENAI_API_KEY') return 'test-key'
        return undefined
      }),
    } as unknown as ConfigService<Environment, true>
    const narrative = 'Presupuesto trazable y verificable. '.repeat(20)
    const budgetOutput = {
      agent: 'budget',
      assumptions: [],
      clarificationQuestions: [],
      consistencyWarnings: [],
      components: {
        budget: {
          currency: 'COP',
          items: [
            {
              activity: 'Realizar la caracterización técnica del territorio.',
              activityIds: ['A1'],
              category: 'Talento humano',
              description: 'Profesional responsable de la actividad A1.',
              fundingSource: null,
              id: 'B1',
              objective: 'Caracterizar técnicamente el territorio.',
              objectiveIds: ['O1'],
              quantity: 2,
              total: 3_000_000,
              unit: 'mes',
              unitCost: 2_000_000,
              valueStatus: 'estimated',
            },
          ],
          narrative,
          total: 99_000_000,
          valueStatus: 'confirmed',
        },
      },
    }
    const runInputs: string[] = []
    mockRun
      .mockImplementationOnce((_agent, input) => {
        runInputs.push(input)
        return Promise.resolve({ finalOutput: 'Evidencia verificable.' })
      })
      .mockImplementationOnce((_agent, input) => {
        runInputs.push(input)
        return Promise.reject(
          new Error(
            'Invalid output type: final assistant output did not match the expected schema.',
          ),
        )
      })
      .mockImplementationOnce((_agent, input) => {
        runInputs.push(input)
        return Promise.resolve({ finalOutput: budgetOutput })
      })
    const service = new AgentExecutorService(config, new PromptCatalogService())

    const result = await service.execute({
      agent: 'budget',
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
      executionDetails: {
        activityDevelopment: 'Actividades detalladas.',
        expectedDeliverables: 'Productos verificables.',
        knownEconomicInformation: 'Valores sujetos a cotización.',
        locationsAndParticipants: 'Bolívar, veinte personas.',
        participants: 'Equipo técnico.',
        requiredResources: 'Equipos y licencias.',
        specialConditions: 'Condiciones técnicas.',
        timelineAndDependencies: 'Seis meses.',
        verificationMethods: 'Actas e indicadores.',
      },
      language: 'en',
      previousOutputs: {},
      projectTitle: 'Proyecto',
      safetyIdentifier: 'safe-user',
    })

    expect(result.agent).toBe('budget')
    if (result.agent !== 'budget') throw new Error('Salida inesperada')
    expect(result.components.budget.items[0]?.total).toBe(4_000_000)
    expect(result.components.budget.total).toBe(4_000_000)
    expect(result.components.budget.valueStatus).toBe('estimated')
    expect(mockRun).toHaveBeenCalledTimes(3)
    const agentMock = Agent as unknown as {
      mock: { calls: Array<[{ instructions?: string }]> }
    }
    expect(agentMock.mock.calls[0]?.[0].instructions).toContain(
      'MANDATORY PROJECT OUTPUT LANGUAGE: ENGLISH',
    )
    expect(runInputs[0]).toContain('"language": "en"')
    expect(runInputs[2]).toContain('CORRECCIÓN OBLIGATORIA DE FORMATO')
  })
})

describe('research execution budget', () => {
  const input = {
    agent: 'research' as const,
    context: {
      expectedResults: 'Resultados',
      initialScope: 'Alcance',
      objectiveCount: 3,
      projectDuration: '6 meses',
      location: 'Bolívar',
      problem: 'Problema',
      proposedSolution: 'Solución',
      targetPopulation: 'Población',
    },
    language: 'es' as const,
    previousOutputs: {},
    projectTitle: 'Proyecto',
    safetyIdentifier: 'safe-user',
  }
  const makeService = () =>
    new AgentExecutorService(
      {
        get: jest.fn((key: keyof Environment) =>
          key === 'OPENAI_MODEL'
            ? 'gpt-5.6-luna'
            : key === 'OPENAI_API_KEY'
              ? 'test-key'
              : undefined,
        ),
      } as unknown as ConfigService<Environment, true>,
      new PromptCatalogService(),
    )

  it('caps corrective research retries and passes the same deadline through evidence and writing', async () => {
    mockRun.mockReset()
    mockRun
      .mockResolvedValueOnce({ finalOutput: 'Fuentes verificadas.' })
      .mockRejectedValue(
        new Error('Invalid final output: did not match the expected schema'),
      )
    await expect(makeService().execute(input)).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    )
    expect(mockRun).toHaveBeenCalledTimes(3)
    const evidenceOptions = mockRun.mock.calls[0][2] as {
      signal: AbortSignal
      maxTurns: number
    }
    const writingOptions = mockRun.mock.calls[1][2] as {
      signal: AbortSignal
      maxTurns: number
    }
    expect(evidenceOptions.signal).toBeInstanceOf(AbortSignal)
    expect(writingOptions.signal).toBe(evidenceOptions.signal)
    expect(writingOptions.maxTurns).toBe(2)
  })

  it('returns a controlled timeout message without approving incomplete research', async () => {
    mockRun.mockReset()
    const controller = new AbortController()
    controller.abort()
    const timeout = jest
      .spyOn(AbortSignal, 'timeout')
      .mockReturnValue(controller.signal)
    mockRun.mockRejectedValue(new Error('AbortError: internal request aborted'))
    try {
      await expect(makeService().execute(input)).rejects.toThrow(
        'La investigación tardó más de lo esperado',
      )
      expect(mockRun).toHaveBeenCalledTimes(1)
    } finally {
      timeout.mockRestore()
    }
  })
})
