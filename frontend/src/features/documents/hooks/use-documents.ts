import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { agoraApi } from '@/services/api/client'
import { queryKeys } from '@/services/api/query-keys'
import type { ProjectLanguage } from '@/types/domain'

export function useDocumentQuery(
  projectId: string,
  language: ProjectLanguage = 'es',
) {
  return useQuery({
    queryKey: queryKeys.projects.document(projectId, language),
    queryFn: () => agoraApi.getDocument(projectId, language),
    enabled: Boolean(projectId),
    retry: false,
  })
}

export function useAssembleDocumentMutation(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => agoraApi.assembleDocument(projectId),
    onSuccess: (document) => {
      queryClient.setQueryData(
        queryKeys.projects.document(projectId, document.language),
        document,
      )
      void queryClient.invalidateQueries({
        queryKey: queryKeys.projects.detail(projectId),
      })
      void queryClient.invalidateQueries({ queryKey: queryKeys.projects.all })
    },
  })
}

export function useTranslateDocumentMutation(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (targetLanguage: ProjectLanguage) =>
      agoraApi.translateDocument(projectId, targetLanguage),
    onSuccess: (document) => {
      queryClient.setQueryData(
        queryKeys.projects.document(projectId, document.language),
        document,
      )
      void queryClient.invalidateQueries({
        queryKey: queryKeys.projects.detail(projectId),
      })
    },
  })
}

export function useCompleteProjectMutation(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => agoraApi.completeProject(projectId),
    onSuccess: (project) => {
      queryClient.setQueryData(queryKeys.projects.detail(projectId), project)
      void queryClient.invalidateQueries({ queryKey: queryKeys.projects.all })
    },
  })
}
