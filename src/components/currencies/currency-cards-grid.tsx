"use client"

import { PlusIcon } from "lucide-react"
import { CurrencyCard } from "./currency-card"
import type { CurrencyItem } from "@/types/currencies"
import { cn } from "@/lib/utils"

interface CurrencyCardsGridProps {
  currencies: CurrencyItem[]
  onOpenAddDialog: () => void
  onToggleOverride: (id: string) => void
  onEdit: (currency: CurrencyItem) => void
}

export function CurrencyCardsGrid({
  currencies,
  onOpenAddDialog,
  onToggleOverride,
  onEdit,
}: CurrencyCardsGridProps) {
  // Max 6 cards per row, max 2 rows (12 total slots, with 1 slot for Add Currency button)
  const MAX_CARDS = 11
  const baseCurrency = currencies.find((c) => c.isDefaultBase)
  const others = currencies.filter((c) => !c.isDefaultBase)
  const orderedCurrencies = baseCurrency ? [baseCurrency, ...others] : currencies
  const displayedCurrencies = orderedCurrencies.slice(0, MAX_CARDS)
  const remainingCount = Math.max(0, orderedCurrencies.length - MAX_CARDS)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-foreground tracking-tight">
            Exchange Rate Matrix
          </h2>
          <span className="text-[11px] text-muted-foreground font-mono">
            (USD Base)
          </span>
        </div>
        {remainingCount > 0 && (
          <span className="text-[11px] text-muted-foreground">
            +{remainingCount} more in ledger table below
          </span>
        )}
      </div>

      {/* Grid: strictly max 6 columns per row, max 2 rows */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {displayedCurrencies.map((curr) => (
          <CurrencyCard
            key={curr.id}
            currency={curr}
            onToggleOverride={onToggleOverride}
            onEdit={onEdit}
          />
        ))}

        {/* Add Currency Card Button */}
        <button
          type="button"
          onClick={onOpenAddDialog}
          className={cn(
            "group relative flex min-h-[128px] flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-card/40 p-4 text-center transition-all duration-200 hover:border-primary/50 hover:bg-primary/[0.03] hover:shadow-xs focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
          )}
        >
          <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform duration-200 group-hover:scale-105 group-hover:bg-primary group-hover:text-primary-foreground">
            <PlusIcon className="size-4" />
          </div>
          <span className="mt-2 text-xs font-semibold text-foreground group-hover:text-primary">
            Add Currency
          </span>
          <span className="mt-0.5 text-[10px] text-muted-foreground">
            Live RSS or Manual
          </span>
        </button>
      </div>
    </div>
  )
}
