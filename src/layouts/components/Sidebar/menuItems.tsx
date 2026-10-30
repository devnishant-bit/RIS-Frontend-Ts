import type { IconName } from './icons';

export interface SidebarLink {
  kind: 'link';
  label: string;
  to: string;
  icon?: IconName;
}

export interface SidebarBranch {
  kind: 'branch';
  label: string;
  icon?: IconName;
  children: SidebarNode[];
}

export type SidebarNode = SidebarLink | SidebarBranch;

const link = (label: string, to: string): SidebarLink => ({ kind: 'link', label, to });

/**
 * Menu tree taken from the legacy sidebar (`masterMenuItems`) and placed under the
 * new sidebar's Worklist / Chat / Admin structure.
 *
 * NOTE: UI-only. Legacy permission filtering (`submenuPermissions`) is intentionally
 * not applied here. Filter this tree before passing it to <Sidebar menu={...} />.
 * TODO: replace the literal paths with constants from `routes/routePaths.ts`.
 */
export const defaultSidebarMenu: SidebarNode[] = [
  { kind: 'link', label: 'Worklist', to: '/worklist', icon: 'worklist' },
  // Chat exists in the new design only; confirm its route before wiring it.
  { kind: 'link', label: 'Chat', to: '/chat', icon: 'chat' },
  {
    kind: 'branch',
    label: 'Admin',
    icon: 'admin',
    children: [
      {
        kind: 'branch',
        label: 'User',
        icon: 'user',
        children: [
          link('User Creation', '/master/user/userCreation'),
          link('User Group', '/master/user/userGroup'),
          link('User Rights', '/master/user/userRights'),
        ],
      },
      {
        kind: 'branch',
        label: 'Organization',
        icon: 'organization',
        children: [
          link('Org Type', '/master/organization/type'),
          link('Create Org', '/master/organization/create'),
        ],
      },
      {
        kind: 'branch',
        label: 'Department',
        icon: 'department',
        children: [
          link('Create Dept', '/master/department/create'),
          link('Job Type', '/master/department/jobType'),
        ],
      },
      {
        kind: 'branch',
        label: 'Modality',
        icon: 'modality',
        children: [link('New Modality', '/master/modality/newModality')],
      },
      {
        kind: 'branch',
        label: 'Doctor',
        icon: 'doctor',
        children: [link('Doctor Profile', '/master/doctor/doctorProfile')],
      },
      {
        kind: 'branch',
        label: 'Utilities',
        icon: 'utilities',
        children: [
          link('Report Template', '/master/tools/reportTemplate'),
          link('Report Cancel', '/master/tools/cancelReport'),
          link('Locked Reports', '/master/tools/lockedReports'),
          link('Equipment Master', '/master/tools/equipmentMaster'),
          link('Reconciliation', '/master/tools/reconciliation'),
          link('Report Delivery', '/master/tools/finalReport'),
          link('Patient Update Log', '/master/tools/updateLog'),
        ],
      },
      {
        kind: 'branch',
        label: 'MIS',
        icon: 'mis',
        children: [
          {
            kind: 'branch',
            label: 'Reports',
            children: [
              link('Modality Stat Report', '/master/mis/reports/modalityStats'),
              link('Inactive Report', '/master/mis/reports/InactiveReport'),
              link('TAT Report', '/master/mis/reports/tatReport'),
              link('Modality Patient List', '/master/mis/reports/modalityList'),
              link('Dashboard', '/master/mis/reports/dashboard'),
              link('WhatsApp Log', '/master/mis/reports/whatsappLog'),
            ],
          },
        ],
      },
    ],
  },
];