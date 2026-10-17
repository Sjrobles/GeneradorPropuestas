import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileCheck2,
  FileStack,
  ListChecks,
  LoaderCircle,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router'

import { ErrorState } from '@/components/feedback/ErrorState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { AgoraButton } from '@/components/ui/agora-button'
import {
  componentRegistry,
  getComponentDefinition,
} from '@/features/formulation/domain/component-registry'
import { useComponentsQuery } from '@/features/formulation/hooks/use-components'
import { useAssembleDocumentMutation } from '@/features/documents/hooks/use-documents'
import { useProjectQuery } from '@/features/projects/hooks/use-projects'
import { COMPONENT_STATUSES } from '@/types/domain'

export function DocumentAssemblyPage() {
  const { projectId = '' } = useParams()
  const navigate = useNavigate()
  const projectQuery = useProjectQuery(projectId)
  const componentsQuery = useComponentsQuery(projectId)
  const assemble = useAssembleDocumentMutation(projectId)

  if (projectQuery.isPending || componentsQuery.isPending) {
    return <LoadingState label="Comprobando las últimas versiones…" />
  }
  if (projectQuery.isError || componentsQuery.isError) {
    return <ErrorState description="No pudimos preparar el ensamblaje." />
  }

  const pending = componentsQuery.data.filter(
    ({ status }) => status !== COMPONENT_STATUSES.APPROVED,
  )
  const startAssembly = async () => {
    await assemble.mutateAsync()
    void navigate(`/projects/${projectId}/document`)
  }

  return (
    <section className="min-h-[calc(100dvh-var(--header-height))] bg-[radial-gradient(circle_at_top_right,rgba(56,98,232,0.08),transparent_34%),#f4f7fb] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Link
          className="inline-flex min-h-10 items-center gap-2 rounded-xl px-3 text-sm font-extrabold text-[#52617a] no-underline transition hover:bg-white hover:text-primary hover:shadow-sm"
          to={`/projects/${projectId}/review`}
        >
          <ArrowLeft aria-hidden="true" size={17} /> Volver a la revisión
        </Link>

        <header className="mt-3 overflow-hidden rounded-3xl border border-[#dbe3f0] bg-[linear-gradient(135deg,#ffffff_0%,#f0f5ff_100%)] shadow-[0_18px_50px_rgba(30,49,95,0.08)]">
          <div className="grid items-center gap-6 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:p-10">
            <div className="max-w-3xl">
              <p className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-primary">
                <Sparkles aria-hidden="true" size={15} /> Documento final
              </p>
              <h1 className="mt-3 max-w-3xl text-3xl font-extrabold leading-[1.08] tracking-[-0.035em] text-[#1e315f] sm:text-4xl lg:text-[2.75rem]">
                {assemble.isPending
                  ? 'Integrando las últimas versiones…'
                  : 'Preparar documento consolidado'}
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-[#64728a] sm:text-base">
                {assemble.isPending
                  ? 'Ágora conserva el contenido aprobado y organiza cada sección en el orden correcto.'
                  : 'Revisa la validación final y genera una vista previa ordenada, lista para exportar.'}
              </p>
            </div>
            <div className="flex items-center gap-4 rounded-2xl border border-white/90 bg-white/80 p-4 shadow-[0_12px_30px_rgba(30,49,95,0.09)] backdrop-blur lg:min-w-64">
              <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20">
                {assemble.isPending ? (
                  <LoaderCircle
                    className="animate-spin"
                    aria-hidden="true"
                    size={26}
                  />
                ) : (
                  <FileStack aria-hidden="true" size={26} />
                )}
              </span>
              <div>
                <strong className="block text-sm font-extrabold text-[#20325e]">
                  {assemble.isPending
                    ? 'Ensamblando'
                    : `${componentRegistry.length} apartados`}
                </strong>
                <span className="mt-1 block text-xs font-semibold text-[#748198]">
                  {assemble.isPending
                    ? 'Proceso en curso'
                    : 'Listos para integrar'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {assemble.isPending ? (
          <div className="mt-6 rounded-3xl border border-[#dbe3f0] bg-white p-6 shadow-[0_16px_40px_rgba(30,49,95,0.08)] sm:p-8">
            <div className="flex items-center justify-between text-sm font-extrabold text-[#20325e]">
              <span>Ensamblando el documento</span>
              <span className="text-primary">Procesando</span>
            </div>
            <div className="mt-5 h-3 overflow-hidden rounded-full bg-[#edf1f7]">
              <span className="block h-full w-4/5 animate-pulse rounded-full bg-[linear-gradient(90deg,#3862e8,#76a0ff)]" />
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {[
                'Recuperando versiones',
                'Ordenando secciones',
                'Preparando vista previa',
              ].map((step) => (
                <div
                  key={step}
                  className="rounded-xl bg-[#f7f9fc] p-4 text-center text-xs font-bold text-[#66738a]"
                >
                  <Sparkles
                    className="mx-auto mb-2 text-primary"
                    aria-hidden="true"
                    size={17}
                  />
                  {step}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-6 grid items-stretch gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
            <section className="rounded-3xl border border-[#dbe3f0] bg-white p-6 shadow-[0_16px_40px_rgba(30,49,95,0.07)] sm:p-8">
              <div className="flex items-start gap-4">
                <span
                  className={`grid size-12 shrink-0 place-items-center rounded-2xl ${pending.length ? 'bg-[#fff4dd] text-[#d68b06]' : 'bg-[#e7f8ee] text-success'}`}
                >
                  {pending.length ? (
                    <AlertTriangle aria-hidden="true" size={23} />
                  ) : (
                    <CheckCircle2 aria-hidden="true" size={23} />
                  )}
                </span>
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#8a97ab]">
                    Verificación final
                  </p>
                  <h2 className="mt-1 text-xl font-extrabold text-[#20325e]">
                    {pending.length
                      ? `${pending.length} componentes requieren atención`
                      : 'Todo está aprobado y en orden'}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-[#68768d]">
                    {pending.length
                      ? 'Vuelve a la revisión para completar la aprobación antes de crear el documento.'
                      : 'Ágora utilizará exactamente las versiones que aprobaste durante la revisión.'}
                  </p>
                </div>
              </div>

              {pending.length ? (
                <ul className="mt-6 grid gap-2 sm:grid-cols-2">
                  {pending.map((component) => (
                    <li
                      key={component.id}
                      className="flex items-center gap-3 rounded-xl border border-[#f2e1bd] bg-[#fffaf0] px-4 py-3 text-sm font-bold text-[#52617a]"
                    >
                      <span className="size-2 rounded-full bg-[#f2a20b]" />
                      {getComponentDefinition(component.type).label}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="mt-7 grid gap-3 sm:grid-cols-3">
                  {[
                    {
                      icon: ShieldCheck,
                      title: 'Contenido aprobado',
                      text: 'Sin cambios automáticos',
                    },
                    {
                      icon: ListChecks,
                      title: 'Orden verificado',
                      text: `${componentRegistry.length} secciones listas`,
                    },
                    {
                      icon: FileCheck2,
                      title: 'Versión guardada',
                      text: 'Lista para vista previa',
                    },
                  ].map(({ icon: Icon, title, text }) => (
                    <div
                      key={title}
                      className="rounded-2xl border border-[#e5eaf2] bg-[#f8faff] p-4"
                    >
                      <Icon
                        aria-hidden="true"
                        className="text-primary"
                        size={19}
                      />
                      <strong className="mt-3 block text-xs font-extrabold text-[#25365f]">
                        {title}
                      </strong>
                      <span className="mt-1 block text-[11px] leading-4 text-[#7a879c]">
                        {text}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <aside className="flex flex-col justify-between overflow-hidden rounded-3xl bg-[linear-gradient(145deg,#172a58_0%,#315ce0_100%)] p-6 text-white shadow-[0_18px_42px_rgba(49,92,224,0.2)] sm:p-8">
              <div>
                <span className="grid size-11 place-items-center rounded-xl bg-white/12 ring-1 ring-inset ring-white/15">
                  <Sparkles aria-hidden="true" size={21} />
                </span>
                <p className="mt-7 text-[10px] font-extrabold uppercase tracking-[0.18em] text-white/65">
                  Siguiente paso
                </p>
                <h2 className="mt-2 text-2xl font-extrabold leading-tight">
                  Generar la vista previa consolidada
                </h2>
                <p className="mt-3 text-sm leading-6 text-white/72">
                  Podrás revisar el documento completo antes de traducirlo o
                  exportarlo.
                </p>
              </div>

              <div className="mt-8 space-y-3">
                <AgoraButton
                  className="min-h-12 w-full justify-center bg-white text-primary shadow-lg hover:bg-[#f4f7ff]"
                  disabled={pending.length > 0}
                  onClick={() => void startAssembly()}
                >
                  Continuar con el ensamblaje
                  <ArrowRight aria-hidden="true" size={17} />
                </AgoraButton>
                <Link
                  className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-white/20 px-5 text-sm font-bold text-white no-underline transition hover:bg-white/10"
                  to={`/projects/${projectId}/review`}
                >
                  Volver y revisar
                </Link>
              </div>
            </aside>
          </div>
        )}

        {assemble.isError ? (
          <p
            className="mt-5 rounded-xl bg-danger/10 p-4 text-center text-sm font-bold text-danger"
            role="alert"
          >
            {assemble.error.message}
          </p>
        ) : null}
      </div>
    </section>
  )
}
