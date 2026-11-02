import type { ComponentType } from 'react'
import type { PageSectionSpec } from '../shared/ui/PageSectionPlaceholder'
import * as coordination from '../features/coordination/components'
import * as dashboard from '../features/dashboard/components'
import * as departments from '../features/departments/components'
import * as doctorpools from '../features/doctor-pools/components'
import * as doctors from '../features/doctors/components'
import * as equipment from '../features/equipment/components'
import * as modality from '../features/modality/components'
import * as organization from '../features/organization/components'
import * as reconciliation from '../features/reconciliation/components'
import * as reports from '../features/reports/components'
import * as scheduling from '../features/scheduling/components'
import * as settings from '../features/settings/components'
import * as teleradiology from '../features/teleradiology/components'
import * as users from '../features/users/components'

export const pageSectionComponents: Record<string, ComponentType<{ section: PageSectionSpec }>> = {
  ...coordination,
  ...dashboard,
  ...departments,
  ...doctorpools,
  ...doctors,
  ...equipment,
  ...modality,
  ...organization,
  ...reconciliation,
  ...reports,
  ...scheduling,
  ...settings,
  ...teleradiology,
  ...users,
}

