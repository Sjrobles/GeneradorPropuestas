import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import axe from 'axe-core'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { beforeEach, describe, expect, it } from 'vitest'

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

async function expectNoAccessibilityViolations() {
  const results = await axe.run(document.body, {
    rules: {
      // JSDOM cannot calculate rendered foreground/background contrast.
      'color-contrast': { enabled: false },
    },
  })
  expect(results.violations).toEqual([])
}

describe('accessibility smoke checks', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('keeps the landing page free of detectable structural violations', async () => {
    renderRoute('/')
    await screen.findByRole(
      'heading',
      {
        name: /Formula proyectos CTeI de alto impacto con IA/i,
      },
      { timeout: 5_000 },
    )
    await expectNoAccessibilityViolations()
  })

  it('keeps the skills selection page free of detectable structural violations', async () => {
    renderRoute('/skills')
    await screen.findByRole(
      'heading',
      {
        name: 'Convocatorias internacionales y Banco de la República',
      },
      { timeout: 5_000 },
    )
    await expectNoAccessibilityViolations()
  })

  it('keeps the authenticated project library free of detectable structural violations', async () => {
    const now = '2026-08-14T10:00:00.000Z'
    window.localStorage.setItem(
      'agora.auth.v1.session',
      JSON.stringify({
        accessToken: 'eyJhbGciOiJub25lIn0.eyJleHAiOjQxNDY2NzIwMDB9.',
        user: {
          createdAt: now,
          email: 'samuel@example.com',
          id: 'samuel-id',
          name: 'Samuel',
        },
      }),
    )

    renderRoute('/projects')
    await screen.findByRole(
      'heading',
      { name: 'Mis proyectos' },
      { timeout: 5_000 },
    )
    await expectNoAccessibilityViolations()
  })
})
