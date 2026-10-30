import { PageSectionPlaceholder, type PageSectionSpec } from '../../../shared/ui/PageSectionPlaceholder'

interface AssignedDoctorChartProps {
  section: PageSectionSpec
}

/** Demo component boundary for the Assigned doctors section. Replace this file's markup with the real UI. */
export function AssignedDoctorChart({ section }: AssignedDoctorChartProps) {
  return <PageSectionPlaceholder section={section} />
}
