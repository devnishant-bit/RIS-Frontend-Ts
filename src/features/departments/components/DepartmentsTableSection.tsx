import { PageSectionPlaceholder, type PageSectionSpec } from '../../../shared/ui/PageSectionPlaceholder'

interface DepartmentsTableSectionProps {
  section: PageSectionSpec
}

/** Demo component boundary for the Departments section. Replace this file's markup with the real UI. */
export function DepartmentsTableSection({ section }: DepartmentsTableSectionProps) {
  return <PageSectionPlaceholder section={section} />
}
