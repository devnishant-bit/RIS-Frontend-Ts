import { PageSectionPlaceholder, type PageSectionSpec } from '../../../shared/ui/PageSectionPlaceholder'

interface ModalityAvailabilityFormProps {
  section: PageSectionSpec
}

/** Demo component boundary for the Modality and machine availability section. Replace this file's markup with the real UI. */
export function ModalityAvailabilityForm({ section }: ModalityAvailabilityFormProps) {
  return <PageSectionPlaceholder section={section} />
}
