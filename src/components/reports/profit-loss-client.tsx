"use client"

import { useState, useMemo } from "react"
import {
  TrendingUpIcon,
  TrendingDownIcon,
  FileSpreadsheetIcon,
  ChevronDown,
  ChevronRight,
  PieChartIcon,
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
import { getProfitLossStatement } from "@/services/reports.service"
import { StatementHeader } from "@/components/reports/statement-header"
import type { ProfitLossLineItem } from "@/types/reports"

export function ProfitLossClient() {
  const data = useMemo(() => getProfitLossStatement(), [])
  const [accountingMethod, setAccountingMethod] = useState<"accrual" | "cash">("accrual")

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

  const renderItemRow = (item: ProfitLossLineItem) => {
    const variance = item.currentAmount - item.priorAmount
    const variancePct = item.priorAmount !== 0 ? (variance / Math.abs(item.priorAmount)) * 100 : 0

    return (
      <div
        key={item.id}
        className="flex items-center justify-between py-2.5 px-4 text-xs border-b border-border/40 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0 flex-1 pl-4">
          <span className="font-mono text-[11px] text-muted-foreground">{item.accountCode}</span>
          <span className="truncate text-foreground font-medium">{item.name}</span>
        </div>
        <div className="flex items-center gap-6 text-right">
          <span className="w-16 font-mono text-[11px] text-muted-foreground hidden md:inline-block">
            {item.percentageOfRevenue.toFixed(1)}%
          </span>
          <span className="w-24 font-mono text-muted-foreground hidden sm:inline-block">
            {formatCurrency(item.priorAmount)}
          </span>
          <span className={cn(
            "w-20 font-mono text-[11px] hidden lg:inline-flex items-center justify-end gap-0.5",
            variance >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
          )}>
            {variance >= 0 ? "+" : ""}{variancePct.toFixed(1)}%
          </span>
          <span className="w-28 font-mono font-medium text-foreground">
            {formatCurrency(item.currentAmount)}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <StatementHeader
        title="Income Statement (Profit & Loss)"
        subtitle="Consolidated Financial Performance & Operating Results"
        dateRange={data.periodName}
        accountingMethod={accountingMethod}
        onMethodChange={setAccountingMethod}
      />

      <div className="flex flex-col gap-4 p-4">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-4">
            <span className="text-xs text-muted-foreground font-medium">Gross Revenue</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xl font-bold font-mono text-foreground">
                {formatCurrency(data.grossRevenue)}
              </span>
              <Badge variant="outline" className="text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10 text-[11px]">
                +21.4% YoY
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Prior Period: $35.3M</p>
          </Card>

          <Card className="p-4">
            <span className="text-xs text-muted-foreground font-medium">Gross Profit & Margin</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xl font-bold font-mono text-foreground">
                {formatCurrency(data.grossProfit)}
              </span>
              <Badge variant="secondary" className="font-mono text-[11px]">
                {data.grossMarginPercent.toFixed(1)}% Margin
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">COGS: {formatCurrency(data.cogs)}</p>
          </Card>

          <Card className="p-4">
            <span className="text-xs text-muted-foreground font-medium">Operating Income (EBIT)</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xl font-bold font-mono text-foreground">
                {formatCurrency(data.operatingIncome)}
              </span>
              <Badge variant="outline" className="text-emerald-600 dark:text-emerald-400 text-[11px]">
                {data.operatingMarginPercent.toFixed(1)}% EBIT
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">OPEX: {formatCurrency(data.operatingExpenses)}</p>
          </Card>

          <Card className="p-4">
            <span className="text-xs text-muted-foreground font-medium">Net Income (Bottom Line)</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {formatCurrency(data.netIncome)}
              </span>
              <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px]">
                {data.netMarginPercent.toFixed(1)}% Net Margin
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Tax Expense: {formatCurrency(data.incomeTaxExpense)}</p>
          </Card>
        </div>

        {/* Statement Table */}
        <Card className="overflow-hidden">
          <div className="border-b bg-muted/60 px-4 py-2.5 text-xs text-muted-foreground flex items-center justify-between font-medium">
            <span>Account Title</span>
            <div className="flex items-center gap-6 text-right">
              <span className="w-16 hidden md:inline-block">% Rev</span>
              <span className="w-24 hidden sm:inline-block">9M 2025</span>
              <span className="w-20 hidden lg:inline-block">Variance</span>
              <span className="w-28 text-foreground font-semibold">9M 2026</span>
            </div>
          </div>

          <div className="divide-y divide-border/60">
            {/* REVENUE */}
            <div className="bg-primary/5 px-4 py-2 font-bold text-xs uppercase tracking-wider text-primary flex justify-between">
              <span>I. OPERATING REVENUE</span>
              <span>{formatCurrency(data.grossRevenue)}</span>
            </div>
            {data.revenueItems.map(renderItemRow)}
            <div className="bg-muted/30 px-4 py-2 font-bold text-xs text-foreground flex justify-between">
              <span>TOTAL GROSS REVENUE</span>
              <span className="font-mono">{formatCurrency(data.grossRevenue)}</span>
            </div>

            {/* COGS */}
            <div className="bg-primary/5 px-4 py-2 font-bold text-xs uppercase tracking-wider text-primary flex justify-between mt-2">
              <span>II. COST OF GOODS SOLD (COGS)</span>
              <span>{formatCurrency(data.cogs)}</span>
            </div>
            {data.cogsItems.map(renderItemRow)}
            <div className="bg-muted/30 px-4 py-2 font-bold text-xs text-foreground flex justify-between">
              <span>TOTAL COST OF GOODS SOLD</span>
              <span className="font-mono">{formatCurrency(data.cogs)}</span>
            </div>

            {/* GROSS PROFIT */}
            <div className="bg-muted/50 px-4 py-2.5 font-bold text-xs text-foreground flex justify-between border-y">
              <span>GROSS PROFIT</span>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="text-[10px] font-mono">{data.grossMarginPercent.toFixed(1)}%</Badge>
                <span className="font-mono text-sm">{formatCurrency(data.grossProfit)}</span>
              </div>
            </div>

            {/* OPEX */}
            <div className="bg-primary/5 px-4 py-2 font-bold text-xs uppercase tracking-wider text-primary flex justify-between mt-2">
              <span>III. OPERATING EXPENSES (OPEX)</span>
              <span>{formatCurrency(data.operatingExpenses)}</span>
            </div>
            {data.operatingExpenseItems.map(renderItemRow)}
            <div className="bg-muted/30 px-4 py-2 font-bold text-xs text-foreground flex justify-between">
              <span>TOTAL OPERATING EXPENSES</span>
              <span className="font-mono">{formatCurrency(data.operatingExpenses)}</span>
            </div>

            {/* OPERATING INCOME (EBIT) */}
            <div className="bg-muted/50 px-4 py-2.5 font-bold text-xs text-foreground flex justify-between border-y">
              <span>OPERATING INCOME (EBIT)</span>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="text-[10px] font-mono">{data.operatingMarginPercent.toFixed(1)}%</Badge>
                <span className="font-mono text-sm">{formatCurrency(data.operatingIncome)}</span>
              </div>
            </div>

            {/* OTHER ITEMS */}
            <div className="bg-primary/5 px-4 py-2 font-bold text-xs uppercase tracking-wider text-primary flex justify-between mt-2">
              <span>IV. OTHER NON-OPERATING INCOME & (EXPENSE)</span>
              <span>{formatCurrency(data.otherIncomeExpense)}</span>
            </div>
            {data.otherItems.map(renderItemRow)}

            {/* INCOME BEFORE TAX */}
            <div className="bg-muted/20 px-4 py-2 font-semibold text-xs text-foreground flex justify-between">
              <span>INCOME BEFORE INCOME TAXES</span>
              <span className="font-mono">{formatCurrency(data.incomeBeforeTax)}</span>
            </div>

            <div className="px-4 py-2 text-xs flex justify-between text-muted-foreground">
              <span>Provision for Income Taxes (27.6% Effective Rate)</span>
              <span className="font-mono font-medium text-foreground">{formatCurrency(data.incomeTaxExpense)}</span>
            </div>

            {/* NET INCOME FINAL DOUBLE-UNDERLINED */}
            <div className="bg-emerald-500/10 px-4 py-3.5 font-bold text-sm text-foreground flex justify-between border-t-2 border-b-4 border-double border-emerald-500">
              <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                <TrendingUpIcon className="size-4" />
                NET INCOME (NET PROFIT)
              </span>
              <div className="flex items-center gap-3">
                <Badge className="bg-emerald-600 text-white text-[11px] font-mono">
                  {data.netMarginPercent.toFixed(1)}% Margin
                </Badge>
                <span className="font-mono text-base text-emerald-700 dark:text-emerald-400">
                  {formatCurrency(data.netIncome)}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
