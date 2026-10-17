import {
  ArrowRight,
  Check,
  Download,
  FileText,
  Home,
  Plus,
  RotateCcw,
} from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router'

import { ErrorState } from '@/components/feedback/ErrorState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { useDocumentQuery } from '@/features/documents/hooks/use-documents'
import {
  useProjectQuery,
  useRegenerateProjectMutation,
} from '@/features/projects/hooks/use-projects'
import { downloadProjectDocument } from '@/services/documents/document-download'

export function CompletionPage() {
  const { projectId = '' } = useParams()
  const navigate = useNavigate()
  const projectQuery = useProjectQuery(projectId)
  const documentQuery = useDocumentQuery(projectId)
  const regenerateProject = useRegenerateProjectMutation(projectId)

  if (projectQuery.isPending || documentQuery.isPending)
    return <LoadingState label="Cerrando tu proyecto…" />
  if (projectQuery.isError || documentQuery.isError)
    return <ErrorState description="No pudimos abrir el resultado final." />

  const regenerate = async () => {
    const confirmed = window.confirm(
      'Esta es la única regeneración completa disponible. Se reemplazarán los 13 componentes y deberás revisarlos nuevamente. ¿Deseas continuar?',
    )
    if (!confirmed) return
    await regenerateProject.mutateAsync()
    await navigate(`/projects/${projectId}/generation`)
  }

  return (
    <section className="min-h-[calc(100dvh-var(--header-height))] bg-[radial-gradient(circle_at_top,#e8efff,#f7f9fc_48%)] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl text-center">
        <div className="relative mx-auto grid size-24 place-items-center rounded-full bg-[#e4f8ef] text-success shadow-[0_16px_40px_rgba(39,132,97,0.18)]">
          <Check aria-hidden="true" size={42} strokeWidth={3} />
          <span className="absolute inset-0 animate-ping rounded-full border border-success/20" />
        </div>
        <p className="mt-7 text-xs font-extrabold uppercase tracking-[0.2em] text-primary">
          Proceso completado
        </p>
        <h1 className="mt-3 font-serif text-5xl font-bold text-[#1d2f5c] sm:text-6xl">
          Tu borrador ha sido generado.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#627088]">
          Ágora organizó las últimas versiones de los 13 apartados de{' '}
          <strong className="text-[#20325e]">{projectQuery.data.title}</strong>.
          Recuerda que el documento debe pasar por revisión experta antes de
          presentarse.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <button
            className="flex min-h-16 items-center justify-center gap-3 rounded-2xl bg-[#1e315f] px-6 font-extrabold text-white shadow-lg shadow-[#1e315f]/20"
            type="button"
            onClick={() =>
              void downloadProjectDocument(documentQuery.data, 'pdf')
            }
          >
            <Download aria-hidden="true" size={20} /> Descargar borrador
          </button>
          <Link
            className="flex min-h-16 items-center justify-center gap-3 rounded-2xl border border-[#dbe3f0] bg-white px-6 font-extrabold text-[#20325e] no-underline shadow-sm"
            to={`/projects/${projectId}/document`}
          >
            <FileText aria-hidden="true" size={20} /> Ver documento{' '}
            <ArrowRight aria-hidden="true" size={17} />
          </Link>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-x-7 gap-y-4 text-sm font-bold">
          <Link
            className="inline-flex items-center gap-2 text-primary no-underline"
            to={`/projects/${projectId}/review`}
          >
            <RotateCcw aria-hidden="true" size={17} /> Volver a revisar
          </Link>
          <button
            className="inline-flex items-center gap-2 border-0 bg-transparent p-0 font-bold text-primary disabled:cursor-not-allowed disabled:text-[#9aa7ba]"
            type="button"
            disabled={
              regenerateProject.isPending ||
              (projectQuery.data.fullProjectRegenerationCount ?? 0) >= 1
            }
            onClick={() => void regenerate()}
          >
            <RotateCcw aria-hidden="true" size={17} />
            {regenerateProject.isPending
              ? 'Preparando regeneración…'
              : (projectQuery.data.fullProjectRegenerationCount ?? 0) >= 1
                ? 'Regeneración completa utilizada'
                : 'Regenerar proyecto completo (1 disponible)'}
          </button>
          <Link
            className="inline-flex items-center gap-2 text-primary no-underline"
            to="/skills"
          >
            <Plus aria-hidden="true" size={17} /> Iniciar nuevo proyecto
          </Link>
          <Link
            className="inline-flex items-center gap-2 text-[#617089] no-underline"
            to="/"
          >
            <Home aria-hidden="true" size={17} /> Regresar al inicio
          </Link>
        </div>
        {regenerateProject.isError ? (
          <p
            className="mt-6 rounded-xl bg-danger/10 p-4 text-sm font-bold text-danger"
            role="alert"
          >
            {regenerateProject.error.message}
          </p>
        ) : null}
      </div>
    </section>
  )
}
