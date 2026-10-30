import { PageSectionPlaceholder, type PageSectionSpec } from '../../../shared/ui/PageSectionPlaceholder'

interface ReportDeliveryOptionsProps {
  section: PageSectionSpec
}

/** Demo component boundary for the Delivery and print options section. Replace this file's markup with the real UI. */
export function ReportDeliveryOptions({ section }: ReportDeliveryOptionsProps) {
  return <PageSectionPlaceholder section={section} />
}
