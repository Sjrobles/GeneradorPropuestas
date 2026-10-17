import {
  BadRequestException,
  HttpException,
  Injectable,
  NotFoundException,
  OnModuleInit,
  ServiceUnavailableException,
} from '@nestjs/common'
import { randomUUID } from 'node:crypto'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { AiService } from '../ai/ai.service'
import {
  mapAgentOutputToComponents,
  mapBudgetToContent,
} from '../orchestration/application/agent-output.mapper'
import { ProjectOrchestratorService } from '../orchestration/application/project-orchestrator.service'
import type { ConfirmedProjectContext } from '../orchestration/application/orchestration.types'
import type { ExecutionDetails } from '../orchestration/application/orchestration.types'
import {
  AGENT_COMPONENTS,
  FORMULATION_COMPONENT_REGISTRY,
} from '../orchestration/domain/formulation.constants'
import { SkillsService } from '../skills/skills.service'
import { CreateProjectDto } from './dto/create-project.dto'
import {
  BUDGET_WORKBOOK_MAX_FILE_SIZE_BYTES,
  BudgetWorkbookService,
} from './budget-workbook.service'
import { UpdateProjectContextDto } from './dto/update-project-context.dto'
import { UpdateExecutionDetailsDto } from './dto/update-execution-details.dto'
import {
  PROJECT_STATES,
  type ProjectLanguage,
} from './domain/project.constants'
import {
  Project,
  type ProjectDocument,
  type StoredChatMessage,
  type StoredConsolidatedDocument,
  type StoredDiagnosis,
  type StoredExecutionDetails,
  type StoredProjectComponent,
  type StoredProjectContext,
} from './schemas/project.schema'
import type {
  ChatMessageResponse,
  DiagnosisResponse,
  ExecutionDetailsResponse,
  ProjectComponentResponse,
  ProjectContextResponse,
  ProjectDocumentResponse,
  ProjectResponse,
} from './projects.types'

type ContextField = keyof StoredProjectContext
type ExecutionDetailsField = keyof StoredExecutionDetails

const CURRENT_GENERATION_VERSION = 'agents-sdk-v5-language-aware'
const STALE_GENERATION_AFTER_MS = 45 * 60_000

const ENGLISH_DOCUMENT_TITLES: Partial<
  Record<(typeof FORMULATION_COMPONENT_REGISTRY)[number]['component'], string>
> = {
  activities: 'Activities',
  background: 'Background',
  beneficiaries: 'Beneficiaries',
  bibliography: 'Bibliography',
  budget: 'Budget',
  expected_impacts: 'Expected impacts',
  methodology: 'Methodology',
  problem_statement: 'Problem statement',
  risks: 'Risks',
  schedule: 'Schedule',
  smart_objectives: 'SMART objectives',
  state_of_art: 'State of the art',
  theoretical_framework: 'Theoretical framework',
}

const EXECUTION_DETAILS_FIELDS: ExecutionDetailsField[] = [
  'activityDevelopment',
  'participants',
  'locationsAndParticipants',
  'requiredResources',
  'timelineAndDependencies',
  'expectedDeliverables',
  'verificationMethods',
  'knownEconomicInformation',
  'specialConditions',
]

const CONTEXT_FIELDS: Array<{
  field: ContextField
  label: { en: string; es: string }
  question: { en: string; es: string }
}> = [
  {
    field: 'problem',
    label: { en: 'problem', es: 'problema' },
    question: {
      en: 'What problem or need do you want to solve?',
      es: '¿Qué problema o necesidad quieres resolver?',
    },
  },
  {
    field: 'targetPopulation',
    label: { en: 'target population', es: 'población beneficiaria' },
    question: {
      en: 'Who is affected by this problem or would benefit from the project?',
      es: '¿Quiénes son afectados por este problema o se beneficiarían del proyecto?',
    },
  },
  {
    field: 'location',
    label: { en: 'location', es: 'ubicación' },
    question: {
      en: 'Where will the project be implemented?',
      es: '¿En qué lugar se desarrollará el proyecto?',
    },
  },
  {
    field: 'proposedSolution',
    label: { en: 'proposed solution', es: 'solución propuesta' },
    question: {
      en: 'What solution or intervention do you propose?',
      es: '¿Qué solución o intervención propones?',
    },
  },
  {
    field: 'expectedResults',
    label: { en: 'expected results', es: 'resultados esperados' },
    question: {
      en: 'What concrete results do you expect to achieve?',
      es: '¿Qué resultados concretos esperas alcanzar?',
    },
  },
  {
    field: 'objectiveCount',
    label: {
      en: 'number of specific objectives',
      es: 'número de objetivos específicos',
    },
    question: {
      en: 'How many specific objectives should the project have? Choose an exact number from 2 to 5.',
      es: '¿Cuántos objetivos específicos quieres que tenga el proyecto? Indica un número exacto entre 2 y 5; Ágora generará exactamente esa cantidad.',
    },
  },
  {
    field: 'initialScope',
    label: { en: 'initial scope', es: 'alcance inicial' },
    question: {
      en: 'What is the initial scope and what will be left outside the project?',
      es: '¿Cuál será el alcance inicial y qué quedará por fuera del proyecto?',
    },
  },
  {
    field: 'projectDuration',
    label: { en: 'total project duration', es: 'duración total del proyecto' },
    question: {
      en: 'What is the total expected duration of the project? State it in weeks or months and mention any deadline.',
      es: '¿Cuál es la duración total prevista del proyecto? Indícala en semanas o meses y menciona si existe una fecha límite.',
    },
  },
]

