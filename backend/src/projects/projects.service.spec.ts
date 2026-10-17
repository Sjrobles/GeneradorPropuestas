import { BadRequestException, NotFoundException } from '@nestjs/common'
import type { Model } from 'mongoose'
import type { AiService } from '../ai/ai.service'
import type { ProjectOrchestratorService } from '../orchestration/application/project-orchestrator.service'
import type {
  ProjectGenerationInput,
  ProjectGenerationLifecycle,
  ProjectGenerationOutput,
} from '../orchestration/application/orchestration.types'
import type {
  BudgetAgentOutput,
  FormulationAgentOutput,
} from '../orchestration/contracts/agent-output.schemas'
import { FORMULATION_COMPONENT_REGISTRY } from '../orchestration/domain/formulation.constants'
import { SkillsService } from '../skills/skills.service'
import { PROJECT_STATES } from './domain/project.constants'
import { BudgetWorkbookService } from './budget-workbook.service'
import { ProjectsService } from './projects.service'
import type { Project, ProjectDocument } from './schemas/project.schema'

const OWNER_ID = '507f1f77bcf86cd799439099'

function projectFixture(
  overrides: Partial<ProjectDocument> = {},
): ProjectDocument {
  const now = new Date('2026-08-14T20:00:00.000Z')
  const save = jest.fn()
  const markModified = jest.fn()
  const fixture = {
    createdAt: now,
    id: '507f1f77bcf86cd799439011',
    language: undefined,
    markModified,
    ownerId: OWNER_ID,
    progress: 0,
    save,
    selectedSkillId: 'international-calls',
    state: PROJECT_STATES.CREATED,
    title: 'Proyecto de prueba',
    updatedAt: now,
    ...overrides,
  }
  save.mockResolvedValue(fixture)
  return fixture as unknown as ProjectDocument
}

