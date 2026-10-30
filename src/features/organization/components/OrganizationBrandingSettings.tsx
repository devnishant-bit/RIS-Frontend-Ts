import { PageSectionPlaceholder, type PageSectionSpec } from '../../../shared/ui/PageSectionPlaceholder'

interface OrganizationBrandingSettingsProps {
  section: PageSectionSpec
}

/** Demo component boundary for the Branding and branch settings section. Replace this file's markup with the real UI. */
export function OrganizationBrandingSettings({ section }: OrganizationBrandingSettingsProps) {
  return <PageSectionPlaceholder section={section} />
}
