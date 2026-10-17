import { ArrowLeft, CheckCircle2, Languages, LoaderCircle } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router'

import { ErrorState } from '@/components/feedback/ErrorState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { AgoraButton } from '@/components/ui/agora-button'
import {
  useDocumentQuery,
  useTranslateDocumentMutation,
} from '@/features/documents/hooks/use-documents'

export function TranslationPage() {
  const { projectId = '' } = useParams()
  const navigate = useNavigate()
  const documentQuery = useDocumentQuery(projectId, 'es')
  const translate = useTranslateDocumentMutation(projectId)

  if (documentQuery.isPending)
    return <LoadingState label="Preparando la traducción…" />
  if (documentQuery.isError)
    return <ErrorState description="No pudimos preparar la traducción." />

  const runTranslation = async () => {
    await translate.mutateAsync('en')
    await navigate(`/projects/${projectId}/document?language=en`)
  }

  return (
    <section className="min-h-[calc(100dvh-var(--header-height))] bg-[#f4f7fb] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <Link
          className="inline-flex items-center gap-2 text-xs font-extrabold text-primary no-underline"
          to={`/projects/${projectId}/document`}
        >
          <ArrowLeft aria-hidden="true" size={15} /> Volver a la vista previa
        </Link>

        <div className="mt-8 overflow-hidden rounded-3xl border border-[#dbe3f0] bg-white shadow-card">
          <div className="bg-[linear-gradient(135deg,#1e315f,#3862e8)] px-7 py-10 text-white sm:px-10">
            <span className="grid size-14 place-items-center rounded-2xl bg-white/15">
              {translate.isPending ? (
                <LoaderCircle
                  className="animate-spin"
                  aria-hidden="true"
                  size={25}
                />
              ) : (
                <Languages aria-hidden="true" size={25} />
              )}
            </span>
            <p className="mt-6 text-xs font-extrabold uppercase tracking-[0.18em] text-[#bcd0ff]">
              TranslationAgent · traducción con IA
            </p>
            <h1 className="mt-3 font-serif text-4xl font-bold sm:text-5xl">
              Traducir al inglés
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-[#dbe6ff]">
              La estructura, los títulos y las enumeraciones se conservarán. La
              versión original seguirá guardada en el proyecto.
            </p>
          </div>

          <div className="p-7 sm:p-10">
            <div className="rounded-2xl border border-[#dbe3f0] p-5">
              <h2 className="font-extrabold text-[#20325e]">
                Antes de continuar
              </h2>
              <ul className="mt-4 space-y-3 text-sm text-[#5f6d84]">
                {[
                  'La versión original en español permanecerá disponible.',
                  'No se resumirá ni se agregará información.',
                  'Se conservarán los 13 apartados, tablas y formatos.',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <CheckCircle2
                      aria-hidden="true"
                      size={17}
                      className="text-success"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {translate.isError ? (
              <p
                className="mt-5 rounded-xl bg-danger/10 p-4 text-sm font-bold text-danger"
                role="alert"
              >
                {translate.error.message}
              </p>
            ) : null}

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <AgoraButton
                variant="secondary"
                onClick={() => void navigate(`/projects/${projectId}/export`)}
              >
                Omitir
              </AgoraButton>
              <AgoraButton
                disabled={translate.isPending}
                onClick={() => void runTranslation()}
              >
                {translate.isPending
                  ? 'Traduciendo documento…'
                  : 'Traducir al inglés'}
              </AgoraButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
