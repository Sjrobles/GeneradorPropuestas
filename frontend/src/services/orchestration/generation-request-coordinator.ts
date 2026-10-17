const activeGenerationRequests = new Map<string, Promise<unknown>>()

/**
 * Reuses an in-flight generation request for the same project and releases it
 * when the API promise settles, even if the React screen that started it was
 * unmounted in the meantime.
 */
export function coordinateGenerationRequest<T>(
  projectId: string,
  request: () => Promise<T>,
): Promise<T> {
  const activeRequest = activeGenerationRequests.get(projectId)
  if (activeRequest) return activeRequest as Promise<T>

  const requestPromise = Promise.resolve().then(request)
  const trackedRequest = requestPromise.finally(() => {
    if (activeGenerationRequests.get(projectId) === trackedRequest) {
      activeGenerationRequests.delete(projectId)
    }
  })
  activeGenerationRequests.set(projectId, trackedRequest)
  return trackedRequest
}
