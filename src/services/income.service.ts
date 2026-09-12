import { incomeData, incomeSuperCategories } from "@/data/seed"
import type { IncomeItem } from "@/types/income"

export function getIncome(): IncomeItem[] {
  return incomeData
}

export function getIncomeById(id: string): IncomeItem | undefined {
  return incomeData.find((item) => item.id === id)
}

export function getIncomeCategories() {
  return incomeSuperCategories
}
