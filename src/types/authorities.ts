export type AuthorityType =
  | "Federal Tax"
  | "State Tax"
  | "Regulatory"
  | "Labor & Social"
  | "Municipal"

export type ComplianceStatus =
  | "Compliant"
  | "Pending Filing"
  | "Under Review"
  | "Action Required"

export type FilingFrequency =
  | "Annual"
  | "Quarterly"
  | "Monthly"
  | "Bi-weekly"

export type Authority = {
  id: string
  name: string
  shortCode: string
  type: AuthorityType
  category: string
  jurisdiction: string
  filingFrequency: FilingFrequency
  accountNumber: string
  totalPaid: number
  pendingDue: number
  currency: string
  nextDueDate: string
  complianceStatus: ComplianceStatus
  lastFilingDate: string
  logo?: string
  color: string
}
