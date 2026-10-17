import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  RotateCcw,
  Save,
  ShieldCheck,
  TriangleAlert,
} from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router'

import { ErrorState } from '@/components/feedback/ErrorState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { AgoraButton } from '@/components/ui/agora-button'
import { ComponentStatusBadge } from '@/features/formulation/components/ComponentStatusBadge'
import { BudgetWorkbookPanel } from '@/features/formulation/components/BudgetWorkbookPanel'
import { EditorToolbar } from '@/features/formulation/components/EditorToolbar'
import {
  componentRegistry,
  getComponentDefinition,
} from '@/features/formulation/domain/component-registry'
import {
  useApproveComponentMutation,
  useComponentQuery,
  useComponentsQuery,
  useUpdateComponentMutation,
} from '@/features/formulation/hooks/use-components'
import { COMPONENT_STATUSES, COMPONENT_TYPES } from '@/types/domain'

export function ComponentEditorPage() {
  const { projectId = '', componentId = '' } = useParams()
  const componentQuery = useComponentQuery(projectId, componentId)
  const componentsQuery = useComponentsQuery(projectId)
  const updateComponent = useUpdateComponentMutation(projectId)
  const approveComponent = useApproveComponentMutation(projectId)
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [budgetWorkbookImporting, setBudgetWorkbookImporting] = useState(false)
  const editorRef = useRef<HTMLTextAreaElement>(null)

  const orderedComponents = useMemo(
    () =>
      componentRegistry
        .map((definition) =>
          componentsQuery.data?.find(({ type }) => type === definition.type),
        )
        .filter((component) => component !== undefined),
    [componentsQuery.data],
  )

  if (componentQuery.isPending || componentsQuery.isPending)
    return <LoadingState label="Abriendo el editor…" />
  if (componentQuery.isError || componentsQuery.isError)
    return <ErrorState description="No pudimos abrir este componente." />

  const component = componentQuery.data
  const content = drafts[component.id] ?? component.currentContent
  const setContent = (value: string) => {
    setDrafts((current) => ({ ...current, [component.id]: value }))
  }
  const definition = getComponentDefinition(component.type)
  const index = orderedComponents.findIndex(({ id }) => id === component.id)
  const dirty = content !== component.currentContent
  const warnings = component.validation?.warnings ?? []
  const busy =
    updateComponent.isPending ||
    approveComponent.isPending ||
    budgetWorkbookImporting

  const save = async () => {
    await updateComponent.mutateAsync({ componentId, content })
  }

  const approve = async () => {
    if (dirty) await updateComponent.mutateAsync({ componentId, content })
    await approveComponent.mutateAsync(componentId)
  }

  return (
    <section className="min-h-[calc(100dvh-var(--header-height))] bg-[#f4f7fb] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-4 border-b border-[#dbe3f0] pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              className="inline-flex items-center gap-2 text-xs font-extrabold text-primary no-underline"
              to={`/projects/${projectId}/review`}
            >
              <ArrowLeft aria-hidden="true" size={15} /> Volver al workspace
            </Link>
            <h1 className="mt-3 text-3xl font-extrabold text-[#20325e]">
              {definition.label}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {definition.agent} · La edición humana siempre tiene prioridad
            </p>
          </div>
          <ComponentStatusBadge status={component.status} />
        </header>

        <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="space-y-5">
            <div className="overflow-hidden rounded-2xl border border-[#dbe3f0] bg-white shadow-card">
              <div className="flex items-center justify-between border-b border-border bg-[#fbfcfe] px-5 py-3 text-xs font-bold text-muted-foreground">
                <span>Contenido vigente</span>
                <span>{content.length} caracteres</span>
              </div>
              <label className="sr-only" htmlFor="component-content">
                Contenido del componente
              </label>
              <EditorToolbar
                disabled={busy}
                onChange={setContent}
                textareaRef={editorRef}
                value={content}
              />
              <textarea
                ref={editorRef}
                id="component-content"
                className="min-h-[32rem] w-full resize-y border-0 bg-white p-6 text-[15px] leading-8 text-[#2d3c58] outline-none sm:p-8"
                value={content}
                disabled={busy}
                onChange={(event) => setContent(event.target.value)}
              />
              <div className="flex flex-col gap-3 border-t border-border bg-[#fbfcfe] p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex gap-2">
                  {index > 0 ? (
                    <Link
                      className="grid size-10 place-items-center rounded-lg border border-border bg-white"
                      to={`/projects/${projectId}/components/${orderedComponents[index - 1]?.id}`}
                      aria-label="Componente anterior"
                    >
                      <ArrowLeft aria-hidden="true" size={17} />
                    </Link>
                  ) : (
                    <span className="grid size-10 place-items-center rounded-lg border border-border bg-white opacity-35">
                      <ArrowLeft aria-hidden="true" size={17} />
                    </span>
                  )}
                  {index < orderedComponents.length - 1 ? (
                    <Link
                      className="grid size-10 place-items-center rounded-lg border border-border bg-white"
                      to={`/projects/${projectId}/components/${orderedComponents[index + 1]?.id}`}
                      aria-label="Componente siguiente"
                    >
                      <ArrowRight aria-hidden="true" size={17} />
                    </Link>
                  ) : (
                    <span className="grid size-10 place-items-center rounded-lg border border-border bg-white opacity-35">
                      <ArrowRight aria-hidden="true" size={17} />
                    </span>
                  )}
                </div>
                {component.status !== COMPONENT_STATUSES.APPROVED || dirty ? (
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <AgoraButton
                      variant="secondary"
                      disabled={!dirty || busy}
                      onClick={() => setContent(component.currentContent)}
                    >
                      <RotateCcw aria-hidden="true" size={16} /> Cancelar
                      cambios
                    </AgoraButton>
                    <AgoraButton
                      variant="secondary"
                      disabled={!dirty || busy}
                      onClick={() => void save()}
                    >
                      <Save aria-hidden="true" size={16} />{' '}
                      {updateComponent.isPending ? 'Guardando…' : 'Guardar'}
                    </AgoraButton>
                    <AgoraButton
                      disabled={busy || content.trim().length < 20}
                      onClick={() => void approve()}
                    >
                      <ShieldCheck aria-hidden="true" size={16} />{' '}
                      {approveComponent.isPending
                        ? 'Aprobando…'
                        : component.status === COMPONENT_STATUSES.APPROVED
                          ? 'Guardar y volver a aprobar'
                          : 'Aprobar componente'}
                    </AgoraButton>
                  </div>
                ) : (
                  <p className="flex items-center gap-2 text-sm font-extrabold text-success">
                    <CheckCircle2 aria-hidden="true" size={17} /> Componente
                    aprobado
                  </p>
                )}
              </div>
            </div>

            {component.type === COMPONENT_TYPES.BUDGET ? (
              <BudgetWorkbookPanel
                disabled={busy}
                hasUnsavedChanges={dirty}
                onImportingChange={setBudgetWorkbookImporting}
                projectId={projectId}
                onImported={(imported) => {
                  setDrafts((current) =>
                    Object.fromEntries(
                      Object.entries(current).filter(
                        ([id]) => id !== imported.id,
                      ),
                    ),
                  )
                }}
              />
            ) : null}
          </div>

          <aside className="space-y-4">
            {dirty ? (
              <div className="rounded-xl border border-primary/20 bg-[#eef3ff] p-4 text-sm font-bold text-[#3652a3]">
                <Save className="mb-2" aria-hidden="true" size={18} />
                Tienes modificaciones sin guardar.
              </div>
            ) : null}
            <div className="rounded-2xl border border-[#dbe3f0] bg-white p-5">
              <h2 className="font-extrabold text-[#20325e]">Advertencias</h2>
              {warnings.length ? (
                <ul className="mt-4 space-y-3">
                  {warnings.map((warning) => (
                    <li
                      key={warning.code}
                      className="flex items-start gap-2 rounded-xl bg-[#fff7ea] p-3 text-xs leading-5 text-[#76501e]"
                    >
                      <TriangleAlert
                        className="mt-0.5 shrink-0"
                        aria-hidden="true"
                        size={15}
                      />
                      {warning.message}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 flex items-start gap-2 text-sm leading-6 text-success">
                  <CheckCircle2
                    className="mt-0.5 shrink-0"
                    aria-hidden="true"
                    size={17}
                  />
                  Sin advertencias estructurales.
                </p>
              )}
            </div>
            <div className="rounded-2xl border border-[#dbe3f0] bg-white p-5">
              <h2 className="font-extrabold text-[#20325e]">
                Historial protegido
              </h2>
              <dl className="mt-4 space-y-3 text-xs">
                <div>
                  <dt className="text-muted-foreground">Versión original</dt>
                  <dd className="mt-1 font-bold">Conservada</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Versión vigente</dt>
                  <dd className="mt-1 font-bold">
                    {component.modifiedBy === 'user'
                      ? 'Modificada por el usuario'
                      : 'Generada por Ágora'}
                  </dd>
                </div>
              </dl>
            </div>
            {updateComponent.isError || approveComponent.isError ? (
              <p
                className="rounded-xl bg-danger/10 p-4 text-sm font-bold text-danger"
                role="alert"
              >
                {updateComponent.error?.message ??
                  approveComponent.error?.message}
              </p>
            ) : null}
          </aside>
        </div>
      </div>
    </section>
  )
}
