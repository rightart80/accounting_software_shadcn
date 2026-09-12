"use client"

import * as React from "react"
import {
  TrendingUpIcon,
  TrendingDownIcon,
  LayersIcon,
  BriefcaseIcon,
  TrendingUpIcon as InvestmentIcon,
  BuildingIcon,
  BoxesIcon,
  LineChartIcon,
  GlobeIcon,
  FilterIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
} from "lucide-react"
import { motion, AnimatePresence } from "motion/react"

import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export interface IncomeSubType {
  id: string
  name: string
  superType: string
  superTypeColor: string
  amount: number
  change: number
  changePercent: number
  count: number
  sharePercent: number
  customIcon?: React.ElementType
  customColor?: string
}

export interface IncomeSuperCategory {
  id: string
  name: string
  shortLabel: string
  description: string
  totalAmount: number
  change: number
  changePercent: number
  color: string
  icon: React.ElementType
  subTypes: {
    id: string
    name: string
    amount: number
    change: number
    changePercent: number
    count: number
    sharePercent: number
  }[]
}

import { getIncomeCategories } from "@/services/income.service"

export const incomeSuperCategories = getIncomeCategories()

// Flatten all sub types with their parent super type info
export const allSubTypes: IncomeSubType[] = incomeSuperCategories.flatMap((superCat) =>
  superCat.subTypes.map((sub) => ({
    ...sub,
    superType: superCat.name,
    superTypeColor: superCat.color,
  }))
)

const fmt = (n: number, currency = "$") =>
  `${currency}${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(n))}`

interface IncomeCategoryCardsProps {
  selectedSuperType: string
  onSelectSuperType: (superTypeName: string) => void
  selectedSubType?: string | null
  onSelectSubType?: (subTypeName: string | null) => void
  actionSlot?: React.ReactNode
  cardsPerPage?: number
}

// Available Icon Options for Custom Categories
const ICON_OPTIONS = [
  { name: "Briefcase", icon: BriefcaseIcon },
  { name: "Building", icon: BuildingIcon },
  { name: "Globe", icon: GlobeIcon },
  { name: "Layers", icon: LayersIcon },
  { name: "Boxes", icon: BoxesIcon },
  { name: "Investment", icon: InvestmentIcon },
  { name: "LineChart", icon: LineChartIcon },
]

const COLOR_OPTIONS = [
  "bg-emerald-600",
  "bg-blue-600",
  "bg-amber-600",
  "bg-purple-600",
  "bg-indigo-600",
  "bg-rose-600",
  "bg-slate-600",
]

