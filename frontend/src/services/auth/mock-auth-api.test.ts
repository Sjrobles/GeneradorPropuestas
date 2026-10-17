import { beforeEach, describe, expect, it } from 'vitest'

import { MockAuthApi } from './mock-auth-api'

describe('MockAuthApi', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('crea una sesión local persistente sin guardar la contraseña', async () => {
    const api = new MockAuthApi()

    const session = await api.register({
      email: ' Samuel@Example.com ',
      name: 'Samuel Demo',
      password: 'una-clave-local',
    })

    expect(session.user).toMatchObject({
      email: 'samuel@example.com',
      name: 'Samuel Demo',
    })
    expect(session.accessToken).toContain(session.user.id)
    expect(window.localStorage.getItem('agora.mock.v1.users')).not.toContain(
      'una-clave-local',
    )
  })

  it('reutiliza el mismo perfil cuando se inicia sesión nuevamente', async () => {
    const api = new MockAuthApi()
    const registered = await api.register({
      email: 'samuel@example.com',
      name: 'Samuel Demo',
      password: 'una-clave-local',
    })

    const authenticated = await api.login({
      email: 'samuel@example.com',
      password: 'otra-clave-local',
    })

    expect(authenticated.user.id).toBe(registered.user.id)
    expect(authenticated.user.name).toBe('Samuel Demo')
  })
})
