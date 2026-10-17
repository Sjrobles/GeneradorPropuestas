import { afterEach, describe, expect, it, vi } from 'vitest'
import { ensureBackendReady } from './backend-readiness'

describe('ensureBackendReady', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('reintenta silenciosamente mientras el backend se recupera', async () => {
    vi.useFakeTimers()
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(null, { status: 503 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ status: 'ok' }), { status: 200 }),
      )
    vi.stubGlobal('fetch', fetchMock)

    const readiness = ensureBackendReady('https://api-cold-start.test/api/v1')
    await vi.advanceTimersByTimeAsync(1_000)

    await expect(readiness).resolves.toBeUndefined()
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})
