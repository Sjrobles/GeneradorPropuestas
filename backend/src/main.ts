import { Logger, ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import helmet from 'helmet'
import { AppModule } from './app.module'
import type { Environment } from './config/environment'
import { RequestLoggingInterceptor } from './common/interceptors/request-logging.interceptor'
import { InfrastructureExceptionFilter } from './common/filters/infrastructure-exception.filter'

async function bootstrap() {
  const startedAt = performance.now()
  const logger = new Logger('Bootstrap')
  const app = await NestFactory.create(AppModule, { cors: false })
  const config = app.get(ConfigService<Environment, true>)
  const frontendOrigins = config
    .get('FRONTEND_ORIGIN', { infer: true })
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)

  app.use(helmet())
  app.enableCors({
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    origin: frontendOrigins,
  })
  app.setGlobalPrefix('api/v1')
  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      transform: true,
      whitelist: true,
    }),
  )
  app.useGlobalInterceptors(new RequestLoggingInterceptor())
  app.useGlobalFilters(new InfrastructureExceptionFilter())

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Ágora API')
    .setDescription('API REST versionada para la formulación de proyectos CTeI')
    .setVersion('1.0')
    .addBearerAuth()
    .build()
  SwaggerModule.setup(
    'api/docs',
    app,
    () => SwaggerModule.createDocument(app, swaggerConfig),
    { jsonDocumentUrl: 'api/docs/openapi.json' },
  )

  const port = config.get('PORT', { infer: true })
  await app.listen(port, '0.0.0.0')
  logger.log(
    JSON.stringify({
      durationMs: Math.round(performance.now() - startedAt),
      event: 'application_ready',
      port,
    }),
  )
}

void bootstrap()
