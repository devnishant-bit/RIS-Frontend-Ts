import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
// import { Header } from './components/Header/Header'
import Sidebar from './components/Sidebar/Sidebar'
import styles from './AppLayout.module.css'
import { useAuth } from '../shared/auth/useAuth'
import { routePaths } from '../routes/routePaths'

export function AppLayout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 1023px)').matches,
  )
  const showSidebar = Boolean(user?.isAdmin && location.pathname !== routePaths.editor)
  const bodyClassName = showSidebar
    ? `${styles.body} ${styles.withSidebar} ${sidebarCollapsed ? styles.sidebarCollapsed : styles.sidebarExpanded}`
    : `${styles.body} ${styles.withoutSidebar}`

  return (
    <div className={styles.shell}>
      {/* <Header /> */}
      <div className={bodyClassName}>
        {showSidebar && (
          <Sidebar
            user={{
              name: user?.displayName ?? 'Demo User',
              role: user?.isAdmin ? 'Administrator' : 'User',
            }}
            onLogout={logout}
            onCollapsedChange={setSidebarCollapsed}
          />
        )}
        <main className={styles.main} id="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
