import { CircleHelp, Code2 } from 'lucide-react'
import { Link, NavLink, Outlet } from 'react-router'

import { Brand } from '@/components/layout/Brand'

const navigation = [
  { label: 'Inicio', to: '/' },
  { label: 'Rutas', to: '/route-map' },
] as const

export function AppShell() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <a
        href="#main-content"
        className="fixed left-4 top-4 z-50 -translate-y-24 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-transform focus:translate-y-0"
      >
        Saltar al contenido
      </a>

      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex h-(--header-height) max-w-(--content-width) items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
          <Brand />

          <nav
            className="flex items-center gap-1"
            aria-label="Navegación principal"
          >
            {navigation.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `rounded-md px-3 py-2 text-sm font-medium no-underline transition-colors ${
                    isActive
                      ? 'bg-secondary text-secondary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main id="main-content">
        <Outlet />
      </main>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto flex max-w-(--content-width) flex-col gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>Ágora · Borradores de proyectos CTeI con revisión humana.</p>
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
    </div>
  )
}
