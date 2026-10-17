import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { agoraApi } from '@/services/api/client'
import type { CreateProjectInput } from '@/services/api/agora-api'
import { queryKeys } from '@/services/api/query-keys'
import type {
  ExecutionDetails,
  ProjectContext,
  ProjectLanguage,
} from '@/types/domain'
import { PROJECT_STATES } from '@/types/domain'

export function useProjectQuery(projectId: string) {
  return useQuery({
    queryKey: queryKeys.projects.detail(projectId),
    queryFn: () => agoraApi.getProject(projectId),
    enabled: Boolean(projectId),
    refetchInterval: (query) => {
      const state = query.state.data?.state
      return state === PROJECT_STATES.CONTEXT_CONFIRMED ||
        state === PROJECT_STATES.EXECUTION_DETAILS_CONFIRMED ||
        state === PROJECT_STATES.GENERATING_COMPONENTS ||
        state === PROJECT_STATES.ASSEMBLING ||
        state === PROJECT_STATES.TRANSLATING
        ? 1_000
        : false
    },
  })
}

export function useProjectsQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.projects.all,
    queryFn: () => agoraApi.listProjects(),
    enabled,
  })
}

export function useCreateProjectMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateProjectInput) => agoraApi.createProject(input),
    onSuccess: (project) => {
      queryClient.setQueryData(queryKeys.projects.detail(project.id), project)
      void queryClient.invalidateQueries({ queryKey: queryKeys.projects.all })
    },
  })
}

interface SelectLanguageInput {
  language: ProjectLanguage
  projectId: string
}

export function useSelectLanguageMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ language, projectId }: SelectLanguageInput) =>
      agoraApi.selectLanguage(projectId, language),
    onSuccess: (project) => {
      queryClient.setQueryData(queryKeys.projects.detail(project.id), project)
    },
  })
}

export function useChatMessagesQuery(projectId: string) {
  return useQuery({
    queryKey: queryKeys.projects.messages(projectId),
    queryFn: () => agoraApi.getChatMessages(projectId),
    enabled: Boolean(projectId),
  })
}

export function useProjectContextQuery(projectId: string) {
  return useQuery({
    queryKey: queryKeys.projects.context(projectId),
    queryFn: () => agoraApi.getProjectContext(projectId),
    enabled: Boolean(projectId),
  })
}

export function useSendMessageMutation(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (content: string) => agoraApi.sendMessage(projectId, content),
    onSuccess: (messages) => {
      queryClient.setQueryData(queryKeys.projects.messages(projectId), messages)
      void queryClient.invalidateQueries({
        queryKey: queryKeys.projects.context(projectId),
      })
      void queryClient.invalidateQueries({
        queryKey: queryKeys.projects.detail(projectId),
      })
    },
  })
}

export function useDiagnoseContextMutation(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => agoraApi.diagnoseContext(projectId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.projects.detail(projectId),
      })
    },
  })
}

interface UpdateContextInput {
  input: Partial<Omit<ProjectContext, 'projectId'>>
  projectId: string
}

export function useUpdateProjectContextMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ input, projectId }: UpdateContextInput) =>
      agoraApi.updateProjectContext(projectId, input),
    onSuccess: (context) => {
      queryClient.setQueryData(
        queryKeys.projects.context(context.projectId),
        context,
      )
    },
  })
}

export function useConfirmContextMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (projectId: string) => agoraApi.confirmContext(projectId),
    onSuccess: (project) => {
      queryClient.setQueryData(queryKeys.projects.detail(project.id), project)
    },
  })
}

export function useExecutionDetailsQuery(projectId: string) {
  return useQuery({
    queryKey: queryKeys.projects.executionDetails(projectId),
    queryFn: () => agoraApi.getExecutionDetails(projectId),
    enabled: Boolean(projectId),
  })
}

interface UpdateExecutionDetailsInput {
  input: Partial<Omit<ExecutionDetails, 'confirmedAt' | 'projectId'>>
  projectId: string
}

export function useUpdateExecutionDetailsMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ input, projectId }: UpdateExecutionDetailsInput) =>
      agoraApi.updateExecutionDetails(projectId, input),
    onSuccess: (details) => {
      queryClient.setQueryData(
        queryKeys.projects.executionDetails(details.projectId),
        details,
      )
    },
  })
}

export function useConfirmExecutionDetailsMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (projectId: string) =>
      agoraApi.confirmExecutionDetails(projectId),
    onSuccess: (project) => {
      queryClient.setQueryData(queryKeys.projects.detail(project.id), project)
    },
  })
}

export function useRegenerateProjectMutation(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => agoraApi.regenerateProject(projectId),
    onSuccess: (project) => {
      queryClient.setQueryData(queryKeys.projects.detail(project.id), project)
      queryClient.setQueryData(queryKeys.projects.components(project.id), [])
      void queryClient.invalidateQueries({ queryKey: queryKeys.projects.all })
    },
  })
}
