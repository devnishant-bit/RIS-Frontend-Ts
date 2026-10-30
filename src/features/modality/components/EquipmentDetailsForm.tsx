import { PageSectionPlaceholder, type PageSectionSpec } from '../../../shared/ui/PageSectionPlaceholder'

interface EquipmentDetailsFormProps {
  section: PageSectionSpec
}

/** Demo component boundary for the Equipment and protocol details section. Replace this file's markup with the real UI. */
export function EquipmentDetailsForm({ section }: EquipmentDetailsFormProps) {
  return <PageSectionPlaceholder section={section} />
}
