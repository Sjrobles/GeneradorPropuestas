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
import {
  COMPONENT_STATUSES,
  COMPONENT_TYPES,
  PROJECT_STATES,
} from '@/types/domain'

import {
  componentRegistry,
  generationSequence,
} from '@/features/formulation/domain/component-registry'
import type { ComponentDraft } from '@/services/agents/contracts'
import { formulatorAgent } from '@/services/agents/formulator-agent'
import { translationAgent } from '@/services/agents/translation-agent'
import { documentAssembler } from '@/services/documents/document-assembler'
import { projectOrchestrator } from '@/services/orchestration/project-orchestrator'
import {
  validateComponent,
  validateComponents,
} from '@/services/validation/project-validator'

import type {
  AgoraApi,
  BudgetWorkbookDownload,
  CreateProjectInput,
  UpdateComponentInput,
} from './agora-api'

const STORAGE_KEY = 'agora.mock.v1.projects'
const CONTEXT_STORAGE_KEY = 'agora.mock.v1.contexts'
const EXECUTION_DETAILS_STORAGE_KEY = 'agora.mock.v1.execution-details'
const MESSAGE_STORAGE_KEY = 'agora.mock.v1.messages'
const COMPONENT_STORAGE_KEY = 'agora.mock.v1.components'
const DOCUMENT_STORAGE_KEY = 'agora.mock.v1.documents'
const MOCK_DELAY = import.meta.env.MODE === 'test' ? 0 : 350
const DIAGNOSIS_DELAY = import.meta.env.MODE === 'test' ? 0 : 1200
const COMPONENT_DELAY = import.meta.env.MODE === 'test' ? 0 : 420
const DOCUMENT_DELAY = import.meta.env.MODE === 'test' ? 0 : 1600

type ContextField = keyof Omit<ProjectContext, 'projectId'>

const contextQuestions: Array<{
  field: ContextField
  en: string
  es: string
}> = [
  {
    field: 'problem',
    es: 'Para comenzar, ¿qué problema o necesidad quieres resolver con este proyecto?',
    en: 'To begin, what problem or need do you want this project to address?',
  },
  {
    field: 'targetPopulation',
    es: '¿A qué población, comunidad u organización está dirigido?',
    en: 'Which population, community, or organization will benefit?',
  },
  {
    field: 'location',
    es: '¿Dónde se desarrollará el proyecto?',
    en: 'Where will the project take place?',
  },
  {
    field: 'proposedSolution',
    es: '¿Cuál es la solución que propones frente a ese problema?',
    en: 'What solution do you propose for that problem?',
  },
  {
    field: 'expectedResults',
    es: '¿Qué resultados concretos esperas alcanzar?',
    en: 'What concrete results do you expect to achieve?',
  },
  {
    field: 'objectiveCount',
    es: '¿Cuántos objetivos específicos quieres que tenga el proyecto? Indica un número exacto entre 2 y 5; Ágora generará exactamente esa cantidad.',
    en: 'How many specific objectives should the project have? Choose an exact number from 2 to 5.',
  },
  {
    field: 'initialScope',
    es: '¿Cuál es el alcance inicial y qué quedaría por fuera?',
    en: 'What is the initial scope and what is excluded?',
  },
  {
    field: 'projectDuration',
    es: 'Para cerrar el contexto, ¿cuál es la duración total prevista del proyecto? Indícala en semanas o meses y menciona si existe una fecha límite.',
    en: 'To complete the context, what is the total expected project duration? State it in weeks or months and mention any deadline.',
  },
]

function hasContextValue(context: ProjectContext, field: ContextField) {
  const value = context[field]
  if (field === 'objectiveCount') {
    return (
      typeof value === 'number' &&
      Number.isInteger(value) &&
      value >= 2 &&
      value <= 5
    )
  }
  return typeof value === 'string' && value.trim().length > 0
}

