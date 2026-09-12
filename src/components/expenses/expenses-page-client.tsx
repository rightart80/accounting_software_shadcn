"use client"

import * as React from "react"
import { PlusIcon } from "lucide-react"

import type { ExpenseItem } from "@/types/expenses"
import type { FullTransaction } from "@/types/transactions"
import { getExpenses } from "@/services/expenses.service"
import { getFullTransactions } from "@/services/transactions.service"
import { Button } from "@/components/ui/button"
import { AddExpense } from "@/components/expenses/add-expense"
import { ExpenseCategoryCards } from "@/components/expenses/expense-category-cards"
import { ExpenseSummary } from "@/components/expenses/expense-summary"
import { TransactionFilters } from "@/components/transactions/transaction-filters"
import { TransactionTable } from "@/components/transactions/transaction-table"
import { TransactionActions } from "@/components/transactions/transaction-actions"

function mapExpenseItemToFullTransaction(item: ExpenseItem): FullTransaction {
  return {
    id: item.id,
    merchant: item.vendor || item.title || "Unknown",
    transactionId: item.receiptNumber || item.id,
    amount: item.amount,
    date: item.expenseDate || "Today",
    logo: item.logo || "/logos/stripe-com.png",
    category: item.type || "Other",
    status: (item.status === "paid" || item.status === "approved" ? "completed" : "pending") as
      | "completed"
      | "pending"
      | "failed",
    type: "expense",
    notes: item.title,
    merchantInfo: `${item.expenseCategory || "Category"} • ${item.paymentMethod || "Unknown"}`,
  }
}

function getInitialExpenseTransactions(): FullTransaction[] {
  const seedExpense = getExpenses().map(mapExpenseItemToFullTransaction)

  // Also include expense transactions from fullTransactions
  const extraExpense = getFullTransactions()
    .filter((t) => t.type === "expense" && !seedExpense.some((s) => s.id === t.id))
    .map((t) => ({
      ...t,
      category: t.merchant.toLowerCase().includes("dividend")
        ? "Expense from Investment"
        : "Business Revenue",
    }))

  return [...seedExpense, ...extraExpense]
}

export function ExpensesPageClient() {
  const [transactions, setTransactions] = React.useState<FullTransaction[]>(
    getInitialExpenseTransactions
  )

  // Super Type and Sub Type selection for Category Cards
  const [selectedSuperType, setSelectedSuperType] = React.useState<string>("all")
  const [selectedSubType, setSelectedSubType] = React.useState<string | null>(null)

  // Transaction Filters & Table state matching TransactionsPageClient exactly
  const [search, setSearch] = React.useState("")
  const [categoryFilter, setCategoryFilter] = React.useState("all")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [typeFilter, setTypeFilter] = React.useState("all")
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set())
  const [expandedId, setExpandedId] = React.useState<string | null>(null)

  // Categories list for TransactionFilters dropdown
  const categories = React.useMemo(() => {
    const cats = new Set(transactions.map((t) => t.category))
    return Array.from(cats).sort()
  }, [transactions])

  // Sync category filter changes from Category Cards to Table filter
  function handleSelectSuperType(superTypeName: string) {
    setSelectedSuperType(superTypeName)
    setCategoryFilter(superTypeName)
    setSelectedSubType(null)
  }

  // Handle category dropdown change in TransactionFilters
  function handleCategoryFilterChange(val: string) {
    setCategoryFilter(val)
    setSelectedSuperType(val)
    setSelectedSubType(null)
  }

  // Sub Type card click filters search by Sub Type name
  function handleSelectSubType(subTypeName: string | null) {
    setSelectedSubType(subTypeName)
    if (subTypeName) {
      setSearch(subTypeName)
    } else if (selectedSubType && search === selectedSubType) {
      setSearch("")
    }
  }

  // Filtered transactions data matching TransactionsPageClient filtering logic
  const filteredData = React.useMemo(() => {
    let data: FullTransaction[] = transactions

    if (search) {
      const q = search.toLowerCase()
      data = data.filter(
        (t) =>
          t.merchant.toLowerCase().includes(q) ||
          t.transactionId.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          (t.notes && t.notes.toLowerCase().includes(q)) ||
          (t.merchantInfo && t.merchantInfo.toLowerCase().includes(q))
      )
    }

    if (categoryFilter !== "all") {
      data = data.filter(
        (t) =>
          t.category === categoryFilter ||
          t.category.toLowerCase() === categoryFilter.toLowerCase() ||
          (categoryFilter.includes("Property") && t.category.toLowerCase().includes("property")) ||
          (categoryFilter.includes("Asset") && t.category.toLowerCase().includes("asset")) ||
          (categoryFilter.includes("Securit") && t.category.toLowerCase().includes("securit")) ||
          (categoryFilter.includes("Foreign") && t.category.toLowerCase().includes("foreign"))
      )
    }

    if (statusFilter !== "all") {
      data = data.filter((t) => t.status === statusFilter)
    }

    if (typeFilter !== "all") {
      data = data.filter((t) => t.type === typeFilter)
    }

    return data
  }, [transactions, search, categoryFilter, statusFilter, typeFilter])

  // Export functionality matching TransactionsPageClient
  function handleExport() {
    const selected = transactions.filter((t) => selectedIds.has(t.id))
    const toExport = selected.length > 0 ? selected : filteredData
    const header = "Merchant,Transaction ID,Amount,Date,Status,Type"
    const rows = toExport.map(
      (t) =>
        `"${t.merchant}","${t.transactionId}",${t.amount},"${t.date}","${t.status}","${t.type}"`
    )
    const csv = [header, ...rows].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "expense-transactions.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleAddExpense(newItem: ExpenseItem) {
    const newTx = mapExpenseItemToFullTransaction(newItem)
    setTransactions((prev) => [newTx, ...prev])
  }

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Top Level Summary Cards */}
      <ExpenseSummary transactions={filteredData} />

      {/* Category Breakdown Cards: One set per Super Type broken down by Sub Types */}
      <ExpenseCategoryCards
        selectedSuperType={selectedSuperType}
        onSelectSuperType={handleSelectSuperType}
        selectedSubType={selectedSubType}
        onSelectSubType={handleSelectSubType}
        actionSlot={
          <AddExpense
            onAdd={handleAddExpense}
            isCard={false}
            trigger={
              <Button size="sm" className="h-8 gap-1.5 text-xs shrink-0">
                <PlusIcon className="size-3.5" />
                Record Expense
              </Button>
            }
          />
        }
      />

      {/* Reused Filter + Table Section from Transactions Page */}
      <div className="flex flex-col">
        {/* Sticky Header & Filters */}
        <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-md pt-4 pb-3 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-2">
              Expense Transactions
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium tabular-nums text-muted-foreground">
                {filteredData.length} {filteredData.length === 1 ? "entry" : "entries"}
              </span>
            </h3>
          </div>

          <TransactionFilters
            search={search}
            setSearch={setSearch}
            categoryFilter={categoryFilter}
            setCategoryFilter={handleCategoryFilterChange}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            typeFilter={typeFilter}
            setTypeFilter={setTypeFilter}
            categories={categories}
          />
        </div>

        <div className="mt-2">
          <TransactionTable
            transactions={filteredData}
            selectedIds={selectedIds}
            setSelectedIds={setSelectedIds}
            expandedId={expandedId}
            setExpandedId={setExpandedId}
          />
        </div>
      </div>

      {/* Reused Floating Action Bar for Export and Clearing */}
      <TransactionActions
        selectedCount={selectedIds.size}
        onExport={handleExport}
        onClear={() => setSelectedIds(new Set())}
      />
    </div>
  )
}
