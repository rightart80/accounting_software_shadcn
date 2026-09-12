export type AccountCard = {
  id: string
  label: string
  balance: string
  currency: string
  variant: "default" | "dark" | "primary"
}

export type BankAccount = {
  id: string
  name: string
  type: "Bank Accounts" | "Cash" | "brokerage" | "E Wallet" | "Crypto Exchange" | "Crypto Wallet" | "Investment"
  bankType?: "checking" | "savings" 
  institution: string
  institutionLogo: string
  accountNumber: string
  balance: number
  currency: string
  change: number
  changePercent: number
  lastActivity: string
  color: string
}
