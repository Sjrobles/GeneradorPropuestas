import { PromptCatalogService } from './prompt-catalog.service'

describe('PromptCatalogService', () => {
  const catalog = new PromptCatalogService()

  it('carga los cinco prompts maestros', () => {
    const prompts = catalog.getAll()

    expect(prompts).toHaveLength(5)
    expect(prompts.map(({ agent }) => agent)).toEqual([
      'research',
      'ideation',
      'methodology',
      'budget',
      'impact',
    ])
    expect(prompts.every(({ content }) => content.length > 500)).toBe(true)
  })

  it('publica los cinco prompts como recursos definitivos', () => {
    expect(catalog.get('methodology')).toMatchObject({
      provisional: false,
      version: '1.0.0',
    })
    expect(catalog.getAll().every(({ provisional }) => !provisional)).toBe(true)
  })

  it('expone el contrato JSON prioritario del presupuesto', () => {
    expect(catalog.get('budget')).toMatchObject({ version: '2.3.0' })
    expect(catalog.get('budget').content).toContain(
      'CONTRATO TÉCNICO DE SALIDA DE ÁGORA',
    )
    expect(catalog.get('budget').content).toContain(
      'exclusivamente con el objeto JSON establecido por `outputType`',
    )
    expect(catalog.get('budget').content).toContain(
      '| Objetivo | Actividad | Rubro | Descripción | Costo unitario | Unidad | Cantidad | Total |',
    )
    expect(catalog.get('budget').content).toContain(
      '`objective` debe contener el texto legible del objetivo',
    )
    expect(catalog.get('budget').content).toContain(
      'La ausencia de una cotización del usuario **no impide presupuestar**',
    )
    expect(catalog.get('budget').content).toContain(
      'Está prohibido utilizar el estado `pending`',
    )
  })

  it('exige un cronograma tabulado y un Gantt derivado de datos estructurados', () => {
    expect(catalog.get('ideation')).toMatchObject({ version: '1.3.0' })
    expect(catalog.get('ideation').content).toContain(
      'exactamente una fila por cada actividad',
    )
    expect(catalog.get('ideation').content).toContain(
      'N.º, Objetivo específico, Actividad, Inicio, Fin, Duración, Dependencias y Entregables',
    )
    expect(catalog.get('ideation').content).toContain(
      'divide el Gantt en bloques consecutivos de máximo 12 meses',
    )
    expect(catalog.get('ideation').content).toContain('nomenclatura `n.m`')
  })

  it('conserva en memoria el mismo recurso después de cargarlo', () => {
    expect(catalog.get('research')).toBe(catalog.get('research'))
  })
})
