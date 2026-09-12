"use client"

import {
  Building2Icon,
  TruckIcon,
  LayersIcon,
  TrendingDownIcon,
  CircleDollarSignIcon,
  ShieldCheckIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import type { FixedAsset, AssetClassification } from "@/types/assets"

interface AssetMetricsSummaryProps {
  assets: FixedAsset[]
  classification: AssetClassification | "all"
}

const fmt = (n: number) =>
  `$${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(n))}`

export function AssetMetricsSummary({
  assets,
  classification,
}: AssetMetricsSummaryProps) {
  const totalBookValue = assets.reduce((sum, a) => sum + a.currentValuation, 0)
  const totalCostBasis = assets.reduce((sum, a) => sum + a.acquisitionCost, 0)
  const totalDepreciation = assets.reduce((sum, a) => sum + a.accumulatedDepreciation, 0)
  const netAppreciationOrDepreciation = totalBookValue - totalCostBasis
  const isNetPositive = netAppreciationOrDepreciation >= 0

  const propertyCount = assets.filter((a) => a.classification === "property").length
  const movableCount = assets.filter((a) => a.classification === "movable").length

  const activeInService = assets.filter((a) => a.status === "in_service").length

  const classificationLabel =
    classification === "property"
      ? "Properties"
      : classification === "movable"
      ? "Moving Assets"
      : "Fixed Assets Portfolio"

  const cards = [
    {
      label: `Total ${classificationLabel} Value`,
      value: fmt(totalBookValue),
      subtext: `${isNetPositive ? "+" : "-"}${fmt(Math.abs(netAppreciationOrDepreciation))} vs Cost Basis`,
      icon: classification === "property" ? Building2Icon : classification === "movable" ? TruckIcon : LayersIcon,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "Total Acquisition Basis",
      value: fmt(totalCostBasis),
      subtext: `Original capitalized purchase cost`,
      icon: CircleDollarSignIcon,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Accumulated Depreciation",
      value: fmt(totalDepreciation),
      subtext: `${((totalDepreciation / (totalCostBasis || 1)) * 100).toFixed(1)}% of total basis expensed`,
      icon: TrendingDownIcon,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      label: "Registered Asset Units",
      value: `${assets.length} Assets`,
      subtext:
        classification === "all"
          ? `${propertyCount} Properties • ${movableCount} Movable`
          : `${activeInService} Units currently in service`,
      icon: ShieldCheckIcon,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="flex items-center gap-3.5 rounded-xl bg-card p-4 ring-1 ring-foreground/10"
        >
          <div
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-xl",
              card.bg
            )}
          >
            <card.icon className={cn("size-5", card.color)} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-muted-foreground">{card.label}</p>
            <p className="tabular-nums text-lg font-bold tracking-tight">
              {card.value}
            </p>
            <p className="truncate text-[11px] text-muted-foreground">
              {card.subtext}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
