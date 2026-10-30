import { PageSectionPlaceholder, type PageSectionSpec } from '../../../shared/ui/PageSectionPlaceholder'

interface LockedReportsTableProps {
  section: PageSectionSpec
}

/** Demo component boundary for the Locked reports section. Replace this file's markup with the real UI. */
export function LockedReportsTable({ section }: LockedReportsTableProps) {
  return <PageSectionPlaceholder section={section} />
}
