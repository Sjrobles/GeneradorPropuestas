import { ConfigService } from '@nestjs/config'
import type { Environment } from '../config/environment'
import { AiService } from './ai.service'

describe('AiService', () => {
  it('usa el respaldo local cuando no existe una clave de OpenAI', async () => {
    const config = {
      get: jest.fn((key: keyof Environment) =>
        key === 'OPENAI_MODEL' ? 'gpt-5.6-luna' : undefined,
      ),
    } as unknown as ConfigService<Environment, true>
    const service = new AiService(config)

    await expect(
      service.composeContextReply({
        answer: 'Una respuesta',
        currentFieldLabel: 'problema',
        fallback: 'Pregunta local',
        language: 'es',
        nextFieldLabel: 'población',
        projectTitle: 'Proyecto',
        safetyIdentifier: 'safe-user',
      }),
    ).resolves.toBe('Pregunta local')
  })

  it('genera un identificador estable que no expone el id del usuario', () => {
    const config = {
      get: jest.fn((key: keyof Environment) =>
        key === 'OPENAI_MODEL' ? 'gpt-5.6-luna' : undefined,
      ),
    } as unknown as ConfigService<Environment, true>
    const service = new AiService(config)

    expect(service.createSafetyIdentifier('usuario-1')).toHaveLength(64)
    expect(service.createSafetyIdentifier('usuario-1')).toBe(
      service.createSafetyIdentifier('usuario-1'),
    )
    expect(service.createSafetyIdentifier('usuario-1')).not.toContain(
      'usuario-1',
    )
  })

  it('devuelve un diagnóstico seguro cuando OpenAI no está configurado', async () => {
    const config = {
      get: jest.fn((key: keyof Environment) =>
        key === 'OPENAI_MODEL' ? 'gpt-5.6-luna' : undefined,
      ),
    } as unknown as ConfigService<Environment, true>
    const service = new AiService(config)

    await expect(
      service.diagnoseContext({
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
      }),
    ).resolves.toEqual({
      ambiguities: [],
      inconsistencies: [],
      questions: [],
    })
  })
})
