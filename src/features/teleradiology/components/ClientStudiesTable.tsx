import { PageSectionPlaceholder, type PageSectionSpec } from '../../../shared/ui/PageSectionPlaceholder'

interface ClientStudiesTableProps {
  section: PageSectionSpec
}

/** Demo component boundary for the Studies to report section. Replace this file's markup with the real UI. */
export function ClientStudiesTable({ section }: ClientStudiesTableProps) {
  return <PageSectionPlaceholder section={section} />
}
