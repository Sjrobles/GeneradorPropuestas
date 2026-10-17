export const PROJECT_LANGUAGES = ['es', 'en'] as const
export type ProjectLanguage = (typeof PROJECT_LANGUAGES)[number]

export const PROJECT_STATES = {
  COLLECTING_CONTEXT: 'collecting_context',
  CREATED: 'created',
  DIAGNOSING: 'diagnosing',
  LANGUAGE_SELECTED: 'language_selected',
  WAITING_CLARIFICATION: 'waiting_clarification',
  CONTEXT_CONFIRMATION: 'context_confirmation',
  CONTEXT_CONFIRMED: 'context_confirmed',
  GENERATING_COMPONENTS: 'generating_components',
  WAITING_EXECUTION_DETAILS: 'waiting_execution_details',
  EXECUTION_DETAILS_CONFIRMED: 'execution_details_confirmed',
  WAITING_REVIEW: 'waiting_review',
  ASSEMBLING: 'assembling',
  DOCUMENT_READY: 'document_ready',
  TRANSLATING: 'translating',
  COMPLETED: 'completed',
  ERROR: 'error',
} as const
export type ProjectState = (typeof PROJECT_STATES)[keyof typeof PROJECT_STATES]
