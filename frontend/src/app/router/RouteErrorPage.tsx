import { AlertTriangle } from 'lucide-react'
import { Link, isRouteErrorResponse, useRouteError } from 'react-router'

interface RouteErrorPageProps {
  notFound?: boolean
}

export function RouteErrorPage({ notFound = false }: RouteErrorPageProps) {
  const error = useRouteError()
  const isNotFound =
    notFound || (isRouteErrorResponse(error) && error.status === 404)

  return (
    <main className="grid min-h-screen place-items-center bg-background px-4 py-16 text-foreground">
      <section className="w-full max-w-xl rounded-lg border border-border bg-card p-8 text-center shadow-card">
        <AlertTriangle
          className="mx-auto text-warning"
          aria-hidden="true"
          size={36}
        />
        <p className="mt-5 text-sm font-bold uppercase tracking-[0.18em] text-warning">
          {isNotFound ? 'Error 404' : 'Error inesperado'}
        </p>
        <h1 className="mt-3 font-serif text-3xl font-bold">
          {isNotFound
            ? 'Esta página no existe'
            : 'No pudimos mostrar la página'}
        </h1>
        <p className="mt-4 text-muted-foreground">
          {isNotFound
            ? 'Comprueba la dirección o regresa al inicio de Ágora.'
            : 'Puedes volver al inicio e intentarlo nuevamente.'}
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex min-h-11 items-center rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground no-underline"
        >
          Volver al inicio
        </Link>
      </section>
    </main>
  )
}
