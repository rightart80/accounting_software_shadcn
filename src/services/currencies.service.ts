import { seedCurrencies, currencyCatalog } from "@/data/seed"
import type { CurrencyItem, CurrencyCatalogOption, RSSFeedStatus } from "@/types/currencies"

// In-memory store initialized with seedCurrencies
let currenciesStore: CurrencyItem[] = [...seedCurrencies]

export function getCurrencies(): CurrencyItem[] {
  return [...currenciesStore]
}

export function getCurrencyCatalog(): CurrencyCatalogOption[] {
  return currencyCatalog
}

export function getBaseCurrency(): CurrencyItem {
  return currenciesStore.find((c) => c.isDefaultBase) || currenciesStore[0]
}

export function getRSSFeedStatus(): RSSFeedStatus {
  return {
    sourceName: "Google Finance RSS Exchange Rates Feed",
    feedUrl: "https://finance.google.com/finance/converter?a=1&from=USD&to=ALL&format=rss",
    baseCurrency: "USD",
    lastChecked: new Date().toISOString(),
    status: "connected",
  }
}

/**
 * Simulates fetching live exchange rate for a given currency code against USD
 * from Google Finance RSS feed
 */
export async function fetchLiveRSSRateForCurrency(code: string): Promise<number> {
  // Simulate network round-trip for live RSS feed fetch
  await new Promise((resolve) => setTimeout(resolve, 350))

  const catalogEntry = currencyCatalog.find((c) => c.code.toUpperCase() === code.toUpperCase())
  if (!catalogEntry) {
    return 1.0
  }

  // Add realistic micro-fluctuation (+/- 0.05%) to simulate live market movements
  const jitter = 1 + (Math.random() * 0.002 - 0.001)
  const rate = Number((catalogEntry.feedRateAgainstUSD * jitter).toFixed(catalogEntry.decimalDigits > 2 ? catalogEntry.decimalDigits : 4))
  return rate
}

/**
 * Refreshes all currency live feed rates from Google RSS
 */
export async function refreshAllFeedRates(): Promise<CurrencyItem[]> {
  await new Promise((resolve) => setTimeout(resolve, 600))
  const now = new Date().toISOString()

  currenciesStore = currenciesStore.map((curr) => {
    if (curr.isDefaultBase) return curr

    const catalogEntry = currencyCatalog.find((c) => c.code === curr.code)
    const baseRate = catalogEntry ? catalogEntry.feedRateAgainstUSD : curr.rssFeedRate
    const jitter = 1 + (Math.random() * 0.003 - 0.0015)
    const newFeedRate = Number((baseRate * jitter).toFixed(curr.decimalDigits > 2 ? curr.decimalDigits : 4))
    const changeDelta = Number(((newFeedRate - curr.rssFeedRate) / curr.rssFeedRate * 100).toFixed(2))

    const isOverridden = curr.rateSource === "manual_override"
    const effectiveRate = isOverridden && curr.manualRate !== undefined ? curr.manualRate : newFeedRate

    return {
      ...curr,
      rssFeedRate: newFeedRate,
      rateAgainstBase: effectiveRate,
      change24h: Number((curr.change24h + changeDelta).toFixed(2)),
      lastSyncedAt: now,
    }
  })

  return [...currenciesStore]
}

export function addCurrency(payload: Omit<CurrencyItem, "id" | "lastSyncedAt">): CurrencyItem {
  const newCurrency: CurrencyItem = {
    ...payload,
    id: `curr-${payload.code.toLowerCase()}-${Date.now()}`,
    lastSyncedAt: new Date().toISOString(),
  }

  // Ensure default base currency (USD) is always pinned in the #1 position
  const baseCurrency = currenciesStore.find((c) => c.isDefaultBase)
  const others = currenciesStore.filter((c) => !c.isDefaultBase)

  currenciesStore = baseCurrency
    ? [baseCurrency, ...others, newCurrency]
    : [...currenciesStore, newCurrency]

  return newCurrency
}

export function updateCurrency(id: string, updates: Partial<CurrencyItem>): CurrencyItem | null {
  const idx = currenciesStore.findIndex((c) => c.id === id)
  if (idx === -1) return null

  const existing = currenciesStore[idx]
  const updated: CurrencyItem = {
    ...existing,
    ...updates,
    lastSyncedAt: new Date().toISOString(),
  }

  // Ensure effective rate matches source
  if (updated.rateSource === "manual_override" && updated.manualRate !== undefined) {
    updated.rateAgainstBase = updated.manualRate
  } else if (updated.rateSource === "rss_feed") {
    updated.rateAgainstBase = updated.rssFeedRate
  }

  currenciesStore[idx] = updated
  return updated
}

export function toggleCurrencyOverride(id: string, enableOverride: boolean, manualRate?: number): CurrencyItem | null {
  const idx = currenciesStore.findIndex((c) => c.id === id)
  if (idx === -1) return null

  const existing = currenciesStore[idx]
  const newSource = enableOverride ? "manual_override" : "rss_feed"
  const overrideRate = manualRate !== undefined ? manualRate : (existing.manualRate ?? existing.rssFeedRate)

  const updated: CurrencyItem = {
    ...existing,
    rateSource: newSource,
    manualRate: enableOverride ? overrideRate : existing.manualRate,
    rateAgainstBase: enableOverride ? overrideRate : existing.rssFeedRate,
    lastSyncedAt: new Date().toISOString(),
  }

  currenciesStore[idx] = updated
  return updated
}

export function deleteCurrency(id: string): boolean {
  const target = currenciesStore.find((c) => c.id === id)
  if (!target || target.isDefaultBase) {
    return false // Cannot delete default base currency
  }

  currenciesStore = currenciesStore.filter((c) => c.id !== id)
  return true
}
