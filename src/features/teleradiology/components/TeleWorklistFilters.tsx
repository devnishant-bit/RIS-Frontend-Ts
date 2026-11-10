import { PageSectionPlaceholder, type PageSectionSpec } from '../../../shared/ui/PageSectionPlaceholder'

interface TeleWorklistFiltersProps {
  section: PageSectionSpec
}

/** Demo component boundary for the Tele-radiology filters section. Replace this file's markup with the real UI. */
export function TeleWorklistFilters({ section }: TeleWorklistFiltersProps) {
  return <PageSectionPlaceholder section={section} />
}
