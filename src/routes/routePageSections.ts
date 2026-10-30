import type { PageSectionSpec } from '../shared/ui/PageSectionPlaceholder'
import { routePaths } from './routePaths'

/** Section map based on the visible structure of each routed page in the parent app. */
export const routePageSections: Record<string, PageSectionSpec[]> = {
  [routePaths.reports]: [
    { kind: 'workspace', title: 'Reports workspace', componentName: 'ReportsWorkspace' },
  ],
  [routePaths.editor]: [
    { kind: 'workspace', title: 'Document editor', componentName: 'DocumentEditorWorkspace' },
  ],
  [routePaths.settings]: [
    { kind: 'workspace', title: 'Settings workspace', componentName: 'SettingsWorkspace' },
  ],
  [routePaths.userCreation]: [
    { kind: 'list', title: 'Users list and search', componentName: 'UsersListSection', span: 4 },
    { kind: 'form', title: 'User details', componentName: 'UserDetailsFormSection', span: 8 },
  ],
  [routePaths.userGroup]: [
    { kind: 'form', title: 'User group details', componentName: 'UserGroupFormSection', span: 6 },
    { kind: 'table', title: 'Existing user groups', componentName: 'UserGroupsTableSection', span: 6 },
  ],
  [routePaths.userRights]: [
    { kind: 'form', title: 'Select user group', componentName: 'UserGroupSelector', span: 4 },
    { kind: 'list', title: 'Modules and feature sets', componentName: 'ModuleFeatureSetsSection', span: 8 },
    { kind: 'summary', title: 'Permission preview', componentName: 'PermissionPreviewSection', span: 12 },
  ],
  [routePaths.organizationType]: [
    { kind: 'form', title: 'Organization type details', componentName: 'OrganizationTypeForm', span: 6 },
    { kind: 'table', title: 'Organization types', componentName: 'OrganizationTypesTable', span: 6 },
  ],
  [routePaths.organizationCreate]: [
    { kind: 'form', title: 'Organization details and address', componentName: 'OrganizationDetailsForm', span: 8 },
    { kind: 'form', title: 'Branding and branch settings', componentName: 'OrganizationBrandingSettings', span: 4 },
  ],
  [routePaths.departmentCreate]: [
    { kind: 'form', title: 'Department details', componentName: 'DepartmentFormSection', span: 6 },
    { kind: 'table', title: 'Departments', componentName: 'DepartmentsTableSection', span: 6 },
  ],
  [routePaths.jobType]: [
    { kind: 'form', title: 'Job type details', componentName: 'JobTypeFormSection', span: 6 },
    { kind: 'table', title: 'Job types', componentName: 'JobTypesTableSection', span: 6 },
  ],
  [routePaths.newModality]: [
    { kind: 'form', title: 'Equipment and protocol details', componentName: 'EquipmentDetailsForm', span: 6 },
    { kind: 'form', title: 'Network and modality settings', componentName: 'EquipmentConnectionSettings', span: 6 },
    { kind: 'table', title: 'Configured equipment', componentName: 'EquipmentListTable', span: 12 },
  ],
  [routePaths.doctorProfile]: [
    { kind: 'list', title: 'Doctors list and search', componentName: 'DoctorsListSection', span: 4 },
    { kind: 'form', title: 'Doctor profile and signature', componentName: 'DoctorProfileFormSection', span: 8 },
  ],
  [routePaths.modalityStats]: [
    { kind: 'filters', title: 'Date and modality filters', componentName: 'ModalityReportFilters', span: 12 },
    { kind: 'table', title: 'Modality statistics', componentName: 'ModalityStatisticsTable', span: 8 },
    { kind: 'summary', title: 'Total study count', componentName: 'TotalStudyCountSummary', span: 4 },
  ],
  [routePaths.reportCancel]: [
    { kind: 'filters', title: 'Report search filters', componentName: 'ReportCancelFilters', span: 12 },
    { kind: 'table', title: 'Reports available to cancel', componentName: 'CancelableReportsTable', span: 12 },
  ],
  [routePaths.reportTemplate]: [
    { kind: 'workspace', title: 'Template editor launch point', componentName: 'ReportTemplateEditorLaunch' },
  ],
  [routePaths.lockedReports]: [
    { kind: 'table', title: 'Locked reports', componentName: 'LockedReportsTable' },
  ],
  [routePaths.equipmentMaster]: [
    { kind: 'form', title: 'Equipment details', componentName: 'EquipmentMasterForm', span: 6 },
    { kind: 'form', title: 'Equipment schedule and processing time', componentName: 'EquipmentScheduleForm', span: 6 },
  ],
  [routePaths.reconciliation]: [
    { kind: 'filters', title: 'Reconciliation date filters', componentName: 'ReconciliationFilters', span: 12 },
    { kind: 'table', title: 'Reconciliation results', componentName: 'ReconciliationResultsTable', span: 12 },
  ],
  [routePaths.tatReport]: [
    { kind: 'filters', title: 'Turnaround time report filters', componentName: 'TatReportFilters', span: 12 },
    { kind: 'table', title: 'Turnaround time results', componentName: 'TatReportTable', span: 12 },
  ],
  [routePaths.inactiveReport]: [
    { kind: 'filters', title: 'Inactive study filters', componentName: 'InactiveStudyFilters', span: 12 },
    { kind: 'table', title: 'Inactive studies', componentName: 'InactiveStudiesTable', span: 12 },
  ],
  [routePaths.finalReport]: [
    { kind: 'filters', title: 'Final report search filters', componentName: 'FinalReportFilters', span: 12 },
    { kind: 'table', title: 'Reports for delivery', componentName: 'FinalReportsTable', span: 12 },
    { kind: 'form', title: 'Delivery and print options', componentName: 'ReportDeliveryOptions', span: 12 },
  ],
  [routePaths.whatsappLog]: [
    { kind: 'filters', title: 'Patient and date filters', componentName: 'WhatsAppLogFilters', span: 12 },
    { kind: 'table', title: 'WhatsApp message log', componentName: 'WhatsAppMessagesTable', span: 12 },
  ],
  [routePaths.updateLog]: [
    { kind: 'filters', title: 'Patient and date filters', componentName: 'PatientUpdateFilters', span: 12 },
    { kind: 'table', title: 'Patient update history', componentName: 'PatientUpdatesTable', span: 12 },
  ],
  [routePaths.scheduling]: [
    { kind: 'calendar', title: 'Scheduling calendar', componentName: 'SchedulingCalendar', span: 8 },
    { kind: 'summary', title: 'Appointments and room summary', componentName: 'ScheduleSummaryPanel', span: 4 },
  ],
  [routePaths.modalityList]: [
    { kind: 'filters', title: 'Date, doctor, and modality filters', componentName: 'ModalityPatientFilters', span: 12 },
    { kind: 'table', title: 'Modality patient list', componentName: 'ModalityPatientTable', span: 12 },
  ],
  [routePaths.dashboard]: [
    { kind: 'filters', title: 'Dashboard date options', componentName: 'DashboardDateFilter', span: 12 },
    { kind: 'summary', title: 'Patient count', componentName: 'PatientCountCard', span: 4 },
    { kind: 'chart', title: 'Study volume', componentName: 'StudyVolumeChart', span: 8 },
    { kind: 'chart', title: 'Gender-wise patient count', componentName: 'GenderPatientChart', span: 4 },
    { kind: 'chart', title: 'Modality distribution', componentName: 'ModalityDistributionChart', span: 4 },
    { kind: 'chart', title: 'Assigned doctors', componentName: 'AssignedDoctorChart', span: 6 },
    { kind: 'chart', title: 'Referring doctors', componentName: 'ReferringDoctorChart', span: 6 },
  ],
  [routePaths.modalityAvailability]: [
    { kind: 'form', title: 'Modality and machine availability', componentName: 'ModalityAvailabilityForm', span: 8 },
    { kind: 'summary', title: 'Operating hours and slot summary', componentName: 'AvailabilitySummary', span: 4 },
  ],
  [routePaths.scheduler]: [
    { kind: 'list', title: 'Patient search and selection', componentName: 'PatientSearchPanel', span: 4 },
    { kind: 'list', title: 'Available modality slots', componentName: 'ModalitySlotsPanel', span: 4 },
    { kind: 'calendar', title: 'Appointment calendar', componentName: 'AppointmentCalendar', span: 4 },
    { kind: 'form', title: 'Create appointment', componentName: 'AppointmentDetailsForm', span: 12 },
  ],
  [routePaths.worklistWindow]: [
    { kind: 'filters', title: 'Date and modality filters', componentName: 'WorklistWindowFilters', span: 12 },
    { kind: 'table', title: 'Worklist studies', componentName: 'WorklistWindowTable', span: 12 },
  ],
  [routePaths.teleRadio]: [
    { kind: 'filters', title: 'Tele-radiology filters', componentName: 'TeleWorklistFilters', span: 12 },
    { kind: 'table', title: 'Studies to report', componentName: 'TeleWorklistTable', span: 12 },
    { kind: 'workspace', title: 'Report editor panel', componentName: 'TeleReportEditorPanel', span: 12 },
  ],
  [routePaths.teleClientExt]: [
    { kind: 'table', title: 'Studies to report', componentName: 'ClientStudiesTable', span: 12 },
    { kind: 'table', title: 'Final reports', componentName: 'ClientFinalReportsTable', span: 12 },
    { kind: 'summary', title: 'Send progress', componentName: 'ClientSendProgressPanel', span: 12 },
  ],
  [routePaths.coordinatorDashboard]: [
    { kind: 'table', title: 'Coordinator worklist', componentName: 'CoordinatorWorklistTable', span: 8 },
    { kind: 'workspace', title: 'Clinical notes', componentName: 'ClinicalNotesPanel', span: 4 },
    { kind: 'summary', title: 'Vitals snapshot', componentName: 'VitalsSnapshotPanel', span: 4 },
    { kind: 'list', title: 'Attached documents', componentName: 'AttachedDocumentsPanel', span: 4 },
    { kind: 'form', title: 'Assign radiologist', componentName: 'RadiologistAssignmentForm', span: 4 },
  ],
  [routePaths.doctorPoolSetup]: [
    { kind: 'table', title: 'Doctor pools', componentName: 'DoctorPoolsTable', span: 12 },
    { kind: 'form', title: 'Pool members and assignments', componentName: 'PoolMembersEditor', span: 8 },
    { kind: 'list', title: 'Modalities covered', componentName: 'CoveredModalitiesList', span: 4 },
  ],
}
