import { PageSectionPlaceholder, type PageSectionSpec } from '../../../shared/ui/PageSectionPlaceholder'

interface OrganizationTypeFormProps {
  section: PageSectionSpec
}

/** Demo component boundary for the Organization type details section. Replace this file's markup with the real UI. */
export function OrganizationTypeForm({ section }: OrganizationTypeFormProps) {
  return <PageSectionPlaceholder section={section} />
}
