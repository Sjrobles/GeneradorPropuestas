import type { RouteObject } from 'react-router'

import { PhasePlaceholderPage } from '@/components/feedback/PhasePlaceholderPage'
import { AppShell } from '@/components/layout/AppShell'
import { BootstrapPage } from '@/features/landing/pages/BootstrapPage'
import { RouteMapPage } from '@/features/landing/pages/RouteMapPage'

import { RouteErrorPage } from './RouteErrorPage'

const placeholderRoutes: RouteObject[] = [
  {
    path: 'skills',
    element: (
      <PhasePlaceholderPage
        title="Selección de skill"
        description="El catálogo escalable de skills se implementará en la Fase 2."
      />
    ),
  },
  {
    path: 'projects/new',
    element: (
      <PhasePlaceholderPage
        title="Nuevo proyecto"
        description="La creación del proyecto se implementará en la Fase 2."
      />
    ),
  },
  {
    path: 'projects/:projectId/language',
    element: (
      <PhasePlaceholderPage
        title="Selección de idioma"
        description="La selección entre Español y English se implementará en la Fase 2."
      />
    ),
  },
  {
    path: 'projects/:projectId/chat',
    element: (
      <PhasePlaceholderPage
        title="Chat y contexto"
        description="La conversación guiada y el diagnóstico mock se implementarán en la Fase 3."
      />
    ),
  },
  {
    path: 'projects/:projectId/context',
    element: (
      <PhasePlaceholderPage
        title="Confirmación del contexto"
        description="El resumen estructurado y su confirmación se implementarán en la Fase 3."
      />
    ),
  },
  {
    path: 'projects/:projectId/generation',
    element: (
      <PhasePlaceholderPage
        title="Generación de componentes"
        description="El progreso simulado de los diez componentes se implementará en la Fase 4."
      />
    ),
  },
  {
    path: 'projects/:projectId/review',
    element: (
      <PhasePlaceholderPage
        title="Workspace de revisión"
        description="El espacio de revisión humana se implementará en la Fase 4."
      />
    ),
  },
  {
    path: 'projects/:projectId/components/:componentId',
    element: (
      <PhasePlaceholderPage
        title="Editor de componente"
        description="La edición, guardado, validación y aprobación se implementarán en la Fase 4."
      />
    ),
  },
  {
    path: 'projects/:projectId/document/assemble',
    element: (
      <PhasePlaceholderPage
        title="Ensamblaje del documento"
        description="La integración simulada de las versiones guardadas se implementará en la Fase 5."
      />
    ),
  },
  {
    path: 'projects/:projectId/document',
    element: (
      <PhasePlaceholderPage
        title="Vista previa del documento"
        description="La previsualización consolidada se implementará en la Fase 5."
      />
    ),
  },
  {
    path: 'projects/:projectId/translation',
    element: (
      <PhasePlaceholderPage
        title="Traducción"
        description="La traducción simulada y opcional se implementará en la Fase 5."
      />
    ),
  },
  {
    path: 'projects/:projectId/export',
    element: (
      <PhasePlaceholderPage
        title="Exportación"
        description="La descarga mock de DOCX y PDF se implementará en la Fase 5."
      />
    ),
  },
  {
    path: 'projects/:projectId/complete',
    element: (
      <PhasePlaceholderPage
        title="Proyecto finalizado"
        description="La pantalla final del borrador se implementará en la Fase 5."
      />
    ),
  },
  {
    path: 'help',
    element: (
      <PhasePlaceholderPage
        title="Centro de ayuda"
        description="La documentación de uso crecerá junto con cada fase funcional."
      />
    ),
  },
]

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <AppShell />,
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, element: <BootstrapPage /> },
      { path: 'route-map', element: <RouteMapPage /> },
      ...placeholderRoutes,
    ],
  },
  { path: '*', element: <RouteErrorPage notFound /> },
]
