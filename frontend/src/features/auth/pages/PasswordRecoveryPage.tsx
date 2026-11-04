import {
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  Mail,
  ShieldCheck,
} from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { Link, useLocation } from 'react-router'
import { AgoraButton } from '@/components/ui/agora-button'
import { backendAuthApi } from '@/services/auth/backend-auth-api'
import { clearAuthSession } from '@/services/auth/auth-session'

export function PasswordRecoveryPage() {
  const { pathname, hash } = useLocation()
  const resetting = pathname.endsWith('/reset-password')
  const [token] = useState(
    () => new URLSearchParams(hash.slice(1)).get('token') ?? '',
  )
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [busy, setBusy] = useState(false)
  const validToken = /^[a-f0-9]{64}$/.test(token)

  useEffect(() => {
    if (resetting && hash) {
      window.history.replaceState(window.history.state, '', pathname)
    }
  }, [resetting, hash, pathname])

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    if (
      resetting &&
      (password.length < 10 ||
        password.length > 72 ||
        new TextEncoder().encode(password).length > 72)
    ) {
      setError(
        'Usa al menos 10 caracteres y un máximo de 72 bytes. Las tildes y algunos símbolos ocupan más de un byte.',
      )
      return
    }
    if (resetting && password !== confirmation) {
      setError('Las contraseñas no coinciden. Revísalas antes de continuar.')
      return
    }
    setBusy(true)
    try {
      const result = resetting
        ? await backendAuthApi.resetPassword(token, password)
        : await backendAuthApi.forgotPassword(email.trim().toLowerCase())
      if (resetting) {
        clearAuthSession()
        setPassword('')
        setConfirmation('')
      }
      setSuccess(result.message)
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'No pudimos completar la solicitud. Intenta nuevamente.',
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="grid min-h-[calc(100dvh-var(--header-height))] place-items-center bg-[#f4f7fd] px-4 py-10">
      <div className="w-full max-w-lg rounded-3xl border border-[#dce5f4] bg-white p-6 sm:p-10">
        <Link
          className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-primary no-underline"
          to="/auth?mode=login"
        >
          <ArrowLeft size={16} aria-hidden="true" /> Volver a iniciar sesión
        </Link>
        <div className="mt-6 flex items-center gap-3 text-[#1f3268]">
          {resetting ? (
            <KeyRound size={26} aria-hidden="true" />
          ) : (
            <Mail size={26} aria-hidden="true" />
          )}
          <h1 className="text-2xl font-bold tracking-tight">
            {resetting ? 'Crea tu nueva contraseña' : 'Recupera tu contraseña'}
          </h1>
        </div>
        <p className="mt-3 text-sm leading-6 text-[#52617c]">
          {resetting
            ? 'Elige una contraseña nueva para volver a tus proyectos.'
            : 'Escribe el correo de tu cuenta y te enviaremos un enlace para recuperar el acceso.'}
        </p>
        {success ? (
          <div className="mt-6" role="status">
            <CheckCircle2
              size={28}
              className="text-success"
              aria-hidden="true"
            />
            <p className="mt-3 text-sm leading-6 text-[#1f3268]">{success}</p>
            {!resetting ? (
              <p className="mt-3 text-sm text-muted-foreground">
                El enlace vence en 30 minutos. Si utilizas Google, también
                puedes continuar con tu cuenta de Google.
              </p>
            ) : null}
            <Link
              to={resetting ? '/auth?mode=login' : '/auth/forgot-password'}
              onClick={() => {
                if (!resetting) setSuccess('')
              }}
              className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[#1f3268] px-5 text-sm font-semibold !text-white no-underline"
            >
              {resetting ? 'Iniciar sesión' : 'Solicitar otro enlace'}
            </Link>
          </div>
        ) : resetting && !validToken ? (
          <div className="mt-6">
            <p role="alert" className="text-sm text-danger">
              El enlace no es válido o está incompleto. Solicita uno nuevo para
              continuar.
            </p>
            <Link
              className="mt-4 inline-flex min-h-11 items-center font-semibold text-primary"
              to="/auth/forgot-password"
            >
              Solicitar nuevo enlace
            </Link>
          </div>
        ) : (
          <form
            className="mt-6 space-y-4"
            onSubmit={(event) => void submit(event)}
          >
            {resetting ? (
              <>
                <label className="block text-sm font-semibold">
                  Nueva contraseña
                  <input
                    className="mt-2 min-h-12 w-full rounded-xl border border-border px-4"
                    type="password"
                    autoComplete="new-password"
                    minLength={10}
                    maxLength={72}
                    required
                    disabled={busy}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                </label>
                <p className="text-xs text-muted-foreground">
                  Mínimo 10 caracteres. Puedes usar una frase que recuerdes.
                </p>
                <label className="block text-sm font-semibold">
                  Confirmar nueva contraseña
                  <input
                    className="mt-2 min-h-12 w-full rounded-xl border border-border px-4"
                    type="password"
                    autoComplete="new-password"
                    minLength={10}
                    maxLength={72}
                    required
                    disabled={busy}
                    value={confirmation}
                    onChange={(event) => setConfirmation(event.target.value)}
                  />
                </label>
              </>
            ) : (
              <label className="block text-sm font-semibold">
                Correo electrónico
                <input
                  className="mt-2 min-h-12 w-full rounded-xl border border-border px-4"
                  type="email"
                  autoComplete="email"
                  maxLength={160}
                  required
                  disabled={busy}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </label>
            )}
            {error ? (
              <div
                role="alert"
                className="rounded-xl bg-danger/10 p-3 text-sm text-danger"
              >
                {error}
                {resetting ? (
                  <Link
                    to="/auth/forgot-password"
                    className="mt-2 block font-semibold underline"
                  >
                    Solicitar nuevo enlace
                  </Link>
                ) : null}
              </div>
            ) : null}
            <AgoraButton
              className="min-h-12 w-full rounded-xl bg-[#1f3268]"
              type="submit"
              disabled={busy}
            >
              {busy
                ? 'Procesando…'
                : resetting
                  ? 'Guardar nueva contraseña'
                  : 'Enviar enlace de recuperación'}
            </AgoraButton>
          </form>
        )}
        <p className="mt-6 flex items-start gap-2 text-xs leading-5 text-muted-foreground">
          <ShieldCheck
            className="mt-0.5 shrink-0 text-success"
            size={16}
            aria-hidden="true"
          />
          Tu información y tus proyectos se conservan al cambiar la contraseña.
        </p>
      </div>
    </section>
  )
}
