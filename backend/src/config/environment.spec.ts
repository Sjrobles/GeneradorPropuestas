import { validateEnvironment } from './environment'

describe('validateEnvironment', () => {
  const valid = {
    FRONTEND_ORIGIN: 'http://127.0.0.1:5173',
    JWT_SECRET: '12345678901234567890123456789012',
    MONGODB_URI: 'mongodb://127.0.0.1:27017/agora',
    NODE_ENV: 'test',
    PORT: '3000',
  }

  it('normaliza una configuración válida', () => {
    expect(validateEnvironment(valid)).toMatchObject({
      NODE_ENV: 'test',
      PORT: 3000,
    })
  })

  it('rechaza secretos JWT débiles', () => {
    expect(() =>
      validateEnvironment({ ...valid, JWT_SECRET: 'corto' }),
    ).toThrow('JWT_SECRET')
  })

  it('rechaza una conexión que no es MongoDB', () => {
    expect(() =>
      validateEnvironment({
        ...valid,
        MONGODB_URI: 'postgres://localhost/agora',
      }),
    ).toThrow('MONGODB_URI')
  })
})
