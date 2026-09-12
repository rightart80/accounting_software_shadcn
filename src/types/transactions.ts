export type Transaction = {
  id: string
  merchant: string
  transactionId: string
  amount: number
  date: string
  logo: string
  category: string
}

export type FullTransaction = {
  id: string
  merchant: string
  transactionId: string
  amount: number
  date: string
  logo: string
  category: string
  status: "completed" | "pending" | "failed"
  type: "expense" | "income"
  notes?: string
  merchantInfo?: string
  cardLast4?: string
}
