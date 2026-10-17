import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import {
  PROJECT_LANGUAGES,
  PROJECT_STATES,
  type ProjectLanguage,
  type ProjectState,
} from '../domain/project.constants'
import type { FormulationAgentOutput } from '../../orchestration/contracts/agent-output.schemas'
import type {
  FormulationAgent,
  FormulationComponent,
} from '../../orchestration/domain/formulation.constants'

export interface StoredChatMessage {
  content: string
  createdAt: Date
  id: string
  messageType:
    | 'user_message'
    | 'agent_message'
    | 'clarification_question'
    | 'system_event'
  role: 'user' | 'assistant' | 'system'
}

export interface StoredProjectContext {
  expectedResults?: string
  initialScope?: string
  location?: string
  objectiveCount?: number
  problem?: string
  projectDuration?: string
  proposedSolution?: string
  targetPopulation?: string
}

export interface StoredExecutionDetails {
  activityDevelopment?: string
  participants?: string
  locationsAndParticipants?: string
  requiredResources?: string
  timelineAndDependencies?: string
  expectedDeliverables?: string
  verificationMethods?: string
  knownEconomicInformation?: string
  specialConditions?: string
}

export interface StoredDiagnosis {
  ambiguities: string[]
  analyzedAt: Date
  complete: boolean
  inconsistencies: string[]
  missingFields: Array<keyof StoredProjectContext>
  questions: Array<{
    field: keyof StoredProjectContext
    id: string
    prompt: string
  }>
}

export interface StoredProjectComponent {
  agent: FormulationAgent
  aiGeneratedContent: string
  approvedAt?: Date
  createdAt: Date
  currentContent: string
  id: string
  modifiedBy: 'ai' | 'user'
  status:
    | 'pending'
    | 'generating'
    | 'generated'
    | 'needs_revision'
    | 'approved'
    | 'error'
  structuredContent?: unknown
  type: FormulationComponent
  updatedAt: Date
}

export interface StoredGenerationJob {
  activeAgent?: FormulationAgent
  completedAt?: Date
  errorCode?: string
  errorMessage?: string
  id: string
  startedAt: Date
  status: 'processing' | 'completed' | 'failed' | 'interrupted'
  updatedAt: Date
}

export interface StoredDocumentSection {
  componentId: string
  content: string
  id: string
  order: number
  title: string
}

export interface StoredConsolidatedDocument {
  content: string
  generatedAt: Date
  id: string
  language: ProjectLanguage
  projectId: string
  sections: StoredDocumentSection[]
  status: 'ready'
  title: string
  translatedFrom?: ProjectLanguage
}

export type ProjectDocument = HydratedDocument<Project>

@Schema({ collection: 'projects', timestamps: true, versionKey: false })
export class Project {
  @Prop({ type: String, required: true, index: true })
  ownerId!: string

  @Prop({ type: String, trim: true, maxlength: 160, required: true })
  title!: string

  @Prop({
    type: String,
    trim: true,
    maxlength: 80,
    required: true,
    index: true,
  })
  selectedSkillId!: string

  @Prop({ type: String, enum: PROJECT_LANGUAGES })
  language?: ProjectLanguage

  @Prop({
    type: String,
    enum: Object.values(PROJECT_STATES),
    default: PROJECT_STATES.CREATED,
    required: true,
    index: true,
  })
  state!: ProjectState

  @Prop({ type: Number, min: 0, max: 100, default: 0, required: true })
  progress!: number

  @Prop({ type: Object, default: {} })
  context!: StoredProjectContext

  @Prop({ type: Object, default: {} })
  executionDetails!: StoredExecutionDetails

  @Prop({ type: Date })
  executionDetailsConfirmedAt?: Date

  @Prop({ type: Array, default: [] })
  messages!: StoredChatMessage[]

  @Prop({ type: Object })
  diagnosis?: StoredDiagnosis

  @Prop({ type: Array, default: [] })
  components!: StoredProjectComponent[]

  @Prop({ type: Object, default: {} })
  agentOutputs!: Partial<Record<FormulationAgent, FormulationAgentOutput>>

  @Prop({ type: Object })
  document?: StoredConsolidatedDocument

  @Prop({ type: Object, default: {} })
  documentVersions!: Partial<
    Record<ProjectLanguage, StoredConsolidatedDocument>
  >

  @Prop({ type: String, trim: true })
  generationVersion?: string

  @Prop({ type: Object })
  generationJob?: StoredGenerationJob

  @Prop({ type: Number, min: 0, max: 3, default: 0, required: true })
  fragmentRegenerationCount!: number

  @Prop({ type: Number, min: 0, max: 1, default: 0, required: true })
  fullProjectRegenerationCount!: number

  createdAt!: Date
  updatedAt!: Date
}

export const ProjectSchema = SchemaFactory.createForClass(Project)
