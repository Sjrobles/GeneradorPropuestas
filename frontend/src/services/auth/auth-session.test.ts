import { afterEach, describe, expect, it, vi } from 'vitest'
import type { AuthSession } from '@/types/domain'
import {
  clearAuthSession,
  getAccessToken,
  getAuthSession,
  getValidAuthSession,
  isAccessTokenExpired,
  saveAuthSession,
  SESSION_EXPIRED_EVENT,
} from './auth-session'

function token(exp: number) {
  return `eyJhbGciOiJub25lIn0.${window.btoa(JSON.stringify({ exp }))}.`
}

function session(accessToken: string): AuthSession {
  return {
    accessToken,
    user: {
      createdAt: '2026-10-08T12:00:00.000Z',
      email: 'usuario@example.com',
      id: 'user-id',
      name: 'Usuario',
    },
  }
}

describe('auth-session', () => {
  afterEach(() => clearAuthSession())

  it('conserva un JWT vigente y elimina uno vencido', () => {
    const now = Date.now()
    const validToken = token(Math.floor(now / 1_000) + 60)
    const expiredToken = token(Math.floor(now / 1_000) - 1)

    expect(isAccessTokenExpired(validToken, now)).toBe(false)
    expect(isAccessTokenExpired(expiredToken, now)).toBe(true)

    saveAuthSession(session(expiredToken))
    expect(getValidAuthSession()).toBeNull()
    expect(getAuthSession()).toBeNull()
  })

  it('notifica la expiración antes de enviar una solicitud', () => {
    const listener = vi.fn()
    window.addEventListener(SESSION_EXPIRED_EVENT, listener)
    saveAuthSession(session(token(1)))

    expect(getAccessToken()).toBeUndefined()
    expect(listener).toHaveBeenCalledTimes(1)
    window.removeEventListener(SESSION_EXPIRED_EVENT, listener)
  })
})
