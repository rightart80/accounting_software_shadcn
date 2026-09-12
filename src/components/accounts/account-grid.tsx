"use client"

import { useState, type ReactNode } from "react"
import Image from "next/image"
import {
  TrendingUpIcon,
  TrendingDownIcon,
  ClockIcon,
  BuildingIcon,
  EyeIcon,
  EyeOffIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"
import { motion, AnimatePresence } from "motion/react"

import { cn } from "@/lib/utils"
import type { BankAccount } from "@/types/accounts"

/* ------------------------------------------------------------------ */
/*  AccountCard — single account card                                 */
/* ------------------------------------------------------------------ */

interface AccountCardProps {
  account: BankAccount
  index: number
  onSelect?: (account: BankAccount) => void
}

const fmt = (n: number, currency = "$") =>
  `${currency}${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(n))}`

export function AccountCard({ account, index, onSelect }: AccountCardProps) {
  const [imgError, setImgError] = useState(false)
  const [showFullAccount, setShowFullAccount] = useState(false)

  // Formats the number into ****6758 format
  const formatAccountNumber = (num: string) => {
    if (!num) return ""
    const lastFour = num.slice(-4)
    return `****${lastFour}`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      onClick={() => {
        onSelect?.(account)
        console.log("Selected account:", account.name)
      }}
      className="group relative cursor-pointer overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 transition-shadow hover:shadow-md"
    >
      {/* Colored left border */}
      <div className={cn("absolute inset-y-0 left-0 w-1", account.color)} />

      <div className="p-3 pl-3.5">
        {/* Institution row */}
        <div className="flex items-center gap-2">
          {imgError || !account.institutionLogo ? (
            <div className="flex size-5 items-center justify-center rounded-full bg-muted">
              <BuildingIcon className="size-3 text-muted-foreground" />
            </div>
          ) : (
            <Image
              src={account.institutionLogo}
              alt={account.institution}
              width={20}
              height={20}
              unoptimized
              className="size-5 rounded-full bg-muted object-cover"
              onError={() => setImgError(true)}
            />
          )}
          <span className="text-[11px] text-muted-foreground">
            {account.institution}
          </span>
        </div>

        {/* Account name + number */}
        <div className="mt-2">
          <p className="text-xs font-semibold leading-tight">{account.name}</p>
          <div className="mt-0.5 inline-flex items-center gap-1">
            <button
              type="button"
              onClick={(e) => {
                // Stop event from bubbling up to the parent div's onClick event
                e.stopPropagation()
                setShowFullAccount((prev) => !prev)
              }}
              className="flex items-center gap-1 rounded px-1 py-0.5 font-mono text-[10px] text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              title={showFullAccount ? "Click to hide number" : "Click to view full number"}
            >
              <span>
                {showFullAccount
                  ? account.accountNumber
                  : formatAccountNumber(account.accountNumber)}
              </span>
              {showFullAccount ? (
                <EyeOffIcon className="size-2.5 opacity-60" />
              ) : (
                <EyeIcon className="size-2.5 opacity-60" />
              )}
            </button>
          </div>
        </div>

        {/* Balance */}
        <div className="mt-2">
          <p className="text-[10px] text-muted-foreground">Balance</p>
          <p className="text-lg font-bold tracking-tight leading-tight">
            {fmt(account.balance, account.currency)}
          </p>
        </div>

        {/* Change + Last activity */}
        <div className="mt-2 flex items-center justify-between text-[11px]">
          <span
            className={cn(
              "inline-flex items-center gap-0.5 font-medium",
              account.change >= 0 ? "text-emerald-500" : "text-rose-500"
            )}
          >
            {account.change >= 0 ? (
              <TrendingUpIcon className="size-3" />
            ) : (
              <TrendingDownIcon className="size-3" />
            )}
            <span className="tabular-nums">
              {account.change >= 0 ? "+" : "-"}
              {fmt(account.change, account.currency)} (
              {Math.abs(account.changePercent).toFixed(1)}%)
            </span>
          </span>

          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <ClockIcon className="size-2.5" />
            {account.lastActivity}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  AccountGrid — shows 6 at a time, slides forward/back on click     */
/* ------------------------------------------------------------------ */

interface AccountGridProps {
  accounts: BankAccount[]
  onSelect?: (account: BankAccount) => void
  cardsPerPage?: number
  trailingSlot?: ReactNode
}

export function AccountGrid({
  accounts,
  onSelect,
  cardsPerPage = 6,
  trailingSlot,
}: AccountGridProps) {
  const [page, setPage] = useState(0)
  const [direction, setDirection] = useState(0) // 1 = next, -1 = back

  const totalPages = Math.ceil(accounts.length / cardsPerPage)
  const start = page * cardsPerPage
  const currentAccounts = accounts.slice(start, start + cardsPerPage)

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
            {currentAccounts.map((account, i) => (
              <AccountCard
                key={account.id ?? `${page}-${i}`}
                account={account}
                index={i}
                onSelect={onSelect}
              />
            ))}
            {/* Only show the trailing slot (e.g. Add Account tile) on the last page */}
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
