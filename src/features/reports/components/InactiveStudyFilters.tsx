import { PageSectionPlaceholder, type PageSectionSpec } from '../../../shared/ui/PageSectionPlaceholder'

interface InactiveStudyFiltersProps {
  section: PageSectionSpec
}

/** Demo component boundary for the Inactive study filters section. Replace this file's markup with the real UI. */
export function InactiveStudyFilters({ section }: InactiveStudyFiltersProps) {
  return <PageSectionPlaceholder section={section} />
}
