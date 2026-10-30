import { Outlet } from 'react-router-dom'
import styles from './StandaloneLayout.module.css'

export function StandaloneLayout() {
  return (
    <main className={styles.standalone}>
      <Outlet />
    </main>
  )
}
