"use client"

import { useState, type ReactNode } from "react"
import Image from "next/image"
import {
  TrendingUpIcon,
  TrendingDownIcon,
  ReceiptIcon,
  CalendarDaysIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CreditCardIcon,
} from "lucide-react"
import { motion, AnimatePresence } from "motion/react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import type { ExpenseItem } from "@/types/expenses"

/* ------------------------------------------------------------------ */
/*  ExpenseCard — single business expenditure card                    */
/* ------------------------------------------------------------------ */

interface ExpenseCardProps {
  expense: ExpenseItem
  index: number
  onSelect?: (expense: ExpenseItem) => void
}

const fmt = (n: number, currency = "$") =>
  `${currency}${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(n))}`

const statusBadgeConfig: Record<
  ExpenseItem["status"],
  { className: string; label: string }
> = {
  paid: {
    className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    label: "Paid",
  },
  pending: {
    className: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
    label: "Pending",
  },
  approved: {
    className: "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400",
    label: "Approved",
  },
}

export function ExpenseCard({ expense, index, onSelect }: ExpenseCardProps) {
  const [imgError, setImgError] = useState(false)

  const badge = statusBadgeConfig[expense.status] ?? {
    className: "border-muted text-muted-foreground",
    label: expense.status,
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      onClick={() => onSelect?.(expense)}
      className="group relative cursor-pointer overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 transition-shadow hover:shadow-md"
    >
      {/* Accent left indicator */}
      <div className={cn("absolute inset-y-0 left-0 w-1", expense.color)} />

      <div className="p-3 pl-3.5">
        {/* Vendor Logo + Status Badge */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {imgError || !expense.logo ? (
              <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted">
                <ReceiptIcon className="size-3 text-muted-foreground" />
              </div>
            ) : (
              <Image
                src={expense.logo}
                alt={expense.vendor}
                width={20}
                height={20}
                unoptimized
                className="size-5 shrink-0 rounded-full bg-muted object-cover"
                onError={() => setImgError(true)}
              />
            )}
            <span className="truncate text-[11px] font-medium text-muted-foreground">
              {expense.vendor}
            </span>
          </div>

          <Badge
            variant="outline"
            className={cn("text-[10px] px-1.5 py-0 capitalize font-medium", badge.className)}
          >
            {badge.label}
          </Badge>
        </div>

        {/* Title & Receipt */}
        <div className="mt-2">
          <p className="text-xs font-semibold leading-tight truncate">
            {expense.title}
          </p>
          <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <span className="font-mono">{expense.receiptNumber}</span>
            <span>•</span>
            <span>{expense.department}</span>
          </div>
        </div>

        {/* Expense Amount */}
        <div className="mt-2">
          <p className="text-[10px] text-muted-foreground">Disbursed Amount</p>
          <p className="text-lg font-bold tracking-tight leading-tight text-foreground">
            -{fmt(expense.amount, expense.currency)}
          </p>
        </div>

        {/* Variance & Metadata */}
        <div className="mt-2 flex items-center justify-between text-[11px]">
          <span
            className={cn(
              "inline-flex items-center gap-0.5 font-medium",
              expense.change <= 0 ? "text-emerald-500" : "text-rose-500"
            )}
          >
            {expense.change <= 0 ? (
              <TrendingDownIcon className="size-3" />
            ) : (
              <TrendingUpIcon className="size-3" />
            )}
            <span className="tabular-nums">
              {expense.change > 0 ? "+" : "-"}
              {fmt(Math.abs(expense.change), expense.currency)} (
              {Math.abs(expense.changePercent).toFixed(1)}%)
            </span>
          </span>

          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-0.5">
              <CreditCardIcon className="size-2.5" />
              {expense.paymentMethod}
            </span>
            <span>•</span>
            <span className="flex items-center gap-0.5">
              <CalendarDaysIcon className="size-2.5" />
              {expense.expenseDate}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  ExpenseGrid — paginated expenditure gallery                       */
/* ------------------------------------------------------------------ */

interface ExpenseGridProps {
  expenses: ExpenseItem[]
  onSelect?: (expense: ExpenseItem) => void
  cardsPerPage?: number
  trailingSlot?: ReactNode
}

export function ExpenseGrid({
  expenses,
  onSelect,
  cardsPerPage = 6,
  trailingSlot,
}: ExpenseGridProps) {
  const [page, setPage] = useState(0)
  const [direction, setDirection] = useState(0)

  const totalPages = Math.ceil(expenses.length / cardsPerPage)
  const start = page * cardsPerPage
  const currentExpenses = expenses.slice(start, start + cardsPerPage)

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
    enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
  }

  return (
    <div className="relative">
      <div className="overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={page}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {currentExpenses.map((item, i) => (
              <ExpenseCard
                key={item.id ?? `${page}-${i}`}
                expense={item}
                index={i}
                onSelect={onSelect}
              />
            ))}
            {!canGoNext && trailingSlot}
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
              "inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium ring-1 ring-foreground/10 transition-colors",
              canGoBack ? "hover:bg-muted" : "cursor-not-allowed opacity-40"
            )}
          >
            <ChevronLeftIcon className="size-4" />
            Back
          </button>

          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalPages }).map((_, i) => (
              <span
                key={i}
                className={cn(
                  "size-1.5 rounded-full transition-colors",
                  i === page ? "bg-foreground" : "bg-foreground/20"
                )}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={goNext}
            disabled={!canGoNext}
            className={cn(
              "inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium ring-1 ring-foreground/10 transition-colors",
              canGoNext ? "hover:bg-muted" : "cursor-not-allowed opacity-40"
            )}
          >
            Next
            <ChevronRightIcon className="size-4" />
          </button>
        </div>
      )}
    </div>
  )
}
