import { PageSectionPlaceholder, type PageSectionSpec } from '../../../shared/ui/PageSectionPlaceholder'

interface CoveredModalitiesListProps {
  section: PageSectionSpec
}

/** Demo component boundary for the Modalities covered section. Replace this file's markup with the real UI. */
export function CoveredModalitiesList({ section }: CoveredModalitiesListProps) {
  return <PageSectionPlaceholder section={section} />
}
