import { useCallback, useEffect, useMemo, useState, type PropsWithChildren } from 'react'
import { authApi } from '../../features/auth/api/authApi'
import type { AppUser, AuthStatus, DemoProfile, Permission } from '../../features/auth/types'
import { AuthContext } from './AuthContext'

export function AuthProvider({ children }: PropsWithChildren) {
  const [status, setStatus] = useState<AuthStatus>('loading')
  const [user, setUser] = useState<AppUser | null>(null)

  useEffect(() => {
    let isCurrent = true

    void authApi.restoreDemoSession().then((restoredUser) => {
      if (!isCurrent) return
      setUser(restoredUser)
      setStatus(restoredUser ? 'authenticated' : 'unauthenticated')
    })

    return () => {
      isCurrent = false
    }
  }, [])

  const loginAsDemo = useCallback(async (profile: DemoProfile) => {
    const demoUser = await authApi.loginAsDemo(profile)
    setUser(demoUser)
    setStatus('authenticated')
    return demoUser
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setStatus('unauthenticated')
  }, [])

  const hasPermission = useCallback(
    (permission: Permission) => user?.permissions.includes(permission) ?? false,
    [user],
  )

  const value = useMemo(
    () => ({ status, user, loginAsDemo, logout, hasPermission }),
    [status, user, loginAsDemo, logout, hasPermission],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}