const skills: Skill[] = [
  {
    id: 'international-calls-banco-republica',
    name: 'Convocatorias internacionales y Banco de la República',
    description:
      'Estructura una propuesta orientada a oportunidades internacionales y convocatorias del Banco de la República.',
    icon: 'landmark',
    enabled: true,
  },
  {
    id: 'research-projects',
    name: 'Proyectos de investigación',
    description:
      'Acompañamiento especializado para iniciativas académicas y científicas.',
    icon: 'flask',
    enabled: false,
  },
  {
    id: 'social-innovation',
    name: 'Innovación social',
    description:
      'Formulación de soluciones colaborativas para retos sociales y territoriales.',
    icon: 'users',
    enabled: false,
  },
  {
    id: 'technology-transfer',
    name: 'Transferencia tecnológica',
    description:
      'Estructuración de iniciativas para llevar conocimiento y tecnología al entorno.',
    icon: 'blocks',
    enabled: false,
  },
]

function wait() {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, MOCK_DELAY)
  })
}

function waitForDiagnosis() {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, DIAGNOSIS_DELAY)
  })
}

function waitForComponent() {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, COMPONENT_DELAY)
  })
}

function waitForDocument() {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, DOCUMENT_DELAY)
  })
}

function readProjects(): Project[] {
  try {
    const serializedProjects = window.localStorage.getItem(STORAGE_KEY)
    return serializedProjects
      ? (JSON.parse(serializedProjects) as Project[])
      : []
  } catch {
    window.localStorage.removeItem(STORAGE_KEY)
    return []
  }
}

