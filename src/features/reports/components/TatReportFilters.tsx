import { PageSectionPlaceholder, type PageSectionSpec } from '../../../shared/ui/PageSectionPlaceholder'

interface TatReportFiltersProps {
  section: PageSectionSpec
}

/** Demo component boundary for the Turnaround time report filters section. Replace this file's markup with the real UI. */
export function TatReportFilters({ section }: TatReportFiltersProps) {
  return <PageSectionPlaceholder section={section} />
}
