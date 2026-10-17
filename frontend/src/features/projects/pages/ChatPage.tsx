import {
  ArrowRight,
  Bot,
  ChartNoAxesCombined,
  Check,
  CircleDot,
  Clock3,
  FileCheck2,
  Info,
  Lightbulb,
  ListChecks,
  LoaderCircle,
  LockKeyhole,
  MapPin,
  Mic,
  PencilLine,
  ScanLine,
  Send,
  Sparkles,
  Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router'

import { ErrorState } from '@/components/feedback/ErrorState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { AgoraButton } from '@/components/ui/agora-button'
import {
  useChatMessagesQuery,
  useDiagnoseContextMutation,
  useProjectContextQuery,
  useProjectQuery,
  useSendMessageMutation,
} from '@/features/projects/hooks/use-projects'
import type { ProjectContext } from '@/types/domain'

type ContextField =
  | 'problem'
  | 'targetPopulation'
  | 'location'
  | 'proposedSolution'
  | 'expectedResults'
  | 'objectiveCount'
  | 'initialScope'
  | 'projectDuration'

const contextChecklist: Array<{
  field: ContextField
  icon: LucideIcon
  label: string
}> = [
  { field: 'problem', label: 'Problema', icon: CircleDot },
  { field: 'targetPopulation', label: 'Población', icon: Users },
  { field: 'location', label: 'Ubicación', icon: MapPin },
  { field: 'proposedSolution', label: 'Solución', icon: Lightbulb },
  {
    field: 'expectedResults',
    label: 'Resultados esperados',
    icon: ChartNoAxesCombined,
  },
  {
    field: 'objectiveCount',
    label: 'Número de objetivos',
    icon: ListChecks,
  },
  { field: 'initialScope', label: 'Alcance inicial', icon: ScanLine },
  { field: 'projectDuration', label: 'Duración total', icon: Clock3 },
]

const processSteps = [
  { label: 'Idioma', description: 'Selecciona el idioma' },
  { label: 'Contexto', description: 'Cuéntanos sobre tu proyecto' },
  { label: 'Diagnóstico', description: 'Analizamos oportunidades' },
  { label: 'Confirmación', description: 'Revisamos y confirmamos' },
]

function formatTime(value: string) {
  return new Intl.DateTimeFormat('es-CO', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

function ProcessSidebar({ activeStage }: { activeStage: number }) {
  return (
    <aside className="hidden min-h-0 flex-col rounded-2xl border border-[#dbe3f0] bg-white p-5 xl:flex">
      <ol className="space-y-0">
        {processSteps.map((step, index) => {
          const number = index + 1
          const active = number === activeStage
          const complete = number < activeStage
          return (
            <li key={step.label} className="relative flex min-h-24 gap-4">
              {index < processSteps.length - 1 ? (
                <span
                  className="absolute left-[17px] top-10 h-12 w-0.5 bg-[#e1e7f1]"
                  aria-hidden="true"
                />
              ) : null}
              <span
                className={`relative z-10 grid size-9 shrink-0 place-items-center rounded-full border-2 text-sm font-extrabold transition-colors ${
                  active || complete
                    ? 'border-primary bg-primary text-white'
                    : 'border-[#d8e1ee] bg-white text-[#8fa0b9]'
                }`}
              >
                {complete ? <Check aria-hidden="true" size={16} /> : number}
              </span>
              <div className="pt-0.5">
                <p
                  className={`font-extrabold ${active ? 'text-[#1e315f]' : 'text-[#53637d]'}`}
                >
                  {step.label}
                </p>
                <p className="mt-1 text-xs leading-5 text-[#91a1ba]">
                  {step.description}
                </p>
              </div>
            </li>
          )
        })}
      </ol>

      <div className="mt-auto rounded-xl border border-[#dde5ef] bg-[#fbfcfe] p-4">
        <div className="flex items-start gap-3">
          <LockKeyhole
            className="mt-0.5 shrink-0 text-[#22b985]"
            aria-hidden="true"
            size={18}
          />
          <div>
            <p className="text-xs font-extrabold text-[#20325e]">
              Tu información está segura
            </p>
            <p className="mt-1 text-[11px] leading-4 text-[#65758e]">
              Usamos estándares de seguridad y confidencialidad.
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}

interface ContextPanelProps {
  context: ProjectContext
  contextComplete: boolean
  diagnoseContext: ReturnType<typeof useDiagnoseContextMutation>
  projectId: string
}

function ContextPanel({
  context,
  contextComplete,
  diagnoseContext,
  projectId,
}: ContextPanelProps) {
  return (
    <aside className="flex min-h-0 flex-col rounded-2xl border border-[#dbe3f0] bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-extrabold text-[#20325e]">
          Contexto recopilado
        </h2>
        <span className="grid size-9 place-items-center rounded-lg border border-primary text-primary">
          <Sparkles aria-hidden="true" size={18} />
        </span>
      </div>

      <div className="mt-5 min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
        {contextChecklist.map(({ field, label, icon: Icon }) => {
          const value = context[field]
          const content =
            typeof value === 'number' ? String(value) : value?.trim()
          return (
            <article
              key={field}
              className={`rounded-xl border p-3 transition ${content ? 'border-[#dce5f1] bg-white' : 'border-dashed border-[#dce5f1] bg-[#fbfcfe]'}`}
            >
              <div className="flex items-start gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-[#dce5f1] bg-[#f8faff] text-[#22396c]">
                  <Icon aria-hidden="true" size={17} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-[11px] font-extrabold uppercase tracking-[0.06em] text-[#91a1ba]">
                      {label}
                    </h3>
                    {content ? (
                      <PencilLine
                        className="text-[#9aabc3]"
                        aria-hidden="true"
                        size={14}
                      />
                    ) : null}
                  </div>
                  <p
                    className={`mt-1 text-sm leading-5 ${content ? 'text-[#17213f]' : 'text-[#a1aec1]'}`}
                  >
                    {content || 'Pendiente por completar'}
                  </p>
                </div>
              </div>
            </article>
          )
        })}
      </div>

      <div className="mt-4 border-t border-border pt-4">
        {contextComplete ? (
          <>
            <AgoraButton
              className="w-full"
              disabled={diagnoseContext.isPending}
              onClick={() => diagnoseContext.mutate()}
            >
              {diagnoseContext.isPending ? (
                <>
                  <LoaderCircle
                    className="animate-spin"
                    aria-hidden="true"
                    size={16}
                  />{' '}
                  Analizando información…
                </>
              ) : (
                <>
                  <Sparkles aria-hidden="true" size={16} /> Analizar contexto
                </>
              )}
            </AgoraButton>
            {diagnoseContext.isPending ? (
              <div
                className="mt-3 rounded-xl border border-primary/15 bg-[#f5f8ff] p-3"
                role="status"
              >
                <p className="text-xs font-extrabold text-[#20325e]">
                  Verificando completitud y coherencia
                </p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white">
                  <span className="block h-full w-2/3 animate-pulse rounded-full bg-primary" />
                </div>
              </div>
            ) : null}
            {diagnoseContext.isSuccess && diagnoseContext.data.complete ? (
              <Link
                className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#1e315f] px-4 text-sm font-extrabold text-white no-underline"
                to={`/projects/${projectId}/context`}
              >
                Revisar resumen <ArrowRight aria-hidden="true" size={16} />
              </Link>
            ) : null}
          </>
        ) : (
          <div className="flex items-start gap-2 rounded-xl bg-[#f7f9fc] p-3 text-xs leading-5 text-[#65758e]">
            <Info className="mt-0.5 shrink-0" aria-hidden="true" size={15} />
            Podrás editar esta información antes de generar tu propuesta.
          </div>
        )}
      </div>
    </aside>
  )
}

export function ChatPage() {
  const { projectId = '' } = useParams()
  const projectQuery = useProjectQuery(projectId)
  const messagesQuery = useChatMessagesQuery(projectId)
  const contextQuery = useProjectContextQuery(projectId)
  const sendMessage = useSendMessageMutation(projectId)
  const diagnoseContext = useDiagnoseContextMutation(projectId)
  const [message, setMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const completedFields = contextChecklist.filter(({ field }) => {
    const value = contextQuery.data?.[field]
    return field === 'objectiveCount'
      ? typeof value === 'number' && value >= 2 && value <= 5
      : typeof value === 'string' && Boolean(value.trim())
  }).length
  const contextComplete = completedFields === contextChecklist.length
  const activeStage = diagnoseContext.isSuccess ? 4 : contextComplete ? 3 : 2

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView?.({ behavior: 'smooth' })
  }, [messagesQuery.data, sendMessage.isPending])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const content = message.trim()
    if (!content) return
    setMessage('')
    await sendMessage.mutateAsync(content)
  }

  if (
    projectQuery.isPending ||
    messagesQuery.isPending ||
    contextQuery.isPending
  ) {
    return <LoadingState label="Preparando la conversación con Ágora…" />
  }

  if (projectQuery.isError || messagesQuery.isError || contextQuery.isError) {
    return (
      <ErrorState description="No pudimos recuperar la conversación de este proyecto." />
    )
  }

  return (
    <section className="bg-[#f4f7fb] p-3 sm:p-4 xl:h-[calc(100dvh-var(--header-height))] xl:overflow-hidden">
      <h1 className="sr-only">Cuéntale a Ágora sobre tu proyecto</h1>

      <div className="mb-3 flex items-center justify-between rounded-xl border border-[#dbe3f0] bg-white px-4 py-3 xl:hidden">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#91a1ba]">
            Paso {activeStage} de 4
          </p>
          <p className="text-sm font-extrabold text-[#20325e]">
            {processSteps[activeStage - 1]?.label}
          </p>
        </div>
        <div
          className="h-2 w-28 overflow-hidden rounded-full bg-[#edf1f7]"
          role="progressbar"
          aria-label="Progreso de configuración del proyecto"
          aria-valuemin={0}
          aria-valuemax={4}
          aria-valuenow={activeStage}
        >
          <span
            className="block h-full rounded-full bg-primary transition-all"
            style={{ width: `${activeStage * 25}%` }}
          />
        </div>
      </div>

      <div className="mx-auto grid max-w-[118rem] gap-4 xl:h-full xl:grid-cols-[18rem_minmax(0,1fr)_22rem]">
        <ProcessSidebar activeStage={activeStage} />

        <div className="flex min-h-[calc(100dvh-var(--header-height)-7.5rem)] min-w-0 flex-col gap-3 sm:min-h-[42rem] xl:min-h-0">
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-[#dbe3f0] bg-white">
            <div className="flex items-center gap-3 border-b border-[#edf1f6] bg-white px-4 py-3 sm:px-6">
              <span className="grid size-9 place-items-center rounded-full bg-[#edf4ff] text-primary">
                <Bot aria-hidden="true" size={18} />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-extrabold text-[#20325e]">
                  Asistente Ágora
                </p>
                <p className="flex items-center gap-1.5 text-[11px] text-[#22a878]">
                  <CircleDot aria-hidden="true" size={10} /> En línea ·{' '}
                  {projectQuery.data.title}
                </p>
              </div>
            </div>

            <div
              className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-5 sm:px-6"
              aria-live="polite"
            >
              <div className="flex items-start gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#edf4ff] text-primary">
                  <Bot aria-hidden="true" size={17} />
                </span>
                <div className="max-w-[88%] rounded-2xl rounded-tl-sm bg-[#f7f9fc] px-4 py-3 text-sm leading-6 text-[#263550]">
                  ¡Hola! Soy Ágora, tu asistente para formular proyectos. Te
                  haré preguntas breves para comprender y estructurar tu idea.
                </div>
              </div>

              {messagesQuery.data.map((chatMessage) => {
                const fromUser = chatMessage.role === 'user'
                return (
                  <div
                    key={chatMessage.id}
                    className={`flex items-start gap-3 ${fromUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!fromUser ? (
                      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#edf4ff] text-primary">
                        <Bot aria-hidden="true" size={17} />
                      </span>
                    ) : null}
                    <div
                      className={`max-w-[88%] sm:max-w-[78%] ${fromUser ? 'text-right' : ''}`}
                    >
                      <div
                        className={`rounded-2xl px-4 py-3 text-left text-sm leading-6 text-[#263550] ${fromUser ? 'rounded-tr-sm bg-[#edf4ff]' : 'rounded-tl-sm bg-[#f7f9fc]'}`}
                      >
                        {chatMessage.content}
                      </div>
                      <p className="mt-1 text-[10px] text-[#9aabc3]">
                        {formatTime(chatMessage.createdAt)}
                        {fromUser ? ' · ✓✓' : ''}
                      </p>
                    </div>
                    {fromUser ? (
                      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#edf4ff] text-xs font-extrabold text-primary">
                        AA
                      </span>
                    ) : null}
                  </div>
                )
              })}

              {sendMessage.isPending ? (
                <div className="flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-full bg-[#edf4ff] text-primary">
                    <Bot aria-hidden="true" size={17} />
                  </span>
                  <div className="flex items-center gap-2 rounded-2xl rounded-tl-sm bg-[#f7f9fc] px-4 py-3 text-sm text-[#65758e]">
                    <LoaderCircle
                      className="animate-spin text-primary"
                      aria-hidden="true"
                      size={15}
                    />{' '}
                    Ágora está organizando tu respuesta…
                  </div>
                </div>
              ) : null}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <form
            className="rounded-2xl border border-[#dbe3f0] bg-white p-2"
            onSubmit={(event) => void handleSubmit(event)}
          >
            {sendMessage.isError ? (
              <p
                className="mb-2 rounded-lg bg-danger/10 p-3 text-sm font-medium text-danger"
                role="alert"
              >
                {sendMessage.error.message}
              </p>
            ) : null}
            <div className="flex items-center gap-2">
              <span className="grid size-10 shrink-0 place-items-center text-[#63738d]">
                <Mic aria-hidden="true" size={20} />
              </span>
              <label className="sr-only" htmlFor="chat-message">
                Tu respuesta
              </label>
              <textarea
                id="chat-message"
                className="max-h-28 min-h-11 flex-1 resize-none border-0 bg-transparent px-1 py-2.5 text-sm leading-6 outline-none placeholder:text-[#a1aec1]"
                placeholder={
                  contextComplete
                    ? 'El contexto está listo para analizar.'
                    : 'Escribe tu respuesta…'
                }
                value={message}
                disabled={sendMessage.isPending || contextComplete}
                onChange={(event) => setMessage(event.target.value)}
              />
              <button
                className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#1e315f] text-white transition hover:bg-primary disabled:cursor-not-allowed disabled:opacity-40"
                type="submit"
                aria-label="Enviar respuesta"
                disabled={
                  !message.trim() || sendMessage.isPending || contextComplete
                }
              >
                <Send aria-hidden="true" size={19} />
              </button>
            </div>
          </form>
          <p className="flex items-center justify-center gap-2 text-center text-[10px] text-[#9aabc3]">
            <FileCheck2 aria-hidden="true" size={12} /> Ágora puede cometer
            errores. Verifica siempre la información importante.
          </p>
        </div>

        <ContextPanel
          context={contextQuery.data}
          contextComplete={contextComplete}
          diagnoseContext={diagnoseContext}
          projectId={projectId}
        />
      </div>
    </section>
  )
}