function writeProjects(projects: Project[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
}

export function synchronizeMockProject(project: Project) {
  const projects = readProjects()
  const projectIndex = projects.findIndex(
    (candidate) => candidate.id === project.id,
  )

  if (projectIndex >= 0) {
    projects[projectIndex] = project
  } else {
    projects.push(project)
  }

  writeProjects(projects)
}

function readContexts(): Record<string, ProjectContext> {
  try {
    return JSON.parse(
      window.localStorage.getItem(CONTEXT_STORAGE_KEY) ?? '{}',
    ) as Record<string, ProjectContext>
  } catch {
    window.localStorage.removeItem(CONTEXT_STORAGE_KEY)
    return {}
  }
}

function writeContexts(contexts: Record<string, ProjectContext>) {
  window.localStorage.setItem(CONTEXT_STORAGE_KEY, JSON.stringify(contexts))
}

function readExecutionDetails(): Record<string, ExecutionDetails> {
  try {
    return JSON.parse(
      window.localStorage.getItem(EXECUTION_DETAILS_STORAGE_KEY) ?? '{}',
    ) as Record<string, ExecutionDetails>
  } catch {
    window.localStorage.removeItem(EXECUTION_DETAILS_STORAGE_KEY)
    return {}
  }
}

function writeExecutionDetails(details: Record<string, ExecutionDetails>) {
  window.localStorage.setItem(
    EXECUTION_DETAILS_STORAGE_KEY,
    JSON.stringify(details),
  )
}

function readMessages(): Record<string, ChatMessage[]> {
  try {
    return JSON.parse(
      window.localStorage.getItem(MESSAGE_STORAGE_KEY) ?? '{}',
    ) as Record<string, ChatMessage[]>
  } catch {
    window.localStorage.removeItem(MESSAGE_STORAGE_KEY)
    return {}
  }
}

function writeMessages(messages: Record<string, ChatMessage[]>) {
  window.localStorage.setItem(MESSAGE_STORAGE_KEY, JSON.stringify(messages))
}

function readComponents(): Record<string, ProjectComponent[]> {
  try {
    const storedComponents = JSON.parse(
      window.localStorage.getItem(COMPONENT_STORAGE_KEY) ?? '{}',
    ) as Record<string, ProjectComponent[]>
    let normalizedLegacyStatuses = false

    for (const [projectId, components] of Object.entries(storedComponents)) {
      storedComponents[projectId] = components.map((component) => {
        const hasValidationErrors = component.validation?.warnings.some(
          ({ severity }) => severity === 'error',
        )
        if (
          component.status === COMPONENT_STATUSES.NEEDS_REVISION &&
          component.modifiedBy === 'ai' &&
          !hasValidationErrors
        ) {
          normalizedLegacyStatuses = true
          return { ...component, status: COMPONENT_STATUSES.GENERATED }
        }
        return component
      })
    }

    if (normalizedLegacyStatuses) writeComponents(storedComponents)
    return storedComponents
  } catch {
    window.localStorage.removeItem(COMPONENT_STORAGE_KEY)
    return {}
  }
}

function writeComponents(components: Record<string, ProjectComponent[]>) {
  window.localStorage.setItem(COMPONENT_STORAGE_KEY, JSON.stringify(components))
}

export function synchronizeMockComponents(
  projectId: string,
  components: ProjectComponent[],
) {
  const storedComponents = readComponents()
  storedComponents[projectId] = components
  writeComponents(storedComponents)
}

function usesCurrentComponentComposition(components: ProjectComponent[]) {
  const expectedTypes = new Set(
    componentRegistry.map((definition) => definition.type),
  )
  return (
    components.length === componentRegistry.length &&
    components.every((component) => expectedTypes.has(component.type))
  )
}

function readDocuments(): Record<string, ProjectDocument> {
  try {
    return JSON.parse(
      window.localStorage.getItem(DOCUMENT_STORAGE_KEY) ?? '{}',
    ) as Record<string, ProjectDocument>
  } catch {
    window.localStorage.removeItem(DOCUMENT_STORAGE_KEY)
    return {}
  }
}

function writeDocuments(documents: Record<string, ProjectDocument>) {
  window.localStorage.setItem(DOCUMENT_STORAGE_KEY, JSON.stringify(documents))
}

function createId() {
  return globalThis.crypto?.randomUUID?.() ?? `project-${Date.now()}`
}

function createMessage(
  projectId: string,
  content: string,
  role: ChatMessage['role'],
  messageType: ChatMessage['messageType'],
): ChatMessage {
  return {
    id: createId(),
    projectId,
    content,
    role,
    messageType,
    createdAt: new Date().toISOString(),
  }
}

function updateStoredProject(
  projectId: string,
  update: (project: Project) => Project,
) {
  const projects = readProjects()
  const projectIndex = projects.findIndex((project) => project.id === projectId)

  if (projectIndex < 0) {
    throw new Error('No encontramos el proyecto solicitado.')
  }

  projects[projectIndex] = update(projects[projectIndex])
  writeProjects(projects)
  return projects[projectIndex]
}

export class MockAgoraApi implements AgoraApi {
  async listProjects() {
    await wait()
    return readProjects()
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
      .map((project) => ({ ...project }))
  }

  async listSkills() {
    await wait()
    return skills.map((skill) => ({ ...skill }))
  }

  async createProject(input: CreateProjectInput) {
    await wait()

    const selectedSkill = skills.find(
      (skill) => skill.id === input.selectedSkillId && skill.enabled,
    )

    if (!selectedSkill) {
      throw new Error('La skill seleccionada no está disponible.')
    }

    const now = new Date().toISOString()
    const project: Project = {
      id: createId(),
      fragmentRegenerationCount: 0,
      fullProjectRegenerationCount: 0,
      language: 'es',
      title: input.title.trim(),
      selectedSkillId: selectedSkill.id,
      state: PROJECT_STATES.LANGUAGE_SELECTED,
      progress: 8,
      createdAt: now,
      updatedAt: now,
    }

    writeProjects([...readProjects(), project])
    return project
  }

  async getProject(projectId: string) {
    await wait()
    const project = readProjects().find(
      (candidate) => candidate.id === projectId,
    )

    if (!project) {
      throw new Error('No encontramos el proyecto solicitado.')
    }

    return project
  }

  async selectLanguage(projectId: string, language: ProjectLanguage) {
    await wait()
    if (language !== 'es') {
      throw new Error(
        'La formulación de proyectos está disponible únicamente en español.',
      )
    }
    const projects = readProjects()
    const projectIndex = projects.findIndex(
      (candidate) => candidate.id === projectId,
    )

    if (projectIndex < 0) {
      throw new Error('No encontramos el proyecto solicitado.')
    }

    const updatedProject: Project = {
      ...projects[projectIndex],
      language: 'es',
      state: PROJECT_STATES.LANGUAGE_SELECTED,
      progress: 15,
      updatedAt: new Date().toISOString(),
    }

    projects[projectIndex] = updatedProject
    writeProjects(projects)
    return updatedProject
  }

  async getChatMessages(projectId: string) {
    await wait()
    await this.getProject(projectId)
    const storedMessages = readMessages()

    if (!storedMessages[projectId]) {
      const firstQuestion = contextQuestions[0].es
      storedMessages[projectId] = [
        createMessage(
          projectId,
          firstQuestion,
          'assistant',
          'clarification_question',
        ),
      ]
      writeMessages(storedMessages)
    }

    return storedMessages[projectId].map((message) => ({ ...message }))
  }

  async sendMessage(projectId: string, content: string) {
    await wait()
    await this.getProject(projectId)
    const trimmedContent = content.trim()

    const contexts = readContexts()
    const context = contexts[projectId] ?? { projectId }
    const currentQuestion = contextQuestions.find(
      ({ field }) => !hasContextValue(context, field),
    )

    if (!currentQuestion) {
      throw new Error('El contexto ya está completo y listo para diagnóstico.')
    }
    if (
      currentQuestion.field !== 'objectiveCount' &&
      trimmedContent.length < 3
    ) {
      throw new Error('Escribe una respuesta un poco más completa.')
    }

    if (currentQuestion.field === 'objectiveCount') {
      if (!/^[2-5]$/.test(trimmedContent)) {
        throw new Error('Indica un número exacto de objetivos entre 2 y 5.')
      }
      context.objectiveCount = Number(trimmedContent)
    } else {
      context[currentQuestion.field] = trimmedContent
    }
    contexts[projectId] = context
    writeContexts(contexts)

    const messages = readMessages()
    const projectMessages = messages[projectId] ?? []
    projectMessages.push(
      createMessage(projectId, trimmedContent, 'user', 'user_message'),
    )

    const nextQuestion = contextQuestions.find(
      ({ field }) => !hasContextValue(context, field),
    )
    projectMessages.push(
      createMessage(
        projectId,
        nextQuestion
          ? nextQuestion.es
          : 'Perfecto. Ya tengo el contexto esencial. Ahora revisemos su completitud y coherencia.',
        'assistant',
        nextQuestion ? 'clarification_question' : 'agent_message',
      ),
    )
    messages[projectId] = projectMessages
    writeMessages(messages)

    updateStoredProject(projectId, (storedProject) => ({
      ...storedProject,
      state: nextQuestion
        ? PROJECT_STATES.WAITING_CLARIFICATION
        : PROJECT_STATES.DIAGNOSING,
      progress: nextQuestion ? 18 + Object.keys(context).length * 2 : 30,
      updatedAt: new Date().toISOString(),
    }))

    return projectMessages.map((message) => ({ ...message }))
  }

  async getProjectContext(projectId: string) {
    await wait()
    await this.getProject(projectId)
    return { ...(readContexts()[projectId] ?? { projectId }) }
  }

  async updateProjectContext(
    projectId: string,
    input: Partial<Omit<ProjectContext, 'projectId'>>,
  ) {
    await wait()
    await this.getProject(projectId)
    const contexts = readContexts()
    const updatedContext: ProjectContext = {
      ...(contexts[projectId] ?? { projectId }),
      ...input,
      projectId,
    }
    contexts[projectId] = updatedContext
    writeContexts(contexts)
    return { ...updatedContext }
  }

  async getExecutionDetails(projectId: string) {
    await wait()
    await this.getProject(projectId)
    return { ...(readExecutionDetails()[projectId] ?? { projectId }) }
  }

  async updateExecutionDetails(
    projectId: string,
    input: Partial<Omit<ExecutionDetails, 'confirmedAt' | 'projectId'>>,
  ) {
    await wait()
    const project = await this.getProject(projectId)
    if (project.state !== PROJECT_STATES.WAITING_EXECUTION_DETAILS) {
      throw new Error(
        'Las respuestas operativas se habilitan después del agente de ideación.',
      )
    }
    const storage = readExecutionDetails()
    const updated: ExecutionDetails = {
      ...(storage[projectId] ?? { projectId }),
      ...input,
      confirmedAt: undefined,
      projectId,
    }
    storage[projectId] = updated
    writeExecutionDetails(storage)
    return { ...updated }
  }

  async confirmExecutionDetails(projectId: string) {
    await wait()
    const project = await this.getProject(projectId)
    if (project.state !== PROJECT_STATES.WAITING_EXECUTION_DETAILS) {
      throw new Error('El proyecto no está esperando estas respuestas.')
    }
    const details = readExecutionDetails()[projectId]
    const values = details
      ? Object.entries(details).filter(
          ([field]) => field !== 'confirmedAt' && field !== 'projectId',
        )
      : []
    if (
      values.length !== 9 ||
      values.some(([, value]) => typeof value !== 'string' || !value.trim())
    ) {
      throw new Error('Responde las nueve preguntas antes de continuar.')
    }
    const confirmedAt = new Date().toISOString()
    const storage = readExecutionDetails()
    storage[projectId] = { ...details, confirmedAt }
    writeExecutionDetails(storage)
    return updateStoredProject(projectId, (storedProject) =>
      projectOrchestrator.transition(
        storedProject,
        PROJECT_STATES.EXECUTION_DETAILS_CONFIRMED,
      ),
    )
  }

  async assembleDocument(projectId: string): Promise<ProjectDocument> {
    await wait()
    const project = await this.getProject(projectId)
    const storedDocuments = readDocuments()
    const storedDocument =
      storedDocuments[`${projectId}:es`] ??
      (storedDocuments[projectId]?.language === 'es'
        ? storedDocuments[projectId]
        : undefined)

    if (
      storedDocument &&
      (project.state === PROJECT_STATES.DOCUMENT_READY ||
        project.state === PROJECT_STATES.TRANSLATING ||
        project.state === PROJECT_STATES.COMPLETED)
    ) {
      return { ...storedDocument }
    }

    if (project.state !== PROJECT_STATES.WAITING_REVIEW) {
      throw new Error(
        'El proyecto debe estar en revisión antes de ensamblar el documento.',
      )
    }

    const assemblingProject = projectOrchestrator.transition(
      project,
      PROJECT_STATES.ASSEMBLING,
    )
    this.replaceStoredProject(assemblingProject)
    await waitForDocument()

    const document = documentAssembler.assemble(
      project,
      readComponents()[projectId] ?? [],
      'es',
    )
    const documents = readDocuments()
    documents[projectId] = document
    documents[`${projectId}:es`] = document
    writeDocuments(documents)
    this.replaceStoredProject({
      ...projectOrchestrator.transition(
        assemblingProject,
        PROJECT_STATES.DOCUMENT_READY,
      ),
      hasDocument: true,
    })
    return { ...document }
  }

  async completeProject(projectId: string): Promise<Project> {
    await wait()
    const project = await this.getProject(projectId)
    if (project.state === PROJECT_STATES.COMPLETED) return project
    return updateStoredProject(projectId, (storedProject) =>
      projectOrchestrator.transition(storedProject, PROJECT_STATES.COMPLETED),
    )
  }

  async approveComponent(
    projectId: string,
    componentId: string,
  ): Promise<ProjectComponent> {
    await wait()
    const storage = readComponents()
    const components = storage[projectId] ?? []
    const index = components.findIndex(
      (component) => component.id === componentId,
    )
    if (index < 0) throw new Error('No encontramos el componente solicitado.')
    if (
      components[index].status === COMPONENT_STATUSES.PENDING ||
      components[index].status === COMPONENT_STATUSES.GENERATING ||
      components[index].status === COMPONENT_STATUSES.ERROR
    ) {
      throw new Error('Este componente aún no está listo para aprobación.')
    }

    const approved: ProjectComponent = {
      ...components[index],
      status: COMPONENT_STATUSES.APPROVED,
      approvedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    components[index] = approved
    storage[projectId] = components
    writeComponents(storage)
    return { ...approved }
  }

  async confirmContext(projectId: string) {
    await wait()
    const diagnosis = await this.diagnoseContext(projectId)

    if (!diagnosis.complete) {
      throw new Error('Completa la información pendiente antes de continuar.')
    }

    return updateStoredProject(projectId, (project) => ({
      ...project,
      state: PROJECT_STATES.CONTEXT_CONFIRMED,
      progress: 38,
      updatedAt: new Date().toISOString(),
    }))
  }

  async diagnoseContext(projectId: string): Promise<DiagnosisResult> {
    await wait()
    await waitForDiagnosis()
    await this.getProject(projectId)
    const context = readContexts()[projectId] ?? { projectId }
    const missingFields = contextQuestions
      .filter(({ field }) => !hasContextValue(context, field))
      .map(({ field }) => field)
    const questions = contextQuestions
      .filter(({ field }) => missingFields.includes(field))
      .slice(0, 2)
      .map(({ field, es }, index) => ({
        id: `clarification-${index + 1}`,
        field,
        prompt: es,
      }))
    const complete = missingFields.length === 0

    updateStoredProject(projectId, (project) => ({
      ...project,
      state: complete
        ? PROJECT_STATES.CONTEXT_CONFIRMATION
        : PROJECT_STATES.WAITING_CLARIFICATION,
      progress: complete ? 34 : project.progress,
      updatedAt: new Date().toISOString(),
    }))

    return {
      complete,
      missingFields,
      questions,
      ambiguities: [],
      inconsistencies: [],
    }
  }

  async generateComponents(projectId: string): Promise<GenerationJob> {
    const generationId = crypto.randomUUID()
    await this.runComponentGeneration(projectId)
    return {
      generationId,
      projectId,
      status: 'accepted',
    }
  }

  async regenerateBudget(projectId: string): Promise<ProjectComponent> {
    const budget = readComponents()[projectId]?.find(
      ({ type }) => type === COMPONENT_TYPES.BUDGET,
    )
    if (!budget) throw new Error('No encontramos el presupuesto solicitado.')
    return this.regenerateComponent(projectId, budget.id)
  }

  downloadBudgetWorkbook(projectId: string): Promise<BudgetWorkbookDownload> {
    void projectId
    return Promise.reject(
      new Error(
        'La exportación Excel requiere ejecutar Ágora conectado al backend.',
      ),
    )
  }

  importBudgetWorkbook(
    projectId: string,
    file: File,
  ): Promise<ProjectComponent> {
    void projectId
    void file
    return Promise.reject(
      new Error(
        'La importación Excel requiere ejecutar Ágora conectado al backend.',
      ),
    )
  }

  async regenerateComponent(
    projectId: string,
    componentId: string,
  ): Promise<ProjectComponent> {
    await wait()
    const project = await this.getProject(projectId)
    if ((project.fragmentRegenerationCount ?? 0) >= 3) {
      throw new Error(
        'Ya utilizaste las tres regeneraciones de fragmentos disponibles para este proyecto.',
      )
    }
    const storage = readComponents()
    const components = storage[projectId] ?? []
    const index = components.findIndex(({ id }) => id === componentId)
    if (index < 0) throw new Error('No encontramos el componente solicitado.')
    const context = await this.getProjectContext(projectId)
    const executionDetails = await this.getExecutionDetails(projectId)
    const draft = formulatorAgent.generateComponent({
      context,
      executionDetails,
      existingDrafts: Object.fromEntries(
        components.map((component) => [
          component.type,
          { content: component.currentContent, type: component.type },
        ]),
      ),
      type: components[index].type,
    })
    const regenerated: ProjectComponent = {
      ...components[index],
      aiGeneratedContent: draft.content,
      approvedAt: undefined,
      currentContent: draft.content,
      modifiedBy: 'ai',
      status: COMPONENT_STATUSES.GENERATED,
      structuredContent: draft.structuredContent,
      updatedAt: new Date().toISOString(),
    }
    components[index] = regenerated
    storage[projectId] = components
    writeComponents(storage)
    updateStoredProject(projectId, (storedProject) => ({
      ...storedProject,
      fragmentRegenerationCount:
        (storedProject.fragmentRegenerationCount ?? 0) + 1,
      hasDocument: false,
      state: PROJECT_STATES.WAITING_REVIEW,
      updatedAt: new Date().toISOString(),
    }))
    return { ...regenerated }
  }

  async regenerateProject(projectId: string): Promise<Project> {
    await wait()
    const project = await this.getProject(projectId)
    if (!project.hasDocument && project.state !== PROJECT_STATES.COMPLETED) {
      throw new Error(
        'La regeneración completa se habilita después de finalizar el proyecto.',
      )
    }
    if ((project.fullProjectRegenerationCount ?? 0) >= 1) {
      throw new Error(
        'Ya utilizaste la única regeneración completa disponible para este proyecto.',
      )
    }
    const componentStorage = readComponents()
    componentStorage[projectId] = []
    writeComponents(componentStorage)
    const documents = readDocuments()
    delete documents[projectId]
    delete documents[`${projectId}:es`]
    delete documents[`${projectId}:en`]
    writeDocuments(documents)
    return updateStoredProject(projectId, (storedProject) => ({
      ...storedProject,
      fullProjectRegenerationCount: 1,
      hasDocument: false,
      progress: 60,
      state: PROJECT_STATES.EXECUTION_DETAILS_CONFIRMED,
      updatedAt: new Date().toISOString(),
    }))
  }

  async getComponent(
    projectId: string,
    componentId: string,
  ): Promise<ProjectComponent> {
    await wait()
    await this.getProject(projectId)
    const component = readComponents()[projectId]?.find(
      (candidate) => candidate.id === componentId,
    )
    if (!component) throw new Error('No encontramos el componente solicitado.')
    return { ...component }
  }

  async getComponents(projectId: string): Promise<ProjectComponent[]> {
    await wait()
    const project = await this.getProject(projectId)
    const storedComponents = readComponents()[projectId] ?? []

    if (
      storedComponents.length > 0 &&
      !usesCurrentComponentComposition(storedComponents) &&
      project.state === PROJECT_STATES.WAITING_REVIEW
    ) {
      this.replaceStoredProject({
        ...project,
        state: PROJECT_STATES.CONTEXT_CONFIRMED,
        progress: 38,
        updatedAt: new Date().toISOString(),
      })
      return this.runComponentGeneration(projectId)
    }

    return storedComponents.map((component) => ({
      ...component,
    }))
  }

  async getDocument(
    projectId: string,
    language: ProjectLanguage = 'es',
  ): Promise<ProjectDocument> {
    await wait()
    await this.getProject(projectId)
    const documents = readDocuments()
    const legacyDocument = documents[projectId]
    const document =
      documents[`${projectId}:${language}`] ??
      (legacyDocument?.language === language ? legacyDocument : undefined)
    if (!document) {
      throw new Error('El documento todavía no ha sido ensamblado.')
    }
    return {
      ...document,
      sections: document.sections.map((section) => ({ ...section })),
    }
  }

  async updateComponent(
    projectId: string,
    componentId: string,
    input: UpdateComponentInput,
  ): Promise<ProjectComponent> {
    await wait()
    const content = input.content.trim()
    if (content.length < 20) {
      throw new Error(
        'El componente necesita un contenido más completo antes de guardarse.',
      )
    }

    const storage = readComponents()
    const components = storage[projectId] ?? []
    const index = components.findIndex(
      (component) => component.id === componentId,
    )
    if (index < 0) throw new Error('No encontramos el componente solicitado.')

    const updated: ProjectComponent = {
      ...components[index],
      currentContent: content,
      modifiedBy: 'user',
      status: COMPONENT_STATUSES.MODIFIED,
      updatedAt: new Date().toISOString(),
    }
    updated.validation = validateComponent(updated)
    components[index] = updated
    storage[projectId] = components
    writeComponents(storage)
    const documents = readDocuments()
    if (
      documents[projectId] ||
      documents[`${projectId}:es`] ||
      documents[`${projectId}:en`]
    ) {
      delete documents[projectId]
      delete documents[`${projectId}:es`]
      delete documents[`${projectId}:en`]
      writeDocuments(documents)
      updateStoredProject(projectId, (project) => ({
        ...project,
        hasDocument: false,
        progress: 72,
        state: PROJECT_STATES.WAITING_REVIEW,
        updatedAt: new Date().toISOString(),
      }))
    }
    return { ...updated }
  }

  async translateDocument(
    projectId: string,
    targetLanguage: ProjectLanguage,
  ): Promise<ProjectDocument> {
    await wait()
    const project = await this.getProject(projectId)
    const document = await this.getDocument(projectId, 'es')
    if (
      project.state !== PROJECT_STATES.DOCUMENT_READY &&
      project.state !== PROJECT_STATES.TRANSLATING
    ) {
      throw new Error('El documento debe estar listo antes de traducirse.')
    }

    if (project.state === PROJECT_STATES.DOCUMENT_READY) {
      this.replaceStoredProject(
        projectOrchestrator.transition(project, PROJECT_STATES.TRANSLATING),
      )
    }
    await waitForDocument()
    const translated = translationAgent.translate(document, targetLanguage)
    const documents = readDocuments()
    documents[`${projectId}:en`] = translated
    writeDocuments(documents)
    return { ...translated }
  }

  async validateProject(projectId: string): Promise<ValidationResult> {
    await wait()
    await this.getProject(projectId)
    return validateComponents(readComponents()[projectId] ?? [])
  }

  private async runComponentGeneration(projectId: string) {
    await wait()
    const project = await this.getProject(projectId)
    const context = await this.getProjectContext(projectId)
    const executionDetails = await this.getExecutionDetails(projectId)
    const storage = readComponents()

    if (
      project.state === PROJECT_STATES.WAITING_REVIEW &&
      storage[projectId]?.length === componentRegistry.length
    ) {
      return storage[projectId].map((component) => ({ ...component }))
    }

    const generatingProject =
      project.state === PROJECT_STATES.CONTEXT_CONFIRMED ||
      project.state === PROJECT_STATES.EXECUTION_DETAILS_CONFIRMED
        ? projectOrchestrator.transition(
            project,
            PROJECT_STATES.GENERATING_COMPONENTS,
            Math.max(project.progress, 42),
          )
        : project

    if (generatingProject.state !== PROJECT_STATES.GENERATING_COMPONENTS) {
      throw new Error(
        'El proyecto debe tener el contexto confirmado antes de generar componentes.',
      )
    }
    this.replaceStoredProject(generatingProject)

    const now = new Date().toISOString()
    const components = usesCurrentComponentComposition(storage[projectId] ?? [])
      ? storage[projectId]
      : componentRegistry.map<ProjectComponent>((definition) => ({
          id: `${projectId}-${definition.type}`,
          projectId,
          type: definition.type,
          aiGeneratedContent: '',
          currentContent: '',
          status: COMPONENT_STATUSES.PENDING,
          modifiedBy: 'ai',
          createdAt: now,
          updatedAt: now,
        }))
    storage[projectId] = components
    writeComponents(storage)

    const drafts: Partial<Record<ProjectComponent['type'], ComponentDraft>> = {}

    const ideationEnd = generationSequence.indexOf(COMPONENT_TYPES.SCHEDULE)
    const activeSequence =
      project.state === PROJECT_STATES.CONTEXT_CONFIRMED
        ? generationSequence.slice(0, ideationEnd + 1)
        : generationSequence.slice(ideationEnd + 1)

    for (const type of activeSequence) {
      const componentIndex = components.findIndex(
        (component) => component.type === type,
      )
      components[componentIndex] = {
        ...components[componentIndex],
        status: COMPONENT_STATUSES.GENERATING,
        updatedAt: new Date().toISOString(),
      }
      storage[projectId] = components
      writeComponents(storage)
      await waitForComponent()

      const draft = formulatorAgent.generateComponent({
        type,
        context,
        executionDetails,
        existingDrafts: drafts,
      })
      drafts[type] = draft
      const generated: ProjectComponent = {
        ...components[componentIndex],
        aiGeneratedContent: draft.content,
        currentContent: draft.content,
        structuredContent: draft.structuredContent,
        status: COMPONENT_STATUSES.GENERATED,
        updatedAt: new Date().toISOString(),
      }
      generated.validation = validateComponent(generated)
      components[componentIndex] = generated
      storage[projectId] = components
      writeComponents(storage)

      this.replaceStoredProject({
        ...generatingProject,
        progress:
          42 +
          Math.round(
            (components.filter(
              ({ status }) => status !== COMPONENT_STATUSES.PENDING,
            ).length /
              generationSequence.length) *
              24,
          ),
        updatedAt: new Date().toISOString(),
      })
    }

    if (project.state === PROJECT_STATES.CONTEXT_CONFIRMED) {
      this.replaceStoredProject(
        projectOrchestrator.transition(
          { ...generatingProject, progress: 58 },
          PROJECT_STATES.WAITING_EXECUTION_DETAILS,
        ),
      )
      return components.map((component) => ({ ...component }))
    }

    const validatingProject = projectOrchestrator.transition(
      { ...generatingProject, progress: 66 },
      PROJECT_STATES.VALIDATING_COMPONENTS,
    )
    this.replaceStoredProject(validatingProject)
    const validation = validateComponents(components)
    if (!validation.valid) {
      throw new Error(
        'La generación terminó con errores estructurales que requieren revisión.',
      )
    }
    this.replaceStoredProject(
      projectOrchestrator.transition(
        validatingProject,
        PROJECT_STATES.WAITING_REVIEW,
      ),
    )
    return components.map((component) => ({ ...component }))
  }

  private replaceStoredProject(project: Project) {
    const projects = readProjects()
    const index = projects.findIndex((candidate) => candidate.id === project.id)
    if (index < 0) throw new Error('No encontramos el proyecto solicitado.')
    projects[index] = project
    writeProjects(projects)
  }
}
