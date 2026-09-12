import { budgetCategories, savingsGoals, dailySpending } from "@/data/seed"
import type { BudgetCategory, SavingsGoal, DailySpending } from "@/types/budgets"

export function getBudgetCategories(): BudgetCategory[] {
  return budgetCategories
}

export function getSavingsGoals(): SavingsGoal[] {
  return savingsGoals
}

export function getDailySpending(): DailySpending[] {
  return dailySpending
}
