import { PageSectionPlaceholder, type PageSectionSpec } from '../../../shared/ui/PageSectionPlaceholder'

interface ModalityReportFiltersProps {
  section: PageSectionSpec
}

/** Demo component boundary for the Date and modality filters section. Replace this file's markup with the real UI. */
export function ModalityReportFilters({ section }: ModalityReportFiltersProps) {
  return <PageSectionPlaceholder section={section} />
}
