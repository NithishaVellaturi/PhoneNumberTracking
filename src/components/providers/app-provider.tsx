import type { PropsWithChildren } from 'react'
import { useEffect, useEffectEvent } from 'react'
import { authService } from '../../services/auth-service'
import { primeCsrfToken, refreshSessionRequest } from '../../services/http'
import { useAuthStore } from '../../store/auth-store'
import { useToastStore } from '../../store/toast-store'
import { ToastViewport } from '../ui/toast-viewport'

function AuthBootstrap() {
  const status = useAuthStore((state) => state.status)
  const expiresAt = useAuthStore((state) => state.expiresAt)
  const setSession = useAuthStore((state) => state.setSession)
  const clearSession = useAuthStore((state) => state.clearSession)
  const pushToast = useToastStore((state) => state.pushToast)

  useEffect(() => {
    let isMounted = true

    const bootstrap = async () => {
      try {
        await primeCsrfToken()
        const session = await authService.session()
        if (isMounted) {
          if (session.data.authenticated && session.data.user !== null) {
            const nextExpiry = useAuthStore.getState().expiresAt ?? new Date(Date.now() + 15 * 60 * 1000).toISOString()
            setSession(session.data.user, nextExpiry)
          } else {
            clearSession()
          }
        }
      } catch {
        if (isMounted) {
          clearSession()
        }
      }
    }

    void bootstrap()

    return () => {
      isMounted = false
    }
  }, [clearSession, setSession])

  const refreshSession = useEffectEvent(async () => {
    if (status !== 'authenticated' || expiresAt === null) {
      return
    }

    const refreshedSession = await refreshSessionRequest()
    if (refreshedSession === null) {
      clearSession()
      pushToast({
        tone: 'info',
        title: 'Session ended',
        description: 'Please sign in again to continue.',
      })
      return
    }

    setSession(refreshedSession.user, refreshedSession.expiresAt)
  })

  useEffect(() => {
    if (status !== 'authenticated' || expiresAt === null) {
      return undefined
    }

    const expiresAtMs = new Date(expiresAt).getTime()
    const msUntilRefresh = Math.max(expiresAtMs - Date.now() - 60_000, 5_000)
    const timeoutId = window.setTimeout(() => {
      void refreshSession()
    }, msUntilRefresh)

    return () => window.clearTimeout(timeoutId)
  }, [expiresAt, status])

  return null
}

export function AppProvider({ children }: PropsWithChildren) {
  return (
    <>
      <AuthBootstrap />
      <ToastViewport />
      {children}
    </>
  )
}
