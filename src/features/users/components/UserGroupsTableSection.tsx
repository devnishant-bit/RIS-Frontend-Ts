import { PageSectionPlaceholder, type PageSectionSpec } from '../../../shared/ui/PageSectionPlaceholder'

interface UserGroupsTableSectionProps {
  section: PageSectionSpec
}

/** Demo component boundary for the Existing user groups section. Replace this file's markup with the real UI. */
export function UserGroupsTableSection({ section }: UserGroupsTableSectionProps) {
  return <PageSectionPlaceholder section={section} />
}
