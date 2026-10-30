import { PageSectionPlaceholder, type PageSectionSpec } from '../../../shared/ui/PageSectionPlaceholder'

interface SettingsWorkspaceProps {
  section: PageSectionSpec
}

/** Demo component boundary for the Settings workspace section. Replace this file's markup with the real UI. */
export function SettingsWorkspace({ section }: SettingsWorkspaceProps) {
  return <PageSectionPlaceholder section={section} />
}
