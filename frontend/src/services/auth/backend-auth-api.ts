import type { AuthSession, User } from '@/types/domain'

import { classifyFetchError } from '@/services/api/api-errors'
import { ensureBackendReady } from '@/services/api/backend-readiness'
import { apiErrorFromResponse } from '@/services/api/api-response'
import { getAccessToken } from './auth-session'

interface AuthCredentials {
  email: string
  password: string
}

interface RegisterInput extends AuthCredentials {
  name: string
}

const DEFAULT_API_URL = 'http://127.0.0.1:3000/api/v1'

export class BackendAuthApi {
  private readonly baseUrl: string

  constructor(baseUrl?: string) {
    this.baseUrl =
      baseUrl ??
      import.meta.env.VITE_API_URL?.replace(/\/$/, '') ??
      DEFAULT_API_URL
  }

  register(input: RegisterInput) {
    return this.request<AuthSession>('/auth/register', {
      body: JSON.stringify(input),
      method: 'POST',
    })
  }

  login(input: AuthCredentials) {
    return this.request<AuthSession>('/auth/login', {
      body: JSON.stringify(input),
      method: 'POST',
    })
  }

  loginWithGoogle(credential: string) {
    return this.request<AuthSession>('/auth/google', {
      body: JSON.stringify({ credential }),
      method: 'POST',
    })
  }

  getCurrentUser() {
    return this.request<User>('/auth/me')
  }

  async warmUp(): Promise<void> {
    try {
      await ensureBackendReady(this.baseUrl)
    } catch {
      // El calentamiento es preventivo; la pantalla de autenticación seguirá
      // mostrando el error real si el servicio no está disponible.
    }
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    let response: Response
    const token = getAccessToken()

    try {
      await ensureBackendReady(this.baseUrl)
      response = await fetch(`${this.baseUrl}${path}`, {
        ...init,
        signal: init?.signal ?? AbortSignal.timeout(45_000),
        headers: {
          Accept: 'application/json',
          ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...init?.headers,
        },
      })
    } catch (error) {
      throw classifyFetchError(error)
    }

    if (!response.ok) {
      throw await apiErrorFromResponse(response, path === '/auth/me')
    }

    return (await response.json()) as T
  }
}

export const backendAuthApi = new BackendAuthApi()
