"use client"

import { useState, useMemo } from "react"
import {
  Building2Icon,
  TrendingUpIcon,
  ShieldCheckIcon,
  CalendarIcon,
  LayersIcon,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { getFixedAssetsValuationReport } from "@/services/reports.service"
import { StatementHeader } from "@/components/reports/statement-header"
import type { FixedAssetValuationRow } from "@/types/reports"

export function FixedAssetsValuationClient() {
  const data = useMemo(() => getFixedAssetsValuationReport(), [])
  const [filterClass, setFilterClass] = useState<"all" | "property" | "movable">("all")

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val)
  }

  const filteredItems = useMemo(() => {
    if (filterClass === "all") return data.items
    return data.items.filter((item) => item.classification === filterClass)
  }, [data.items, filterClass])

  return (
    <div className="flex flex-col min-h-screen">
      <StatementHeader
        title="Fixed Assets Valuation & Depreciation Schedule"
        subtitle="Tangible Capital Property, Fleet Assets, Net Book Values & Market Appraisals"
        asOfDate="September 30, 2026"
      />

      <div className="flex flex-col gap-4 p-4">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-4">
            <span className="text-xs text-muted-foreground font-medium">Gross Capitalized Cost</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xl font-bold font-mono text-foreground">
                {formatCurrency(data.totalCostBasis)}
              </span>
              <Badge variant="outline" className="text-[11px] font-mono">
                Historical Cost
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Across 14 capital assets</p>
          </Card>

          <Card className="p-4">
            <span className="text-xs text-muted-foreground font-medium">Accumulated Depreciation</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xl font-bold font-mono text-muted-foreground">
                ({formatCurrency(data.totalAccumulatedDepreciation)})
              </span>
              <Badge variant="secondary" className="font-mono text-[11px]">
                8.1% Expensed
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">GAAP Straight-Line & MACRS</p>
          </Card>

          <Card className="p-4">
            <span className="text-xs text-muted-foreground font-medium">Net Book Value (Carrying NBV)</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xl font-bold font-mono text-foreground">
                {formatCurrency(data.totalNetBookValue)}
              </span>
              <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px]">
                Active Balance
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Reconciles to Balance Sheet PPE</p>
          </Card>

          <Card className="p-4">
            <span className="text-xs text-muted-foreground font-medium">Appraised Market Value & Gain</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {formatCurrency(data.totalFairMarketValue)}
              </span>
              <Badge variant="outline" className="text-emerald-600 dark:text-emerald-400 text-[11px]">
                +{formatCurrency(data.totalUnrealizedAppreciation)}
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">+20.1% Unrealized Appreciation</p>
          </Card>
        </div>

        {/* 5-Year Depreciation Forecast Strip */}
        <Card className="p-4">
          <div className="flex items-center justify-between pb-3 border-b">
            <div>
              <CardTitle className="text-sm font-semibold">5-Year Projected Depreciation Schedule</CardTitle>
              <CardDescription className="text-xs">
                Forward non-cash amortization & projected ending Net Book Value (2026-2030)
              </CardDescription>
            </div>
            <CalendarIcon className="size-4 text-muted-foreground" />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 pt-3">
            {data.depreciationForecastNext5Years.map((fc) => (
              <div key={fc.year} className="rounded-lg border bg-muted/20 p-2.5 text-center">
                <span className="font-mono text-xs font-semibold text-foreground">{fc.year}</span>
                <p className="font-mono text-xs font-bold text-muted-foreground mt-1">
                  -{formatCurrency(fc.projectedExpense)}
                </p>
                <span className="text-[10px] text-muted-foreground block mt-0.5">
                  Ending: {formatCurrency(fc.projectedEndingNBV)}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Schedule Table */}
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b bg-muted/40 p-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-foreground">Asset Schedule Breakdown</span>
              <div className="flex items-center rounded-lg border bg-background p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setFilterClass("all")}
                  className={cn(
                    "rounded-md px-2 py-0.5 font-medium transition-colors",
                    filterClass === "all" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                  )}
                >
                  All Assets
                </button>
                <button
                  type="button"
                  onClick={() => setFilterClass("property")}
                  className={cn(
                    "rounded-md px-2 py-0.5 font-medium transition-colors",
                    filterClass === "property" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                  )}
                >
                  Property Only
                </button>
                <button
                  type="button"
                  onClick={() => setFilterClass("movable")}
                  className={cn(
                    "rounded-md px-2 py-0.5 font-medium transition-colors",
                    filterClass === "movable" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                  )}
                >
                  Movable Only
                </button>
              </div>
            </div>
            <span className="text-xs text-muted-foreground font-mono">{filteredItems.length} Records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b bg-muted/40 text-muted-foreground">
                <tr>
                  <th className="py-2.5 pl-4 pr-2 font-medium">Asset Identifier</th>
                  <th className="px-3 py-2.5 font-medium">Category</th>
                  <th className="px-3 py-2.5 font-medium text-right">Original Cost</th>
                  <th className="px-3 py-2.5 font-medium text-right">Accum. Deprec.</th>
                  <th className="px-3 py-2.5 font-medium text-right">Net Book Value</th>
                  <th className="px-3 py-2.5 font-medium text-right">Market Appraised</th>
                  <th className="px-3 py-2.5 font-medium text-right">Unrealized Gain</th>
                  <th className="py-2.5 pl-3 pr-4 text-center font-medium">Life Left</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredItems.map((item) => (
                  <tr key={item.assetTag} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 pl-4 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-foreground">{item.assetTag}</span>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] uppercase font-mono",
                            item.classification === "property" ? "border-sky-500/40 text-sky-600 dark:text-sky-400" : "border-violet-500/40 text-violet-600 dark:text-violet-400"
                          )}
                        >
                          {item.classification}
                        </Badge>
                      </div>
                      <p className="truncate text-[11px] text-muted-foreground max-w-[200px]">{item.name}</p>
                    </td>

                    <td className="px-3 py-3 text-muted-foreground">{item.subCategory}</td>

                    <td className="px-3 py-3 text-right font-mono font-medium tabular-nums">
                      {formatCurrency(item.originalCost)}
                    </td>

                    <td className="px-3 py-3 text-right font-mono text-muted-foreground tabular-nums">
                      ({formatCurrency(item.accumulatedDepreciation)})
                    </td>

                    <td className="px-3 py-3 text-right font-mono font-bold tabular-nums text-foreground">
                      {formatCurrency(item.netBookValue)}
                    </td>

                    <td className="px-3 py-3 text-right font-mono font-semibold tabular-nums text-foreground">
                      {formatCurrency(item.fairMarketValue)}
                    </td>

                    <td className="px-3 py-3 text-right font-mono text-emerald-600 dark:text-emerald-400 tabular-nums font-medium">
                      +{formatCurrency(item.unrealizedAppreciation)}
                    </td>

                    <td className="py-3 pl-3 pr-4 text-center font-mono text-muted-foreground">
                      {item.usefulLifeRemainingYears} yrs
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}
