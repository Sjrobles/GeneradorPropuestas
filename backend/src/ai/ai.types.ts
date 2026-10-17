export interface ContextReplyInput {
  answer: string
  currentFieldLabel: string
  fallback: string
  language: 'es' | 'en'
  nextFieldLabel?: string
  projectTitle: string
  safetyIdentifier: string
}

export const DIAGNOSIS_CONTEXT_FIELDS = [
  'problem',
  'targetPopulation',
  'location',
  'proposedSolution',
  'expectedResults',
  'objectiveCount',
  'initialScope',
  'projectDuration',
] as const

export type DiagnosisContextField = (typeof DIAGNOSIS_CONTEXT_FIELDS)[number]

export interface ContextDiagnosisInput {
  context: Record<DiagnosisContextField, number | string>
  language: 'es' | 'en'
  projectTitle: string
  safetyIdentifier: string
}

export interface ComponentRegenerationInput {
  componentLabel: string
  context: object
  currentContent: string
  executionDetails?: object
  projectTitle: string
  safetyIdentifier: string
}

export interface AiContextDiagnosis {
  ambiguities: string[]
  inconsistencies: string[]
  questions: Array<{
    field: DiagnosisContextField
    id: string
    prompt: string
  }>
}

export interface DocumentTranslationInput {
  projectTitle: string
  safetyIdentifier: string
  sections: Array<{
    content: string
    id: string
  }>
}

export interface DocumentTranslationOutput {
  projectTitle: string
  sections: Array<{
    content: string
    id: string
  }>
}
