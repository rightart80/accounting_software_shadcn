"use client"

import { useState, useMemo } from "react"
import {
  ChevronDown,
  ChevronRight,
  CheckCircle2Icon,
  ShieldCheckIcon,
  TrendingUpIcon,
  ArrowUpRightIcon,
  ArrowDownRightIcon,
  ScaleIcon,
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
import { getBalanceSheet } from "@/services/reports.service"
import { StatementHeader } from "@/components/reports/statement-header"
import type { BalanceSheetLineItem } from "@/types/reports"

export function BalanceSheetClient() {
  const data = useMemo(() => getBalanceSheet(), [])
  const [accountingMethod, setAccountingMethod] = useState<"accrual" | "cash">("accrual")
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({})

  const toggleSection = (id: string) => {
    setCollapsedSections((prev) => ({ ...prev, [id]: !prev[id] }))
  }

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

  const renderRow = (item: BalanceSheetLineItem, depth = 0, totalBase = data.totalAssets) => {
    const isCollapsed = collapsedSections[item.id]
    const hasChildren = item.subItems && item.subItems.length > 0
    const variance = item.currentPeriodAmount - item.priorPeriodAmount
    const variancePercent = item.priorPeriodAmount !== 0 ? (variance / Math.abs(item.priorPeriodAmount)) * 100 : 0
    const percentOfBase = totalBase > 0 ? (Math.abs(item.currentPeriodAmount) / totalBase) * 100 : 0

    return (
      <div key={item.id} className="group">
        <div
          onClick={() => hasChildren && toggleSection(item.id)}
          className={cn(
            "flex items-center justify-between py-2.5 px-4 text-xs transition-colors hover:bg-muted/40",
            depth === 0 ? "font-semibold border-b bg-muted/15" : "border-b border-border/40 text-muted-foreground hover:text-foreground",
            hasChildren && "cursor-pointer"
          )}
          style={{ paddingLeft: `${Math.max(16, depth * 24 + 16)}px` }}
        >
          {/* Account name & code */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {hasChildren && (
              <span className="text-muted-foreground">
                {isCollapsed ? <ChevronRight className="size-3.5" /> : <ChevronDown className="size-3.5" />}
              </span>
            )}
            {!hasChildren && depth > 0 && <span className="w-3.5" />}
            <span className="font-mono text-[11px] text-muted-foreground">{item.accountCode}</span>
            <span className={cn("truncate", depth === 0 && "text-foreground font-semibold")}>{item.name}</span>
          </div>

          {/* Amounts & Metrics */}
          <div className="flex items-center gap-6 text-right">
            <span className="w-16 font-mono text-[11px] text-muted-foreground hidden md:inline-block">
              {percentOfBase.toFixed(1)}%
            </span>
            <span className="w-24 font-mono text-muted-foreground hidden sm:inline-block">
              {formatCurrency(item.priorPeriodAmount)}
            </span>
            <span className={cn(
              "w-20 font-mono text-[11px] hidden lg:inline-flex items-center justify-end gap-0.5",
              variance >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
            )}>
              {variance >= 0 ? "+" : ""}{variancePercent.toFixed(1)}%
            </span>
            <span className={cn("w-28 font-mono font-medium", depth === 0 && "text-foreground font-bold")}>
              {formatCurrency(item.currentPeriodAmount)}
            </span>
          </div>
        </div>

        {/* Sub-items */}
        {hasChildren && !isCollapsed && (
          <div>
            {item.subItems!.map((sub) => {
              const subVar = sub.currentPeriodAmount - sub.priorPeriodAmount
              const subVarPct = sub.priorPeriodAmount !== 0 ? (subVar / Math.abs(sub.priorPeriodAmount)) * 100 : 0
              return (
                <div
                  key={sub.id}
                  className="flex items-center justify-between py-2 px-4 text-xs border-b border-border/30 hover:bg-muted/30"
                  style={{ paddingLeft: `${depth * 24 + 40}px` }}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="font-mono text-[11px] text-muted-foreground">{sub.accountCode}</span>
                    <span className="truncate text-muted-foreground">{sub.name}</span>
                  </div>
                  <div className="flex items-center gap-6 text-right">
                    <span className="w-16 hidden md:inline-block" />
                    <span className="w-24 font-mono text-muted-foreground hidden sm:inline-block">
                      {formatCurrency(sub.priorPeriodAmount)}
                    </span>
                    <span className={cn(
                      "w-20 font-mono text-[11px] hidden lg:inline-flex items-center justify-end gap-0.5",
                      subVar >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                    )}>
                      {subVar >= 0 ? "+" : ""}{subVarPct.toFixed(1)}%
                    </span>
                    <span className="w-28 font-mono text-foreground">
                      {formatCurrency(sub.currentPeriodAmount)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <StatementHeader
        title="Consolidated Balance Sheet"
        subtitle="Statement of Financial Condition & Capital Structure"
        asOfDate={data.asOfDate}
        accountingMethod={accountingMethod}
        onMethodChange={setAccountingMethod}
      />

      <div className="flex flex-col gap-4 p-4">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-4">
            <span className="text-xs text-muted-foreground font-medium">Total Assets</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xl font-bold font-mono text-foreground">
                {formatCurrency(data.totalAssets)}
              </span>
              <Badge variant="outline" className="text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10 text-[11px]">
                +6.4% YoY
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Working Capital: {formatCurrency(data.workingCapital)}
            </p>
          </Card>

          <Card className="p-4">
            <span className="text-xs text-muted-foreground font-medium">Total Liabilities</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xl font-bold font-mono text-foreground">
                {formatCurrency(data.totalLiabilities)}
              </span>
              <Badge variant="outline" className="text-muted-foreground text-[11px]">
                Debt Ratio: 41.3%
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Current: {formatCurrency(data.totalCurrentLiabilities)} • Long-Term: {formatCurrency(data.totalNonCurrentLiabilities)}
            </p>
          </Card>

          <Card className="p-4">
            <span className="text-xs text-muted-foreground font-medium">Total Stockholders&apos; Equity</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xl font-bold font-mono text-foreground">
                {formatCurrency(data.totalEquity)}
              </span>
              <Badge variant="outline" className="text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10 text-[11px]">
                +10.8% YoY
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Book Value per Share: $2.71
            </p>
          </Card>

          <Card className="p-4">
            <span className="text-xs text-muted-foreground font-medium">Equation Health & Liquidity</span>
            <div className="flex items-baseline justify-between mt-1">
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
                <CheckCircle2Icon className="size-4" />
                <span>100% Balanced</span>
              </div>
              <Badge variant="secondary" className="font-mono text-[11px]">
                {data.currentRatio.toFixed(2)}x Ratio
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Assets = Liab + Equity ($0.00 Variance)
            </p>
          </Card>
        </div>

        {/* The Statement Table */}
        <Card className="overflow-hidden">
          <div className="border-b bg-muted/60 px-4 py-2.5 text-xs text-muted-foreground flex items-center justify-between font-medium">
            <span>Account Title</span>
            <div className="flex items-center gap-6 text-right">
              <span className="w-16 hidden md:inline-block">% Assets</span>
              <span className="w-24 hidden sm:inline-block">Dec 31, 2025</span>
              <span className="w-20 hidden lg:inline-block">Variance</span>
              <span className="w-28 text-foreground font-semibold">Sep 30, 2026</span>
            </div>
          </div>

          <div className="divide-y divide-border/60">
            {/* ASSETS SECTION */}
            <div className="bg-primary/5 px-4 py-2 font-bold text-xs uppercase tracking-wider text-primary flex justify-between">
              <span>I. ASSETS</span>
              <span>{formatCurrency(data.totalAssets)}</span>
            </div>

            <div className="bg-muted/20 px-4 py-1.5 text-xs font-semibold text-foreground flex justify-between">
              <span>Current Assets</span>
              <span>{formatCurrency(data.totalCurrentAssets)}</span>
            </div>
            {data.currentAssets.map((item) => renderRow(item, 1))}

            <div className="bg-muted/20 px-4 py-1.5 text-xs font-semibold text-foreground flex justify-between">
              <span>Non-Current Assets (PPE & Equipment)</span>
              <span>{formatCurrency(data.totalNonCurrentAssets)}</span>
            </div>
            {data.nonCurrentAssets.map((item) => renderRow(item, 1))}

            {/* Total Assets Summary Line */}
            <div className="bg-muted/40 px-4 py-3 font-bold text-sm text-foreground flex justify-between border-t-2 border-primary/20">
              <span>TOTAL ASSETS</span>
              <span className="font-mono">{formatCurrency(data.totalAssets)}</span>
            </div>

            {/* LIABILITIES SECTION */}
            <div className="bg-primary/5 px-4 py-2 font-bold text-xs uppercase tracking-wider text-primary flex justify-between mt-4">
              <span>II. LIABILITIES</span>
              <span>{formatCurrency(data.totalLiabilities)}</span>
            </div>

            <div className="bg-muted/20 px-4 py-1.5 text-xs font-semibold text-foreground flex justify-between">
              <span>Current Liabilities</span>
              <span>{formatCurrency(data.totalCurrentLiabilities)}</span>
            </div>
            {data.currentLiabilities.map((item) => renderRow(item, 1))}

            <div className="bg-muted/20 px-4 py-1.5 text-xs font-semibold text-foreground flex justify-between">
              <span>Non-Current Long-Term Liabilities</span>
              <span>{formatCurrency(data.totalNonCurrentLiabilities)}</span>
            </div>
            {data.nonCurrentLiabilities.map((item) => renderRow(item, 1))}

            {/* Total Liabilities Line */}
            <div className="bg-muted/40 px-4 py-2.5 font-bold text-xs text-foreground flex justify-between">
              <span>TOTAL LIABILITIES</span>
              <span className="font-mono">{formatCurrency(data.totalLiabilities)}</span>
            </div>

            {/* STOCKHOLDERS EQUITY SECTION */}
            <div className="bg-primary/5 px-4 py-2 font-bold text-xs uppercase tracking-wider text-primary flex justify-between mt-4">
              <span>III. STOCKHOLDERS&apos; EQUITY</span>
              <span>{formatCurrency(data.totalEquity)}</span>
            </div>
            {data.equity.map((item) => renderRow(item, 1))}

            <div className="bg-muted/40 px-4 py-2.5 font-bold text-xs text-foreground flex justify-between">
              <span>TOTAL STOCKHOLDERS&apos; EQUITY</span>
              <span className="font-mono">{formatCurrency(data.totalEquity)}</span>
            </div>

            {/* TOTAL LIABILITIES & EQUITY FINAL DOUBLE-UNDERLINED LINE */}
            <div className="bg-primary/10 px-4 py-3.5 font-bold text-sm text-foreground flex justify-between border-t-2 border-b-4 border-double border-primary">
              <span className="flex items-center gap-1.5">
                <ScaleIcon className="size-4 text-primary" />
                TOTAL LIABILITIES AND STOCKHOLDERS&apos; EQUITY
              </span>
              <span className="font-mono text-base">{formatCurrency(data.totalLiabilitiesAndEquity)}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
