import { PageSectionPlaceholder, type PageSectionSpec } from '../../../shared/ui/PageSectionPlaceholder'

interface OrganizationTypesTableProps {
  section: PageSectionSpec
}

/** Demo component boundary for the Organization types section. Replace this file's markup with the real UI. */
export function OrganizationTypesTable({ section }: OrganizationTypesTableProps) {
  return <PageSectionPlaceholder section={section} />
}
