import { faqItems, supportTickets, systemStatus } from "@/data/seed"
import type { FaqItem, SupportTicket } from "@/types/support"

export function getFaqItems(): FaqItem[] {
  return faqItems
}

export function getSupportTickets(): SupportTicket[] {
  return supportTickets
}

export function getSystemStatus() {
  return systemStatus
}
