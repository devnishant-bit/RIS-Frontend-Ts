import { PageSectionPlaceholder, type PageSectionSpec } from '../../../shared/ui/PageSectionPlaceholder'

interface ReportCancelFiltersProps {
  section: PageSectionSpec
}

/** Demo component boundary for the Report search filters section. Replace this file's markup with the real UI. */
export function ReportCancelFilters({ section }: ReportCancelFiltersProps) {
  return <PageSectionPlaceholder section={section} />
}
