export type Permission =
  | 'worklist:open'
  | 'dashboard:view'
  | 'tele:worklist'
  | 'coordinator:worklist'
  | 'client:management'
  | 'users:create'
  | 'users:groups'
  | 'users:permissions'
  | 'organization:type'
  | 'organization:manage'
  | 'department:manage'
  | 'job-type:manage'
  | 'modality:manage'
  | 'doctor:manage'
  | 'report-template:manage'
  | 'report:cancel'
  | 'report:locked'
  | 'equipment:manage'
  | 'reconciliation:manage'
  | 'report:deliver'
  | 'patient:update-log'
  | 'modality:stats'
  | 'report:tat'
  | 'report:inactive'
  | 'modality:list'
  | 'whatsapp-log:view'
  | 'availability:manage'
  | 'scheduler:manage'

export type DemoProfile = 'worklist' | 'pacs' | 'admin' | 'tele' | 'coordinator' | 'client'

export interface AppUser {
  id: string
  displayName: string
  demoProfile: DemoProfile
  isAdmin: boolean
  worklistMode: 'RIS' | 'PACS' | null
  defaultPath: string
  permissions: Permission[]
}

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'