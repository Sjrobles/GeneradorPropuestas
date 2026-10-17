import { ArrowRight, FolderKanban, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router'

import { ErrorState } from '@/components/feedback/ErrorState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { PageHeader } from '@/components/layout/PageHeader'
import { SkillCard } from '@/features/skills/components/SkillCard'
import { useSkillsQuery } from '@/features/skills/hooks/use-skills-query'
import { getAuthSession } from '@/services/auth/auth-session'

export function SkillsPage() {
  const skillsQuery = useSkillsQuery()
  const authenticated = Boolean(getAuthSession())

  return (
    <section className="mx-auto max-w-(--content-width) px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <PageHeader
        eyebrow="Skills de Ágora"
        title="Elige el acompañamiento para tu proyecto"
        description="Cada skill adapta las preguntas y la estructura del borrador al tipo de iniciativa que deseas formular."
        trailing={
          <div className="flex max-w-sm items-start gap-3 rounded-md bg-secondary p-4 text-sm leading-6 text-secondary-foreground">
            <ShieldCheck
              className="mt-0.5 shrink-0 text-primary"
              aria-hidden="true"
              size={20}
            />
            Tus proyectos y documentos se guardan de forma privada en tu perfil.
          </div>
        }
      />

      {authenticated ? (
        <section className="mt-10 flex flex-col gap-4 rounded-2xl border border-[#cdd8ec] bg-[#f3f7ff] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-start gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white text-primary shadow-sm">
              <FolderKanban aria-hidden="true" size={21} />
            </span>
            <div>
              <h2 className="font-extrabold text-[#20325e]">
                ¿Quieres continuar un proyecto?
              </h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Encuentra todos tus proyectos guardados en tu biblioteca
                personal.
              </p>
            </div>
          </div>
          <Link
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-extrabold text-primary no-underline shadow-sm ring-1 ring-inset ring-[#c8d5ec] transition hover:bg-primary hover:text-white"
            to="/projects"
          >
            Ir a mis proyectos <ArrowRight aria-hidden="true" size={16} />
          </Link>
        </section>
      ) : null}

      <div className="mt-10">
        {skillsQuery.isPending ? (
          <LoadingState label="Preparando las skills…" />
        ) : null}
        {skillsQuery.isError ? (
          <ErrorState
            description="Ocurrió un problema al consultar las skills disponibles."
            onRetry={() => void skillsQuery.refetch()}
          />
        ) : null}
        {skillsQuery.isSuccess ? (
          skillsQuery.data.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {skillsQuery.data.map((skill) => (
                <SkillCard key={skill.id} skill={skill} />
              ))}
            </div>
          ) : (
            <ErrorState
              title="Aún no hay skills disponibles"
              description="Regresa más adelante para conocer los nuevos módulos de Ágora."
            />
          )
        ) : null}
      </div>
    </section>
  )
}
