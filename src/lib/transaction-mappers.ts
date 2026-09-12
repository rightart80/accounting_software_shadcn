import { IncomeItem } from "@/types/income"
import { ExpenseItem } from "@/types/expenses"
import { FullTransaction } from "@/types/transactions"

export function mapIncomeToFullTransaction(item: IncomeItem): FullTransaction {
  return {
    id: item.id,
    merchant: item.source,
    transactionId: item.invoiceNumber,
    amount: item.amount,
    date: item.receivedDate,
    logo: item.logo || "/logos/stripe-com.png",
    category: item.type,
    status: (item.status === "received" ? "completed" : "pending") as "completed" | "pending" | "failed",
    type: "income",
    notes: item.title,
    merchantInfo: `${item.incomeCategory} • ${item.paymentMethod}`,
  }
}

export function mapExpenseToFullTransaction(item: ExpenseItem): FullTransaction {
  return {
    id: item.id,
    merchant: item.vendor,
    transactionId: item.receiptNumber,
    amount: -item.amount, // Expenses are negative
    date: item.expenseDate,
    logo: item.logo || "/logos/stripe-com.png",
    category: item.type,
    status: (item.status === "paid" ? "completed" : "pending") as "completed" | "pending" | "failed",
    type: "expense",
    notes: item.title,
    merchantInfo: `${item.expenseCategory} • ${item.paymentMethod}`,
  }
}

export function toFullTransaction(item: IncomeItem | ExpenseItem): FullTransaction {
  if ('incomeCategory' in item) {
    return mapIncomeToFullTransaction(item as IncomeItem)
  } else {
    return mapExpenseToFullTransaction(item as ExpenseItem)
  }
}
