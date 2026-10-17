import { CircleHelp, Code2, FolderKanban } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router'

import { Brand } from '@/components/layout/Brand'
import { WorkspaceHeader } from '@/components/layout/WorkspaceHeader'
import { backendEnabled } from '@/services/api/api-mode'
import {
  clearAuthSession,
  expireAuthSession,
  getAuthSession,
  isAccessTokenExpired,
  SESSION_EXPIRED_EVENT,
} from '@/services/auth/auth-session'

const navigation = [
  { label: 'Producto', to: '/#producto' },
  { label: 'Cómo funciona', to: '/#como-funciona' },
  { label: 'Skills', to: '/#skills' },
] as const

export function AppShell() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const authSession = getAuthSession()
  const sessionExpired = Boolean(
    backendEnabled &&
    authSession &&
    isAccessTokenExpired(authSession.accessToken),
  )
  const mainRef = useRef<HTMLElement>(null)
  const previousPathname = useRef(pathname)
  const isWorkspace =
    /^\/projects\/[^/]+\/(language|chat|context|generation|execution-details|review|components\/[^/]+|document(?:\/assemble)?|translation|export|complete)$/.test(
      pathname,
    )

  const logout = () => {
    clearAuthSession()
    void navigate('/auth', { replace: true })
  }

  useEffect(() => {
    const routeTitles: Array<[RegExp, string]> = [
      [/^\/$/, 'Inicio'],
      [/^\/skills$/, 'Skills'],
      [/^\/projects$/, 'Mis proyectos'],
      [/^\/auth$/, 'Acceso seguro'],
      [/^\/help$/, 'Centro de ayuda'],
      [/^\/route-map$/, 'Mapa de rutas'],
      [/\/projects\/new$/, 'Nuevo proyecto'],
      [/\/language$/, 'Idioma del proyecto'],
      [/\/chat$/, 'Conversación del proyecto'],
      [/\/context$/, 'Contexto del proyecto'],
      [/\/generation$/, 'Generación de componentes'],
      [/\/review$/, 'Revisión del proyecto'],
      [/\/document\/assemble$/, 'Ensamblaje del documento'],
      [/\/document$/, 'Documento consolidado'],
      [/\/translation$/, 'Traducción del documento'],
      [/\/export$/, 'Exportación del documento'],
      [/\/complete$/, 'Proyecto completado'],
    ]
    const title = routeTitles.find(([pattern]) => pattern.test(pathname))?.[1]
    document.title = title ? `${title} · Ágora` : 'Ágora'

    if (previousPathname.current !== pathname) {
      window.scrollTo({ top: 0, behavior: 'auto' })
      mainRef.current?.focus({ preventScroll: true })
      previousPathname.current = pathname
    }
  }, [pathname])

  useEffect(() => {
    const handleSessionExpired = () => {
      const returnTo = `${window.location.pathname}${window.location.search}`
      if (window.location.pathname === '/auth') return
      void navigate(
        `/auth?returnTo=${encodeURIComponent(returnTo)}&reason=session-expired`,
        { replace: true },
      )
    }
    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired)
    return () =>
      window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired)
  }, [navigate])

  useEffect(() => {
    if (sessionExpired) expireAuthSession()
  }, [sessionExpired])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <a
        href="#main-content"
        className="fixed left-4 top-4 z-50 -translate-y-24 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-transform focus:translate-y-0"
      >
        Saltar al contenido
      </a>

      {isWorkspace ? (
        <WorkspaceHeader />
      ) : (
        <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
          <div className="mx-auto flex h-(--header-height) max-w-(--content-width) items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
            <Brand />

            <nav
              className="hidden items-center gap-1 md:flex"
              aria-label="Navegación principal"
            >
              {navigation.map((item) => (
                <a
                  key={item.to}
                  href={item.to}
                  className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground no-underline transition-colors hover:bg-muted hover:text-foreground"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <Link
                className="inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-[#20325e] no-underline transition hover:bg-[#eef4ff] hover:text-primary"
                to="/projects"
                aria-label="Mis proyectos"
              >
                <FolderKanban aria-hidden="true" size={18} />
                <span className="hidden sm:inline">Mis proyectos</span>
              </Link>
              {authSession ? (
                <button
                  className="hidden min-h-10 items-center rounded-md px-3 text-sm font-semibold text-foreground hover:bg-muted sm:inline-flex"
                  type="button"
                  onClick={logout}
                  title={`Sesión de ${authSession.user.name}`}
                >
                  Cerrar sesión
                </button>
              ) : (
                <Link
                  className="hidden min-h-10 items-center rounded-lg border border-primary bg-primary px-4 text-sm font-semibold text-primary-foreground no-underline transition hover:border-[#203590] hover:bg-[#203590] sm:inline-flex"
                  to="/auth"
                >
                  Iniciar sesión
                </Link>
              )}
            </div>
          </div>
        </header>
      )}

      <main
        id="main-content"
        ref={mainRef}
        tabIndex={-1}
        aria-label="Contenido principal"
        className="outline-none"
      >
        <Outlet />
      </main>

      {!isWorkspace ? (
        <footer className="border-t border-border bg-card">
          <div className="mx-auto flex max-w-(--content-width) flex-col gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <p>Ágora · Formulación de proyectos CTeI con revisión humana.</p>
            <div className="flex items-center gap-4">
              <Link className="hover:text-foreground" to="/help">
                <CircleHelp
                  className="mr-1 inline"
                  aria-hidden="true"
                  size={16}
                />
                Ayuda
              </Link>
              <a
                className="hover:text-foreground"
                href="https://github.com/Sjrobles/GeneradorPropuestas"
                rel="noreferrer"
                target="_blank"
              >
                <Code2 className="mr-1 inline" aria-hidden="true" size={16} />
                Repositorio
              </a>
            </div>
          </div>
        </footer>
      ) : null}
    </div>
  )
}
