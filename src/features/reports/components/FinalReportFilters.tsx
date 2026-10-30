import { PageSectionPlaceholder, type PageSectionSpec } from '../../../shared/ui/PageSectionPlaceholder'

interface FinalReportFiltersProps {
  section: PageSectionSpec
}

/** Demo component boundary for the Final report search filters section. Replace this file's markup with the real UI. */
export function FinalReportFilters({ section }: FinalReportFiltersProps) {
  return <PageSectionPlaceholder section={section} />
}
