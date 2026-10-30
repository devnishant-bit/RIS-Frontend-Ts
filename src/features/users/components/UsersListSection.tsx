import { PageSectionPlaceholder, type PageSectionSpec } from '../../../shared/ui/PageSectionPlaceholder'

interface UsersListSectionProps {
  section: PageSectionSpec
}

/** Demo component boundary for the Users list and search section. Replace this file's markup with the real UI. */
export function UsersListSection({ section }: UsersListSectionProps) {
  return <PageSectionPlaceholder section={section} />
}
