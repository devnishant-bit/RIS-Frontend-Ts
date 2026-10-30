import { PageSectionPlaceholder, type PageSectionSpec } from '../../../shared/ui/PageSectionPlaceholder'

interface EquipmentListTableProps {
  section: PageSectionSpec
}

/** Demo component boundary for the Configured equipment section. Replace this file's markup with the real UI. */
export function EquipmentListTable({ section }: EquipmentListTableProps) {
  return <PageSectionPlaceholder section={section} />
}
