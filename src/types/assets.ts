export type AssetClassification = "property" | "movable"

export type AssetStatus = "in_service" | "under_maintenance" | "disposed" | "leased"

export type AssetCondition = "excellent" | "good" | "fair" | "needs_repair"

export type DepreciationMethod = "straight_line" | "declining_balance"

export type FixedAsset = {
  id: string
  assetTag: string
  name: string
  classification: AssetClassification // "property" (Immovable) | "movable" (Moving / Fleet / Equipment)
  subCategory: string
  purchaseDate: string
  acquisitionCost: number
  currentValuation: number
  salvageValue: number
  usefulLifeYears: number
  depreciationMethod: DepreciationMethod
  accumulatedDepreciation: number
  annualDepreciationRate: number
  location: string
  assignedCustodian: string
  status: AssetStatus
  condition: AssetCondition
  identificationNumber: string // Cadastral Deed # for properties, VIN / Serial # for moving assets
  insurancePolicyNumber: string
  notes?: string
  image?: string
  color: string
}

export type AssetValuationHistoryPoint = {
  year: string
  propertyValue: number
  movableValue: number
  totalCostBasis: number
}

export type AssetMetrics = {
  totalBookValue: number
  totalAcquisitionCost: number
  totalAccumulatedDepreciation: number
  totalAssetCount: number
  propertyCount: number
  movableCount: number
  propertyValue: number
  movableValue: number
}
