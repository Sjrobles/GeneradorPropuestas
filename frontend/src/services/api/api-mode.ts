export const backendEnabled =
  import.meta.env.MODE !== 'test' && import.meta.env.VITE_API_MODE === 'backend'
