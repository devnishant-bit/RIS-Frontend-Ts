import { PageSectionPlaceholder, type PageSectionSpec } from '../../../shared/ui/PageSectionPlaceholder'

interface PatientCountCardProps {
  section: PageSectionSpec
}

/** Demo component boundary for the Patient count section. Replace this file's markup with the real UI. */
export function PatientCountCard({ section }: PatientCountCardProps) {
  return <PageSectionPlaceholder section={section} />
}
