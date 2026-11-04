import {
  BadRequestException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createHash, randomBytes } from 'node:crypto'
import { hash } from 'bcryptjs'
import type { Environment } from '../config/environment'
import { UsersService } from '../users/users.service'

const REQUEST_MESSAGE =
  'Si existe una cuenta con ese correo, recibirás un enlace para restablecer tu contraseña. Revisa también la carpeta de spam.'

@Injectable()
export class PasswordRecoveryService {
  private readonly logger = new Logger(PasswordRecoveryService.name)
  constructor(
    private readonly users: UsersService,
    private readonly config: ConfigService<Environment, true>,
  ) {}

  async request(email: string) {
    const apiKey = this.config.get('RESEND_API_KEY', { infer: true })
    const from = this.config.get('MAIL_FROM', { infer: true })
    const origin = this.config.get('PASSWORD_RESET_ORIGIN', { infer: true })
    if (!apiKey || !from || !origin) {
      throw new ServiceUnavailableException(
        'La recuperación por correo aún no está disponible. Intenta más tarde o contacta con soporte.',
      )
    }
    const token = randomBytes(32).toString('hex')
    const tokenHash = createHash('sha256').update(token).digest('hex')
    const now = new Date()
    const user = await this.users.issuePasswordReset(
      email,
      tokenHash,
      new Date(now.getTime() + 30 * 60_000),
      now,
    )
    if (!user) return { message: REQUEST_MESSAGE }
    const url = new URL('/auth/reset-password', origin)
    // Fragment prevents the recovery secret from reaching server access logs or referrers.
    url.hash = new URLSearchParams({ token }).toString()
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Idempotency-Key': `password-reset-${tokenHash}`,
        },
        signal: AbortSignal.timeout(15_000),
        body: JSON.stringify({
          from,
          to: [user.email],
          subject: 'Restablece tu contraseña de Ágora',
          text: `Recibimos una solicitud para cambiar tu contraseña de Ágora. Abre este enlace: ${url.toString()}\nEl enlace vence en 30 minutos y solo se puede utilizar una vez. Si no lo solicitaste, puedes ignorar este correo.`,
          html: `<div style="font-family:Arial,sans-serif;color:#1f3268;max-width:520px;margin:auto;padding:32px"><h1 style="font-size:26px">Recupera el acceso a Ágora</h1><p>Recibimos una solicitud para cambiar tu contraseña.</p><p style="margin:28px 0"><a href="${url.toString()}" style="background:#1f3268;color:white;padding:14px 24px;border-radius:12px;text-decoration:none;display:inline-block">Crear nueva contraseña</a></p><p>Este enlace vence en 30 minutos y solo se puede utilizar una vez.</p><p>Si no solicitaste este cambio, ignora este correo. Tu contraseña seguirá siendo la misma.</p></div>`,
        }),
      })
      if (!response.ok) throw new Error(`Resend status ${response.status}`)
    } catch {
      await this.users.clearPasswordReset(user.id, tokenHash)
      // Never log the token, email address or provider response.
      this.logger.error(
        'No fue posible entregar un correo de recuperación con Resend',
      )
      // Same public response for existing and absent accounts prevents enumeration.
    }
    return { message: REQUEST_MESSAGE }
  }

  async reset(token: string, password: string) {
    if (Buffer.byteLength(password, 'utf8') > 72) {
      throw new BadRequestException(
        'La contraseña es demasiado larga. Usa hasta 72 bytes; las tildes y algunos símbolos ocupan más de uno.',
      )
    }
    const tokenHash = createHash('sha256').update(token).digest('hex')
    if (!(await this.users.hasValidPasswordReset(tokenHash))) {
      throw new BadRequestException(
        'Este enlace venció o ya fue utilizado. Solicita uno nuevo.',
      )
    }
    const passwordHash = await hash(password, 12)
    const user = await this.users.consumePasswordReset(tokenHash, passwordHash)
    if (!user)
      throw new BadRequestException(
        'Este enlace venció o ya fue utilizado. Solicita uno nuevo.',
      )
    return { message: 'Tu contraseña se actualizó. Ya puedes iniciar sesión.' }
  }
}
