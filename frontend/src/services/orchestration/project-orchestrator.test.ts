import { describe, expect, it } from 'vitest'

import { PROJECT_STATES, type Project } from '@/types/domain'

import { projectOrchestrator } from './project-orchestrator'

const project: Project = {
  id: 'project-1',
  title: 'Proyecto de prueba',
  selectedSkillId: 'skill-1',
  state: PROJECT_STATES.CONTEXT_CONFIRMED,
  progress: 38,
  createdAt: '2026-08-14T10:00:00.000Z',
  updatedAt: '2026-08-14T10:00:00.000Z',
}

describe('ProjectOrchestrator', () => {
  it('allows the generation transition after context confirmation', () => {
    expect(
      projectOrchestrator.transition(
        project,
        PROJECT_STATES.GENERATING_COMPONENTS,
      ),
    ).toEqual(
      expect.objectContaining({
        state: PROJECT_STATES.GENERATING_COMPONENTS,
        progress: 42,
      }),
    )
  })

  it('rejects arbitrary transitions', () => {
    expect(() =>
      projectOrchestrator.transition(project, PROJECT_STATES.WAITING_REVIEW),
    ).toThrow('Transición de proyecto no permitida')
  })

  it('controls assembly, document and completion states', () => {
    const waitingReview = {
      ...project,
      state: PROJECT_STATES.WAITING_REVIEW,
      progress: 72,
    }
    const assembling = projectOrchestrator.transition(
      waitingReview,
      PROJECT_STATES.ASSEMBLING,
    )
    const documentReady = projectOrchestrator.transition(
      assembling,
      PROJECT_STATES.DOCUMENT_READY,
    )
    const completed = projectOrchestrator.transition(
      documentReady,
      PROJECT_STATES.COMPLETED,
    )

    expect(assembling.progress).toBe(82)
    expect(documentReady.progress).toBe(92)
    expect(completed).toEqual(
      expect.objectContaining({
        state: PROJECT_STATES.COMPLETED,
        progress: 100,
      }),
    )
  })
})
