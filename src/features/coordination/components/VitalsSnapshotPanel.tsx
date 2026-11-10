import { PageSectionPlaceholder, type PageSectionSpec } from '../../../shared/ui/PageSectionPlaceholder'

interface VitalsSnapshotPanelProps {
  section: PageSectionSpec
}

/** Demo component boundary for the Vitals snapshot section. Replace this file's markup with the real UI. */
export function VitalsSnapshotPanel({ section }: VitalsSnapshotPanelProps) {
  return <PageSectionPlaceholder section={section} />
}
