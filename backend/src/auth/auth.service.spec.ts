import { UnauthorizedException } from '@nestjs/common'
import type { ConfigService } from '@nestjs/config'
import type { JwtService } from '@nestjs/jwt'
import { compare, hash } from 'bcryptjs'
import {
  OAuth2Client,
  type LoginTicket,
  type VerifyIdTokenOptions,
} from 'google-auth-library'
import type { UserDocument } from '../users/schemas/user.schema'
import type { UsersService } from '../users/users.service'
import type { Environment } from '../config/environment'
import { AuthService } from './auth.service'

const PASSWORD = 'una-clave-segura'

function userFixture(passwordHash: string): UserDocument {
  return {
    createdAt: new Date('2026-08-14T20:00:00.000Z'),
    email: 'alejandro@example.com',
    id: '507f1f77bcf86cd799439099',
    name: 'Alejandro Fontalvo',
    passwordHash,
  } as unknown as UserDocument
}

describe('AuthService', () => {
  const create = jest.fn()
  const findByEmailForAuthentication = jest.fn()
  const findOrCreateGoogleUser = jest.fn()
  const toResponse = jest.fn((user: UserDocument) => ({
    createdAt: user.createdAt.toISOString(),
    email: user.email,
    id: user.id,
    name: user.name,
  }))
  const usersService = {
    create,
    findByEmailForAuthentication,
    findOrCreateGoogleUser,
    toResponse,
  } as unknown as UsersService
  const signAsync = jest.fn().mockResolvedValue('jwt-seguro')
  const jwtService = { signAsync } as unknown as JwtService
  const config = {
    get: jest.fn().mockReturnValue('google-client-id'),
  } as unknown as ConfigService<Environment, true>
  const service = new AuthService(usersService, jwtService, config)

  beforeEach(() => jest.clearAllMocks())

  it('cifra la contraseña antes de crear la cuenta', async () => {
    let storedHash = ''
    create.mockImplementation((input: { passwordHash: string }) => {
      storedHash = input.passwordHash
      return Promise.resolve(userFixture(input.passwordHash))
    })

    const result = await service.register({
      email: 'alejandro@example.com',
      name: 'Alejandro Fontalvo',
      password: PASSWORD,
    })

    expect(storedHash).not.toBe(PASSWORD)
    await expect(compare(PASSWORD, storedHash)).resolves.toBe(true)
    expect(result).toMatchObject({ accessToken: 'jwt-seguro' })
  })

  it('abre sesión cuando la contraseña coincide', async () => {
    const passwordHash = await hash(PASSWORD, 4)
    findByEmailForAuthentication.mockResolvedValue(userFixture(passwordHash))

    const result = await service.login({
      email: 'alejandro@example.com',
      password: PASSWORD,
    })

    expect(result.user.email).toBe('alejandro@example.com')
    expect(signAsync).toHaveBeenCalledWith(
      expect.objectContaining({ sub: '507f1f77bcf86cd799439099' }),
    )
  })

  it('no revela si el correo o la contraseña fue incorrecto', async () => {
    findByEmailForAuthentication.mockResolvedValue(null)

    await expect(
      service.login({ email: 'desconocido@example.com', password: PASSWORD }),
    ).rejects.toBeInstanceOf(UnauthorizedException)
  })

  it('verifica Google y entrega el JWT propio de Ágora', async () => {
    const googlePrototype = OAuth2Client.prototype as unknown as {
      verifyIdToken: (options: VerifyIdTokenOptions) => Promise<LoginTicket>
    }
    jest.spyOn(googlePrototype, 'verifyIdToken').mockResolvedValue({
      getPayload: () => ({
        email: 'alejandro@example.com',
        email_verified: true,
        name: 'Alejandro Fontalvo',
        sub: 'google-user-123',
      }),
    } as unknown as LoginTicket)
    findOrCreateGoogleUser.mockResolvedValue(
      userFixture(await hash(PASSWORD, 4)),
    )

    const result = await service.loginWithGoogle({
      credential: 'google-token-valid-with-enough-length',
    })

    expect(findOrCreateGoogleUser).toHaveBeenCalledWith({
      email: 'alejandro@example.com',
      googleSubject: 'google-user-123',
      name: 'Alejandro Fontalvo',
    })
    expect(result.accessToken).toBe('jwt-seguro')
  })
})
