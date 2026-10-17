import { describe, expect, it, vi } from 'vitest'

import {
  isStaleDeploymentError,
  recoverFromStaleDeployment,
} from './deployment-recovery'

function recoveryEnvironment() {
  const values = new Map<string, string>()
  return {
    environment: {
      reload: vi.fn(),
      storage: {
        getItem: (key: string) => values.get(key) ?? null,
        setItem: (key: string, value: string) => values.set(key, value),
      },
    },
    values,
  }
}

describe('deployment recovery', () => {
  it('identifies stale lazy chunks from a previous deployment', () => {
    expect(
      isStaleDeploymentError(
        new TypeError('Failed to fetch dynamically imported module'),
      ),
    ).toBe(true)
    expect(isStaleDeploymentError(new Error('Validation failed'))).toBe(false)
  })

  it('reloads once when a stale deployment asset is detected', () => {
    const { environment } = recoveryEnvironment()

    expect(
      recoverFromStaleDeployment(
        new Error('Importing a module script failed'),
        environment,
        50_000,
      ),
    ).toBe(true)
    expect(environment.reload).toHaveBeenCalledOnce()

    expect(
      recoverFromStaleDeployment(
        new Error('Importing a module script failed'),
        environment,
        55_000,
      ),
    ).toBe(false)
    expect(environment.reload).toHaveBeenCalledOnce()
  })

  it('does not reload for an application error unrelated to deployment', () => {
    const { environment, values } = recoveryEnvironment()

    expect(
      recoverFromStaleDeployment(
        new Error('The project response is invalid'),
        environment,
        50_000,
      ),
    ).toBe(false)
    expect(environment.reload).not.toHaveBeenCalled()
    expect(values.size).toBe(0)
  })
})
