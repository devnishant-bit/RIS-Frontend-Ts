import { PageSectionPlaceholder, type PageSectionSpec } from '../../../shared/ui/PageSectionPlaceholder'

interface ModalityPatientFiltersProps {
  section: PageSectionSpec
}

/** Demo component boundary for the Date, doctor, and modality filters section. Replace this file's markup with the real UI. */
export function ModalityPatientFilters({ section }: ModalityPatientFiltersProps) {
  return <PageSectionPlaceholder section={section} />
}
