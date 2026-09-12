export type FaqItem = {
  id: string
  question: string
  answer: string
  category: "account" | "payments" | "security" | "billing" | "general"
}

export type SupportTicket = {
  id: string
  subject: string
  status: "open" | "in-progress" | "resolved"
  priority: "low" | "medium" | "high"
  createdAt: string
  lastUpdate: string
}
