import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  clearAuthSession,
  getAuthSession,
  saveAuthSession,
} from '@/services/auth/auth-session'
import { apiErrorFromResponse } from './api-response'

describe('apiErrorFromResponse', () => {
  afterEach(() => clearAuthSession())

  it('cierra la sesión y entrega el mensaje específico ante un 401', async () => {
    saveAuthSession({
      accessToken: 'token-almacenado',
      user: {
        createdAt: '2026-10-08T12:00:00.000Z',
        email: 'usuario@example.com',
        id: 'user-id',
        name: 'Usuario',
      },
    })
    const listener = vi.fn()
    window.addEventListener('agora:session-expired', listener)

    const error = await apiErrorFromResponse(
      new Response(JSON.stringify({ message: 'Unauthorized' }), {
        status: 401,
      }),
    )

    expect(error.code).toBe('SESSION_EXPIRED')
    expect(error.message).toBe(
      'Tu sesión expiró. Inicia sesión nuevamente para continuar.',
    )
    expect(getAuthSession()).toBeNull()
    expect(listener).toHaveBeenCalledTimes(1)
    window.removeEventListener('agora:session-expired', listener)
  })

  it('distingue un fallo de MongoDB de un error genérico', async () => {
    const error = await apiErrorFromResponse(
      new Response(
        JSON.stringify({
          code: 'MONGODB_UNAVAILABLE',
          message: 'La base de datos no está disponible temporalmente.',
        }),
        { status: 503 },
      ),
    )

    expect(error.code).toBe('MONGODB_UNAVAILABLE')
  })

  it('clasifica un archivo demasiado grande como error de validación', async () => {
    const error = await apiErrorFromResponse(
      new Response(
        JSON.stringify({
          message: 'El archivo Excel no puede superar 5 MB.',
        }),
        { status: 413 },
      ),
    )

    expect(error.code).toBe('VALIDATION_ERROR')
    expect(error.message).toBe('El archivo Excel no puede superar 5 MB.')
  })
})
