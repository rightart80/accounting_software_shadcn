"use client"

import {
  TrendingUpIcon,
  TrendingDownIcon,
  RssIcon,
  SlidersHorizontalIcon,
  MoreVerticalIcon,
  LandmarkIcon,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { CurrencyItem } from "@/types/currencies"
import { cn } from "@/lib/utils"

interface CurrencyCardProps {
  currency: CurrencyItem
  onToggleOverride: (id: string) => void
  onEdit: (currency: CurrencyItem) => void
}

export function CurrencyCard({
  currency,
  onToggleOverride,
  onEdit,
}: CurrencyCardProps) {
  const isBase = currency.isDefaultBase
  const isOverride = currency.rateSource === "manual_override"
  const isUp = currency.change24h >= 0

  return (
    <Card
      className={cn(
        "group relative flex flex-col justify-between rounded-xl border bg-card p-0 transition-all duration-200 hover:border-foreground/20 hover:shadow-xs",
        isBase && "border-primary/30 bg-primary/[0.03] ring-1 ring-primary/20"
      )}
    >
      <CardContent className="flex flex-col justify-between p-3.5 h-full space-y-3">
        {/* Top: Flag, Code, Name, Symbol */}
        <div className="flex items-start justify-between gap-1">
          <div className="flex items-center gap-2">
            <span className="text-xl select-none leading-none" role="img" aria-label={currency.name}>
              {currency.flag}
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs text-foreground tracking-tight">{currency.code}</span>
                <span className="rounded bg-muted px-1.5 py-0.2 font-mono text-[10px] font-medium text-muted-foreground">
                  {currency.symbol}
                </span>
              </div>
              <p className="truncate text-[11px] text-muted-foreground leading-tight max-w-[85px]">
                {currency.name}
              </p>
            </div>
          </div>

          {/* Quick Dropdown Menu */}
          {!isBase ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-6 text-muted-foreground opacity-50 group-hover:opacity-100 hover:bg-muted"
                  />
                }
              >
                <MoreVerticalIcon className="size-3.5" />
                <span className="sr-only">Actions</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44 text-xs">
                <DropdownMenuItem onClick={() => onEdit(currency)}>
                  <SlidersHorizontalIcon className="mr-2 size-3.5" />
                  Edit Custom Rate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onToggleOverride(currency.id)}>
                  {isOverride ? (
                    <>
                      <RssIcon className="mr-2 size-3.5 text-emerald-500" />
                      Switch to Live RSS
                    </>
                  ) : (
                    <>
                      <SlidersHorizontalIcon className="mr-2 size-3.5 text-amber-500" />
                      Enable Manual Override
                    </>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary text-[9px] px-1 py-0 font-normal">
              Base
            </Badge>
          )}
        </div>

        {/* Middle: Conversion Rate */}
        <div className="space-y-0.5">
          <div className="flex items-baseline gap-1">
            <span className="text-[10px] font-mono text-muted-foreground">1 USD =</span>
            <span className="font-mono font-bold text-base text-foreground tracking-tight">
              {isBase ? "1.0000" : currency.rateAgainstBase.toFixed(currency.decimalDigits > 2 ? currency.decimalDigits : 4)}
            </span>
          </div>
        </div>

        {/* Bottom: Source Pill and 24h Change */}
        <div className="flex items-center justify-between border-t border-border/50 pt-2 text-[10px]">
          {isBase ? (
            <span className="flex items-center gap-1 font-medium text-primary text-[10px]">
              <LandmarkIcon className="size-3" />
              Default Base
            </span>
          ) : isOverride ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-1.5 py-0.5 font-medium text-amber-700 dark:text-amber-400">
              <span className="size-1 rounded-full bg-amber-500" />
              Manual
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-1.5 py-0.5 font-medium text-emerald-700 dark:text-emerald-400">
              <span className="size-1 rounded-full bg-emerald-500" />
              Live RSS
            </span>
          )}

          {!isBase && (
            <span
              className={cn(
                "flex items-center font-mono font-medium",
                isUp ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
              )}
            >
              {isUp ? (
                <TrendingUpIcon className="mr-0.5 size-2.5" />
              ) : (
                <TrendingDownIcon className="mr-0.5 size-2.5" />
              )}
              {isUp ? "+" : ""}
              {currency.change24h}%
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
