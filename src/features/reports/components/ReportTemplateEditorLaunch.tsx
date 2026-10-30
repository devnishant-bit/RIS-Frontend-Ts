import { PageSectionPlaceholder, type PageSectionSpec } from '../../../shared/ui/PageSectionPlaceholder'

interface ReportTemplateEditorLaunchProps {
  section: PageSectionSpec
}

/** Demo component boundary for the Template editor launch point section. Replace this file's markup with the real UI. */
export function ReportTemplateEditorLaunch({ section }: ReportTemplateEditorLaunchProps) {
  return <PageSectionPlaceholder section={section} />
}
