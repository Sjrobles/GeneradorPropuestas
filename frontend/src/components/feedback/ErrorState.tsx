import { AlertTriangle } from 'lucide-react'

import { AgoraButton } from '@/components/ui/agora-button'

interface ErrorStateProps {
  description: string
  onRetry?: () => void
  title?: string
}

export function ErrorState({
  description,
  onRetry,
  title = 'No pudimos cargar esta información',
}: ErrorStateProps) {
  return (
    <div
      className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-danger/20 bg-card p-8 text-center"
      role="alert"
    >
      <span className="grid size-12 place-items-center rounded-md bg-danger/10 text-danger">
        <AlertTriangle aria-hidden="true" size={24} />
      </span>
      <h2 className="mt-5 font-serif text-2xl font-bold">{title}</h2>
      <p className="mt-3 max-w-lg text-muted-foreground">{description}</p>
      {onRetry ? (
        <AgoraButton className="mt-6" variant="secondary" onClick={onRetry}>
          Intentar nuevamente
        </AgoraButton>
      ) : null}
    </div>
  )
}
