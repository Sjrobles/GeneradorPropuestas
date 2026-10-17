import { describe, expect, it } from 'vitest'

import { componentRegistry } from '@/features/formulation/domain/component-registry'
import {
  COMPONENT_STATUSES,
  type Project,
  type ProjectComponent,
} from '@/types/domain'

import { documentAssembler } from './document-assembler'

const now = '2026-08-14T10:00:00.000Z'
const project: Project = {
  id: 'project-1',
  title: 'Proyecto territorial',
  selectedSkillId: 'skill-1',
  language: 'es',
  state: 'waiting_review',
  progress: 72,
  createdAt: now,
  updatedAt: now,
}

const components: ProjectComponent[] = componentRegistry.map((definition) => ({
  id: `component-${definition.order}`,
  projectId: project.id,
  type: definition.type,
  aiGeneratedContent: `Versión inicial ${definition.label}`,
  currentContent: `Versión vigente ${definition.label}`,
  modifiedBy: 'user',
  status: COMPONENT_STATUSES.APPROVED,
  createdAt: now,
  updatedAt: now,
}))

describe('DocumentAssembler', () => {
  it('preserves every current version in the defined order', () => {
    const document = documentAssembler.assemble(project, components, 'es')

    expect(document.sections).toHaveLength(componentRegistry.length)
    expect(document.sections[0]).toEqual(
      expect.objectContaining({
        title: 'Marco teórico',
        content: 'Versión vigente Marco teórico',
      }),
    )
    expect(document.sections[8]?.title).toBe('Metodología')
    expect(document.sections[9]?.title).toBe('Presupuesto')
    expect(document.sections[12]?.title).toBe('Impactos esperados')
    expect(document.content).not.toContain('Versión inicial')
  })

  it('localizes all section titles when the project language is English', () => {
    const document = documentAssembler.assemble(project, components, 'en')

    expect(document.sections[0]?.title).toBe('Theoretical framework')
    expect(document.sections[7]?.title).toBe('Schedule')
    expect(document.sections[9]?.title).toBe('Budget')
    expect(document.sections[12]?.title).toBe('Expected impacts')
  })

  it('rejects incomplete component collections', () => {
    expect(() =>
      documentAssembler.assemble(project, components.slice(0, 12), 'es'),
    ).toThrow('13 apartados')
  })
})
