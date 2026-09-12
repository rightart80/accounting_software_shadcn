"use client"

import { useState, type ReactNode } from "react"
import {
  LandmarkIcon,
  ShieldCheckIcon,
  AlertCircleIcon,
  ClockIcon,
  EyeIcon,
  EyeOffIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarDaysIcon,
} from "lucide-react"
import { motion, AnimatePresence } from "motion/react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import type { Authority } from "@/types/authorities"

/* ------------------------------------------------------------------ */
/*  AuthorityCard — single tax/regulatory authority card              */
/* ------------------------------------------------------------------ */

interface AuthorityCardProps {
  authority: Authority
  index: number
  onSelect?: (authority: Authority) => void
}

const fmt = (n: number, currency = "$") =>
  `${currency}${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(n))}`

const statusBadgeConfig: Record<
  Authority["complianceStatus"],
  { className: string; label: string }
> = {
  Compliant: {
    className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    label: "Compliant",
  },
  "Pending Filing": {
    className: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
    label: "Pending Filing",
  },
  "Under Review": {
    className: "border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400",
    label: "Under Review",
  },
  "Action Required": {
    className: "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400",
    label: "Action Required",
  },
}

export function AuthorityCard({ authority, index, onSelect }: AuthorityCardProps) {
  const [showFullNumber, setShowFullNumber] = useState(false)

  const formatNumber = (num: string) => {
    if (!num) return ""
    const lastFour = num.slice(-4)
    return `****${lastFour}`
  }

  const badge = statusBadgeConfig[authority.complianceStatus] ?? {
    className: "border-muted text-muted-foreground",
    label: authority.complianceStatus,
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      onClick={() => onSelect?.(authority)}
      className="group relative cursor-pointer overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 transition-shadow hover:shadow-md"
    >
      {/* Colored left indicator border */}
      <div className={cn("absolute inset-y-0 left-0 w-1", authority.color)} />

      <div className="p-3 pl-3.5">
        {/* Header: Short code / Icon + Type Badge */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-foreground">
              <LandmarkIcon className="size-3.5" />
            </div>
            <div className="min-w-0">
              <span className="font-mono text-xs font-bold tracking-tight">
                {authority.shortCode}
              </span>
              <span className="ml-1.5 truncate text-[11px] text-muted-foreground">
                {authority.jurisdiction}
              </span>
            </div>
          </div>

          <Badge
            variant="outline"
            className={cn("text-[10px] px-1.5 py-0 font-medium", badge.className)}
          >
            {badge.label}
          </Badge>
        </div>

        {/* Agency Full Name + Registration Number */}
        <div className="mt-2.5">
          <p className="text-xs font-semibold leading-tight truncate">
            {authority.name}
          </p>
          <div className="mt-0.5 inline-flex items-center gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setShowFullNumber((prev) => !prev)
              }}
              className="flex items-center gap-1 rounded px-1 py-0.5 font-mono text-[10px] text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              title={
                showFullNumber ? "Hide registration ID" : "View full registration ID"
              }
            >
              <span>
                {showFullNumber
                  ? authority.accountNumber
                  : formatNumber(authority.accountNumber)}
              </span>
              {showFullNumber ? (
                <EyeOffIcon className="size-2.5 opacity-60" />
              ) : (
                <EyeIcon className="size-2.5 opacity-60" />
              )}
            </button>
            <span className="text-[10px] text-muted-foreground">
              • {authority.filingFrequency}
            </span>
          </div>
        </div>

        {/* Tax Metric Breakdown */}
        <div className="mt-2.5 grid grid-cols-2 gap-2 border-t pt-2 border-foreground/5">
          <div>
            <p className="text-[10px] text-muted-foreground">Total Paid YTD</p>
            <p className="text-sm font-bold tracking-tight text-foreground">
              {fmt(authority.totalPaid, authority.currency)}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground">Pending Due</p>
            <p
              className={cn(
                "text-sm font-bold tracking-tight",
                authority.pendingDue > 0 ? "text-amber-500" : "text-muted-foreground"
              )}
            >
              {fmt(authority.pendingDue, authority.currency)}
            </p>
          </div>
        </div>

        {/* Next Due Date & Last Filing */}
        <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <CalendarDaysIcon className="size-3" />
            Due: {authority.nextDueDate}
          </span>
          <span className="inline-flex items-center gap-1">
            <ClockIcon className="size-3" />
            Filed: {authority.lastFilingDate}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  AuthorityGrid — paginated grid with smooth animations             */
/* ------------------------------------------------------------------ */

interface AuthorityGridProps {
  authorities: Authority[]
  onSelect?: (authority: Authority) => void
  cardsPerPage?: number
  trailingSlot?: ReactNode
}

export function AuthorityGrid({
  authorities,
  onSelect,
  cardsPerPage = 6,
  trailingSlot,
}: AuthorityGridProps) {
  const [page, setPage] = useState(0)
  const [direction, setDirection] = useState(0)

  const totalPages = Math.ceil(authorities.length / cardsPerPage)
  const start = page * cardsPerPage
  const currentAuthorities = authorities.slice(start, start + cardsPerPage)

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
            {currentAuthorities.map((authority, i) => (
              <AuthorityCard
                key={authority.id ?? `${page}-${i}`}
                authority={authority}
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
