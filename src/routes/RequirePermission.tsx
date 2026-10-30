import { Navigate, Outlet } from 'react-router-dom'
import type { Permission } from '../features/auth/types'
import { useAuth } from '../shared/auth/useAuth'
import { routePaths } from './routePaths'

interface RequirePermissionProps {
  permission: Permission
  redirectTo?: string
}

export function RequirePermission({ permission, redirectTo = routePaths.forbidden }: RequirePermissionProps) {
  const { hasPermission } = useAuth()
  return hasPermission(permission) ? <Outlet /> : <Navigate to={redirectTo} replace />
}
