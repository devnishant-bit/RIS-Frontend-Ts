import { PageSectionPlaceholder, type PageSectionSpec } from '../../../shared/ui/PageSectionPlaceholder'

interface TatReportTableProps {
  section: PageSectionSpec
}

/** Demo component boundary for the Turnaround time results section. Replace this file's markup with the real UI. */
export function TatReportTable({ section }: TatReportTableProps) {
  return <PageSectionPlaceholder section={section} />
}
