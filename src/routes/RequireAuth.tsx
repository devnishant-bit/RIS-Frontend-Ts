import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { routePaths } from './routePaths'
import { useAuth } from '../shared/auth/useAuth'
import styles from './RouteStates.module.css'

export function RequireAuth() {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'loading') {
    return (
      <main className={styles.statePage} aria-live="polite">
        <span className={styles.spinner} aria-hidden="true" />
        <p>Restoring demo session…</p>
        <small>This is a local skeleton state, not a real session check.</small>
      </main>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <Navigate
        to={routePaths.login}
        replace
        state={{ from: `${location.pathname}${location.search}${location.hash}` }}
      />
    )
  }

  return <Outlet />
}
