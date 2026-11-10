import type { AppUser, DemoProfile, Permission } from '../types'

const adminPermissions: Permission[] = [
  'worklist:open', 'dashboard:view', 'tele:worklist', 'coordinator:worklist',
  'client:management', 'users:create', 'users:groups', 'users:permissions',
  'organization:type', 'organization:manage', 'department:manage', 'job-type:manage',
  'modality:manage', 'doctor:manage', 'report-template:manage', 'report:cancel',
  'report:locked', 'equipment:manage', 'reconciliation:manage', 'report:deliver',
  'patient:update-log', 'modality:stats', 'report:tat', 'report:inactive',
  'modality:list', 'whatsapp-log:view', 'availability:manage', 'scheduler:manage',
]

/**
 * Demo-only authentication boundary. Replace these methods with the backend's
 * session API after its cookie, CSRF, and session restoration contract is agreed.
 * This implementation never authenticates against the real RIS backend.
 */
export const authApi = {
  async restoreDemoSession(): Promise<AppUser | null> {
    await new Promise((resolve) => window.setTimeout(resolve, 250))
    return null
  },

  async loginAsDemo(profile: DemoProfile): Promise<AppUser> {
    const profiles: Record<DemoProfile, AppUser> = {
      worklist: {
        id: 'demo-worklist-user', displayName: 'Demo Worklist User', demoProfile: 'worklist',
        isAdmin: false, worklistMode: 'RIS', defaultPath: '/worklist', permissions: ['worklist:open'],
      },
      pacs: {
        id: 'demo-pacs-user', displayName: 'Demo PACS User', demoProfile: 'pacs',
        isAdmin: false, worklistMode: 'PACS', defaultPath: '/worklist', permissions: ['worklist:open'],
      },
      admin: {
        id: 'demo-admin', displayName: 'Demo Administrator', demoProfile: 'admin',
        isAdmin: true, worklistMode: 'RIS', defaultPath: '/master/mis/reports/dashboard', permissions: adminPermissions,
      },
      tele: {
        id: 'demo-tele', displayName: 'Demo Teleradiology User', demoProfile: 'tele',
        isAdmin: false, worklistMode: null, defaultPath: '/teleRadio', permissions: ['tele:worklist'],
      },
      coordinator: {
        id: 'demo-coordinator', displayName: 'Demo Coordinator', demoProfile: 'coordinator',
        isAdmin: false, worklistMode: null, defaultPath: '/CoordinatorDashboard', permissions: ['coordinator:worklist'],
      },
      client: {
        id: 'demo-client', displayName: 'Demo Client User', demoProfile: 'client',
        isAdmin: false, worklistMode: null, defaultPath: '/teleClientExt', permissions: ['client:management'],
      },
    }

    return profiles[profile]
  },
}
