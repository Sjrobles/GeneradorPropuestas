import { ArrowLeft, Construction } from 'lucide-react'
import { Link } from 'react-router'

interface PhasePlaceholderPageProps {
  description: string
  title: string
}

export function PhasePlaceholderPage({
  description,
  title,
}: PhasePlaceholderPageProps) {
  return (
    <section className="mx-auto grid min-h-[calc(100vh-var(--header-height)-8rem)] max-w-3xl place-items-center px-4 py-16 sm:px-6">
      <div className="w-full rounded-lg border border-border bg-card p-7 text-center shadow-card sm:p-10">
        <span className="mx-auto mb-5 grid size-12 place-items-center rounded-md bg-secondary text-primary">
          <Construction aria-hidden="true" size={24} />
        </span>
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-primary">
          Ruta preparada
        </p>
        <h1 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">
          {title}
        </h1>
        <p className="mx-auto mt-4 max-w-xl leading-7 text-muted-foreground">
          {description}
        </p>
        <Link
          to="/route-map"
          className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-md border border-border px-5 text-sm font-semibold no-underline hover:bg-muted"
        >
          <ArrowLeft aria-hidden="true" size={17} />
          Ver mapa de rutas
        </Link>
      </div>
    </section>
  )
}
