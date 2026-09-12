import {
  LandmarkIcon,
  ShieldCheckIcon,
  AlertTriangleIcon,
  ScaleIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import type { Authority } from "@/types/authorities"

interface AuthoritySummaryProps {
  authorities: Authority[]
}

const fmt = (n: number, currency = "$") =>
  `${currency}${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(n))}`

export function AuthoritySummary({ authorities }: AuthoritySummaryProps) {
  const totalPaid = authorities.reduce((sum, a) => sum + a.totalPaid, 0)
  const pendingDue = authorities.reduce((sum, a) => sum + a.pendingDue, 0)
  const compliantCount = authorities.filter(
    (a) => a.complianceStatus === "Compliant"
  ).length

  const cards = [
    {
      label: "Total Paid (YTD)",
      value: fmt(totalPaid),
      icon: ShieldCheckIcon,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Pending Tax Due",
      value: fmt(pendingDue),
      icon: pendingDue > 0 ? AlertTriangleIcon : LandmarkIcon,
      color: pendingDue > 0 ? "text-amber-500" : "text-primary",
      bg: pendingDue > 0 ? "bg-amber-500/10" : "bg-primary/10",
    },
    {
      label: "Compliance Standing",
      value: `${compliantCount} / ${authorities.length} In Good Standing`,
      icon: ScaleIcon,
      color: "text-primary",
      bg: "bg-primary/10",
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
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
