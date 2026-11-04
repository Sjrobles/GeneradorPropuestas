export interface Environment {
  RESEND_API_KEY?: string
  MAIL_FROM?: string
  PASSWORD_RESET_ORIGIN?: string
  FRONTEND_ORIGIN: string
  GOOGLE_CLIENT_ID?: string
  JWT_SECRET: string
  MONGODB_URI: string
  NODE_ENV: 'development' | 'test' | 'production'
  OPENAI_API_KEY?: string
  OPENAI_MODEL: string
  PORT: number
}

export function validateEnvironment(
  raw: Record<string, string | undefined>,
): Environment {
  const nodeEnv = raw.NODE_ENV ?? 'development'
  if (!['development', 'test', 'production'].includes(nodeEnv)) {
    throw new Error('NODE_ENV debe ser development, test o production')
  }

  const port = Number(raw.PORT ?? 3000)
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error('PORT debe ser un puerto TCP válido')
  }

  const mongodbUri = raw.MONGODB_URI
  if (!mongodbUri?.startsWith('mongodb')) {
    throw new Error(
      'MONGODB_URI es obligatoria y debe usar el protocolo mongodb',
    )
  }

  const jwtSecret = raw.JWT_SECRET
  if (!jwtSecret || jwtSecret.length < 32) {
    throw new Error('JWT_SECRET debe contener al menos 32 caracteres')
  }

  const resetOrigin = raw.PASSWORD_RESET_ORIGIN?.trim()
  if (resetOrigin) {
    const url = new URL(resetOrigin)
    if (
      !['http:', 'https:'].includes(url.protocol) ||
      url.username ||
      url.password ||
      url.pathname !== '/' ||
      url.search ||
      url.hash
    ) {
      throw new Error(
        'PASSWORD_RESET_ORIGIN debe ser un origen HTTP o HTTPS, sin ruta ni credenciales',
      )
    }
    if (nodeEnv === 'production' && url.protocol !== 'https:')
      throw new Error('PASSWORD_RESET_ORIGIN debe usar HTTPS en producción')
  }

  return {
    RESEND_API_KEY: raw.RESEND_API_KEY?.trim() || undefined,
    MAIL_FROM: raw.MAIL_FROM?.trim() || undefined,
    PASSWORD_RESET_ORIGIN: resetOrigin,
    FRONTEND_ORIGIN: raw.FRONTEND_ORIGIN ?? 'http://127.0.0.1:5173',
    GOOGLE_CLIENT_ID: raw.GOOGLE_CLIENT_ID?.trim() || undefined,
    JWT_SECRET: jwtSecret,
    MONGODB_URI: mongodbUri,
    NODE_ENV: nodeEnv as Environment['NODE_ENV'],
    OPENAI_API_KEY: raw.OPENAI_API_KEY || undefined,
    OPENAI_MODEL: raw.OPENAI_MODEL?.trim() || 'gpt-5.6-luna',
    PORT: port,
  }
}
