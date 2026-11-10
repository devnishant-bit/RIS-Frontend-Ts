import { Navigate, Route, Routes } from 'react-router-dom'
import { LoginPage } from '../features/auth/pages/LoginPage'
import { ForbiddenPage } from '../features/auth/pages/ForbiddenPage'
import { WorklistPage } from '../features/worklist/pages/WorklistPage'
import { TatReportPage } from '../features/reports/pages/TatReportPage'
import { InactiveReportPage } from '../features/reports/pages/InactiveReportPage'
import Calendar1 from '../features/scheduling/pages/Calendar1'
import { DemoFeaturePage } from '../shared/ui/DemoFeaturePage'
import { useAuth } from '../shared/auth/useAuth'
import type { Permission } from '../features/auth/types'
import { AppLayout } from '../layouts/AppLayout'
import { PublicLayout } from '../layouts/PublicLayout'
import { StandaloneLayout } from '../layouts/StandaloneLayout'
import { RequireAuth } from './RequireAuth'
import { RequirePermission } from './RequirePermission'
import { routePaths } from './routePaths'
import { routePageSections } from './routePageSections'
import { ChatPage } from '../features/chat/pages/ChatPage'
import { ChatProviders } from '../layouts/ChatProviders'

interface PageRoute {
  path: string
  title: string
  permission?: Permission
}

// Route list follows the active parent src/App.js. Page bodies are placeholders.
const appPageRoutes: PageRoute[] = [
  { path: routePaths.worklist, title: 'Worklist', permission: 'worklist:open' },
  { path: routePaths.reports, title: 'Reports' },
  { path: routePaths.editor, title: 'Report Editor' },
  { path: routePaths.settings, title: 'Settings' },
  { path: routePaths.chat, title: 'Chat' },
  { path: routePaths.userCreation, title: 'User Creation', permission: 'users:create' },
  { path: routePaths.userGroup, title: 'User Group', permission: 'users:groups' },
  { path: routePaths.userRights, title: 'User Rights', permission: 'users:permissions' },
  { path: routePaths.organizationType, title: 'Organization Type', permission: 'organization:type' },
  { path: routePaths.organizationCreate, title: 'Create Organization', permission: 'organization:manage' },
  { path: routePaths.departmentCreate, title: 'Create Department', permission: 'department:manage' },
  { path: routePaths.jobType, title: 'Job Type', permission: 'job-type:manage' },
  { path: routePaths.newModality, title: 'New Modality', permission: 'modality:manage' },
  { path: routePaths.doctorProfile, title: 'Doctor Profile', permission: 'doctor:manage' },
  { path: routePaths.modalityStats, title: 'Modality Statistics', permission: 'modality:stats' },
  { path: routePaths.reportCancel, title: 'Report Cancel', permission: 'report:cancel' },
  { path: routePaths.reportTemplate, title: 'Report Template', permission: 'report-template:manage' },
  { path: routePaths.lockedReports, title: 'Locked Reports', permission: 'report:locked' },
  { path: routePaths.equipmentMaster, title: 'Equipment Master', permission: 'equipment:manage' },
  { path: routePaths.reconciliation, title: 'Reconciliation', permission: 'reconciliation:manage' },
  { path: routePaths.tatReport, title: 'TAT Report', permission: 'report:tat' },
  { path: routePaths.inactiveReport, title: 'Inactive Report', permission: 'report:inactive' },
  { path: routePaths.finalReport, title: 'Report Delivery', permission: 'report:deliver' },
  { path: routePaths.whatsappLog, title: 'WhatsApp Log', permission: 'whatsapp-log:view' },
  { path: routePaths.updateLog, title: 'Patient Update Log', permission: 'patient:update-log' },
  { path: routePaths.scheduling, title: 'Scheduling' },
  { path: routePaths.modalityList, title: 'Modality Patient List', permission: 'modality:list' },
  { path: routePaths.dashboard, title: 'Dashboard', permission: 'dashboard:view' },
  { path: routePaths.modalityAvailability, title: 'Modality Availability', permission: 'availability:manage' },
  { path: routePaths.scheduler, title: 'Appointment Scheduler', permission: 'scheduler:manage' },
]

function DefaultRedirect() {
  const { user } = useAuth()
  return <Navigate to={user?.defaultPath ?? routePaths.worklist} replace />
}

function MissingRoute() {
  const { status } = useAuth()
  if (status === 'unauthenticated') return <Navigate to={routePaths.login} replace />
  return <DemoFeaturePage title={status === 'loading' ? 'Restoring session' : 'Page not found'} description={status === 'loading' ? 'The parent app waits for its session check before choosing a route.' : 'This route is not present in the parent app inventory or the new skeleton.'} />
}

function renderAppPage(route: PageRoute) {
  if (route.path === routePaths.worklist) return <WorklistPage />
  if (route.path === routePaths.chat) return <ChatPage />
  if (route.path === routePaths.tatReport) return <TatReportPage />
  if (route.path === routePaths.inactiveReport) return <InactiveReportPage />
  // TEMP: this is the destination used by the profile menu's Clinical Schedule shortcut.
  if (route.path === routePaths.scheduling) return <Calendar1 />
  // if(route)
  return <DemoFeaturePage title={route.title} parentPath={route.path} description={`The ${route.title} page from the parent application will be built here.`} sections={routePageSections[route.path]} />
}

export function AppRouter() {
  return (
    <button>click me</button>
  )
}
