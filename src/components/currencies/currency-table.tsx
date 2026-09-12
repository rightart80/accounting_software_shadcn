"use client"

import { useState, useMemo } from "react"
import {
  SearchIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  Trash2Icon,
  Edit2Icon,
  LandmarkIcon,
} from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { CurrencyItem } from "@/types/currencies"
import { cn } from "@/lib/utils"

interface CurrencyTableProps {
  currencies: CurrencyItem[]
  onToggleOverride: (id: string) => void
  onEdit: (currency: CurrencyItem) => void
  onDelete: (id: string) => void
}

export function CurrencyTable({
  currencies,
  onToggleOverride,
  onEdit,
  onDelete,
}: CurrencyTableProps) {
  const [search, setSearch] = useState("")
  const [filterSource, setFilterSource] = useState<"all" | "rss_feed" | "manual_override">("all")

  const filteredCurrencies = useMemo(() => {
    return currencies.filter((curr) => {
      const query = search.toLowerCase().trim()
      const matchesSearch =
        curr.code.toLowerCase().includes(query) ||
        curr.name.toLowerCase().includes(query) ||
        curr.symbol.toLowerCase().includes(query)

      const matchesSource =
        filterSource === "all" ||
        (filterSource === "rss_feed" && curr.rateSource === "rss_feed") ||
        (filterSource === "manual_override" && curr.rateSource === "manual_override")

      return matchesSearch && matchesSource
    }).sort((a, b) => (b.isDefaultBase ? 1 : 0) - (a.isDefaultBase ? 1 : 0))
  }, [currencies, search, filterSource])

  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-xs">
      {/* Header and Filter Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold tracking-tight text-foreground">
            Currency Registry & Conversion Rates
          </h3>
          <p className="text-xs text-muted-foreground">
            Registry of active currencies and live conversion rules against USD
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search Input */}
          <div className="relative w-full sm:w-56">
            <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by code, name, or symbol..."
              className="h-8 pl-8 text-xs bg-background"
            />
          </div>

          {/* Filter Tabs */}
          <Tabs
            value={filterSource}
            onValueChange={(val) => {
              if (val === "all" || val === "rss_feed" || val === "manual_override") {
                setFilterSource(val)
              }
            }}
            className="h-8"
          >
            <TabsList className="h-8 p-0.5">
              <TabsTrigger value="all" className="h-7 text-xs px-2.5">
                All ({currencies.length})
              </TabsTrigger>
              <TabsTrigger value="rss_feed" className="h-7 text-xs px-2.5 gap-1">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                Live Feed
              </TabsTrigger>
              <TabsTrigger value="manual_override" className="h-7 text-xs px-2.5 gap-1">
                <span className="size-1.5 rounded-full bg-amber-500" />
                Manual
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Streamlined, Spacious Table without Effective Rate / Inverse Rate / Last Updated clutter */}
      <div className="overflow-x-auto rounded-lg border border-border/70">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 text-[11px] uppercase tracking-wider text-muted-foreground hover:bg-muted/30">
              <TableHead className="w-[240px] py-3">Currency</TableHead>
              <TableHead className="py-3">Rate (against USD)</TableHead>
              <TableHead className="py-3">Rate Source</TableHead>
              <TableHead className="py-3 text-right">24h Change</TableHead>
              <TableHead className="py-3 text-center w-[120px]">Manual Mode</TableHead>
              <TableHead className="py-3 text-right w-[90px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCurrencies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-xs text-muted-foreground">
                  No currencies match your filter.
                </TableCell>
              </TableRow>
            ) : (
              filteredCurrencies.map((curr) => {
                const isBase = curr.isDefaultBase
                const isOverride = curr.rateSource === "manual_override"
                const isUp = curr.change24h >= 0

                // Spread calculation
                const spreadDiff = isOverride && curr.rssFeedRate > 0
                  ? (((curr.rateAgainstBase - curr.rssFeedRate) / curr.rssFeedRate) * 100).toFixed(2)
                  : null

                return (
                  <TableRow key={curr.id} className="text-xs hover:bg-muted/20 transition-colors">
                    {/* 1. Currency info */}
                    <TableCell className="py-3 font-medium">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl select-none leading-none">{curr.flag}</span>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-foreground">{curr.code}</span>
                            <span className="rounded bg-muted px-1.5 py-0.2 font-mono text-[10px] font-semibold text-muted-foreground">
                              {curr.symbol}
                            </span>
                            {isBase && (
                              <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary text-[9px] px-1 py-0 font-normal">
                                Default Base
                              </Badge>
                            )}
                          </div>
                          <span className="text-[11px] text-muted-foreground">{curr.name}</span>
                        </div>
                      </div>
                    </TableCell>

                    {/* 2. Clean Rate */}
                    <TableCell className="py-3 font-mono">
                      <span className="font-bold text-sm text-foreground">
                        {isBase ? "1.0000" : curr.rateAgainstBase.toFixed(curr.decimalDigits > 2 ? curr.decimalDigits : 4)}
                        <span className="ml-1 text-[11px] font-normal text-muted-foreground">{curr.code}</span>
                      </span>
                    </TableCell>

                    {/* 3. Rate Source & Spread */}
                    <TableCell className="py-3">
                      {isBase ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-primary">
                          <LandmarkIcon className="size-3" />
                          Base Currency
                        </span>
                      ) : isOverride ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger
                              render={
                                <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-700 dark:text-amber-400 cursor-help" />
                              }
                            >
                              <span className="size-1.5 rounded-full bg-amber-500" />
                              <span>Manual Override</span>
                              {spreadDiff && (
                                <span className="font-mono text-[10px] text-amber-600 dark:text-amber-300">
                                  ({Number(spreadDiff) >= 0 ? `+${spreadDiff}%` : `${spreadDiff}%`})
                                </span>
                              )}
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs">
                              <p>Google RSS baseline: {curr.rssFeedRate.toFixed(4)}</p>
                              {curr.notes && <p className="mt-0.5 italic">{curr.notes}</p>}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                          <span className="size-1.5 rounded-full bg-emerald-500" />
                          <span>Google RSS Feed</span>
                        </span>
                      )}
                    </TableCell>

                    {/* 4. 24h Change */}
                    <TableCell className="py-3 text-right font-mono">
                      {!isBase ? (
                        <span
                          className={cn(
                            "inline-flex items-center text-xs font-medium",
                            isUp ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                          )}
                        >
                          {isUp ? (
                            <TrendingUpIcon className="mr-0.5 size-3" />
                          ) : (
                            <TrendingDownIcon className="mr-0.5 size-3" />
                          )}
                          {isUp ? "+" : ""}
                          {curr.change24h}%
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>

                    {/* 5. Manual Mode Switch */}
                    <TableCell className="py-3 text-center">
                      {!isBase ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger
                              render={<div className="inline-flex items-center justify-center" />}
                            >
                              <Switch
                                size="sm"
                                checked={isOverride}
                                onCheckedChange={() => onToggleOverride(curr.id)}
                              />
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs">
                              {isOverride ? "Switch back to Live Google RSS feed" : "Enable manual corporate override"}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <span className="text-muted-foreground text-[10px] select-none">—</span>
                      )}
                    </TableCell>

                    {/* 6. Actions */}
                    <TableCell className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {!isBase && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(curr)}
                            className="size-7 text-muted-foreground hover:text-foreground"
                            title="Edit Custom Rate"
                          >
                            <Edit2Icon className="size-3.5" />
                          </Button>
                        )}
                        {!isBase && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDelete(curr.id)}
                            className="size-7 text-muted-foreground hover:text-destructive"
                            title="Delete Currency"
                          >
                            <Trash2Icon className="size-3.5" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
