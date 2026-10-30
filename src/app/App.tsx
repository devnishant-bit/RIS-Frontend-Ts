import { AppRouter } from '../routes/AppRouter'
import { useAuth } from '../shared/auth/useAuth'
import styles from './App.module.css'

export function App() {
  const { status } = useAuth()
  if (status === 'loading') {
    return (
      <main className={styles.sessionLoading} aria-live="polite">
        <span className={styles.spinner} aria-hidden="true" />
        <p>Checking demo session…</p>
      </main>
    )
  }
  return <AppRouter />
}
