import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import type { DemoProfile } from '../types'
import { useAuth } from '../../../shared/auth/useAuth'
import styles from './LoginPage.module.css'

export function LoginPage() {
  const { status, user, loginAsDemo } = useAuth()
  const navigate = useNavigate()
  const [isSigningIn, setIsSigningIn] = useState(false)

  if (status === 'loading') {
    return <main className={styles.loading}>Preparing the demo sign-in…</main>
  }

  if (status === 'authenticated') {
    return <Navigate to={user?.defaultPath ?? '/worklist'} replace />
  }

  async function signInAs(profile: DemoProfile) {
    setIsSigningIn(true)
    try {
      const demoUser = await loginAsDemo(profile)
      navigate(demoUser.defaultPath, { replace: true })
    } finally {
      setIsSigningIn(false)
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.card} aria-labelledby="login-title">
        <div className={styles.brandMark} aria-hidden="true">R</div>
        <p className={styles.eyebrow}>RIS / PACS FRONTEND</p>
        <h1 id="login-title">Sign in to the demo</h1>
        <p className={styles.description}>
          Choose a demo profile to follow the same default-route priorities as the parent app.
          No credentials are sent or stored.
        </p>
        <div className={styles.actions}>
          <button
            className={styles.primaryButton}
            disabled={isSigningIn}
            onClick={() => void signInAs('pacs')}
            type="button"
          >
            Worklist user (RIS)
          </button>
          <button
            className={styles.secondaryButton}
            disabled={isSigningIn}
            onClick={() => void signInAs('admin')}
            type="button"
          >
            Worklist user (PACS)
          </button>
          <button
            className={styles.secondaryButton}
            disabled={isSigningIn}
            onClick={() => void signInAs('admin')}
            type="button"
          >
            Admin (opens Dashboard)
          </button>
          <button
            className={styles.secondaryButton}
            disabled={isSigningIn}
            onClick={() => void signInAs('tele')}
            type="button"
          >
            Teleradiology user
          </button>
          <button
            className={styles.secondaryButton}
            disabled={isSigningIn}
            onClick={() => void signInAs('coordinator')}
            type="button"
          >
            Coordinator user
          </button>
          <button
            className={styles.secondaryButton}
            disabled={isSigningIn}
            onClick={() => void signInAs('client')}
            type="button"
          >
            Client user
          </button>
        </div>
        <div className={styles.disclaimer} role="note">
          Demo authentication only. This does not validate a real RIS/PACS session.
        </div>
      </section>
    </main>
  )
}
