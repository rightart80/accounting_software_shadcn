"use client"

import { useState } from "react"
import {
  CoinsIcon,
  PlusIcon,
  RssIcon,
  SlidersHorizontalIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  getCurrencies,
  refreshAllFeedRates,
  addCurrency,
  updateCurrency,
  toggleCurrencyOverride,
  deleteCurrency,
} from "@/services/currencies.service"
import type { CurrencyItem } from "@/types/currencies"
import { CurrencyRssBanner } from "./currency-rss-banner"
import { CurrencyCardsGrid } from "./currency-cards-grid"
import { CurrencyTable } from "./currency-table"
import { AddCurrencyDialog } from "./add-currency-dialog"
import { EditCurrencyDialog } from "./edit-currency-dialog"

export function CurrenciesPageClient() {
  const [currencies, setCurrencies] = useState<CurrencyItem[]>(() => getCurrencies())
  const [isSyncing, setIsSyncing] = useState<boolean>(false)
  const [lastSynced, setLastSynced] = useState<string>(() => new Date().toISOString())

  // Modal dialog states
  const [addDialogOpen, setAddDialogOpen] = useState<boolean>(false)
  const [editingCurrency, setEditingCurrency] = useState<CurrencyItem | null>(null)

  // Sync all rates with Google RSS feed
  const handleSyncAll = async () => {
    setIsSyncing(true)
    try {
      const refreshed = await refreshAllFeedRates()
      setCurrencies(refreshed)
      setLastSynced(new Date().toISOString())
    } finally {
      setIsSyncing(false)
    }
  }

  // Handle adding a new currency
  const handleAddCurrency = (payload: Omit<CurrencyItem, "id" | "lastSyncedAt">) => {
    addCurrency(payload)
    setCurrencies(getCurrencies())
  }

  // Toggle between RSS feed and Manual Override
  const handleToggleOverride = (id: string) => {
    const target = currencies.find((c) => c.id === id)
    if (!target || target.isDefaultBase) return

    const willBeOverride = target.rateSource !== "manual_override"
    toggleCurrencyOverride(id, willBeOverride)
    setCurrencies(getCurrencies())
  }

  // Save edits from edit dialog
  const handleEditSave = (id: string, updates: Partial<CurrencyItem>) => {
    updateCurrency(id, updates)
    setCurrencies(getCurrencies())
  }

  // Delete currency
  const handleDeleteCurrency = (id: string) => {
    deleteCurrency(id)
    setCurrencies(getCurrencies())
  }

  const existingCodes = currencies.map((c) => c.code)
  const totalOverridden = currencies.filter((c) => c.rateSource === "manual_override").length
  const totalRss = currencies.filter((c) => c.rateSource === "rss_feed" && !c.isDefaultBase).length

  return (
    <div className="flex flex-col gap-5">
      {/* Top Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <CoinsIcon className="size-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Currencies & Conversion Rates
              </h1>
              <p className="text-xs text-muted-foreground">
                Manage global account currencies, live Google RSS exchange rates, and manual corporate overrides
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="hidden sm:inline-flex gap-1 border-border text-xs">
            <RssIcon className="size-3 text-emerald-500" />
            <span>{totalRss} Live Feed</span>
          </Badge>
          {totalOverridden > 0 && (
            <Badge variant="outline" className="hidden sm:inline-flex gap-1 border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs">
              <SlidersHorizontalIcon className="size-3" />
              <span>{totalOverridden} Overridden</span>
            </Badge>
          )}

          <Button
            size="sm"
            onClick={() => setAddDialogOpen(true)}
            className="gap-1.5 text-xs font-semibold"
          >
            <PlusIcon className="size-3.5" />
            <span>Add Currency</span>
          </Button>
        </div>
      </div>

      {/* 1. Google RSS Feed Live Status */}
      <CurrencyRssBanner
        onSyncAll={handleSyncAll}
        isSyncing={isSyncing}
        lastSynced={lastSynced}
      />

      {/* 2. Top Currency Cards Grid (Max 6 per row, 2 rows max, with Add Currency card button) */}
      <CurrencyCardsGrid
        currencies={currencies}
        onOpenAddDialog={() => setAddDialogOpen(true)}
        onToggleOverride={handleToggleOverride}
        onEdit={(curr) => setEditingCurrency(curr)}
      />

      {/* 3. Comprehensive Currency Registry & Conversion Table Below */}
      <CurrencyTable
        currencies={currencies}
        onToggleOverride={handleToggleOverride}
        onEdit={(curr) => setEditingCurrency(curr)}
        onDelete={handleDeleteCurrency}
      />

      {/* Add Currency Dialog */}
      <AddCurrencyDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        existingCodes={existingCodes}
        onAdd={handleAddCurrency}
      />

      {/* Edit Currency Dialog */}
      <EditCurrencyDialog
        currency={editingCurrency}
        open={editingCurrency !== null}
        onOpenChange={(open) => !open && setEditingCurrency(null)}
        onSave={handleEditSave}
      />
    </div>
  )
}
