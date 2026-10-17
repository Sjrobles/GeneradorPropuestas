import { z } from 'zod'

export const projectSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'Escribe un nombre de al menos 3 caracteres.')
    .max(80, 'Utiliza máximo 80 caracteres.'),
})

export type ProjectFormValues = z.infer<typeof projectSchema>
