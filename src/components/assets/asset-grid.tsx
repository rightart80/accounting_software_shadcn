"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import type { FixedAsset } from "@/types/assets"
import { AssetCard } from "@/components/assets/asset-card"

interface AssetGridProps {
  assets: FixedAsset[]
  onSelect: (asset: FixedAsset) => void
  cardsPerPage?: number
}

export function AssetGrid({
  assets,
  onSelect,
  cardsPerPage = 6,
}: AssetGridProps) {
  const [page, setPage] = useState(0)
  const [direction, setDirection] = useState(0)

  const totalPages = Math.ceil(assets.length / cardsPerPage)
  const safePage = Math.min(page, Math.max(0, totalPages - 1))
  const start = safePage * cardsPerPage
  const currentAssets = assets.slice(start, start + cardsPerPage)

  const canGoNext = safePage < totalPages - 1
  const canGoBack = safePage > 0

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
    enter: (dir: number) => ({ x: dir > 0 ? 50 : -50, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -50 : 50, opacity: 0 }),
  }

  return (
    <div className="relative">
      <div className="overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={safePage}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {currentAssets.map((asset, i) => (
              <AssetCard
                key={asset.id}
                asset={asset}
                index={i}
                onSelect={onSelect}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-3">
          <button
            type="button"
            onClick={goBack}
            disabled={!canGoBack}
            className={cn(
              "inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium ring-1 ring-foreground/10 transition-colors",
              canGoBack ? "hover:bg-muted" : "cursor-not-allowed opacity-40"
            )}
          >
            <ChevronLeftIcon className="size-3.5" />
            Back
          </button>

          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalPages }).map((_, i) => (
              <span
                key={i}
                className={cn(
                  "size-1.5 rounded-full transition-colors",
                  i === safePage ? "bg-foreground" : "bg-foreground/20"
                )}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={goNext}
            disabled={!canGoNext}
            className={cn(
              "inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium ring-1 ring-foreground/10 transition-colors",
              canGoNext ? "hover:bg-muted" : "cursor-not-allowed opacity-40"
            )}
          >
            Next
            <ChevronRightIcon className="size-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}
