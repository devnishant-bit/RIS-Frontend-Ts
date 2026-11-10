import { PageSectionPlaceholder, type PageSectionSpec } from '../../../shared/ui/PageSectionPlaceholder'

interface ClinicalNotesPanelProps {
  section: PageSectionSpec
}

/** Demo component boundary for the Clinical notes section. Replace this file's markup with the real UI. */
export function ClinicalNotesPanel({ section }: ClinicalNotesPanelProps) {
  return <PageSectionPlaceholder section={section} />
}
