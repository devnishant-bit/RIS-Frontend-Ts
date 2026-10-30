import { PageSectionPlaceholder, type PageSectionSpec } from '../../../shared/ui/PageSectionPlaceholder'

interface DocumentEditorWorkspaceProps {
  section: PageSectionSpec
}

/** Demo component boundary for the Document editor section. Replace this file's markup with the real UI. */
export function DocumentEditorWorkspace({ section }: DocumentEditorWorkspaceProps) {
  return <PageSectionPlaceholder section={section} />
}
