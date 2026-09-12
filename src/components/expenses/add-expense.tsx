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

import type { ExpenseItem, ExpenseType, ExpenseCategorySuper } from "@/types/expenses"
import { getBankAccounts } from "@/services/accounts.service"
import type { BankAccount } from "@/types/accounts"

interface AddExpenseProps {
  onAdd: (expense: ExpenseItem) => void
  trigger?: React.ReactNode
  isCard?: boolean
}

// Map super category to options of sub-categories
export const expenseCategoryMap: Record<ExpenseCategorySuper, { value: ExpenseType; label: string }[]> = {
  cost_of_sale: [
    { value: "Software & SaaS", label: "Software & SaaS" },
    { value: "Cloud & Hosting", label: "Cloud & Hosting" },
  ],
  administrative_expense: [
    { value: "Office & Rent", label: "Office & Rent" },
    { value: "Legal & Professional", label: "Legal & Professional" },
    { value: "Payroll", label: "Payroll" },
  ],
  selling_expense: [
    { value: "Marketing", label: "Marketing" },
    { value: "Travel", label: "Travel" },
  ],
  tax: [],
  other_expense: [],
}

const expenseTypeColors: Record<ExpenseType, string> = {
  "Cloud & Hosting": "bg-amber-600",
  "Software & SaaS": "bg-blue-600",
  "Office & Rent": "bg-stone-800",
  Marketing: "bg-emerald-600",
  Travel: "bg-red-700",
  "Legal & Professional": "bg-indigo-700",
  Payroll: "bg-teal-600",
}

