"use client"

import { useMemo } from "react"
import {
  CoinsIcon,
  WalletIcon,
  ShieldCheckIcon,
  AlertCircleIcon,
  LayersIcon,
  ClockIcon,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { getNonFixedAssetsValuationReport } from "@/services/reports.service"
import { StatementHeader } from "@/components/reports/statement-header"

export function NonFixedAssetsValuationClient() {
  const data = useMemo(() => getNonFixedAssetsValuationReport(), [])

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <StatementHeader
        title="Non-Fixed Assets & Liquidity Valuation"
        subtitle="Current Working Assets, Liquid Treasury, Receivables Aging & Operating Working Capital"
        asOfDate="September 30, 2026"
      />

      <div className="flex flex-col gap-4 p-4">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-4">
            <span className="text-xs text-muted-foreground font-medium">Total Non-Fixed / Current Assets</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xl font-bold font-mono text-foreground">
                {formatCurrency(data.totalNonFixedAssets)}
              </span>
              <Badge variant="outline" className="text-[11px] font-mono">
                Working Capital
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Reconciles to Balance Sheet CA</p>
          </Card>

          <Card className="p-4">
            <span className="text-xs text-muted-foreground font-medium">Liquid Cash & Treasury</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xl font-bold font-mono text-foreground">
                {formatCurrency(data.liquidCashTreasury)}
              </span>
              <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px]">
                51.7% Liquid
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Operating Cash + US T-Bills</p>
          </Card>

          <Card className="p-4">
            <span className="text-xs text-muted-foreground font-medium">Net Trade Receivables</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xl font-bold font-mono text-foreground">
                {formatCurrency(data.netReceivables)}
              </span>
              <Badge variant="secondary" className="font-mono text-[11px]">
                34 Days DSO
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Net of $160K bad debt reserve</p>
          </Card>

          <Card className="p-4">
            <span className="text-xs text-muted-foreground font-medium">Acid-Test / Quick Ratio</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {data.quickRatio.toFixed(2)}x
              </span>
              <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px]">
                Very Strong
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Cash Ratio: {data.cashRatio.toFixed(2)}x (Benchmark: &gt;1.0x)</p>
          </Card>
        </div>

        {/* AR Aging Breakdown Card */}
        <Card className="p-4">
          <div className="flex items-center justify-between pb-3 border-b">
            <div>
              <CardTitle className="text-sm font-semibold">Accounts Receivable Aging Schedule</CardTitle>
              <CardDescription className="text-xs">
                Collection risk analysis across maturity brackets ($8,940,000 Net Portfolio)
              </CardDescription>
            </div>
            <ClockIcon className="size-4 text-muted-foreground" />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4 pt-3">
            {data.arAging.map((bucket) => (
              <div key={bucket.bucket} className="rounded-lg border bg-muted/20 p-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">{bucket.bucket}</span>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] uppercase font-mono",
                      bucket.riskLevel === "minimal" && "border-emerald-500/40 text-emerald-600 dark:text-emerald-400",
                      bucket.riskLevel === "low" && "border-blue-500/40 text-blue-600 dark:text-blue-400",
                      bucket.riskLevel === "medium" && "border-amber-500/40 text-amber-600 dark:text-amber-400",
                      bucket.riskLevel === "elevated" && "border-rose-500/40 text-rose-600 dark:text-rose-400"
                    )}
                  >
                    {bucket.riskLevel} risk
                  </Badge>
                </div>
                <div className="mt-2 flex items-baseline justify-between font-mono">
                  <span className="text-sm font-bold text-foreground">{formatCurrency(bucket.amount)}</span>
                  <span className="text-xs text-muted-foreground">{bucket.percentage.toFixed(1)}%</span>
                </div>
                <Progress value={bucket.percentage} className="h-1.5 mt-2" />
              </div>
            ))}
          </div>
        </Card>

        {/* Current Asset Holdings Table */}
        <Card className="overflow-hidden">
          <div className="border-b bg-muted/40 p-3 flex justify-between items-center">
            <span className="text-xs font-semibold text-foreground">Non-Fixed Asset Position Schedule</span>
            <span className="text-xs text-muted-foreground font-mono">{data.items.length} Asset Accounts</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b bg-muted/40 text-muted-foreground">
                <tr>
                  <th className="py-2.5 pl-4 pr-2 font-medium">Asset Name & Classification</th>
                  <th className="px-3 py-2.5 font-medium">Liquidity Tier</th>
                  <th className="px-3 py-2.5 font-medium">Yield / Turnover Metrics</th>
                  <th className="px-3 py-2.5 font-medium text-right">Prior Period</th>
                  <th className="py-2.5 pl-3 pr-4 text-right font-medium">Carrying Valuation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {data.items.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 pl-4 pr-2">
                      <span className="font-semibold text-foreground">{item.name}</span>
                      <p className="text-[11px] text-muted-foreground capitalize">
                        {item.category.replace(/_/g, " ")}
                      </p>
                    </td>

                    <td className="px-3 py-3">
                      <Badge variant="outline" className="text-[11px] font-mono">
                        {item.liquidityTier}
                      </Badge>
                    </td>

                    <td className="px-3 py-3 font-mono text-muted-foreground">
                      {item.turnoverDaysOrYield}
                    </td>

                    <td className="px-3 py-3 text-right font-mono text-muted-foreground tabular-nums">
                      {formatCurrency(item.priorBalance)}
                    </td>

                    <td className="py-3 pl-3 pr-4 text-right font-mono font-bold text-foreground tabular-nums">
                      {formatCurrency(item.currentBalance)}
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
