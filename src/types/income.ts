export type IncomeType =
  | "Business Revenue"
  | "Income from Investment"
  | "Income from Property"
  | "Income From Property"
  | "Sale of Assets"
  | "Sale of Assest"
  | "Sale of Securities"
  | "Foreign Source"
  | "Foriegn Source"
  | "Recurring Retainer"
  | "Client Project"
  | "Subscription"
  | "Investment"
  | "Licensing"
  | "Other"

export type IncomeStatus = "received" | "pending" | "scheduled"

export type IncomeItem = {
  id: string
  title: string
  source: string
  type: IncomeType
  incomeCategory: string
  amount: number
  currency: string
  change: number
  changePercent: number
  receivedDate: string
  paymentMethod: string
  status: IncomeStatus
  invoiceNumber: string
  logo?: string
  color: string
  saleType?: "domestic" | "export"
  clientId?: string
  incomeSubType?: string
  accountId?: string
  receiptUrl?: string
}
