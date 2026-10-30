import { PageSectionPlaceholder, type PageSectionSpec } from '../../../shared/ui/PageSectionPlaceholder'

interface ReportsWorkspaceProps {
  section: PageSectionSpec
}

/** Demo component boundary for the Reports workspace section. Replace this file's markup with the real UI. */
export function ReportsWorkspace({ section }: ReportsWorkspaceProps) {
  return <PageSectionPlaceholder section={section} />
}
