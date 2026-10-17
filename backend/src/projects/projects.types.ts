import type { ProjectLanguage, ProjectState } from './domain/project.constants'
import type {
  StoredChatMessage,
  StoredConsolidatedDocument,
  StoredProjectComponent,
  StoredProjectContext,
  StoredExecutionDetails,
  StoredGenerationJob,
} from './schemas/project.schema'

export interface ProjectResponse {
  createdAt: string
  fragmentRegenerationCount: number
  fullProjectRegenerationCount: number
  generationJob?: Omit<
    StoredGenerationJob,
    'completedAt' | 'startedAt' | 'updatedAt'
  > & {
    completedAt?: string
    startedAt: string
    updatedAt: string
  }
  id: string
  hasDocument: boolean
  language?: ProjectLanguage
  progress: number
  selectedSkillId: string
  state: ProjectState
  title: string
  updatedAt: string
}

export interface ProjectDocumentResponse extends Omit<
  StoredConsolidatedDocument,
  'generatedAt'
> {
  generatedAt: string
}

export interface ChatMessageResponse extends Omit<
  StoredChatMessage,
  'createdAt'
> {
  createdAt: string
  projectId: string
}

export interface ProjectContextResponse extends StoredProjectContext {
  projectId: string
}

export interface ExecutionDetailsResponse extends StoredExecutionDetails {
  confirmedAt?: string
  projectId: string
}

export interface DiagnosisResponse {
  ambiguities: string[]
  complete: boolean
  inconsistencies: string[]
  missingFields: Array<keyof StoredProjectContext>
  questions: Array<{
    field: keyof StoredProjectContext
    id: string
    prompt: string
  }>
}

export interface ProjectComponentResponse extends Omit<
  StoredProjectComponent,
  'approvedAt' | 'createdAt' | 'updatedAt'
> {
  approvedAt?: string
  createdAt: string
  projectId: string
  updatedAt: string
}
