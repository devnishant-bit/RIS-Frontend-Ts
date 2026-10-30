import { PageSectionPlaceholder, type PageSectionSpec } from '../../../shared/ui/PageSectionPlaceholder'

interface SchedulingCalendarProps {
  section: PageSectionSpec
}

/** Demo component boundary for the Scheduling calendar section. Replace this file's markup with the real UI. */
export function SchedulingCalendar({ section }: SchedulingCalendarProps) {
  return <PageSectionPlaceholder section={section} />
}
