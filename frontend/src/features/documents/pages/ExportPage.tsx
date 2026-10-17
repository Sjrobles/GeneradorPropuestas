import {
  ArrowLeft,
  CheckCircle2,
  Download,
  FileText,
  FileType2,
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
    <section className="min-h-[calc(100dvh-var(--header-height))] bg-[#f4f7fb] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <Link
          className="inline-flex items-center gap-2 text-xs font-extrabold text-primary no-underline"
          to={`/projects/${projectId}/document?language=${requestedLanguage}`}
        >
          <ArrowLeft aria-hidden="true" size={15} /> Volver a la vista previa
        </Link>

        <header className="mt-8 text-center">
          <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20">
            <Download aria-hidden="true" size={27} />
          </span>
          <h1 className="mt-5 font-serif text-4xl font-bold text-[#1e315f] sm:text-5xl">
            Exporta tu borrador
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">
            Selecciona el formato que prefieras. Ambos archivos conservan la
            jerarquía, numeración y estructura consolidada del proyecto.
          </p>
        </header>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          <button
            className="group rounded-2xl border border-[#dbe3f0] bg-white p-7 text-left shadow-card transition hover:-translate-y-1 hover:border-primary"
            disabled={downloading !== null}
            type="button"
            onClick={() => void exportDocument('docx')}
          >
            <span className="grid size-12 place-items-center rounded-xl bg-[#eaf1ff] text-primary">
              <FileType2 aria-hidden="true" size={23} />
            </span>
            <h2 className="mt-5 text-xl font-extrabold text-[#20325e]">
              Descargar DOCX
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Versión editable para continuar el trabajo en un procesador de
              texto.
            </p>
            <span className="mt-5 inline-flex items-center gap-2 text-xs font-extrabold text-primary">
              <Download aria-hidden="true" size={15} />{' '}
              {downloading === 'docx'
                ? 'Generando DOCX…'
                : 'Generar documento editable'}
            </span>
          </button>
          <button
            className="group rounded-2xl border border-[#dbe3f0] bg-white p-7 text-left shadow-card transition hover:-translate-y-1 hover:border-primary"
            disabled={downloading !== null}
            type="button"
            onClick={() => void exportDocument('pdf')}
          >
            <span className="grid size-12 place-items-center rounded-xl bg-[#fff0ec] text-[#d65b3f]">
              <FileText aria-hidden="true" size={23} />
            </span>
            <h2 className="mt-5 text-xl font-extrabold text-[#20325e]">
              Descargar PDF
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Versión de lectura con la estructura consolidada del proyecto.
            </p>
            <span className="mt-5 inline-flex items-center gap-2 text-xs font-extrabold text-primary">
              <Download aria-hidden="true" size={15} />{' '}
              {downloading === 'pdf'
                ? 'Generando PDF…'
                : 'Generar PDF listo para presentar'}
            </span>
          </button>
        </div>
        {downloadError ? (
          <p
            className="mt-5 rounded-xl bg-danger/10 p-4 text-center text-sm font-bold text-danger"
            role="alert"
          >
            {downloadError}
          </p>
        ) : null}

        <div className="mt-7 flex flex-col items-center justify-between gap-4 rounded-2xl border border-[#dbe3f0] bg-white p-5 sm:flex-row">
          <p className="flex items-center gap-2 text-sm font-bold text-[#52617a]">
            <CheckCircle2
              aria-hidden="true"
              size={18}
              className="text-success"
            />{' '}
            Documento listo en {document.language.toUpperCase()}
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
