import { PageSectionPlaceholder, type PageSectionSpec } from '../../../shared/ui/PageSectionPlaceholder'

interface UserGroupSelectorProps {
  section: PageSectionSpec
}

/** Demo component boundary for the Select user group section. Replace this file's markup with the real UI. */
export function UserGroupSelector({ section }: UserGroupSelectorProps) {
  return <PageSectionPlaceholder section={section} />
}
