import { PageSectionPlaceholder, type PageSectionSpec } from '../../../shared/ui/PageSectionPlaceholder'

interface DashboardDateFilterProps {
  section: PageSectionSpec
}

/** Demo component boundary for the Dashboard date options section. Replace this file's markup with the real UI. */
export function DashboardDateFilter({ section }: DashboardDateFilterProps) {
  return <PageSectionPlaceholder section={section} />
}
