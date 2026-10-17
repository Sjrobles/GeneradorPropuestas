import { afterEach, describe, expect, it, vi } from 'vitest'

import { BackendAuthApi } from './backend-auth-api'
import { clearAuthSession, saveAuthSession } from './auth-session'

const VALID_ACCESS_TOKEN = 'eyJhbGciOiJub25lIn0.eyJleHAiOjQxNDY2NzIwMDB9.'

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json' },
    status,
  })
}

describe('BackendAuthApi', () => {
  afterEach(() => {
    clearAuthSession()
    vi.unstubAllGlobals()
  })

  it('registra una cuenta mediante el backend', async () => {
    const session = {
      accessToken: VALID_ACCESS_TOKEN,
      user: {
        createdAt: '2026-08-14T20:00:00.000Z',
        email: 'alejandro@example.com',
        id: 'user-id',
        name: 'Alejandro Fontalvo',
      },
    }
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ status: 'ok' }))
      .mockResolvedValueOnce(jsonResponse(session, 201))
    vi.stubGlobal('fetch', fetchMock)

    const api = new BackendAuthApi('http://api.test/api/v1')
    await expect(
      api.register({
        email: session.user.email,
        name: session.user.name,
        password: 'una-clave-segura',
      }),
    ).resolves.toEqual(session)
    expect(fetchMock.mock.calls[1]?.[0]).toBe(
      'http://api.test/api/v1/auth/register',
    )
  })

  it('envía el token al consultar la sesión actual', async () => {
    saveAuthSession({
      accessToken: VALID_ACCESS_TOKEN,
      user: {
        createdAt: '2026-08-14T20:00:00.000Z',
        email: 'alejandro@example.com',
        id: 'user-id',
        name: 'Alejandro Fontalvo',
      },
    })
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ status: 'ok' }))
      .mockResolvedValueOnce(jsonResponse({ id: 'user-id' }))
    vi.stubGlobal('fetch', fetchMock)

    const api = new BackendAuthApi('http://api.test/api/v1')
    await api.getCurrentUser()

    const headers = new Headers(fetchMock.mock.calls[1]?.[1]?.headers)
    expect(headers.get('Authorization')).toBe(`Bearer ${VALID_ACCESS_TOKEN}`)
  })
})
