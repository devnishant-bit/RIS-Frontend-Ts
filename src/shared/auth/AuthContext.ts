import { createContext } from 'react'
import type { AppUser, DemoProfile, Permission } from '../../features/auth/types'

export interface AuthContextValue {
  status: 'loading' | 'authenticated' | 'unauthenticated'
  user: AppUser | null
  loginAsDemo: (profile: DemoProfile) => Promise<AppUser>
  logout: () => void
  hasPermission: (permission: Permission) => boolean
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)