import {
  AlertTriangle,
  ArrowRight,
  CircleCheckBig,
  FileText,
  FolderClock,
  FolderKanban,
  Plus,
  Search,
  Sparkles,
} from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router'

import { ErrorState } from '@/components/feedback/ErrorState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { PageHeader } from '@/components/layout/PageHeader'
import {
  getProjectResumePath,
  isProjectComplete,
} from '@/features/projects/domain/project-resume'
import { useProjectsQuery } from '@/features/projects/hooks/use-projects'
import { getAuthSession } from '@/services/auth/auth-session'
import { PROJECT_STATES, type Project } from '@/types/domain'

type ProjectFilter = 'all' | 'active' | 'completed'

const dateFormatter = new Intl.DateTimeFormat('es-CO', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

export function MyProjectsPage() {
  const projectsQuery = useProjectsQuery()
  const [filter, setFilter] = useState<ProjectFilter>('all')
  const [search, setSearch] = useState('')
  const userName = getAuthSession()?.user.name.split(/\s+/)[0]
  const projects = useMemo(() => projectsQuery.data ?? [], [projectsQuery.data])
  const completedCount = projects.filter(isProjectComplete).length
  const activeCount = projects.length - completedCount
  const visibleProjects = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase('es-CO')
    return projects.filter((project) => {
      const completed = isProjectComplete(project)
      const matchesFilter =
        filter === 'all' ||
        (filter === 'completed' && completed) ||
        (filter === 'active' && !completed)
      const matchesSearch =
        !normalizedSearch ||
        project.title.toLocaleLowerCase('es-CO').includes(normalizedSearch)
      return matchesFilter && matchesSearch
    })
  }, [filter, projects, search])

  return (
    <section className="min-h-[calc(100dvh-var(--header-height))] bg-[#f5f7fb]">
      <div className="mx-auto max-w-(--content-width) px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <PageHeader
          eyebrow={userName ? `Espacio de ${userName}` : 'Biblioteca personal'}
          title="Mis proyectos"
          description="Consulta tus proyectos guardados, identifica cuáles están pendientes y continúa exactamente desde el último paso completado."
          trailing={
            <Link
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-extrabold text-white no-underline shadow-sm transition hover:bg-[#203590]"
              to="/skills"
            >
              <Plus aria-hidden="true" size={18} />
              Crear nuevo proyecto
            </Link>
          }
        />

        {projectsQuery.isPending ? (
          <div className="mt-10 rounded-2xl border border-[#dbe3f0] bg-white p-6">
            <LoadingState label="Consultando tus proyectos guardados…" />
          </div>
        ) : null}

        {projectsQuery.isError ? (
          <div className="mt-10">
            <ErrorState
              title="No pudimos cargar tus proyectos"
              description="Tu información sigue guardada. Reintenta la consulta para continuar."
              onRetry={() => void projectsQuery.refetch()}
            />
          </div>
        ) : null}

        {projectsQuery.isSuccess ? (
          <>
            <section
              className="mt-8 grid gap-4 sm:grid-cols-3"
              aria-label="Resumen de proyectos"
            >
              <SummaryCard
                icon={<FolderKanban aria-hidden="true" size={20} />}
                label="Total"
                value={projects.length}
              />
              <SummaryCard
                icon={<FolderClock aria-hidden="true" size={20} />}
                label="En desarrollo"
                value={activeCount}
              />
              <SummaryCard
                icon={<CircleCheckBig aria-hidden="true" size={20} />}
                label="Con documento"
                value={completedCount}
              />
            </section>

            {projects.length ? (
              <>
                <section className="mt-8 flex flex-col gap-4 rounded-2xl border border-[#dbe3f0] bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                  <div
                    className="flex flex-wrap gap-2"
                    aria-label="Filtrar proyectos"
                  >
                    {(
                      [
                        ['all', 'Todos'],
                        ['active', 'En desarrollo'],
                        ['completed', 'Con documento'],
                      ] as const
                    ).map(([value, label]) => (
                      <button
                        key={value}
                        className={`min-h-10 rounded-lg px-4 text-sm font-extrabold transition ${filter === value ? 'bg-[#20325e] text-white' : 'bg-[#f1f4f9] text-[#53627a] hover:bg-[#e5ebf5]'}`}
                        type="button"
                        aria-pressed={filter === value}
                        onClick={() => setFilter(value)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <label className="relative block min-w-0 sm:w-80">
                    <span className="sr-only">
                      Buscar por nombre del proyecto
                    </span>
                    <Search
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8795aa]"
                      aria-hidden="true"
                      size={17}
                    />
                    <input
                      className="min-h-11 w-full rounded-xl border border-[#dbe3f0] bg-[#fbfcfe] pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                      placeholder="Buscar proyecto"
                      type="search"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                    />
                  </label>
                </section>

                {visibleProjects.length ? (
                  <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {visibleProjects.map((project) => (
                      <ProjectCard key={project.id} project={project} />
                    ))}
                  </div>
                ) : (
                  <div className="mt-6 rounded-2xl border border-dashed border-[#cbd5e5] bg-white p-8 text-center">
                    <Search
                      className="mx-auto text-[#91a0b8]"
                      aria-hidden="true"
                      size={28}
                    />
                    <h2 className="mt-3 font-extrabold text-[#20325e]">
                      No encontramos proyectos con ese filtro
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Prueba otro término o selecciona “Todos”.
                    </p>
                  </div>
                )}
              </>
            ) : (
              <section className="mt-8 overflow-hidden rounded-3xl border border-[#cdd8ec] bg-white shadow-sm">
                <div className="grid gap-8 p-7 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center">
                  <div>
                    <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                      <Sparkles aria-hidden="true" size={23} />
                    </span>
                    <h2 className="mt-5 font-serif text-3xl font-bold text-[#20325e]">
                      Aún no tienes proyectos guardados
                    </h2>
                    <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">
                      Selecciona una skill, crea tu primer proyecto y Ágora irá
                      guardando cada avance para que puedas retomarlo después.
                    </p>
                  </div>
                  <Link
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 font-extrabold text-white no-underline"
                    to="/skills"
                  >
                    Comenzar un proyecto
                    <ArrowRight aria-hidden="true" size={17} />
                  </Link>
                </div>
              </section>
            )}
          </>
        ) : null}
      </div>
    </section>
  )
}

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: number
}) {
  return (
    <article className="flex items-center gap-4 rounded-2xl border border-[#dbe3f0] bg-white p-5 shadow-sm">
      <span className="grid size-11 place-items-center rounded-xl bg-[#eaf1ff] text-primary">
        {icon}
      </span>
      <div>
        <p className="text-2xl font-extrabold text-[#20325e]">{value}</p>
        <p className="text-xs font-bold text-muted-foreground">{label}</p>
      </div>
    </article>
  )
}

function ProjectCard({ project }: { project: Project }) {
  const completed = isProjectComplete(project)
  const status = projectStatus(project)
  const progress = Math.min(100, Math.max(0, project.progress))

  return (
    <article className="flex min-h-72 flex-col rounded-2xl border border-[#dbe3f0] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#b9c9e6] hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <span className="grid size-11 place-items-center rounded-xl bg-[#eef3ff] text-primary">
          {completed ? (
            <FileText aria-hidden="true" size={21} />
          ) : project.state === PROJECT_STATES.ERROR ? (
            <AlertTriangle aria-hidden="true" size={21} />
          ) : (
            <FolderClock aria-hidden="true" size={21} />
          )}
        </span>
        <span
          className={`rounded-full px-3 py-1 text-[11px] font-extrabold ${status.className}`}
        >
          {status.label}
        </span>
      </div>

      <h2 className="mt-4 line-clamp-2 text-lg font-extrabold leading-6 text-[#20325e]">
        {project.title}
      </h2>
      <p className="mt-2 text-xs text-muted-foreground">
        Actualizado {dateFormatter.format(new Date(project.updatedAt))}
      </p>

      <div className="mt-5">
        <div className="flex items-center justify-between text-[11px] font-bold text-[#69788f]">
          <span>Progreso del proyecto</span>
          <span>{progress}%</span>
        </div>
        <div
          className="mt-2 h-2 overflow-hidden rounded-full bg-[#e9eef6]"
          role="progressbar"
          aria-label={`Progreso de ${project.title}`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
        >
          <span
            className={`block h-full rounded-full ${completed ? 'bg-success' : project.state === PROJECT_STATES.ERROR ? 'bg-[#d78b29]' : 'bg-primary'}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <Link
        className="mt-auto inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-primary/25 bg-primary/5 px-4 text-sm font-extrabold text-primary no-underline transition hover:bg-primary hover:text-white"
        to={getProjectResumePath(project)}
      >
        {completed
          ? 'Abrir documento'
          : project.state === PROJECT_STATES.ERROR
            ? 'Revisar y continuar'
            : 'Continuar proyecto'}
        <ArrowRight aria-hidden="true" size={16} />
      </Link>
    </article>
  )
}

function projectStatus(project: Project): {
  className: string
  label: string
} {
  if (isProjectComplete(project)) {
    return { className: 'bg-success/10 text-success', label: 'Documento listo' }
  }
  if (project.state === PROJECT_STATES.ERROR) {
    return {
      className: 'bg-[#fff1dc] text-[#9a5d09]',
      label: 'Requiere atención',
    }
  }
  if (
    project.state === PROJECT_STATES.GENERATING_COMPONENTS ||
    project.state === PROJECT_STATES.ASSEMBLING ||
    project.state === PROJECT_STATES.TRANSLATING
  ) {
    return { className: 'bg-[#e9efff] text-primary', label: 'Procesando' }
  }
  if (
    project.state === PROJECT_STATES.WAITING_REVIEW ||
    project.state === PROJECT_STATES.VALIDATING_COMPONENTS
  ) {
    return { className: 'bg-[#ede9ff] text-[#6346b7]', label: 'En revisión' }
  }
  return { className: 'bg-[#fff3d7] text-[#8d640d]', label: 'En desarrollo' }
}
