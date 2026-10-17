import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/services/api/api-mode', () => ({ backendEnabled: true }))

import { RequireAuth } from './RequireAuth'

function renderProtectedRoute() {
  const router = createMemoryRouter(
    [
      { path: '/auth', element: <h1>Acceso seguro</h1> },
      {
        element: <RequireAuth />,
        children: [{ path: '/projects', element: <h1>Mis proyectos</h1> }],
      },
    ],
    { initialEntries: ['/projects'] },
  )
  render(<RouterProvider router={router} />)
  return router
}

describe('RequireAuth', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('redirects an anonymous user and preserves the requested project route', async () => {
    const router = renderProtectedRoute()

    expect(
      await screen.findByRole('heading', { name: 'Acceso seguro' }),
    ).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/auth')
    expect(router.state.location.search).toBe('?returnTo=%2Fprojects')
  })

  it('allows an authenticated user to open the project library', async () => {
    window.localStorage.setItem(
      'agora.auth.v1.session',
      JSON.stringify({
        accessToken: 'eyJhbGciOiJub25lIn0.eyJleHAiOjQxNDY2NzIwMDB9.',
        user: {
          createdAt: '2026-08-14T10:00:00.000Z',
          email: 'samuel@example.com',
          id: 'samuel-id',
          name: 'Samuel',
        },
      }),
    )

    renderProtectedRoute()

    expect(
      await screen.findByRole('heading', { name: 'Mis proyectos' }),
    ).toBeInTheDocument()
  })
})
