import { PageSectionPlaceholder, type PageSectionSpec } from '../../../shared/ui/PageSectionPlaceholder'

interface GenderPatientChartProps {
  section: PageSectionSpec
}

/** Demo component boundary for the Gender-wise patient count section. Replace this file's markup with the real UI. */
export function GenderPatientChart({ section }: GenderPatientChartProps) {
  return <PageSectionPlaceholder section={section} />
}
