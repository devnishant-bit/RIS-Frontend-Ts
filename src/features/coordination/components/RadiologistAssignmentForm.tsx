import { PageSectionPlaceholder, type PageSectionSpec } from '../../../shared/ui/PageSectionPlaceholder'

interface RadiologistAssignmentFormProps {
  section: PageSectionSpec
}

/** Demo component boundary for the Assign radiologist section. Replace this file's markup with the real UI. */
export function RadiologistAssignmentForm({ section }: RadiologistAssignmentFormProps) {
  return <PageSectionPlaceholder section={section} />
}
