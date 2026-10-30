import { PageSectionPlaceholder, type PageSectionSpec } from '../../../shared/ui/PageSectionPlaceholder'

interface TeleReportEditorPanelProps {
  section: PageSectionSpec
}

/** Demo component boundary for the Report editor panel section. Replace this file's markup with the real UI. */
export function TeleReportEditorPanel({ section }: TeleReportEditorPanelProps) {
  return <PageSectionPlaceholder section={section} />
}
