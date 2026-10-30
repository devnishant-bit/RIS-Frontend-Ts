import { PageSectionPlaceholder, type PageSectionSpec } from '../../../shared/ui/PageSectionPlaceholder'

interface StudyVolumeChartProps {
  section: PageSectionSpec
}

/** Demo component boundary for the Study volume section. Replace this file's markup with the real UI. */
export function StudyVolumeChart({ section }: StudyVolumeChartProps) {
  return <PageSectionPlaceholder section={section} />
}
