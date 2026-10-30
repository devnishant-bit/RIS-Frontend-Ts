import { PageSectionPlaceholder, type PageSectionSpec } from '../../../shared/ui/PageSectionPlaceholder'

interface ReconciliationResultsTableProps {
  section: PageSectionSpec
}

/** Demo component boundary for the Reconciliation results section. Replace this file's markup with the real UI. */
export function ReconciliationResultsTable({ section }: ReconciliationResultsTableProps) {
  return <PageSectionPlaceholder section={section} />
}
