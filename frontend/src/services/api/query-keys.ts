export const queryKeys = {
  projects: {
    all: ['projects'] as const,
    detail: (projectId: string) => ['projects', projectId] as const,
    context: (projectId: string) => ['projects', projectId, 'context'] as const,
    executionDetails: (projectId: string) =>
      ['projects', projectId, 'execution-details'] as const,
    messages: (projectId: string) =>
      ['projects', projectId, 'messages'] as const,
    components: (projectId: string) =>
      ['projects', projectId, 'components'] as const,
    component: (projectId: string, componentId: string) =>
      ['projects', projectId, 'components', componentId] as const,
    document: (projectId: string, language: 'en' | 'es' = 'es') =>
      ['projects', projectId, 'document', language] as const,
  },
  skills: {
    all: ['skills'] as const,
  },
} as const
