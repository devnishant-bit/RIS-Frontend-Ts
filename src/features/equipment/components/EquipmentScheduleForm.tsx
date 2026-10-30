import { PageSectionPlaceholder, type PageSectionSpec } from '../../../shared/ui/PageSectionPlaceholder'

interface EquipmentScheduleFormProps {
  section: PageSectionSpec
}

/** Demo component boundary for the Equipment schedule and processing time section. Replace this file's markup with the real UI. */
export function EquipmentScheduleForm({ section }: EquipmentScheduleFormProps) {
  return <PageSectionPlaceholder section={section} />
}
