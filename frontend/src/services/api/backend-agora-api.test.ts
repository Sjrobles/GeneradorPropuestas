import { afterEach, describe, expect, it, vi } from 'vitest'

import { clearAuthSession, saveAuthSession } from '@/services/auth/auth-session'

import { BackendAgoraApi } from './backend-agora-api'

const VALID_ACCESS_TOKEN = 'eyJhbGciOiJub25lIn0.eyJleHAiOjQxNDY2NzIwMDB9.'

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json' },
    status,
  })
}

describe('BackendAgoraApi', () => {
  afterEach(() => {
    clearAuthSession()
    vi.unstubAllGlobals()
  })

  it('verifica el propietario al consultar un proyecto', async () => {
    saveAuthSession({
      accessToken: VALID_ACCESS_TOKEN,
      user: {
        createdAt: '2026-08-14T00:00:00.000Z',
        email: 'alejandro@example.com',
        id: 'user-id',
        name: 'Alejandro Fontalvo',
      },
    })
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      jsonResponse({
        createdAt: '2026-08-14T00:00:00.000Z',
        id: 'project-id',
        progress: 0,
        selectedSkillId: 'international-calls',
        state: 'created',
        title: 'Proyecto privado',
        updatedAt: '2026-08-14T00:00:00.000Z',
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const api = new BackendAgoraApi('http://api.test/api/v1')
    await api.getProject('project-id')

    const headers = new Headers(fetchMock.mock.calls[0]?.[1]?.headers)
    expect(headers.get('Authorization')).toBe(`Bearer ${VALID_ACCESS_TOKEN}`)
  })

  it('consulta las skills del backend', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      jsonResponse([
        {
          description: 'Skill disponible',
          enabled: true,
          id: 'international-calls',
          name: 'Convocatorias internacionales',
        },
      ]),
    )
    vi.stubGlobal('fetch', fetchMock)

    const api = new BackendAgoraApi('http://api.test/api/v1')
    const skills = await api.listSkills()

    expect(skills).toHaveLength(1)
    expect(fetchMock.mock.calls[0]?.[0]).toBe('http://api.test/api/v1/skills')
    const requestHeaders = new Headers(fetchMock.mock.calls[0]?.[1]?.headers)
    expect(requestHeaders.get('Accept')).toBe('application/json')
  })

  it('crea un proyecto mediante JSON', async () => {
    const project = {
      createdAt: '2026-08-14T00:00:00.000Z',
      id: 'project-id',
      progress: 0,
      selectedSkillId: 'international-calls',
      state: 'created' as const,
      title: 'Proyecto de prueba',
      updatedAt: '2026-08-14T00:00:00.000Z',
    }
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(jsonResponse(project, 201))
    vi.stubGlobal('fetch', fetchMock)

    const api = new BackendAgoraApi('http://api.test/api/v1')
    await expect(
      api.createProject({
        selectedSkillId: project.selectedSkillId,
        title: project.title,
      }),
    ).resolves.toEqual(project)
    expect(fetchMock).toHaveBeenCalledWith(
      'http://api.test/api/v1/projects',
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it('envía el mensaje del chat al backend autenticado', async () => {
    saveAuthSession({
      accessToken: VALID_ACCESS_TOKEN,
      user: {
        createdAt: '2026-08-14T00:00:00.000Z',
        email: 'alejandro@example.com',
        id: 'user-id',
        name: 'Alejandro Fontalvo',
      },
    })
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(jsonResponse([], 201))
    vi.stubGlobal('fetch', fetchMock)

    const api = new BackendAgoraApi('http://api.test/api/v1')
    await api.sendMessage('project-id', 'El problema está en la zona rural.')

    expect(fetchMock).toHaveBeenCalledWith(
      'http://api.test/api/v1/projects/project-id/messages',
      expect.objectContaining({
        body: JSON.stringify({
          content: 'El problema está en la zona rural.',
        }),
        method: 'POST',
      }),
    )
    const headers = new Headers(fetchMock.mock.calls[0]?.[1]?.headers)
    expect(headers.get('Authorization')).toBe(`Bearer ${VALID_ACCESS_TOKEN}`)
  })

  it('solicita el diagnóstico estructurado al backend', async () => {
    const diagnosis = {
      ambiguities: [],
      complete: true,
      inconsistencies: [],
      missingFields: [],
      questions: [],
    }
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(jsonResponse(diagnosis, 201))
    vi.stubGlobal('fetch', fetchMock)

    const api = new BackendAgoraApi('http://api.test/api/v1')
    await expect(api.diagnoseContext('project-id')).resolves.toEqual(diagnosis)
    expect(fetchMock).toHaveBeenCalledWith(
      'http://api.test/api/v1/projects/project-id/diagnosis',
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it('persiste y confirma los ajustes del contexto', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        jsonResponse({ problem: 'Problema ajustado', projectId: 'project-id' }),
      )
      .mockResolvedValueOnce(
        jsonResponse({ id: 'project-id', state: 'context_confirmed' }, 201),
      )
    vi.stubGlobal('fetch', fetchMock)

    const api = new BackendAgoraApi('http://api.test/api/v1')
    await api.updateProjectContext('project-id', {
      problem: 'Problema ajustado',
    })
    await api.confirmContext('project-id')

    expect(fetchMock.mock.calls[0]?.[0]).toContain('/project-id/context')
    expect(fetchMock.mock.calls[0]?.[1]).toEqual(
      expect.objectContaining({ method: 'PATCH' }),
    )
    expect(fetchMock.mock.calls[1]?.[0]).toContain('/context/confirm')
  })

  it('inicia la generación multiagente y consulta sus componentes', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse([], 201))
      .mockResolvedValueOnce(jsonResponse([]))
    vi.stubGlobal('fetch', fetchMock)

    const api = new BackendAgoraApi('http://api.test/api/v1')
    await api.generateComponents('project-id')
    await api.getComponents('project-id')

    expect(fetchMock.mock.calls[0]?.[0]).toContain(
      '/projects/project-id/components/generate',
    )
    expect(fetchMock.mock.calls[0]?.[1]).toEqual(
      expect.objectContaining({ method: 'POST' }),
    )
    expect(fetchMock.mock.calls[1]?.[0]).toContain(
      '/projects/project-id/components',
    )
  })

  it('regenera únicamente presupuesto mediante la ruta aislada', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(jsonResponse({ id: 'budget-id', type: 'budget' }, 201))
    vi.stubGlobal('fetch', fetchMock)

    const api = new BackendAgoraApi('http://api.test/api/v1')
    await api.regenerateBudget('project-id')

    expect(fetchMock).toHaveBeenCalledWith(
      'http://api.test/api/v1/projects/project-id/components/budget/regenerate',
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it('descarga el presupuesto Excel con el nombre indicado por el backend', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(new Uint8Array([1, 2, 3]), {
        headers: {
          'Content-Disposition': 'attachment; filename="presupuesto-demo.xlsx"',
          'Content-Type':
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const api = new BackendAgoraApi('http://api.test/api/v1')
    const result = await api.downloadBudgetWorkbook('project-id')

    expect(result.fileName).toBe('presupuesto-demo.xlsx')
    expect(result.blob.size).toBe(3)
    expect(fetchMock.mock.calls[0]?.[0]).toContain(
      '/projects/project-id/components/budget/workbook',
    )
  })

  it('sube el Excel como formulario sin forzar Content-Type JSON', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(jsonResponse({ id: 'budget-id', type: 'budget' }, 201))
    vi.stubGlobal('fetch', fetchMock)

    const api = new BackendAgoraApi('http://api.test/api/v1')
    const file = new File(['xlsx'], 'presupuesto.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    await api.importBudgetWorkbook('project-id', file)

    const init = fetchMock.mock.calls[0]?.[1]
    expect(init?.body).toBeInstanceOf(FormData)
    expect(new Headers(init?.headers).get('Content-Type')).toBeNull()
    expect(init?.method).toBe('POST')
  })

  it('guarda y confirma las respuestas operativas obligatorias', async () => {
    const details = {
      activityDevelopment: 'Pasos por actividad.',
      participants: 'Equipo técnico.',
      projectId: 'project-id',
    }
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse(details))
      .mockResolvedValueOnce(
        jsonResponse(
          { id: 'project-id', state: 'execution_details_confirmed' },
          201,
        ),
      )
    vi.stubGlobal('fetch', fetchMock)

    const api = new BackendAgoraApi('http://api.test/api/v1')
    await api.updateExecutionDetails('project-id', details)
    await api.confirmExecutionDetails('project-id')

    expect(fetchMock.mock.calls[0]?.[0]).toContain(
      '/projects/project-id/execution-details',
    )
    expect(fetchMock.mock.calls[0]?.[1]).toEqual(
      expect.objectContaining({ method: 'PATCH' }),
    )
    expect(fetchMock.mock.calls[1]?.[0]).toContain('/execution-details/confirm')
  })

  it('usa el backend autenticado para listar y persistir documentos', async () => {
    const project = {
      createdAt: '2026-08-14T00:00:00.000Z',
      hasDocument: true,
      id: 'project-id',
      progress: 92,
      selectedSkillId: 'international-calls',
      state: 'document_ready',
      title: 'Documento de Samuel',
      updatedAt: '2026-08-14T00:00:00.000Z',
    }
    const document = {
      content: 'Contenido',
      generatedAt: '2026-08-14T00:00:00.000Z',
      id: 'document-id',
      language: 'es',
      projectId: 'project-id',
      sections: [],
      status: 'ready',
      title: project.title,
    }
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse([project]))
      .mockResolvedValueOnce(jsonResponse(document, 201))
      .mockResolvedValueOnce(jsonResponse(document))
      .mockResolvedValueOnce(jsonResponse({ ...project, progress: 100 }, 201))
    vi.stubGlobal('fetch', fetchMock)

    const api = new BackendAgoraApi('http://api.test/api/v1')
    await api.listProjects()
    await api.assembleDocument('project-id')
    await api.getDocument('project-id')
    await api.completeProject('project-id')

    expect(
      fetchMock.mock.calls.map(([url]) =>
        typeof url === 'string' ? url : url instanceof URL ? url.href : url.url,
      ),
    ).toEqual([
      'http://api.test/api/v1/projects',
      'http://api.test/api/v1/projects/project-id/document/assemble',
      'http://api.test/api/v1/projects/project-id/document',
      'http://api.test/api/v1/projects/project-id/complete',
    ])
  })

  it('convierte los errores del backend en mensajes comprensibles', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn<typeof fetch>()
        .mockResolvedValue(
          jsonResponse({ message: 'La skill no está disponible' }, 400),
        ),
    )

    const api = new BackendAgoraApi('http://api.test/api/v1')

    await expect(
      api.createProject({ selectedSkillId: 'disabled', title: 'Prueba' }),
    ).rejects.toThrow('La skill no está disponible')
  })
})
