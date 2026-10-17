import { normalizeIdeationActivityNomenclature } from './activity-nomenclature'

const narrative = 'Contenido técnico verificable. '.repeat(20)

describe('normalizeIdeationActivityNomenclature', () => {
  it('renumera por objetivo y actualiza cronograma y dependencias', () => {
    const result = normalizeIdeationActivityNomenclature({
      agent: 'ideation',
      assumptions: [],
      clarificationQuestions: [],
      consistencyWarnings: [],
      components: {
        activities: {
          narrative,
          items: [
            {
              description: 'Levantar la línea base.',
              deliverableIds: ['E1'],
              id: 'ACT-01',
              indicatorIds: ['I1'],
              objectiveIds: ['OBJ-1'],
            },
            {
              description: 'Implementar el piloto.',
              deliverableIds: ['E2'],
              id: 'ACT-02',
              indicatorIds: ['I2'],
              objectiveIds: ['OBJ-2'],
            },
            {
              description: 'Validar el diagnóstico.',
              deliverableIds: ['E3'],
              id: 'ACT-03',
              indicatorIds: ['I3'],
              objectiveIds: ['OBJ-1'],
            },
          ],
        },
        schedule: {
          narrative,
          items: [
            {
              activityId: 'ACT-01',
              dependencies: [],
              endMonth: 1,
              startMonth: 1,
            },
            {
              activityId: 'ACT-02',
              dependencies: ['ACT-01'],
              endMonth: 3,
              startMonth: 2,
            },
            {
              activityId: 'ACT-03',
              dependencies: ['ACT-01'],
              endMonth: 2,
              startMonth: 2,
            },
          ],
        },
        smartObjectives: {
          narrative,
          items: [
            {
              achievableRationale: 'Es viable con el equipo confirmado.',
              deadline: 'Mes 2',
              id: 'OBJ-1',
              indicatorIds: ['I1', 'I3'],
              measurableTarget: 'Una línea base validada.',
              statement: 'Caracterizar la situación inicial.',
            },
            {
              achievableRationale: 'Es viable dentro del plazo.',
              deadline: 'Mes 3',
              id: 'OBJ-2',
              indicatorIds: ['I2'],
              measurableTarget: 'Un piloto implementado.',
              statement: 'Implementar la solución priorizada.',
            },
          ],
        },
      },
    })

    expect(result.components.activities.items.map(({ id }) => id)).toEqual([
      '1.1',
      '2.1',
      '1.2',
    ])
    expect(result.components.schedule.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ activityId: '1.1', dependencies: [] }),
        expect.objectContaining({
          activityId: '2.1',
          dependencies: ['1.1'],
        }),
        expect.objectContaining({
          activityId: '1.2',
          dependencies: ['1.1'],
        }),
      ]),
    )
  })
})
