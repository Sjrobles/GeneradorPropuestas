export interface Environment {
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

  return {
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
