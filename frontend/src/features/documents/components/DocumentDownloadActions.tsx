import { Download, LoaderCircle } from 'lucide-react'
import { useState } from 'react'
import type { ProjectDocument } from '@/types/domain'

export function DocumentDownloadActions({
  document,
}: {
  document: ProjectDocument
}) {
  const [format, setFormat] = useState<'pdf' | 'docx' | null>(null)
  const [error, setError] = useState('')
  const download = async (requested: 'pdf' | 'docx') => {
    if (format) return
    setFormat(requested)
    setError('')
    try {
      const { downloadProjectDocument } =
        await import('@/services/documents/document-download')
      await downloadProjectDocument(document, requested)
    } catch {
      setError(
        'No pudimos generar el archivo. Tu documento se conserva; inténtalo nuevamente.',
      )
    } finally {
      setFormat(null)
    }
  }
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {(['pdf', 'docx'] as const).map((requested) => (
          <button
            key={requested}
            type="button"
            disabled={format !== null}
            onClick={() => void download(requested)}
            className={`inline-flex min-h-12 items-center gap-2 rounded-xl px-5 text-sm font-bold disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary ${requested === 'pdf' ? 'bg-primary text-white hover:bg-[#203590]' : 'bg-[#1f3268] text-white hover:bg-[#263f7c]'}`}
          >
            {format === requested ? (
              <LoaderCircle
                size={17}
                className="animate-spin"
                aria-hidden="true"
              />
            ) : (
              <Download size={17} aria-hidden="true" />
            )}
            {format === requested
              ? 'Preparando archivo…'
              : requested === 'pdf'
                ? 'Descargar PDF'
                : 'Descargar Word (.docx)'}
          </button>
        ))}
      </div>
      {error ? (
        <p role="alert" className="mt-2 max-w-md text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  )
}
