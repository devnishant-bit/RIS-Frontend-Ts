import { PageSectionPlaceholder, type PageSectionSpec } from '../../../shared/ui/PageSectionPlaceholder'

interface CancelableReportsTableProps {
  section: PageSectionSpec
}

/** Demo component boundary for the Reports available to cancel section. Replace this file's markup with the real UI. */
export function CancelableReportsTable({ section }: CancelableReportsTableProps) {
  return <PageSectionPlaceholder section={section} />
}
