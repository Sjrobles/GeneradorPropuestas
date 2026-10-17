import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common'
import { InjectConnection } from '@nestjs/mongoose'
import { ConnectionStates, type Connection } from 'mongoose'

const DATABASE_PING_TIMEOUT_MS = 5_000

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name)

  constructor(@InjectConnection() private readonly connection: Connection) {}

  live() {
    return {
      responseTimeMs: 0,
      service: 'agora-backend',
      status: 'ok' as const,
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
    }
  }

  async ready() {
    const startedAt = performance.now()
    try {
      if (
        this.connection.readyState !== ConnectionStates.connected ||
        !this.connection.db
      ) {
        throw new Error(`MongoDB state ${this.connection.readyState}`)
      }
      let timeout: NodeJS.Timeout | undefined
      try {
        await Promise.race([
          this.connection.db.admin().ping(),
          new Promise((_, reject) => {
            timeout = setTimeout(
              () => reject(new Error('MongoDB ping timeout')),
              DATABASE_PING_TIMEOUT_MS,
            )
          }),
        ])
      } finally {
        if (timeout) clearTimeout(timeout)
      }
      return {
        checks: { mongodb: 'ok' as const },
        responseTimeMs: Math.round(performance.now() - startedAt),
        service: 'agora-backend',
        status: 'ready' as const,
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'unknown error'
      this.logger.error(
        JSON.stringify({
          event: 'mongodb_readiness_failed',
          reason,
          responseTimeMs: Math.round(performance.now() - startedAt),
        }),
      )
      throw new ServiceUnavailableException({
        checks: { mongodb: 'unavailable' },
        code: 'MONGODB_UNAVAILABLE',
        message:
          'La base de datos no está disponible temporalmente. Inténtalo nuevamente en unos segundos.',
        responseTimeMs: Math.round(performance.now() - startedAt),
        service: 'agora-backend',
        status: 'not_ready',
        timestamp: new Date().toISOString(),
      })
    }
  }
}
