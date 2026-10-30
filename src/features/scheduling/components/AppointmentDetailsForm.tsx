import { PageSectionPlaceholder, type PageSectionSpec } from '../../../shared/ui/PageSectionPlaceholder'

interface AppointmentDetailsFormProps {
  section: PageSectionSpec
}

/** Demo component boundary for the Create appointment section. Replace this file's markup with the real UI. */
export function AppointmentDetailsForm({ section }: AppointmentDetailsFormProps) {
  return <PageSectionPlaceholder section={section} />
}
