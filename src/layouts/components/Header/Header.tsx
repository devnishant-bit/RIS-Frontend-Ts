import { Link } from 'react-router-dom'
import styles from './Header.module.css'
import { useAuth } from '../../../shared/auth/useAuth'
import { routePaths } from '../../../routes/routePaths'

export function Header() {
  const { user, logout } = useAuth()

  return (
    <header className={styles.header}>
      <Link className={styles.brand} to={routePaths.worklist} aria-label="RIS home">
        <span className={styles.brandMark} aria-hidden="true">R</span>
        <span>
          <strong>RIS / PACS</strong>
          <small>Clinical information system</small>
        </span>
      </Link>
      <div className={styles.actions}>
        <span className={styles.demoTag}>DEMO SKELETON</span>
        <span className={styles.userName}>{user?.displayName}</span>
        <button className={styles.logoutButton} onClick={logout} type="button">
          Sign out
        </button>
      </div>
    </header>
  )
}
