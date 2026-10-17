import { zodResolver } from '@hookform/resolvers/zod'
import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  ListChecks,
  Save,
  ShieldCheck,
  Target,
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router'
import { z } from 'zod'

import { ErrorState } from '@/components/feedback/ErrorState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { AgoraButton } from '@/components/ui/agora-button'
import { useComponentsQuery } from '@/features/formulation/hooks/use-components'
import {
  useConfirmExecutionDetailsMutation,
  useExecutionDetailsQuery,
  useProjectQuery,
  useUpdateExecutionDetailsMutation,
} from '@/features/projects/hooks/use-projects'
import {
  COMPONENT_TYPES,
  type ExecutionDetails,
  type ProjectComponent,
} from '@/types/domain'

type ExecutionDetailsField = keyof Omit<
  ExecutionDetails,
  'confirmedAt' | 'projectId'
>

const fields: Array<{
  description: string
  label: string
  name: ExecutionDetailsField
}> = [
  {
    name: 'activityDevelopment',
    label: '¿Cómo se desarrollará cada actividad del proyecto?',
    description:
      'Describe los pasos principales desde el inicio de cada actividad hasta obtener el resultado esperado.',
  },
  {
    name: 'participants',
    label: '¿Quiénes participarán en la ejecución?',
    description:
      'Indica perfiles profesionales, técnicos, proveedores, aliados o personal de apoyo y la función de cada uno.',
  },
  {
    name: 'locationsAndParticipants',
    label: '¿Dónde y con quién se desarrollarán las actividades?',
    description:
      'Señala lugares, población beneficiaria, número aproximado de participantes y criterios de selección o convocatoria.',
  },
  {
    name: 'requiredResources',
    label: '¿Qué recursos se necesitan para ejecutar las actividades?',
    description:
      'Incluye equipos, materiales, software, licencias, espacios, transporte, alimentación, producción y logística, con cantidades aproximadas.',
  },
  {
    name: 'timelineAndDependencies',
    label:
      '¿Cuánto tiempo tomará cada actividad y en qué orden debería realizarse?',
    description:
      'Indica duración, meses o etapas y las dependencias necesarias para comenzar cada actividad.',
  },
  {
    name: 'expectedDeliverables',
    label: '¿Qué resultado concreto debe quedar al finalizar cada actividad?',
    description:
      'Especifica productos o entregables, cantidades y características principales.',
  },
  {
    name: 'verificationMethods',
    label:
      '¿Cómo se comprobará que cada actividad fue realizada correctamente?',
    description:
      'Indica evidencias, indicadores, pruebas, validaciones, actas, fotografías, registros o informes que demuestren el cumplimiento.',
  },
  {
    name: 'knownEconomicInformation',
    label: '¿Qué información económica ya conoce del proyecto?',
    description:
      'Incluye presupuesto máximo, cotizaciones, honorarios, equipos, proveedores, logística y recursos que la organización ya posee.',
  },
  {
    name: 'specialConditions',
    label:
      '¿Existe alguna condición especial que debamos considerar para ejecutar el proyecto?',
    description:
      'Describe requisitos técnicos, normativos, ambientales, culturales o tecnológicos, fechas límite, estándares y restricciones. Si no existen, indícalo expresamente.',
  },
]

const requiredAnswer = z
  .string()
  .trim()
  .min(3, 'Esta respuesta es necesaria para continuar.')

const executionDetailsSchema = z.object(
  Object.fromEntries(
    fields.map(({ name }) => [name, requiredAnswer]),
  ) as Record<ExecutionDetailsField, typeof requiredAnswer>,
)

type ExecutionDetailsValues = z.infer<typeof executionDetailsSchema>

