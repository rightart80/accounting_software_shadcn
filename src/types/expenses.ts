export type ExpenseType =
  | "Software & SaaS"
  | "Cloud & Hosting"
  | "Office & Rent"
  | "Marketing"
  | "Travel"
  | "Legal & Professional"
  | "Payroll"

export type ExpenseStatus = "paid" | "pending" | "approved"

export type ExpenseCategorySuper =
  | "cost_of_sale"
  | "administrative_expense"
  | "tax"
  | "selling_expense"
  | "other_expense"

export type ExpenseItem = {
  id: string
  title: string
  vendor: string
  type: ExpenseType
  expenseCategory: string
  amount: number
  currency: string
  change: number
  changePercent: number
  expenseDate: string
  paymentMethod: string
  status: ExpenseStatus
  receiptNumber: string
  department: string
  logo?: string
  color: string
  superCategory?: ExpenseCategorySuper
  vendorId?: string
  expenseSubCategory?: string
  accountId?: string
}
