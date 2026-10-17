import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, FolderPlus, Sparkles } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useSearchParams } from 'react-router'

import { ErrorState } from '@/components/feedback/ErrorState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { PageHeader } from '@/components/layout/PageHeader'
import { AgoraButton } from '@/components/ui/agora-button'
import { useCreateProjectMutation } from '@/features/projects/hooks/use-projects'
import {
  projectSchema,
  type ProjectFormValues,
} from '@/features/projects/schemas/project-schema'
import { useSkillsQuery } from '@/features/skills/hooks/use-skills-query'

export function NewProjectPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const selectedSkillId = searchParams.get('skill') ?? ''
  const skillsQuery = useSkillsQuery()
  const createProject = useCreateProjectMutation()
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: { title: 'Nuevo proyecto Ágora' },
  })

  const selectedSkill = skillsQuery.data?.find(
    (skill) => skill.id === selectedSkillId && skill.enabled,
  )

  const handleSubmit = form.handleSubmit(async (values) => {
    const project = await createProject.mutateAsync({
      selectedSkillId,
      title: values.title,
    })
    await navigate(`/projects/${project.id}/chat`)
  })

  if (skillsQuery.isPending) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <LoadingState label="Preparando tu nuevo proyecto…" />
      </section>
    )
  }

  if (skillsQuery.isError || !selectedSkill) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <ErrorState
          title="Selecciona una skill disponible"
          description="Para crear un proyecto primero debes elegir el tipo de acompañamiento que utilizarás."
        />
        <Link
          className="mt-6 inline-flex items-center gap-2 font-semibold text-primary"
          to="/skills"
        >
          <ArrowLeft aria-hidden="true" size={17} />
          Volver a las skills
        </Link>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <PageHeader
        eyebrow="Ágora · Nuevo proyecto"
        title="Dale un punto de partida a tu idea"
        description="Usaremos este nombre para identificar el borrador. Podrás modificarlo cuando completes el contexto."
      />

      <div className="mt-10 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <aside className="rounded-lg border border-border bg-secondary p-6 text-secondary-foreground sm:p-7">
          <span className="grid size-11 place-items-center rounded-md bg-primary text-primary-foreground">
            <Sparkles aria-hidden="true" size={21} />
          </span>
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-primary">
            Skill seleccionada
          </p>
          <h2 className="mt-3 font-serif text-2xl font-bold leading-tight">
            {selectedSkill.name}
          </h2>
          <p className="mt-3 leading-7">{selectedSkill.description}</p>
        </aside>

        <form
          className="rounded-lg border border-border bg-card p-6 shadow-card sm:p-8"
          onSubmit={(event) => void handleSubmit(event)}
          noValidate
        >
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-md bg-muted text-primary">
              <FolderPlus aria-hidden="true" size={21} />
            </span>
            <div>
              <h2 className="font-serif text-2xl font-bold">
                Información inicial
              </h2>
              <p className="text-sm text-muted-foreground">
                Sólo necesitamos un nombre por ahora.
              </p>
            </div>
          </div>

          <label
            className="mt-8 block text-sm font-bold"
            htmlFor="project-title"
          >
            Nombre del proyecto
          </label>
          <input
            id="project-title"
            className="mt-2 min-h-12 w-full rounded-md border border-border bg-background px-4 text-foreground transition focus:border-primary focus:outline-none"
            aria-describedby="project-title-help project-title-error"
            {...form.register('title')}
          />
          <p
            id="project-title-help"
            className="mt-2 text-sm text-muted-foreground"
          >
            Entre 3 y 80 caracteres. No tiene que ser el título definitivo.
          </p>
          {form.formState.errors.title ? (
            <p
              id="project-title-error"
              className="mt-2 text-sm font-medium text-danger"
              role="alert"
            >
              {form.formState.errors.title.message}
            </p>
          ) : null}

          {createProject.isError ? (
            <p
              className="mt-5 rounded-md bg-danger/10 p-4 text-sm font-medium text-danger"
              role="alert"
            >
              {createProject.error.message}
            </p>
          ) : null}

          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-md px-5 text-sm font-semibold no-underline hover:bg-muted"
              to="/skills"
            >
              Cancelar
            </Link>
            <AgoraButton type="submit" disabled={createProject.isPending}>
              {createProject.isPending
                ? 'Creando proyecto…'
                : 'Crear y continuar'}
            </AgoraButton>
          </div>
        </form>
      </div>
    </section>
  )
}
