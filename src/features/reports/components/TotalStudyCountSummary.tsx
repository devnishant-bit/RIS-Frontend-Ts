import { PageSectionPlaceholder, type PageSectionSpec } from '../../../shared/ui/PageSectionPlaceholder'

interface TotalStudyCountSummaryProps {
  section: PageSectionSpec
}

/** Demo component boundary for the Total study count section. Replace this file's markup with the real UI. */
export function TotalStudyCountSummary({ section }: TotalStudyCountSummaryProps) {
  return <PageSectionPlaceholder section={section} />
}
