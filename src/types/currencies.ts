export type RateSource = "rss_feed" | "manual_override"

export interface CurrencyItem {
  id: string
  code: string // e.g. "USD", "EUR", "GBP", "JPY"
  name: string // e.g. "US Dollar", "Euro", "British Pound"
  symbol: string // e.g. "$", "€", "£", "¥"
  flag: string // Flag emoji or country code representation
  isDefaultBase: boolean // true for base currency ($ USD)
  rateAgainstBase: number // effective rate: 1 USD = X Currency
  rssFeedRate: number // the rate fetched from Google RSS feed
  manualRate?: number // custom override rate if user chose to override
  rateSource: RateSource // "rss_feed" | "manual_override"
  change24h: number // percentage e.g. +0.42, -0.18
  lastSyncedAt: string // ISO timestamp or friendly string
  status: "active" | "inactive"
  decimalDigits: number // 2 or 0 (JPY)
  notes?: string
}

export interface CurrencyCatalogOption {
  code: string
  name: string
  symbol: string
  flag: string
  feedRateAgainstUSD: number
  decimalDigits: number
  category?: "Major" | "Regional" | "Emerging" | "Crypto" | "World" | string
}

export interface RSSFeedStatus {
  sourceName: string
  feedUrl: string
  baseCurrency: string
  lastChecked: string
  status: "connected" | "syncing" | "error"
}
