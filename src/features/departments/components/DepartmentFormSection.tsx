import { PageSectionPlaceholder, type PageSectionSpec } from '../../../shared/ui/PageSectionPlaceholder'

interface DepartmentFormSectionProps {
  section: PageSectionSpec
}

/** Demo component boundary for the Department details section. Replace this file's markup with the real UI. */
export function DepartmentFormSection({ section }: DepartmentFormSectionProps) {
  return <PageSectionPlaceholder section={section} />
}
