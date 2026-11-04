import { BadRequestException } from '@nestjs/common'
import type { ValidationError } from 'class-validator'

const labels: Record<string, string> = {
  content: 'Respuesta',
  problem: 'Problema o necesidad',
  initialScope: 'Alcance inicial',
  targetPopulation: 'Población beneficiaria',
  location: 'Ubicación',
  proposedSolution: 'Solución propuesta',
  expectedResults: 'Resultados esperados',
  projectDuration: 'Duración del proyecto',
  activityDevelopment: 'Desarrollo de actividades',
  participants: 'Participantes',
  locationsAndParticipants: 'Lugares y población',
  requiredResources: 'Recursos necesarios',
  timelineAndDependencies: 'Tiempos y dependencias',
  expectedDeliverables: 'Entregables',
  verificationMethods: 'Verificación',
  knownEconomicInformation: 'Información económica',
  specialConditions: 'Condiciones especiales',
  title: 'Título',
  name: 'Nombre',
  email: 'Correo electrónico',
  password: 'Contraseña',
  language: 'Idioma',
}

export function validationException(
  errors: ValidationError[],
): BadRequestException {
  const messages = errors.flatMap((error) => {
    const label = labels[error.property] ?? 'Este campo'
    return Object.entries(error.constraints ?? {}).map(([rule, detail]) => {
      const numbers = detail.replace(/(\d)\.(?=\d{3})/g, '$1').match(/\d+/g)
      const limit = numbers?.[numbers.length - 1]
      if (rule === 'maxLength')
        return `${label}: admite máximo ${Number(limit).toLocaleString('es-CO')} caracteres. Reduce el texto y vuelve a intentarlo.`
      if (rule === 'minLength')
        return `${label}: escribe al menos ${limit ?? '3'} caracteres.`
      if (rule === 'isEmail') return 'Escribe un correo electrónico válido.'
      if (rule === 'isString')
        return `${label}: introduce una respuesta de texto.`
      if (rule === 'isNotEmpty')
        return `${label}: completa la respuesta antes de continuar.`
      return `${label}: revisa el valor e inténtalo nuevamente.`
    })
  })
  return new BadRequestException({
    message: messages.length
      ? messages
      : ['Revisa los campos indicados antes de continuar.'],
    error: 'Datos por corregir',
    statusCode: 400,
  })
}
