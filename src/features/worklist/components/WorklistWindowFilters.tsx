import { PageSectionPlaceholder, type PageSectionSpec } from '../../../shared/ui/PageSectionPlaceholder'

interface WorklistWindowFiltersProps {
  section: PageSectionSpec
}

/** Demo component boundary for the Date and modality filters section. Replace this file's markup with the real UI. */
export function WorklistWindowFilters({ section }: WorklistWindowFiltersProps) {
  return <PageSectionPlaceholder section={section} />
}
