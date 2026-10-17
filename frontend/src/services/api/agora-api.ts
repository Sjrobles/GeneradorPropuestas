import type {
  ChatMessage,
  DiagnosisResult,
  ExecutionDetails,
  GenerationJob,
  Project,
  ProjectComponent,
  ProjectContext,
  ProjectDocument,
  ProjectLanguage,
  Skill,
  ValidationResult,
} from '@/types/domain'

export interface CreateProjectInput {
  selectedSkillId: string
  title: string
}

export interface UpdateComponentInput {
  content: string
}

export interface BudgetWorkbookDownload {
  blob: Blob
  fileName: string
}

export interface AgoraApi {
  assembleDocument(projectId: string): Promise<ProjectDocument>
  approveComponent(
    projectId: string,
    componentId: string,
  ): Promise<ProjectComponent>
  createProject(input: CreateProjectInput): Promise<Project>
  confirmContext(projectId: string): Promise<Project>
  confirmExecutionDetails(projectId: string): Promise<Project>
  diagnoseContext(projectId: string): Promise<DiagnosisResult>
  downloadBudgetWorkbook(projectId: string): Promise<BudgetWorkbookDownload>
  generateComponents(projectId: string): Promise<GenerationJob>
  regenerateComponent(
    projectId: string,
    componentId: string,
  ): Promise<ProjectComponent>
  regenerateProject(projectId: string): Promise<Project>
  regenerateBudget(projectId: string): Promise<ProjectComponent>
  importBudgetWorkbook(projectId: string, file: File): Promise<ProjectComponent>
  getDocument(
    projectId: string,
    language?: ProjectLanguage,
  ): Promise<ProjectDocument>
  getExecutionDetails(projectId: string): Promise<ExecutionDetails>
  getComponent(
    projectId: string,
    componentId: string,
  ): Promise<ProjectComponent>
  getComponents(projectId: string): Promise<ProjectComponent[]>
  getChatMessages(projectId: string): Promise<ChatMessage[]>
  getProject(projectId: string): Promise<Project>
  getProjectContext(projectId: string): Promise<ProjectContext>
  listProjects(): Promise<Project[]>
  listSkills(): Promise<Skill[]>
  sendMessage(projectId: string, content: string): Promise<ChatMessage[]>
  selectLanguage(projectId: string, language: ProjectLanguage): Promise<Project>
  completeProject(projectId: string): Promise<Project>
  updateComponent(
    projectId: string,
    componentId: string,
    input: UpdateComponentInput,
  ): Promise<ProjectComponent>
  updateProjectContext(
    projectId: string,
    input: Partial<Omit<ProjectContext, 'projectId'>>,
  ): Promise<ProjectContext>
  updateExecutionDetails(
    projectId: string,
    input: Partial<Omit<ExecutionDetails, 'confirmedAt' | 'projectId'>>,
  ): Promise<ExecutionDetails>
  translateDocument(
    projectId: string,
    targetLanguage: ProjectLanguage,
  ): Promise<ProjectDocument>
  validateProject(projectId: string): Promise<ValidationResult>
}
