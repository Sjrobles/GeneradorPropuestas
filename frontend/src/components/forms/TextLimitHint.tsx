export function TextLimitHint({
  length,
  limit,
}: {
  length: number
  limit: number
}) {
  return (
    <span
      className={`mt-2 block text-xs ${length >= limit ? 'font-semibold text-primary' : 'text-muted-foreground'}`}
    >
      {length.toLocaleString('es-CO')} / {limit.toLocaleString('es-CO')}{' '}
      caracteres{length >= limit ? '. Alcanzaste el límite de este campo.' : ''}
    </span>
  )
}
