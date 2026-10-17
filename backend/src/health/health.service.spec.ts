import { ServiceUnavailableException } from '@nestjs/common'
import type { Connection } from 'mongoose'
import { HealthService } from './health.service'

describe('HealthService', () => {
  it('confirma disponibilidad cuando MongoDB responde al ping', async () => {
    const ping = jest.fn().mockResolvedValue({ ok: 1 })
    const connection = {
      db: { admin: () => ({ ping }) },
      readyState: 1,
    } as unknown as Connection

    const result = await new HealthService(connection).ready()

    expect(result.status).toBe('ready')
    expect(result.checks.mongodb).toBe('ok')
    expect(ping).toHaveBeenCalledTimes(1)
  })

  it('identifica MongoDB como no disponible sin exponer credenciales', async () => {
    const connection = { readyState: 0 } as Connection

    try {
      await new HealthService(connection).ready()
      throw new Error('Se esperaba que el health check fallara')
    } catch (error) {
      expect(error).toBeInstanceOf(ServiceUnavailableException)
      const response = (error as ServiceUnavailableException).getResponse()
      expect(response).toEqual(
        expect.objectContaining({
          code: 'MONGODB_UNAVAILABLE',
          status: 'not_ready',
        }),
      )
    }
  })
})
