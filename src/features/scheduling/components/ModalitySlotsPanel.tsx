import { PageSectionPlaceholder, type PageSectionSpec } from '../../../shared/ui/PageSectionPlaceholder'

interface ModalitySlotsPanelProps {
  section: PageSectionSpec
}

/** Demo component boundary for the Available modality slots section. Replace this file's markup with the real UI. */
export function ModalitySlotsPanel({ section }: ModalitySlotsPanelProps) {
  return <PageSectionPlaceholder section={section} />
}
