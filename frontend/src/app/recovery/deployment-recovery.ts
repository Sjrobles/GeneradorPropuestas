const DEPLOYMENT_RELOAD_KEY = 'agora.runtime.deployment-reload-at'
const DEPLOYMENT_RELOAD_COOLDOWN_MS = 30_000

interface RecoveryEnvironment {
  reload: () => void
  storage: Pick<Storage, 'getItem' | 'setItem'>
}

const staleDeploymentPatterns = [
  /failed to fetch dynamically imported module/i,
  /error loading dynamically imported module/i,
  /importing a module script failed/i,
  /loading (css )?chunk [\w-]+ failed/i,
  /unable to preload css/i,
]

function messageFrom(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message)
  }
  return ''
}

function browserEnvironment(): RecoveryEnvironment {
  return {
    reload: () => window.location.reload(),
    storage: window.sessionStorage,
  }
}

export function isStaleDeploymentError(error: unknown): boolean {
  const message = messageFrom(error)
  return staleDeploymentPatterns.some((pattern) => pattern.test(message))
}

export function recoverFromStaleDeployment(
  error: unknown,
  environment: RecoveryEnvironment = browserEnvironment(),
  now = Date.now(),
): boolean {
  if (!isStaleDeploymentError(error)) return false

  const previousReload = Number(
    environment.storage.getItem(DEPLOYMENT_RELOAD_KEY),
  )
  if (
    Number.isFinite(previousReload) &&
    previousReload > 0 &&
    now - previousReload < DEPLOYMENT_RELOAD_COOLDOWN_MS
  ) {
    return false
  }

  environment.storage.setItem(DEPLOYMENT_RELOAD_KEY, String(now))
  environment.reload()
  return true
}

export function registerDeploymentRecovery(
  environment: RecoveryEnvironment = browserEnvironment(),
) {
  const handlePreloadError = (event: Event) => {
    event.preventDefault()
    const payload = (event as Event & { payload?: unknown }).payload
    recoverFromStaleDeployment(
      payload ?? new Error('Failed to fetch dynamically imported module'),
      environment,
    )
  }

  window.addEventListener('vite:preloadError', handlePreloadError)
  return () =>
    window.removeEventListener('vite:preloadError', handlePreloadError)
}
