import {
  AGENT_COMPONENTS,
  AGENT_DEPENDENCIES,
  FORMULATION_AGENTS,
  FORMULATION_COMPONENT_REGISTRY,
  FORMULATION_COMPONENTS,
} from './formulation.constants'

describe('registro de formulación multiagente', () => {
  it('asigna exactamente los 13 componentes una sola vez', () => {
    const registered = FORMULATION_COMPONENT_REGISTRY.map(
      ({ component }) => component,
    )

    expect(registered).toHaveLength(13)
    expect(new Set(registered).size).toBe(13)
    expect(new Set(registered)).toEqual(new Set(FORMULATION_COMPONENTS))
  })

  it('mantiene la distribución acordada entre los cinco agentes', () => {
    expect(Object.keys(AGENT_COMPONENTS)).toEqual([...FORMULATION_AGENTS])
    expect(AGENT_COMPONENTS.research).toHaveLength(5)
    expect(AGENT_COMPONENTS.ideation).toHaveLength(3)
    expect(AGENT_COMPONENTS.impact).toHaveLength(3)
    expect(AGENT_COMPONENTS.budget).toHaveLength(1)
    expect(AGENT_COMPONENTS.methodology).toHaveLength(1)
  })

  it('conserva un orden continuo del 1 al 13', () => {
    expect(FORMULATION_COMPONENT_REGISTRY.map(({ order }) => order)).toEqual(
      Array.from({ length: 13 }, (_, index) => index + 1),
    )
  })

  it('mantiene la secuencia investigación, ideación, metodología, presupuesto e impacto', () => {
    expect(FORMULATION_AGENTS).toEqual([
      'research',
      'ideation',
      'methodology',
      'budget',
      'impact',
    ])
    expect(AGENT_DEPENDENCIES.methodology).toEqual(['research', 'ideation'])
    expect(AGENT_DEPENDENCIES.budget).toEqual(['ideation', 'methodology'])
    expect(AGENT_DEPENDENCIES.impact).toEqual([
      'research',
      'ideation',
      'methodology',
      'budget',
    ])
  })
})
