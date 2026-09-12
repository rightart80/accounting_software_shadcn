"use client"

import * as React from "react"
import Image from "next/image"
import {
  TrendingUpIcon,
  TrendingDownIcon,
  CircleDollarSignIcon,
  CalendarDaysIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CreditCardIcon,
} from "lucide-react"
import { motion, AnimatePresence } from "motion/react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import type { IncomeItem } from "@/types/income"

/* ------------------------------------------------------------------ */
/*  IncomeCard — single revenue entry card                            */
/* ------------------------------------------------------------------ */

interface IncomeCardProps {
  income: IncomeItem
  index: number
  onSelect?: (income: IncomeItem) => void
}

const fmt = (n: number, currency = "$") =>
  `${currency}${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(n))}`

const statusBadgeConfig: Record<
  IncomeItem["status"],
  { className: string; label: string }
> = {
  received: {
    className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    label: "Received",
  },
  pending: {
    className: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
    label: "Pending",
  },
  scheduled: {
    className: "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400",
    label: "Scheduled",
  },
}

const categoryBadgeConfig: Record<
  string,
  { className: string; label: string }
> = {
  "Business Revenue": {
    className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    label: "Business Revenue",
  },
  "Income from Investment": {
    className: "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400",
    label: "Investment",
  },
  "Income from Property": {
    className: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
    label: "Property",
  },
  "Income From Property": {
    className: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
    label: "Property",
  },
  "Sale of Assets": {
    className: "border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400",
    label: "Sale of Assets",
  },
  "Sale of Assest": {
    className: "border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400",
    label: "Sale of Assets",
  },
  "Sale of Securities": {
    className: "border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
    label: "Securities",
  },
  "Foreign Source": {
    className: "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400",
    label: "Foreign Source",
  },
  "Foriegn Source": {
    className: "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400",
    label: "Foreign Source",
  },
}

export function IncomeCard({ income, index, onSelect }: IncomeCardProps) {
  const [imgError, setImgError] = React.useState(false)

  const badge = statusBadgeConfig[income.status] ?? {
    className: "border-muted text-muted-foreground",
    label: income.status,
  }

  const categoryBadge = categoryBadgeConfig[income.type] ?? {
    className: "border-muted/50 bg-muted/30 text-muted-foreground",
    label: income.type,
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      onClick={() => onSelect?.(income)}
      className="group relative flex h-full min-h-[165px] flex-col justify-between cursor-pointer overflow-hidden rounded-xl bg-card p-3.5 pl-4 ring-1 ring-foreground/10 transition-shadow hover:shadow-md"
    >
      {/* Accent left border */}
      <div className={cn("absolute inset-y-0 left-0 w-1", income.color)} />

      {/* Top Header: Source Info + Badges */}
      <div>
        <div className="flex items-center justify-between gap-2">
          {/* Logo & Source Name */}
          <div className="flex items-center gap-2 min-w-0">
            {imgError || !income.logo ? (
              <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted">
                <CircleDollarSignIcon className="size-3 text-muted-foreground" />
              </div>
            ) : (
              <Image
                src={income.logo}
                alt={income.source}
                width={20}
                height={20}
                unoptimized
                className="size-5 shrink-0 rounded-full bg-muted object-cover"
                onError={() => setImgError(true)}
              />
            )}
            <span className="truncate text-xs font-semibold text-foreground">
              {income.source}
            </span>
          </div>

          {/* Badges: Category & Status */}
          <div className="flex items-center gap-1.5 shrink-0">
            <Badge
              variant="outline"
              className={cn("text-[10px] px-1.5 py-0 font-medium", categoryBadge.className)}
            >
              {categoryBadge.label}
            </Badge>
            <Badge
              variant="outline"
              className={cn("text-[10px] px-1.5 py-0 capitalize font-medium hidden sm:inline-flex", badge.className)}
            >
              {badge.label}
            </Badge>
          </div>
        </div>

        {/* Title & Invoice */}
        <div className="mt-2">
          <p className="text-xs font-medium text-muted-foreground truncate leading-snug">
            {income.title}
          </p>
          <p className="text-[10px] font-mono text-muted-foreground/75 mt-0.5">
            {income.invoiceNumber}
          </p>
        </div>
      </div>

      {/* Middle: Amount & Growth */}
      <div className="my-2">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-lg font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
            +{fmt(income.amount, income.currency)}
          </p>
          <span
            className={cn(
              "inline-flex items-center gap-0.5 text-[11px] font-medium px-1.5 py-0.5 rounded-md shrink-0",
              income.change >= 0
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
            )}
          >
            {income.change >= 0 ? (
              <TrendingUpIcon className="size-3" />
            ) : (
              <TrendingDownIcon className="size-3" />
            )}
            <span className="tabular-nums">
              {income.change >= 0 ? "+" : "-"}
              {Math.abs(income.changePercent).toFixed(1)}%
            </span>
          </span>
        </div>
      </div>

      {/* Footer: Payment Method & Date */}
      <div className="pt-2 border-t border-border/50 flex items-center justify-between gap-2 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1 truncate max-w-[130px]">
          <CreditCardIcon className="size-2.5 shrink-0" />
          <span className="truncate">{income.paymentMethod}</span>
        </span>
        <span className="flex items-center gap-1 shrink-0">
          <CalendarDaysIcon className="size-2.5 shrink-0" />
          <span>{income.receivedDate}</span>
        </span>
      </div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  IncomeGrid — paginated gallery for income streams                 */
/* ------------------------------------------------------------------ */

interface IncomeGridProps {
  income: IncomeItem[]
  onSelect?: (income: IncomeItem) => void
  cardsPerPage?: number
  trailingSlot?: React.ReactNode
}

export function IncomeGrid({
  income,
  onSelect,
  cardsPerPage = 6,
  trailingSlot,
}: IncomeGridProps) {
  const [page, setPage] = React.useState(0)
  const [direction, setDirection] = React.useState(0)

  // Auto-reset page when dataset changes
  React.useEffect(() => {
    setPage(0)
  }, [income.length])

  const totalPages = Math.max(1, Math.ceil(income.length / cardsPerPage))
  const safePage = Math.min(page, totalPages - 1)
  const start = safePage * cardsPerPage
  const currentIncome = income.slice(start, start + cardsPerPage)

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
    enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
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
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 auto-rows-fr"
          >
            {currentIncome.map((item, i) => (
              <IncomeCard
                key={item.id ?? `${safePage}-${i}`}
                income={item}
                index={i}
                onSelect={onSelect}
              />
            ))}
            {!canGoNext && trailingSlot && (
              <div className="h-full min-h-[165px]">{trailingSlot}</div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
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
