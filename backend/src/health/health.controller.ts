import { Controller, Get } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { HealthService } from './health.service'

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly health: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Verificar disponibilidad de la API' })
  @ApiOkResponse({
    schema: {
      example: {
        service: 'agora-backend',
        status: 'ok',
        timestamp: '2026-08-14T20:00:00.000Z',
      },
    },
  })
  check() {
    return this.health.live()
  }

  @Get('live')
  @ApiOperation({ summary: 'Confirmar que el proceso de la API está activo' })
  live() {
    return this.health.live()
  }

  @Get('ready')
  @ApiOperation({ summary: 'Confirmar disponibilidad de API y MongoDB' })
  ready() {
    return this.health.ready()
  }
}
