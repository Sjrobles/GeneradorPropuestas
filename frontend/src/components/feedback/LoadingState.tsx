import { LoaderCircle } from 'lucide-react'

interface LoadingStateProps {
  label?: string
}

export function LoadingState({
  label = 'Cargando información…',
}: LoadingStateProps) {
  return (
    <div
      className="flex min-h-64 flex-col items-center justify-center gap-4 rounded-lg border border-border bg-card p-8 text-center"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <LoaderCircle
        className="animate-spin text-primary"
        aria-hidden="true"
        size={30}
      />
      <p className="font-medium text-muted-foreground">{label}</p>
    </div>
  )
}
