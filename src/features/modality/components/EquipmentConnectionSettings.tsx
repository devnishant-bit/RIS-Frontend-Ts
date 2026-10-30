import { PageSectionPlaceholder, type PageSectionSpec } from '../../../shared/ui/PageSectionPlaceholder'

interface EquipmentConnectionSettingsProps {
  section: PageSectionSpec
}

/** Demo component boundary for the Network and modality settings section. Replace this file's markup with the real UI. */
export function EquipmentConnectionSettings({ section }: EquipmentConnectionSettingsProps) {
  return <PageSectionPlaceholder section={section} />
}
