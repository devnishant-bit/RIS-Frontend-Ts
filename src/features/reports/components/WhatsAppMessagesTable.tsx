import { PageSectionPlaceholder, type PageSectionSpec } from '../../../shared/ui/PageSectionPlaceholder'

interface WhatsAppMessagesTableProps {
  section: PageSectionSpec
}

/** Demo component boundary for the WhatsApp message log section. Replace this file's markup with the real UI. */
export function WhatsAppMessagesTable({ section }: WhatsAppMessagesTableProps) {
  return <PageSectionPlaceholder section={section} />
}
