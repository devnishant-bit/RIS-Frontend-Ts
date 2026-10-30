import { PageSectionPlaceholder, type PageSectionSpec } from '../../../shared/ui/PageSectionPlaceholder'

interface WorklistWindowTableProps {
  section: PageSectionSpec
}

/** Demo component boundary for the Worklist studies section. Replace this file's markup with the real UI. */
export function WorklistWindowTable({ section }: WorklistWindowTableProps) {
  return <PageSectionPlaceholder section={section} />
}
