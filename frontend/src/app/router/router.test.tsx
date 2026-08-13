import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it } from 'vitest'

import { routes } from './routes'

function renderRoute(initialEntry: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  const router = createMemoryRouter(routes, { initialEntries: [initialEntry] })

  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

describe('router', () => {
  it('renders the web bootstrap page', () => {
    renderRoute('/')
    expect(
      screen.getByRole('heading', {
        name: /Ágora ya tiene una base web sólida/i,
      }),
    ).toBeInTheDocument()
  })

  it('supports a direct project route', () => {
    renderRoute('/projects/demo/review')
    expect(
      screen.getByRole('heading', { name: 'Workspace de revisión' }),
    ).toBeInTheDocument()
  })

  it('renders an accessible not-found page', () => {
    renderRoute('/ruta-inexistente')

    expect(
      screen.getByRole('heading', { name: 'Esta página no existe' }),
    ).toBeInTheDocument()
  })
})
