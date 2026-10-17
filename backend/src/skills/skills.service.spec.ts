import { SkillsService } from './skills.service'

describe('SkillsService', () => {
  const service = new SkillsService()

  it('publica una única skill habilitada en el primer corte', () => {
    const enabledSkills = service.list().filter((skill) => skill.enabled)

    expect(enabledSkills).toHaveLength(1)
    expect(enabledSkills[0]?.id).toBe('international-calls')
  })

  it('no expone la colección interna para mutación', () => {
    const firstRead = service.list()
    firstRead[0].name = 'alterada'

    expect(service.list()[0]?.name).not.toBe('alterada')
  })
})
