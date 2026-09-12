import { holdings, watchlistItems, portfolioHistory } from "@/data/seed"
import type { Holding, WatchlistItem, PortfolioHistoryPoint } from "@/types/investments"

export function getHoldings(): Holding[] {
  return holdings
}

export function getWatchlistItems(): WatchlistItem[] {
  return watchlistItems
}

export function getPortfolioHistory(): PortfolioHistoryPoint[] {
  return portfolioHistory
}
