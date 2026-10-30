import { PageSectionPlaceholder, type PageSectionSpec } from '../../../shared/ui/PageSectionPlaceholder'

interface OrganizationDetailsFormProps {
  section: PageSectionSpec
}

/** Demo component boundary for the Organization details and address section. Replace this file's markup with the real UI. */
export function OrganizationDetailsForm({ section }: OrganizationDetailsFormProps) {
  return <PageSectionPlaceholder section={section} />
}
