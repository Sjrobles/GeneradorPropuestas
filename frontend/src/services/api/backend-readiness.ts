import {
  ApiClientError,
  API_ERROR_MESSAGES,
  classifyFetchError,
} from './api-errors'

const readinessRequests = new Map<string, Promise<void>>()
const RETRY_DELAYS_MS = [0, 1_000, 2_000]

function wait(milliseconds: number) {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds))
}

async function checkBackend(baseUrl: string): Promise<void> {
  let lastError: unknown
  for (const delay of RETRY_DELAYS_MS) {
    if (delay) await wait(delay)
    try {
      const response = await fetch(`${baseUrl}/health/live`, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(45_000),
      })
      if (response.ok) return
      lastError = new ApiClientError(
        API_ERROR_MESSAGES.SERVER_UNAVAILABLE,
        'SERVER_UNAVAILABLE',
        response.status,
      )
    } catch (error) {
      lastError = classifyFetchError(error)
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new ApiClientError(
        API_ERROR_MESSAGES.SERVER_UNAVAILABLE,
        'SERVER_UNAVAILABLE',
      )
}

export function ensureBackendReady(baseUrl: string): Promise<void> {
  const existing = readinessRequests.get(baseUrl)
  if (existing) return existing

  const request = checkBackend(baseUrl).finally(() => {
    if (readinessRequests.get(baseUrl) === request) {
      readinessRequests.delete(baseUrl)
    }
  })
  readinessRequests.set(baseUrl, request)
  return request
}