function IdeationResultCard({
  component,
  description,
  icon: Icon,
  title,
}: {
  component?: ProjectComponent
  description: string
  icon: typeof Target
  title: string
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-[#dbe3f0] bg-white shadow-sm">
      <div className="flex items-start gap-4 border-b border-[#e5eaf2] bg-[#f7f9fd] p-5 sm:p-6">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
          <Icon aria-hidden="true" size={21} />
        </span>
        <div>
          <h3 className="text-lg font-extrabold text-[#20325e]">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
      <div className="max-h-[28rem] overflow-y-auto p-5 sm:p-6">
        {component?.currentContent ? (
          <p className="whitespace-pre-line text-sm leading-7 text-[#344563]">
            {component.currentContent}
          </p>
        ) : (
          <p className="text-sm leading-6 text-muted-foreground">
            Este resultado de Ideación todavía no está disponible.
          </p>
        )}
      </div>
    </article>
  )
}

function IdeationResults({ components }: { components: ProjectComponent[] }) {
  const objectives = components.find(
    ({ type }) => type === COMPONENT_TYPES.SMART_OBJECTIVES,
  )
  const activities = components.find(
    ({ type }) => type === COMPONENT_TYPES.ACTIVITIES,
  )

  return (
    <section className="mt-8" aria-labelledby="ideation-results-title">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">
            Consulta antes de responder
          </p>
          <h2
            id="ideation-results-title"
            className="mt-2 text-2xl font-extrabold tracking-tight text-[#20325e]"
          >
            Resultados del Agente de Ideación
          </h2>
        </div>
        <p className="max-w-xl text-sm leading-6 text-muted-foreground sm:text-right">
          Revisa los objetivos y las actividades propuestas como punto de
          partida para describir su ejecución, recursos, tiempos y costos.
        </p>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <IdeationResultCard
          component={objectives}
          description="Lo que el proyecto busca alcanzar de forma específica y verificable."
          icon={Target}
          title="Objetivos del proyecto"
        />
        <IdeationResultCard
          component={activities}
          description="Las acciones que debes considerar al responder cada pregunta de ejecución."
          icon={ListChecks}
          title="Actividades propuestas"
        />
      </div>
    </section>
  )
}

function ExecutionDetailsForm({
  details,
  projectId,
}: {
  details: ExecutionDetails
  projectId: string
}) {
  const navigate = useNavigate()
  const updateDetails = useUpdateExecutionDetailsMutation()
  const confirmDetails = useConfirmExecutionDetailsMutation()
  const form = useForm<ExecutionDetailsValues>({
    resolver: zodResolver(executionDetailsSchema),
    defaultValues: Object.fromEntries(
      fields.map(({ name }) => [name, details[name] ?? '']),
    ) as ExecutionDetailsValues,
  })

  const save = form.handleSubmit(async (values) => {
    await updateDetails.mutateAsync({ projectId, input: values })
  })

  const confirm = form.handleSubmit(async (values) => {
    await updateDetails.mutateAsync({ projectId, input: values })
    await confirmDetails.mutateAsync(projectId)
    await navigate(`/projects/${projectId}/generation`)
  })

  return (
    <form className="mt-8" onSubmit={(event) => void save(event)} noValidate>
      <div className="grid gap-5 lg:grid-cols-2">
        {fields.map((field, index) => (
          <label
            key={field.name}
            className={`rounded-xl border border-border bg-card p-5 shadow-sm ${index === fields.length - 1 ? 'lg:col-span-2' : ''}`}
          >
            <span className="flex items-start gap-3">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary text-xs font-extrabold text-white">
                {index + 1}
              </span>
              <span className="font-extrabold leading-6 text-[#20325e]">
                {field.label}
              </span>
            </span>
            <span className="mt-2 block text-xs leading-5 text-muted-foreground">
              {field.description}
            </span>
            <textarea
              aria-label={field.label}
              className="mt-4 min-h-36 w-full resize-y rounded-lg border border-border bg-background px-4 py-3 text-sm leading-6 outline-none focus:border-primary"
              {...form.register(field.name)}
            />
            {form.formState.errors[field.name] ? (
              <span className="mt-2 block text-xs font-bold text-danger">
                {form.formState.errors[field.name]?.message}
              </span>
            ) : null}
          </label>
        ))}
      </div>

      {updateDetails.isError || confirmDetails.isError ? (
        <p
          className="mt-5 rounded-lg bg-danger/10 p-4 text-sm font-medium text-danger"
          role="alert"
        >
          {updateDetails.error?.message ?? confirmDetails.error?.message}
        </p>
      ) : null}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
        <AgoraButton
          variant="secondary"
          type="submit"
          disabled={updateDetails.isPending}
        >
          <Save aria-hidden="true" size={17} /> Guardar respuestas
        </AgoraButton>
        <AgoraButton
          type="button"
          size="large"
          disabled={confirmDetails.isPending}
          onClick={() => void confirm()}
        >
          {confirmDetails.isPending
            ? 'Confirmando respuestas…'
            : 'Confirmar y continuar'}
          <ArrowRight aria-hidden="true" size={18} />
        </AgoraButton>
      </div>
    </form>
  )
}

export function ExecutionDetailsPage() {
  const { projectId = '' } = useParams()
  const projectQuery = useProjectQuery(projectId)
  const detailsQuery = useExecutionDetailsQuery(projectId)
  const componentsQuery = useComponentsQuery(projectId)

  if (
    projectQuery.isPending ||
    detailsQuery.isPending ||
    componentsQuery.isPending
  ) {
    return <LoadingState label="Preparando las preguntas de ejecución…" />
  }
  if (projectQuery.isError || detailsQuery.isError || componentsQuery.isError) {
    return (
      <ErrorState description="No pudimos preparar las preguntas de metodología y presupuesto." />
    )
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <header className="rounded-[1.4rem] bg-[#21356d] p-7 text-white shadow-card sm:p-9">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#a9bdff]">
              Ideación completada
            </p>
            <h1 className="mt-3 text-4xl font-extrabold tracking-tight">
              Detalles de ejecución del proyecto
            </h1>
            <p className="mt-4 max-w-3xl leading-7 text-white/70">
              Tus respuestas conectarán las actividades con la metodología y el
              presupuesto. Las nueve son obligatorias para continuar.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/10 p-4">
            <CheckCircle2
              className="text-[#9fefce]"
              aria-hidden="true"
              size={26}
            />
            <div>
              <p className="text-xs text-white/60">Agentes completados</p>
              <p className="font-extrabold">Investigación e Ideación</p>
            </div>
          </div>
        </div>
      </header>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="flex items-start gap-3 rounded-xl border border-primary/10 bg-secondary p-4 text-sm leading-6 text-secondary-foreground">
          <ClipboardCheck
            className="mt-0.5 shrink-0 text-primary"
            aria-hidden="true"
            size={19}
          />
          Responde con base en las actividades propuestas. Puedes indicar
          cantidades aproximadas o información todavía pendiente de cotización.
        </div>
        <div className="flex items-start gap-3 rounded-xl border border-primary/10 bg-secondary p-4 text-sm leading-6 text-secondary-foreground">
          <ShieldCheck
            className="mt-0.5 shrink-0 text-primary"
            aria-hidden="true"
            size={19}
          />
          Metodología y Presupuesto permanecerán bloqueados hasta confirmar
          todas las respuestas.
        </div>
      </div>

      <IdeationResults components={componentsQuery.data} />

      <ExecutionDetailsForm details={detailsQuery.data} projectId={projectId} />
    </section>
  )
}
