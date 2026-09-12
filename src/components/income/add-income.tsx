"use client"

import * as React from "react"
import { PlusIcon, CheckIcon, Loader2Icon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { EntitySearchSelect } from "@/components/shared/entity-search-select"
import { incomeSuperCategories } from "@/components/income/income-category-cards"

import type { IncomeItem, IncomeType } from "@/types/income"
import { getBankAccounts } from "@/services/accounts.service"
import type { BankAccount } from "@/types/accounts"

interface AddIncomeProps {
  onAdd: (income: IncomeItem) => void
  trigger?: React.ReactNode
  isCard?: boolean
}

export const incomeTypes: { value: IncomeType; label: string }[] = [
  { value: "Business Revenue", label: "Business Revenue" },
  { value: "Income from Investment", label: "Income from Investment" },
  { value: "Income from Property", label: "Income From Property" },
  { value: "Sale of Assets", label: "Sale of Assets" },
  { value: "Sale of Securities", label: "Sale of Securities" },
  { value: "Foreign Source", label: "Foreign Source" },
]

export const incomeTypeColors: Partial<Record<IncomeType, string>> = {
  "Business Revenue": "bg-emerald-600",
  "Income from Investment": "bg-blue-600",
  "Income from Property": "bg-amber-600",
  "Income From Property": "bg-amber-600",
  "Sale of Assets": "bg-purple-600",
  "Sale of Assest": "bg-purple-600",
  "Sale of Securities": "bg-indigo-600",
  "Foreign Source": "bg-rose-600",
  "Foriegn Source": "bg-rose-600",
}

export function AddIncome({ onAdd, trigger, isCard = true }: AddIncomeProps) {
  const [open, setOpen] = React.useState(false)
  const [saleType, setSaleType] = React.useState<"domestic" | "export">("domestic")
  const [title, setTitle] = React.useState("")
  const [clientId, setClientId] = React.useState("")
  const [source, setSource] = React.useState("")
  const [type, setType] = React.useState<IncomeType>("Business Revenue")
  const [incomeSubType, setIncomeSubType] = React.useState("")
  const [amount, setAmount] = React.useState("")
  const [accountId, setAccountId] = React.useState("")
  const [paymentMethod, setPaymentMethod] = React.useState("Wire Transfer")
  const [receiptUrl, setReceiptUrl] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [bankAccounts, setBankAccounts] = React.useState<BankAccount[]>([])

  React.useEffect(() => {
    setBankAccounts(getBankAccounts())
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const parsedAmount = parseFloat(amount)
    if (!title || !source || !type || isNaN(parsedAmount) || parsedAmount <= 0) return

    setIsSubmitting(true)

    setTimeout(() => {
      const sanitizedSource = source.toLowerCase().replace(/[^a-z0-9]/g, "")
      const newIncome: IncomeItem = {
        id: `inc-${Date.now()}`,
        title,
        source,
        type,
        incomeCategory: type,
        amount: parsedAmount,
        currency: "$",
        change: 0,
        changePercent: 0,
        receivedDate: "Today",
        paymentMethod,
        status: "received",
        invoiceNumber: `INV-2026-${Math.floor(100 + Math.random() * 900)}`,
        logo: `/logos/${sanitizedSource}-com.png`,
        color: incomeTypeColors[type] ?? "bg-emerald-600",
        saleType,
        clientId,
        incomeSubType,
        accountId,
        receiptUrl,
      }

      onAdd(newIncome)
      setIsSubmitting(false)
      setOpen(false)

      // Reset fields
      setTitle("")
      setSource("")
      setType("Business Revenue")
      setAmount("")
      setPaymentMethod("Wire Transfer")
      setSaleType("domestic")
      setClientId("")
      setIncomeSubType("")
      setAccountId("")
      setReceiptUrl("")
    }, 400)
  }

  const defaultTrigger = isCard ? (
    <button
      type="button"
      className={cn(
        "group relative flex min-h-[165px] h-full w-full flex-col items-center justify-center rounded-xl",
        "border-2 border-dashed border-border/80 bg-muted/15 p-4 text-center cursor-pointer",
        "transition-all duration-200 hover:border-primary/50 hover:bg-muted/40 hover:shadow-xs"
      )}
    >
      <div className="flex size-10 items-center justify-center rounded-full bg-muted group-hover:bg-primary/10 transition-colors">
        <PlusIcon className="size-5 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
      <p className="mt-2 text-xs font-semibold text-foreground">Record New Income</p>
      <p className="mt-0.5 text-[11px] text-muted-foreground">Add revenue stream or asset sale</p>
    </button>
  ) : (
    <Button size="sm" className="h-8 gap-1.5 text-xs">
      <PlusIcon className="size-3.5" />
      Record Income
    </Button>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger ? (trigger as React.ReactElement) : defaultTrigger} />

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Record Income Entry</DialogTitle>
          <DialogDescription>
            Enter details for the new revenue, asset liquidation, or investment income.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 py-1">
          <div className="flex gap-2 p-1 bg-muted rounded-lg w-full">
            <Button
              type="button"
              variant={saleType === "domestic" ? "default" : "ghost"}
              className="flex-1 h-7 text-xs"
              onClick={() => setSaleType("domestic")}
            >
              Domestic
            </Button>
            <Button
              type="button"
              variant={saleType === "export" ? "default" : "ghost"}
              className="flex-1 h-7 text-xs"
              onClick={() => setSaleType("export")}
            >
              Export
            </Button>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium">Income Title / Description</label>
            <Input
              placeholder="e.g. Enterprise License, Studio Lease, Bond Yield"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-8 text-xs"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium">Payer / Source Entity</label>
            <EntitySearchSelect
              type="client"
              value={clientId}
              onChange={(client) => {
                setClientId(client?.id || "")
                setSource(client?.name || "")
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium">Income Type</label>
              <Select value={type} onValueChange={(val) => {
                if (val) {
                  setType(val as IncomeType)
                  setIncomeSubType("")
                }
              }}>
                <SelectTrigger className="h-8 text-xs w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {incomeTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value} className="text-xs">
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium">Income Category</label>
              <Select value={incomeSubType} onValueChange={(val) => val && setIncomeSubType(val)}>
                <SelectTrigger className="h-8 text-xs w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {incomeSuperCategories
                    .find((cat) => cat.name === type)
                    ?.subTypes.map((sub) => (
                      <SelectItem key={sub.id} value={sub.name} className="text-xs">
                        {sub.name}
                      </SelectItem>
                    ))}
                  <SelectItem value="Other" className="text-xs">
                    Other
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium">Amount ($)</label>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-8 text-xs"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium">Account (debited/credited)</label>
            <Select value={accountId} onValueChange={(val) => val && setAccountId(val)}>
              <SelectTrigger className="h-8 text-xs w-full">
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {bankAccounts.map((acc) => (
                  <SelectItem key={acc.id} value={acc.id} className="text-xs">
                    {acc.name} ({acc.currency}{acc.balance.toLocaleString()})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium">Payment Method</label>
            <Select value={paymentMethod} onValueChange={(val) => val && setPaymentMethod(val)}>
              <SelectTrigger className="h-8 text-xs w-full">
                <SelectValue placeholder="Payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Wire Transfer" className="text-xs">Wire Transfer</SelectItem>
                <SelectItem value="ACH Direct Deposit" className="text-xs">ACH Direct Deposit</SelectItem>
                <SelectItem value="Credit Card" className="text-xs">Credit Card</SelectItem>
                <SelectItem value="Stripe Direct" className="text-xs">Stripe Direct</SelectItem>
                <SelectItem value="Corporate Cheque" className="text-xs">Corporate Cheque</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium">Receipt (Optional)</label>
            <Input
              type="file"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setReceiptUrl(URL.createObjectURL(e.target.files[0]))
                }
              }}
              className="h-8 text-xs file:h-full file:bg-transparent file:text-xs file:font-medium"
            />
          </div>

          <DialogFooter className="pt-2">
            <DialogClose render={<Button type="button" variant="outline" size="sm" />}>
              Cancel
            </DialogClose>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || !title || !source || !amount}
              className="gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2Icon className="size-3.5 animate-spin" />
                  Recording...
                </>
              ) : (
                <>
                  <CheckIcon className="size-3.5" />
                  Record Income
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
