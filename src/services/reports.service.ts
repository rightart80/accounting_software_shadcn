import {
  balanceSheetData,
  profitLossData,
  cashFlowData,
  fixedAssetsValuationReportData,
  nonFixedAssetsValuationData,
  capitalGainsLossesData,
} from "@/data/seed"
import type {
  BalanceSheetData,
  ProfitLossStatement,
  CashFlowStatement,
  FixedAssetsValuationReport,
  NonFixedAssetsValuationReport,
  CapitalGainsLossesReport,
} from "@/types/reports"

export function getBalanceSheet(): BalanceSheetData {
  return balanceSheetData
}

export function getProfitLossStatement(): ProfitLossStatement {
  return profitLossData
}

export function getCashFlowStatement(): CashFlowStatement {
  return cashFlowData
}

export function getFixedAssetsValuationReport(): FixedAssetsValuationReport {
  return fixedAssetsValuationReportData
}

export function getNonFixedAssetsValuationReport(): NonFixedAssetsValuationReport {
  return nonFixedAssetsValuationData
}

export function getCapitalGainsLossesReport(): CapitalGainsLossesReport {
  return capitalGainsLossesData
}
