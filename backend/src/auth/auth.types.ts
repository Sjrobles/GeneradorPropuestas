import type { UserResponse } from '../users/users.types'

export type AuthenticatedUser = UserResponse

export interface JwtPayload {
  email: string
  sub: string
  version?: number
}

export interface AuthResponse {
  accessToken: string
  user: UserResponse
}
