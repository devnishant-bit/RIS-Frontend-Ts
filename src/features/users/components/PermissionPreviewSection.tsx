import { PageSectionPlaceholder, type PageSectionSpec } from '../../../shared/ui/PageSectionPlaceholder'

interface PermissionPreviewSectionProps {
  section: PageSectionSpec
}

/** Demo component boundary for the Permission preview section. Replace this file's markup with the real UI. */
export function PermissionPreviewSection({ section }: PermissionPreviewSectionProps) {
  return <PageSectionPlaceholder section={section} />
}
