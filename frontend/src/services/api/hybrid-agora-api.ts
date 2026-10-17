import type {
  ExecutionDetails,
  ProjectContext,
  ProjectLanguage,
} from '@/types/domain'

import type { CreateProjectInput } from './agora-api'
import { BackendAgoraApi } from './backend-agora-api'
import {
  MockAgoraApi,
  synchronizeMockComponents,
  synchronizeMockProject,
} from './mock-agora-api'

/**
 * Conecta únicamente los casos ya disponibles en el backend. El resto del
 * recorrido continúa en el simulador hasta que cada módulo tenga API propia.
 */
export class HybridAgoraApi extends MockAgoraApi {
  private readonly backend: BackendAgoraApi

  constructor(backend = new BackendAgoraApi()) {
    super()
    this.backend = backend
  }

  override listSkills() {
    return this.backend.listSkills()
  }

  override async createProject(input: CreateProjectInput) {
    const project = await this.backend.createProject(input)
    synchronizeMockProject(project)
    return project
  }

  override async getProject(projectId: string) {
    const remoteProject = await this.backend.getProject(projectId)
    synchronizeMockProject(remoteProject)
    return remoteProject
  }

  override listProjects() {
    return this.backend.listProjects()
  }

  override async selectLanguage(projectId: string, language: ProjectLanguage) {
    const project = await this.backend.selectLanguage(projectId, language)
    synchronizeMockProject(project)
    return project
  }

  override getChatMessages(projectId: string) {
    return this.backend.getChatMessages(projectId)
  }

  override sendMessage(projectId: string, content: string) {
    return this.backend.sendMessage(projectId, content)
  }

  override getProjectContext(projectId: string) {
    return this.backend.getProjectContext(projectId)
  }

  override updateProjectContext(
    projectId: string,
    input: Partial<Omit<ProjectContext, 'projectId'>>,
  ) {
    return this.backend.updateProjectContext(projectId, input)
  }

  override diagnoseContext(projectId: string) {
    return this.backend.diagnoseContext(projectId)
  }

  override async confirmContext(projectId: string) {
    const project = await this.backend.confirmContext(projectId)
    synchronizeMockProject(project)
    return project
  }

  override getExecutionDetails(projectId: string) {
    return this.backend.getExecutionDetails(projectId)
  }

  override updateExecutionDetails(
    projectId: string,
    input: Partial<Omit<ExecutionDetails, 'confirmedAt' | 'projectId'>>,
  ) {
    return this.backend.updateExecutionDetails(projectId, input)
  }

  override async confirmExecutionDetails(projectId: string) {
    const project = await this.backend.confirmExecutionDetails(projectId)
    synchronizeMockProject(project)
    return project
  }

  override async getComponents(projectId: string) {
    const components = await this.backend.getComponents(projectId)
    synchronizeMockComponents(projectId, components)
    return components
  }

  override async generateComponents(projectId: string) {
    const job = await this.backend.generateComponents(projectId)
    const project = await this.backend.getProject(projectId)
    synchronizeMockProject(project)
    return job
  }

  override async regenerateBudget(projectId: string) {
    const component = await this.backend.regenerateBudget(projectId)
    const components = await this.backend.getComponents(projectId)
    const project = await this.backend.getProject(projectId)
    synchronizeMockProject(project)
    synchronizeMockComponents(projectId, components)
    return component
  }

  override downloadBudgetWorkbook(projectId: string) {
    return this.backend.downloadBudgetWorkbook(projectId)
  }

  override async importBudgetWorkbook(projectId: string, file: File) {
    const component = await this.backend.importBudgetWorkbook(projectId, file)
    const [components, project] = await Promise.all([
      this.backend.getComponents(projectId),
      this.backend.getProject(projectId),
    ])
    synchronizeMockProject(project)
    synchronizeMockComponents(projectId, components)
    return component
  }

  override async regenerateComponent(projectId: string, componentId: string) {
    const component = await this.backend.regenerateComponent(
      projectId,
      componentId,
    )
    const [components, project] = await Promise.all([
      this.backend.getComponents(projectId),
      this.backend.getProject(projectId),
    ])
    synchronizeMockProject(project)
    synchronizeMockComponents(projectId, components)
    return component
  }

  override async regenerateProject(projectId: string) {
    const project = await this.backend.regenerateProject(projectId)
    synchronizeMockProject(project)
    synchronizeMockComponents(projectId, [])
    return project
  }

  override getComponent(projectId: string, componentId: string) {
    return this.backend.getComponent(projectId, componentId)
  }

  override updateComponent(
    projectId: string,
    componentId: string,
    input: { content: string },
  ) {
    return this.backend.updateComponent(projectId, componentId, input)
  }

  override approveComponent(projectId: string, componentId: string) {
    return this.backend.approveComponent(projectId, componentId)
  }

  override async assembleDocument(projectId: string) {
    const document = await this.backend.assembleDocument(projectId)
    const project = await this.backend.getProject(projectId)
    synchronizeMockProject(project)
    return document
  }

  override async getDocument(projectId: string, language?: ProjectLanguage) {
    try {
      return await this.backend.getDocument(projectId, language)
    } catch (error) {
      if (language === 'en') throw error
      try {
        return await this.backend.assembleDocument(projectId)
      } catch {
        throw error
      }
    }
  }

  override translateDocument(
    projectId: string,
    targetLanguage: ProjectLanguage,
  ) {
    return this.backend.translateDocument(projectId, targetLanguage)
  }

  override async completeProject(projectId: string) {
    const project = await this.backend.completeProject(projectId)
    synchronizeMockProject(project)
    return project
  }
}
