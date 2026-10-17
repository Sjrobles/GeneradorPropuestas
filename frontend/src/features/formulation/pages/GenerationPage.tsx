import {
  ArrowRight,
  Bot,
  Check,
  Layers3,
  LoaderCircle,
  Sparkles,
  TriangleAlert,
} from 'lucide-react'
import { useEffect, useRef } from 'react'
import { Link, useNavigate, useParams } from 'react-router'

import { ErrorState } from '@/components/feedback/ErrorState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { AgoraButton } from '@/components/ui/agora-button'
import { ComponentStatusBadge } from '@/features/formulation/components/ComponentStatusBadge'
import {
  agentLabels,
  componentRegistry,
  getComponentDefinition,
} from '@/features/formulation/domain/component-registry'
import {
  useComponentsQuery,
  useGenerateComponentsMutation,
} from '@/features/formulation/hooks/use-components'
import { useProjectQuery } from '@/features/projects/hooks/use-projects'
import { COMPONENT_STATUSES, PROJECT_STATES } from '@/types/domain'

export function GenerationPage() {
  const { projectId = '' } = useParams()
  const navigate = useNavigate()
  const projectQuery = useProjectQuery(projectId)
  const componentsQuery = useComponentsQuery(projectId)
  const generate = useGenerateComponentsMutation(projectId)
  const generationStarted = useRef(false)

  useEffect(() => {
    if (
      (projectQuery.data?.state === PROJECT_STATES.CONTEXT_CONFIRMED ||
        projectQuery.data?.state ===
          PROJECT_STATES.EXECUTION_DETAILS_CONFIRMED) &&
      !generationStarted.current &&
      !generate.isPending
    ) {
      generationStarted.current = true
      generate.mutate()
    }
  }, [generate, projectId, projectQuery.data?.state])

  useEffect(() => {
    if (projectQuery.data?.state === PROJECT_STATES.WAITING_EXECUTION_DETAILS) {
      void navigate(`/projects/${projectId}/execution-details`, {
        replace: true,
      })
    }
  }, [navigate, projectId, projectQuery.data?.state])

  if (projectQuery.isPending || componentsQuery.isPending) {
    return <LoadingState label="Preparando el equipo de formulación…" />
  }
  if (projectQuery.isError || componentsQuery.isError) {
    return (
      <ErrorState description="No pudimos preparar la generación de componentes." />
    )
  }

  const hasValidComponents = Array.isArray(componentsQuery.data)
  const components = hasValidComponents ? componentsQuery.data : []

  if (!hasValidComponents) {
    return (
      <ErrorState description="Recibimos una respuesta desactualizada al consultar la generación. Recarga la pantalla para continuar con el progreso guardado." />
    )
  }
  const completed = components.filter(({ status }) =>
    [
      COMPONENT_STATUSES.APPROVED,
      COMPONENT_STATUSES.GENERATED,
      COMPONENT_STATUSES.MODIFIED,
      COMPONENT_STATUSES.NEEDS_REVISION,
      COMPONENT_STATUSES.VALIDATED,
    ].some((completedStatus) => completedStatus === status),
  ).length
  const projectHasError = projectQuery.data.state === PROJECT_STATES.ERROR
  const persistedGenerationError = projectQuery.data.generationJob?.errorMessage
  const failedComponent = components.find(
    ({ status }) => status === COMPONENT_STATUSES.ERROR,
  )
  const activeComponent = components.find(
    ({ status }) => status === COMPONENT_STATUSES.GENERATING,
  )
  const componentCount = componentRegistry.length
  const progress = components.length
    ? Math.round((completed / componentCount) * 100)
    : 0
  // Cada componente se guarda apenas termina. Con todos listos, el usuario
  // ya puede revisar aunque la mutación todavía esté cerrando su ciclo interno.
  const generationComplete = completed === componentCount

  return (
    <section className="min-h-[calc(100dvh-var(--header-height))] bg-[#f4f7fb] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20">
            <Sparkles aria-hidden="true" size={25} />
          </span>
          <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.18em] text-primary">
            ProjectOrchestrator · FormulatorAgent
          </p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-[#1e315f] sm:text-5xl">
            Generación de componentes
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
            Ágora ejecuta Investigación, Ideación, Metodología, Presupuesto e
            Impacto. Después de Ideación te pedirá información necesaria para
            alinear la ejecución y los costos.
          </p>
        </header>

        <div className="mt-9 rounded-2xl border border-[#dbe3f0] bg-white p-6 shadow-card sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-extrabold text-[#20325e]">
                {generationComplete
                  ? 'Generación completada'
                  : `Estoy generando los ${componentCount} apartados…`}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {activeComponent
                  ? `${agentLabels[getComponentDefinition(activeComponent.type).agent]} trabaja en ${getComponentDefinition(activeComponent.type).label}.`
                  : projectHasError
                    ? `La generación se detuvo en ${failedComponent ? getComponentDefinition(failedComponent.type).label : 'un componente'}. Puedes reanudarla sin repetir los agentes completados.`
                    : generationComplete
                      ? 'Los borradores están listos para revisión humana.'
                      : 'Preparando la secuencia de formulación.'}
              </p>
            </div>
            <strong className="text-3xl font-extrabold text-primary">
              {progress}%
            </strong>
          </div>
          <div
            className="mt-5 h-3 overflow-hidden rounded-full bg-[#edf1f7]"
            role="progressbar"
            aria-label="Progreso de generación de componentes"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
            aria-live="polite"
          >
            <span
              className="block h-full rounded-full bg-[linear-gradient(90deg,#3862e8,#6790ff)] transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-3 flex items-center justify-between text-xs font-bold text-muted-foreground">
            <span>
              {completed} de {componentCount} finalizados
            </span>
            <span>Cinco agentes trabajan por especialidad</span>
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {componentRegistry.map((definition) => {
            const component = components.find(
              ({ type }) => type === definition.type,
            )
            const status = component?.status ?? COMPONENT_STATUSES.PENDING
            return (
              <article
                key={definition.type}
                className={`flex items-center gap-4 rounded-xl border bg-white p-4 transition ${status === COMPONENT_STATUSES.GENERATING ? 'border-primary shadow-lg shadow-primary/10' : 'border-[#dbe3f0]'}`}
              >
                <span
                  className={`grid size-10 shrink-0 place-items-center rounded-xl ${status === COMPONENT_STATUSES.GENERATING ? 'bg-primary text-white' : status === COMPONENT_STATUSES.ERROR ? 'bg-danger/10 text-danger' : status === COMPONENT_STATUSES.PENDING ? 'bg-[#f3f5f9] text-[#8997ad]' : 'bg-[#eaf8f3] text-[#238260]'}`}
                >
                  {status === COMPONENT_STATUSES.GENERATING ? (
                    <LoaderCircle
                      className="animate-spin"
                      aria-hidden="true"
                      size={18}
                    />
                  ) : status === COMPONENT_STATUSES.PENDING ? (
                    <Layers3 aria-hidden="true" size={18} />
                  ) : status === COMPONENT_STATUSES.ERROR ? (
                    <TriangleAlert aria-hidden="true" size={18} />
                  ) : (
                    <Check aria-hidden="true" size={18} />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-extrabold text-[#20325e]">
                    {definition.label}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {agentLabels[definition.agent]}
                  </p>
                </div>
                <ComponentStatusBadge status={status} />
              </article>
            )
          })}
        </div>

        {generate.isError || projectHasError ? (
          <div
            className="mt-6 rounded-xl border border-danger/20 bg-danger/10 p-5 text-center"
            role="alert"
          >
            <p className="font-bold text-danger">
              {generate.error?.message ??
                persistedGenerationError ??
                `No fue posible completar ${failedComponent ? getComponentDefinition(failedComponent.type).label : 'la generación'}. Los agentes finalizados están guardados.`}
            </p>
            <AgoraButton
              className="mt-4"
              disabled={generate.isPending}
              onClick={() => generate.mutate()}
            >
              {generate.isPending
                ? 'Reintentando desde el error…'
                : 'Reintentar desde el agente con error'}
            </AgoraButton>
          </div>
        ) : null}

        {generationComplete ? (
          <div className="mt-8 flex justify-center">
            <Link
              className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#1e315f] px-6 text-sm font-extrabold text-white no-underline"
              to={`/projects/${projectId}/review`}
            >
              Abrir workspace de revisión{' '}
              <ArrowRight aria-hidden="true" size={18} />
            </Link>
          </div>
        ) : !projectHasError ? (
          <p className="mt-7 flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
            <Bot aria-hidden="true" size={15} /> Puedes seguir esta pantalla; el
            progreso se guarda automáticamente.
          </p>
        ) : null}
      </div>
    </section>
  )
}
