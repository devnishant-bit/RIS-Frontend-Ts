import { PageSectionPlaceholder, type PageSectionSpec } from '../../../shared/ui/PageSectionPlaceholder'

interface ModalityStatisticsTableProps {
  section: PageSectionSpec
}

/** Demo component boundary for the Modality statistics section. Replace this file's markup with the real UI. */
export function ModalityStatisticsTable({ section }: ModalityStatisticsTableProps) {
  return <PageSectionPlaceholder section={section} />
}
