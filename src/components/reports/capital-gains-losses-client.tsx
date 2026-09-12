"use client"

import { useMemo } from "react"
import {
  TrendingUpIcon,
  TrendingDownIcon,
  ShieldCheckIcon,
  ScaleIcon,
  ReceiptIcon,
  CalendarIcon,
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
import { getCapitalGainsLossesReport } from "@/services/reports.service"
import { StatementHeader } from "@/components/reports/statement-header"

export function CapitalGainsLossesClient() {
  const data = useMemo(() => getCapitalGainsLossesReport(), [])

  const formatCurrency = (val: number) => {
    const isNegative = val < 0
    const abs = Math.abs(val)
    const formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(abs)
    return isNegative ? `(${formatted})` : formatted
  }

  return (
    <div className="flex flex-col min-h-screen">
      <StatementHeader
        title="Capital Gains & Losses (Capital G/L)"
        subtitle="Schedule of Realized Capital Dispositions, Long-Term vs Short-Term Gains & Mark-to-Market Valuation"
        asOfDate="September 30, 2026"
      />

      <div className="flex flex-col gap-4 p-4">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-4">
            <span className="text-xs text-muted-foreground font-medium">Net Realized Capital Gain</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                +{formatCurrency(data.netRealizedGainLoss)}
              </span>
              <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px]">
                Realized (YTD)
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Gains: {formatCurrency(data.totalRealizedGains)} • Losses: ({formatCurrency(data.totalRealizedLosses)})
            </p>
          </Card>

          <Card className="p-4">
            <span className="text-xs text-muted-foreground font-medium">Long-Term Capital Gain (LTCG)</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xl font-bold font-mono text-foreground">
                {formatCurrency(data.longTermNetGain)}
              </span>
              <Badge variant="secondary" className="font-mono text-[11px]">
                20% Rate
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Holding period &gt; 1 Year (Tax Preferential)</p>
          </Card>

          <Card className="p-4">
            <span className="text-xs text-muted-foreground font-medium">Short-Term Capital Gain (STCG)</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xl font-bold font-mono text-foreground">
                {formatCurrency(data.shortTermNetGain)}
              </span>
              <Badge variant="outline" className="font-mono text-[11px]">
                35% Rate
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Holding period &le; 1 Year (Ordinary Income)</p>
          </Card>

          <Card className="p-4">
            <span className="text-xs text-muted-foreground font-medium">Estimated Capital Tax Liability</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xl font-bold font-mono text-foreground">
                {formatCurrency(data.totalEstimatedTaxLiability)}
              </span>
              <Badge variant="outline" className="text-muted-foreground text-[11px]">
                Accrued in Tax Exp
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Effective capital tax rate: 21.0%</p>
          </Card>
        </div>

        {/* Realized Dispositions Table */}
        <Card className="overflow-hidden">
          <div className="border-b bg-muted/40 p-3 flex justify-between items-center">
            <span className="text-xs font-semibold text-foreground">Realized Capital Dispositions (YTD 2026)</span>
            <span className="text-xs text-muted-foreground font-mono">{data.transactions.length} Disposed Assets</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b bg-muted/40 text-muted-foreground">
                <tr>
                  <th className="py-2.5 pl-4 pr-2 font-medium">Asset & Classification</th>
                  <th className="px-3 py-2.5 font-medium">Acquired / Sold</th>
                  <th className="px-3 py-2.5 font-medium text-right">Holding Days</th>
                  <th className="px-3 py-2.5 font-medium text-right">Cost Basis</th>
                  <th className="px-3 py-2.5 font-medium text-right">Gross Proceeds</th>
                  <th className="px-3 py-2.5 font-medium text-right">Net Gain / (Loss)</th>
                  <th className="px-3 py-2.5 font-medium text-center">Term</th>
                  <th className="py-2.5 pl-3 pr-4 text-right font-medium">Est. Tax</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {data.transactions.map((tx) => {
                  const isGain = tx.netGainLoss >= 0
                  return (
                    <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 pl-4 pr-2">
                        <span className="font-semibold text-foreground">{tx.assetName}</span>
                        <p className="text-[11px] text-muted-foreground">{tx.assetType}</p>
                      </td>

                      <td className="px-3 py-3 text-muted-foreground font-mono">
                        {tx.acquisitionDate} → {tx.disposalDate}
                      </td>

                      <td className="px-3 py-3 text-right font-mono text-muted-foreground">
                        {tx.holdingPeriodDays}d
                      </td>

                      <td className="px-3 py-3 text-right font-mono text-muted-foreground tabular-nums">
                        {formatCurrency(tx.costBasis)}
                      </td>

                      <td className="px-3 py-3 text-right font-mono font-medium text-foreground tabular-nums">
                        {formatCurrency(tx.grossProceeds)}
                      </td>

                      <td className={cn(
                        "px-3 py-3 text-right font-mono font-bold tabular-nums",
                        isGain ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                      )}>
                        {isGain ? "+" : ""}{formatCurrency(tx.netGainLoss)}
                      </td>

                      <td className="px-3 py-3 text-center">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] font-mono uppercase",
                            tx.gainType === "long_term" ? "border-emerald-500/40 text-emerald-600 dark:text-emerald-400" : "border-blue-500/40 text-blue-600 dark:text-blue-400"
                          )}
                        >
                          {tx.gainType === "long_term" ? "LTCG (20%)" : "STCG (35%)"}
                        </Badge>
                      </td>

                      <td className="py-3 pl-3 pr-4 text-right font-mono text-muted-foreground tabular-nums">
                        {formatCurrency(tx.estimatedTax)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Unrealized Portfolio Mark-to-Market Table */}
        <Card className="overflow-hidden">
          <div className="border-b bg-muted/40 p-3 flex justify-between items-center">
            <span className="text-xs font-semibold text-foreground">
              Unrealized Capital Holdings (Mark-to-Market Appreciation)
            </span>
            <Badge variant="outline" className="text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[11px] font-mono">
              Total Unrealized Gain: +{formatCurrency(data.totalUnrealizedGainLoss)}
            </Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b bg-muted/40 text-muted-foreground">
                <tr>
                  <th className="py-2.5 pl-4 pr-2 font-medium">Holding Asset</th>
                  <th className="px-3 py-2.5 font-medium">Classification</th>
                  <th className="px-3 py-2.5 font-medium text-right">Inception Cost Basis</th>
                  <th className="px-3 py-2.5 font-medium text-right">Current Appraised Fair Value</th>
                  <th className="py-2.5 pl-3 pr-4 text-right font-medium">Unrealized Gain / (Loss)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {data.unrealizedHoldings.map((h) => (
                  <tr key={h.assetName} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 pl-4 pr-2 font-semibold text-foreground">{h.assetName}</td>
                    <td className="px-3 py-3 text-muted-foreground">{h.assetType}</td>
                    <td className="px-3 py-3 text-right font-mono text-muted-foreground tabular-nums">
                      {formatCurrency(h.inceptionBasis)}
                    </td>
                    <td className="px-3 py-3 text-right font-mono font-bold text-foreground tabular-nums">
                      {formatCurrency(h.currentFairValue)}
                    </td>
                    <td className="py-3 pl-3 pr-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                      +{formatCurrency(h.unrealizedGainLoss)}{" "}
                      <span className="text-[10px] font-normal opacity-80">
                        (+{h.unrealizedGainLossPercent.toFixed(1)}%)
                      </span>
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
