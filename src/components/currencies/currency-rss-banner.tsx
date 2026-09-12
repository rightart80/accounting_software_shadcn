"use client"

import {
  RssIcon,
  RefreshCwIcon,
  DollarSignIcon,
  InfoIcon,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface CurrencyRssBannerProps {
  onSyncAll: () => Promise<void>
  isSyncing: boolean
  lastSynced: string
}

export function CurrencyRssBanner({
  onSyncAll,
  isSyncing,
  lastSynced,
}: CurrencyRssBannerProps) {
  const formatTime = (iso: string) => {
    try {
      const date = new Date(iso)
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    } catch {
      return "Just now"
    }
  }

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border bg-card/60 px-4 py-3 shadow-xs backdrop-blur-xs">
      {/* Left: Feed status and Base indicator */}
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex items-center gap-2">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
          </span>
          <span className="font-semibold text-xs tracking-tight text-foreground flex items-center gap-1.5">
            <RssIcon className="size-3.5 text-emerald-500" />
            Google Finance RSS Feed
          </span>
        </div>

        <span className="text-muted-foreground/40 text-xs hidden sm:inline">•</span>

        <Badge variant="outline" className="gap-1 border-primary/30 bg-primary/5 font-mono text-primary text-[11px] font-normal py-0.5">
          <DollarSignIcon className="size-3" />
          Base: USD ($1.00)
        </Badge>

        <span className="text-muted-foreground/40 text-xs hidden md:inline">•</span>

        <span className="text-[11px] text-muted-foreground hidden md:inline">
          Live sync active against global treasury
        </span>
      </div>

      {/* Right: Sync action and info */}
      <div className="flex items-center gap-3">
        <span className="hidden sm:inline text-[11px] text-muted-foreground font-mono">
          Last sync: {formatTime(lastSynced)}
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={onSyncAll}
          disabled={isSyncing}
          className="h-7 gap-1.5 text-xs font-medium px-2.5"
        >
          <RefreshCwIcon className={cn("size-3", isSyncing && "animate-spin text-primary")} />
          <span>{isSyncing ? "Syncing..." : "Sync Live Feed"}</span>
        </Button>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
                />
              }
            >
              <InfoIcon className="size-3.5" />
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs text-xs">
              Live exchange rates are streamed from Google Finance RSS relative to USD ($).
              Rates can be accepted directly or manually overridden with custom corporate treasury rates.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
}
