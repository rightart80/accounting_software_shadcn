import { fullTransactions, recentTransactions } from "@/data/seed"
import type { FullTransaction, Transaction } from "@/types/transactions"

export function getFullTransactions(): FullTransaction[] {
  return fullTransactions
}

export function getRecentTransactions(): Transaction[] {
  return recentTransactions
}
