import { PageSectionPlaceholder, type PageSectionSpec } from '../../../shared/ui/PageSectionPlaceholder'

interface JobTypesTableSectionProps {
  section: PageSectionSpec
}

/** Demo component boundary for the Job types section. Replace this file's markup with the real UI. */
export function JobTypesTableSection({ section }: JobTypesTableSectionProps) {
  return <PageSectionPlaceholder section={section} />
}
