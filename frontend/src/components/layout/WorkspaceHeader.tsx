import {
  ArrowLeft,
  Bell,
  CircleHelp,
  FolderKanban,
  Globe2,
  Home,
  LogOut,
} from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router'

import { Brand } from '@/components/layout/Brand'
import { clearAuthSession, getAuthSession } from '@/services/auth/auth-session'

export function WorkspaceHeader() {
  const navigate = useNavigate()
  const location = useLocation()
  const authSession = getAuthSession()
  const initials =
    authSession?.user.name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase() || 'AA'

  const logout = () => {
    clearAuthSession()
    void navigate('/auth', { replace: true })
  }

  const goBack = () => {
    if (window.history.length > 1) {
      void navigate(-1)
      return
    }
    void navigate('/projects')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[#dbe3f0] bg-white">
      <div className="flex h-(--header-height) items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-4">
          <button
            className="grid size-10 shrink-0 place-items-center rounded-lg border border-border bg-white text-[#20325e] transition hover:border-primary hover:bg-[#eef4ff] hover:text-primary"
            type="button"
            aria-label="Volver a la pantalla anterior"
            title="Volver"
            onClick={goBack}
          >
            <ArrowLeft aria-hidden="true" size={20} />
          </button>
          <Link
            className="grid size-10 shrink-0 place-items-center rounded-lg border border-border bg-white text-[#20325e] transition hover:border-primary hover:bg-[#eef4ff] hover:text-primary"
            aria-label="Ir al inicio"
            title="Ir al inicio"
            to="/"
          >
            <Home aria-hidden="true" size={19} />
          </Link>
          <Link
            className="grid size-10 shrink-0 place-items-center rounded-lg border border-border bg-white text-[#20325e] transition hover:border-primary hover:bg-[#eef4ff] hover:text-primary"
            aria-label="Ir a mis proyectos"
            title="Mis proyectos"
            to="/projects"
          >
            <FolderKanban aria-hidden="true" size={19} />
          </Link>
          <Brand />
          <span className="hidden h-8 w-px bg-border sm:block" />
          <div className="hidden min-w-0 items-center gap-3 sm:flex">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#eef4ff] text-primary">
              <Globe2 aria-hidden="true" size={19} />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#98a7bf]">
                Skill seleccionada
              </p>
              <p className="truncate text-sm font-extrabold text-[#20325e]">
                Convocatorias Internacionales y Banco de la República
              </p>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link
            className="grid size-10 place-items-center rounded-full border border-border bg-white text-[#52627d] transition hover:border-primary hover:text-primary"
            aria-label="Centro de ayuda para esta pantalla"
            title="Centro de ayuda"
            to={`/help?from=${encodeURIComponent(`${location.pathname}${location.search}`)}`}
          >
            <CircleHelp aria-hidden="true" size={19} />
          </Link>
          <button
            className="hidden size-10 cursor-not-allowed place-items-center rounded-full border border-border bg-[#f7f9fc] text-[#9aa7ba] sm:grid"
            type="button"
            aria-label="Notificaciones, disponible próximamente"
            title="Notificaciones disponibles próximamente"
            disabled
          >
            <Bell aria-hidden="true" size={19} />
          </button>
          <span className="hidden h-8 w-px bg-border sm:block" />
          <span
            className="grid size-10 place-items-center rounded-full bg-[#1e2f60] text-xs font-extrabold text-white"
            title={authSession?.user.name ?? 'Usuario de Ágora'}
            aria-label={authSession?.user.name ?? 'Usuario de Ágora'}
          >
            {initials}
          </span>
          {authSession ? (
            <button
              className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#a94747] bg-[#b65353] px-3 text-sm font-bold text-white transition hover:border-[#883737] hover:bg-[#923e3e]"
              type="button"
              aria-label={`Cerrar sesión de ${authSession.user.name}`}
              title="Cerrar sesión"
              onClick={logout}
            >
              <LogOut aria-hidden="true" size={16} />
              <span className="hidden sm:inline">Cerrar sesión</span>
            </button>
          ) : null}
        </div>
      </div>
    </header>
  )
}
