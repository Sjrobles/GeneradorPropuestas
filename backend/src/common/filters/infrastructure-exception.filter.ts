import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
  Logger,
  type ExceptionFilter,
} from '@nestjs/common'
import type { Request, Response } from 'express'

@Catch()
export class InfrastructureExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(InfrastructureExceptionFilter.name)

  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp()
    const request = http.getRequest<Request>()
    const response = http.getResponse<Response>()

    if (exception instanceof HttpException) {
      const budgetWorkbookUpload =
        request.method === 'POST' &&
        /\/projects\/[^/]+\/components\/budget\/workbook(?:\?|$)/.test(
          request.originalUrl,
        )
      if (exception.getStatus() === 413 && budgetWorkbookUpload) {
        response.status(HttpStatus.PAYLOAD_TOO_LARGE).json({
          code: 'VALIDATION_ERROR',
          message: 'El archivo Excel no puede superar 5 MB.',
          statusCode: HttpStatus.PAYLOAD_TOO_LARGE,
        })
        return
      }
      response.status(exception.getStatus()).json(exception.getResponse())
      return
    }

    const message =
      exception instanceof Error ? exception.message : String(exception)
    const name = exception instanceof Error ? exception.name : 'UnknownError'
    const mongodbUnavailable =
      /MongoNetworkError|MongooseServerSelectionError|MongoServerSelectionError/i.test(
        name,
      ) ||
      /server selection|topology.*closed|tls|ssl|connection.*mongo|mongo.*connection/i.test(
        message,
      )
    const status = mongodbUnavailable
      ? HttpStatus.SERVICE_UNAVAILABLE
      : HttpStatus.INTERNAL_SERVER_ERROR
    const code = mongodbUnavailable
      ? 'MONGODB_UNAVAILABLE'
      : 'SERVER_UNAVAILABLE'

    this.logger.error(
      JSON.stringify({
        code,
        errorName: name,
        event: 'unhandled_request_error',
        method: request.method,
        path: request.originalUrl.split('?')[0],
      }),
      exception instanceof Error ? exception.stack : undefined,
    )
    response.status(status).json({
      code,
      message: mongodbUnavailable
        ? 'La base de datos no está disponible temporalmente. Inténtalo nuevamente en unos segundos.'
        : 'Ágora no pudo completar la operación. Inténtalo nuevamente.',
      statusCode: status,
    })
  }
}
