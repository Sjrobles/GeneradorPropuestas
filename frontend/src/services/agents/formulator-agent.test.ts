import { describe, expect, it } from 'vitest'

import {
  componentRegistry,
  generationSequence,
} from '@/features/formulation/domain/component-registry'
import {
  COMPONENT_TYPES,
  type ComponentType,
  type ProjectContext,
} from '@/types/domain'

import type { ComponentDraft } from './contracts'
import { formulatorAgent } from './formulator-agent'

const context: ProjectContext = {
  projectId: 'project-1',
  problem: 'Baja articulación entre capacidades científicas y retos locales.',
  targetPopulation: 'Investigadores jóvenes y organizaciones comunitarias.',
  location: 'Región Caribe colombiana.',
  objectiveCount: 3,
  proposedSolution: 'Una plataforma participativa de innovación abierta.',
  expectedResults: 'Retos priorizados y pilotos colaborativos documentados.',
  initialScope: 'Piloto territorial de seis meses.',
  projectDuration: '6 meses.',
}

describe('FormulatorAgent', () => {
  it('preserves the original agent order', () => {
    const agentOrder = componentRegistry
      .map(({ agent }) => agent)
      .filter((agent, index, agents) => agent !== agents[index - 1])

    expect(agentOrder).toEqual([
      'ResearchAgent',
      'IdeationAgent',
      'MethodologyAgent',
      'BudgetAgent',
      'ImpactAgent',
    ])
  })

  it('distributes the 13 sections among the five defined agents', () => {
    const distribution = componentRegistry.reduce<Record<string, number>>(
      (counts, definition) => ({
        ...counts,
        [definition.agent]: (counts[definition.agent] ?? 0) + 1,
      }),
      {},
    )

    expect(distribution).toEqual({
      ResearchAgent: 5,
      IdeationAgent: 3,
      ImpactAgent: 3,
      BudgetAgent: 1,
      MethodologyAgent: 1,
    })
  })

  it('generates every registered section from the confirmed context', () => {
    const drafts: Partial<Record<ComponentType, ComponentDraft>> = {}

    for (const type of generationSequence) {
      drafts[type] = formulatorAgent.generateComponent({
        type,
        context,
        existingDrafts: drafts,
      })
    }

    expect(Object.keys(drafts)).toHaveLength(13)
    expect(Object.values(drafts).every((draft) => draft?.content.trim())).toBe(
      true,
    )
    expect(drafts.activities?.content).toContain('1.1 Caracterizar')
    expect(drafts.activities?.content).toContain('2.2 Ejecutar')
    expect(drafts.activities?.content).toContain('3.2 Ejecutar')
    expect(drafts.smart_objectives?.content.match(/^\d+\./gm)).toHaveLength(3)
    expect(drafts.schedule?.content).toContain(
      '| N.º | Objetivo específico | Actividad | Inicio | Fin | Duración | Dependencias | Entregables |',
    )
    expect(drafts.schedule?.content).toContain('Diagrama de Gantt')
    expect(drafts.schedule?.content).toContain('| Actividad | M1 | M2 |')
    expect(drafts.schedule?.content).toContain('●')
    expect(drafts.methodology?.structuredContent?.phases).toHaveLength(3)
    expect(
      drafts.methodology?.structuredContent?.phases.map(({ name }) => name),
    ).toEqual([
      'Comprensión participativa del reto',
      'Diseño e implementación',
      'Evaluación y aprendizaje',
    ])
    expect(drafts.budget?.content).toContain(
      '| Objetivo | Actividad | Rubro | Descripción | Costo unitario | Unidad | Cantidad | Total |',
    )
    expect(drafts.budget?.content).toContain('TOTAL GENERAL')
    expect(drafts.budget?.content.toLowerCase()).not.toContain('pendiente')
  })

  it.each([2, 3, 4, 5])(
    'generates exactly %i objectives without changing the three-phase template',
    (objectiveCount) => {
      const smartObjectives = formulatorAgent.generateComponent({
        type: COMPONENT_TYPES.SMART_OBJECTIVES,
        context: { ...context, objectiveCount },
        existingDrafts: {},
      })
      const methodology = formulatorAgent.generateComponent({
        type: COMPONENT_TYPES.METHODOLOGY,
        context: { ...context, objectiveCount },
        existingDrafts: {},
      })

      expect(smartObjectives.content.match(/^\d+\./gm)).toHaveLength(
        objectiveCount,
      )
      expect(methodology.structuredContent?.phases).toHaveLength(3)
    },
  )
})
