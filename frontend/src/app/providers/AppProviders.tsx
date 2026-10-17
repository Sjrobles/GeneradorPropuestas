import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect, useState, type PropsWithChildren } from 'react'

import { backendAuthApi } from '@/services/auth/backend-auth-api'

export function AppProviders({ children }: PropsWithChildren) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            staleTime: 30_000,
            refetchOnWindowFocus: false,
          },
          mutations: {
            retry: 0,
          },
        },
      }),
  )

  useEffect(() => {
    if (import.meta.env.VITE_API_MODE === 'backend') {
      void backendAuthApi.warmUp()
    }
  }, [])

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
