import { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router'

import { backendEnabled } from '@/services/api/api-mode'
import {
  getAuthSession,
  expireAuthSession,
  hasExpiredSessionNotice,
  isAccessTokenExpired,
} from '@/services/auth/auth-session'

export function RequireAuth() {
  const location = useLocation()
  const storedSession = getAuthSession()
  const expired = Boolean(
    storedSession && isAccessTokenExpired(storedSession.accessToken),
  )

  useEffect(() => {
    if (expired) expireAuthSession()
  }, [expired])

  if (!backendEnabled || (storedSession && !expired)) return <Outlet />

  const returnTo = `${location.pathname}${location.search}`
  const reason =
    expired || hasExpiredSessionNotice() ? '&reason=session-expired' : ''
  return (
    <Navigate
      replace
      to={`/auth?returnTo=${encodeURIComponent(returnTo)}${reason}`}
    />
  )
}
