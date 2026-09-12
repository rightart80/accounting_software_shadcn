"use client"

import { useState } from "react"
import { PrinterIcon, DownloadIcon, FileSpreadsheetIcon, CalendarIcon, CheckIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface StatementHeaderProps {
  title: string
  subtitle: string
  asOfDate?: string
  dateRange?: string
  accountingMethod?: "accrual" | "cash"
  onMethodChange?: (method: "accrual" | "cash") => void
  onExport?: () => void
}

export function StatementHeader({
  title,
  subtitle,
  asOfDate,
  dateRange,
  accountingMethod = "accrual",
  onMethodChange,
  onExport,
}: StatementHeaderProps) {
  const [downloading, setDownloading] = useState(false)

  const handlePrint = () => {
    window.print()
  }

  const handleExport = () => {
    setDownloading(true)
    setTimeout(() => {
      setDownloading(false)
      if (onExport) onExport()
    }, 600)
  }

  return (
    <div className="flex flex-col gap-4 border-b bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Title + Metadata */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold tracking-tight text-foreground">{title}</h1>
          <Badge variant="outline" className="text-[11px] font-mono uppercase">
            US GAAP
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          {subtitle} • Morao Artisan Softwares Inc.
        </p>
        <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
          <CalendarIcon className="size-3.5" />
          <span className="font-medium text-foreground">
            {asOfDate ? `As of ${asOfDate}` : dateRange}
          </span>
          <span>• Currency: USD ($)</span>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Accrual / Cash Switcher */}
        {onMethodChange && (
          <div className="flex items-center rounded-lg border bg-muted/40 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => onMethodChange("accrual")}
              className={cn(
                "rounded-md px-2.5 py-1 font-medium transition-colors",
                accountingMethod === "accrual"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Accrual
            </button>
            <button
              type="button"
              onClick={() => onMethodChange("cash")}
              className={cn(
                "rounded-md px-2.5 py-1 font-medium transition-colors",
                accountingMethod === "cash"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Cash Basis
            </button>
          </div>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={handlePrint}
          className="h-8 gap-1.5 text-xs"
        >
          <PrinterIcon className="size-3.5" />
          <span className="hidden sm:inline">Print</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          disabled={downloading}
          className="h-8 gap-1.5 text-xs"
        >
          {downloading ? (
            <CheckIcon className="size-3.5 text-emerald-500" />
          ) : (
            <DownloadIcon className="size-3.5" />
          )}
          <span>{downloading ? "Exported" : "Export CSV"}</span>
        </Button>
      </div>
    </div>
  )
}
