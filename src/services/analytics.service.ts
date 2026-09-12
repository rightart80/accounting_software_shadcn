import {
  spendingHeatmapData,
  categoryBreakdowns,
  recurringCharges,
  monthComparisons,
  aiInsights,
} from "@/data/seed"
import type {
  SpendingHeatmapDay,
  CategoryBreakdown,
  RecurringCharge,
  MonthComparison,
  AiInsight,
} from "@/types/analytics"

export function getSpendingHeatmapData(): SpendingHeatmapDay[] {
  return spendingHeatmapData
}

export function getCategoryBreakdowns(): CategoryBreakdown[] {
  return categoryBreakdowns
}

export function getRecurringCharges(): RecurringCharge[] {
  return recurringCharges
}

export function getMonthComparisons(): MonthComparison[] {
  return monthComparisons
}

export function getAiInsights(): AiInsight[] {
  return aiInsights
}
