import { PageSectionPlaceholder, type PageSectionSpec } from '../../../shared/ui/PageSectionPlaceholder'

interface PatientUpdateFiltersProps {
  section: PageSectionSpec
}

/** Demo component boundary for the Patient and date filters section. Replace this file's markup with the real UI. */
export function PatientUpdateFilters({ section }: PatientUpdateFiltersProps) {
  return <PageSectionPlaceholder section={section} />
}
