import type {
  ChatMessage,
  DiagnosisResult,
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

export interface AgoraApi {
  assembleDocument(projectId: string): Promise<ProjectDocument>
  approveComponent(
    projectId: string,
    componentId: string,
  ): Promise<ProjectComponent>
  createProject(input: CreateProjectInput): Promise<Project>
  confirmContext(projectId: string): Promise<Project>
  diagnoseContext(projectId: string): Promise<DiagnosisResult>
  generateComponents(projectId: string): Promise<ProjectComponent[]>
  getComponent(
    projectId: string,
    componentId: string,
  ): Promise<ProjectComponent>
  getComponents(projectId: string): Promise<ProjectComponent[]>
  getProject(projectId: string): Promise<Project>
  getProjectContext(projectId: string): Promise<ProjectContext>
  listSkills(): Promise<Skill[]>
  sendMessage(projectId: string, content: string): Promise<ChatMessage[]>
  selectLanguage(projectId: string, language: ProjectLanguage): Promise<Project>
  updateComponent(
    projectId: string,
    componentId: string,
    input: UpdateComponentInput,
  ): Promise<ProjectComponent>
  updateProjectContext(
    projectId: string,
    input: Partial<Omit<ProjectContext, 'projectId'>>,
  ): Promise<ProjectContext>
  translateDocument(
    projectId: string,
    targetLanguage: ProjectLanguage,
  ): Promise<ProjectDocument>
  validateProject(projectId: string): Promise<ValidationResult>
}
