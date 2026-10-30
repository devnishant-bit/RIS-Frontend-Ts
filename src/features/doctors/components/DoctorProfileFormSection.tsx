import { PageSectionPlaceholder, type PageSectionSpec } from '../../../shared/ui/PageSectionPlaceholder'

interface DoctorProfileFormSectionProps {
  section: PageSectionSpec
}

/** Demo component boundary for the Doctor profile and signature section. Replace this file's markup with the real UI. */
export function DoctorProfileFormSection({ section }: DoctorProfileFormSectionProps) {
  return <PageSectionPlaceholder section={section} />
}
