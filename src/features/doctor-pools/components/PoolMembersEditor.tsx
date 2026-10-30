import { PageSectionPlaceholder, type PageSectionSpec } from '../../../shared/ui/PageSectionPlaceholder'

interface PoolMembersEditorProps {
  section: PageSectionSpec
}

/** Demo component boundary for the Pool members and assignments section. Replace this file's markup with the real UI. */
export function PoolMembersEditor({ section }: PoolMembersEditorProps) {
  return <PageSectionPlaceholder section={section} />
}
