import { PageSectionPlaceholder, type PageSectionSpec } from '../../../shared/ui/PageSectionPlaceholder'

interface WhatsAppLogFiltersProps {
  section: PageSectionSpec
}

/** Demo component boundary for the Patient and date filters section. Replace this file's markup with the real UI. */
export function WhatsAppLogFilters({ section }: WhatsAppLogFiltersProps) {
  return <PageSectionPlaceholder section={section} />
}
