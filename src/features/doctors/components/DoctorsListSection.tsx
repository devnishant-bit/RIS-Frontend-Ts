import { PageSectionPlaceholder, type PageSectionSpec } from '../../../shared/ui/PageSectionPlaceholder'

interface DoctorsListSectionProps {
  section: PageSectionSpec
}

/** Demo component boundary for the Doctors list and search section. Replace this file's markup with the real UI. */
export function DoctorsListSection({ section }: DoctorsListSectionProps) {
  return <PageSectionPlaceholder section={section} />
}