export function IncomeCategoryCards({
  selectedSuperType,
  onSelectSuperType,
  selectedSubType,
  onSelectSubType,
  actionSlot,
  cardsPerPage = 8,
}: IncomeCategoryCardsProps) {
  const [page, setPage] = React.useState(0)
  const [direction, setDirection] = React.useState(0)
  
  // Custom Category State
  const [customSubTypes, setCustomSubTypes] = React.useState<IncomeSubType[]>([])
  const [isAddOpen, setIsAddOpen] = React.useState(false)
  const [newCatName, setNewCatName] = React.useState("")
  const [newCatSuperType, setNewCatSuperType] = React.useState(selectedSuperType === "all" ? incomeSuperCategories[0].name : selectedSuperType)
  const [newCatIcon, setNewCatIcon] = React.useState<string>("Briefcase")
  const [newCatColor, setNewCatColor] = React.useState<string>("bg-emerald-600")

  // Sync newCatSuperType when selectedSuperType changes
  React.useEffect(() => {
    if (selectedSuperType !== "all") {
      setNewCatSuperType(selectedSuperType)
    }
  }, [selectedSuperType])

  const handleAddCategory = () => {
    if (!newCatName.trim() || !newCatSuperType) return

    const selectedIcon = ICON_OPTIONS.find((opt) => opt.name === newCatIcon)?.icon || BriefcaseIcon

    const newCategory: IncomeSubType = {
      id: `custom-${Date.now()}`,
      name: newCatName.trim(),
      superType: newCatSuperType,
      superTypeColor: newCatColor,
      amount: 0,
      change: 0,
      changePercent: 0,
      count: 0,
      sharePercent: 0,
      customIcon: selectedIcon,
      customColor: newCatColor,
    }

    setCustomSubTypes((prev) => [...prev, newCategory])
    setNewCatName("")
    setIsAddOpen(false)
  }

  // Reset page when super type filter changes
  React.useEffect(() => {
    setPage(0)
    setDirection(0)
  }, [selectedSuperType])

  // Determine cards to display based on super type
  const availableCards = React.useMemo(() => {
    const combined = [...allSubTypes, ...customSubTypes]
    let filtered = combined
    if (selectedSuperType !== "all") {
      filtered = combined.filter(
        (sub) =>
          sub.superType.toLowerCase() === selectedSuperType.toLowerCase() ||
          (selectedSuperType.includes("Property") && sub.superType.includes("Property")) ||
          (selectedSuperType.includes("Asset") && sub.superType.includes("Assets")) ||
          (selectedSuperType.includes("Securit") && sub.superType.includes("Securities")) ||
          (selectedSuperType.includes("Foreign") && sub.superType.includes("Foreign")) ||
          (selectedSuperType.includes("Business") && sub.superType.includes("Business")) ||
          (selectedSuperType.includes("Invest") && sub.superType.includes("Investment"))
      )
    }
    // Append the "Add Category" pseudo-item so it participates in pagination limits
    return [...filtered, { isAddButton: true, id: "add-category-btn" }]
  }, [selectedSuperType, customSubTypes])

  const totalPages = Math.ceil(availableCards.length / cardsPerPage)
  const start = page * cardsPerPage
  const currentCards = availableCards.slice(start, start + cardsPerPage)

  const canGoNext = page < totalPages - 1
  const canGoBack = page > 0

  const goNext = () => {
    if (!canGoNext) return
    setDirection(1)
    setPage((p) => p + 1)
  }

  const goBack = () => {
    if (!canGoBack) return
    setDirection(-1)
    setPage((p) => p - 1)
  }

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 30 : -30, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -30 : 30, opacity: 0 }),
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Category Navigation Toolbar */}
      <div className="flex flex-col sm:flex-row gap-2.5 sm:items-center justify-between">
        {/* Mobile Super Type Select */}
        <div className="sm:hidden w-full">
          <Select
            value={selectedSuperType}
            onValueChange={(val) => val && onSelectSuperType(val)}
          >
            <SelectTrigger className="h-8 text-xs w-full">
              <FilterIcon className="size-3 mr-1 text-muted-foreground" />
              <SelectValue placeholder="Super Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">
                All Super Types ({allSubTypes.length} cards)
              </SelectItem>
              {incomeSuperCategories.map((cat) => (
                <SelectItem key={cat.id} value={cat.name} className="text-xs">
                  {cat.name} ({cat.subTypes.length})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Desktop / Tablet Responsive Category Tabs */}
        <div className="hidden sm:flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 no-scrollbar border-b border-border/50">
          <button
            onClick={() => onSelectSuperType("all")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors shrink-0",
              selectedSuperType === "all"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <LayersIcon className="size-3" />
            <span>All Categories</span>
            <span
              className={cn(
                "rounded-full px-1.5 py-0.2 text-[10px] tabular-nums font-mono",
                selectedSuperType === "all"
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : "bg-background text-muted-foreground"
              )}
            >
              {allSubTypes.length}
            </span>
          </button>

          {incomeSuperCategories.map((cat) => {
            const isActive =
              selectedSuperType === cat.name ||
              (selectedSuperType !== "all" &&
                cat.name.toLowerCase().includes(selectedSuperType.toLowerCase()))
            return (
              <button
                key={cat.id}
                onClick={() => onSelectSuperType(cat.name)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors shrink-0",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <cat.icon className="size-3" />
                <span>{cat.shortLabel}</span>
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.2 text-[10px] tabular-nums font-mono",
                    isActive
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-background text-muted-foreground"
                  )}
                >
                  {cat.subTypes.length}
                </span>
              </button>
            )
          })}
        </div>

        {actionSlot && <div className="shrink-0">{actionSlot}</div>}
      </div>

      {/* Paginated Grid of Category Cards (Max 8 visible per page) */}
      <div className="relative">
        <div className="overflow-hidden py-1.5 -my-1.5 px-0.5 -mx-0.5">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={`${selectedSuperType}-${page}`}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4"
            >
              {currentCards.map((item: unknown) => {
                const isAddBtn = (item as { isAddButton?: boolean }).isAddButton
                if (isAddBtn) {
                  const addBtnItem = item as { id: string }
                  return (
                    <Dialog key={addBtnItem.id} open={isAddOpen} onOpenChange={setIsAddOpen}>
                      <DialogTrigger render={
                        <button type="button"
                          className="group relative flex flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-border/80 bg-muted/15 p-4 text-center cursor-pointer transition-all duration-200 hover:border-primary/50 hover:bg-muted/40 hover:shadow-xs min-h-[125px]"
                        >
                          <div className="flex size-8 items-center justify-center rounded-full bg-muted group-hover:bg-primary/10 transition-colors">
                            <PlusIcon className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                          <p className="mt-2 text-xs font-semibold text-foreground">Add Category</p>
                          <p className="mt-0.5 text-[10px] text-muted-foreground">Create new income category</p>
                        </button>
                      } />
                      <DialogContent className="max-w-md gap-6">
                        <DialogHeader>
                          <DialogTitle>Add Custom Category</DialogTitle>
                          <DialogDescription>
                            Create a new sub-category for your income types.
                          </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-medium">Category Name</label>
                            <Input
                              placeholder="e.g. Freelance Graphic Design"
                              value={newCatName}
                              onChange={(e) => setNewCatName(e.target.value)}
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-medium">Income Type (Super Category)</label>
                            <Select value={newCatSuperType} onValueChange={(val) => { if (val) setNewCatSuperType(val) }}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {incomeSuperCategories.map((cat) => (
                                  <SelectItem key={cat.id} value={cat.name}>
                                    <div className="flex items-center gap-2">
                                      <cat.icon className={cn("size-3.5", cat.color.replace("bg-", "text-"))} />
                                      {cat.name}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-xs font-medium">Icon</label>
                              <Select value={newCatIcon} onValueChange={(val) => { if (val) setNewCatIcon(val) }}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {ICON_OPTIONS.map((opt) => (
                                    <SelectItem key={opt.name} value={opt.name}>
                                      <div className="flex items-center gap-2">
                                        <opt.icon className="size-3.5" />
                                        {opt.name}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-xs font-medium">Color Label</label>
                              <div className="flex items-center gap-2 mt-1">
                                {COLOR_OPTIONS.map((color) => (
                                  <button
                                    key={color}
                                    type="button"
                                    onClick={() => setNewCatColor(color)}
                                    className={cn(
                                      "size-6 rounded-full transition-all ring-offset-2 ring-offset-background",
                                      color,
                                      newCatColor === color ? "ring-2 ring-foreground scale-110" : "hover:scale-110 opacity-70 hover:opacity-100"
                                    )}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        <DialogFooter>
                          <DialogClose render={<Button variant="outline" size="sm" />}>
                            Cancel
                          </DialogClose>
                          <Button size="sm" onClick={handleAddCategory} disabled={!newCatName.trim()}>
                            Add Category
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )
                }

                const subType = item as IncomeSubType
                const isSelected = selectedSubType === subType.name
                
                // Find icon from super category, override with custom if available
                const superCat = incomeSuperCategories.find(c => c.name === subType.superType)
                
                const IconComponent = (subType.customIcon || superCat?.icon || BriefcaseIcon) as any
                const accentColor = subType.customColor || subType.superTypeColor

                return (
                  <div
                    key={subType.id}
                    onClick={() =>
                      onSelectSubType?.(isSelected ? null : subType.name)
                    }
                    className={cn(
                      "group relative flex flex-col justify-between overflow-hidden rounded-xl bg-card p-3 pl-3.5 ring-1 ring-foreground/10 transition-all hover:shadow-sm cursor-pointer",
                      isSelected && "ring-2 ring-primary bg-muted/30"
                    )}
                  >
                    {/* Color accent strip matching Super Type */}
                    <div
                      className={cn(
                        "absolute inset-y-0 left-0 w-1 rounded-l-xl",
                        accentColor
                      )}
                    />

                    {/* Top: Super Type Tag & Trend Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <IconComponent className={cn("size-3", accentColor.replace('bg-', 'text-'))} />
                        <span className="text-[10px] font-medium uppercase tracking-wider line-clamp-1">{subType.superType}</span>
                      </div>
                      <span
                        className={cn(
                          "inline-flex items-center gap-0.5 text-[10px] font-medium px-1 py-0.5 rounded shrink-0 tabular-nums",
                          subType.change >= 0
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                        )}
                      >
                        {subType.change >= 0 ? (
                          <TrendingUpIcon className="size-2.5" />
                        ) : (
                          <TrendingDownIcon className="size-2.5" />
                        )}
                        <span>
                          {subType.change >= 0 ? "+" : ""}
                          {subType.changePercent.toFixed(1)}%
                        </span>
                      </span>
                    </div>

                    {/* Middle: Sub Type Name & Revenue Amount */}
                    <div className="my-1.5">
                      <p className="text-xs font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                        {subType.name}
                      </p>
                      <p className="mt-0.5 text-base font-bold tracking-tight tabular-nums text-foreground">
                        {fmt(subType.amount)}
                      </p>
                    </div>

                    {/* Footer: Txn Count & Share of Super Type */}
                    <div className="pt-1.5 border-t border-border/40 flex items-center justify-between text-[10px] text-muted-foreground">
                      <span className="tabular-nums font-medium">
                        {subType.count} txns
                      </span>
                      <span className="tabular-nums font-mono text-muted-foreground/80">
                        {subType.sharePercent}% of category
                      </span>
                    </div>
                  </div>
                )
              })}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Account-tab Style Pagination: Back / Dots / Next */}
        {totalPages > 1 && (
          <div className="mt-3 flex items-center justify-between">
            <button
              type="button"
              onClick={goBack}
              disabled={!canGoBack}
              className={cn(
                "inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium ring-1 ring-foreground/10 transition-colors",
                canGoBack ? "hover:bg-muted" : "cursor-not-allowed opacity-40"
              )}
            >
              <ChevronLeftIcon className="size-3.5" />
              Back
            </button>

            <div className="flex items-center gap-1.5">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setDirection(i > page ? 1 : -1)
                    setPage(i)
                  }}
                  className={cn(
                    "size-1.5 rounded-full transition-all",
                    i === page ? "bg-foreground scale-125" : "bg-foreground/20 hover:bg-foreground/40"
                  )}
                  aria-label={`Go to page ${i + 1}`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={goNext}
              disabled={!canGoNext}
              className={cn(
                "inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium ring-1 ring-foreground/10 transition-colors",
                canGoNext ? "hover:bg-muted" : "cursor-not-allowed opacity-40"
              )}
            >
              Next
              <ChevronRightIcon className="size-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
