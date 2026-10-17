import type { AuthSession, User } from '@/types/domain'

import { getAuthSession } from './auth-session'

interface AuthCredentials {
  email: string
  password: string
}

interface RegisterInput extends AuthCredentials {
  name: string
}

const MOCK_USERS_STORAGE_KEY = 'agora.mock.v1.users'

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function getStoredUsers(): User[] {
  try {
    const serializedUsers = window.localStorage.getItem(MOCK_USERS_STORAGE_KEY)
    return serializedUsers ? (JSON.parse(serializedUsers) as User[]) : []
  } catch {
    window.localStorage.removeItem(MOCK_USERS_STORAGE_KEY)
    return []
  }
}

function saveStoredUsers(users: User[]) {
  window.localStorage.setItem(MOCK_USERS_STORAGE_KEY, JSON.stringify(users))
}

function createUserId(email: string) {
  let hash = 0
  for (const character of email) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0
  }
  return `mock-user-${hash.toString(36)}`
}

function createSession(user: User): AuthSession {
  return {
    accessToken: `mock-token-${user.id}`,
    user,
  }
}

function inferName(email: string) {
  const localPart = email.split('@')[0] ?? 'Usuario local'
  return localPart
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export class MockAuthApi {
  register(input: RegisterInput): Promise<AuthSession> {
    const email = normalizeEmail(input.email)
    const users = getStoredUsers()
    const existingUser = users.find((user) => user.email === email)
    const user: User = existingUser ?? {
      createdAt: new Date().toISOString(),
      email,
      id: createUserId(email),
      name: input.name.trim(),
    }

    if (!existingUser) {
      saveStoredUsers([...users, user])
    }

    return Promise.resolve(createSession(user))
  }

  login(input: AuthCredentials): Promise<AuthSession> {
    const email = normalizeEmail(input.email)
    const users = getStoredUsers()
    let user = users.find((candidate) => candidate.email === email)

    if (!user) {
      user = {
        createdAt: new Date().toISOString(),
        email,
        id: createUserId(email),
        name: inferName(email),
      }
      saveStoredUsers([...users, user])
    }

    return Promise.resolve(createSession(user))
  }

  getCurrentUser(): Promise<User> {
    const session = getAuthSession()
    if (!session) {
      return Promise.reject(new Error('No existe una sesión local activa.'))
    }
    return Promise.resolve(session.user)
  }
}

export const mockAuthApi = new MockAuthApi()
