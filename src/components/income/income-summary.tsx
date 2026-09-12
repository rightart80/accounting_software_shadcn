import {
  TrendingUpIcon,
  CircleDollarSignIcon,
  ClockIcon,
  BanknoteIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import type { FullTransaction } from "@/types/transactions"

interface IncomeSummaryProps {
  transactions: FullTransaction[]
}

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)

export function IncomeSummary({ transactions }: IncomeSummaryProps) {
  const collected = transactions
    .filter((t) => t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0)
    
  const pending = transactions
    .filter((t) => t.status === "pending")
    .reduce((sum, t) => sum + t.amount, 0)

  const pendingCount = transactions.filter((t) => t.status === "pending").length

  const highest = transactions.length
    ? Math.max(...transactions.map(t => t.amount))
    : 0

  const average = transactions.length
    ? (collected + pending) / transactions.length
    : 0

  const cards = [
    {
      label: "Total Collected",
      value: fmt(collected),
      icon: CircleDollarSignIcon,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Pending",
      value: `${fmt(pending)} (${pendingCount})`,
      icon: ClockIcon,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      label: "Highest Income",
      value: fmt(highest),
      icon: TrendingUpIcon,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Average Income",
      value: fmt(average),
      icon: BanknoteIcon,
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
