import { PageSectionPlaceholder, type PageSectionSpec } from '../../../shared/ui/PageSectionPlaceholder'

interface ClientSendProgressPanelProps {
  section: PageSectionSpec
}

/** Demo component boundary for the Send progress section. Replace this file's markup with the real UI. */
export function ClientSendProgressPanel({ section }: ClientSendProgressPanelProps) {
  return <PageSectionPlaceholder section={section} />
}
