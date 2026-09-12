"use client"

import { useState } from "react"
import { PlusIcon, CheckIcon, LoaderIcon } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"

import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"

import type { Authority, AuthorityType } from "@/types/authorities"

interface AddAuthorityProps {
  onAdd: (authority: Authority) => void
}

type Step = "idle" | "form" | "loading" | "success"

const authorityTypes: { value: AuthorityType; label: string }[] = [
  { value: "Federal Tax", label: "Federal Tax" },
  { value: "State Tax", label: "State Tax" },
  { value: "Regulatory", label: "Regulatory" },
  { value: "Labor & Social", label: "Labor & Social" },
  { value: "Municipal", label: "Municipal" },
]

const authorityColors: Record<AuthorityType, string> = {
  "Federal Tax": "bg-blue-700",
  "State Tax": "bg-amber-600",
  Regulatory: "bg-indigo-700",
  "Labor & Social": "bg-cyan-700",
  Municipal: "bg-violet-700",
}

export function AddAuthority({ onAdd }: AddAuthorityProps) {
  const [step, setStep] = useState<Step>("idle")
  const [name, setName] = useState("")
  const [shortCode, setShortCode] = useState("")
  const [type, setType] = useState<AuthorityType | "">("")
  const [jurisdiction, setJurisdiction] = useState("")
  const [accountNumber, setAccountNumber] = useState("")

  function handleConnect() {
    if (!name || !shortCode || !type || !jurisdiction || !accountNumber) return

    setStep("loading")
    setTimeout(() => {
      const newAuthority: Authority = {
        id: `auth-${Date.now()}`,
        name,
        shortCode: shortCode.toUpperCase(),
        type: type as AuthorityType,
        category: "Statutory Compliance",
        jurisdiction,
        filingFrequency: "Quarterly",
        accountNumber,
        totalPaid: 0,
        pendingDue: 0,
        currency: "$",
        nextDueDate: "Upcoming",
        complianceStatus: "Compliant",
        lastFilingDate: "Just registered",
        color: authorityColors[type as AuthorityType] ?? "bg-blue-700",
      }
      onAdd(newAuthority)
      setStep("success")

      setTimeout(() => {
        setStep("idle")
        setName("")
        setShortCode("")
        setType("")
        setJurisdiction("")
        setAccountNumber("")
      }, 1500)
    }, 1500)
  }

  return (
    <Card
      className={cn(
        "flex min-h-[140px] items-center justify-center border-2 border-dashed ring-0 transition-colors",
        step === "idle" && "cursor-pointer hover:border-primary/40 hover:bg-muted/30"
      )}
      onClick={() => step === "idle" && setStep("form")}
    >
      <CardContent className="flex w-full flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {step === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-2 text-muted-foreground"
            >
              <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                <PlusIcon className="size-5" />
              </div>
              <span className="text-sm font-medium">Link Authority / Agency</span>
            </motion.div>
          )}

          {step === "form" && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex w-full flex-col gap-3"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Agency name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <Input
                  placeholder="Code (e.g. IRS, FTB)"
                  value={shortCode}
                  onChange={(e) => setShortCode(e.target.value)}
                />
              </div>
              <Select
                value={type}
                onValueChange={(v) => v && setType(v as AuthorityType)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Jurisdiction type" />
                </SelectTrigger>
                <SelectContent>
                  {authorityTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Jurisdiction (e.g. Federal, California)"
                value={jurisdiction}
                onChange={(e) => setJurisdiction(e.target.value)}
              />
              <Input
                placeholder="EIN / Account registration ID"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    setStep("idle")
                    setName("")
                    setShortCode("")
                    setType("")
                    setJurisdiction("")
                    setAccountNumber("")
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="flex-1"
                  disabled={!name || !shortCode || !type || !jurisdiction || !accountNumber}
                  onClick={handleConnect}
                >
                  Register
                </Button>
              </div>
            </motion.div>
          )}

          {step === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-2 text-muted-foreground"
            >
              <LoaderIcon className="size-6 animate-spin" />
              <span className="text-sm">Registering authority...</span>
            </motion.div>
          )}

          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-2 text-emerald-500"
            >
              <div className="flex size-10 items-center justify-center rounded-full bg-emerald-500/10">
                <CheckIcon className="size-5" />
              </div>
              <span className="text-sm font-medium">Authority Linked!</span>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
