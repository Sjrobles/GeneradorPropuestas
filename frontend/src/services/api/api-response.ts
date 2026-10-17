import { expireAuthSession } from '@/services/auth/auth-session'

import {
  ApiClientError,
  type ApiErrorCode,
  API_ERROR_MESSAGES,
} from './api-errors'

interface ApiErrorBody {
  code?: string
  message?: string | string[]
}

const KNOWN_CODES = new Set<ApiErrorCode>([
  'SESSION_EXPIRED',
  'OFFLINE',
  'TIMEOUT',
  'MONGODB_UNAVAILABLE',
  'OPENAI_UNAVAILABLE',
  'SERVER_UNAVAILABLE',
  'VALIDATION_ERROR',
  'UNKNOWN',
])

export async function apiErrorFromResponse(
  response: Response,
  authenticatedRequest = true,
): Promise<ApiClientError> {
  if (response.status === 401 && authenticatedRequest) {
    expireAuthSession()
    return new ApiClientError(
      API_ERROR_MESSAGES.SESSION_EXPIRED,
      'SESSION_EXPIRED',
      response.status,
    )
  }

  const body = (await response.json().catch(() => ({}))) as ApiErrorBody
  const backendMessage = Array.isArray(body.message)
    ? body.message.join(' ')
    : body.message
  const backendCode = body.code as ApiErrorCode | undefined
  const code =
    backendCode && KNOWN_CODES.has(backendCode)
      ? backendCode
      : response.status === 400 ||
          response.status === 401 ||
          response.status === 413 ||
          response.status === 422
        ? 'VALIDATION_ERROR'
        : response.status >= 500
          ? 'SERVER_UNAVAILABLE'
          : 'UNKNOWN'

  return new ApiClientError(
    backendMessage || API_ERROR_MESSAGES[code],
    code,
    response.status,
  )
}
