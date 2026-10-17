import type { AuthSession } from '@/types/domain'

const AUTH_STORAGE_KEY = 'agora.auth.v1.session'
const SESSION_EXPIRED_STORAGE_KEY = 'agora.auth.v1.expired'
export const SESSION_EXPIRED_EVENT = 'agora:session-expired'

interface JwtPayload {
  exp?: number
}

function decodeJwtPayload(token: string): JwtPayload | null {
  const encodedPayload = token.split('.')[1]
  if (!encodedPayload) return null

  try {
    const normalized = encodedPayload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
    return JSON.parse(window.atob(padded)) as JwtPayload
  } catch {
    return null
  }
}

export function isAccessTokenExpired(
  token: string,
  nowMilliseconds = Date.now(),
): boolean {
  const payload = decodeJwtPayload(token)
  return (
    !payload ||
    typeof payload.exp !== 'number' ||
    payload.exp * 1_000 <= nowMilliseconds
  )
}

export function getAuthSession(): AuthSession | null {
  try {
    const serializedSession = window.localStorage.getItem(AUTH_STORAGE_KEY)
    return serializedSession
      ? (JSON.parse(serializedSession) as AuthSession)
      : null
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY)
    return null
  }
}

export function getValidAuthSession(): AuthSession | null {
  const session = getAuthSession()
  if (!session) return null
  if (!isAccessTokenExpired(session.accessToken)) return session

  expireAuthSession()
  return null
}

export function getAccessToken() {
  const session = getAuthSession()
  if (!session) return undefined
  if (isAccessTokenExpired(session.accessToken)) {
    expireAuthSession()
    return undefined
  }
  return session.accessToken
}

export function saveAuthSession(session: AuthSession) {
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))
  window.sessionStorage.removeItem(SESSION_EXPIRED_STORAGE_KEY)
}

export function clearAuthSession() {
  window.localStorage.removeItem(AUTH_STORAGE_KEY)
  window.sessionStorage.removeItem(SESSION_EXPIRED_STORAGE_KEY)
}

export function expireAuthSession() {
  const hadSession = Boolean(getAuthSession())
  clearAuthSession()
  if (hadSession) {
    window.sessionStorage.setItem(SESSION_EXPIRED_STORAGE_KEY, '1')
    window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT))
  }
}

export function hasExpiredSessionNotice() {
  return window.sessionStorage.getItem(SESSION_EXPIRED_STORAGE_KEY) === '1'
}
