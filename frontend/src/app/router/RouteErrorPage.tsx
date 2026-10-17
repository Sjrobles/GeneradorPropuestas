import { AlertTriangle } from 'lucide-react'
import { useEffect } from 'react'
import { Link, isRouteErrorResponse, useRouteError } from 'react-router'

import {
  isStaleDeploymentError,
  recoverFromStaleDeployment,
} from '@/app/recovery/deployment-recovery'

interface RouteErrorPageProps {
  notFound?: boolean
}

export function RouteErrorPage({ notFound = false }: RouteErrorPageProps) {
  const error = useRouteError()
  const isNotFound =
    notFound || (isRouteErrorResponse(error) && error.status === 404)
  const isStaleDeployment = !isNotFound && isStaleDeploymentError(error)

  useEffect(() => {
    if (isStaleDeployment) recoverFromStaleDeployment(error)
  }, [error, isStaleDeployment])

  return (
    <main className="grid min-h-screen place-items-center bg-background px-4 py-16 text-foreground">
      <section className="w-full max-w-xl rounded-lg border border-border bg-card p-8 text-center shadow-card">
        <AlertTriangle
          className="mx-auto text-warning"
          aria-hidden="true"
          size={36}
        />
        <p className="mt-5 text-sm font-bold uppercase tracking-[0.18em] text-warning">
          {isNotFound
            ? 'Error 404'
            : isStaleDeployment
              ? 'Actualizando Ágora'
              : 'Error inesperado'}
        </p>
        <h1 className="mt-3 font-serif text-3xl font-bold">
          {isNotFound
            ? 'Esta página no existe'
            : isStaleDeployment
              ? 'Hay una versión nueva disponible'
              : 'No pudimos mostrar la página'}
        </h1>
        <p className="mt-4 text-muted-foreground">
          {isNotFound
            ? 'Comprueba la dirección o regresa al inicio de Ágora.'
            : isStaleDeployment
              ? 'Estamos cargando automáticamente la versión más reciente. Tu avance permanece guardado.'
              : 'Tu avance permanece guardado. Recarga la pantalla o vuelve al inicio para continuar.'}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {!isNotFound ? (
            <button
              type="button"
              className="inline-flex min-h-11 items-center rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground"
              onClick={() => window.location.reload()}
            >
              Cargar versión actual
            </button>
          ) : null}
          <Link
            to="/"
            className={`${isNotFound ? 'bg-primary text-primary-foreground' : 'border border-border bg-card text-foreground'} inline-flex min-h-11 items-center rounded-md px-5 text-sm font-semibold no-underline`}
          >
            Volver al inicio
          </Link>
        </div>
      </section>
    </main>
  )
}
