import { PageSectionPlaceholder, type PageSectionSpec } from '../../../shared/ui/PageSectionPlaceholder'

interface CoordinatorWorklistTableProps {
  section: PageSectionSpec
}

/** Demo component boundary for the Coordinator worklist section. Replace this file's markup with the real UI. */
export function CoordinatorWorklistTable({ section }: CoordinatorWorklistTableProps) {
  return <PageSectionPlaceholder section={section} />
}
