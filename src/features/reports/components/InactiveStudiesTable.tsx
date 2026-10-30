import { PageSectionPlaceholder, type PageSectionSpec } from '../../../shared/ui/PageSectionPlaceholder'

interface InactiveStudiesTableProps {
  section: PageSectionSpec
}

/** Demo component boundary for the Inactive studies section. Replace this file's markup with the real UI. */
export function InactiveStudiesTable({ section }: InactiveStudiesTableProps) {
  return <PageSectionPlaceholder section={section} />
}
