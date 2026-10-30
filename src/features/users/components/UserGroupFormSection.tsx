import { PageSectionPlaceholder, type PageSectionSpec } from '../../../shared/ui/PageSectionPlaceholder'

interface UserGroupFormSectionProps {
  section: PageSectionSpec
}

/** Demo component boundary for the User group details section. Replace this file's markup with the real UI. */
export function UserGroupFormSection({ section }: UserGroupFormSectionProps) {
  return <PageSectionPlaceholder section={section} />
}
