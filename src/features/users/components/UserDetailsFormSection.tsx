import { PageSectionPlaceholder, type PageSectionSpec } from '../../../shared/ui/PageSectionPlaceholder'

interface UserDetailsFormSectionProps {
  section: PageSectionSpec
}

/** Demo component boundary for the User details section. Replace this file's markup with the real UI. */
export function UserDetailsFormSection({ section }: UserDetailsFormSectionProps) {
  return <PageSectionPlaceholder section={section} />
}
