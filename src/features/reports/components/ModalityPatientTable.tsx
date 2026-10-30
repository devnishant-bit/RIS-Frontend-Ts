import { PageSectionPlaceholder, type PageSectionSpec } from '../../../shared/ui/PageSectionPlaceholder'

interface ModalityPatientTableProps {
  section: PageSectionSpec
}

/** Demo component boundary for the Modality patient list section. Replace this file's markup with the real UI. */
export function ModalityPatientTable({ section }: ModalityPatientTableProps) {
  return <PageSectionPlaceholder section={section} />
}