describe('ProjectsService', () => {
  const create = jest.fn()
  const findOne = jest.fn()
  const updateMany = jest.fn<
    { exec: jest.Mock },
    [Record<string, unknown>, Record<string, unknown>, Record<string, unknown>?]
  >()
  const composeContextReply = jest.fn()
  const diagnoseContext = jest.fn()
  const translateProjectDocument = jest.fn()
  const createSafetyIdentifier = jest.fn().mockReturnValue('safe-user')
  const model = { create, findOne, updateMany } as unknown as Model<Project>
  const aiService = {
    composeContextReply,
    createSafetyIdentifier,
    diagnoseContext,
    translateProjectDocument,
  } as unknown as AiService
  const generate = jest.fn()
  const orchestrator = {
    generate,
  } as unknown as ProjectOrchestratorService
  const service = new ProjectsService(
    model,
    new SkillsService(),
    aiService,
    orchestrator,
    new BudgetWorkbookService(),
  )

  beforeEach(() => jest.clearAllMocks())

  it('marca como error las generaciones interrumpidas al reiniciar', async () => {
    const firstExec = jest.fn().mockResolvedValue({ modifiedCount: 1 })
    const secondExec = jest.fn().mockResolvedValue({ modifiedCount: 0 })
    const migrationExec = jest.fn().mockResolvedValue({ modifiedCount: 0 })
    updateMany
      .mockReturnValueOnce({ exec: firstExec })
      .mockReturnValueOnce({ exec: secondExec })
      .mockReturnValueOnce({ exec: migrationExec })

    await service.onModuleInit()

    expect(updateMany).toHaveBeenCalledTimes(3)
    const firstCall = updateMany.mock.calls[0]
    const firstSet = firstCall?.[1].$set as Record<string, unknown>
    expect(firstCall?.[0]).toEqual({
      'components.status': 'generating',
      state: PROJECT_STATES.GENERATING_COMPONENTS,
    })
    expect(firstSet.state).toBe(PROJECT_STATES.ERROR)
    expect(firstSet['components.$[component].status']).toBe('error')
    expect(firstSet['components.$[component].updatedAt']).toBeInstanceOf(Date)
    expect(firstCall?.[2]).toEqual({
      arrayFilters: [{ 'component.status': 'generating' }],
    })
    const secondCall = updateMany.mock.calls[1]
    const secondSet = secondCall?.[1].$set as Record<string, unknown>
    expect(secondCall?.[0]).toEqual({
      state: PROJECT_STATES.GENERATING_COMPONENTS,
    })
    expect(secondSet['generationJob.status']).toBe('interrupted')
    expect(secondSet.state).toBe(PROJECT_STATES.ERROR)
    expect(updateMany).toHaveBeenNthCalledWith(
      3,
      {
        'context.objectiveCount': { $exists: false },
        'context.projectDuration': { $exists: true },
      },
      { $set: { 'context.objectiveCount': 3 } },
    )
  })

  it('crea el proyecto con estado inicial controlado por código', async () => {
    create.mockResolvedValue(projectFixture())

    const result = await service.create(OWNER_ID, {
      selectedSkillId: 'international-calls',
      title: ' Proyecto de prueba ',
    })

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        language: 'es',
        progress: 8,
        ownerId: OWNER_ID,
        state: PROJECT_STATES.LANGUAGE_SELECTED,
        title: 'Proyecto de prueba',
      }),
    )
    expect(result.id).toBe('507f1f77bcf86cd799439011')
  })

  it('impide crear proyectos con una skill deshabilitada', async () => {
    await expect(
      service.create(OWNER_ID, {
        selectedSkillId: 'research-projects',
        title: 'Proyecto bloqueado',
      }),
    ).rejects.toBeInstanceOf(BadRequestException)
  })

  it('selecciona idioma y avanza el workflow', async () => {
    const project = projectFixture()
    findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(project) })

    const result = await service.selectLanguage(OWNER_ID, project.id, 'es')

    expect(result.language).toBe('es')
    expect(result.state).toBe(PROJECT_STATES.LANGUAGE_SELECTED)
    expect(result.progress).toBe(8)
  })

  it('rechaza inglés como idioma de formulación', async () => {
    await expect(
      service.selectLanguage(OWNER_ID, '507f1f77bcf86cd799439011', 'en'),
    ).rejects.toBeInstanceOf(BadRequestException)
    expect(findOne).not.toHaveBeenCalled()
  })

  it('responde 404 cuando el proyecto no existe', async () => {
    findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) })

    await expect(
      service.findOne(OWNER_ID, '507f1f77bcf86cd799439012'),
    ).rejects.toBeInstanceOf(NotFoundException)
  })

  it('oculta proyectos que pertenecen a otro usuario', async () => {
    findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) })

    await expect(
      service.findOne('otro-usuario', '507f1f77bcf86cd799439011'),
    ).rejects.toBeInstanceOf(NotFoundException)
    expect(findOne).toHaveBeenCalledWith({
      _id: '507f1f77bcf86cd799439011',
      ownerId: 'otro-usuario',
    })
  })

  it('guarda la respuesta y solicita localmente la siguiente pregunta', async () => {
    const project = projectFixture({ context: {}, messages: [] })
    findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(project) })
    const messages = await service.sendMessage(
      OWNER_ID,
      project.id,
      'La conectividad rural es insuficiente.',
    )

    expect(project.context.problem).toBe(
      'La conectividad rural es insuficiente.',
    )
    expect(composeContextReply).not.toHaveBeenCalled()
    expect(messages).toHaveLength(2)
    expect(messages[1].content).toBe(
      '¿Quiénes son afectados por este problema o se beneficiarían del proyecto?',
    )
  })

  it('diagnostica un contexto completo con una salida estructurada', async () => {
    const project = projectFixture({
      context: {
        expectedResults: 'Mejorar el acceso a contenidos educativos.',
        initialScope: 'Piloto en dos instituciones durante seis meses.',
        projectDuration: '6 meses.',
        location: 'Zona rural de Bolívar.',
        objectiveCount: 3,
        problem: 'La conectividad educativa es intermitente.',
        proposedSolution: 'Una plataforma con funcionamiento sin conexión.',
        targetPopulation: 'Estudiantes y docentes rurales.',
      },
    })
    findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(project) })
    diagnoseContext.mockResolvedValue({
      ambiguities: ['No se define cómo se medirá la mejora.'],
      inconsistencies: [],
      questions: [
        {
          field: 'expectedResults',
          id: 'metric-1',
          prompt: '¿Qué indicador medirá la mejora?',
        },
      ],
    })

    const result = await service.diagnoseContext(OWNER_ID, project.id)

    expect(result.complete).toBe(true)
    expect(result.questions).toHaveLength(1)
    expect(diagnoseContext).toHaveBeenCalledWith(
      expect.objectContaining({
        language: 'es',
        projectTitle: 'Proyecto de prueba',
        safetyIdentifier: 'safe-user',
      }),
    )
    expect(project.state).toBe(PROJECT_STATES.CONTEXT_CONFIRMATION)
    expect(project.progress).toBe(34)
  })

  it('reporta campos pendientes sin invocar OpenAI', async () => {
    const project = projectFixture({
      context: { problem: 'La conectividad educativa es intermitente.' },
    })
    findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(project) })

    const result = await service.diagnoseContext(OWNER_ID, project.id)

    expect(result.complete).toBe(false)
    expect(result.missingFields).toContain('targetPopulation')
    expect(result.questions.length).toBeLessThanOrEqual(3)
    expect(diagnoseContext).not.toHaveBeenCalled()
    expect(project.state).toBe(PROJECT_STATES.WAITING_CLARIFICATION)
  })

  it('actualiza y confirma el contexto persistido', async () => {
    const project = projectFixture({
      context: {
        expectedResults: 'Resultados iniciales.',
        initialScope: 'Alcance inicial.',
        projectDuration: '6 meses.',
        location: 'Bolívar.',
        objectiveCount: 3,
        problem: 'Problema inicial.',
        proposedSolution: 'Solución inicial.',
        targetPopulation: 'Población inicial.',
      },
    })
    findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(project) })

    const context = await service.updateContext(OWNER_ID, project.id, {
      problem: ' Problema corregido. ',
    })
    const confirmed = await service.confirmContext(OWNER_ID, project.id)

    expect(context.problem).toBe('Problema corregido.')
    expect(confirmed.state).toBe(PROJECT_STATES.CONTEXT_CONFIRMED)
    expect(confirmed.progress).toBe(38)
  })

  it('reanuda la generación después de confirmar las respuestas operativas', async () => {
    const project = projectFixture({
      context: {
        expectedResults: 'Resultados iniciales.',
        initialScope: 'Alcance inicial.',
        projectDuration: '6 meses.',
        location: 'Bolívar.',
        objectiveCount: 3,
        problem: 'Problema inicial.',
        proposedSolution: 'Solución inicial.',
        targetPopulation: 'Población inicial.',
      },
      executionDetails: {
        activityDevelopment: 'Pasos de ejecución por actividad.',
        participants: 'Equipo técnico y aliados.',
        locationsAndParticipants: 'Bolívar, con veinte participantes.',
        requiredResources: 'Equipos, licencias y materiales.',
        timelineAndDependencies: 'Seis meses en orden secuencial.',
        expectedDeliverables: 'Informes y prototipos validados.',
        verificationMethods: 'Actas, pruebas e indicadores.',
        knownEconomicInformation: 'Valores sujetos a cotización.',
        specialConditions: 'Cumplimiento de requisitos técnicos.',
      },
      executionDetailsConfirmedAt: new Date(),
      state: PROJECT_STATES.EXECUTION_DETAILS_CONFIRMED,
    })
    findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(project) })
    const budgetOutput: BudgetAgentOutput = {
      agent: 'budget',
      assumptions: [],
      clarificationQuestions: [],
      consistencyWarnings: [],
      components: {
        budget: {
          currency: 'COP',
          items: [
            {
              activity: 'Realizar la caracterización técnica del territorio.',
              activityIds: ['A1'],
              category: 'Talento humano',
              description: 'Profesional responsable de la actividad A1.',
              fundingSource: null,
              id: 'B1',
              objective: 'Caracterizar técnicamente el territorio.',
              objectiveIds: ['O1'],
              quantity: 2,
              total: 4_000_000,
              unit: 'mes',
              unitCost: 2_000_000,
              valueStatus: 'estimated',
            },
          ],
          narrative: 'Presupuesto estimado con supuestos conservadores.',
          total: 4_000_000,
          valueStatus: 'estimated',
        },
      },
    }
    let capturedGenerationInput: ProjectGenerationInput | undefined
    generate.mockImplementation(
      (
        input: ProjectGenerationInput,
        lifecycle: ProjectGenerationLifecycle,
      ) => {
        capturedGenerationInput = input
        return Promise.resolve(lifecycle.onAgentStarted?.('budget'))
          .then(() => lifecycle.onAgentCompleted?.('budget', budgetOutput))
          .then(() => ({ budget: budgetOutput }) as ProjectGenerationOutput)
      },
    )

    const components = await service.generateComponents(OWNER_ID, project.id)

    expect(components).toHaveLength(13)
    const budget = components.find(({ type }) => type === 'budget')
    expect(budget?.status).toBe('generated')
    expect(budget?.currentContent).toContain('Talento humano')
    expect(budget?.currentContent).toContain('| Objetivo | Actividad | Rubro |')
    expect(project.agentOutputs.budget).toEqual(budgetOutput)
    expect(project.generationVersion).toBe('agents-sdk-v5-language-aware')
    expect(project.state).toBe(PROJECT_STATES.WAITING_REVIEW)
    expect(project.progress).toBe(72)
    expect(capturedGenerationInput?.executionDetails?.activityDevelopment).toBe(
      'Pasos de ejecución por actividad.',
    )
    expect(capturedGenerationInput?.language).toBe('es')
    expect(capturedGenerationInput?.stopAfterAgent).toBeUndefined()
  })

  it('reanuda un proyecto con error sin repetir los agentes persistidos', async () => {
    const storedOutputs = {
      ideation: { agent: 'ideation' } as FormulationAgentOutput,
      methodology: { agent: 'methodology' } as FormulationAgentOutput,
      research: { agent: 'research' } as FormulationAgentOutput,
    }
    const project = projectFixture({
      agentOutputs: storedOutputs,
      context: {
        expectedResults: 'Resultados iniciales.',
        initialScope: 'Alcance inicial.',
        projectDuration: '6 meses.',
        location: 'Bolívar.',
        objectiveCount: 3,
        problem: 'Problema inicial.',
        proposedSolution: 'Solución inicial.',
        targetPopulation: 'Población inicial.',
      },
      executionDetails: {
        activityDevelopment: 'Pasos de ejecución por actividad.',
        expectedDeliverables: 'Informes y prototipos validados.',
        knownEconomicInformation: 'Valores sujetos a cotización.',
        locationsAndParticipants: 'Bolívar, con veinte participantes.',
        participants: 'Equipo técnico y aliados.',
        requiredResources: 'Equipos, licencias y materiales.',
        specialConditions: 'Cumplimiento de requisitos técnicos.',
        timelineAndDependencies: 'Seis meses en orden secuencial.',
        verificationMethods: 'Actas, pruebas e indicadores.',
      },
      executionDetailsConfirmedAt: new Date(),
      state: PROJECT_STATES.ERROR,
    })
    findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(project) })
    let capturedGenerationInput: ProjectGenerationInput | undefined
    generate.mockImplementation((input: ProjectGenerationInput) => {
      capturedGenerationInput = input
      return Promise.resolve(storedOutputs)
    })

    await service.generateComponents(OWNER_ID, project.id)

    expect(capturedGenerationInput?.initialOutputs).toEqual(storedOutputs)
    expect(project.state).toBe(PROJECT_STATES.WAITING_REVIEW)
  })

  it('no cobra una nueva ejecución cuando el proyecto ya usa la versión vigente', async () => {
    const project = projectFixture({
      components: [],
      generationVersion: 'agents-sdk-v5-language-aware',
      state: PROJECT_STATES.WAITING_REVIEW,
    })
    findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(project) })

    await expect(
      service.generateComponents(OWNER_ID, project.id),
    ).resolves.toEqual([])
    expect(generate).not.toHaveBeenCalled()
  })

  it('regenera solo presupuesto y conserva los demás agentes', async () => {
    const now = new Date('2026-08-14T20:00:00.000Z')
    const storedOutputs = {
      budget: { agent: 'budget' } as FormulationAgentOutput,
      ideation: { agent: 'ideation' } as FormulationAgentOutput,
      impact: { agent: 'impact' } as FormulationAgentOutput,
      methodology: { agent: 'methodology' } as FormulationAgentOutput,
      research: { agent: 'research' } as FormulationAgentOutput,
    }
    const project = projectFixture({
      agentOutputs: storedOutputs,
      components: [
        {
          agent: 'budget',
          aiGeneratedContent: 'Presupuesto anterior.',
          createdAt: now,
          currentContent: 'Presupuesto anterior.',
          id: 'budget-component-id',
          modifiedBy: 'ai',
          status: 'generated',
          type: 'budget',
          updatedAt: now,
        },
      ],
      context: {
        expectedResults: 'Resultados medibles.',
        initialScope: 'Piloto de seis meses.',
        location: 'Bolívar.',
        objectiveCount: 3,
        problem: 'Problema confirmado.',
        projectDuration: '6 meses.',
        proposedSolution: 'Solución confirmada.',
        targetPopulation: 'Población confirmada.',
      },
      executionDetails: {
        activityDevelopment: 'Pasos por actividad.',
        expectedDeliverables: 'Entregables verificables.',
        knownEconomicInformation: 'Precios sujetos a investigación.',
        locationsAndParticipants: 'Bolívar, veinte participantes.',
        participants: 'Equipo técnico.',
        requiredResources: 'Equipos y materiales.',
        specialConditions: 'Requisitos técnicos.',
        timelineAndDependencies: 'Seis meses.',
        verificationMethods: 'Actas e indicadores.',
      },
      executionDetailsConfirmedAt: now,
      progress: 72,
      state: PROJECT_STATES.WAITING_REVIEW,
    })
    findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(project) })
    const regeneratedBudget: BudgetAgentOutput = {
      agent: 'budget',
      assumptions: ['Cantidad derivada del cronograma confirmado.'],
      clarificationQuestions: [],
      consistencyWarnings: [],
      components: {
        budget: {
          currency: 'COP',
          items: [
            {
              activity: 'Realizar la caracterización técnica del territorio.',
              activityIds: ['A1'],
              category: 'Talento humano',
              description: 'Profesional responsable de la actividad A1.',
              fundingSource: null,
              id: 'B1',
              objective: 'Caracterizar técnicamente el territorio.',
              objectiveIds: ['O1'],
              quantity: 2,
              total: 4_000_000,
              unit: 'mes',
              unitCost: 2_000_000,
              valueStatus: 'confirmed',
            },
          ],
          narrative:
            'Presupuesto regenerado con precios verificables, trazabilidad por actividad, relación con el cronograma y validación matemática del costo total.',
          total: 4_000_000,
          valueStatus: 'confirmed',
        },
      },
    }
    let capturedInput: ProjectGenerationInput | undefined
    generate.mockImplementation(
      (
        input: ProjectGenerationInput,
        lifecycle: ProjectGenerationLifecycle,
      ) => {
        capturedInput = input
        return Promise.resolve(
          lifecycle.onAgentCompleted?.('budget', regeneratedBudget),
        ).then(() => ({ budget: regeneratedBudget }))
      },
    )

    const result = await service.regenerateBudget(OWNER_ID, project.id)

    expect(capturedInput?.stopAfterAgent).toBe('budget')
    expect(capturedInput?.initialOutputs).toEqual({
      ideation: storedOutputs.ideation,
      methodology: storedOutputs.methodology,
      research: storedOutputs.research,
    })
    expect(capturedInput?.initialOutputs?.budget).toBeUndefined()
    expect(result.currentContent).toContain('4.000.000')
    expect(project.agentOutputs.impact).toBe(storedOutputs.impact)
    expect(project.agentOutputs.budget).toBe(regeneratedBudget)
    expect(project.fragmentRegenerationCount).toBe(1)
    expect(project.state).toBe(PROJECT_STATES.WAITING_REVIEW)

    await service.regenerateBudget(OWNER_ID, project.id)
    await service.regenerateBudget(OWNER_ID, project.id)
    expect(project.fragmentRegenerationCount).toBe(3)
    await expect(
      service.regenerateBudget(OWNER_ID, project.id),
    ).rejects.toBeInstanceOf(BadRequestException)
    expect(generate).toHaveBeenCalledTimes(3)
  })

  it('exige y confirma las nueve respuestas antes de metodología', async () => {
    const project = projectFixture({
      executionDetails: {},
      state: PROJECT_STATES.WAITING_EXECUTION_DETAILS,
    })
    findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(project) })

    await expect(
      service.confirmExecutionDetails(OWNER_ID, project.id),
    ).rejects.toBeInstanceOf(BadRequestException)

    await service.updateExecutionDetails(OWNER_ID, project.id, {
      activityDevelopment: 'Pasos de ejecución por actividad.',
      participants: 'Equipo técnico y aliados.',
      locationsAndParticipants: 'Bolívar, con veinte participantes.',
      requiredResources: 'Equipos, licencias y materiales.',
      timelineAndDependencies: 'Seis meses en orden secuencial.',
      expectedDeliverables: 'Informes y prototipos validados.',
      verificationMethods: 'Actas, pruebas e indicadores.',
      knownEconomicInformation: 'Valores sujetos a cotización.',
      specialConditions: 'Cumplimiento de requisitos técnicos.',
    })
    const result = await service.confirmExecutionDetails(OWNER_ID, project.id)

    expect(result.state).toBe(PROJECT_STATES.EXECUTION_DETAILS_CONFIRMED)
    expect(project.executionDetailsConfirmedAt).toBeInstanceOf(Date)
    expect(result.progress).toBe(60)
  })

  it('aprueba y persiste un componente generado', async () => {
    const now = new Date('2026-08-14T20:00:00.000Z')
    const project = projectFixture({
      components: [
        {
          agent: 'research',
          aiGeneratedContent: 'Contenido generado suficientemente completo.',
          createdAt: now,
          currentContent: 'Contenido generado suficientemente completo.',
          id: 'component-id',
          modifiedBy: 'ai',
          status: 'generated',
          type: 'theoretical_framework',
          updatedAt: now,
        },
      ],
      state: PROJECT_STATES.WAITING_REVIEW,
    })
    findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(project) })

    const result = await service.approveComponent(
      OWNER_ID,
      project.id,
      'component-id',
    )

    expect(result.status).toBe('approved')
    expect(result.approvedAt).toBeDefined()
    expect(project.components[0].status).toBe('approved')
  })

  it('guarda la edición de un componente en MongoDB', async () => {
    const now = new Date('2026-08-14T20:00:00.000Z')
    const project = projectFixture({
      components: [
        {
          agent: 'research',
          aiGeneratedContent: 'Contenido generado suficientemente completo.',
          createdAt: now,
          currentContent: 'Contenido generado suficientemente completo.',
          id: 'component-id',
          modifiedBy: 'ai',
          status: 'generated',
          type: 'theoretical_framework',
          updatedAt: now,
        },
      ],
      state: PROJECT_STATES.WAITING_REVIEW,
    })
    findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(project) })

    const result = await service.updateComponent(
      OWNER_ID,
      project.id,
      'component-id',
      'Contenido editado por la persona revisora.',
    )

    expect(result.currentContent).toBe(
      'Contenido editado por la persona revisora.',
    )
    expect(result.modifiedBy).toBe('user')
    expect(result.status).toBe('needs_revision')
  })

  it('ensambla, consulta y completa un documento persistido por propietario', async () => {
    const now = new Date('2026-08-14T20:00:00.000Z')
    const project = projectFixture({
      components: FORMULATION_COMPONENT_REGISTRY.map(
        ({ agent, component, label }) => ({
          agent,
          aiGeneratedContent: `Contenido generado de ${label}.`,
          approvedAt: now,
          createdAt: now,
          currentContent: `Contenido aprobado de ${label}.`,
          id: `component-${component}`,
          modifiedBy: 'user' as const,
          status: 'approved' as const,
          type: component,
          updatedAt: now,
        }),
      ),
      language: 'es',
      state: PROJECT_STATES.WAITING_REVIEW,
    })
    findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(project) })

    const assembled = await service.assembleDocument(OWNER_ID, project.id)
    const persisted = await service.getDocument(OWNER_ID, project.id)
    const completed = await service.completeProject(OWNER_ID, project.id)

    expect(assembled.sections).toHaveLength(13)
    expect(assembled.sections[0]?.title).toBe('Marco teórico')
    expect(assembled.sections[9]?.title).toBe('Presupuesto')
    expect(assembled.sections[12]?.title).toBe('Impactos esperados')
    expect(persisted.id).toBe(assembled.id)
    expect(project.document?.sections).toHaveLength(13)
    expect(completed.hasDocument).toBe(true)
    expect(completed.state).toBe(PROJECT_STATES.COMPLETED)
    expect(completed.progress).toBe(100)

    const regenerated = await service.regenerateProject(OWNER_ID, project.id)
    expect(regenerated.fullProjectRegenerationCount).toBe(1)
    expect(regenerated.hasDocument).toBe(false)
    expect(regenerated.state).toBe(PROJECT_STATES.CONTEXT_CONFIRMED)
    expect(project.components).toEqual([])
    await expect(
      service.regenerateProject(OWNER_ID, project.id),
    ).rejects.toBeInstanceOf(BadRequestException)
  })

  it('persiste la traducción dentro del mismo proyecto del usuario', async () => {
    const now = new Date('2026-08-14T20:00:00.000Z')
    const project = projectFixture({
      document: {
        content: '1. ACTIVIDADES\n\nContenido.',
        generatedAt: now,
        id: 'document-id',
        language: 'es',
        projectId: '507f1f77bcf86cd799439011',
        sections: [
          {
            componentId: 'component-id',
            content: 'Contenido.',
            id: 'activities',
            order: 6,
            title: 'Actividades',
          },
        ],
        status: 'ready',
        title: 'Proyecto de prueba',
      },
      state: PROJECT_STATES.DOCUMENT_READY,
    })
    findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(project) })
    translateProjectDocument.mockResolvedValue({
      projectTitle: 'Test project',
      sections: [{ content: 'Content.', id: 'activities' }],
    })

    const translated = await service.translateDocument(
      OWNER_ID,
      project.id,
      'en',
    )

    expect(translated.language).toBe('en')
    expect(translated.sections[0].title).toBe('Activities')
    expect(translated.sections[0].content).toBe('Content.')
    expect(project.document?.language).toBe('es')
    expect(project.documentVersions?.es?.language).toBe('es')
    expect(project.documentVersions?.en?.language).toBe('en')
    await expect(
      service.getDocument(OWNER_ID, project.id, 'es'),
    ).resolves.toEqual(expect.objectContaining({ language: 'es' }))
    await expect(
      service.getDocument(OWNER_ID, project.id, 'en'),
    ).resolves.toEqual(expect.objectContaining({ language: 'en' }))
  })
})
