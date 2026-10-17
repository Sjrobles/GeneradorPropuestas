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
} from '@/types/domain'

import type { BudgetWorkbookDownload, CreateProjectInput } from './agora-api'
import { getAccessToken } from '@/services/auth/auth-session'
import { classifyFetchError } from './api-errors'
import { ensureBackendReady } from './backend-readiness'
import { apiErrorFromResponse } from './api-response'

const DEFAULT_API_URL = 'http://127.0.0.1:3000/api/v1'

export class BackendAgoraApi {
  private readonly baseUrl: string

  constructor(baseUrl?: string) {
    this.baseUrl =
      baseUrl ??
      import.meta.env.VITE_API_URL?.replace(/\/$/, '') ??
      DEFAULT_API_URL
  }

  listSkills() {
    return this.request<Skill[]>('/skills')
  }

  createProject(input: CreateProjectInput) {
    return this.request<Project>('/projects', {
      body: JSON.stringify(input),
      method: 'POST',
    })
  }

  getProject(projectId: string) {
    return this.request<Project>(`/projects/${projectId}`)
  }

  listProjects() {
    return this.request<Project[]>('/projects')
  }

  selectLanguage(projectId: string, language: ProjectLanguage) {
    return this.request<Project>(`/projects/${projectId}/language`, {
      body: JSON.stringify({ language }),
      method: 'PATCH',
    })
  }

  getChatMessages(projectId: string) {
    return this.request<ChatMessage[]>(`/projects/${projectId}/messages`)
  }

  sendMessage(projectId: string, content: string) {
    return this.request<ChatMessage[]>(`/projects/${projectId}/messages`, {
      body: JSON.stringify({ content }),
      method: 'POST',
    })
  }

  getProjectContext(projectId: string) {
    return this.request<ProjectContext>(`/projects/${projectId}/context`)
  }

  updateProjectContext(
    projectId: string,
    input: Partial<Omit<ProjectContext, 'projectId'>>,
  ) {
    return this.request<ProjectContext>(`/projects/${projectId}/context`, {
      body: JSON.stringify(input),
      method: 'PATCH',
    })
  }

  diagnoseContext(projectId: string) {
    return this.request<DiagnosisResult>(`/projects/${projectId}/diagnosis`, {
      method: 'POST',
    })
  }

  confirmContext(projectId: string) {
    return this.request<Project>(`/projects/${projectId}/context/confirm`, {
      method: 'POST',
    })
  }

  getExecutionDetails(projectId: string) {
    return this.request<ExecutionDetails>(
      `/projects/${projectId}/execution-details`,
    )
  }

  updateExecutionDetails(
    projectId: string,
    input: Partial<Omit<ExecutionDetails, 'confirmedAt' | 'projectId'>>,
  ) {
    return this.request<ExecutionDetails>(
      `/projects/${projectId}/execution-details`,
      {
        body: JSON.stringify(input),
        method: 'PATCH',
      },
    )
  }

  confirmExecutionDetails(projectId: string) {
    return this.request<Project>(
      `/projects/${projectId}/execution-details/confirm`,
      { method: 'POST' },
    )
  }

  getComponents(projectId: string) {
    return this.request<ProjectComponent[]>(`/projects/${projectId}/components`)
  }

  generateComponents(projectId: string) {
    return this.request<GenerationJob>(
      `/projects/${projectId}/components/generate`,
      { method: 'POST' },
    )
  }

  regenerateBudget(projectId: string) {
    return this.request<ProjectComponent>(
      `/projects/${projectId}/components/budget/regenerate`,
      { method: 'POST' },
    )
  }

