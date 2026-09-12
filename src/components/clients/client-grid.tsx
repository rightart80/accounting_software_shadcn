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
  FolderKanbanIcon,
} from "lucide-react"
import { motion, AnimatePresence } from "motion/react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import type { Client } from "@/types/clients"
import { usePreferences } from "@/contexts/preferences-context"

/* ------------------------------------------------------------------ */
/*  ClientCard — single client card                                   */
/* ------------------------------------------------------------------ */

interface ClientCardProps {
  client: Client
  index: number
  onSelect?: (client: Client) => void
}

const fmt = (n: number, currency = "$") =>
  `${currency}${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(n))}`

export function ClientCard({ client, index, onSelect }: ClientCardProps) {
  const { clientLabelSingular } = usePreferences()
  const [imgError, setImgError] = useState(false)
  const [showFullNumber, setShowFullNumber] = useState(false)

  const formatClientNumber = (num: string) => {
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
        onSelect?.(client)
      }}
      className="group relative cursor-pointer overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 transition-shadow hover:shadow-md"
    >
      {/* Colored left indicator border */}
      <div className={cn("absolute inset-y-0 left-0 w-1", client.color)} />

      <div className="p-3 pl-3.5">
        {/* Company and Tier header */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {imgError || !client.clientLogo ? (
              <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted">
                <BuildingIcon className="size-3 text-muted-foreground" />
              </div>
            ) : (
              <Image
                src={client.clientLogo}
                alt={client.company}
                width={20}
                height={20}
                unoptimized
                className="size-5 shrink-0 rounded-full bg-muted object-cover"
                onError={() => setImgError(true)}
              />
            )}
            <span className="truncate text-[11px] font-medium text-muted-foreground">
              {client.company}
            </span>
          </div>

          <Badge
            variant="outline"
            className="text-[10px] px-1.5 py-0 capitalize text-muted-foreground"
          >
            {client.type}
          </Badge>
        </div>

        {/* Contact person + Client ID */}
        <div className="mt-2">
          <p className="text-xs font-semibold leading-tight truncate">
            {client.name}
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
                showFullNumber
                  ? `Click to hide ${clientLabelSingular.toLowerCase()} ID`
                  : `Click to view full ${clientLabelSingular.toLowerCase()} ID`
              }
            >
              <span>
                {showFullNumber
                  ? client.clientNumber
                  : formatClientNumber(client.clientNumber)}
              </span>
              {showFullNumber ? (
                <EyeOffIcon className="size-2.5 opacity-60" />
              ) : (
                <EyeIcon className="size-2.5 opacity-60" />
              )}
            </button>
          </div>
        </div>

        {/* Revenue */}
        <div className="mt-2">
          <p className="text-[10px] text-muted-foreground">Total Revenue</p>
          <p className="text-lg font-bold tracking-tight leading-tight">
            {fmt(client.totalRevenue, client.currency)}
          </p>
        </div>

        {/* Change + Last activity & Projects */}
        <div className="mt-2 flex items-center justify-between text-[11px]">
          <span
            className={cn(
              "inline-flex items-center gap-0.5 font-medium",
              client.change >= 0 ? "text-emerald-500" : "text-rose-500"
            )}
          >
            {client.change >= 0 ? (
              <TrendingUpIcon className="size-3" />
            ) : (
              <TrendingDownIcon className="size-3" />
            )}
            <span className="tabular-nums">
              {client.change >= 0 ? "+" : "-"}
              {fmt(client.change, client.currency)} (
              {Math.abs(client.changePercent).toFixed(1)}%)
            </span>
          </span>

          <div className="flex items-center gap-2">
            {client.activeProjects > 0 && (
              <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                <FolderKanbanIcon className="size-2.5" />
                {client.activeProjects} {client.activeProjects === 1 ? "proj" : "projs"}
              </span>
            )}
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <ClockIcon className="size-2.5" />
              {client.lastActivity}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  ClientGrid — shows 6 at a time with smooth page slide controls    */
/* ------------------------------------------------------------------ */

interface ClientGridProps {
  clients: Client[]
  onSelect?: (client: Client) => void
  cardsPerPage?: number
  trailingSlot?: ReactNode
}

export function ClientGrid({
  clients,
  onSelect,
  cardsPerPage = 6,
  trailingSlot,
}: ClientGridProps) {
  const [page, setPage] = useState(0)
  const [direction, setDirection] = useState(0)

  const totalPages = Math.ceil(clients.length / cardsPerPage)
  const start = page * cardsPerPage
  const currentClients = clients.slice(start, start + cardsPerPage)

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
            {currentClients.map((client, i) => (
              <ClientCard
                key={client.id ?? `${page}-${i}`}
                client={client}
                index={i}
                onSelect={onSelect}
              />
            ))}
            {/* Show trailing slot (Add Client tile) on the last page */}
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
