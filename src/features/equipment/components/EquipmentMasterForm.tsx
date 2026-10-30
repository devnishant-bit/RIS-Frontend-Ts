import { PageSectionPlaceholder, type PageSectionSpec } from '../../../shared/ui/PageSectionPlaceholder'

interface EquipmentMasterFormProps {
  section: PageSectionSpec
}

/** Demo component boundary for the Equipment details section. Replace this file's markup with the real UI. */
export function EquipmentMasterForm({ section }: EquipmentMasterFormProps) {
  return <PageSectionPlaceholder section={section} />
}
