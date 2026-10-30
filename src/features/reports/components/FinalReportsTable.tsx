import { PageSectionPlaceholder, type PageSectionSpec } from '../../../shared/ui/PageSectionPlaceholder'

interface FinalReportsTableProps {
  section: PageSectionSpec
}

/** Demo component boundary for the Reports for delivery section. Replace this file's markup with the real UI. */
export function FinalReportsTable({ section }: FinalReportsTableProps) {
  return <PageSectionPlaceholder section={section} />
}
