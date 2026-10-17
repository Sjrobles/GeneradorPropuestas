export type ApiErrorCode =
  | 'SESSION_EXPIRED'
  | 'OFFLINE'
  | 'TIMEOUT'
  | 'MONGODB_UNAVAILABLE'
  | 'OPENAI_UNAVAILABLE'
  | 'SERVER_UNAVAILABLE'
  | 'VALIDATION_ERROR'
  | 'UNKNOWN'

export class ApiClientError extends Error {
  readonly code: ApiErrorCode
  readonly status?: number

  constructor(
    message: string,
    code: ApiErrorCode,
    status?: number,
    options?: ErrorOptions,
  ) {
    super(message, options)
    this.name = 'ApiClientError'
    this.code = code
    this.status = status
  }
}

export const API_ERROR_MESSAGES: Record<ApiErrorCode, string> = {
  MONGODB_UNAVAILABLE:
    'La base de datos no está disponible temporalmente. Inténtalo nuevamente en unos segundos.',
  OFFLINE:
    'No tienes conexión a internet. Revisa tu red e inténtalo nuevamente.',
  OPENAI_UNAVAILABLE:
    'El servicio de inteligencia artificial no está disponible temporalmente. Tu progreso guardado no se perderá.',
  SERVER_UNAVAILABLE:
    'Ágora no está disponible temporalmente. Inténtalo nuevamente en unos segundos.',
  SESSION_EXPIRED: 'Tu sesión expiró. Inicia sesión nuevamente para continuar.',
  TIMEOUT:
    'La operación está tomando más tiempo de lo esperado. Inténtalo nuevamente en unos segundos.',
  UNKNOWN: 'No fue posible completar la operación.',
  VALIDATION_ERROR:
    'Revisa la información suministrada e inténtalo nuevamente.',
}

export function classifyFetchError(error: unknown): ApiClientError {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return new ApiClientError(
      API_ERROR_MESSAGES.OFFLINE,
      'OFFLINE',
      undefined,
      {
        cause: error,
      },
    )
  }
  if (error instanceof DOMException && error.name === 'TimeoutError') {
    return new ApiClientError(
      API_ERROR_MESSAGES.TIMEOUT,
      'TIMEOUT',
      undefined,
      {
        cause: error,
      },
    )
  }
  return new ApiClientError(
    API_ERROR_MESSAGES.SERVER_UNAVAILABLE,
    'SERVER_UNAVAILABLE',
    undefined,
    { cause: error },
  )
}
