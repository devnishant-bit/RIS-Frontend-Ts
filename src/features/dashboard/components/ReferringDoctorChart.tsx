import { PageSectionPlaceholder, type PageSectionSpec } from '../../../shared/ui/PageSectionPlaceholder'

interface ReferringDoctorChartProps {
  section: PageSectionSpec
}

/** Demo component boundary for the Referring doctors section. Replace this file's markup with the real UI. */
export function ReferringDoctorChart({ section }: ReferringDoctorChartProps) {
  return <PageSectionPlaceholder section={section} />
}
