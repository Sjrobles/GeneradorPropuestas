import {
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { compare, hash } from 'bcryptjs'
import { OAuth2Client } from 'google-auth-library'
import type { Environment } from '../config/environment'
import { UsersService } from '../users/users.service'
import type { UserDocument } from '../users/schemas/user.schema'
import type { AuthResponse, JwtPayload } from './auth.types'
import type { LoginDto } from './dto/login.dto'
import type { GoogleLoginDto } from './dto/google-login.dto'
import type { RegisterDto } from './dto/register.dto'

const PASSWORD_ROUNDS = 10

@Injectable()
export class AuthService {
  private readonly googleClient = new OAuth2Client()

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService<Environment, true>,
  ) {}

  async register(input: RegisterDto): Promise<AuthResponse> {
    const passwordHash = await hash(input.password, PASSWORD_ROUNDS)
    const user = await this.usersService.create({
      email: input.email,
      name: input.name,
      passwordHash,
    })
    return this.createSession(user)
  }

  async login(input: LoginDto): Promise<AuthResponse> {
    const user = await this.usersService.findByEmailForAuthentication(
      input.email,
    )
    const passwordMatches = user
      ? await compare(input.password, user.passwordHash ?? '')
      : false

    if (!user || !passwordMatches) {
      throw new UnauthorizedException('Correo o contraseña incorrectos')
    }

    return this.createSession(user)
  }

  async loginWithGoogle(input: GoogleLoginDto): Promise<AuthResponse> {
    const clientId = this.config.get('GOOGLE_CLIENT_ID', { infer: true })
    if (!clientId) {
      throw new ServiceUnavailableException(
        'El inicio de sesión con Google no está configurado',
      )
    }

    try {
      const ticket = await this.googleClient.verifyIdToken({
        audience: clientId,
        idToken: input.credential,
      })
      const payload = ticket.getPayload()
      if (
        !payload?.sub ||
        !payload.email ||
        payload.email_verified !== true ||
        !payload.name
      ) {
        throw new UnauthorizedException('La cuenta de Google no es válida')
      }

      const user = await this.usersService.findOrCreateGoogleUser({
        email: payload.email.toLowerCase(),
        googleSubject: payload.sub,
        name: payload.name,
      })
      return this.createSession(user)
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error
      throw new UnauthorizedException(
        'No fue posible validar la cuenta de Google',
      )
    }
  }

  private async createSession(user: UserDocument): Promise<AuthResponse> {
    const publicUser = this.usersService.toResponse(user)
    const payload: JwtPayload = { email: publicUser.email, sub: publicUser.id }
    return {
      accessToken: await this.jwtService.signAsync(payload),
      user: publicUser,
    }
  }
}
