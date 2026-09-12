import {
  TrendingUpIcon,
  TrendingDownIcon,
  ReceiptIcon,
  ClockIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import type { FullTransaction } from "@/types/transactions"

interface ExpenseSummaryProps {
  transactions: FullTransaction[]
}

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(n))

export function ExpenseSummary({ transactions }: ExpenseSummaryProps) {
  const totalPaid = transactions
    .filter((t) => t.status === "completed")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)

  const pendingAmount = transactions
    .filter((t) => t.status === "pending")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)

  const pendingCount = transactions.filter((t) => t.status === "pending").length

  const highest = transactions.length
    ? Math.max(...transactions.map(t => Math.abs(t.amount)))
    : 0

  const average = transactions.length
    ? (totalPaid + pendingAmount) / transactions.length
    : 0

  const cards = [
    {
      label: "Total Expenses",
      value: fmt(totalPaid),
      icon: ReceiptIcon,
      color: "text-rose-500",
      bg: "bg-rose-500/10",
    },
    {
      label: "Pending Approvals",
      value: `${fmt(pendingAmount)} (${pendingCount})`,
      icon: ClockIcon,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      label: "Highest Expense",
      value: fmt(highest),
      icon: TrendingDownIcon,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Average Expense",
      value: fmt(average),
      icon: TrendingUpIcon,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="flex items-center gap-3 rounded-xl bg-card p-3 ring-1 ring-foreground/10"
        >
          <div
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-full",
              card.bg
            )}
          >
            <card.icon className={cn("size-4", card.color)} />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">{card.label}</p>
            <p className="tabular-nums text-base font-semibold tracking-tight">
              {card.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
