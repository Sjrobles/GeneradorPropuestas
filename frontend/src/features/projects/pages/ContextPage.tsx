import { zodResolver } from '@hookform/resolvers/zod'
import {
  ArrowRight,
  CheckCircle2,
  PencilLine,
  Save,
  ShieldCheck,
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router'
import { z } from 'zod'

import { ErrorState } from '@/components/feedback/ErrorState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { AgoraButton } from '@/components/ui/agora-button'
import {
  useConfirmContextMutation,
  useProjectContextQuery,
  useProjectQuery,
  useUpdateProjectContextMutation,
} from '@/features/projects/hooks/use-projects'
import type { ProjectContext } from '@/types/domain'

type RequiredContextField =
  | 'problem'
  | 'targetPopulation'
  | 'proposedSolution'
  | 'location'
  | 'expectedResults'
  | 'objectiveCount'
  | 'initialScope'
  | 'projectDuration'

const fields: Array<{
  name: RequiredContextField
  label: string
  description: string
}> = [
  {
    name: 'problem',
    label: 'Problema',
    description: 'Necesidad principal que origina el proyecto.',
  },
  {
    name: 'targetPopulation',
    label: 'Población beneficiaria',
    description: 'Personas, comunidades u organizaciones destinatarias.',
  },
  {
    name: 'proposedSolution',
    label: 'Solución propuesta',
    description: 'Respuesta inicial planteada frente al problema.',
  },
  {
    name: 'location',
    label: 'Ubicación',
    description: 'Territorio o entorno de ejecución.',
  },
  {
    name: 'expectedResults',
    label: 'Resultados esperados',
    description: 'Cambios o productos concretos que se esperan alcanzar.',
  },
  {
    name: 'objectiveCount',
    label: 'Número de objetivos específicos',
    description:
      'Elige entre 2 y 5. Ágora generará exactamente la cantidad indicada.',
  },
  {
    name: 'initialScope',
    label: 'Alcance inicial',
    description: 'Límites y cobertura de esta primera formulación.',
  },
  {
    name: 'projectDuration',
    label: 'Duración total del proyecto',
    description:
      'Tiempo total disponible en semanas o meses y cualquier fecha límite aplicable.',
  },
]

const requiredAnswer = z.string().trim().min(3, 'Completa este campo.')

const contextSchema = z.object({
  problem: requiredAnswer,
  targetPopulation: requiredAnswer,
  proposedSolution: requiredAnswer,
  location: requiredAnswer,
  expectedResults: requiredAnswer,
  objectiveCount: z
    .number({ error: 'Indica un número entre 2 y 5.' })
    .int()
    .min(2, 'El mínimo es 2 objetivos.')
    .max(5, 'El máximo es 5 objetivos.'),
  initialScope: requiredAnswer,
  projectDuration: requiredAnswer,
})

type ContextValues = z.infer<typeof contextSchema>

function ContextForm({
  context,
  projectId,
}: {
  context: ProjectContext
  projectId: string
}) {
  const navigate = useNavigate()
  const updateContext = useUpdateProjectContextMutation()
  const confirmContext = useConfirmContextMutation()
  const form = useForm<ContextValues>({
    resolver: zodResolver(contextSchema),
    defaultValues: Object.fromEntries(
      fields.map(({ name }) => [name, context[name] ?? '']),
    ) as ContextValues,
  })

  const save = form.handleSubmit(async (values) => {
    await updateContext.mutateAsync({ projectId, input: values })
  })

  const confirm = form.handleSubmit(async (values) => {
    await updateContext.mutateAsync({ projectId, input: values })
    await confirmContext.mutateAsync(projectId)
    await navigate(`/projects/${projectId}/generation`)
  })

  return (
    <form className="mt-8" onSubmit={(event) => void save(event)} noValidate>
      <div className="grid gap-5 lg:grid-cols-2">
        {fields.map((field) => (
          <label
            key={field.name}
            className="rounded-xl border border-border bg-card p-5 shadow-sm"
          >
            <span className="flex items-center justify-between gap-3">
              <span className="font-extrabold">{field.label}</span>
              <PencilLine
                className="text-primary"
                aria-hidden="true"
                size={17}
              />
            </span>
            <span className="mt-1 block text-xs leading-5 text-muted-foreground">
              {field.description}
            </span>
            {field.name === 'objectiveCount' ? (
              <input
                className="mt-4 min-h-12 w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                type="number"
                min={2}
                max={5}
                step={1}
                {...form.register(field.name, { valueAsNumber: true })}
              />
            ) : (
              <textarea
                className="mt-4 min-h-28 w-full resize-y rounded-lg border border-border bg-background px-4 py-3 text-sm leading-6 outline-none focus:border-primary"
                {...form.register(field.name)}
              />
            )}
            {form.formState.errors[field.name] ? (
              <span className="mt-2 block text-xs font-bold text-danger">
                {form.formState.errors[field.name]?.message}
              </span>
            ) : null}
          </label>
        ))}
      </div>

      {updateContext.isError || confirmContext.isError ? (
        <p
          className="mt-5 rounded-lg bg-danger/10 p-4 text-sm font-medium text-danger"
          role="alert"
        >
          {updateContext.error?.message ?? confirmContext.error?.message}
        </p>
      ) : null}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
        <AgoraButton
          variant="secondary"
          type="submit"
          disabled={updateContext.isPending}
        >
          <Save aria-hidden="true" size={17} /> Guardar cambios
        </AgoraButton>
        <AgoraButton
          type="button"
          size="large"
          disabled={confirmContext.isPending}
          onClick={() => void confirm()}
        >
          {confirmContext.isPending
            ? 'Confirmando contexto…'
            : 'Confirmar y continuar'}
          <ArrowRight aria-hidden="true" size={18} />
        </AgoraButton>
      </div>
    </form>
  )
}

export function ContextPage() {
  const { projectId = '' } = useParams()
  const projectQuery = useProjectQuery(projectId)
  const contextQuery = useProjectContextQuery(projectId)

  if (projectQuery.isPending || contextQuery.isPending)
    return <LoadingState label="Organizando el resumen del contexto…" />
  if (projectQuery.isError || contextQuery.isError)
    return (
      <ErrorState description="No pudimos preparar el resumen de este proyecto." />
    )

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <header className="rounded-[1.4rem] bg-[#21356d] p-7 text-white shadow-card sm:p-9">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#a9bdff]">
              Diagnóstico completado
            </p>
            <h1 className="mt-3 text-4xl font-extrabold tracking-tight">
              Confirma el contexto de tu proyecto
            </h1>
            <p className="mt-4 max-w-2xl leading-7 text-white/70">
              Revisa y ajusta la información estructurada antes de iniciar la
              formulación de componentes.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/10 p-4">
            <CheckCircle2
              className="text-[#9fefce]"
              aria-hidden="true"
              size={26}
            />
            <div>
              <p className="text-xs text-white/60">Estado</p>
              <p className="font-extrabold">Contexto coherente</p>
            </div>
          </div>
        </div>
      </header>

      <div className="mt-6 flex items-start gap-3 rounded-xl border border-primary/10 bg-secondary p-4 text-sm leading-6 text-secondary-foreground">
        <ShieldCheck
          className="mt-0.5 shrink-0 text-primary"
          aria-hidden="true"
          size={19}
        />
        Ágora no añadió cifras, instituciones ni hechos externos. El resumen se
        construyó únicamente con tus respuestas.
      </div>

      <ContextForm context={contextQuery.data} projectId={projectId} />
    </section>
  )
}
