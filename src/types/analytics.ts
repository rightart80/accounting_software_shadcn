export type SpendingHeatmapDay = { date: string; amount: number }

export type CategoryBreakdown = {
  category: string
  amount: number
  color: string
  subcategories: { name: string; amount: number }[]
}

export type RecurringCharge = {
  id: string
  merchant: string
  logo: string
  amount: number
  frequency: "monthly" | "yearly"
  nextDate: string
  status: "wanted" | "review" | "unset"
  category: string
}

export type MonthComparison = { category: string; thisMonth: number; lastMonth: number }

export type AiInsight = {
  id: string
  text: string
  trend: "up" | "down" | "neutral"
  percentChange: number
  category: string
}

export type HealthFactor = {
  id: string
  label: string
  score: number
  maxScore: number
  status: "excellent" | "good" | "fair" | "poor"
  description: string
}
