import { PageSectionPlaceholder, type PageSectionSpec } from '../../../shared/ui/PageSectionPlaceholder'

interface PatientUpdatesTableProps {
  section: PageSectionSpec
}

/** Demo component boundary for the Patient update history section. Replace this file's markup with the real UI. */
export function PatientUpdatesTable({ section }: PatientUpdatesTableProps) {
  return <PageSectionPlaceholder section={section} />
}
