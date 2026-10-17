import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  type NestInterceptor,
} from '@nestjs/common'
import { randomUUID } from 'node:crypto'
import type { Request, Response } from 'express'
import type { Observable } from 'rxjs'
import { catchError, finalize, throwError } from 'rxjs'

@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HttpRequest')

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp()
    const request = http.getRequest<Request>()
    const response = http.getResponse<Response>()
    const requestId =
      request.header('x-request-id')?.slice(0, 100) || randomUUID()
    const startedAt = performance.now()
    let errorName: string | undefined

    response.setHeader('x-request-id', requestId)

    return next.handle().pipe(
      catchError((error: unknown) => {
        errorName = error instanceof Error ? error.name : 'UnknownError'
        return throwError(() => error)
      }),
      finalize(() => {
        this.logger.log(
          JSON.stringify({
            durationMs: Math.round(performance.now() - startedAt),
            error: errorName,
            event: 'http_request_completed',
            method: request.method,
            path: request.originalUrl.split('?')[0],
            requestId,
            statusCode: response.statusCode,
          }),
        )
      }),
    )
  }
}
