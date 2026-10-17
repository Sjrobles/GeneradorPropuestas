import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { agoraApi } from '@/services/api/client'
import { queryKeys } from '@/services/api/query-keys'
import { coordinateGenerationRequest } from '@/services/orchestration/generation-request-coordinator'
import { COMPONENT_STATUSES } from '@/types/domain'

export function useComponentsQuery(projectId: string) {
  return useQuery({
    queryKey: queryKeys.projects.components(projectId),
    queryFn: () => agoraApi.getComponents(projectId),
    enabled: Boolean(projectId),
    refetchInterval: (query) => {
      const components = query.state.data
      if (!components?.length) return 300
      return components.some(
        ({ status }) =>
          status === COMPONENT_STATUSES.PENDING ||
          status === COMPONENT_STATUSES.GENERATING,
      )
        ? 300
        : false
    },
  })
}

export function useComponentQuery(projectId: string, componentId: string) {
  return useQuery({
    queryKey: queryKeys.projects.component(projectId, componentId),
    queryFn: () => agoraApi.getComponent(projectId, componentId),
    enabled: Boolean(projectId && componentId),
  })
}

export function useGenerateComponentsMutation(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () =>
      coordinateGenerationRequest(projectId, () =>
        agoraApi.generateComponents(projectId),
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.projects.components(projectId),
      })
      void queryClient.invalidateQueries({
        queryKey: queryKeys.projects.detail(projectId),
      })
    },
  })
}

export function useRegenerateBudgetMutation(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => agoraApi.regenerateBudget(projectId),
    onSuccess: (component) => {
      queryClient.setQueryData(
        queryKeys.projects.components(projectId),
        (components: (typeof component)[] | undefined) =>
          components?.map((current) =>
            current.id === component.id ? component : current,
          ),
      )
      queryClient.setQueryData(
        queryKeys.projects.component(projectId, component.id),
        component,
      )
      void queryClient.invalidateQueries({
        queryKey: queryKeys.projects.detail(projectId),
      })
    },
  })
}

export function useDownloadBudgetWorkbookMutation(projectId: string) {
  return useMutation({
    mutationFn: () => agoraApi.downloadBudgetWorkbook(projectId),
  })
}

export function useImportBudgetWorkbookMutation(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (file: File) => agoraApi.importBudgetWorkbook(projectId, file),
    onSuccess: (component) => {
      queryClient.setQueryData(
        queryKeys.projects.component(projectId, component.id),
        component,
      )
      queryClient.setQueryData(
        queryKeys.projects.components(projectId),
        (components: (typeof component)[] | undefined) =>
          components?.map((current) =>
            current.id === component.id ? component : current,
          ),
      )
      void queryClient.invalidateQueries({
        queryKey: queryKeys.projects.detail(projectId),
      })
    },
  })
}

export function useRegenerateComponentMutation(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (componentId: string) =>
      agoraApi.regenerateComponent(projectId, componentId),
    onSuccess: (component) => {
      queryClient.setQueryData(
        queryKeys.projects.components(projectId),
        (components: (typeof component)[] | undefined) =>
          components?.map((current) =>
            current.id === component.id ? component : current,
          ),
      )
      queryClient.setQueryData(
        queryKeys.projects.component(projectId, component.id),
        component,
      )
      void queryClient.invalidateQueries({
        queryKey: queryKeys.projects.detail(projectId),
      })
    },
  })
}

interface UpdateComponentInput {
  componentId: string
  content: string
}

export function useUpdateComponentMutation(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ componentId, content }: UpdateComponentInput) =>
      agoraApi.updateComponent(projectId, componentId, { content }),
    onSuccess: (component) => {
      queryClient.setQueryData(
        queryKeys.projects.component(projectId, component.id),
        component,
      )
      void queryClient.invalidateQueries({
        queryKey: queryKeys.projects.components(projectId),
      })
    },
  })
}

export function useApproveComponentMutation(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (componentId: string) =>
      agoraApi.approveComponent(projectId, componentId),
    onSuccess: (component) => {
      queryClient.setQueryData(
        queryKeys.projects.component(projectId, component.id),
        component,
      )
      void queryClient.invalidateQueries({
        queryKey: queryKeys.projects.components(projectId),
      })
    },
  })
}
