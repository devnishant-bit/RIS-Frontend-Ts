import { PageSectionPlaceholder, type PageSectionSpec } from '../../../shared/ui/PageSectionPlaceholder'

interface JobTypeFormSectionProps {
  section: PageSectionSpec
}

/** Demo component boundary for the Job type details section. Replace this file's markup with the real UI. */
export function JobTypeFormSection({ section }: JobTypeFormSectionProps) {
  return <PageSectionPlaceholder section={section} />
}
