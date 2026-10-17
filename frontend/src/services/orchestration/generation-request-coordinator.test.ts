import { describe, expect, it, vi } from 'vitest'

import { coordinateGenerationRequest } from './generation-request-coordinator'

describe('coordinateGenerationRequest', () => {
  it('reuses an active request and releases the project after it finishes', async () => {
    let finishRequest: (value: string) => void = () => undefined
    const request = vi.fn(
      () =>
        new Promise<string>((resolve) => {
          finishRequest = resolve
        }),
    )

    const first = coordinateGenerationRequest('project-1', request)
    const duplicate = coordinateGenerationRequest('project-1', request)

    expect(duplicate).toBe(first)
    await Promise.resolve()
    expect(request).toHaveBeenCalledTimes(1)

    finishRequest('completed')
    await expect(first).resolves.toBe('completed')

    const nextStage = coordinateGenerationRequest('project-1', request)
    await Promise.resolve()
    expect(request).toHaveBeenCalledTimes(2)
    finishRequest('methodology-started')
    await expect(nextStage).resolves.toBe('methodology-started')
  })

  it('also releases the project after a failed request', async () => {
    const request = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(new Error('temporary error'))
      .mockResolvedValueOnce('retried')

    await expect(
      coordinateGenerationRequest('project-2', request),
    ).rejects.toThrow('temporary error')
    await expect(
      coordinateGenerationRequest('project-2', request),
    ).resolves.toBe('retried')
    expect(request).toHaveBeenCalledTimes(2)
  })
})