  async downloadBudgetWorkbook(
    projectId: string,
  ): Promise<BudgetWorkbookDownload> {
    const token = getAccessToken()
    let response: Response
    try {
      response = await fetch(
        `${this.baseUrl}/projects/${projectId}/components/budget/workbook`,
        {
          headers: {
            Accept:
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          signal: AbortSignal.timeout(45_000),
        },
      )
    } catch (error) {
      throw classifyFetchError(error)
    }
    if (!response.ok) {
      throw await apiErrorFromResponse(response)
    }
    const disposition = response.headers.get('Content-Disposition') ?? ''
    const fileName =
      disposition.match(/filename="?([^";]+)"?/i)?.[1] ??
      'presupuesto-agora.xlsx'
    return { blob: await response.blob(), fileName }
  }

  importBudgetWorkbook(projectId: string, file: File) {
    const body = new FormData()
    body.append('file', file)
    return this.request<ProjectComponent>(
      `/projects/${projectId}/components/budget/workbook`,
      { body, method: 'POST' },
    )
  }

  regenerateComponent(projectId: string, componentId: string) {
    return this.request<ProjectComponent>(
      `/projects/${projectId}/components/${componentId}/regenerate`,
      { method: 'POST' },
    )
  }

  regenerateProject(projectId: string) {
    return this.request<Project>(`/projects/${projectId}/regenerate`, {
      method: 'POST',
    })
  }

  getComponent(projectId: string, componentId: string) {
    return this.request<ProjectComponent>(
      `/projects/${projectId}/components/${componentId}`,
    )
  }

  updateComponent(
    projectId: string,
    componentId: string,
    input: { content: string },
  ) {
    return this.request<ProjectComponent>(
      `/projects/${projectId}/components/${componentId}`,
      {
        body: JSON.stringify(input),
        method: 'PATCH',
      },
    )
  }

  approveComponent(projectId: string, componentId: string) {
    return this.request<ProjectComponent>(
      `/projects/${projectId}/components/${componentId}/approve`,
      { method: 'POST' },
    )
  }

  assembleDocument(projectId: string) {
    return this.request<ProjectDocument>(
      `/projects/${projectId}/document/assemble`,
      { method: 'POST' },
    )
  }

  getDocument(projectId: string, language?: ProjectLanguage) {
    const query = language ? `?language=${language}` : ''
    return this.request<ProjectDocument>(
      `/projects/${projectId}/document${query}`,
    )
  }

  translateDocument(projectId: string, targetLanguage: ProjectLanguage) {
    return this.request<ProjectDocument>(
      `/projects/${projectId}/document/translate`,
      {
        body: JSON.stringify({ targetLanguage }),
        method: 'POST',
      },
    )
  }

  completeProject(projectId: string) {
    return this.request<Project>(`/projects/${projectId}/complete`, {
      method: 'POST',
    })
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    let response: Response
    const token = getAccessToken()
    const longRunningRequest =
      path.includes('/components/generate') ||
      path.includes('/regenerate') ||
      path.includes('/document/translate')

    const isFormData =
      typeof FormData !== 'undefined' && init?.body instanceof FormData
    const request = () =>
      fetch(`${this.baseUrl}${path}`, {
        ...init,
        signal:
          init?.signal ??
          AbortSignal.timeout(longRunningRequest ? 15 * 60_000 : 45_000),
        headers: {
          Accept: 'application/json',
          ...(init?.body && !isFormData
            ? { 'Content-Type': 'application/json' }
            : {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...init?.headers,
        },
      })
    const safeToRetry = !init?.method || init.method === 'GET'

    try {
      response = await request()
    } catch (error) {
      if (!safeToRetry) throw classifyFetchError(error)
      try {
        await ensureBackendReady(this.baseUrl)
        response = await request()
      } catch (retryError) {
        throw classifyFetchError(retryError)
      }
    }

    if (safeToRetry && [502, 503, 504].includes(response.status)) {
      try {
        await ensureBackendReady(this.baseUrl)
        response = await request()
      } catch (error) {
        throw classifyFetchError(error)
      }
    }

    if (!response.ok) {
      throw await apiErrorFromResponse(response)
    }

    return (await response.json()) as T
  }
}
