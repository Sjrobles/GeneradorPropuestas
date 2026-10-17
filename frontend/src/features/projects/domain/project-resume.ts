import { PROJECT_STATES, type Project } from '@/types/domain'

export function getProjectResumePath(project: Project): string {
  const base = `/projects/${project.id}`
  switch (project.state) {
    case PROJECT_STATES.CREATED:
    case PROJECT_STATES.LANGUAGE_SELECTED:
    case PROJECT_STATES.COLLECTING_CONTEXT:
    case PROJECT_STATES.DIAGNOSING:
    case PROJECT_STATES.WAITING_CLARIFICATION:
      return `${base}/chat`
    case PROJECT_STATES.CONTEXT_CONFIRMATION:
      return `${base}/context`
    case PROJECT_STATES.WAITING_EXECUTION_DETAILS:
      return `${base}/execution-details`
    case PROJECT_STATES.WAITING_REVIEW:
    case PROJECT_STATES.VALIDATING_COMPONENTS:
      return `${base}/review`
    case PROJECT_STATES.ASSEMBLING:
      return `${base}/document/assemble`
    case PROJECT_STATES.DOCUMENT_READY:
    case PROJECT_STATES.TRANSLATING:
    case PROJECT_STATES.COMPLETED:
      return `${base}/document`
    case PROJECT_STATES.CONTEXT_CONFIRMED:
    case PROJECT_STATES.EXECUTION_DETAILS_CONFIRMED:
    case PROJECT_STATES.GENERATING_COMPONENTS:
    case PROJECT_STATES.ERROR:
    default:
      return `${base}/generation`
  }
}

export function isProjectComplete(project: Project): boolean {
  return (
    project.state === PROJECT_STATES.COMPLETED || Boolean(project.hasDocument)
  )
}
