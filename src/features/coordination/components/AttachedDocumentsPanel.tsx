import { PageSectionPlaceholder, type PageSectionSpec } from '../../../shared/ui/PageSectionPlaceholder'

interface AttachedDocumentsPanelProps {
  section: PageSectionSpec
}

/** Demo component boundary for the Attached documents section. Replace this file's markup with the real UI. */
export function AttachedDocumentsPanel({ section }: AttachedDocumentsPanelProps) {
  return <PageSectionPlaceholder section={section} />
}
