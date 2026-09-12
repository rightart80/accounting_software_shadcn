"use client"

import { useState, useMemo } from "react"
import {
  RssIcon,
  SlidersHorizontalIcon,
  RefreshCwIcon,
  PlusIcon,
  SearchIcon,
  CheckIcon,
  ChevronsUpDownIcon,
  BitcoinIcon,
  GlobeIcon,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { getCurrencyCatalog, fetchLiveRSSRateForCurrency } from "@/services/currencies.service"
import type { CurrencyItem, RateSource } from "@/types/currencies"
import { cn } from "@/lib/utils"

interface AddCurrencyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  existingCodes: string[]
  onAdd: (currency: Omit<CurrencyItem, "id" | "lastSyncedAt">) => void
}

export function AddCurrencyDialog({
  open,
  onOpenChange,
  existingCodes,
  onAdd,
}: AddCurrencyDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-5">
        {open && (
          <AddCurrencyForm
            existingCodes={existingCodes}
            onClose={() => onOpenChange(false)}
            onAdd={onAdd}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

interface AddCurrencyFormProps {
  existingCodes: string[]
  onClose: () => void
  onAdd: (currency: Omit<CurrencyItem, "id" | "lastSyncedAt">) => void
}

function AddCurrencyForm({ existingCodes, onClose, onAdd }: AddCurrencyFormProps) {
  const catalog = getCurrencyCatalog()

  // Start with empty selectedCode so NOTHING is pre-populated
  const [selectedCode, setSelectedCode] = useState<string>("")
  const [customName, setCustomName] = useState<string>("")
  const [currencySymbol, setCurrencySymbol] = useState<string>("")

  // Search state for currency combobox
  const [comboboxOpen, setComboboxOpen] = useState(false)
  const [currencySearch, setCurrencySearch] = useState("")
  const [activeCategory, setActiveCategory] = useState<"all" | "fiat" | "crypto">("all")

  // Live RSS feed state
  const [rssRate, setRssRate] = useState<number>(0)
  const [isFetchingFeed, setIsFetchingFeed] = useState<boolean>(false)

  // Override options
  const [isManualOverride, setIsManualOverride] = useState<boolean>(false)
  const [manualRate, setManualRate] = useState<string>("")
  const [notes, setNotes] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const selectedOption = selectedCode
    ? catalog.find((c) => c.code === selectedCode) || {
        code: selectedCode,
        name: customName || selectedCode,
        symbol: currencySymbol || selectedCode,
        flag: "🌐",
        feedRateAgainstUSD: rssRate,
        decimalDigits: 2,
        category: "Custom",
      }
    : null

  // Filtered currency catalog based on search and category
  const filteredCatalog = useMemo(() => {
    const q = currencySearch.toLowerCase().trim()
    let items = catalog

    if (activeCategory === "crypto") {
      items = items.filter((c) => c.category === "Crypto")
    } else if (activeCategory === "fiat") {
      items = items.filter((c) => c.category !== "Crypto")
    }

    if (!q) return items

    return items.filter(
      (item) =>
        item.code.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        item.symbol.toLowerCase().includes(q)
    )
  }, [catalog, currencySearch, activeCategory])

  const handleCurrencySelect = (code: string) => {
    setSelectedCode(code)
    setComboboxOpen(false)
    setCurrencySearch("")

    const opt = catalog.find((c) => c.code === code)
    if (opt) {
      setCurrencySymbol(opt.symbol)
      setCustomName(opt.name)
      setIsFetchingFeed(true)
      fetchLiveRSSRateForCurrency(code)
        .then((rate) => {
          setRssRate(rate)
          if (!isManualOverride) {
            setManualRate(rate.toString())
          }
        })
        .finally(() => {
          setIsFetchingFeed(false)
        })
    }
  }

  const handleSelectCustom = (customCode: string) => {
    const upper = customCode.toUpperCase().trim()
    setSelectedCode(upper)
    setCustomName(`${upper} Currency`)
    setCurrencySymbol(upper.slice(0, 3))
    setComboboxOpen(false)
    setCurrencySearch("")
    setIsFetchingFeed(true)
    fetchLiveRSSRateForCurrency(upper)
      .then((rate) => {
        setRssRate(rate)
        if (!isManualOverride) {
          setManualRate(rate.toString())
        }
      })
      .finally(() => {
        setIsFetchingFeed(false)
      })
  }

  const handleRefreshRate = async () => {
    if (!selectedCode) return
    setIsFetchingFeed(true)
    try {
      const rate = await fetchLiveRSSRateForCurrency(selectedCode)
      setRssRate(rate)
      if (!isManualOverride) {
        setManualRate(rate.toString())
      }
    } finally {
      setIsFetchingFeed(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCode || !selectedOption) return

    setIsSubmitting(true)

    const parsedManual = parseFloat(manualRate)
    const effectiveManualRate = !isNaN(parsedManual) && parsedManual > 0 ? parsedManual : rssRate
    const rateSource: RateSource = isManualOverride ? "manual_override" : "rss_feed"
    const rateAgainstBase = isManualOverride ? effectiveManualRate : rssRate

    const newCurrency: Omit<CurrencyItem, "id" | "lastSyncedAt"> = {
      code: selectedCode,
      name: customName || selectedOption.name,
      symbol: currencySymbol || selectedOption.symbol,
      flag: selectedOption.flag,
      isDefaultBase: false,
      rateAgainstBase: rateAgainstBase,
      rssFeedRate: rssRate,
      manualRate: isManualOverride ? effectiveManualRate : undefined,
      rateSource: rateSource,
      change24h: Number((Math.random() * 0.8 - 0.4).toFixed(2)),
      status: "active",
      decimalDigits: selectedOption.decimalDigits || 2,
      notes: notes || undefined,
    }

    setTimeout(() => {
      onAdd(newCurrency)
      setIsSubmitting(false)
      onClose()
    }, 200)
  }

  const manualRateNum = parseFloat(manualRate)
  const spreadPercent =
    !isNaN(manualRateNum) && rssRate > 0
      ? (((manualRateNum - rssRate) / rssRate) * 100).toFixed(2)
      : "0.00"

  return (
    <>
      <DialogHeader>
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <PlusIcon className="size-4" />
          </div>
          <div>
            <DialogTitle className="text-base font-semibold">Add Currency</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Search world currencies (e.g. PKR ₨, USD, EUR) or Cryptos with live Google RSS rates
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-1">
        {/* 1. Searchable Currency Combobox */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-foreground">
              Select Currency (Searchable)
            </label>
            <span className="text-[10px] text-muted-foreground">
              {catalog.length} world currencies & cryptos
            </span>
          </div>

          <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
            <PopoverTrigger
              render={
                <button
                  type="button"
                  className="flex w-full items-center justify-between rounded-lg border border-input bg-background px-3 py-2 text-xs transition-colors hover:bg-muted/40 cursor-pointer text-left"
                />
              }
            >
              {selectedOption ? (
                <div className="flex items-center gap-2">
                  <span className="text-base select-none">{selectedOption.flag}</span>
                  <span className="font-bold text-foreground">{selectedOption.code}</span>
                  <span className="text-muted-foreground">({selectedOption.name})</span>
                  <span className="rounded bg-muted px-1.5 py-0.2 font-mono text-[10px] font-semibold text-muted-foreground">
                    {selectedOption.symbol}
                  </span>
                </div>
              ) : (
                <span className="text-muted-foreground">Search and select a currency (e.g. PKR, EUR, BTC, GBP)...</span>
              )}
              <ChevronsUpDownIcon className="size-3.5 text-muted-foreground" />
            </PopoverTrigger>

            <PopoverContent className="w-[420px] p-2.5" align="start">
              <div className="flex flex-col gap-2">
                {/* Search input */}
                <div className="relative">
                  <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                  <Input
                    autoFocus
                    value={currencySearch}
                    onChange={(e) => setCurrencySearch(e.target.value)}
                    placeholder="Search code or name (e.g. PKR, Bitcoin, EUR, Yen)..."
                    className="h-8 pl-8 text-xs"
                  />
                </div>

                {/* Category Filter Pills */}
                <div className="flex items-center gap-1.5 pb-1">
                  <button
                    type="button"
                    onClick={() => setActiveCategory("all")}
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-[10px] font-medium transition-colors cursor-pointer",
                      activeCategory === "all"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    All ({catalog.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveCategory("fiat")}
                    className={cn(
                      "flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-medium transition-colors cursor-pointer",
                      activeCategory === "fiat"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    <GlobeIcon className="size-2.5" />
                    World Fiat (PKR, INR, EUR...)
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveCategory("crypto")}
                    className={cn(
                      "flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-medium transition-colors cursor-pointer",
                      activeCategory === "crypto"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    <BitcoinIcon className="size-2.5" />
                    Crypto (BTC, ETH, SOL...)
                  </button>
                </div>

                {/* Scrollable list of currencies */}
                <div className="max-h-60 overflow-y-auto divide-y divide-border/30 rounded-md border">
                  {filteredCatalog.length === 0 ? (
                    <div className="p-3 text-center text-xs text-muted-foreground space-y-2">
                      <p>No preset currency matching &quot;{currencySearch}&quot;</p>
                      {currencySearch.trim().length >= 2 && (
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => handleSelectCustom(currencySearch)}
                          className="h-7 text-xs gap-1"
                        >
                          <PlusIcon className="size-3" />
                          Add custom code &quot;{currencySearch.toUpperCase()}&quot;
                        </Button>
                      )}
                    </div>
                  ) : (
                    filteredCatalog.map((item) => {
                      const isExisting = existingCodes.includes(item.code)
                      const isSelected = item.code === selectedCode

                      return (
                        <button
                          key={item.code}
                          type="button"
                          disabled={isExisting}
                          onClick={() => handleCurrencySelect(item.code)}
                          className={cn(
                            "flex w-full items-center justify-between px-3 py-2 text-left text-xs transition-colors hover:bg-muted/60 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer",
                            isSelected && "bg-primary/10 text-primary font-medium"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-base select-none">{item.flag}</span>
                            <span className="font-bold">{item.code}</span>
                            <span className="text-muted-foreground">{item.name}</span>
                            {item.category && (
                              <span className={cn(
                                "text-[9px] px-1 py-0.2 rounded font-medium",
                                item.category === "Crypto"
                                    ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                                    : "bg-muted text-muted-foreground"
                              )}>
                                {item.category}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-muted-foreground">
                              {item.symbol}
                            </span>
                            {isSelected && <CheckIcon className="size-3.5 text-primary" />}
                            {isExisting && (
                              <span className="text-[10px] text-muted-foreground italic">
                                Added
                              </span>
                            )}
                          </div>
                        </button>
                      )
                    })
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* 2. Live Google RSS Rate Display */}
        {selectedOption ? (
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                <RssIcon className="size-3.5 animate-pulse" />
                <span>Google Finance RSS Live Conversion Rate</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleRefreshRate}
                disabled={isFetchingFeed}
                className="size-6 text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-400"
              >
                <RefreshCwIcon className={cn("size-3", isFetchingFeed && "animate-spin")} />
                <span className="sr-only">Refresh Rate</span>
              </Button>
            </div>

            <div className="mt-2 flex items-baseline justify-between">
              <div>
                <span className="text-[11px] text-muted-foreground">Exchange Rate (Base: 1.00 USD):</span>
                <div className="font-mono text-base font-bold text-foreground">
                  {isFetchingFeed ? (
                    <span className="text-xs font-normal text-muted-foreground">Fetching RSS live stream...</span>
                  ) : (
                    `1 USD = ${rssRate.toFixed(selectedOption.decimalDigits > 2 ? selectedOption.decimalDigits : 4)} ${selectedCode}`
                  )}
                </div>
              </div>
              <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-normal">
                Feed Live
              </Badge>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border/80 bg-muted/20 p-4 text-center text-xs text-muted-foreground">
            Search and select any currency or crypto above to stream its live Google Finance RSS conversion rate.
          </div>
        )}

        {/* 3. Conversion Rate Selection: Live RSS vs Manual Override (only shown when currency is chosen) */}
        {selectedOption && (
          <div className="rounded-lg border bg-muted/20 p-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <SlidersHorizontalIcon className="size-3 text-amber-500" />
                  <span>Override with Manual Rate</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {isManualOverride
                    ? "Applying custom treasury rate, ignoring live Google RSS fluctuations"
                    : "Save live Google RSS conversion rate (auto-syncs)"}
                </p>
              </div>
              <Switch
                checked={isManualOverride}
                onCheckedChange={setIsManualOverride}
              />
            </div>

            {/* Manual Rate Input */}
            {isManualOverride && (
              <div className="space-y-2 pt-2 border-t border-border/50">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 space-y-1">
                    <label className="text-xs font-medium text-foreground">
                      Manual Conversion Rate (1 USD =)
                    </label>
                    <Input
                      type="number"
                      step="0.000001"
                      min="0.0000001"
                      required={isManualOverride}
                      value={manualRate}
                      onChange={(e) => setManualRate(e.target.value)}
                      placeholder={rssRate.toString()}
                      className="h-8 font-mono text-xs bg-background"
                    />
                  </div>

                  <div className="w-24 space-y-1">
                    <label className="text-xs font-medium text-foreground">
                      Symbol
                    </label>
                    <Input
                      value={currencySymbol}
                      onChange={(e) => setCurrencySymbol(e.target.value)}
                      className="h-8 font-mono text-xs text-center bg-background"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Feed rate: {rssRate.toFixed(4)}</span>
                  <span className={cn(
                    "font-mono font-medium",
                    Number(spreadPercent) > 0 ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"
                  )}>
                    {Number(spreadPercent) >= 0 ? `+${spreadPercent}%` : `${spreadPercent}%`} deviation
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-muted-foreground">
                    Treasury Notes (Optional)
                  </label>
                  <Input
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Approved corporate hedging rate"
                    className="h-7 text-xs bg-background"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={isSubmitting || !selectedCode}
            className="gap-1.5"
          >
            <PlusIcon className="size-3.5" />
            <span>{isSubmitting ? "Adding..." : "Save Currency"}</span>
          </Button>
        </DialogFooter>
      </form>
    </>
  )
}