export function AddExpense({ onAdd, trigger, isCard = true }: AddExpenseProps) {
  const [open, setOpen] = React.useState(false)
  const [superCategory, setSuperCategory] = React.useState<ExpenseCategorySuper>("cost_of_sale")
  const [title, setTitle] = React.useState("")
  const [vendorId, setVendorId] = React.useState("")
  const [vendor, setVendor] = React.useState("")
  const [type, setType] = React.useState<ExpenseType | "">("")
  const [expenseSubCategory, setExpenseSubCategory] = React.useState("")
  const [amount, setAmount] = React.useState("")
  const [accountId, setAccountId] = React.useState("")
  const [department, setDepartment] = React.useState("Engineering")
  const [paymentMethod, setPaymentMethod] = React.useState("Corporate Card")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [bankAccounts, setBankAccounts] = React.useState<BankAccount[]>([])

  React.useEffect(() => {
    setBankAccounts(getBankAccounts())
  }, [])

  // When superCategory changes, reset the sub-selections
  React.useEffect(() => {
    setType("")
    setExpenseSubCategory("")
  }, [superCategory])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const parsedAmount = parseFloat(amount)
    if (!title || !vendor || !type || isNaN(parsedAmount) || parsedAmount <= 0) return

    setIsSubmitting(true)

    setTimeout(() => {
      const sanitizedVendor = vendor.toLowerCase().replace(/[^a-z0-9]/g, "")
      const newExpense: ExpenseItem = {
        id: `exp-${Date.now()}`,
        title,
        vendor,
        type: type as ExpenseType,
        expenseCategory: "Operations",
        amount: parsedAmount,
        currency: "$",
        change: 0,
        changePercent: 0,
        expenseDate: "Today",
        paymentMethod,
        status: "paid",
        receiptNumber: `RCP-${Math.floor(10000 + Math.random() * 90000)}`,
        department,
        logo: `/logos/${sanitizedVendor}-com.png`,
        color: expenseTypeColors[type as ExpenseType] ?? "bg-zinc-800",
        superCategory,
        vendorId,
        expenseSubCategory,
        accountId,
      }
      onAdd(newExpense)
      setIsSubmitting(false)
      setOpen(false)

      // Reset fields
      setSuperCategory("cost_of_sale")
      setTitle("")
      setVendorId("")
      setVendor("")
      setType("")
      setExpenseSubCategory("")
      setAmount("")
      setAccountId("")
      setDepartment("Engineering")
      setPaymentMethod("Corporate Card")
    }, 400)
  }

  const defaultTrigger = isCard ? (
    <button
      type="button"
      tabIndex={0}
      className={cn(
        "group relative flex min-h-[140px] h-full flex-col items-center justify-center rounded-xl",
        "border-2 border-dashed border-border/80 bg-muted/15 p-4 text-center cursor-pointer",
        "transition-all duration-200 hover:border-primary/50 hover:bg-muted/40 hover:shadow-xs"
      )}
    >
      <div className="flex size-10 items-center justify-center rounded-full bg-muted group-hover:bg-primary/10 transition-colors">
        <PlusIcon className="size-5 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
      <p className="mt-2 text-xs font-semibold text-foreground">Record New Expense</p>
      <p className="mt-0.5 text-[11px] text-muted-foreground">Add new operational or capital expense</p>
    </button>
  ) : (
    <Button size="sm" className="h-8 gap-1.5 text-xs">
      <PlusIcon className="size-3.5" />
      Record Expense
    </Button>
  )

  const availableTypes = expenseCategoryMap[superCategory]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger ? (trigger as React.ReactElement) : defaultTrigger} />

      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Record Expense Entry</DialogTitle>
          <DialogDescription>
            Enter details for the new expense.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 py-1">
          <div className="flex flex-wrap gap-2 p-1 bg-muted rounded-lg w-full">
            <Button
              type="button"
              variant={superCategory === "cost_of_sale" ? "default" : "ghost"}
              className="flex-1 h-7 text-[11px]"
              onClick={() => setSuperCategory("cost_of_sale")}
            >
              Cost of Sale
            </Button>
            <Button
              type="button"
              variant={superCategory === "administrative_expense" ? "default" : "ghost"}
              className="flex-1 h-7 text-[11px]"
              onClick={() => setSuperCategory("administrative_expense")}
            >
              Admin
            </Button>
            <Button
              type="button"
              variant={superCategory === "selling_expense" ? "default" : "ghost"}
              className="flex-1 h-7 text-[11px]"
              onClick={() => setSuperCategory("selling_expense")}
            >
              Selling
            </Button>
            <Button
              type="button"
              variant={superCategory === "tax" ? "default" : "ghost"}
              className="flex-1 h-7 text-[11px]"
              onClick={() => setSuperCategory("tax")}
            >
              Tax
            </Button>
            <Button
              type="button"
              variant={superCategory === "other_expense" ? "default" : "ghost"}
              className="flex-1 h-7 text-[11px]"
              onClick={() => setSuperCategory("other_expense")}
            >
              Other
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium">Vendor Search</label>
              <EntitySearchSelect
                type="vendor"
                value={vendorId}
                onChange={(client) => {
                  setVendorId(client?.id || "")
                  if (client?.name) {
                    setVendor(client.name)
                  }
                }}
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-medium">Vendor Name</label>
              <Input
                placeholder="e.g. Amazon Web Services"
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                className="h-8 text-xs"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium">Expense Title / Description</label>
            <Input
              placeholder="e.g. AWS Clusters"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-8 text-xs"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium">Expense Category</label>
              <Select value={type} onValueChange={(val) => val && setType(val as ExpenseType)}>
                <SelectTrigger className="h-8 text-xs w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {availableTypes.length > 0 ? availableTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value} className="text-xs">
                      {t.label}
                    </SelectItem>
                  )) : (
                    <SelectItem value="Other" className="text-xs">Other (No predefined categories)</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium">Expense Sub-Category (Optional)</label>
              <Input
                placeholder="e.g. Advertising, Utilities"
                value={expenseSubCategory}
                onChange={(e) => setExpenseSubCategory(e.target.value)}
                className="h-8 text-xs"
              />
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

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium">Account (debited)</label>
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
              <label className="text-xs font-medium">Payment Method (Optional)</label>
              <Input
                placeholder="e.g. Corporate Card"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <DialogClose render={<Button type="button" variant="outline" size="sm" />}>
              Cancel
            </DialogClose>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || !title || !vendor || !type || !amount}
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
                  Record Expense
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
