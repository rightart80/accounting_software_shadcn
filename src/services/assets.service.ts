import { fixedAssetsData, assetValuationHistoryData } from "@/data/seed"
import type { FixedAsset, AssetValuationHistoryPoint } from "@/types/assets"

export function getFixedAssets(): FixedAsset[] {
  return fixedAssetsData
}

export function getAssetValuationHistory(): AssetValuationHistoryPoint[] {
  return assetValuationHistoryData
}
