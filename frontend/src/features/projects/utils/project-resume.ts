import type { Project } from '@/types/domain'

export function projectResume(project: Project) {
  const root = `/projects/${project.id}`
  if (project.hasDocument)
    return {
      to: `${root}/document`,
      label: 'Abrir documento',
      stage:
        project.state === 'completed' ? 'Finalizado' : 'Documento disponible',
    }
  switch (project.state) {
    case 'created':
      return {
        to: `${root}/language`,
        label: 'Continuar proyecto',
        stage: 'Preparación',
      }
    case 'language_selected':
    case 'collecting_context':
    case 'diagnosing':
    case 'waiting_clarification':
      return {
        to: `${root}/chat`,
        label: 'Continuar contexto',
        stage: 'Contexto en curso',
      }
    case 'context_confirmation':
      return {
        to: `${root}/context`,
        label: 'Revisar contexto',
        stage: 'Contexto por confirmar',
      }
    case 'waiting_execution_details':
      return {
        to: `${root}/execution-details`,
        label: 'Continuar metodología',
        stage: 'Detalles de ejecución',
      }
    case 'waiting_review':
    case 'validating_components':
      return {
        to: `${root}/review`,
        label: 'Continuar revisión',
        stage: 'Revisión en curso',
      }
    case 'assembling':
      return {
        to: `${root}/document/assemble`,
        label: 'Continuar ensamblaje',
        stage: 'Ensamblando documento',
      }
    default:
      return {
        to: `${root}/generation`,
        label:
          project.state === 'error'
            ? 'Retomar generación'
            : 'Continuar formulación',
        stage:
          project.state === 'error'
            ? 'Requiere atención'
            : 'Formulación en curso',
      }
  }
}