function hasContextValue(
  context: StoredProjectContext,
  field: ContextField,
): boolean {
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

function normalizeContextAnswer(field: ContextField, answer: string) {
  if (field !== 'objectiveCount') return answer
  if (!/^[2-5]$/.test(answer)) {
    throw new BadRequestException(
      'Indica un número exacto de objetivos entre 2 y 5',
    )
  }
  return Number(answer)
}

function fileSafeName(value: string): string {
  return (
    value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase()
      .slice(0, 80) || 'proyecto'
  )
}

@Injectable()
export class ProjectsService implements OnModuleInit {
  constructor(
    @InjectModel(Project.name)
    private readonly projectModel: Model<Project>,
    private readonly skillsService: SkillsService,
    private readonly aiService: AiService,
    private readonly orchestrator: ProjectOrchestratorService,
    private readonly budgetWorkbook: BudgetWorkbookService,
  ) {}

  async onModuleInit(): Promise<void> {
    const interruptedAt = new Date()
    await this.projectModel
      .updateMany(
        {
          'components.status': 'generating',
          state: PROJECT_STATES.GENERATING_COMPONENTS,
        },
        {
          $set: {
            'components.$[component].status': 'error',
            'components.$[component].updatedAt': interruptedAt,
            'generationJob.status': 'interrupted',
            'generationJob.updatedAt': interruptedAt,
            state: PROJECT_STATES.ERROR,
          },
        },
        { arrayFilters: [{ 'component.status': 'generating' }] },
      )
      .exec()
    await this.projectModel
      .updateMany(
        { state: PROJECT_STATES.GENERATING_COMPONENTS },
        {
          $set: {
            'generationJob.status': 'interrupted',
            'generationJob.updatedAt': interruptedAt,
            state: PROJECT_STATES.ERROR,
          },
        },
      )
      .exec()
    await this.projectModel
      .updateMany(
        {
          'context.objectiveCount': { $exists: false },
          'context.projectDuration': { $exists: true },
        },
        { $set: { 'context.objectiveCount': 3 } },
      )
      .exec()
  }

  async create(
    ownerId: string,
    input: CreateProjectDto,
  ): Promise<ProjectResponse> {
    if (!this.skillsService.isEnabled(input.selectedSkillId)) {
      throw new BadRequestException('La skill seleccionada no está disponible')
    }

    const project = await this.projectModel.create({
      language: 'es',
      ownerId,
      progress: 8,
      selectedSkillId: input.selectedSkillId,
      state: PROJECT_STATES.LANGUAGE_SELECTED,
      title: input.title.trim(),
    })

    return this.toResponse(project)
  }

  async findAll(ownerId: string): Promise<ProjectResponse[]> {
    const projects = await this.projectModel
      .find({ ownerId })
      .sort({ updatedAt: -1 })
      .exec()
    return projects.map((project) => this.toResponse(project))
  }

  async findOne(ownerId: string, id: string): Promise<ProjectResponse> {
    return this.toResponse(await this.findDocument(ownerId, id))
  }

  async selectLanguage(
    ownerId: string,
    id: string,
    language: ProjectLanguage,
  ): Promise<ProjectResponse> {
    if (language !== 'es') {
      throw new BadRequestException(
        'La formulación de proyectos está disponible únicamente en español',
      )
    }
    const project = await this.findDocument(ownerId, id)
    project.language = 'es'
    project.state = PROJECT_STATES.LANGUAGE_SELECTED
    project.progress = Math.max(project.progress, 8)
    return this.toResponse(await project.save())
  }

  async getMessages(
    ownerId: string,
    id: string,
  ): Promise<ChatMessageResponse[]> {
    const project = await this.findDocument(ownerId, id)
    if (!project.messages?.length) {
      project.messages = [
        this.createMessage(
          CONTEXT_FIELDS[0].question[this.languageOf(project)],
          'assistant',
          'clarification_question',
        ),
      ]
      await project.save()
    }
    return project.messages.map((message) =>
      this.toMessageResponse(id, message),
    )
  }

  async sendMessage(
    ownerId: string,
    id: string,
    content: string,
  ): Promise<ChatMessageResponse[]> {
    const project = await this.findDocument(ownerId, id)
    const answer = content.trim()
    const context = project.context ?? {}
    const currentField = CONTEXT_FIELDS.find(
      ({ field }) => !hasContextValue(context, field),
    )
    if (!currentField) {
      throw new BadRequestException(
        'El contexto ya está completo y listo para diagnóstico',
      )
    }
    if (currentField.field !== 'objectiveCount' && answer.length < 3) {
      throw new BadRequestException(
        'Escribe una respuesta un poco más completa',
      )
    }

    const language = this.languageOf(project)
    const normalizedAnswer = normalizeContextAnswer(currentField.field, answer)
    const updatedContext = {
      ...context,
      [currentField.field]: normalizedAnswer,
    }
    const nextField = CONTEXT_FIELDS.find(
      ({ field }) => !hasContextValue(updatedContext, field),
    )
    const assistantReply = nextField
      ? nextField.question[language]
      : 'Perfecto. Ya tengo el contexto esencial. Ahora revisemos su completitud y coherencia.'

    project.context = updatedContext
    project.messages = [
      ...(project.messages ?? []),
      this.createMessage(answer, 'user', 'user_message'),
      this.createMessage(
        assistantReply,
        'assistant',
        nextField ? 'clarification_question' : 'agent_message',
      ),
    ]
    const completedFields = CONTEXT_FIELDS.filter(({ field }) =>
      hasContextValue(updatedContext, field),
    ).length
    project.state = nextField
      ? PROJECT_STATES.COLLECTING_CONTEXT
      : PROJECT_STATES.DIAGNOSING
    project.progress = nextField ? Math.min(28, 16 + completedFields * 2) : 30
    await project.save()

    return project.messages.map((message) =>
      this.toMessageResponse(id, message),
    )
  }

  async getContext(
    ownerId: string,
    id: string,
  ): Promise<ProjectContextResponse> {
    const project = await this.findDocument(ownerId, id)
    return { ...(project.context ?? {}), projectId: id }
  }

  async updateContext(
    ownerId: string,
    id: string,
    input: UpdateProjectContextDto,
  ): Promise<ProjectContextResponse> {
    const project = await this.findDocument(ownerId, id)
    const entries = Object.entries(input) as Array<
      [ContextField, number | string | undefined]
    >
    const context = { ...(project.context ?? {}) }

    for (const [field, value] of entries) {
      if (value === undefined) continue
      if (field === 'objectiveCount') {
        context.objectiveCount = Number(value)
      } else if (typeof value === 'string') {
        context[field] = value.trim()
      }
    }

    project.context = context
    project.diagnosis = undefined
    project.state = PROJECT_STATES.DIAGNOSING
    project.progress = Math.max(project.progress, 30)
    await project.save()
    return { ...context, projectId: id }
  }

  async diagnoseContext(
    ownerId: string,
    id: string,
  ): Promise<DiagnosisResponse> {
    const project = await this.findDocument(ownerId, id)
    const context = project.context ?? {}
    const missingFields = CONTEXT_FIELDS.filter(
      ({ field }) => !hasContextValue(context, field),
    ).map(({ field }) => field)
    const language = this.languageOf(project)

    const automatedDiagnosis = missingFields.length
      ? {
          ambiguities: [],
          inconsistencies: [],
          questions: CONTEXT_FIELDS.filter(({ field }) =>
            missingFields.includes(field),
          )
            .slice(0, 3)
            .map(({ field, question }, index) => ({
              field,
              id: `missing-${index + 1}`,
              prompt: question[language],
            })),
        }
      : await this.aiService.diagnoseContext({
          context: context as Record<ContextField, number | string>,
          language,
          projectTitle: project.title,
          safetyIdentifier: this.aiService.createSafetyIdentifier(ownerId),
        })
    const diagnosis: StoredDiagnosis = {
      ...automatedDiagnosis,
      analyzedAt: new Date(),
      complete: missingFields.length === 0,
      missingFields,
    }

    project.diagnosis = diagnosis
    project.state = diagnosis.complete
      ? PROJECT_STATES.CONTEXT_CONFIRMATION
      : PROJECT_STATES.WAITING_CLARIFICATION
    project.progress = diagnosis.complete ? Math.max(project.progress, 34) : 30
    await project.save()
    return this.toDiagnosisResponse(diagnosis)
  }

  async confirmContext(ownerId: string, id: string): Promise<ProjectResponse> {
    const project = await this.findDocument(ownerId, id)
    const missingFields = CONTEXT_FIELDS.filter(
      ({ field }) => !hasContextValue(project.context ?? {}, field),
    )
    if (missingFields.length) {
      throw new BadRequestException(
        'Completa la información pendiente antes de continuar',
      )
    }

    project.state = PROJECT_STATES.CONTEXT_CONFIRMED
    project.progress = Math.max(project.progress, 38)
    return this.toResponse(await project.save())
  }

  async getExecutionDetails(
    ownerId: string,
    id: string,
  ): Promise<ExecutionDetailsResponse> {
    const project = await this.findDocument(ownerId, id)
    return this.toExecutionDetailsResponse(id, project)
  }

  async updateExecutionDetails(
    ownerId: string,
    id: string,
    input: UpdateExecutionDetailsDto,
  ): Promise<ExecutionDetailsResponse> {
    const project = await this.findDocument(ownerId, id)
    if (project.state !== PROJECT_STATES.WAITING_EXECUTION_DETAILS) {
      throw new BadRequestException(
        'Las respuestas operativas se habilitan después del agente de ideación',
      )
    }

    const details = { ...(project.executionDetails ?? {}) }
    for (const [field, value] of Object.entries(input) as Array<
      [ExecutionDetailsField, string | undefined]
    >) {
      if (value !== undefined) details[field] = value.trim()
    }
    project.executionDetails = details
    project.executionDetailsConfirmedAt = undefined
    project.markModified('executionDetails')
    await project.save()
    return this.toExecutionDetailsResponse(id, project)
  }

  async confirmExecutionDetails(
    ownerId: string,
    id: string,
  ): Promise<ProjectResponse> {
    const project = await this.findDocument(ownerId, id)
    if (project.state !== PROJECT_STATES.WAITING_EXECUTION_DETAILS) {
      throw new BadRequestException(
        'El proyecto no está esperando las respuestas operativas',
      )
    }
    const missing = EXECUTION_DETAILS_FIELDS.filter(
      (field) => !project.executionDetails?.[field]?.trim(),
    )
    if (missing.length) {
      throw new BadRequestException(
        'Responde las nueve preguntas antes de continuar',
      )
    }

    project.executionDetailsConfirmedAt = new Date()
    project.state = PROJECT_STATES.EXECUTION_DETAILS_CONFIRMED
    project.progress = Math.max(project.progress, 60)
    return this.toResponse(await project.save())
  }

  async getComponents(
    ownerId: string,
    id: string,
  ): Promise<ProjectComponentResponse[]> {
    const project = await this.findDocument(ownerId, id)
    return (project.components ?? []).map((component) =>
      this.toComponentResponse(id, component),
    )
  }

  async getComponent(
    ownerId: string,
    id: string,
    componentId: string,
  ): Promise<ProjectComponentResponse> {
    const project = await this.findDocument(ownerId, id)
    const component = (project.components ?? []).find(
      (candidate) => candidate.id === componentId,
    )
    if (!component) throw new NotFoundException('Componente no encontrado')
    return this.toComponentResponse(id, component)
  }

  async updateComponent(
    ownerId: string,
    id: string,
    componentId: string,
    content: string,
  ): Promise<ProjectComponentResponse> {
    const project = await this.findDocument(ownerId, id)
    const index = (project.components ?? []).findIndex(
      (component) => component.id === componentId,
    )
    if (index < 0) throw new NotFoundException('Componente no encontrado')

    const current = project.components[index]
    project.components[index] = {
      ...current,
      approvedAt: undefined,
      currentContent: content.trim(),
      modifiedBy: 'user',
      status: 'needs_revision',
      updatedAt: new Date(),
    }
    if (
      project.document ||
      Object.keys(project.documentVersions ?? {}).length > 0
    ) {
      this.invalidateDocuments(project)
      project.state = PROJECT_STATES.WAITING_REVIEW
      project.progress = 72
    }
    project.markModified('components')
    await project.save()
    return this.toComponentResponse(id, project.components[index])
  }

  async approveComponent(
    ownerId: string,
    id: string,
    componentId: string,
  ): Promise<ProjectComponentResponse> {
    const project = await this.findDocument(ownerId, id)
    const index = (project.components ?? []).findIndex(
      (component) => component.id === componentId,
    )
    if (index < 0) throw new NotFoundException('Componente no encontrado')

    const current = project.components[index]
    if (['pending', 'generating', 'error'].includes(current.status)) {
      throw new BadRequestException(
        'Este componente todavía no está listo para aprobación',
      )
    }

    const approvedAt = new Date()
    project.components[index] = {
      ...current,
      approvedAt,
      status: 'approved',
      updatedAt: approvedAt,
    }
    project.markModified('components')
    await project.save()
    return this.toComponentResponse(id, project.components[index])
  }

  async exportBudgetWorkbook(
    ownerId: string,
    id: string,
  ): Promise<{ buffer: Buffer; fileName: string }> {
    const project = await this.findDocument(ownerId, id)
    const budget = (project.components ?? []).find(
      ({ type }) => type === 'budget',
    )
    if (!budget?.structuredContent) {
      throw new BadRequestException(
        'El presupuesto aún no tiene datos estructurados para exportar.',
      )
    }

    return {
      buffer: await this.budgetWorkbook.export(
        project.title,
        budget.structuredContent,
      ),
      fileName: `presupuesto-${fileSafeName(project.title)}.xlsx`,
    }
  }

  async importBudgetWorkbook(
    ownerId: string,
    id: string,
    file: { buffer: Buffer; originalname: string; size: number },
  ): Promise<ProjectComponentResponse> {
    if (!file?.buffer || file.size === 0) {
      throw new BadRequestException(
        'Selecciona un archivo .xlsx para importar.',
      )
    }
    if (file.size > BUDGET_WORKBOOK_MAX_FILE_SIZE_BYTES) {
      throw new BadRequestException('El archivo no puede superar 5 MB.')
    }
    if (!file.originalname.toLowerCase().endsWith('.xlsx')) {
      throw new BadRequestException(
        'El presupuesto debe cargarse en formato .xlsx.',
      )
    }

    const project = await this.findDocument(ownerId, id)
    const budgetIndex = (project.components ?? []).findIndex(
      ({ type }) => type === 'budget',
    )
    if (budgetIndex < 0) {
      throw new NotFoundException('Componente de presupuesto no encontrado')
    }
    const current = project.components[budgetIndex]
    if (!current.structuredContent) {
      throw new BadRequestException(
        'El presupuesto aún no tiene datos estructurados para actualizar.',
      )
    }

    const ideationOutput = project.agentOutputs?.ideation
    const ideation =
      ideationOutput?.agent === 'ideation' ? ideationOutput : undefined
    const importedBudget = await this.budgetWorkbook.import(
      file.buffer,
      current.structuredContent,
      ideation,
    )
    const updatedAt = new Date()
    project.components[budgetIndex] = {
      ...current,
      approvedAt: undefined,
      currentContent: mapBudgetToContent(importedBudget, 'es'),
      modifiedBy: 'user',
      status: 'needs_revision',
      structuredContent: importedBudget,
      updatedAt,
    }
    const storedBudgetOutput = project.agentOutputs?.budget
    if (storedBudgetOutput?.agent === 'budget') {
      project.agentOutputs = {
        ...(project.agentOutputs ?? {}),
        budget: {
          ...storedBudgetOutput,
          components: { budget: importedBudget },
        },
      }
      project.markModified('agentOutputs')
    }
    this.invalidateDocuments(project)
    project.state = PROJECT_STATES.WAITING_REVIEW
    project.progress = Math.max(project.progress, 72)
    project.markModified('components')
    await project.save()
    return this.toComponentResponse(id, project.components[budgetIndex])
  }

  async regenerateComponent(
    ownerId: string,
    id: string,
    componentId: string,
  ): Promise<ProjectComponentResponse> {
    const project = await this.findDocument(ownerId, id)
    if (project.state === PROJECT_STATES.GENERATING_COMPONENTS) {
      throw new BadRequestException('La generación ya está en curso')
    }
    const index = (project.components ?? []).findIndex(
      (component) => component.id === componentId,
    )
    if (index < 0) throw new NotFoundException('Componente no encontrado')
    if (project.components[index].type === 'budget') {
      return this.regenerateBudget(ownerId, id)
    }
    this.assertFragmentRegenerationAvailable(project)

    const definition = FORMULATION_COMPONENT_REGISTRY.find(
      ({ component }) => component === project.components[index].type,
    )
    if (!definition) throw new NotFoundException('Componente no registrado')

    project.fragmentRegenerationCount =
      (project.fragmentRegenerationCount ?? 0) + 1
    project.components[index] = {
      ...project.components[index],
      approvedAt: undefined,
      status: 'generating',
      updatedAt: new Date(),
    }
    this.invalidateDocuments(project)
    project.state = PROJECT_STATES.GENERATING_COMPONENTS
    project.markModified('components')
    await project.save()

    try {
      const content = await this.aiService.regenerateProjectComponent({
        componentLabel: definition.label,
        context: this.confirmedContextOf(project),
        currentContent: project.components[index].currentContent,
        executionDetails: project.executionDetailsConfirmedAt
          ? this.confirmedExecutionDetailsOf(project)
          : undefined,
        projectTitle: project.title,
        safetyIdentifier: this.aiService.createSafetyIdentifier(ownerId),
      })
      const regeneratedAt = new Date()
      project.components[index] = {
        ...project.components[index],
        aiGeneratedContent: content,
        currentContent: content,
        modifiedBy: 'ai',
        status: 'generated',
        structuredContent: undefined,
        updatedAt: regeneratedAt,
      }
      project.state = PROJECT_STATES.WAITING_REVIEW
      project.progress = Math.max(project.progress, 72)
      project.markModified('components')
      await project.save()
      return this.toComponentResponse(id, project.components[index])
    } catch {
      project.components[index] = {
        ...project.components[index],
        status: 'error',
        updatedAt: new Date(),
      }
      project.state = PROJECT_STATES.ERROR
      project.markModified('components')
      await project.save()
      throw new ServiceUnavailableException({
        code: 'OPENAI_UNAVAILABLE',
        message:
          'No fue posible regenerar este fragmento. El intento quedó registrado.',
      })
    }
  }

  async generateComponents(
    ownerId: string,
    id: string,
    generationId: string = randomUUID(),
  ): Promise<ProjectComponentResponse[]> {
    const project = await this.findDocument(ownerId, id)
    if (
      project.state === PROJECT_STATES.WAITING_REVIEW &&
      project.generationVersion === CURRENT_GENERATION_VERSION
    ) {
      return (project.components ?? []).map((component) =>
        this.toComponentResponse(id, component),
      )
    }
    if (project.state === PROJECT_STATES.GENERATING_COMPONENTS) {
      throw new BadRequestException('La generación ya está en curso')
    }
    if (
      project.state !== PROJECT_STATES.CONTEXT_CONFIRMED &&
      project.state !== PROJECT_STATES.EXECUTION_DETAILS_CONFIRMED &&
      project.state !== PROJECT_STATES.WAITING_REVIEW &&
      project.state !== PROJECT_STATES.ERROR
    ) {
      throw new BadRequestException(
        'Confirma el contexto antes de generar los componentes',
      )
    }

    const context = this.confirmedContextOf(project)
    const now = new Date()
    const storedOutputs = { ...(project.agentOutputs ?? {}) }
    const initialOutputs =
      project.state === PROJECT_STATES.CONTEXT_CONFIRMED
        ? {}
        : project.state === PROJECT_STATES.ERROR
          ? storedOutputs
          : {
              research: storedOutputs.research,
              ideation: storedOutputs.ideation,
            }
    const executionDetails = project.executionDetailsConfirmedAt
      ? this.confirmedExecutionDetailsOf(project)
      : undefined
    const existingComponents = new Map(
      (project.components ?? []).map((component) => [
        component.type,
        component,
      ]),
    )
    project.components = FORMULATION_COMPONENT_REGISTRY.map(
      ({ agent, component }) => {
        const existing = existingComponents.get(component)
        if (initialOutputs[agent] && existing?.currentContent) {
          return { ...existing, status: 'generated' as const, updatedAt: now }
        }
        return {
          agent,
          aiGeneratedContent: '',
          createdAt: now,
          currentContent: '',
          id: existing?.id ?? randomUUID(),
          modifiedBy: 'ai' as const,
          status: 'pending' as const,
          type: component,
          updatedAt: now,
        }
      },
    )
    project.agentOutputs = initialOutputs
    project.generationJob = {
      id: generationId,
      startedAt: now,
      status: 'processing',
      updatedAt: now,
    }
    project.generationVersion = undefined
    project.state = PROJECT_STATES.GENERATING_COMPONENTS
    const resumedComponents = project.components.filter(
      ({ agent, status }) => initialOutputs[agent] && status === 'generated',
    ).length
    project.progress = Math.max(
      project.progress,
      42 +
        Math.round(
          (resumedComponents / FORMULATION_COMPONENT_REGISTRY.length) * 24,
        ),
    )
    project.markModified('components')
    project.markModified('agentOutputs')
    await project.save()

    let completedComponents = resumedComponents
    try {
      await this.orchestrator.generate(
        {
          context,
          executionDetails,
          initialOutputs,
          language: this.languageOf(project),
          projectTitle: project.title,
          safetyIdentifier: this.aiService.createSafetyIdentifier(ownerId),
          stopAfterAgent: executionDetails ? undefined : 'ideation',
        },
        {
          onAgentStarted: async (agent) => {
            const componentTypes = AGENT_COMPONENTS[agent]
            const startedAt = new Date()
            project.components = project.components.map((component) =>
              componentTypes.includes(component.type)
                ? { ...component, status: 'generating', updatedAt: startedAt }
                : component,
            )
            project.generationJob = {
              ...(project.generationJob ?? {
                id: generationId,
                startedAt,
                status: 'processing' as const,
              }),
              activeAgent: agent,
              status: 'processing',
              updatedAt: startedAt,
            }
            project.markModified('components')
            project.markModified('generationJob')
            await project.save()
          },
          onAgentCompleted: async (agent, output) => {
            const drafts = mapAgentOutputToComponents(
              output,
              this.languageOf(project),
            )
            const finishedAt = new Date()
            project.components = project.components.map((component) => {
              const draft = drafts.find(({ type }) => type === component.type)
              if (!draft) return component
              return {
                ...component,
                aiGeneratedContent: draft.content,
                currentContent: draft.content,
                status: 'generated',
                structuredContent: draft.structuredContent,
                updatedAt: finishedAt,
              }
            })
            project.agentOutputs = {
              ...(project.agentOutputs ?? {}),
              [agent]: output,
            }
            project.generationJob = {
              ...(project.generationJob ?? {
                id: generationId,
                startedAt: now,
                status: 'processing' as const,
              }),
              activeAgent: agent,
              status: 'processing',
              updatedAt: finishedAt,
            }
            completedComponents += drafts.length
            project.progress =
              42 +
              Math.round(
                (completedComponents / FORMULATION_COMPONENT_REGISTRY.length) *
                  24,
              )
            project.markModified('components')
            project.markModified('agentOutputs')
            project.markModified('generationJob')
            await project.save()
          },
        },
      )

      project.state = executionDetails
        ? PROJECT_STATES.WAITING_REVIEW
        : PROJECT_STATES.WAITING_EXECUTION_DETAILS
      project.progress = executionDetails ? 72 : 58
      project.generationVersion = executionDetails
        ? CURRENT_GENERATION_VERSION
        : undefined
      project.generationJob = {
        ...(project.generationJob ?? {
          id: generationId,
          startedAt: now,
          updatedAt: new Date(),
        }),
        activeAgent: undefined,
        completedAt: new Date(),
        errorCode: undefined,
        errorMessage: undefined,
        status: 'completed',
        updatedAt: new Date(),
      }
      project.markModified('generationJob')
      await project.save()
    } catch (error) {
      const failedAt = new Date()
      const failure = this.generationFailureOf(error)
      project.components = project.components.map((component) =>
        component.status === 'generating'
          ? { ...component, status: 'error', updatedAt: failedAt }
          : component,
      )
      project.state = PROJECT_STATES.ERROR
      project.generationJob = {
        ...(project.generationJob ?? {
          id: generationId,
          startedAt: now,
          updatedAt: failedAt,
        }),
        activeAgent: undefined,
        completedAt: failedAt,
        errorCode: failure.code,
        errorMessage: failure.message,
        status: 'failed',
        updatedAt: failedAt,
      }
      project.markModified('components')
      project.markModified('generationJob')
      await project.save()
      throw error
    }

    return project.components.map((component) =>
      this.toComponentResponse(id, component),
    )
  }

  async regenerateBudget(
    ownerId: string,
    id: string,
  ): Promise<ProjectComponentResponse> {
    const project = await this.findDocument(ownerId, id)
    if (project.state === PROJECT_STATES.GENERATING_COMPONENTS) {
      throw new BadRequestException('La generación ya está en curso')
    }
    if (!project.executionDetailsConfirmedAt) {
      throw new BadRequestException(
        'Confirma las respuestas operativas antes de regenerar el presupuesto',
      )
    }

    const storedOutputs = project.agentOutputs ?? {}
    const requiredAgents = ['research', 'ideation', 'methodology'] as const
    const missingAgent = requiredAgents.find((agent) => !storedOutputs[agent])
    if (missingAgent) {
      throw new BadRequestException(
        'El presupuesto requiere Investigación, Ideación y Metodología previamente generados',
      )
    }

    const budgetIndex = (project.components ?? []).findIndex(
      ({ type }) => type === 'budget',
    )
    if (budgetIndex < 0) {
      throw new NotFoundException('Componente de presupuesto no encontrado')
    }
    this.assertFragmentRegenerationAvailable(project)

    const context = this.confirmedContextOf(project)
    const executionDetails = this.confirmedExecutionDetailsOf(project)
    const initialOutputs = {
      ideation: storedOutputs.ideation,
      methodology: storedOutputs.methodology,
      research: storedOutputs.research,
    }
    const startedAt = new Date()
    project.components[budgetIndex] = {
      ...project.components[budgetIndex],
      status: 'generating',
      updatedAt: startedAt,
    }
    project.fragmentRegenerationCount =
      (project.fragmentRegenerationCount ?? 0) + 1
    this.invalidateDocuments(project)
    project.state = PROJECT_STATES.GENERATING_COMPONENTS
    project.markModified('components')
    await project.save()

    try {
      await this.orchestrator.generate(
        {
          context,
          executionDetails,
          initialOutputs,
          language: this.languageOf(project),
          projectTitle: project.title,
          safetyIdentifier: this.aiService.createSafetyIdentifier(ownerId),
          stopAfterAgent: 'budget',
        },
        {
          onAgentCompleted: async (agent, output) => {
            if (agent !== 'budget') return
            const draft = mapAgentOutputToComponents(
              output,
              this.languageOf(project),
            ).find(({ type }) => type === 'budget')
            if (!draft) {
              throw new Error('El agente budget no devolvió el presupuesto')
            }
            const finishedAt = new Date()
            project.components[budgetIndex] = {
              ...project.components[budgetIndex],
              aiGeneratedContent: draft.content,
              approvedAt: undefined,
              currentContent: draft.content,
              modifiedBy: 'ai',
              status: 'generated',
              structuredContent: draft.structuredContent,
              updatedAt: finishedAt,
            }
            project.agentOutputs = {
              ...(project.agentOutputs ?? {}),
              budget: output,
            }
            project.markModified('components')
            project.markModified('agentOutputs')
            await project.save()
          },
        },
      )

      project.state = PROJECT_STATES.WAITING_REVIEW
      project.progress = Math.max(project.progress, 72)
      project.generationVersion = CURRENT_GENERATION_VERSION
      await project.save()
    } catch (error) {
      project.components[budgetIndex] = {
        ...project.components[budgetIndex],
        status: 'error',
        updatedAt: new Date(),
      }
      project.state = PROJECT_STATES.ERROR
      project.markModified('components')
      await project.save()
      throw error
    }

    return this.toComponentResponse(id, project.components[budgetIndex])
  }

  async regenerateProject(
    ownerId: string,
    id: string,
  ): Promise<ProjectResponse> {
    const project = await this.findDocument(ownerId, id)
    if ((project.fullProjectRegenerationCount ?? 0) >= 1) {
      throw new BadRequestException(
        'Ya utilizaste la única regeneración completa disponible para este proyecto',
      )
    }
    if (!project.document && project.state !== PROJECT_STATES.COMPLETED) {
      throw new BadRequestException(
        'La regeneración completa se habilita después de finalizar el proyecto',
      )
    }

    project.fullProjectRegenerationCount = 1
    project.agentOutputs = {}
    project.components = []
    project.generationVersion = undefined
    this.invalidateDocuments(project)
    project.state = project.executionDetailsConfirmedAt
      ? PROJECT_STATES.EXECUTION_DETAILS_CONFIRMED
      : PROJECT_STATES.CONTEXT_CONFIRMED
    project.progress = project.executionDetailsConfirmedAt ? 60 : 38
    project.markModified('agentOutputs')
    project.markModified('components')
    return this.toResponse(await project.save())
  }

  async assembleDocument(
    ownerId: string,
    id: string,
  ): Promise<ProjectDocumentResponse> {
    const project = await this.findDocument(ownerId, id)
    const existingSpanishDocument =
      project.documentVersions?.es ??
      (project.document?.language === 'es' ? project.document : undefined)
    if (existingSpanishDocument) {
      return this.toDocumentResponse(existingSpanishDocument)
    }
    if (project.state !== PROJECT_STATES.WAITING_REVIEW) {
      throw new BadRequestException(
        'El proyecto debe estar en revisión antes de ensamblar el documento',
      )
    }

    const components = project.components ?? []
    const pending = FORMULATION_COMPONENT_REGISTRY.filter(({ component }) => {
      const stored = components.find(({ type }) => type === component)
      return !stored?.currentContent.trim() || stored.status !== 'approved'
    })
    if (pending.length) {
      throw new BadRequestException(
        'Aprueba los trece componentes antes de ensamblar el documento',
      )
    }

    const language: ProjectLanguage = 'es'
    const sections = FORMULATION_COMPONENT_REGISTRY.map(
      ({ component, label, order }) => {
        const stored = components.find(({ type }) => type === component)!
        return {
          componentId: stored.id,
          content: stored.currentContent,
          id: component,
          order,
          title: label,
        }
      },
    )
    const document: StoredConsolidatedDocument = {
      content: this.documentContentOf(sections),
      generatedAt: new Date(),
      id: randomUUID(),
      language,
      projectId: id,
      sections,
      status: 'ready',
      title: project.title,
    }

    project.document = document
    project.documentVersions = {
      ...(project.documentVersions ?? {}),
      es: document,
    }
    project.state = PROJECT_STATES.DOCUMENT_READY
    project.progress = 92
    project.markModified('document')
    project.markModified('documentVersions')
    await project.save()
    return this.toDocumentResponse(document)
  }

  async getDocument(
    ownerId: string,
    id: string,
    language?: ProjectLanguage,
  ): Promise<ProjectDocumentResponse> {
    const project = await this.findDocument(ownerId, id)
    const document = language
      ? (project.documentVersions?.[language] ??
        (project.document?.language === language
          ? project.document
          : undefined))
      : (project.documentVersions?.es ?? project.document)
    if (!document) {
      throw new NotFoundException('El documento todavía no ha sido ensamblado')
    }
    return this.toDocumentResponse(document)
  }

  async translateDocument(
    ownerId: string,
    id: string,
    targetLanguage: ProjectLanguage,
  ): Promise<ProjectDocumentResponse> {
    const project = await this.findDocument(ownerId, id)
    if (targetLanguage !== 'en') {
      throw new BadRequestException(
        'La única traducción disponible es de español a inglés',
      )
    }
    const original =
      project.documentVersions?.es ??
      (project.document?.language === 'es' ? project.document : undefined)
    if (!original) {
      throw new NotFoundException('El documento todavía no ha sido ensamblado')
    }
    const existingTranslation = project.documentVersions?.en
    if (existingTranslation) {
      return this.toDocumentResponse(existingTranslation)
    }

    const previousState = project.state
    project.state = PROJECT_STATES.TRANSLATING
    await project.save()

    try {
      const translated = await this.aiService.translateProjectDocument({
        projectTitle: original.title,
        safetyIdentifier: this.aiService.createSafetyIdentifier(ownerId),
        sections: original.sections.map(({ content, id: sectionId }) => ({
          content,
          id: sectionId,
        })),
      })
      const translatedById = new Map(
        translated.sections.map((section) => [section.id, section.content]),
      )
      const sections = original.sections.map((section) => ({
        ...section,
        content: translatedById.get(section.id) ?? section.content,
        title:
          ENGLISH_DOCUMENT_TITLES[
            section.id as keyof typeof ENGLISH_DOCUMENT_TITLES
          ] ?? section.title,
      }))
      const translatedDocument: StoredConsolidatedDocument = {
        ...original,
        content: this.documentContentOf(sections),
        generatedAt: new Date(),
        id: randomUUID(),
        language: 'en',
        sections,
        title: translated.projectTitle,
        translatedFrom: 'es',
      }
      project.documentVersions = {
        ...(project.documentVersions ?? {}),
        en: translatedDocument,
        es: original,
      }
      project.state =
        previousState === PROJECT_STATES.COMPLETED
          ? PROJECT_STATES.COMPLETED
          : PROJECT_STATES.DOCUMENT_READY
      project.progress = Math.max(project.progress, 96)
      project.markModified('documentVersions')
      await project.save()
      return this.toDocumentResponse(translatedDocument)
    } catch {
      project.state =
        previousState === PROJECT_STATES.COMPLETED
          ? PROJECT_STATES.COMPLETED
          : PROJECT_STATES.DOCUMENT_READY
      await project.save()
      throw new ServiceUnavailableException({
        code: 'OPENAI_UNAVAILABLE',
        message:
          'No fue posible traducir el documento al inglés. Inténtalo nuevamente.',
      })
    }
  }

  async completeProject(ownerId: string, id: string): Promise<ProjectResponse> {
    const project = await this.findDocument(ownerId, id)
    if (!project.document) {
      throw new BadRequestException(
        'Ensamble el documento antes de finalizar el proyecto',
      )
    }
    project.state = PROJECT_STATES.COMPLETED
    project.progress = 100
    return this.toResponse(await project.save())
  }

  private async findDocument(
    ownerId: string,
    id: string,
  ): Promise<ProjectDocument> {
    const project = await this.projectModel.findOne({ _id: id, ownerId }).exec()
    if (!project) {
      throw new NotFoundException('Proyecto no encontrado')
    }
    const heartbeatAt = project.generationJob?.updatedAt
      ? new Date(project.generationJob.updatedAt).getTime()
      : project.updatedAt.getTime()
    if (
      project.state === PROJECT_STATES.GENERATING_COMPONENTS &&
      Date.now() - heartbeatAt > STALE_GENERATION_AFTER_MS
    ) {
      const interruptedAt = new Date()
      project.components = (project.components ?? []).map((component) =>
        component.status === 'generating'
          ? { ...component, status: 'error', updatedAt: interruptedAt }
          : component,
      )
      if (project.generationJob) {
        project.generationJob = {
          ...project.generationJob,
          activeAgent: undefined,
          completedAt: interruptedAt,
          status: 'interrupted',
          updatedAt: interruptedAt,
        }
      }
      project.state = PROJECT_STATES.ERROR
      project.markModified('components')
      project.markModified('generationJob')
      await project.save()
    }
    return project
  }

  private assertFragmentRegenerationAvailable(project: ProjectDocument): void {
    if ((project.fragmentRegenerationCount ?? 0) >= 3) {
      throw new BadRequestException(
        'Ya utilizaste las tres regeneraciones de fragmentos disponibles para este proyecto',
      )
    }
  }

  private generationFailureOf(error: unknown): {
    code: string
    message: string
  } {
    if (error instanceof HttpException) {
      const response = error.getResponse()
      if (typeof response === 'object' && response !== null) {
        const body = response as { code?: unknown; message?: unknown }
        if (typeof body.message === 'string') {
          return {
            code:
              typeof body.code === 'string'
                ? body.code
                : 'GENERATION_UNAVAILABLE',
            message: body.message,
          }
        }
      }
      if (typeof response === 'string') {
        return { code: 'GENERATION_UNAVAILABLE', message: response }
      }
    }
    return {
      code: 'GENERATION_UNAVAILABLE',
      message:
        'La generación se interrumpió. El progreso anterior quedó guardado y puedes reanudarla.',
    }
  }

  private invalidateDocuments(project: ProjectDocument): void {
    project.document = undefined
    project.documentVersions = {}
    project.markModified('document')
    project.markModified('documentVersions')
  }

  private documentContentOf(
    sections: StoredConsolidatedDocument['sections'],
  ): string {
    return sections
      .map(
        ({ content, order, title }) =>
          `${order}. ${title.toUpperCase()}\n\n${content}`,
      )
      .join('\n\n')
  }

  private createMessage(
    content: string,
    role: StoredChatMessage['role'],
    messageType: StoredChatMessage['messageType'],
  ): StoredChatMessage {
    return {
      content,
      createdAt: new Date(),
      id: randomUUID(),
      messageType,
      role,
    }
  }

  private confirmedContextOf(
    project: ProjectDocument,
  ): ConfirmedProjectContext {
    const context = project.context ?? {}
    const missing = CONTEXT_FIELDS.filter(
      ({ field }) => !hasContextValue(context, field),
    )
    if (missing.length) {
      throw new BadRequestException(
        'El contexto confirmado no contiene todos los campos requeridos',
      )
    }
    return context as ConfirmedProjectContext
  }

  private confirmedExecutionDetailsOf(
    project: ProjectDocument,
  ): ExecutionDetails {
    const details = project.executionDetails ?? {}
    const missing = EXECUTION_DETAILS_FIELDS.filter(
      (field) => !details[field]?.trim(),
    )
    if (missing.length) {
      throw new BadRequestException(
        'Las respuestas operativas confirmadas están incompletas',
      )
    }
    return details as ExecutionDetails
  }

  private toExecutionDetailsResponse(
    projectId: string,
    project: ProjectDocument,
  ): ExecutionDetailsResponse {
    return {
      ...(project.executionDetails ?? {}),
      confirmedAt: project.executionDetailsConfirmedAt?.toISOString(),
      projectId,
    }
  }

  private toDocumentResponse(
    document: StoredConsolidatedDocument,
  ): ProjectDocumentResponse {
    return {
      ...document,
      generatedAt: new Date(document.generatedAt).toISOString(),
      sections: document.sections.map((section) => ({ ...section })),
    }
  }

  private toComponentResponse(
    projectId: string,
    component: StoredProjectComponent,
  ): ProjectComponentResponse {
    return {
      ...component,
      approvedAt: component.approvedAt
        ? new Date(component.approvedAt).toISOString()
        : undefined,
      createdAt: new Date(component.createdAt).toISOString(),
      projectId,
      updatedAt: new Date(component.updatedAt).toISOString(),
    }
  }

  private languageOf(project: ProjectDocument): 'es' {
    void project
    return 'es'
  }

  private toMessageResponse(
    projectId: string,
    message: StoredChatMessage,
  ): ChatMessageResponse {
    return {
      ...message,
      createdAt: new Date(message.createdAt).toISOString(),
      projectId,
    }
  }

  private toDiagnosisResponse(diagnosis: StoredDiagnosis): DiagnosisResponse {
    return {
      ambiguities: diagnosis.ambiguities,
      complete: diagnosis.complete,
      inconsistencies: diagnosis.inconsistencies,
      missingFields: diagnosis.missingFields,
      questions: diagnosis.questions,
    }
  }

  private toResponse(project: ProjectDocument): ProjectResponse {
    return {
      createdAt: project.createdAt.toISOString(),
      fragmentRegenerationCount: project.fragmentRegenerationCount ?? 0,
      fullProjectRegenerationCount: project.fullProjectRegenerationCount ?? 0,
      generationJob: project.generationJob
        ? {
            ...project.generationJob,
            completedAt: project.generationJob.completedAt
              ? new Date(project.generationJob.completedAt).toISOString()
              : undefined,
            startedAt: new Date(project.generationJob.startedAt).toISOString(),
            updatedAt: new Date(project.generationJob.updatedAt).toISOString(),
          }
        : undefined,
      hasDocument: Boolean(project.document),
      id: project.id,
      language: project.language,
      progress: project.progress,
      selectedSkillId: project.selectedSkillId,
      state: project.state,
      title: project.title,
      updatedAt: project.updatedAt.toISOString(),
    }
  }
}
