import { expensesData } from "@/data/seed"
import { expenseSuperCategories } from "@/data/expense-categories"
import type { ExpenseItem } from "@/types/expenses"

export function getExpenses(): ExpenseItem[] {
  return expensesData
}

export function getExpenseById(id: string): ExpenseItem | undefined {
  return expensesData.find((item) => item.id === id)
}

export function getExpenseCategories() {
  return expenseSuperCategories
}
