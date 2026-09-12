"use client"

import {
  Building2Icon,
  TruckIcon,
  MapPinIcon,
  UserCheckIcon,
  CalendarIcon,
  ShieldAlertIcon,
  FileTextIcon,
  HashIcon,
} from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import type { FixedAsset } from "@/types/assets"

interface AssetDetailDialogProps {
  asset: FixedAsset | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const fmt = (n: number) =>
  `$${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(n))}`

export function AssetDetailDialog({
  asset,
  open,
  onOpenChange,
}: AssetDetailDialogProps) {
  if (!asset) return null

  const isProperty = asset.classification === "property"
  const netBookValue = Math.max(0, asset.acquisitionCost - asset.accumulatedDepreciation)
  const deprPct = ((asset.accumulatedDepreciation / (asset.acquisitionCost || 1)) * 100).toFixed(1)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={
                isProperty
                  ? "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400"
                  : "border-teal-500/30 bg-teal-500/10 text-teal-600 dark:text-teal-400"
              }
            >
              {isProperty ? (
                <Building2Icon className="mr-1 size-3" />
              ) : (
                <TruckIcon className="mr-1 size-3" />
              )}
              {isProperty ? "Property / Real Estate" : "Moving / Equipment Asset"}
            </Badge>
            <span className="font-mono text-xs text-muted-foreground">
              {asset.assetTag}
            </span>
          </div>
          <DialogTitle className="text-xl font-bold mt-1.5">
            {asset.name}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2 text-xs">
            <MapPinIcon className="size-3.5 text-muted-foreground" />
            {asset.location} • {asset.subCategory}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2">
          {/* Valuation Overview */}
          <div className="rounded-xl border bg-muted/40 p-3.5">
            <span className="text-xs text-muted-foreground">Current Market Valuation</span>
            <p className="tabular-nums text-2xl font-bold text-foreground">
              {fmt(asset.currentValuation)}
            </p>
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Original Cost: {fmt(asset.acquisitionCost)}</span>
              <span className={asset.currentValuation >= asset.acquisitionCost ? "text-emerald-500 font-medium" : "text-rose-500 font-medium"}>
                {asset.currentValuation >= asset.acquisitionCost ? "+" : ""}
                {fmt(asset.currentValuation - asset.acquisitionCost)}
              </span>
            </div>
          </div>

          {/* Book Value & Depreciation */}
          <div className="rounded-xl border bg-muted/40 p-3.5">
            <span className="text-xs text-muted-foreground">Accounting Net Book Value</span>
            <p className="tabular-nums text-2xl font-bold text-foreground">
              {fmt(netBookValue)}
            </p>
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Depreciation: {deprPct}%</span>
              <span>Expensed: {fmt(asset.accumulatedDepreciation)}</span>
            </div>
          </div>
        </div>

        {/* Accounting Specs Grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 text-xs border rounded-xl p-3.5">
          <div>
            <span className="text-muted-foreground">Depreciation Method</span>
            <p className="font-medium capitalize mt-0.5">
              {asset.depreciationMethod.replace("_", " ")}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Useful Lifespan</span>
            <p className="font-medium mt-0.5">{asset.usefulLifeYears} Years</p>
          </div>
          <div>
            <span className="text-muted-foreground">Annual Expense</span>
            <p className="font-medium mt-0.5">{fmt(asset.annualDepreciationRate)}/yr</p>
          </div>
          <div>
            <span className="text-muted-foreground">Salvage Value</span>
            <p className="font-medium mt-0.5">{fmt(asset.salvageValue)}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Physical Condition</span>
            <p className="font-medium capitalize mt-0.5">{asset.condition}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Operational Status</span>
            <p className="font-medium capitalize mt-0.5">
              {asset.status.replace("_", " ")}
            </p>
          </div>
        </div>

        {/* Legal & Governance */}
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <HashIcon className="size-3.5" />
            <span className="font-medium text-foreground">
              {isProperty ? "Cadastral Deed / Parcel #:" : "VIN / Serial Number:"}
            </span>
            <span className="font-mono">{asset.identificationNumber}</span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <ShieldAlertIcon className="size-3.5" />
            <span className="font-medium text-foreground">Insurance Policy:</span>
            <span className="font-mono">{asset.insurancePolicyNumber}</span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <UserCheckIcon className="size-3.5" />
            <span className="font-medium text-foreground">Assigned Custodian:</span>
            <span>{asset.assignedCustodian}</span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <CalendarIcon className="size-3.5" />
            <span className="font-medium text-foreground">Capitalization Date:</span>
            <span>{asset.purchaseDate}</span>
          </div>

          {asset.notes && (
            <div className="mt-2 rounded-lg bg-muted p-2.5 text-muted-foreground flex items-start gap-2">
              <FileTextIcon className="size-3.5 mt-0.5 shrink-0" />
              <span>{asset.notes}</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
