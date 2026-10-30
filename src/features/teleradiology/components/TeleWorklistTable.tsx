import { PageSectionPlaceholder, type PageSectionSpec } from '../../../shared/ui/PageSectionPlaceholder'

interface TeleWorklistTableProps {
  section: PageSectionSpec
}

/** Demo component boundary for the Studies to report section. Replace this file's markup with the real UI. */
export function TeleWorklistTable({ section }: TeleWorklistTableProps) {
  return <PageSectionPlaceholder section={section} />
}
