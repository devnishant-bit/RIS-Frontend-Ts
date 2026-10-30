import { PageSectionPlaceholder, type PageSectionSpec } from '../../../shared/ui/PageSectionPlaceholder'

interface PatientSearchPanelProps {
  section: PageSectionSpec
}

/** Demo component boundary for the Patient search and selection section. Replace this file's markup with the real UI. */
export function PatientSearchPanel({ section }: PatientSearchPanelProps) {
  return <PageSectionPlaceholder section={section} />
}
