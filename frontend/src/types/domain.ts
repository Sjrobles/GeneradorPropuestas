export const PROJECT_LANGUAGES = ['es', 'en'] as const
export type ProjectLanguage = (typeof PROJECT_LANGUAGES)[number]

export const PROJECT_STATES = {
  CREATED: 'created',
  LANGUAGE_SELECTED: 'language_selected',
  COLLECTING_CONTEXT: 'collecting_context',
  DIAGNOSING: 'diagnosing',
  WAITING_CLARIFICATION: 'waiting_clarification',
  CONTEXT_CONFIRMATION: 'context_confirmation',
  CONTEXT_CONFIRMED: 'context_confirmed',
  GENERATING_COMPONENTS: 'generating_components',
  VALIDATING_COMPONENTS: 'validating_components',
  WAITING_REVIEW: 'waiting_review',
  ASSEMBLING: 'assembling',
  DOCUMENT_READY: 'document_ready',
  TRANSLATING: 'translating',
  COMPLETED: 'completed',
  ERROR: 'error',
} as const
export type ProjectState = (typeof PROJECT_STATES)[keyof typeof PROJECT_STATES]

export const COMPONENT_TYPES = {
  EXECUTIVE_SUMMARY: 'executive_summary',
  GENERAL_OBJECTIVE: 'general_objective',
  SPECIFIC_OBJECTIVES: 'specific_objectives',
  PROBLEM_STATEMENT: 'problem_statement',
  THEORETICAL_FRAMEWORK: 'theoretical_framework',
  STATE_OF_ART: 'state_of_art',
  EXPECTED_IMPACTS: 'expected_impacts',
  BENEFICIARY_POPULATION: 'beneficiary_population',
  SUSTAINABILITY: 'sustainability',
  METHODOLOGY: 'methodology',
} as const
export type ComponentType =
  (typeof COMPONENT_TYPES)[keyof typeof COMPONENT_TYPES]

export const COMPONENT_STATUSES = {
  PENDING: 'pending',
  GENERATING: 'generating',
  GENERATED: 'generated',
  VALIDATED: 'validated',
  NEEDS_REVISION: 'needs_revision',
  MODIFIED: 'modified',
  APPROVED: 'approved',
  ERROR: 'error',
} as const
export type ComponentStatus =
  (typeof COMPONENT_STATUSES)[keyof typeof COMPONENT_STATUSES]

export interface Skill {
  description: string
  enabled: boolean
  icon?: string
  id: string
  name: string
}

export interface Project {
  createdAt: string
  id: string
  language?: ProjectLanguage
  progress: number
  selectedSkillId: string
  state: ProjectState
  title: string
  updatedAt: string
}

export interface ProjectContext {
  expectedResults?: string
  initialScope?: string
  location?: string
  problem?: string
  projectId: string
  proposedSolution?: string
  provisionalTitle?: string
  sector?: string
  targetPopulation?: string
}

export interface ChatMessage {
  content: string
  createdAt: string
  id: string
  messageType:
    'user_message' | 'agent_message' | 'clarification_question' | 'system_event'
  projectId: string
  role: 'user' | 'assistant' | 'system'
}

export interface ClarificationQuestion {
  field: keyof Omit<ProjectContext, 'projectId'>
  id: string
  prompt: string
}

export interface DiagnosisResult {
  ambiguities: string[]
  complete: boolean
  inconsistencies: string[]
  missingFields: Array<keyof Omit<ProjectContext, 'projectId'>>
  questions: ClarificationQuestion[]
}

export interface ValidationWarning {
  code: string
  component?: ComponentType
  message: string
  severity: 'info' | 'warning' | 'error'
}

export interface ValidationResult {
  score?: number
  valid: boolean
  warnings: ValidationWarning[]
}

export interface ProjectComponent {
  aiGeneratedContent: string
  approvedAt?: string
  currentContent: string
  id: string
  projectId: string
  status: ComponentStatus
  type: ComponentType
  updatedAt: string
  validation?: ValidationResult
}

export interface MethodologyActivity {
  description: string
  id: string
  relatedObjectiveIds: string[]
}

export interface MethodologyPhase {
  activities: MethodologyActivity[]
  description: string
  expectedOutputs: string[]
  name: string
  order: number
  relatedObjectiveIds: string[]
}

export interface Methodology {
  narrative: string
  phases: MethodologyPhase[]
}

export interface ProjectDocument {
  content: string
  generatedAt: string
  id: string
  language: ProjectLanguage
  projectId: string
  status: 'assembling' | 'ready' | 'error'
}
