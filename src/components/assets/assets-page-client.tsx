"use client"

import { useMemo, useState } from "react"
import {
  LayersIcon,
  Building2Icon,
  TruckIcon,
  SearchIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getFixedAssets } from "@/services/assets.service"
import type { FixedAsset, AssetClassification } from "@/types/assets"
import { AssetMetricsSummary } from "@/components/assets/asset-metrics-summary"
import { AssetAllocationChart } from "@/components/assets/asset-allocation-chart"
import { AssetValuationChart } from "@/components/assets/asset-valuation-chart"
import { AssetGrid } from "@/components/assets/asset-grid"
import { AssetDetailDialog } from "@/components/assets/asset-detail-dialog"
import { AddAssetDialog } from "@/components/assets/add-asset-dialog"
import { EmptyState } from "@/components/empty-state"

export function AssetsPageClient() {
  const [assets, setAssets] = useState<FixedAsset[]>(getFixedAssets())
  const [classification, setClassification] = useState<AssetClassification | "all">("all")
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedAsset, setSelectedAsset] = useState<FixedAsset | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  // 1. Classification Filtering: Drives the entire portfolio view
  const classificationFiltered = useMemo(() => {
    if (classification === "all") return assets
    return assets.filter((a) => a.classification === classification)
  }, [assets, classification])

  // Counts for tabs
  const totalCount = assets.length
  const propertyCount = assets.filter((a) => a.classification === "property").length
  const movableCount = assets.filter((a) => a.classification === "movable").length

  // 2. Search & Status Filtering
  const displayAssets = useMemo(() => {
    return classificationFiltered.filter((a) => {
      const q = search.toLowerCase()
      const matchesSearch =
        q === "" ||
        a.name.toLowerCase().includes(q) ||
        a.assetTag.toLowerCase().includes(q) ||
        a.subCategory.toLowerCase().includes(q) ||
        a.location.toLowerCase().includes(q) ||
        a.assignedCustodian.toLowerCase().includes(q)

      const matchesStatus =
        statusFilter === "all" || a.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [classificationFiltered, search, statusFilter])

  function handleSelectAsset(asset: FixedAsset) {
    setSelectedAsset(asset)
    setDialogOpen(true)
  }

  function handleAddAsset(newAsset: FixedAsset) {
    setAssets((prev) => [newAsset, ...prev])
  }

  return (
    <div className="flex flex-1 flex-col gap-5 p-4 pt-0">
      {/* Header with Title and Registration Action */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Fixed Assets & Property Register</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Capital portfolio management for real estate properties, corporate facilities, transport fleet, and industrial plant machinery.
          </p>
        </div>

        <AddAssetDialog
          onAdd={handleAddAsset}
          defaultClassification={classification === "all" ? "property" : classification}
        />
      </div>

      {/* Primary Classification Tabs (All vs Properties vs Moving Assets) */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex rounded-xl bg-muted p-1 text-xs">
          <button
            type="button"
            onClick={() => setClassification("all")}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3.5 py-1.5 font-medium transition-all",
              classification === "all"
                ? "bg-background text-foreground shadow-sm font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <LayersIcon className="size-4" />
            <span>All Fixed Assets</span>
            <span className="rounded-full bg-muted-foreground/15 px-1.5 py-0.2 text-[10px] tabular-nums font-mono">
              {totalCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setClassification("property")}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3.5 py-1.5 font-medium transition-all",
              classification === "property"
                ? "bg-background text-blue-600 dark:text-blue-400 shadow-sm font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Building2Icon className="size-4" />
            <span>Properties & Real Estate</span>
            <span className="rounded-full bg-blue-500/15 px-1.5 py-0.2 text-[10px] tabular-nums font-mono text-blue-600 dark:text-blue-400">
              {propertyCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setClassification("movable")}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3.5 py-1.5 font-medium transition-all",
              classification === "movable"
                ? "bg-background text-teal-600 dark:text-teal-400 shadow-sm font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <TruckIcon className="size-4" />
            <span>Moving Assets & Fleet</span>
            <span className="rounded-full bg-teal-500/15 px-1.5 py-0.2 text-[10px] tabular-nums font-mono text-teal-600 dark:text-teal-400">
              {movableCount}
            </span>
          </button>
        </div>

        {/* Filter Controls: Search & Status Select */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search tag, name, location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-8 text-xs"
            />
          </div>

          <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val ?? "all")}>
            <SelectTrigger className="h-9 w-36 text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="in_service">In Service</SelectItem>
              <SelectItem value="under_maintenance">Maintenance</SelectItem>
              <SelectItem value="leased">Leased Out</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Dynamic Metrics Summary (Updates according to selected classification) */}
      <AssetMetricsSummary
        assets={classificationFiltered}
        classification={classification}
      />

      {/* Analytical Charts Row (Allocation Donut & Valuation Growth Area) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <AssetAllocationChart
            assets={classificationFiltered}
            classification={classification}
          />
        </div>
        <div className="lg:col-span-7">
          <AssetValuationChart classification={classification} />
        </div>
      </div>

      {/* Asset Cards Gallery */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold">
              {classification === "property"
                ? "Registered Real Estate Properties"
                : classification === "movable"
                ? "Registered Moving & Fleet Equipment"
                : "All Enterprise Capital Assets"}
            </h2>
            <span className="text-xs text-muted-foreground">
              ({displayAssets.length} showing)
            </span>
          </div>
        </div>

        {displayAssets.length === 0 ? (
          <EmptyState
            variant="filter"
            title="No fixed assets match criteria"
            description="Try modifying search keywords or switching asset classification tabs."
          />
        ) : (
          <AssetGrid
            assets={displayAssets}
            onSelect={handleSelectAsset}
            cardsPerPage={6}
          />
        )}
      </div>

      {/* Asset Detail Inspection Modal */}
      <AssetDetailDialog
        asset={selectedAsset}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  )
}
