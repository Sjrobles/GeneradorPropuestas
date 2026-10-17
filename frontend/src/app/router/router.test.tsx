import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { beforeEach, describe, expect, it } from 'vitest'

import { generationSequence } from '@/features/formulation/domain/component-registry'
import {
  COMPONENT_STATUSES,
  COMPONENT_TYPES,
  type ProjectComponent,
} from '@/types/domain'

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
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('renders the product landing page', async () => {
    renderRoute('/')
    expect(
      await screen.findByRole('heading', {
        name: /Formula proyectos CTeI de alto impacto con IA/i,
      }),
    ).toBeInTheDocument()
  })

  it('shows enabled and upcoming skills', async () => {
    renderRoute('/skills')

    expect(
      await screen.findByRole('heading', {
        name: 'Convocatorias internacionales y Banco de la República',
      }),
    ).toBeInTheDocument()
    expect(screen.getByText('Disponible')).toBeInTheDocument()
    expect(screen.getAllByText('Próximamente')).toHaveLength(3)
  })

  it('provides searchable contextual help for the current workflow', async () => {
    const user = userEvent.setup()
    renderRoute('/help?from=%2Fprojects%2Fdemo%2Freview&topic=budget')

    expect(
      await screen.findByRole('heading', { name: 'Centro de ayuda de Ágora' }),
    ).toBeInTheDocument()
    expect(
      screen.getAllByText('Validar la tabla presupuestal').length,
    ).toBeGreaterThan(0)
    expect(
      screen.getByRole('link', { name: 'Volver a la pantalla anterior' }),
    ).toHaveAttribute('href', '/projects/demo/review')

    await user.type(
      screen.getByRole('searchbox', { name: 'Buscar en el centro de ayuda' }),
      'exportar',
    )
    expect(
      screen.getByText('Ensamblar y exportar documentos'),
    ).toBeInTheDocument()
    expect(screen.getByText('1 resultados')).toBeInTheDocument()
  })

  it('shows documents saved under the authenticated profile', async () => {
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
    window.localStorage.setItem(
      'agora.mock.v1.projects',
      JSON.stringify([
        {
          createdAt: now,
          hasDocument: true,
          id: 'samuel-project',
          progress: 100,
          selectedSkillId: 'international-calls-banco-republica',
          state: 'completed',
          title: 'Documento persistido de Samuel',
          updatedAt: now,
        },
      ]),
    )

    renderRoute('/projects')

    expect(
      await screen.findByRole('heading', { name: 'Mis proyectos' }),
    ).toBeInTheDocument()
    expect(
      await screen.findByRole('link', { name: 'Abrir documento' }),
    ).toHaveAttribute('href', '/projects/samuel-project/document')
  })

  it('exposes the project library from the main navigation', async () => {
    renderRoute('/')

    expect(
      await screen.findByRole('link', { name: 'Mis proyectos' }),
    ).toHaveAttribute('href', '/projects')
  })

  it('creates a project directly in Spanish and persists the choice', async () => {
    const user = userEvent.setup()
    renderRoute('/skills')

    const skillLink = await screen.findByRole('link', {
      name: /Convocatorias internacionales y Banco de la República/i,
    })
    await user.click(skillLink)

    expect(
      await screen.findByRole('heading', {
        name: 'Dale un punto de partida a tu idea',
      }),
    ).toBeInTheDocument()

    const titleInput = screen.getByRole('textbox', {
      name: 'Nombre del proyecto',
    })
    await user.clear(titleInput)
    await user.type(titleInput, 'Laboratorio regional de ciencia')
    await user.click(screen.getByRole('button', { name: 'Crear y continuar' }))

    expect(
      await screen.findByRole('heading', {
        name: 'Cuéntale a Ágora sobre tu proyecto',
      }),
    ).toBeInTheDocument()

    const projects = JSON.parse(
      window.localStorage.getItem('agora.mock.v1.projects') ?? '[]',
    ) as Array<{ language?: string; title: string }>
    expect(projects).toEqual([
      expect.objectContaining({
        language: 'es',
        title: 'Laboratorio regional de ciencia',
      }),
    ])
  })

  it('supports a direct document route after a browser refresh', async () => {
    const generatedAt = '2026-08-14T11:00:00.000Z'
    window.localStorage.setItem(
      'agora.mock.v1.projects',
      JSON.stringify([
        {
          id: 'demo',
          title: 'Proyecto demostrativo',
          selectedSkillId: 'international-calls-banco-republica',
          language: 'es',
          state: 'document_ready',
          progress: 92,
          createdAt: generatedAt,
          updatedAt: generatedAt,
        },
      ]),
    )
    window.localStorage.setItem(
      'agora.mock.v1.documents',
      JSON.stringify({
        demo: {
          id: 'demo-es',
          projectId: 'demo',
          title: 'Proyecto demostrativo',
          language: 'es',
          status: 'ready',
          generatedAt,
          content: '1. RESUMEN EJECUTIVO\n\nContenido del proyecto.',
          sections: [
            {
              id: 'executive_summary',
              componentId: 'component-1',
              order: 1,
              title: 'Resumen ejecutivo',
              content: 'Contenido del proyecto.',
            },
          ],
        },
      }),
    )

    renderRoute('/projects/demo/document')
    expect(
      await screen.findByRole('heading', { name: 'Resumen ejecutivo' }),
    ).toBeInTheDocument()
  })

  it('allows a persisted generation error to resume from the failed agent', async () => {
    const projectId = 'budget-error-demo'
    const now = '2026-08-14T11:00:00.000Z'
    window.localStorage.setItem(
      'agora.mock.v1.projects',
      JSON.stringify([
        {
          createdAt: now,
          id: projectId,
          progress: 66,
          selectedSkillId: 'international-calls-banco-republica',
          state: 'error',
          title: 'Proyecto con error presupuestal',
          updatedAt: now,
        },
      ]),
    )

    renderRoute(`/projects/${projectId}/generation`)

    expect(
      await screen.findByText(/Los agentes finalizados están guardados/i),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: 'Reintentar desde el agente con error',
      }),
    ).toBeInTheDocument()
  })

  it('generates, edits and approves a project component', async () => {
    const user = userEvent.setup()
    const projectId = 'fase-4-demo'
    const now = '2026-08-14T10:00:00.000Z'
    window.localStorage.setItem(
      'agora.mock.v1.projects',
      JSON.stringify([
        {
          id: projectId,
          title: 'Laboratorio de participación territorial',
          selectedSkillId: 'international-calls-banco-republica',
          language: 'es',
          state: 'context_confirmed',
          progress: 38,
          createdAt: now,
          updatedAt: now,
        },
      ]),
    )
    window.localStorage.setItem(
      'agora.mock.v1.contexts',
      JSON.stringify({
        [projectId]: {
          projectId,
          problem:
            'Baja articulación entre capacidades científicas y retos comunitarios.',
          targetPopulation:
            'Investigadores jóvenes y organizaciones comunitarias.',
          location: 'Región Caribe colombiana.',
          objectiveCount: 3,
          proposedSolution:
            'Una plataforma participativa de conexión y seguimiento.',
          expectedResults:
            'Retos priorizados y pilotos colaborativos documentados.',
          initialScope: 'Piloto de seis meses sin escalamiento nacional.',
          projectDuration: '6 meses.',
        },
      }),
    )

    renderRoute(`/projects/${projectId}/generation`)
    expect(
      await screen.findByRole('heading', { name: 'Generación de componentes' }),
    ).toBeInTheDocument()
    expect(
      await screen.findByRole('heading', {
        name: 'Detalles de ejecución del proyecto',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', {
        name: 'Resultados del Agente de Ideación',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Objetivos del proyecto' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Actividades propuestas' }),
    ).toBeInTheDocument()
    const storedComponents = JSON.parse(
      window.localStorage.getItem('agora.mock.v1.components') ?? '{}',
    ) as Record<string, ProjectComponent[]>
    const componentsAtIdeationPause = storedComponents[projectId] ?? []
    const ideationEnd = generationSequence.indexOf(COMPONENT_TYPES.SCHEDULE)
    const generatedTypes = generationSequence.slice(0, ideationEnd + 1)
    const pendingTypes = generationSequence.slice(ideationEnd + 1)

    expect(
      generatedTypes.every((type) => {
        const component = componentsAtIdeationPause.find(
          (candidate) => candidate.type === type,
        )
        return (
          component?.status === COMPONENT_STATUSES.GENERATED &&
          Boolean(component.currentContent.trim())
        )
      }),
    ).toBe(true)
    expect(
      pendingTypes.every(
        (type) =>
          componentsAtIdeationPause.find((candidate) => candidate.type === type)
            ?.status === COMPONENT_STATUSES.PENDING,
      ),
    ).toBe(true)
    for (const [index, answer] of screen.getAllByRole('textbox').entries()) {
      await user.type(
        answer,
        `Respuesta operativa ${index + 1} suficientemente detallada para alinear actividades, metodología y presupuesto.`,
      )
    }
    await user.click(
      screen.getByRole('button', { name: /Confirmar y continuar/i }),
    )
    expect(
      await screen.findByRole('heading', { name: 'Generación de componentes' }),
    ).toBeInTheDocument()
    await user.click(
      await screen.findByRole('link', { name: /Abrir workspace de revisión/i }),
    )

    expect(
      await screen.findByRole('heading', { name: 'Workspace de revisión' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Componentes del proyecto' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: /1\s*Marco teórico\s*Estado: generado/i,
      }),
    ).toBeInTheDocument()
    const editor = screen.getByRole('textbox', {
      name: 'Contenido del componente',
    })
    await user.clear(editor)
    await user.type(
      editor,
      'Resumen revisado por el equipo humano con el contexto confirmado del proyecto.',
    )
    ;(editor as HTMLTextAreaElement).setSelectionRange(0, 7)
    await user.click(screen.getByRole('button', { name: 'Negrita' }))
    await waitFor(() =>
      expect(editor).toHaveValue(
        '**Resumen** revisado por el equipo humano con el contexto confirmado del proyecto.',
      ),
    )
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    expect((await screen.findAllByText('Modificado')).length).toBeGreaterThan(0)
    await user.click(screen.getByRole('button', { name: 'Aprobar' }))
    expect((await screen.findAllByText('Aprobado')).length).toBeGreaterThan(0)
    expect(
      await screen.findByRole('heading', { name: 'Estado del arte' }),
    ).toBeInTheDocument()

    expect(
      screen.queryByRole('link', { name: 'Ensamblar documento' }),
    ).not.toBeInTheDocument()

    const remainingComponents = [
      'Estado del arte',
      'Planteamiento del problema',
      'Antecedentes',
      'Bibliografía',
      'Actividades',
      'Objetivos SMART',
      'Cronograma',
      'Beneficiarios',
      'Riesgos',
      'Impactos esperados',
      'Presupuesto',
      'Metodología',
    ]
    for (const [index, componentName] of remainingComponents.entries()) {
      await user.click(
        screen.getByRole('button', { name: new RegExp(componentName, 'i') }),
      )
      await user.click(screen.getByRole('button', { name: 'Aprobar' }))
      await waitFor(() => {
        const components = JSON.parse(
          window.localStorage.getItem('agora.mock.v1.components') ?? '{}',
        ) as Record<string, Array<{ status: string }>>
        expect(
          components[projectId]?.filter(({ status }) => status === 'approved'),
        ).toHaveLength(index + 2)
      })
    }

    await user.click(
      await screen.findByRole('link', { name: 'Ensamblar documento' }),
    )
    expect(
      await screen.findByRole('heading', {
        name: 'Preparar documento consolidado',
      }),
    ).toBeInTheDocument()
    await user.click(
      screen.getByRole('button', { name: 'Continuar con el ensamblaje' }),
    )
    expect(
      await screen.findByText('Documento consolidado · ES'),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('link', { name: 'Traducir al inglés' }))
    expect(
      await screen.findByRole('heading', { name: 'Traducir al inglés' }),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Traducir al inglés' }))
    expect(
      await screen.findByText('Documento consolidado · EN'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Ver original en español' }),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('link', { name: 'Exportar' }))
    expect(
      await screen.findByRole('heading', { name: 'Exporta tu borrador' }),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Finalizar proyecto' }))
    expect(
      await screen.findByRole('heading', {
        name: 'Tu borrador ha sido generado.',
      }),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('link', { name: 'Volver a revisar' }))
    const approvedEditor = await screen.findByRole('textbox', {
      name: 'Contenido del componente',
    })
    expect(approvedEditor).toBeEnabled()
    ;(approvedEditor as HTMLTextAreaElement).setSelectionRange(2, 9)
    await user.click(screen.getByRole('button', { name: 'Cursiva' }))
    await waitFor(() =>
      expect((approvedEditor as HTMLTextAreaElement).value).toMatch(
        /^\*{3}Resumen\*{3}/u,
      ),
    )
  }, 15_000)

  it('completes the guided context flow and confirms the diagnosis', async () => {
    const user = userEvent.setup()
    const projectId = 'fase-3-demo'
    window.localStorage.setItem(
      'agora.mock.v1.projects',
      JSON.stringify([
        {
          id: projectId,
          title: 'Observatorio de innovación territorial',
          selectedSkillId: 'international-calls-banco-republica',
          language: 'es',
          state: 'language_selected',
          progress: 15,
          createdAt: '2026-08-13T10:00:00.000Z',
          updatedAt: '2026-08-13T10:00:00.000Z',
        },
      ]),
    )

    renderRoute(`/projects/${projectId}/chat`)

    const answer = async (content: string, nextPrompt?: string) => {
      const input = await screen.findByRole('textbox', { name: 'Tu respuesta' })
      await user.type(input, content)
      await user.click(screen.getByRole('button', { name: 'Enviar respuesta' }))
      await waitFor(() => expect(input).toHaveValue(''))
      if (nextPrompt) {
        expect(await screen.findByText(nextPrompt)).toBeInTheDocument()
      }
    }

    expect(
      await screen.findByText(
        'Para comenzar, ¿qué problema o necesidad quieres resolver con este proyecto?',
      ),
    ).toBeInTheDocument()

    await answer(
      'Baja articulación entre investigadores y comunidades rurales.',
      '¿A qué población, comunidad u organización está dirigido?',
    )
    await answer(
      'Investigadores jóvenes y organizaciones rurales del Caribe.',
      '¿Dónde se desarrollará el proyecto?',
    )
    await answer(
      'En municipios rurales de los departamentos del Atlántico y Bolívar.',
      '¿Cuál es la solución que propones frente a ese problema?',
    )
    await answer(
      'Una plataforma participativa para conectar retos territoriales con capacidades científicas.',
      '¿Qué resultados concretos esperas alcanzar?',
    )
    await answer(
      'Un banco de retos validado y tres pilotos de colaboración.',
      '¿Cuántos objetivos específicos quieres que tenga el proyecto? Indica un número exacto entre 2 y 5; Ágora generará exactamente esa cantidad.',
    )
    await answer('3', '¿Cuál es el alcance inicial y qué quedaría por fuera?')
    await answer(
      'Un piloto de seis meses; no incluye el escalamiento nacional.',
      'Para cerrar el contexto, ¿cuál es la duración total prevista del proyecto? Indícala en semanas o meses y menciona si existe una fecha límite.',
    )
    await answer('El proyecto tendrá una duración total de seis meses.')

    await user.click(
      await screen.findByRole('button', { name: 'Analizar contexto' }),
    )
    await user.click(
      await screen.findByRole('link', { name: /Revisar resumen/i }),
    )

    expect(
      await screen.findByRole('heading', {
        name: 'Confirma el contexto de tu proyecto',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByDisplayValue(
        'Una plataforma participativa para conectar retos territoriales con capacidades científicas.',
      ),
    ).toBeInTheDocument()

    await user.click(
      screen.getByRole('button', { name: /Confirmar y continuar/i }),
    )

    expect(
      await screen.findByRole('heading', {
        name: 'Generación de componentes',
      }),
    ).toBeInTheDocument()

    const projects = JSON.parse(
      window.localStorage.getItem('agora.mock.v1.projects') ?? '[]',
    ) as Array<{ state: string }>
    expect(projects[0]?.state).toBe('context_confirmed')
  })

  it('renders an accessible not-found page', () => {
    renderRoute('/ruta-inexistente')

    expect(
      screen.getByRole('heading', { name: 'Esta página no existe' }),
    ).toBeInTheDocument()
  })
})
