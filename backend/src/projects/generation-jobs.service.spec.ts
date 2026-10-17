import type { ProjectsService } from './projects.service'
import { GenerationJobsService } from './generation-jobs.service'

describe('GenerationJobsService', () => {
  it('acepta la generación, evita duplicados y ejecuta en segundo plano', async () => {
    let finish!: () => void
    const generation = new Promise<void>((resolve) => {
      finish = resolve
    })
    const generateComponents = jest.fn().mockReturnValue(generation)
    const service = new GenerationJobsService({
      generateComponents,
    } as unknown as ProjectsService)

    const first = service.start('owner', 'project')
    const duplicate = service.start('owner', 'project')
    await Promise.resolve()

    expect(first.generationId).toBe(duplicate.generationId)
    expect(generateComponents).toHaveBeenCalledTimes(1)
    expect(generateComponents).toHaveBeenCalledWith(
      'owner',
      'project',
      first.generationId,
    )

    finish()
    await generation
    await Promise.resolve()
  })
})
