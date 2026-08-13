import {
  ArrowRight,
  CheckCircle2,
  Layers3,
  Route,
  ShieldCheck,
} from 'lucide-react'
import { Link } from 'react-router'

const foundations = [
  {
    icon: Route,
    title: 'Navegación preparada',
    description:
      'Cada etapa del proyecto cuenta con una URL estable para crecer de forma incremental.',
  },
  {
    icon: Layers3,
    title: 'Arquitectura modular',
    description:
      'La interfaz, los casos de uso y el acceso a datos mantienen responsabilidades separadas.',
  },
  {
    icon: ShieldCheck,
    title: 'Calidad desde la base',
    description:
      'Tipado estricto, accesibilidad inicial y pruebas automatizadas acompañan el desarrollo.',
  },
] as const

export function BootstrapPage() {
  return (
    <>
      <section className="border-b border-border bg-card">
        <div className="mx-auto grid max-w-(--content-width) gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-8 lg:py-24">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">
              Fase 1 · Fundamentos
            </p>
            <h1 className="mt-4 font-serif text-5xl font-bold leading-tight tracking-tight sm:text-6xl">
              Ágora ya tiene una base web sólida para crecer
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              La estructura técnica, las rutas y el sistema visual están listos
              para incorporar el flujo funcional de formulación en las
              siguientes fases.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-primary px-6 font-semibold text-primary-foreground no-underline hover:bg-[#2f54ca]"
                to="/route-map"
              >
                Explorar mapa de rutas
                <ArrowRight aria-hidden="true" size={18} />
              </Link>
              <a
                className="inline-flex min-h-12 items-center justify-center rounded-md border border-border px-6 font-semibold no-underline hover:bg-muted"
                href="https://github.com/Sjrobles/GeneradorPropuestas"
                rel="noreferrer"
                target="_blank"
              >
                Ver repositorio
              </a>
            </div>
          </div>

          <aside className="rounded-lg border border-border bg-secondary p-7 shadow-card sm:p-9">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
              Estado de la entrega
            </p>
            <h2 className="mt-3 font-serif text-3xl font-bold">
              Fundación completada
            </h2>
            <ul className="mt-7 space-y-4 text-secondary-foreground">
              {[
                'Aplicación web responsive',
                'Router y providers globales',
                'Contratos del dominio CTeI',
                'Sistema visual reutilizable',
                'Pruebas y controles de calidad',
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <CheckCircle2
                    className="shrink-0 text-success"
                    aria-hidden="true"
                    size={20}
                  />
                  <span className="font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      <section className="mx-auto max-w-(--content-width) px-4 py-14 sm:px-6 lg:px-8 lg:py-18">
        <div className="grid gap-5 md:grid-cols-3">
          {foundations.map((foundation) => {
            const Icon = foundation.icon
            return (
              <article
                key={foundation.title}
                className="rounded-lg border border-border bg-card p-6 shadow-sm"
              >
                <span className="grid size-11 place-items-center rounded-md bg-secondary text-primary">
                  <Icon aria-hidden="true" size={22} />
                </span>
                <h2 className="mt-5 font-serif text-2xl font-bold">
                  {foundation.title}
                </h2>
                <p className="mt-3 leading-7 text-muted-foreground">
                  {foundation.description}
                </p>
              </article>
            )
          })}
        </div>
      </section>
    </>
  )
}
