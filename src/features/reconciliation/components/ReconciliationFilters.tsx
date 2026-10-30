import { PageSectionPlaceholder, type PageSectionSpec } from '../../../shared/ui/PageSectionPlaceholder'

interface ReconciliationFiltersProps {
  section: PageSectionSpec
}

/** Demo component boundary for the Reconciliation date filters section. Replace this file's markup with the real UI. */
export function ReconciliationFilters({ section }: ReconciliationFiltersProps) {
  return <PageSectionPlaceholder section={section} />
}
