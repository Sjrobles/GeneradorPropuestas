import { ValidationPipe, type INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import type { Server } from 'node:http'
import request from 'supertest'
import { HealthController } from '../src/health/health.controller'
import { HealthService } from '../src/health/health.service'
import { SkillsController } from '../src/skills/skills.controller'
import { SkillsService } from '../src/skills/skills.service'

describe('Fundación de la API (e2e)', () => {
  let app: INestApplication
  let server: Server

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [HealthController, SkillsController],
      providers: [
        SkillsService,
        {
          provide: HealthService,
          useValue: {
            live: () => ({ service: 'agora-backend', status: 'ok' }),
            ready: () => ({
              checks: { mongodb: 'ok' },
              service: 'agora-backend',
              status: 'ready',
            }),
          },
        },
      ],
    }).compile()

    app = moduleRef.createNestApplication()
    app.setGlobalPrefix('api/v1')
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }))
    await app.init()
    server = app.getHttpServer() as Server
  })

  afterAll(async () => app.close())

  it('publica el health check versionado', async () => {
    const response = await request(server).get('/api/v1/health').expect(200)

    expect(response.body).toMatchObject({
      service: 'agora-backend',
      status: 'ok',
    })
  })

  it('separa vivacidad y disponibilidad de MongoDB', async () => {
    await request(server).get('/api/v1/health/live').expect(200)
    const response = await request(server)
      .get('/api/v1/health/ready')
      .expect(200)

    expect(response.body).toMatchObject({
      checks: { mongodb: 'ok' },
      status: 'ready',
    })
  })

  it('entrega el catálogo compatible con el frontend', async () => {
    const response = await request(server).get('/api/v1/skills').expect(200)

    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          enabled: true,
          id: 'international-calls',
        }),
      ]),
    )
  })
})
