import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router'

const routes = [
  ['/skills', 'Selección de skill'],
  ['/projects/new', 'Nuevo proyecto'],
  ['/projects/demo/language', 'Idioma'],
  ['/projects/demo/chat', 'Chat y contexto'],
  ['/projects/demo/context', 'Confirmación del contexto'],
  ['/projects/demo/generation', 'Generación'],
  ['/projects/demo/review', 'Revisión'],
  ['/projects/demo/components/general-objective', 'Editor de componente'],
  ['/projects/demo/document/assemble', 'Ensamblaje'],
  ['/projects/demo/document', 'Vista previa'],
  ['/projects/demo/translation', 'Traducción'],
  ['/projects/demo/export', 'Exportación'],
  ['/projects/demo/complete', 'Finalización'],
] as const

export function RouteMapPage() {
  return (
    <section className="mx-auto max-w-(--content-width) px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">
        Arquitectura navegable
      </p>
      <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight">
        Mapa de rutas del frontend
      </h1>
      <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">
        Cada URL ya existe y puede abrirse directamente. Sus contenidos se
        implementarán de forma incremental desde la Fase 2.
      </p>

      <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {routes.map(([to, label], index) => (
          <li key={to}>
            <Link
              to={to}
              className="group flex h-full items-center justify-between gap-4 rounded-lg border border-border bg-card p-5 no-underline shadow-sm transition hover:-translate-y-0.5 hover:shadow-card"
            >
              <span className="flex items-center gap-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-secondary text-xs font-bold text-primary">
                  {index + 1}
                </span>
                <span className="font-semibold">{label}</span>
              </span>
              <ArrowRight
                aria-hidden="true"
                className="shrink-0 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary"
                size={18}
              />
            </Link>
          </li>
        ))}
      </ol>
    </section>
  )
}
