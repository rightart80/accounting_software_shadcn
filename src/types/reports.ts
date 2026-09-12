// ---------------------------------------------------------------------------
// Types: Financial Statements & Valuation Reports
// ---------------------------------------------------------------------------

// ── 1. Balance Sheet Types ─────────────────────────────────────────────────
export type BalanceSheetSubItem = {
  id: string
  accountCode: string
  name: string
  currentPeriodAmount: number
  priorPeriodAmount: number
}

export type BalanceSheetLineItem = {
  id: string
  accountCode: string
  name: string
  category: "current_assets" | "non_current_assets" | "current_liabilities" | "non_current_liabilities" | "equity"
  currentPeriodAmount: number
  priorPeriodAmount: number
  subItems?: BalanceSheetSubItem[]
}

export type BalanceSheetData = {
  asOfDate: string
  priorDate: string
  currentAssets: BalanceSheetLineItem[]
  nonCurrentAssets: BalanceSheetLineItem[]
  totalCurrentAssets: number
  totalNonCurrentAssets: number
  totalAssets: number
  currentLiabilities: BalanceSheetLineItem[]
  nonCurrentLiabilities: BalanceSheetLineItem[]
  totalCurrentLiabilities: number
  totalNonCurrentLiabilities: number
  totalLiabilities: number
  equity: BalanceSheetLineItem[]
  totalEquity: number
  totalLiabilitiesAndEquity: number
  isBalanced: boolean
  workingCapital: number
  currentRatio: number
}

// ── 2. Profit & Loss (Income Statement) Types ──────────────────────────────
export type ProfitLossSubItem = {
  id: string
  accountCode: string
  name: string
  currentAmount: number
  priorAmount: number
}

export type ProfitLossLineItem = {
  id: string
  accountCode: string
  name: string
  category: "revenue" | "cogs" | "operating_expenses" | "other_income_expense" | "tax"
  currentAmount: number
  priorAmount: number
  percentageOfRevenue: number
  subItems?: ProfitLossSubItem[]
}

export type ProfitLossStatement = {
  periodName: string
  priorPeriodName: string
  grossRevenue: number
  cogs: number
  grossProfit: number
  grossMarginPercent: number
  operatingExpenses: number
  operatingIncome: number
  operatingMarginPercent: number
  otherIncomeExpense: number
  incomeBeforeTax: number
  incomeTaxExpense: number
  netIncome: number
  netMarginPercent: number
  revenueItems: ProfitLossLineItem[]
  cogsItems: ProfitLossLineItem[]
  operatingExpenseItems: ProfitLossLineItem[]
  otherItems: ProfitLossLineItem[]
}

// ── 3. Cash Flow Statement Types ───────────────────────────────────────────
export type CashFlowLineItem = {
  id: string
  name: string
  type: "operating" | "investing" | "financing"
  amount: number
  priorAmount: number
  direction: "inflow" | "outflow"
}

export type CashFlowStatement = {
  periodName: string
  netOperatingCash: number
  netInvestingCash: number
  netFinancingCash: number
  netChangeInCash: number
  beginningCash: number
  endingCash: number
  operatingActivities: CashFlowLineItem[]
  investingActivities: CashFlowLineItem[]
  financingActivities: CashFlowLineItem[]
}

// ── 4. Fixed Assets Valuation Report Types ─────────────────────────────────
export type FixedAssetValuationRow = {
  assetTag: string
  name: string
  classification: "property" | "movable"
  subCategory: string
  purchaseDate: string
  originalCost: number
  accumulatedDepreciation: number
  netBookValue: number
  fairMarketValue: number
  unrealizedAppreciation: number
  usefulLifeRemainingYears: number
  annualDepreciation: number
}

export type FixedAssetsValuationReport = {
  totalCostBasis: number
  totalAccumulatedDepreciation: number
  totalNetBookValue: number
  totalFairMarketValue: number
  totalUnrealizedAppreciation: number
  depreciationForecastNext5Years: Array<{
    year: string
    projectedExpense: number
    projectedEndingNBV: number
  }>
  items: FixedAssetValuationRow[]
}

// ── 5. Non-Fixed Assets Valuation Types ────────────────────────────────────
export type NonFixedAssetItem = {
  id: string
  name: string
  category: "cash_and_equivalents" | "accounts_receivable" | "inventory_stock" | "prepaids_short_term" | "marketable_securities"
  currentBalance: number
  priorBalance: number
  liquidityTier: "Immediate (T+0)" | "Liquid (T+2)" | "Short-Term (30-60d)" | "Operating Cycle"
  turnoverDaysOrYield: string
}

export type AccountsReceivableAgingBucket = {
  bucket: "Current (0-30d)" | "31-60 Days" | "61-90 Days" | "90+ Days"
  amount: number
  percentage: number
  riskLevel: "minimal" | "low" | "medium" | "elevated"
}

export type NonFixedAssetsValuationReport = {
  totalNonFixedAssets: number
  liquidCashTreasury: number
  netReceivables: number
  inventoryCarryingValue: number
  prepaidsAndAdvances: number
  currentRatio: number
  quickRatio: number
  cashRatio: number
  arAging: AccountsReceivableAgingBucket[]
  items: NonFixedAssetItem[]
}

// ── 6. Capital Gains & Losses (Capital G/L) Types ──────────────────────────
export type CapitalGLTransaction = {
  id: string
  assetName: string
  assetType: "Real Estate Property" | "Movable Fleet/Plant" | "Liquid Securities/Equities"
  acquisitionDate: string
  disposalDate: string
  holdingPeriodDays: number
  costBasis: number
  grossProceeds: number
  netGainLoss: number
  gainType: "short_term" | "long_term"
  applicableTaxRate: number
  estimatedTax: number
}

export type UnrealizedCapitalAsset = {
  assetName: string
  assetType: string
  inceptionBasis: number
  currentFairValue: number
  unrealizedGainLoss: number
  unrealizedGainLossPercent: number
}

export type CapitalGainsLossesReport = {
  totalRealizedGains: number
  totalRealizedLosses: number
  netRealizedGainLoss: number
  shortTermNetGain: number
  longTermNetGain: number
  totalUnrealizedGainLoss: number
  totalEstimatedTaxLiability: number
  transactions: CapitalGLTransaction[]
  unrealizedHoldings: UnrealizedCapitalAsset[]
}
