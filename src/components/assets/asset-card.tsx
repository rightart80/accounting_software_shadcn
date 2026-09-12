"use client"

import {
  Building2Icon,
  TruckIcon,
  MapPinIcon,
  CalendarDaysIcon,
  TrendingUpIcon,
  TrendingDownIcon,
} from "lucide-react"
import { motion } from "motion/react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import type { FixedAsset } from "@/types/assets"

interface AssetCardProps {
  asset: FixedAsset
  index: number
  onSelect: (asset: FixedAsset) => void
}

const fmt = (n: number) =>
  `$${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(n))}`

const statusBadgeConfig: Record<
  FixedAsset["status"],
  { className: string; label: string }
> = {
  in_service: {
    className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    label: "In Service",
  },
  under_maintenance: {
    className: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
    label: "Maintenance",
  },
  disposed: {
    className: "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400",
    label: "Disposed",
  },
  leased: {
    className: "border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400",
    label: "Leased Out",
  },
}

export function AssetCard({ asset, index, onSelect }: AssetCardProps) {
  const isProperty = asset.classification === "property"
  const badge = statusBadgeConfig[asset.status] ?? {
    className: "border-muted text-muted-foreground",
    label: asset.status,
  }

  const deprProgress = Math.min(
    100,
    Math.round((asset.accumulatedDepreciation / (asset.acquisitionCost || 1)) * 100)
  )
  const isValueAppreciated = asset.currentValuation >= asset.acquisitionCost

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      onClick={() => onSelect(asset)}
      className="group relative cursor-pointer overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 transition-shadow hover:shadow-md"
    >
      {/* Accent left border */}
      <div className={cn("absolute inset-y-0 left-0 w-1", asset.color)} />

      <div className="p-3.5 pl-4">
        {/* Header: Tag + Classification Badge + Status */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] px-1.5 py-0 font-medium",
                isProperty
                  ? "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400"
                  : "border-teal-500/30 bg-teal-500/10 text-teal-600 dark:text-teal-400"
              )}
            >
              {isProperty ? (
                <Building2Icon className="mr-1 size-3" />
              ) : (
                <TruckIcon className="mr-1 size-3" />
              )}
              {isProperty ? "Property" : "Moving Asset"}
            </Badge>
            <span className="font-mono text-[11px] text-muted-foreground">
              {asset.assetTag}
            </span>
          </div>

          <Badge
            variant="outline"
            className={cn("text-[10px] px-1.5 py-0 capitalize font-medium", badge.className)}
          >
            {badge.label}
          </Badge>
        </div>

        {/* Name & SubCategory */}
        <div className="mt-2.5">
          <p className="text-sm font-semibold leading-tight truncate group-hover:text-primary transition-colors">
            {asset.name}
          </p>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className="truncate">{asset.subCategory}</span>
            <span>•</span>
            <span className="truncate">{asset.assignedCustodian}</span>
          </div>
        </div>

        {/* Current Valuation & Cost */}
        <div className="mt-3 flex items-baseline justify-between border-t border-border/50 pt-2.5">
          <div>
            <p className="text-[10px] text-muted-foreground">Assessed Valuation</p>
            <p className="text-base font-bold tracking-tight text-foreground">
              {fmt(asset.currentValuation)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground">Original Basis</p>
            <p className="text-xs font-medium tabular-nums text-muted-foreground">
              {fmt(asset.acquisitionCost)}
            </p>
          </div>
        </div>

        {/* Depreciation / Appreciation Meter */}
        <div className="mt-2.5">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
            <span>Depreciation</span>
            <span className="tabular-nums font-medium">
              {deprProgress}% expensed ({fmt(asset.accumulatedDepreciation)})
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                deprProgress > 75
                  ? "bg-rose-500"
                  : deprProgress > 40
                  ? "bg-amber-500"
                  : "bg-blue-500"
              )}
              style={{ width: `${deprProgress}%` }}
            />
          </div>
        </div>

        {/* Footer: Location & Purchase Date */}
        <div className="mt-3 flex items-center justify-between text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1 truncate max-w-[160px]">
            <MapPinIcon className="size-3 shrink-0" />
            <span className="truncate">{asset.location}</span>
          </span>

          <span className="flex items-center gap-1 shrink-0">
            <CalendarDaysIcon className="size-3" />
            <span>{asset.purchaseDate}</span>
          </span>
        </div>
      </div>
    </motion.div>
  )
}
