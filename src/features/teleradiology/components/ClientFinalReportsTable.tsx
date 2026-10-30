import { PageSectionPlaceholder, type PageSectionSpec } from '../../../shared/ui/PageSectionPlaceholder'

interface ClientFinalReportsTableProps {
  section: PageSectionSpec
}

/** Demo component boundary for the Final reports section. Replace this file's markup with the real UI. */
export function ClientFinalReportsTable({ section }: ClientFinalReportsTableProps) {
  return <PageSectionPlaceholder section={section} />
}
