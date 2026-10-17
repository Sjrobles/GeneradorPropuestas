import {
  type ArgumentsHost,
  HttpStatus,
  PayloadTooLargeException,
} from '@nestjs/common'
import { InfrastructureExceptionFilter } from './infrastructure-exception.filter'

describe('InfrastructureExceptionFilter', () => {
  it('convierte el límite de carga en un error claro para el Excel', () => {
    const status = jest.fn().mockReturnThis()
    const json = jest.fn()
    const host = {
      switchToHttp: () => ({
        getRequest: () => ({
          method: 'POST',
          originalUrl: '/api/v1/projects/id/components/budget/workbook',
        }),
        getResponse: () => ({ json, status }),
      }),
    } as unknown as ArgumentsHost

    new InfrastructureExceptionFilter().catch(
      new PayloadTooLargeException('File too large'),
      host,
    )

    expect(status).toHaveBeenCalledWith(HttpStatus.PAYLOAD_TOO_LARGE)
    expect(json).toHaveBeenCalledWith({
      code: 'VALIDATION_ERROR',
      message: 'El archivo Excel no puede superar 5 MB.',
      statusCode: HttpStatus.PAYLOAD_TOO_LARGE,
    })
  })

  it('conserva la respuesta original para otros límites de carga', () => {
    const status = jest.fn().mockReturnThis()
    const json = jest.fn()
    const exception = new PayloadTooLargeException('File too large')
    const host = {
      switchToHttp: () => ({
        getRequest: () => ({
          method: 'POST',
          originalUrl: '/api/v1/other-upload',
        }),
        getResponse: () => ({ json, status }),
      }),
    } as unknown as ArgumentsHost

    new InfrastructureExceptionFilter().catch(exception, host)

    expect(status).toHaveBeenCalledWith(HttpStatus.PAYLOAD_TOO_LARGE)
    expect(json).toHaveBeenCalledWith(exception.getResponse())
  })
})
