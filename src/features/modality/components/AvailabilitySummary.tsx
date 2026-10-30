import { PageSectionPlaceholder, type PageSectionSpec } from '../../../shared/ui/PageSectionPlaceholder'

interface AvailabilitySummaryProps {
  section: PageSectionSpec
}

/** Demo component boundary for the Operating hours and slot summary section. Replace this file's markup with the real UI. */
export function AvailabilitySummary({ section }: AvailabilitySummaryProps) {
  return <PageSectionPlaceholder section={section} />
}
