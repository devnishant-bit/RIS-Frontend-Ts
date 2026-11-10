import { PageSectionPlaceholder, type PageSectionSpec } from '../../../shared/ui/PageSectionPlaceholder'

interface DoctorPoolsTableProps {
  section: PageSectionSpec
}

/** Demo component boundary for the Doctor pools section. Replace this file's markup with the real UI. */
export function DoctorPoolsTable({ section }: DoctorPoolsTableProps) {
  return <PageSectionPlaceholder section={section} />
}
