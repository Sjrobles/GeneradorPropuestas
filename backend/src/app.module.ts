import { Logger, Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import type { Connection } from 'mongoose'
import { AuthModule } from './auth/auth.module'
import { validateEnvironment, type Environment } from './config/environment'
import { HealthModule } from './health/health.module'
import { OrchestrationModule } from './orchestration/orchestration.module'
import { ProjectsModule } from './projects/projects.module'
import { SkillsModule } from './skills/skills.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      validate: validateEnvironment,
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Environment, true>) => {
        const logger = new Logger('MongoDB')
        return {
          connectTimeoutMS: 15_000,
          connectionFactory: (connection: Connection) => {
            connection.on('connected', () =>
              logger.log(JSON.stringify({ event: 'mongodb_connected' })),
            )
            connection.on('reconnected', () =>
              logger.log(JSON.stringify({ event: 'mongodb_reconnected' })),
            )
            connection.on('disconnected', () =>
              logger.warn(JSON.stringify({ event: 'mongodb_disconnected' })),
            )
            connection.on('error', (error: Error) =>
              logger.error(
                JSON.stringify({
                  event: 'mongodb_error',
                  errorType: /tls|ssl/i.test(error.message)
                    ? 'tls'
                    : 'connection',
                  message: error.message,
                }),
              ),
            )
            return connection
          },
          heartbeatFrequencyMS: 10_000,
          retryAttempts: 8,
          retryDelay: 2_000,
          serverSelectionTimeoutMS: 15_000,
          socketTimeoutMS: 60_000,
          uri: config.get('MONGODB_URI', { infer: true }),
        }
      },
    }),
    AuthModule,
    HealthModule,
    SkillsModule,
    ProjectsModule,
    OrchestrationModule,
  ],
})
export class AppModule {}
