"use client"

import { useState } from "react"
import {
  SlidersHorizontalIcon,
  SaveIcon,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import type { CurrencyItem } from "@/types/currencies"
import { cn } from "@/lib/utils"

interface EditCurrencyDialogProps {
  currency: CurrencyItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (id: string, updates: Partial<CurrencyItem>) => void
}

export function EditCurrencyDialog({
  currency,
  open,
  onOpenChange,
  onSave,
}: EditCurrencyDialogProps) {
  if (!currency) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px] p-6">
        <EditCurrencyForm
          key={currency.id}
          currency={currency}
          onClose={() => onOpenChange(false)}
          onSave={onSave}
        />
      </DialogContent>
    </Dialog>
  )
}

interface EditCurrencyFormProps {
  currency: CurrencyItem
  onClose: () => void
  onSave: (id: string, updates: Partial<CurrencyItem>) => void
}

function EditCurrencyForm({ currency, onClose, onSave }: EditCurrencyFormProps) {
  const [isOverride, setIsOverride] = useState<boolean>(
    currency.rateSource === "manual_override"
  )
  const [manualRate, setManualRate] = useState<string>(
    currency.manualRate !== undefined
      ? currency.manualRate.toString()
      : currency.rssFeedRate.toString()
  )
  const [symbol, setSymbol] = useState<string>(currency.symbol)
  const [notes, setNotes] = useState<string>(currency.notes || "")
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const parsedRate = parseFloat(manualRate)
    const effectiveRate = !isNaN(parsedRate) && parsedRate > 0 ? parsedRate : currency.rssFeedRate

    onSave(currency.id, {
      symbol,
      rateSource: isOverride ? "manual_override" : "rss_feed",
      manualRate: isOverride ? effectiveRate : currency.manualRate,
      rateAgainstBase: isOverride ? effectiveRate : currency.rssFeedRate,
      notes: notes || undefined,
    })

    setIsSubmitting(false)
    onClose()
  }

  const manualRateNum = parseFloat(manualRate)
  const spreadPercent =
    !isNaN(manualRateNum) && currency.rssFeedRate > 0
      ? (((manualRateNum - currency.rssFeedRate) / currency.rssFeedRate) * 100).toFixed(2)
      : "0.00"

  return (
    <>
      <DialogHeader>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{currency.flag}</span>
          <div>
            <DialogTitle className="text-base font-semibold">
              Manage {currency.name} ({currency.code})
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Switch between live Google RSS feed rate and custom treasury override
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
        {/* Feed Info */}
        <div className="rounded-lg border border-border/80 bg-muted/30 p-3 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Google RSS Live Quote:</span>
            <span className="font-mono font-bold text-foreground">
              1 USD = {currency.rssFeedRate.toFixed(currency.decimalDigits > 2 ? currency.decimalDigits : 4)} {currency.code}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Feed Status: Active streaming</span>
            <span>24h Change: {currency.change24h}%</span>
          </div>
        </div>

        {/* Toggle Override */}
        <div className="rounded-lg border bg-muted/20 p-3 space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <SlidersHorizontalIcon className="size-3.5 text-amber-500" />
                <span>Manual Rate Override</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                {isOverride
                  ? "Fixed rate applied, ignoring live RSS market fluctuations"
                  : "Following live Google Finance RSS feed rates"}
              </p>
            </div>
            <Switch checked={isOverride} onCheckedChange={setIsOverride} />
          </div>

          {isOverride && (
            <div className="space-y-2 pt-2 border-t border-border/50">
              <div className="flex items-center gap-2">
                <div className="flex-1 space-y-1">
                  <label className="text-xs font-medium text-foreground">
                    Custom Exchange Rate (1 USD =)
                  </label>
                  <Input
                    type="number"
                    step="0.0001"
                    min="0.00001"
                    required={isOverride}
                    value={manualRate}
                    onChange={(e) => setManualRate(e.target.value)}
                    className="h-8 font-mono text-xs"
                  />
                </div>
                <div className="w-24 space-y-1">
                  <label className="text-xs font-medium text-foreground">
                    Symbol
                  </label>
                  <Input
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                    className="h-8 font-mono text-xs text-center"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span>Feed baseline: {currency.rssFeedRate.toFixed(4)}</span>
                <span className={cn(
                  "font-mono font-medium",
                  Number(spreadPercent) > 0 ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"
                )}>
                  {Number(spreadPercent) >= 0 ? `+${spreadPercent}%` : `${spreadPercent}%`} deviation
                </span>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-muted-foreground">
                  Reason for Override
                </label>
                <Input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Approved quarterly treasury hedge"
                  className="h-7 text-xs"
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={isSubmitting} className="gap-1.5">
            <SaveIcon className="size-3.5" />
            <span>Save Changes</span>
          </Button>
        </DialogFooter>
      </form>
    </>
  )
}
