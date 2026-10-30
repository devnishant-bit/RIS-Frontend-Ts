import { PageSectionPlaceholder, type PageSectionSpec } from '../../../shared/ui/PageSectionPlaceholder'

interface AppointmentCalendarProps {
  section: PageSectionSpec
}

/** Demo component boundary for the Appointment calendar section. Replace this file's markup with the real UI. */
export function AppointmentCalendar({ section }: AppointmentCalendarProps) {
  return <PageSectionPlaceholder section={section} />
}
