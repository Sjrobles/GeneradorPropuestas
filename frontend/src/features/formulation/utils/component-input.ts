export function componentTextLimit(type: string): number | undefined {
  return type === 'methodology' ? 10000 : undefined
}

export function componentInputError(
  content: string,
  type: string,
): string | undefined {
  if (content.trim().length < 20)
    return 'Escribe al menos 20 caracteres para guardar o aprobar el componente.'
  const limit = componentTextLimit(type)
  if (limit && content.length > limit)
    return 'La metodología admite máximo 10.000 caracteres. Resume el texto antes de guardarlo.'
  return undefined
}
