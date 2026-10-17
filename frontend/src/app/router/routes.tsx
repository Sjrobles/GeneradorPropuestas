/* eslint-disable react-refresh/only-export-components -- route-level lazy components intentionally live beside the route table */
import { lazy, Suspense, type ReactNode } from 'react'
import type { RouteObject } from 'react-router'

import { LoadingState } from '@/components/feedback/LoadingState'
import { AppShell } from '@/components/layout/AppShell'

import { RequireAuth } from './RequireAuth'
import { RouteErrorPage } from './RouteErrorPage'

const LandingPage = lazy(() =>
  import('@/features/landing/pages/LandingPage').then((module) => ({
    default: module.LandingPage,
  })),
)
const SkillsPage = lazy(() =>
  import('@/features/skills/pages/SkillsPage').then((module) => ({
    default: module.SkillsPage,
  })),
)
const AuthPage = lazy(() =>
  import('@/features/auth/pages/AuthPage').then((module) => ({
    default: module.AuthPage,
  })),
)
const NewProjectPage = lazy(() =>
  import('@/features/projects/pages/NewProjectPage').then((module) => ({
    default: module.NewProjectPage,
  })),
)
const MyProjectsPage = lazy(() =>
  import('@/features/projects/pages/MyProjectsPage').then((module) => ({
    default: module.MyProjectsPage,
  })),
)
const LanguagePage = lazy(() =>
  import('@/features/projects/pages/LanguagePage').then((module) => ({
    default: module.LanguagePage,
  })),
)
const ChatPage = lazy(() =>
  import('@/features/projects/pages/ChatPage').then((module) => ({
    default: module.ChatPage,
  })),
)
const ContextPage = lazy(() =>
  import('@/features/projects/pages/ContextPage').then((module) => ({
    default: module.ContextPage,
  })),
)
const GenerationPage = lazy(() =>
  import('@/features/formulation/pages/GenerationPage').then((module) => ({
    default: module.GenerationPage,
  })),
)
const ExecutionDetailsPage = lazy(() =>
  import('@/features/formulation/pages/ExecutionDetailsPage').then(
    (module) => ({ default: module.ExecutionDetailsPage }),
  ),
)
const ReviewWorkspacePage = lazy(() =>
  import('@/features/formulation/pages/ReviewWorkspacePage').then((module) => ({
    default: module.ReviewWorkspacePage,
  })),
)
const ComponentEditorPage = lazy(() =>
  import('@/features/formulation/pages/ComponentEditorPage').then((module) => ({
    default: module.ComponentEditorPage,
  })),
)
const DocumentAssemblyPage = lazy(() =>
  import('@/features/documents/pages/DocumentAssemblyPage').then((module) => ({
    default: module.DocumentAssemblyPage,
  })),
)
const DocumentPreviewPage = lazy(() =>
  import('@/features/documents/pages/DocumentPreviewPage').then((module) => ({
    default: module.DocumentPreviewPage,
  })),
)
const TranslationPage = lazy(() =>
  import('@/features/documents/pages/TranslationPage').then((module) => ({
    default: module.TranslationPage,
  })),
)
const ExportPage = lazy(() =>
  import('@/features/documents/pages/ExportPage').then((module) => ({
    default: module.ExportPage,
  })),
)
const CompletionPage = lazy(() =>
  import('@/features/documents/pages/CompletionPage').then((module) => ({
    default: module.CompletionPage,
  })),
)
const RouteMapPage = lazy(() =>
  import('@/features/landing/pages/RouteMapPage').then((module) => ({
    default: module.RouteMapPage,
  })),
)
const HelpCenterPage = lazy(() =>
  import('@/features/help/pages/HelpCenterPage').then((module) => ({
    default: module.HelpCenterPage,
  })),
)

function deferred(element: ReactNode) {
  return (
    <Suspense fallback={<LoadingState label="Cargando pantalla…" />}>
      {element}
    </Suspense>
  )
}

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <AppShell />,
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, element: deferred(<LandingPage />) },
      { path: 'skills', element: deferred(<SkillsPage />) },
      {
        path: 'auth',
        element: deferred(<AuthPage />),
      },
      {
        element: <RequireAuth />,
        children: [
          { path: 'projects', element: deferred(<MyProjectsPage />) },
          { path: 'projects/new', element: deferred(<NewProjectPage />) },
          {
            path: 'projects/:projectId/language',
            element: deferred(<LanguagePage />),
          },
          {
            path: 'projects/:projectId/chat',
            element: deferred(<ChatPage />),
          },
          {
            path: 'projects/:projectId/context',
            element: deferred(<ContextPage />),
          },
          {
            path: 'projects/:projectId/generation',
            element: deferred(<GenerationPage />),
          },
          {
            path: 'projects/:projectId/execution-details',
            element: deferred(<ExecutionDetailsPage />),
          },
          {
            path: 'projects/:projectId/review',
            element: deferred(<ReviewWorkspacePage />),
          },
          {
            path: 'projects/:projectId/components/:componentId',
            element: deferred(<ComponentEditorPage />),
          },
          {
            path: 'projects/:projectId/document/assemble',
            element: deferred(<DocumentAssemblyPage />),
          },
          {
            path: 'projects/:projectId/document',
            element: deferred(<DocumentPreviewPage />),
          },
          {
            path: 'projects/:projectId/translation',
            element: deferred(<TranslationPage />),
          },
          {
            path: 'projects/:projectId/export',
            element: deferred(<ExportPage />),
          },
          {
            path: 'projects/:projectId/complete',
            element: deferred(<CompletionPage />),
          },
        ],
      },
      { path: 'route-map', element: deferred(<RouteMapPage />) },
      { path: 'help', element: deferred(<HelpCenterPage />) },
    ],
  },
  { path: '*', element: <RouteErrorPage notFound /> },
]
