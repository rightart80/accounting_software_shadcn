import {
  walletBalance,
  spendingLimit,
  financialOverview,
  moneyMovementByPeriod,
  financialHealthScore,
} from "@/data/seed"

export function getWalletBalance() {
  return walletBalance
}

export function getSpendingLimit() {
  return spendingLimit
}

export function getFinancialOverview() {
  return financialOverview
}

export function getMoneyMovementByPeriod() {
  return moneyMovementByPeriod
}

export function getFinancialHealthScore() {
  return financialHealthScore
}
