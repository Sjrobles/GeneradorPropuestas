import {
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Circle,
  ExternalLink,
  History,
  LockKeyhole,
  PencilLine,
  RotateCcw,
  Save,
  ShieldCheck,
  Sparkles,
  WandSparkles,
  X,
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
  useComponentsQuery,
  useRegenerateComponentMutation,
  useUpdateComponentMutation,
} from '@/features/formulation/hooks/use-components'
import { useProjectQuery } from '@/features/projects/hooks/use-projects'
import { parseDocumentContent } from '@/services/documents/document-markup'
import { COMPONENT_STATUSES, COMPONENT_TYPES } from '@/types/domain'

const reviewCriteria = [
  'Redacción clara y verificable',
  'Específico y medible',
  'Alineado con el problema',
  'Coherente con los impactos esperados',
]

export function ReviewWorkspacePage() {
  const { projectId = '' } = useParams()
  const projectQuery = useProjectQuery(projectId)
  const componentsQuery = useComponentsQuery(projectId)
  const updateComponent = useUpdateComponentMutation(projectId)
  const approveComponent = useApproveComponentMutation(projectId)
  const regenerateComponent = useRegenerateComponentMutation(projectId)
  const [selectedId, setSelectedId] = useState<string>()
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [budgetWorkbookImporting, setBudgetWorkbookImporting] = useState(false)
  const editorRef = useRef<HTMLTextAreaElement>(null)
  const [dismissedSuggestions, setDismissedSuggestions] = useState<
    Record<string, boolean>
  >({})

  const orderedComponents = useMemo(
    () =>
      componentRegistry
        .map((definition) =>
          componentsQuery.data?.find(({ type }) => type === definition.type),
        )
        .filter((component) => component !== undefined),
    [componentsQuery.data],
  )

  if (projectQuery.isPending || componentsQuery.isPending) {
    return <LoadingState label="Abriendo el workspace de revisión…" />
  }
  if (projectQuery.isError || componentsQuery.isError) {
    return (
      <ErrorState description="No pudimos abrir los componentes de este proyecto." />
    )
  }
  if (!orderedComponents.length) {
    return (
      <ErrorState description="Este proyecto todavía no tiene componentes generados." />
    )
  }

  const activeComponent =
    orderedComponents.find(({ id }) => id === selectedId) ??
    orderedComponents[0]
  const activeIndex = orderedComponents.findIndex(
    ({ id }) => id === activeComponent.id,
  )
  const definition = getComponentDefinition(activeComponent.type)
  const content = drafts[activeComponent.id] ?? activeComponent.currentContent
  const dirty = content !== activeComponent.currentContent
  const busy =
    updateComponent.isPending ||
    approveComponent.isPending ||
    regenerateComponent.isPending ||
    budgetWorkbookImporting
  const isApproved = activeComponent.status === COMPONENT_STATUSES.APPROVED
  const warnings = activeComponent.validation?.warnings ?? []
  const showSuggestion = !dismissedSuggestions[activeComponent.id]
  const approved = orderedComponents.filter(
    ({ status }) => status === COMPONENT_STATUSES.APPROVED,
  ).length
  const modified = orderedComponents.filter(
    ({ status }) =>
      status === COMPONENT_STATUSES.MODIFIED ||
      status === COMPONENT_STATUSES.NEEDS_REVISION,
  ).length
  const reviewed = approved + modified
  const totalComponents = orderedComponents.length
  const pending = Math.max(0, totalComponents - reviewed)
  const characterCount = content.length
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0
  const structuredTables =
    activeComponent.type === COMPONENT_TYPES.BUDGET ||
    activeComponent.type === COMPONENT_TYPES.SCHEDULE
      ? parseDocumentContent(content).filter(({ type }) => type === 'table')
      : []
  const degreesPerComponent = 360 / totalComponents
  const approvedDegrees = approved * degreesPerComponent
  const modifiedDegrees = modified * degreesPerComponent
  const reviewedPercentage = Math.round((reviewed / totalComponents) * 100)
  const fragmentRegenerationsRemaining = Math.max(
    0,
    3 - (projectQuery.data.fragmentRegenerationCount ?? 0),
  )

  const suggestion =
    warnings[0]?.message ??
    `Puedes fortalecer ${definition.label.toLowerCase()} precisando el alcance, la población beneficiaria y el resultado verificable.`

  const setContent = (value: string) => {
    setDrafts((current) => ({
      ...current,
      [activeComponent.id]: value,
    }))
  }

  const save = async () => {
    await updateComponent.mutateAsync({
      componentId: activeComponent.id,
      content,
    })
  }

  const approve = async () => {
    if (dirty) {
      await updateComponent.mutateAsync({
        componentId: activeComponent.id,
        content,
      })
    }
    await approveComponent.mutateAsync(activeComponent.id)
    const nextComponent = orderedComponents[activeIndex + 1]
    if (nextComponent) setSelectedId(nextComponent.id)
  }

  const regenerate = async () => {
    const regenerated = await regenerateComponent.mutateAsync(
      activeComponent.id,
    )
    setDrafts((current) =>
      Object.fromEntries(
        Object.entries(current).filter(([id]) => id !== regenerated.id),
      ),
    )
  }

  const applySuggestion = () => {
    const addition =
      'La propuesta delimita su alcance institucional y territorial, identifica la población beneficiaria y define resultados verificables para orientar su evaluación.'
    setDrafts((current) => ({
      ...current,
      [activeComponent.id]: `${content.trim()}\n\n${addition}`,
    }))
    setDismissedSuggestions((current) => ({
      ...current,
      [activeComponent.id]: true,
    }))
  }

  const statusDot = (status: (typeof orderedComponents)[number]['status']) => {
    if (status === COMPONENT_STATUSES.APPROVED) {
      return (
        <span
          aria-label="Estado: aprobado"
          className="grid size-5 place-items-center rounded-full bg-[#e7f8ee] text-[#18a975]"
        >
          <Check aria-hidden="true" size={13} strokeWidth={3} />
        </span>
      )
    }
    if (
      status === COMPONENT_STATUSES.GENERATED ||
      status === COMPONENT_STATUSES.VALIDATED
    ) {
      return (
        <span
          aria-label="Estado: generado"
          className="grid size-5 place-items-center rounded-full bg-[#eaf8f3] text-[#238260]"
        >
          <Check aria-hidden="true" size={12} strokeWidth={3} />
        </span>
      )
    }
    if (
      status === COMPONENT_STATUSES.MODIFIED ||
      status === COMPONENT_STATUSES.NEEDS_REVISION
    ) {
      return (
        <span
          aria-label="Estado: modificado"
          className="grid size-5 place-items-center rounded-full bg-[#e8f0ff] text-primary"
        >
          <PencilLine aria-hidden="true" size={12} />
        </span>
      )
    }
    return (
      <span
        aria-label="Estado: sin generar"
        className="grid size-5 place-items-center rounded-full bg-[#fff1d2] text-[#e39400] ring-1 ring-inset ring-[#D3D3D3]"
      >
        <Circle aria-hidden="true" size={8} fill="currentColor" />
      </span>
    )
  }

  return (
    <section className="min-h-[calc(100dvh-var(--header-height))] bg-[#f4f7fb] pb-56 sm:pb-24">
      <h1 className="sr-only">Workspace de revisión</h1>
      <div className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <nav
            aria-label="Ruta del proyecto"
            className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#91a0b8]"
          >
            <Link className="no-underline hover:text-primary" to="/skills">
              Mis proyectos
            </Link>
            <ChevronRight aria-hidden="true" size={14} />
            <span>{projectQuery.data.title}</span>
            <ChevronRight aria-hidden="true" size={14} />
            <strong className="text-[#20325e]">Revisión del proyecto</strong>
          </nav>
          <Link
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#dbe3f0] bg-white px-4 text-xs font-extrabold text-[#20325e] no-underline shadow-sm transition hover:border-primary hover:text-primary"
            to={`/projects/${projectId}/document`}
          >
            Ver vista previa del proyecto
            <ExternalLink aria-hidden="true" size={15} />
          </Link>
        </div>

        <div className="mt-4 grid items-start gap-5 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
          <aside className="space-y-4 xl:sticky xl:top-[calc(var(--header-height)+1.25rem)]">
            <div className="rounded-2xl border border-[#dfe2cb] bg-white p-4 shadow-sm">
              <h2 className="px-1 text-base font-extrabold text-[#20325e]">
                Componentes del proyecto
              </h2>
              <div className="mt-3 space-y-1">
                {orderedComponents.map((component, index) => {
                  const item = getComponentDefinition(component.type)
                  const active = component.id === activeComponent.id
                  const componentApproved =
                    component.status === COMPONENT_STATUSES.APPROVED
                  return (
                    <button
                      key={component.id}
                      className={`flex min-h-12 w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition ${
                        active
                          ? 'bg-[#dce9ff] text-primary'
                          : 'text-[#53627a] hover:bg-[#f5f7fb]'
                      }`}
                      type="button"
                      disabled={budgetWorkbookImporting}
                      onClick={() => setSelectedId(component.id)}
                    >
                      <span
                        className={`grid size-8 shrink-0 place-items-center rounded-full text-xs font-extrabold transition-all duration-500 ${
                          componentApproved
                            ? 'agora-component-approved bg-white text-[#159d6e] ring-2 ring-inset ring-[#18ad78] shadow-[0_6px_16px_rgba(24,173,120,0.14)]'
                            : 'bg-[#f0f3f8] text-[#65738a] ring-1 ring-inset ring-[#dce2eb]'
                        }`}
                      >
                        {index + 1}
                      </span>
                      <span className="min-w-0 flex-1 text-sm font-bold leading-5">
                        {item.label}
                      </span>
                      {statusDot(component.status)}
                    </button>
                  )
                })}
              </div>
              <div className="mt-4 flex flex-wrap gap-x-3 gap-y-2 border-t border-[#e3e5d4] px-1 pt-4 text-[11px] text-[#6d7890]">
                <span className="flex items-center gap-1.5">
                  <i className="size-2 rounded-full bg-[#238260]" /> Generado
                </span>
                <span className="flex items-center gap-1.5">
                  <i className="size-2 rounded-full bg-[#f2a20b]" /> Sin generar
                </span>
                <span className="flex items-center gap-1.5">
                  <i className="size-2 rounded-full bg-primary" /> Modificado
                </span>
                <span className="flex items-center gap-1.5">
                  <i className="size-2 rounded-full bg-[#18b27c]" /> Aprobado
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-[#dfe2cb] bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 text-[#20325e]">
                <ShieldCheck
                  aria-hidden="true"
                  size={18}
                  className="text-primary"
                />
                <h2 className="text-sm font-extrabold">Formulación segura</h2>
              </div>
              <p className="mt-3 text-xs leading-5 text-[#66738a]">
                Completa y aprueba todos los componentes para enviar tu
                proyecto.
              </p>
              <Link
                className="mt-3 inline-flex items-center gap-1 text-xs font-extrabold text-primary"
                to={`/help?from=${encodeURIComponent(`/projects/${projectId}/review`)}&topic=review`}
              >
                Ver guía de formulación{' '}
                <ArrowRight aria-hidden="true" size={14} />
              </Link>
            </div>
          </aside>

          <main className="min-w-0 rounded-2xl border border-[#dfe2cb] bg-white p-5 shadow-sm sm:p-7 lg:p-8">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="font-serif text-3xl font-bold text-[#1d2f5c] sm:text-4xl">
                {definition.label}
              </h2>
              <ComponentStatusBadge status={activeComponent.status} />
            </div>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-[#617089]">
              {definition.description} Revisa que la redacción sea clara,
              medible y consistente con el contexto confirmado.
            </p>

            <div className="mt-6 overflow-hidden rounded-xl border border-[#dfe2cb]">
              <EditorToolbar
                disabled={busy}
                onChange={setContent}
                textareaRef={editorRef}
                value={content}
                trailing={
                  <button
                    className="ml-auto inline-flex min-h-9 items-center gap-2 rounded-lg bg-[#eaf1ff] px-3 text-xs font-extrabold text-primary transition hover:bg-[#dce8ff] disabled:opacity-50"
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      setDismissedSuggestions((current) => ({
                        ...current,
                        [activeComponent.id]: false,
                      }))
                    }
                  >
                    <WandSparkles aria-hidden="true" size={16} /> Sugerir por IA
                  </button>
                }
              />
              <label className="sr-only" htmlFor="review-component-content">
                Contenido del componente
              </label>
              <textarea
                ref={editorRef}
                id="review-component-content"
                className="min-h-56 w-full resize-y border-0 bg-white px-5 py-5 text-[15px] leading-7 text-[#25324b] outline-none disabled:bg-[#fafbfc]"
                value={content}
                disabled={busy}
                onChange={(event) => setContent(event.target.value)}
              />
              <div className="flex justify-end px-5 pb-3 text-[11px] font-semibold text-[#9ba8bb]">
                {characterCount.toLocaleString('es-CO')} caracteres ·{' '}
                {wordCount.toLocaleString('es-CO')} palabras
              </div>
            </div>

            {structuredTables.map((table, tableIndex) => {
              if (!table.headers || !table.rows) return null
              const gantt = table.headers.some((header) =>
                /^M\d+$/.test(header),
              )
              const title =
                activeComponent.type === COMPONENT_TYPES.BUDGET
                  ? 'Tabla presupuestal'
                  : gantt
                    ? `Diagrama de Gantt${structuredTables.length > 2 ? ` · bloque ${tableIndex}` : ''}`
                    : 'Cronograma detallado'
              const countLabel = gantt
                ? `${table.headers.length - 1} meses`
                : activeComponent.type === COMPONENT_TYPES.BUDGET
                  ? `${table.rows.length} partidas`
                  : `${table.rows.length} actividades`

              return (
                <section
                  key={`${title}-${tableIndex}`}
                  className="mt-5"
                  aria-labelledby={`structured-table-preview-${tableIndex}`}
                >
                  <div className="flex flex-wrap items-end justify-between gap-2">
                    <div>
                      <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-primary">
                        Vista estructurada
                      </p>
                      <h2
                        id={`structured-table-preview-${tableIndex}`}
                        className="mt-1 text-base font-extrabold text-[#20325e]"
                      >
                        {title}
                      </h2>
                    </div>
                    <span className="text-xs font-bold text-[#7d8aa0]">
                      {countLabel}
                    </span>
                  </div>
                  <div className="mt-3 overflow-x-auto rounded-xl border border-[#dbe3f0]">
                    <table className="min-w-[1050px] border-collapse text-left text-xs text-[#34415a]">
                      <thead className="bg-[#eaf1ff] text-[#1d2f5c]">
                        <tr>
                          {table.headers.map((header) => (
                            <th
                              key={header}
                              className={`border-b border-r border-[#cfd9eb] px-3 py-3 font-extrabold last:border-r-0 ${gantt ? 'text-center first:min-w-52 first:text-left' : 'text-left'}`}
                              scope="col"
                            >
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {table.rows.map((row, rowIndex) => (
                          <tr
                            key={`${row.join('-')}-${rowIndex}`}
                            className="even:bg-[#f8faff]"
                          >
                            {row.map((cell, cellIndex) => (
                              <td
                                key={`${cell}-${cellIndex}`}
                                className={`border-b border-r border-[#e1e7f0] px-3 py-3 align-top leading-5 last:border-r-0 ${gantt ? 'text-center first:text-left' : 'text-left'}`}
                              >
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )
            })}

            {activeComponent.type === COMPONENT_TYPES.BUDGET ? (
              <BudgetWorkbookPanel
                disabled={busy}
                hasUnsavedChanges={dirty}
                onImportingChange={setBudgetWorkbookImporting}
                projectId={projectId}
                onImported={(component) => {
                  setDrafts((current) =>
                    Object.fromEntries(
                      Object.entries(current).filter(
                        ([id]) => id !== component.id,
                      ),
                    ),
                  )
                }}
              />
            ) : null}

            {showSuggestion ? (
              <section className="mt-5 rounded-2xl border-2 border-primary bg-[#eaf2ff] p-5">
                <div className="flex items-start gap-3">
                  <Sparkles
                    className="mt-0.5 shrink-0 text-primary"
                    aria-hidden="true"
                    size={19}
                  />
                  <div className="min-w-0 flex-1">
                    <h2 className="text-sm font-extrabold text-primary">
                      Sugerencia de mejora (IA)
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-[#53627a]">
                      {suggestion}
                    </p>
                  </div>
                  <button
                    className="grid size-8 shrink-0 place-items-center rounded-full text-[#53627a] hover:bg-white/70"
                    type="button"
                    aria-label="Omitir sugerencia"
                    onClick={() =>
                      setDismissedSuggestions((current) => ({
                        ...current,
                        [activeComponent.id]: true,
                      }))
                    }
                  >
                    <X aria-hidden="true" size={17} />
                  </button>
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <button
                    className="min-h-10 rounded-lg px-4 text-xs font-extrabold text-[#53627a]"
                    type="button"
                    onClick={() =>
                      setDismissedSuggestions((current) => ({
                        ...current,
                        [activeComponent.id]: true,
                      }))
                    }
                  >
                    Omitir
                  </button>
                  <button
                    className="min-h-10 rounded-lg bg-primary px-4 text-xs font-extrabold text-white shadow-sm"
                    type="button"
                    onClick={applySuggestion}
                  >
                    Aplicar sugerencia
                  </button>
                </div>
              </section>
            ) : null}

            <section className="mt-6">
              <h2 className="text-sm font-extrabold text-[#20325e]">
                Criterios que debe cumplir:
              </h2>
              <ul className="mt-3 space-y-2">
                {reviewCriteria.map((criterion) => (
                  <li
                    key={criterion}
                    className="flex min-h-10 items-center justify-between gap-4 rounded-lg bg-[#f7f9fc] px-4 text-sm text-[#34415a]"
                  >
                    {criterion}
                    <Check
                      aria-hidden="true"
                      size={17}
                      className="shrink-0 text-[#18af79]"
                      strokeWidth={3}
                    />
                  </li>
                ))}
              </ul>
            </section>
          </main>

          <aside className="space-y-4 xl:sticky xl:top-[calc(var(--header-height)+1.25rem)]">
            <section className="relative overflow-hidden rounded-3xl border border-[#d9e3f2] bg-[linear-gradient(145deg,#ffffff_0%,#f5f8ff_100%)] p-5 shadow-[0_16px_38px_rgba(30,49,95,0.09)]">
              <div className="absolute -right-10 -top-12 size-36 rounded-full bg-primary/5 blur-2xl" />
              <div className="relative flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-primary">
                    Progreso de revisión
                  </p>
                  <h2 className="mt-1 text-lg font-extrabold text-[#20325e]">
                    Estado del proyecto
                  </h2>
                </div>
                <span className="rounded-full bg-[#e8efff] px-3 py-1.5 text-xs font-extrabold text-primary">
                  {reviewedPercentage}%
                </span>
              </div>
              <div className="relative mt-5 flex flex-col items-center gap-5 sm:flex-row sm:items-center xl:flex-row">
                <div className="flex shrink-0 flex-col items-center gap-2">
                  <div
                    key={`${approved}-${modified}-${pending}`}
                    role="progressbar"
                    aria-label="Progreso de revisión de componentes"
                    aria-valuemin={0}
                    aria-valuemax={totalComponents}
                    aria-valuenow={reviewed}
                    aria-valuetext={`${approved} aprobados, ${modified} modificados y ${pending} por revisar`}
                    className="agora-review-ring grid size-32 place-items-center rounded-full p-[13px] shadow-[0_12px_30px_rgba(30,49,95,0.12)]"
                    style={{
                      background: `conic-gradient(#18b27c 0deg ${approvedDegrees}deg, #3f7af1 ${approvedDegrees}deg ${approvedDegrees + modifiedDegrees}deg, #f2a20b ${approvedDegrees + modifiedDegrees}deg 360deg)`,
                      boxShadow:
                        pending > 0
                          ? '0 12px 30px rgba(30,49,95,0.12), 0 0 0 5px rgba(242,162,11,0.1)'
                          : '0 12px 30px rgba(24,178,124,0.18)',
                    }}
                  >
                    <div className="grid size-full place-items-center rounded-full bg-white text-center shadow-[inset_0_0_0_1px_rgba(219,227,240,0.8)]">
                      <span className="agora-review-count flex flex-col items-center justify-center">
                        <strong className="block text-3xl font-extrabold leading-none text-[#17213f]">
                          {reviewed}
                        </strong>
                        <small className="mt-1.5 block text-[10px] font-bold leading-[1.35] text-[#8b98ad]">
                          de {totalComponents} revisados
                        </small>
                      </span>
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${
                      pending > 0
                        ? 'bg-[#fff1d2] text-[#b86d00]'
                        : 'bg-[#e7f8ee] text-[#15855e]'
                    }`}
                  >
                    {pending > 0
                      ? `${pending} por revisar`
                      : 'Revisión completa'}
                  </span>
                </div>
                <dl className="grid min-w-0 flex-1 grid-cols-3 gap-2 text-xs text-[#5f6d84] sm:grid-cols-3 xl:grid-cols-1">
                  <div className="rounded-xl border border-[#e4eaf3] bg-white/85 p-3">
                    <dt className="flex items-center gap-2">
                      <i className="size-2 rounded-full bg-[#18b27c]" />{' '}
                      Aprobado
                    </dt>
                    <dd className="mt-1 text-lg font-extrabold text-[#17213f]">
                      {approved}
                    </dd>
                  </div>
                  <div className="rounded-xl border border-[#e4eaf3] bg-white/85 p-3">
                    <dt className="flex items-center gap-2">
                      <i className="size-2 rounded-full bg-[#3f7af1]" />{' '}
                      Modificado
                    </dt>
                    <dd className="mt-1 text-lg font-extrabold text-[#17213f]">
                      {modified}
                    </dd>
                  </div>
                  <div className="rounded-xl border border-[#e4eaf3] bg-white/85 p-3">
                    <dt className="flex items-center gap-2">
                      <i className="size-2 rounded-full bg-[#f2a20b]" /> Por
                      revisar
                    </dt>
                    <dd className="mt-1 text-lg font-extrabold text-[#17213f]">
                      {pending}
                    </dd>
                  </div>
                </dl>
              </div>
              <div className="relative mt-5 border-t border-[#dbe3f0] pt-4">
                {approved === orderedComponents.length ? (
                  <Link
                    className="agora-assembly-ready flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[linear-gradient(100deg,#1e315f,#3862e8)] px-4 text-sm font-extrabold text-white no-underline shadow-lg shadow-primary/20"
                    to={`/projects/${projectId}/document/assemble`}
                  >
                    Continuar al ensamblaje{' '}
                    <ArrowRight aria-hidden="true" size={17} />
                  </Link>
                ) : (
                  <div className="flex min-h-12 items-center gap-3 rounded-xl border border-[#e1e6ef] bg-[#f5f7fa] px-4 text-xs font-bold text-[#7a879b]">
                    <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-white text-[#9aa6b8] shadow-sm">
                      <LockKeyhole aria-hidden="true" size={15} />
                    </span>
                    <span>
                      Aprueba los {orderedComponents.length - approved}{' '}
                      componentes restantes para ensamblar.
                    </span>
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-[#dfe2cb] bg-white p-5 shadow-sm">
              <h2 className="text-base font-extrabold text-[#20325e]">
                Validaciones automáticas
              </h2>
              <div className="mt-3 divide-y divide-[#e3e5d4]">
                {reviewCriteria.slice(0, 3).map((criterion) => (
                  <div key={criterion} className="flex gap-3 py-3">
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-[#e5f8f0] text-[#18a975]">
                      <Check aria-hidden="true" size={13} strokeWidth={3} />
                    </span>
                    <div>
                      <h3 className="text-xs font-extrabold text-[#25324b]">
                        {criterion}
                      </h3>
                      <p className="mt-1 text-[11px] leading-4 text-[#6d7990]">
                        El componente mantiene coherencia con el contexto del
                        proyecto.
                      </p>
                    </div>
                  </div>
                ))}
                <div className="flex gap-3 py-3">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-[#fff3d8] font-extrabold text-[#eaa00a]">
                    !
                  </span>
                  <div>
                    <h3 className="text-xs font-extrabold text-[#25324b]">
                      Sugerencia de mejora
                    </h3>
                    <p className="mt-1 text-[11px] leading-4 text-[#6d7990]">
                      {suggestion}
                    </p>
                  </div>
                </div>
              </div>
              <button
                className="mt-2 inline-flex items-center gap-2 text-xs font-extrabold text-primary"
                type="button"
              >
                Ver detalle <ArrowRight aria-hidden="true" size={14} />
              </button>
            </section>

            <section className="rounded-2xl border border-[#dfe2cb] bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <History
                  aria-hidden="true"
                  size={17}
                  className="text-[#20325e]"
                />
                <h2 className="text-base font-extrabold text-[#20325e]">
                  Historial de cambios
                </h2>
              </div>
              <ol className="mt-4 space-y-4 border-l border-[#dbe3f0] pl-4 text-[11px]">
                <li className="relative">
                  <i className="absolute -left-[21px] top-1 size-2.5 rounded-full bg-primary ring-4 ring-white" />
                  <strong className="text-[#35425b]">
                    Hoy · Revisión humana
                  </strong>
                  <p className="mt-1 text-[#8a97ab]">
                    {dirty
                      ? 'Edición manual sin guardar'
                      : 'Versión vigente guardada'}
                  </p>
                </li>
                <li className="relative">
                  <i className="absolute -left-[21px] top-1 size-2.5 rounded-full bg-[#a8b4c6] ring-4 ring-white" />
                  <strong className="text-[#35425b]">
                    Ágora · Generación inicial
                  </strong>
                  <p className="mt-1 text-[#8a97ab]">Creación del componente</p>
                </li>
              </ol>
            </section>
          </aside>
        </div>
      </div>

      <footer className="fixed inset-x-0 bottom-0 z-30 border-t border-[#dbe3f0] bg-white/95 px-4 py-3 shadow-[0_-8px_24px_rgba(30,49,95,0.08)] backdrop-blur sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2 text-xs text-[#758299]">
            <CheckCircle2
              aria-hidden="true"
              size={15}
              className={dirty ? 'text-[#f2a20b]' : 'text-[#18a975]'}
            />
            {dirty
              ? 'Tienes cambios sin guardar'
              : 'Todos los cambios están guardados'}
          </p>
          {approved === orderedComponents.length && !dirty ? (
            <Link
              className="agora-assembly-ready inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[linear-gradient(100deg,#1e315f,#3862e8)] px-6 text-sm font-extrabold text-white no-underline shadow-lg shadow-primary/20"
              to={`/projects/${projectId}/document/assemble`}
            >
              Ensamblar documento <ArrowRight aria-hidden="true" size={17} />
            </Link>
          ) : (
            <div className="grid w-full grid-cols-1 gap-2 min-[430px]:grid-cols-2 sm:flex sm:w-auto sm:flex-wrap sm:justify-end">
              <AgoraButton
                variant="secondary"
                disabled={busy || fragmentRegenerationsRemaining === 0}
                onClick={() => void regenerate()}
              >
                <RotateCcw aria-hidden="true" size={16} />
                {regenerateComponent.isPending
                  ? 'Regenerando fragmento…'
                  : `Regenerar fragmento (${fragmentRegenerationsRemaining} disponibles)`}
              </AgoraButton>
              <AgoraButton
                disabled={!dirty || busy}
                onClick={() => void save()}
              >
                <Save aria-hidden="true" size={16} />
                {updateComponent.isPending ? 'Guardando…' : 'Guardar cambios'}
              </AgoraButton>
              <AgoraButton
                className="bg-[#1e315f] hover:bg-[#16264d]"
                disabled={busy || content.trim().length < 20}
                onClick={() => void approve()}
              >
                <ShieldCheck aria-hidden="true" size={16} />
                {approveComponent.isPending
                  ? 'Aprobando…'
                  : isApproved
                    ? 'Guardar y volver a aprobar'
                    : 'Aprobar'}
              </AgoraButton>
            </div>
          )}
        </div>
      </footer>

      {updateComponent.isError ||
      approveComponent.isError ||
      regenerateComponent.isError ? (
        <p
          className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-danger px-5 py-3 text-sm font-bold text-white shadow-lg"
          role="alert"
        >
          {updateComponent.error?.message ??
            approveComponent.error?.message ??
            regenerateComponent.error?.message}
        </p>
      ) : null}
    </section>
  )
}
