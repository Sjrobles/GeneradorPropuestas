import { useQuery } from '@tanstack/react-query'

import { agoraApi } from '@/services/api/client'
import { queryKeys } from '@/services/api/query-keys'

export function useSkillsQuery() {
  return useQuery({
    queryKey: queryKeys.skills.all,
    queryFn: () => agoraApi.listSkills(),
    staleTime: Number.POSITIVE_INFINITY,
  })
}
