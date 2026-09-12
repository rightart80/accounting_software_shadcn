import { bankAccounts, accountCards } from "@/data/seed"
import type { BankAccount, AccountCard } from "@/types/accounts"

export function getBankAccounts(): BankAccount[] {
  return bankAccounts
}

export function getAccountCards(): AccountCard[] {
  return accountCards
}
