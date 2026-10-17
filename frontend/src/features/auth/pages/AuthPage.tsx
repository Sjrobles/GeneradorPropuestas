import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router'

import { AgoraButton } from '@/components/ui/agora-button'
import { backendEnabled } from '@/services/api/api-mode'
import { backendAuthApi } from '@/services/auth/backend-auth-api'
import { saveAuthSession } from '@/services/auth/auth-session'
import { hasExpiredSessionNotice } from '@/services/auth/auth-session'
import { mockAuthApi } from '@/services/auth/mock-auth-api'
import { GoogleSignInButton } from '../components/GoogleSignInButton'

type AuthMode = 'login' | 'register'

function safeReturnTo(value: string | null) {
  return value?.startsWith('/') && !value.startsWith('//') ? value : '/projects'
}

export function AuthPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [mode, setMode] = useState<AuthMode>('register')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | undefined>(() =>
    searchParams.get('reason') === 'session-expired' ||
    hasExpiredSessionNotice()
      ? 'Tu sesión expiró. Inicia sesión nuevamente para continuar.'
      : undefined,
  )
  const [submitting, setSubmitting] = useState(false)
  const [slowRequest, setSlowRequest] = useState(false)
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  const authApi = backendEnabled ? backendAuthApi : mockAuthApi

  useEffect(() => {
    if (!submitting) return
    const timer = window.setTimeout(() => setSlowRequest(true), 4_000)
    return () => window.clearTimeout(timer)
  }, [submitting])

  const loginWithGoogle = async (credential: string) => {
    setError(undefined)
    setSlowRequest(false)
    setSubmitting(true)
    try {
      const session = await backendAuthApi.loginWithGoogle(credential)
      saveAuthSession(session)
      await navigate(safeReturnTo(searchParams.get('returnTo')), {
        replace: true,
      })
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : 'No fue posible iniciar sesión con Google.',
      )
    } finally {
      setSubmitting(false)
      setSlowRequest(false)
    }
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(undefined)

    if (password.length < 10) {
      setError('La contraseña debe tener al menos 10 caracteres.')
      return
    }
    if (mode === 'register' && name.trim().length < 2) {
      setError('Escribe tu nombre para crear la cuenta.')
      return
    }

    setSubmitting(true)
    setSlowRequest(false)
    try {
      const session =
        mode === 'register'
          ? await authApi.register({
              email,
              name: name.trim(),
              password,
            })
          : await authApi.login({ email, password })
      saveAuthSession(session)
      await navigate(safeReturnTo(searchParams.get('returnTo')), {
        replace: true,
      })
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : 'No fue posible completar la autenticación.',
      )
    } finally {
      setSubmitting(false)
      setSlowRequest(false)
    }
  }

  return (
    <section className="agora-auth min-h-[calc(100dvh-var(--header-height))]">
      <div className="grid min-h-[calc(100dvh-var(--header-height))] lg:grid-cols-[40%_60%]">
        <div className="flex items-center justify-center bg-white px-4 py-10 sm:px-8 lg:px-10 lg:py-14">
          <form
            className="w-full max-w-md"
            onSubmit={(event) => void submit(event)}
            noValidate
          >
            <div className="mb-7 text-center">
              <h2 className="text-2xl font-bold tracking-[-0.025em] sm:text-3xl">
                {mode === 'register'
                  ? 'Crea tu cuenta en Ágora'
                  : 'Inicia sesión en Ágora'}
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {mode === 'register'
                  ? 'Guarda y continúa tus proyectos desde un solo lugar.'
                  : 'Retoma tus proyectos donde los dejaste.'}
              </p>
            </div>

            <div
              className="grid grid-cols-2 rounded-xl bg-muted p-1"
              role="group"
              aria-label="Tipo de acceso"
            >
              <button
                className={`min-h-11 rounded-lg text-sm font-bold transition ${mode === 'register' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}
                type="button"
                aria-pressed={mode === 'register'}
                onClick={() => setMode('register')}
              >
                Crear cuenta
              </button>
              <button
                className={`min-h-11 rounded-lg text-sm font-bold transition ${mode === 'login' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}
                type="button"
                aria-pressed={mode === 'login'}
                onClick={() => setMode('login')}
              >
                Iniciar sesión
              </button>
            </div>

            <div className="mt-5">
              {mode === 'register' ? (
                <label className="block text-sm font-semibold">
                  Nombre completo
                  <input
                    className="mt-2 min-h-11 w-full rounded-xl border border-border/80 bg-white/70 px-4 font-normal outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                    autoComplete="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                  />
                </label>
              ) : null}

              <label
                className={`${mode === 'register' ? 'mt-4' : ''} block text-sm font-semibold`}
              >
                Correo electrónico
                <input
                  className="mt-2 min-h-11 w-full rounded-xl border border-border/80 bg-white/70 px-4 font-normal outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                  autoComplete="email"
                  inputMode="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </label>

              <label className="mt-4 block text-sm font-semibold">
                Contraseña
                <input
                  className="mt-2 min-h-11 w-full rounded-xl border border-border/80 bg-white/70 px-4 font-normal outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                  autoComplete={
                    mode === 'register' ? 'new-password' : 'current-password'
                  }
                  minLength={10}
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </label>
              <p className="mt-1.5 text-xs text-muted-foreground">
                Mínimo 10 caracteres.
              </p>
            </div>

            {error ? (
              <p
                className="mt-3 rounded-xl bg-danger/10 p-3 text-sm font-semibold text-danger"
                role="alert"
              >
                {error}
              </p>
            ) : null}

            {submitting && slowRequest ? (
              <p
                className="mt-3 text-center text-sm text-muted-foreground"
                role="status"
              >
                Estamos preparando tu espacio. Esto puede tomar un momento.
              </p>
            ) : null}

            <AgoraButton
              className="mx-auto mt-5 flex h-10 min-h-10 w-full max-w-[400px]"
              disabled={submitting}
              size="default"
              type="submit"
            >
              {submitting
                ? mode === 'register'
                  ? 'Creando cuenta…'
                  : 'Ingresando…'
                : mode === 'register'
                  ? 'Crear cuenta y continuar'
                  : 'Iniciar sesión'}
            </AgoraButton>

            {mode === 'login' ? (
              <div className="mt-5">
                {backendEnabled ? (
                  <>
                    <div className="mb-5 flex items-center gap-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      <span className="h-px flex-1 bg-border" />
                      o
                      <span className="h-px flex-1 bg-border" />
                    </div>

                    <div className="flex justify-center">
                      {googleClientId ? (
                        <GoogleSignInButton
                          clientId={googleClientId}
                          disabled={submitting}
                          onCredential={(credential) =>
                            void loginWithGoogle(credential)
                          }
                          onError={setError}
                        />
                      ) : (
                        <p className="w-full max-w-[400px] rounded-xl bg-muted/80 p-3 text-center text-sm text-muted-foreground">
                          Configura VITE_GOOGLE_CLIENT_ID para habilitar Google.
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="rounded-xl bg-primary/10 p-3 text-center text-sm font-semibold text-primary">
                    Modo local: usa cualquier correo y una contraseña de al
                    menos 10 caracteres para continuar.
                  </p>
                )}
              </div>
            ) : null}
          </form>
        </div>

        <div
          className="agora-auth__visual min-h-[26rem] lg:min-h-full"
          aria-hidden="true"
        />
      </div>
    </section>
  )
}
