"use client"

import { useState, useMemo } from "react"
import {
  ArrowLeftRightIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  WalletIcon,
  ArrowDownIcon,
  ArrowUpIcon,
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
import { getCashFlowStatement } from "@/services/reports.service"
import { StatementHeader } from "@/components/reports/statement-header"
import type { CashFlowLineItem } from "@/types/reports"

export function CashFlowClient() {
  const data = useMemo(() => getCashFlowStatement(), [])
  const [accountingMethod, setAccountingMethod] = useState<"accrual" | "cash">("accrual")

  const freeCashFlow = data.netOperatingCash + data.netInvestingCash // standard definition FCF = CFO + CFI

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

  const renderItemRow = (item: CashFlowLineItem) => {
    const isPositive = item.amount >= 0
    return (
      <div
        key={item.id}
        className="flex items-center justify-between py-2 px-4 text-xs border-b border-border/40 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0 flex-1 pl-4">
          <span className="text-muted-foreground">{item.name}</span>
        </div>
        <div className="flex items-center gap-6 text-right">
          <span className="w-24 font-mono text-muted-foreground hidden sm:inline-block">
            {formatCurrency(item.priorAmount)}
          </span>
          <span className={cn(
            "w-28 font-mono font-medium",
            isPositive ? "text-foreground" : "text-rose-600 dark:text-rose-400"
          )}>
            {formatCurrency(item.amount)}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <StatementHeader
        title="Statement of Cash Flows"
        subtitle="Consolidated Direct Operating, Investing & Financing Cash Trajectory"
        dateRange={data.periodName}
        accountingMethod={accountingMethod}
        onMethodChange={setAccountingMethod}
      />

      <div className="flex flex-col gap-4 p-4">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-4">
            <span className="text-xs text-muted-foreground font-medium">Cash from Operations (CFO)</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {formatCurrency(data.netOperatingCash)}
              </span>
              <Badge variant="outline" className="text-emerald-600 dark:text-emerald-400 text-[11px]">
                155% Conversion
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">High quality operating cash generation</p>
          </Card>

          <Card className="p-4">
            <span className="text-xs text-muted-foreground font-medium">Free Cash Flow (FCF)</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xl font-bold font-mono text-foreground">
                {formatCurrency(freeCashFlow)}
              </span>
              <Badge variant="secondary" className="font-mono text-[11px]">
                Net Liquidity
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Operating Cash minus Net CapEx</p>
          </Card>

          <Card className="p-4">
            <span className="text-xs text-muted-foreground font-medium">Net Change in Cash</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xl font-bold font-mono text-primary">
                +{formatCurrency(data.netChangeInCash)}
              </span>
              <Badge variant="outline" className="text-primary text-[11px]">
                +30.0% Increase
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Beg: $15.27M → End: $19.85M</p>
          </Card>

          <Card className="p-4">
            <span className="text-xs text-muted-foreground font-medium">Ending Cash & Equivalents</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xl font-bold font-mono text-foreground">
                {formatCurrency(data.endingCash)}
              </span>
              <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px]">
                Audited & Reconciled
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Reconciles to Balance Sheet cash</p>
          </Card>
        </div>

        {/* Statement Table */}
        <Card className="overflow-hidden">
          <div className="border-b bg-muted/60 px-4 py-2.5 text-xs text-muted-foreground flex items-center justify-between font-medium">
            <span>Cash Flow Activity Line Item</span>
            <div className="flex items-center gap-6 text-right">
              <span className="w-24 hidden sm:inline-block">9M 2025</span>
              <span className="w-28 text-foreground font-semibold">9M 2026</span>
            </div>
          </div>

          <div className="divide-y divide-border/60">
            {/* OPERATING ACTIVITIES */}
            <div className="bg-primary/5 px-4 py-2 font-bold text-xs uppercase tracking-wider text-primary flex justify-between">
              <span>I. CASH FLOWS FROM OPERATING ACTIVITIES</span>
              <span>{formatCurrency(data.netOperatingCash)}</span>
            </div>
            {data.operatingActivities.map(renderItemRow)}
            <div className="bg-muted/40 px-4 py-2 font-bold text-xs text-foreground flex justify-between">
              <span>NET CASH PROVIDED BY OPERATING ACTIVITIES</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400">{formatCurrency(data.netOperatingCash)}</span>
            </div>

            {/* INVESTING ACTIVITIES */}
            <div className="bg-primary/5 px-4 py-2 font-bold text-xs uppercase tracking-wider text-primary flex justify-between mt-3">
              <span>II. CASH FLOWS FROM INVESTING ACTIVITIES</span>
              <span>{formatCurrency(data.netInvestingCash)}</span>
            </div>
            {data.investingActivities.map(renderItemRow)}
            <div className="bg-muted/40 px-4 py-2 font-bold text-xs text-foreground flex justify-between">
              <span>NET CASH USED IN INVESTING ACTIVITIES</span>
              <span className="font-mono text-rose-600 dark:text-rose-400">{formatCurrency(data.netInvestingCash)}</span>
            </div>

            {/* FINANCING ACTIVITIES */}
            <div className="bg-primary/5 px-4 py-2 font-bold text-xs uppercase tracking-wider text-primary flex justify-between mt-3">
              <span>III. CASH FLOWS FROM FINANCING ACTIVITIES</span>
              <span>{formatCurrency(data.netFinancingCash)}</span>
            </div>
            {data.financingActivities.map(renderItemRow)}
            <div className="bg-muted/40 px-4 py-2 font-bold text-xs text-foreground flex justify-between">
              <span>NET CASH USED IN FINANCING ACTIVITIES</span>
              <span className="font-mono text-rose-600 dark:text-rose-400">{formatCurrency(data.netFinancingCash)}</span>
            </div>

            {/* SUMMARY CASH RECONCILIATION */}
            <div className="bg-muted/20 px-4 py-2.5 font-bold text-xs text-foreground flex justify-between border-t-2 mt-3">
              <span>NET INCREASE IN CASH AND CASH EQUIVALENTS</span>
              <span className="font-mono text-primary">+{formatCurrency(data.netChangeInCash)}</span>
            </div>

            <div className="px-4 py-2 text-xs flex justify-between text-muted-foreground">
              <span>Cash and Cash Equivalents at Beginning of Period (Jan 1, 2026)</span>
              <span className="font-mono font-medium text-foreground">{formatCurrency(data.beginningCash)}</span>
            </div>

            {/* ENDING CASH FINAL DOUBLE-UNDERLINED */}
            <div className="bg-primary/10 px-4 py-3.5 font-bold text-sm text-foreground flex justify-between border-t-2 border-b-4 border-double border-primary">
              <span className="flex items-center gap-1.5">
                <WalletIcon className="size-4 text-primary" />
                CASH AND CASH EQUIVALENTS AT END OF PERIOD (SEP 30, 2026)
              </span>
              <span className="font-mono text-base">{formatCurrency(data.endingCash)}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
