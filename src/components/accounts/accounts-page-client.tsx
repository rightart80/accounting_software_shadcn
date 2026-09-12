"use client"

import { useMemo, useState } from "react"

import type { BankAccount } from "@/types/accounts"
import { getBankAccounts } from "@/services/accounts.service"
import { cn } from "@/lib/utils"
import { AccountSummary } from "@/components/accounts/account-summary"
import { AccountGrid } from "@/components/accounts/account-grid"
import { AddAccount } from "@/components/accounts/add-account"
import { EmptyState } from "@/components/empty-state"

const filterTabs = [
  { value: "all", label: "All" },
  { value: "Bank Accounts", label: "Bank Accounts" },
  { value: "Cash", label: "Cash" },
  { value: "brokerage", label: "Brokerage" },
  { value: "E Wallet", label: "E Wallet" },
  { value: "Crypto Exchange", label: "Crypto Exchange" },
  { value: "Crypto Wallet", label: "Crypto Wallet" },
  { value: "Investment", label: "Investment" },
] as const

const filterBankTabs = [
  { value: "all", label: "All" },
  { value: "checking", label: "Checking" },
  { value: "savings", label: "Savings" },
] as const

type AccountType = (typeof filterTabs)[number]["value"]
type AccountBankType = (typeof filterBankTabs)[number]["value"]

export function AccountsPageClient() {
  const [selectedType, setSelectedType] = useState<AccountType>("all")
  const [selectedBankType, setSelectedBankType] = useState<AccountBankType>("all")
  const [accounts, setAccounts] = useState<BankAccount[]>(getBankAccounts())

  const filtered = useMemo(
    () =>
      accounts.filter((a) => {
        const matchesType = selectedType === "all" || a.type === selectedType
        const matchesBankType =
          selectedBankType === "all" || a.bankType === selectedBankType
        return matchesType && matchesBankType
      }),
    [accounts, selectedType, selectedBankType]
  )

  function handleAddAccount(account: BankAccount) {
    setAccounts((prev) => [...prev, account])
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Summary row */}
      <AccountSummary accounts={accounts} />

      {/* Filter account-type tabs */}
      <div className="flex flex-wrap gap-1.5 type">
        {filterTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              setSelectedType(tab.value)
              if (tab.value !== "Bank Accounts") setSelectedBankType("all")
            }}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              selectedType === tab.value
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filter bank-type tabs — only shown when "Bank Accounts" is selected */}
      {selectedType === "Bank Accounts" && (
        <div className="flex flex-wrap gap-1.5 bank-type">
          {filterBankTabs.map((atab) => (
            <button
              key={atab.value}
              onClick={() => setSelectedBankType(atab.value)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                selectedBankType === atab.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              )}
            >
              {atab.label}
            </button>
          ))}
        </div>
      )}

      {/* Account grid + add card */}
      {filtered.length === 0 ? (
        <EmptyState
          variant="filter"
          title="No accounts in this category"
          description="You don't have any accounts of this type yet. Try a different filter or link a new account."
        />
      ) : (
        <AccountGrid
          accounts={filtered}
          cardsPerPage={6}
          trailingSlot={<AddAccount onAdd={handleAddAccount} />}
        />
      )}
    </div>
  )
}