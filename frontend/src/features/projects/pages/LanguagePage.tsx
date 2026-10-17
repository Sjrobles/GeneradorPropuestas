import { ArrowRight, CheckCircle2, Languages } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router'

import { ErrorState } from '@/components/feedback/ErrorState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { AgoraButton } from '@/components/ui/agora-button'
import {
  useProjectQuery,
  useSelectLanguageMutation,
} from '@/features/projects/hooks/use-projects'

/** Compatibility screen for projects created before the Spanish-only flow. */
export function LanguagePage() {
  const navigate = useNavigate()
  const { projectId = '' } = useParams()
  const projectQuery = useProjectQuery(projectId)
  const selectLanguage = useSelectLanguageMutation()

  const handleContinue = async () => {
    if (projectQuery.data?.language !== 'es') {
      await selectLanguage.mutateAsync({ language: 'es', projectId })
    }
    await navigate(`/projects/${projectId}/chat`, { replace: true })
  }

  if (projectQuery.isPending) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <LoadingState label="Recuperando tu proyecto…" />
      </section>
    )
  }

  if (projectQuery.isError) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <ErrorState description={projectQuery.error.message} />
        <Link
          className="mt-6 inline-flex font-semibold text-primary"
          to="/skills"
        >
          Crear otro proyecto
        </Link>
      </section>
    )
  }

  return (
    <section className="mx-auto grid min-h-[calc(100vh-var(--header-height)-8rem)] max-w-4xl place-items-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full rounded-lg border border-border bg-card p-7 text-center shadow-card sm:p-11">
        <span className="mx-auto grid size-12 place-items-center rounded-md bg-secondary text-primary">
          <Languages aria-hidden="true" size={24} />
        </span>
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-primary">
          {projectQuery.data.title}
        </p>
        <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight">
          Formulación en español
        </h1>
        <p className="mx-auto mt-4 max-w-2xl leading-7 text-muted-foreground">
          La conversación, los agentes y los trece componentes se desarrollarán
          en español para conservar la coherencia del documento.
        </p>
        <div className="mx-auto mt-8 flex max-w-2xl items-start gap-3 rounded-md bg-muted p-4 text-left text-sm leading-6 text-muted-foreground">
          <CheckCircle2
            className="mt-0.5 shrink-0 text-success"
            aria-hidden="true"
            size={19}
          />
          Al finalizar podrás crear y exportar una traducción completa al inglés
          sin reemplazar la versión original.
        </div>

        {selectLanguage.isError ? (
          <p
            className="mx-auto mt-5 max-w-2xl rounded-md bg-danger/10 p-4 text-sm font-medium text-danger"
            role="alert"
          >
            {selectLanguage.error.message}
          </p>
        ) : null}

        <div className="mt-8 flex justify-center">
          <AgoraButton
            size="large"
            disabled={selectLanguage.isPending}
            onClick={() => void handleContinue()}
          >
            {selectLanguage.isPending
              ? 'Preparando proyecto…'
              : 'Continuar en español'}
            <ArrowRight aria-hidden="true" size={18} />
          </AgoraButton>
        </div>
      </div>
    </section>
  )
}
