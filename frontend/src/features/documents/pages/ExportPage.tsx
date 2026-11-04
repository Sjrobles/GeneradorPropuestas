import '../styles/export-page.css'
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  FileText,
  FileType2,
  LoaderCircle,
} from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router'

import { ErrorState } from '@/components/feedback/ErrorState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { AgoraButton } from '@/components/ui/agora-button'
import {
  useCompleteProjectMutation,
  useDocumentQuery,
} from '@/features/documents/hooks/use-documents'
import {
  downloadProjectDocument,
  type DocumentExportFormat,
} from '@/services/documents/document-download'

export function ExportPage() {
  const { projectId = '' } = useParams()
  const [searchParams] = useSearchParams()
  const requestedLanguage = searchParams.get('language') === 'en' ? 'en' : 'es'
  const navigate = useNavigate()
  const documentQuery = useDocumentQuery(projectId, requestedLanguage)
  const complete = useCompleteProjectMutation(projectId)
  const [downloading, setDownloading] = useState<DocumentExportFormat | null>(
    null,
  )
  const [downloadError, setDownloadError] = useState<string | null>(null)

  if (documentQuery.isPending)
    return <LoadingState label="Preparando tus archivos…" />
  if (documentQuery.isError)
    return <ErrorState description="No pudimos preparar la exportación." />

  const document = documentQuery.data
  const finish = async () => {
    await complete.mutateAsync()
    void navigate(`/projects/${projectId}/complete`)
  }
  const exportDocument = async (format: DocumentExportFormat) => {
    setDownloading(format)
    setDownloadError(null)
    try {
      await downloadProjectDocument(document, format)
    } catch (error) {
      console.error('No fue posible generar el archivo exportado', error)
      setDownloadError(
        `No fue posible generar el archivo ${format.toUpperCase()}. Inténtalo nuevamente o consulta el Centro de ayuda.`,
      )
    } finally {
      setDownloading(null)
    }
  }

  return (
    <section className="agora-export-page min-h-[calc(100dvh-var(--header-height))] bg-[#f4f7fd] px-4 py-5 sm:px-6 lg:px-8">
      <Link
        className="agora-export-back inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-primary no-underline"
        to={`/projects/${projectId}/document?language=${requestedLanguage}`}
      >
        <ArrowLeft aria-hidden="true" size={15} /> Volver a la vista previa
      </Link>
      <div className="agora-export-content mx-auto w-full max-w-4xl">
        <header className="agora-export-heading mt-5 text-center">
          <h1 className="font-sans text-3xl font-bold tracking-tight text-[#1f3268] sm:text-4xl">
            Exporta tu borrador
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
            Tu proyecto, listo para compartir. Elige una versión editable o un
            PDF para presentar.
          </p>
        </header>

        <div className="agora-export-formats mt-6 grid gap-4 sm:grid-cols-2">
          <article className="agora-export-format flex flex-col rounded-3xl border border-[#dbe3f0] bg-white p-5 sm:p-6">
            <span className="grid size-12 place-items-center rounded-xl bg-[#eaf1ff] text-primary">
              <FileType2 aria-hidden="true" size={23} />
            </span>
            <h2 className="mt-3 text-xl font-semibold text-[#20325e]">
              Word editable
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Para editar y seguir trabajando en Word.
            </p>
            <button
              className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-xl bg-[#1f3268] px-5 text-base font-semibold text-white transition-colors hover:bg-[#2864ef] disabled:cursor-wait disabled:opacity-60"
              disabled={downloading !== null}
              type="button"
              onClick={() => void exportDocument('docx')}
            >
              {downloading === 'docx' ? (
                <LoaderCircle
                  aria-hidden="true"
                  className="animate-spin"
                  size={20}
                />
              ) : (
                <Download aria-hidden="true" size={20} />
              )}
              {downloading === 'docx'
                ? 'Preparando archivo…'
                : 'Descargar Word (.docx)'}
            </button>
          </article>
          <article className="agora-export-format flex flex-col rounded-3xl border border-[#dbe3f0] bg-white p-5 sm:p-6">
            <span className="grid size-12 place-items-center rounded-xl bg-[#fff0ec] text-[#d65b3f]">
              <FileText aria-hidden="true" size={23} />
            </span>
            <h2 className="mt-3 text-xl font-semibold text-[#20325e]">
              Documento PDF
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Para compartir o presentar tu documento.
            </p>
            <button
              className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-xl bg-[#1f3268] px-5 text-base font-semibold text-white transition-colors hover:bg-[#2864ef] disabled:cursor-wait disabled:opacity-60"
              disabled={downloading !== null}
              type="button"
              onClick={() => void exportDocument('pdf')}
            >
              {downloading === 'pdf' ? (
                <LoaderCircle
                  aria-hidden="true"
                  className="animate-spin"
                  size={20}
                />
              ) : (
                <Download aria-hidden="true" size={20} />
              )}
              {downloading === 'pdf' ? 'Preparando archivo…' : 'Descargar PDF'}
            </button>
          </article>
        </div>
        {downloadError ? (
          <p
            className="mt-5 rounded-xl bg-danger/10 p-4 text-center text-sm font-bold text-danger"
            role="alert"
          >
            {downloadError}
          </p>
        ) : null}

        <div className="agora-export-finish mt-4 flex flex-col items-center justify-between gap-4 rounded-2xl border border-[#dbe3f0] bg-white p-5 sm:flex-row">
          <p className="flex items-center gap-2 text-sm font-bold text-[#52617a]">
            <CheckCircle2
              aria-hidden="true"
              size={18}
              className="text-success"
            />{' '}
            Documento listo en{' '}
            {document.language === 'es' ? 'Español' : 'Inglés'}
          </p>
          <AgoraButton
            disabled={complete.isPending}
            onClick={() => void finish()}
          >
            {complete.isPending ? 'Finalizando…' : 'Finalizar proyecto'}
          </AgoraButton>
        </div>
        {complete.isError ? (
          <p
            className="mt-5 rounded-xl bg-danger/10 p-4 text-center text-sm font-bold text-danger"
            role="alert"
          >
            {complete.error.message}
          </p>
        ) : null}
      </div>
    </section>
  )
}
