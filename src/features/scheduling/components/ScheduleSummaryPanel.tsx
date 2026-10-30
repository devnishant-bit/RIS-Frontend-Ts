import { PageSectionPlaceholder, type PageSectionSpec } from '../../../shared/ui/PageSectionPlaceholder'

interface ScheduleSummaryPanelProps {
  section: PageSectionSpec
}

/** Demo component boundary for the Appointments and room summary section. Replace this file's markup with the real UI. */
export function ScheduleSummaryPanel({ section }: ScheduleSummaryPanelProps) {
  return <PageSectionPlaceholder section={section} />
}
